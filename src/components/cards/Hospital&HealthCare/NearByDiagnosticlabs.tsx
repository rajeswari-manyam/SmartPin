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
    Shield,
    TrendingUp,
    Search,
    MessageSquare,
    Zap,
    Tag,
} from "lucide-react";

/* ================= TYPES ================= */

export interface DiagnosticLab {
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
    price_level?: number;
    types: string[];
    special_tags: string[];
    distance: number;
    services?: string[];
    offers?: number;
}

/* ================= CONSTANTS ================= */

// Phone numbers map for diagnostic labs (from JustDial screenshots)
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    diagnostic_1: "08197766785",
    diagnostic_2: "08867844326",
    diagnostic_3: "08197751282",
    diagnostic_4: "08919772879", // Show Number button
};

// Diagnostic lab images
const DIAGNOSTIC_IMAGES_MAP: { [key: string]: string[] } = {
    diagnostic_1: [
        "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
        "https://images.unsplash.com/photo-1581093458791-9d42e1c9b43d?w=800",
        "https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=800",
    ],
    diagnostic_2: [
        "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800",
        "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800",
        "https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?w=800",
    ],
    diagnostic_3: [
        "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800",
        "https://images.unsplash.com/photo-1563213126-a4273aed2016?w=800",
        "https://images.unsplash.com/photo-1579684453423-f84349ef60b0?w=800",
    ],
    diagnostic_4: [
        "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=800",
        "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
        "https://images.unsplash.com/photo-1579684453377-35e7e67e00be?w=800",
    ],
};

// Diagnostic lab descriptions (from JustDial)
const DIAGNOSTIC_DESCRIPTIONS_MAP: { [key: string]: string } = {
    diagnostic_1:
        "Highly rated diagnostic center with 4.4★ rating and 3,261 reviews. Top Search result. Verified service provider. Offers comprehensive diagnostic services including Kidney Function Test, Thyroid Function Test, Blood Count and 12+ more tests.",
    diagnostic_2:
        "Trusted diagnostic center with 4.8★ rating and 2,469 reviews. Verified and Trending. Trust badge holder. Provides 24X7 Diagnostic Services with quick response time of 40 minutes.",
    diagnostic_3:
        "Premium hospital with diagnostic facilities. 4.4★ rating and 503 reviews. Responsive service. Open 24 hours with 9+ years in healthcare. Complete diagnostic and healthcare services.",
    diagnostic_4:
        "Leading diagnostic center with 4.4★ rating and 3,533 reviews. Trending service provider with 1 Offer. Specializes in Prenatal Check Up and Pre Employment Checkup Packages. Professional diagnostic solutions.",
};

// Test services offered (from JustDial screenshots)
const TEST_SERVICES = [
    "Kidney Function Test",
    "Thyroid Function Test",
    "Blood Count",
    "Prenatal Check Up",
    "Pre Employment Checkup",
    "Complete Blood Count",
    "Lipid Profile",
    "Liver Function Test",
];

/* ================= DUMMY DATA (from JustDial) ================= */

