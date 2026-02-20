import { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
    Star,
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
    decorator_1: "08904402330",
    decorator_2: "08460493840",
    decorator_3: "07942687151",
    decorator_4: "07947123456",
};

const IMAGES: Record<string, string[]> = {
    decorator_1: [
        "https://images.unsplash.com/photo-1519167758481-83f29da8c6b7?w=800",
        "https://images.unsplash.com/photo-1464347744102-11db6282f854?w=800",
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
    ],
    decorator_2: [
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
        "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
        "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800",
    ],
    decorator_3: [
        "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=800",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
        "https://images.unsplash.com/photo-1464347744102-11db6282f854?w=800",
    ],
    decorator_4: [
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800",
        "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
    ],
};

const SERVICES = [
    "Mandap Decoration",
    "Flower Decoration",
    "Wedding Events",
    "Stage Setup",
];

/* ================= DUMMY DATA (LIKE BAKERY) ================= */

const DUMMY_MANDAP_DECORATORS: JobType[] = [
    {
        id: "decorator_1",
        title: "Royal Mandap Decorators",
        location: "MG Road, Bangalore",
        distance: 0.8,
        description: "Luxury wedding mandap and floral decoration services.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 160,
            geometry: { location: { lat: 12.9716, lng: 77.5946 } },
        },
    },
    {
        id: "decorator_2",
        title: "Dream Wedding Decors",
        location: "Whitefield, Bangalore",
        distance: 1.6,
        description: "Traditional and modern mandap setups for all occasions.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 120,
            geometry: { location: { lat: 12.9698, lng: 77.7500 } },
        },
    },
    {
        id: "decorator_3",
        title: "Shree Events & Mandap",
        location: "Yelahanka, Bangalore",
        distance: 2.4,
        description: "Affordable mandap decoration with premium designs.",
        jobData: {
            rating: 4.7,
            user_ratings_total: 95,
            geometry: { location: { lat: 13.1007, lng: 77.5963 } },
        },
    },
    {
        id: "decorator_4",
        title: "Elite Wedding Creations",
        location: "JP Nagar, Bangalore",
        distance: 3.1,
        description: "Customized wedding themes and stage decoration.",
        jobData: {
            rating: 4.9,
            user_ratings_total: 210,
            geometry: { location: { lat: 12.9077, lng: 77.5859 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleMandapCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES[job.id] || IMAGES["decorator_1"],
        [job.id]
    );

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
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
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden h-full flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48 shrink-0">
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
            <div className="p-4 space-y-2 flex-grow flex flex-col">
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

                {/* Rating */}
                {rating && (
                    <div className="flex items-center gap-1 text-sm pt-2">
                        <Star size={14} className="text-yellow-400" />
                        <span className="font-semibold">{rating}</span>
                        {reviews && (
                            <span className="text-gray-500">({reviews})</span>
                        )}
                    </div>
                )}

                {/* Services */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {SERVICES.slice(0, 3).map(service => (
                        <span
                            key={service}
                            className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded"
                        >
                            {service}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); openMaps(); }}
                        className="flex-1 border border-purple-600 text-purple-600 py-2 rounded-lg font-semibold hover:bg-purple-50"
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

/* ================= WRAPPER ================= */

const NearbyMandapCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_MANDAP_DECORATORS.map((decorator) => (
                    <SingleMandapCard
                        key={decorator.id}
                        job={decorator}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SingleMandapCard
            job={props.job}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default NearbyMandapCard;
