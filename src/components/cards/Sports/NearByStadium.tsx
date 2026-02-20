import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    ChevronLeft,
    ChevronRight,
    Trophy,
} from "lucide-react";

/* ================= TYPES ================= */

interface Stadium {
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
        special_tags?: string[];
    };
}

interface NearbyStadiumCardProps {
    job?: Stadium;
    onViewDetails: (job: Stadium) => void;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    stadium_1: "07702400939",
    stadium_2: "04023212818",
    stadium_3: "09550038883",
};

const STADIUM_IMAGES_MAP: Record<string, string[]> = {
    stadium_1: [
        "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800",
        "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800",
    ],
    stadium_2: [
        "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800",
        "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=800",
    ],
    stadium_3: [
        "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
        "https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800",
    ],
};

const STADIUM_DESCRIPTIONS_MAP: Record<string, string> = {
    stadium_1:
        "Popular indoor stadium with modern facilities, professional courts, and event hosting.",
    stadium_2:
        "Well-known sports ground suitable for large events and athletic meets.",
    stadium_3:
        "Top-rated international stadium hosting major sports events and training.",
};

const STADIUM_SERVICES = [
    "Indoor Stadium",
    "Training Facilities",
    "Event Hosting",
    "Athletic Track",
];

/* ================= DUMMY DATA ================= */

export const DUMMY_STADIUMS: Stadium[] = [
    {
        id: "stadium_1",
        title: "PJR Indoor Stadium",
        location: "Hyderabad",
        distance: 14.4,
        category: "Stadium",
        jobData: {
            rating: 4.2,
            user_ratings_total: 8823,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.435, lng: 78.445 } },
            special_tags: ["Trending", "Indoor"],
        },
    },
    {
        id: "stadium_2",
        title: "Lal Bahadur Stadium",
        location: "Hyderabad",
        distance: 9.9,
        category: "Stadium",
        jobData: {
            rating: 4.2,
            user_ratings_total: 7449,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4123, lng: 78.4678 } },
            special_tags: ["Sports Ground"],
        },
    },
    {
        id: "stadium_3",
        title: "Gachibowli Stadium",
        location: "Hyderabad",
        distance: 12.7,
        category: "Stadium",
        jobData: {
            rating: 4.4,
            user_ratings_total: 6934,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 17.4273, lng: 78.3617 } },
            special_tags: ["Top Rated"],
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleStadiumCard: React.FC<{
    job: Stadium;
    onViewDetails: (job: Stadium) => void;
}> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = STADIUM_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];
    const isOpen = job.jobData?.opening_hours?.open_now;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = job.jobData?.geometry?.location;
        if (loc) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
                "_blank"
            );
        }
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img
                            src={currentPhoto}
                            alt={job.title}
                            className="w-full h-full object-cover"
                        />
                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((i) =>
                                            i === 0 ? photos.length - 1 : i - 1
                                        );
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setCurrentImageIndex((i) => (i + 1) % photos.length);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-4xl">
                        🏟️
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold line-clamp-2">{job.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{job.location}</span>
                </div>

                {job.distance && (
                    <p className="text-xs font-semibold text-green-600">
                        {job.distance} km away
                    </p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {STADIUM_DESCRIPTIONS_MAP[job.id]}
                </p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                            {job.jobData?.rating?.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                            ({job.jobData?.user_ratings_total})
                        </span>
                    </div>

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

                {/* Facilities */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Facilities:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {STADIUM_SERVICES.map((s, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs"
                            >
                                <Trophy size={12} /> {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg font-semibold"
                    >
                        <Navigation size={16} /> Directions
                    </button>

                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg font-semibold"
                    >
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= WRAPPER ================= */

const NearbyStadiumCard: React.FC<NearbyStadiumCardProps> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_STADIUMS.map((stadium) => (
                    <SingleStadiumCard
                        key={stadium.id}
                        job={stadium}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SingleStadiumCard
            job={props.job}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default NearbyStadiumCard;
