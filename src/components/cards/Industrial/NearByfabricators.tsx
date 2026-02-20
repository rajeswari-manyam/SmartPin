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

export interface FabricatorService {
    place_id: string;
    name: string;
    vicinity: string;
    rating: number;
    user_ratings_total: number;
    photos: { photo_reference: string }[];
    geometry: {
        location: { lat: number; lng: number };
    };
    business_status: string;
    opening_hours: { open_now: boolean };
    price_level: number;
    types: string[];
    special_tags: string[];
    distance: number;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    fabricator_1: "08951804007",
    fabricator_2: "08123432127",
    fabricator_3: "08128634874",
    fabricator_4: "07405904184",
};

export const DUMMY_FABRICATORS: FabricatorService[] = [
    {
        place_id: "fabricator_1",
        name: "N8 Fabrication",
        vicinity: "Rangareddy, Hyderabad",
        rating: 5,
        user_ratings_total: 1,
        photos: [{ photo_reference: "1" }],
        geometry: { location: { lat: 17.385, lng: 78.4867 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["fabricator"],
        special_tags: ["Top Rated", "Verified"],
        distance: 16.6,
    },
    {
        place_id: "fabricator_2",
        name: "Indian Fabrication Works",
        vicinity: "Hyderabad",
        rating: 5,
        user_ratings_total: 1,
        photos: [{ photo_reference: "2" }],
        geometry: { location: { lat: 17.4485, lng: 78.3908 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["fabricator"],
        special_tags: ["Verified"],
        distance: 5.2,
    },
    {
        place_id: "fabricator_3",
        name: "A1 Fabricators",
        vicinity: "Hyderabad",
        rating: 4.6,
        user_ratings_total: 338,
        photos: [{ photo_reference: "3" }],
        geometry: { location: { lat: 17.44, lng: 78.35 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["fabricator"],
        special_tags: ["Popular"],
        distance: 10.4,
    },
];

const FABRICATOR_IMAGES_MAP: Record<string, string[]> = {
    fabricator_1: [
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800",
        "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800",
    ],
    fabricator_2: [
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
    ],
    fabricator_3: [
        "https://images.unsplash.com/photo-1581092918484-8313e1b2fcb4?w=800",
    ],
};

const FABRICATOR_SERVICES = [
    "Metal Fabrication",
    "Welding",
    "Steel Structures",
    "Shed Fabrication",
    "Custom Work",
];

/* ================= COMPONENT ================= */

interface Props {
    job?: any;
    onViewDetails: (job: any) => void;
}

const SingleFabricatorCard: React.FC<Props> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);
    const [error, setError] = useState(false);

    const photos = FABRICATOR_IMAGES_MAP[job?.id] || [];
    const currentPhoto = photos[index];

    const phone = PHONE_NUMBERS_MAP[job?.id];

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = job?.jobData?.geometry?.location;
        if (!loc) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
            "_blank"
        );
    };

    if (!job) return null;

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
        >
            {/* IMAGE */}
            <div className="relative h-48 bg-gray-100">
                {currentPhoto && !error ? (
                    <>
                        <img
                            src={currentPhoto}
                            className="w-full h-full object-cover"
                            onError={() => setError(true)}
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
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-6xl">
                        🔧
                    </div>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-3.5">
                <h3 className="text-[17px] font-bold mb-1 line-clamp-2">
                    {job.title}
                </h3>

                <div className="flex items-center text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1" />
                    <span className="text-[13px] line-clamp-1">{job.location}</span>
                </div>

                <p className="text-xs font-semibold text-orange-600 mb-2">
                    {job.distance.toFixed(1)} km away
                </p>

                {/* TAGS */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {job.jobData.special_tags.map((tag: string, i: number) => (
                        <span
                            key={i}
                            className="bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-0.5 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                {/* DESCRIPTION */}
                <p className="text-[13px] text-gray-600 mb-2 line-clamp-3">
                    Professional fabrication and welding services with quality assurance.
                </p>

                {/* BADGE */}
                <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    🔧 Fabrication Service
                </div>

                {/* RATING + STATUS */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1">
                        <Star size={13} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">
                            {job.jobData.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                            ({job.jobData.user_ratings_total})
                        </span>
                    </div>

                    <div
                        className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${job.jobData.opening_hours.open_now
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        <Clock size={11} />
                        {job.jobData.opening_hours.open_now ? "Open Now" : "Closed"}
                    </div>
                </div>

                {/* SERVICES */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 mb-1">
                        SERVICES:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {FABRICATOR_SERVICES.slice(0, 4).map((s, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-[11px] px-2 py-1 rounded"
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
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-xs py-2.5 rounded-lg"
                    >
                        <Navigation size={14} />
                        Directions
                    </button>

                    <button
                        onClick={handleCall}
                        disabled={!phone}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg ${phone
                            ? "border-orange-600 bg-orange-50 text-orange-600"
                            : "border-gray-300 bg-gray-100 text-gray-400"
                            }`}
                    >
                        <Phone size={14} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= WRAPPER ================= */

const NearbyFabricatorCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_FABRICATORS.map((f) => (
                    <SingleFabricatorCard
                        key={f.place_id}
                        job={{
                            id: f.place_id,
                            title: f.name,
                            location: f.vicinity,
                            distance: f.distance,
                            jobData: f,
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

     return <SingleFabricatorCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyFabricatorCard;
