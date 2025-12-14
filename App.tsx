
import React, { useState, useRef, useEffect } from 'react';
// FIX: Corrected import path for ChatMessage type
import type { ChatMessage } from './types/index';
import Sidebar from './components/layout/Sidebar';
import HomePage from './components/home/HomePage';
import AboutModal from './components/modals/AboutModal';
import LoginView from './components/auth/LoginView';
import AdminLoginView from './components/auth/AdminLoginView';
import UpdatePasswordView from './components/auth/UpdatePasswordView';
import TeacherPendingView from './components/auth/TeacherPendingView'; // IMPORT NEW VIEW
import PersonalizedDashboard from './features/personalized-dashboard/PersonalizedDashboardView';
import SelfStudyDashboard from './features/dashboard/SelfStudyDashboard';
import AITutorFlow from './features/ai-tutor/AITutorFlow';
import LecturesFlow from './features/lectures/LecturesFlow';
import LaboratoryFlow from './features/laboratory/LaboratoryFlow';
import TestsFlow from './features/tests/TestsFlow';
import MockExamsFlow from './features/mock-exams/MockExamsFlow';
import SelfPracticeFlow from './features/self-practice/SelfPracticeFlow';
import TeacherDashboard from './features/teacher/TeacherDashboard';
import LessonPlanner from './features/teacher/LessonPlanner';
import TestGenerator from './features/teacher/TestGenerator'; // NEW IMPORT
import AdminDashboard from './features/admin/AdminDashboard';

import { useAuth } from './contexts/AuthContext';
import { useNavigation, View } from './contexts/NavigationContext';
import { supabase } from './services/supabaseClient';
import { getGenericTutorResponse } from './services/geminiService';
import { RobotIcon, PaperAirplaneIcon, XMarkIcon } from './components/icons';
import LoadingSpinner from './components/common/LoadingSpinner';

// --- Floating AI Button Component ---
const FloatingAIButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 h-16 w-16 bg-brand-blue-dark rounded-full text-white flex items-center justify-center shadow-lg hover:bg-brand-blue transition-colors focus:outline-none focus:ring-4 focus:ring-sky-300 animate-pulse-float"
      aria-label="Mở Trợ lý AI"
    >
      <RobotIcon className="h-8 w-8" />
    </button>
  );
};

