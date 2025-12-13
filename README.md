
# OnLuyen AI Tutor - Hướng dẫn Cài đặt & Triển khai

Chào mừng bạn đến với OnLuyen AI Tutor! Dự án này đã được cấu trúc lại để sử dụng **Vite**, một công cụ xây dựng hiện đại, giúp tối ưu hóa hiệu năng và bảo mật.

Dưới đây là hướng dẫn đầy đủ để bạn có thể chạy dự án trên máy tính cá nhân (local) và triển khai lên nền tảng **Vercel** một cách chuyên nghiệp.

---

## 🛠 SỬA LỖI: Dashboard Admin hiện số 0 (Không thấy người dùng)

Nếu bạn vào trang Quản trị mà thấy **Tổng người dùng = 0** và danh sách trống trơn, đó là do Database đang chặn quyền xem. Hãy chạy đoạn SQL này để cấp quyền cho Admin:

```sql
-- 1. Bật tính năng bảo mật RLS (Nếu chưa bật)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Xóa các chính sách cũ (để tránh xung đột)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to view own profile or admins to view all" ON public.profiles;
DROP POLICY IF EXISTS "Enable users to update own profile or admins to update all" ON public.profiles;

-- 3. Tạo chính sách MỚI: Ai được XEM dữ liệu?
-- Quy tắc: Học sinh chỉ xem được mình. Admin xem được TẤT CẢ.
CREATE POLICY "View Profiles Policy"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id -- Xem chính mình
  OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' -- Admin xem tất cả
);

-- 4. Tạo chính sách MỚI: Ai được SỬA dữ liệu?
-- Quy tắc: Học sinh sửa được mình. Admin sửa được TẤT CẢ.
CREATE POLICY "Update Profiles Policy"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id 
  OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- 5. ĐỒNG BỘ DỮ LIỆU CŨ (Rất quan trọng)
-- Nếu bạn tạo User trước khi có Trigger, họ sẽ không hiện trong bảng profiles.
-- Lệnh này sẽ copy họ từ Auth sang Profiles.
INSERT INTO public.profiles (id, email, role, status, full_name, avatar_url)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'role', 'student'),
    'active',
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

---

## 🛠 SỬA LỖI: Không xóa được User (Database Error)

Nếu bạn gặp lỗi **"Database error deleting user"** khi xóa tài khoản trong Supabase Dashboard, hãy chạy đoạn SQL này trong **SQL Editor**. Nó sẽ cho phép khi xóa tài khoản thì tự động xóa luôn hồ sơ, điểm thi và lịch sử làm bài của người đó.

```sql
-- 1. Sửa bảng profiles (Xóa user -> Tự động xóa profile)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users (id)
ON DELETE CASCADE;

-- 2. Sửa bảng kết quả thi (exam_results)
ALTER TABLE public.exam_results
DROP CONSTRAINT IF EXISTS exam_results_user_id_fkey;

ALTER TABLE public.exam_results
ADD CONSTRAINT exam_results_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE;

-- 3. Sửa bảng lịch sử làm bài (question_attempts)
ALTER TABLE public.question_attempts
DROP CONSTRAINT IF EXISTS question_attempts_user_id_fkey;

ALTER TABLE public.question_attempts
ADD CONSTRAINT question_attempts_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users (id)
ON DELETE CASCADE;
```

---

## QUAN TRỌNG: Cách tạo tài khoản Admin chuẩn (Tránh lỗi mất quyền)

Để đảm bảo tài khoản Admin hoạt động ổn định và không bị tự động chuyển về quyền học sinh, bạn hãy làm theo các bước sau trực tiếp trên Supabase Dashboard:

### Bước 1: Tạo User mới trong Supabase
1. Vào **Supabase Dashboard** -> **Authentication** -> **Users**.
2. Bấm **Add User**.
3. Điền Email (ví dụ: `admin@onluyen.vn`) và Mật khẩu.
4. Tích chọn **Auto Confirm User** (để bỏ qua bước xác thực email).
5. Bấm **Create User**.

### Bước 2: Chạy SQL để cấp quyền Admin (Hard Force)
Vào **SQL Editor** -> **New Query** và chạy đoạn lệnh sau (Thay đổi email thành email bạn vừa tạo):

```sql
DO $$
DECLARE
    target_email TEXT := 'admin@onluyen.vn'; -- THAY EMAIL CỦA BẠN Ở ĐÂY
BEGIN
    -- 1. Cập nhật bảng dữ liệu profiles
    -- (Nếu user chưa có trong bảng profiles, trigger sẽ tự tạo, lệnh update này đảm bảo quyền đúng)
    UPDATE public.profiles
    SET role = 'admin', status = 'active'
    WHERE email = target_email;

    -- 2. Cập nhật Metadata ẩn của Auth (Bước quan trọng nhất để sửa lỗi nhảy quyền)
    UPDATE auth.users
    SET raw_user_meta_data = 
        COALESCE(raw_user_meta_data, '{}'::jsonb) || 
        jsonb_build_object('role', 'admin')
    WHERE email = target_email;
END $$;
```

---

## 2. Cấu hình RLS & Trigger (Bắt buộc cho lần đầu)

Chạy đoạn SQL sau để đảm bảo hệ thống bảo mật và tự động tạo profile khi user đăng ký:

```sql
-- 1. Hàm tạo Profile tự động
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
    -- Ưu tiên role trong metadata nếu có, nếu không thì mặc định là student
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
```

---

## 3. Chạy dự án trên máy tính (Local Development)

### Bước 1: Tải mã nguồn & Cài đặt

```bash
git clone <URL_KHO_LUU_TRU_CUA_BAN>
cd <TEN_THU_MUC_DU_AN>
npm install
```

### Bước 2: Cấu hình biến môi trường (.env)

Tạo file `.env` và điền thông tin:

```env
VITE_API_KEY=AIzaSy...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5c...
```

### Bước 3: Khởi động

```bash
npm run dev
```
Truy cập `http://localhost:5173`.
