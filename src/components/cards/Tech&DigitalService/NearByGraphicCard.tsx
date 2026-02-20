import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, ChevronLeft, ChevronRight, Briefcase, Flame, Zap } from "lucide-react";


interface GraphicDesigner {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    yearsInBusiness?: number;
    rating?: number;
    userRatingsTotal?: number;
    services?: string[];
    specialTags?: string[];
    images?: string[];
}

interface NearbyGraphicDesignerCardProps {
    job?: GraphicDesigner;
    onViewDetails: (job: GraphicDesigner) => void;
}

// Dummy data
const DUMMY_DESIGNERS: GraphicDesigner[] = [
    {
        id: "graphic_designer_1",
        title: "The Classic Creativity",
        description: "Trending graphic design service with excellent rating. Offering computer graphic design, logo design, and brand identity services in Ahmedabad.",
        location: "Ahmedabad",
        distance: 12.5,
        yearsInBusiness: 8,
        rating: 4.3,
        userRatingsTotal: 3,
        services: ["Computer Graphic Designers", "Logo Designers", "Brand Identity Design", "Print Design"],
        specialTags: ["Trending"],
        images: [
            "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800",
            "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
            "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=800",
        ]
    },
    {
        id: "graphic_designer_2",
        title: "Digital Pick Creations",
        description: "Creative agency providing computer graphic design, logo design, and social media graphics in Delhi.",
        location: "Delhi",
        distance: 15.3,
        yearsInBusiness: 8,
        rating: 4.0,
        userRatingsTotal: 6,
        services: ["Computer Graphic Designers", "Logo Designers", "Social Media Graphics"],
        specialTags: ["Trending"],
        images: [
            "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800",
            "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=800",
            "https://images.unsplash.com/photo-1561070791-36c11767b26a?w=800",
        ]
    }
];

const PHONE_NUMBERS: Record<string, string> = {
    graphic_designer_1: "08904587628",
    graphic_designer_2: "08401480062",
};

const SingleDesignerCard: React.FC<{ job: GraphicDesigner; onViewDetails: (job: GraphicDesigner) => void }> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = job.images || [];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.location || "")}`;
        window.open(mapsUrl, "_blank");
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {photos.length > 0 ? (
                    <>
                        <img src={photos[currentImageIndex]} alt={job.title} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                >
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🎨</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{job.title}</h2>
                {job.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MapPin size={16} />
                        <span className="line-clamp-1">{job.location}</span>
                    </div>
                )}
                {job.distance && <p className="text-xs font-semibold text-pink-600">{job.distance} km away</p>}
                {job.description && <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>}

                {/* Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                    {job.rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400" />
                            <span className="font-semibold">{job.rating.toFixed(1)}</span>
                            {job.userRatingsTotal && <span className="text-gray-500">({job.userRatingsTotal})</span>}
                        </div>
                    )}
                    {job.specialTags?.map((tag, idx) => (
                        <span
                            key={idx}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                                tag === "Trending" ? "bg-red-100 text-red-600" : tag === "Responsive" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-600"
                            }`}
                        >
                            {tag === "Trending" && <Flame size={12} />}
                            {tag === "Responsive" && <Zap size={12} />}
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Years in Business */}
                {job.yearsInBusiness && (
                    <div className="flex items-center gap-1 text-gray-600 text-xs">
                        <Briefcase size={14} /> {job.yearsInBusiness} Years in Business
                    </div>
                )}

                {/* Services */}
                {job.services && (
                    <div className="pt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
                        <div className="flex flex-wrap gap-2">
                            {job.services.slice(0, 3).map((service, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-pink-50 text-pink-600 px-2 py-1 rounded text-xs">
                                    ✓ {service}
                                </span>
                            ))}
                            {job.services.length > 3 && <span className="bg-gray-200 px-2 py-1 rounded text-xs">+{job.services.length - 3} more</span>}
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-pink-50 text-pink-700 border-2 border-pink-600 rounded-lg hover:bg-pink-100 font-semibold"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold"
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const NearbyGraphicDesignerCard: React.FC<NearbyGraphicDesignerCardProps> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_DESIGNERS.map((designer) => (
                    <SingleDesignerCard key={designer.id} job={designer} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleDesignerCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyGraphicDesignerCard;
