import React, { useState, useCallback } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    CheckCircle,
    TrendingUp,
    Zap,
    Search,
    ChevronLeft,
    ChevronRight,
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
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

/* ================= DUMMY DATA ================= */
export const DUMMY_MAKEUP_ARTISTS: JobType[] = [
    {
        id: "makeup_1",
        title: "Manasa Makeup Artist",
        location: "Pno-304 Suchitra Cross Road, Hyderabad",
        jobData: {
            rating: 4.5,
            user_ratings_total: 4,
            distance_text: "2 km",
            opening_hours: { open_now: true },
            special_tags: ["Trending", "JD Verified"],
            amenities: ["Home Services Offered", "Waxing", "Facial"],
            geometry: { location: { lat: 17.49, lng: 78.415 } },
        },
    },
    {
        id: "makeup_2",
        title: "UDITA MAKEUP ARTISTS",
        location: "Himavathi Nagar Moti Nagar, Hyderabad",
        jobData: {
            rating: 5,
            user_ratings_total: 14,
            distance_text: "4.9 km",
            opening_hours: { open_now: true },
            special_tags: ["Responsive", "JD Verified"],
            amenities: ["Home Services Offered", "Bridal Makeup"],
            geometry: { location: { lat: 17.51, lng: 78.435 } },
            response_time: "Responds in 2 Hours",
        },
    },
    // Add other makeup artists as needed
];

const IMAGES_MAP: Record<string, string[]> = {
    makeup_1: [
        "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=800",
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
    ],
    makeup_2: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800",
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800",
    ],
};

/* ================= COMPONENT ================= */
const SingleMakeupCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({
    job,
    onViewDetails,
}) => {
    const images = IMAGES_MAP[job.id] || [];
    const [index, setIndex] = useState(0);

    const next = () => index < images.length - 1 && setIndex((i) => i + 1);
    const prev = () => index > 0 && setIndex((i) => i - 1);

    const phoneMap: Record<string, string> = {
        makeup_1: "07095652428",
        makeup_2: "08460443879",
    };
    const phone = phoneMap[job.id];

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const openNow = job.jobData?.opening_hours?.open_now;
    const tags = job.jobData?.special_tags || [];
    const amenities = job.jobData?.amenities || [];
    const distance = job.jobData?.distance_text;

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
        >
            {/* Image */}
            <div className="relative h-48">
                {images.length ? (
                    <img src={images[index]} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full flex items-center justify-center bg-gray-100">
                        <CheckCircle className="text-gray-400" size={48} />
                    </div>
                )}

                {index > 0 && (
                    <button
                        onClick={(e) => {
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
                        onClick={(e) => {
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

                {distance && <div className="text-indigo-600 text-sm font-semibold mt-1">{distance}</div>}

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-2">
                    {tags.map((tag: string) => (
                        <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded bg-indigo-50 text-indigo-700 flex items-center gap-1"
                        >
                            {tag === "JD Verified" && <CheckCircle size={12} />}
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
                            {reviews && <span className="text-gray-500 text-sm">({reviews})</span>}
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
                        <span key={a} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded">
                            {a}
                        </span>
                    ))}
                    {amenities.length > 4 && <span className="text-xs text-gray-500">+{amenities.length - 4} more</span>}
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={(e) => {
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
                        onClick={(e) => {
                            e.stopPropagation();
                            phone && window.open(`tel:${phone}`);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 font-semibold ${phone
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

const NearbyMakeupCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_MAKEUP_ARTISTS.map((m) => (
                    <SingleMakeupCard key={m.id} job={m} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleMakeupCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyMakeupCard;
