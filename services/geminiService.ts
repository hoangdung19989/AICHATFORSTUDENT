import { GoogleGenAI, Type } from "@google/genai";
// FIX: Corrected import path for types
import type { Subject, Quiz, TestType, LearningPath, LessonPlan } from '../types/index';
import { API_KEYS } from '../config';

const GEMINI_API_KEY = (API_KEYS.GEMINI_API_KEY && API_KEYS.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY_HERE')
  ? API_KEYS.GEMINI_API_KEY
  : ((import.meta as any).env?.VITE_API_KEY || process.env.API_KEY);

if (!GEMINI_API_KEY) {
  console.error("CRITICAL ERROR: API_KEY is missing. Please set it in config.ts or in Vercel Environment Variables (VITE_API_KEY).");
}

// FIX: Renamed geminiAI to ai to align with coding guidelines.
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY || 'MISSING_API_KEY' });

const handleGeminiError = (error: any, context: string): never => {
    console.error(`Gemini API call failed during ${context}:`, error);
    const errorMessage = error.toString().toLowerCase();
    
    if (errorMessage.includes('429') || errorMessage.includes('resource_exhausted') || errorMessage.includes('quota')) {
        throw new Error("Hệ thống đang quá tải (Hết lượt dùng miễn phí Google AI). Vui lòng thử lại sau vài phút hoặc sử dụng API Key khác.");
    }
    if (errorMessage.includes('400') || errorMessage.includes('invalid_argument') || errorMessage.includes('api key not valid')) {
        throw new Error("API Key không hợp lệ. Vui lòng kiểm tra lại Key trong file config.ts hoặc trong cấu hình Vercel (VITE_API_KEY).");
    }
    if (error instanceof Error) {
        throw new Error(error.message);
    }
    throw new Error("Đã xảy ra lỗi kết nối không xác định. Vui lòng thử lại.");
};

const getSystemInstruction = (subjectName: string): string => {
  return `You are a world-class, friendly, and patient tutor for Vietnamese high school students. 
Your subject of expertise is ${subjectName}. 
Explain concepts clearly, concisely, and in Vietnamese. 
Use examples and analogies relevant to a student's life. 
When asked to solve a problem, break it down into simple, easy-to-follow steps. 
Maintain a positive and encouraging tone. 
Format your responses using Markdown for better readability, including code blocks for formulas or code when appropriate.`;
};

const getGenericSystemInstruction = (): string => {
  return `You are a helpful and friendly AI tutor for Vietnamese students. 
You can answer questions on a wide range of subjects like Math, Physics, Chemistry, English, Literature, and Programming. 
Explain concepts clearly, concisely, and in Vietnamese. 
Use examples relevant to a student's life. 
Maintain a positive and encouraging tone. 
Format your responses using Markdown for better readability, including code blocks for formulas or code when appropriate.`;
};

export const getTutorResponse = async (subject: Subject, prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: getSystemInstruction(subject.name), temperature: 0.7, topP: 0.95 },
    });
    return response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        return "⚠️ Hệ thống đang quá tải (Hết lượt dùng miễn phí). Vui lòng đợi vài phút.";
    }
    return "Rất tiếc, đã có lỗi xảy ra khi kết nối với AI. Vui lòng kiểm tra mạng hoặc thử lại sau.";
  }
};

export const getGenericTutorResponse = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { systemInstruction: getGenericSystemInstruction(), temperature: 0.7, topP: 0.95 },
    });
    return response.text || "Xin lỗi, tôi không thể trả lời lúc này.";
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        return "⚠️ Hệ thống đang quá tải (Hết lượt dùng miễn phí). Vui lòng đợi vài phút.";
    }
    return "Rất tiếc, đã có lỗi xảy ra khi kết nối với AI.";
  }
};

