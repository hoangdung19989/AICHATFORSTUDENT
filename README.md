
# 🔥 CẤU HÌNH DATABASE (BẮT BUỘC CHẠY 1 LẦN)

Để tính năng **Đăng nhập Google** phân biệt được Giáo viên (Pending) và Học sinh (Active), bạn hãy copy toàn bộ đoạn code dưới đây và chạy trong **Supabase Dashboard > SQL Editor**.

```sql
-- 1. XÓA CÁC BẢNG CŨ (Làm sạch dữ liệu để tránh lỗi)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. TẠO BẢNG PROFILES (Lưu thông tin người dùng)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
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

-- 4. [QUAN TRỌNG NHẤT] TRIGGER XỬ LÝ ĐĂNG KÝ GOOGLE/EMAIL
-- Hàm này sẽ chạy TỰ ĐỘNG ngay khi có người đăng nhập lần đầu
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  meta_role text;
  init_status text;
BEGIN
  -- 1. Lấy vai trò từ dữ liệu Google gửi sang (được set ở code frontend)
  -- Nếu không có thì mặc định là 'student'
  meta_role := COALESCE(new.raw_user_meta_data->>'role', 'student');
  
  -- 2. Logic xét duyệt:
  -- Nếu là 'teacher' -> Trạng thái là 'pending' (Chờ duyệt)
  -- Nếu là 'student' -> Trạng thái là 'active' (Vào học luôn)
  IF meta_role = 'teacher' THEN
    init_status := 'pending';
  ELSE
    init_status := 'active';
  END IF;

  -- 3. Tạo profile mới với thông tin đã xử lý
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, status)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
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

-- 5. HÀM CHO ADMIN QUẢN LÝ (Lấy danh sách & Cập nhật quyền)
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

---

### ⚠️ LƯU Ý KHI TEST: "TẠI SAO VẪN VÀO QUYỀN HỌC SINH?"

Nếu bạn dùng một Gmail (ví dụ: `test@gmail.com`) để đăng nhập:
1.  Lần đầu bạn chọn "Học sinh" -> Hệ thống lưu vĩnh viễn `test@gmail.com` là **Học sinh**.
2.  Lần sau bạn quay ra chọn "Giáo viên" và đăng nhập lại bằng `test@gmail.com`.
    *   Hệ thống nhận ra email này **đã tồn tại**.
    *   Nó thực hiện **Đăng nhập (Login)** vào tài khoản cũ (Học sinh) chứ không **Đăng ký mới**.
    *   Do đó, nó bỏ qua yêu cầu làm Giáo viên của bạn.

**CÁCH KHẮC PHỤC ĐỂ TEST:**
1.  Vào **Supabase Dashboard** > **Authentication** > **Users**.
2.  Tìm email bạn đang test và nhấn **Delete User**.
3.  Quay lại trang web, chọn **Giáo viên** -> **Đăng nhập Google**.
4.  Lúc này hệ thống coi đây là người mới -> Trigger hoạt động -> Bạn sẽ thấy màn hình "Chờ xét duyệt".
