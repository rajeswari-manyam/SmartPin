import React, { useState, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    CheckCircle,
    Shield,
    Award,
} from "lucide-react";

/* ================= TYPES ================= */

export interface PackerMoverType {
    id: string;
    name: string;
    location: string;
    address: string;
    description: string;
    distance: number;
    rating: number;
    totalRatings: number;
    isVerified: boolean;
    isTrusted: boolean;
    isPopular: boolean;
    isOpen: boolean;
    phone: string;
    services: string[];
    lat: number;
    lng: number;
}

interface Props {
    packer?: PackerMoverType;
    onViewDetails: (packer: PackerMoverType) => void;
}

/* ================= IMAGES ================= */

const PACKER_IMAGES: Record<string, string[]> = {
    packer_1: [
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
        "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800",
        "https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=800",
    ],
    packer_2: [
        "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
        "https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800",
    ],
    packer_3: [
        "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=800",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
    ],
    packer_4: [
        "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800",
        "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800",
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_PACKERS: PackerMoverType[] = [
    {
        id: "packer_1",
        name: "Professional Packers and Movers Private Limited",
        location: "Hyderabad",
        address: "Malkajgiri Jeedimetla Village, Hyderabad",
        description: "Professional packing and moving services with GPS tracking and insurance coverage. Specializing in household and office relocations.",
        distance: 2.2,
        rating: 4.7,
        totalRatings: 1220,
        isVerified: true,
        isTrusted: true,
        isPopular: false,
        isOpen: true,
        phone: "09395166155",
        services: ["Safe packaging", "GPS Tracking Available", "Insurance Available", "Two Wheeler Transportation"],
        lat: 17.4485,
        lng: 78.3908,
    },
    {
        id: "packer_2",
        name: "Allianz Packers and Movers Private Limited",
        location: "Hyderabad",
        address: "Dairy Farm Road Trimulgherry, Hyderabad",
        description: "Reliable and efficient moving solutions for residential and commercial relocations with 24/7 customer support.",
        distance: 3.4,
        rating: 4.9,
        totalRatings: 312,
        isVerified: true,
        isTrusted: true,
        isPopular: true,
        isOpen: true,
        phone: "07048238224",
        services: ["Safe packaging", "Two Wheeler Transportation", "Car Transportation", "GPS Tracking Available"],
        lat: 17.4645,
        lng: 78.4998,
    },
    {
        id: "packer_3",
        name: "Deluxe Home Packers and Movers",
        location: "Hyderabad",
        address: "Yadamma Nagar Alwal, Hyderabad",
        description: "Trusted name in relocation services with experienced staff and modern equipment for safe transportation.",
        distance: 5.0,
        rating: 5.0,
        totalRatings: 3259,
        isVerified: false,
        isTrusted: false,
        isPopular: true,
        isOpen: true,
        phone: "09972372997",
        services: ["Safe packaging", "Residential Relocation", "Office Relocation", "Indian Banks Association Approved"],
        lat: 17.5081,
        lng: 78.5287,
    },
    {
        id: "packer_4",
        name: "Sri Venkateshwara Packers and Movers",
        location: "Hyderabad",
        address: "Pragathinagar Colony Bachupally, Hyderabad",
        description: "Affordable and reliable packing and moving services for local and long-distance relocations.",
        distance: 10.2,
        rating: 4.3,
        totalRatings: 348,
        isVerified: true,
        isTrusted: false,
        isPopular: false,
        isOpen: true,
        phone: "08904952660",
        services: ["Residential Relocation", "Interstate Moving", "Vehicle Transportation", "Budget Friendly"],
        lat: 17.5455,
        lng: 78.3860,
    },
];

/* ================= COMPONENT ================= */

const SinglePackerCard: React.FC<Props> = ({ packer, onViewDetails }) => {
    const [imageIndex, setImageIndex] = useState(0);

    const photos = PACKER_IMAGES[packer?.id ?? "packer_1"] || PACKER_IMAGES["packer_1"];

    const prevImage = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setImageIndex((p) => Math.max(p - 1, 0));
    }, []);

    const nextImage = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setImageIndex((p) => Math.min(p + 1, photos.length - 1));
    }, [photos.length]);

    const callNow = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (packer?.phone) {
            window.location.href = `tel:${packer.phone}`;
        }
    }, [packer?.phone]);

    const openDirections = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (packer?.lat && packer?.lng) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${packer.lat},${packer.lng}`,
                "_blank"
            );
        }
    }, [packer?.lat, packer?.lng]);

    if (!packer) return null;

    const visibleServices = packer.services.slice(0, 4);
    const moreServices =
        packer.services.length > 4 ? packer.services.length - 4 : 0;

    return (
        <div
            onClick={() => onViewDetails(packer)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden mb-4"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
                <img
                    src={photos[imageIndex]}
                    className="w-full h-full object-cover"
                    alt={packer.name}
                />

                {imageIndex > 0 && (
                    <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}

                {imageIndex < photos.length - 1 && (
                    <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {imageIndex + 1}/{photos.length}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                    {packer.name}
                </h3>

                <div className="flex items-center text-gray-500 text-sm mb-1">
                    <MapPin size={14} className="mr-1" />
                    {packer.address}
                </div>

                <p className="text-xs text-red-600 font-semibold mb-2">
                    {packer.distance} km away
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                    {packer.isVerified && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Shield size={12} /> Verified
                        </span>
                    )}
                    {packer.isTrusted && (
                        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded flex items-center gap-1">
                            <Award size={12} /> Trusted
                        </span>
                    )}
                    {packer.isPopular && (
                        <span className="bg-rose-100 text-rose-700 text-xs px-2 py-1 rounded">
                            Popular
                        </span>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {packer.description}
                </p>

                {/* Rating & Status */}
                <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-sm">
                            {packer.rating}
                        </span>
                        <span className="text-xs text-gray-500">
                            ({packer.totalRatings})
                        </span>
                    </div>

                    <div
                        className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${packer.isOpen
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        <Clock size={12} />
                        {packer.isOpen ? "Open Now" : "Closed"}
                    </div>
                </div>

                {/* Services */}
                <div className="mb-3">
                    <p className="text-xs font-bold text-gray-500 mb-1">
                        SERVICES:
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {visibleServices.map((s, i) => (
                            <span
                                key={i}
                                className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded flex items-center gap-1"
                            >
                                <CheckCircle size={12} />
                                {s}
                            </span>
                        ))}
                        {moreServices > 0 && (
                            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                                +{moreServices} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={openDirections}
                        className="flex-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                        <Navigation size={14} />
                        Directions
                    </button>

                    <button
                        onClick={callNow}
                        className="flex-1 border-2 border-green-600 bg-green-50 text-green-700 font-bold text-xs py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                        <Phone size={14} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= LIST ================= */

const PackersMoversListing: React.FC<Props> = ({ packer, onViewDetails }) => {
    if (!packer) {
        // Render grid of dummy data
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_PACKERS.map((packerData) => (
                    <SinglePackerCard
                        key={packerData.id}
                        packer={packerData}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // Render single packer
    return <SinglePackerCard packer={packer} onViewDetails={onViewDetails} />;
};

export default PackersMoversListing;
