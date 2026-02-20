import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, Wrench } from "lucide-react";

interface GasStoveService {
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

interface GasStoveServiceCardProps {
    service?: GasStoveService;
    onViewDetails: (service: GasStoveService) => void;
}

// Phone numbers mapping
const PHONE_NUMBERS_MAP: Record<string, string> = {
    service_1: "08197369512",
    service_2: "08460518502",
    service_3: "07490889138",
    service_4: "08105048273",
};

// Service images
const SERVICE_IMAGES_MAP: Record<string, string[]> = {
    service_1: [
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
        "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800",
    ],
    service_2: [
        "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    ],
    service_3: [
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800",
        "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800",
    ],
    service_4: [
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800",
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800",
    ],
};

const SERVICE_DESCRIPTIONS_MAP: Record<string, string> = {
    service_1: "Expert gas stove repair and maintenance services. Quick and reliable.",
    service_2: "Professional gas stove repair services. Trusted by hundreds of customers.",
    service_3: "Chimney and stove service specialists. Complete repair solutions.",
    service_4: "Comprehensive gas stove and chimney repair services. Affordable and fast.",
};

// Dummy data for services
const DUMMY_SERVICES: GasStoveService[] = [
    {
        id: "service_1",
        title: "Sri Sai Gas Stove Services",
        description: SERVICE_DESCRIPTIONS_MAP["service_1"],
        location: "Trimulgherry Bolarum, Hyderabad",
        distance: 4.9,
        category: "Gas Stove Repair & Services",
        serviceData: { rating: 4.7, user_ratings_total: 826, opening_hours: { open_now: true }, geometry: { location: { lat: 17.4485, lng: 78.4953 } } }
    },
    {
        id: "service_2",
        title: "K B Rushi Gas Stove Service",
        description: SERVICE_DESCRIPTIONS_MAP["service_2"],
        location: "HMT Road Kutbullapur, Hyderabad",
        distance: 0.33,
        category: "Gas Stove Repair & Services",
        serviceData: { rating: 4.8, user_ratings_total: 276, opening_hours: { open_now: true }, geometry: { location: { lat: 17.4485, lng: 78.4953 } } }
    },
    {
        id: "service_3",
        title: "Venkateswara Enterprises Chimney & Stove Service",
        description: SERVICE_DESCRIPTIONS_MAP["service_3"],
        location: "Suchitra Suchitra Junction, Hyderabad",
        distance: 2.6,
        category: "Gas Stove Repair & Services",
        serviceData: { rating: 4.9, user_ratings_total: 220, opening_hours: { open_now: true }, geometry: { location: { lat: 17.4485, lng: 78.4953 } } }
    },
    {
        id: "service_4",
        title: "Chilukuri Balaji Gas Stove Repair And Service",
        description: SERVICE_DESCRIPTIONS_MAP["service_4"],
        location: "Subashchandrabose Road Gajularamaram, Hyderabad",
        distance: 3.3,
        category: "Gas Stove Repair & Services",
        serviceData: { rating: 4.3, user_ratings_total: 25, opening_hours: { open_now: true }, geometry: { location: { lat: 17.4485, lng: 78.4953 } } }
    }
];

const SingleServiceCard: React.FC<{ service: GasStoveService; onViewDetails: (service: GasStoveService) => void }> = ({ service, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = SERVICE_IMAGES_MAP[service.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % photos.length); };
    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length); };

    const getRating = () => service.serviceData?.rating?.toFixed(1) || null;
    const getUserRatingsTotal = () => service.serviceData?.user_ratings_total || null;
    const isOpen = service.serviceData?.opening_hours?.open_now;

    const handleCall = (e: React.MouseEvent) => { e.stopPropagation(); const phone = PHONE_NUMBERS_MAP[service.id]; if (phone) window.location.href = `tel:${phone}`; };
    const handleDirections = (e: React.MouseEvent) => { 
        e.stopPropagation(); 
        const lat = service.serviceData?.geometry?.location.lat;
        const lng = service.serviceData?.geometry?.location.lng;
        if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    return (
        <div onClick={() => onViewDetails(service)} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={service.title} className="w-full h-full object-cover" />
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl"><Wrench size={48} /></div>
                )}
            </div>

            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{service.title}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{service.location}</span>
                </div>
                {service.distance && <p className="text-xs font-semibold text-green-600">{service.distance} km away</p>}
                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{SERVICE_DESCRIPTIONS_MAP[service.id] || service.description}</p>

                <div className="flex items-center gap-3 text-sm pt-2">
                    {getRating() && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{getRating()}</span>
                            <span className="text-gray-500">({getUserRatingsTotal()})</span>
                        </div>
                    )}
                    {isOpen !== undefined && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={12} />
                            <span className="text-xs font-semibold">{isOpen ? "Open" : "Closed"}</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 pt-4 mt-auto">
                    <button onClick={handleDirections} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold">
                        <Navigation size={16} />
                        Directions
                    </button>
                    <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold">
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const GasStoveServiceCard: React.FC<GasStoveServiceCardProps> = ({ service, onViewDetails }) => {
    if (!service) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_SERVICES.map((s) => (
                    <SingleServiceCard key={s.id} service={s} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }
    return <SingleServiceCard service={service} onViewDetails={onViewDetails} />;
};

export default GasStoveServiceCard;
