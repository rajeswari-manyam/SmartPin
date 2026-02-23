import subcategoryData from "../../data/subcategories.json";
import { SUBCATEGORY_ICONS } from "../../assets/subcategoryIcons";

const Subcategories = ({ categoryId }: { categoryId: number }) => {
  const group = subcategoryData.subcategories.find(
    (c) => c.categoryId === categoryId
  );

  if (!group) return null;

  return (
    <div className="grid grid-cols-3 gap-4">
      {group.items.map((item) => (
        <div
          key={item.name}
          className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-100 transition"
        >
          <img
            src={SUBCATEGORY_ICONS[item.icon]}
            alt={item.name}
            className="w-12 h-12 object-contain"
          />
          <span className="mt-2 text-sm text-center">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default Subcategories;