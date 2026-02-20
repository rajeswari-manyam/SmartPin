import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

/* ================= TYPES ================= */

interface Business {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    businessData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
    };
}

interface CraftBusinessCardProps {
    business?: Business;
    onViewDetails: (business: Business) => void;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    craft_1: "07947110492",
    craft_2: "09562742701",
    craft_3: "09544742701",
    craft_4: "07947418289",
};

const BUSINESS_IMAGES_MAP: Record<string, string[]> = {
    craft_1: [
        "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=800",
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
    ],
    craft_2: [
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800",
        "https://images.unsplash.com/photo-1581092160607-ee67e66dce83?w=800",
    ],
    craft_3: [
        "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
    ],
    craft_4: [
        "https://images.unsplash.com/photo-1581092162384-8987c1d64926?w=800",
    ],
};

const BUSINESS_SERVICES = [
    "Expert Service",
    "Quality Guaranteed",
    "Fast Delivery",
    "Custom Solutions",
];

const DUMMY_BUSINESSES: Business[] = [
    {
        id: "craft_1",
        title: "Craft Tech Cutting Tools Pvt Ltd",
        description:
            "Leading provider of precision cutting tools and agricultural machinery.",
        location: "Mancheswar Industrial Area, Bhubaneswar",
        distance: 12.5,
        category: "Machinery",
        businessData: {
            rating: 4.5,
            user_ratings_total: 17,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 20.2961, lng: 85.8245 } },
        },
    },
    {
        id: "craft_2",
        title: "Craft Core Cutting Services",
        description:
            "Professional core cutting and slab cutting services for construction.",
        location: "North Edayur, Malappuram",
        distance: 8.3,
        category: "Construction",
        businessData: {
            rating: 4.7,
            user_ratings_total: 7,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 11.051, lng: 76.0711 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleBusinessCard: React.FC<{
    business: Business;
    onViewDetails: (business: Business) => void;
}> = ({ business, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = BUSINESS_IMAGES_MAP[business.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const rating = business.businessData?.rating;
    const totalRatings = business.businessData?.user_ratings_total;
    const isOpen = business.businessData?.opening_hours?.open_now;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[business.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = business.businessData?.geometry?.location;
        if (loc) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
                "_blank"
            );
        }
    };

    return (
        <div
            onClick={() => onViewDetails(business)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer h-full flex flex-col overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                {currentPhoto ? (
                    <>
                        <img
                            src={currentPhoto}
                            alt={business.title}
                            className="w-full h-full object-cover"
                        />
                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex(
                                            (prev) => (prev - 1 + photos.length) % photos.length
                                        );
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((prev) => (prev + 1) % photos.length);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-4xl">
                        🛠️
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h3 className="text-xl font-bold text-gray-800 line-clamp-2">
                    {business.title}
                </h3>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{business.location}</span>
                </div>

                {business.distance && (
                    <p className="text-xs font-semibold text-green-600">
                        {business.distance} km away
                    </p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {business.description}
                </p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            <span className="text-gray-500">({totalRatings})</span>
                        </div>
                    )}
                    {isOpen !== undefined && (
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded ${isOpen
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            <span className="text-xs font-semibold">
                                {isOpen ? "Open" : "Closed"}
                            </span>
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Services
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {BUSINESS_SERVICES.slice(0, 3).map((service, i) => (
                            <span
                                key={i}
                                className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs"
                            >
                                ✓ {service}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold"
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN EXPORT ================= */

const CraftBusinessCard: React.FC<CraftBusinessCardProps> = ({
    business,
    onViewDetails,
}) => {
    if (!business) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_BUSINESSES.map((b) => (
                    <SingleBusinessCard
                        key={b.id}
                        business={b}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SingleBusinessCard business={business} onViewDetails={onViewDetails} />
    );
};

export default CraftBusinessCard;
