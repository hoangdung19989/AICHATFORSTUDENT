
import React, { useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { 
    OnLuyenLogo, 
    AcademicCapIcon, 
    UserCircleIcon, 
    ShieldCheckIcon,
    GoogleLogo,
    DevicePhoneMobileIcon,
    EnvelopeIcon,
    PaperAirplaneIcon
} from '../icons';
import { useNavigation } from '../../contexts/NavigationContext';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

type UserRole = 'student' | 'teacher';
type AuthMethod = 'email' | 'phone';

const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const { navigate } = useNavigation();
  const [role, setRole] = useState<UserRole>('student');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  
  // Email State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone State
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoginView, setIsLoginView] = useState(true);

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
      setIsSubmitting(true);
      setError(null);
      try {
          const { error } = await supabase.auth.signInWithOAuth({
              provider: 'google',
              options: {
                  redirectTo: window.location.origin,
                  queryParams: {
                      access_type: 'offline',
                      prompt: 'consent', // Bắt buộc hiện màn hình chọn tài khoản để tránh auto-login
                  },
                  data: {
                      role: role, // Quan trọng: Lưu role cho người dùng mới
                      full_name: '', // Sẽ tự lấy từ Google
                  }
              }
          });
          if (error) throw error;
      } catch (err: any) {
          setError(err.message || 'Lỗi đăng nhập Google.');
          setIsSubmitting(false);
      }
  };

  // --- PHONE LOGIN (SEND OTP) ---
  const handleSendOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);
      setMessage(null);

      // Simple validation for phone (Vietnamese format +84 or 0...)
      let formattedPhone = phone.trim();
      if (!formattedPhone) {
          setError("Vui lòng nhập số điện thoại.");
          setIsSubmitting(false);
          return;
      }
      // If user enters 09..., convert to +849... for international standard if needed by provider,
      // but Supabase/Twilio usually handles standard formats well. Let's assume +84.
      if (formattedPhone.startsWith('0')) {
          formattedPhone = '+84' + formattedPhone.substring(1);
      } else if (!formattedPhone.startsWith('+')) {
          formattedPhone = '+84' + formattedPhone;
      }

      try {
          const { error } = await supabase.auth.signInWithOtp({
              phone: formattedPhone,
              options: {
                  data: {
                      role: role, // Lưu role cho user mới
                  }
              }
          });
          if (error) throw error;
          
          setShowOtpInput(true);
          setMessage(`Mã OTP đã được gửi đến ${formattedPhone}. Vui lòng kiểm tra tin nhắn.`);
      } catch (err: any) {
          setError(err.message || "Không thể gửi OTP. Vui lòng kiểm tra lại số điện thoại hoặc thử lại sau.");
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- PHONE LOGIN (VERIFY OTP) ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);
      setError(null);

      let formattedPhone = phone.trim();
      if (formattedPhone.startsWith('0')) formattedPhone = '+84' + formattedPhone.substring(1);
      else if (!formattedPhone.startsWith('+')) formattedPhone = '+84' + formattedPhone;

      try {
          const { data, error } = await supabase.auth.verifyOtp({
              phone: formattedPhone,
              token: otp,
              type: 'sms'
          });

          if (error) throw error;

          if (data.session) {
              await checkUserProfile(data.user.id);
              onLoginSuccess();
          }
      } catch (err: any) {
          setError(err.message || "Mã OTP không chính xác hoặc đã hết hạn.");
      } finally {
          setIsSubmitting(false);
      }
  };

  // --- EMAIL AUTH ACTION ---
  const handleEmailAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (isLoginView) {
        // Sign In
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        
        if (authError) {
             if (authError.message === "Invalid login credentials") {
                 throw new Error("Email hoặc mật khẩu không chính xác.");
             }
             throw authError;
        }
        
        if (authData.user) {
            await checkUserProfile(authData.user.id);
        }
        onLoginSuccess();

      } else {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: {
                    role: role, // Save role
                    full_name: email.split('@')[0]
                }
            }
        });
        if (error) throw error;

        if (data.session) {
            onLoginSuccess();
        } else if (data.user) {
            let msg = `Đăng ký thành công! `;
            if (role === 'teacher') msg += "Tài khoản giáo viên cần Admin xét duyệt. ";
            else msg += "Vui lòng kiểm tra email để xác nhận. ";
            setMessage(msg);
            setIsLoginView(true);
        }
      }
    } catch (err: any) {
        setError(err.message || 'Đã xảy ra lỗi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to check profile status (Shared between methods)
  const checkUserProfile = async (userId: string) => {
      const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', userId)
          .single();
      
      if (profileError || !profile) {
          await supabase.auth.signOut(); 
          throw new Error("Tài khoản này không tồn tại trong hệ thống (Đã bị xóa).");
      }

      if (profile.status === 'blocked') {
          await supabase.auth.signOut();
          throw new Error("Tài khoản của bạn đã bị khóa.");
      }
  };
  
  const handlePasswordReset = async () => {
      if (!email) {
          setError("Vui lòng nhập email để khôi phục mật khẩu.");
          return;
      }
      setIsSubmitting(true);
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: window.location.origin,
          });
          if (error) throw error;
          setMessage("Đã gửi email khôi phục mật khẩu.");
      } catch (err: any) {
          setError(err.message);
      } finally {
          setIsSubmitting(false);
      }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-bg px-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 flex-1 flex flex-col justify-center">
        <div className="text-center">
            <OnLuyenLogo className="mx-auto h-16 w-auto" />
            <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
                {isLoginView ? 'Đăng nhập vào OnLuyen' : 'Tạo tài khoản mới'}
            </h2>
        </div>

        {/* Role Selection Tabs */}
        <div className="flex p-1 bg-slate-200 rounded-xl">
            {(['student', 'teacher'] as const).map((r) => (
                <button
                    key={r}
                    type="button"
                    onClick={() => { setRole(r); setShowOtpInput(false); setError(null); }}
                    className={`flex-1 flex items-center justify-center py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                        role === r 
                        ? 'bg-white text-brand-blue shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                >
                    {r === 'student' ? <AcademicCapIcon className="w-5 h-5 mr-2" /> : <UserCircleIcon className="w-5 h-5 mr-2" />}
                    {r === 'student' ? 'Học sinh' : 'Giáo viên'}
                </button>
            ))}
        </div>

        {/* Google Login Button */}
        <div>
            <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-lg transition-colors shadow-sm"
            >
                <GoogleLogo className="w-5 h-5 mr-3" />
                Tiếp tục với Google
            </button>
        </div>

        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-brand-bg text-slate-500">Hoặc đăng nhập bằng</span>
            </div>
        </div>

        {/* Auth Method Tabs (Email vs Phone) */}
        <div className="flex space-x-4 border-b border-slate-300">
            <button
                className={`pb-2 text-sm font-medium transition-colors ${authMethod === 'email' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => { setAuthMethod('email'); setError(null); setMessage(null); }}
            >
                <div className="flex items-center space-x-2">
                    <EnvelopeIcon className="h-5 w-5" />
                    <span>Email & Mật khẩu</span>
                </div>
            </button>
            <button
                className={`pb-2 text-sm font-medium transition-colors ${authMethod === 'phone' ? 'text-brand-blue border-b-2 border-brand-blue' : 'text-slate-500 hover:text-slate-700'}`}
                onClick={() => { setAuthMethod('phone'); setError(null); setMessage(null); }}
            >
                <div className="flex items-center space-x-2">
                    <DevicePhoneMobileIcon className="h-5 w-5" />
                    <span>Số điện thoại</span>
                </div>
            </button>
        </div>

        {/* EMAIL FORM */}
        {authMethod === 'email' && (
            <form className="space-y-4" onSubmit={handleEmailAuthAction}>
                <div className="space-y-4">
                    <input
                        type="email" required placeholder="Địa chỉ email"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-sky-500"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password" required placeholder="Mật khẩu"
                        className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-sky-500"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                
                {isLoginView && (
                    <div className="flex justify-end text-sm">
                        <button type="button" onClick={handlePasswordReset} className="font-medium text-sky-600 hover:text-sky-500" disabled={isSubmitting}>
                            Quên mật khẩu?
                        </button>
                    </div>
                )}

                <button
                    type="submit" disabled={isSubmitting}
                    className="w-full flex justify-center rounded-lg bg-brand-blue-dark py-3 px-4 text-sm font-medium text-white hover:bg-brand-blue disabled:bg-slate-400 transition-colors"
                >
                    {isSubmitting ? 'Đang xử lý...' : (isLoginView ? 'Đăng nhập' : 'Đăng ký')}
                </button>
                
                <div className="text-center text-sm text-gray-600 mt-4">
                    <p>
                        {isLoginView ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
                        <button type="button" onClick={() => { setIsLoginView(!isLoginView); setError(null); }} className="font-medium text-sky-600 hover:text-sky-500 ml-1">
                            {isLoginView ? 'Đăng ký ngay' : 'Đăng nhập'}
                        </button>
                    </p>
                </div>
            </form>
        )}

        {/* PHONE FORM */}
        {authMethod === 'phone' && (
            <form className="space-y-4" onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp}>
                {!showOtpInput ? (
                    <>
                        <input
                            type="tel" required placeholder="Số điện thoại (VD: 0912345678)"
                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-sky-500 focus:ring-sky-500"
                            value={phone} onChange={(e) => setPhone(e.target.value)}
                        />
                        <button
                            type="submit" disabled={isSubmitting}
                            className="w-full flex justify-center items-center rounded-lg bg-brand-blue-dark py-3 px-4 text-sm font-medium text-white hover:bg-brand-blue disabled:bg-slate-400 transition-colors"
                        >
                            {isSubmitting ? 'Đang gửi...' : (
                                <>
                                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                                    Gửi mã xác nhận
                                </>
                            )}
                        </button>
                    </>
                ) : (
                    <>
                        <div className="text-center mb-2">
                            <p className="text-sm text-slate-600">Đã gửi mã đến <b>{phone}</b></p>
                            <button type="button" onClick={() => setShowOtpInput(false)} className="text-xs text-sky-600 hover:underline">Thay đổi số</button>
                        </div>
                        <input
                            type="text" required placeholder="Nhập mã OTP (6 số)" maxLength={6}
                            className="block w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-sky-500 focus:ring-sky-500"
                            value={otp} onChange={(e) => setOtp(e.target.value)}
                        />
                        <button
                            type="submit" disabled={isSubmitting}
                            className="w-full flex justify-center rounded-lg bg-green-600 py-3 px-4 text-sm font-medium text-white hover:bg-green-500 disabled:bg-slate-400 transition-colors"
                        >
                            {isSubmitting ? 'Đang kiểm tra...' : 'Xác thực & Đăng nhập'}
                        </button>
                    </>
                )}
            </form>
        )}

        {/* Global Messages */}
        {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">
                <p className="font-medium">Lỗi:</p>
                <p>{error}</p>
            </div>
        )}
        {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-700">
                {message}
            </div>
        )}
      </div>

      <div className="mt-8 text-center">
          <button 
            onClick={() => navigate('admin-login')}
            className="inline-flex items-center text-xs text-slate-400 hover:text-slate-600 transition-colors border-b border-dashed border-slate-300 pb-0.5"
          >
              <ShieldCheckIcon className="w-3 h-3 mr-1" />
              Truy cập Portal Quản trị (Admin Only)
          </button>
      </div>
    </div>
  );
};

export default LoginView;
