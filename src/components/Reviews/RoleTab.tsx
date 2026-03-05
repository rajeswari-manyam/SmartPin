import React from 'react';
import typography from "../../styles/typography";

// ============================================================================
// ROLE TAB
// ============================================================================
const RoleTab: React.FC<{
    label: string;
    active: boolean;
    count?: number;
    onClick: () => void;
}> = ({ label, active, count, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-1.5 px-4 py-2 rounded-xl ${typography.body.xs} font-semibold
            transition-all duration-200
            ${active ? 'bg-[#00598a] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
        `}
    >
        {label}
        {count != null && count > 0 && (
            <span className={`${typography.fontSize.xs} font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${active ? 'bg-white/25 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                {count}
            </span>
        )}
    </button>
);

export default RoleTab;