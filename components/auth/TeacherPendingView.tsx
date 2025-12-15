
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ClockIcon, ArrowPathIcon } from '../icons'; 

const TeacherPendingView: React.FC = () => {
  const { signOut, user, refreshProfile, profile } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleCheckStatus = async () => {
      setIsChecking(true);
      setStatusMessage(null);
      
      try {
          // 1. Gọi hàm làm mới Profile từ AuthContext
          await refreshProfile();
          
          // 2. Đợi 1 chút để UI cập nhật
          await new Promise(r => setTimeout(r, 800));

          // 3. Kiểm tra lại logic (Lưu ý: profile ở đây là giá trị cũ trong closure, 
          // nhưng nếu profile thực sự thay đổi trong Context, App.tsx sẽ re-render và màn hình này sẽ biến mất)
          
          setStatusMessage("Hệ thống đã kiểm tra: Tài khoản vẫn đang ở trạng thái Chờ duyệt.");
          
      } catch (error) {
          console.error(error);
          setStatusMessage("Có lỗi khi kết nối. Vui lòng thử lại.");
      } finally {
          setIsChecking(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-yellow-200 p-8 text-center animate-scale-in">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-yellow-100 mb-6">
          <ClockIcon className="h-10 w-10 text-yellow-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          Tài khoản đang chờ xét duyệt
        </h2>
        
        <p className="text-slate-600 mb-6 leading-relaxed">
          Xin chào <strong>{profile?.full_name || user?.email}</strong>,<br/>
          Cảm ơn thầy/cô đã đăng ký tài khoản Giáo viên trên OnLuyen AI.
          <br/><br/>
          Nếu Admin đã thông báo kích hoạt, vui lòng nhấn nút bên dưới để vào hệ thống.
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-8 text-sm text-slate-500 border border-slate-100">
          <p>Email: <span className="font-medium text-slate-700">{user?.email}</span></p>
          <p className="mt-1">Trạng thái: <span className="font-bold text-yellow-600 uppercase">PENDING (Chờ duyệt)</span></p>
          {statusMessage && (
              <p className="mt-2 text-red-500 font-semibold bg-red-50 p-2 rounded border border-red-100 animate-pulse">
                  {statusMessage}
              </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={handleCheckStatus}
            disabled={isChecking}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-70"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Đang kiểm tra...' : 'Cập nhật trạng thái'}
          </button>
          <button
            onClick={signOut}
            className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 text-base font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
          >
            Đăng xuất
          </button>
        </div>
        
        <div className="mt-6 border-t border-slate-100 pt-4">
             <p className="text-xs text-slate-400">
                Mẹo: Nếu bạn đã sửa Database thành "active" mà vẫn không vào được, hãy thử Đăng xuất và Đăng nhập lại.
            </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherPendingView;
