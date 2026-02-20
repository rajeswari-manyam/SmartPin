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
} from "lucide-react";

/* ================= TYPES ================= */

export interface CarWashingService {
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
}

/* ================= CONSTANTS ================= */

// Phone numbers map for car washing services
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    car_wash_1: "09980119497",
    car_wash_2: "08401105620",
    car_wash_3: "07383546653",
    car_wash_4: "07947427077",
};

// Export dummy car washing data
export const DUMMY_CAR_WASHING: CarWashingService[] = [
    {
        place_id: "car_wash_1",
        name: "Sai Seetharam Car Decors.",
        vicinity: "Gandhi Nagar Road IDPL Colony, Hyderabad",
        rating: 4.0,
        user_ratings_total: 80,
        photos: [{ photo_reference: "car_wash_photo_1" }],
        geometry: { location: { lat: 17.4485, lng: 78.4765 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["car_wash", "car_dealer"],
        special_tags: ["Top Rated", "Car Dealers", "Company Authorised Dealer", "Car Wash"],
        distance: 1.5,
    },
    {
        place_id: "car_wash_2",
        name: "Kartrenz Multi-brand Car Workshop",
        vicinity: "Old Alwal-alwal, Hyderabad",
        rating: 4.8,
        user_ratings_total: 131,
        photos: [{ photo_reference: "car_wash_photo_2" }],
        geometry: { location: { lat: 17.4912, lng: 78.5325 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["car_wash", "auto_detailing"],
        special_tags: ["Verified", "Responsive", "Auto Detailing", "Oil Change", "Car Wash"],
        distance: 4.1,
    },
    {
        place_id: "car_wash_3",
        name: "Rockys Car Garage",
        vicinity: "Bala Nagar, Hyderabad",
        rating: 4.8,
        user_ratings_total: 31,
        photos: [{ photo_reference: "car_wash_photo_3" }],
        geometry: { location: { lat: 17.4458, lng: 78.4695 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["car_wash", "car_service"],
        special_tags: ["Top Search", "Car Wash"],
        distance: 3.6,
    },
    {
        place_id: "car_wash_4",
        name: "Rks Auto Exclusive Premium Cars Garage",
        vicinity: "Chandra Nagar IDPL, Hyderabad",
        rating: 4.8,
        user_ratings_total: 249,
        photos: [{ photo_reference: "car_wash_photo_4" }],
        geometry: { location: { lat: 17.4525, lng: 78.4785 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["car_wash", "auto_detailing"],
        special_tags: ["Popular", "Auto Detailing", "DoorStep Service", "Oil Change"],
        distance: 1.1,
    },
];

// Car washing images
const CAR_WASHING_IMAGES_MAP: { [key: string]: string[] } = {
    car_wash_1: [
        "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800",
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800",
        "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800",
    ],
    car_wash_2: [
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800",
        "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800",
        "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800",
    ],
    car_wash_3: [
        "https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=800",
        "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800",
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800",
    ],
    car_wash_4: [
        "https://images.unsplash.com/photo-1591258370814-01609b341790?w=800",
        "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800",
        "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800",
    ],
};

// Car washing descriptions
const CAR_WASHING_DESCRIPTIONS_MAP: { [key: string]: string } = {
    car_wash_1:
        "Top Rated car washing service with 4.0★ rating and 80 reviews. Company Authorised Dealer. Professional car wash and detailing services available.",
    car_wash_2:
        "Verified multi-brand car workshop with 4.8★ rating and 131 reviews. Responsive service. Auto Detailing, Oil Change, and Car Wash available.",
    car_wash_3:
        "Top Search car garage with 4.8★ rating and 31 reviews. Professional car wash services. Quick and reliable service available.",
    car_wash_4:
        "Popular premium cars garage with 4.8★ rating and 249 reviews. Auto Detailing and DoorStep Service. Oil Change and professional car care available.",
};

// Car washing services offered
const CAR_WASHING_SERVICES = [
    "Exterior Wash",
    "Interior Cleaning",
    "Waxing & Polishing",
    "Vacuum Cleaning",
    "Tire Cleaning",
    "Engine Bay Cleaning",
    "Ceramic Coating",
    "Paint Protection",
];

/* ================= COMPONENT ================= */

interface NearbyCarWashingCardProps {
    job?: any;
    onViewDetails: (job: any) => void;
}

const SingleCarWashingCard: React.FC<NearbyCarWashingCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "car_wash_1";
        return CAR_WASHING_IMAGES_MAP[jobId] || CAR_WASHING_IMAGES_MAP["car_wash_1"];
    }, [job]);

    const photos = getPhotos();
    const hasPhotos = photos.length > 0;
    const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

    // Navigate to previous image - Using useCallback
    const handlePrevImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex > 0) {
                setCurrentImageIndex((prev) => prev - 1);
            }
        },
        [hasPhotos, currentImageIndex]
    );

    // Navigate to next image - Using useCallback
    const handleNextImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex < photos.length - 1) {
                setCurrentImageIndex((prev) => prev + 1);
            }
        },
        [hasPhotos, currentImageIndex, photos.length]
    );

    // Get car wash name from job data - Using useCallback
    const getName = useCallback((): string => {
        if (!job) return "Car Washing Service";
        return job.title || "Car Washing Service";
    }, [job]);

    // Get location string from job data - Using useCallback
    const getLocation = useCallback((): string => {
        if (!job) return "Location";
        return job.location || job.description || "Location";
    }, [job]);

    // Get distance string from job data - Using useCallback
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

    // Get description - Using useCallback
    const getDescription = useCallback((): string => {
        if (!job) return "Professional car washing and detailing services";
        const jobId = job.id || "car_wash_1";
        return (
            CAR_WASHING_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Professional car washing and detailing services"
        );
    }, [job]);

    // Get rating from job data - Using useCallback
    const getRating = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.rating || null;
    }, [job]);

    // Get user ratings total from job data - Using useCallback
    const getUserRatingsTotal = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.user_ratings_total || null;
    }, [job]);

    // Get opening hours status from job data - Using useCallback
    const getOpeningStatus = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        const isOpen = jobData?.opening_hours?.open_now;

        if (isOpen === undefined || isOpen === null) {
            return null;
        }

        return isOpen ? "Open Now" : "Currently Closed";
    }, [job]);

    // Get special tags from job data - Using useCallback
    const getSpecialTags = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.special_tags || [];
    }, [job]);

    // Get phone number for the car wash service - Using useCallback
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

            // Create Google Maps URL with exact coordinates
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${job.id || ""}`;

            window.open(googleMapsUrl, "_blank");
        },
        [job]
    );

    // Handle image loading error - Using useCallback
    const handleImageError = useCallback(() => {
        console.warn("⚠️ Failed to load image for car wash:", job?.id || "unknown");
        setImageError(true);
    }, [job]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const openingStatus = getOpeningStatus();
    const distance = getDistance();
    const description = getDescription();
    const specialTags = getSpecialTags();
    const visibleServices = CAR_WASHING_SERVICES.slice(0, 4);
    const moreServices =
        CAR_WASHING_SERVICES.length > 4 ? CAR_WASHING_SERVICES.length - 4 : 0;
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
                        <span className="text-6xl">🚗</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Car Wash Name */}
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
                    <p className="text-xs font-semibold text-cyan-600 mb-2">{distance}</p>
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
                <div className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <span className="text-sm">🚗</span>
                    <span>Car Washing Service</span>
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
                            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus.includes("Open")
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
                                className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-600 text-[11px] font-medium px-2 py-1 rounded"
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
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-cyan-600 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
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

// Wrapper component - displays grid of dummy data or single card
const NearbyCarWashingCard: React.FC<NearbyCarWashingCardProps> = (props) => {
    // If no job is provided, render the grid of dummy car washing services
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_CAR_WASHING.map((carWashing) => (
                    <SingleCarWashingCard
                        key={carWashing.place_id}
                        job={{
                            id: carWashing.place_id,
                            title: carWashing.name,
                            location: carWashing.vicinity,
                            distance: carWashing.distance,
                            category: "Car Washing Service",
                            jobData: {
                                rating: carWashing.rating,
                                user_ratings_total: carWashing.user_ratings_total,
                                opening_hours: carWashing.opening_hours,
                                geometry: carWashing.geometry,
                                business_status: carWashing.business_status,
                                price_level: carWashing.price_level,
                                types: carWashing.types,
                                special_tags: carWashing.special_tags,
                            },
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job is provided, render individual card
    return <SingleCarWashingCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyCarWashingCard;
