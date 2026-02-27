import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCorporateService } from "../services/Corporate.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import ActionDropdown from "../components/ActionDropDown";

// ============================================================================
// TYPES
// ============================================================================
interface CorporateService {
    _id: string;
    userId: string;
    serviceName: string;
    description: string;
    subCategory: string;
    serviceCharge: number;
    chargeType: string;
    latitude: number;
    longitude: number;
    area: string;
    city: string;
    state: string;
    pincode: string;
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
}

// ============================================================================
// HELPERS
// ============================================================================
const getIcon = (subCategory?: string) => {
    const n = (subCategory || "").toLowerCase();
    if (n.includes("background")) return "🔍";
    if (n.includes("courier") || n.includes("document")) return "📦";
    if (n.includes("cleaning") || n.includes("office")) return "🧹";
    if (n.includes("recruitment")) return "👥";
    if (n.includes("it") || n.includes("tech")) return "💻";
    if (n.includes("security")) return "🔒";
    return "🏢";
};

// ============================================================================
// PROPS
// ============================================================================
interface CorporativeUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const CorporativeUserService: React.FC<CorporativeUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [services, setServices] = useState<CorporateService[]>(data as CorporateService[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? services.filter(s =>
            s.subCategory &&
            s.subCategory.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : services;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-corporative-service-form?id=${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        setDeleteLoading(id);
        try {
            const result = await deleteCorporateService(id);
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
    // CARD — matches CourierUserService exactly
    // ============================================================================
    const renderCard = (service: CorporateService) => {
        const id = service._id || "";
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const location = [service.area, service.city, service.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const icon = getIcon(service.subCategory);
        const isActive = (service as any).status !== false;
        const phone = (service as any).phone || (service as any).contactNumber || (service as any).phoneNumber;

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-[#00598a] hover:-translate-y-1"
            >
                {/* ── Image ── */}
                <div className="relative h-52 bg-gray-100">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.serviceName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#00598a]/5">
                            <span className="text-6xl">{icon}</span>
                        </div>
                    )}

                    {/* SubCategory badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {service.subCategory || "Corporate"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
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
                        {service.serviceName || "Unnamed Service"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-red-500 text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* SubCategory pill + Active status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-[#00598a] bg-[#00598a]/8 border border-[#00598a]/20 px-3 py-1.5 rounded-full truncate">
                            {service.subCategory || "Corporate Services"}
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

                    {/* Description */}
                    {service.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{service.description}</p>
                    )}

                    {/* Detail chips (shown when no description) */}
                    {!service.description && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {service.chargeType && (
                                <span className="text-xs bg-[#00598a]/5 text-[#00598a] px-2 py-0.5 rounded-full">
                                    {service.chargeType}
                                </span>
                            )}
                            {service.pincode && (
                                <span className="text-xs bg-[#00598a]/5 text-[#00598a] px-2 py-0.5 rounded-full">
                                    📮 {service.pincode}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Charge row + optional phone */}
                    <div className="flex items-center gap-2 mb-4">
                        {service.serviceCharge ? (
                            <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                                💰 ₹{service.serviceCharge}
                                {service.chargeType ? ` / ${service.chargeType}` : ""}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 bg-[#00598a]/5 border border-[#00598a]/20 text-[#00598a] text-sm font-semibold px-3 py-1 rounded-full">
                                🏢 {service.subCategory || "Corporate"}
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
                        <span>🏢</span> Corporate Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🏢</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Corporate Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your corporate services to showcase them here.
                    </p>
                    <button
                        onClick={() => navigate("/add-corporative-service-form")}
                        className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold bg-[#00598a] hover:bg-[#004a73] transition-colors"
                    >
                        + Add Corporate Service
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
                    <span>🏢</span> Corporate Services ({filteredServices.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredServices.map(renderCard)}
            </div>
        </div>
    );
};

export default CorporativeUserService;