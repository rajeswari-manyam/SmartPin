// src/components/cards/NearbySalonCard.tsx
import React, { useState, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    CheckCircle
} from "lucide-react";

export interface SalonService {
    place_id: string;
    name: string;
    vicinity: string;
    rating: number;
    user_ratings_total: number;
    photos: { photo_reference: string }[];
    geometry: { location: { lat: number; lng: number } };
    business_status: string;
    opening_hours: { open_now: boolean };
    price_level: number;
    distance: number;
    special_tags: string[];
    amenities: string[];
    categories: string[];
    services?: { name: string; price: string; per?: string }[];
}

interface NearbySalonCardProps {
    job?: any;
    onViewDetails: (job: any) => void;
}

// Dummy phone mapping
const PHONE_NUMBERS_MAP: Record<string, string> = {
    salon_1: "07095652428",
    salon_2: "07942693173",
    salon_3: "07942678028",
    salon_4: "07947429470",
};

// Dummy salon data
export const DUMMY_SALONS: SalonService[] = [
    {
        place_id: "salon_1",
        name: "M S Hair King Saloon",
        vicinity: "Quthbullapur Main Road Jeedimetla, Hyderabad",
        rating: 4.8,
        user_ratings_total: 157,
        photos: [{ photo_reference: "salon_photo_1" }],
        geometry: { location: { lat: 17.5100, lng: 78.4350 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        distance: 1.8,
        special_tags: ["Top Rated"],
        amenities: ["Facial", "Hair Spa"],
        categories: ["Salon"],
        services: [
            { name: "Facial", price: "from ₹3,000", per: "session" },
            { name: "Hair Spa", price: "from ₹1,200", per: "session" },
            { name: "Hair Cut", price: "from ₹500", per: "session" },
        ],
    },
    // Add more dummy salons here...
];

// Dummy images
const SALON_IMAGES_MAP: Record<string, string[]> = {
    salon_1: [
        "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
        "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
    ],
    salon_2: [
        "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=800",
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=800",
    ],
};

// Component for single salon card
const SingleSalonCard: React.FC<NearbySalonCardProps> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = SALON_IMAGES_MAP[job?.id] || SALON_IMAGES_MAP["salon_1"];

    const handlePrevImage = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : prev));
    }, []);

    const handleNextImage = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex(prev => (prev < photos.length - 1 ? prev + 1 : prev));
    }, [photos.length]);

    const getPhoneNumber = useCallback(() => PHONE_NUMBERS_MAP[job?.id], [job]);

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl cursor-pointer overflow-hidden transition"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-100">
                {photos.length > 0 ? (
                    <img
                        src={photos[currentImageIndex]}
                        alt={job.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-5xl">💇‍♀️</div>
                )}

                {photos.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                        >
                            <ChevronLeft size={18} className="text-white" />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
                        >
                            <ChevronRight size={18} className="text-white" />
                        </button>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{job.title}</h3>

                <div className="flex items-center text-sm text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                <p className="text-purple-600 text-xs font-semibold mb-2">
                    {job.distance} km away
                </p>

                {job.special_tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                        {job.special_tags.map((tag: string, i: number) => (
                            <span
                                key={i}
                                className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${tag === "Top Rated" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                                    }`}
                            >
                                {tag === "Top Rated" ? <Star size={11} /> : <Clock size={11} />}
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{job.description}</p>

                <div className="flex items-center gap-2 mb-2">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-sm">{job.jobData?.rating}</span>
                    <span className="text-xs text-gray-500">({job.jobData?.user_ratings_total})</span>
                    {job.jobData?.opening_hours?.open_now && (
                        <span className="ml-auto text-xs px-2 py-1 rounded bg-green-100 text-green-700 flex items-center gap-1">
                            <Clock size={11} /> Open Now
                        </span>
                    )}
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1 mb-3">
                    {job.amenities?.slice(0, 3).map((amenity: string) => (
                        <span
                            key={amenity}
                            className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded"
                        >
                            <CheckCircle size={11} /> {amenity}
                        </span>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const lat = job.jobData?.geometry?.location?.lat;
                            const lng = job.jobData?.geometry?.location?.lng;
                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
                        }}
                        className="flex-1 border-2 border-purple-600 text-purple-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                        <Navigation size={14} /> Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${getPhoneNumber()}`;
                        }}
                        className="flex-1 border-2 border-green-600 text-green-600 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                        <Phone size={14} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

// Wrapper component to list multiple salons
const NearbySalonCard: React.FC<NearbySalonCardProps> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_SALONS.map((salon) => (
                    <SingleSalonCard
                        key={salon.place_id}
                        job={{
                            id: salon.place_id,
                            title: salon.name,
                            location: salon.vicinity,
                            distance: salon.distance,
                            jobData: salon,
                            description: salon.name,
                            special_tags: salon.special_tags,
                            amenities: salon.amenities,
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleSalonCard {...props} />;
};

export default NearbySalonCard;
