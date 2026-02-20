import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Star,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    CheckCircle,
    TrendingUp,
    Shield,
    Navigation,
} from "lucide-react";

/* ================= TYPES ================= */

export interface HousekeepingService {
    id: string;
    name: string;
    description: string;
    location: string;
    distance: number;
    rating: number;
    totalRatings: number;
    isTrending?: boolean;
    isVerified?: boolean;
    isGST?: boolean;
    isPopular?: boolean;
    isResponsive?: boolean;
    services: string[];
    photos: string[];
}

interface HousekeepingCardProps {
    service?: HousekeepingService;
    onViewDetails: (service: HousekeepingService) => void;
}

const HOUSEKEEPING_SERVICES: HousekeepingService[] = [
    {
        id: "service_1",
        name: "Metro Facility Management Services",
        description: "Professional housekeeping and residential deep cleaning services with trained staff. Specialized in comprehensive facility management solutions.",
        location: "Sai Nagar Madhapur, Hyderabad",
        distance: 7.9,
        rating: 4.0,
        totalRatings: 99,
        isVerified: true,
        isPopular: true,
        services: ["Residential Deep Cleaning Services", "Housekeeping Services", "Facility Management"],
        photos: [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
            "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800",
            "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800",
        ]
    },
    {
        id: "service_2",
        name: "LAXMI HOUSE KEEPING SERVICES",
        description: "Trusted housekeeping services provider offering residential cleaning with GST billing. Expert team for all your cleaning needs.",
        location: "20-211/1 Indira Nagar Gajularamaram, Hyderabad",
        distance: 3.9,
        rating: 4.1,
        totalRatings: 7,
        isTrending: true,
        isGST: true,
        services: ["Residential Cleaning Services", "Housekeeping Services", "Deep Cleaning"],
        photos: [
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
            "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800",
        ]
    },
    {
        id: "service_3",
        name: "RVS FACILITIES MANAGEMENT SERVICES",
        description: "Comprehensive housekeeping services for residential and commercial properties. Professional cleaning solutions with quality assurance.",
        location: "MADHAPUR HYDERABAD Madhapur, Hyderabad",
        distance: 8.2,
        rating: 4.3,
        totalRatings: 4,
        isVerified: true,
        services: ["Housekeeping Services", "Housekeeping Services For Residential", "Facility Management"],
        photos: [
            "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
            "https://images.unsplash.com/photo-1603712725038-bfbd76e0e1d7?w=800",
        ]
    },
    {
        id: "service_4",
        name: "T A Facility Services LLP",
        description: "Quick and responsive facility services with experienced housekeeping staff. Reliable cleaning services for homes and offices.",
        location: "Power Nagar Moosapet, Hyderabad",
        distance: 3.6,
        rating: 4.1,
        totalRatings: 32,
        isResponsive: true,
        isVerified: true,
        services: ["Housekeeping Services", "Facility Management Services", "Deep Cleaning"],
        photos: [
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
            "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
        ]
    },
    {
        id: "service_5",
        name: "Sai Srinivasa Security and House Keeping",
        description: "Combined security and housekeeping services provider with trained professionals. Complete property maintenance solutions.",
        location: "Kukatpally, Hyderabad",
        distance: 5.8,
        rating: 4.2,
        totalRatings: 15,
        isVerified: true,
        services: ["House Keeping Services", "Security Services", "Facility Management"],
        photos: [
            "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800",
            "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800",
            "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
        ]
    },
    {
        id: "service_6",
        name: "Prime Housekeeping Solutions",
        description: "Premium housekeeping and cleaning services with eco-friendly products. Specialized in residential deep cleaning and maintenance.",
        location: "Miyapur, Hyderabad",
        distance: 4.5,
        rating: 4.4,
        totalRatings: 28,
        isTrending: true,
        isVerified: true,
        services: ["Residential Cleaning", "Office Cleaning", "Deep Cleaning Services"],
        photos: [
            "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800",
            "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
        ]
    },
];

/* ================= PHONE MAP ================= */

const PHONE_NUMBERS: Record<string, string> = {
    service_1: "09606428516",
    service_2: "08197440688",
    service_3: "08460233179",
    service_4: "07048378004",
    service_5: "07405504559",
    service_6: "09980824390",
};

/* ================= SINGLE CARD ================= */

const SingleHousekeepingCard: React.FC<{
    service: HousekeepingService;
    onViewDetails: (service: HousekeepingService) => void;
}> = ({ service, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((p) => (p + 1) % service.photos.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(
            (p) => (p - 1 + service.photos.length) % service.photos.length
        );
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS[service.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const dest = encodeURIComponent(service.location || "");
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");
    };

    return (
        <div
            onClick={() => onViewDetails(service)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer h-full flex flex-col overflow-hidden"
        >
            {/* Image Carousel */}
            <div className="relative h-52 bg-gray-100 shrink-0">
                {service.photos[currentImageIndex] ? (
                    <>
                        <img
                            src={service.photos[currentImageIndex]}
                            alt={service.name}
                            className="w-full h-full object-cover"
                        />
                        {service.photos.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                                >
                                    <ChevronRight size={18} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{service.photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-purple-400">
                        <Sparkles size={56} />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                    {service.isVerified && (
                        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <CheckCircle size={12} /> Verified
                        </span>
                    )}
                    {service.isTrending && (
                        <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <TrendingUp size={12} /> Trending
                        </span>
                    )}
                    {service.isGST && (
                        <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                            <Shield size={12} /> GST
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h2 className="text-lg font-bold text-gray-900 line-clamp-2">
                    {service.name}
                </h2>

                <div className="flex items-center gap-2 text-sm">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{service.rating.toFixed(1)}</span>
                    <span className="text-gray-500">
                        ({service.totalRatings})
                    </span>
                </div>

                <div className="flex items-start gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-2">{service.location}</span>
                </div>

                <p className="text-xs font-semibold text-purple-600">
                    {service.distance} km away
                </p>

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {service.description}
                </p>

                {/* Services */}
                <div className="flex flex-wrap gap-2">
                    {service.services.slice(0, 3).map((s, i) => (
                        <span
                            key={i}
                            className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs"
                        >
                            ✓ {s}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2 pt-3">
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg py-2 font-semibold"
                    >
                        <Phone size={16} />
                        Call
                    </button>
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 border-2 border-blue-600 rounded-lg py-2 font-semibold"
                    >
                        <Navigation size={16} />
                        Get Location
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN CARD (LIKE CAFE) ================= */

const HousekeepingCard: React.FC<HousekeepingCardProps> = (props) => {
    if (!props.service) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {HOUSEKEEPING_SERVICES.map((svc) => (
                    <SingleHousekeepingCard
                        key={svc.id}
                        service={svc}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SingleHousekeepingCard
            service={props.service}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default HousekeepingCard;
