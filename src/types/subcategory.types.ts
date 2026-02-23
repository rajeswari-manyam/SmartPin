export interface SubcategoryItem {
  name: string;
  icon: string; // key from SUBCATEGORY_ICONS
}

export interface SubcategoryGroup {
  categoryId: number;
  items: SubcategoryItem[];
}