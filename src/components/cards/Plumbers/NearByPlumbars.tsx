import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, Shield } from "lucide-react";

interface Plumber {
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
        is_trending?: boolean;
        is_verified?: boolean;
        response_time?: string;
        geometry?: { location: { lat: number; lng: number } };
    };
}

interface PlumberCardProps {
    plumber?: Plumber;
    onViewDetails: (plumber: Plumber) => void;
}

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
    plumber_1: "09980813368",
    plumber_2: "09725328306",
    plumber_3: "07411657055",
    plumber_4: "08460384308",
};

// Dummy images
const PLUMBER_IMAGES_MAP: Record<string, string[]> = {
    plumber_1: [
        "https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800",
        "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800",
    ],
    plumber_2: [
        "https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?w=800",
        "https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=800",
    ],
    plumber_3: [
        "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800",
        "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800",
    ],
    plumber_4: [
        "https://images.unsplash.com/photo-1590642916589-592bca10dfbf?w=800",
        "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800",
    ],
};

const PLUMBER_DESCRIPTIONS_MAP: Record<string, string> = {
    plumber_1: "Professional plumbing services including installation, repair, and maintenance for residential and commercial properties.",
    plumber_2: "Expert plumbing solutions available 24/7. Specializing in emergency repairs, leak detection, and pipe installations.",
    plumber_3: "Certified plumbing contractors offering comprehensive services from minor repairs to complete plumbing system installations.",
    plumber_4: "Experienced plumbing professionals providing quality workmanship for all your plumbing needs with quick response times.",
};

const PLUMBER_SERVICES = ["Repair", "Installation", "24/7 Emergency", "Leak Detection"];

// Dummy data
const DUMMY_PLUMBERS: Plumber[] = [
    {
        id: "plumber_1",
        title: "Hkgn Plumbing Works",
        description: PLUMBER_DESCRIPTIONS_MAP["plumber_1"],
        location: "Devender Nagar Jeedimetla, Hyderabad",
        distance: 5.9,
        category: "Plumbers",
        serviceData: {
            rating: 4.1,
            user_ratings_total: 33,
            opening_hours: { open_now: true },
            is_trending: true,
            is_verified: true,
            response_time: "4 Hours",
            geometry: { location: { lat: 17.5074, lng: 78.4778 } }
        }
    },
    {
        id: "plumber_2",
        title: "Mr Raja",
        description: PLUMBER_DESCRIPTIONS_MAP["plumber_2"],
        location: "Sanath Nagar, Hyderabad",
        distance: 4.2,
        category: "Plumbers",
        serviceData: {
            rating: 4.1,
            user_ratings_total: 24,
            opening_hours: { open_now: true },
            is_trending: true,
            is_verified: true,
            response_time: "2 Hours",
            geometry: { location: { lat: 17.4574, lng: 78.4378 } }
        }
    },
    {
        id: "plumber_3",
        title: "Shashikanta Plumbing Works",
        description: PLUMBER_DESCRIPTIONS_MAP["plumber_3"],
        location: "Suraram Colony Suraram, Hyderabad",
        distance: 5.5,
        category: "Plumbers",
        serviceData: {
            rating: 4.4,
            user_ratings_total: 13,
            opening_hours: { open_now: true },
            is_trending: false,
            is_verified: true,
            response_time: "3 Hours",
            geometry: { location: { lat: 17.5274, lng: 78.4978 } }
        }
    },
    {
        id: "plumber_4",
        title: "Modern Plumbing Services",
        description: PLUMBER_DESCRIPTIONS_MAP["plumber_4"],
        location: "Allaudin Koti Sanath Nagar, Hyderabad",
        distance: 3.8,
        category: "Plumbers",
        serviceData: {
            rating: 4.5,
            user_ratings_total: 15,
            opening_hours: { open_now: true },
            is_trending: true,
            is_verified: true,
            response_time: "2 Hours",
            geometry: { location: { lat: 17.4474, lng: 78.4278 } }
        }
    }
];

const SinglePlumberCard: React.FC<{ plumber: Plumber; onViewDetails: (plumber: Plumber) => void }> = ({ plumber, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = PLUMBER_IMAGES_MAP[plumber.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    };
    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const getRating = () => plumber.serviceData?.rating?.toFixed(1) || null;
    const getUserRatingsTotal = () => plumber.serviceData?.user_ratings_total || null;
    const isOpen = plumber.serviceData?.opening_hours?.open_now;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[plumber.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = plumber.serviceData?.geometry?.location.lat;
        const lng = plumber.serviceData?.geometry?.location.lng;
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
        }
    };

    return (
        <div
            onClick={() => onViewDetails(plumber)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={plumber.title} className="w-full h-full object-cover" />
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🔧</div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {plumber.serviceData?.is_verified && (
                        <div className="flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            <Shield size={12} /> Verified
                        </div>
                    )}
                    {plumber.serviceData?.is_trending && (
                        <div className="flex items-center gap-1 bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            🔥 Trending
                        </div>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{plumber.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{plumber.location}</span>
                </div>

                {plumber.distance && (
                    <p className="text-xs font-semibold text-green-600">{plumber.distance} km away</p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{PLUMBER_DESCRIPTIONS_MAP[plumber.id] || plumber.description}</p>

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
                        {PLUMBER_SERVICES.slice(0, 3).map((service, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs"
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

const PlumberCard: React.FC<PlumberCardProps> = (props) => {
    if (!props.plumber) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_PLUMBERS.map((plumber) => (
                    <SinglePlumberCard
                        key={plumber.id}
                        plumber={plumber}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }
    return <SinglePlumberCard plumber={props.plumber} onViewDetails={props.onViewDetails} />;
};

export default PlumberCard;
