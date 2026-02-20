import React, { useState, useMemo } from "react";
import {
    MapPin,
    Star,
    Clock,
    ChevronLeft,
    ChevronRight,
    Gift,
    CheckCircle,
    Navigation,
    Phone,
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

/* ================= DATA ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    sweet_1: "07795694801",
    sweet_2: "07383050078",
    sweet_3: "07947421154",
    sweet_4: "07947137292",
};

const SWEET_IMAGES_MAP: Record<string, string[]> = {
    sweet_1: [
        "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800",
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
        "https://images.unsplash.com/photo-1618923850107-b5a9c6f17e3e?w=800",
    ],
    sweet_2: [
        "https://images.unsplash.com/photo-1606312619070-d48b4cda1d3c?w=800",
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
        "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800",
    ],
    sweet_3: [
        "https://images.unsplash.com/photo-1618923850107-b5a9c6f17e3e?w=800",
        "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800",
        "https://images.unsplash.com/photo-1606312619070-d48b4cda1d3c?w=800",
    ],
    sweet_4: [
        "https://images.unsplash.com/photo-1606312619070-d48b4cda1d3c?w=800",
        "https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800",
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
    ],
};

const SWEET_DESCRIPTIONS_MAP: Record<string, string> = {
    sweet_1:
        "Premium sweet shop offering authentic homemade sweets and snacks. Open until 10:00 PM.",
    sweet_2:
        "Top-rated sweet shop with 4,000+ reviews. Pure veg sweets. Open until 10:30 PM.",
    sweet_3:
        "Trending shop specializing in ghee-based traditional sweets. Open until 10:00 PM.",
    sweet_4:
        "Extremely popular sweet shop famous for South Indian sweets. Open until 11:00 PM.",
};

const SWEET_SERVICES = [
    "Fresh Sweets",
    "Gift Packs",
    "Online Order",
    "WhatsApp",
    "Pure Veg",
];

/* ================= COMPONENT ================= */

const DUMMY_SWEET_SHOPS: JobType[] = [
    {
        id: "sweet_1",
        title: "Sagar Sweets",
        description: SWEET_DESCRIPTIONS_MAP["sweet_1"],
        location: "123 Sweet Lane, Jaipur",
        distance: 1.2,
        category: "Sweet Shop",
        jobData: {
            rating: 4.8,
            user_ratings_total: 1245,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 26.9124, lng: 75.7873 } },
        },
    },
    {
        id: "sweet_2",
        title: "Bikaner Sweets",
        description: SWEET_DESCRIPTIONS_MAP["sweet_2"],
        location: "45 Dessert Rd, Bikaner",
        distance: 2.5,
        category: "Sweet Shop",
        jobData: {
            rating: 4.9,
            user_ratings_total: 3100,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.0229, lng: 73.3119 } },
        },
    },
    {
        id: "sweet_3",
        title: "Haldiram's",
        description: SWEET_DESCRIPTIONS_MAP["sweet_3"],
        location: "78 Snack Ave, Delhi",
        distance: 3.8,
        category: "Sweet Shop",
        jobData: {
            rating: 4.7,
            user_ratings_total: 5400,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 28.6139, lng: 77.209 } },
        },
    },
    {
        id: "sweet_4",
        title: "Adyar Ananda Bhavan",
        description: SWEET_DESCRIPTIONS_MAP["sweet_4"],
        location: "12 Chennai St, Chennai",
        distance: 4.2,
        category: "Sweet Shop",
        jobData: {
            rating: 4.6,
            user_ratings_total: 2100,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 13.0827, lng: 80.2707 } },
        },
    },
];

/* ================= COMPONENT ================= */

const SingleSweetShopCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({
    job,
    onViewDetails,
}) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => SWEET_IMAGES_MAP[job.id] || SWEET_IMAGES_MAP.sweet_1,
        [job.id]
    );

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const lat = job.jobData?.geometry?.location?.lat;
    const lng = job.jobData?.geometry?.location?.lng;
    const phone = PHONE_NUMBERS_MAP[job.id];

    const distance =
        typeof job.distance === "number"
            ? `${job.distance.toFixed(1)} km away`
            : job.distance;

    const description =
        SWEET_DESCRIPTIONS_MAP[job.id] || job.description || "";

    const closingTime = useMemo(() => {
        if (job.id === "sweet_2") return "22:30";
        if (job.id === "sweet_4") return "23:00";
        return "22:00";
    }, [job.id]);

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
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden h-full flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48 shrink-0">
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

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{description}</p>

                {/* Category */}
                <div className="inline-flex items-center gap-1 bg-pink-50 text-pink-600 text-xs font-semibold px-2 py-1 rounded mt-2">
                    <Gift size={12} />
                    {job.category || "Sweet Shop"}
                </div>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            {reviews && <span className="text-gray-500">({reviews})</span>}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
              ${isOpen
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            {isOpen ? `Open · Until ${closingTime}` : "Closed"}
                        </span>
                    )}
                </div>

                {/* Services */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 mb-1">SERVICES:</p>
                    <div className="flex flex-wrap gap-2">
                        {SWEET_SERVICES.slice(0, 3).map((service) => (
                            <span
                                key={service}
                                className="flex items-center gap-1 bg-pink-50 text-pink-600 text-xs px-2 py-1 rounded"
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
                        className={`flex-1 py-2 rounded-lg font-semibold flex justify-center gap-2
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

const NearbySweetShopCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_SWEET_SHOPS.map((shop) => (
                    <SingleSweetShopCard
                        key={shop.id}
                        job={shop}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleSweetShopCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbySweetShopCard;
