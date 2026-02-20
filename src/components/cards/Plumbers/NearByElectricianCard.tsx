import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, Zap } from "lucide-react";

interface Electrician {
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

interface ElectricianCardProps {
    electrician?: Electrician;
    onViewDetails: (electrician: Electrician) => void;
}

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
    electrician_1: "08460391974",
    electrician_2: "09980862164",
    electrician_3: "08128627061",
    electrician_4: "08197827545",
};

// Images
const ELECTRICIAN_IMAGES_MAP: Record<string, string[]> = {
    electrician_1: [
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
        "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800",
    ],
    electrician_2: [
        "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    electrician_3: [
        "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800",
        "https://images.unsplash.com/photo-1621905252472-364626c2f756?w=800",
    ],
    electrician_4: [
        "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800",
        "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800",
    ],
};

// Descriptions
const ELECTRICIAN_DESCRIPTIONS_MAP: Record<string, string> = {
    electrician_1: "Professional electrical services for residential and commercial properties.",
    electrician_2: "24/7 emergency electrical services. Specializing in house wiring and troubleshooting.",
    electrician_3: "Licensed electrical contractor offering complete electrical solutions.",
    electrician_4: "Experienced electrician providing quality work with focus on safety.",
};

// Services
const ELECTRICIAN_SERVICES = ["Wiring", "Installation", "Repair", "Maintenance"];

// Dummy data
const DUMMY_ELECTRICIANS: Electrician[] = [
    {
        id: "electrician_1",
        title: "Kumar Swamy Electricians",
        description: ELECTRICIAN_DESCRIPTIONS_MAP["electrician_1"],
        location: "Nearby Moosapet, Hyderabad",
        distance: 3.2,
        category: "Electricians",
        serviceData: { rating: 5.0, user_ratings_total: 4, opening_hours: { open_now: true }, geometry: { location: { lat: 17.4874, lng: 78.4378 } } }
    },
    {
        id: "electrician_2",
        title: "Electriction House Wiring Works",
        description: ELECTRICIAN_DESCRIPTIONS_MAP["electrician_2"],
        location: "Y Junction Kukatpally, Hyderabad",
        distance: 2.8,
        category: "Electricians",
        serviceData: { rating: 4.8, user_ratings_total: 224, opening_hours: { open_now: true }, geometry: { location: { lat: 17.5074, lng: 78.4578 } } }
    },
    {
        id: "electrician_3",
        title: "Dinesh Electrical Contractor",
        description: ELECTRICIAN_DESCRIPTIONS_MAP["electrician_3"],
        location: "Hno 42-162 Jagadgirigutta, Hyderabad",
        distance: 2.9,
        category: "Electricians",
        serviceData: { rating: 4.9, user_ratings_total: 52, opening_hours: { open_now: true }, geometry: { location: { lat: 17.5174, lng: 78.4678 } } }
    },
    {
        id: "electrician_4",
        title: "Sree Sai Electrician Contractor",
        description: ELECTRICIAN_DESCRIPTIONS_MAP["electrician_4"],
        location: "Quthbullapur Chintal, Hyderabad",
        distance: 4.5,
        category: "Electricians",
        serviceData: { rating: 4.0, user_ratings_total: 57, opening_hours: { open_now: true }, geometry: { location: { lat: 17.5274, lng: 78.4778 } } }
    }
];

const SingleElectricianCard: React.FC<{ electrician: Electrician; onViewDetails: (electrician: Electrician) => void }> = ({ electrician, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = ELECTRICIAN_IMAGES_MAP[electrician.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const getRating = () => electrician.serviceData?.rating?.toFixed(1) || null;
    const getUserRatingsTotal = () => electrician.serviceData?.user_ratings_total || null;
    const isOpen = electrician.serviceData?.opening_hours?.open_now;

    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % photos.length); };
    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length); };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[electrician.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = electrician.serviceData?.geometry?.location.lat;
        const lng = electrician.serviceData?.geometry?.location.lng;
        if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    return (
        <div onClick={() => onViewDetails(electrician)} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={electrician.title} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{currentImageIndex + 1}/{photos.length}</div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl"><Zap size={40} /></div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{electrician.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{electrician.location}</span>
                </div>

                {electrician.distance && <p className="text-xs font-semibold text-green-600">{electrician.distance} km away</p>}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{ELECTRICIAN_DESCRIPTIONS_MAP[electrician.id] || electrician.description}</p>

                {/* Rating & Status */}
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

                {/* Services */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
                    <div className="flex flex-wrap gap-2">
                        {ELECTRICIAN_SERVICES.slice(0, 3).map((service, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 px-2 py-1 rounded text-xs">
                                ✓ {service}
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

const ElectricianCard: React.FC<ElectricianCardProps> = (props) => {
    if (!props.electrician) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_ELECTRICIANS.map((electrician) => (
                    <SingleElectricianCard key={electrician.id} electrician={electrician} onViewDetails={props.onViewDetails} />
                ))}
            </div>
        );
    }
    return <SingleElectricianCard electrician={props.electrician} onViewDetails={props.onViewDetails} />;
};

export default ElectricianCard;
