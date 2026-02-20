// src/components/common/FooterNote.tsx
import React from 'react';
import { fontSize } from '../../styles/typography';

const FooterNote: React.FC = () => {
    return (
        <div className="text-center mt-8">
            <p className={`${fontSize.sm} text-gray-500`}>
                You can always change your preferences later in settings
            </p>
        </div>
    );
};

export default FooterNote;
