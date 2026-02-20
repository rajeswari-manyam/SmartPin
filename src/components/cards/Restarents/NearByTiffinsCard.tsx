// src/pages/NearByTiffens.tsx
import React, { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
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

/* ================= CONSTANTS ================= */

const TIFFIN_SERVICES = ["Daily Tiffin", "Home Delivery", "Custom Meals"];

const PHONE_MAP: Record<string, string> = {
    tiffin_1: "09123456789",
    tiffin_2: "09876543210",
    tiffin_3: "09555444333",
};

const IMAGES_MAP: Record<string, string[]> = {
    tiffin_1: [
        "https://images.unsplash.com/photo-1604908815108-fdbd32b5cab5?w=800",
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    ],
    tiffin_2: [
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800",
        "https://images.unsplash.com/photo-1601050690117-f4fca0f5c16d?w=800",
        "https://images.unsplash.com/photo-1623428187425-5d7a024b0d97?w=800",
    ],
    tiffin_3: [
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
        "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800",
        "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_TIFFINS: JobType[] = [
    {
        id: "tiffin_1",
        title: "HomeMade Tiffin Service",
        location: "Kukatpally, Hyderabad",
        distance: 0.5,
        category: "Tiffin Service",
        description: "Fresh, hygienic home-style meals delivered daily.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 892,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4946, lng: 78.3996 } },
            phone: PHONE_MAP.tiffin_1,
        }
    },
    {
        id: "tiffin_2",
        title: "Healthy Bites Tiffin",
        location: "Madhapur, Hyderabad",
        distance: 1.2,
        category: "Tiffin Service",
        description: "Nutritious meals with diet-conscious options.",
        jobData: {
            rating: 4.7,
            user_ratings_total: 450,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4485, lng: 78.3908 } },
            phone: PHONE_MAP.tiffin_2,
        }
    },
    {
        id: "tiffin_3",
        title: "Spice Route Tiffin",
        location: "HITEC City, Hyderabad",
        distance: 2.0,
        category: "Tiffin Service",
        description: "Authentic regional cuisine delivered hot.",
        jobData: {
            rating: 4.5,
            user_ratings_total: 320,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 17.4435, lng: 78.3772 } },
            phone: PHONE_MAP.tiffin_3,
        }
    },
];

/* ================= CARD ================= */

const SingleTiffinCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES_MAP[job.id] || IMAGES_MAP.tiffin_1,
        [job.id]
    );

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const phone = job.jobData?.phone;

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
                    <MapPin size={14} />
                    <span className="truncate">{job.location}</span>
                </div>

                {distanceText && (
                    <p className="text-green-600 text-sm font-semibold">{distanceText}</p>
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
                            {reviews && <span className="text-gray-500">({reviews})</span>}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={12} /> {isOpen ? "Open" : "Closed"}
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {TIFFIN_SERVICES.map((s) => (
                        <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            <CheckCircle size={10} /> {s}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const { lat, lng } = job.jobData?.geometry?.location || {};
                            if (lat && lng) {
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
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
                        className={`flex-1 border-2 flex justify-center gap-2 py-2 rounded-lg font-semibold ${phone ? "border-green-600 text-green-700 hover:bg-green-50" : "border-gray-200 text-gray-400 cursor-not-allowed"}`}
                    >
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= LIST ================= */

const NearbyTiffinServiceCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_TIFFINS.map((t) => (
                    <SingleTiffinCard key={t.id} job={t} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleTiffinCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyTiffinServiceCard;
