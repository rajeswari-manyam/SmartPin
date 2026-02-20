import { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title: string;
    location?: string;
    description?: string;
    distance?: number | string;
    category?: string;
    jobData?: any;
}

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

/* ================= DATA ================= */

const PHONE_MAP: Record<string, string> = {
    organizer_1: "08732922683",
    organizer_2: "08128589281",
    organizer_3: "08401702565",
    organizer_4: "09980778189",
    organizer_5: "09876543210",
};

const IMAGES: Record<string, string[]> = {
    organizer_1: [
        "https://images.unsplash.com/photo-1519167758481-83f29da8ea19?w=800",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
    ],
    organizer_2: [
        "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800",
        "https://images.unsplash.com/photo-1519167758481-83f29da8ea19?w=800",
    ],
    organizer_3: [
        "https://images.unsplash.com/photo-1530023367847-a683933f4172?w=800",
    ],
    organizer_4: [
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
    ],
    organizer_5: [
        "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_EVENT_ORGANIZERS: JobType[] = [
    {
        id: "organizer_1",
        title: "Manisha Events",
        location: "Padma Nagar, Secunderabad",
        distance: 6.5,
        description: "Birthday & balloon decoration specialists.",
        category: "Event Organizer",
        jobData: {
            rating: 4.6,
            user_ratings_total: 10,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4435, lng: 78.4869 } },
            services: ["Birthday Decor", "Balloon Decor"],
        },
    },
    {
        id: "organizer_2",
        title: "Rose Wonders",
        location: "Jubilee Hills, Hyderabad",
        distance: 7.5,
        description: "Premium wedding & theme events.",
        category: "Event Organizer",
        jobData: {
            rating: 4.8,
            user_ratings_total: 151,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4325, lng: 78.4125 } },
            services: ["Wedding Decor", "Theme Events"],
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleEventOrganizerCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES[job.id] || IMAGES["organizer_1"],
        [job.id]
    );

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const phone = PHONE_MAP[job.id];

    const lat = job.jobData?.geometry?.location?.lat;
    const lng = job.jobData?.geometry?.location?.lng;

    const next = () => index < photos.length - 1 && setIndex(i => i + 1);
    const prev = () => index > 0 && setIndex(i => i - 1);

    const openMaps = () => {
        if (!lat || !lng) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    const callNow = () => {
        if (!phone) return;
        window.location.href = `tel:${phone}`;
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col"
        >
            {/* Image */}
            <div className="relative h-48">
                <img
                    src={photos[index]}
                    className="w-full h-full object-cover"
                    alt={job.title}
                />

                {index > 0 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}

                {index < photos.length - 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}

                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}/{photos.length}
                </span>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
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
                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            {reviews && <span className="text-gray-500">({reviews})</span>}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
              ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                            <Clock size={12} />
                            {isOpen ? "Open" : "Closed"}
                        </span>
                    )}
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {(job.jobData?.services || []).slice(0, 3).map((service: string) => (
                        <span
                            key={service}
                            className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded"
                        >
                            {service}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); openMaps(); }}
                        className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50"
                    >
                        Directions
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); callNow(); }}
                        disabled={!phone}
                        className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2
              ${phone
                                ? "bg-green-100 text-green-700 border border-green-600 hover:bg-green-200"
                                : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= MAIN GRID ================= */

const NearbyEventOrganizersCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_EVENT_ORGANIZERS.map((org) => (
                    <SingleEventOrganizerCard
                        key={org.id}
                        job={org}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleEventOrganizerCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyEventOrganizersCard;
