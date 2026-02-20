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
} from "lucide-react";

/* ================= TYPES ================= */

export interface MachineWorkService {
    place_id: string;
    name: string;
    vicinity: string;
    rating: number;
    user_ratings_total: number;
    photos: { photo_reference: string }[];
    geometry: {
        location: { lat: number; lng: number };
    };
    business_status: string;
    opening_hours: { open_now: boolean };
    price_level: number;
    types: string[];
    special_tags: string[];
    distance: number;
}

/* ================= CONSTANTS ================= */

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
    machine_1: "07947056169",
    machine_2: "07942698031",
    machine_3: "07947117550",
    machine_4: "07942687068",
    machine_5: "09035504120",
};

// Dummy data
export const DUMMY_MACHINE_WORK: MachineWorkService[] = [
    {
        place_id: "machine_1",
        name: "General Sewing Machine Works",
        vicinity: "Bakaram, Hyderabad",
        rating: 4.3,
        user_ratings_total: 160,
        photos: [{ photo_reference: "machine_photo_1" }],
        geometry: { location: { lat: 17.4065, lng: 78.4772 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["machine_work", "repair"],
        special_tags: ["GST", "Verified", "Trending", "Trust"],
        distance: 10.0,
    },
    {
        place_id: "machine_2",
        name: "MK Refrigerator & Washing Machine Work",
        vicinity: "Kalapather-Ramnas Pura, Hyderabad",
        rating: 4.0,
        user_ratings_total: 3,
        photos: [{ photo_reference: "machine_photo_2" }],
        geometry: { location: { lat: 17.407, lng: 78.478 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["machine_work", "repair"],
        special_tags: ["Washing Machine Repair", "Second Hand Dealers"],
        distance: 16.0,
    },
    {
        place_id: "machine_3",
        name: "Ahmed Sewing Machine Repair Works",
        vicinity: "Uppal, Hyderabad",
        rating: 4.2,
        user_ratings_total: 26,
        photos: [{ photo_reference: "machine_photo_3" }],
        geometry: { location: { lat: 17.408, lng: 78.479 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["machine_work", "repair"],
        special_tags: ["Trending", "Sewing Machine Repair"],
        distance: 14.6,
    },
    {
        place_id: "machine_4",
        name: "Khaja Sewing Machine Works",
        vicinity: "Hafeezpet, Hyderabad",
        rating: 4.7,
        user_ratings_total: 3,
        photos: [{ photo_reference: "machine_photo_4" }],
        geometry: { location: { lat: 17.409, lng: 78.48 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["machine_work", "repair"],
        special_tags: ["Trending", "Usha Repairs"],
        distance: 10.6,
    },
    {
        place_id: "machine_5",
        name: "Keerthi Computer Embroidery Works",
        vicinity: "Kukatpally, Hyderabad",
        rating: 3.0,
        user_ratings_total: 1,
        photos: [{ photo_reference: "machine_photo_5" }],
        geometry: { location: { lat: 17.4075, lng: 78.4795 } },
        business_status: "OPERATIONAL",
        opening_hours: { open_now: true },
        price_level: 2,
        types: ["machine_work", "embroidery"],
        special_tags: ["Embroidery Job Works"],
        distance: 12.5,
    },
];

// Images
const MACHINE_IMAGES_MAP: Record<string, string[]> = {
    machine_1: [
        "https://images.unsplash.com/photo-1520214572569-0d593dc3f1f2?w=800",
        "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800",
    ],
    machine_2: [
        "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800",
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800",
    ],
    machine_3: [
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
        "https://images.unsplash.com/photo-1520214572569-0d593dc3f1f2?w=800",
    ],
    machine_4: [
        "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800",
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    ],
    machine_5: [
        "https://images.unsplash.com/photo-1520214572569-0d593dc3f1f2?w=800",
        "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800",
    ],
};

// Descriptions
const MACHINE_DESCRIPTIONS_MAP: Record<string, string> = {
    machine_1:
        "Top-rated machine work service with 4.3★ rating and 160 reviews. Trusted and Verified.",
    machine_2:
        "Reliable refrigerator and washing machine repair service. Quick and affordable.",
    machine_3:
        "Professional sewing machine repair service with experienced technicians.",
    machine_4:
        "Highly rated sewing machine works. Specialized in Usha machines.",
    machine_5:
        "Computer embroidery and machine works with modern equipment.",
};

// Services
const MACHINE_SERVICES = [
    "Sewing Machine Repair",
    "Embroidery Work",
    "Machine Maintenance",
    "Parts Replacement",
    "On-Site Service",
    "All Brands Supported",
];

/* ================= COMPONENT ================= */

interface MachineWorkCardProps {
    job?: any;
    onViewDetails: (job: any) => void;
}

const SingleMachineWorkCard: React.FC<MachineWorkCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos =
        MACHINE_IMAGES_MAP[job?.id || "machine_1"] ||
        MACHINE_IMAGES_MAP["machine_1"];

    const rating = job?.jobData?.rating;
    const reviews = job?.jobData?.user_ratings_total;
    const isOpen = job?.jobData?.opening_hours?.open_now;
    const phone = PHONE_NUMBERS_MAP[job?.id];

    if (!job) return null;

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-[0.99]"
        >
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
                <img
                    src={photos[currentImageIndex]}
                    className="w-full h-full object-cover"
                />

                {photos.length > 1 && (
                    <>
                        {currentImageIndex > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex((p) => p - 1);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}

                        {currentImageIndex < photos.length - 1 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentImageIndex((p) => p + 1);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                            >
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                <h3 className="text-[17px] font-bold mb-1.5">{job.title}</h3>

                <div className="flex items-center text-gray-500 text-[13px] mb-1">
                    <MapPin size={14} className="mr-1" />
                    {job.location}
                </div>

                <p className="text-xs font-semibold text-blue-600 mb-2">
                    {job.distance.toFixed(1)} km away
                </p>

                <p className="text-[13px] text-gray-600 mb-2.5 line-clamp-3">
                    {MACHINE_DESCRIPTIONS_MAP[job.id]}
                </p>

                <div className="flex items-center gap-2 mb-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span>{rating.toFixed(1)}</span>
                            <span className="text-xs text-gray-500">({reviews})</span>
                        </div>
                    )}

                    <div
                        className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                            }`}
                    >
                        <Clock size={11} />
                        {isOpen ? "Available 24/7" : "Currently Unavailable"}
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                    {MACHINE_SERVICES.slice(0, 4).map((s, i) => (
                        <span
                            key={i}
                            className="bg-blue-100 text-blue-600 text-[11px] px-2 py-1 rounded inline-flex items-center gap-1"
                        >
                            <CheckCircle size={11} /> {s}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const loc = job.jobData.geometry.location;
                            window.open(
                                `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
                                "_blank"
                            );
                        }}
                        className="flex-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-xs py-2.5 rounded-lg"
                    >
                        <Navigation size={14} /> Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${phone}`;
                        }}
                        className="flex-1 border-2 border-blue-600 bg-blue-50 text-blue-600 font-bold text-xs py-2.5 rounded-lg"
                    >
                        <Phone size={14} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= WRAPPER ================= */

const MachineWorkCard: React.FC<MachineWorkCardProps> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_MACHINE_WORK.map((m) => (
                    <SingleMachineWorkCard
                        key={m.place_id}
                        job={{
                            id: m.place_id,
                            title: m.name,
                            location: m.vicinity,
                            distance: m.distance,
                            jobData: m,
                        }}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SingleMachineWorkCard
            job={props.job}
            onViewDetails={props.onViewDetails}
        />
    );
};

export default MachineWorkCard;
