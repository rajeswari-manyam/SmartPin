import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteById, BeautyWorker } from "../services/Beauty.Service.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import ActionDropdown from "../components/ActionDropDown";

// ============================================================================
// HELPERS
// ============================================================================
const ensureArray = (input: any): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) return input.map(String);
    if (typeof input === "string") return input.split(",").map(s => s.trim()).filter(Boolean);
    return [];
};

// ============================================================================
// PROPS
// ============================================================================
interface BeautyUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const BeautyUserService: React.FC<BeautyUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [services, setServices] = useState<BeautyWorker[]>(data as BeautyWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? services.filter(s =>
            s.category &&
            s.category.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : services;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-beauty-service-form?id=${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this beauty service?")) return;
        setDeleteLoading(id);
        try {
            const result = await deleteById(id);
            const ok = result?.success ?? (result !== null && result !== undefined);
            if (ok) {
                setServices(prev => prev.filter(s => s._id !== id));
            } else {
                alert(result?.message || "Failed to delete service. Please try again.");
            }
        } catch (err) {
            console.error("Error deleting beauty service:", err);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD
    // ============================================================================
    const renderCard = (beauty: BeautyWorker) => {
        const id = beauty._id || "";
        const imageUrls = (beauty.images || []).filter(Boolean) as string[];
        const location = [beauty.area, beauty.city, beauty.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const servicesList = ensureArray(beauty.services);
        const isAvailable = beauty.availability;
        const description = beauty.bio || "";
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
                            alt={beauty.name}
                            className="w-full h-full object-cover transition-transform duration-300"
                            style={{ transform: isHovered ? 'scale(1.04)' : 'scale(1)' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center transition-colors duration-300"
                            style={{ backgroundColor: isHovered ? 'rgba(0,89,138,0.08)' : 'rgba(0,89,138,0.05)' }}
                        >
                            <span className="text-6xl">💅</span>
                        </div>
                    )}

                    {/* Top colour bar on hover */}
                    <div
                        className="absolute top-0 left-0 right-0 h-1 transition-all duration-300"
                        style={{ backgroundColor: '#00598a', opacity: isHovered ? 1 : 0 }}
                    />

                    {/* Category badge — bottom left */}
                    <div className="absolute bottom-3 left-3">
                        <span
                            className="text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors duration-300"
                            style={{ backgroundColor: isHovered ? '#00598a' : 'rgba(0,0,0,0.60)' }}
                        >
                            {beauty.category || "Beauty & Wellness"}
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
                        {beauty.name || "Unnamed Service"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm" style={{ color: '#00598a' }}>📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* Category pill + Availability status */}
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="flex-1 text-center text-sm font-medium px-3 py-1.5 rounded-full truncate border transition-colors duration-300"
                            style={{
                                color: '#00598a',
                                backgroundColor: isHovered ? 'rgba(0,89,138,0.1)' : 'rgba(0,89,138,0.06)',
                                borderColor: isHovered ? 'rgba(0,89,138,0.3)' : 'rgba(0,89,138,0.15)',
                            }}
                        >
                            {beauty.category || "Beauty & Wellness"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${isAvailable
                            ? "text-green-600 bg-green-50 border-green-200"
                            : "text-gray-500 bg-gray-50 border-gray-200"
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500" : "bg-gray-400"}`} />
                            {isAvailable ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>
                    )}

                    {/* Service chips (when no description) */}
                    {!description && servicesList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {servicesList.slice(0, 3).map((svc, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-300"
                                    style={{
                                        color: '#00598a',
                                        backgroundColor: isHovered ? 'rgba(0,89,138,0.08)' : 'rgba(0,89,138,0.05)',
                                        borderColor: isHovered ? 'rgba(0,89,138,0.25)' : 'rgba(0,89,138,0.12)',
                                    }}
                                >
                                    {svc}
                                </span>
                            ))}
                            {servicesList.length > 3 && (
                                <span className="text-xs text-gray-400">+{servicesList.length - 3} more</span>
                            )}
                        </div>
                    )}

                    {/* Rating + experience + charge row */}
                    <div className="flex items-center gap-2 mb-4">
                        <span
                            className="inline-flex items-center gap-1.5 text-sm font-semibold px-3 py-1 rounded-full border transition-colors duration-300"
                            style={{
                                color: isHovered ? '#00598a' : '#92400e',
                                backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : '#fefce8',
                                borderColor: isHovered ? 'rgba(0,89,138,0.25)' : '#fde68a',
                            }}
                        >
                            ⭐ {beauty.rating ?? "4.5"}
                        </span>
                        {beauty.experience && (
                            <span className="text-sm text-gray-500">
                                {beauty.experience} yr{beauty.experience !== 1 ? "s" : ""} exp
                            </span>
                        )}
                        {beauty.serviceCharge && (
                            <span
                                className="ml-auto text-sm font-bold transition-colors duration-300"
                                style={{ color: '#00598a' }}
                            >
                                ₹{beauty.serviceCharge}+
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
                        <span>💅</span> Beauty & Wellness Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                    <div className="text-6xl mb-4">💅</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Beauty Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your beauty and wellness services to showcase them here.
                    </p>
                    <button
                        onClick={() => navigate("/add-beauty-service-form")}
                        className="inline-flex items-center gap-1.5 px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                        style={{ backgroundColor: '#00598a' }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#004a73')}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#00598a')}
                    >
                        + Add Beauty Service
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
                    <span>💅</span> Beauty & Wellness Services ({filteredServices.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredServices.map(renderCard)}
            </div>
        </div>
    );
};

export default BeautyUserService;