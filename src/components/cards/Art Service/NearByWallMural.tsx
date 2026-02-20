import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Star,
    ChevronLeft,
    ChevronRight,
    Shield,
    TrendingUp,
    Navigation
} from "lucide-react";

/* ================= TYPES ================= */

interface WallMuralManufacturer {
    id: string;
    name: string;
    rating: number;
    ratingsCount: number;
    location: string;
    lat?: number;
    lng?: number;
    specialties: string[];
    phone: string;
    images: string[];
    verified?: boolean;
    trending?: boolean;
}

/* ================= DUMMY DATA ================= */

const DUMMY_MANUFACTURERS: WallMuralManufacturer[] = [
    {
        id: "1",
        name: "Sawant Art",
        rating: 4.6,
        ratingsCount: 5,
        location: "Thane",
        lat: 19.2183,
        lng: 72.9781,
        specialties: ["3D Painting"],
        phone: "08296230426",
        images: [
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
            "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
        ],
    },
    {
        id: "2",
        name: "Godai Arts",
        rating: 5.0,
        ratingsCount: 11,
        location: "Mumbai",
        lat: 19.0760,
        lng: 72.8777,
        specialties: ["3D Painting"],
        phone: "08904245881",
        images: [
            "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
            "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
        ],
        verified: true,
    },
    {
        id: "3",
        name: "Infinity Art Services",
        rating: 4.9,
        ratingsCount: 95,
        location: "Thane",
        lat: 19.2094,
        lng: 72.9723,
        specialties: ["Apartment Murals", "Custom Design"],
        phone: "08401459125",
        images: [
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800",
            "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
        ],
        trending: true,
    },
];

/* ================= CARD ================= */

const WallMuralCard: React.FC<{ item: WallMuralManufacturer }> = ({ item }) => {
    const [index, setIndex] = useState(0);
    const total = item.images.length;

    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIndex((i) => (i + 1) % total);
    };

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIndex((i) => (i - 1 + total) % total);
    };

    const callNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `tel:${item.phone}`;
    };

    const getLocation = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (item.lat && item.lng) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`,
                "_blank"
            );
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col">
            {/* IMAGE */}
            <div className="relative h-48 bg-gray-200">
                <img
                    src={item.images[index]}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />

                {total > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}/{total}
                        </div>
                    </>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold line-clamp-1">{item.name}</h2>
                    {item.verified && <Shield size={16} className="text-blue-600" />}
                    {item.trending && <TrendingUp size={16} className="text-orange-600" />}
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                    <MapPin size={14} />
                    {item.location}
                </div>

                <div className="flex items-center gap-2 text-sm mb-3">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{item.rating}</span>
                    <span className="text-gray-500">({item.ratingsCount})</span>
                </div>

                {/* SPECIALTIES */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {item.specialties.map((s, i) => (
                        <span
                            key={i}
                            className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded"
                        >
                            ✓ {s}
                        </span>
                    ))}
                </div>

                {/* BUTTONS */}
                <div className="mt-auto flex gap-2">
                    <button
                        onClick={getLocation}
                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg py-2 font-semibold hover:bg-indigo-100"
                    >
                        <Navigation size={16} />
                        Get Location
                    </button>

                    <button
                        onClick={callNow}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg py-2 font-semibold hover:bg-green-100"
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

const WallMuralCafeStyle: React.FC = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">
                Wall Mural Manufacturers Near You
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_MANUFACTURERS.map((item) => (
                    <WallMuralCard key={item.id} item={item} />
                ))}
            </div>
        </div>
    );
};

export default WallMuralCafeStyle;
