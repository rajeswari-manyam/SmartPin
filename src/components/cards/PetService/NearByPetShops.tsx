import { useState, useMemo } from "react";
import { MapPin, Phone, ChevronLeft, ChevronRight, Star, Clock } from "lucide-react";

// ================= TYPES =================
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

// ================= DATA =================
const PHONE_MAP: Record<string, string> = {
    petshop_1: "09724943951",
    petshop_2: "07411506266",
    petshop_3: "09912345678",
    petshop_4: "08512345678",
};

const IMAGES: Record<string, string[]> = {
    petshop_1: [
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
    ],
    petshop_2: [
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
    ],
    petshop_3: [
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
    ],
    petshop_4: [
        "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
        "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800",
        "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
    ],
};

const SERVICES = ["Pet Care", "Pet Grooming", "Pets Available", "Shop In Store"];

// Dummy Data
const DUMMY_PET_SHOPS: JobType[] = [
    {
        id: "petshop_1",
        title: "Sai Krishna Pets and More",
        location: "Moosapet Main Road Kukatpally, Hyderabad",
        distance: 4.1,
        category: "Pet Shop",
        description: "Popular pet shop with 4.3★ rating and 2,202 reviews. Jd Verified. Quick Response. Wide variety of pets available.",
        jobData: {
            rating: 4.3,
            user_ratings_total: 2202,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4875, lng: 78.3953 } },
        },
    },
    {
        id: "petshop_2",
        title: "Our Family Petzone",
        location: "Suchitra Cross Road, Hyderabad",
        distance: 1.9,
        category: "Pet Shop",
        description: "Trending pet zone with 4.1★ rating and 96 reviews. Quick Response. Complete pet care services.",
        jobData: {
            rating: 4.1,
            user_ratings_total: 96,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5486, lng: 78.5264 } },
        },
    },
    {
        id: "petshop_3",
        title: "Harshavardhan Veterinary Medical Hall & Pet Shop",
        location: "Anjaneya Swamy Temple Road Kukatpally, Hyderabad",
        distance: 4.8,
        category: "Pet Shop",
        description: "Verified veterinary medical hall with 4.2★ rating and 598 reviews. Complete pet care, grooming, and pets available.",
        jobData: {
            rating: 4.2,
            user_ratings_total: 598,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4948, lng: 78.3953 } },
        },
    },
    {
        id: "petshop_4",
        title: "Noble Pet And Veterinary Medical Hall",
        location: "Quthbullapur Bus Stop Kutbullapur, Hyderabad",
        distance: 6.4,
        category: "Pet Shop",
        description: "Trusted veterinary medical hall with 4.3★ rating and 594 reviews. Same day delivery available. Shop in store facility.",
        jobData: {
            rating: 4.3,
            user_ratings_total: 594,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5142, lng: 78.4654 } },
        },
    },
];

// ================= COMPONENT =================
const SinglePetShopCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);
    const photos = useMemo(() => IMAGES[job.id] || IMAGES["petshop_1"], [job.id]);
    const rating = job.jobData?.rating;
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const phone = PHONE_MAP[job.id];
    const lat = job.jobData?.geometry?.location?.lat;
    const lng = job.jobData?.geometry?.location?.lng;

    const next = () => index < photos.length - 1 && setIndex(i => i + 1);
    const prev = () => index > 0 && setIndex(i => i - 1);
    const openMaps = () => { if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank"); };
    const callNow = () => { if (phone) window.location.href = `tel:${phone}`; };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden h-full flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48 shrink-0">
                <img src={photos[index]} className="w-full h-full object-cover" alt={job.title} />
                {index > 0 && <button onClick={e => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"><ChevronLeft size={18} /></button>}
                {index < photos.length - 1 && <button onClick={e => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"><ChevronRight size={18} /></button>}
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{index + 1}/{photos.length}</span>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h3 className="text-lg font-bold">{job.title}</h3>
                {job.location && <div className="flex items-center text-sm text-gray-500"><MapPin size={14} className="mr-1" />{job.location}</div>}
                {job.distance && <p className="text-green-600 text-sm font-semibold">{Number(job.distance).toFixed(1)} km away</p>}
                {job.description && <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{job.description}</p>}

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
                    {SERVICES.slice(0, 3).map(s => <span key={s} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">{s}</span>)}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 mt-auto">
                    <button onClick={e => { e.stopPropagation(); openMaps(); }} className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50">Directions</button>
                    <button onClick={e => { e.stopPropagation(); callNow(); }} disabled={!phone} className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2 ${phone ? "bg-green-100 text-green-700 border border-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}><Phone size={16} />Call</button>
                </div>
            </div>
        </div>
    );
};

// Wrapper
const PetShopCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_PET_SHOPS.map(p => <SinglePetShopCard key={p.id} job={p} onViewDetails={onViewDetails} />)}
            </div>
        );
    }
    return <SinglePetShopCard job={job} onViewDetails={onViewDetails} />;
};

export default PetShopCard;
