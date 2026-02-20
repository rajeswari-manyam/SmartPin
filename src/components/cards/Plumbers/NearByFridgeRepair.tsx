import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, CheckCircle, Zap, Award, ThumbsUp } from "lucide-react";

export interface FridgeService {
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
        verified?: boolean;
        trending?: boolean;
        topSearch?: boolean;
        responsive?: boolean;
        suggestions?: number;
    };
}

interface NearbyFridgeServiceProps {
    service?: FridgeService;
    onViewDetails: (service: FridgeService) => void;
}

/* ====== STATIC DATA ====== */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    service_1: "07947213568",
    service_2: "09985740000",
    service_3: "08460529136",
    service_4: "07411639699",
};

const SERVICE_IMAGES_MAP: Record<string, string[]> = {
    service_1: [
        "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800",
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
    ],
    service_2: ["https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800"],
    service_3: ["https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800"],
    service_4: ["https://images.unsplash.com/photo-1621905252472-394d1b7c4f8f?w=800"],
};

const DUMMY_SERVICES: FridgeService[] = [
    {
        id: "service_1",
        title: "Sri Laxmi Refrigerator Service",
        location: "Kukatpally, Hyderabad",
        distance: 3.2,
        category: "Refrigerator Repair",
        serviceData: { rating: 4.7, user_ratings_total: 313, verified: true, topSearch: true, suggestions: 66 },
    },
    {
        id: "service_2",
        title: "Shiva Shankar Enterprises",
        location: "Jeedimetla, Hyderabad",
        distance: 5.3,
        category: "Fridge Repair",
        serviceData: { rating: 4.1, user_ratings_total: 70, responsive: true },
    },
    {
        id: "service_3",
        title: "Ashok Enterprises",
        location: "Bowenpally, Hyderabad",
        distance: 4.8,
        category: "Refrigerator Repair",
        serviceData: { rating: 5.0, user_ratings_total: 66, trending: true, verified: true },
    },
    {
        id: "service_4",
        title: "MS Electricals",
        location: "Chintal, Hyderabad",
        distance: 1.6,
        category: "Fridge Service",
        serviceData: { rating: 4.4, user_ratings_total: 62, trending: true, verified: true },
    },
];

const FRIDGE_SERVICES = ["Home Repair", "Warranty Support", "Emergency Service"];

/* ====== SINGLE CARD ====== */

const SingleFridgeServiceCard: React.FC<{ service: FridgeService; onViewDetails: (service: FridgeService) => void }> = ({ service, onViewDetails }) => {
    const [imgIndex, setImgIndex] = useState(0);
    const photos = SERVICE_IMAGES_MAP[service.id] || [];
    const currentPhoto = photos[imgIndex];

    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setImgIndex((i) => (i + 1) % photos.length); };
    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setImgIndex((i) => (i - 1 + photos.length) % photos.length); };

    const handleCall = (e: React.MouseEvent) => { e.stopPropagation(); const phone = PHONE_NUMBERS_MAP[service.id]; if (phone) window.location.href = `tel:${phone}`; };
    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = service.serviceData?.geometry?.location.lat;
        const lng = service.serviceData?.geometry?.location.lng;
        if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    const isOpen = service.serviceData?.opening_hours?.open_now;
    const rating = service.serviceData?.rating?.toFixed(1);
    const userCount = service.serviceData?.user_ratings_total;

    return (
        <div onClick={() => onViewDetails(service)} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
            {/* IMAGE */}
            <div className="relative h-48 shrink-0 bg-gray-200">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {imgIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🧊</div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                    {service.serviceData?.verified && <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex gap-1"><CheckCircle size={12} /> Verified</span>}
                    {service.serviceData?.trending && <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full flex gap-1"><Zap size={12} /> Trending</span>}
                    {service.serviceData?.topSearch && <span className="bg-amber-600 text-white text-xs px-2 py-1 rounded-full flex gap-1"><Award size={12} /> Top Search</span>}
                </div>
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{service.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{service.location}</span>
                </div>

                {service.distance && <p className="text-xs font-semibold text-green-600">{service.distance} km away</p>}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{service.description}</p>

                {/* Rating & Open Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            <span className="text-gray-500">({userCount})</span>
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
                        {FRIDGE_SERVICES.map((service, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">✓ {service}</span>
                        ))}
                    </div>
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

/* ====== MAIN LIST ====== */

const NearbyFridgeServiceCard: React.FC<NearbyFridgeServiceProps> = ({ service, onViewDetails }) => {
    if (!service) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_SERVICES.map((item) => (
                    <SingleFridgeServiceCard key={item.id} service={item} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleFridgeServiceCard service={service} onViewDetails={onViewDetails} />;
};

export default NearbyFridgeServiceCard;
