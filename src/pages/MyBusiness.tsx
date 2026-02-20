import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Loader2, Briefcase } from "lucide-react";

// Service screens
import HotelUserService from "./HotelUserService";
import BeautyUserService from "./BeautyUserServcie";
import HospitalUserService from "./HospitalUserServcie";
import DigitalUserService from "./DigitalUserServcie";
import SportsUserService from "./SportsUserService";
import ShoppingUserService from "./ShoppingUserService";
import EducationUserService from "./EducationUserService";
import AutomotiveUserService from "./AutomotiveUserService";
import PetUserService from "./PetUserService";
import EventUserService from "./EventUserService";
import IndustrialUserService from "./IndustrialUserService";
import BusinessUserService from "./BusinessUserService";
import CourierUserService from "./CourierUserService";
import DailyWageUserService from "./DailyWageUserService";
import AgricultureUserService from "./AgricultureUserService";
import CorporativeUserService from "./CorporativeUserService";
import WeddingUserService from "./WeddingUserService";
import ArtUserService from "./ArtUserService";

import RealEstateUserService from "./RealEstateUserService";

import FoodUserService from "./FoodUserService";

import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import CategoryFilterDropdown from "../components/CategoriesFilterDropDown";
import categories from "../data/categories.json";
import { CUSTOMER_JOB_CATEGORIES, isCustomerJobCategory } from "../config/serviceFlows";

import {
    getAllDataByUserId,
    AllUserData,
    ServiceItem,
} from "../services/api.service";

interface MyBusinessProps {
    userId: string;
}

