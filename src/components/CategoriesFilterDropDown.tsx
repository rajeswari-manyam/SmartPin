import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, Filter } from "lucide-react";
import { typography } from "../styles/typography";
import categories from "../data/categories.json";
import subcategories from "../data/subcategories.json";

interface Category {
    id: number;
    name: string;
    icon: string;
}

interface Subcategory {
    name: string;
    icon: string;
}

interface SubcategoryGroup {
    categoryId: number;
    items: Subcategory[];
}

interface CategoryFilterDropdownProps {
    selectedCategoryId: number | null;
    selectedSubcategory: string | null;
    onSelectCategory: (categoryId: number | null) => void;
    onSelectSubcategory: (subcategoryName: string | null) => void;
}

const CategoryFilterDropdown: React.FC<CategoryFilterDropdownProps> = ({
    selectedCategoryId,
    selectedSubcategory,
    onSelectCategory,
    onSelectSubcategory,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const categoriesData: Category[] = categories.categories;
    const subcategoriesData: SubcategoryGroup[] = subcategories.subcategories;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getSelectedLabel = () => {
        if (selectedSubcategory) return selectedSubcategory;
        if (selectedCategoryId) {
            const cat = categoriesData.find((c) => c.id === selectedCategoryId);
            return cat ? cat.name : "All Services";
        }
        return "All Services";
    };

    const handleCategoryClick = (categoryId: number) => {
        if (selectedCategoryId === categoryId) {
            onSelectCategory(null);
            onSelectSubcategory(null);
        } else {
            onSelectCategory(categoryId);
            onSelectSubcategory(null);
        }
    };

    const handleSubcategoryClick = (categoryId: number, subcategoryName: string) => {
        onSelectCategory(categoryId);
        onSelectSubcategory(subcategoryName);
        setIsOpen(false);
    };

    const handleClearFilters = () => {
        onSelectCategory(null);
        onSelectSubcategory(null);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
            >
                <Filter size={18} className="text-gray-600" />
                <span className={typography.body.small}>{getSelectedLabel()}</span>
                <ChevronDown
                    size={18}
                    className={`text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white rounded-lg shadow-xl border border-gray-200 z-30">
                    {/* Clear */}
                    <div className="sticky top-0 bg-white border-b border-gray-200 p-3">
                        <button
                            onClick={handleClearFilters}
                            className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-2 text-sm font-medium text-blue-600"
                        >
                            <span>🔄</span> Clear All Filters
                        </button>
                    </div>

                    {/* Categories + subcategories */}
                    <div className="p-2">
                        {categoriesData.map((category) => {
                            const categorySubcategories = subcategoriesData.find(
                                (sc) => sc.categoryId === category.id
                            );
                            const isExpanded = selectedCategoryId === category.id;

                            return (
                                <div key={category.id} className="mb-1">
                                    <button
                                        onClick={() => handleCategoryClick(category.id)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between gap-2 transition-colors ${
                                            selectedCategoryId === category.id && !selectedSubcategory
                                                ? "bg-blue-50 text-blue-700 font-medium"
                                                : "hover:bg-gray-50 text-gray-700"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{category.icon}</span>
                                            <span className={typography.body.small}>{category.name}</span>
                                        </div>
                                        {categorySubcategories && (
                                            <ChevronDown
                                                size={16}
                                                className={`text-gray-400 transition-transform ${
                                                    isExpanded ? "rotate-180" : ""
                                                }`}
                                            />
                                        )}
                                    </button>

                                    {isExpanded && categorySubcategories && (
                                        <div className="ml-4 mt-1 space-y-0.5">
                                            {categorySubcategories.items.map((sub, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSubcategoryClick(category.id, sub.name)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                                                        selectedSubcategory === sub.name
                                                            ? "bg-blue-50 text-blue-700 font-medium"
                                                            : "hover:bg-gray-50 text-gray-600"
                                                    }`}
                                                >
                                                    <span className="text-sm">{sub.icon}</span>
                                                    <span className={`${typography.body.xs} truncate`}>
                                                        {sub.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryFilterDropdown;
