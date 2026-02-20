import React, { useState, useCallback } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface Cafe {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
    };
}

interface NearbyCafeCardProps {
    job?: Cafe;
    onViewDetails: (job: Cafe) => void;
}

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
    cafe_1: "07947117076",
    cafe_2: "07947117076",
    cafe_3: "07947117076",
    cafe_4: "07947117076",
};

// Dummy images
const CAFE_IMAGES_MAP: Record<string, string[]> = {
    cafe_1: [
        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800",
        "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800",
    ],
    cafe_2: [
        "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800",
        "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800",
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
    ],
    cafe_3: [
        "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=800",
        "https://images.unsplash.com/photo-1587241321921-91a834d82e76?w=800",
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",
    ],
    cafe_4: [
        "https://images.unsplash.com/photo-1497636577773-f1231844b336?w=800",
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800",
        "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800",
    ],
};

const CAFE_DESCRIPTIONS_MAP: Record<string, string> = {
    cafe_1: "Cozy cafe and bakery serving freshly baked goods, artisanal coffee, and delicious breakfast options.",
    cafe_2: "Trendy cafe specializing in hot and cold beverages, smoothies, and quick bites.",
    cafe_3: "Premium French patisserie offering authentic croissants, pastries, and gourmet coffee.",
    cafe_4: "Modern cafe with a relaxed vibe, serving quality coffee, sandwiches, and light meals.",
};

const CAFE_SERVICES = ["Dine-in", "Takeaway", "Free WiFi", "Outdoor Seating"];

// Dummy Data for the list view
const DUMMY_CAFES: Cafe[] = [
    {
        id: "cafe_1",
        title: "The Cozy Cup",
        description: CAFE_DESCRIPTIONS_MAP["cafe_1"],
        location: "123 Baker Street, London",
        distance: 0.8,
        category: "Cafe",
        jobData: {
            rating: 4.8,
            user_ratings_total: 124,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 51.5074, lng: -0.1278 } }
        }
    },
    {
        id: "cafe_2",
        title: "Urban Sips",
        description: CAFE_DESCRIPTIONS_MAP["cafe_2"],
        location: "45 Oxford St, London",
        distance: 1.2,
        category: "Cafe",
        jobData: {
            rating: 4.5,
            user_ratings_total: 89,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 51.5154, lng: -0.1418 } }
        }
    },
    {
        id: "cafe_3",
        title: "La Patisserie",
        description: CAFE_DESCRIPTIONS_MAP["cafe_3"],
        location: "10 Downing St, London",
        distance: 2.5,
        category: "Cafe",
        jobData: {
            rating: 4.9,
            user_ratings_total: 230,
            opening_hours: { open_now: false },
            geometry: { location: { lat: 51.5034, lng: -0.1276 } }
        }
    },
    {
        id: "cafe_4",
        title: "Chill & Grind",
        description: CAFE_DESCRIPTIONS_MAP["cafe_4"],
        location: "Hyde Park, London",
        distance: 3.0,
        category: "Cafe",
        jobData: {
            rating: 4.6,
            user_ratings_total: 156,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 51.5073, lng: -0.1657 } }
        }
    }
];

const SingleCafeCard: React.FC<{ job: Cafe; onViewDetails: (job: Cafe) => void }> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = CAFE_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const getRating = () => job.jobData?.rating?.toFixed(1) || null;
    const getUserRatingsTotal = () => job.jobData?.user_ratings_total || null;
    const isOpen = job.jobData?.opening_hours?.open_now;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = job.jobData?.geometry?.location.lat;
        const lng = job.jobData?.geometry?.location.lng;
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
        }
    };

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={job.title} className="w-full h-full object-cover" />
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">☕</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{job.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{job.location}</span>
                </div>

                {job.distance && (
                    <p className="text-xs font-semibold text-green-600">{job.distance} km away</p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{CAFE_DESCRIPTIONS_MAP[job.id] || job.description}</p>

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
                        {CAFE_SERVICES.slice(0, 3).map((service, idx) => (
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

const NearbyCafeCard: React.FC<NearbyCafeCardProps> = (props) => {
    // If no job is provided, render the list of dummy cafes
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_CAFES.map((cafe) => (
                    <SingleCafeCard
                        key={cafe.id}
                        job={cafe}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // If job is provided, render individual card
    return <SingleCafeCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyCafeCard;
