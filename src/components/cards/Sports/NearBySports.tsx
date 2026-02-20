import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    ChevronLeft,
    ChevronRight,
    CheckCircle,
} from "lucide-react";

/* ================= TYPES ================= */

export interface SportsClubService {
    place_id: string;
    name: string;
    vicinity: string;
    rating: number;
    user_ratings_total: number;
    geometry: {
        location: { lat: number; lng: number };
    };
    opening_hours: { open_now: boolean };
    special_tags: string[];
    distance: number;
}

interface SportsJob {
    id: string;
    title: string;
    location: string;
    distance: number;
    jobData: SportsClubService;
}

interface NearbySportsCardProps {
    job?: SportsJob;
    onViewDetails: (job: SportsJob) => void;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    sports_1: "07947413381",
    sports_2: "07947125533",
    sports_3: "07947114382",
};

export const DUMMY_SPORTS_CLUBS: SportsClubService[] = [
    {
        place_id: "sports_1",
        name: "Skykings Football Academy",
        vicinity: "Bowenpally, Hyderabad",
        rating: 4.6,
        user_ratings_total: 964,
        geometry: { location: { lat: 17.4856, lng: 78.4592 } },
        opening_hours: { open_now: true },
        special_tags: ["Popular", "Football Training", "Verified"],
        distance: 2.2,
    },
    {
        place_id: "sports_2",
        name: "Blue Bird Taekwondo Academy",
        vicinity: "HAL Colony, Hyderabad",
        rating: 4.9,
        user_ratings_total: 198,
        geometry: { location: { lat: 17.4523, lng: 78.4712 } },
        opening_hours: { open_now: true },
        special_tags: ["Trending", "Certified Coaches"],
        distance: 1.8,
    },
    {
        place_id: "sports_3",
        name: "Kiran Badminton Arena",
        vicinity: "IDPL, Hyderabad",
        rating: 4.4,
        user_ratings_total: 134,
        geometry: { location: { lat: 17.4399, lng: 78.4983 } },
        opening_hours: { open_now: false },
        special_tags: ["Top Rated", "Indoor Courts"],
        distance: 1.0,
    },
];

const SPORTS_IMAGES_MAP: Record<string, string[]> = {
    sports_1: [
        "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800",
        "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800",
    ],
    sports_2: [
        "https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800",
        "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800",
    ],
    sports_3: [
        "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
        "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800",
    ],
};

const SPORTS_DESCRIPTIONS_MAP: Record<string, string> = {
    sports_1:
        "Popular football academy with professional coaching and structured training programs.",
    sports_2:
        "Certified taekwondo academy with disciplined environment and competition-level training.",
    sports_3:
        "Indoor badminton arena with premium courts and flexible training schedules.",
};

const SPORTS_SERVICES = [
    "Professional Coaching",
    "Indoor Courts",
    "Group Training",
    "Personal Training",
];

/* ================= SINGLE CARD ================= */

const SingleSportsCard: React.FC<{
    job: SportsJob;
    onViewDetails: (job: SportsJob) => void;
}> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = SPORTS_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((p) => (p + 1) % photos.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((p) => (p - 1 + photos.length) % photos.length);
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const { lat, lng } = job.jobData.geometry.location;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col overflow-hidden"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img
                            src={currentPhoto}
                            alt={job.title}
                            className="w-full h-full object-cover"
                        />
                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrev}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                                >
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="h-full flex items-center justify-center text-5xl">
                        ⚽
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
                    {job.title}
                </h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{job.location}</span>
                </div>

                <p className="text-xs font-semibold text-green-600">
                    {job.distance} km away
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                    {job.jobData.special_tags.map((tag, i) => (
                        <span
                            key={i}
                            className="bg-cyan-100 text-cyan-700 text-xs font-semibold px-2 py-0.5 rounded"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {SPORTS_DESCRIPTIONS_MAP[job.id]}
                </p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-1">
                    <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">
                            {job.jobData.rating.toFixed(1)}
                        </span>
                        <span className="text-gray-500">
                            ({job.jobData.user_ratings_total})
                        </span>
                    </div>

                    <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded ${job.jobData.opening_hours.open_now
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        <Clock size={12} />
                        <span className="text-xs font-semibold">
                            {job.jobData.opening_hours.open_now ? "Open" : "Closed"}
                        </span>
                    </div>
                </div>

                {/* Services */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                        Services:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {SPORTS_SERVICES.map((service, i) => (
                            <span
                                key={i}
                                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs"
                            >
                                <CheckCircle size={12} />
                                {service}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg font-semibold"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-50 text-cyan-700 border-2 border-cyan-600 rounded-lg font-semibold"
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= WRAPPER ================= */

const NearbySportsCard: React.FC<NearbySportsCardProps> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {props.job === undefined &&
                    DUMMY_SPORTS_CLUBS.map((club) => (
                        <SingleSportsCard
                            key={club.place_id}
                            job={{
                                id: club.place_id,
                                title: club.name,
                                location: club.vicinity,
                                distance: club.distance,
                                jobData: club,
                            }}
                            onViewDetails={props.onViewDetails}
                        />
                    ))}
            </div>
        );
    }

    return (
        <SingleSportsCard
            job={props.job}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default NearbySportsCard;
