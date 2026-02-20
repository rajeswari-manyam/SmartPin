/**
 * ============================================================================
 * NearbySupermarketCard.tsx - Detailed Supermarket Card for Shopping
 * ============================================================================
 * 
 * Displays detailed supermarket information with:
 * - Large image carousel
 * - Full description
 * - Opening hours
 * - Services offered
 * - Action buttons (Call & Directions)
 * 
 * @component NearbySupermarketCard
 * @version 2.0.0 - SUPERMARKETS ONLY (React + Tailwind)
 */

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
    ShoppingCart,
} from "lucide-react";

/* ================= TYPES ================= */

export interface Supermarket {
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
}

/* ================= CONSTANTS - EXACT FROM REACT NATIVE ================= */

// Phone numbers map for supermarkets (based on JustDial data)
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    supermarket_1: "08197558062", // Adwika Foods
    supermarket_2: "08460495558", // Masqati Supermarket
    supermarket_3: "07947150013", // Spencer's Daily Store
    supermarket_4: "07947113473", // Sri Dariyav Super Market
};

// Export dummy supermarket data - EXACT FROM REACT NATIVE
export const DUMMY_SUPERMARKETS: Supermarket[] = [
    {
        place_id: "supermarket_1",
        name: "Adwika Foods",
        vicinity: "Balaiah Nagar SAI Baba Nagar Alwal, Hyderabad",
        rating: 3.8,
        user_ratings_total: 22,
        photos: [{ photo_reference: "supermarket_photo_1" }],
        geometry: {
            location: { lat: 17.515, lng: 78.525 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 1.5,
    },
    {
        place_id: "supermarket_2",
        name: "Masqati Supermarket (Main Branch)",
        vicinity: "Opposite Sohail Hotel Malakpet, Hyderabad",
        rating: 4.1,
        user_ratings_total: 311,
        photos: [{ photo_reference: "supermarket_photo_2" }],
        geometry: {
            location: { lat: 17.385, lng: 78.505 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 2.8,
    },
    {
        place_id: "supermarket_3",
        name: "Spencer's Daily Store",
        vicinity: "Kompally Suchitra Cross Road, Hyderabad",
        rating: 3.8,
        user_ratings_total: 618,
        photos: [{ photo_reference: "supermarket_photo_3" }],
        geometry: {
            location: { lat: 17.54, lng: 78.49 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 3.2,
    },
    {
        place_id: "supermarket_4",
        name: "Sri Dariyav Super Market",
        vicinity: "Nanda Nagar Bala Nagar, Hyderabad",
        rating: 3.9,
        user_ratings_total: 512,
        photos: [{ photo_reference: "supermarket_photo_4" }],
        geometry: {
            location: { lat: 17.465, lng: 78.54 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 4.1,
    },
];

// Supermarket images - Grocery and retail themed
const SUPERMARKET_IMAGES_MAP: { [key: string]: string[] } = {
    supermarket_1: [
        "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800", // Modern grocery store
        "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800", // Grocery aisles
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=800", // Fresh produce
    ],
    supermarket_2: [
        "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?w=800", // Supermarket interior
        "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800", // Shopping cart
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800", // Grocery shelves
    ],
    supermarket_3: [
        "https://images.unsplash.com/photo-1556740758-90de374c12ad?w=800", // Modern retail
        "https://images.unsplash.com/photo-1534723328310-e82dad3ee43f?w=800", // Organic section
        "https://images.unsplash.com/photo-1579113800032-c38bd7635818?w=800", // Fresh vegetables
    ],
    supermarket_4: [
        "https://images.unsplash.com/photo-1588964895597-cfccd6e2dbf9?w=800", // Store layout
        "https://images.unsplash.com/photo-1601599561213-832382fd07ba?w=800", // Shopping experience
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800", // Food products
    ],
};

// Supermarket descriptions
const SUPERMARKET_DESCRIPTIONS_MAP: { [key: string]: string } = {
    supermarket_1:
        "Local supermarket with 3.8★ rating and 22 reviews. Offering fresh groceries, household items, and daily essentials. Known for quality products and friendly service. Convenient location for neighborhood shopping.",
    supermarket_2:
        "Large supermarket chain with 4.1★ rating and 311 reviews. Wide variety of products including fresh produce, packaged foods, and household goods. Offers home delivery and in-store collection services. Responsive customer service available.",
    supermarket_3:
        "Spencer's retail chain with 3.8★ rating and 618 reviews. Offering fresh groceries, organic products, and daily essentials. Features home delivery service for convenient shopping. Popular choice for quality products.",
    supermarket_4:
        "Well-stocked neighborhood supermarket with 3.9★ rating and 512 reviews. Fresh produce, groceries, and household items available. Offers same-day delivery and shop-in-store options. Great for daily shopping needs.",
};

// Supermarket services
const SUPERMARKET_SERVICES = [
    "Home Delivery",
    "In Store Collect",
    "Same Day Delivery",
    "Shop In Store",
    "No Contact Delivery",
    "Delivery Available",
];

/* ================= COMPONENT ================= */

interface NearbySupermarketCardProps {
    job?: any; // Accept generic job prop for compatibility with ShoppingList
    onViewDetails: (job: any) => void;
}

const SingleSupermarketCard: React.FC<NearbySupermarketCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback like React Native
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "supermarket_1";
        return (
            SUPERMARKET_IMAGES_MAP[jobId] ||
            SUPERMARKET_IMAGES_MAP["supermarket_1"]
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

    // Get supermarket name from job data - Using useCallback like React Native
    const getName = useCallback((): string => {
        if (!job) return "Supermarket";
        return job.title || "Supermarket";
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
        if (!job)
            return "Quality supermarket with fresh groceries and daily essentials";
        const jobId = job.id || "supermarket_1";
        return (
            SUPERMARKET_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Quality supermarket with fresh groceries and daily essentials"
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

        return isOpen ? "Open" : "Closed";
    }, [job]);

    // Get phone number for the supermarket - Using useCallback like React Native
    const getPhoneNumber = useCallback((): string | null => {
        if (!job) return null;
        const jobId = job.id || "";
        return PHONE_NUMBERS_MAP[jobId] || null;
    }, [job]);

    // Get services based on supermarket ID - Using useCallback like React Native
    const getServices = useCallback((): string[] => {
        if (!job) return ["Home Delivery", "Shop In Store"];

        // Return different service combinations based on supermarket
        if (job.id === "supermarket_1") {
            return ["Home Delivery", "Shop In Store"];
        } else if (job.id === "supermarket_2") {
            return ["Home Delivery", "In Store Collect", "No Contact Delivery"];
        } else if (job.id === "supermarket_3") {
            return ["Home Delivery"];
        } else if (job.id === "supermarket_4") {
            return ["Same Day Delivery", "Shop In Store", "Delivery Available"];
        }
        return ["Home Delivery", "Shop In Store"];
    }, [job]);

    // Determine closing time based on supermarket ID - Using useCallback like React Native
    const getClosingTime = useCallback((): string => {
        if (!job) return "22:00";
        if (job.id === "supermarket_1") return "22:00"; // Adwika Foods
        if (job.id === "supermarket_2") return "23:00"; // Masqati Supermarket
        if (job.id === "supermarket_3") return "22:30"; // Spencer's
        if (job.id === "supermarket_4") return "22:00"; // Sri Dariyav
        return "22:00"; // Default
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
        console.warn(
            "⚠️ Failed to load image for supermarket:",
            job?.id || "unknown"
        );
        setImageError(true);
    }, [job]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const openingStatus = getOpeningStatus();
    const distance = getDistance();
    const description = getDescription();
    const services = getServices();
    const visibleServices = services.slice(0, 3);
    const moreServices = services.length > 3 ? services.length - 3 : 0;
    const hasPhoneNumber = getPhoneNumber() !== null;
    const closingTime = getClosingTime();

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
                        <ShoppingCart size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Supermarket Name */}
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
                    <p className="text-xs font-semibold text-green-600 mb-2">
                        {distance}
                    </p>
                )}

                {/* Description */}
                <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
                    {description}
                </p>

                {/* Category Badge */}
                <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <ShoppingCart size={12} />
                    <span>{job.category || "Supermarket"}</span>
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

                    {openingStatus && (
                        <div
                            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus === "Open"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}
                        >
                            <Clock size={11} />
                            <span>
                                {openingStatus}
                                {openingStatus === "Open" && ` · Closes ${closingTime}`}
                            </span>
                        </div>
                    )}
                </div>

                {/* Services */}
                {services.length > 0 && (
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
                )}

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
const NearbySupermarketCard: React.FC<NearbySupermarketCardProps> = (
    props
) => {
    // If no job is provided, render the grid of dummy supermarkets
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_SUPERMARKETS.map((supermarket) => (
                    <SingleSupermarketCard
                        key={supermarket.place_id}
                        job={{
                            id: supermarket.place_id,
                            title: supermarket.name,
                            location: supermarket.vicinity,
                            distance: supermarket.distance,
                            category: "Supermarket",
                            jobData: {
                                rating: supermarket.rating,
                                user_ratings_total: supermarket.user_ratings_total,
                                opening_hours: supermarket.opening_hours,
                                geometry: supermarket.geometry,
                                business_status: supermarket.business_status,
                                price_level: supermarket.price_level,
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
        <SingleSupermarketCard
            job={props.job}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default NearbySupermarketCard;
