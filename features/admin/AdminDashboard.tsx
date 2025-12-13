
import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { UserProfile } from '../../types/user';
import { 
    CheckCircleIcon, 
    XCircleIcon, 
    UserCircleIcon, 
    AcademicCapIcon, 
    PencilSquareIcon, 
    KeyIcon,
    UserGroupIcon,
    ClockIcon,
    ShieldCheckIcon,
    BriefcaseIcon
} from '../../components/icons';

const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center transition-transform hover:scale-105 duration-200">
        <div className={`p-4 rounded-lg ${color} bg-opacity-20 mr-4`}>
            <Icon className={`h-8 w-8 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-slate-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
    </div>
);

const AdminDashboard: React.FC = () => {
    const { navigate } = useNavigation();
    const { profile, user, isLoading: isAuthLoading } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [filterRole, setFilterRole] = useState<'all' | 'teacher' | 'student' | 'admin'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Fetch all users
    const fetchUsers = async () => {
        setIsLoadingData(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data as UserProfile[]);
        } catch (err: any) {
            console.error(err);
            setError("Không thể tải danh sách người dùng. Hãy đảm bảo bạn có quyền Admin và RLS Policies đã được cấu hình đúng.");
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (isAuthLoading) return;

        if (profile) {
            if (profile.role === 'admin') {
                fetchUsers();
                
                const channel = supabase
                .channel('admin-dashboard-users')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'profiles' },
                    (payload) => {
                        if (payload.eventType === 'INSERT') {
                            setUsers((prev) => [payload.new as UserProfile, ...prev]);
                        } else if (payload.eventType === 'UPDATE') {
                            setUsers((prev) => prev.map((u) => (u.id === payload.new.id ? (payload.new as UserProfile) : u)));
                        } else if (payload.eventType === 'DELETE') {
                             setUsers((prev) => prev.filter((u) => u.id !== payload.old.id));
                        }
                    }
                )
                .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            } else {
                navigate('home');
            }
            return;
        }

        if (user?.user_metadata?.role === 'admin') {
            fetchUsers();
        }
        
    }, [profile, user, isAuthLoading, navigate]);

    const isConfirmedAdmin = profile?.role === 'admin' || (!profile && user?.user_metadata?.role === 'admin');

    if (isAuthLoading || !isConfirmedAdmin) {
        if (!isAuthLoading && !isConfirmedAdmin && user && !profile) {
             return (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
                     <LoadingSpinner text="Đang đồng bộ quyền quản trị..." subText="Dữ liệu Profile đang cập nhật." />
                     <button onClick={() => window.location.reload()} className="text-sky-600 hover:underline text-sm">
                         Tải lại trang nếu chờ quá lâu
                     </button>
                </div>
             );
        }

        return (
            <div className="h-full w-full flex items-center justify-center">
                <LoadingSpinner text="Đang xác thực quyền Admin..." />
            </div>
        );
    }

    const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'blocked') => {
        try {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
            const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
            if (error) { fetchUsers(); throw error; }
        } catch (err: any) { alert(`Lỗi cập nhật: ${err.message}`); }
    };

    const handleUpdateRole = async (userId: string, newRole: 'student' | 'teacher' | 'admin') => {
        const confirmMsg = newRole === 'admin' 
            ? "CẢNH BÁO: Bạn sắp cấp quyền QUẢN TRỊ VIÊN cho tài khoản này. Họ sẽ có toàn quyền kiểm soát hệ thống. Bạn có chắc chắn không?"
            : `Bạn có chắc chắn muốn đổi vai trò người dùng này thành ${newRole === 'teacher' ? 'Giáo viên' : 'Học sinh'} không?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
            if (error) { fetchUsers(); throw error; }
        } catch (err: any) { alert(`Lỗi cập nhật vai trò: ${err.message}`); }
    };

    const filteredUsers = useMemo(() => {
        return users.filter(u => {
            const matchesRole = filterRole === 'all' || u.role === filterRole;
            const matchesSearch = 
                (u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                (u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
            return matchesRole && matchesSearch;
        });
    }, [users, filterRole, searchQuery]);

    const stats = useMemo(() => {
        return {
            total: users.length,
            teachers: users.filter(u => u.role === 'teacher').length,
            students: users.filter(u => u.role === 'student').length,
            admins: users.filter(u => u.role === 'admin').length,
            pending: users.filter(u => u.status === 'pending').length,
        };
    }, [users]);

    return (
        <div className="container mx-auto max-w-6xl pb-10">
            <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Quản trị hệ thống' }]} />

            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Tổng quan Hệ thống</h1>
                    <p className="text-slate-500 mt-1">
                        Quản lý người dùng thời gian thực. 
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                             <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                             Live
                        </span>
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Tổng người dùng" value={stats.total} icon={UserGroupIcon} color="bg-blue-500" />
                <StatCard title="Quản trị viên" value={stats.admins} icon={ShieldCheckIcon} color="bg-red-500" />
                <StatCard title="Giáo viên" value={stats.teachers} icon={PencilSquareIcon} color="bg-purple-500" />
                <StatCard title="Chờ xét duyệt" value={stats.pending} icon={ClockIcon} color="bg-amber-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center">
                        Danh sách người dùng
                        {stats.pending > 0 && filterRole !== 'student' && (
                             <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-600 animate-pulse">
                                {stats.pending} chờ duyệt
                             </span>
                        )}
                    </h2>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <input 
                            type="text" 
                            placeholder="Tìm theo email hoặc tên..." 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none min-w-[250px]"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 overflow-x-auto">
                            {(['all', 'admin', 'teacher', 'student'] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setFilterRole(r)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                                        filterRole === r 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {r === 'all' ? 'Tất cả' : r === 'admin' ? 'Admin' : r === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 m-6 rounded-lg border border-red-100">
                        {error}
                    </div>
                )}

                {isLoadingData ? (
                    <div className="p-12">
                        <LoadingSpinner text="Đang tải dữ liệu..." />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Người dùng</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Vai trò</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className={`transition-colors ${u.status === 'pending' ? 'bg-amber-50 hover:bg-amber-100' : 'hover:bg-slate-50'}`}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg ${u.role === 'admin' ? 'bg-red-100 text-red-500' : 'bg-slate-100 text-slate-400'}`}>
                                                    {u.role === 'admin' ? <ShieldCheckIcon className="h-6 w-6" /> : (u.full_name ? u.full_name.charAt(0).toUpperCase() : <UserCircleIcon className="h-6 w-6" />)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-slate-800">{u.email}</div>
                                                    <div className="text-xs text-slate-500">{u.full_name || 'Chưa cập nhật tên'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                {u.role === 'teacher' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                                                        <PencilSquareIcon className="w-3 h-3 mr-1.5" /> Giáo viên
                                                    </span>
                                                ) : u.role === 'admin' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                                                        <ShieldCheckIcon className="w-3 h-3 mr-1.5" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700 border border-sky-200">
                                                        <AcademicCapIcon className="w-3 h-3 mr-1.5" /> Học sinh
                                                    </span>
                                                )}
                                                
                                                {/* Role Switcher (Hidden for self) */}
                                                {u.id !== user?.id && (
                                                    <div className="group relative ml-2">
                                                        <button className="text-slate-400 hover:text-brand-blue">
                                                            <BriefcaseIcon className="w-4 h-4" />
                                                        </button>
                                                        <div className="hidden group-hover:block absolute left-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 z-10 p-1">
                                                            <div className="text-[10px] text-slate-400 uppercase font-bold px-2 py-1">Đổi vai trò</div>
                                                            <button onClick={() => handleUpdateRole(u.id, 'student')} className="block w-full text-left px-2 py-1.5 text-xs text-slate-700 hover:bg-slate-100 rounded">Học sinh</button>
                                                            <button onClick={() => handleUpdateRole(u.id, 'teacher')} className="block w-full text-left px-2 py-1.5 text-xs text-purple-700 hover:bg-purple-50 rounded">Giáo viên</button>
                                                            <button onClick={() => handleUpdateRole(u.id, 'admin')} className="block w-full text-left px-2 py-1.5 text-xs text-red-700 hover:bg-red-50 rounded font-bold">Admin</button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {u.status === 'active' && <span className="text-xs font-bold text-green-600">Hoạt động</span>}
                                            {u.status === 'pending' && <span className="text-xs font-bold text-amber-600">Chờ duyệt</span>}
                                            {u.status === 'blocked' && <span className="text-xs font-bold text-red-600">Đã khóa</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {/* Không cho phép tự khóa/xóa chính mình */}
                                            {u.id !== user?.id && (
                                                <div className="flex justify-end space-x-2">
                                                    {u.status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, 'active')}
                                                            className="flex items-center text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold border border-green-200"
                                                        >
                                                            <CheckCircleIcon className="w-4 h-4 mr-1" /> Duyệt
                                                        </button>
                                                    )}
                                                    {u.status === 'blocked' ? (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, 'active')}
                                                            className="flex items-center text-sky-700 bg-sky-100 hover:bg-sky-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
                                                        >
                                                            <KeyIcon className="w-4 h-4 mr-1" /> Mở
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, 'blocked')}
                                                            className="flex items-center text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
                                                        >
                                                            <XCircleIcon className="w-4 h-4 mr-1" /> Khóa
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                                            Không tìm thấy người dùng nào phù hợp với bộ lọc.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
