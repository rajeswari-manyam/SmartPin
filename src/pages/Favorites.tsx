

// ==================== FILE 8: src/pages/Favorites.tsx ====================
import React from "react";
import { Heart } from "lucide-react";

const Favorites: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="flex items-center space-x-3 mb-4">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          </div>
          <p className="text-gray-600">Your favorite services and businesses</p>
        </div>
      </div>
    </div>
  );
};

export default Favorites;
