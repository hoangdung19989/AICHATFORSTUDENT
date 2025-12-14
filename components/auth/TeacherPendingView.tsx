
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ClockIcon, ArrowPathIcon } from '../icons'; // Assuming ArrowPathIcon exists or uses a refresh icon

const TeacherPendingView: React.FC = () => {
  const { refreshProfile, signOut, user } = useAuth();

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
          Xin chào <strong>{user?.user_metadata?.full_name || user?.email}</strong>,<br/>
          Cảm ơn thầy/cô đã đăng ký tài khoản Giáo viên trên OnLuyen AI.
          <br/><br/>
          Để đảm bảo an toàn hệ thống, tài khoản giáo viên cần được Quản trị viên (Admin) phê duyệt thủ công trước khi có thể truy cập các công cụ giảng dạy.
        </p>

        <div className="bg-slate-50 rounded-lg p-4 mb-8 text-sm text-slate-500 border border-slate-100">
          <p>Thời gian xét duyệt thường mất từ <strong>1 - 24 giờ</strong>.</p>
          <p>Vui lòng quay lại sau hoặc liên hệ Admin nếu cần gấp.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={refreshProfile}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-yellow-600 hover:bg-yellow-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Kiểm tra trạng thái
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
                Bạn đăng ký nhầm vai trò? Hãy Đăng xuất và tạo tài khoản mới với vai trò Học sinh.
            </p>
        </div>
      </div>
    </div>
  );
};

export default TeacherPendingView;
