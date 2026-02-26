import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteWeddingService, WeddingWorker } from "../services/Wedding.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

// ============================================================================
// PROPS
// ============================================================================
interface WeddingUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const WeddingUserService: React.FC<WeddingUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [services, setServices] = useState<WeddingWorker[]>(data as WeddingWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? services.filter(s =>
            s.subCategory &&
            s.subCategory.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : services;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-wedding-service-form?id=${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this wedding service?")) return;
        setDeleteLoading(id);
        try {
            const res = await deleteWeddingService(id);
            if (res.success) {
                setServices(prev => prev.filter(s => s._id !== id));
            } else {
                alert(res.message || "Failed to delete service. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting wedding service:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD
    // ============================================================================
    const renderCard = (service: WeddingWorker) => {
        const id = service._id || "";
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const location = [service.area, service.city, service.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const isActive = (service as any).status !== false;
        const phone = (service as any).phone || (service as any).contactNumber || (service as any).phoneNumber;
        const isHovered = hoveredCard === id;

        return (
            <div
                key={id}
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all duration-300 cursor-pointer"
                style={{
                    boxShadow: isHovered
                        ? '0 8px 30px rgba(0, 89, 138, 0.18)'
                        : '0 1px 4px rgba(0,0,0,0.06)',
                    borderColor: isHovered ? '#00598a' : '#f3f4f6',
                    transform: isHovered ? 'translateY(-3px)' : 'translateY(0)',
                }}
            >
                {/* ── Image ── */}
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.serviceName || "Service"}
                            className="w-full h-full object-cover transition-transform duration-300"
                            style={{ transform: isHovered ? 'scale(1.04)' : 'scale(1)' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center transition-colors duration-300"
                            style={{ backgroundColor: isHovered ? 'rgba(0,89,138,0.08)' : 'rgba(219,234,254,0.3)' }}
                        >
                            <span className="text-6xl">💒</span>
                        </div>
                    )}

                    {/* Top colour bar on hover */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
                        style={{
                            backgroundColor: '#00598a',
                            opacity: isHovered ? 1 : 0,
                        }}
                    />

                    {/* SubCategory badge — bottom left */}
                    <div className="absolute bottom-3 left-3">
                        <span
                            className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors duration-300"
                            style={{ backgroundColor: isHovered ? '#00598a' : 'rgba(0,0,0,0.60)' }}
                        >
                            {service.subCategory || "Wedding"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2" style={{ borderColor: '#00598a' }} />
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
                    <h3
                        className="text-lg font-bold mb-1 truncate transition-colors duration-300"
                        style={{ color: isHovered ? '#00598a' : '#111827' }}
                    >
                        {service.serviceName || "Unnamed Service"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm" style={{ color: '#00598a' }}>📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* SubCategory pill + Active status */}
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="flex-1 text-center text-sm font-medium px-3 py-1.5 rounded-full truncate border transition-colors duration-300"
                            style={{
                                color: isHovered ? '#00598a' : '#9d174d',
                                backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : 'rgba(219,39,119,0.05)',
                                borderColor: isHovered ? 'rgba(0,89,138,0.25)' : 'rgba(219,39,119,0.15)',
                            }}
                        >
                            {service.subCategory || "Wedding Services"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${isActive
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
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-300"
                                    style={{
                                        color: isHovered ? '#00598a' : '#9d174d',
                                        backgroundColor: isHovered ? 'rgba(0,89,138,0.06)' : 'rgba(219,39,119,0.05)',
                                        borderColor: isHovered ? 'rgba(0,89,138,0.2)' : 'rgba(219,39,119,0.15)',
                                    }}
                                >
                                    {service.chargeType}
                                </span>
                            )}
                            {service.pincode && (
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-300"
                                    style={{
                                        color: isHovered ? '#00598a' : '#9d174d',
                                        backgroundColor: isHovered ? 'rgba(0,89,138,0.06)' : 'rgba(219,39,119,0.05)',
                                        borderColor: isHovered ? 'rgba(0,89,138,0.2)' : 'rgba(219,39,119,0.15)',
                                    }}
                                >
                                    📮 {service.pincode}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Charge row + optional phone */}
                    <div className="flex items-center gap-2 mb-4">
                        {service.serviceCharge ? (
                            <span
                                className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border transition-colors duration-300"
                                style={{
                                    color: isHovered ? '#00598a' : '#92400e',
                                    backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : '#fefce8',
                                    borderColor: isHovered ? 'rgba(0,89,138,0.25)' : '#fde68a',
                                }}
                            >
                                💰 ₹{Number(service.serviceCharge).toLocaleString()}
                                {service.chargeType ? ` / ${service.chargeType}` : ""}
                            </span>
                        ) : (
                            <span
                                className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border transition-colors duration-300"
                                style={{
                                    color: isHovered ? '#00598a' : '#9d174d',
                                    backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : 'rgba(219,39,119,0.05)',
                                    borderColor: isHovered ? 'rgba(0,89,138,0.25)' : 'rgba(219,39,119,0.15)',
                                }}
                            >
                                💒 {service.subCategory || "Wedding"}
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

                    {/* ── Hover CTA buttons ── */}
                    <div
                        className="flex gap-2 overflow-hidden transition-all duration-300"
                        style={{ maxHeight: isHovered ? '48px' : '0px', opacity: isHovered ? 1 : 0 }}
                    >
                        <button
                            onClick={() => handleEdit(id)}
                            className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
                            style={{ backgroundColor: '#00598a' }}
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={() => handleDelete(id)}
                            className="flex-1 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-all duration-200 active:scale-95"
                        >
                            🗑️ Delete
                        </button>
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
                        <span>💒</span> Wedding Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">💒</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>
                        {selectedSubcategory ? `No ${selectedSubcategory} Services Found` : "No Wedding Services Yet"}
                    </h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        {selectedSubcategory
                            ? `No wedding services match the "${selectedSubcategory}" category.`
                            : "Start adding your wedding services to showcase them here."}
                    </p>
                    {!selectedSubcategory && (
                        <button
                            onClick={() => navigate("/add-wedding-service-form")}
                            className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                            style={{ backgroundColor: '#00598a' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#004a73')}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00598a')}
                        >
                            + Add Your First Service
                        </button>
                    )}
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
                    <span>💒</span> Wedding Services ({filteredServices.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredServices.map(renderCard)}
            </div>
        </div>
    );
};

export default WeddingUserService;