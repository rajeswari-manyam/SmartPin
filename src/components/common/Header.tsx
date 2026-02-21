// src/components/common/Header.tsx
import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { fontSize, fontWeight } from '../../styles/typography';
import { HeaderProps } from '../../types/common.types';

const BackIcon = FaArrowLeft as any;

const Header: React.FC<HeaderProps> = ({ onBack, onSkip }) => {
    return (
        <div className="bg-gradient-to-r from-[#00598a] to-[#003a5c] text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
                <div className="flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                        aria-label="Go back"
                    >
                        <BackIcon className="text-lg sm:text-xl" />
                        <span className={`${fontSize.base} ${fontWeight.medium} hidden sm:inline`}>
                            Back
                        </span>
                    </button>

                    <h1 className={`${fontSize["2xl"]} sm:text-3xl ${fontWeight.bold}`}>
                        ServiceHub
                    </h1>

                    <button
                        onClick={onSkip}
                        className={`${fontSize.base} ${fontWeight.medium} hover:opacity-80 transition-opacity`}
                    >
                        Skip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Header;
