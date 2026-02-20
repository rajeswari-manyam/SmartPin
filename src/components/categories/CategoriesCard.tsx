// src/components/categories/CategoryCard.tsx
import React from 'react';
import { fontSize, fontWeight } from '../../styles/typography';
import { CategoryCardProps } from '../../types/category.types';

const CategoryCard: React.FC<CategoryCardProps> = ({ category, isSelected, onToggle }) => {
    return (
        <button
            onClick={() => onToggle(category.id)}
            className={`relative group flex flex-col items-center justify-center p-4 sm:p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${isSelected
                ? 'border-[#0B0E92] bg-blue-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-[#69A6F0] hover:shadow-md'
                }`}
            type="button"
        >
            {/* Icon Container */}
            <div
                className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center rounded-full mb-3 sm:mb-4 transition-all duration-300 ${isSelected
                    ? 'bg-gradient-to-r from-[#f09b13] to-[#f0c413]'
                    : 'bg-gradient-to-br from-blue-50 to-purple-50 group-hover:from-blue-100 group-hover:to-purple-100'
                    }`}
            >
                <img
                    src={category.icon}
                    alt={category.name}
                    className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 object-contain transition-all duration-300 ${isSelected ? 'brightness-0 invert' : ''}`}
                />
            </div>

            {/* Category Name */}
            <h3
                className={`${fontSize.sm} ${fontWeight.semibold} text-center transition-colors duration-300 ${isSelected
                    ? 'text-[#0B0E92]'
                    : 'text-gray-700 group-hover:text-[#0B0E92]'
                    }`}
            >
                {category.name}
            </h3>

            {/* Selected Indicator */}
            {isSelected && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-[#0B0E92] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                </div>
            )}
        </button>
    );
};

export default CategoryCard;
