/**
 * ============================================================================
 * NearbyHotelsCard.tsx - Detailed Hotel Card Component
 * ============================================================================
 * 
 * Displays detailed hotel information with:
 * - Large image carousel
 * - Full description
 * - Amenities offered
 * - Action buttons (Directions, Call)
 * - Special badges (Verified, Top Search, Trending, Top Rated)
 * 
 * @component NearbyHotelsCard
 * @version 1.0.0 - React Web Version with REAL JUSTDIAL DATA
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
    Bed,
    DollarSign,
    Footprints,
} from "lucide-react";

/* ================= TYPES ================= */

export interface Hotel {
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
    distance_text: string;
    special_tags?: string[];
    amenities?: string[];
    nearby_landmark?: string;
    price_per_night?: string;
}

export interface JobType {
    id: string;
    title: string;
    location?: string;
    description?: string;
    distance?: number;
    category?: string;
    jobData?: any;
}

/* ================= CONSTANTS - EXACT FROM REACT NATIVE ================= */

// Phone numbers map for hotels
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    hotel_1: "08735953260", // Hotel Jays Inn
    hotel_2: "09008535976", // Hotel Svs Luxury Rooms
    hotel_3: "07942695174", // Hotel Swagath
    hotel_4: "07942685838", // Lemonridge Hotels Idpl Balanagar
};

