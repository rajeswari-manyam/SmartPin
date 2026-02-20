// src/components/categories/NoResults.tsx
import React from 'react';
import { fontSize } from '../../styles/typography';
import { NoResultsProps } from '../../types/category.types';

const NoResults: React.FC<NoResultsProps> = ({ searchQuery }) => {
    return (
        <div className="text-center py-12">
            <p className={`${fontSize.lg} text-gray-500`}>
                No categories found matching "{searchQuery}"
            </p>
        </div>
    );
};

export default NoResults;
