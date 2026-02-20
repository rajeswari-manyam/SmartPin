import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteIndustrialService, IndustrialWorker } from "../services/IndustrialService.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

// ============================================================================
// HELPERS
// ============================================================================
const getCategoryIcon = (category: string = ""): string => {
    const cat = category.toLowerCase();
    if (cat.includes("borewell")) return "🚜";
    if (cat.includes("fabricator")) return "🔧";
    if (cat.includes("transport")) return "🚛";
    if (cat.includes("water") || cat.includes("tank")) return "💧";
    if (cat.includes("scrap")) return "♻️";
    if (cat.includes("machine")) return "⚙️";
    if (cat.includes("mover") || cat.includes("packer")) return "📦";
    return "🏭";
};

// ============================================================================
// PROPS
// ============================================================================
interface IndustrialUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const IndustrialUserService: React.FC<IndustrialUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [services, setServices] = useState<IndustrialWorker[]>(data as IndustrialWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? services.filter(s =>
            s.category &&
            s.category.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : services;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-industrial-service-form?id=${id}`);
    const handleView = (id: string) => navigate(`/industrial-services/details/${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        setDeleteLoading(id);
        try {
            const result = await deleteIndustrialService(id);
            if (result.success) {
                setServices(prev => prev.filter(s => s._id !== id));
            } else {
                alert("Failed to delete service. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD — matches EventUserService card layout
    // ============================================================================
    const renderCard = (service: IndustrialWorker) => {
        const id = service._id || "";
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const location = [service.area, service.city, service.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const isAvailable = service.availability !== false;
        const description = service.description || "";
        const displayName = service.serviceName || "Unnamed Service";
        const phone = (((service as any).phone || (service as any).mobile || (service as any).contact || (service as any).ownerPhone || (service as any).whatsapp || (service as any).phoneNumber) as string) || undefined;
        const icon = getCategoryIcon(service.category);

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
                        <div className="w-full h-full flex items-center justify-center bg-orange-600/5">
                            <span className="text-6xl">{icon}</span>
                        </div>
                    )}

                    {/* Category badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {service.category || "Industrial"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600" />
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

                    {/* Category pill + Availability status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-orange-700 bg-orange-600/8 border border-orange-600/20 px-3 py-1.5 rounded-full truncate">
                            {service.subCategory || service.category || "Industrial"}
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

                    {/* Service detail chips (shown when no description) */}
                    {!description && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {service.chargeType && (
                                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                                    {service.chargeType}
                                </span>
                            )}
                            {service.experience && (
                                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                                    🏭 {service.experience} yrs exp
                                </span>
                            )}
                            {service.subCategory && (
                                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                                    {service.subCategory}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Rating row + optional phone + charge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {service.rating ? service.rating.toFixed(1) : "N/A"}
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
                            <span className="ml-auto text-sm font-bold text-orange-700">
                                ₹{service.serviceCharge.toLocaleString()}
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
                        <span>🏭</span> Industrial Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🏭</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Industrial Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your industrial services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-industrial-service-form")}
                        className="gap-1.5 bg-orange-600 hover:bg-orange-700"
                    >
                        + Add Industrial Service
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
                    <span>🏭</span> Industrial Services ({filteredServices.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredServices.map(renderCard)}
            </div>
        </div>
    );
};

export default IndustrialUserService;