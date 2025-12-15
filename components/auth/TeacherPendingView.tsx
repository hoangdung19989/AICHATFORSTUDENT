
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient'; 
import { API_KEYS } from '../../config'; 
import { ClockIcon, ArrowPathIcon, ExclamationTriangleIcon, UserCircleIcon, QuestionMarkCircleIcon, DocumentTextIcon } from '../icons'; 

const FIX_RLS_SQL = `
-- CHẠY ĐOẠN NÀY ĐỂ SỬA LỖI VÒNG LẶP (42P17)
-- 1. Xóa chính sách bị lỗi cũ
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;

-- 2. Tạo hàm kiểm tra Admin an toàn (Bypass RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$ 
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'); 
$$;

-- 3. Tạo lại chính sách sử dụng hàm an toàn
CREATE POLICY "Admins can view all profiles" ON public.profiles 
FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Admins can update profiles" ON public.profiles 
FOR UPDATE TO authenticated USING (is_admin());
`;

const TeacherPendingView: React.FC = () => {
  const { signOut, user, refreshProfile, profile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<any>(null);

  // Lấy thông tin cấu hình hiện tại
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const configUrl = API_KEYS.SUPABASE_URL;
  const activeUrl = envUrl || configUrl || "Không tìm thấy URL";
  
  // Check xem có phải đang dùng URL Placeholder không
  const isDemoDb = activeUrl.includes('YOUR_SUPABASE_URL');

  const handleCheckStatus = async () => {
      if (!user) return;
      setIsChecking(true);
      setStatusMessage(null);
      setDebugData(null);
      
      try {
          // 1. Gửi request trực tiếp lên Supabase (Bỏ qua mọi cache)
          const { data, error } = await supabase
              .from('profiles')
              .select('*') // Lấy tất cả cột để soi
              .eq('id', user.id)
              .single();

          // Lưu dữ liệu thô để hiển thị ra màn hình
          setDebugData({ 
              source: 'Direct DB Query', 
              data: data, 
              error: error,
              timestamp: new Date().toLocaleTimeString()
          });

          if (error) throw error;

          // 2. Kiểm tra điều kiện
          const isActive = data?.status === 'active';
          const isAdmin = data?.role === 'admin';

          if (isActive || isAdmin) {
              setStatusMessage("✅ DỮ LIỆU ĐÃ KHỚP! Đang vào hệ thống...");
              await refreshProfile();
              // Force reload để xóa sạch bộ nhớ đệm
              setTimeout(() => window.location.reload(), 1000);
          } else {
              setStatusMessage("⚠️ KẾT NỐI THÀNH CÔNG NHƯNG TRẠNG THÁI CHƯA ĐÚNG.");
          }
          
      } catch (error: any) {
          console.error("Lỗi chi tiết:", error);
          
          // Trích xuất thông báo lỗi an toàn (Fix lỗi [object Object])
          let errorMessage = "Không xác định";
          try {
              if (typeof error === 'string') {
                  errorMessage = error;
              } else if (typeof error === 'object' && error !== null) {
                  // Ưu tiên thuộc tính 'message' dạng chuỗi
                  if (error.message && typeof error.message === 'string') {
                      errorMessage = error.message;
                  } else if (error.error_description) {
                      errorMessage = error.error_description;
                  } else if (error.details) {
                      errorMessage = error.details;
                  } else {
                      // Fallback: Stringify toàn bộ object
                      errorMessage = JSON.stringify(error);
                      // Nếu stringify ra "{}", thử toString (cho Error object thuần)
                      if (errorMessage === '{}') errorMessage = String(error);
                  }
              } else {
                  errorMessage = String(error);
              }
          } catch (e) {
              errorMessage = "Lỗi định dạng dữ liệu lỗi";
          }

          // Xử lý lỗi 42P17 (Infinite Recursion)
          if (error?.code === '42P17' || errorMessage.includes('infinite recursion')) {
              setStatusMessage("🚫 LỖI CẤU HÌNH: VÒNG LẶP VÔ HẠN (42P17)");
          } else {
              setStatusMessage("❌ LỖI KỸ THUẬT: " + errorMessage);
          }
          
          setDebugData(prev => ({ ...prev, errorObj: error }));
      } finally {
          setIsChecking(false);
      }
  };

  // Helper để hiển thị JSON đẹp
  const safeJsonStringify = (data: any) => {
      return JSON.stringify(data, (key, value) => {
          if (value instanceof Error) {
              return {
                  message: value.message,
                  name: value.name,
                  code: (value as any).code,
                  hint: (value as any).hint,
                  ...value 
              };
          }
          return value;
      }, 2);
  };

  const isRecursionError = debugData?.error?.code === '42P17' || debugData?.errorObj?.code === '42P17';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-8 font-sans">
      <div className="max-w-2xl w-full space-y-6">
        
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-yellow-200 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
            <ClockIcon className="h-10 w-10 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Tài khoản đang chờ xét duyệt
            </h2>
            
            <p className="text-slate-600 mb-6">
            Xin chào <strong>{profile?.full_name || user?.email}</strong>,<br/>
            Vui lòng đợi Admin kích hoạt hoặc nhấn nút bên dưới để kiểm tra lại.
            </p>

            {statusMessage && (
                <div className={`mb-6 p-3 rounded-lg font-bold border break-words ${
                    statusMessage.includes("✅") ? "bg-green-100 text-green-700 border-green-300" : 
                    statusMessage.includes("🚫") ? "bg-red-100 text-red-700 border-red-300" :
                    statusMessage.includes("⚠️") ? "bg-orange-100 text-orange-700 border-orange-300" :
                    "bg-red-50 text-red-700 border-red-200"
                }`}>
                    {statusMessage}
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
                onClick={handleCheckStatus}
                disabled={isChecking}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors shadow-sm"
            >
                <ArrowPathIcon className={`h-5 w-5 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                {isChecking ? 'Đang kết nối Database...' : 'Kiểm tra trạng thái ngay'}
            </button>
            <button
                onClick={signOut}
                className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
                Đăng xuất
            </button>
            </div>
        </div>

        {/* DEBUG PANEL */}
        <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden text-left">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                <h3 className="text-white font-mono text-sm font-bold flex items-center">
                    <ExclamationTriangleIcon className="w-4 h-4 mr-2 text-yellow-400"/>
                    BẢNG THÔNG TIN GỠ LỖI (DEBUG INFO)
                </h3>
                {isDemoDb && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded font-bold animate-pulse">
                        CẢNH BÁO: URL CHƯA CẤU HÌNH
                    </span>
                )}
            </div>
            
            <div className="p-4 text-xs font-mono text-slate-300 space-y-4 overflow-x-auto">
                {/* 1. Kiểm tra URL */}
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <p className="text-slate-500">1. Đang kết nối tới Database nào?</p>
                        <a 
                            href="https://supabase.com/dashboard/project/_/settings/api" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sky-400 hover:text-sky-300 flex items-center underline"
                        >
                            <QuestionMarkCircleIcon className="w-3 h-3 mr-1" />
                            Lấy URL ở đâu?
                        </a>
                    </div>
                    <div className="bg-slate-900 p-2 rounded border border-slate-700 break-all">
                        {activeUrl}
                    </div>
                </div>

                {/* 2. Kiểm tra User ID */}
                <div>
                    <p className="text-slate-500 mb-1">2. ID Tài khoản:</p>
                    <div className="bg-slate-900 p-2 rounded border border-slate-700 select-all">
                        {user?.id}
                    </div>
                </div>

                {/* 3. Kết quả trả về */}
                <div>
                    <p className="text-slate-500 mb-1">3. Dữ liệu thực tế từ Database:</p>
                    <pre className="bg-black p-3 rounded border border-slate-700 text-green-400 overflow-x-auto whitespace-pre-wrap max-h-96">
                        {debugData ? safeJsonStringify(debugData) : "Chưa có dữ liệu. Nhấn nút 'Kiểm tra' ở trên."}
                    </pre>
                    
                    {/* --- KHU VỰC SỬA LỖI 42P17 --- */}
                    {isRecursionError && (
                        <div className="mt-4 p-4 bg-red-900/40 border border-red-500 rounded text-white">
                            <h4 className="font-bold text-red-400 text-sm mb-2 flex items-center">
                                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                                PHÁT HIỆN LỖI: Infinite Recursion (42P17)
                            </h4>
                            <p className="text-slate-300 mb-3">
                                Lỗi này xảy ra do chính sách bảo mật (RLS) tự gọi lại chính nó tạo thành vòng lặp vô hạn. Bạn cần chạy đoạn mã dưới đây để sửa:
                            </p>
                            
                            <div className="relative group">
                                <textarea 
                                    readOnly
                                    className="w-full bg-black/80 text-green-400 p-3 rounded border border-slate-600 text-xs font-mono h-48 focus:outline-none focus:border-green-500"
                                    value={FIX_RLS_SQL}
                                />
                                <button 
                                    onClick={() => {
                                        navigator.clipboard.writeText(FIX_RLS_SQL);
                                        alert("Đã copy đoạn mã SQL!");
                                    }}
                                    className="absolute top-2 right-2 bg-white text-slate-900 px-2 py-1 rounded text-xs font-bold hover:bg-sky-100 transition-colors"
                                >
                                    Copy SQL
                                </button>
                            </div>

                            <div className="mt-3 flex items-start text-sky-300 text-xs">
                                <DocumentTextIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                                <span>
                                    Hướng dẫn: Copy đoạn mã trên &gt; Vào <strong>Supabase Dashboard</strong> &gt; <strong>SQL Editor</strong> &gt; Paste và nhấn <strong>Run</strong>.
                                </span>
                            </div>
                        </div>
                    )}

                    {debugData?.data === null && !debugData?.error && (
                        <div className="text-orange-400 mt-2 p-2 border border-orange-800 bg-orange-900/20 rounded">
                            <p className="font-bold">⚠️ Dữ liệu trả về `null` nhưng không báo lỗi?</p>
                            <p className="mt-1">Nguyên nhân có thể:</p>
                            <ul className="list-disc list-inside ml-1">
                                <li>Bạn chưa chạy câu lệnh SQL để tạo bảng <code>profiles</code>.</li>
                                <li>Hoặc User ID này chưa được thêm vào bảng <code>profiles</code> (Trigger bị lỗi).</li>
                                <li>Hoặc chính sách bảo mật (RLS) đang chặn bạn xem profile của chính mình.</li>
                            </ul>
                            <p className="mt-2 text-white">👉 Giải pháp: Mở file <code>README.md</code>, copy lệnh SQL và chạy trong Supabase SQL Editor.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherPendingView;
