import React, { ComponentType } from 'react';
import { ChevronRightIcon } from '../icons';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  tags?: string[];
  color?: string;
  onClick: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, tags, color = 'bg-gray-500', onClick }) => {
    const bgIconColor = color.replace('bg-', 'bg-').replace('500', '100');
    const textIconColor = color.replace('bg-', 'text-').replace('500', '600');
    const borderColor = color.replace('bg-', 'border-').replace('500', '200');

    return (
        <button
            onClick={onClick}
            className={`group w-full flex flex-col sm:flex-row items-start sm:items-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg border ${borderColor} transition-all duration-300 ease-in-out transform hover:-translate-y-1 text-left`}
        >
            <div className={`flex-shrink-0 flex items-center justify-center h-20 w-20 p-4 rounded-2xl ${bgIconColor} mb-4 sm:mb-0`}>
                <Icon className={`h-full w-full ${textIconColor}`} />
            </div>
            
            <div className="flex-grow sm:ml-6">
                <h3 className="text-xl font-bold text-slate-800 group-hover:text-brand-blue-dark transition-colors">{title}</h3>
                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{description}</p>
                
                {tags && tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {tags.map((tag, idx) => (
                            <span 
                                key={idx} 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            
            <div className="mt-4 sm:mt-0 sm:ml-4 self-end sm:self-center">
                 <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                    <ChevronRightIcon className="h-5 w-5" />
                 </div>
            </div>
        </button>
    );
};

export default FeatureCard;
