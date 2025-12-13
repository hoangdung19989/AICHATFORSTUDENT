import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { generatePersonalizedLearningPath } from '../../services/geminiService';
// FIX: Corrected import path for types
import type { LearningPath, DailyTask } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CheckCircleIcon, VideoCameraIcon, PencilSquareIcon, RocketLaunchIcon } from '../../components/icons';

const PersonalizedDashboard: React.FC = () => {
    const { user } = useAuth();
    const { navigate } = useNavigation();
    const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeDay, setActiveDay] = useState<number>(new Date().getDay() || 7); // Sunday is 0, make it 7

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const fetchWeaknessesAndGeneratePath = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // 1. Fetch recent incorrect answers
                const { data: attempts, error: attemptsError } = await supabase
                    .from('question_attempts')
                    .select('question_topics')
                    .eq('user_id', user.id)
                    .eq('is_correct', false)
                    .order('created_at', { ascending: false })
                    .limit(50);

                if (attemptsError) throw attemptsError;

                // 2. Analyze weaknesses
                // FIX: Added safe guards for `attempts` and `question_topics` being null to prevent runtime errors and fix type inference.
                const topicCounts = (attempts || []).flatMap(a => a.question_topics || []).reduce((acc, topic) => {
                    if (topic) {
                        acc[topic] = (acc[topic] || 0) + 1;
                    }
                    return acc;
                }, {} as Record<string, number>);

                const sortedTopics = Object.entries(topicCounts)
                    // FIX: Wrapped sort values in Number() to ensure they are treated as numbers for the arithmetic operation.
                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                    .map(entry => entry[0]);
                
                const weakTopics = sortedTopics.slice(0, 3); // Get top 3 weaknesses

                if (weakTopics.length === 0) {
                     setLearningPath({ studentWeaknesses: [], weeklyPlan: [] }); // Set empty path
                     return;
                }

                // 3. Generate learning path
                // For now, hardcode grade as '9'. In a real app, this would come from user profile.
                const path = await generatePersonalizedLearningPath(weakTopics, '9');
                setLearningPath(path);

            } catch (err) {
                setError(err instanceof Error ? err.message : "Không thể tạo lộ trình học tập.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchWeaknessesAndGeneratePath();
    }, [user]);
    
    const activeTaskData = useMemo(() => {
        return learningPath?.weeklyPlan.find(d => d.day === activeDay);
    }, [learningPath, activeDay]);


    if (!user) {
        return (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                <h2 className="text-xl font-bold text-slate-700">Vui lòng đăng nhập</h2>
                <p className="text-slate-500 mt-2 mb-4">Bạn cần đăng nhập để AI có thể tạo lộ trình học tập cá nhân hóa.</p>
                <button onClick={() => navigate('login')} className="bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-500 transition-colors">
                    Đến trang Đăng nhập
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div>
                 <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Lộ trình của tôi' }]} />
                <LoadingSpinner 
                    text="AI đang phân tích và tạo lộ trình cho bạn..."
                    subText="Quá trình này có thể mất một chút thời gian."
                />
            </div>
        );
    }

    if (error) {
        return <div className="text-center text-red-500 p-8 bg-red-50 rounded-lg">{error}</div>;
    }
    
    if (!learningPath || learningPath.weeklyPlan.length === 0) {
         return (
            <div className="text-center p-8 bg-white rounded-xl shadow-sm">
                <RocketLaunchIcon className="mx-auto h-16 w-16 text-sky-500" />
                <h2 className="text-xl font-bold text-slate-700 mt-4">Chưa có dữ liệu để phân tích!</h2>
                <p className="text-slate-500 mt-2 mb-4">Hãy bắt đầu làm các bài Tự luyện hoặc Kiểm tra để AI có thể xác định điểm yếu và tạo lộ trình phù hợp cho bạn.</p>
                <button onClick={() => navigate('self-study')} className="bg-sky-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-sky-500 transition-colors">
                    Bắt đầu Tự học
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl">
            <Breadcrumb items={[{ label: 'Trang chủ', onClick: () => navigate('home') }, { label: 'Lộ trình của tôi' }]} />

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Lộ trình học tập tuần này</h1>
                <p className="mt-2 text-slate-500">AI đã phân tích và xác định các chủ đề bạn cần cải thiện:</p>
                <div className="flex flex-wrap gap-2 mt-3">
                    {learningPath.studentWeaknesses.map(topic => (
                        <span key={topic} className="px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">{topic}</span>
                    ))}
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Day Selection */}
                <div className="lg:w-1/3">
                    <h2 className="font-bold text-slate-700 mb-4">Kế hoạch tuần</h2>
                    <div className="space-y-2">
                        {learningPath.weeklyPlan.map(dayPlan => (
                             <button 
                                key={dayPlan.day}
                                onClick={() => setActiveDay(dayPlan.day)}
                                className={`w-full text-left p-4 rounded-lg transition-all duration-200 flex items-start space-x-4 ${activeDay === dayPlan.day ? 'bg-sky-100 border-sky-300 shadow-sm' : 'bg-white hover:bg-slate-50 border-transparent'} border`}
                            >
                                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg ${activeDay === dayPlan.day ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                    T{dayPlan.day + 1}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{dayPlan.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2">{dayPlan.description}</p>
                                </div>
                             </button>
                        ))}
                    </div>
                </div>

                {/* Task Details */}
                <div className="lg:w-2/3">
                     <h2 className="font-bold text-slate-700 mb-4">Nhiệm vụ hôm nay</h2>
                     {activeTaskData ? (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                            {activeTaskData.tasks.map((task, index) => (
                                <div key={index} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-lg">
                                    <div className="flex-shrink-0 text-sky-500">
                                        {task.type === 'video' ? <VideoCameraIcon className="h-6 w-6" /> : <PencilSquareIcon className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700">{task.content}</p>
                                        {task.difficulty && (
                                            <span className={`mt-1 inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                                task.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                                task.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {task.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <div className="ml-auto flex-shrink-0">
                                        <button className="p-2 text-slate-400 hover:text-green-500">
                                             <CheckCircleIcon className="h-6 w-6" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     ) : (
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 text-center">
                            <p className="text-slate-500">Chọn một ngày để xem nhiệm vụ chi tiết.</p>
                        </div>
                     )}
                </div>
            </div>
        </div>
    );
};

export default PersonalizedDashboard;