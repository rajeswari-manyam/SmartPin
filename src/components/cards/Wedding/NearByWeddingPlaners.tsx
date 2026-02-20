import React, { useState, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
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
    planner_1: "08123899181",
    planner_2: "07490802642",
    planner_3: "09980828067",
    planner_4: "09054326242",
};

const IMAGES_MAP: Record<string, string[]> = {
    planner_1: [
        "https://images.unsplash.com/photo-1519167758481-83f29da8c2b1?w=800",
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    ],
    planner_2: [
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800",
        "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800",
    ],
    planner_3: [
        "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
        "https://images.unsplash.com/photo-1507504031003-b417219a0fde?w=800",
        "https://images.unsplash.com/photo-1545972154-9bb223aac798?w=800",
    ],
    planner_4: [
        "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=800",
        "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800",
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?w=800",
    ],
};

const DUMMY_PLANNERS: JobType[] = [
    {
        id: "planner_1",
        title: "Sri Vedhika Events",
        location: "Nagole Main Road, Hyderabad",
        distance: 2.4,
        description:
            "Complete wedding planning services with banquet hall and car decoration.",
        category: "Wedding Planner",
        jobData: {
            rating: 5.0,
            user_ratings_total: 5,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.3616, lng: 78.5506 } },
            specializations: ["Banquet Decoration", "Car Decoration"],
        },
    },
    {
        id: "planner_2",
        title: "3nethra Events",
        location: "Vidya Nagar, Hyderabad",
        distance: 11.7,
        description:
            "Award-winning wedding planners with photo booths and stage décor.",
        category: "Wedding Planner",
        jobData: {
            rating: 4.5,
            user_ratings_total: 72,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4941, lng: 78.3915 } },
            specializations: ["Photo Booth", "Stage Decoration"],
        },
    },
    {
        id: "planner_3",
        title: "Ethnic Events",
        location: "Adikmet, Hyderabad",
        distance: 11.2,
        description:
            "Trending wedding and birthday event organizers with ethnic themes.",
        category: "Wedding Planner",
        jobData: {
            rating: 4.3,
            user_ratings_total: 3,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4785, lng: 78.4095 } },
            specializations: ["Wedding Themes", "Birthday Events"],
        },
    },
    {
        id: "planner_4",
        title: "Eventina",
        location: "Begumpet, Hyderabad",
        distance: 5.9,
        description: "Popular wedding planners with 1600+ reviews and premium décor.",
        category: "Wedding Planner",
        jobData: {
            rating: 5.0,
            user_ratings_total: 1632,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4399, lng: 78.4683 } },
            specializations: ["Premium Décor", "Event Management"],
        },
    },
];

/* ================= CARD COMPONENT ================= */

const SinglePlannerCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [imageIndex, setImageIndex] = useState(0);

    const photos = IMAGES_MAP[job.id] || IMAGES_MAP["planner_1"];
    const phone = PHONE_MAP[job.id];
    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const openNow = job.jobData?.opening_hours?.open_now;
    const tags: string[] = job.jobData?.specializations || [];
    const distanceText =
        job.distance !== undefined ? `${job.distance.toFixed(1)} km away` : "";

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (imageIndex > 0) setImageIndex((p) => p - 1);
    };

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (imageIndex < photos.length - 1) setImageIndex((p) => p + 1);
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!phone) return;
        window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const { lat, lng } = job.jobData?.geometry?.location || {};
        if (lat && lng) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                "_blank"
            );
        }
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer mb-4"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-100">
                <img
                    src={photos[imageIndex]}
                    className="w-full h-full object-cover"
                    alt={job.title}
                />
                {imageIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                    >
                        <ChevronLeft size={20} />
                    </button>
                )}
                {imageIndex < photos.length - 1 && (
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                    >
                        <ChevronRight size={20} />
                    </button>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {imageIndex + 1} / {photos.length}
                </div>
            </div>

            {/* Content */}
            <div className="p-3.5">
                <h3 className="text-[17px] font-bold text-gray-900 line-clamp-2">
                    {job.title}
                </h3>

                <div className="flex items-center text-gray-500 mt-1 mb-1">
                    <MapPin size={14} className="mr-1" />
                    <span className="text-[13px] line-clamp-1">{job.location}</span>
                </div>

                {distanceText && (
                    <p className="text-xs font-semibold text-pink-600 mb-2">
                        {distanceText}
                    </p>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {tags.map((tag) => (
                            <span
                                key={tag}
                                className="bg-pink-100 text-pink-700 text-[10px] font-semibold px-2 py-0.5 rounded"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-[13px] text-gray-600 mb-2 line-clamp-3">
                    {job.description}
                </p>

                <div className="flex items-center gap-2 mb-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[13px] font-semibold">{rating}</span>
                            {reviews && <span className="text-xs text-gray-500">({reviews})</span>}
                        </div>
                    )}

                    {openNow !== undefined && (
                        <span
                            className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${openNow ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={11} className="inline mr-1" />
                            {openNow ? "Open Now" : "Closed"}
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-xs py-2.5 rounded-lg"
                    >
                        <Navigation size={14} /> Directions
                    </button>

                    <button
                        onClick={handleCall}
                        disabled={!phone}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg ${phone
                            ? "border-pink-600 bg-pink-50 text-pink-600"
                            : "border-gray-300 bg-gray-100 text-gray-400"
                            }`}
                    >
                        <Phone size={14} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN ================= */

const NearbyWeddingPlanner: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_PLANNERS.map((planner) => (
                    <SinglePlannerCard
                        key={planner.id}
                        job={planner}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SinglePlannerCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyWeddingPlanner;
