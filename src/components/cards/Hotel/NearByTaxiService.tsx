/**
 * ============================================================================
 * NearbyTaxiServiceCard.tsx - Taxi Service Card (Web)
 * Converted from React Native → ReactJS
 * ============================================================================
 */

import React, { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    Car,
    CheckCircle,
    TrendingUp,
    ShieldCheck,
    Search,
    ChevronLeft,
    ChevronRight,
    Tag,
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title?: string;
    location?: string;
    description?: string;
    distance?: number | string;
    jobData?: any;
}

/* ================= PHONE MAP ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    taxi_1: "08867782135",
    taxi_2: "08074676914",
    taxi_3: "07942696971",
    taxi_4: "07947135739",
};

/* ================= IMAGES ================= */

const TAXI_IMAGES_MAP: Record<string, string[]> = {
    taxi_1: [
        "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800",
        "https://images.unsplash.com/photo-1552345386-5a83f449d1ec?w=800",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
    ],
    taxi_2: [
        "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800",
        "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800",
        "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
    ],
    taxi_3: [
        "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
        "https://images.unsplash.com/photo-1562071707-7249ab429b2a?w=800",
        "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800",
    ],
    taxi_4: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
        "https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800",
        "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800",
    ],
};

/* ================= DUMMY TAXI DATA ================= */

export const DUMMY_TAXI_SERVICES: JobType[] = [
    {
        id: "taxi_1",
        title: "Ola Cabs",
        location: "Gachibowli, Hyderabad",
        jobData: {
            rating: 4.8,
            user_ratings_total: 1393,
            distance_text: "3.2 km",
            opening_hours: { open_now: true },
            special_tags: ["Top Search", "Verified"],
            amenities: ["AC Cabs", "Airport Service", "Luxury Cabs", "Wedding Cars"],
            geometry: { location: { lat: 17.44, lng: 78.35 } },
            price_info: "Reasonably Priced",
        },
    },
    {
        id: "taxi_2",
        title: "Uber Cabs",
        location: "Madhapur, Hyderabad",
        jobData: {
            rating: 4.5,
            user_ratings_total: 892,
            distance_text: "5.1 km",
            opening_hours: { open_now: true },
            special_tags: ["Verified", "Trending", "JD Trust"],
            amenities: ["AC Cabs", "Airport Service", "Online Booking"],
            geometry: { location: { lat: 17.445, lng: 78.355 } },
        },
    },
    {
        id: "taxi_3",
        title: "Meru Cabs",
        location: "Gachibowli, Hyderabad",
        jobData: {
            rating: 4.2,
            user_ratings_total: 456,
            distance_text: "4.8 km",
            opening_hours: { open_now: true },
            special_tags: ["Trending"],
            amenities: ["Local Trips", "Outstation", "AC Cabs"],
            geometry: { location: { lat: 17.442, lng: 78.352 } },
        },
    },
    {
        id: "taxi_4",
        title: "Sky Cabs",
        location: "Kondapur, Hyderabad",
        jobData: {
            rating: 4.3,
            user_ratings_total: 234,
            distance_text: "6.2 km",
            opening_hours: { open_now: true },
            special_tags: ["Trending"],
            amenities: ["Airport Service", "Clean Vehicles"],
            geometry: { location: { lat: 17.46, lng: 78.36 } },
        },
    },
];

/* ================= DESCRIPTIONS ================= */

const TAXI_DESCRIPTIONS_MAP: Record<string, string> = {
    taxi_1:
        "Top Search taxi service with excellent 4.8★ rating and 1,393 reviews. Reasonably priced with luxury and wedding options.",
    taxi_2:
        "Verified and trending taxi service. JD Trust certified and specialized in airport transfers.",
    taxi_3:
        "Reliable taxi service offering local and outstation trips from Gachibowli.",
    taxi_4:
        "Trending taxi service known for clean vehicles and airport services.",
};

/* ================= COMPONENT ================= */

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

const SingleTaxiCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const data = job.jobData || {};
    const images = useMemo(
        () => TAXI_IMAGES_MAP[job.id] || TAXI_IMAGES_MAP.taxi_1,
        [job.id]
    );

    const phone = PHONE_NUMBERS_MAP[job.id];
    const amenities: string[] = data.amenities || [
        "AC Cabs",
        "Airport Service",
        "Local Trips",
    ];

    const tags: string[] = data.special_tags || [];

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const { lat, lng } = data.geometry?.location || {};
        if (!lat || !lng) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (phone) window.location.href = `tel:${phone}`;
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden cursor-pointer"
        >
            {/* ================= IMAGE CAROUSEL ================= */}
            <div className="relative h-44">
                <img
                    src={images[index]}
                    alt={job.title}
                    className="w-full h-full object-cover"
                />

                {index > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex((i) => i - 1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                    >
                        <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                )}

                {index < images.length - 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex((i) => i + 1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                    >
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{images.length}
                </div>
            </div>

            {/* ================= CONTENT ================= */}
            <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 line-clamp-2">
                    {job.title}
                </h3>

                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                </div>

                {data.distance_text && (
                    <p className="text-sm font-semibold text-amber-600 mt-1">
                        {data.distance_text}
                    </p>
                )}

                {/* ================= TAGS ================= */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag) => (
                        <span
                            key={tag}
                            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded
                ${tag === "Verified"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : tag === "Trending"
                                        ? "bg-red-100 text-red-600"
                                        : tag === "JD Trust"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-amber-100 text-amber-700"
                                }`}
                        >
                            {tag === "Verified" && <CheckCircle className="w-3 h-3" />}
                            {tag === "Trending" && <TrendingUp className="w-3 h-3" />}
                            {tag === "JD Trust" && <ShieldCheck className="w-3 h-3" />}
                            {tag === "Top Search" && <Search className="w-3 h-3" />}
                            {tag}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                    {TAXI_DESCRIPTIONS_MAP[job.id] || job.description}
                </p>

                {data.price_info && (
                    <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded mt-2">
                        <Tag className="w-3 h-3" />
                        {data.price_info}
                    </div>
                )}

                {/* ================= RATING ================= */}
                <div className="flex items-center gap-3 mt-3">
                    {data.rating && (
                        <div className="flex items-center gap-1 font-semibold text-sm">
                            <Star className="w-4 h-4 text-yellow-400" />
                            {data.rating}
                            <span className="text-gray-500 font-normal">
                                ({data.user_ratings_total})
                            </span>
                        </div>
                    )}

                    {data.opening_hours?.open_now && (
                        <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                            <Clock className="w-3 h-3" />
                            Open Now
                        </span>
                    )}
                </div>

                {/* ================= AMENITIES ================= */}
                <div className="mt-3">
                    <p className="text-xs font-bold text-gray-500 mb-1">SERVICES</p>
                    <div className="flex flex-wrap gap-2">
                        {amenities.slice(0, 4).map((a) => (
                            <span
                                key={a}
                                className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded"
                            >
                                <CheckCircle className="w-3 h-3" />
                                {a}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ================= ACTIONS ================= */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-amber-500 text-amber-600 rounded-lg py-2 font-semibold text-sm hover:bg-amber-50"
                    >
                        <Navigation className="w-4 h-4" />
                        Directions
                    </button>

                    <button
                        disabled={!phone}
                        onClick={handleCall}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 font-semibold text-sm
              ${phone
                                ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-600 hover:bg-emerald-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone className="w-4 h-4" />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const NearbyTaxiServiceCard: React.FC<Props> = ({ job, onViewDetails }) => {
    // If no job provided, render grid of dummy data
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_TAXI_SERVICES.map((taxi) => (
                    <SingleTaxiCard
                        key={taxi.id}
                        job={taxi}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job provided, render single card
    return <SingleTaxiCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyTaxiServiceCard;
