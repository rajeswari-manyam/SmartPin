import React, { useState } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    Star,
    ChevronLeft,
    ChevronRight,
    Briefcase,
} from "lucide-react";

/* ================= TYPES ================= */

export interface Supplier {
    id: string;
    title: string;
    description?: string;
    location?: string;
    category?: string;
    supplierData?: {
        rating?: number;
        user_ratings_total?: number;
        years_in_business?: number;
        geometry?: { location: { lat: number; lng: number } };
    };
}

interface NearbyPartySupplierCardProps {
    supplier?: Supplier;
    onViewDetails: (supplier: Supplier) => void;
}

/* ================= MOCK DATA ================= */

const PHONE_MAP: Record<string, string> = {
    supplier_1: "07942689410",
    supplier_2: "07947412930",
    supplier_3: "07947126551",
    supplier_4: "07947121612",
};

const SUPPLIER_IMAGES: Record<string, string[]> = {
    supplier_1: [
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
        "https://images.unsplash.com/photo-1464347744102-11db6282f854?w=800",
    ],
    supplier_2: [
        "https://images.unsplash.com/photo-1523438097201-512ae7d59c44?w=800",
        "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
    ],
    supplier_3: [
        "https://images.unsplash.com/photo-1478146896981-b80fe463b330?w=800",
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800",
    ],
    supplier_4: [
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
        "https://images.unsplash.com/photo-1519167758481-83f29da8c6b7?w=800",
    ],
};

const SUPPLIER_SERVICES: Record<string, string[]> = {
    supplier_1: ["DJ", "Decorators"],
    supplier_2: ["Event Organisers", "Birthday Decor"],
    supplier_3: ["Decoration Materials", "Lighting"],
    supplier_4: ["Same Day Delivery", "In-Store Pickup"],
};

const DUMMY_SUPPLIERS: Supplier[] = [
    {
        id: "supplier_1",
        title: "Dhurga Bhavani Decorations",
        description: "Complete party decoration & gift wholesale solutions",
        location: "Mahabubnagar",
        supplierData: {
            rating: 5,
            user_ratings_total: 1,
            years_in_business: 4,
            geometry: { location: { lat: 16.7514, lng: 78.0055 } },
        },
    },
    {
        id: "supplier_2",
        title: "CK Decorations & Rentals",
        description: "Professional event decoration & rental services",
        location: "Guntur",
        supplierData: {
            rating: 4.9,
            user_ratings_total: 10,
            years_in_business: 13,
            geometry: { location: { lat: 16.3067, lng: 80.4365 } },
        },
    },
    {
        id: "supplier_3",
        title: "Navrang Decorations",
        description: "Premium decoration materials & lighting solutions",
        location: "Bangalore",
        supplierData: {
            rating: 5,
            user_ratings_total: 23,
            years_in_business: 3,
            geometry: { location: { lat: 12.9716, lng: 77.5946 } },
        },
    },
];

/* ================= SINGLE CARD ================= */

const SinglePartySupplierCard: React.FC<{
    supplier: Supplier;
    onViewDetails: (supplier: Supplier) => void;
}> = ({ supplier, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const images = SUPPLIER_IMAGES[supplier.id] || [];
    const phone = PHONE_MAP[supplier.id];
    const services = SUPPLIER_SERVICES[supplier.id] || [];

    const rating = supplier.supplierData?.rating;
    const reviews = supplier.supplierData?.user_ratings_total;
    const years = supplier.supplierData?.years_in_business;
    const lat = supplier.supplierData?.geometry?.location.lat;
    const lng = supplier.supplierData?.geometry?.location.lng;

    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIndex((i) => (i + 1) % images.length);
    };

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIndex((i) => (i - 1 + images.length) % images.length);
    };

    const callNow = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (phone) window.location.href = `tel:${phone}`;
    };

    const openMaps = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lat && lng) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                "_blank"
            );
        }
    };

    return (
        <div
            onClick={() => onViewDetails(supplier)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer overflow-hidden h-full flex flex-col"
        >
            {/* IMAGE */}
            <div className="relative h-48 shrink-0">
                <img
                    src={images[index]}
                    alt={supplier.title}
                    className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {index + 1}/{images.length}
                        </span>
                    </>
                )}
            </div>

            {/* CONTENT */}
            <div className="p-4 space-y-3 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                    {supplier.title}
                </h3>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={14} />
                    <span>{supplier.location}</span>
                </div>

                <p className="text-sm text-gray-600 line-clamp-3">
                    {supplier.description}
                </p>

                {/* Rating */}
                {rating && (
                    <div className="flex items-center gap-2 text-sm">
                        <Star className="fill-yellow-400 text-yellow-400" size={14} />
                        <span className="font-semibold">{rating}</span>
                        <span className="text-gray-500">({reviews})</span>
                    </div>
                )}

                {years && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Briefcase size={14} />
                        {years} Years in Business
                    </div>
                )}

                {/* Services */}
                <div className="flex flex-wrap gap-2 pt-1">
                    {services.slice(0, 3).map((service, i) => (
                        <span
                            key={i}
                            className="bg-indigo-50 text-indigo-600 text-xs px-2 py-1 rounded"
                        >
                            ✓ {service}
                        </span>
                    ))}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={openMaps}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>
                    <button
                        onClick={callNow}
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

/* ================= LIST / DETAIL ================= */

const NearbyPartySupplierCard: React.FC<NearbyPartySupplierCardProps> = ({
    supplier,
    onViewDetails,
}) => {
    if (!supplier) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_SUPPLIERS.map((item) => (
                    <SinglePartySupplierCard
                        key={item.id}
                        supplier={item}
                        onViewDetails={onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return (
        <SinglePartySupplierCard
            supplier={supplier}
            onViewDetails={onViewDetails}
        />
    );
};

export default NearbyPartySupplierCard;
