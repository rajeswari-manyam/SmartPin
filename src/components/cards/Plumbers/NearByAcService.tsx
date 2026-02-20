import React, { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    Navigation,
    Snowflake,
} from "lucide-react";

/* ================= TYPES ================= */

export interface ACService {
    id: string;
    title: string;
    location: string;
    distance: number;
    description?: string;
    serviceData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
        verified?: boolean;
    };
}

interface Props {
    service?: ACService;
    onViewDetails: (service: ACService) => void;
}

/* ================= DATA ================= */

const PHONE_MAP: Record<string, string> = {
    service_1: "08511738240",
    service_2: "09845265063",
    service_3: "07411846490",
    service_4: "08734904238",
};

const IMAGES: Record<string, string[]> = {
    service_1: [
        "https://images.unsplash.com/photo-1631545805104-9c4d44def7f0?w=800",
        "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800",
    ],
    service_2: [
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
        "https://images.unsplash.com/photo-1604754742629-7e0d0a658e2d?w=800",
    ],
    service_3: [
        "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800",
    ],
    service_4: [
        "https://images.unsplash.com/photo-1562408590-e32931084e23?w=800",
    ],
};

const SERVICES = [
    "AC Repair",
    "Installation",
    "Gas Refilling",
    "Deep Cleaning",
    "AMC",
];

/* ================= DUMMY DATA ================= */

const DUMMY_AC_SERVICES: ACService[] = [
    {
        id: "service_1",
        title: "CoolTech AC Services",
        location: "MG Road, Bangalore",
        distance: 0.8,
        description: "Expert AC repair and maintenance with fast response.",
        serviceData: {
            rating: 4.7,
            user_ratings_total: 142,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 12.9716, lng: 77.5946 } },
        },
    },
    {
        id: "service_2",
        title: "FreezePro Cooling",
        location: "Indiranagar, Bangalore",
        distance: 1.4,
        description: "Professional split & window AC installation.",
        serviceData: {
            rating: 4.5,
            user_ratings_total: 98,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 12.9784, lng: 77.6408 } },
        },
    },
    {
        id: "service_3",
        title: "Arctic Air Solutions",
        location: "Whitefield, Bangalore",
        distance: 3.2,
        description: "Affordable gas refilling and deep AC cleaning.",
        serviceData: {
            rating: 4.8,
            user_ratings_total: 215,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 12.9698, lng: 77.7500 } },
        },
    },
    {
        id: "service_4",
        title: "Rapid Chill Services",
        location: "BTM Layout, Bangalore",
        distance: 2.1,
        description: "24/7 emergency AC service with AMC plans.",
        serviceData: {
            rating: 4.6,
            user_ratings_total: 165,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 12.9166, lng: 77.6101 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleACServiceCard: React.FC<{
    service: ACService;
    onViewDetails: (service: ACService) => void;
}> = ({ service, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES[service.id] || [],
        [service.id]
    );

    const rating = service.serviceData?.rating;
    const reviews = service.serviceData?.user_ratings_total;
    const isOpen = service.serviceData?.opening_hours?.open_now;

    const phone = PHONE_MAP[service.id];
    const lat = service.serviceData?.geometry?.location?.lat;
    const lng = service.serviceData?.geometry?.location?.lng;

    const openMaps = () => {
        if (!lat || !lng) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    const callNow = () => {
        if (!phone) return;
        window.location.href = `tel:${phone}`;
    };

    return (
        <div
            onClick={() => onViewDetails(service)}
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden h-full flex flex-col"
        >
            {/* IMAGE */}
            <div className="relative h-48 bg-gray-100">
                {photos.length ? (
                    <>
                        <img
                            src={photos[index]}
                            className="w-full h-full object-cover"
                            alt={service.title}
                        />

                        {index > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIndex(i => i - 1);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}

                        {index < photos.length - 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIndex(i => i + 1);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                            >
                                <ChevronRight size={18} />
                            </button>
                        )}

                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}/{photos.length}
                        </span>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                        ❄️
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h3 className="text-lg font-bold">{service.title}</h3>

                <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    {service.location}
                </div>

                <p className="text-blue-600 text-sm font-semibold">
                    {service.distance.toFixed(1)} km away
                </p>

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {service.description}
                </p>

                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded w-fit">
                    <Snowflake size={12} />
                    AC Service
                </span>

                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            {reviews && (
                                <span className="text-gray-500">({reviews})</span>
                            )}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
              ${isOpen
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            {isOpen ? "Open" : "Closed"}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {SERVICES.slice(0, 3).map(s => (
                        <span
                            key={s}
                            className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded"
                        >
                            {s}
                        </span>
                    ))}
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        +{SERVICES.length - 3} more
                    </span>
                </div>

                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openMaps();
                        }}
                        className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50 flex items-center justify-center gap-1"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            callNow();
                        }}
                        disabled={!phone}
                        className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2
              ${phone
                                ? "bg-green-100 text-green-700 border border-green-600 hover:bg-green-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= WRAPPER ================= */

const NearbyACServiceCard: React.FC<Props> = ({ service, onViewDetails }) => {
    if (service) {
        return (
            <SingleACServiceCard
                service={service}
                onViewDetails={onViewDetails}
            />
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DUMMY_AC_SERVICES.map(item => (
                <SingleACServiceCard
                    key={item.id}
                    service={item}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
};

export default NearbyACServiceCard;
