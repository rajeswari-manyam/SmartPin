import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    ChevronLeft,
    ChevronRight,
    Shield,
} from "lucide-react";

/* ================= TYPES ================= */

interface PainterArtist {
    id: string;
    name: string;
    rating: number;
    ratingsCount: number;
    location: string;
    address: string;
    specialties: string[];
    phone: string;

    images: string[];
    verified?: boolean;
    distance?: number;
    geometry?: { lat: number; lng: number };
}

/* ================= DUMMY DATA ================= */

const DUMMY_PAINTERS: PainterArtist[] = [
    {
        id: "1",
        name: "Draw With Anuraglization",
        rating: 5.0,
        ratingsCount: 21,
        location: "Bihar Sharif",
        address: "Amber Chock Naseerpur, Bihar Sharif",
        specialties: ["Charcoal Painting", "Goddess Art"],
        phone: "9876543210",
        images: [
            "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
            "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
        ],
        verified: true,
        distance: 2.3,
        geometry: { lat: 25.1975, lng: 85.5236 },
    },
    {
        id: "2",
        name: "Rishi Art Club",
        rating: 4.6,
        ratingsCount: 18,
        location: "Ranchi",
        address: "Indrapuri Colony Road, Ranchi",
        specialties: ["Sketch Painting", "Artists"],
        phone: "07947140909",
        images: [
            "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800",
            "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800",
        ],
        verified: true,
        distance: 5.1,
        geometry: { lat: 23.3441, lng: 85.3096 },
    },
];

/* ================= CARD ================= */

const PainterCafeStyleCard: React.FC<{ painter: PainterArtist }> = ({ painter }) => {
    const [currentImage, setCurrentImage] = useState(0);

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImage((prev) => (prev - 1 + painter.images.length) % painter.images.length);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImage((prev) => (prev + 1) % painter.images.length);
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `tel:${painter.phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (painter.geometry) {
            const { lat, lng } = painter.geometry;
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                "_blank"
            );
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                <img
                    src={painter.images[currentImage]}
                    alt={painter.name}
                    className="w-full h-full object-cover"
                />

                {painter.images.length > 1 && (
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
                    </>
                )}

                {painter.verified && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Shield size={12} /> Verified
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h3 className="text-lg font-bold text-gray-900">{painter.name}</h3>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{painter.address}</span>
                </div>

                {painter.distance && (
                    <p className="text-xs font-semibold text-green-600">
                        {painter.distance} km away
                    </p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 text-sm">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{painter.rating}</span>
                    <span className="text-gray-500">({painter.ratingsCount})</span>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {painter.specialties.map((s, i) => (
                        <span
                            key={i}
                            className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs"
                        >
                            {s}
                        </span>
                    ))}
                </div>

                {/* Actions */}
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

/* ================= LIST ================= */

const PainterListingCafeStyle = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_PAINTERS.map((painter) => (
                    <PainterCafeStyleCard key={painter.id} painter={painter} />
                ))}
            </div>
        </div>
    );
};

export default PainterListingCafeStyle;
