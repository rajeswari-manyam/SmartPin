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
    Package,
} from "lucide-react";

/* ================= TYPES ================= */

export interface ParcelServiceType {
    id: string;
    name: string;
    address: string;
    rating: number;
    totalRatings: number;
    phone: string;
    distance: number;
    description: string;
    services: string[];
    lat: number;
    lng: number;
    isVerified: boolean;
    isTrending: boolean;
    isResponsive: boolean;
    responseTime?: string;
}

/* ================= IMAGES ================= */

const PARCEL_IMAGES_MAP: Record<string, string[]> = {
    parcel_1: [
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800",
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
    ],
    parcel_2: [
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800",
        "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=800",
    ],
    parcel_3: [
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
        "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800",
    ],
    parcel_4: [
        "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=800",
        "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_PARCEL_SERVICES: ParcelServiceType[] = [
    {
        id: "parcel_1",
        name: "Express Parcel Services",
        address: "MG Road, Bangalore",
        rating: 4.7,
        totalRatings: 523,
        phone: "08904402330",
        distance: 1.2,
        description: "Fast and reliable parcel delivery services with real-time tracking and doorstep pickup.",
        services: ["Same Day Delivery", "Express Shipping", "Parcel Tracking", "Doorstep Pickup"],
        lat: 12.9716,
        lng: 77.5946,
        isVerified: true,
        isTrending: true,
        isResponsive: true,
        responseTime: "15 mins",
    },
    {
        id: "parcel_2",
        name: "Quick Parcel Logistics",
        address: "Whitefield, Bangalore",
        rating: 4.5,
        totalRatings: 312,
        phone: "08460493840",
        distance: 2.8,
        description: "Professional parcel and logistics services for domestic and international shipments.",
        services: ["Domestic Parcel", "International Shipping", "Bulk Orders", "Fragile Handling"],
        lat: 12.9698,
        lng: 77.7500,
        isVerified: true,
        isTrending: false,
        isResponsive: true,
        responseTime: "30 mins",
    },
    {
        id: "parcel_3",
        name: "City Parcel Express",
        address: "Indiranagar, Bangalore",
        rating: 4.8,
        totalRatings: 789,
        phone: "07942687151",
        distance: 3.5,
        description: "Trusted parcel service with affordable rates and excellent customer support.",
        services: ["Next Day Delivery", "Cash on Delivery", "Parcel Insurance", "SMS Updates"],
        lat: 12.9719,
        lng: 77.6412,
        isVerified: false,
        isTrending: true,
        isResponsive: false,
        responseTime: "1 hour",
    },
    {
        id: "parcel_4",
        name: "Metro Parcel Solutions",
        address: "Koramangala, Bangalore",
        rating: 4.6,
        totalRatings: 456,
        phone: "07947123456",
        distance: 4.1,
        description: "Comprehensive parcel solutions for businesses and individuals with competitive pricing.",
        services: ["Corporate Delivery", "E-commerce Parcels", "Weekend Delivery", "24/7 Support"],
        lat: 12.9352,
        lng: 77.6245,
        isVerified: true,
        isTrending: false,
        isResponsive: true,
        responseTime: "20 mins",
    },
];

/* ================= COMPONENT ================= */

const SingleParcelCard: React.FC<{
    service: ParcelServiceType;
    onViewDetails: (service: ParcelServiceType) => void;
}> = ({ service, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos =
        PARCEL_IMAGES_MAP[service.id] || PARCEL_IMAGES_MAP["parcel_1"];

    const hasPhotos = photos.length > 0;
    const currentPhoto = photos[currentImageIndex];

    const handlePrev = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((p) => Math.max(p - 1, 0));
    }, []);

    const handleNext = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((p) => Math.min(p + 1, photos.length - 1));
    }, [photos.length]);

    const handleCall = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `tel:${service.phone}`;
    }, [service.phone]);

    const handleDirections = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${service.lat},${service.lng}`,
            "_blank"
        );
    }, [service.lat, service.lng]);

    const tags = [
        service.isVerified && "Verified",
        service.isTrending && "Trending",
        service.isResponsive && "Quick Response",
    ].filter(Boolean) as string[];

    return (
        <div
            onClick={() => onViewDetails(service)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
        >
            {/* IMAGE */}
            <div className="relative h-48 bg-gray-100">
                {currentPhoto ? (
                    <>
                        <img
                            src={currentPhoto}
                            className="w-full h-full object-cover"
                            alt={service.name}
                        />

                        {hasPhotos && photos.length > 1 && (
                            <>
                                {currentImageIndex > 0 && (
                                    <button
                                        onClick={handlePrev}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}

                                {currentImageIndex < photos.length - 1 && (
                                    <button
                                        onClick={handleNext}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                )}

                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                        📦
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-3.5">
                {/* Name */}
                <h3 className="text-[17px] font-bold text-gray-900 mb-1 line-clamp-2">
                    {service.name}
                </h3>

                {/* Address */}
                <div className="flex items-center text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1" />
                    <span className="text-[13px] line-clamp-1">{service.address}</span>
                </div>

                {/* Distance */}
                <p className="text-xs font-semibold text-indigo-600 mb-2">
                    {service.distance.toFixed(1)} km away
                </p>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map((tag, i) => (
                            <span
                                key={i}
                                className="bg-indigo-100 text-indigo-700 text-[10px] font-semibold px-2 py-0.5 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Description */}
                <p className="text-[13px] text-gray-600 mb-2 line-clamp-3">
                    {service.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-2">
                    <Star size={13} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-[13px] font-semibold">
                        {service.rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({service.totalRatings})
                    </span>

                    {service.responseTime && (
                        <span className="ml-2 flex items-center gap-1 bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-0.5 rounded">
                            <Clock size={11} />
                            {service.responseTime}
                        </span>
                    )}
                </div>

                {/* SERVICES */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 mb-1">
                        SERVICES:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {service.services.slice(0, 4).map((srv, idx) => (
                            <span
                                key={idx}
                                className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-[11px] px-2 py-1 rounded"
                            >
                                <CheckCircle size={11} />
                                {srv}
                            </span>
                        ))}
                        {service.services.length > 4 && (
                            <span className="bg-gray-100 text-gray-600 text-[11px] px-2 py-1 rounded">
                                +{service.services.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-xs py-2.5 rounded-lg"
                    >
                        <Navigation size={14} />
                        Route
                    </button>

                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 bg-green-50 text-green-600 font-bold text-xs py-2.5 rounded-lg"
                    >
                        <Phone size={14} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= WRAPPER ================= */

interface WrapperProps {
    service?: ParcelServiceType;
    onViewDetails: (service: ParcelServiceType) => void;
}

const ParcelServicesListing: React.FC<WrapperProps> = ({ service, onViewDetails }) => {
    if (!service) {
        // Render grid of dummy data
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_PARCEL_SERVICES.map((parcelService) => (
                    <SingleParcelCard
                        key={parcelService.id}
                        service={parcelService}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // Render single service
    return <SingleParcelCard service={service} onViewDetails={onViewDetails} />;
};

export default ParcelServicesListing;
