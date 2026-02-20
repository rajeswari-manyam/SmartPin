import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, Layers, Check } from "lucide-react";

interface LeaseService {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
        amenities?: string[];
        services_offered?: string[];
    };
}

interface NearbyLeaseCardProps {
    job?: LeaseService;
    onViewDetails: (job: LeaseService) => void;
}

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
    lease_1: "07947103114",
    lease_2: "08850277262",
    lease_3: "07942696916",
    lease_4: "08975371212",
    lease_5: "09876543210",
};

// Dummy images
const LEASE_IMAGES_MAP: Record<string, string[]> = {
    lease_1: [
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
        "https://images.unsplash.com/photo-1554224311-beee460c201a?w=800",
    ],
    lease_2: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    ],
    lease_3: [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    ],
    lease_4: [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    ],
    lease_5: [
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    ],
};

// Dummy services/features
const LEASE_FEATURES = ["Lease Agreements", "Legal Documentation", "Registration Services", "Quick Processing"];

const SingleLeaseCard: React.FC<{ job: LeaseService; onViewDetails: (job: LeaseService) => void }> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = LEASE_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const rating = job.jobData?.rating?.toFixed(1);
    const userRatingsTotal = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const amenities = job.jobData?.amenities || LEASE_FEATURES;
    const servicesOffered = job.jobData?.services_offered || [];

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
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col h-full"
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
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📄</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{job.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{job.location}</span>
                </div>

                {job.distance && (
                    <p className="text-xs font-semibold text-purple-600">{job.distance} km away</p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{job.description}</p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 text-sm pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            <span className="font-semibold">{rating}</span>
                            <span className="text-gray-500">({userRatingsTotal})</span>
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

                {/* Services / Features */}
                <div className="pt-2">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Features:</p>
                    <div className="flex flex-wrap gap-2">
                        {amenities.slice(0, 3).map((feature, idx) => (
                            <span
                                key={idx}
                                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs"
                            >
                                <Check size={12} /> {feature}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
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

const NearbyLeaseCard: React.FC<NearbyLeaseCardProps> = ({ job, onViewDetails }) => {
    // Dummy data if no job provided
    const DUMMY_LEASES: LeaseService[] = [
        { id: "lease_1", title: "Rent Agreement - Easy Home Services", location: "171 Pune Sus, Pune", distance: 8.5 },
        { id: "lease_2", title: "Online lease agreement registration", location: "Kala Chowki, Mumbai", distance: 12.3 },
        { id: "lease_3", title: "Da Lease Agreement", location: "Sr.No.36 Sundarangan Banglo Mundhwa Lonkar Nagar, Pune", distance: 5.8 },
        { id: "lease_4", title: "DA Lease Agreements", location: "Mundhawa Mundhwa, Pune", distance: 6.2 },
        { id: "lease_5", title: "Ec Rental Lease Agreement And Other Document Services", location: "G, Krishnamurthy Layout, Bangalore", distance: 15.4 },
    ];

    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_LEASES.map((lease) => (
                    <SingleLeaseCard key={lease.id} job={lease} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleLeaseCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyLeaseCard;
