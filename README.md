
# OnLuyen AI Tutor - Hướng dẫn Cài đặt & Triển khai

Chào mừng bạn đến với OnLuyen AI Tutor!

---

## 🔥 BẮT BUỘC: CHẠY LỆNH SQL NÀY ĐỂ SỬA LỖI GOOGLE LOGIN

Để khắc phục triệt để lỗi khi đăng nhập Google bị nhận nhầm là Học sinh, bạn hãy chạy đoạn SQL sau để tạo hàm xử lý đặc biệt:

```sql
-- 1. Hàm cho phép người dùng tự báo danh là Giáo viên sau khi đăng nhập Google
-- Hàm này chạy với quyền tối cao (SECURITY DEFINER) để ghi đè dữ liệu cũ
CREATE OR REPLACE FUNCTION public.claim_teacher_role()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Cập nhật Metadata trong bảng auth.users
  UPDATE auth.users 
  SET raw_user_meta_data = 
      jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', '"teacher"')
  WHERE id = auth.uid();

  -- 2. Cập nhật bảng profiles (Quan trọng: Set thành PENDING)
  UPDATE public.profiles 
  SET 
    role = 'teacher',
    status = 'pending'
  WHERE id = auth.uid();
END;
$$;

-- 2. Đảm bảo Trigger tạo user mới luôn chạy ổn định
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role text := COALESCE(new.raw_user_meta_data->>'role', 'student');
  user_status text;
BEGIN
  -- Logic mặc định ban đầu
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
    -- Không update role/status ở đây để tránh ghi đè logic xử lý sau
    
  return new;
END;
$$;
```

---

## 🔥 GIẢI PHÁP CUỐI CÙNG: Sửa lỗi Admin không tải được danh sách

(Giữ nguyên phần Admin cũ...)
```sql
-- ... (Các lệnh SQL Admin cũ)
```