// Export dummy hotel data - REAL JUSTDIAL DATA
export const DUMMY_HOTELS: Hotel[] = [
    {
        place_id: "hotel_1",
        name: "Hotel Jays Inn",
        vicinity: "Quthubullapur Village IDPL, Hyderabad",
        rating: 4.4,
        user_ratings_total: 52,
        photos: [{ photo_reference: "hotel_photo_1" }],
        geometry: {
            location: { lat: 17.52, lng: 78.435 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance_text: "1 km",
        special_tags: ["Verified", "Top Search"],
        amenities: ["Parking Available"],
    },
    {
        place_id: "hotel_2",
        name: "Hotel Svs Luxury Rooms",
        vicinity: "VRK Silks Building Suchitra Cross Road, Hyderabad",
        rating: 3.4,
        user_ratings_total: 189,
        photos: [{ photo_reference: "hotel_photo_2" }],
        geometry: {
            location: { lat: 17.53, lng: 78.44 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance_text: "2.2 km",
        special_tags: ["Responsive"],
        amenities: ["Parking Available", "WiFi", "AC"],
        nearby_landmark: "4 minutes walk to Dr Aravinds Ent & Eye Hospital",
    },
    {
        place_id: "hotel_3",
        name: "Hotel Swagath",
        vicinity: "Kompally Road Jeedimetla, Hyderabad",
        rating: 4.1,
        user_ratings_total: 144,
        photos: [{ photo_reference: "hotel_photo_3" }],
        geometry: {
            location: { lat: 17.525, lng: 78.438 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance_text: "2 km",
        special_tags: ["Trending"],
        amenities: ["Hotels"],
        nearby_landmark: "Less than 2 minutes walk to Dr Aravinds Ent & Eye Hospital",
    },
    {
        place_id: "hotel_4",
        name: "Lemonridge Hotels Idpl Balanagar",
        vicinity: "Ganesh Nagar-Bala Nagar, Hyderabad",
        rating: 4.5,
        user_ratings_total: 113,
        photos: [{ photo_reference: "hotel_photo_4" }],
        geometry: {
            location: { lat: 17.515, lng: 78.432 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 3,
        distance_text: "870 mts",
        price_per_night: "₹2,407",
        special_tags: ["Top Rated"],
        amenities: ["WiFi", "AC", "Restaurant", "Room Service"],
    },
];

// Hotel images
const HOTEL_IMAGES_MAP: { [key: string]: string[] } = {
    hotel_1: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", // Hotel room
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800", // Hotel lobby
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800", // Hotel exterior
    ],
    hotel_2: [
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800", // Luxury room
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800", // Hotel bedroom
        "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800", // Modern hotel
    ],
    hotel_3: [
        "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=800", // Hotel building
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800", // Hotel reception
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800", // Hotel suite
    ],
    hotel_4: [
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800", // Premium hotel
        "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800", // Restaurant
        "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800", // Hotel amenities
    ],
};

// Hotel descriptions
const HOTEL_DESCRIPTIONS_MAP: { [key: string]: string } = {
    hotel_1:
        "Top-rated budget hotel with 4.4★ rating and 52 reviews. Verified and Top Search establishment. Located just 1 km away with parking available. Perfect for comfortable stays.",
    hotel_2:
        "Responsive luxury rooms with 3.4★ rating and 189 reviews. Located 2.2 km away near Dr Aravinds Hospital. Features parking, WiFi, and AC facilities for a comfortable stay.",
    hotel_3:
        "Trending hotel with 4.1★ rating and 144 reviews. Conveniently located 2 km away, less than 2 minutes walk to Dr Aravinds Hospital. Great value for money.",
    hotel_4:
        "Top Rated premium hotel with 4.5★ rating and 113 reviews. Starting at ₹2,407 per night. Located just 870 mts away with modern amenities including WiFi, AC, Restaurant, and Room Service.",
};

// Hotel amenities
const HOTEL_AMENITIES = [
    "WiFi",
    "AC",
    "Parking",
    "Restaurant",
    "Room Service",
    "TV",
    "24/7 Reception",
    "Hot Water",
];

/* ================= COMPONENT ================= */

interface NearbyHotelsCardProps {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

// Single Hotel Card Component
const SingleHotelCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback like React Native
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "hotel_1";
        return HOTEL_IMAGES_MAP[jobId] || HOTEL_IMAGES_MAP["hotel_1"];
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

    // Get hotel name from job data - Using useCallback like React Native
    const getName = useCallback((): string => {
        if (!job) return "Hotel";
        return job.title || "Hotel";
    }, [job]);

    // Get location string from job data - Using useCallback like React Native
    const getLocation = useCallback((): string => {
        if (!job) return "Location";
        return job.location || job.description || "Location";
    }, [job]);

    // Get distance string from job data - Using useCallback like React Native
    const getDistance = useCallback((): string => {
        if (!job) return "";
        const jobData = job.jobData as any;

        // Check for distance_text first (like "1 km", "870 mts")
        if (jobData?.distance_text) {
            return jobData.distance_text;
        }

        // Otherwise use job.distance
        if (job.distance !== undefined && job.distance !== null) {
            const distanceNum = Number(job.distance);
            if (!isNaN(distanceNum)) {
                return `${distanceNum.toFixed(1)} km`;
            }
        }
        return "";
    }, [job]);

    // Get description - Using useCallback like React Native
    const getDescription = useCallback((): string => {
        if (!job) return "Quality hotel accommodation";
        const jobId = job.id || "hotel_1";
        return (
            HOTEL_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Quality hotel accommodation"
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

        return isOpen ? "Open 24 Hours" : "Closed";
    }, [job]);

    // Get special tags from job data - Using useCallback like React Native
    const getSpecialTags = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.special_tags || [];
    }, [job]);

    // Get amenities from job data - Using useCallback like React Native
    const getAmenities = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.amenities || HOTEL_AMENITIES.slice(0, 4);
    }, [job]);

    // Get nearby landmark - Using useCallback like React Native
    const getNearbyLandmark = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.nearby_landmark || null;
    }, [job]);

    // Get price per night - Using useCallback like React Native
    const getPricePerNight = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.price_per_night || null;
    }, [job]);

    // Get phone number for the hotel - Using useCallback like React Native
    const getPhoneNumber = useCallback((): string | null => {
        if (!job) return null;
        const jobId = job.id || "";
        return PHONE_NUMBERS_MAP[jobId] || null;
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

            // Create Google Maps URL with exact coordinates and name
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${job.id || ""}`;

            window.open(googleMapsUrl, "_blank");
        },
        [job]
    );

    // Handle image loading error - Using useCallback like React Native
    const handleImageError = useCallback(() => {
        console.warn("⚠️ Failed to load image for hotel:", job?.id || "unknown");
        setImageError(true);
    }, [job]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const openingStatus = getOpeningStatus();
    const distance = getDistance();
    const description = getDescription();
    const specialTags = getSpecialTags();
    const amenities = getAmenities();
    const nearbyLandmark = getNearbyLandmark();
    const pricePerNight = getPricePerNight();
    const visibleAmenities = amenities.slice(0, 4);
    const moreAmenities = amenities.length > 4 ? amenities.length - 4 : 0;
    const hasPhoneNumber = getPhoneNumber() !== null;

    // Early return if job is not provided (after all hooks)
    if (!job) {
        return null;
    }

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[0.99] mb-4 relative"
        >
            {/* Price Badge (Top Right Corner) */}
            {pricePerNight && (
                <div className="absolute top-3 right-3 bg-blue-600 text-white flex flex-col items-center px-2.5 py-1.5 rounded-lg z-10 shadow-lg">
                    <span className="text-[13px] font-bold">{pricePerNight}</span>
                    <span className="text-[9px] font-medium opacity-90">per night</span>
                </div>
            )}

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
                        <Bed size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Hotel Name */}
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
                    <p className="text-xs font-semibold text-indigo-600 mb-2">{distance}</p>
                )}

                {/* Special Tags */}
                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.map((tag, index) => {
                            let bgClass = "bg-blue-100";
                            let textClass = "text-blue-800";

                            if (tag === "Verified") {
                                bgClass = "bg-green-100";
                                textClass = "text-green-800";
                            } else if (tag === "Top Search") {
                                bgClass = "bg-amber-100";
                                textClass = "text-amber-800";
                            } else if (tag === "Trending") {
                                bgClass = "bg-red-100";
                                textClass = "text-red-800";
                            } else if (tag === "Top Rated") {
                                bgClass = "bg-amber-100";
                                textClass = "text-amber-800";
                            }

                            return (
                                <span
                                    key={index}
                                    className={`inline-flex items-center ${bgClass} ${textClass} text-[10px] font-semibold px-2 py-1 rounded gap-1`}
                                >
                                    {tag === "Verified" && "✓"}
                                    {tag === "Top Search" && "🔍"}
                                    {tag === "Trending" && "📈"}
                                    {tag === "Top Rated" && "⭐"}
                                    {tag}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Nearby Landmark */}
                {nearbyLandmark && (
                    <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 bg-indigo-50 rounded-md">
                        <Footprints size={12} className="text-indigo-600 flex-shrink-0" />
                        <span className="text-[11px] text-indigo-700 font-medium">
                            {nearbyLandmark}
                        </span>
                    </div>
                )}

                {/* Description */}
                <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
                    {description}
                </p>

                {/* Category Badge */}
                <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <Bed size={12} />
                    <span>Hotel</span>
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
                            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                                openingStatus.includes("Open")
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            <Clock size={11} />
                            <span>{openingStatus}</span>
                        </div>
                    )}
                </div>

                {/* Amenities */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
                        AMENITIES:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {visibleAmenities.map((amenity, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 text-[11px] font-medium px-2 py-1 rounded"
                            >
                                <CheckCircle size={11} />
                                <span>{amenity}</span>
                            </span>
                        ))}
                        {moreAmenities > 0 && (
                            <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                                +{moreAmenities} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
                    >
                        <Navigation size={14} />
                        <span>Directions</span>
                    </button>

                    <button
                        onClick={handleCall}
                        disabled={!hasPhoneNumber}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${
                            hasPhoneNumber
                                ? "border-emerald-600 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
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

// Main Component - displays grid of dummy data or single card
const NearbyHotelsCard: React.FC<NearbyHotelsCardProps> = (props) => {
    // If no job is provided, render the grid of dummy hotels
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_HOTELS.map((hotel) => (
                    <SingleHotelCard
                        key={hotel.place_id}
                        job={{
                            id: hotel.place_id,
                            title: hotel.name,
                            location: hotel.vicinity,
                            category: "Hotel",
                            jobData: {
                                rating: hotel.rating,
                                user_ratings_total: hotel.user_ratings_total,
                                opening_hours: hotel.opening_hours,
                                geometry: hotel.geometry,
                                business_status: hotel.business_status,
                                price_level: hotel.price_level,
                                distance_text: hotel.distance_text,
                                special_tags: hotel.special_tags,
                                amenities: hotel.amenities,
                                nearby_landmark: hotel.nearby_landmark,
                                price_per_night: hotel.price_per_night,
                            },
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job is provided, render individual card
    return <SingleHotelCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyHotelsCard;