export const generateQuiz = async (subjectName: string, gradeName: string, testType: TestType): Promise<Quiz> => {
    try {
        const isEnglishSubject = subjectName.toLowerCase().includes('tiếng anh') || subjectName.toLowerCase().includes('english');
        const languageInstruction = isEnglishSubject 
            ? "QUAN TRỌNG: Đây là môn Tiếng Anh. Nội dung câu hỏi (question), các lựa chọn (options) và đề bài tự luận PHẢI VIẾT BẰNG TIẾNG ANH. Tuy nhiên, phần giải thích (explanation) hãy viết bằng TIẾNG VIỆT để học sinh hiểu bài."
            : "Nội dung 100% Tiếng Việt.";

        let typeSpecificInstruction = "";
        if (testType.id === '15-minute') {
            typeSpecificInstruction = `- Đây là bài KIỂM TRA 15 PHÚT.\n- Số lượng: ${testType.questionCount} câu TRẮC NGHIỆM.\n- KHÔNG có tự luận.\n- Nội dung: Tập trung vào 1-2 bài học gần nhất trong chương trình, kiểm tra mức độ Nhận biết và Thông hiểu.`;
        } else if (testType.id === '45-minute') {
            typeSpecificInstruction = `- Đây là bài KIỂM TRA 1 TIẾT (45 phút).\n- Số lượng: ${testType.questionCount} câu TRẮC NGHIỆM và ${testType.essayCount} câu TỰ LUẬN.\n- Phân hóa: 40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao.\n- Nội dung: Tổng hợp kiến thức của cả chương vừa học.`;
        } else if (testType.id === 'semester') {
            typeSpecificInstruction = `- Đây là bài THI HỌC KỲ (Cuối kỳ).\n- Số lượng: ${testType.questionCount} câu TRẮC NGHIỆM và ${testType.essayCount} câu TỰ LUẬN.\n- Độ khó: Cao. Bao phủ toàn bộ kiến thức học kỳ.\n- Cấu trúc đề thi chuẩn của Bộ Giáo dục.`;
        }

        const quizGenerationPrompt = `Bạn là giáo viên giỏi. Hãy soạn đề "${testType.name}" môn "${subjectName}" lớp "${gradeName}".\n\nYêu cầu cấu trúc:\n${typeSpecificInstruction}\n\nYêu cầu chung:\n1. **Nguồn đề**: Chọn ngẫu nhiên tên một trường THCS/THPT uy tín tại Việt Nam để điền vào "sourceSchool".\n2. **Trắc nghiệm**: Mỗi câu có 4 đáp án, chỉ 1 đúng. Giải thích chi tiết.\n   - **QUAN TRỌNG**: Các chuỗi trong mảng "options" CHỈ chứa nội dung câu trả lời, KHÔNG ĐƯỢC chứa các ký tự tiền tố như "A.", "B.", "C.", "D." hay số thứ tự. Ví dụ: Viết "5 cm" thay vì "A. 5 cm".\n3. **Chủ đề (Topics)**: Với mỗi câu hỏi, hãy gắn 1-3 thẻ chủ đề kiến thức cụ thể (Ví dụ: "Phân số", "Hình học phẳng", "Từ vựng Unit 1") vào trường "topics". Điều này rất quan trọng để phân tích điểm yếu học sinh.\n4. **Tự luận** (Nếu có): Yêu cầu vận dụng, giải bài tập hoặc viết đoạn văn (với môn Văn/Anh). Cung cấp đáp án mẫu chi tiết.\n5. ${languageInstruction}\n6. Xuất ra JSON hợp lệ.`;

        // FIX: Standardized variable name to 'response' to avoid reference errors.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: quizGenerationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        sourceSchool: { type: Type.STRING, description: "Tên trường học." },
                        title: { type: Type.STRING, description: "Tiêu đề bài kiểm tra (VD: Kiểm tra 1 tiết Toán 7)." },
                        timeLimit: { type: Type.STRING, description: "Thời gian làm bài (VD: 45 phút)." },
                        questions: { type: Type.ARRAY, description: "Danh sách câu hỏi trắc nghiệm", items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING }, topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các chủ đề kiến thức liên quan đến câu hỏi này." } }, required: ["question", "options", "correctAnswer", "explanation"] } },
                        essayQuestions: { type: Type.ARRAY, description: "Danh sách câu hỏi tự luận (nếu có)", items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, sampleAnswer: { type: Type.STRING, description: "Hướng dẫn giải" } }, required: ["question", "sampleAnswer"] } }
                    },
                    required: ["sourceSchool", "questions", "title", "timeLimit"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        const quizData: Quiz = JSON.parse(jsonText);

        if (!quizData.sourceSchool || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("Dữ liệu bài kiểm tra do AI tạo ra không hợp lệ.");
        }
        return quizData;
    } catch (error) {
        handleGeminiError(error, "generateQuiz");
    }
};

