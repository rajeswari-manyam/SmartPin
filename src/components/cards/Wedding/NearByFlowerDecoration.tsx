import React, { useState, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    CheckCircle,
    Flower2,
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

/* ================= CONSTANTS ================= */

const PHONE_MAP: Record<string, string> = {
    flower_1: "08197397780",
    flower_2: "08460261613",
    flower_3: "07411564798",
    flower_4: "09606184151",
};

const IMAGES_MAP: Record<string, string[]> = {
    flower_1: [
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
        "https://images.unsplash.com/photo-1522057384400-681b421cfebc?w=800",
    ],
    flower_2: [
        "https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?w=800",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    ],
    flower_3: [
        "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
        "https://images.unsplash.com/photo-1505944357329-c5d21fd4c835?w=800",
    ],
    flower_4: [
        "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
    ],
};

const FLOWER_SERVICES = [
    "Car Decoration",
    "Wedding Decoration",
    "Stage Decoration",
    "Fresh Flowers",
    "Corporate Events",
    "24/7 Service",
];

/* ================= DUMMY DATA ================= */

const DUMMY_FLOWERS: JobType[] = [
    {
        id: "flower_1",
        title: "Bala Flower Decoration",
        location: "Main Road Nallakunta, Hyderabad",
        distance: 11.8,
        category: "Flower Decoration",
        description:
            "Expert flower decoration services for weddings and events. Specializing in car decoration with fresh, vibrant arrangements.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 14,
            phone: PHONE_MAP.flower_1,
            top_search: true,
            specializations: ["Car Decoration"],
        },
    },
    {
        id: "flower_2",
        title: "Sri Lalitha Ambika Flower Decoration",
        location: "New Indira Nagar Amberpet, Hyderabad",
        distance: 12.2,
        category: "Flower Decoration",
        description:
            "Popular flower decoration specialists for corporate events and traditional ceremonies. Beautiful arrangements for every occasion.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 9,
            phone: PHONE_MAP.flower_2,
            popular: true,
            specializations: ["Corporate", "Event Decoration"],
        },
    },
    {
        id: "flower_3",
        title: "Royal Flower Center",
        location: "G1-88/3 Moula Ali, Hyderabad",
        distance: 11.8,
        category: "Flower Decoration",
        description:
            "24-hour flower center offering corporate and car decoration services. Fresh flowers and custom arrangements available round the clock.",
        jobData: {
            rating: 3.6,
            user_ratings_total: 8,
            phone: PHONE_MAP.flower_3,
            hours_24: true,
            specializations: ["Corporate", "Car Decoration", "24 Hours"],
        },
    },
    {
        id: "flower_4",
        title: "Baba Flower Decorations",
        location: "Narayanguda Barkatpura, Hyderabad",
        distance: 12.0,
        category: "Flower Decoration",
        description:
            "Trending flower decoration service specializing in car and banquet hall arrangements. Quick response with beautiful designs.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 6,
            phone: PHONE_MAP.flower_4,
            trending: true,
            response_time: "35 Mins",
            specializations: ["Car Decoration", "Banquet Hall Decoration"],
        },
    },
];

/* ================= CARD ================= */

const SingleFlowerCard: React.FC<Props> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    if (!job) return null;

    const photos = IMAGES_MAP[job.id] || IMAGES_MAP.flower_1;
    const phone = job.jobData?.phone || PHONE_MAP[job.id];
    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const tags = job.jobData?.specializations || [];
    const is24 = job.jobData?.hours_24;

    const distance =
        typeof job.distance === "number"
            ? `${job.distance.toFixed(1)} km away`
            : job.distance;

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer mb-4"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
                <img
                    src={photos[index]}
                    className="w-full h-full object-cover"
                    alt={job.title}
                />

                {index > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index - 1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}

                {index < photos.length - 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index + 1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{photos.length}
                </div>
            </div>

            {/* Content */}
            <div className="p-3.5">
                <h3 className="text-[17px] font-bold mb-1">{job.title}</h3>

                <div className="flex items-center text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1" />
                    <span className="text-[13px] line-clamp-1">{job.location}</span>
                </div>

                {distance && (
                    <p className="text-xs font-semibold text-pink-600 mb-2">
                        {distance}
                    </p>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {tags.map((t: string, i: number) => (
                            <span
                                key={i}
                                className="bg-pink-100 text-pink-700 text-[10px] font-semibold px-2 py-0.5 rounded"
                            >
                                {t}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-[13px] text-gray-600 mb-2 line-clamp-3">
                    {job.description}
                </p>

                {/* Category */}
                <div className="inline-flex items-center gap-1 bg-pink-100 text-pink-600 text-[11px] px-2 py-1 rounded-xl mb-2">
                    <Flower2 size={12} />
                    Flower Decoration
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-sm font-semibold">{rating}</span>
                            {reviews && (
                                <span className="text-xs text-gray-500">
                                    ({reviews})
                                </span>
                            )}
                        </div>
                    )}

                    {is24 && (
                        <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
                            <Clock size={11} />
                            24 Hours
                        </span>
                    )}
                </div>

                {/* Services */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 mb-1">
                        SERVICES:
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {FLOWER_SERVICES.slice(0, 4).map((s, i) => (
                            <span
                                key={i}
                                className="flex items-center gap-1 bg-pink-100 text-pink-600 text-[11px] px-2 py-1 rounded"
                            >
                                <CheckCircle size={11} />
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open("https://maps.google.com", "_blank");
                        }}
                        className="flex-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 text-xs py-2 rounded-lg font-bold"
                    >
                        <Navigation size={14} className="inline mr-1" />
                        Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.open(`tel:${phone}`, "_self");
                        }}
                        className="flex-1 border-2 border-pink-600 bg-pink-50 text-pink-600 text-xs py-2 rounded-lg font-bold"
                    >
                        <Phone size={14} className="inline mr-1" />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN ================= */

const NearbyFlowerDecoration: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_FLOWERS.map((f: JobType) => (
                    <SingleFlowerCard
                        key={f.id}
                        job={f}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleFlowerCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyFlowerDecoration;
