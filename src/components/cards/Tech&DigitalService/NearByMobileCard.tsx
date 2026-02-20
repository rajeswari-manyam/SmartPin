import { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    ShieldCheck,
    CheckCircle,
    Flame,
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title: string;
    location?: string;
    description?: string;
    distance?: number | string;
    jobData?: any;
}

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

/* ================= DATA ================= */

const PHONE_MAP: Record<string, string> = {
    mobile_repair_1: "08197757934",
    mobile_repair_2: "09008470462",
    mobile_repair_3: "08401077941",
    mobile_repair_4: "09393500011",
};

const IMAGES: Record<string, string[]> = {
    mobile_repair_1: [
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800",
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
    ],
    mobile_repair_2: [
        "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800",
        "https://images.unsplash.com/photo-1609921141835-710b7fa6e438?w=800",
    ],
    mobile_repair_3: [
        "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800",
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=800",
    ],
    mobile_repair_4: [
        "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
        "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800",
    ],
};

const SERVICES: Record<string, string[]> = {
    mobile_repair_1: ["Screen Replacement", "Battery Fix", "Genuine Parts"],
    mobile_repair_2: ["Unlock Services", "Accessories", "Quick Repair"],
    mobile_repair_3: ["Software Fix", "Hardware Repair", "Fast Service"],
    mobile_repair_4: ["Apple Specialist", "Samsung Repair", "Data Recovery"],
};

const BADGES: Record<string, string[]> = {
    mobile_repair_1: ["Trust", "Verified"],
    mobile_repair_2: ["Trending"],
    mobile_repair_3: ["Top Rated", "Verified"],
    mobile_repair_4: ["Verified"],
};

/* ================= DUMMY DATA ================= */

const DUMMY_MOBILE_REPAIRS: JobType[] = [
    {
        id: "mobile_repair_1",
        title: "Crackfix Mobile Repair",
        location: "Abids, Hyderabad",
        distance: 8.2,
        description: "Expert mobile screen & battery replacement with genuine parts.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 532,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.385, lng: 78.4867 } },
        },
    },
    {
        id: "mobile_repair_2",
        title: "Deepak Telecom",
        location: "Abids, Hyderabad",
        distance: 8.5,
        description: "Mobile unlocking, repairs & accessories under one roof.",
        jobData: {
            rating: 4.3,
            user_ratings_total: 15,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.384, lng: 78.485 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleMobileRepairCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES[job.id] || IMAGES["mobile_repair_1"],
        [job.id]
    );

    const phone = PHONE_MAP[job.id];
    const services = SERVICES[job.id] || [];
    const badges = BADGES[job.id] || [];

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;

    const lat = job.jobData?.geometry?.location?.lat;
    const lng = job.jobData?.geometry?.location?.lng;

    const openMaps = () => {
        if (!lat || !lng) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    const callNow = () => phone && (window.location.href = `tel:${phone}`);

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48">
                <img
                    src={photos[index]}
                    alt={job.title}
                    className="w-full h-full object-cover"
                />

                {index > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index - 1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}

                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{photos.length}
                </span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex flex-col flex-grow">
                <h3 className="text-lg font-bold">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                {job.distance && (
                    <p className="text-green-600 text-sm font-semibold">
                        {Number(job.distance).toFixed(1)} km away
                    </p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {job.description}
                </p>

                {/* Rating + Status */}
                <div className="flex items-center gap-3 text-sm">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            <span className="text-gray-500">({reviews})</span>
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <span
                            className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1
              ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                            <Clock size={12} />
                            {isOpen ? "Open" : "Closed"}
                        </span>
                    )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {badges.map((b) => (
                        <span
                            key={b}
                            className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700"
                        >
                            {b === "Trust" && <ShieldCheck size={12} />}
                            {b === "Verified" && <CheckCircle size={12} />}
                            {b === "Trending" && <Flame size={12} />}
                            {b}
                        </span>
                    ))}
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                        <span
                            key={s}
                            className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded"
                        >
                            {s}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            openMaps();
                        }}
                        className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50"
                    >
                        Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            callNow();
                        }}
                        className="flex-1 bg-green-100 text-green-700 border border-green-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= GRID WRAPPER ================= */

const NearbyMobileRepairCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_MOBILE_REPAIRS.map((item) => (
                    <SingleMobileRepairCard
                        key={item.id}
                        job={item}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleMobileRepairCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyMobileRepairCard;
