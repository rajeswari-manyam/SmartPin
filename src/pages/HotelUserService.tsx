import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteHotel, Hotel } from "../services/HotelService.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";

// ============================================================================
// HELPERS
// ============================================================================
const ensureArray = (input: any): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === "string") return input.split(",").map(s => s.trim()).filter(Boolean);
    return [];
};

// ============================================================================
// THREE-DOT DROPDOWN
// ============================================================================
interface ThreeDotMenuProps {
    onEdit: () => void;
    onDelete: () => void;
}

const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({ onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[130px]">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </button>
                    <div className="h-px bg-gray-100" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// PROPS
// ============================================================================
interface HotelUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const HotelUserService: React.FC<HotelUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState<Hotel[]>(data as Hotel[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    const filteredHotels = selectedSubcategory
        ? hotels.filter(h => h.type?.toLowerCase().includes(selectedSubcategory.toLowerCase()))
        : hotels;

    const handleEdit = (id: string) => navigate(`/add-hotel-service-form?id=${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        setDeleteLoading(id);
        try {
            const response = await deleteHotel(id);
            if (response.success) {
                setHotels(prev => prev.filter(h => h._id !== id));
            } else {
                alert(response.message || "Failed to delete service. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting hotel:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleView = (id: string) => navigate(`/hotel-services/details/${id}`);

    const openDirections = (hotel: Hotel) => {
        if (hotel.latitude && hotel.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude},${hotel.longitude}`, "_blank");
        } else if (hotel.area || hotel.city) {
            const addr = encodeURIComponent([hotel.area, hotel.city, hotel.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    // ============================================================================
    // CARD — matches the screenshot style
    // ============================================================================
    const renderCard = (hotel: Hotel) => {
        const id = hotel._id || "";
        const location = [hotel.area, hotel.city, hotel.state].filter(Boolean).join(", ") || "Location not specified";
        const servicesList = ensureArray(hotel.service);
        const imageUrls = (hotel.images || []).filter(Boolean) as string[];
        const isActive = hotel.status === "active" || hotel.isActive;

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => handleView(id)}
            >
                {/* ── Image ── */}
                <div className="relative w-full" style={{ height: "200px" }}>
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={hotel.name || "Hotel"}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                            <span className="text-7xl">🏨</span>
                        </div>
                    )}

                    {/* Dark gradient overlay at bottom for badge */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Type badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="text-white text-xs font-semibold bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                            {hotel.type || "Hotel & Travel"}
                        </span>
                    </div>

                    {/* Three-dot menu — top right */}
                    <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                        {deleteLoading === id ? (
                            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            </div>
                        ) : (
                            <ThreeDotMenu
                                onEdit={() => handleEdit(id)}
                                onDelete={() => handleDelete(id)}
                            />
                        )}
                    </div>
                </div>

                {/* ── Card Body ── */}
                <div className="p-4">
                    {/* Name */}
                    <h3 className="text-[17px] font-bold text-gray-900 mb-1 truncate">
                        {hotel.name || "Unnamed Service"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm">📍</span>
                        <p className="text-sm text-gray-500 truncate">{location}</p>
                    </div>

                    {/* Category pill + Active badge */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-sm text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-medium">
                            {hotel.type || "Hotel & Travel"}
                        </span>
                        {isActive !== undefined && (
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                                isActive
                                    ? "text-green-600 bg-green-50 border-green-200"
                                    : "text-gray-400 bg-gray-50 border-gray-200"
                            }`}>
                                <span className={`inline-block w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {hotel.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {hotel.description}
                        </p>
                    )}

                    {/* Services Tags */}
                    {servicesList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                            {servicesList.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                    {s}
                                </span>
                            ))}
                            {servicesList.length > 3 && (
                                <span className="text-xs text-gray-400">+{servicesList.length - 3} more</span>
                            )}
                        </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {hotel.ratings || "4.5"}
                        </span>
                        {hotel.priceRange && (
                            <span className="ml-auto text-base font-bold text-green-600">
                                ₹{hotel.priceRange}
                            </span>
                        )}
                    </div>

                 
                   
                </div>
            </div>
        );
    };

    // ============================================================================
    // EMPTY STATE
    // ============================================================================
    if (filteredHotels.length === 0) {
        if (hideEmptyState) return null;
        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🏨</span> Hotel & Travel Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                    <div className="text-6xl mb-4">🏨</div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No Hotel Services Yet</h3>
                    <p className="text-sm text-gray-500 mb-5">
                        Start adding your hotel and travel services to showcase them here.
                    </p>
                    <button
                        onClick={() => navigate("/add-hotel-service-form")}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        + Add Hotel Service
                    </button>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div>
            {!hideHeader && (
                <h2 className={`${typography.heading.h5} text-gray-800 mb-4 flex items-center gap-2`}>
                    <span>🏨</span> Hotel & Travel Services ({filteredHotels.length})
                </h2>
            )}
            {/* Single column on mobile (like screenshot), 2-3 on larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredHotels.map(renderCard)}
            </div>
        </div>
    );
};

export default HotelUserService;