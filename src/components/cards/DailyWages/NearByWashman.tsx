import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, Users, ShieldCheck, Trophy, Zap } from "lucide-react";

// Types
interface Worker {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
    };
}

// Props
interface NearbyWorkersCardProps {
    worker?: Worker;
    onViewDetails: (worker: Worker) => void;
}

// Dummy Data
const DUMMY_WORKERS: Worker[] = [
    {
        id: "loading_1",
        title: "Loading Unloading Workers Welfare Association",
        description: "Organized labour services with experienced workers for material handling and goods movement.",
        location: "Jagdishpur Bounsi Road Mirjanhat, Bhagalpur",
        distance: 8.5,
        jobData: { rating: 0, user_ratings_total: 0, opening_hours: { open_now: true }, geometry: { location: { lat: 17.4485, lng: 78.3908 } } },
    },
    {
        id: "loading_2",
        title: "Loading Unloading Workers Welfare Association",
        description: "Reliable team specializing in loading, unloading with safety and trained workers.",
        location: "59-4-16/4 Saripalli Pendurthi Sriharipuram, Visakhapatnam",
        distance: 12.3,
        jobData: { rating: 0, user_ratings_total: 0, opening_hours: { open_now: true }, geometry: { location: { lat: 17.495, lng: 78.358 } } },
    },
    {
        id: "loading_3",
        title: "Loading And Unloading Labour Contractor",
        description: "Top-rated labour contractor, affordable rates with experienced team.",
        location: "Housing Board Parrys, Chennai",
        distance: 6.8,
        jobData: { rating: 5.0, user_ratings_total: 1, opening_hours: { open_now: true }, geometry: { location: { lat: 17.485, lng: 78.487 } } },
    },
];

// Dummy Images
const WORKER_IMAGES: Record<string, string[]> = {
    loading_1: ["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800", "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800"],
    loading_2: ["https://images.unsplash.com/photo-1553413077-190dd305871c?w=800", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"],
    loading_3: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800", "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800"],
};

// Badges
const BADGES_MAP: Record<string, string[]> = {
    loading_1: ["Welfare Association", "Trusted"],
    loading_2: ["Welfare Association", "Experienced"],
    loading_3: ["Top Rated", "Quick Service"],
};

// Phone numbers
const PHONE_NUMBERS: Record<string, string> = {
    loading_1: "07942698008",
    loading_2: "07942691146",
    loading_3: "07947420416",
};

// Services
const SERVICES_MAP: Record<string, string[]> = {
    loading_1: ["Real Estate Agents", "Estate Agents", "Loading Services", "Unloading Services"],
    loading_2: ["Loading Services", "Unloading Services", "Labour Supply", "Material Handling"],
    loading_3: ["Labour Contractors", "Loading Services", "Unloading Services", "Material Handling"],
};

// Single Worker Card
const SingleWorkerCard: React.FC<{ worker: Worker; onViewDetails: (worker: Worker) => void }> = ({ worker, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = WORKER_IMAGES[worker.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNext = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % photos.length); };
    const handlePrev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length); };

    const rating = worker.jobData?.rating;
    const userRatingsTotal = worker.jobData?.user_ratings_total;
    const isOpen = worker.jobData?.opening_hours?.open_now;
    const badges = BADGES_MAP[worker.id] || [];
    const services = SERVICES_MAP[worker.id] || [];
    const phone = PHONE_NUMBERS[worker.id];

    const handleCall = (e: React.MouseEvent) => { e.stopPropagation(); if (phone) window.location.href = `tel:${phone}`; };
    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = worker.jobData?.geometry?.location.lat;
        const lng = worker.jobData?.geometry?.location.lng;
        if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    return (
        <div onClick={() => onViewDetails(worker)} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col h-full">
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={worker.title} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{currentImageIndex + 1}/{photos.length}</div>
                            </>
                        )}
                    </>
                ) : <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400">📦</div>}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h2 className="text-lg font-bold line-clamp-2">{worker.title}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{worker.location}</span>
                </div>
                {worker.distance && <p className="text-xs font-semibold text-indigo-600">{worker.distance} km away</p>}
                <p className="text-sm text-gray-600 line-clamp-3">{worker.description}</p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                    {badges.map((badge, idx) => (
                        <span key={idx} className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded bg-indigo-50 text-indigo-600">
                            {badge === "Welfare Association" && <Users size={12} />}
                            {badge === "Trusted" && <ShieldCheck size={12} />}
                            {badge === "Top Rated" && <Trophy size={12} />}
                            {badge === "Quick Service" && <Zap size={12} />}
                            {badge}
                        </span>
                    ))}
                </div>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 pt-2">
                    {rating !== undefined && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            {userRatingsTotal !== undefined && <span className="text-gray-500">({userRatingsTotal})</span>}
                        </div>
                    )}
                    {isOpen !== undefined && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={12} />
                            <span className="font-semibold">{isOpen ? "Open" : "Closed"}</span>
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="pt-2 flex flex-wrap gap-2">
                    {services.slice(0, 3).map((s, i) => (
                        <span key={i} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">✓ {s}</span>
                    ))}
                </div>

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

// Main Nearby Workers List
const NearbyWorkers: React.FC<NearbyWorkersCardProps> = ({ worker, onViewDetails }) => {
    const workers = worker ? [worker] : DUMMY_WORKERS;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map(w => <SingleWorkerCard key={w.id} worker={w} onViewDetails={onViewDetails} />)}
        </div>
    );
};

export default NearbyWorkers;
