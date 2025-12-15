
# 🔥 KHẮC PHỤC LỖI "ĐÃ ACTIVE NHƯNG VẪN BÁO PENDING"

Lỗi này xảy ra do Code không có quyền đọc bảng `profiles` nên nó tự động giả định trạng thái là `pending`.
Bạn hãy vào **Supabase > SQL Editor**, chạy lệnh sau để cấp quyền ĐỌC dữ liệu cho người dùng:

```sql
-- Bật RLS cho bảng profiles (nếu chưa bật)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Cấp quyền cho user tự xem profile của chính mình
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING ( auth.uid() = id );

-- Cấp quyền cho user tự sửa profile của chính mình (tên, avatar)
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING ( auth.uid() = id );
```

# 🔥 KHẮC PHỤC LỖI "CHỌN GIÁO VIÊN NHƯNG RA HỌC SINH" (Cũ)
... (Giữ nguyên phần cũ)
