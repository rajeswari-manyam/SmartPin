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
    Settings,
} from "lucide-react";

/* ================= TYPES ================= */

export interface AutomotiveSparePart {
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

// Phone numbers map for automotive spare parts services
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    spare_parts_1: "09740584810",
    spare_parts_2: "08128257519",
    spare_parts_3: "Show Number",
    spare_parts_4: "07942698012",
};

// Export dummy automotive spare parts data
export const DUMMY_SPARE_PARTS: AutomotiveSparePart[] = [
    {
        place_id: "spare_parts_1",
        name: "Bsk Technologies",
        vicinity: "M.G.Road Mahatma Gandhi Road, Secunderabad",
        rating: 4.7,
        user_ratings_total: 423,
        photos: [{ photo_reference: "spare_parts_photo_1" }],
        geometry: {
            location: { lat: 17.4358, lng: 78.5012 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["spare_parts", "automotive_dealer"],
        special_tags: [
            "Trust",
            "Verified",
            "Responsive",
            "Company Authorised Dealer",
            "42 Offers",
        ],
        distance: 7.2,
    },
    {
        place_id: "spare_parts_2",
        name: "Ashok Automobiles",
        vicinity: "HP Petrol Pump Lane Kukatpally, Hyderabad",
        rating: 4.4,
        user_ratings_total: 77,
        photos: [{ photo_reference: "spare_parts_photo_2" }],
        geometry: {
            location: { lat: 17.4945, lng: 78.3912 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["spare_parts", "automotive_dealer"],
        special_tags: [
            "GST",
            "Verified",
            "Trending",
            "Genuine parts",
            "Company Authorised Dealer",
        ],
        distance: 5.0,
    },
    {
        place_id: "spare_parts_3",
        name: "Malik Cars",
        vicinity: "Old Bowenpally-Bowenpally, Hyderabad",
        rating: 4.4,
        user_ratings_total: 2111,
        photos: [{ photo_reference: "spare_parts_photo_3" }],
        geometry: {
            location: { lat: 17.4738, lng: 78.4501 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["spare_parts", "car_dealer"],
        special_tags: [
            "Popular",
            "Car Dealers",
            "Company Authorised Dealer",
        ],
        distance: 1.8,
    },
    {
        place_id: "spare_parts_4",
        name: "Rotex Auto Parts Pvt Ltd",
        vicinity: "Sri Krishna Nagar Kutbullapur, Hyderabad",
        rating: 4.0,
        user_ratings_total: 65,
        photos: [{ photo_reference: "spare_parts_photo_4" }],
        geometry: {
            location: { lat: 17.5125, lng: 78.5245 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["spare_parts", "automotive_dealer"],
        special_tags: [
            "Top Rated",
            "Company Authorised Dealer",
        ],
        distance: 2.0,
    },
];

// Automotive spare parts images
const SPARE_PARTS_IMAGES_MAP: { [key: string]: string[] } = {
    spare_parts_1: [
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
        "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800",
    ],
    spare_parts_2: [
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
        "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800",
    ],
    spare_parts_3: [
        "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800",
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
    ],
    spare_parts_4: [
        "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800",
        "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800",
    ],
};

// Automotive spare parts descriptions
const SPARE_PARTS_DESCRIPTIONS_MAP: { [key: string]: string } = {
    spare_parts_1:
        "Trusted spare parts dealer with 4.7★ rating and 423 reviews. Verified and Responsive. Company Authorised Dealer with 42 special offers available.",
    spare_parts_2:
        "Verified automotive dealer with 4.4★ rating and 77 reviews. GST registered. Trending service with Genuine parts. Company Authorised Dealer.",
    spare_parts_3:
        "Popular car dealership with 4.4★ rating and 2,111 reviews. Car Dealers and Company Authorised Dealer. Professional automotive spare parts service.",
    spare_parts_4:
        "Top Rated auto parts dealer with 4.0★ rating and 65 reviews. Company Authorised Dealer. Quality automotive spare parts and genuine accessories.",
};

// Automotive spare parts services offered
const SPARE_PARTS_SERVICES = [
    "Genuine Parts",
    "Engine Parts",
    "Body Parts",
    "Electrical Parts",
    "Brake Systems",
    "Suspension Parts",
    "Filters & Oils",
    "Accessories",
];

/* ================= COMPONENT ================= */

interface NearbyAutomotiveSparePartsCardProps {
    job?: any;
    onViewDetails: (job: any) => void;
}

const SingleAutomotiveSparePartsCard: React.FC<NearbyAutomotiveSparePartsCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "spare_parts_1";
        return SPARE_PARTS_IMAGES_MAP[jobId] || SPARE_PARTS_IMAGES_MAP["spare_parts_1"];
    }, [job]);

    const photos = getPhotos();
    const hasPhotos = photos.length > 0;
    const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

    // Navigate to previous image
    const handlePrevImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex > 0) {
                setCurrentImageIndex((prev) => prev - 1);
            }
        },
        [hasPhotos, currentImageIndex]
    );

    // Navigate to next image
    const handleNextImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex < photos.length - 1) {
                setCurrentImageIndex((prev) => prev + 1);
            }
        },
        [hasPhotos, currentImageIndex, photos.length]
    );

    // Get spare parts dealer name from job data
    const getName = useCallback((): string => {
        if (!job) return "Automotive Spare Parts";
        return job.title || "Automotive Spare Parts";
    }, [job]);

    // Get location string from job data
    const getLocation = useCallback((): string => {
        if (!job) return "Location";
        return job.location || job.description || "Location";
    }, [job]);

    // Get distance string from job data
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

    // Get description
    const getDescription = useCallback((): string => {
        if (!job) return "Professional automotive spare parts and accessories";
        const jobId = job.id || "spare_parts_1";
        return (
            SPARE_PARTS_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Professional automotive spare parts and accessories"
        );
    }, [job]);

    // Get rating from job data
    const getRating = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.rating || null;
    }, [job]);

    // Get user ratings total from job data
    const getUserRatingsTotal = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.user_ratings_total || null;
    }, [job]);

    // Get opening hours status from job data
    const getOpeningStatus = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        const isOpen = jobData?.opening_hours?.open_now;

        if (isOpen === undefined || isOpen === null) {
            return null;
        }

        return isOpen ? "Open Now" : "Currently Closed";
    }, [job]);

    // Get special tags from job data
    const getSpecialTags = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.special_tags || [];
    }, [job]);

    // Get phone number for the spare parts service
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

            if (!phoneNumber || phoneNumber === "Show Number") {
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

    // Handle image loading error
    const handleImageError = useCallback(() => {
        console.warn("⚠️ Failed to load image for spare parts:", job?.id || "unknown");
        setImageError(true);
    }, [job]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const openingStatus = getOpeningStatus();
    const distance = getDistance();
    const description = getDescription();
    const specialTags = getSpecialTags();
    const visibleServices = SPARE_PARTS_SERVICES.slice(0, 4);
    const moreServices =
        SPARE_PARTS_SERVICES.length > 4 ? SPARE_PARTS_SERVICES.length - 4 : 0;
    const hasPhoneNumber = getPhoneNumber() !== null && getPhoneNumber() !== "Show Number";

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
                        <span className="text-6xl">⚙️</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Spare Parts Name */}
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
                    <p className="text-xs font-semibold text-amber-600 mb-2">{distance}</p>
                )}

                {/* Special Tags */}
                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-orange-100 text-orange-800 text-[10px] font-semibold px-2 py-0.5 rounded"
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
                <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <Settings size={13} />
                    <span>Automotive Spare Parts</span>
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
                                    ({userRatingsTotal.toLocaleString()})
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
                        AVAILABLE PRODUCTS:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {visibleServices.map((service, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 bg-amber-100 text-amber-600 text-[11px] font-medium px-2 py-1 rounded"
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
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-amber-600 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
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
const NearbyAutomotiveSparePartsCard: React.FC<NearbyAutomotiveSparePartsCardProps> = (props) => {
    // If no job is provided, render the grid of dummy spare parts dealers
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_SPARE_PARTS.map((sparePart) => (
                    <SingleAutomotiveSparePartsCard
                        key={sparePart.place_id}
                        job={{
                            id: sparePart.place_id,
                            title: sparePart.name,
                            location: sparePart.vicinity,
                            distance: sparePart.distance,
                            category: "Automotive Spare Parts",
                            jobData: {
                                rating: sparePart.rating,
                                user_ratings_total: sparePart.user_ratings_total,
                                opening_hours: sparePart.opening_hours,
                                geometry: sparePart.geometry,
                                business_status: sparePart.business_status,
                                price_level: sparePart.price_level,
                                types: sparePart.types,
                                special_tags: sparePart.special_tags,
                            },
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job is provided, render individual card
    return <SingleAutomotiveSparePartsCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyAutomotiveSparePartsCard;
