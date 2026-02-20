import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

/* ================= TYPES ================= */

export interface ROWaterPurifierService {
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
        popular?: boolean;
        suggestions?: number;
    };
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    service_1: "09054760539",
    service_2: "07048175481",
    service_3: "07487014090",
    service_4: "07411818486",
};

const SERVICE_IMAGES_MAP: Record<string, string[]> = {
    service_1: [
        "https://images.unsplash.com/photo-1563207153-f403bf289096?w=800",
        "https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=800",
        "https://images.unsplash.com/photo-1603793303277-ed67787545e6?w=800",
    ],
    service_2: [
        "https://images.unsplash.com/photo-1584555684040-bad07cb4c344?w=800",
        "https://images.unsplash.com/photo-1624372645767-78f2f8e0cf04?w=800",
        "https://images.unsplash.com/photo-1604754742629-7e0d0a658e2d?w=800",
    ],
    service_3: [
        "https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=800",
        "https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800",
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800",
    ],
    service_4: [
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
        "https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=800",
        "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800",
    ],
};

const SERVICE_DESCRIPTIONS_MAP: Record<string, string> = {
    service_1:
        "Expert RO water purifier repair and maintenance services. Specialized in all brands with filter replacement and membrane cleaning. Quick response and reliable service.",
    service_2:
        "Professional water purifier solutions with certified technicians. Quick response time for installation and repair services. Available for all major brands.",
    service_3:
        "Comprehensive RO services including copper filter repairs, TDS controller, and annual maintenance contracts available. Experienced technicians.",
    service_4:
        "Authorized service center for major water purifier brands. Factory-trained technicians with genuine spare parts. Quality service guaranteed.",
};

const RO_SERVICES = [
    "Filter Replacement",
    "Membrane Cleaning",
    "TDS Controller",
    "Installation",
    "Annual Maintenance",
    "Copper Filter Repair",
    "Leak Repair",
    "Water Testing",
];

/* ================= DUMMY DATA ================= */

export const DUMMY_SERVICES: ROWaterPurifierService[] = [
    {
        id: "service_1",
        title: "Naveen Water Purifier Service",
        description: SERVICE_DESCRIPTIONS_MAP["service_1"],
        location: "Road 12 Gajularamaram, Hyderabad",
        distance: 3.0,
        category: "Copper Ro Water Purifier Repair",
        serviceData: {
            rating: 4.5,
            user_ratings_total: 2,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4924, lng: 78.4124 } },
            responsive: true,
            verified: false,
        },
    },
    {
        id: "service_2",
        title: "PR Water Solutions",
        description: SERVICE_DESCRIPTIONS_MAP["service_2"],
        location: "Anjaiah Nagar Jagadgiri Gutta, Hyderabad",
        distance: 3.4,
        category: "Water Purifier Repair & Services",
        serviceData: {
            rating: 4.8,
            user_ratings_total: 73,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5084, lng: 78.4524 } },
            popular: true,
            verified: true,
            suggestions: 19,
        },
    },
    {
        id: "service_3",
        title: "Srr Enterprises",
        description: SERVICE_DESCRIPTIONS_MAP["service_3"],
        location: "Pet Basheerabad Jeedimetla, Hyderabad",
        distance: 3.7,
        category: "Copper Ro Water Purifier Repair",
        serviceData: {
            rating: 4.3,
            user_ratings_total: 80,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4875, lng: 78.4324 } },
            topSearch: true,
            verified: true,
        },
    },
    {
        id: "service_4",
        title: "Sriven H2o Enterprises",
        description: SERVICE_DESCRIPTIONS_MAP["service_4"],
        location: "GAJULARAMARAM VILLAGE Suraram Village, Hyderabad",
        distance: 6.2,
        category: "Water Purifier Repair & Services",
        serviceData: {
            rating: 5.0,
            user_ratings_total: 5,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5124, lng: 78.4724 } },
            trending: true,
            verified: false,
        },
    },
];

/* ================= COMPONENT ================= */

interface SingleServiceCardProps {
    service: ROWaterPurifierService;
    onViewDetails: (service: ROWaterPurifierService) => void;
}

const SingleServiceCard: React.FC<SingleServiceCardProps> = ({ service, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = SERVICE_IMAGES_MAP[service.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const isOpen = service.serviceData?.opening_hours?.open_now;
    const rating = service.serviceData?.rating?.toFixed(1);
    const userRatingsTotal = service.serviceData?.user_ratings_total;
    const phone = PHONE_NUMBERS_MAP[service.id];

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = service.serviceData?.geometry?.location.lat;
        const lng = service.serviceData?.geometry?.location.lng;
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
        }
    };

    return (
        <div
            onClick={() => onViewDetails(service)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
        >
            {/* Image */}
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">💧</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{service.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{service.location}</span>
                </div>

                {service.distance && <p className="text-xs font-semibold text-green-600">{service.distance} km away</p>}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{SERVICE_DESCRIPTIONS_MAP[service.id] || service.description}</p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            {userRatingsTotal && <span className="text-gray-500">({userRatingsTotal})</span>}
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
                        {RO_SERVICES.slice(0, 4).map((srv, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-cyan-50 text-cyan-700 px-2 py-1 rounded text-xs">
                                <CheckCircle size={12} /> {srv}
                            </span>
                        ))}
                        {RO_SERVICES.length > 4 && <span className="inline-flex items-center bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">+{RO_SERVICES.length - 4} more</span>}
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

interface ROWaterPurifierRepairServicesProps {
    service?: ROWaterPurifierService;
    onViewDetails: (service: ROWaterPurifierService) => void;
}

const ROWaterPurifierRepairServices: React.FC<ROWaterPurifierRepairServicesProps> = ({ service, onViewDetails }) => {
    if (!service) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_SERVICES.map((srv) => (
                    <SingleServiceCard key={srv.id} service={srv} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleServiceCard service={service} onViewDetails={onViewDetails} />;
};

export default ROWaterPurifierRepairServices;
