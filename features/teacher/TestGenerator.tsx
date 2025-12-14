
import React, { useState, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { generateTestFromMatrix } from '../../services/geminiService';
import type { Quiz } from '../../types/index';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { 
    PencilSquareIcon, 
    CloudArrowUpIcon, 
    CheckCircleIcon, 
    ArrowDownTrayIcon, 
    EyeIcon,
    ArrowLeftIcon,
    DocumentTextIcon
} from '../../components/icons';

const SUBJECTS_LIST = [
    "Toán học", "Ngữ văn", "Tiếng Anh", "Khoa học tự nhiên", 
    "Lịch sử và Địa lí", "Giáo dục công dân", "Tin học", 
    "Công nghệ", "Nghệ thuật", "Giáo dục thể chất"
];

const GRADES = ["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9"];

interface FileUploadState {
    name: string | null;
    status: 'idle' | 'uploading' | 'done';
}

const FileUploadCard: React.FC<{
    title: string;
    description: string;
    fileState: FileUploadState;
    onUpload: (file: File) => void;
    accept?: string;
}> = ({ title, description, fileState, onUpload, accept = ".doc,.docx,.xls,.xlsx,.pdf" }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 h-full ${
                fileState.status === 'done' 
                ? 'border-green-300 bg-green-50' 
                : 'border-slate-300 hover:border-brand-blue hover:bg-slate-50'
            }`}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept={accept}
                onChange={handleFileChange}
            />
            
            {fileState.status === 'done' ? (
                <>
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <CheckCircleIcon className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="font-semibold text-green-800 text-sm line-clamp-1 break-all px-2">{fileState.name}</p>
                    <p className="text-green-600 text-xs mt-1">Đã tải lên thành công. Nhấn để thay đổi.</p>
                </>
            ) : (
                <>
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                        {fileState.status === 'uploading' ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-blue"></div>
                        ) : (
                            <CloudArrowUpIcon className="h-6 w-6" />
                        )}
                    </div>
                    <p className="font-semibold text-slate-700 text-sm mb-1">{title}</p>
                    <p className="text-slate-400 text-xs">{description}</p>
                </>
            )}
        </div>
    );
};

const TestGenerator: React.FC = () => {
    const { navigate } = useNavigation();
    
    // Form State
    const [subject, setSubject] = useState(SUBJECTS_LIST[0]);
    const [grade, setGrade] = useState(GRADES[0]);

    // File States
    const [matrixFile, setMatrixFile] = useState<FileUploadState>({ name: null, status: 'idle' });
    const [specFile, setSpecFile] = useState<FileUploadState>({ name: null, status: 'idle' });

    // Process State
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<Quiz | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileUpload = (setter: React.Dispatch<React.SetStateAction<FileUploadState>>) => (file: File) => {
        // Simulate upload
        setter({ name: file.name, status: 'uploading' });
        setTimeout(() => {
            setter({ name: file.name, status: 'done' });
        }, 1500);
    };

    const handleGenerate = async () => {
        if (!subject || !grade) return;
        
        setIsGenerating(true);
        setError(null);
        setResult(null);

        try {
            const quiz = await generateTestFromMatrix(
                subject, 
                grade, 
                matrixFile.name, 
                specFile.name
            );
            setResult(quiz);
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra khi tạo đề kiểm tra.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!result) return;
        // Mock download docx content
        const textContent = `
ĐỀ KIỂM TRA: ${result.title.toUpperCase()}
Môn: ${subject} - ${grade}
Thời gian: ${result.timeLimit}
Trường: ${result.sourceSchool}
--------------------------------------------------

I. TRẮC NGHIỆM KHÁCH QUAN
${result.questions.map((q, i) => `
Câu ${i + 1}: ${q.question}
A. ${q.options[0]}
B. ${q.options[1]}
C. ${q.options[2]}
D. ${q.options[3]}
`).join('\n')}

II. TỰ LUẬN
${result.essayQuestions?.map((q, i) => `
Câu ${i + 1}: ${q.question}
`).join('\n')}

--------------------------------------------------
HƯỚNG DẪN CHẤM VÀ ĐÁP ÁN

I. TRẮC NGHIỆM
${result.questions.map((q, i) => `${i + 1}. ${q.correctAnswer} (${q.explanation})`).join('\n')}

II. TỰ LUẬN
${result.essayQuestions?.map((q, i) => `Câu ${i + 1}: ${q.sampleAnswer}`).join('\n')}
        `;
        
        const blob = new Blob([textContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `De_Kiem_Tra_${subject}_${grade}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (isGenerating) {
        return (
            <div className="container mx-auto max-w-5xl h-screen flex flex-col justify-center items-center">
                <LoadingSpinner text="Đang phân tích Ma trận & Đặc tả..." subText="Hệ thống đang xây dựng câu hỏi bám sát 4 mức độ nhận thức..." color="amber" />
            </div>
        );
    }

    if (result) {
        return (
            <div className="container mx-auto max-w-5xl py-8 px-4">
                <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden text-center p-12 animate-scale-in">
                    <div className="mx-auto h-24 w-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircleIcon className="h-12 w-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-800 mb-2">Tạo đề thành công!</h2>
                    <p className="text-slate-500 mb-8 max-w-2xl mx-auto">
                        Đề kiểm tra <strong>"{result.title}"</strong> đã được tạo dựa trên ma trận bạn cung cấp.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button 
                            onClick={handleDownload}
                            className="flex items-center justify-center px-8 py-3 bg-brand-blue text-white rounded-xl font-bold hover:bg-brand-blue-dark transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                            Tải về .docx
                        </button>
                        <button 
                            onClick={() => setResult(null)} 
                            className="flex items-center justify-center px-8 py-3 bg-white text-slate-700 border border-slate-300 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeftIcon className="h-5 w-5 mr-2" />
                            Tạo đề khác
                        </button>
                    </div>

                    {/* Preview Area */}
                    <div className="mt-12 text-left bg-slate-50 rounded-xl border border-slate-200 p-8 max-h-[500px] overflow-y-auto shadow-inner">
                        <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-4">
                            <EyeIcon className="h-5 w-5 text-slate-400" />
                            <span className="font-bold text-slate-500 uppercase text-sm">Xem trước nội dung</span>
                        </div>
                        <div className="prose max-w-none text-slate-700">
                            <h3 className="text-center font-bold text-lg mb-1">{result.sourceSchool.toUpperCase()}</h3>
                            <h4 className="text-center font-bold text-xl mb-4">{result.title.toUpperCase()}</h4>
                            <p className="text-center italic mb-6">Môn: {subject} - Thời gian: {result.timeLimit}</p>
                            
                            <h5 className="font-bold text-brand-blue border-b border-slate-300 pb-2 mb-4">I. TRẮC NGHIỆM</h5>
                            <div className="space-y-6">
                                {result.questions.map((q, i) => (
                                    <div key={i}>
                                        <p className="font-semibold text-slate-900">Câu {i + 1}: {q.question}</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 ml-4">
                                            {q.options.map((opt, idx) => (
                                                <div key={idx} className="text-slate-600">
                                                    <span className="font-bold">{String.fromCharCode(65 + idx)}.</span> {opt}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {result.essayQuestions && result.essayQuestions.length > 0 && (
                                <>
                                    <h5 className="font-bold text-brand-blue border-b border-slate-300 pb-2 mb-4 mt-8">II. TỰ LUẬN</h5>
                                    <div className="space-y-6">
                                        {result.essayQuestions.map((q, i) => (
                                            <div key={i}>
                                                <p className="font-semibold text-slate-900">Câu {i + 1}: {q.question}</p>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-6xl pb-20">
            <Breadcrumb items={[{ label: 'Công cụ giảng dạy', onClick: () => navigate('teacher-dashboard') }, { label: 'Tạo đề kiểm tra' }]} />

            {/* Header Banner */}
            <div className="bg-gradient-to-r from-sky-600 to-brand-blue rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2 flex items-center">
                        <PencilSquareIcon className="h-8 w-8 mr-3 text-brand-yellow" />
                        TẠO ĐỀ KIỂM TRA
                    </h1>
                    <p className="text-blue-100 text-lg">Xây dựng đề thi chuẩn cấu trúc từ Ma trận & Đặc tả</p>
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Input Config */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Section 1: Test Info */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center mb-6 border-l-4 border-brand-blue pl-4">
                            <h2 className="text-xl font-bold text-slate-800">Thông tin chung</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Môn học</label>
                                <select 
                                    className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue bg-slate-50"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                >
                                    {SUBJECTS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Khối lớp</label>
                                <select 
                                    className="w-full rounded-lg border-slate-300 border px-3 py-2.5 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue bg-slate-50"
                                    value={grade}
                                    onChange={(e) => setGrade(e.target.value)}
                                >
                                    {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Input Materials */}
                    <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex items-center mb-6 border-l-4 border-brand-blue pl-4">
                            <h2 className="text-xl font-bold text-slate-800">Cấu trúc đề thi</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-1 h-48">
                                <FileUploadCard 
                                    title="File Ma trận đề (Bắt buộc)" 
                                    description="Tải lên file Excel/Word chứa khung ma trận."
                                    fileState={matrixFile}
                                    onUpload={handleFileUpload(setMatrixFile)}
                                />
                            </div>
                            <div className="md:col-span-1 h-48">
                                <FileUploadCard 
                                    title="File Bản đặc tả (Tuỳ chọn)" 
                                    description="Giúp AI hiểu rõ yêu cầu chi tiết từng câu hỏi."
                                    fileState={specFile}
                                    onUpload={handleFileUpload(setSpecFile)}
                                />
                            </div>
                        </div>
                    </section>

                    <button 
                        onClick={handleGenerate}
                        disabled={!matrixFile.name}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center ${
                            !matrixFile.name 
                            ? 'bg-slate-300 text-slate-500 cursor-not-allowed' 
                            : 'bg-brand-blue hover:bg-brand-blue-dark text-white hover:shadow-xl hover:-translate-y-1'
                        }`}
                    >
                        <PencilSquareIcon className="h-6 w-6 mr-2" />
                        TẠO ĐỀ KIỂM TRA
                    </button>
                </div>

                {/* Right Column: Instructions & Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-brand-blue" />
                            Quy trình chuẩn
                        </h3>
                        <ul className="space-y-4 text-sm text-slate-600">
                            <li className="flex items-start">
                                <span className="bg-slate-100 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold text-slate-700">1</span>
                                <span>AI phân tích file Ma trận để xác định số lượng câu hỏi và mức độ nhận thức (NB, TH, VD, VDC).</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-slate-100 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold text-slate-700">2</span>
                                <span>Đối chiếu với Bản đặc tả để xây dựng nội dung câu hỏi phù hợp với chuẩn kiến thức kĩ năng.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="bg-slate-100 rounded-full h-6 w-6 flex items-center justify-center mr-3 flex-shrink-0 text-xs font-bold text-slate-700">3</span>
                                <span>Xuất bản đề thi hoàn chỉnh kèm hướng dẫn chấm chi tiết.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200 text-yellow-800">
                        <h3 className="font-bold text-sm mb-2">Lưu ý về File tải lên</h3>
                        <p className="text-xs mb-2">Hệ thống hỗ trợ tốt nhất các định dạng .docx và .xlsx.</p>
                        <p className="text-xs">
                            Để AI hoạt động chính xác nhất, vui lòng đặt tên file rõ ràng (VD: "Ma_tran_Toan_6_GK1.xlsx").
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestGenerator;
