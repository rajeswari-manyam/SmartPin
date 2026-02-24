// src/components/categories/CategoryCard.tsx
import React from 'react';
import { fontSize, fontWeight } from '../../styles/typography';
import { CategoryCardProps } from '../../types/category.types';
import { Wrench } from 'lucide-react';
import { SUBCATEGORY_ICONS } from '../../assets/subcategoryIcons';

const CategoryCard: React.FC<CategoryCardProps> = ({ category, isSelected, onToggle }) => {
    // Get icon from SUBCATEGORY_ICONS using category name
    const iconUrl = SUBCATEGORY_ICONS[category.name];
    const hasCustomIcon = !!iconUrl;

    return (
        <button
            onClick={() => onToggle(category.id)}
            className={`group relative flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                isSelected
                    ? 'bg-[#00598a] border-[#00598a]'
                    : 'bg-white border-[#00598a] hover:bg-[#00598a]'
            }`}
            type="button"
        >
            {/* Icon Container */}
            <div
                className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full mb-3 sm:mb-4 transition-all duration-300 ${
                    isSelected
                        ? 'bg-white'
                        : 'bg-[#00598a] group-hover:bg-white'
                }`}
            >
                {hasCustomIcon ? (
                    <img
                        src={iconUrl}
                        alt={category.name}
                        className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain transition-all duration-300 ${
                            isSelected
                                ? 'brightness-0 invert-0'
                                : 'brightness-0 invert group-hover:brightness-100 group-hover:invert-0'
                        }`}
                    />
                ) : (
                    <Wrench
                        size={28}
                        className={`transition-colors duration-300 ${
                            isSelected
                                ? 'text-[#00598a]'
                                : 'text-white group-hover:text-[#00598a]'
                        }`}
                    />
                )}
            </div>

            {/* Category Name */}
            <h3
                className={`${fontSize.sm} ${fontWeight.semibold} text-center transition-colors duration-300 ${
                    isSelected
                        ? 'text-white'
                        : 'text-[#00598a] group-hover:text-white'
                }`}
            >
                {category.name}
            </h3>

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                    <span className="text-[#00598a] text-sm font-bold">✓</span>
                </div>
            )}
        </button>
    );
};

export default CategoryCard;