export const DUMMY_DIAGNOSTIC_LABS: DiagnosticLab[] = [
    {
        place_id: "diagnostic_1",
        name: "Aarthi Scans & Labs",
        vicinity: "Dwarakapur Colony Punjagutta, Hyderabad",
        rating: 4.4,
        user_ratings_total: 3261,
        photos: [{ photo_reference: "diagnostic_photo_1" }],
        geometry: {
            location: { lat: 17.4326, lng: 78.4482 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["diagnostic_center", "health", "laboratory"],
        special_tags: ["Top Search", "Verified"],
        distance: 7.2,
        services: ["Kidney Function Test", "Thyroid Function Test", "Blood Count"],
    },
    {
        place_id: "diagnostic_2",
        name: "Focus Diagnostics",
        vicinity: "Hi-Tension Road Pet Basheerabad, Hyderabad",
        rating: 4.8,
        user_ratings_total: 2469,
        photos: [{ photo_reference: "diagnostic_photo_2" }],
        geometry: {
            location: { lat: 17.4456, lng: 78.4897 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["diagnostic_center", "health", "laboratory"],
        special_tags: ["Trust", "Verified", "Trending"],
        distance: 3.5,
        services: ["24X7 Diagnostic Services"],
    },
    {
        place_id: "diagnostic_3",
        name: "Srujana Hospitals",
        vicinity: "Ganesh Nagar Suchitra Cross Road, Hyderabad",
        rating: 4.4,
        user_ratings_total: 503,
        photos: [{ photo_reference: "diagnostic_photo_3" }],
        geometry: {
            location: { lat: 17.5483, lng: 78.5103 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 3,
        types: ["hospital", "diagnostic_center", "health"],
        special_tags: ["Responsive"],
        distance: 2.0,
        services: ["Complete Blood Count", "Lipid Profile", "Liver Function Test"],
    },
    {
        place_id: "diagnostic_4",
        name: "Vijaya Diagnostic Centre",
        vicinity: "Ganga Enclave Kompally, Rangareddy",
        rating: 4.4,
        user_ratings_total: 3533,
        photos: [{ photo_reference: "diagnostic_photo_4" }],
        geometry: {
            location: { lat: 17.5367, lng: 78.4868 },
        },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["diagnostic_center", "health", "laboratory"],
        special_tags: ["Trending"],
        distance: 4.4,
        services: ["Prenatal Check Up", "Pre Employment Checkup Packages"],
        offers: 1,
    },
];

/* ================= BADGE ICON COMPONENT ================= */

const BadgeIcon: React.FC<{ badge: string }> = ({ badge }) => {
    switch (badge) {
        case "Trust":
            return <Shield size={10} />;
        case "Verified":
            return <CheckCircle size={10} />;
        case "Top Search":
            return <Search size={10} />;
        case "Trending":
            return <TrendingUp size={10} />;
        case "Responsive":
            return <Zap size={10} />;
        default:
            return null;
    }
};

const getBadgeStyles = (badge: string): string => {
    switch (badge) {
        case "Trust":
            return "bg-amber-100 text-amber-600";
        case "Verified":
            return "bg-blue-100 text-blue-600";
        case "Top Search":
            return "bg-orange-100 text-orange-600";
        case "Trending":
            return "bg-orange-100 text-orange-600";
        case "Responsive":
            return "bg-yellow-100 text-yellow-700";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

/* ================= SINGLE CARD COMPONENT ================= */

interface SingleDiagnosticLabCardProps {
    job?: any;
    onViewDetails: (job: any) => void;
}

const SingleDiagnosticLabCard: React.FC<SingleDiagnosticLabCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from job data
    const getPhotos = useCallback(() => {
        if (!job) return [];
        const jobId = job.id || "diagnostic_1";
        return (
            DIAGNOSTIC_IMAGES_MAP[jobId] || DIAGNOSTIC_IMAGES_MAP["diagnostic_1"]
        );
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

    // Get lab name
    const getName = useCallback((): string => {
        if (!job) return "Diagnostic Lab";
        return job.title || "Diagnostic Lab";
    }, [job]);

    // Get location
    const getLocation = useCallback((): string => {
        if (!job) return "Location";
        return job.location || job.description || "Location";
    }, [job]);

    // Get distance
    const getDistance = useCallback((): string => {
        if (!job) return "";
        if (job.distance !== undefined && job.distance !== null) {
            const distanceNum = Number(job.distance);
            if (!isNaN(distanceNum)) {
                return `${distanceNum.toFixed(1)} km`;
            }
        }
        return "";
    }, [job]);

    // Get description
    const getDescription = useCallback((): string => {
        if (!job) return "Professional diagnostic laboratory services";
        const jobId = job.id || "diagnostic_1";
        return (
            DIAGNOSTIC_DESCRIPTIONS_MAP[jobId] ||
            job.description ||
            "Professional diagnostic laboratory services"
        );
    }, [job]);

    // Get rating
    const getRating = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.rating || null;
    }, [job]);

    // Get user ratings total
    const getUserRatingsTotal = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.user_ratings_total || null;
    }, [job]);

    // Get special tags
    const getSpecialTags = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.special_tags || [];
    }, [job]);

    // Get services
    const getServices = useCallback((): string[] => {
        if (!job) return [];
        const jobData = job.jobData as any;
        return jobData?.services || TEST_SERVICES.slice(0, 3);
    }, [job]);

    // Get offers
    const getOffers = useCallback((): number | null => {
        if (!job) return null;
        const jobData = job.jobData as any;
        return jobData?.offers || null;
    }, [job]);

    // Get phone number
    const getPhoneNumber = useCallback((): string | null => {
        if (!job) return null;
        const jobId = job.id || "";
        return PHONE_NUMBERS_MAP[jobId] || null;
    }, [job]);

    // Handle call button
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

            const formattedNumber = phoneNumber.replace(/[^0-9+]/g, "");
            const telUrl = `tel:${formattedNumber}`;

            window.location.href = telUrl;
        },
        [job, getPhoneNumber, getName]
    );

    // Handle WhatsApp button
    const handleWhatsApp = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!job) return;

            const phoneNumber = getPhoneNumber();
            const name = getName();

            if (!phoneNumber) {
                alert(`No WhatsApp number available for ${name}.`);
                return;
            }

            const formattedNumber = phoneNumber.replace(/[^0-9]/g, "");
            const whatsappUrl = `https://wa.me/${formattedNumber}`;

            window.open(whatsappUrl, "_blank");
        },
        [job, getPhoneNumber, getName]
    );

    // Handle send enquiry button
    const handleSendEnquiry = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!job) return;

            alert(
                `Send Enquiry to ${getName()}\nResponds in 40 Minutes\n\nThis would typically open an enquiry form.`
            );
        },
        [job, getName]
    );

    // Handle directions button
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

            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${job.id || ""
                }`;

            window.open(googleMapsUrl, "_blank");
        },
        [job]
    );

    // Handle image error
    const handleImageError = useCallback(() => {
        console.warn(
            "⚠️ Failed to load image for diagnostic lab:",
            job?.id || "unknown"
        );
        setImageError(true);
    }, [job]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const distance = getDistance();
    const description = getDescription();
    const specialTags = getSpecialTags();
    const services = getServices();
    const offers = getOffers();
    const hasPhoneNumber = getPhoneNumber() !== null;

    // Early return if job is not provided
    if (!job) {
        return null;
    }

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[0.99] mb-4 relative"
        >
            {/* Offer Badge */}
            {offers && (
                <div className="absolute top-2 left-2 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Tag size={12} />
                    {offers} Offer
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
                        <span className="text-6xl">🔬</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Lab Name */}
                <h3 className="text-[17px] font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2">
                    {getName()}
                </h3>

                {/* Rating */}
                {rating && (
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded">
                            <span className="text-[13px] font-semibold">
                                {rating.toFixed(1)}
                            </span>
                            <Star size={11} className="fill-white" />
                        </div>
                        {userRatingsTotal && (
                            <span className="text-xs text-gray-500">
                                {userRatingsTotal.toLocaleString()} Ratings
                            </span>
                        )}
                    </div>
                )}

                {/* Location */}
                <div className="flex items-center text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="text-[13px] line-clamp-1">{getLocation()}</span>
                </div>

                {/* Distance */}
                {distance && (
                    <p className="text-xs font-semibold text-blue-600 mb-2">{distance}</p>
                )}

                {/* Special Tags */}
                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.map((tag, index) => (
                            <span
                                key={index}
                                className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded ${getBadgeStyles(
                                    tag
                                )}`}
                            >
                                <BadgeIcon badge={tag} />
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Services/Tests */}
                {services.length > 0 && (
                    <div className="mb-3">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {services.slice(0, 2).map((service, index) => (
                                <div key={index} className="text-xs text-gray-700">
                                    <span className="font-medium">{service}</span>
                                    {index === 0 && (
                                        <span className="text-gray-500 ml-1">
                                            ₹1,000 <span className="text-[10px]">/ session</span>
                                        </span>
                                    )}
                                </div>
                            ))}
                            {services.length > 2 && (
                                <button className="text-xs font-semibold text-blue-600 hover:underline">
                                    +{services.length - 2} More
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons - JustDial Style */}
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={handleCall}
                        disabled={!hasPhoneNumber}
                        className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg font-bold text-xs transition-all active:scale-95 ${hasPhoneNumber
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={14} />
                        <span>{hasPhoneNumber ? PHONE_NUMBERS_MAP[job.id] : "No Phone"}</span>
                    </button>

                    <button
                        onClick={handleWhatsApp}
                        disabled={!hasPhoneNumber}
                        className={`flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg font-bold text-xs transition-all active:scale-95 ${hasPhoneNumber
                                ? "bg-green-500 text-white hover:bg-green-600"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <MessageSquare size={14} />
                        <span>WhatsApp</span>
                    </button>

                    <button
                        onClick={handleSendEnquiry}
                        className="flex items-center justify-center gap-1 px-3 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-bold text-xs transition-all active:scale-95"
                    >
                        <MessageSquare size={14} />
                        <span>Send Enquiry</span>
                        <span className="text-[10px] opacity-90">Responds in 40 Mins</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN COMPONENT ================= */

interface NearbyDiagnosticLabsProps {
    job?: any;
    onViewDetails: (job: any) => void;
}

const NearbyDiagnosticLabs: React.FC<NearbyDiagnosticLabsProps> = (props) => {
    // If no job is provided, render the grid of dummy diagnostic labs
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_DIAGNOSTIC_LABS.map((lab) => (
                    <SingleDiagnosticLabCard
                        key={lab.place_id}
                        job={{
                            id: lab.place_id,
                            title: lab.name,
                            location: lab.vicinity,
                            distance: lab.distance,
                            category: "Diagnostic Lab",
                            jobData: {
                                rating: lab.rating,
                                user_ratings_total: lab.user_ratings_total,
                                opening_hours: lab.opening_hours,
                                geometry: lab.geometry,
                                business_status: lab.business_status,
                                price_level: lab.price_level,
                                types: lab.types,
                                special_tags: lab.special_tags,
                                services: lab.services,
                                offers: lab.offers,
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
        <SingleDiagnosticLabCard job={props.job} onViewDetails={props.onViewDetails} />
    );
};

export default NearbyDiagnosticLabs;
