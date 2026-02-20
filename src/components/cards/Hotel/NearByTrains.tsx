import React, { useState, useCallback } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    Train,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Tag,
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title: string;
    location: string;
    description?: string;
    distance?: number;
    jobData?: any;
}

/* ================= PHONE MAP ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    train_1: "09988021187",
    train_2: "09980726876",
    train_3: "06366424413",
    train_4: "09876543210",
};

/* ================= DUMMY TRAIN DATA ================= */

export const DUMMY_TRAIN_SERVICES: JobType[] = [
    {
        id: "train_1",
        title: "JST Railway Ticket Agents",
        location: "Plot No 67, Uppal, Hyderabad",
        jobData: {
            rating: 4.4,
            user_ratings_total: 188,
            distance_text: "12.5 km",
            opening_hours: { open_now: true },
            special_tags: ["Verified", "Trending"],
            amenities: ["Bus Booking", "Railway Booking", "Quick Service"],
            geometry: { location: { lat: 17.405, lng: 78.56 } },
        },
    },
    {
        id: "train_2",
        title: "Shivansh Ticket Hub",
        location: "Road No 6, Nagole, Hyderabad",
        jobData: {
            rating: 4.4,
            user_ratings_total: 55,
            distance_text: "14.8 km",
            opening_hours: { open_now: true },
            special_tags: ["Verified", "Trending"],
            amenities: ["Railway Booking", "Online Booking", "Fast Service"],
            geometry: { location: { lat: 17.38, lng: 78.55 } },
        },
    },
    {
        id: "train_3",
        title: "Om Sri Online Yatra",
        location: "Moosapet, Hyderabad",
        jobData: {
            rating: 4.0,
            user_ratings_total: 81,
            distance_text: "7.3 km",
            opening_hours: { open_now: true },
            special_tags: ["Top Search"],
            amenities: ["Sight Seeing", "Railway Booking", "Tour Packages"],
            geometry: { location: { lat: 17.47, lng: 78.42 } },
        },
    },
    {
        id: "train_4",
        title: "Express Rail Services",
        location: "Gachibowli, Hyderabad",
        jobData: {
            rating: 4.2,
            user_ratings_total: 92,
            distance_text: "9.8 km",
            opening_hours: { open_now: true },
            special_tags: ["Deals"],
            amenities: ["Tatkal Booking", "E-Ticket Service"],
            geometry: { location: { lat: 17.44, lng: 78.35 } },
        },
    },
];

/* ================= IMAGE MAP ================= */

const TRAIN_IMAGES: Record<string, string[]> = {
    train_1: [
        "https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=800",
        "https://images.unsplash.com/photo-1532105956626-9569c03602f6?w=800",
    ],
    train_2: [
        "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=800",
        "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    ],
    train_3: [
        "https://images.unsplash.com/photo-1508614999368-9260051292e5?w=800",
    ],
    train_4: [
        "https://images.unsplash.com/photo-1571155321259-39758d3e4d05?w=800",
    ],
};

/* ================= COMPONENT ================= */

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

const SingleTrainCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const photos = TRAIN_IMAGES[job.id] || [];
    const [index, setIndex] = useState(0);

    const next = () => setIndex((p) => Math.min(p + 1, photos.length - 1));
    const prev = () => setIndex((p) => Math.max(p - 1, 0));

    const phone = PHONE_NUMBERS_MAP[job.id];
    const data = job.jobData || {};

    const openMaps = () => {
        const { lat, lng } = data?.geometry?.location || {};
        if (!lat || !lng) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    const callNow = () => {
        if (!phone) return;
        window.location.href = `tel:${phone}`;
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer"
        >
            {/* IMAGE */}
            <div className="relative h-44 bg-gray-100">
                {photos.length > 0 ? (
                    <>
                        <img
                            src={photos[index]}
                            alt={job.title}
                            className="w-full h-full object-cover"
                        />

                        {index > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    prev();
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                            >
                                <ChevronLeft className="text-white w-4 h-4" />
                            </button>
                        )}

                        {index < photos.length - 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    next();
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                            >
                                <ChevronRight className="text-white w-4 h-4" />
                            </button>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <Train className="w-10 h-10 text-gray-400" />
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-4">
                <h3 className="font-bold text-lg">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                </div>

                <div className="text-sm text-purple-600 font-semibold mt-1">
                    {data?.distance_text}
                </div>

                {/* TAGS */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {data?.special_tags?.map((tag: string) => (
                        <span
                            key={tag}
                            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-purple-100 text-purple-700"
                        >
                            <Tag className="w-3 h-3" />
                            {tag}
                        </span>
                    ))}
                </div>

                {/* RATING */}
                <div className="flex items-center gap-2 mt-3">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-semibold">{data?.rating}</span>
                    <span className="text-gray-500 text-sm">
                        ({data?.user_ratings_total})
                    </span>

                    {data?.opening_hours?.open_now && (
                        <span className="ml-auto flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            <Clock className="w-3 h-3 mr-1" /> Open Now
                        </span>
                    )}
                </div>

                {/* AMENITIES */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {data?.amenities?.slice(0, 4).map((a: string) => (
                        <span
                            key={a}
                            className="flex items-center gap-1 text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded"
                        >
                            <CheckCircle className="w-3 h-3" />
                            {a}
                        </span>
                    ))}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openMaps();
                        }}
                        className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold border border-purple-500 text-purple-600 rounded-lg py-2 hover:bg-purple-50"
                    >
                        <Navigation className="w-4 h-4" /> Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            callNow();
                        }}
                        disabled={!phone}
                        className={`flex-1 flex items-center justify-center gap-1 text-sm font-semibold rounded-lg py-2 ${phone
                                ? "bg-green-100 text-green-700 border border-green-500 hover:bg-green-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone className="w-4 h-4" /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const NearbyTrainServiceCard: React.FC<Props> = ({ job, onViewDetails }) => {
    // If no job provided, render grid of dummy data
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_TRAIN_SERVICES.map((train) => (
                    <SingleTrainCard
                        key={train.id}
                        job={train}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job provided, render single card
    return <SingleTrainCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyTrainServiceCard;
