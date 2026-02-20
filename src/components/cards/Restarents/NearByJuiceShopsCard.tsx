/**
 * ============================================================================
 * NearbyJuiceCard.tsx - Juice & Smoothie Shop Card (WEB)
 * ============================================================================
 * React JS + TypeScript + Tailwind CSS
 * 1:1 conversion from React Native version
 */

import React, { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    Droplet,
    CheckCircle
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title?: string;
    location?: string;
    description?: string;
    distance?: number | string;
    category?: string;
    jobData?: any;
}

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

/* ================= CONSTANT DATA ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    juice_1: "07947418075",
    juice_2: "07947139260",
    juice_3: "07947105718",
    juice_4: "07947109429",
};

const JUICE_IMAGES_MAP: Record<string, string[]> = {
    juice_1: [
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800",
        "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800",
        "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800",
    ],
    juice_2: [
        "https://images.unsplash.com/photo-1546173159-315724a31696?w=800",
        "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800",
        "https://images.unsplash.com/photo-1638176066666-ffb2f013c7dd?w=800",
    ],
    juice_3: [
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800",
        "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800",
        "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800",
    ],
    juice_4: [
        "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800",
        "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=800",
        "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800",
    ],
};

const JUICE_DESCRIPTIONS_MAP: Record<string, string> = {
    juice_1:
        "Popular juice point offering fresh fruit juices and health drinks. Open until 10:30 PM. (₹150 for two)",
    juice_2:
        "Top-rated juice bar with smoothies, milkshakes, and healthy options. Open until 11:00 PM. (₹250 for two)",
    juice_3:
        "Juice and fast food center with budget-friendly options. Open until 10:00 PM. (₹450 for two)",
    juice_4:
        "Highly rated sugarcane & fresh juice bar. Open until 12:00 PM. (₹150 for two)",
};

const JUICE_SERVICES = [
    "Fresh Juices",
    "Smoothies",
    "Takeaway",
    "Online Order",
    "WhatsApp",
];

/* ================= COMPONENT ================= */

// Dummy Data
const DUMMY_JUICE_SHOPS: JobType[] = [
    {
        id: "juice_1",
        title: "Fresh Squeeze",
        location: "123 Fruit St",
        distance: 0.5,
        category: "Juice & Smoothie",
        description: "Freshly squeezed juices and smoothies.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 210,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.7041, lng: 77.1025 } }
        }
    },
    {
        id: "juice_2",
        title: "Berry Blast",
        location: "45 Berry Lane",
        distance: 1.2,
        category: "Juice & Smoothie",
        description: "Specializing in berry smoothies.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 180,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.6139, lng: 77.2090 } }
        }
    },
    {
        id: "juice_3",
        title: "Citrus Corner",
        location: "88 Lemon Ave",
        distance: 2.0,
        category: "Juice & Smoothie",
        description: "Zesty citrus drinks for hot days.",
        jobData: {
            rating: 4.7,
            user_ratings_total: 150,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 28.5355, lng: 77.3910 } }
        }
    },
    {
        id: "juice_4",
        title: "Green Energy",
        location: "12 Health Rd",
        distance: 3.5,
        category: "Juice & Smoothie",
        description: "Detox and energy boosting juices.",
        jobData: {
            rating: 4.9,
            user_ratings_total: 120,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.4595, lng: 77.0266 } }
        }
    }
];

const SingleJuiceCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);
    const photos = useMemo(
        () => JUICE_IMAGES_MAP[job.id] || JUICE_IMAGES_MAP.juice_1,
        [job.id]
    );

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const lat = job.jobData?.geometry?.location?.lat;
    const lng = job.jobData?.geometry?.location?.lng;
    const phone = PHONE_NUMBERS_MAP[job.id];

    const distance =
        typeof job.distance === "number"
            ? `${job.distance.toFixed(1)} km away`
            : job.distance;

    const description =
        JUICE_DESCRIPTIONS_MAP[job.id] || job.description || "";

    const getClosingTime = () => {
        if (job.id === "juice_1") return "22:30";
        if (job.id === "juice_2") return "23:00";
        if (job.id === "juice_3") return "22:00";
        if (job.id === "juice_4") return "12:00";
        return "22:00";
    };

    const openMaps = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!lat || !lng) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    const callNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!phone) return;
        window.location.href = `tel:${phone}`;
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer h-full flex flex-col"
        >
            {/* IMAGE CAROUSEL */}
            <div className="relative h-48 shrink-0">
                <img
                    src={photos[index]}
                    alt={job.title}
                    className="w-full h-full object-cover"
                />

                {index > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index - 1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}

                {index < photos.length - 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index + 1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}

                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{photos.length}
                </span>
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h3 className="text-lg font-bold">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                {distance && (
                    <p className="text-sm font-semibold text-green-600">{distance}</p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{description}</p>

                {/* CATEGORY */}
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded mt-2 w-fit">
                    <Droplet size={12} />
                    {job.category || "Juice & Smoothie"}
                </span>

                {/* RATING + STATUS */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            {reviews && (
                                <span className="text-gray-500">({reviews})</span>
                            )}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
              ${isOpen
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            {isOpen ? `Open · Until ${getClosingTime()}` : "Closed"}
                        </span>
                    )}
                </div>

                {/* SERVICES */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 mb-1">SERVICES:</p>
                    <div className="flex flex-wrap gap-2">
                        {JUICE_SERVICES.slice(0, 3).map((service) => (
                            <span
                                key={service}
                                className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded"
                            >
                                <CheckCircle size={12} />
                                {service}
                            </span>
                        ))}
                        {JUICE_SERVICES.length > 3 && (
                            <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded">
                                +{JUICE_SERVICES.length - 3} more
                            </span>
                        )}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={openMaps}
                        className="flex-1 border-2 border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50 flex justify-center gap-2"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>

                    <button
                        onClick={callNow}
                        disabled={!phone}
                        className={`flex-1 py-2 rounded-lg font-semibold flex justify-center gap-2
              ${phone
                                ? "bg-green-100 text-green-700 border-2 border-green-600 hover:bg-green-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const NearbyJuiceCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_JUICE_SHOPS.map((shop) => (
                    <SingleJuiceCard
                        key={shop.id}
                        job={shop}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleJuiceCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyJuiceCard;
