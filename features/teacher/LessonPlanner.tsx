import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { generateLessonPlan } from '../../services/geminiService';
import type { LessonPlan } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { DocumentTextIcon, ClockIcon } from '../../components/icons';

const LessonPlanner: React.FC = () => {
    const { navigate } = useNavigation();
    const [subject, setSubject] = useState('');
    const [grade, setGrade] = useState('');
    const [topic, setTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setLessonPlan(null);

        try {
            const result = await generateLessonPlan(subject, grade, topic);
            setLessonPlan(result);
        } catch (err) {
            setError("Không thể tạo giáo án. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto max-w-5xl">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Soạn giáo án AI' }]} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                                <DocumentTextIcon className="h-6 w-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-800">Thông tin bài dạy</h2>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Môn học</label>
                                <select 
                                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                >
                                    <option value="">Chọn môn...</option>
                                    <option value="Toán học">Toán học</option>
                                    <option value="Ngữ văn">Ngữ văn</option>
                                    <option value="Tiếng Anh">Tiếng Anh</option>
                                    <option value="Vật lý">Vật lý</option>
                                    <option value="Hóa học">Hóa học</option>
                                    <option value="Sinh học">Sinh học</option>
                                    <option value="Lịch sử">Lịch sử</option>
                                    <option value="Địa lý">Địa lý</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Lớp</label>
                                <select 
                                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                    required
                                >
                                    <option value="">Chọn lớp...</option>
                                    <option value="Lớp 6">Lớp 6</option>
                                    <option value="Lớp 7">Lớp 7</option>
                                    <option value="Lớp 8">Lớp 8</option>
                                    <option value="Lớp 9">Lớp 9</option>
                                    <option value="Lớp 10">Lớp 10</option>
                                    <option value="Lớp 11">Lớp 11</option>
                                    <option value="Lớp 12">Lớp 12</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Tên bài / Chủ đề</label>
                                <input 
                                    type="text"
                                    className="w-full rounded-lg border-slate-300 border p-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="VD: Phương trình bậc hai..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    required
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition-colors disabled:bg-slate-300 mt-4"
                            >
                                {isLoading ? 'Đang tạo...' : 'Tạo giáo án'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Result Display */}
                <div className="lg:col-span-2">
                    {isLoading && <LoadingSpinner text="AI đang soạn giáo án..." subText="Đang thiết kế các hoạt động học tập..." color="amber" />}
                    
                    {error && (
                        <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                            {error}
                        </div>
                    )}

                    {!isLoading && !lessonPlan && !error && (
                        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center h-full flex flex-col justify-center items-center text-slate-400">
                            <DocumentTextIcon className="h-16 w-16 mb-4 opacity-50" />
                            <p>Nhập thông tin và nhấn "Tạo giáo án" để bắt đầu.</p>
                        </div>
                    )}

                    {lessonPlan && (
                        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                            <div className="bg-purple-600 p-6 text-white">
                                <h2 className="text-2xl font-bold">{lessonPlan.topic}</h2>
                                <p className="opacity-90 mt-1">{lessonPlan.grade} | Môn {subject}</p>
                            </div>
                            <div className="p-8 space-y-8">
                                <section>
                                    <h3 className="text-lg font-bold text-purple-700 mb-3 border-b border-purple-100 pb-2">I. MỤC TIÊU</h3>
                                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                                        {lessonPlan.objectives.map((obj, i) => (
                                            <li key={i}>{obj}</li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-purple-700 mb-3 border-b border-purple-100 pb-2">II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU</h3>
                                    <ul className="list-disc list-inside space-y-2 text-slate-700">
                                        {lessonPlan.materials.map((mat, i) => (
                                            <li key={i}>{mat}</li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-lg font-bold text-purple-700 mb-4 border-b border-purple-100 pb-2">III. TIẾN TRÌNH DẠY HỌC</h3>
                                    <div className="space-y-6">
                                        {lessonPlan.activities.map((act, i) => (
                                            <div key={i} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-bold text-slate-800 text-lg">{act.title}</h4>
                                                    <span className="flex items-center text-xs font-semibold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500">
                                                        <ClockIcon className="h-3 w-3 mr-1" />
                                                        {act.time}
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 whitespace-pre-line leading-relaxed">{act.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                                
                                <section>
                                    <h3 className="text-lg font-bold text-purple-700 mb-3 border-b border-purple-100 pb-2">IV. HƯỚNG DẪN VỀ NHÀ</h3>
                                    <p className="text-slate-700">{lessonPlan.homework}</p>
                                </section>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonPlanner;