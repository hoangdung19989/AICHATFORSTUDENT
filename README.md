
# 🔥 KHẮC PHỤC LỖI "CHỌN GIÁO VIÊN NHƯNG RA HỌC SINH"

Lỗi này xảy ra do Database tạo user nhanh hơn lúc code gửi thông tin Role.
Bạn hãy vào **Supabase > SQL Editor**, dán và chạy (Run) đoạn mã sau để sửa lỗi triệt để:

```sql
-- 1. Tạo hàm "claim_teacher_role" để ép cập nhật Role
CREATE OR REPLACE FUNCTION public.claim_teacher_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Chạy với quyền Admin tối cao, bỏ qua RLS
SET search_path = public
AS $$
BEGIN
  -- Cập nhật Metadata cho User (để lần sau đăng nhập vẫn đúng)
  UPDATE auth.users 
  SET raw_user_meta_data = 
      jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"teacher"')
  WHERE id = auth.uid();

  -- Cập nhật bảng Profiles: Role thành Teacher, Status thành Pending
  UPDATE public.profiles 
  SET 
    role = 'teacher',
    status = 'pending'
  WHERE id = auth.uid();
END;
$$;

-- 2. (Tùy chọn) Trigger tạo user mặc định (để đảm bảo không lỗi)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text := COALESCE(new.raw_user_meta_data->>'role', 'student');
  user_status text;
BEGIN
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
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url;
    
  return new;
END;
$$;
```
