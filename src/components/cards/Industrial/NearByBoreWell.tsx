import React, { useState, useCallback } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= TYPES ================= */
export interface BorewellService {
    id: string;
    title: string;
    location?: string;
    distance?: number | string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
    };
}

/* ================= CONSTANTS ================= */
const PHONE_NUMBERS_MAP: Record<string, string> = {
    service_1: "07411595083",
    service_2: "07411095445",
    service_3: "08460556659",
};

const IMAGES_MAP: Record<string, string[]> = {
    service_1: [
        "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800",
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
    ],
    service_2: [
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
        "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800",
    ],
    service_3: [
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
    ],
};

const BOREWELL_SERVICES = ["Borewell Drilling", "Pump Installation", "Water Testing", "Maintenance", "Cleaning", "Pipeline Setup"];

const DUMMY_BOREWELLS: BorewellService[] = [
    {
        id: "service_1",
        title: "APS Borewells",
        location: "Kushaiguda ECIL, Hyderabad",
        distance: 11.7,
        jobData: { rating: 5.0, user_ratings_total: 1, opening_hours: { open_now: true }, geometry: { location: { lat: 17.385, lng: 78.4867 } } },
    },
    {
        id: "service_2",
        title: "Sri Sai Venkateshwara Borewells",
        location: "Mehdipatnam, Hyderabad",
        distance: 10.5,
        jobData: { rating: 4.4, user_ratings_total: 61, opening_hours: { open_now: true }, geometry: { location: { lat: 17.39, lng: 78.48 } } },
    },
    {
        id: "service_3",
        title: "Hyderabad Borewell Contractors",
        location: "Madhapur, Hyderabad",
        distance: 8.3,
        jobData: { rating: 4.8, user_ratings_total: 35, opening_hours: { open_now: true }, geometry: { location: { lat: 17.448, lng: 78.391 } } },
    },
];

/* ================= SINGLE CARD ================= */
const SingleBorewellCard: React.FC<{ job: BorewellService; onViewDetails: (job: BorewellService) => void }> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % photos.length); };
    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length); };

    const rating = job.jobData?.rating?.toFixed(1);
    const reviews = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const loc = job.jobData?.geometry?.location;
        if (loc?.lat && loc?.lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, "_blank");
        }
    };

    return (
        <div onClick={() => onViewDetails(job)} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={job.title} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🚜</div>
                )}
            </div>

            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{job.title}</h2>
                {job.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span className="line-clamp-1">{job.location}</span>
                    </div>
                )}
                {job.distance && <p className="text-xs font-semibold text-green-600">{job.distance} km away</p>}

                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            <span className="text-gray-500">({reviews})</span>
                        </div>
                    )}
                    {isOpen !== undefined && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={12} />
                            <span className="text-xs font-semibold">{isOpen ? "Open" : "Closed"}</span>
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
                    <div className="flex flex-wrap gap-2">
                        {BOREWELL_SERVICES.slice(0, 4).map((service, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-xs">✓ {service}</span>
                        ))}
                        {BOREWELL_SERVICES.length > 4 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                +{BOREWELL_SERVICES.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button onClick={handleDirections} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold">
                        <Navigation size={16} /> Directions
                    </button>
                    <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-50 text-cyan-700 border-2 border-cyan-600 rounded-lg hover:bg-cyan-100 font-semibold">
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= WRAPPER ================= */
interface Props { job?: BorewellService; onViewDetails: (job: BorewellService) => void; }

const BorewellServiceCard: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_BOREWELLS.map((service) => (
                    <SingleBorewellCard key={service.id} job={service} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }
    return <SingleBorewellCard job={job} onViewDetails={onViewDetails} />;
};

export default BorewellServiceCard;