const MyBusiness: React.FC<MyBusinessProps> = ({ userId }) => {
    const navigate = useNavigate();

    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

    const [allData, setAllData] = useState<AllUserData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    useEffect(() => {
        fetchAllData();
    }, [userId]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getAllDataByUserId(userId);
            console.log("✅ allData from API:", res.data); // helpful for debugging
            setAllData(res.data || {});
        } catch (err: any) {
            console.error("Error fetching user data:", err);
            setError(err.message || "Failed to load your services.");
        } finally {
            setLoading(false);
        }
    };

    const getAddPostRoute = (): string | null => {
        if (!selectedCategoryId || !selectedSubcategory) return null;
        const sub = selectedSubcategory.toLowerCase().replace(/\s+/g, "-");

        switch (selectedCategoryId) {
          
            case 3:  return `/add-hospital-service-form?subcategory=${sub}`;
            case 4:  return `/add-hotel-service-form?subcategory=${sub}`;
            case 5:  return `/add-beauty-service-form?subcategory=${sub}`;
            case 6:  return `/add-sports-service-form?subcategory=${sub}`;
            case 7:  return `/add-education-form?subcategory=${sub}`;
            case 9:  return `/add-shopping-form?subcategory=${sub}`;
            case 12: return `/add-digital-service-form?subcategory=${sub}`;
            case 13: return `/add-pet-service-form?subcategory=${sub}`;
            case 14: return `/add-event-service-form?subcategory=${sub}`;
            case 15: return `/add-industrial-service-form?subcategory=${sub}`;
            case 16: return `/add-business-service-form?subcategory=${sub}`;
            case 17: return `/add-courier-service-form?subcategory=${sub}`;
            case 18: return `/add-daily-wage-service-form?subcategory=${sub}`;
            case 19: return `/add-agriculture-service-form?subcategory=${sub}`;
            case 20: return `/add-corporative-form?subcategory=${sub}`;
            case 21: return `/add-wedding-form?subcategory=${sub}`;
            case 22: return `/add-art-form?subcategory=${sub}`;
             case 23: return `/add-automotive-form?subcategory=${sub}`;
            case 24: return `/add-real-estate-form?subcategory=${sub}`;

            case 26: return `/add-food-form?subcategory=${sub}`;
            default: return null;
        }
    };

    const addPostRoute = getAddPostRoute();

    const clearFilters = () => {
        setSelectedCategoryId(null);
        setSelectedSubcategory(null);
    };

    const filterItems = (items: ServiceItem[] = []): ServiceItem[] => {
        if (!selectedSubcategory) return items;
        return items.filter(
            (item) =>
                item.subcategory?.toLowerCase() === selectedSubcategory.toLowerCase() ||
                item.category?.toLowerCase() === selectedSubcategory.toLowerCase()
        );
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                    <p className="text-gray-500 text-sm">Loading your services...</p>
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Failed to Load</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchAllData}
                        className="bg-blue-500 text-white px-6 py-2.5 rounded-xl hover:bg-blue-600 transition font-semibold"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-4 sm:py-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">

                {/* ─── HEADER ───────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Briefcase className="w-7 h-7 text-blue-600" />
                            <h1 className={`${typography.heading.h3} text-gray-900`}>
                                My Busines
                            </h1>
                        </div>
                      
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <CategoryFilterDropdown
                            selectedCategoryId={selectedCategoryId}
                            selectedSubcategory={selectedSubcategory}
                            onSelectCategory={setSelectedCategoryId}
                            onSelectSubcategory={setSelectedSubcategory}
                        />

                        {(selectedCategoryId || selectedSubcategory) && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                                <X size={14} /> Clear
                            </button>
                        )}

                        {addPostRoute && (
                            <Button
                                variant="primary"
                                size="md"
                                onClick={() => navigate(addPostRoute)}
                            >
                                + Add Post
                            </Button>
                        )}
                    </div>
                </div>

              

                {/* ─── ACTIVE FILTER TAGS ───────────────────────────────────── */}
                {(selectedCategoryId || selectedSubcategory) && (
                    <div className="flex flex-wrap gap-2">
                        {selectedCategoryId && (
                            <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                                {
                                    (categories as any).categories.find(
                                        (c: any) => c.id === selectedCategoryId
                                    )?.name
                                }
                                <button onClick={clearFilters}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}

                        {selectedSubcategory && (
                            <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-sm px-3 py-1 rounded-full border">
                                {selectedSubcategory}
                                <button onClick={() => setSelectedSubcategory(null)}>
                                    <X size={12} />
                                </button>
                            </span>
                        )}
                    </div>
                )}

                {/* ─── SERVICE SECTIONS ─────────────────────────────────────── */}
                <div className="space-y-6">
                    {selectedCategoryId ? (
                        /* ── FILTERED: show only selected category ── */
                        <>
                            {!isCustomerJobCategory(selectedCategoryId) && (
                                <>
                                    {selectedCategoryId === 1 && (
                                        <FoodUserService
                                            userId={userId}
                                            data={filterItems(allData.food)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                  
                                    {selectedCategoryId === 3 && (
                                        <HospitalUserService
                                            userId={userId}
                                            data={filterItems(allData.healthcare)}      
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 4 && (
                                        <HotelUserService
                                            userId={userId}
                                            data={filterItems(allData.hotelTravel)}      
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 5 && (
                                        <BeautyUserService
                                            userId={userId}
                                            data={filterItems(allData.beauty)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 6 && (
                                        <SportsUserService
                                            userId={userId}
                                            data={filterItems(allData.sports)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 7 && (
                                        <EducationUserService
                                            userId={userId}
                                            data={filterItems(allData.education)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 9 && (
                                        <ShoppingUserService
                                            userId={userId}
                                            data={filterItems(allData.shopping)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {
                                        selectedCategoryId === 10 && (
                                            <AutomotiveUserService
                                                userId={userId}
                                                data={filterItems(allData.automotive)}
                                                selectedSubcategory={selectedSubcategory}
                                                hideHeader={false}
                                                hideEmptyState={true}
                                            />
                                        )}
                                    {selectedCategoryId === 12 && (
                                        <DigitalUserService
                                            userId={userId}
                                            data={allData.techDigital}                   
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 13 && (
                                        <PetUserService
                                            userId={userId}
                                            data={filterItems(allData.pet)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 14 && (
                                        <EventUserService
                                            userId={userId}
                                            data={filterItems(allData.events)}            
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 15 && (
                                        <IndustrialUserService
                                            userId={userId}
                                            data={filterItems(allData.industrialLocal)}  
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 16 && (
                                        <BusinessUserService
                                            userId={userId}
                                            data={filterItems(allData.business)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 17 && (
                                        <CourierUserService
                                            userId={userId}
                                            data={filterItems(allData.courier)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 18 && (
                                        <DailyWageUserService
                                            userId={userId}
                                            data={filterItems(allData.dailyWage)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 19 && (
                                        <AgricultureUserService
                                            userId={userId}
                                            data={filterItems(allData.agriculture)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 20 && (
                                        <CorporativeUserService
                                            userId={userId}
                                            data={filterItems(allData.corporate)}        
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 21 && (
                                        <WeddingUserService
                                            userId={userId}
                                            data={filterItems(allData.wedding)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    {selectedCategoryId === 22 && (
                                        <ArtUserService
                                            userId={userId}
                                            data={filterItems(allData.creative)}         
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                    
                                    {selectedCategoryId === 24 && (
                                        <RealEstateUserService
                                            userId={userId}
                                            data={filterItems(allData.realEstate)}
                                            selectedSubcategory={selectedSubcategory}
                                            hideHeader={false}
                                            hideEmptyState={true}
                                        />
                                    )}
                                </>
                            )}

                            {/* 🔹 Customer Job Categories Not Available */}
                            {isCustomerJobCategory(selectedCategoryId) && (
                                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                    <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-1">
                                        Customer Job Category
                                    </h3>
                                    <p className="text-gray-500 max-w-md mx-auto">
                                        This category is reserved for customer job postings.
                                        Use "Find Jobs" tab to apply for work opportunity.
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        /* ── ALL WORKER SERVICES: show all non-customer categories ── */
                        <>


                            <HospitalUserService    userId={userId} data={allData.healthcare}        hideHeader={false} hideEmptyState={true} />  {/* ✅ was: allData.hospital */}
                            <HotelUserService       userId={userId} data={allData.hotelTravel}       hideHeader={false} hideEmptyState={true} />  {/* ✅ was: allData.hotel */}
                            <BeautyUserService      userId={userId} data={allData.beauty}            hideHeader={false} hideEmptyState={true} />
                            <RealEstateUserService  userId={userId} data={allData.realEstate}        hideHeader={false} hideEmptyState={true} />
                            <ShoppingUserService    userId={userId} data={allData.shopping}          hideHeader={false} hideEmptyState={true} />
                            <EducationUserService   userId={userId} data={allData.education}         hideHeader={false} hideEmptyState={true} />
                            <DigitalUserService     userId={userId} data={allData.techDigital}       hideHeader={false} hideEmptyState={true} />  {/* ✅ was: allData.digital */}
                            <PetUserService         userId={userId} data={allData.pet}               hideHeader={false} hideEmptyState={true} />
                            <EventUserService       userId={userId} data={allData.events}            hideHeader={false} hideEmptyState={true} />  {/* ✅ was: allData.event */}
                            <IndustrialUserService  userId={userId} data={allData.industrialLocal}   hideHeader={false} hideEmptyState={true} />  {/* ✅ was: allData.industrial */}
                            <BusinessUserService    userId={userId} data={allData.business}          hideHeader={false} hideEmptyState={true} />
                            <CourierUserService     userId={userId} data={allData.courier}           hideHeader={false} hideEmptyState={true} />
                            <DailyWageUserService   userId={userId} data={allData.dailyWage}         hideHeader={false} hideEmptyState={true} />
                            <AgricultureUserService userId={userId} data={allData.agriculture}       hideHeader={false} hideEmptyState={true} />
                            <CorporativeUserService userId={userId} data={allData.corporate}         hideHeader={false} hideEmptyState={true} />  {/* ✅ was: allData.corporative */}
                            <WeddingUserService     userId={userId} data={allData.wedding}           hideHeader={false} hideEmptyState={true} />
                            <ArtUserService         userId={userId} data={allData.creative}          hideHeader={false} hideEmptyState={true} />  {/* ✅ was: allData.art */}
                             <AutomotiveUserService   userId={userId} data={allData.automotive}       hideHeader={false} hideEmptyState={true} />  {/* ✅ was: allData.automotive */}   
                            <SportsUserService      userId={userId} data={allData.sports}            hideHeader={false} hideEmptyState={true} />
                            <FoodUserService     userId={userId} data={allData.food}              hideHeader={false} hideEmptyState={true} />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyBusiness;
