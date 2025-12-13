import React from 'react';
// FIX: Corrected import path for types
import type { LabCategory } from '../../../types/index';
import Breadcrumb from '../../../components/common/Breadcrumb';
import FeatureCard from '../../../components/common/FeatureCard';

interface CategorySelectionProps {
    categories: LabCategory[];
    onSelectCategory: (category: LabCategory) => void;
    onBack: () => void;
}

const CategorySelection: React.FC<CategorySelectionProps> = ({ categories, onSelectCategory, onBack }) => {
    return (
        <div className="container mx-auto max-w-4xl">
             <Breadcrumb items={[{ label: 'Tự học', onClick: onBack }, { label: 'Phòng thí nghiệm' }]} />
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold text-slate-800">Phòng Thí nghiệm ảo</h1>
                <p className="text-slate-500 mt-2">Chọn lĩnh vực khoa học để khám phá các mô phỏng tương tác.</p>
            </div>
            <div className="space-y-4">
                {categories.map(category => (
                    <FeatureCard
                        key={category.id}
                        title={category.name}
                        description={category.description || ''}
                        icon={category.icon!}
                        color={category.color}
                        onClick={() => onSelectCategory(category)}
                    />
                ))}
            </div>
        </div>
    );
};

export default CategorySelection;