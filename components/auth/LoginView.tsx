import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { OnLuyenLogo, AcademicCapIcon, UserCircleIcon } from '../icons';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

type UserRole = 'student' | 'teacher';

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (isLoginView) {
        // Handle Login
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onLoginSuccess();
      } else {
        // Handle Sign Up
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    role: role, // Save role to user_metadata
                    full_name: email.split('@')[0] // Default name
                }
            }
        });
        if (error) throw error;

        if (data.session) {
            // Auto login logic
            if (role === 'teacher') {
                // For teachers, we login but they will see "Pending" screen
                onLoginSuccess();
            } else {
                onLoginSuccess();
            }
        } else if (data.user) {
            let msg = `Đăng ký tài khoản thành công! `;
            if (role === 'teacher') {
                msg += "Tài khoản giáo viên sẽ cần Admin xét duyệt trước khi hoạt động.";
            } else {
                msg += "Vui lòng kiểm tra email để xác nhận.";
            }
            setMessage(msg);
            setIsLoginView(true);
        }
      }
    } catch (err: any) {
      setError(err.error_description || err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePasswordReset = async () => {
      if (!email) {
          setError("Vui lòng nhập email của bạn để khôi phục mật khẩu.");
          return;
      }
      setIsSubmitting(true);
      setError(null);
      setMessage(null);
      
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin, // Redirects back to the app
          });
          if (error) throw error;
          setMessage("Đã gửi liên kết khôi phục mật khẩu. Vui lòng kiểm tra email của bạn.");
      } catch (err: any) {
          setError(err.error_description || err.message || 'Không thể gửi email khôi phục. Vui lòng thử lại.');
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="flex items-center justify-center min-h-full bg-brand-bg px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
            <OnLuyenLogo className="mx-auto h-20 w-auto" />
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            {isLoginView ? 'Chào mừng trở lại' : 'Tạo tài khoản mới'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
            {isLoginView 
                ? 'Đăng nhập để tiếp tục hành trình giảng dạy và học tập' 
                : 'Đăng ký để bắt đầu trải nghiệm OnLuyen AI'}
            </p>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex p-1 bg-slate-200 rounded-xl mt-8">
            <button
                type="button"
                onClick={() => setRole('student')}
                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    role === 'student' 
                    ? 'bg-white text-brand-blue shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <AcademicCapIcon className="w-5 h-5 mr-2" />
                Học sinh
            </button>
            <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    role === 'teacher' 
                    ? 'bg-white text-brand-blue shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <UserCircleIcon className="w-5 h-5 mr-2" />
                Giáo viên
            </button>
        </div>

        <form className="mt-6 space-y-6" onSubmit={handleAuthAction}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <input
                id="email-address" name="email" type="email" autoComplete="email" required
                className="relative block w-full appearance-none rounded-t-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                placeholder="Địa chỉ email"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password" name="password" type="password" autoComplete="current-password" required
                className="relative block w-full appearance-none rounded-b-md border border-gray-300 px-3 py-3 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-sky-500 focus:outline-none focus:ring-sky-500 sm:text-sm"
                placeholder="Mật khẩu"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">{error}</p>}
          {message && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-md border border-green-100">{message}</p>}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={handlePasswordReset}
                className="font-medium text-sky-600 hover:text-sky-500"
                disabled={isSubmitting}
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-brand-blue-dark py-3 px-4 text-sm font-medium text-white hover:bg-brand-blue focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:bg-slate-400 transition-colors"
            >
              {isSubmitting ? 'Đang xử lý...' : (
                  isLoginView 
                    ? `Đăng nhập (${role === 'student' ? 'Học sinh' : 'Giáo viên'})` 
                    : `Đăng ký (${role === 'student' ? 'Học sinh' : 'Giáo viên'})`
              )}
            </button>
          </div>
        </form>
         <div className="text-center text-sm text-gray-600">
            <p>
                {isLoginView ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                <button onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-medium text-sky-600 hover:text-sky-500 ml-1">
                    {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập'}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginView;