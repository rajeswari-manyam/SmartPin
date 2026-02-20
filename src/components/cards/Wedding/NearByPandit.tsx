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
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title?: string;
    location?: string;
    description?: string;
    distance?: number;
    category?: string;
    jobData?: any;
}

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

/* ================= CONSTANTS ================= */

const PHONE_MAP: Record<string, string> = {
    pandit_1: "08197624439",
    pandit_2: "08401617075",
    pandit_3: "08904265614",
    pandit_4: "08792490050",
};

const PANDIT_IMAGES_MAP: Record<string, string[]> = {
    pandit_1: [
        "https://images.unsplash.com/photo-1583391733956-3483401671a3?w=800",
        "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800",
        "https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=800",
    ],
    pandit_2: [
        "https://images.unsplash.com/photo-1603994319034-9e0d14ba3656?w=800",
        "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800",
    ],
    pandit_3: [
        "https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=800",
        "https://images.unsplash.com/photo-1583391733956-3483401671a3?w=800",
    ],
    pandit_4: [
        "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800",
        "https://images.unsplash.com/photo-1583391733956-3483401671a3?w=800",
    ],
};

const PANDIT_SERVICES = [
    "Wedding Ceremonies",
    "Havan Rituals",
    "Kundali Matching",
    "All Pooja Services",
    "Griha Pravesh",
    "Satyanarayana Pooja",
];

/* ================= DUMMY DATA ================= */

const DUMMY_PANDITS: JobType[] = [
    {
        id: "pandit_1",
        title: "K Venkat Sharma Pantulgaru",
        location: "Sanjay Gandhi Nagar, Hyderabad",
        distance: 3.1,
        description:
            "Experienced pandit providing all traditional pooja services with devotion and authenticity.",
        category: "Pandit Service",
        jobData: {
            rating: 4.5,
            user_ratings_total: 28,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4196, lng: 78.4123 } },
        },
    },
    {
        id: "pandit_2",
        title: "Vedic Rushi Purohit",
        location: "Gajularamaram, Hyderabad",
        distance: 3.5,
        description:
            "Vedic rituals performed as per scriptures. Available for all ceremonies.",
        category: "Pandit Service",
        jobData: {
            rating: 5.0,
            user_ratings_total: 5,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4476, lng: 78.391 } },
        },
    },
    {
        id: "pandit_3",
        title: "Sri Vinayaka All Puja Pandit Services",
        location: "Jeedimetla, Hyderabad",
        distance: 3.7,
        description:
            "Complete pooja solutions for home, office, and temple rituals.",
        category: "Pandit Service",
        jobData: {
            rating: 5.0,
            user_ratings_total: 2,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4647, lng: 78.3636 } },
        },
    },
    {
        id: "pandit_4",
        title: "Sri Gayathri Pooja Pandit",
        location: "Kukatpally, Hyderabad",
        distance: 9.4,
        description:
            "Affordable pandit services with experienced purohits.",
        category: "Pandit Service",
        jobData: {
            rating: 4.8,
            user_ratings_total: 202,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4485, lng: 78.3808 } },
        },
    },
];

/* ================= CARD ================= */

const SinglePanditCard: React.FC<Props> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const handleDirections = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const loc = job?.jobData?.geometry?.location;
            if (!loc) return;
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
                "_blank"
            );
        },
        [job]
    );

    const handleCall = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const phone = job ? PHONE_MAP[job.id] : undefined;
            if (phone) window.location.href = `tel:${phone}`;
        },
        [job]
    );

    if (!job) return null;

    const photos =
        PANDIT_IMAGES_MAP[job.id] || PANDIT_IMAGES_MAP.pandit_1;

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const phone = PHONE_MAP[job.id];

    const distance =
        job.distance !== undefined
            ? `${job.distance.toFixed(1)} km away`
            : "";

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
        >
            {/* IMAGE */}
            <div className="relative h-48 bg-gray-100">
                <img
                    src={photos[index]}
                    className="w-full h-full object-cover"
                    alt={job.title}
                />

                {photos.length > 1 && (
                    <>
                        {index > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIndex(index - 1);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
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
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                            >
                                <ChevronRight size={18} />
                            </button>
                        )}

                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index + 1} / {photos.length}
                        </div>
                    </>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-3.5">
                <h3 className="text-[17px] font-bold text-gray-900 mb-1 line-clamp-2">
                    {job.title}
                </h3>

                <div className="flex items-center text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1" />
                    <span className="text-[13px] line-clamp-1">
                        {job.location}
                    </span>
                </div>

                {distance && (
                    <p className="text-xs font-semibold text-orange-600 mb-2">
                        {distance}
                    </p>
                )}

                <p className="text-[13px] text-gray-600 mb-2 line-clamp-3">
                    {job.description}
                </p>

                <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-[11px] font-semibold px-2 py-1 rounded mb-2">
                    🕉️ Pandit Service
                </div>

                <div className="flex items-center gap-2 mb-2.5">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[13px] font-semibold">
                                {rating}
                            </span>
                            {reviews && (
                                <span className="text-xs text-gray-500">
                                    ({reviews})
                                </span>
                            )}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <div
                            className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${isOpen
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={11} />
                            {isOpen ? "Available" : "Closed"}
                        </div>
                    )}
                </div>

                {/* SERVICES */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 mb-1">
                        SERVICES:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {PANDIT_SERVICES.slice(0, 4).map((s) => (
                            <span
                                key={s}
                                className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-[11px] px-2 py-1 rounded"
                            >
                                <CheckCircle size={11} />
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-orange-600 bg-orange-50 text-orange-700 font-bold text-xs py-2.5 rounded-lg"
                    >
                        <Navigation size={14} />
                        Directions
                    </button>

                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 bg-green-50 text-green-700 font-bold text-xs py-2.5 rounded-lg"
                    >
                        <Phone size={14} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN ================= */

const NearbyPanditService: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_PANDITS.map((p) => (
                    <SinglePanditCard
                        key={p.id}
                        job={p}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SinglePanditCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyPanditService;
