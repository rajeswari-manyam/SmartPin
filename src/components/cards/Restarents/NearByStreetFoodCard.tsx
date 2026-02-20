import React, { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    Utensils,
    CheckCircle
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title?: string;
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

/* ================= CONSTANT DATA ================= */

const PHONE_MAP: Record<string, string> = {
    streetfood_1: "07942696526",
    streetfood_2: "07942687270",
    streetfood_3: "07942696227",
    streetfood_4: "07947148410",
};

const STREETFOOD_IMAGES: Record<string, string[]> = {
    streetfood_1: [
        "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
        "https://images.unsplash.com/photo-1639024471283-03518883512d?w=800",
        "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800",
    ],
    streetfood_2: [
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
        "https://images.unsplash.com/photo-1626132647523-66f5bf380027?w=800",
        "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800",
    ],
    streetfood_3: [
        "https://images.unsplash.com/photo-1562967914-608f82629710?w=800",
        "https://images.unsplash.com/photo-1604908815108-fdbd32b5cab5?w=800",
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800",
    ],
    streetfood_4: [
        "https://images.unsplash.com/photo-1601050690117-f4fca0f5c16d?w=800",
        "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800",
        "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=800",
    ],
};

const SERVICES = ["Takeaway", "Quick Service", "Street Side", "Cash Only"];

/* ================= COMPONENT ================= */

// Dummy Data
const DUMMY_STREET_FOOD: JobType[] = [
    {
        id: "streetfood_1",
        title: "Spicy Bites",
        location: "123 Street Food Avenue",
        distance: 0.3,
        category: "Street Food",
        description: "Famous for spicy rolls and chaat.",
        jobData: {
            rating: 4.7,
            user_ratings_total: 230,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.7041, lng: 77.1025 } }
        }
    },
    {
        id: "streetfood_2",
        title: "Burger Point",
        location: "45 Fast Lane",
        distance: 1.5,
        category: "Street Food",
        description: "Best burgers in town.",
        jobData: {
            rating: 4.4,
            user_ratings_total: 180,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.6139, lng: 77.2090 } }
        }
    },
    {
        id: "streetfood_3",
        title: "Chaat Corner",
        location: "88 Flavor St",
        distance: 2.1,
        category: "Street Food",
        description: "Traditional Indian street food.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 310,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 28.5355, lng: 77.3910 } }
        }
    },
    {
        id: "streetfood_4",
        title: "Rolls & Wraps",
        location: "12 Quick Byte Rd",
        distance: 3.0,
        category: "Street Food",
        description: "Delicious wraps and rolls.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 150,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.4595, lng: 77.0266 } }
        }
    }
];

const SingleStreetFoodCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => STREETFOOD_IMAGES[job.id] || STREETFOOD_IMAGES.streetfood_1,
        [job.id]
    );

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const phone = PHONE_MAP[job.id];
    const lat = job.jobData?.geometry?.location?.lat;
    const lng = job.jobData?.geometry?.location?.lng;

    const distance =
        typeof job.distance === "number"
            ? `${job.distance.toFixed(1)} km away`
            : job.distance;

    const openMaps = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!lat || !lng) return;
        window.open(
            `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
            "_blank"
        );
    };

    const callNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!phone) return;
        window.location.href = `tel:${phone}`;
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden cursor-pointer h-full flex flex-col"
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
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index - 1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
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
                <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                {distance && (
                    <p className="text-green-600 text-sm font-semibold">{distance}</p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
                    {job.description}
                </p>

                {/* Category */}
                <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-1 rounded mt-2">
                    <Utensils size={12} />
                    {job.category || "Street Food"}
                </div>

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
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 mb-1">SERVICES:</p>
                    <div className="flex flex-wrap gap-2">
                        {SERVICES.slice(0, 3).map((service) => (
                            <span
                                key={service}
                                className="flex items-center gap-1 bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded"
                            >
                                <CheckCircle size={12} />
                                {service}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={openMaps}
                        className="flex-1 border-2 border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50 flex justify-center gap-2"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>

                    <button
                        onClick={callNow}
                        disabled={!phone}
                        className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2
              ${phone
                                ? "bg-green-100 text-green-700 border-2 border-green-600 hover:bg-green-200"
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

const NearbyStreetFoodCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_STREET_FOOD.map((item) => (
                    <SingleStreetFoodCard
                        key={item.id}
                        job={item}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleStreetFoodCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyStreetFoodCard;
