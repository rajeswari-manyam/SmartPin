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
    FileText,
    Briefcase,
} from "lucide-react";

/* ================= TYPES ================= */

export interface RegistrationConsultant {
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
    years_in_business?: number;
    services_available?: boolean;
    price_range?: string;
}

/* ================= CONSTANTS - REGISTRATION CONSULTANTS DATA ================= */

// Phone numbers map for registration consultants
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    consultant_1: "09035141398",
    consultant_2: "09725305527",
    consultant_3: "09980893974",
    consultant_4: "07041386760",
};

// Export dummy registration consultant data - Based on JustDial screenshots
export const DUMMY_REGISTRATION_CONSULTANTS: RegistrationConsultant[] = [
    {
        place_id: "consultant_1",
        name: "SKNG & Associates",
        vicinity: "Hyderabad",
        rating: 5.0,
        user_ratings_total: 10,
        photos: [{ photo_reference: "consultant_photo_1" }],
        geometry: {
            location: { lat: 17.385, lng: 78.4867 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["registration_consultant", "accounting"],
        special_tags: ["Responsive", "Accounting", "GST Return", "NRI ITR"],
        distance: 3.7,
        services_available: true,
    },
    {
        place_id: "consultant_2",
        name: "Raja Rajeshwari Associates",
        vicinity: "Hyderabad",
        rating: 5.0,
        user_ratings_total: 3,
        photos: [{ photo_reference: "consultant_photo_2" }],
        geometry: {
            location: { lat: 17.3745, lng: 78.4512 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["registration_consultant", "public_notary"],
        special_tags: ["Trending", "Public Notary", "Verified"],
        distance: 3.7,
        services_available: true,
    },
    {
        place_id: "consultant_3",
        name: "Sri Sathish Business Management Services",
        vicinity: "Hyderabad",
        rating: 4.2,
        user_ratings_total: 92,
        photos: [{ photo_reference: "consultant_photo_3" }],
        geometry: {
            location: { lat: 17.3621, lng: 78.5245 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["registration_consultant", "accounting"],
        special_tags: ["Trending", "Accounting", "GST Return", "TDS Return"],
        distance: 10.2,
        services_available: true,
    },
    {
        place_id: "consultant_4",
        name: "Edwin Educational And Professional Consultancy LLP",
        vicinity: "Jabalpur",
        rating: 4.3,
        user_ratings_total: 49,
        photos: [{ photo_reference: "consultant_photo_4" }],
        geometry: {
            location: { lat: 23.1815, lng: 79.9864 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 3,
        types: ["registration_consultant", "educational"],
        special_tags: ["Responsive", "12 Years in Business", "Verified"],
        distance: 5.5,
        years_in_business: 12,
        services_available: true,
        price_range: "₹1,000 - ₹99,999",
    },
];

// Registration consultant images
const CONSULTANT_IMAGES_MAP: { [key: string]: string[] } = {
    consultant_1: [
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
    ],
    consultant_2: [
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
    ],
    consultant_3: [
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
    ],
    consultant_4: [
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800",
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
    ],
};

// Registration consultant descriptions
const CONSULTANT_DESCRIPTIONS_MAP: { [key: string]: string } = {
    consultant_1:
        "Responsive registration consultant with 5.0★ rating and 10 reviews. Accounting, GST Return, and NRI ITR services available. Professional and reliable consulting services.",
    consultant_2:
        "Trending registration consultant with 5.0★ rating and 3 reviews. Public Notary services. Verified. Expert registration and notary services for all your needs.",
    consultant_3:
        "Trending business management service with 4.2★ rating and 92 reviews. Accounting, GST Return, and TDS Return services. Comprehensive business solutions.",
    consultant_4:
        "Responsive educational consultancy with 4.3★ rating and 49 reviews. 12 Years in Business. Verified. Professional consultation services with extensive experience.",
};

// Registration services offered
const REGISTRATION_SERVICES = [
    "Company Registration",
    "GST Registration",
    "Trademark Registration",
    "ITR Filing",
    "Accounting Services",
    "Business Registration",
    "Public Notary",
    "Legal Documentation",
    "Tax Consultation",
    "Compliance Services",
];

/* ================= COMPONENT ================= */

interface NearbyConsultantCardProps {
    job?: any;
    onViewDetails: (job: any) => void;
}

const SingleConsultantCard: React.FC<NearbyConsultantCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback like React Native
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "consultant_1";
        return CONSULTANT_IMAGES_MAP[jobId] || CONSULTANT_IMAGES_MAP["consultant_1"];
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

    // Get consultant name from job data - Using useCallback like React Native
    const getName = useCallback((): string => {
        if (!job) return "Registration Consultant";
        return job.title || "Registration Consultant";
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
        if (!job) return "Professional registration and consultation services";
        const jobId = job.id || "consultant_1";
        return (
            CONSULTANT_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Professional registration and consultation services"
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

    // Get years in business - Using useCallback like React Native
    const getYearsInBusiness = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.years_in_business || null;
    }, [job]);

    // Get price range - Using useCallback like React Native
    const getPriceRange = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.price_range || null;
    }, [job]);

    // Get phone number for the consultant - Using useCallback like React Native
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

    // Handle image loading error - Using useCallback like React Native
    const handleImageError = useCallback(() => {
        console.warn("⚠️ Failed to load image for consultant:", job?.id || "unknown");
        setImageError(true);
    }, [job]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const openingStatus = getOpeningStatus();
    const distance = getDistance();
    const description = getDescription();
    const specialTags = getSpecialTags();
    const yearsInBusiness = getYearsInBusiness();
    const priceRange = getPriceRange();
    const visibleServices = REGISTRATION_SERVICES.slice(0, 4);
    const moreServices =
        REGISTRATION_SERVICES.length > 4 ? REGISTRATION_SERVICES.length - 4 : 0;
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
                        <span className="text-6xl">📋</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Consultant Name */}
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
                    <p className="text-xs font-semibold text-indigo-600 mb-2">
                        {distance}</p>
                )}

                {/* Years in Business & Price Range */}


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
                <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">

                    <FileText size={12} />
                    <span>Registration Consultant</span>
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
                                className="inline-flex items-center gap-1 bg-teal-100 text-teal-600 text-[11px] font-medium px-2 py-1 rounded"
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
                            ? "border-teal-600 bg-teal-50 text-teal-600 hover:bg-teal-100"
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
const NearbyConsultantCard: React.FC<NearbyConsultantCardProps> = (props) => {
    // If no job is provided, render the grid of dummy consultants
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_REGISTRATION_CONSULTANTS.map((consultant) => (
                    <SingleConsultantCard
                        key={consultant.place_id}
                        job={{
                            id: consultant.place_id,
                            title: consultant.name,
                            location: consultant.vicinity,
                            distance: consultant.distance,
                            category: "Registration Consultant",
                            jobData: {
                                rating: consultant.rating,
                                user_ratings_total: consultant.user_ratings_total,
                                opening_hours: consultant.opening_hours,
                                geometry: consultant.geometry,
                                business_status: consultant.business_status,
                                price_level: consultant.price_level,
                                types: consultant.types,
                                special_tags: consultant.special_tags,
                                years_in_business: consultant.years_in_business,
                                services_available: consultant.services_available,
                                price_range: consultant.price_range,
                            },
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job is provided, render individual card
    return <SingleConsultantCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyConsultantCard;
