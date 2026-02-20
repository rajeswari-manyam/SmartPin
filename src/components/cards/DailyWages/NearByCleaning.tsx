import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    ChevronLeft,
    ChevronRight,
    Sparkles,
} from "lucide-react";

/* ================= TYPES ================= */

interface CleaningService {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
    };
}

/* ================= CONSTANTS ================= */

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
    cleaning_1: "07383844491",
    cleaning_2: "09972841897",
    cleaning_3: "08401185541",
    cleaning_4: "07383865278",
    cleaning_5: "07411839381",
};

// Images
const CLEANING_IMAGES_MAP: Record<string, string[]> = {
    cleaning_1: [
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
        "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800",
    ],
    cleaning_2: [
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
        "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800",
    ],
    cleaning_3: [
        "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800",
        "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800",
    ],
    cleaning_4: [
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
        "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    ],
    cleaning_5: [
        "https://images.unsplash.com/photo-1542128962-33b85bedbca7?w=800",
        "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
    ],
};

// Services
const CLEANING_SERVICES_MAP: Record<string, string[]> = {
    cleaning_1: ["Housekeeping", "Water Tank Cleaning", "Residential"],
    cleaning_2: ["Residential Cleaning", "Commercial Cleaning", "Verified"],
    cleaning_3: ["Eco Friendly", "Carpet Cleaning", "Deep Cleaning"],
    cleaning_4: ["Septic Tank Cleaning", "Colleges", "Resorts"],
    cleaning_5: ["Security Services", "Bodyguards", "GST Registered"],
};

// Dummy list
const DUMMY_CLEANING_SERVICES: CleaningService[] = [
    {
        id: "cleaning_1",
        title: "Hi Tech Clean Solution",
        location: "Sadashiv Nagar, Belgaum",
        distance: 2.5,
        description:
            "Professional housekeeping and water tank cleaning with quick response.",
        jobData: {
            rating: 3.8,
            user_ratings_total: 24,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 15.8497, lng: 74.4977 } },
        },
    },
    {
        id: "cleaning_2",
        title: "Grace Facility Solutions",
        location: "Bhavani Nagar, Belgaum",
        distance: 3.8,
        description:
            "Verified residential and water tank cleaning services.",
        jobData: {
            rating: 4.7,
            user_ratings_total: 25,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 15.8597, lng: 74.5077 } },
        },
    },
    {
        id: "cleaning_3",
        title: "Clean Master Facility Services",
        location: "Bauxite Road, Belgaum",
        distance: 1.2,
        description:
            "Eco-friendly housekeeping and carpet cleaning with top ratings.",
        jobData: {
            rating: 5.0,
            user_ratings_total: 413,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 15.8397, lng: 74.4877 } },
        },
    },
];

/* ================= CARD ================= */

const CleaningCard: React.FC<{ service: CleaningService }> = ({ service }) => {
    const [imageIndex, setImageIndex] = useState(0);

    const images = CLEANING_IMAGES_MAP[service.id] || [];
    const currentImage = images[imageIndex];

    const rating = service.jobData?.rating;
    const reviews = service.jobData?.user_ratings_total;
    const isOpen = service.jobData?.opening_hours?.open_now;

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = service.jobData?.geometry?.location;
        if (loc) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
                "_blank"
            );
        }
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[service.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col">
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                {currentImage ? (
                    <>
                        <img
                            src={currentImage}
                            alt={service.title}
                            className="w-full h-full object-cover"
                        />
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={() =>
                                        setImageIndex((i) =>
                                            i === 0 ? images.length - 1 : i - 1
                                        )
                                    }
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() =>
                                        setImageIndex((i) =>
                                            i === images.length - 1 ? 0 : i + 1
                                        )
                                    }
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-4xl">
                        🧹
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow gap-2">
                <h2 className="text-lg font-bold text-gray-800">
                    {service.title}
                </h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span className="line-clamp-1">{service.location}</span>
                </div>

                {service.distance && (
                    <p className="text-xs font-semibold text-green-600">
                        {service.distance} km away
                    </p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3">
                    {service.description}
                </p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-1">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="fill-yellow-400 text-yellow-400" size={14} />
                            <span className="font-semibold">
                                {rating.toFixed(1)}
                            </span>
                            <span className="text-gray-500">
                                ({reviews})
                            </span>
                        </div>
                    )}
                    {isOpen !== undefined && (
                        <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                                isOpen
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                            }`}
                        >
                            <Clock size={12} />
                            {isOpen ? "Available" : "Closed"}
                        </span>
                    )}
                </div>

                {/* Services */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Services
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {(CLEANING_SERVICES_MAP[service.id] || [])
                            .slice(0, 3)
                            .map((s, i) => (
                                <span
                                    key={i}
                                    className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-xs"
                                >
                                    <Sparkles size={12} /> {s}
                                </span>
                            ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-emerald-600 text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 font-semibold"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-green-600 text-green-700 bg-green-50 rounded-lg hover:bg-green-100 font-semibold"
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= SCREEN ================= */

const NearbyCleaningScreen: React.FC = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">
                Nearby Cleaning Services
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_CLEANING_SERVICES.map((service) => (
                    <CleaningCard key={service.id} service={service} />
                ))}
            </div>
        </div>
    );
};

export default NearbyCleaningScreen;
