
# 🔥 CẤU HÌNH DATABASE (BẮT BUỘC CHẠY 1 LẦN)

Để tính năng **Đăng ký** lưu đầy đủ thông tin (Họ tên, Ngày sinh, Giới tính, Vai trò), bạn hãy copy toàn bộ đoạn code dưới đây và chạy trong **Supabase Dashboard > SQL Editor**.

```sql
-- 1. XÓA CÁC BẢNG CŨ (Làm sạch dữ liệu để tránh lỗi cấu trúc)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TẠO BẢNG PROFILES (Lưu thông tin người dùng chi tiết)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  phone TEXT,
  full_name TEXT,
  date_of_birth DATE,      -- Thêm ngày sinh
  gender TEXT,             -- Thêm giới tính (Nam/Nữ/Khác)
  avatar_url TEXT,
  role TEXT DEFAULT 'student',
  status TEXT DEFAULT 'active', -- active, pending, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẬT BẢO MẬT (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Hàm hỗ trợ Admin (tránh lỗi vòng lặp)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'); $$;

-- Chính sách bảo mật
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 4. [QUAN TRỌNG NHẤT] TRIGGER XỬ LÝ ĐĂNG KÝ
-- Hàm này sẽ chạy TỰ ĐỘNG ngay khi có người đăng ký mới
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  meta_role text;
  meta_name text;
  meta_dob date;
  meta_gender text;
  init_status text;
BEGIN
  -- 1. Lấy dữ liệu từ metadata do Frontend gửi lên
  meta_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  meta_name := COALESCE(new.raw_user_meta_data->>'full_name', '');
  meta_gender := COALESCE(new.raw_user_meta_data->>'gender', 'Khác');
  
  -- Xử lý ngày sinh (tránh lỗi nếu null)
  BEGIN
    meta_dob := (new.raw_user_meta_data->>'date_of_birth')::DATE;
  EXCEPTION WHEN OTHERS THEN
    meta_dob := NULL;
  END;
  
  -- 2. Logic xét duyệt:
  -- Nếu là 'teacher' -> Trạng thái là 'pending' (Chờ duyệt)
  -- Nếu là 'student' -> Trạng thái là 'active' (Vào học luôn)
  IF meta_role = 'teacher' THEN
    init_status := 'pending';
  ELSE
    init_status := 'active';
  END IF;

  -- 3. Tạo profile mới
  INSERT INTO public.profiles (id, email, phone, full_name, date_of_birth, gender, role, status)
  VALUES (
    new.id, 
    new.email, 
    new.phone,
    meta_name,
    meta_dob,
    meta_gender,
    meta_role,
    init_status
  );
  RETURN new;
END;
$$;

-- Gắn hàm trên vào sự kiện "Người dùng mới được tạo"
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. HÀM CHO ADMIN QUẢN LÝ
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT * FROM profiles ORDER BY created_at DESC; $$;

CREATE OR REPLACE FUNCTION update_user_role(target_user_id UUID, new_role TEXT)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET role = new_role WHERE id = target_user_id;
  UPDATE auth.users SET raw_user_meta_data = 
      jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{role}', to_jsonb(new_role))
  WHERE id = target_user_id;
END;
$$;
```
