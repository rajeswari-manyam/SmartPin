import React, { useEffect, useState, useRef } from "react";
import { Trash2, Edit } from "lucide-react";
import { typography } from "../styles/typography";

interface ActionDropdownProps {
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

const ActionDropdown: React.FC<ActionDropdownProps> = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(!isOpen);
                }}
                className="bg-white/90 backdrop-blur-sm hover:bg-white p-2 rounded-full shadow-lg border border-gray-200 transition-all hover:shadow-xl"
            >
                <svg
                    className="w-5 h-5 text-gray-700"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                    <button
                        onClick={(e) => {
                            onEdit(e);
                            setIsOpen(false);
                        }}
                        className={`${typography.body.small} w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors`}
                    >
                        <Edit size={16} />
                        Edit
                    </button>
                    <button
                        onClick={(e) => {
                            onDelete(e);
                            setIsOpen(false);
                        }}
                        className={`${typography.body.small} w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2 text-gray-700 hover:text-red-600 transition-colors`}
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActionDropdown;
