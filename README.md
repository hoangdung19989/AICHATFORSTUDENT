
# OnLuyen AI Tutor - Hướng dẫn Cài đặt & Triển khai

Chào mừng bạn đến với OnLuyen AI Tutor!

---

## 🔥 BẮT BUỘC: CHẠY LỆNH SQL NÀY ĐỂ SỬA LỖI ROLE

Để đảm bảo khi người dùng chọn "Giáo viên", hệ thống sẽ cập nhật đúng role (kể cả khi họ đã từng đăng nhập là Học sinh), bạn hãy copy và chạy toàn bộ đoạn SQL dưới đây trong **Supabase SQL Editor**:

```sql
-- 1. Xóa các Trigger cũ (nếu có)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
DROP FUNCTION IF EXISTS public.handle_user_update;

-- 2. Tạo hàm xử lý người dùng MỚI (INSERT)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text := COALESCE(new.raw_user_meta_data->>'role', 'student');
BEGIN
  INSERT INTO public.profiles (id, email, role, status, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    user_role,
    CASE WHEN user_role = 'teacher' THEN 'pending' ELSE 'active' END,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
END;
$$;

-- 3. Gắn Trigger INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. [QUAN TRỌNG] Tạo hàm xử lý CẬP NHẬT người dùng (UPDATE)
-- Hàm này giúp đồng bộ khi bạn chọn lại Role ở màn hình đăng nhập
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Nếu role trong metadata thay đổi, cập nhật profile tương ứng
  IF new.raw_user_meta_data->>'role' IS DISTINCT FROM old.raw_user_meta_data->>'role' THEN
    UPDATE public.profiles
    SET 
      role = new.raw_user_meta_data->>'role',
      -- Nếu chuyển sang teacher thì set pending, ngược lại active
      status = CASE WHEN new.raw_user_meta_data->>'role' = 'teacher' THEN 'pending' ELSE 'active' END
    WHERE id = new.id;
  END IF;
  
  -- Đồng bộ tên/avatar nếu thay đổi (tuỳ chọn)
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
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
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
    
    UPDATE public.profiles
    SET role = 'admin', status = 'active'
    WHERE email = target_email;
    
    UPDATE auth.users SET email_confirmed_at = now() WHERE email = target_email;
END $$;
```
