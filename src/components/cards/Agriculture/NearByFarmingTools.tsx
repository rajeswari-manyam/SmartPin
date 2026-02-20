import React, { useState, useCallback } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= TYPES ================= */

interface FarmingTool {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        geometry?: { location: { lat: number; lng: number } };
        years_in_business?: number;
        verified?: boolean;
        gst_registered?: boolean;
        trust_badge?: boolean;
    };
}

/* ================= DUMMY DATA & IMAGES ================= */

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
    product_1: "07383862073",
    product_2: "09054589235",
    product_3: "09725279216",
    product_4: "09054564822",
    product_5: "08012345678",
    product_6: "08098765432",
    product_7: "08011223344",
};

// Dummy images
const PRODUCT_IMAGES_MAP: Record<string, string[]> = {
    product_1: [
        "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
    ],
    product_2: [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
    ],
    product_3: [
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    ],
    product_4: [
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
    ],
    product_5: [
        "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    ],
    product_6: [
        "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800",
        "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800",
    ],
    product_7: [
        "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
    ],
};

// Dummy descriptions
const PRODUCT_DESCRIPTIONS_MAP: Record<string, string> = {
    product_1: "Heavy-duty ridger tool for soil preparation, ideal for medium to large farms.",
    product_2: "Portable cordless garden cultivator for small gardens and flower beds.",
    product_3: "Pruning shears for precision gardening and horticulture.",
    product_4: "Sickle for harvesting crops efficiently.",
    product_5: "Compact ridger tool suitable for home gardening.",
    product_6: "Watering can for plants, vegetables, and flowers.",
    product_7: "Garden hoe for soil tilling and weed removal.",
};

// Dummy services
const TOOL_SERVICES = ["Durable", "Lightweight", "Eco-Friendly", "Easy to Use"];

// Dummy farming tools
const DUMMY_FARMING_TOOLS: FarmingTool[] = [
    { id: "product_1", title: "Heavy-Duty Ridger Tool", location: "Belgaum", category: "Farming Tool", jobData: { rating: 4.2, user_ratings_total: 23, years_in_business: 5 } },
    { id: "product_2", title: "Portable Garden Cultivator", location: "Belgaum", category: "Farming Tool", jobData: { rating: 4.2, user_ratings_total: 74, years_in_business: 12 } },
    { id: "product_3", title: "Pruning Shears", location: "Salem", category: "Farming Tool", jobData: { rating: 4.2, user_ratings_total: 74, years_in_business: 9 } },
    { id: "product_4", title: "Sickle Farmer Tool", location: "Kolhapur", category: "Farming Tool", jobData: { rating: 4.6, user_ratings_total: 25, years_in_business: 9 } },
    { id: "product_5", title: "Compact Ridger Tool", location: "Dharwad", category: "Farming Tool", jobData: { rating: 4.8, user_ratings_total: 8, years_in_business: 14 } },
    { id: "product_6", title: "Watering Can", location: "Belgaum", category: "Farming Tool", jobData: { rating: 4.5, user_ratings_total: 32, years_in_business: 7 } },
    { id: "product_7", title: "Garden Hoe", location: "Belgaum", category: "Farming Tool", jobData: { rating: 4.3, user_ratings_total: 18, years_in_business: 6 } },
];

/* ================= COMPONENT ================= */

interface NearbyFarmingToolCardProps {
    job?: FarmingTool;
    onViewDetails: (job: FarmingTool) => void;
}

const SingleFarmingToolCard: React.FC<{ job: FarmingTool; onViewDetails: (job: FarmingTool) => void }> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = PRODUCT_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % photos.length); };
    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length); };

    const getRating = () => job.jobData?.rating?.toFixed(1) || null;
    const getUserRatingsTotal = () => job.jobData?.user_ratings_total || null;

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
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
        >
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
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🛠️</div>}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{job.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{job.location}</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{PRODUCT_DESCRIPTIONS_MAP[job.id]}</p>

                {/* Rating & Years */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {getRating() && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{getRating()}</span>
                            <span className="text-gray-500">({getUserRatingsTotal()})</span>
                        </div>
                    )}
                    {job.jobData?.years_in_business && (
                        <div className="text-xs text-gray-500">{job.jobData.years_in_business} Years in business</div>
                    )}
                </div>

                {/* Services */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Features:</p>
                    <div className="flex flex-wrap gap-2">
                        {TOOL_SERVICES.slice(0, 3).map((service, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                                ✓ {service}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold"
                    >
                        <Navigation size={16} /> Directions
                    </button>
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold"
                    >
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const NearbyFarmingToolCard: React.FC<NearbyFarmingToolCardProps> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_FARMING_TOOLS.map((tool) => (
                    <SingleFarmingToolCard
                        key={tool.id}
                        job={tool}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleFarmingToolCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyFarmingToolCard;
