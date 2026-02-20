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

export interface Choreographer {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number;
    category?: string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
        special_tags?: string[];
    };
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    choreo_1: "07947117076",
    choreo_2: "07947127648",
    choreo_3: "07947117076",
    choreo_4: "07947127648",
};

const CHOREO_IMAGES_MAP: Record<string, string[]> = {
    choreo_1: [
        "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800",
        "https://images.unsplash.com/photo-1547153760-18fc86324498?w=800",
    ],
    choreo_2: [
        "https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=800",
        "https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=800",
    ],
    choreo_3: [
        "https://images.unsplash.com/photo-1545224144-b38cd309ef69?w=800",
    ],
    choreo_4: [
        "https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=800",
    ],
};

const CHOREO_SERVICES = [
    "Wedding Choreography",
    "Sangeet",
    "Group Training",
    "Corporate Events",
];

/* ================= SINGLE CARD ================= */

interface Props {
    job?: Choreographer;
    onViewDetails: (job: Choreographer) => void;
}

const SingleChoreographerCard: React.FC<Props> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!job) return null;

    const photos = CHOREO_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];
    const rating = job.jobData?.rating;
    const userRatingsTotal = job.jobData?.user_ratings_total;
    const openNow = job.jobData?.opening_hours?.open_now;
    const specialTags = job.jobData?.special_tags || [];
    const distance = job.distance ? `${job.distance.toFixed(1)} km away` : "";

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = job.jobData?.geometry?.location;
        if (loc) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
                "_blank"
            );
        }
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImageIndex > 0) setCurrentImageIndex((p) => p - 1);
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImageIndex < photos.length - 1) setCurrentImageIndex((p) => p + 1);
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[0.99] mb-4"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
                {currentPhoto ? (
                    <>
                        <img
                            src={currentPhoto}
                            className="w-full h-full object-cover"
                            alt={job.title}
                        />

                        {photos.length > 1 && (
                            <>
                                {currentImageIndex > 0 && (
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                )}

                                {currentImageIndex < photos.length - 1 && (
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                )}

                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-5xl">
                        💃
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                <h3 className="text-[17px] font-bold text-gray-900 mb-1 line-clamp-2">
                    {job.title}
                </h3>

                <div className="flex items-center text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="text-[13px] line-clamp-1">{job.location}</span>
                </div>

                {distance && <p className="text-xs font-semibold text-red-600 mb-2">{distance}</p>}

                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.map((tag, idx) => (
                            <span
                                key={idx}
                                className="bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-0.5 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
                    {job.description}
                </p>

                <div className="inline-flex items-center gap-1 bg-rose-100 text-rose-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <CheckCircle size={12} />
                    <span>Choreographer</span>
                </div>

                <div className="flex items-center gap-2 mb-2.5">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[13px] font-semibold">{rating.toFixed(1)}</span>
                            {userRatingsTotal && <span className="text-xs text-gray-500">({userRatingsTotal})</span>}
                        </div>
                    )}

                    {openNow !== undefined && (
                        <div className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openNow ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={11} />
                            <span>{openNow ? "Available" : "Closed"}</span>
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">SERVICES:</p>
                    <div className="flex flex-wrap gap-1.5">
                        {CHOREO_SERVICES.slice(0, 4).map((service, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-rose-100 text-rose-600 text-[11px] font-medium px-2 py-1 rounded">
                                <CheckCircle size={11} />
                                {service}
                            </span>
                        ))}
                        {CHOREO_SERVICES.length > 4 && (
                            <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                                +{CHOREO_SERVICES.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
                    >
                        <Navigation size={14} />
                        Directions
                    </button>

                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-rose-600 bg-rose-50 text-rose-600 text-xs font-bold py-2.5 rounded-lg hover:bg-rose-100 transition-all active:scale-95"
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

const NearbyChoreographerCard: React.FC<Props> = (props) => {
    if (!props.job) {
        // Render grid of dummy choreographers
        const dummyJobs = Object.keys(CHOREO_IMAGES_MAP).map((id) => ({
            id,
            title: `Choreographer ${id.split("_")[1]}`,
            location: "City Center",
            distance: Math.random() * 10,
            description: "Professional choreography services for weddings and events.",
            jobData: {
                rating: 4 + Math.random(),
                user_ratings_total: Math.floor(Math.random() * 50),
                opening_hours: { open_now: true },
                special_tags: ["Popular", "Verified", "Experienced"],
            },
        }));

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {dummyJobs.map((job) => (
                    <SingleChoreographerCard key={job.id} job={job} onViewDetails={props.onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleChoreographerCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyChoreographerCard;
