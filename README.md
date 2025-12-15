
# 🔥 HƯỚNG DẪN CÀI ĐẶT LẠI DATABASE (CHẠY 1 LẦN DUY NHẤT)

Vào **Supabase Dashboard > SQL Editor**, copy đoạn mã dưới đây và chạy để thiết lập lại toàn bộ cấu trúc:

```sql
-- 1. XÓA SẠCH BẢNG CŨ (Reset)
DROP TABLE IF EXISTS public.exam_results CASCADE;
DROP TABLE IF EXISTS public.question_attempts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TẠO BẢNG PROFILES MỚI
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BẬT BẢO MẬT RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. TẠO TRIGGER TỰ ĐỘNG XỬ LÝ ROLE & STATUS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  meta_role text := COALESCE(new.raw_user_meta_data->>'role', 'student');
  init_status text;
BEGIN
  -- Nếu là giáo viên, set pending. Còn lại là active.
  IF meta_role = 'teacher' THEN
    init_status := 'pending';
  ELSE
    init_status := 'active';
  END IF;

  INSERT INTO public.profiles (id, email, role, status, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    meta_role,
    init_status,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. CHÍNH SÁCH BẢO MẬT (RLS)
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles FOR SELECT TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update profiles" 
ON public.profiles FOR UPDATE TO authenticated USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 6. HÀM CHO ADMIN LẤY DANH SÁCH USER
CREATE OR REPLACE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ SELECT * FROM profiles ORDER BY created_at DESC; $$;

-- 7. HÀM CHO ADMIN CẬP NHẬT ROLE
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

# 🔥 CÁCH TẠO ADMIN ĐẦU TIÊN
1. Đăng ký một tài khoản bình thường.
2. Vào **Supabase > Table Editor > profiles**.
3. Tìm dòng của email bạn vừa đăng ký.
4. Sửa cột `role` thành `admin`.
