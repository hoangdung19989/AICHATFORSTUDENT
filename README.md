
# OnLuyen AI Tutor - Hướng dẫn Cài đặt & Triển khai

Chào mừng bạn đến với OnLuyen AI Tutor!

---

## 🔥 BẮT BUỘC: CHẠY LỆNH SQL NÀY ĐỂ SỬA LỖI ROLE

Đây là bản cập nhật quan trọng nhất để đảm bảo **BẤT KỲ AI LÀ GIÁO VIÊN ĐỀU PHẢI CHỜ DUYỆT**.
Hãy copy và chạy toàn bộ đoạn SQL dưới đây trong **Supabase SQL Editor**:

```sql
-- 1. Xóa các Trigger/Function cũ để tránh xung đột
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_update;

-- 2. Hàm xử lý người dùng MỚI (INSERT)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text := COALESCE(new.raw_user_meta_data->>'role', 'student');
  user_status text;
BEGIN
  -- Logic nghiêm ngặt: Nếu là Teacher thì PHẢI là pending
  IF user_role = 'teacher' THEN
    user_status := 'pending';
  ELSE
    user_status := 'active';
  END IF;

  INSERT INTO public.profiles (id, email, role, status, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    user_role,
    user_status,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = EXCLUDED.role,
    status = EXCLUDED.status; -- Đảm bảo status được cập nhật
    
  return new;
END;
$$;

-- 3. Gắn Trigger INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Hàm xử lý CẬP NHẬT người dùng (UPDATE)
-- Hàm này xử lý khi người dùng đổi role từ Student -> Teacher
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  new_role text := new.raw_user_meta_data->>'role';
  old_role text := old.raw_user_meta_data->>'role';
BEGIN
  -- Chỉ chạy khi role thay đổi
  IF new_role IS DISTINCT FROM old_role THEN
    UPDATE public.profiles
    SET 
      role = new_role,
      -- QUAN TRỌNG: Nếu đổi thành Teacher, status TỰ ĐỘNG về pending ngay lập tức
      status = CASE WHEN new_role = 'teacher' THEN 'pending' ELSE 'active' END
    WHERE id = new.id;
  END IF;
  
  -- Đồng bộ tên/avatar nếu thay đổi
  IF new.raw_user_meta_data->>'full_name' IS DISTINCT FROM old.raw_user_meta_data->>'full_name' THEN
     UPDATE public.profiles SET full_name = new.raw_user_meta_data->>'full_name' WHERE id = new.id;
  END IF;

  RETURN new;
END;
$$;

-- 5. Gắn Trigger UPDATE
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();
```

---

## 🔥 GIẢI PHÁP CUỐI CÙNG: Sửa lỗi Admin không tải được danh sách

Nếu Dashboard Admin bị quay vòng hoặc hiện số 0, hãy chạy đoạn SQL dưới đây:

```sql
-- 1. Tạo hàm lấy danh sách User với quyền Tối cao (SECURITY DEFINER)
DROP FUNCTION IF EXISTS get_all_profiles;

CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER -- Chạy với quyền của người tạo (Superuser), bỏ qua RLS
SET search_path = public
AS $$
  SELECT * FROM profiles ORDER BY created_at DESC;
$$;

-- 2. Hàm hỗ trợ Admin đổi quyền User (RPC)
CREATE OR REPLACE FUNCTION update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET 
    role = new_role,
    -- Nếu admin set thành teacher, cũng set pending để admin tự duyệt sau (hoặc active tuỳ ý, ở đây để pending cho an toàn)
    status = CASE WHEN new_role = 'teacher' THEN 'pending' ELSE 'active' END
  WHERE id = target_user_id;
  
  UPDATE auth.users SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', new_role) WHERE id = target_user_id;
END;
$$;

-- 3. Set quyền Admin cho email của bạn
-- Thay email bên dưới thành email của bạn
DO $$
DECLARE
    target_email TEXT := 'admin@onluyen.vn'; 
BEGIN
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', 'admin')
    WHERE email = target_email;
    
    INSERT INTO public.profiles (id, email, role, status, full_name)
    SELECT id, email, 'admin', 'active', 'Admin System'
    FROM auth.users WHERE email = target_email
    ON CONFLICT (id) DO UPDATE SET role = 'admin', status = 'active';
    
    UPDATE auth.users SET email_confirmed_at = now() WHERE email = target_email;
END $$;
```
