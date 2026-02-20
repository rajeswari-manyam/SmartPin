import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, Hammer } from "lucide-react";

interface Carpenter {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    serviceData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
    };
}

interface CarpenterCardProps {
    carpenter?: Carpenter;
    onViewDetails: (carpenter: Carpenter) => void;
}

// Phone numbers mapping
const PHONE_NUMBERS_MAP: Record<string, string> = {
    carpenter_1: "08050657287",
    carpenter_2: "08460415630",
    carpenter_3: "07048115146",
    carpenter_4: "09876543210",
};

// Images
const CARPENTER_IMAGES_MAP: Record<string, string[]> = {
    carpenter_1: [
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
        "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=800",
        "https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800",
    ],
    carpenter_2: [
        "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800",
        "https://images.unsplash.com/photo-1550355191-aa8a80b41353?w=800",
        "https://images.unsplash.com/photo-1605774337664-7a846e9cdf17?w=800",
    ],
    carpenter_3: [
        "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800",
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800",
        "https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=800",
    ],
    carpenter_4: [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800",
        "https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800",
        "https://images.unsplash.com/photo-1615875605825-5eb9bb5d52ac?w=800",
    ],
};

// Dummy data
const DUMMY_CARPENTERS: Carpenter[] = [
    {
        id: "carpenter_1",
        title: "Eswar Sri Interiors",
        description: "Professional carpentry services for all your woodworking needs. Specializing in custom furniture and interior work.",
        location: "Deenabandu Colony Kukatpally, Hyderabad",
        distance: 3.4,
        category: "Carpenters",
        serviceData: {
            rating: 4.7,
            user_ratings_total: 157,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4874, lng: 78.4378 } },
        },
    },
    {
        id: "carpenter_2",
        title: "Shoheb Carpenter",
        description: "Expert carpenter with years of experience in furniture making, cupboards, and complete interior solutions.",
        location: "Shoheb Carpenter Suraram, Hyderabad",
        distance: 6.5,
        category: "Carpenters",
        serviceData: {
            rating: 4.8,
            user_ratings_total: 9,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5074, lng: 78.4578 } },
        },
    },
    {
        id: "carpenter_3",
        title: "Uma Maheshwara Wood Works",
        description: "Quality woodwork and furniture manufacturing. Custom designs for residential and commercial projects.",
        location: "Jeedimetla, Hyderabad",
        distance: 4.1,
        category: "Carpenters",
        serviceData: {
            rating: 4.9,
            user_ratings_total: 7,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5174, lng: 78.4678 } },
        },
    },
    {
        id: "carpenter_4",
        title: "Vishwakarma Interiors",
        description: "Skilled carpenter offering complete carpentry solutions from furniture repair to new installations.",
        location: "Kukatpally, Hyderabad",
        distance: 5.2,
        category: "Carpenters",
        serviceData: {
            rating: 4.0,
            user_ratings_total: 1,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5274, lng: 78.4778 } },
        },
    },
];

// Services
const CARPENTER_SERVICES = ["New Furniture", "Repair", "Cupboards", "Interior Work"];

const SingleCarpenterCard: React.FC<{ carpenter: Carpenter; onViewDetails: (carpenter: Carpenter) => void }> = ({ carpenter, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = CARPENTER_IMAGES_MAP[carpenter.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const isOpen = carpenter.serviceData?.opening_hours?.open_now;
    const rating = carpenter.serviceData?.rating?.toFixed(1);
    const totalRatings = carpenter.serviceData?.user_ratings_total;
    const lat = carpenter.serviceData?.geometry?.location.lat;
    const lng = carpenter.serviceData?.geometry?.location.lng;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[carpenter.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    return (
        <div
            onClick={() => onViewDetails(carpenter)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={carpenter.title} className="w-full h-full object-cover" />
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        <Hammer size={40} />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{carpenter.title}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{carpenter.location}</span>
                </div>

                {carpenter.distance && (
                    <p className="text-xs font-semibold text-green-600">{carpenter.distance} km away</p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{carpenter.description}</p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            <span className="text-gray-500">({totalRatings})</span>
                        </div>
                    )}
                    {isOpen !== undefined && (
                        <div
                            className={`flex items-center gap-1 px-2 py-0.5 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            <span className="text-xs font-semibold">{isOpen ? "Open" : "Closed"}</span>
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
                    <div className="flex flex-wrap gap-2">
                        {CARPENTER_SERVICES.map((service, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs"
                            >
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

const CarpenterCard: React.FC<CarpenterCardProps> = (props) => {
    if (!props.carpenter) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
                {DUMMY_CARPENTERS.map((carpenter) => (
                    <SingleCarpenterCard
                        key={carpenter.id}
                        carpenter={carpenter}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleCarpenterCard carpenter={props.carpenter} onViewDetails={props.onViewDetails} />;
};

export default CarpenterCard;
