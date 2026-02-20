// src/components/categories/CategoriesGrid.tsx
import React from 'react';
import CategoryCard from './CategoriesCard';
import { CategoriesGridProps } from '../../types/category.types';

const CategoriesGrid: React.FC<CategoriesGridProps> = ({
    categories,
    selectedCategories,
    onToggle
}) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12">
            {categories.map((category) => (
                <CategoryCard
                    key={category.id}
                    category={category}
                    isSelected={selectedCategories.includes(category.id)}
                    onToggle={onToggle}
                />
            ))}
        </div>
    );
};

export default CategoriesGrid;
