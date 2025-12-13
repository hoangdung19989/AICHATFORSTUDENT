import React, { useState } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
// FIX: Corrected import path for types
import type { MockExamSubject, TestGrade } from '../../types/index';
import { MOCK_EXAM_SUBJECTS, MOCK_EXAM_GRADES } from '../../data';
import { useAuth } from '../../contexts/AuthContext';

import SubjectSelection from './components/SubjectSelection';
import GradeSelection from './components/GradeSelection';
import MockExamView from './components/MockExamView';

const MockExamsFlow: React.FC = () => {
    const { navigate } = useNavigation();
    const { user } = useAuth();
    const [selectedSubject, setSelectedSubject] = useState<MockExamSubject | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<TestGrade | null>(null);

    const handleSelectGrade = (grade: TestGrade) => {
        if (!user) {
            alert("Bạn cần đăng nhập để tham gia thi thử.");
            navigate('login');
            return;
        }
        setSelectedGrade(grade);
    };
    
    if (selectedSubject && selectedGrade) {
        return (
            <MockExamView
                subject={selectedSubject}
                grade={selectedGrade}
                onBack={() => setSelectedGrade(null)}
                onBackToSubjects={() => {
                    setSelectedGrade(null);
                    setSelectedSubject(null);
                }}
            />
        );
    }

    if (selectedSubject) {
        return (
            <GradeSelection
                subject={selectedSubject}
                grades={MOCK_EXAM_GRADES}
                onSelectGrade={handleSelectGrade}
                onBackToSubjects={() => setSelectedSubject(null)}
                onBackToSelfStudy={() => navigate('self-study')}
            />
        );
    }

    return <SubjectSelection subjects={MOCK_EXAM_SUBJECTS} onSelectSubject={setSelectedSubject} onBack={() => navigate('self-study')} />;
};

export default MockExamsFlow;