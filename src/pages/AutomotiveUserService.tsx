import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteAutomotive, AutomotiveService } from "../services/AutomotiveServcie.service";
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
    if (typeof input === "string") return input.split(",").map((s) => s.trim()).filter(Boolean);
    return [];
};

// ============================================================================
// PROPS
// ============================================================================
interface AutomotiveUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const AutomotiveUserService: React.FC<AutomotiveUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [automotives, setAutomotives] = useState<AutomotiveService[]>(data as AutomotiveService[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredAutomotives = selectedSubcategory
        ? automotives.filter(
            (a) =>
                a.businessType &&
                a.businessType.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : automotives;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-automotive-form?id=${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this automotive service?")) return;
        setDeleteLoading(id);
        try {
            const response = await deleteAutomotive(id);
            if (response.success) {
                setAutomotives((prev) => prev.filter((a) => a._id !== id));
            } else {
                alert(response.message || "Failed to delete service");
            }
        } catch (error) {
            console.error("Error deleting automotive:", error);
            alert("Failed to delete service");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD — matches ArtUserService card layout
    // ============================================================================
    const renderCard = (automotive: AutomotiveService) => {
        const id = automotive._id || "";
        const servicesList = ensureArray(automotive.services);
        const imageUrls = (automotive.images || []).filter(Boolean) as string[];
        const location = [automotive.area, automotive.city, automotive.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const phone = (((automotive as any).phone || (automotive as any).mobile || (automotive as any).contact || (automotive as any).ownerPhone || (automotive as any).whatsapp || (automotive as any).phoneNumber) as string) || undefined;
        const isActive = automotive.availability
            ? automotive.availability.toLowerCase() !== "unavailable"
            : true;

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
                            alt={automotive.name || "Automotive"}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600/5">
                            <span className="text-6xl">🚗</span>
                        </div>
                    )}

                    {/* Business Type badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {automotive.businessType || "Automotive"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
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
                        {automotive.name || "Unnamed Service"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-red-500 text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* Business Type pill + Availability status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-blue-600 bg-blue-600/8 border border-blue-600/20 px-3 py-1.5 rounded-full truncate">
                            {automotive.businessType || "Automotive"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
                            isActive
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-red-500 bg-red-50 border-red-200"
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                            {isActive ? "Available" : "Unavailable"}
                        </span>
                    </div>

                    {/* Services chips (if present, always show as they're key info) */}
                    {servicesList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {servicesList.slice(0, 3).map((service, idx) => (
                                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                    {service}
                                </span>
                            ))}
                            {servicesList.length > 3 && (
                                <span className="text-xs text-gray-400">+{servicesList.length - 3} more</span>
                            )}
                        </div>
                    )}

                    {/* Experience chip (shown when no services) */}
                    {servicesList.length === 0 && automotive.experience != null && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                📅 {automotive.experience} yrs exp
                            </span>
                        </div>
                    )}

                    {/* Price row + optional phone */}
                    <div className="flex items-center gap-2 mb-4">
                        {automotive.priceRange ? (
                            <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                                💰 ₹{automotive.priceRange}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                                🚗 {automotive.businessType || "Automotive"}
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
    if (filteredAutomotives.length === 0) {
        if (hideEmptyState) return null;

        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🚗</span> Automotive Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🚗</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Automotive Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your automotive services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-automotive-form")}
                        className="gap-1.5"
                    >
                        + Add Automotive Service
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
                    <span>🚗</span> Automotive Services ({filteredAutomotives.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredAutomotives.map(renderCard)}
            </div>
        </div>
    );
};

export default AutomotiveUserService;