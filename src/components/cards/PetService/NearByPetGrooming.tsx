import { useState, useMemo } from "react";
import { MapPin, Phone, ChevronLeft, ChevronRight, Star, Clock } from "lucide-react";

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
    pet_1: "9876543210",
    pet_2: "9123456789",
    pet_3: "9988776655",
    pet_4: "9090909090",
};

const IMAGES: Record<string, string[]> = {
    pet_1: [
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
        "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=800",
    ],
    pet_2: [
        "https://images.unsplash.com/photo-1601758123927-1961a0e09cf1?w=800",
        "https://images.unsplash.com/photo-1596495577886-d920f1fb7238?w=800",
    ],
    pet_3: [
        "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800",
        "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800",
    ],
    pet_4: [
        "https://images.unsplash.com/photo-1598133894008-61f7fdb8cc3a?w=800",
        "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800",
    ],
};

const SERVICES = ["Bath & Blow Dry", "Hair Trimming", "Nail Clipping", "Tick Removal"];

/* ================= DUMMY DATA ================= */

const DUMMY_PET_GROOMING: JobType[] = [
    {
        id: "pet_1",
        title: "Paws & Glow Grooming",
        location: "Ghatkopar East, Mumbai",
        distance: 0.8,
        category: "Pet Grooming",
        description: "Premium grooming services for dogs and cats.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 145,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 19.0856, lng: 72.9081 } },
        },
    },
    {
        id: "pet_2",
        title: "Happy Tails Pet Salon",
        location: "Vikhroli West, Mumbai",
        distance: 1.5,
        category: "Pet Grooming",
        description: "Gentle grooming with certified professionals.",
        jobData: {
            rating: 4.6,
            user_ratings_total: 98,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 19.1116, lng: 72.9201 } },
        },
    },
    {
        id: "pet_3",
        title: "Urban Pet Spa",
        location: "Powai, Mumbai",
        distance: 2.2,
        category: "Pet Grooming",
        description: "Spa-style grooming and hygiene care.",
        jobData: {
            rating: 4.9,
            user_ratings_total: 210,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 19.1197, lng: 72.9056 } },
        },
    },
    {
        id: "pet_4",
        title: "Furry Friends Groomers",
        location: "Chembur, Mumbai",
        distance: 3.1,
        category: "Pet Grooming",
        description: "Affordable and hygienic pet grooming.",
        jobData: {
            rating: 4.5,
            user_ratings_total: 76,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 19.0626, lng: 72.9005 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SinglePetGroomingCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(() => IMAGES[job.id] || IMAGES["pet_1"], [job.id]);
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
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
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
                <img src={photos[index]} className="w-full h-full object-cover" alt={job.title} />

                {index > 0 && (
                    <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full">
                        <ChevronLeft size={18} />
                    </button>
                )}
                {index < photos.length - 1 && (
                    <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full">
                        <ChevronRight size={18} />
                    </button>
                )}

                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{index + 1}/{photos.length}</span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex flex-col flex-grow">
                <h3 className="text-lg font-bold">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                {job.distance && <p className="text-green-600 text-sm font-semibold">{Number(job.distance).toFixed(1)} km away</p>}

                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>

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
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={12} />
                            {isOpen ? "Open" : "Closed"}
                        </span>
                    )}
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2 pt-2">
                    {SERVICES.slice(0, 3).map(service => (
                        <span key={service} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{service}</span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button onClick={e => { e.stopPropagation(); openMaps(); }} className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50">
                        Directions
                    </button>

                    <button onClick={e => { e.stopPropagation(); callNow(); }} disabled={!phone} className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2 ${phone ? "bg-green-100 text-green-700 border border-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= GRID ================= */

const PetGroomingCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_PET_GROOMING.map(item => (
                    <SinglePetGroomingCard key={item.id} job={item} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SinglePetGroomingCard job={job} onViewDetails={onViewDetails} />;
};

export default PetGroomingCard;
