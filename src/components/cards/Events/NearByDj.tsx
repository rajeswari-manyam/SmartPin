import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    ChevronLeft,
    ChevronRight,
    Music,
} from "lucide-react";

/* ================= TYPES ================= */

interface DJ {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
    };
}

interface NearbyDJServiceCardProps {
    job?: DJ;
    onViewDetails: (job: DJ) => void;
}

/* ================= STATIC DATA ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    dj_1: "08123871335",
    dj_2: "07383455657",
    dj_3: "08197427013",
    dj_4: "08904585624",
};

const DJ_IMAGES_MAP: Record<string, string[]> = {
    dj_1: [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800",
    ],
    dj_2: [
        "https://images.unsplash.com/photo-1504898770365-14faca6a7320?w=800",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
    ],
    dj_3: [
        "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
        "https://images.unsplash.com/photo-1619983081563-430f63602796?w=800",
    ],
    dj_4: [
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800",
    ],
};

const DJ_DESCRIPTIONS_MAP: Record<string, string> = {
    dj_1: "Professional wedding & reception DJ with premium sound system.",
    dj_2: "Club-style DJ specializing in parties and private events.",
    dj_3: "Corporate & stage event DJ with lighting and LED walls.",
    dj_4: "Affordable DJ services for birthdays & celebrations.",
};

const DJ_SERVICES = [
    "Wedding DJ",
    "Sound System",
    "Lighting",
    "LED Walls",
];

/* ================= DUMMY LIST DATA ================= */

const DUMMY_DJS: DJ[] = [
    {
        id: "dj_1",
        title: "DJ Rockstar",
        location: "MG Road, Bangalore",
        distance: 1.2,
        category: "DJ",
        description: DJ_DESCRIPTIONS_MAP.dj_1,
        jobData: {
            rating: 4.9,
            user_ratings_total: 210,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 12.9716, lng: 77.5946 } },
        },
    },
    {
        id: "dj_2",
        title: "Bass Booster DJ",
        location: "Indiranagar, Bangalore",
        distance: 2.4,
        category: "DJ",
        description: DJ_DESCRIPTIONS_MAP.dj_2,
        jobData: {
            rating: 4.6,
            user_ratings_total: 156,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 12.9784, lng: 77.6408 } },
        },
    },
    {
        id: "dj_3",
        title: "Elite Event DJ",
        location: "Whitefield, Bangalore",
        distance: 4.1,
        category: "DJ",
        description: DJ_DESCRIPTIONS_MAP.dj_3,
        jobData: {
            rating: 4.8,
            user_ratings_total: 98,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 12.9698, lng: 77.7500 } },
        },
    },
    {
        id: "dj_4",
        title: "Party Beats DJ",
        location: "BTM Layout, Bangalore",
        distance: 3.3,
        category: "DJ",
        description: DJ_DESCRIPTIONS_MAP.dj_4,
        jobData: {
            rating: 4.5,
            user_ratings_total: 134,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 12.9166, lng: 77.6101 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleDJCard: React.FC<{
    job: DJ;
    onViewDetails: (job: DJ) => void;
}> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = DJ_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const rating = job.jobData?.rating;
    const totalRatings = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;

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
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = job.jobData?.geometry?.location.lat;
        const lng = job.jobData?.geometry?.location.lng;
        if (lat && lng) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                "_blank"
            );
        }
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer h-full flex flex-col overflow-hidden"
        >
            {/* Image Carousel */}
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
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-4xl text-gray-400">
                        🎧
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                    {job.title}
                </h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{job.location}</span>
                </div>

                {job.distance && (
                    <p className="text-xs font-semibold text-purple-600">
                        {job.distance} km away
                    </p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {job.description}
                </p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 pt-2">
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
                        {DJ_SERVICES.map((s, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 px-2 py-1 rounded text-xs"
                            >
                                <Music size={12} /> {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg font-semibold"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>

                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg font-semibold"
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= WRAPPER (LIKE CAFE) ================= */

const NearbyDJServiceCard: React.FC<NearbyDJServiceCardProps> = ({
    job,
    onViewDetails,
}) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_DJS.map((dj) => (
                    <SingleDJCard
                        key={dj.id}
                        job={dj}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleDJCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyDJServiceCard;
