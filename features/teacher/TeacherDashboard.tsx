import React from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { useAuth } from '../../contexts/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import FeatureCard from '../../components/common/FeatureCard';
import { PencilSquareIcon, DocumentTextIcon, UserCircleIcon, ChatBubbleBottomCenterTextIcon, ClockIcon } from '../../components/icons';

const TeacherDashboard: React.FC = () => {
  const { navigate } = useNavigation();
  const { profile, refreshProfile } = useAuth();

  const handleSelectTool = (title: string) => {
    switch (title) {
      case 'Soạn giáo án AI':
        navigate('lesson-planner');
        break;
      case 'Gia sư AI':
        navigate('ai-subjects');
        break;
      default:
        alert(`Chức năng "${title}" đang được phát triển.`);
    }
  };

  // Check if teacher is verified
  if (profile?.status === 'pending') {
      return (
          <div className="container mx-auto max-w-2xl text-center py-12">
               <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 shadow-sm">
                   <div className="flex justify-center mb-4">
                       <ClockIcon className="h-16 w-16 text-yellow-500" />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-800 mb-2">Tài khoản đang chờ xét duyệt</h2>
                   <p className="text-slate-600 mb-6">
                       Cảm ơn thầy/cô đã đăng ký tham gia OnLuyen AI. 
                       Để đảm bảo chất lượng, chúng tôi cần xác minh thông tin tài khoản Giáo viên.
                       <br/><br/>
                       Vui lòng chờ Admin phê duyệt. Quá trình này thường mất từ 1-24 giờ.
                   </p>
                   <button 
                    onClick={refreshProfile}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                   >
                       Kiểm tra lại trạng thái
                   </button>
               </div>
          </div>
      );
  }

  return (
    <div className="container mx-auto max-w-5xl">
      <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Công cụ giảng dạy' }]} />

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">
            Góc Giáo Viên
        </h1>
        <p className="text-slate-500 text-lg">
            Các công cụ AI hỗ trợ thầy cô tiết kiệm thời gian và nâng cao hiệu quả giảng dạy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FeatureCard
          title="Soạn giáo án AI"
          description="Tự động tạo kế hoạch bài dạy chi tiết theo công văn 5512 chỉ trong vài giây."
          icon={DocumentTextIcon}
          color="bg-purple-500"
          onClick={() => handleSelectTool('Soạn giáo án AI')}
        />
         <FeatureCard
          title="Tạo đề kiểm tra"
          description="Tạo nhanh ngân hàng câu hỏi trắc nghiệm và tự luận có đáp án chi tiết."
          icon={PencilSquareIcon}
          color="bg-sky-500"
           tags={['Sắp ra mắt']}
          onClick={() => handleSelectTool('Tạo đề kiểm tra')}
        />
        <FeatureCard
          title="Trợ lý Chuyên môn"
          description="Tra cứu kiến thức, tìm ý tưởng giảng dạy với trợ lý AI."
          icon={ChatBubbleBottomCenterTextIcon}
          color="bg-teal-500"
          onClick={() => handleSelectTool('Gia sư AI')}
        />
        <FeatureCard
          title="Quản lý lớp học"
          description="Theo dõi tiến độ học tập của học sinh."
          icon={UserCircleIcon}
          color="bg-orange-500"
          tags={['Sắp ra mắt']}
          onClick={() => handleSelectTool('Quản lý lớp học')}
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;