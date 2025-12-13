import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { AcademicCapIcon, RocketLaunchIcon, ChatBubbleBottomCenterTextIcon, PencilSquareIcon, DocumentTextIcon, ClockIcon } from '../icons';

const HomePage: React.FC = () => {
    const { user, profile } = useAuth();
    const { navigate } = useNavigation();

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'bạn';
    // Use profile role if available, else metadata
    const isTeacher = (profile?.role || user?.user_metadata?.role) === 'teacher';
    const isPending = profile?.status === 'pending';

    const FeatureButton: React.FC<{ icon: React.ElementType, title: string, description: string, onClick: () => void, disabled?: boolean }> = ({ icon: Icon, title, description, onClick, disabled }) => (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`text-left p-6 bg-white rounded-xl shadow-sm border border-slate-200 group transition-all duration-300 ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-lg hover:-translate-y-1'}`}
        >
            <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${disabled ? 'bg-slate-100 text-slate-400' : 'bg-sky-100 text-sky-600'}`}>
                    <Icon className="h-7 w-7" />
                </div>
                <div>
                    <h3 className={`text-lg font-bold ${disabled ? 'text-slate-500' : 'text-slate-800 group-hover:text-brand-blue-dark'}`}>{title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{description}</p>
                </div>
            </div>
        </button>
    );

    return (
        <div className="container mx-auto max-w-5xl">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <h1 className="text-3xl font-bold text-slate-800">
                    Chào mừng trở lại, {userName}!
                </h1>
                <p className="mt-2 text-slate-500 text-lg">
                    {isTeacher ? 'Chúc thầy/cô một ngày làm việc hiệu quả.' : 'Sẵn sàng để chinh phục những đỉnh cao kiến thức mới chưa?'}
                </p>
                {isTeacher && isPending && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center text-yellow-800">
                        <ClockIcon className="h-5 w-5 mr-2" />
                        <span>Tài khoản của thầy/cô đang chờ xét duyệt. Một số tính năng sẽ bị hạn chế.</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {!isTeacher && (
                    <>
                        <FeatureButton 
                            icon={AcademicCapIcon}
                            title="Trung tâm Tự học"
                            description="Khám phá bài giảng, tự luyện, kiểm tra và thi thử."
                            onClick={() => navigate('self-study')}
                        />
                        <FeatureButton 
                            icon={RocketLaunchIcon}
                            title="Lộ trình của tôi"
                            description="Xem lộ trình học tập được AI cá nhân hóa cho bạn."
                            onClick={() => navigate('personalized-dashboard')}
                        />
                    </>
                )}

                {isTeacher && (
                    <>
                         <FeatureButton 
                            icon={PencilSquareIcon}
                            title="Công cụ giảng dạy"
                            description="Các công cụ AI hỗ trợ soạn bài và đánh giá."
                            onClick={() => navigate('teacher-dashboard')}
                        />
                        <FeatureButton 
                            icon={DocumentTextIcon}
                            title="Soạn giáo án"
                            description={isPending ? "Cần xét duyệt tài khoản để sử dụng." : "Tạo kế hoạch bài dạy nhanh chóng với AI."}
                            onClick={() => navigate('lesson-planner')}
                            disabled={isPending}
                        />
                    </>
                )}

                 <FeatureButton 
                    icon={ChatBubbleBottomCenterTextIcon}
                    title={isTeacher ? "Trợ lý Chuyên môn" : "Gia sư AI"}
                    description={isTeacher ? "Tra cứu kiến thức và phương pháp giảng dạy." : "Hỏi đáp mọi thắc mắc về bài học."}
                    onClick={() => navigate('ai-subjects')}
                />
            </div>
        </div>
    );
};

export default HomePage;