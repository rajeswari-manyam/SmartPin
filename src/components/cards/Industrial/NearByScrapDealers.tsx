import { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    Recycle,
} from "lucide-react";

/* ================= TYPES ================= */

export interface ScrapDealer {
    id: string;
    title: string;
    location?: string;
    description?: string;
    distance?: number | string;
    category?: string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
    };
}

interface Props {
    job?: ScrapDealer;
    onViewDetails: (job: ScrapDealer) => void;
}

/* ================= DATA ================= */

const PHONE_MAP: Record<string, string> = {
    scrap_1: "07487048982",
    scrap_2: "08197398429",
    scrap_3: "07022618864",
};

const IMAGES: Record<string, string[]> = {
    scrap_1: [
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
        "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800",
    ],
    scrap_2: [
        "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800",
        "https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=800",
    ],
    scrap_3: [
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800",
    ],
};

const SERVICES = [
    "Metal Scrap",
    "Battery Scrap",
    "E-Waste",
    "Quick Pickup",
];

/* ================= DUMMY DATA ================= */

export const DUMMY_SCRAP_DEALERS: ScrapDealer[] = [
    {
        id: "scrap_1",
        title: "RK Scrap Dealers",
        location: "Kukatpally, Hyderabad",
        distance: 5.2,
        description: "Professional scrap collection & recycling services.",
        category: "Scrap Dealer",
        jobData: {
            rating: 4.5,
            user_ratings_total: 89,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4485, lng: 78.3908 } },
        },
    },
    {
        id: "scrap_2",
        title: "Sri Sai Scrap Buyers",
        location: "Miyapur, Hyderabad",
        distance: 7.8,
        description: "Best prices for metal, battery & e-waste scrap.",
        category: "Scrap Dealer",
        jobData: {
            rating: 4.3,
            user_ratings_total: 45,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.495, lng: 78.358 } },
        },
    },
    {
        id: "scrap_3",
        title: "Green Recycling Center",
        location: "ECIL, Hyderabad",
        distance: 12.4,
        description: "Eco-friendly certified recycling center.",
        category: "Scrap Dealer",
        jobData: {
            rating: 4.7,
            user_ratings_total: 156,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 17.485, lng: 78.487 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleScrapDealerCard: React.FC<{
    job: ScrapDealer;
    onViewDetails: (job: ScrapDealer) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES[job.id] || IMAGES["scrap_1"],
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
            {/* Image Carousel */}
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

                <p className="text-sm text-gray-600 line-clamp-3">
                    {job.description}
                </p>

                {/* Rating + Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            {reviews && (
                                <span className="text-gray-500">({reviews})</span>
                            )}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <span
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
              ${isOpen
                                    ? "bg-green-100 text-green-700"
                                    : "bg-red-100 text-red-700"}`}
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
                            className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded flex items-center gap-1"
                        >
                            <Recycle size={12} />
                            {service}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); openMaps(); }}
                        className="flex-1 border border-green-600 text-green-700 py-2 rounded-lg font-semibold hover:bg-green-50"
                    >
                        Get Location
                    </button>

                    <div
                        onClick={(e) => { e.stopPropagation(); phone && callNow(); }}
                        className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2
            ${phone
                                ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    >
                        <Phone size={16} />
                        {phone || "No Number"}
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ================= LIST WRAPPER ================= */

const NearbyScrapDealerCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_SCRAP_DEALERS.map(dealer => (
                    <SingleScrapDealerCard
                        key={dealer.id}
                        job={dealer}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SingleScrapDealerCard
            job={props.job}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default NearbyScrapDealerCard;
