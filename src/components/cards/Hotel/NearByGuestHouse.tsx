import React, { useState } from "react";
import {
    MapPin,
    Star,
    Phone,
    Navigation,
    CheckCircle,
    TrendingUp,
    Flame,
} from "lucide-react";

/* ================= TYPES ================= */

export interface GuestHouse {
    id: string;
    name: string;
    location: string;
    rating: number;
    reviews: number;
    distance: string;
    tags: string[];
    amenities: string[];
    images: string[];
    phone?: string;
    lat: number;
    lng: number;
}

/* ================= DUMMY DATA ================= */

export const GUEST_HOUSES: GuestHouse[] = [
    {
        id: "guesthouse_1",
        name: "Hal Guest House",
        location: "HAL CRF Colony, Bala Nagar, Hyderabad",
        rating: 4.3,
        reviews: 117,
        distance: "1.8 km",
        tags: ["Popular"],
        amenities: ["WiFi", "Parking", "Room Service"],
        phone: "07947417312",
        lat: 17.44,
        lng: 78.45,
        images: [
            "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800",
            "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800",
        ],
    },
    {
        id: "guesthouse_2",
        name: "R B Guest House",
        location: "Padma Nagar Phase 2, Chintal",
        rating: 4.8,
        reviews: 74,
        distance: "2.3 km",
        tags: ["Trending", "Top Rated"],
        amenities: ["WiFi", "AC Rooms", "Home Stay"],
        phone: "07947139104",
        lat: 17.445,
        lng: 78.455,
        images: [
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800",
            "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800",
        ],
    },
];

/* ================= COMPONENT ================= */

interface GuestHouseCardProps {
    job?: any;
    onViewDetails: (job: any) => void;
}

const SingleGuestHouseCard: React.FC<{ data: GuestHouse; onViewDetails: (job: any) => void }> = ({ data, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const next = () =>
        setIndex((prev) => (prev + 1) % data.images.length);
    const prev = () =>
        setIndex((prev) =>
            prev === 0 ? data.images.length - 1 : prev - 1
        );

    const handleClick = () => {
        onViewDetails({
            id: data.id,
            title: data.name,
            location: data.location,
            jobData: data
        });
    };

    return (
        <div onClick={handleClick} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer">
            {/* IMAGE */}
            <div className="relative h-48">
                <img
                    src={data.images[index]}
                    alt={data.name}
                    className="w-full h-full object-cover"
                />

                {data.images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                prev();
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded-full"
                        >
                            ‹
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                next();
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-2 py-1 rounded-full"
                        >
                            ›
                        </button>
                    </>
                )}

                <div className="absolute bottom-2 right-2 text-xs bg-black/70 text-white px-2 py-1 rounded">
                    {index + 1}/{data.images.length}
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900">{data.name}</h3>

                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin size={14} className="mr-1" />
                    {data.location}
                </div>

                <div className="text-sm font-semibold text-purple-600 mt-1">
                    {data.distance}
                </div>

                {/* TAGS */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {data.tags.map((tag) => (
                        <span
                            key={tag}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full
                ${tag === "Verified"
                                    ? "bg-green-100 text-green-700"
                                    : tag === "Trending"
                                        ? "bg-red-100 text-red-600"
                                        : tag === "Top Rated"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-orange-100 text-orange-700"
                                }
              `}
                        >
                            {tag === "Verified" && <CheckCircle size={12} />}
                            {tag === "Trending" && <TrendingUp size={12} />}
                            {tag === "Popular" && <Flame size={12} />}
                            {tag === "Top Rated" && <Star size={12} />}
                            {tag}
                        </span>
                    ))}
                </div>

                {/* RATING */}
                <div className="flex items-center gap-2 mt-3">
                    <Star size={16} className="text-yellow-400" />
                    <span className="font-semibold">{data.rating}</span>
                    <span className="text-sm text-gray-500">
                        ({data.reviews})
                    </span>
                </div>

                {/* AMENITIES */}
                <div className="mt-3">
                    <p className="text-xs font-bold text-gray-500 mb-1">
                        AMENITIES
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {data.amenities.slice(0, 4).map((a) => (
                            <span
                                key={a}
                                className="bg-purple-50 text-purple-600 text-xs px-2 py-1 rounded"
                            >
                                {a}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 mt-4">
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${data.lat},${data.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 flex items-center justify-center gap-1 border border-purple-500 text-purple-600 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50"
                    >
                        <Navigation size={14} /> Directions
                    </a>

                    {data.phone && (
                        <a
                            href={`tel:${data.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 flex items-center justify-center gap-1 border border-green-500 text-green-600 py-2 rounded-lg text-sm font-semibold hover:bg-green-50"
                        >
                            <Phone size={14} /> Call
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};

const NearbyGuestHouseCard: React.FC<GuestHouseCardProps> = ({ job, onViewDetails }) => {
    // If no job provided, render grid of dummy data
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {GUEST_HOUSES.map((guestHouse) => (
                    <SingleGuestHouseCard
                        key={guestHouse.id}
                        data={guestHouse}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job provided, render single card
    const guestHouseData: GuestHouse = {
        id: job.id,
        name: job.title || "Guest House",
        location: job.location || "",
        rating: job.jobData?.rating || 0,
        reviews: job.jobData?.user_ratings_total || 0,
        distance: job.jobData?.distance_text || "",
        tags: job.jobData?.special_tags || [],
        amenities: job.jobData?.amenities || [],
        images: job.jobData?.images || GUEST_HOUSES[0].images,
        phone: job.jobData?.phone,
        lat: job.jobData?.geometry?.location?.lat || 0,
        lng: job.jobData?.geometry?.location?.lng || 0,
    };

    return <SingleGuestHouseCard data={guestHouseData} onViewDetails={onViewDetails} />;
};

export default NearbyGuestHouseCard;
