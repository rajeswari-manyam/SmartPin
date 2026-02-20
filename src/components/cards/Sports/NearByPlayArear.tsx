import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    PartyPopper,
} from "lucide-react";

/* ================= TYPES ================= */

interface PlayArea {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        open_now?: boolean;
        geometry?: { location: { lat: number; lng: number } };
        special_tags?: string[];
    };
}

interface Props {
    job?: PlayArea;
    onViewDetails: (job: PlayArea) => void;
}

/* ================= PHONE NUMBERS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    playarea_1: "07942698318",
    playarea_2: "08106885233",
};

/* ================= IMAGES ================= */

const PLAYAREA_IMAGES_MAP: Record<string, string[]> = {
    playarea_1: [
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
        "https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800",
    ],
    playarea_2: [
        "https://images.unsplash.com/photo-1603354350317-6f7aaa5911c5?w=800",
        "https://images.unsplash.com/photo-1511882150382-421056c89033?w=800",
    ],
};

/* ================= DESCRIPTIONS ================= */

const PLAYAREA_DESCRIPTIONS: Record<string, string> = {
    playarea_1:
        "Trending kids play area with party zone, soft play equipment, and safe indoor activities. Ideal for birthdays.",
    playarea_2:
        "Popular gaming and soft play zone with arcade games and birthday party packages.",
};

const PLAYAREA_SERVICES = [
    "Kids Friendly",
    "Birthday Parties",
    "Indoor Games",
    "Safe Play Zone",
];

/* ================= DUMMY DATA ================= */

export const DUMMY_PLAY_AREAS: PlayArea[] = [
    {
        id: "playarea_1",
        title: "Come2Play - Kids Play Area & Party Zone",
        location: "Attapur, Hyderabad",
        distance: 1.6,
        category: "Kids Play Area",
        description: PLAYAREA_DESCRIPTIONS.playarea_1,
        jobData: {
            rating: 4.7,
            user_ratings_total: 142,
            open_now: true,
            geometry: { location: { lat: 17.385, lng: 78.44 } },
            special_tags: ["Trending", "Party Zone"],
        },
    },
    {
        id: "playarea_2",
        title: "BVK's Gaming Zone - Kids Soft Play",
        location: "LB Nagar, Hyderabad",
        distance: 3.9,
        category: "Kids Play Area",
        description: PLAYAREA_DESCRIPTIONS.playarea_2,
        jobData: {
            rating: 4.5,
            user_ratings_total: 98,
            open_now: true,
            geometry: { location: { lat: 17.352, lng: 78.552 } },
            special_tags: ["Gaming Zone"],
        },
    },
];

/* ================= SINGLE CARD ================= */

const SinglePlayAreaCard: React.FC<Props> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = PLAYAREA_IMAGES_MAP[job!.id] || [];
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
        const phone = PHONE_NUMBERS_MAP[job!.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = job!.jobData?.geometry?.location;
        if (loc) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
                "_blank"
            );
        }
    };

    return (
        <div
            onClick={() => onViewDetails(job!)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
        >
            {/* IMAGE CAROUSEL */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img
                            src={currentPhoto}
                            alt={job!.title}
                            className="w-full h-full object-cover"
                        />
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
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                        🎪
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-2 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                    {job!.title}
                </h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{job!.location}</span>
                </div>

                <p className="text-xs font-semibold text-pink-600">
                    {job!.distance} km away
                </p>

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {job!.description}
                </p>

                {/* RATING + STATUS */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {job!.jobData?.rating && (
                        <div className="flex items-center gap-1">
                            <Star className="fill-yellow-400 text-yellow-400" size={14} />
                            <span className="font-semibold">
                                {job!.jobData.rating.toFixed(1)}
                            </span>
                            <span className="text-gray-500">
                                ({job!.jobData.user_ratings_total})
                            </span>
                        </div>
                    )}
                    {job!.jobData?.open_now !== undefined && (
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded ${job!.jobData.open_now
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            <span className="text-xs font-semibold">
                                {job!.jobData.open_now ? "Open" : "Closed"}
                            </span>
                        </div>
                    )}
                </div>

                {/* SERVICES */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Highlights:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {PLAYAREA_SERVICES.slice(0, 3).map((s, i) => (
                            <span
                                key={i}
                                className="bg-pink-50 text-pink-600 px-2 py-1 rounded text-xs font-semibold"
                            >
                                ✓ {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ACTIONS */}
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
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-50 text-pink-700 border-2 border-pink-600 rounded-lg font-semibold"
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

const NearbyPlayAreaCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_PLAY_AREAS.map((p) => (
                    <SinglePlayAreaCard
                        key={p.id}
                        job={p}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SinglePlayAreaCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyPlayAreaCard;
