/**
 * ============================================================================
 * NearbyMobileCard.tsx - Detailed Mobile Store Card for Shopping
 * ============================================================================
 * 
 * Displays detailed mobile store information with:
 * - Large image carousel
 * - Full description
 * - Opening hours
 * - Services offered
 * - Action buttons (Call & Directions)
 * 
 * @component NearbyMobileCard
 * @version 2.0.0 - MOBILE STORES ONLY (React + Tailwind)
 */

import React, { useState, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Navigation,
    Star,
    CheckCircle,
    Smartphone,
    Flame,
    TrendingUp,
} from "lucide-react";

/* ================= TYPES ================= */

export interface MobileStore {
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
    distance: number;
    special_tags: string[];
}

/* ================= CONSTANTS - EXACT FROM REACT NATIVE ================= */

// Phone numbers map for mobile stores (based on JustDial data)
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    mobile_store_1: "07041913658", // Shiva Sai Mobiles
    mobile_store_2: "07041809633", // Shiva Sai Mobiles (Suraram)
    mobile_store_3: "08490061791", // Mobile Matrix
    mobile_store_4: "08460308420", // Mobile Matrix (KPHB)
    mobile_store_5: "08460433104", // Prince Mobiles
    mobile_store_6: "07942691729", // G Kee Communications
};

