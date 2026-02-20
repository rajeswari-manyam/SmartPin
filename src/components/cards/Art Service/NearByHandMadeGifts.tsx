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

export interface HandmadeGift {
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

/* ================= PROPS ================= */

interface NearbyHandmadeGiftCardProps {
    business?: HandmadeGift;
    onViewDetails: (business: HandmadeGift) => void;
}

/* ================= PHONE MAP ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    shop_1: "07947138792",
    shop_2: "07947138962",
    shop_3: "07947430941",
    shop_4: "08460471716",
};

/* ================= IMAGES ================= */

const GIFT_IMAGES_MAP: Record<string, string[]> = {
    shop_1: [
        "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800",
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800",
    ],
    shop_2: [
        "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800",
        "https://images.unsplash.com/photo-1608528924449-679e86baff75?w=800",
        "https://images.unsplash.com/photo-1566041510394-cf7c8fe21800?w=800",
    ],
    shop_3: [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
        "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=800",
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
    ],
    shop_4: [
        "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800",
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800",
        "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800",
    ],
};

/* ================= DESCRIPTIONS ================= */

const GIFT_DESCRIPTIONS_MAP: Record<string, string> = {
    shop_1: "Handmade dreamcatchers and unique artisan decor gifts.",
    shop_2: "Personalized gifts, greeting cards and premium collections.",
    shop_3: "Festive decorations, pooja items and handcrafted gifts.",
    shop_4: "Toys, educational gifts and curated gift collections.",
};

/* ================= DUMMY DATA ================= */

const DUMMY_GIFTS: HandmadeGift[] = [
    {
        id: "shop_1",
        title: "Ekdant Artbox Dreamcatchers",
        description: GIFT_DESCRIPTIONS_MAP.shop_1,
        location: "Raviwar Peth, Pune",
        distance: 1.5,
        category: "Gift Shop",
        businessData: {
            rating: 4.9,
            user_ratings_total: 74,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 18.5204, lng: 73.8567 } },
        },
    },
    {
        id: "shop_2",
        title: "Arva Collection",
        description: GIFT_DESCRIPTIONS_MAP.shop_2,
        location: "Nashik Road, Nashik",
        distance: 2.1,
        category: "Gift Shop",
        businessData: {
            rating: 4.0,
            user_ratings_total: 1,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 19.9975, lng: 73.7898 } },
        },
    },
    {
        id: "shop_3",
        title: "Ganesh Gift House",
        description: GIFT_DESCRIPTIONS_MAP.shop_3,
        location: "Bhadrakali Road, Nashik",
        distance: 3.2,
        category: "Gift Shop",
        businessData: {
            rating: 4.4,
            user_ratings_total: 34,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 19.9975, lng: 73.7898 } },
        },
    },
    {
        id: "shop_4",
        title: "Neo Toys & Gift Gallery",
        description: GIFT_DESCRIPTIONS_MAP.shop_4,
        location: "Vapi Industrial Estate",
        distance: 5.0,
        category: "Gift Shop",
        businessData: {
            rating: 4.7,
            user_ratings_total: 15,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 20.3717, lng: 72.9046 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleHandmadeGiftCard: React.FC<{
    business: HandmadeGift;
    onViewDetails: (business: HandmadeGift) => void;
}> = ({ business, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = GIFT_IMAGES_MAP[business.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((p) => (p + 1) % photos.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((p) => (p - 1 + photos.length) % photos.length);
    };

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

    const rating = business.businessData?.rating;
    const total = business.businessData?.user_ratings_total;
    const isOpen = business.businessData?.opening_hours?.open_now;

    return (
        <div
            onClick={() => onViewDetails(business)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer h-full flex flex-col overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-4xl">
                        🎁
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                    {business.title}
                </h2>

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
                <div className="flex items-center gap-3 pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            <span className="text-gray-500">({total})</span>
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

                {/* Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
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

/* ================= LIST VIEW ================= */

const NearbyHandmadeGiftCard: React.FC<NearbyHandmadeGiftCardProps> = ({
    business,
    onViewDetails,
}) => {
    if (!business) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_GIFTS.map((item) => (
                    <SingleHandmadeGiftCard
                        key={item.id}
                        business={item}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SingleHandmadeGiftCard
            business={business}
            onViewDetails={onViewDetails}
        />
    );
};

export default NearbyHandmadeGiftCard;
