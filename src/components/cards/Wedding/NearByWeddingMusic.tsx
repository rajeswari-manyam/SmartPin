import React, { useState, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Navigation,
    Star,
    Music,
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
    band_1: "09035062744",
    band_2: "08197510823",
    band_3: "08401844076",
    band_4: "Show Number",
};

const IMAGES_MAP: Record<string, string[]> = {
    band_1: [
        "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
        "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800",
    ],
    band_2: [
        "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800",
        "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
    ],
    band_3: [
        "https://images.unsplash.com/photo-1501612780327-45045538702b?w=800",
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800",
    ],
    band_4: [
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800",
        "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_BANDS: JobType[] = [
    {
        id: "band_1",
        title: "New Sri Rama Band",
        location: "Kummariguda, Secunderabad",
        distance: 7.6,
        category: "Wedding Band",
        jobData: {
            rating: 4.4,
            user_ratings_total: 94,
            phone: PHONE_MAP.band_1,
            verified: true,
            geometry: { location: { lat: 17.4375, lng: 78.4983 } },
        },
    },
    {
        id: "band_2",
        title: "Sri Maheshwari Band",
        location: "Barkatpura, Hyderabad",
        distance: 11.6,
        category: "Wedding Band",
        jobData: {
            rating: 4.3,
            user_ratings_total: 25,
            phone: PHONE_MAP.band_2,
            trending: true,
            geometry: { location: { lat: 17.4065, lng: 78.4955 } },
        },
    },
    {
        id: "band_3",
        title: "Naveen Pad Band & Nadaswaram",
        location: "ECIL, Hyderabad",
        distance: 12.1,
        category: "Wedding Band",
        jobData: {
            rating: 4.2,
            user_ratings_total: 49,
            phone: PHONE_MAP.band_3,
            geometry: { location: { lat: 17.4784, lng: 78.5636 } },
        },
    },
    {
        id: "band_4",
        title: "Harihara Nadaswara Brundam",
        location: "Malkajgiri, Secunderabad",
        distance: 5.2,
        category: "Wedding Band",
        jobData: {
            rating: 5.0,
            user_ratings_total: 2,
            phone: PHONE_MAP.band_4,
            geometry: { location: { lat: 17.4474, lng: 78.5261 } },
        },
    },
];

/* ================= CARD ================= */

const SingleBandCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = IMAGES_MAP[job.id] || IMAGES_MAP.band_1;
    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const phone = job.jobData?.phone;
    const distance =
        typeof job.distance === "number"
            ? `${job.distance.toFixed(1)} km away`
            : "";

    const handleCall = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (phone && phone !== "Show Number") {
                window.location.href = `tel:${phone}`;
            }
        },
        [phone]
    );

    const handleDirections = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const lat = job.jobData?.geometry?.location?.lat;
            const lng = job.jobData?.geometry?.location?.lng;
            if (!lat || !lng) return alert("Location not available");
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                "_blank"
            );
        },
        [job]
    );

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
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
                <h3 className="text-[17px] font-bold text-gray-900 line-clamp-2">
                    {job.title}
                </h3>

                <div className="flex items-center text-gray-500 mt-1">
                    <MapPin size={14} className="mr-1" />
                    <span className="text-[13px] line-clamp-1">
                        {job.location}
                    </span>
                </div>

                {distance && (
                    <p className="text-xs font-semibold text-purple-600 mt-1">
                        {distance}
                    </p>
                )}

                <div className="flex items-center gap-1 mt-2">
                    <Music size={14} className="text-purple-600" />
                    <span className="text-[11px] font-semibold text-purple-600">
                        Wedding Band
                    </span>
                </div>

                {rating && (
                    <div className="flex items-center gap-1 mt-2">
                        <Star size={13} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-[13px] font-semibold">
                            {rating.toFixed(1)}
                        </span>
                        {reviews && (
                            <span className="text-xs text-gray-500">
                                ({reviews})
                            </span>
                        )}
                    </div>
                )}

                {/* ACTIONS */}
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-xs py-2.5 rounded-lg"
                    >
                        <Navigation size={14} />
                        Directions
                    </button>

                    <button
                        onClick={handleCall}
                        disabled={!phone || phone === "Show Number"}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg ${phone && phone !== "Show Number"
                                ? "border-green-600 bg-green-50 text-green-700"
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

/* ================= MAIN ================= */

const NearbyWeddingBands: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_BANDS.map((band) => (
                    <SingleBandCard
                        key={band.id}
                        job={band}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleBandCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyWeddingBands;
