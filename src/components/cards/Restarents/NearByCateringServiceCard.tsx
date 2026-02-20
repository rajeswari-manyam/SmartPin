// src/pages/NearByCateringService.tsx
import React, { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    ChevronLeft,
    ChevronRight,
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
    distance?: number | string;
    category?: string;
    jobData?: any;
}

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

/* ================= CONSTANTS ================= */

const CATERING_SERVICES = [
    "Wedding Catering",
    "Corporate Events",
    "Custom Menus",
    "Bulk Orders",
];

const PHONE_MAP: Record<string, string> = {
    catering_1: "09123456789",
    catering_2: "09876543210",
    catering_3: "09777888999",
};

const IMAGES_MAP: Record<string, string[]> = {
    catering_1: [
        "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
        "https://images.unsplash.com/photo-1639024471283-03518883512d?w=800",
        "https://images.unsplash.com/photo-1555244162-803834f70033?w=800",
    ],
    catering_2: [
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800",
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    ],
    catering_3: [
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800",
        "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800",
        "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_CATERINGS: JobType[] = [
    {
        id: "catering_1",
        title: "Delicious Catering Co.",
        location: "Banjara Hills, Hyderabad",
        distance: 1.5,
        category: "Catering Service",
        description:
            "Wedding & event catering specialists offering North & South Indian cuisines with custom menus.",
        jobData: {
            rating: 4.7,
            user_ratings_total: 134,
            opening_hours: { open_now: true },
            closing_time: "22:00",
            geometry: { location: { lat: 17.4196, lng: 78.4123 } },
            phone: PHONE_MAP.catering_1,
        },
    },
    {
        id: "catering_2",
        title: "Royal Event Caterers",
        location: "Gachibowli, Hyderabad",
        distance: 3.2,
        category: "Catering Service",
        description:
            "Premium corporate & private event catering with multi-cuisine offerings.",
        jobData: {
            rating: 4.5,
            user_ratings_total: 98,
            opening_hours: { open_now: true },
            closing_time: "23:00",
            geometry: { location: { lat: 17.4476, lng: 78.391 } },
            phone: PHONE_MAP.catering_2,
        },
    },
    {
        id: "catering_3",
        title: "Grand Feast Caterers",
        location: "Kondapur, Hyderabad",
        distance: 4.8,
        category: "Catering Service",
        description:
            "Affordable catering services for all occasions with traditional & fusion menus.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 215,
            opening_hours: { open_now: false },
            closing_time: "21:30",
            geometry: { location: { lat: 17.4647, lng: 78.3636 } },
            phone: PHONE_MAP.catering_3,
        },
    },
];

/* ================= CARD ================= */

const SingleCateringCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => job.jobData?.photos || IMAGES_MAP[job.id] || IMAGES_MAP.catering_1,
        [job.id, job.jobData?.photos]
    );

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const closingTime = job.jobData?.closing_time;
    const phone = job.jobData?.phone || PHONE_MAP[job.id];

    const distanceString =
        typeof job.distance === "number"
            ? `${job.distance.toFixed(1)} km away`
            : job.distance;

    return (
        <div
            className="bg-white rounded-2xl shadow border overflow-hidden cursor-pointer hover:shadow-lg transition-all h-full flex flex-col"
            onClick={() => onViewDetails(job)}
        >
            {/* Image */}
            <div className="relative h-48 shrink-0">
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
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                    >
                        <ChevronLeft size={16} />
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
                        <ChevronRight size={16} />
                    </button>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1} / {photos.length}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 flex-grow flex flex-col">
                <h2 className="text-xl font-bold line-clamp-1">{job.title}</h2>

                <div className="flex gap-2 text-sm text-gray-600 items-center">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{job.location}</span>
                </div>

                {distanceString && (
                    <p className="text-green-600 text-sm font-semibold">
                        {distanceString}
                    </p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {job.description}
                </p>

                {/* Rating + Status */}
                <div className="flex items-center gap-3 pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="fill-yellow-400 text-yellow-400" size={14} />
                            <span className="font-semibold">{rating}</span>
                            {reviews && (
                                <span className="text-gray-500">({reviews})</span>
                            )}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <div
                            className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded ${isOpen
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            {isOpen
                                ? `Open${closingTime ? ` · Closes ${closingTime}` : ""}`
                                : "Closed"}
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {CATERING_SERVICES.slice(0, 3).map((s) => (
                        <span
                            key={s}
                            className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                        >
                            <CheckCircle size={10} /> {s}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const lat = job.jobData?.geometry?.location?.lat;
                            const lng = job.jobData?.geometry?.location?.lng;
                            if (lat && lng) {
                                window.open(
                                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                                    "_blank"
                                );
                            }
                        }}
                        className="flex-1 border-2 border-indigo-600 text-indigo-700 py-2 rounded-lg flex justify-center gap-2 font-semibold hover:bg-indigo-50"
                    >
                        <Navigation size={16} /> Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (phone) window.open(`tel:${phone}`, "_self");
                        }}
                        className={`flex-1 border-2 flex justify-center gap-2 py-2 rounded-lg font-semibold ${phone
                            ? "border-green-600 text-green-700 hover:bg-green-50"
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= LIST ================= */

const NearbyCateringService: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_CATERINGS.map((c) => (
                    <SingleCateringCard
                        key={c.id}
                        job={c}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleCateringCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyCateringService;
