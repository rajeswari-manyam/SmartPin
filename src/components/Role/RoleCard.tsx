// components/role/RoleCard.tsx
import React from 'react';
import Button from '../ui/Buttons';
import typography from '../../styles/typography';

interface RoleCardProps {
    IconComponent: any;
    title: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
    IconComponent,
    title,
    description,
    isSelected,
    onClick
}) => (
    <Button
        onClick={onClick}
        variant={isSelected ? "secondary" : "outline"}
        size="xl"
        fullWidth
        className={`p-8 rounded-2xl transition-all duration-300 ${
            isSelected
                ? "border-blue-600 bg-blue-50 shadow-md"
                : "border-gray-200 hover:border-blue-300"
        }`}
    >
        <div className="flex flex-col items-center space-y-4">
            <IconComponent size={80} />
            <h3 className={`${typography.card.title}`}>{title}</h3>
            <p className={`${typography.card.description} text-center`}>
                {description}
            </p>
        </div>
    </Button>
);

export default RoleCard;