// --- AI Chat Popup Component ---
const AIChatPopup: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
        setMessages([{
            role: 'model',
            content: `Xin chào! Tôi là trợ lý AI của OnLuyen. Tôi có thể giúp gì cho bạn?`
        }]);
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await getGenericTutorResponse(currentInput);
      const modelMessage: ChatMessage = { role: 'model', content: response };
      setMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
       const modelMessage: ChatMessage = { role: 'model', content: "Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại." };
      setMessages((prev) => [...prev, modelMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col bg-white rounded-xl shadow-2xl border border-slate-200 transition-all duration-300 ease-in-out transform origin-bottom-right animate-scale-in">
      <div className="flex items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-xl flex-shrink-0">
        <RobotIcon className="h-6 w-6 text-brand-blue-dark" />
        <h2 className="ml-3 text-lg font-bold text-slate-800">Trợ lý AI OnLuyen</h2>
        <button
          onClick={onClose}
          className="ml-auto p-2 rounded-full hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
          aria-label="Đóng Trợ lý AI"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-xs sm:max-w-sm px-4 py-3 rounded-2xl shadow-sm ${
                msg.role === 'user' ? 'bg-sky-600 text-white' : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              <p className="whitespace-pre-wrap text-sm sm:text-base">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-lg px-4 py-3 rounded-2xl bg-white text-slate-700 flex items-center space-x-2 shadow-sm border border-slate-200">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-300"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-white rounded-b-xl flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2 sm:space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hỏi bất cứ điều gì..."
            className="flex-1 w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 transition-shadow"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-3 bg-sky-600 rounded-full text-white hover:bg-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-sky-500"
            aria-label="Gửi"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Main App Component ---
const AppContent: React.FC = () => {
  const { user, profile, isLoading } = useAuth();
  const { currentView, navigate } = useNavigation();

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // 1. Listen for Password Recovery and Error Events in URL
  useEffect(() => {
    // Check URL Hash for errors (Supabase returns errors in hash)
    const hash = window.location.hash;
    if (hash) {
        const params = new URLSearchParams(hash.substring(1)); // remove #
        const errorDescription = params.get('error_description');
        const errorCode = params.get('error_code');
        
        if (errorDescription) {
            console.error("Supabase Auth Error:", errorDescription);
            let userMsg = "Đã xảy ra lỗi xác thực.";
            if (errorCode === 'otp_expired') {
                userMsg = "Liên kết xác nhận đã hết hạn hoặc không hợp lệ. Vui lòng thử đăng nhập lại hoặc yêu cầu gửi lại mail.";
            } else {
                userMsg = errorDescription.replace(/\+/g, ' ');
            }
            setAuthError(userMsg);
            navigate('login');
            // Clear hash to prevent error showing forever
            window.history.replaceState(null, '', window.location.pathname);
        }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('update-password');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  // 2. Strict Redirect Logic
  useEffect(() => {
    if (isLoading) return;
    
    const isRecovery = window.location.hash.includes('type=recovery');

    // Nếu đã đăng nhập và đang ở trang login/admin-login -> Chuyển hướng
    if (user && (currentView === 'login' || currentView === 'admin-login') && !isRecovery) {
      // Logic mới: Không đợi profile nếu nó quá lâu hoặc lỗi.
      // Dùng user_metadata làm phương án dự phòng để chuyển trang ngay.
      const isAdmin = profile?.role === 'admin' || user.user_metadata?.role === 'admin';
      
      if (isAdmin) {
          navigate('admin-dashboard');
      } else {
          navigate('home');
      }
    }

    // Nếu CHƯA đăng nhập và KHÔNG ở trang public -> Bắt đăng nhập
    if (!user && currentView !== 'login' && currentView !== 'admin-login' && currentView !== 'update-password') {
       navigate('login');
    }
  }, [user, profile, isLoading, currentView, navigate]);

  const renderAuthenticatedView = () => {
    switch (currentView) {
      case 'home': return <HomePage />;
      case 'personalized-dashboard': return <PersonalizedDashboard />;
      case 'self-study': return <SelfStudyDashboard />;
      
      // Teacher Views
      case 'teacher-dashboard': return <TeacherDashboard />;
      case 'lesson-planner': return <LessonPlanner />;
      case 'test-generator': return <TestGenerator />;

      // Admin View
      case 'admin-dashboard': return <AdminDashboard />;

      case 'ai-tutor':
      case 'ai-subjects': return <AITutorFlow />;
      
      case 'lecture-subjects':
      case 'lecture-grades':
      case 'lecture-video': return <LecturesFlow />;

      case 'laboratory-categories':
      case 'laboratory-subcategories':
      case 'laboratory-list':
      case 'laboratory-simulation': return <LaboratoryFlow />;

      case 'test-subjects':
      case 'test-grades':
      case 'test-types':
      case 'quiz-view': return <TestsFlow />;

      case 'mock-exam-subjects':
      case 'mock-exam-grades':
      case 'mock-exam-view': return <MockExamsFlow />;

      case 'self-practice-subjects':
      case 'self-practice-grades':
      case 'self-practice-lessons':
      case 'practice-view': return <SelfPracticeFlow />;

      default: return <HomePage />;
    }
  };

  // --- RENDER LOGIC ---

  // 1. Loading State (Global)
  if (isLoading) {
    return (
        <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
            <LoadingSpinner text="Đang tải dữ liệu..." />
        </div>
    );
  }

  // 2. Unauthenticated State (Strict Login Wall)
  if (!user) {
    if (currentView === 'update-password') {
      return <UpdatePasswordView onPasswordUpdated={() => navigate('home')} />;
    }
    
    // Check for Admin Portal
    if (currentView === 'admin-login') {
        return <AdminLoginView onLoginSuccess={() => {
            // Callback để trống, useEffect sẽ tự redirect vào Dashboard
        }} />;
    }

    // Default to Login View for any other unauthenticated state
    return (
        <>
            {authError && (
                <div className="fixed top-0 left-0 w-full bg-red-100 border-b border-red-200 text-red-700 px-4 py-3 z-50 text-center shadow-md">
                    <p className="font-bold">Lỗi xác thực:</p>
                    <p className="text-sm">{authError}</p>
                    <button 
                        onClick={() => setAuthError(null)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-800"
                    >
                        ✕
                    </button>
                </div>
            )}
            <LoginView onLoginSuccess={() => {
                // Callback để trống, để useEffect xử lý chuyển hướng
            }} />
        </>
    );
  }

  // 3. State: Đã đăng nhập nhưng đang ở Login/AdminLogin View (Đang chờ Redirect)
  if (currentView === 'login' || currentView === 'admin-login') {
      return (
          <div className="h-screen w-full flex items-center justify-center bg-brand-bg">
              <LoadingSpinner text="Đang vào hệ thống..." />
          </div>
      );
  }

  // 4. Authenticated State: CHECK FOR PENDING TEACHER (GATEKEEPER)
  // --- BẢO MẬT QUAN TRỌNG ---
  // Lấy role từ profile (DB) hoặc user_metadata (Auth).
  const role = profile?.role || user.user_metadata?.role;
  
  // LOGIC FIX:
  // Nếu là giáo viên (role='teacher') nhưng chưa có profile (profile=null), 
  // ta PHẢI giả định status là 'pending' để chặn truy cập cho đến khi profile load xong.
  // Nếu là học sinh, ta giả định là 'active'.
  const defaultStatus = role === 'teacher' ? 'pending' : 'active';
  const status = profile?.status || defaultStatus;

  const isTeacherPending = role === 'teacher' && status === 'pending';

  if (isTeacherPending) {
      return <TeacherPendingView />;
  }

  // 5. Standard Authenticated State (Full App Layout)
  const isLectureView = currentView === 'lecture-video';

  return (
    <div className="flex h-screen w-full font-sans">
      <Sidebar onOpenAboutModal={() => setIsAboutModalOpen(true)} />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <main className={`flex-1 ${isLectureView ? 'p-0' : 'p-6 sm:p-8 lg:p-10'}`}>
          {renderAuthenticatedView()}
        </main>
      </div>
      <FloatingAIButton onClick={() => setIsChatOpen(true)} />
      <AIChatPopup isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
    </div>
  );
};

const App: React.FC = () => {
  return <AppContent />;
};

export default App;
