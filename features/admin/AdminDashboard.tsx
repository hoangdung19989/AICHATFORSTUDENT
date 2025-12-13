
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
    ShieldCheckIcon
} from '../../components/icons';

const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
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
    const { profile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<'all' | 'teacher' | 'student'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [error, setError] = useState<string | null>(null);

    // Fetch all users
    const fetchUsers = async () => {
        setIsLoading(true);
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
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (profile?.role === 'admin') {
            fetchUsers();
        } else {
            // Redirect if not admin (client-side protection)
            navigate('home');
        }
    }, [profile, navigate]);

    const handleUpdateStatus = async (userId: string, newStatus: 'active' | 'blocked') => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ status: newStatus })
                .eq('id', userId);

            if (error) throw error;

            // Optimistic update
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (err: any) {
            alert(`Lỗi cập nhật: ${err.message}`);
        }
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
            pending: users.filter(u => u.status === 'pending').length,
            blocked: users.filter(u => u.status === 'blocked').length
        };
    }, [users]);

    return (
        <div className="container mx-auto max-w-6xl pb-10">
            <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Quản trị hệ thống' }]} />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Tổng quan Hệ thống</h1>
                <p className="text-slate-500 mt-1">Quản lý người dùng và xét duyệt quyền truy cập.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Tổng người dùng" value={stats.total} icon={UserGroupIcon} color="bg-blue-500" />
                <StatCard title="Giáo viên chờ duyệt" value={stats.pending} icon={ClockIcon} color="bg-amber-500" />
                <StatCard title="Giáo viên hoạt động" value={stats.teachers - stats.pending} icon={PencilSquareIcon} color="bg-purple-500" />
                <StatCard title="Học sinh" value={stats.students} icon={AcademicCapIcon} color="bg-green-500" />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-800">Danh sách người dùng</h2>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        {/* Search */}
                        <input 
                            type="text" 
                            placeholder="Tìm theo email hoặc tên..." 
                            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />

                        {/* Filter Buttons */}
                        <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200">
                            {(['all', 'teacher', 'student'] as const).map((r) => (
                                <button
                                    key={r}
                                    onClick={() => setFilterRole(r)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                                        filterRole === r 
                                        ? 'bg-white text-slate-800 shadow-sm' 
                                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {r === 'all' ? 'Tất cả' : r === 'teacher' ? 'Giáo viên' : 'Học sinh'}
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

                {isLoading ? (
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
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-lg">
                                                    {u.full_name ? u.full_name.charAt(0).toUpperCase() : <UserCircleIcon className="h-6 w-6" />}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-slate-800">{u.email}</div>
                                                    <div className="text-xs text-slate-500">{u.full_name || 'Chưa cập nhật tên'}</div>
                                                    <div className="text-xs text-slate-400 mt-0.5">ID: {u.id.slice(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
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
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {u.status === 'active' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Hoạt động
                                                </span>
                                            )}
                                            {u.status === 'pending' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                                    <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span> Chờ duyệt
                                                </span>
                                            )}
                                            {u.status === 'blocked' && (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-300">
                                                    <span className="w-2 h-2 bg-slate-500 rounded-full mr-2"></span> Đã khóa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {u.role !== 'admin' && (
                                                <div className="flex justify-end space-x-2">
                                                    {u.status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, 'active')}
                                                            className="flex items-center text-green-700 bg-green-100 hover:bg-green-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
                                                            title="Duyệt tài khoản"
                                                        >
                                                            <CheckCircleIcon className="w-4 h-4 mr-1" /> Duyệt
                                                        </button>
                                                    )}
                                                    {u.status === 'blocked' ? (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, 'active')}
                                                            className="flex items-center text-sky-700 bg-sky-100 hover:bg-sky-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
                                                        >
                                                            <KeyIcon className="w-4 h-4 mr-1" /> Mở khóa
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, 'blocked')}
                                                            className="flex items-center text-red-700 bg-red-100 hover:bg-red-200 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
                                                            title="Khóa tài khoản"
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
