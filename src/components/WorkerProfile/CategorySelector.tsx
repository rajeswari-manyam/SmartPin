import React from "react";
import typography from "../../styles/typography";

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface SubcategoryItem {
    name: string;
    icon: string;
}

interface CategorySelectorProps {
    categories: Category[];
    subcategories: SubcategoryItem[];
    selectedCategory: number | "";
    selectedSubcategory: string;
    onCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onSubcategoryChange: (value: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
    categories,
    subcategories,
    selectedCategory,
    selectedSubcategory,
    onCategoryChange,
    onSubcategoryChange,
}) => {
    return (
        <>
            {/* Category Dropdown */}
            <div className="mb-6">
                <label className={typography.form.label}>Select Category *</label>
                <select
                    value={selectedCategory}
                    onChange={onCategoryChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0B0E92] focus:outline-none"
                >
                    <option value="">Choose a category</option>
                    {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.icon} {category.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Subcategory Dropdown */}
            {selectedCategory && (
                <div className="mb-6 animate-fade-in">
                    <label className={typography.form.label}>Select Subcategory *</label>
                    <select
                        value={selectedSubcategory}
                        onChange={(e) => onSubcategoryChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0B0E92] focus:outline-none"
                    >
                        <option value="">Choose a subcategory</option>
                        {subcategories.map((sub, index) => (
                            <option key={index} value={sub.name}>
                                {sub.icon} {sub.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </>
    );
};

export default CategorySelector;
