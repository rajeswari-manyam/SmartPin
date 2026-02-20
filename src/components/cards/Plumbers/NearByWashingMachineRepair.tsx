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
    Zap,
    Award,
    ThumbsUp,
} from "lucide-react";

/* ================= TYPES ================= */

export interface WashingMachineService {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    serviceData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
        verified?: boolean;
        trending?: boolean;
        topSearch?: boolean;
        responsive?: boolean;
        popular?: boolean;
        suggestions?: number;
    };
}

/* ================= CONSTANTS ================= */

// Phone numbers map
const PHONE_NUMBERS_MAP: Record<string, string> = {
    service_1: "08123407242",
    service_2: "08197790090",
    service_3: "09035495690",
    service_4: "08734904238",
};

// Service images
const SERVICE_IMAGES_MAP: Record<string, string[]> = {
    service_1: [
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800",
        "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800",
        "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800",
    ],
    service_2: [
        "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
        "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800",
        "https://images.unsplash.com/photo-1624020465529-1a245f1652d5?w=800",
    ],
    service_3: [
        "https://images.unsplash.com/photo-1604754742629-7e0d0a658e2d?w=800",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800",
    ],
    service_4: [
        "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800",
        "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800",
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
    ],
};

// Service descriptions
const SERVICE_DESCRIPTIONS_MAP: Record<string, string> = {
    service_1:
        "Top Search washing machine repair service with 4.7★ rating and 20 reviews. Expert in drum repair, motor replacement, and electronic control board fixes. Available Now. Verified and Trusted.",
    service_2:
        "Verified washing machine service with 4.1★ rating and 70 reviews. Professional installation, repair, and maintenance for all models. Responsive. Quick service available.",
    service_3:
        "Responsive washing machine repair with 4.8★ rating and 56 reviews. Certified technicians specializing in LG, Samsung, and IFB models. Available Now. Excellent customer service.",
    service_4:
        "Popular authorized service center with 4.7★ rating and 263 reviews. Quality repairs with genuine spare parts and warranty. Professional technicians available.",
};

// Services offered
const WASHING_MACHINE_SERVICES = [
    "Drum Repair",
    "Motor Replacement",
    "Control Board Fix",
    "Installation",
    "Annual Maintenance",
    "Door Lock Repair",
    "Drain Pump Service",
    "All Brands Supported",
];

// Dummy Data
export const DUMMY_SERVICES: WashingMachineService[] = [
    {
        id: "service_1",
        title: "Urban Helper",
        description: SERVICE_DESCRIPTIONS_MAP["service_1"],
        location: "Moosapet Main Road Moosapet, Hyderabad",
        distance: 2.8,
        category: "Washing Machine Repair & Services",
        serviceData: {
            rating: 4.7,
            user_ratings_total: 20,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4679, lng: 78.4124 } },
            trending: true,
            verified: true,
        },
    },
    {
        id: "service_2",
        title: "Shiva Shankar Enterprises",
        description: SERVICE_DESCRIPTIONS_MAP["service_2"],
        location: "Rajiv Gandhi Nagar Jeedimetla, Hyderabad",
        distance: 5.3,
        category: "Washing Machine Repair & Services-IFB",
        serviceData: {
            rating: 4.1,
            user_ratings_total: 70,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5084, lng: 78.4324 } },
            responsive: true,
            verified: false,
        },
    },
    {
        id: "service_3",
        title: "A V R Enterprises",
        description: SERVICE_DESCRIPTIONS_MAP["service_3"],
        location: "Old Bowenpally-Bowenpally, Hyderabad",
        distance: 3.5,
        category: "Washing Machine Repair & Services",
        serviceData: {
            rating: 4.8,
            user_ratings_total: 56,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4875, lng: 78.4224 } },
            responsive: true,
            verified: true,
            suggestions: 26,
        },
    },
    {
        id: "service_4",
        title: "Smart Care Services",
        description: SERVICE_DESCRIPTIONS_MAP["service_4"],
        location: "S.C.B Nagar Kukatpally, Hyderabad",
        distance: 2.5,
        category: "Washing Machine Repair & Services",
        serviceData: {
            rating: 4.7,
            user_ratings_total: 263,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4924, lng: 78.3979 } },
            popular: true,
            verified: true,
        },
    },
];

