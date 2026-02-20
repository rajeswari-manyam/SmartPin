/**
 * ============================================================================
 * NearbyTravelCard.tsx - Travel & Tour Agency Card (Web)
 * ReactJS + TypeScript + Tailwind CSS
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    CheckCircle,
    TrendingUp,
    Zap,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title?: string;
    location?: string;
    description?: string;
    distance?: number | string;
    jobData?: any;
}

/* ================= DUMMY DATA ================= */

export const DUMMY_TRAVEL_AGENCIES = [
    {
        place_id: "travel_1",
        name: "Riya Travel & Tours India Pvt Ltd",
        vicinity: "Himayat Nagar, Hyderabad",
        rating: 4.4,
        user_ratings_total: 1076,
        geometry: { location: { lat: 17.405, lng: 78.48 } },
        opening_hours: { open_now: true },
        distance_text: "9.8 km",
        special_tags: ["Verified", "Responsive"],
        amenities: ["Bus Booking", "Travel Packages", "Hotel Booking"],
    },
    {
        place_id: "travel_2",
        name: "Prime Destinations Travel & Tours",
        vicinity: "Charminar, Hyderabad",
        rating: 4.8,
        user_ratings_total: 14,
        geometry: { location: { lat: 17.3616, lng: 78.4747 } },
        opening_hours: { open_now: true },
        distance_text: "14.6 km",
        special_tags: ["Trending"],
        amenities: ["Bus Booking", "Railway Booking", "Hotel Booking"],
    },
];

/* ================= CONSTANTS ================= */

const PHONE_MAP: Record<string, string> = {
    travel_1: "07947106911",
    travel_2: "08867895117",
};

const TRAVEL_IMAGES: Record<string, string[]> = {
    travel_1: [
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800",
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800",
    ],
    travel_2: [
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800",
        "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
    ],
};

/* ================= COMPONENT ================= */

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

const SingleTravelCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [imageIndex, setImageIndex] = useState(0);

    const photos = useMemo(
        () => TRAVEL_IMAGES[job.id] || TRAVEL_IMAGES["travel_1"],
        [job.id]
    );

    const data = job.jobData || {};
    const phone = PHONE_MAP[job.id];

    const handleDirections = () => {
        const { lat, lng } = data.geometry?.location || {};
        if (!lat || !lng) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    const handleCall = () => {
        if (phone) window.location.href = `tel:${phone}`;
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
        >
            {/* ================= IMAGE CAROUSEL ================= */}
            <div className="relative h-44">
                <img
                    src={photos[imageIndex]}
                    className="w-full h-full object-cover"
                    alt={job.title}
                />

                {imageIndex > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setImageIndex((i) => i - 1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                    >
                        <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                )}

                {imageIndex < photos.length - 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setImageIndex((i) => i + 1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                    >
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                )}

                <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                    {imageIndex + 1}/{photos.length}
                </div>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                    {job.title}
                </h3>

                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                </div>

                {data.distance_text && (
                    <p className="text-sm text-emerald-600 font-semibold mt-1">
                        {data.distance_text}
                    </p>
                )}

                {/* ================= TAGS ================= */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {data.special_tags?.map((tag: string) => (
                        <span
                            key={tag}
                            className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded
                ${tag === "Verified"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : tag === "Trending"
                                        ? "bg-red-100 text-red-600"
                                        : "bg-blue-100 text-blue-700"
                                }`}
                        >
                            {tag === "Verified" && <CheckCircle className="w-3 h-3" />}
                            {tag === "Trending" && <TrendingUp className="w-3 h-3" />}
                            {tag === "Responsive" && <Zap className="w-3 h-3" />}
                            {tag}
                        </span>
                    ))}
                </div>

                {/* ================= DESCRIPTION ================= */}
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {job.description}
                </p>

                {/* ================= RATING ================= */}
                <div className="flex items-center gap-3 mt-3">
                    {data.rating && (
                        <div className="flex items-center gap-1 text-sm font-semibold">
                            <Star className="w-4 h-4 text-yellow-400" />
                            {data.rating}
                            <span className="text-gray-500 font-normal">
                                ({data.user_ratings_total})
                            </span>
                        </div>
                    )}

                    {data.opening_hours?.open_now && (
                        <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            Open Now
                        </span>
                    )}
                </div>

                {/* ================= SERVICES ================= */}
                <div className="mt-3">
                    <p className="text-xs font-bold text-gray-500 mb-1">SERVICES</p>
                    <div className="flex flex-wrap gap-2">
                        {data.amenities?.slice(0, 4).map((a: string) => (
                            <span
                                key={a}
                                className="flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded"
                            >
                                <CheckCircle className="w-3 h-3" />
                                {a}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDirections();
                        }}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-emerald-600 text-emerald-600 rounded-lg py-2 font-semibold text-sm hover:bg-emerald-50"
                    >
                        <Navigation className="w-4 h-4" />
                        Directions
                    </button>

                    <button
                        disabled={!phone}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCall();
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 font-semibold text-sm
              ${phone
                                ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-600 hover:bg-emerald-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone className="w-4 h-4" />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const NearbyTravelCard: React.FC<Props> = ({ job, onViewDetails }) => {
    // If no job provided, render grid of dummy data
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_TRAVEL_AGENCIES.map((travel) => (
                    <SingleTravelCard
                        key={travel.place_id}
                        job={{
                            id: travel.place_id,
                            title: travel.name,
                            location: travel.vicinity,
                            description: `Travel agency with ${travel.rating}★ rating`,
                            jobData: travel,
                        }}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job provided, render single card
    return <SingleTravelCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyTravelCard;
