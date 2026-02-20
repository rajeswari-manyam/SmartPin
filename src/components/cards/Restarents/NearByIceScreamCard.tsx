import React, { useState, useMemo } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Star,
    MapPin,
    Phone,
    Navigation,
    IceCream,
    Clock,
    CheckCircle
} from "lucide-react";

/* -------------------- TYPES -------------------- */
export interface JobType {
    id: string;
    title?: string;
    location?: string;
    description?: string;
    distance?: number | string;
    category?: string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: {
            open_now?: boolean;
        };
        geometry?: {
            location?: {
                lat?: number;
                lng?: number;
            };
        };
    };
}

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

/* -------------------- CONSTANTS -------------------- */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    icecream_1: "07947431088",
    icecream_2: "07942697548",
    icecream_3: "07947123630",
    icecream_4: "07947421568",
};

const ICECREAM_IMAGES_MAP: Record<string, string[]> = {
    icecream_1: [
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800",
        "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800",
        "https://images.unsplash.com/photo-1576506295286-5cda18df44f1?w=800",
    ],
    icecream_2: [
        "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800",
        "https://images.unsplash.com/photo-1488900128323-21503983a07e?w=800",
        "https://images.unsplash.com/photo-1560008581-09b637e2f0e2?w=800",
    ],
    icecream_3: [
        "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800",
        "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=800",
    ],
    icecream_4: [
        "https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800",
        "https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=800",
    ],
};

const ICECREAM_SERVICES = [
    "Ice Cream",
    "Sundaes",
    "Online Order",
    "WhatsApp",
    "Late Night",
];

/* -------------------- COMPONENT -------------------- */

// Dummy Data
const DUMMY_ICECREAM_SHOPS: JobType[] = [
    {
        id: "icecream_1",
        title: "Frosty Treats",
        location: "123 Cool Street",
        distance: 0.8,
        category: "Ice Cream Parlour",
        description: "Best soft serve in town.",
        jobData: {
            rating: 4.9,
            user_ratings_total: 340,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.7041, lng: 77.1025 } }
        }
    },
    {
        id: "icecream_2",
        title: "Scoops & Cones",
        location: "45 Dessert Lane",
        distance: 1.5,
        category: "Ice Cream Parlour",
        description: "Wide variety of flavors and toppings.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 180,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.6139, lng: 77.2090 } }
        }
    },
    {
        id: "icecream_3",
        title: "Gelato Heaven",
        location: "88 Sweet Spot",
        distance: 2.3,
        category: "Ice Cream Parlour",
        description: "Authentic Italian Gelato.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 210,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 28.5355, lng: 77.3910 } }
        }
    },
    {
        id: "icecream_4",
        title: "Chill Zone",
        location: "12 Frozen Rd",
        distance: 3.1,
        category: "Ice Cream Parlour",
        description: "Perfect place to chill with ice cream.",
        jobData: {
            rating: 4.5,
            user_ratings_total: 150,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.4595, lng: 77.0266 } }
        }
    }
];

const SingleIceCreamCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const images = useMemo(
        () => ICECREAM_IMAGES_MAP[job.id] || ICECREAM_IMAGES_MAP.icecream_1,
        [job.id]
    );

    const rating = job.jobData?.rating;
    const totalRatings = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const phone = PHONE_NUMBERS_MAP[job.id];

    const distance =
        job.distance &&
        `${Number(job.distance).toFixed(1)} km away`;

    /* -------------------- ACTIONS -------------------- */

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = job.jobData?.geometry?.location?.lat;
        const lng = job.jobData?.geometry?.location?.lng;
        if (!lat || !lng) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    /* -------------------- UI -------------------- */

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition cursor-pointer overflow-hidden h-full flex flex-col"
        >
            {/* IMAGE CAROUSEL */}
            <div className="relative h-48 shrink-0">
                <img
                    src={images[index]}
                    className="h-full w-full object-cover"
                    alt={job.title}
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

                {index < images.length - 1 && (
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

                <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                    {index + 1} / {images.length}
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h3 className="text-lg font-bold">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                {distance && (
                    <p className="text-sm font-semibold text-emerald-600">
                        {distance}
                    </p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {job.description}
                </p>

                {/* CATEGORY */}
                <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-xs font-semibold px-3 py-1 rounded-full mt-2 w-fit">
                    <IceCream size={12} />
                    {job.category || "Ice Cream Parlour"}
                </span>

                {/* RATING & STATUS */}
                <div className="flex items-center gap-3 pt-2">
                    {rating && (
                        <div className="flex items-center text-sm font-semibold">
                            <Star size={14} className="text-yellow-400 mr-1" />
                            {rating}
                            {totalRatings && (
                                <span className="text-gray-500 ml-1">
                                    ({totalRatings})
                                </span>
                            )}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <span
                            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${isOpen
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            {isOpen ? "Open" : "Closed"}
                        </span>
                    )}
                </div>

                {/* SERVICES */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {ICECREAM_SERVICES.slice(0, 3).map((s) => (
                        <span
                            key={s}
                            className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded"
                        >
                            <CheckCircle size={12} />
                            {s}
                        </span>
                    ))}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border border-indigo-600 text-indigo-600 font-semibold py-2 rounded-lg hover:bg-indigo-50"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>

                    <button
                        disabled={!phone}
                        onClick={handleCall}
                        className={`flex-1 flex items-center justify-center gap-1 font-semibold py-2 rounded-lg ${phone
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-600 hover:bg-emerald-200"
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

const NearbyIceCreamCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_ICECREAM_SHOPS.map((shop) => (
                    <SingleIceCreamCard
                        key={shop.id}
                        job={shop}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleIceCreamCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyIceCreamCard;
