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
    Activity,
} from "lucide-react";

/* ================= TYPES ================= */

export interface Physiotherapy {
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
    special_tags?: string[];
    timings?: string;
    services?: string[];
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

// Phone numbers map for physiotherapy centers
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    physio_1: "09972907947",
    physio_2: "08401340248",
    physio_3: "08511383949",
    physio_4: "08401079081",
    physio_5: "08106543210",
};

// Export dummy physiotherapy data - EXACT FROM REACT NATIVE
export const DUMMY_PHYSIOTHERAPY: Physiotherapy[] = [
    {
        place_id: "physio_1",
        name: "Sindhu's Physiotherapy Clinic",
        vicinity: "Behind Casserole Bhavanipuram, Vijayawada",
        rating: 5.0,
        user_ratings_total: 121,
        photos: [{ photo_reference: "physio_photo_1" }],
        geometry: {
            location: { lat: 16.5062, lng: 80.648 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["physiotherapy_center", "health"],
        special_tags: ["Verified", "Trending", "7 Years in Healthcare"],
        timings: "7:00 am - 6:45 am",
        services: ["Great customer service"],
    },
    {
        place_id: "physio_2",
        name: "ROJA PHYSIOTHERAPY & REHABILITATION CLINIC",
        vicinity: "Kolla Forum Road Ramavarappadu, Vijayawada",
        rating: 4.7,
        user_ratings_total: 30,
        photos: [{ photo_reference: "physio_photo_2" }],
        geometry: {
            location: { lat: 16.507, lng: 80.6485 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["physiotherapy_center", "health"],
        special_tags: ["Responsive", "7 Years in Healthcare"],
        timings: "9:00 am - 9:00 pm",
    },
    {
        place_id: "physio_3",
        name: "Care & Cure Physiotherapy Clinic",
        vicinity: "Govinda Rajulu Naidu Street Suryarao Pet, Vijayawada",
        rating: 4.9,
        user_ratings_total: 123,
        photos: [{ photo_reference: "physio_photo_3" }],
        geometry: {
            location: { lat: 16.508, lng: 80.649 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["physiotherapy_center", "health"],
        special_tags: ["Trust", "Verified", "Trending", "13 Years in Healthcare"],
        timings: "Open 24 Hrs",
        services: [
            "Physiotherapists For Sports Injuries",
            "Neurological Physiotherapy",
            "Physiotherapist Doctors",
        ],
    },
    {
        place_id: "physio_4",
        name: "Punnamma Physiotherapy and Rehabilitation Centre",
        vicinity: "Jadagam Vari Street Suryarao Pet, Vijayawada",
        rating: 4.9,
        user_ratings_total: 113,
        photos: [{ photo_reference: "physio_photo_4" }],
        geometry: {
            location: { lat: 16.509, lng: 80.65 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["physiotherapy_center", "health"],
        special_tags: ["Trust", "Verified", "Top Search", "16 Years in Healthcare"],
        timings: "Open 24 Hrs",
    },
    {
        place_id: "physio_5",
        name: "Physio Care Center",
        vicinity: "MG Road, Vijayawada",
        rating: 4.6,
        user_ratings_total: 87,
        photos: [{ photo_reference: "physio_photo_5" }],
        geometry: {
            location: { lat: 16.5075, lng: 80.6495 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["physiotherapy_center", "health"],
        special_tags: ["Available Now", "Quick Response", "10 Years in Healthcare"],
        timings: "8:00 am - 8:00 pm",
    },
];

// Physiotherapy images
const PHYSIOTHERAPY_IMAGES_MAP: { [key: string]: string[] } = {
    physio_1: [
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
        "https://images.unsplash.com/photo-1512069545448-7e0e0e6c8d8a?w=800",
    ],
    physio_2: [
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
        "https://images.unsplash.com/photo-1512069545448-7e0e0e6c8d8a?w=800",
    ],
    physio_3: [
        "https://images.unsplash.com/photo-1512069545448-7e0e0e6c8d8a?w=800",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
    ],
    physio_4: [
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
        "https://images.unsplash.com/photo-1512069545448-7e0e0e6c8d8a?w=800",
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    ],
    physio_5: [
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
        "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800",
        "https://images.unsplash.com/photo-1512069545448-7e0e0e6c8d8a?w=800",
    ],
};

// Physiotherapy descriptions
const PHYSIOTHERAPY_DESCRIPTIONS_MAP: { [key: string]: string } = {
    physio_1:
        "Verified and Trending physiotherapy clinic with 5.0★ rating and 121 reviews. 7 Years in Healthcare. Great customer service. Open from 7:00 am to 6:45 am.",
    physio_2:
        "Responsive physiotherapy & rehabilitation clinic with 4.7★ rating and 30 reviews. 7 Years in Healthcare. Open from 9:00 am to 9:00 pm.",
    physio_3:
        "Trust and Verified physiotherapy clinic with 4.9★ rating and 123 reviews. 13 Years in Healthcare. Open 24 Hours. Specialists in sports injuries, neurological physiotherapy.",
    physio_4:
        "Top Search physiotherapy and rehabilitation centre with 4.9★ rating and 113 reviews. 16 Years in Healthcare. Trusted and Verified. Open 24 Hours.",
    physio_5:
        "Available Now physiotherapy center with 4.6★ rating and 87 reviews. 10 Years in Healthcare. Quick Response. Open from 8:00 am to 8:00 pm.",
};

// Physiotherapy services offered
const PHYSIOTHERAPY_SERVICES = [
    "Sports Injury Rehab",
    "Neurological Therapy",
    "Post-Surgery Recovery",
    "Pain Management",
    "Manual Therapy",
    "Exercise Therapy",
    "Electrotherapy",
    "Spine Rehabilitation",
];

/* ================= COMPONENT ================= */

interface NearbyPhysiotherapyCardProps {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

// Single Physiotherapy Card Component
const SinglePhysiotherapyCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback like React Native
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "physio_1";
        return PHYSIOTHERAPY_IMAGES_MAP[jobId] || PHYSIOTHERAPY_IMAGES_MAP["physio_1"];
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

    // Get physiotherapy center name from job data - Using useCallback like React Native
    const getName = useCallback((): string => {
        if (!job) return "Physiotherapy Center";
        return job.title || "Physiotherapy Center";
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
        if (!job) return "Professional physiotherapy services";
        const jobId = job.id || "physio_1";
        return (
            PHYSIOTHERAPY_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Professional physiotherapy services"
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
        const timings = jobData?.timings;

        if (timings) {
            return timings;
        }

        const isOpen = jobData?.opening_hours?.open_now;

        if (isOpen === undefined || isOpen === null) {
            return null;
        }

        return isOpen ? "Open Now" : "Closed";
    }, [job]);

    // Get special tags from job data - Using useCallback like React Native
    const getSpecialTags = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.special_tags || [];
    }, [job]);

    // Get phone number for the physiotherapy center - Using useCallback like React Native
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
            "⚠️ Failed to load image for physiotherapy center:",
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
    const visibleServices = PHYSIOTHERAPY_SERVICES.slice(0, 4);
    const moreServices =
        PHYSIOTHERAPY_SERVICES.length > 4 ? PHYSIOTHERAPY_SERVICES.length - 4 : 0;
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
                        <Activity size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Physiotherapy Center Name */}
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
                        {specialTags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center bg-purple-100 text-purple-800 text-[10px] font-semibold px-2 py-1 rounded"
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
                <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <Activity size={12} />
                    <span>Physiotherapy Center</span>
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
                                ? "border-purple-600 bg-purple-50 text-purple-600 hover:bg-purple-100"
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
const NearbyPhysiotherapyCard: React.FC<NearbyPhysiotherapyCardProps> = (props) => {
    // If no job is provided, render the grid of dummy physiotherapy centers
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_PHYSIOTHERAPY.map((physio) => (
                    <SinglePhysiotherapyCard
                        key={physio.place_id}
                        job={{
                            id: physio.place_id,
                            title: physio.name,
                            location: physio.vicinity,
                            category: "Physiotherapy",
                            jobData: {
                                rating: physio.rating,
                                user_ratings_total: physio.user_ratings_total,
                                opening_hours: physio.opening_hours,
                                geometry: physio.geometry,
                                business_status: physio.business_status,
                                price_level: physio.price_level,
                                types: physio.types,
                                special_tags: physio.special_tags,
                                timings: physio.timings,
                                services: physio.services,
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
        <SinglePhysiotherapyCard job={props.job} onViewDetails={props.onViewDetails} />
    );
};

export default NearbyPhysiotherapyCard;
