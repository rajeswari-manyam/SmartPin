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
    Pill,
    Tag,
} from "lucide-react";

/* ================= TYPES ================= */

export interface Pharmacy {
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
    opening_hours: {
        open_now: boolean;
        hours?: string;
    };
    distance_text: string;
    price_level: number;
    types: string[];
    special_tags?: string[];
    has_offers?: boolean;
    offers_count?: number;
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

// Phone numbers map for pharmacies
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    pharmacy_1: "07947138128",
    pharmacy_2: "08466073309",
    pharmacy_3: "07947124747",
    pharmacy_4: "07947149109",
    pharmacy_5: "07947144343",
};

// Export dummy pharmacy data - EXACT FROM REACT NATIVE
export const DUMMY_PHARMACIES: Pharmacy[] = [
    {
        place_id: "pharmacy_1",
        name: "Health Care Medical Shop",
        vicinity: "Ring Road Chintal, Hyderabad",
        rating: 3.8,
        user_ratings_total: 106,
        photos: [{ photo_reference: "pharmacy_photo_1" }],
        geometry: {
            location: { lat: 17.4945, lng: 78.4066 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: true,
            hours: "8:00 am - 10:00 pm",
        },
        distance_text: "840 mts",
        price_level: 2,
        types: ["pharmacy", "medical_shop", "health"],
        special_tags: ["Easy Replacement", "Fast Check Out"],
    },
    {
        place_id: "pharmacy_2",
        name: "Apollo Pharmacy",
        vicinity: "HMT Road Chintal, Hyderabad",
        rating: 3.8,
        user_ratings_total: 67,
        photos: [{ photo_reference: "pharmacy_photo_2" }],
        geometry: {
            location: { lat: 17.495, lng: 78.407 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: true,
            hours: "24 Hours",
        },
        distance_text: "1 km",
        price_level: 2,
        types: ["pharmacy", "medical_shop", "health"],
        special_tags: ["6 Offers"],
        has_offers: true,
        offers_count: 6,
    },
    {
        place_id: "pharmacy_3",
        name: "Sri Ganesh Medical & General Store",
        vicinity: "Srinivasa Nagar Chintal, Hyderabad",
        rating: 3.9,
        user_ratings_total: 23,
        photos: [{ photo_reference: "pharmacy_photo_3" }],
        geometry: {
            location: { lat: 17.4955, lng: 78.4075 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: true,
            hours: "9:00 am - 9:00 pm",
        },
        distance_text: "720 mts",
        price_level: 2,
        types: ["pharmacy", "medical_shop", "general_store"],
        special_tags: ["Delivery Available"],
    },
    {
        place_id: "pharmacy_4",
        name: "Arogya Plus Pharmacy (Generic Medical Shop)",
        vicinity: "05189 / 84 & 85 Chinthal Hyderabad Chandra Nagar, Hyderabad",
        rating: 4.2,
        user_ratings_total: 9,
        photos: [{ photo_reference: "pharmacy_photo_4" }],
        geometry: {
            location: { lat: 17.496, lng: 78.408 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: true,
            hours: "8:00 am - 11:00 pm",
        },
        distance_text: "1.1 km",
        price_level: 1,
        types: ["pharmacy", "medical_shop", "generic_medicines"],
        special_tags: ["Chemists", "Generic Medicines"],
    },
    {
        place_id: "pharmacy_5",
        name: "Aditya Pharmacy",
        vicinity: "Chandra Nagar Balanagar Idpl Colony, Hyderabad",
        rating: 4.0,
        user_ratings_total: 9,
        photos: [{ photo_reference: "pharmacy_photo_5" }],
        geometry: {
            location: { lat: 17.4965, lng: 78.4085 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: true,
            hours: "7:00 am - 11:00 pm",
        },
        distance_text: "1 km",
        price_level: 2,
        types: ["pharmacy", "medical_shop", "health"],
        special_tags: ["Chemists", "Condom Dealers"],
    },
];

// Pharmacy images
const PHARMACY_IMAGES_MAP: { [key: string]: string[] } = {
    pharmacy_1: [
        "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800",
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800",
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800",
    ],
    pharmacy_2: [
        "https://images.unsplash.com/photo-1631549916768-4119b2e5f926?w=800",
        "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800",
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800",
    ],
    pharmacy_3: [
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800",
        "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800",
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800",
    ],
    pharmacy_4: [
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800",
        "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800",
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800",
    ],
    pharmacy_5: [
        "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=800",
        "https://images.unsplash.com/photo-1576602976047-174e57a47881?w=800",
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=800",
    ],
};

// Pharmacy descriptions
const PHARMACY_DESCRIPTIONS_MAP: { [key: string]: string } = {
    pharmacy_1:
        "Health Care Medical Shop with 3.8★ rating and 106 reviews. Located 840 mts away. Easy Replacement and Fast Check Out available. Open from 8:00 am - 10:00 pm.",
    pharmacy_2:
        "Apollo Pharmacy with 3.8★ rating and 67 reviews. 6 Offers available. Open 24 Hours for your convenience. Located 1 km away.",
    pharmacy_3:
        "Sri Ganesh Medical & General Store with 3.9★ rating and 23 reviews. Delivery Available. Quality medicines and general store items. Open 9:00 am - 9:00 pm. Located 720 mts away.",
    pharmacy_4:
        "Arogya Plus Pharmacy specializing in Generic Medicines with 4.2★ rating and 9 reviews. Affordable generic medical shop. Open 8:00 am - 11:00 pm. Located 1.1 km away.",
    pharmacy_5:
        "Aditya Pharmacy with 4.0★ rating and 9 reviews. Comprehensive chemist services. Open 7:00 am - 11:00 pm daily. Located 1 km away.",
};

// Pharmacy services offered
const PHARMACY_SERVICES = [
    "Prescription Medicines",
    "OTC Medicines",
    "Generic Medicines",
    "Health Supplements",
    "Medical Equipment",
    "Personal Care",
    "Baby Care",
    "Home Delivery",
];

/* ================= COMPONENT ================= */

interface NearbyPharmaciesCardProps {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

// Single Pharmacy Card Component
const SinglePharmacyCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback like React Native
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "pharmacy_1";
        return PHARMACY_IMAGES_MAP[jobId] || PHARMACY_IMAGES_MAP["pharmacy_1"];
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

    // Get pharmacy name from job data - Using useCallback like React Native
    const getName = useCallback((): string => {
        if (!job) return "Pharmacy";
        return job.title || "Pharmacy";
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

        // Check for distance_text first (like "840 mts", "1 km")
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
        if (!job) return "Professional pharmacy services with quality medicines";
        const jobId = job.id || "pharmacy_1";
        return (
            PHARMACY_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Professional pharmacy services with quality medicines"
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

        // Check for hours string
        if (jobData?.opening_hours?.hours) {
            return jobData.opening_hours.hours;
        }

        // Check if open now
        const isOpen = jobData?.opening_hours?.open_now;
        if (isOpen === undefined || isOpen === null) {
            return null;
        }

        return isOpen ? "Open Now" : "Currently Closed";
    }, [job]);

    // Get special tags from job data - Using useCallback like React Native
    const getSpecialTags = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.special_tags || [];
    }, [job]);

    // Check if has offers - Using useCallback like React Native
    const hasOffers = useCallback((): boolean => {
        if (!job) return false;
        const jobData = job.jobData as any;
        return jobData?.has_offers || false;
    }, [job]);

    // Get offers count - Using useCallback like React Native
    const getOffersCount = useCallback((): number => {
        if (!job) return 0;
        const jobData = job.jobData as any;
        return jobData?.offers_count || 0;
    }, [job]);

    // Get phone number for the pharmacy - Using useCallback like React Native
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
            "⚠️ Failed to load image for pharmacy:",
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
    const offersAvailable = hasOffers();
    const offersCount = getOffersCount();
    const visibleServices = PHARMACY_SERVICES.slice(0, 4);
    const moreServices =
        PHARMACY_SERVICES.length > 4 ? PHARMACY_SERVICES.length - 4 : 0;
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
            {/* Offers Badge (Top Right Corner) */}
            {offersAvailable && offersCount > 0 && (
                <div className="absolute top-3 right-3 bg-emerald-600 text-white flex items-center gap-1 px-2.5 py-1.5 rounded-2xl z-10 shadow-lg">
                    <Tag size={12} />
                    <span className="text-[11px] font-bold">{offersCount} Offers</span>
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
                        <Pill size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Pharmacy Name */}
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
                    <p className="text-xs font-semibold text-red-600 mb-2">{distance}</p>
                )}

                {/* Special Tags */}
                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-1 rounded"
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
                <div className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <Pill size={12} />
                    <span>Pharmacy / Medical Shop</span>
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
                            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus.includes("Open") || openingStatus.includes("24")
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
                        AVAILABLE:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {visibleServices.map((service, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[11px] font-medium px-2 py-1 rounded"
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
const NearbyPharmaciesCard: React.FC<NearbyPharmaciesCardProps> = (props) => {
    // If no job is provided, render the grid of dummy pharmacies
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_PHARMACIES.map((pharmacy) => (
                    <SinglePharmacyCard
                        key={pharmacy.place_id}
                        job={{
                            id: pharmacy.place_id,
                            title: pharmacy.name,
                            location: pharmacy.vicinity,
                            category: "Pharmacy",
                            jobData: {
                                rating: pharmacy.rating,
                                user_ratings_total: pharmacy.user_ratings_total,
                                opening_hours: pharmacy.opening_hours,
                                geometry: pharmacy.geometry,
                                business_status: pharmacy.business_status,
                                price_level: pharmacy.price_level,
                                types: pharmacy.types,
                                special_tags: pharmacy.special_tags,
                                distance_text: pharmacy.distance_text,
                                has_offers: pharmacy.has_offers,
                                offers_count: pharmacy.offers_count,
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
        <SinglePharmacyCard job={props.job} onViewDetails={props.onViewDetails} />
    );
};

export default NearbyPharmaciesCard;
