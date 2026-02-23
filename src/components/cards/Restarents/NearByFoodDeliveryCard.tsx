// src/components/cards/Restarents/NearByFoodDeliveryCard.tsx
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

const DELIVERY_FEATURES = ["Fast Delivery", "Live Tracking", "COD Available", "No Min. Order"];

const PHONE_MAP: Record<string, string> = {
    delivery_1: "09988776655",
    delivery_2: "09876012345",
    delivery_3: "09123987654",
};

const IMAGES_MAP: Record<string, string[]> = {
    delivery_1: [
        "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800",
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
    ],
    delivery_2: [
        "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
        "https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800",
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800",
    ],
    delivery_3: [
        "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
        "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_DELIVERY: JobType[] = [
    {
        id: "delivery_1",
        title: "QuickBite Delivery",
        location: "Madhapur, Hyderabad",
        distance: 0.8,
        category: "Food Delivery",
        description:
            "Hyderabad's fastest food delivery service. Multi-cuisine delivery from top restaurants within 30 minutes.",
        jobData: {
            rating: 4.5,
            user_ratings_total: 2140,
            opening_hours: { open_now: true },
            closing_time: "23:59",
            geometry: { location: { lat: 17.4485, lng: 78.3908 } },
            phone: PHONE_MAP.delivery_1,
        },
    },
    {
        id: "delivery_2",
        title: "Hunger Stop Delivery",
        location: "Gachibowli, Hyderabad",
        distance: 1.5,
        category: "Food Delivery",
        description:
            "On-demand food delivery covering 50+ restaurants. Real-time tracking and cashless payments.",
        jobData: {
            rating: 4.3,
            user_ratings_total: 870,
            opening_hours: { open_now: true },
            closing_time: "23:00",
            geometry: { location: { lat: 17.4476, lng: 78.391 } },
            phone: PHONE_MAP.delivery_2,
        },
    },
    {
        id: "delivery_3",
        title: "DailyMeal Express",
        location: "Kondapur, Hyderabad",
        distance: 2.3,
        category: "Food Delivery",
        description:
            "Reliable home meal delivery service. Tiffin, biryani, snacks & sweets delivered fresh to your door.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 1350,
            opening_hours: { open_now: false },
            closing_time: "22:30",
            geometry: { location: { lat: 17.4647, lng: 78.3636 } },
            phone: PHONE_MAP.delivery_3,
        },
    },
];

/* ================= CARD ================= */

const SingleFoodDeliveryCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => job.jobData?.photos || IMAGES_MAP[job.id] || IMAGES_MAP.delivery_1,
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
                            {isOpen
                                ? `Open${closingTime ? ` · Closes ${closingTime}` : ""}`
                                : "Closed"}
                        </div>
                    )}
                </div>

                {/* Features */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {DELIVERY_FEATURES.slice(0, 3).map((f) => (
                        <span
                            key={f}
                            className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
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

const NearbyFoodDeliveryCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_DELIVERY.map((d) => (
                    <SingleFoodDeliveryCard key={d.id} job={d} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleFoodDeliveryCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyFoodDeliveryCard;
