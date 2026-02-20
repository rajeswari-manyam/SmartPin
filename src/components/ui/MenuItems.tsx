
// ==================== FILE 3: src/components/ui/MenuItem.tsx ====================
import React from "react";

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  danger?: boolean;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, text, danger, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors ${
      danger ? "text-red-600" : "text-gray-700"
    }`}
  >
    <span className="w-5 h-5">{icon}</span>
    <span className="font-medium">{text}</span>
  </button>
);

export default MenuItem;
