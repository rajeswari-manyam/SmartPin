import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAgricultureById, AgricultureService } from "../services/Agriculture.service";
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

const getCategoryIcon = (subCategory: string | undefined): string => {
    if (!subCategory) return "🌾";
    const n = subCategory.toLowerCase();
    if (n.includes("tractor")) return "🚜";
    if (n.includes("water") || n.includes("pump")) return "💧";
    if (n.includes("fertilizer")) return "🌱";
    if (n.includes("seed")) return "🌾";
    if (n.includes("tool") || n.includes("equipment")) return "🔧";
    if (n.includes("veterinary") || n.includes("vet") || n.includes("animal")) return "🐄";
    return "🌾";
};

// ============================================================================
// PROPS
// ============================================================================
interface AgricultureUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const AgricultureUserService: React.FC<AgricultureUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [services, setServices] = useState<AgricultureService[]>(data as AgricultureService[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ───────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? services.filter(s =>
            s.subCategory &&
            s.subCategory.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : services;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-agriculture-service-form?id=${id}`);
    const handleView = (id: string) => navigate(`/agriculture-services/details/${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this agriculture service?")) return;
        setDeleteLoading(id);
        try {
            await deleteAgricultureById(id);
            setServices(prev => prev.filter(s => s._id !== id));
        } catch (error) {
            console.error("Error deleting service:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD — matches DailyWageUserService card layout
    // ============================================================================
    const renderServiceCard = (service: AgricultureService) => {
        const id = service._id || "";
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const location = [service.area, service.city, service.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const phone = (((service as any).phone || (service as any).mobile || (service as any).contact || (service as any).ownerPhone || (service as any).whatsapp || (service as any).phoneNumber) as string) || undefined;
        const isAvailable = (service as any).availability !== false;
        const description = service.description || (service as any).bio || "";
        const displayName = service.serviceName || "Unnamed Service";
        const icon = getCategoryIcon(service.subCategory);
        const extras = ensureArray((service as any).services || (service as any).skills);

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
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-green-700/5">
                            <span className="text-6xl">{icon}</span>
                        </div>
                    )}

                    {/* SubCategory badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {service.subCategory || "Agriculture"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700" />
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
                        {displayName}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* SubCategory pill + Availability status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-green-800 bg-green-700/8 border border-green-700/20 px-3 py-1.5 rounded-full truncate">
                            {service.subCategory || "Agriculture"}
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

                    {/* Detail chips (shown when no description) */}
                    {!description && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {service.chargeType && (
                                <span className="text-xs bg-green-50 text-green-800 px-2 py-0.5 rounded-full border border-green-200">
                                    {service.chargeType}
                                </span>
                            )}
                            {(service as any).experience && (
                                <span className="text-xs bg-green-50 text-green-800 px-2 py-0.5 rounded-full border border-green-200">
                                    🌾 {(service as any).experience} yrs exp
                                </span>
                            )}
                            {extras.slice(0, 2).map((s, idx) => (
                                <span key={idx} className="text-xs bg-green-50 text-green-800 px-2 py-0.5 rounded-full border border-green-200">
                                    {s}
                                </span>
                            ))}
                            {extras.length > 2 && (
                                <span className="text-xs text-gray-400 px-1 self-center">
                                    +{extras.length - 2} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Rating row + optional phone + charge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {(service as any).rating ? (service as any).rating : "N/A"}
                        </span>

                        {phone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {phone}
                            </span>
                        )}

                        {service.serviceCharge && (
                            <span className="ml-auto text-sm font-bold text-green-800">
                                ₹{service.serviceCharge}{service.chargeType ? `/${service.chargeType}` : ""}
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
                        <span>🌾</span> Agriculture Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🌾</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Agriculture Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your agriculture services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-agriculture-service-form")}
                        className="gap-1.5 bg-green-700 hover:bg-green-800"
                    >
                        + Add Agriculture Service
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
                    <span>🌾</span> Agriculture Services ({filteredServices.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredServices.map(renderServiceCard)}
            </div>
        </div>
    );
};

export default AgricultureUserService;