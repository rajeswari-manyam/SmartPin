import React, { useState, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    CheckCircle,
    Zap,
} from "lucide-react";

/* ================= TYPES ================= */

export interface TowingService {
    place_id: string;
    name: string;
    vicinity: string;
    rating: number;
    user_ratings_total: number;
    photos: { photo_reference: string }[];
    geometry: {
        location: { lat: number; lng: number };
    };
    business_status: string;
    opening_hours: { open_now: boolean };
    price_level: number;
    types: string[];
    special_tags: string[];
    distance: number;
    price_info?: string;
    suggestions?: number;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    towing_1: "08904587496",
    towing_2: "08197582452",
    towing_3: "07383144240",
    towing_4: "08045786946",
    towing_5: "09848123456",
};

export const DUMMY_TOWING_SERVICES: TowingService[] = [
    {
        place_id: "towing_1",
        name: "Bharat Rapido Pvt",
        vicinity: "Sanath Nagar, Hyderabad",
        rating: 4.9,
        user_ratings_total: 60,
        photos: [{ photo_reference: "towing_photo_1" }],
        geometry: { location: { lat: 16.5062, lng: 80.648 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["towing_service", "roadside_assistance"],
        special_tags: ["Top Search", "Company Authorised Dealer"],
        distance: 4.7,
        price_info: "Reasonably priced",
        suggestions: 5,
    },
    {
        place_id: "towing_2",
        name: "S S Towing Services",
        vicinity: "Nandamuri Colony New Bowenpally, Hyderabad",
        rating: 4.3,
        user_ratings_total: 218,
        photos: [{ photo_reference: "towing_photo_2" }],
        geometry: { location: { lat: 16.507, lng: 80.6485 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["towing_service", "roadside_assistance"],
        special_tags: ["Popular", "24 Hours Towing Services"],
        distance: 2.3,
    },
    {
        place_id: "towing_3",
        name: "Dwaraka On Road Assistance",
        vicinity: "Old Bowenpally-bowenpally, Hyderabad",
        rating: 4.6,
        user_ratings_total: 56,
        photos: [{ photo_reference: "towing_photo_3" }],
        geometry: { location: { lat: 16.508, lng: 80.649 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["towing_service", "roadside_assistance"],
        special_tags: ["Responsive", "Quick booking"],
        distance: 2.8,
        suggestions: 13,
    },
    {
        place_id: "towing_4",
        name: "Sri Venkat Sai Towing Services",
        vicinity: "Kphb Colony Kukatpally, Hyderabad",
        rating: 4.8,
        user_ratings_total: 18,
        photos: [{ photo_reference: "towing_photo_4" }],
        geometry: { location: { lat: 16.509, lng: 80.65 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["towing_service", "roadside_assistance"],
        special_tags: ["Responsive", "24 Hours Towing Services"],
        distance: 4.1,
        price_info: "Reasonably priced",
        suggestions: 8,
    },
    {
        place_id: "towing_5",
        name: "S K Farhan Towing Service",
        vicinity: "Balanagar Industrial Area, Hyderabad",
        rating: 4.6,
        user_ratings_total: 66,
        photos: [{ photo_reference: "towing_photo_5" }],
        geometry: { location: { lat: 16.5075, lng: 80.6495 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["towing_service", "roadside_assistance"],
        special_tags: ["Trending", "Verified", "Quick Response"],
        distance: 3.5,
    },
];

const TOWING_IMAGES_MAP: { [key: string]: string[] } = {
    towing_1: [
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800",
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
    ],
    towing_2: [
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
    ],
    towing_3: [
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800",
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
    ],
    towing_4: [
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800",
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
    ],
    towing_5: [
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800",
        "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
    ],
};

const TOWING_DESCRIPTIONS_MAP: { [key: string]: string } = {
    towing_1:
        "Top Search towing service with 4.9★ rating and 60 reviews. Company Authorised Dealer. 24 Hours Towing Services. Reasonably priced with quick response.",
    towing_2:
        "Popular towing service with 4.3★ rating and 218 reviews. 24 Hours Towing Services available. Professional roadside assistance.",
    towing_3:
        "Responsive towing service with 4.6★ rating and 56 reviews. Quick booking available. On-site services with trained professionals.",
    towing_4:
        "Responsive towing service with 4.8★ rating and 18 reviews. 24 Hours Towing Services. Reasonably priced with great customer service.",
    towing_5:
        "Trending towing service with 4.6★ rating and 66 reviews. Verified and Quick Response. Professional emergency towing assistance.",
};

const TOWING_SERVICES = [
    "Emergency Transport",
    "ICU Ambulance",
    "Oxygen Support",
    "Cardiac Care",
    "24/7 Availability",
    "Trained Paramedics",
    "Basic Life Support",
    "Advanced Life Support",
];

/* ================= COMPONENT ================= */

interface NearbyTowingCardProps {
    job?: any;
    onViewDetails: (job: any) => void;
}

const SingleTowingCard: React.FC<NearbyTowingCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "towing_1";
        return TOWING_IMAGES_MAP[jobId] || TOWING_IMAGES_MAP["towing_1"];
    }, [job]);

    const photos = getPhotos();
    const hasPhotos = photos.length > 0;
    const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

    const handlePrevImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex > 0) setCurrentImageIndex((prev) => prev - 1);
        },
        [hasPhotos, currentImageIndex]
    );

    const handleNextImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex < photos.length - 1)
                setCurrentImageIndex((prev) => prev + 1);
        },
        [hasPhotos, currentImageIndex, photos.length]
    );

    const getName = useCallback(() => (job ? job.title || "Towing Service" : "Towing Service"), [job]);
    const getLocation = useCallback(() => (job ? job.location || job.description || "Location" : "Location"), [job]);
    const getDistance = useCallback(() => {
        if (!job) return "";
        const distanceNum = Number(job.distance);
        return !isNaN(distanceNum) ? `${distanceNum.toFixed(1)} km` : "";
    }, [job]);
    const getDescription = useCallback(() => {
        if (!job) return "Professional towing services";
        const jobId = job.id || "towing_1";
        return TOWING_DESCRIPTIONS_MAP[jobId] || job.description || "Professional towing services";
    }, [job]);
    const getRating = useCallback(() => job?.jobData?.rating || null, [job]);
    const getUserRatingsTotal = useCallback(() => job?.jobData?.user_ratings_total || null, [job]);
    const getOpeningStatus = useCallback(() => {
        const isOpen = job?.jobData?.opening_hours?.open_now;
        if (isOpen === undefined || isOpen === null) return null;
        return isOpen ? "24 Hours Towing Services" : "Currently Unavailable";
    }, [job]);
    const getSpecialTags = useCallback(() => job?.jobData?.special_tags || [], [job]);
    const getPhoneNumber = useCallback(() => {
        const jobId = job?.id || "";
        return PHONE_NUMBERS_MAP[jobId] || null;
    }, [job]);

    const handleCall = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const phone = getPhoneNumber();
            if (!phone) return alert(`No contact number available for ${getName()}.`);
            window.location.href = `tel:${phone.replace(/[^0-9+]/g, "")}`;
        },
        [getPhoneNumber, getName]
    );

    const handleNavigate = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!job?.jobData?.geometry?.location) {
                return alert("Location not available for this service.");
            }
            const { lat, lng } = job.jobData.geometry.location;
            const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
            window.open(url, "_blank");
        },
        [job]
    );

    const handleImageError = useCallback(() => setImageError(true), []);

    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const openingStatus = getOpeningStatus();
    const distance = getDistance();
    const description = getDescription();
    const specialTags = getSpecialTags();
    const visibleServices = TOWING_SERVICES.slice(0, 4);
    const moreServices = TOWING_SERVICES.length - 4;
    const hasPhoneNumber = getPhoneNumber() !== null;

    if (!job) return null;

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[0.99]"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-100">
                {currentPhoto && !imageError ? (
                    <>
                        <img src={currentPhoto} className="w-full h-full object-cover" alt={getName()} onError={handleImageError} />
                        {hasPhotos && photos.length > 1 && (
                            <>
                                {currentImageIndex > 0 && (
                                    <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition">
                                        <ChevronLeft size={20} />
                                    </button>
                                )}
                                {currentImageIndex < photos.length - 1 && (
                                    <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition">
                                        <ChevronRight size={20} />
                                    </button>
                                )}
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                                    {currentImageIndex + 1} / {photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                        <span className="text-6xl">🚗</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                <h3 className="text-[17px] font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2">{getName()}</h3>

                <div className="flex items-center gap-2 mb-2">
                    {rating && (
                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded">
                            <span className="text-[13px] font-bold">{rating.toFixed(1)}</span>
                            <Star size={11} className="fill-white" />
                        </div>
                    )}
                    {userRatingsTotal && <span className="text-xs text-gray-600">{userRatingsTotal} Ratings</span>}
                    {specialTags.slice(0, 1).map((tag: string, index: number) => (
                        <div key={index} className="flex items-center gap-0.5 text-[11px] font-semibold text-orange-600">
                            <Zap size={12} className="fill-orange-600" />
                            <span>{tag}</span>
                        </div>
                    ))}
                </div>

                <div className="flex items-center text-gray-600 mb-1">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="text-[13px] line-clamp-1">{getLocation()}</span>
                    {distance && (
                        <>
                            <span className="mx-1.5 text-gray-400">•</span>
                            <span className="text-[13px] font-semibold">{distance}</span>
                        </>
                    )}
                </div>

                <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-2">{description}</p>

                {openingStatus && (
                    <div
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded mb-2 ${openingStatus.includes("24 Hours") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                    >
                        <Clock size={11} />
                        <span>{openingStatus}</span>
                    </div>
                )}

                <div className="mb-3 flex flex-wrap gap-1.5">
                    {visibleServices.map((service, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[11px] font-medium px-2 py-1 rounded">
                            <CheckCircle size={10} />
                            <span>{service}</span>
                        </span>
                    ))}
                    {moreServices > 0 && (
                        <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                            +{moreServices} more
                        </span>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleCall}
                        disabled={!hasPhoneNumber}
                        className={`flex items-center justify-center gap-1 border font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
                            ? "border-green-600 bg-green-600 text-white hover:bg-green-700"
                            : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={14} />
                        <span>{hasPhoneNumber ? getPhoneNumber()?.slice(-8) : "Call"}</span>
                    </button>

                    <button
                        onClick={handleNavigate}
                        className="flex items-center justify-center gap-1 border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
                    >
                        <Navigation size={14} />
                        <span>Navigate</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Wrapper Component
const NearbyTowingCard: React.FC<NearbyTowingCardProps> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {DUMMY_TOWING_SERVICES.map((towing) => (
                    <SingleTowingCard
                        key={towing.place_id}
                        job={{
                            id: towing.place_id,
                            title: towing.name,
                            location: towing.vicinity,
                            distance: towing.distance,
                            category: "Towing Service",
                            jobData: {
                                rating: towing.rating,
                                user_ratings_total: towing.user_ratings_total,
                                opening_hours: towing.opening_hours,
                                geometry: towing.geometry,
                                business_status: towing.business_status,
                                price_level: towing.price_level,
                                types: towing.types,
                                special_tags: towing.special_tags,
                                price_info: towing.price_info,
                                suggestions: towing.suggestions,
                            },
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleTowingCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyTowingCard;