export const generateMockExam = async (subjectName: string, gradeName: string): Promise<Quiz> => {
    try {
        const isEnglishSubject = subjectName.toLowerCase().includes('tiếng anh') || subjectName.toLowerCase().includes('english');
        const languageInstruction = isEnglishSubject 
            ? "QUAN TRỌNG: Đây là đề thi môn Tiếng Anh. Tất cả câu hỏi, đáp án, bài đọc hiểu, và đề bài viết luận PHẢI BẰNG TIẾNG ANH chuẩn ngữ pháp. Chỉ phần giải thích (explanation) là viết bằng TIẾNG VIỆT."
            : "Ngôn ngữ: Tiếng Việt.";

        const quizGenerationPrompt = `Bạn là chuyên gia ra đề thi. Hãy soạn một ĐỀ THI THỬ (Mock Exam) chuẩn cấu trúc cho môn "${subjectName}" lớp "${gradeName}".\n\nYêu cầu cụ thể:\n1. **Phần 1: Trắc nghiệm**: Tạo **30 câu hỏi** trắc nghiệm. Phân hóa: 40% Nhận biết, 30% Thông hiểu, 20% Vận dụng, 10% Vận dụng cao.\n   - **QUAN TRỌNG**: Các chuỗi trong mảng "options" CHỈ chứa nội dung câu trả lời, KHÔNG ĐƯỢC chứa các ký tự tiền tố như "A.", "B.", "C.", "D." hay số thứ tự. Ví dụ: Viết "5 cm" thay vì "A. 5 cm".\n2. **Phần 2: Tự luận**: Tạo **3 câu hỏi** tự luận (bài tập lớn, bài văn, hoặc câu hỏi giải thích sâu).\n3. **Nguồn đề**: Chọn ngẫu nhiên tên một trường Chuyên hoặc trường điểm uy tín tại Việt Nam (Ví dụ: THPT Chuyên Hà Nội - Amsterdam, THPT Chuyên Lam Sơn - Thanh Hóa, THPT Chuyên Trần Đại Nghĩa - TP.HCM, THCS & THPT Nguyễn Tất Thành, v.v.) để làm phong phú nguồn đề.\n4. **Chủ đề (Topics)**: Gắn thẻ chủ đề chi tiết cho từng câu hỏi (VD: "Đại số", "Phương trình", "Từ vựng").\n5. Xuất ra định dạng JSON chuẩn.\n6. ${languageInstruction}\n7. Giải thích (explanation) và Đáp án mẫu (sampleAnswer) phải cực kỳ chi tiết, giúp học sinh hiểu bản chất vấn đề.`;

        // FIX: Standardized variable name to 'response' to avoid reference errors.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: quizGenerationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        sourceSchool: { type: Type.STRING, description: "Tên trường học thực tế tại Việt Nam (ngẫu nhiên)." },
                        title: { type: Type.STRING, description: "Tiêu đề (VD: Đề thi thử vào 10)." },
                        timeLimit: { type: Type.STRING, description: "Thời gian làm bài." },
                        questions: { type: Type.ARRAY, description: "Danh sách câu hỏi trắc nghiệm", items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING }, topics: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các chủ đề kiến thức liên quan." } }, required: ["question", "options", "correctAnswer", "explanation"] } },
                        essayQuestions: { type: Type.ARRAY, description: "Danh sách câu hỏi tự luận", items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, sampleAnswer: { type: Type.STRING, description: "Hướng dẫn giải chi tiết" } }, required: ["question", "sampleAnswer"] } }
                    }, required: ["sourceSchool", "questions"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        const quizData: Quiz = JSON.parse(jsonText);
        if (!quizData.sourceSchool || !Array.isArray(quizData.questions) || quizData.questions.length === 0) {
            throw new Error("Dữ liệu bài thi thử do AI tạo ra không hợp lệ.");
        }
        return quizData;
    } catch (error) {
        handleGeminiError(error, "generateMockExam");
    }
};

