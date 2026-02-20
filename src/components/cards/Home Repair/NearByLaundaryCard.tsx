import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, Droplet, Shield } from "lucide-react";

/* ---------- TYPES ---------- */

interface LaundryService {
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
        price_indicator?: string;
        response_time?: string;
        verified?: boolean;
    };
}

interface NearbyLaundryCardProps {
    service?: LaundryService;
    onViewDetails: (service: LaundryService) => void;
}

/* ---------- CONSTANTS ---------- */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    laundry_1: "08511204127",
    laundry_2: "08971682401",
    laundry_3: "08904614810",
    laundry_4: "07947117076",
};

const LAUNDRY_IMAGES_MAP: Record<string, string[]> = {
    laundry_1: [
        "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800",
        "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
    ],
    laundry_2: [
        "https://images.unsplash.com/photo-1604335399105-a0c585fd81a1?w=800",
    ],
    laundry_3: [
        "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=800",
    ],
    laundry_4: [
        "https://images.unsplash.com/photo-1489274495757-95c7c837b101?w=800",
    ],
};

const LAUNDRY_SERVICES = ["Wash & Fold", "Dry Cleaning", "Steam Pressing", "Home Delivery"];

/* ---------- DUMMY DATA ---------- */

const DUMMY_LAUNDRY_SERVICES: LaundryService[] = [
    {
        id: "laundry_1",
        title: "Dark to White Laundry Services",
        location: "Bowenpally, Hyderabad",
        distance: 2.7,
        serviceData: {
            rating: 4.5,
            user_ratings_total: 26,
            opening_hours: { open_now: true },
            verified: true,
        },
    },
    {
        id: "laundry_2",
        title: "Eco Dry Cleaners",
        location: "Bowenpally, Hyderabad",
        distance: 2.1,
        serviceData: {
            rating: 4.8,
            user_ratings_total: 513,
            opening_hours: { open_now: true },
        },
    },
];

/* ---------- SINGLE CARD ---------- */

const SingleLaundryCard: React.FC<{ service: LaundryService; onViewDetails: (s: LaundryService) => void }> = ({
    service,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = LAUNDRY_IMAGES_MAP[service.id] || [];

    const rating = service.serviceData?.rating?.toFixed(1);
    const isOpen = service.serviceData?.opening_hours?.open_now;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[service.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (service.serviceData?.geometry) {
            const loc = service.serviceData.geometry.location;
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`, "_blank");
        } else {
            const dest = encodeURIComponent(service.location || "");
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");
        }
    };

    return (
        <div
            onClick={() => onViewDetails(service)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                {photos.length ? (
                    <img src={photos[currentImageIndex]} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <Droplet size={48} />
                    </div>
                )}

                {service.serviceData?.verified && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex gap-1">
                        <Shield size={12} /> Verified
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h3 className="font-bold text-lg">{service.title}</h3>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={14} /> {service.location}
                </div>

                <p className="text-xs text-green-600 font-semibold">{service.distance} km away</p>

                <div className="flex items-center gap-3 text-sm">
                    {rating && (
                        <div className="flex gap-1 items-center">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span>{rating}</span>
                        </div>
                    )}
                    {isOpen !== undefined && (
                        <span className={`text-xs px-2 py-0.5 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            <Clock size={12} className="inline" /> {isOpen ? "Open" : "Closed"}
                        </span>
                    )}
                </div>

                {/* Services */}
                <div className="flex flex-wrap gap-2">
                    {LAUNDRY_SERVICES.slice(0, 3).map((s) => (
                        <span key={s} className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                            ✓ {s}
                        </span>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-3 mt-auto">
                    <button
                        onClick={handleCall}
                        className="flex-1 bg-green-50 text-green-700 border border-green-600 rounded-lg py-2 font-semibold"
                    >
                        <Phone size={16} /> Call
                    </button>
                    <button
                        onClick={handleDirections}
                        className="flex-1 bg-indigo-50 text-indigo-700 border border-indigo-600 rounded-lg py-2 font-semibold"
                    >
                        <Navigation size={16} /> Directions
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ---------- WRAPPER (LIKE CAFE) ---------- */

const NearbyLaundryCard: React.FC<NearbyLaundryCardProps> = ({ service, onViewDetails }) => {
    // LIST VIEW
    if (!service) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_LAUNDRY_SERVICES.map((laundry) => (
                    <SingleLaundryCard
                        key={laundry.id}
                        service={laundry}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // SINGLE CARD VIEW
    return <SingleLaundryCard service={service} onViewDetails={onViewDetails} />;
};

export default NearbyLaundryCard;
