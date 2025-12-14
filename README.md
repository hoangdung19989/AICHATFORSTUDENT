
# OnLuyen AI Tutor - Hướng dẫn Cài đặt & Triển khai

Chào mừng bạn đến với OnLuyen AI Tutor!

---

## 🔥 KHẮC PHỤC LỖI "CHỌN GIÁO VIÊN NHƯNG RA HỌC SINH"

Đây là lỗi phổ biến do Trigger Database cũ không đọc đúng dữ liệu từ Google/Email. Hãy làm theo các bước sau trong **Supabase SQL Editor**:

```sql
-- 1. Xóa Trigger cũ
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

-- 2. Tạo hàm xử lý mới (Chuẩn chỉnh)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  -- Lấy role từ metadata, nếu không có thì mặc định là 'student'
  user_role text := COALESCE(new.raw_user_meta_data->>'role', 'student');
BEGIN
  INSERT INTO public.profiles (id, email, role, status, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    user_role,
    CASE 
        WHEN user_role = 'teacher' THEN 'pending'
        ELSE 'active'
    END,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
END;
$$;

-- 3. Gắn lại Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. QUAN TRỌNG: Để test lại, bạn phải xóa tài khoản cũ đã bị lỗi
-- Thay 'email_cua_ban@gmail.com' bằng email của bạn
-- DELETE FROM auth.users WHERE email = 'email_cua_ban@gmail.com';
```

---

## 🔥 GIẢI PHÁP CUỐI CÙNG: Sửa lỗi Admin không tải được danh sách (Loading mãi mãi)

Nếu Dashboard Admin bị quay vòng hoặc hiện số 0, hãy chạy đoạn SQL dưới đây trong **Supabase SQL Editor**. 

Nó tạo ra một hàm `get_all_profiles` chạy với quyền tối cao, **bỏ qua mọi kiểm tra bảo mật (RLS)**, đảm bảo 100% lấy được dữ liệu.

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

-- 3. (Tùy chọn) Đảm bảo chính bạn là Admin
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
    
    -- Tự động xác thực email cho admin luôn
    UPDATE auth.users SET email_confirmed_at = now() WHERE email = target_email;
END $$;
```
