import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation, View } from '../../contexts/NavigationContext';
import {
  HomeIcon,
  AcademicCapIcon,
  RocketLaunchIcon,
  UserCircleIcon,
  QuestionMarkCircleIcon,
  OnLuyenLogo,
  PencilSquareIcon,
  DocumentTextIcon,
  KeyIcon
} from '../icons';

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  view: View;
}

const Sidebar: React.FC<{ onOpenAboutModal: () => void }> = ({ onOpenAboutModal }) => {
  const { user, profile, signOut } = useAuth();
  const { currentView, navigate } = useNavigation();

  // Use profile data if available, fallback to metadata for immediate feedback
  const role = profile?.role || user?.user_metadata?.role;
  const status = profile?.status || 'active';
  
  let roleLabel = 'Học sinh';
  let roleColor = 'bg-sky-100 text-sky-700';

  if (role === 'teacher') {
      roleLabel = 'Giáo viên';
      roleColor = 'bg-purple-100 text-purple-700';
  } else if (role === 'admin') {
      roleLabel = 'Quản trị viên';
      roleColor = 'bg-red-100 text-red-700';
  }

  const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, view }) => {
    const isActive = currentView === view || (view === 'self-study' && !['home', 'personalized-dashboard'].includes(currentView));
    
    return (
      <button
        onClick={() => navigate(view)}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 ${
          isActive
            ? 'bg-sky-100 text-sky-700'
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
        }`}
      >
        <Icon className="h-6 w-6 mr-3" />
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-4 shrink-0">
      <div className="flex items-center space-x-3 px-2 mb-6">
        <OnLuyenLogo className="h-10 w-10" />
        <span className="text-xl font-bold tracking-tight text-brand-blue-dark">
          OnLuyen AI
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem icon={HomeIcon} label="Trang chủ" view="home" />
        
        {/* Student Links */}
        {role !== 'teacher' && role !== 'admin' && (
          <>
            <NavItem icon={AcademicCapIcon} label="Tự học" view="self-study" />
            <NavItem icon={RocketLaunchIcon} label="Lộ trình của tôi" view="personalized-dashboard" />
          </>
        )}

        {/* Teacher Links */}
        {role === 'teacher' && (
          <>
             <NavItem icon={PencilSquareIcon} label="Công cụ giảng dạy" view="teacher-dashboard" />
             {status === 'active' && (
                <NavItem icon={DocumentTextIcon} label="Soạn giáo án" view="lesson-planner" />
             )}
          </>
        )}

        {/* Admin Links */}
        {role === 'admin' && (
            <NavItem icon={KeyIcon} label="Quản trị hệ thống" view="admin-dashboard" />
        )}
      </nav>

      <div className="mt-auto">
        <div className="space-y-2">
           <button
            onClick={onOpenAboutModal}
            className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <QuestionMarkCircleIcon className="h-6 w-6 mr-3" />
            <span className="truncate">Về OnLuyen AI</span>
          </button>
        </div>
        <div className="border-t border-slate-200 my-4"></div>
        {user ? (
          <div className="flex flex-col items-start space-y-3">
            <div className="flex items-center px-2 space-x-3 w-full">
               <UserCircleIcon className="h-10 w-10 text-slate-400 flex-shrink-0" />
               <div className="flex flex-col overflow-hidden">
                   <span className="text-sm font-bold text-slate-700 truncate" title={user.email}>{user.email}</span>
                   <div className="flex space-x-1 mt-0.5">
                       <span className={`text-xs font-semibold px-2 py-0.5 rounded-full w-fit ${roleColor}`}>
                           {roleLabel}
                       </span>
                       {status === 'pending' && (
                           <span className="text-xs font-semibold px-2 py-0.5 rounded-full w-fit bg-yellow-100 text-yellow-700">
                               Chờ duyệt
                           </span>
                       )}
                   </div>
               </div>
            </div>
            <button
              onClick={signOut}
              className="w-full text-center bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 px-4 rounded-lg text-sm transition-colors"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <button
            onClick={() => navigate('login')}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;