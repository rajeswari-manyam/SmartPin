import React, { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    Bed,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
    TrendingUp,
    Zap,
    Search,
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

interface Props {
    job: JobType;
    onViewDetails: (job: JobType) => void;
}

/* ================= DUMMY DATA ================= */

export const DUMMY_LODGES = [
    {
        id: "lodge_1",
        title: "PIONEER LODGE",
        location: "Park Lane Bhojguda, Secunderabad",
        jobData: {
            rating: 3.2,
            user_ratings_total: 150,
            distance_text: "6.3 km",
            opening_hours: { open_now: true },
            special_tags: ["Verified", "Top Search"],
            amenities: ["Wake-Up Calls", "Caretaker", "Disinfectant Dispensers"],
            geometry: { location: { lat: 17.52, lng: 78.435 } },
        },
    },
    {
        id: "lodge_2",
        title: "Sai Manikanta Deluxe Lodge",
        location: "Ganesh Nagar, Hyderabad",
        jobData: {
            rating: 3.1,
            user_ratings_total: 6,
            distance_text: "950 mts",
            opening_hours: { open_now: true },
            amenities: ["Basic Lodging", "Clean Rooms"],
            geometry: { location: { lat: 17.53, lng: 78.44 } },
        },
    },
    {
        id: "lodge_3",
        title: "Shiva Nivas Deluxe Lodge",
        location: "Croma Lane Somajiguda, Hyderabad",
        jobData: {
            rating: 4.5,
            user_ratings_total: 97,
            distance_text: "7.3 km",
            opening_hours: { open_now: true },
            special_tags: ["Trending"],
            amenities: ["Clean Rooms", "TV", "Attached Bathroom"],
            geometry: { location: { lat: 17.525, lng: 78.438 } },
        },
    },
    {
        id: "lodge_4",
        title: "Hotel Sri Bhavani Deluxe Lodge",
        location: "Rezimental Bazar Bhojguda, Secunderabad",
        jobData: {
            rating: 3.6,
            user_ratings_total: 198,
            distance_text: "7.4 km",
            opening_hours: { open_now: true },
            special_tags: ["Responsive"],
            amenities: ["WiFi", "TV", "Hot Water", "Room Service"],
            geometry: { location: { lat: 17.515, lng: 78.432 } },
        },
    },
];

const LODGE_IMAGES: Record<string, string[]> = {
    lodge_1: [
        "https://images.unsplash.com/photo-1631049552240-59c37f563ed8",
        "https://images.unsplash.com/photo-1590490360182-c33d57733427",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39",
    ],
    lodge_2: [
        "https://images.unsplash.com/photo-1566073771259-6a8506099945",
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
    ],
    lodge_3: [
        "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
        "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0",
    ],
    lodge_4: [
        "https://images.unsplash.com/photo-1631049307264-da0ec9d70304",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    ],
};

const PHONE_MAP: Record<string, string> = {
    lodge_1: "07043874027",
    lodge_2: "07048215618",
    lodge_3: "07947106834",
    lodge_4: "07947128606",
};

/* ================= COMPONENT ================= */

const SingleLodgeCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const images = LODGE_IMAGES[job.id] || [];
    const [index, setIndex] = useState(0);

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const openNow = job.jobData?.opening_hours?.open_now;
    const tags = job.jobData?.special_tags || [];
    const amenities = job.jobData?.amenities || [];
    const distance = job.jobData?.distance_text;
    const phone = PHONE_MAP[job.id];

    const next = () => index < images.length - 1 && setIndex(i => i + 1);
    const prev = () => index > 0 && setIndex(i => i - 1);

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-48">
                {images.length ? (
                    <img
                        src={images[index]}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                        <Bed className="text-gray-400" size={48} />
                    </div>
                )}

                {index > 0 && (
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            prev();
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full"
                    >
                        <ChevronLeft className="text-white" />
                    </button>
                )}

                {index < images.length - 1 && (
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            next();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-1 rounded-full"
                    >
                        <ChevronRight className="text-white" />
                    </button>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{images.length}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-lg">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                {distance && (
                    <div className="text-indigo-600 text-sm font-semibold mt-1">
                        {distance}
                    </div>
                )}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag: string) => (
                        <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700 flex items-center gap-1"
                        >
                            {tag === "Verified" && <CheckCircle size={12} />}
                            {tag === "Trending" && <TrendingUp size={12} />}
                            {tag === "Responsive" && <Zap size={12} />}
                            {tag === "Top Search" && <Search size={12} />}
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-3 mt-3">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            {reviews && (
                                <span className="text-gray-500 text-sm">({reviews})</span>
                            )}
                        </div>
                    )}

                    {openNow !== undefined && (
                        <div className="flex items-center text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            <Clock size={12} className="mr-1" />
                            {openNow ? "Open Now" : "Closed"}
                        </div>
                    )}
                </div>

                {/* Amenities */}
                <div className="mt-3 flex flex-wrap gap-2">
                    {amenities.slice(0, 4).map((a: string) => (
                        <span
                            key={a}
                            className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded"
                        >
                            {a}
                        </span>
                    ))}
                    {amenities.length > 4 && (
                        <span className="text-xs text-gray-500">
                            +{amenities.length - 4} more
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            window.open(
                                `https://www.google.com/maps?q=${job.jobData.geometry.location.lat},${job.jobData.geometry.location.lng}`
                            );
                        }}
                        className="flex-1 flex items-center justify-center gap-1 border border-indigo-600 text-indigo-600 rounded-lg py-2 font-semibold hover:bg-indigo-50"
                    >
                        <Navigation size={14} /> Directions
                    </button>

                    <button
                        disabled={!phone}
                        onClick={e => {
                            e.stopPropagation();
                            phone && window.open(`tel:${phone}`);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 font-semibold
              ${phone
                                ? "bg-green-100 text-green-700 border border-green-600 hover:bg-green-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={14} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const NearbyLodgesCard: React.FC<Props> = ({ job, onViewDetails }) => {
    // If no job provided, render grid of dummy data
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_LODGES.map((lodge) => (
                    <SingleLodgeCard
                        key={lodge.id}
                        job={{
                            id: lodge.id,
                            title: lodge.title,
                            location: lodge.location,
                            jobData: lodge.jobData,
                        }}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job provided, render single card
    return <SingleLodgeCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyLodgesCard;