export const generatePracticeExercises = async (subjectName: string, gradeName: string, lessonTitle: string): Promise<Quiz> => {
    try {
        const isEnglishSubject = subjectName.toLowerCase().includes('tiếng anh') || subjectName.toLowerCase().includes('english');
        const languageInstruction = isEnglishSubject ? "LƯU Ý: Môn Tiếng Anh. Câu hỏi và các lựa chọn phải bằng TIẾNG ANH. Giải thích bằng Tiếng Việt." : "";
        const generationPrompt = `Bạn là trợ giảng AI. Hãy tạo nhanh bài tập luyện tập cho học sinh.\n\nThông tin:\n- Môn: ${subjectName}\n- Lớp: ${gradeName}\n- Bài: "${lessonTitle}"\n- Sách giáo khoa: Kết nối tri thức / Chân trời sáng tạo.\n\nYêu cầu:\n1. **5 câu hỏi** trắc nghiệm bám sát nội dung bài học.\n   - **QUAN TRỌNG**: Các chuỗi trong mảng "options" CHỈ chứa nội dung câu trả lời, KHÔNG ĐƯỢC chứa các ký tự tiền tố như "A.", "B.", "C.", "D." hay số thứ tự.\n2. Định dạng JSON chuẩn.\n3. "sourceSchool" ghi là "Hệ thống Tự luyện OnLuyen AI".\n4. **Topics**: Gắn thẻ chủ đề cho từng câu hỏi (VD: "Phân số", "Từ vựng").\n5. ${languageInstruction}`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", contents: generationPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, properties: {
                        sourceSchool: { type: Type.STRING }, title: { type: Type.STRING }, timeLimit: { type: Type.STRING },
                        questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, correctAnswer: { type: Type.STRING }, explanation: { type: Type.STRING }, topics: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["question", "options", "correctAnswer", "explanation"] } }
                    }, required: ["sourceSchool", "questions"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response from AI");
        const practiceData: Quiz = JSON.parse(jsonText);
        if (!practiceData.sourceSchool || !Array.isArray(practiceData.questions) || practiceData.questions.length === 0) {
            throw new Error("Dữ liệu bài tập do AI tạo ra không hợp lệ.");
        }
        return practiceData;
    } catch (error) {
        handleGeminiError(error, "generatePracticeExercises");
    }
};

