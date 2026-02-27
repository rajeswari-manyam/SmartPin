import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteRealEstateService, RealEstateWorker } from "../services/RealEstate.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

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
// PROPS
// ============================================================================
interface RealEstateUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const RealEstateUserService: React.FC<RealEstateUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [realEstates, setRealEstates] = useState<RealEstateWorker[]>(data as RealEstateWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredRealEstates = selectedSubcategory
        ? realEstates.filter(re =>
            re.propertyType &&
            re.propertyType.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : realEstates;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-real-estate-form?id=${id}`);
    const handleView = (id: string) => navigate(`/real-estate/details/${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this listing?")) return;
        setDeleteLoading(id);
        try {
            const res = await deleteRealEstateService(id);
            if (res.success) {
                setRealEstates(prev => prev.filter(re => re._id !== id));
            } else {
                alert(res.message || "Failed to delete listing. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting real estate:", error);
            alert("Failed to delete listing. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD
    // ============================================================================
    const renderCard = (re: RealEstateWorker) => {
        const id = re._id || "";
        const imageUrls = (re.images || []).filter(Boolean) as string[];
        const location = [re.area, re.city, re.state].filter(Boolean).join(", ") || "Location not specified";
        const amenitiesList = ensureArray(re.amenities);
        const isAvailable = re.availabilityStatus === "Available";
        const description = re.description || "";
        const displayName = re.name || `${re.propertyType || "Property"} — ${re.listingType || ""}`;
        const phone = (re as any).phone || (re as any).contactNumber || (re as any).phoneNumber;

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group
                           hover:shadow-lg hover:border-[#00598a]/30 transition-all duration-200 cursor-pointer"
                onClick={() => handleView(id)}
            >
                {/* ── Image ── */}
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={displayName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-600/5 group-hover:bg-[#00598a]/8 transition-colors duration-200">
                            <span className="text-6xl">🏠</span>
                        </div>
                    )}

                    {/* Property Type badge — bottom left */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {re.propertyType || "Real Estate"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: "#00598a" }} />
                            </div>
                        ) : (
                            <ActionDropdown
                                onEdit={() => handleEdit(id)}
                                onDelete={() => handleDelete(id)}
                            />
                        )}
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="p-4">

                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-[#00598a] transition-colors duration-200">
                        {displayName}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* Category pill + Availability status */}
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="flex-1 text-center text-sm font-medium px-3 py-1.5 rounded-full truncate border transition-colors duration-200
                                       text-[#00598a] border-[#00598a]/20 group-hover:bg-[#00598a] group-hover:text-white group-hover:border-[#00598a]"
                            style={{ backgroundColor: "rgba(0,89,138,0.06)" }}
                        >
                            {re.propertyType || "Real Estate"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
                            isAvailable
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-red-500 bg-red-50 border-red-200"
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`} />
                            {isAvailable ? "Available" : "Unavailable"}
                        </span>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>
                    )}

                    {/* Amenity chips (shown when no description) */}
                    {!description && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {re.listingType && (
                                <span className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200
                                                 bg-[#00598a]/6 text-[#00598a] border-[#00598a]/20
                                                 group-hover:bg-[#00598a] group-hover:text-white group-hover:border-[#00598a]">
                                    {re.listingType}
                                </span>
                            )}
                            {re.bedrooms > 0 && (
                                <span className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200
                                                 bg-[#00598a]/6 text-[#00598a] border-[#00598a]/20
                                                 group-hover:bg-[#00598a] group-hover:text-white group-hover:border-[#00598a]">
                                    🛏️ {re.bedrooms} BHK
                                </span>
                            )}
                            {re.areaSize && (
                                <span className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200
                                                 bg-[#00598a]/6 text-[#00598a] border-[#00598a]/20
                                                 group-hover:bg-[#00598a] group-hover:text-white group-hover:border-[#00598a]">
                                    📏 {re.areaSize} sq ft
                                </span>
                            )}
                            {amenitiesList.slice(0, 2).map((a, idx) => (
                                <span key={idx}
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200
                                               bg-[#00598a]/6 text-[#00598a] border-[#00598a]/20
                                               group-hover:bg-[#00598a] group-hover:text-white group-hover:border-[#00598a]">
                                    {a}
                                </span>
                            ))}
                            {amenitiesList.length > 2 && (
                                <span className="text-xs text-gray-400 px-1 self-center">
                                    +{amenitiesList.length - 2} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Rating + phone + price row */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {(re as any).rating ? (re as any).rating : "N/A"}
                        </span>

                        {phone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {phone}
                            </span>
                        )}

                        {re.price && (
                            <span className="ml-auto text-sm font-bold" style={{ color: "#00598a" }}>
                                ₹{Number(re.price).toLocaleString()}
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
    if (filteredRealEstates.length === 0) {
        if (hideEmptyState) return null;

        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🏠</span> Real Estate Listings (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🏠</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Property Listings Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your property listings to showcase them here.
                    </p>
                    <button
                        onClick={() => navigate("/add-real-estate-form")}
                        className="px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                        style={{ backgroundColor: "#00598a" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#004a73"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00598a"; }}
                    >
                        + Add Property
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
                <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                    <span>🏠</span> Real Estate Listings ({filteredRealEstates.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredRealEstates.map(renderCard)}
            </div>
        </div>
    );
};

export default RealEstateUserService;