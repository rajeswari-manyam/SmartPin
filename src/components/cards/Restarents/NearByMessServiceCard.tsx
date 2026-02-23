// src/components/cards/Restarents/NearByMessServiceCard.tsx
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

const MESS_FEATURES = ["Veg & Non-Veg", "Monthly Plans", "Home-Style Meals", "Hygenic Kitchen"];

const PHONE_MAP: Record<string, string> = {
    mess_1: "09123456780",
    mess_2: "09876543211",
    mess_3: "09555444334",
};

const IMAGES_MAP: Record<string, string[]> = {
    mess_1: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
        "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800",
    ],
    mess_2: [
        "https://images.unsplash.com/photo-1601050690117-f4fca0f5c16d?w=800",
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800",
        "https://images.unsplash.com/photo-1604908815108-fdbd32b5cab5?w=800",
    ],
    mess_3: [
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800",
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800",
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_MESS: JobType[] = [
    {
        id: "mess_1",
        title: "Sri Balaji Mess",
        location: "Ameerpet, Hyderabad",
        distance: 0.6,
        category: "Mess Service",
        description:
            "Affordable South Indian meals served thrice daily. Ideal for students and working professionals.",
        jobData: {
            rating: 4.4,
            user_ratings_total: 320,
            opening_hours: { open_now: true },
            closing_time: "21:30",
            geometry: { location: { lat: 17.3725, lng: 78.4462 } },
            phone: PHONE_MAP.mess_1,
        },
    },
    {
        id: "mess_2",
        title: "Annapurna Canteen Mess",
        location: "Dilsukhnagar, Hyderabad",
        distance: 1.4,
        category: "Mess Service",
        description:
            "Pure veg canteen-style mess serving breakfast, lunch & dinner. Monthly subscription available.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 512,
            opening_hours: { open_now: true },
            closing_time: "22:00",
            geometry: { location: { lat: 17.3688, lng: 78.5167 } },
            phone: PHONE_MAP.mess_2,
        },
    },
    {
        id: "mess_3",
        title: "Surya Student Mess",
        location: "Koti, Hyderabad",
        distance: 2.1,
        category: "Mess Service",
        description:
            "Budget-friendly mess for students and working bachelors. Veg & Non-Veg options available.",
        jobData: {
            rating: 4.2,
            user_ratings_total: 198,
            opening_hours: { open_now: false },
            closing_time: "21:00",
            geometry: { location: { lat: 17.3753, lng: 78.4841 } },
            phone: PHONE_MAP.mess_3,
        },
    },
];

/* ================= CARD ================= */

const SingleMessCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({
    job,
    onViewDetails,
}) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => job.jobData?.photos || IMAGES_MAP[job.id] || IMAGES_MAP.mess_1,
        [job.id, job.jobData?.photos]
    );

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const closingTime = job.jobData?.closing_time;
    const phone = job.jobData?.phone || PHONE_MAP[job.id];

    const distanceText =
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
                <img src={photos[index]} className="w-full h-full object-cover" alt={job.title} />

                {index > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIndex(index - 1); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}

                {index < photos.length - 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIndex(index + 1); }}
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

                {distanceText && (
                    <p className="text-green-600 text-sm font-semibold">{distanceText}</p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{job.description}</p>

                {/* Rating + Status */}
                <div className="flex items-center gap-3 pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="fill-yellow-400 text-yellow-400" size={14} />
                            <span className="font-semibold">{rating}</span>
                            {reviews && <span className="text-gray-500">({reviews})</span>}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <div
                            className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            {isOpen ? `Open${closingTime ? ` · Closes ${closingTime}` : ""}` : "Closed"}
                        </div>
                    )}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {MESS_FEATURES.slice(0, 3).map((f) => (
                        <span
                            key={f}
                            className="flex items-center gap-1 bg-orange-50 text-orange-700 text-xs px-2 py-1 rounded"
                        >
                            <CheckCircle size={10} /> {f}
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

const NearbyMessServiceCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_MESS.map((m) => (
                    <SingleMessCard key={m.id} job={m} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleMessCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyMessServiceCard;
