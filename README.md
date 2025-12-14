
# OnLuyen AI Tutor - Hướng dẫn Cài đặt & Triển khai

Chào mừng bạn đến với OnLuyen AI Tutor!

---

## 🔥 KHẮC PHỤC LỖI "LOCALHOST REFUSED TO CONNECT" KHI XÁC THỰC EMAIL

Khi bạn nhấn link trong email, trình duyệt có thể báo lỗi kết nối hoặc "OTP Expired". Điều này là do sự lệch cổng giữa Supabase (3000) và Vite (5173).

**Cách giải quyết nhanh nhất:** Chạy lệnh SQL dưới đây trong Supabase SQL Editor để xác thực email thủ công mà không cần nhấn link.

```sql
-- Thay 'email_cua_ban@example.com' bằng email bạn vừa đăng ký
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'email_cua_ban@example.com';
```

Sau khi chạy xong, bạn có thể quay lại trang web và đăng nhập bình thường.

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

---

## Các cài đặt khác (Trigger tạo user mới)

```sql
-- Hàm tạo Profile tự động khi đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, status, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data ->> 'role', 'student'),
    CASE 
        WHEN (new.raw_user_meta_data ->> 'role') = 'teacher' THEN 'pending'
        ELSE 'active'
    END,
    new.raw_user_meta_data ->> 'full_name', 
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```
