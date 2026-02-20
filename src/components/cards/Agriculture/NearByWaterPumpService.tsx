import React, { useState, useCallback } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= TYPES ================= */

export interface WaterPumpService {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
        types?: string[];
        special_tags?: string[];
    };
}

/* ================= DATA ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    service_1: "08488850312",
    service_2: "09876543210",
    service_3: "09123456789",
    service_4: "08555123456",
    service_5: "09988776655",
};

const SERVICE_IMAGES_MAP: Record<string, string[]> = {
    service_1: [
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800",
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
    ],
    service_2: [
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
    ],
    service_3: [
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
    ],
    service_4: [
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800",
    ],
    service_5: [
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800",
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
    ],
};

const SERVICE_DESCRIPTIONS_MAP: Record<string, string> = {
    service_1: "Professional water pump repair services. Borewell Scanning & Maintenance.",
    service_2: "Expert borewell motor repair & water pump services. 24/7 availability.",
    service_3: "Submersible motor repair & electrical services. Quick response guaranteed.",
    service_4: "Reliable water pump services & installation. On-site repair services.",
    service_5: "Jd Verified water pump & electrical services. Fast and professional.",
};

const WATER_PUMP_SERVICES_LIST: WaterPumpService[] = [
    { id: "service_1", title: "Rishika Enterprises", location: "Hyderabad", distance: 7.9, jobData: { rating: 4.6, user_ratings_total: 197, opening_hours: { open_now: true }, types: ["Borewell Repair", "Submersible Pumps"] } },
    { id: "service_2", title: "Sri Mahalakshmi Bore Well Motor Works", location: "Chintal, Hyderabad", distance: 12.5, jobData: { rating: 4.4, user_ratings_total: 12, opening_hours: { open_now: true }, types: ["Borewell Repair", "Water Pump Installation"] } },
    { id: "service_3", title: "Bismillah Submersible Motor Repair", location: "Chintal, Hyderabad", distance: 0.96, jobData: { rating: 4.9, user_ratings_total: 8, opening_hours: { open_now: true }, types: ["Submersible Pumps", "Motor Rewinding"] } },
    { id: "service_4", title: "Sri Sai Engineering Works", location: "Suchitra Cross Road, Hyderabad", distance: 1.7, jobData: { rating: 4.5, user_ratings_total: 6, opening_hours: { open_now: true }, types: ["Borewell Repair", "Maintenance"] } },
    { id: "service_5", title: "Rupavathi Electricals", location: "Padma Nagar Chintal, Hyderabad", distance: 3.2, jobData: { rating: 4.3, user_ratings_total: 45, opening_hours: { open_now: true }, types: ["Water Testing", "Emergency Service"] } },
];

/* ================= COMPONENTS ================= */

const SingleWaterPumpCard: React.FC<{ job: WaterPumpService; onViewDetails: (job: WaterPumpService) => void }> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = SERVICE_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % photos.length); };
    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length); };

    const rating = job.jobData?.rating?.toFixed(1);
    const userRatingsTotal = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;

    const handleCall = (e: React.MouseEvent) => { e.stopPropagation(); const phone = PHONE_NUMBERS_MAP[job.id]; if (phone) window.location.href = `tel:${phone}`; };
    const handleDirections = (e: React.MouseEvent) => { e.stopPropagation(); const lat = job.jobData?.geometry?.location.lat; const lng = job.jobData?.geometry?.location.lng; if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank"); };

    return (
        <div onClick={() => onViewDetails(job)} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={job.title} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"><ChevronLeft size={20} /></button>
                                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"><ChevronRight size={20} /></button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{currentImageIndex + 1}/{photos.length}</div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🔧</div>
                )}
            </div>

            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{job.title}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600"><MapPin size={16} /><span className="line-clamp-1">{job.location}</span></div>
                {job.distance && <p className="text-xs font-semibold text-green-600">{job.distance} km away</p>}
                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{SERVICE_DESCRIPTIONS_MAP[job.id] || job.description}</p>

                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            <span className="text-gray-500">({userRatingsTotal})</span>
                        </div>
                    )}
                    {isOpen !== undefined && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={12} />
                            <span className="text-xs font-semibold">{isOpen ? "Open" : "Closed"}</span>
                        </div>
                    )}
                </div>

                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
                    <div className="flex flex-wrap gap-2">
                        {(job.jobData?.types || []).slice(0, 3).map((service, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">✓ {service}</span>
                        ))}
                    </div>
                </div>

                <div className="flex gap-2 pt-4 mt-auto">
                    <button onClick={handleDirections} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold">
                        <Navigation size={16} /> Directions
                    </button>
                    <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold">
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const WaterPumpServiceCard: React.FC<{ job?: WaterPumpService; onViewDetails: (job: WaterPumpService) => void }> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {WATER_PUMP_SERVICES_LIST.map((service) => (
                    <SingleWaterPumpCard key={service.id} job={service} onViewDetails={props.onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleWaterPumpCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default WaterPumpServiceCard;
