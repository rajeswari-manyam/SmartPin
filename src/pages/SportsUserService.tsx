import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteSportsActivity, SportsWorker } from "../services/Sports.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

// ============================================================================
// HELPERS
// ============================================================================
const getServiceIcon = (subCategory?: string): string => {
    if (!subCategory) return "🏃";
    const n = subCategory.toLowerCase();
    if (n.includes("gym") || n.includes("fitness")) return "💪";
    if (n.includes("yoga")) return "🧘";
    if (n.includes("swimming")) return "🏊";
    if (n.includes("cricket")) return "🏏";
    if (n.includes("football") || n.includes("soccer")) return "⚽";
    if (n.includes("basketball")) return "🏀";
    if (n.includes("tennis")) return "🎾";
    if (n.includes("badminton")) return "🏸";
    if (n.includes("stadium") || n.includes("ground")) return "🏟️";
    if (n.includes("play") || n.includes("indoor")) return "🎮";
    return "🏃";
};

// ============================================================================
// PROPS
// ============================================================================
interface SportsUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideEmptyState?: boolean;
    hideHeader?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const SportsUserService: React.FC<SportsUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideEmptyState = false,
    hideHeader = false,
}) => {
    const navigate = useNavigate();

    const [sportsServices, setSportsServices] = useState<SportsWorker[]>(data as SportsWorker[]);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? sportsServices.filter(s =>
            s.subCategory &&
            s.subCategory.toLowerCase() === selectedSubcategory.toLowerCase()
        )
        : sportsServices;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this sports service?")) return;
        setDeletingId(id);
        try {
            const result = await deleteSportsActivity(id);
            if (result.success) {
                setSportsServices(prev => prev.filter(s => s._id !== id));
            } else {
                alert("Failed to delete service. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting sports service:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    // ============================================================================
    // CARD — matches HospitalUserService card layout
    // ============================================================================
    const renderCard = (service: SportsWorker) => {
        const id = service._id || "";
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const location = [service.area, service.city, service.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const servicesList = service.services || [];
        const icon = getServiceIcon(service.subCategory);
        const isActive = service.availability !== false;
        const phone = (service as any).phone || (service as any).contactNumber || (service as any).phoneNumber;

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
                            alt={service.serviceName || "Service"}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-600/5">
                            <span className="text-6xl">{icon}</span>
                        </div>
                    )}

                    {/* SubCategory badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {service.subCategory || "Sports"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deletingId === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                            </div>
                        ) : (
                            <ActionDropdown
                                onEdit={() => navigate(`/add-sports-service-form?id=${id}`)}
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

                    {/* SubCategory pill + Available status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-blue-600 bg-blue-600/8 border border-blue-600/20 px-3 py-1.5 rounded-full truncate">
                            {service.subCategory || "Sports & Fitness"}
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

                    {/* Description */}
                    {service.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{service.description}</p>
                    )}

                    {/* Services chips (shown when no description) */}
                    {!service.description && servicesList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {servicesList.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="text-xs bg-blue-600/5 text-blue-700 px-2 py-0.5 rounded-full">
                                    {s}
                                </span>
                            ))}
                            {servicesList.length > 3 && (
                                <span className="text-xs text-gray-400">+{servicesList.length - 3} more</span>
                            )}
                        </div>
                    )}

                    {/* Rating / charge row + optional phone */}
                    <div className="flex items-center gap-2 mb-4">
                        {service.serviceCharge ? (
                            <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                                💰 ₹{service.serviceCharge}
                                {service.chargeType ? ` / ${service.chargeType}` : ""}
                            </span>
                        ) : service.rating ? (
                            <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                                ⭐ {service.rating}
                            </span>
                        ) : service.experience ? (
                            <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                                🏅 {service.experience} yrs exp
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                                🏃 {service.subCategory || "Sports"}
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
                        <span>🏃</span> Sports & Fitness Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🏃</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Sports Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your sports and fitness services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-sports-service-form")}
                        className="gap-1.5"
                    >
                        + Add Sports Service
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
                    <span>🏃</span> Sports & Fitness Services ({filteredServices.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredServices.map(renderCard)}
            </div>
        </div>
    );
};

export default SportsUserService;