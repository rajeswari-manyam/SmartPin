// src/components/common/TitleSection.tsx
import React from 'react';
import typography from '../../styles/typography';
import { TitleSectionProps } from '../../types/common.types';

const TitleSection: React.FC<TitleSectionProps> = ({ title, subtitle }) => {
    return (
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className={`${typography.heading.h2} text-gray-900 mb-3 sm:mb-4`}>
                {title}
            </h2>
            <p className={`${typography.body.large} text-gray-600 max-w-2xl mx-auto`}>
                {subtitle}
            </p>
        </div>
    );
};

export default TitleSection;
