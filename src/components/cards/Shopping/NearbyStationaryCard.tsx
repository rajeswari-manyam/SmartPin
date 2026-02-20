/**
 * ============================================================================
 * NearbyStationaryCard.tsx - Detailed Stationery Shop Card for Shopping
 * ============================================================================
 * 
 * Displays detailed stationery shop information with:
 * - Large image carousel
 * - Full description
 * - Opening hours
 * - Services offered
 * - Action buttons (Call & Directions)
 * 
 * @component NearbyStationaryCard
 * @version 2.0.0 - STATIONERY SHOPS ONLY (React + Tailwind)
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
    BookOpen,
    Flame,
    Tag,
    Zap,
} from "lucide-react";

/* ================= TYPES ================= */

export interface StationeryShop {
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

// Phone numbers map for stationery shops (based on JustDial data)
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    stationary_shop_1: "07947132379", // Sri Sai Stationery & Book Stall
    stationary_shop_2: "07947104632", // Venkataramana Stationery And Xerox
    stationary_shop_3: "07942691067", // Vinayaka Books And Stationary
    stationary_shop_4: "07942684947", // Jagadama Stationery
};

// Export dummy stationery shop data - EXACT FROM REACT NATIVE
export const DUMMY_STATIONARY_SHOPS: StationeryShop[] = [
    {
        place_id: "stationary_shop_1",
        name: "Sri Sai Stationery & Book Stall",
        vicinity: "HMT Road Lane Chintal, Hyderabad",
        rating: 4.1,
        user_ratings_total: 58,
        photos: [{ photo_reference: "stationary_shop_photo_1" }],
        geometry: {
            location: { lat: 17.51, lng: 78.42 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 1,
        distance: 1.2,
    },
    {
        place_id: "stationary_shop_2",
        name: "Venkataramana Stationery And Xerox",
        vicinity: "Mahalaxmi Complex Chintal, Hyderabad",
        rating: 4.3,
        user_ratings_total: 20,
        photos: [{ photo_reference: "stationary_shop_photo_2" }],
        geometry: {
            location: { lat: 17.505, lng: 78.415 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 1,
        distance: 2.6,
    },
    {
        place_id: "stationary_shop_3",
        name: "Vinayaka Books And Stationary",
        vicinity: "KM Pratap Estates Chintal, Hyderabad",
        rating: 3.9,
        user_ratings_total: 17,
        photos: [{ photo_reference: "stationary_shop_photo_3" }],
        geometry: {
            location: { lat: 17.508, lng: 78.418 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 1,
        distance: 3.1,
    },
    {
        place_id: "stationary_shop_4",
        name: "Jagadama Stationery",
        vicinity: "Mn Reddy Nagar Chintal, Hyderabad",
        rating: 3.9,
        user_ratings_total: 9,
        photos: [{ photo_reference: "stationary_shop_photo_4" }],
        geometry: {
            location: { lat: 17.512, lng: 78.422 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 1,
        distance: 1.8,
    },
];

// Stationery shop images - Books, office supplies, and stationery themed
const STATIONARY_SHOP_IMAGES_MAP: { [key: string]: string[] } = {
    stationary_shop_1: [
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800", // Books on shelf
        "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800", // Office supplies
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800", // Stationery store
    ],
    stationary_shop_2: [
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800", // Books and supplies
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800", // Pens and pencils
        "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=800", // Stationery items
    ],
    stationary_shop_3: [
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800", // Books collection
        "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800", // Colorful stationery
        "https://images.unsplash.com/photo-1553095066-5014bc7b7f2d?w=800", // Office supplies
    ],
    stationary_shop_4: [
        "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?w=800", // Bookshelf
        "https://images.unsplash.com/photo-1509266272358-7701da638078?w=800", // Stationery supplies
        "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800", // Shop interior
    ],
};

// Stationery shop descriptions
const STATIONARY_SHOP_DESCRIPTIONS_MAP: { [key: string]: string } = {
    stationary_shop_1:
        "Top-rated stationery and book store with 4.1★ rating and 58 reviews. Wide range of office supplies, books, and school materials. Features same-day delivery and shop-in-store services. Known for excellent customer service and quality products.",
    stationary_shop_2:
        "Popular stationery shop with 4.3★ rating and 20 reviews. Xerox facilities available. Comprehensive range of stationery items and photocopying services. Trusted by local businesses and students for reliable service.",
    stationary_shop_3:
        "Complete books and stationery destination with 3.9★ rating and 17 reviews. Diverse collection of educational materials, office supplies, and gift items. Same-day delivery and shop-in-store services available for customer convenience.",
    stationary_shop_4:
        "Neighborhood stationery store with 3.9★ rating and 9 reviews. Essential office and school supplies available. Known for competitive prices and shop-in-store availability. Convenient location for local residents and businesses.",
};

// Stationery shop services based on JustDial data
const STATIONARY_SHOP_SERVICES_MAP: { [key: string]: string[] } = {
    stationary_shop_1: ["Same Day Delivery", "Delivery Available", "Shop In Store"],
    stationary_shop_2: ["Stationery Shops", "Xerox Services"],
    stationary_shop_3: ["Same Day Delivery", "Delivery Available", "Shop In Store"],
    stationary_shop_4: ["Shop In Store"],
};

/* ================= COMPONENT ================= */

interface NearbyStationaryCardProps {
    job?: any; // Accept generic job prop for compatibility with ShoppingList
    onViewDetails: (job: any) => void;
}

const SingleStationeryCard: React.FC<NearbyStationaryCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback like React Native
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "stationary_shop_1";
        return (
            STATIONARY_SHOP_IMAGES_MAP[jobId] ||
            STATIONARY_SHOP_IMAGES_MAP["stationary_shop_1"]
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

    // Get stationery shop name from job data - Using useCallback like React Native
    const getName = useCallback((): string => {
        if (!job) return "Stationery Shop";
        return job.title || "Stationery Shop";
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
            return "Complete stationery destination with wide range of office supplies, books, and school materials";
        const jobId = job.id || "stationary_shop_1";
        return (
            STATIONARY_SHOP_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Complete stationery destination with wide range of office supplies, books, and school materials"
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

    // Get phone number for the stationery shop - Using useCallback like React Native
    const getPhoneNumber = useCallback((): string | null => {
        if (!job) return null;
        const jobId = job.id || "";
        return PHONE_NUMBERS_MAP[jobId] || null;
    }, [job]);

    // Get services based on stationery shop ID - Using useCallback like React Native
    const getServices = useCallback((): string[] => {
        if (!job) return ["Shop In Store", "Delivery Available"];
        return STATIONARY_SHOP_SERVICES_MAP[job.id] || ["Shop In Store", "Delivery Available"];
    }, [job]);

    // Get popularity badge based on ratings - Using useCallback like React Native
    const getPopularityBadge = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        const ratingsTotal = jobData?.user_ratings_total;
        const rating = jobData?.rating;

        // Top Search badge for highest rated shop
        if (job.id === "stationary_shop_1") return "Top Search";

        // Popular badge for shops with good ratings
        if (job.id === "stationary_shop_2") return "Popular";

        // Quick Response badge if available
        if (rating && rating >= 4.0 && ratingsTotal && ratingsTotal > 15)
            return "Quick Response";

        return null;
    }, [job]);

    // Get special offers badge - Using useCallback like React Native
    const getOfferBadge = useCallback((): string | null => {
        if (!job) return null;
        // Special offer for top-rated shops
        if (job.id === "stationary_shop_1") return "2 Offers";

        return null;
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
            "⚠️ Failed to load image for stationery shop:",
            job?.id || "unknown"
        );
        setImageError(true);
    }, [job]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const distance = getDistance();
    const description = getDescription();
    const services = getServices();
    const visibleServices = services.slice(0, 3);
    const moreServices = services.length > 3 ? services.length - 3 : 0;
    const hasPhoneNumber = getPhoneNumber() !== null;
    const popularityBadge = getPopularityBadge();
    const offerBadge = getOfferBadge();

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

                        {/* Offer Badge */}
                        {offerBadge && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-xl">
                                <Tag size={12} />
                                <span>{offerBadge}</span>
                            </div>
                        )}

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
                        <BookOpen size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Shop Name */}
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
                    <p className="text-xs font-semibold text-blue-600 mb-2">{distance}</p>
                )}

                {/* Description */}
                <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
                    {description}
                </p>

                {/* Category Badge */}
                <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <BookOpen size={12} />
                    <span>Stationery Shop</span>
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
                        <div
                            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${popularityBadge === "Quick Response"
                                    ? "bg-green-100 text-green-700"
                                    : popularityBadge === "Popular"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-blue-100 text-blue-700"
                                }`}
                        >
                            {popularityBadge === "Top Search" && <Flame size={11} />}
                            {popularityBadge === "Popular" && <Star size={11} />}
                            {popularityBadge === "Quick Response" && <Zap size={11} />}
                            <span>{popularityBadge}</span>
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
                                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[11px] font-medium px-2 py-1 rounded"
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
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
                    >
                        <Navigation size={14} />
                        <span>Directions</span>
                    </button>

                    <button
                        onClick={handleCall}
                        disabled={!hasPhoneNumber}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
                                ? "border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100"
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
const NearbyStationaryCard: React.FC<NearbyStationaryCardProps> = (props) => {
    // If no job is provided, render the grid of dummy stationery shops
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_STATIONARY_SHOPS.map((shop) => (
                    <SingleStationeryCard
                        key={shop.place_id}
                        job={{
                            id: shop.place_id,
                            title: shop.name,
                            location: shop.vicinity,
                            distance: shop.distance,
                            category: "Stationery Shop",
                            jobData: {
                                rating: shop.rating,
                                user_ratings_total: shop.user_ratings_total,
                                opening_hours: shop.opening_hours,
                                geometry: shop.geometry,
                                business_status: shop.business_status,
                                price_level: shop.price_level,
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
        <SingleStationeryCard
            job={props.job}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default NearbyStationaryCard;
