import React, { useState, useMemo } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, Calendar, ShieldCheck, TrendingUp } from "lucide-react";

/* ================= TYPES ================= */

export interface SolarService {
    id: string;
    title: string;
    location?: string;
    description?: string;
    distance?: number | string;
    category?: string;
    serviceData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
        yearsInBusiness?: number;
        verified?: boolean;
        trending?: boolean;
        startingPrice?: string;
    };
}

interface Props {
    service?: SolarService;
    onViewDetails: (service: SolarService) => void;
}

/* ================= DATA ================= */

const PHONE_MAP: Record<string, string> = {
    solar_1: "08734909694",
    solar_2: "08792484056",
    solar_3: "08460450072",
    solar_4: "07411965034",
};

const IMAGES: Record<string, string[]> = {
    solar_1: [
        "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
        "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800",
    ],
    solar_2: [
        "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=800",
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800",
    ],
    solar_3: [
        "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800",
        "https://images.unsplash.com/photo-1532601224476-15c79f2f7a51?w=800",
    ],
    solar_4: [
        "https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=800",
        "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800",
    ],
};

const SOLAR_SERVICES = ["Residential Installation", "Commercial Projects", "Maintenance", "Free Consultation"];

/* ================= DUMMY DATA ================= */

const DUMMY_SOLAR_SERVICES: SolarService[] = [
    {
        id: "solar_1",
        title: "Expert Solar Solutions",
        location: "Hyderabad, Ranga Nagar",
        distance: 20.7,
        description: "Professional solar panel installation services.",
        serviceData: {
            rating: 4.5,
            user_ratings_total: 48,
            opening_hours: { open_now: true },
            yearsInBusiness: 9,
            verified: false,
            trending: false,
            geometry: { location: { lat: 17.4065, lng: 78.4772 } },
        },
    },
    {
        id: "solar_2",
        title: "TRUZON SOLAR",
        location: "Hyderabad",
        distance: 4.5,
        description: "Trusted solar energy systems provider.",
        serviceData: {
            rating: 4.6,
            user_ratings_total: 1077,
            opening_hours: { open_now: true },
            yearsInBusiness: 18,
            verified: true,
            trending: true,
            geometry: { location: { lat: 17.385, lng: 78.4867 } },
        },
    },
    {
        id: "solar_3",
        title: "Vanguard Energy Systems",
        location: "Hyderabad",
        distance: 16.5,
        description: "Premium solar panel solutions.",
        serviceData: {
            rating: 4.8,
            user_ratings_total: 5,
            opening_hours: { open_now: true },
            yearsInBusiness: 7,
            verified: true,
            trending: true,
            geometry: { location: { lat: 17.4239, lng: 78.4738 } },
        },
    },
    {
        id: "solar_4",
        title: "Ecotonic Solar",
        location: "Hyderabad",
        distance: 17.7,
        description: "Affordable solar power solutions.",
        serviceData: {
            rating: 4.4,
            user_ratings_total: 23,
            opening_hours: { open_now: true },
            yearsInBusiness: 5,
            trending: true,
            startingPrice: "₹25K/KW",
            geometry: { location: { lat: 17.4326, lng: 78.3985 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SingleSolarCard: React.FC<{ service: SolarService; onViewDetails: (service: SolarService) => void }> = ({ service, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = useMemo(() => IMAGES[service.id] || IMAGES["solar_1"], [service.id]);
    const currentPhoto = photos[currentImageIndex];
    const phone = PHONE_MAP[service.id];

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
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = service.serviceData?.geometry?.location.lat;
        const lng = service.serviceData?.geometry?.location.lng;
        if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    return (
        <div
            onClick={() => onViewDetails(service)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
        >
            {/* Image Carousel */}
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">☀️</div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                    {service.serviceData?.verified && (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <ShieldCheck size={12} /> Verified
                        </span>
                    )}
                    {service.serviceData?.trending && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                            <TrendingUp size={12} /> Trending
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{service.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{service.location}</span>
                </div>

                {service.distance && <p className="text-xs font-semibold text-green-600">{service.distance} km away</p>}

                {service.serviceData?.yearsInBusiness && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Calendar size={12} /> {service.serviceData.yearsInBusiness} Years Experience
                    </div>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{service.description}</p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {service.serviceData?.rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{service.serviceData.rating}</span>
                            <span className="text-gray-500">({service.serviceData.user_ratings_total})</span>
                        </div>
                    )}
                    {service.serviceData?.opening_hours && (
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${service.serviceData.opening_hours.open_now ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={12} />
                            <span className="text-xs font-semibold">{service.serviceData.opening_hours.open_now ? "Open" : "Closed"}</span>
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
                    <div className="flex flex-wrap gap-2">
                        {SOLAR_SERVICES.slice(0, 3).map((s, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                                ✓ {s}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Buttons */}
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

/* ================= WRAPPER ================= */

const NearbySolarServiceCard: React.FC<Props> = ({ service, onViewDetails }) => {
    if (!service) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_SOLAR_SERVICES.map((s) => (
                    <SingleSolarCard key={s.id} service={s} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleSolarCard service={service} onViewDetails={onViewDetails} />;
};

export default NearbySolarServiceCard;
