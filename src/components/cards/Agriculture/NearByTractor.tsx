import React, { useState, useCallback } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= TYPES ================= */
export interface TractorService {
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
        years_in_business?: number;
        types?: string[];
        special_tags?: string[];
    };
}

/* ================= PHONE NUMBERS ================= */
const PHONE_NUMBERS_MAP: Record<string, string> = {
    tractor_1: "08511401366",
    tractor_2: "09876543210",
    tractor_3: "09123456789",
    tractor_4: "08555123456",
    tractor_5: "09988776655",
    tractor_6: "07947117076",
};

/* ================= IMAGES ================= */
const TRACTOR_IMAGES_MAP: Record<string, string[]> = {
    tractor_1: [
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800",
    ],
    tractor_2: [
        "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800",
        "https://images.unsplash.com/photo-1589922196851-3f50e5d4f7f3?w=800",
    ],
    tractor_3: [
        "https://images.unsplash.com/photo-1589922196851-3f50e5d4f7f3?w=800",
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    ],
    tractor_4: [
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        "https://images.unsplash.com/photo-1589922196851-3f50e5d4f7f3?w=800",
    ],
    tractor_5: [
        "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800",
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    ],
    tractor_6: [
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        "https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?w=800",
    ],
};

/* ================= DESCRIPTIONS ================= */
const TRACTOR_DESCRIPTIONS_MAP: Record<string, string> = {
    tractor_1: "Professional earthmoving and JCB hire services. 4 years of experience.",
    tractor_2: "Reliable earthmovers service with 21 years in the industry.",
    tractor_3: "Popular tractor rental service with 10 years experience.",
    tractor_4: "Trending tractor service with 25 years of experience.",
    tractor_5: "Harvesters and dozers rental, 11 years of trusted service.",
    tractor_6: "Reliable tractor works with 16 years of experience.",
};

/* ================= SERVICES ================= */
const TRACTOR_TYPES = [
    "Tractors On Rent",
    "Tractor Dealers",
    "JCB Hire",
    "Earthmovers On Rent",
    "Mini Trucks On Rent",
    "Tractor Dozers On Rent",
    "Harvester Tractors On Rent",
];

/* ================= SINGLE CARD ================= */
const SingleTractorCard: React.FC<{ job: TractorService; onViewDetails: (job: TractorService) => void }> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = TRACTOR_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];
    const isOpen = job.jobData?.opening_hours?.open_now;

    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % photos.length); };
    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length); };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = job.jobData?.geometry?.location.lat;
        const lng = job.jobData?.geometry?.location.lng;
        if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    return (
        <div onClick={() => onViewDetails(job)} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
            {/* Image Carousel */}
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
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{currentImageIndex + 1}/{photos.length}</div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🚜</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{job.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{job.location}</span>
                </div>

                {job.distance && <p className="text-xs font-semibold text-green-600">{job.distance} km away</p>}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{TRACTOR_DESCRIPTIONS_MAP[job.id] || job.description}</p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {job.jobData?.rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{job.jobData.rating.toFixed(1)}</span>
                            <span className="text-gray-500">({job.jobData.user_ratings_total})</span>
                        </div>
                    )}
                    {isOpen !== undefined && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={12} />
                            <span className="text-xs font-semibold">{isOpen ? "Open" : "Closed"}</span>
                        </div>
                    )}
                </div>

                {/* Types */}
                {job.jobData?.types && (
                    <div className="pt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
                        <div className="flex flex-wrap gap-2">
                            {job.jobData.types.slice(0, 3).map((type, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">✓ {type}</span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Buttons */}
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

/* ================= MAIN WRAPPER ================= */
interface NearbyTractorCardProps {
    job?: TractorService;
    onViewDetails: (job: TractorService) => void;
}

const NearbyTractorCard: React.FC<NearbyTractorCardProps> = (props) => {
    const DUMMY_TRACTORS: TractorService[] = [
        {
            id: "tractor_1",
            title: "Shivarama Earthmovers",
            location: "Hyderabad",
            distance: 16.9,
            jobData: {
                rating: 4.0,
                user_ratings_total: 1,
                opening_hours: { open_now: true },
                types: ["Tractors On Rent", "Earthmovers On Rent-JCB"],
            },
        },
        {
            id: "tractor_2",
            title: "Sri Venkateshwara Earth Movers",
            location: "Hyderabad",
            distance: 16.2,
            jobData: {
                rating: 4.0,
                user_ratings_total: 1,
                opening_hours: { open_now: true },
                types: ["Earthmovers"],
            },
        },
        
    ];

    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_TRACTORS.map((tractor) => (
                    <SingleTractorCard key={tractor.id} job={tractor} onViewDetails={props.onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleTractorCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyTractorCard;
