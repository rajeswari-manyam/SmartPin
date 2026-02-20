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
    Heart,
    MessageCircle,
} from "lucide-react";

/* ================= TYPES ================= */

export interface NursingService {
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
    distance: number;
    special_tags?: string[];
    customer_review?: string;
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

// Phone numbers map for nursing services
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    nursing_1: "07383516825",
    nursing_2: "08401345295",
    nursing_3: "07041590314",
    nursing_4: "07411809617",
    nursing_5: "09876543210",
};

// Export dummy nursing data - EXACT FROM REACT NATIVE
export const DUMMY_NURSING_SERVICES: NursingService[] = [
    {
        place_id: "nursing_1",
        name: "JYOTHI PATIENT CARE CENTRE & HOME NURSING SERVICE",
        vicinity: "Opp Staro Hotel Enikepadu, Vijayawada",
        rating: 4.7,
        user_ratings_total: 248,
        photos: [{ photo_reference: "nursing_photo_1" }],
        geometry: {
            location: { lat: 16.5062, lng: 80.648 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["nursing_service", "health", "home_care"],
        special_tags: ["Top Search", "Trust", "Verified", "Great customer service"],
        customer_review: '"Great customer service" 42 Suggestions',
        distance: 1.4,
    },
    {
        place_id: "nursing_2",
        name: "Prasanna Old Age Home & Home Nursing Care Service",
        vicinity: "Christurajpuram Road Moghalraja Puram, Vijayawada",
        rating: 4.5,
        user_ratings_total: 340,
        photos: [{ photo_reference: "nursing_photo_2" }],
        geometry: {
            location: { lat: 16.507, lng: 80.6485 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["nursing_service", "health", "home_care", "old_age_home"],
        special_tags: ["Popular", "Trust", "Verified", "Great customer service"],
        customer_review: '"Great customer service" 26 Suggestions',
        distance: 2.2,
    },
    {
        place_id: "nursing_3",
        name: "AMMA NANNA HOME NURSING CARE SERVICES",
        vicinity: "Gundu Kottaya ST Naidupet, Vijayawada",
        rating: 4.0,
        user_ratings_total: 42,
        photos: [{ photo_reference: "nursing_photo_3" }],
        geometry: {
            location: { lat: 16.508, lng: 80.649 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["nursing_service", "health", "home_care"],
        special_tags: ["Responsive", "Trust", "Verified", "Easy booking"],
        customer_review: '"Easy booking" 15 Suggestions',
        distance: 1.7,
    },
    {
        place_id: "nursing_4",
        name: "Dokka Sitamma Old Age Home & Nursing Services",
        vicinity: "Brts Road Satyanarayanapuram, Vijayawada",
        rating: 3.5,
        user_ratings_total: 79,
        photos: [{ photo_reference: "nursing_photo_4" }],
        geometry: {
            location: { lat: 16.509, lng: 80.65 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["nursing_service", "health", "home_care", "old_age_home"],
        special_tags: ["Nursing services", "Home care", "Old Age Home"],
        distance: 2.8,
    },
    {
        place_id: "nursing_5",
        name: "Care Plus Home Nursing Services",
        vicinity: "Gandhi Nagar Vijayawada, Vijayawada",
        rating: 4.3,
        user_ratings_total: 156,
        photos: [{ photo_reference: "nursing_photo_5" }],
        geometry: {
            location: { lat: 16.5075, lng: 80.6495 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["nursing_service", "health", "home_care"],
        special_tags: ["24/7 Service", "Professional Staff", "Verified", "Responsive"],
        distance: 1.9,
    },
];

// Nursing service images
const NURSING_IMAGES_MAP: { [key: string]: string[] } = {
    nursing_1: [
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800",
        "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=800",
    ],
    nursing_2: [
        "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=800",
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800",
    ],
    nursing_3: [
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800",
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
        "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=800",
    ],
    nursing_4: [
        "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=800",
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800",
    ],
    nursing_5: [
        "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800",
        "https://images.unsplash.com/photo-1584515933487-779824d29309?w=800",
        "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=800",
    ],
};

// Nursing service descriptions
const NURSING_DESCRIPTIONS_MAP: { [key: string]: string } = {
    nursing_1:
        "Top rated nursing service with 4.7★ rating and 248 reviews. Verified and Trusted. Great customer service with 42 suggestions. Professional home nursing and patient care services available.",
    nursing_2:
        "Popular nursing and old age home service with 4.5★ rating and 340 reviews. Verified and Trusted. Great customer service with 26 suggestions. Specialized in elderly care and home nursing.",
    nursing_3:
        "Responsive nursing service with 4.0★ rating and 42 reviews. Verified and Trusted. Easy booking with 15 suggestions. Dedicated home nursing care services available.",
    nursing_4:
        "Nursing and old age home service with 3.5★ rating and 79 reviews. Comprehensive nursing services for elderly and patients. Professional care facility available.",
    nursing_5:
        "Professional nursing service with 4.3★ rating and 156 reviews. 24/7 Service available. Verified and Responsive. Professional staff for all nursing care needs.",
};

// Nursing services offered
const NURSING_SERVICES = [
    "Home Nursing Services",
    "Patient Care Taker Services",
    "ICU Care",
    "Post-Surgery Care",
    "Elderly Care",
    "Medical Assistance",
    "Physiotherapy",
    "24/7 Availability",
];

/* ================= COMPONENT ================= */

interface NearbyNursingServiceCardProps {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

// Single Nursing Service Card Component
const SingleNursingServiceCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback like React Native
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "nursing_1";
        return NURSING_IMAGES_MAP[jobId] || NURSING_IMAGES_MAP["nursing_1"];
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

    // Get nursing service name from job data - Using useCallback like React Native
    const getName = useCallback((): string => {
        if (!job) return "Nursing Service";
        return job.title || "Nursing Service";
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
        if (!job) return "Professional nursing services";
        const jobId = job.id || "nursing_1";
        return (
            NURSING_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Professional nursing services"
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

        return isOpen ? "Available Now" : "Currently Unavailable";
    }, [job]);

    // Get special tags from job data - Using useCallback like React Native
    const getSpecialTags = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.special_tags || [];
    }, [job]);

    // Get customer review from job data - Using useCallback like React Native
    const getCustomerReview = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.customer_review || null;
    }, [job]);

    // Get phone number for the nursing service - Using useCallback like React Native
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
        console.warn(
            "⚠️ Failed to load image for nursing service:",
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
    const specialTags = getSpecialTags();
    const customerReview = getCustomerReview();
    const visibleServices = NURSING_SERVICES.slice(0, 4);
    const moreServices =
        NURSING_SERVICES.length > 4 ? NURSING_SERVICES.length - 4 : 0;
    const hasPhoneNumber = getPhoneNumber() !== null;

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
                        <Heart size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Nursing Service Name */}
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
                    <p className="text-xs font-semibold text-purple-600 mb-2">{distance}</p>
                )}

                {/* Special Tags */}
                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.slice(0, 4).map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-1 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Customer Review */}
                {customerReview && (
                    <div className="flex items-center gap-1 mb-2">
                        <MessageCircle size={12} className="text-green-600 flex-shrink-0" />
                        <span className="text-xs text-green-600 font-medium line-clamp-1">
                            {customerReview}
                        </span>
                    </div>
                )}

                {/* Description */}
                <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
                    {description}
                </p>

                {/* Category Badge */}
                <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <Heart size={12} />
                    <span>Nursing Service</span>
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
                            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus.includes("Available")
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={11} />
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
                                className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 text-[11px] font-medium px-2 py-1 rounded"
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
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
                    >
                        <Navigation size={14} />
                        <span>Directions</span>
                    </button>

                    <button
                        onClick={handleCall}
                        disabled={!hasPhoneNumber}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
                            ? "border-green-600 bg-green-50 text-green-600 hover:bg-green-100"
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
const NearbyNursingServiceCard: React.FC<NearbyNursingServiceCardProps> = (props) => {
    // If no job is provided, render the grid of dummy nursing services
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_NURSING_SERVICES.map((nursing) => (
                    <SingleNursingServiceCard
                        key={nursing.place_id}
                        job={{
                            id: nursing.place_id,
                            title: nursing.name,
                            location: nursing.vicinity,
                            distance: nursing.distance,
                            category: "Nursing Service",
                            jobData: {
                                rating: nursing.rating,
                                user_ratings_total: nursing.user_ratings_total,
                                opening_hours: nursing.opening_hours,
                                geometry: nursing.geometry,
                                business_status: nursing.business_status,
                                price_level: nursing.price_level,
                                types: nursing.types,
                                special_tags: nursing.special_tags,
                                customer_review: nursing.customer_review,
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
        <SingleNursingServiceCard job={props.job} onViewDetails={props.onViewDetails} />
    );
};

export default NearbyNursingServiceCard;