export const generatePersonalizedLearningPath = async (weakTopics: string[], grade: string): Promise<LearningPath> => {
    try {
        const topicsStr = weakTopics.join(", ");
        const prompt = `Bạn là một AI Mentor (Cố vấn học tập) xuất sắc của OnLuyen. \nHọc sinh đang học **Lớp ${grade}**.\nHọc sinh này đang gặp khó khăn (trả lời sai nhiều) ở các chủ đề sau: **[${topicsStr}]**.\n\nNhiệm vụ: Hãy tạo một **Lộ trình học tập 7 ngày** (Tuần này) được cá nhân hóa để khắc phục các điểm yếu này, phù hợp với trình độ **Lớp ${grade}**.\nÁp dụng mô hình Spaced Repetition (Lặp lại ngắt quãng) và Scaffolding (Giàn giáo - từ dễ đến khó).\n\nYêu cầu chi tiết:\n1. Mỗi ngày (Day 1 - Day 7) phải có 1 mục tiêu rõ ràng (Title) và mô tả ngắn (Description).\n2. Mỗi ngày bao gồm 1-3 nhiệm vụ (Tasks):\n   - **Video**: Gợi ý tên video bài giảng cần xem để ôn lại lý thuyết (Phù hợp chương trình Lớp ${grade}).\n   - **Practice**: Gợi ý bài tập luyện tập (ghi rõ độ khó: Easy/Medium/Hard).\n3. Phân bổ:\n   - Ngày 1-3: Tập trung ôn lý thuyết và bài tập Dễ (Easy) cho chủ đề yếu nhất.\n   - Ngày 4-5: Bài tập Trung bình (Medium) và kết hợp các chủ đề.\n   - Ngày 6: Bài tập Nâng cao (Hard).\n   - Ngày 7: Tổng ôn tập.\n\nXuất ra JSON đúng theo schema.`;

        // FIX: Standardized variable name to 'response' to fix reference errors.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT, 
                    properties: {
                        studentWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weeklyPlan: { 
                            type: Type.ARRAY, 
                            items: { 
                                type: Type.OBJECT, 
                                properties: { 
                                    day: { type: Type.NUMBER }, 
                                    title: { type: Type.STRING }, 
                                    description: { type: Type.STRING }, 
                                    tasks: { 
                                        type: Type.ARRAY, 
                                        items: { 
                                            type: Type.OBJECT, 
                                            properties: { 
                                                type: { type: Type.STRING, enum: ["video", "practice"] }, 
                                                content: { type: Type.STRING }, 
                                                difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] } 
                                            }, 
                                            required: ["type", "content"] 
                                        } 
                                    } 
                                }, 
                                required: ["day", "title", "description", "tasks"] 
                            } 
                        }
                    },
                    required: ["studentWeaknesses", "weeklyPlan"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response for learning path");
        return JSON.parse(jsonText) as LearningPath;
    } catch (error) {
        handleGeminiError(error, "generatePersonalizedLearningPath");
        throw error;
    }
};

export const generateLessonPlan = async (subject: string, grade: string, topic: string): Promise<LessonPlan> => {
    try {
        const prompt = `Bạn là một giáo viên xuất sắc. Hãy soạn một GIÁO ÁN (Kế hoạch bài dạy) chuẩn cho:\n- Môn: ${subject}\n- Lớp: ${grade}\n- Tên bài: ${topic}\n\nYêu cầu:\n- Tuân theo cấu trúc dạy học phát triển năng lực (Công văn 5512).\n- Chi tiết các hoạt động, thời gian phân bổ.\n- Ngôn ngữ: Tiếng Việt.\n\nXuất ra JSON chuẩn.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topic: { type: Type.STRING },
                        grade: { type: Type.STRING },
                        objectives: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Mục tiêu kiến thức, năng lực, phẩm chất" },
                        materials: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Thiết bị dạy học và học liệu" },
                        activities: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    time: { type: Type.STRING, description: "Thời gian (VD: 5 phút)" },
                                    title: { type: Type.STRING, description: "Tên hoạt động (VD: Khởi động)" },
                                    description: { type: Type.STRING, description: "Nội dung chi tiết hoạt động của GV và HS" }
                                },
                                required: ["time", "title", "description"]
                            }
                        },
                        homework: { type: Type.STRING, description: "Hướng dẫn về nhà" }
                    },
                    required: ["topic", "objectives", "activities", "homework"]
                }
            }
        });

        const jsonText = response.text?.trim();
        if (!jsonText) throw new Error("Empty response for lesson plan");
        return JSON.parse(jsonText) as LessonPlan;

    } catch (error) {
        handleGeminiError(error, "generateLessonPlan");
        throw error; // Make TS happy
    }
};
