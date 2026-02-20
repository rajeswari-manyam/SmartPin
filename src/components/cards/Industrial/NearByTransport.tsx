import { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
    Star,
    Truck,
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
    transporter_1: "08105071854",
    transporter_2: "08460563894",
    transporter_3: "07411583051",
    transporter_4: "08460468899",
    transporter_5: "09876543210",
};

const IMAGES: Record<string, string[]> = {
    transporter_1: [
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800",
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
    ],
    transporter_2: [
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800",
    ],
    transporter_3: [
        "https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=800",
    ],
    transporter_4: [
        "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=800",
    ],
    transporter_5: [
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
    ],
};

const SERVICES = [
    "Goods Transport",
    "Vehicle Transport",
    "Door to Door",
    "All India Service",
];

export const DUMMY_TRANSPORTERS = [
    {
        place_id: "transporter_1",
        name: "Govind Goods Carrier",
        vicinity: "Hyderabad",
        rating: 4.8,
        user_ratings_total: 21,
        distance: 1.6,
        geometry: { location: { lat: 17.385, lng: 78.4867 } },
    },
    {
        place_id: "transporter_2",
        name: "Fr8",
        vicinity: "Hyderabad",
        rating: 4.6,
        user_ratings_total: 23,
        distance: 15.1,
        geometry: { location: { lat: 17.39, lng: 78.49 } },
    },
    {
        place_id: "transporter_3",
        name: "Golconda Transport Services",
        vicinity: "Hyderabad",
        rating: 4.3,
        user_ratings_total: 6,
        distance: 18.7,
        geometry: { location: { lat: 17.4, lng: 78.5 } },
    },
];

/* ================= CARD ================= */

const SingleTransporterCard: React.FC<Props> = ({
    job,
    onViewDetails,
}) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => job ? (IMAGES[job.id] || IMAGES["transporter_1"]) : [],
        [job]
    );

    if (!job) return null;

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
                    <div className="flex items-center gap-1 text-sm">
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

/* ================= GRID ================= */

const NearbyTransportersCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_TRANSPORTERS.map((t) => (
                    <SingleTransporterCard
                        key={t.place_id}
                        job={{
                            id: t.place_id,
                            title: t.name,
                            location: t.vicinity,
                            distance: t.distance,
                            description: "Professional transport and logistics services for all your goods carrier needs.",
                            jobData: {
                                rating: t.rating,
                                user_ratings_total: t.user_ratings_total,
                                geometry: t.geometry,
                            },
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SingleTransporterCard
            job={props.job}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default NearbyTransportersCard;