/* ================= COMPONENT ================= */

interface SingleServiceCardProps {
    service?: any;
    onViewDetails: (service: any) => void;
}

const SingleServiceCard: React.FC<SingleServiceCardProps> = ({
    service,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos from service data - Using useCallback
    const getPhotos = useCallback(() => {
        if (!service) return [];
        const serviceId = service.id || "service_1";
        return SERVICE_IMAGES_MAP[serviceId] || SERVICE_IMAGES_MAP["service_1"];
    }, [service]);

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

    // Get service name from service data - Using useCallback
    const getName = useCallback((): string => {
        if (!service) return "Washing Machine Service";
        return service.title || "Washing Machine Service";
    }, [service]);

    // Get location string from service data - Using useCallback
    const getLocation = useCallback((): string => {
        if (!service) return "Location";
        return service.location || service.description || "Location";
    }, [service]);

    // Get distance string from service data - Using useCallback
    const getDistance = useCallback((): string => {
        if (!service) return "";
        if (service.distance !== undefined && service.distance !== null) {
            const distanceNum = Number(service.distance);
            if (!isNaN(distanceNum)) {
                return `${distanceNum.toFixed(1)} km away`;
            }
        }
        return "";
    }, [service]);

    // Get description - Using useCallback
    const getDescription = useCallback((): string => {
        if (!service) return "Professional washing machine repair services";
        const serviceId = service.id || "service_1";
        return (
            SERVICE_DESCRIPTIONS_MAP[serviceId] ||
            service.description ||
            "Professional washing machine repair services"
        );
    }, [service]);

    // Get rating from service data - Using useCallback
    const getRating = useCallback((): number | null => {
        if (!service) return null;
        const serviceData = service.serviceData as any;
        return serviceData?.rating || null;
    }, [service]);

    // Get user ratings total from service data - Using useCallback
    const getUserRatingsTotal = useCallback((): number | null => {
        if (!service) return null;
        const serviceData = service.serviceData as any;
        return serviceData?.user_ratings_total || null;
    }, [service]);

    // Get opening hours status from service data - Using useCallback
    const getOpeningStatus = useCallback((): string | null => {
        if (!service) return null;
        const serviceData = service.serviceData as any;
        const isOpen = serviceData?.opening_hours?.open_now;

        if (isOpen === undefined || isOpen === null) {
            return null;
        }

        return isOpen ? "Available Now" : "Currently Closed";
    }, [service]);

    // Get special tags from service data - Using useCallback
    const getSpecialTags = useCallback((): string[] => {
        if (!service) return [];
        const serviceData = service.serviceData as any;
        const tags: string[] = [];

        if (serviceData?.verified) tags.push("Verified");
        if (serviceData?.trending) tags.push("Trending");
        if (serviceData?.topSearch) tags.push("Top Search");
        if (serviceData?.responsive) tags.push("Responsive");
        if (serviceData?.popular) tags.push("Popular");

        return tags;
    }, [service]);

    // Get phone number for the service - Using useCallback
    const getPhoneNumber = useCallback((): string | null => {
        if (!service) return null;
        const serviceId = service.id || "";
        return PHONE_NUMBERS_MAP[serviceId] || null;
    }, [service]);

    // Handle call button press - Opens phone dialer
    const handleCall = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!service) return;

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
        [service, getPhoneNumber, getName]
    );

    // Handle WhatsApp button press
    const handleWhatsApp = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!service) return;

            const phoneNumber = getPhoneNumber();
            const name = getName();

            if (!phoneNumber) {
                alert(`No contact number available for ${name}.`);
                return;
            }

            // Format phone number for WhatsApp
            const formattedNumber = phoneNumber.replace(/[^0-9+]/g, "");
            const whatsappUrl = `https://wa.me/${formattedNumber}`;

            window.open(whatsappUrl, "_blank");
        },
        [service, getPhoneNumber, getName]
    );

    // Handle directions button press - Opens Maps app with exact location
    const handleDirections = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (!service) return;

            const serviceData = service.serviceData as any;
            const lat = serviceData?.geometry?.location?.lat;
            const lng = serviceData?.geometry?.location?.lng;

            if (!lat || !lng) {
                alert("Unable to get location coordinates for directions.");
                return;
            }

            // Create Google Maps URL with exact coordinates
            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${service.id || ""
                }`;

            window.open(googleMapsUrl, "_blank");
        },
        [service]
    );

    // Handle image loading error - Using useCallback
    const handleImageError = useCallback(() => {
        console.warn(
            "⚠️ Failed to load image for service:",
            service?.id || "unknown"
        );
        setImageError(true);
    }, [service]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const openingStatus = getOpeningStatus();
    const distance = getDistance();
    const description = getDescription();
    const specialTags = getSpecialTags();
    const visibleServices = WASHING_MACHINE_SERVICES.slice(0, 4);
    const moreServices =
        WASHING_MACHINE_SERVICES.length > 4
            ? WASHING_MACHINE_SERVICES.length - 4
            : 0;
    const hasPhoneNumber = getPhoneNumber() !== null;
    const suggestions = service?.serviceData?.suggestions;

    // Early return if service is not provided (after all hooks)
    if (!service) {
        return null;
    }

    return (
        <div
            onClick={() => onViewDetails(service)}
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
                        <span className="text-6xl">🧺</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Service Name */}
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

                {/* Special Tags */}
                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.map((tag, index) => (
                            <span
                                key={index}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded ${tag === "Verified"
                                        ? "bg-blue-100 text-blue-800"
                                        : tag === "Trending"
                                            ? "bg-orange-100 text-orange-800"
                                            : tag === "Top Search"
                                                ? "bg-amber-100 text-amber-800"
                                                : tag === "Responsive"
                                                    ? "bg-green-100 text-green-800"
                                                    : tag === "Popular"
                                                        ? "bg-purple-100 text-purple-800"
                                                        : "bg-gray-100 text-gray-800"
                                    }`}
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
                <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <span className="text-sm">🧺</span>
                    <span>Washing Machine Service</span>
                </div>

                {/* Rating, Status, and Suggestions Row */}
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
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
                            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus.includes("Available") || openingStatus.includes("Now")
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={11} />
                            <span>{openingStatus}</span>
                        </div>
                    )}
                </div>

                {/* Suggestions Badge */}
                {suggestions && (
                    <div className="flex items-center gap-1.5 text-sm mb-2">
                        <div className="flex items-center gap-1 text-gray-700">
                            <ThumbsUp size={12} className="text-red-500" />
                            <span className="text-[11px] font-semibold">"Excellent service"</span>
                            <span className="text-[11px] text-gray-500">
                                {suggestions} Suggestions
                            </span>
                        </div>
                    </div>
                )}

                {/* Services */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
                        SERVICES:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {visibleServices.map((serviceItem, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 text-[11px] font-medium px-2 py-1 rounded"
                            >
                                <CheckCircle size={11} />
                                <span>{serviceItem}</span>
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

                    <button
                        onClick={handleWhatsApp}
                        disabled={!hasPhoneNumber}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
                                ? "border-emerald-600 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        <span>WhatsApp</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

// Wrapper component - displays grid of dummy data or single card
const WashingMachineRepairServices: React.FC<SingleServiceCardProps> = (
    props
) => {
    // If no service is provided, render the grid of dummy services
    if (!props.service) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">
                            Washing Machine Repair Shops in Ranga Nagar
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Top rated washing machine repair and maintenance services near you
                        </p>
                    </div>

                    {/* Service Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {DUMMY_SERVICES.map((service) => (
                            <SingleServiceCard
                                key={service.id}
                                service={service}
                                onViewDetails={props.onViewDetails}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // If service is provided, render individual card
    return (
        <SingleServiceCard service={props.service} onViewDetails={props.onViewDetails} />
    );
};

export default WashingMachineRepairServices;