// Export dummy mobile store data - EXACT FROM REACT NATIVE
export const DUMMY_MOBILE_STORES: MobileStore[] = [
    {
        place_id: "mobile_store_1",
        name: "Shiva Sai Mobiles",
        vicinity: "Plaza Lane Main Colony, Hyderabad",
        rating: 4.7,
        user_ratings_total: 141,
        photos: [{ photo_reference: "mobile_store_photo_1" }],
        geometry: {
            location: { lat: 17.485, lng: 78.515 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 1.2,
        special_tags: ["Top Search", "Quick Response", "Jd Verified"],
    },
    {
        place_id: "mobile_store_2",
        name: "Shiva Sai Mobiles",
        vicinity: "Suraram X Roads Suraram, Hyderabad",
        rating: 4.7,
        user_ratings_total: 141,
        photos: [{ photo_reference: "mobile_store_photo_2" }],
        geometry: {
            location: { lat: 17.52, lng: 78.495 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 2.6,
        special_tags: ["Top Search", "Jd Trust", "Quick Response"],
    },
    {
        place_id: "mobile_store_3",
        name: "Mobile Matrix",
        vicinity: "Phase-3 KPHB Colony, Hyderabad",
        rating: 4.6,
        user_ratings_total: 57,
        photos: [{ photo_reference: "mobile_store_photo_3" }],
        geometry: {
            location: { lat: 17.44, lng: 78.42 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 3.8,
        special_tags: ["Trending", "Samsung Dealer"],
    },
    {
        place_id: "mobile_store_4",
        name: "Mobile Matrix",
        vicinity: "Phase-3 KPHB Colony, Hyderabad",
        rating: 4.6,
        user_ratings_total: 57,
        photos: [{ photo_reference: "mobile_store_photo_4" }],
        geometry: {
            location: { lat: 17.49, lng: 78.41 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 1.9,
        special_tags: ["Trending", "Samsung Dealer"],
    },
    {
        place_id: "mobile_store_5",
        name: "Prince Mobiles",
        vicinity: "Gayatri Nagar Ameerpet, Hyderabad",
        rating: 4.1,
        user_ratings_total: 79,
        photos: [{ photo_reference: "mobile_store_photo_5" }],
        geometry: {
            location: { lat: 17.445, lng: 78.445 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 4.5,
        special_tags: ["Responsive", "Sony Dealer"],
    },
    {
        place_id: "mobile_store_6",
        name: "G Kee Communications The Mobile Shoppy",
        vicinity: "Satyam Theatre Road Ameerpet, Hyderabad",
        rating: 3.7,
        user_ratings_total: 26,
        photos: [{ photo_reference: "mobile_store_photo_6" }],
        geometry: {
            location: { lat: 17.438, lng: 78.448 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 4.8,
        special_tags: ["Apple Services", "Unlocking"],
    },
];

// Mobile store images - Electronics and retail themed
const MOBILE_STORE_IMAGES_MAP: { [key: string]: string[] } = {
    mobile_store_1: [
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800", // Mobile store interior
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800", // Smartphone display
        "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800", // Phone accessories
    ],
    mobile_store_2: [
        "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800", // Phone collection
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800", // Store layout
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800", // Mobile phones
    ],
    mobile_store_3: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", // Phones on display
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800", // Retail space
        "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800", // Accessories
    ],
    mobile_store_4: [
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800", // Samsung phones
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", // Phone variety
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800", // Store interior
    ],
    mobile_store_5: [
        "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800", // Sony phones
        "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800", // Mobile display
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800", // Retail layout
    ],
    mobile_store_6: [
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800", // Apple phones
        "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800", // Phone unlocking
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800", // Mobile shop
    ],
};

// Mobile store descriptions
const MOBILE_STORE_DESCRIPTIONS_MAP: { [key: string]: string } = {
    mobile_store_1:
        "Top Search mobile store with 4.7★ rating and 141 reviews. Comprehensive repair services and Samsung phone dealership. Known for quality repairs and authentic mobile phones. Quick response and verified services available.",
    mobile_store_2:
        "Top Search trusted mobile store chain with 4.7★ rating and 141 reviews. Specializes in mobile phone repairs and Samsung devices. Features quick response team and verified dealer status with excellent customer service.",
    mobile_store_3:
        "Trending mobile store with 4.6★ rating and 57 reviews. Diverse range of phones and repair services. Known for quality service and Samsung dealership. Responsive customer support available for all mobile needs.",
    mobile_store_4:
        "Trending mobile retail destination with 4.6★ rating and 57 reviews. Offering phones and repair services. Specializes in Samsung and general mobile phone services. Known for trending deals and quality products.",
    mobile_store_5:
        "Responsive mobile store with 4.1★ rating and 79 reviews. Offering Sony brand specialization and general repairs. Known for quality service in Ameerpet area. Features authentic phones and professional repair services.",
    mobile_store_6:
        "Mobile service center with 3.7★ rating and 26 reviews. Specializing in Apple unlocking and repair services. Comprehensive mobile phone solutions available. Known for technical expertise and quality service.",
};

// Mobile store services
const MOBILE_STORE_SERVICES = [
    "Mobile Phone Repair & Services",
    "Mobile Phone Dealers",
    "Mobile Phone Dealers-Samsung",
    "Mobile Phone Repair & Services-Sony",
    "Mobile Phone Unlocking Services-Apple",
    "Quick Response",
    "Jd Verified",
    "Jd Trust",
];

/* ================= COMPONENT ================= */

interface NearbyMobileCardProps {
    job?: any; // Accept generic job prop for compatibility with ShoppingList
    onViewDetails: (job: any) => void;
}

const SingleMobileCard: React.FC<NearbyMobileCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback like React Native
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "mobile_store_1";
        return (
            MOBILE_STORE_IMAGES_MAP[jobId] || MOBILE_STORE_IMAGES_MAP["mobile_store_1"]
        );
    }, [job]);

    const photos = getPhotos();
    const hasPhotos = photos.length > 0;
    const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

    // Navigate to previous image - Using useCallback like React Native
    const handlePrevImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex > 0) {
                setCurrentImageIndex((prev) => prev - 1);
            }
        },
        [hasPhotos, currentImageIndex]
    );

    // Navigate to next image - Using useCallback like React Native
    const handleNextImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex < photos.length - 1) {
                setCurrentImageIndex((prev) => prev + 1);
            }
        },
        [hasPhotos, currentImageIndex, photos.length]
    );

    // Get mobile store name from job data - Using useCallback like React Native
    const getName = useCallback((): string => {
        if (!job) return "Mobile Store";
        return job.title || "Mobile Store";
    }, [job]);

    // Get location string from job data - Using useCallback like React Native
    const getLocation = useCallback((): string => {
        if (!job) return "Location";
        return job.location || job.description || "Location";
    }, [job]);

    // Get distance string from job data - Using useCallback like React Native
    const getDistance = useCallback((): string => {
        if (!job) return "";
        if (job.distance !== undefined && job.distance !== null) {
            const distanceNum = Number(job.distance);
            if (!isNaN(distanceNum)) {
                return `${distanceNum.toFixed(1)} km away`;
            }
        }
        return "";
    }, [job]);

    // Get description - Using useCallback like React Native
    const getDescription = useCallback((): string => {
        if (!job) return "Quality mobile store with wide range of phones and repair services";
        const jobId = job.id || "mobile_store_1";
        return (
            MOBILE_STORE_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Quality mobile store with wide range of phones and repair services"
        );
    }, [job]);

    // Get rating from job data - Using useCallback like React Native
    const getRating = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.rating || null;
    }, [job]);

    // Get user ratings total from job data - Using useCallback like React Native
    const getUserRatingsTotal = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.user_ratings_total || null;
    }, [job]);

    // Get opening hours status from job data - Using useCallback like React Native
    const getOpeningStatus = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        const isOpen = jobData?.opening_hours?.open_now;

        if (isOpen === undefined || isOpen === null) {
            return null;
        }

        return isOpen ? "Open Now" : "Closed";
    }, [job]);

    // Get phone number for the mobile store - Using useCallback like React Native
    const getPhoneNumber = useCallback((): string | null => {
        if (!job) return null;
        const jobId = job.id || "";
        return PHONE_NUMBERS_MAP[jobId] || null;
    }, [job]);

    // Get services based on mobile store ID - Using useCallback like React Native
    const getServices = useCallback((): string[] => {
        if (!job) return ["Mobile Phone Repair & Services", "Mobile Phone Dealers"];

        // Return different service combinations based on mobile store
        if (job.id === "mobile_store_1") {
            return ["Mobile Phone Repair & Services", "Mobile Phone Dealers"];
        } else if (job.id === "mobile_store_2") {
            return ["Mobile Phone Dealers-Samsung", "Mobile Phone Repair & Services"];
        } else if (job.id === "mobile_store_3") {
            return ["Mobile Phone Repair & Services", "Mobile Phone Dealers"];
        } else if (job.id === "mobile_store_4") {
            return ["Mobile Phone Dealers-Samsung", "Mobile Phone Repair & Services"];
        } else if (job.id === "mobile_store_5") {
            return ["Mobile Phone Repair & Services-Sony", "Mobile Phone Repair & Services"];
        } else if (job.id === "mobile_store_6") {
            return [
                "Mobile Phone Unlocking Services-Apple",
                "Mobile Phone Repair & Services",
            ];
        }
        return ["Mobile Phone Repair & Services", "Mobile Phone Dealers"];
    }, [job]);

    // Get popularity badge - Using useCallback like React Native
    const getPopularityBadge = useCallback((): string | null => {
        if (!job) return null;

        if (job.id === "mobile_store_1" || job.id === "mobile_store_2")
            return "Top Search";
        if (job.id === "mobile_store_3" || job.id === "mobile_store_4")
            return "Trending";
        if (job.id === "mobile_store_5") return "Responsive";

        return null;
    }, [job]);

    // Get special tags from job data - Using useCallback like React Native
    const getSpecialTags = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.special_tags || [];
    }, [job]);

    // Handle call button press - Opens phone dialer
    const handleCall = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!job) return;

            const phoneNumber = getPhoneNumber();
            const name = getName();

            if (!phoneNumber) {
                alert(`No contact number available for ${name}.`);
                return;
            }

            // Format phone number for tel: URL (remove all non-numeric characters)
            const formattedNumber = phoneNumber.replace(/[^0-9+]/g, "");
            const telUrl = `tel:${formattedNumber}`;

            window.location.href = telUrl;
        },
        [job, getPhoneNumber, getName]
    );

    // Handle directions button press - Opens Maps app with exact location
    const handleDirections = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!job) return;

            const jobData = job.jobData as any;
            const lat = jobData?.geometry?.location?.lat;
            const lng = jobData?.geometry?.location?.lng;

            if (!lat || !lng) {
                alert("Unable to get location coordinates for directions.");
                return;
            }

            // Create Google Maps URL with exact coordinates
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${job.id || ""
                }`;

            window.open(googleMapsUrl, "_blank");
        },
        [job]
    );

    // Handle image loading error - Using useCallback like React Native
    const handleImageError = useCallback(() => {
        console.warn("⚠️ Failed to load image for mobile store:", job?.id || "unknown");
        setImageError(true);
    }, [job]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const openingStatus = getOpeningStatus();
    const distance = getDistance();
    const description = getDescription();
    const services = getServices();
    const specialTags = getSpecialTags();
    const visibleServices = services.slice(0, 3);
    const moreServices = services.length > 3 ? services.length - 3 : 0;
    const hasPhoneNumber = getPhoneNumber() !== null;
    const popularityBadge = getPopularityBadge();

    // Early return if job is not provided (after all hooks)
    if (!job) {
        return null;
    }

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[0.99] mb-4"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-100">
                {currentPhoto && !imageError ? (
                    <>
                        <img
                            src={currentPhoto}
                            className="w-full h-full object-cover"
                            alt={getName()}
                            onError={handleImageError}
                        />

                        {/* Image Navigation Arrows */}
                        {hasPhotos && photos.length > 1 && (
                            <>
                                {currentImageIndex > 0 && (
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}

                                {currentImageIndex < photos.length - 1 && (
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                )}

                                {/* Image Counter */}
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                                    {currentImageIndex + 1} / {photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                        <Smartphone size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Mobile Store Name */}
                <h3 className="text-[17px] font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2">
                    {getName()}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="text-[13px] line-clamp-1">{getLocation()}</span>
                </div>

                {/* Distance */}
                {distance && (
                    <p className="text-xs font-semibold text-green-600 mb-2">{distance}</p>
                )}

                {/* Special Tags */}
                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-0.5 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Description */}
                <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
                    {description}
                </p>

                {/* Category Badge */}
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <Smartphone size={12} />
                    <span>Mobile Store</span>
                </div>

                {/* Rating and Status Row */}
                <div className="flex items-center gap-2 mb-2.5">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[13px] font-semibold text-gray-900">
                                {rating.toFixed(1)}
                            </span>
                            {userRatingsTotal && (
                                <span className="text-xs text-gray-500">
                                    ({userRatingsTotal})
                                </span>
                            )}
                        </div>
                    )}

                    {popularityBadge && (
                        <div className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-[11px] font-semibold px-1.5 py-0.5 rounded">
                            {popularityBadge === "Top Search" && <Flame size={11} />}
                            {popularityBadge === "Trending" && <TrendingUp size={11} />}
                            {popularityBadge === "Responsive" && <CheckCircle size={11} />}
                            <span>{popularityBadge}</span>
                        </div>
                    )}

                    {openingStatus && (
                        <div
                            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus === "Open Now"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            <span>{openingStatus}</span>
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
                        SERVICES:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {visibleServices.map((service, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[11px] font-medium px-2 py-1 rounded"
                            >
                                <CheckCircle size={11} />
                                <span>{service}</span>
                            </span>
                        ))}
                        {moreServices > 0 && (
                            <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                                +{moreServices} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 bg-green-50 text-green-700 hover:bg-green-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
                    >
                        <Navigation size={14} />
                        <span>Directions</span>
                    </button>

                    <button
                        onClick={handleCall}
                        disabled={!hasPhoneNumber}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
                            ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
                            : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={14} />
                        <span>Call</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Wrapper component - displays grid of dummy data or single card
const NearbyMobileCard: React.FC<NearbyMobileCardProps> = (props) => {
    // If no job is provided, render the grid of dummy mobile stores
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_MOBILE_STORES.map((store) => (
                    <SingleMobileCard
                        key={store.place_id}
                        job={{
                            id: store.place_id,
                            title: store.name,
                            location: store.vicinity,
                            distance: store.distance,
                            category: "Mobile Store",
                            jobData: {
                                rating: store.rating,
                                user_ratings_total: store.user_ratings_total,
                                opening_hours: store.opening_hours,
                                geometry: store.geometry,
                                business_status: store.business_status,
                                price_level: store.price_level,
                                special_tags: store.special_tags,
                            },
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job is provided, render individual card
    return (
        <SingleMobileCard job={props.job} onViewDetails={props.onViewDetails} />
    );
};

export default NearbyMobileCard;
