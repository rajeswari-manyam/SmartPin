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
    clinic_1: "08460402170",
    clinic_2: "08197534109",
    clinic_3: "",
    clinic_4: "07947131646",
    clinic_5: "",
    clinic_6: "08234561234",
};

const IMAGES: Record<string, string[]> = {
    clinic_1: [
        "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
        "https://images.unsplash.com/photo-1583512603806-077998240c7a?w=800",
    ],
    clinic_2: [
        "https://images.unsplash.com/photo-1583512603806-077998240c7a?w=800",
        "https://images.unsplash.com/photo-1530041539828-114de669390e?w=800",
    ],
    clinic_3: [
        "https://images.unsplash.com/photo-1530041539828-114de669390e?w=800",
        "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
    ],
    clinic_4: [
        "https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=800",
        "https://images.unsplash.com/photo-1583512603806-077998240c7a?w=800",
    ],
};

const SERVICES = ["Vaccination", "Surgery", "Emergency Care", "Pet Grooming"];

/* ================= DUMMY DATA ================= */

const DUMMY_PET_CLINICS: JobType[] = [
    {
        id: "clinic_1",
        title: "Atul's Vet N Pet Clinic",
        location: "Bowenpally, Hyderabad",
        distance: 4.6,
        description: "Trusted veterinary care with 17+ years experience.",
        category: "Pet Clinic",
        jobData: {
            rating: 4.1,
            user_ratings_total: 49,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 17.4764, lng: 78.4664 } },
        },
    },
    {
        id: "clinic_2",
        title: "All Creatures Animal Clinic",
        location: "Bowenpally, Hyderabad",
        distance: 3.5,
        description: "24/7 animal clinic with expert vets.",
        category: "Pet Clinic",
        jobData: {
            rating: 4.2,
            user_ratings_total: 46,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4895, lng: 78.4632 } },
        },
    },
    {
        id: "clinic_3",
        title: "Tanish Pets & Clinic",
        location: "Kutbullapur, Hyderabad",
        distance: 1.7,
        description: "Pet clinic & grooming parlour.",
        category: "Pet Clinic",
        jobData: {
            rating: 4.9,
            user_ratings_total: 49,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5142, lng: 78.4654 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SinglePetClinicCard: React.FC<{
    job: JobType;
    onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES[job.id] || IMAGES["clinic_1"],
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
                            {reviews && <span className="text-gray-500">({reviews})</span>}
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
                        className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50"
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

const NearbyPetClinicsCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_PET_CLINICS.map((clinic) => (
                    <SinglePetClinicCard
                        key={clinic.id}
                        job={clinic}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SinglePetClinicCard
            job={props.job}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default NearbyPetClinicsCard;
