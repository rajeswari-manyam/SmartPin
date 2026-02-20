// Category type definition
export interface Category {
    id: string;
    name: string;
    icon: string;
    link: string;
}

// Props interfaces
export interface CategoryCardProps {
    category: Category;
    isSelected: boolean;
    onToggle: (categoryId: string) => void;
}

export interface CategoriesGridProps {
    categories: Category[];
    selectedCategories: string[];
    onToggle: (categoryId: string) => void;
}

export interface NoResultsProps {
    searchQuery: string;
}
