import React, { useState, useCallback } from "react";
import {
    MapPin,
    Phone,
    MessageCircle,
    Star,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

/* ================= TYPES ================= */
export interface SeedDealer {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        geometry?: { location: { lat: number; lng: number } };
        years_in_business?: number;
    };
}

/* ================= DATA ================= */
const PHONE_NUMBERS_MAP: Record<string, string> = {
    dealer_1: "09035253951",
    dealer_2: "08460445026",
    dealer_3: "07947111271",
    dealer_4: "07947138320",
    dealer_5: "07947110000",
};

const DEALER_IMAGES_MAP: Record<string, string[]> = {
    dealer_1: [
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
    ],
    dealer_2: [
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    ],
    dealer_3: [
        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800",
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    ],
    dealer_4: [
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800",
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
    ],
    dealer_5: [
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
    ],
};

const DEALER_DESCRIPTIONS_MAP: Record<string, string> = {
    dealer_1:
        "Top Search fertilizer and agricultural product dealer with 4.9★ rating and 18 reviews. 12 Years in Business.",
    dealer_2:
        "Trending hybrid seed wholesaler with 5.0★ rating and 5 reviews. 4 Years in Business. Also serves Belgaum region.",
    dealer_3:
        "Verified paddy seed retailer with 4.0★ rating and 240 reviews. 40 Years in Business.",
    dealer_4:
        "Rice seed dealer with 4.5★ rating and 12 reviews. 8 Years in Business. Located in Belgaum.",
    dealer_5:
        "Agricultural seed retailer with 4.2★ rating and 10 reviews. 15 Years in Business. Serving Belgaum area.",
};

const SEED_SERVICES = [
    "Hybrid Seeds",
    "Organic Seeds",
    "Fertilizers",
    "Pesticides",
    "Agricultural Equipment",
];

/* ================= COMPONENT ================= */
interface SeedDealerCardProps {
    job?: SeedDealer;
    onViewDetails: (job: SeedDealer) => void;
}

const SingleSeedDealerCard: React.FC<SeedDealerCardProps> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    if (!job) return null;

    const photos = DEALER_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const rating = job.jobData?.rating?.toFixed(1);
    const totalRatings = job.jobData?.user_ratings_total;
    const years = job.jobData?.years_in_business;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleWhatsApp = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (!phone) return;
        const msg = encodeURIComponent(`Hi, I found your business online and I'm interested in your seeds.`);
        window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = job.jobData?.geometry?.location.lat;
        const lng = job.jobData?.geometry?.location.lng;
        if (lat && lng)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl cursor-pointer flex flex-col h-full"
        >
            {/* Image */}
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🌾</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-lg font-bold line-clamp-2">{job.title}</h2>
                {job.location && (
                    <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
                        <MapPin size={16} /> {job.location}
                    </div>
                )}
                {years && <p className="text-xs font-semibold text-green-600">{years} Years in Business</p>}
                <p className="text-sm text-gray-600 line-clamp-3 mt-1 mb-2">{DEALER_DESCRIPTIONS_MAP[job.id]}</p>

                {/* Rating */}
                {rating && totalRatings && (
                    <div className="flex items-center gap-2 text-sm mb-2">
                        <Star size={14} className="text-yellow-400" /> <span className="font-semibold">{rating}</span>
                        <span className="text-gray-500">({totalRatings})</span>
                    </div>
                )}

                {/* Services */}
                <div className="flex flex-wrap gap-1.5 mb-2">
                    {SEED_SERVICES.slice(0, 3).map((service, idx) => (
                        <span key={idx} className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded">
                            {service}
                        </span>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-auto">
                    <button onClick={handleDirections} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold">
                        Directions
                    </button>
                    <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold">
                        Call
                    </button>
                 
                </div>
            </div>
        </div>
    );
};

const SeedDealerCard: React.FC<SeedDealerCardProps> = (props) => {
    if (!props.job) {
        const DUMMY_DEALERS: SeedDealer[] = [
            { id: "dealer_1", title: "Dreamtouch INDIA Organic Agriculture", location: "Athani", jobData: { rating: 4.9, user_ratings_total: 18, years_in_business: 12 } },
            { id: "dealer_2", title: "Gndhybrid Seeds", location: "Ludhiana", jobData: { rating: 5, user_ratings_total: 5, years_in_business: 4 } },
            { id: "dealer_3", title: "Brar Seed Store", location: "Ludhiana", jobData: { rating: 4, user_ratings_total: 240, years_in_business: 40 } },
            { id: "dealer_4", title: "Pruthvi Agro Agencies", location: "Belgaum", jobData: { rating: 4.5, user_ratings_total: 12, years_in_business: 8 } },
            { id: "dealer_5", title: "Sagar Seeds", location: "Belgaum", jobData: { rating: 4.2, user_ratings_total: 10, years_in_business: 15 } },
        ];

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_DEALERS.map((dealer) => (
                    <SingleSeedDealerCard key={dealer.id} job={dealer} onViewDetails={props.onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleSeedDealerCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default SeedDealerCard;
