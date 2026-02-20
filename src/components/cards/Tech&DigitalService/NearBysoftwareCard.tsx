import { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
    Star,
    Briefcase,
    Code,
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
    software_1: "09054806188",
    software_2: "08490998730",
    software_3: "08460262053",
    software_4: "09036648642",
};

const IMAGES: Record<string, string[]> = {
    software_1: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    ],
    software_2: [
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
    ],
    software_3: [
        "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800",
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    ],
    software_4: [
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    ],
};

const SERVICES_MAP: Record<string, string[]> = {
    software_1: ["Logistics Software", "Mobile Apps", "Custom Solutions"],
    software_2: ["Web Development", "E-commerce", "Software Solutions"],
    software_3: ["Gaming Platforms", "Digital Marketing", "Custom Software"],
    software_4: ["Enterprise Software", "Web Apps", "Mobile Apps"],
};

/* ================= DUMMY DATA ================= */

const DUMMY_SOFTWARE: JobType[] = [
    {
        id: "software_1",
        title: "Growmoon",
        location: "Surat • Also serves Hyderabad",
        distance: 750,
        category: "Software Development",
        description:
            "Verified software development company specializing in logistics and mobile applications.",
        jobData: {
            rating: 4.9,
            user_ratings_total: 66,
            geometry: { location: { lat: 21.1702, lng: 72.8311 } },
        },
    },
    {
        id: "software_2",
        title: "Vilora Technologies",
        location: "Pondicherry • Also serves Hyderabad",
        distance: 620,
        category: "Software Development",
        description:
            "Trending software company delivering web and e-commerce solutions.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 67,
            geometry: { location: { lat: 11.9416, lng: 79.8083 } },
        },
    },
    {
        id: "software_3",
        title: "Tslgc Services Pvt Ltd",
        location: "Allahabad • Also serves Hyderabad",
        distance: 1100,
        category: "Software Development",
        description:
            "Trusted and popular software company with gaming and digital solutions.",
        jobData: {
            rating: 5.0,
            user_ratings_total: 736,
            geometry: { location: { lat: 25.4358, lng: 81.8463 } },
        },
    },
    {
        id: "software_4",
        title: "Soft INDIA",
        location: "Delhi • Also serves Hyderabad",
        distance: 1500,
        category: "Software Development",
        description:
            "14 years of experience in enterprise software and mobile development.",
        jobData: {
            rating: 4.4,
            user_ratings_total: 67,
            geometry: { location: { lat: 28.7041, lng: 77.1025 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleSoftwareCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES[job.id] || IMAGES["software_1"],
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
            <div className="relative h-48">
                <img src={photos[index]} className="w-full h-full object-cover" />

                {index > 0 && (
                    <button
                        onClick={e => { e.stopPropagation(); prev(); }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}

                {index < photos.length - 1 && (
                    <button
                        onClick={e => { e.stopPropagation(); next(); }}
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
            <div className="p-4 space-y-2 flex flex-col flex-grow">
                <h3 className="text-lg font-bold">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                {job.distance && (
                    <p className="text-indigo-600 text-sm font-semibold">
                        {Number(job.distance).toLocaleString()} km away
                    </p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3">
                    {job.description}
                </p>

                {/* Rating */}
                {rating && (
                    <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="text-yellow-400" />
                        <span className="font-semibold">{rating}</span>
                        {reviews && <span className="text-gray-500">({reviews})</span>}
                    </div>
                )}

                {/* Services */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {(SERVICES_MAP[job.id] || []).slice(0, 3).map(service => (
                        <span
                            key={service}
                            className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded flex items-center gap-1"
                        >
                            <Code size={12} />
                            {service}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={e => { e.stopPropagation(); openMaps(); }}
                        className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50"
                    >
                        Directions
                    </button>

                    <button
                        onClick={e => { e.stopPropagation(); callNow(); }}
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

/* ================= LIST WRAPPER ================= */

const NearbySoftwareCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_SOFTWARE.map(item => (
                    <SingleSoftwareCard
                        key={item.id}
                        job={item}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleSoftwareCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbySoftwareCard;
