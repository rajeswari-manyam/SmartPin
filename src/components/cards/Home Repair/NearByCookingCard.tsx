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

interface Cook {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    cookData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
        services?: string[];
    };
}

interface NearbyCookCardProps {
    cook?: Cook;
    onViewDetails: (cook: Cook) => void;
}

/* ================= STATIC DATA ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    cook_1: "07947133917",
    cook_2: "07947141710",
    cook_3: "07947131707",
    cook_4: "07942696319",
};

const COOK_IMAGES_MAP: Record<string, string[]> = {
    cook_1: [
        "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800",
        "https://images.unsplash.com/photo-1577219491135-ce391730fb4c?w=800",
    ],
    cook_2: [
        "https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=800",
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800",
    ],
    cook_3: [
        "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    ],
    cook_4: [
        "https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800",
        "https://images.unsplash.com/photo-1559847844-5315695dadae?w=800",
    ],
};

const DUMMY_COOKS: Cook[] = [
    {
        id: "cook_1",
        title: "Mohammed Eshak Caterers",
        location: "Gajularamaram Road, Hyderabad",
        distance: 3.7,
        cookData: {
            rating: 4.6,
            user_ratings_total: 19,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5145, lng: 78.4382 } },
            services: ["Catering", "Event Cooking", "Bulk Orders"],
        },
    },
    {
        id: "cook_2",
        title: "Sagar Cooking Services",
        location: "Kukatpally, Hyderabad",
        distance: 2.6,
        cookData: {
            rating: 3.8,
            user_ratings_total: 5,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4948, lng: 78.3996 } },
            services: ["Home Cooking", "Party Orders"],
        },
    },
    {
        id: "cook_3",
        title: "Mumtaz Function Cooks",
        location: "Mehdipatnam, Hyderabad",
        distance: 8.5,
        cookData: {
            rating: 4.2,
            user_ratings_total: 86,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 17.3945, lng: 78.4406 } },
            services: ["Wedding Catering", "Biryani Specialist"],
        },
    },
];

/* ================= CARD ================= */

const SingleCookCard: React.FC<{
    cook: Cook;
    onViewDetails: (cook: Cook) => void;
}> = ({ cook, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = COOK_IMAGES_MAP[cook.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const rating = cook.cookData?.rating?.toFixed(1);
    const totalRatings = cook.cookData?.user_ratings_total;
    const isOpen = cook.cookData?.opening_hours?.open_now;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[cook.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = cook.cookData?.geometry?.location;
        if (loc) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
                "_blank"
            );
        }
    };

    return (
        <div
            onClick={() => onViewDetails(cook)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={cook.title} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((i) => (i - 1 + photos.length) % photos.length);
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((i) => (i + 1) % photos.length);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-4xl text-gray-400">🍳</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                    {cook.title}
                </h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{cook.location}</span>
                </div>

                {cook.distance && (
                    <p className="text-xs font-semibold text-green-600">
                        {cook.distance} km away
                    </p>
                )}

                {/* Rating & Status */}
                <div className="flex items-center gap-3 pt-2">
                    {rating && (
                        <div className="flex items-center gap-1 text-sm">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
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
                {cook.cookData?.services && (
                    <div className="pt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                            Services
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {cook.cookData.services.slice(0, 3).map((service, idx) => (
                                <span
                                    key={idx}
                                    className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs"
                                >
                                    ✓ {service}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg font-semibold hover:bg-indigo-100"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg font-semibold hover:bg-green-100"
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= LIST ================= */

const NearbyCookCard: React.FC<NearbyCookCardProps> = ({ cook, onViewDetails }) => {
    if (!cook) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_COOKS.map((c) => (
                    <SingleCookCard key={c.id} cook={c} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleCookCard cook={cook} onViewDetails={onViewDetails} />;
};

export default NearbyCookCard;
