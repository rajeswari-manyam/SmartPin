


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
    Calendar,
    Zap,
    PawPrint,
} from "lucide-react";

/* ================= TYPES ================= */

export interface VetClinic {
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
        opens_at?: string;
    };
    price_level: number;
    types: string[];
    special_tags?: string[];
    years_in_healthcare?: string;
    response_time?: string;
    has_booking?: boolean;
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

// Phone numbers map for veterinary clinics
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    vet_1: "07947138022",
    vet_2: "08401339877",
    vet_3: "08460413885",
    vet_4: "07942686016",
    vet_5: "09876543210",
};

// Export dummy veterinary data - EXACT FROM REACT NATIVE
export const DUMMY_VET_CLINICS: VetClinic[] = [
    {
        place_id: "vet_1",
        name: "Veterinary Hospital",
        vicinity: "Ramalingeswara Pet Tenali Tenali Bazar, Tenali",
        rating: 3.8,
        user_ratings_total: 8,
        photos: [{ photo_reference: "vet_photo_1" }],
        geometry: {
            location: { lat: 16.24, lng: 80.648 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: false,
            opens_at: "Opens at 8:00 am tomorrow",
        },
        price_level: 2,
        types: ["veterinary_care", "pet_hospital", "animal_care"],
        special_tags: [],
    },
    {
        place_id: "vet_2",
        name: "Care Well Dog Clinic",
        vicinity: "Pantakaluva Road NTR Circle, Vijayawada",
        rating: 4.5,
        user_ratings_total: 299,
        photos: [{ photo_reference: "vet_photo_2" }],
        geometry: {
            location: { lat: 16.5062, lng: 80.648 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: true,
            hours: "9:00 am - 9:30 pm",
        },
        price_level: 2,
        types: ["veterinary_care", "pet_hospital", "dog_clinic"],
        special_tags: ["Top Search", "15 Years in Healthcare"],
        years_in_healthcare: "15 Years in Healthcare",
        has_booking: true,
    },
    {
        place_id: "vet_3",
        name: "THE GOLDEN PET CLINIC & STORE",
        vicinity: "ELURU ROAD Gunadala, Vijayawada",
        rating: 4.9,
        user_ratings_total: 40,
        photos: [{ photo_reference: "vet_photo_3" }],
        geometry: {
            location: { lat: 16.507, lng: 80.6485 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: true,
            hours: "Open 24 Hrs",
        },
        price_level: 2,
        types: ["veterinary_care", "pet_hospital", "pet_store"],
        special_tags: ["Verified", "1 Year in Healthcare"],
        years_in_healthcare: "1 Year in Healthcare",
        response_time: "Responds in 20 Mins",
    },
    {
        place_id: "vet_4",
        name: "Ntr Veterinary Super Speciality Hospital",
        vicinity: "MG Road Labbipet, Vijayawada",
        rating: 4.1,
        user_ratings_total: 106,
        photos: [{ photo_reference: "vet_photo_4" }],
        geometry: {
            location: { lat: 16.508, lng: 80.649 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: true,
            hours: "Open 24 Hrs",
        },
        price_level: 2,
        types: ["veterinary_care", "pet_hospital", "specialty_hospital"],
        special_tags: ["Trending"],
    },
    {
        place_id: "vet_5",
        name: "Area Veterinary Hospital",
        vicinity: "Burripalem Road Nazerpeta, Tenali",
        rating: 4.1,
        user_ratings_total: 157,
        photos: [{ photo_reference: "vet_photo_5" }],
        geometry: {
            location: { lat: 16.238, lng: 80.647 },
        },
        business_status: "OPERATIONAL",
        opening_hours: {
            open_now: true,
            hours: "9:00 am - 6:00 pm",
        },
        price_level: 2,
        types: ["veterinary_care", "pet_hospital", "animal_care"],
        special_tags: ["Trending"],
    },
];

// Veterinary clinic images
const VET_IMAGES_MAP: { [key: string]: string[] } = {
    vet_1: [
        "https://images.unsplash.com/photo-1530041539828-114de669390e?w=800",
        "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
        "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800",
    ],
    vet_2: [
        "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800",
        "https://images.unsplash.com/photo-1530041539828-114de669390e?w=800",
        "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
    ],
    vet_3: [
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
        "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
        "https://images.unsplash.com/photo-1530041539828-114de669390e?w=800",
    ],
    vet_4: [
        "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
        "https://images.unsplash.com/photo-1530041539828-114de669390e?w=800",
        "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800",
    ],
    vet_5: [
        "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
        "https://images.unsplash.com/photo-1530041539828-114de669390e?w=800",
        "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800",
    ],
};

// Veterinary clinic descriptions
const VET_DESCRIPTIONS_MAP: { [key: string]: string } = {
    vet_1: "General veterinary hospital with 3.8★ rating and 8 reviews. Opens at 8:00 am tomorrow. Comprehensive pet care services available for all animals.",
    vet_2: "Top rated dog clinic with 4.5★ rating and 299 reviews. Top Search clinic with 15 Years in Healthcare. Book appointment available. Open from 9:00 am - 9:30 pm.",
    vet_3: "Premium pet clinic and store with 4.9★ rating and 40 reviews. Verified clinic with 1 Year in Healthcare. Quick response in 20 minutes. Open 24 hours for emergency care.",
    vet_4: "Trending super speciality hospital with 4.1★ rating and 106 reviews. Open 24 hours. Advanced veterinary care and specialty treatments available.",
    vet_5: "Trending veterinary hospital with 4.1★ rating and 157 reviews. Comprehensive animal care services. Open from 9:00 am - 6:00 pm daily.",
};

// Veterinary services offered
const VET_SERVICES = [
    "General Checkup",
    "Vaccinations",
    "Surgery",
    "Emergency Care",
    "Dental Care",
    "Grooming",
    "Pet Store",
    "Specialty Treatment",
];

/* ================= COMPONENT ================= */

interface NearbyVetClinicCardProps {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

// Single Vet Clinic Card Component
const SingleVetClinicCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data - Using useCallback like React Native
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "vet_1";
        return VET_IMAGES_MAP[jobId] || VET_IMAGES_MAP["vet_1"];
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

    // Get vet clinic name from job data - Using useCallback like React Native
    const getName = useCallback((): string => {
        if (!job) return "Veterinary Clinic";
        return job.title || "Veterinary Clinic";
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
        if (!job) return "Professional veterinary care services";
        const jobId = job.id || "vet_1";
        return (
            VET_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Professional veterinary care services"
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

        // Check for specific opening time message
        if (jobData?.opening_hours?.opens_at) {
            return jobData.opening_hours.opens_at;
        }

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

    // Get years in healthcare from job data - Using useCallback like React Native
    const getYearsInHealthcare = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.years_in_healthcare || null;
    }, [job]);

    // Get response time from job data - Using useCallback like React Native
    const getResponseTime = useCallback((): string | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.response_time || null;
    }, [job]);

    // Check if has booking available - Using useCallback like React Native
    const hasBooking = useCallback((): boolean => {
        if (!job) return false;
        const jobData = job.jobData as any;
        return jobData?.has_booking || false;
    }, [job]);

    // Get phone number for the vet clinic - Using useCallback like React Native
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

    // Handle book appointment button press
    const handleBookAppointment = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!job) return;

            const name = getName();
            const confirmed = window.confirm(
                `Would you like to book an appointment at ${name}?`
            );

            if (confirmed) {
                handleCall(e);
            }
        },
        [job, getName, handleCall]
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
            "⚠️ Failed to load image for vet clinic:",
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
    const yearsInHealthcare = getYearsInHealthcare();
    const responseTime = getResponseTime();
    const bookingAvailable = hasBooking();
    const visibleServices = VET_SERVICES.slice(0, 4);
    const moreServices = VET_SERVICES.length > 4 ? VET_SERVICES.length - 4 : 0;
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
                        <PawPrint size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Vet Clinic Name */}
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
                    <p className="text-xs font-semibold text-emerald-600 mb-2">{distance}</p>
                )}

                {/* Special Tags */}
                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-1 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Years in Healthcare & Response Time */}
                {(yearsInHealthcare || responseTime) && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {yearsInHealthcare && (
                            <div className="flex items-center gap-1">
                                <Clock size={12} className="text-emerald-600 flex-shrink-0" />
                                <span className="text-[11px] text-gray-700 font-medium">
                                    {yearsInHealthcare}
                                </span>
                            </div>
                        )}
                        {responseTime && (
                            <div className="flex items-center gap-1">
                                <Zap size={12} className="text-blue-500 flex-shrink-0" />
                                <span className="text-[11px] text-gray-700 font-medium">
                                    {responseTime}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Description */}
                <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
                    {description}
                </p>

                {/* Category Badge */}
                <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <PawPrint size={12} />
                    <span>Veterinary Clinic</span>
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
                                className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-600 text-[11px] font-medium px-2 py-1 rounded"
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
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-[11px] py-2 rounded-lg transition-all active:scale-95"
                    >
                        <Navigation size={13} />
                        <span>Directions</span>
                    </button>

                    <button
                        onClick={handleCall}
                        disabled={!hasPhoneNumber}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-[11px] py-2 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
                            ? "border-emerald-600 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                            : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={13} />
                        <span>Call</span>
                    </button>
                </div>

                {/* Book Appointment Button (if available) */}
                {bookingAvailable && (
                    <button
                        onClick={handleBookAppointment}
                        className="w-full flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-[13px] py-2.5 rounded-lg transition-all active:scale-95"
                    >
                        <Calendar size={14} />
                        <span>Book Appointment</span>
                    </button>
                )}
            </div>
        </div>
    );
};

// Main Component - displays grid of dummy data or single card
const NearbyVetClinicCard: React.FC<NearbyVetClinicCardProps> = (props) => {
    // If no job is provided, render the grid of dummy vet clinics
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_VET_CLINICS.map((vet) => (
                    <SingleVetClinicCard
                        key={vet.place_id}
                        job={{
                            id: vet.place_id,
                            title: vet.name,
                            location: vet.vicinity,
                            category: "Veterinary Clinic",
                            jobData: {
                                rating: vet.rating,
                                user_ratings_total: vet.user_ratings_total,
                                opening_hours: vet.opening_hours,
                                geometry: vet.geometry,
                                business_status: vet.business_status,
                                price_level: vet.price_level,
                                types: vet.types,
                                special_tags: vet.special_tags,
                                years_in_healthcare: vet.years_in_healthcare,
                                response_time: vet.response_time,
                                has_booking: vet.has_booking,
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
        <SingleVetClinicCard job={props.job} onViewDetails={props.onViewDetails} />
    );
};

export default NearbyVetClinicCard;
