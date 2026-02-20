import { useState, useMemo } from "react";
import { MapPin, Phone, ChevronLeft, ChevronRight, Star, Clock } from "lucide-react";

// src/types/job.ts
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

/* ---------------------------------- DATA --------------------------------- */

const PHONE_MAP: Record<string, string> = {
    bakery_1: "07947424679",
    bakery_2: "07947103301",
    bakery_3: "07947148181",
    bakery_4: "07947143966",
};

const IMAGES: Record<string, string[]> = {
    bakery_1: [
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800",
        "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800",
        "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800",
    ],
    bakery_2: [
        "https://images.unsplash.com/photo-1558326567-98ae2405596b?w=800",
        "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800",
        "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800",
    ],
    bakery_3: [
        "https://images.unsplash.com/photo-1506224772180-d75b3efbe9be?w=800",
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
    ],
    bakery_4: [
        "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=800",
        "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800",
        "https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800",
    ],
};

const SERVICES = ["Dine-in", "Takeaway", "Custom Orders", "Party Orders"];

/* -------------------------------- COMPONENT -------------------------------- */

// Dummy Data
const DUMMY_BAKERIES: JobType[] = [
    {
        id: "bakery_1",
        title: "Golden Crust Bakery",
        location: "123 Baker St, London",
        distance: 0.5,
        category: "Bakery",
        description: "Authentic sourdough and pastries served fresh daily.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 120,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 51.5074, lng: -0.1278 } }
        }
    },
    {
        id: "bakery_2",
        title: "Sweet Delights",
        location: "45 Oxford St, London",
        distance: 1.2,
        category: "Bakery",
        description: "Famous for cupcakes and celebration cakes.",
        jobData: {
            rating: 4.5,
            user_ratings_total: 85,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 51.5154, lng: -0.1418 } }
        }
    },
    {
        id: "bakery_3",
        title: "The French Oven",
        location: "10 Downing St, London",
        distance: 2.0,
        category: "Bakery",
        description: "Classic French baguettes and croissants.",
        jobData: {
            rating: 4.9,
            user_ratings_total: 210,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 51.5034, lng: -0.1276 } }
        }
    },
    {
        id: "bakery_4",
        title: "Hot Buns",
        location: "Hyde Park, London",
        distance: 3.5,
        category: "Bakery",
        description: "Warm buns and coffee on the go.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 150,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 51.5073, lng: -0.1657 } }
        }
    }
];

const SingleBakerCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES[job.id] || IMAGES["bakery_1"],
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
                    {SERVICES.slice(0, 3).map(service => (
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

const NearbyBakersCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_BAKERIES.map((bakery) => (
                    <SingleBakerCard
                        key={bakery.id}
                        job={bakery}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleBakerCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyBakersCard;
