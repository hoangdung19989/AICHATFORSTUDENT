import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import type { UserProfile } from '../../types/user';
import { CheckCircleIcon, XCircleIcon, UserCircleIcon, AcademicCapIcon, PencilSquareIcon, KeyIcon } from '../../components/icons';

const AdminDashboard: React.FC = () => {
    const { navigate } = useNavigation();
    const { user, profile } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRole, setFilterRole] = useState<'all' | 'teacher' | 'student'>('all');
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

    const filteredUsers = users.filter(u => filterRole === 'all' || u.role === filterRole);

    return (
        <div className="container mx-auto max-w-6xl">
            <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Quản trị hệ thống' }]} />

            <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Quản lý người dùng</h1>
                    <p className="text-slate-500 mt-1">Xét duyệt giáo viên và quản lý tài khoản.</p>
                </div>
                
                {/* Filter */}
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 mt-4 sm:mt-0 shadow-sm">
                    {(['all', 'teacher', 'student'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => setFilterRole(r)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                filterRole === r 
                                ? 'bg-sky-100 text-sky-700' 
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            {r === 'all' ? 'Tất cả' : r === 'teacher' ? 'Giáo viên' : 'Học sinh'}
                        </button>
                    ))}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100 mb-6">
                    {error}
                </div>
            )}

            {isLoading ? (
                <LoadingSpinner text="Đang tải danh sách..." />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                                                <div className="flex-shrink-0 h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                                    <UserCircleIcon className="h-6 w-6" />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-slate-900">{u.email}</div>
                                                    <div className="text-xs text-slate-500">{u.full_name || 'Chưa cập nhật tên'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {u.role === 'teacher' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        <PencilSquareIcon className="w-3 h-3 mr-1" /> Giáo viên
                                                    </span>
                                                ) : u.role === 'admin' ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                        <KeyIcon className="w-3 h-3 mr-1" /> Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                                                        <AcademicCapIcon className="w-3 h-3 mr-1" /> Học sinh
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {u.status === 'active' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Hoạt động
                                                </span>
                                            )}
                                            {u.status === 'pending' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 animate-pulse">
                                                    Chờ duyệt
                                                </span>
                                            )}
                                            {u.status === 'blocked' && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                    Đã khóa
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {u.role !== 'admin' && (
                                                <div className="flex justify-end space-x-2">
                                                    {u.status === 'pending' && (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, 'active')}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                                                            title="Duyệt tài khoản"
                                                        >
                                                            Duyệt
                                                        </button>
                                                    )}
                                                    {u.status === 'blocked' ? (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, 'active')}
                                                            className="text-sky-600 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-md transition-colors"
                                                        >
                                                            Mở khóa
                                                        </button>
                                                    ) : (
                                                        <button 
                                                            onClick={() => handleUpdateStatus(u.id, 'blocked')}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                                                            title="Khóa tài khoản"
                                                        >
                                                            Khóa
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
                                            Không tìm thấy người dùng nào.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;