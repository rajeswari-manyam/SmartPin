import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FoodServiceAPI from "../services/FoodService.service";
import type { FoodService } from "../services/FoodService.service";
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
interface FoodUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const FoodUserService: React.FC<FoodUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [services, setServices] = useState<FoodService[]>(data as FoodService[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? services.filter(s =>
            s.type &&
            s.type.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : services;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-food-service-form/${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this food service?")) return;
        setDeleteLoading(id);
        try {
            const res = await FoodServiceAPI.deleteFoodService(id);
            if (res.success) {
                setServices(prev => prev.filter(s => s._id !== id));
            } else {
                alert(res.error || "Failed to delete service. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting food service:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD — matches AutomotiveUserService card layout
    // ============================================================================
    const renderCard = (service: FoodService) => {
        const id = service._id || "";
        const imageUrls = ((service as any).images || []).filter(Boolean) as string[];
        const location = [service.area, service.city, service.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const cuisines = ensureArray((service as any).cuisines);
        const menuCategories = ensureArray((service as any).menuCategories);
        const phone = (service as any).phone || (service as any).contactNumber || (service as any).phoneNumber;
        const isActive = (service as any).status !== false;
        const priceRange = (service as any).priceRange || (service as any).minPrice;

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            >
                {/* ── Image ── */}
                <div className="relative h-52 bg-gray-100">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.name || "Food Service"}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-500/5">
                            <span className="text-6xl">🍽️</span>
                        </div>
                    )}

                    {/* Type badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {service.type || "Food Service"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
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
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {service.name || "Unnamed Service"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-red-500 text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* Type pill + Active status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-orange-500 bg-orange-500/8 border border-orange-500/20 px-3 py-1.5 rounded-full truncate">
                            {service.type || "Food & Catering"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
                            isActive
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-red-500 bg-red-50 border-red-200"
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Cuisines chips (always show — key info for food) */}
                    {cuisines.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {cuisines.slice(0, 3).map((cuisine, idx) => (
                                <span key={idx} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                                    {cuisine}
                                </span>
                            ))}
                            {cuisines.length > 3 && (
                                <span className="text-xs text-gray-400">+{cuisines.length - 3} more</span>
                            )}
                        </div>
                    )}

                    {/* Menu categories (shown when no cuisines) */}
                    {cuisines.length === 0 && menuCategories.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {menuCategories.slice(0, 3).map((cat, idx) => (
                                <span key={idx} className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full border border-orange-200">
                                    {cat}
                                </span>
                            ))}
                            {menuCategories.length > 3 && (
                                <span className="text-xs text-gray-400">+{menuCategories.length - 3} more</span>
                            )}
                        </div>
                    )}

                    {/* Price row + optional phone */}
                    <div className="flex items-center gap-2 mb-4">
                        {priceRange ? (
                            <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                                💰 ₹{priceRange}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full">
                                🍽️ {service.type || "Food Service"}
                            </span>
                        )}

                        {phone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {phone}
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
    if (filteredServices.length === 0) {
        if (hideEmptyState) return null;

        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🍽️</span> Food Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Food Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your food services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-food-service-form")}
                        className="gap-1.5 bg-orange-500 hover:bg-orange-600"
                    >
                        + Add Food Service
                    </Button>
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
                    <span>🍽️</span> Food Services ({filteredServices.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredServices.map(renderCard)}
            </div>
        </div>
    );
};

export default FoodUserService;