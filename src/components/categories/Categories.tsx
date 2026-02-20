// src/components/categories/Categories.tsx
import { Category } from '../../types/category.types';

// Import Icons
import AgricultureIcon from "../../assets/icons/Agriculture.png";
import AutomotiveIcon from "../../assets/icons/Automotive.png";
import BeautyIcon from "../../assets/icons/Beauty.png";
import BusinessIcon from "../../assets/icons/Business.png";
import CorporativeIcon from "../../assets/icons/Corporative.png";
import CourierIcon from "../../assets/icons/Courier.png";
import CreativeIcon from "../../assets/icons/Creative.png";
import DailyWagesIcon from "../../assets/icons/DailyWages.png";
import EducationIcon from "../../assets/icons/Education.png";
import EventsIcon from "../../assets/icons/Events.png";
// import HomeIcon from "../../assets/icons/Home.png"; // Used for Home Repair
import HospitalsIcon from "../../assets/icons/Hospitals.png";
import IndustrialIcon from "../../assets/icons/Industrial.png";
import PetIcon from "../../assets/icons/Pet.png";
import PlumberIcon from "../../assets/icons/Plumber.png";
import RealEstateIcon from "../../assets/icons/RealEstate.png";
import RestaurantsIcon from "../../assets/icons/Restarents.png";
import ShoppingIcon from "../../assets/icons/Shopping.png";
import SportsIcon from "../../assets/icons/Sports.png";
import TechIcon from "../../assets/icons/Tech.png";
import TravelIcon from "../../assets/icons/Travel.png";
import WeddingIcon from "../../assets/icons/Wedding.png";
import HomeIcon from "../../assets/icons/Home.png";

export const categories: Category[] = [
    {
        id: "1",
        name: "Restaurants & Food",
        icon: RestaurantsIcon,
        link: "/restaurants",
    },
    {
        id: "2",
        name: "Hospitals & Healthcare",
        icon: HospitalsIcon,
        link: "/hospitals",
    },
    {
        id: "3",
        name: "Plumbers & Home Repair",
        icon: PlumberIcon,
        link: "/plumbers",
    },
    {
        id: "4",
        name: "Hotels & Travel",
        icon: TravelIcon,
        link: "/hotels",
    },
    {
        id: "5",
        name: "Beauty & Wellness",
        icon: BeautyIcon,
        link: "/beauty",
    },
    {
        id: "6",
        name: "Real Estate",
        icon: RealEstateIcon,
        link: "/real-estate",
    },
    {
        id: "7",
        name: "Shopping & Retail",
        icon: ShoppingIcon,
        link: "/shopping",
    },
    {
        id: "8",
        name: "Education & Training",
        icon: EducationIcon,
        link: "/education",
    },
    {
        id: "9",
        name: "Automotive",
        icon: AutomotiveIcon,
        link: "/automotive",
    },
    {
        id: "10",
        name: "Home & Personal Services",
        icon: HomeIcon,
        link: "/home",
    },
    {
        id: "11",
        name: "Business Services",
        icon: BusinessIcon,
        link: "/business",
    },
    {
        id: "12",
        name: "Tech & Digital",
        icon: TechIcon,
        link: "/tech",
    },
    {
        id: "13",
        name: "Pet Services",
        icon: PetIcon,
        link: "/pets",
    },
    {
        id: "14",
        name: "Events & Entertainment",
        icon: EventsIcon,
        link: "/events",
    },
    {
        id: "15",
        name: "Industrial Services",
        icon: IndustrialIcon,
        link: "/industrial",
    },
    {
        id: "16",
        name: "Courier & Logistics",
        icon: CourierIcon,
        link: "/courier",
    },
    {
        id: "17",
        name: "Daily Wage Labour",
        icon: DailyWagesIcon,
        link: "/labour",
    },
    {
        id: "18",
        name: "Agriculture & Farming",
        icon: AgricultureIcon,
        link: "/agriculture",
    },
    {
        id: "19",
        name: "Corporate Services",
        icon: CorporativeIcon,
        link: "/corporate",
    },
    {
        id: "20",
        name: "Creative & Art",
        icon: CreativeIcon,
        link: "/creative",
    },
    {
        id: "21",
        name: "Sports & Activities",
        icon: SportsIcon,
        link: "/sports",
    },
    {
        id: "22",
        name: "Wedding Services",
        icon: WeddingIcon,
        link: "/wedding",
    },
];
