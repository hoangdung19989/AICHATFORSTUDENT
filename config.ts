
// ===================================================================================
// ==  QUAN TRỌNG: ĐIỀN API KEY CỦA BẠN VÀO ĐÂY ĐỂ CHẠY THỬ NGHIỆM  ==
// ===================================================================================
// Môi trường Studio này ẩn file .env, vì vậy hãy điền trực tiếp vào đây.
// Khi deploy lên Vercel, hệ thống sẽ tự động dùng biến môi trường đã cấu hình.

export const API_KEYS = {
    // 1. Google Gemini API Key
    GEMINI_API_KEY: "YOUR_GEMINI_API_KEY_HERE",

    // 2. Supabase URL (Lấy tại: Dashboard > Settings > Data API)
    // Ví dụ: https://abcedfgh.supabase.co
    SUPABASE_URL: "YOUR_SUPABASE_URL_HERE",

    // 3. Supabase Anon Key (Lấy tại: Dashboard > Settings > Data API > Project API keys)
    // Bắt đầu bằng: eyJ...
    SUPABASE_ANON_KEY: "YOUR_SUPABASE_ANON_KEY_HERE",
};
// ===================================================================================
