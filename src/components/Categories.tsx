import React from "react";
import { useNavigate } from "react-router-dom";
import categoryData from "../data/categories.json";
import { fontSize, fontWeight } from "../styles/typography";

// Icons
import AgricultureIcon from "../assets/icons/Agriculture.png";
import AutomotiveIcon from "../assets/icons/Automotive.png";
import BeautyIcon from "../assets/icons/Beauty.png";
import BusinessIcon from "../assets/icons/Business.png";
import CorporativeIcon from "../assets/icons/Corporative.png";
import CourierIcon from "../assets/icons/Courier.png";
import CreativeIcon from "../assets/icons/Creative.png";
import DailyWagesIcon from "../assets/icons/DailyWages.png";
import EducationIcon from "../assets/icons/Education.png";
import EventsIcon from "../assets/icons/Events.png";
import HomeIcon from "../assets/icons/Home.png";
import HospitalsIcon from "../assets/icons/Hospitals.png";
import IndustrialIcon from "../assets/icons/Industrial.png";
import PetIcon from "../assets/icons/Pet.png";
import PlumberIcon from "../assets/icons/Plumber.png";
import RealEstateIcon from "../assets/icons/RealEstate.png";
import RestaurantsIcon from "../assets/icons/Restaurant.png";
import ShoppingIcon from "../assets/icons/Shopping.png";
import SportsIcon from "../assets/icons/Sports.png";
import TechIcon from "../assets/icons/Tech.png";
import TravelIcon from "../assets/icons/Travel.png";
import WeddingIcon from "../assets/icons/Wedding.png";

interface CategoriesProps {
    onCategoryClick?: () => boolean;
}

interface Category {
    id: number;
    name: string;
}

// Icon mapping
const iconMap: Record<number, string> = {
    1: RestaurantsIcon,
    2: HospitalsIcon,
    3: PlumberIcon,
    4: TravelIcon,
    5: BeautyIcon,
    6: RealEstateIcon,
    7: ShoppingIcon,
    8: EducationIcon,
    9: AutomotiveIcon,
    10: HomeIcon,
    11: BusinessIcon,
    12: TechIcon,
    13: PetIcon,
    14: EventsIcon,
    15: IndustrialIcon,
    16: CourierIcon,
    17: SportsIcon,
    18: DailyWagesIcon,
    19: AgricultureIcon,
    20: CorporativeIcon,
    21: CreativeIcon,
    22: WeddingIcon,
};

// 🎨 Theme colors
const BRAND_COLOR = "#00598a";
const PAGE_BG_COLOR = "#F8FAFC";

const Categories: React.FC<CategoriesProps> = ({ onCategoryClick }) => {
    const navigate = useNavigate();
    const categories: Category[] = categoryData.categories;

    const handleCategoryClick = (id: number) => {
        if (onCategoryClick && !onCategoryClick()) return;
        navigate(`/category/${id}`);
    };

    return (
        <div
            className="w-full py-6 md:py-12"
            style={{ backgroundColor: PAGE_BG_COLOR }}
        >
            <div className="max-w-7xl mx-auto px-3 md:px-6">

                {/* Header */}
                <div className="mb-6 md:mb-10 text-center">
                    <h2 className={`${fontSize["3xl"]} ${fontWeight.bold}`}>
                        Available Categories
                    </h2>
                    <p className="mt-2 text-gray-600 text-sm md:text-base">
                        Explore our wide range of services
                    </p>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => handleCategoryClick(category.id)}
                            className="
                                group rounded-2xl md:rounded-3xl p-3 md:p-6 bg-white
                                border-2 border-[#00598a]
                                transition-all duration-300 ease-out
                                hover:-translate-y-1 hover:shadow-xl hover:bg-[#00598a]
                                cursor-pointer w-full
                            "
                            style={{
                                minHeight: "110px",
                            }}
                        >
                            <div className="flex flex-col items-center justify-center h-full space-y-2 md:space-y-4">

                                {/* Icon Container */}
                                <div
                                    className="
                                        w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center
                                        bg-[#00598a] border-2 border-[#00598a]
                                        transition-all duration-300
                                        group-hover:bg-white
                                    "
                                >
                                    <img
                                        src={iconMap[category.id]}
                                        alt={category.name}
                                        className="
                                            w-6 h-6 md:w-10 md:h-10 object-contain
                                            transition-all duration-300
                                            brightness-0 invert
                                            group-hover:brightness-100 group-hover:invert-0
                                        "
                                    />
                                </div>

                                {/* Text */}
                                <p
                                    className="
                                        text-xs md:text-sm text-center font-semibold leading-tight
                                        text-[#00598a]
                                        transition-colors duration-300
                                        group-hover:text-white
                                    "
                                >
                                    {category.name}
                                </p>

                            </div>
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Categories;