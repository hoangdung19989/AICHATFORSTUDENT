
# OnLuyen AI Tutor - Hướng dẫn Cài đặt & Triển khai

Chào mừng bạn đến với OnLuyen AI Tutor! Dự án này đã được cấu trúc lại để sử dụng **Vite**, một công cụ xây dựng hiện đại, giúp tối ưu hóa hiệu năng và bảo mật.

Dưới đây là hướng dẫn đầy đủ để bạn có thể chạy dự án trên máy tính cá nhân (local) và triển khai lên nền tảng **Vercel** một cách chuyên nghiệp.

---

## QUAN TRỌNG: Cấu hình Quyền Admin & RLS

Để trang **Admin Dashboard** hoạt động, bạn phải chạy câu lệnh SQL sau trong **Supabase SQL Editor**:

```sql
-- 1. Cấp quyền cho Admin xem và sửa tất cả profiles
-- Xóa policy cũ (chỉ cho phép xem chính mình)
DROP POLICY IF EXISTS "Enable users to view their own data only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Tạo policy mới cho phép SELECT (Xem)
CREATE POLICY "Enable users to view own profile or admins to view all"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id -- Xem chính mình
  OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' -- Admin xem tất cả
);

-- Tạo policy mới cho phép UPDATE (Sửa status/role)
CREATE POLICY "Enable users to update own profile or admins to update all"
ON public.profiles FOR UPDATE
USING (
  auth.uid() = id -- Sửa chính mình
  OR 
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' -- Admin sửa tất cả
);

-- 2. Thăng cấp tài khoản của BẠN lên Admin
-- Thay 'email_cua_ban@gmail.com' bằng email bạn đã đăng ký
UPDATE public.profiles
SET role = 'admin', status = 'active'
WHERE email = 'email_cua_ban@gmail.com';
```

---

## 1. Yêu cầu hệ thống

- **Node.js**: Phiên bản 18.x trở lên.
- **npm** (hoặc yarn, pnpm): Trình quản lý gói của Node.js.
- **Tài khoản GitHub**: Để lưu trữ mã nguồn và kết nối với Vercel.
- **Tài khoản Vercel**: Để triển khai ứng dụng.

---

## 2. Lấy API Key & Cấu hình Dịch vụ

### A. Lấy Google Gemini API Key
1.  Truy cập [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Đăng nhập và nhấp vào **"Create API key"**.
3.  Lưu lại key này.

### B. Cấu hình Supabase (Cơ sở dữ liệu & Đăng nhập)
1.  Truy cập [supabase.com](https://supabase.com) và tạo một Project mới.
2.  **Lấy Key kết nối:**
    *   Vào **Settings** (Bánh răng) -> **API**.
    *   Copy **Project URL**.
    *   Copy **anon public** Key.
3.  **Bật Đăng ký qua Email:**
    *   Vào **Authentication** -> **Providers** -> **Email**.
    *   Bật (Enable) nhà cung cấp này.
    *   **Bỏ chọn** mục **"Confirm email"** (Khuyên dùng để test nhanh, không cần xác thực).
4.  **Cấu hình URL Khôi phục Mật khẩu (QUAN TRỌNG):**
    *   Vẫn trong mục **Authentication**, vào **URL Configuration**.
    *   Trong ô **Site URL**, hãy điền địa chỉ trang web của bạn (VD: `http://localhost:5173` khi chạy local, hoặc `https://your-app-name.vercel.app` khi đã deploy).
    *   Bấm **Save**.
5.  **Cập nhật Cấu trúc Bảng (Columns):**
    *   Vào **Table Editor**:
    *   **Bảng `exam_results`**: Thêm cột `exam_type` (Kiểu: `text`).
    *   **Bảng `question_attempts`**: Thêm cột `grade` (Kiểu: `text`) và `exam_type` (Kiểu: `text`).
    *   **Bảng `profiles`**: 
        *   Thêm cột `role` (Kiểu: `text`, mặc định là `student`).
        *   Thêm cột `status` (Kiểu: `text`, mặc định là `active`).
6.  **Cấu hình Trigger (Tự động tạo profile):**
    Chạy lệnh này trong SQL Editor để đảm bảo user mới đăng ký sẽ được thêm vào bảng profiles:

```sql
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
