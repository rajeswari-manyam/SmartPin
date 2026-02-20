import { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    Laptop
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
    laptop_repair_1: "08197703984",
    laptop_repair_2: "09980204860",
    laptop_repair_3: "09724797922",
    laptop_repair_4: "08792484622",
};

const IMAGES: Record<string, string[]> = {
    laptop_repair_1: [
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800",
        "https://images.unsplash.com/photo-1593642532400-2682810df593?w=800",
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
    ],
    laptop_repair_2: [
        "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    ],
    laptop_repair_3: [
        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
        "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800",
    ],
    laptop_repair_4: [
        "https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=800",
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800",
    ],
};

const SERVICES_MAP: Record<string, string[]> = {
    laptop_repair_1: ["Laptop Repair", "Screen Replacement", "Accessories", "Data Recovery"],
    laptop_repair_2: ["Computer Repair", "Hardware Fix", "Maintenance"],
    laptop_repair_3: ["AMC Services", "Accessory Repair", "Tech Support"],
    laptop_repair_4: ["Laptop Repair", "Quick Turnaround", "Expert Service"],
};

/* ================= DUMMY DATA ================= */

const DUMMY_LAPTOPS: JobType[] = [
    {
        id: "laptop_repair_1",
        title: "Laptop Store",
        location: "Vivek Nagar Kukatpally, Hyderabad",
        distance: 4.9,
        description: "Trusted and verified laptop repair services with genuine parts.",
        category: "Laptop Repair",
        jobData: {
            rating: 4.5,
            user_ratings_total: 1888,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.485, lng: 78.3967 } }
        }
    },
    {
        id: "laptop_repair_2",
        title: "Citrix Laptop & Computer Solutions",
        location: "Suchitra Cross Road, Hyderabad",
        distance: 4.5,
        description: "Professional laptop and computer repair solutions.",
        category: "Laptop Repair",
        jobData: {
            rating: 4.4,
            user_ratings_total: 27,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.534, lng: 78.485 } }
        }
    },
];

/* ================= SINGLE CARD ================= */

const SingleLaptopRepairCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES[job.id] || IMAGES["laptop_repair_1"],
        [job.id]
    );

    const phone = PHONE_MAP[job.id];
    const services = SERVICES_MAP[job.id] || [];

    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;

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
                <img
                    src={photos[index]}
                    alt={job.title}
                    className="w-full h-full object-cover"
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
            <div className="p-4 space-y-2 flex flex-col flex-grow">
                <h3 className="text-lg font-bold">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                {job.distance && (
                    <p className="text-blue-600 text-sm font-semibold">
                        {Number(job.distance).toFixed(1)} km away
                    </p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3">
                    {job.description}
                </p>

                {/* Rating + Status */}
                <div className="flex items-center gap-3 text-sm pt-1">
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
                    {services.slice(0, 3).map(service => (
                        <span
                            key={service}
                            className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
                        >
                            {service}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button
                        onClick={(e) => { e.stopPropagation(); openMaps(); }}
                        className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50"
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

const NearbyLaptopRepairCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_LAPTOPS.map(item => (
                    <SingleLaptopRepairCard
                        key={item.id}
                        job={item}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleLaptopRepairCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyLaptopRepairCard;
