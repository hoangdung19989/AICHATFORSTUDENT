
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabaseClient'; 
import { API_KEYS } from '../../config'; 
import { ClockIcon, ArrowPathIcon, ExclamationTriangleIcon, UserCircleIcon, QuestionMarkCircleIcon } from '../icons'; 

const TeacherPendingView: React.FC = () => {
  const { signOut, user, refreshProfile, profile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [debugData, setDebugData] = useState<any>(null);

  // Lấy thông tin cấu hình hiện tại
  // Ưu tiên import.meta.env (biến môi trường thực) sau đó mới đến file config.ts
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
  const configUrl = API_KEYS.SUPABASE_URL;
  const activeUrl = envUrl || configUrl || "Không tìm thấy URL";
  
  // Check xem có phải đang dùng Database Demo hay chưa điền thông tin không
  const isDemoDb = activeUrl.includes('ofxgkartrrnthebkwrih') || activeUrl.includes('YOUR_SUPABASE_URL');

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
          console.error("Lỗi:", error);
          setStatusMessage("❌ LỖI KỸ THUẬT: " + error.message);
          setDebugData(prev => ({ ...prev, errorObj: error }));
      } finally {
          setIsChecking(false);
      }
  };

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
                <div className={`mb-6 p-3 rounded-lg font-bold border ${
                    statusMessage.includes("✅") ? "bg-green-100 text-green-700 border-green-300" : 
                    statusMessage.includes("⚠️") ? "bg-orange-100 text-orange-700 border-orange-300" :
                    "bg-red-100 text-red-700 border-red-300"
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

        {/* DEBUG PANEL - KHU VỰC CHẨN ĐOÁN LỖI */}
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
                    
                    {isDemoDb ? (
                        <div className="mt-2 p-2 bg-red-900/30 border border-red-800 rounded text-red-300">
                            <p className="font-bold">❌ SAI CẤU HÌNH!</p>
                            <p className="mt-1">File <code>config.ts</code> vẫn đang chứa link demo hoặc dòng chữ 'YOUR_SUPABASE_URL_HERE'.</p>
                            <p className="mt-1 font-bold text-white">👉 CÁCH SỬA:</p>
                            <ol className="list-decimal list-inside ml-2 mt-1 space-y-1">
                                <li>Vào Supabase Dashboard.</li>
                                <li>Nhìn Menu trái &gt; Chọn <strong>Settings (Bánh răng)</strong> &gt; Chọn <strong>Data API</strong>.</li>
                                <li>Copy dòng <strong>Project URL</strong> và <strong>Anon Key</strong>.</li>
                                <li>Dán đè vào file <code>config.ts</code> trong code.</li>
                            </ol>
                        </div>
                    ) : (
                        <p className="text-green-500 mt-1">✅ URL có vẻ hợp lệ.</p>
                    )}
                </div>

                {/* 2. Kiểm tra User ID */}
                <div>
                    <p className="text-slate-500 mb-1">2. ID Tài khoản của bạn là gì?</p>
                    <div className="bg-slate-900 p-2 rounded border border-slate-700 select-all">
                        {user?.id}
                    </div>
                    <p className="text-slate-500 mt-1">
                        👉 Hãy vào Supabase &gt; Table Editor &gt; `profiles`. Tìm cột `id` xem có mã này không.
                    </p>
                </div>

                {/* 3. Kết quả trả về */}
                <div>
                    <p className="text-slate-500 mb-1">3. Dữ liệu thực tế nhận được từ Database:</p>
                    <pre className="bg-black p-3 rounded border border-slate-700 text-green-400 overflow-x-auto whitespace-pre-wrap">
                        {debugData ? JSON.stringify(debugData, null, 2) : "Chưa có dữ liệu. Nhấn nút 'Kiểm tra' ở trên."}
                    </pre>
                    {debugData?.data === null && !debugData?.error && (
                        <p className="text-orange-400 mt-1">
                            ⚠️ Dữ liệu trả về `null`? Có thể bạn chưa chạy câu lệnh SQL để tạo bảng hoặc chính sách bảo mật (RLS) đang chặn bạn xem profile của chính mình.
                        </p>
                    )}
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default TeacherPendingView;
