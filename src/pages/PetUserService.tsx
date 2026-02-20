import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deletePetServiceById, PetWorker } from "../services/PetWorker.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

// ============================================================================
// HELPERS
// ============================================================================
const getCategoryIcon = (category?: string): string => {
    if (!category) return "🐾";
    const lower = category.toLowerCase();
    if (lower.includes("vet") || lower.includes("clinic")) return "🏥";
    if (lower.includes("shop")) return "🛒";
    if (lower.includes("groom")) return "✂️";
    if (lower.includes("train")) return "🐕";
    if (lower.includes("board")) return "🏠";
    if (lower.includes("sit")) return "👤";
    if (lower.includes("walk")) return "🚶";
    return "🐾";
};

// ============================================================================
// PROPS
// ============================================================================
interface PetUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const PetUserService: React.FC<PetUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [petServices, setPetServices] = useState<PetWorker[]>(data as PetWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? petServices.filter(s =>
            s.category &&
            s.category.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : petServices;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-pet-service-form?id=${id}`);
    const handleView = (id: string) => navigate(`/pet-services/details/${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this pet service?")) return;
        setDeleteLoading(id);
        try {
            const res = await deletePetServiceById(id);
            if (res.success) {
                setPetServices(prev => prev.filter(s => s._id !== id));
            } else {
                alert(res.message || "Failed to delete service. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting pet service:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD — matches DigitalUserService card layout
    // ============================================================================
    const renderCard = (service: PetWorker) => {
        const id = service._id || "";
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const location = [service.area, service.city, service.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const servicesList = service.services || [];
        const isAvailable = service.availability;
        const description = (service as any).description || service.bio || "";
        const displayName = service.serviceName || service.name || "Unnamed Service";
        const phone = (service as any).phone || (service as any).contactNumber || (service as any).phoneNumber;
        const price = (service as any).price || service.serviceCharge;
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
                        <div className="w-full h-full flex items-center justify-center bg-blue-600/5">
                            <span className="text-6xl">{icon}</span>
                        </div>
                    )}

                    {/* Category badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {service.category || "Pet Service"}
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
                        {displayName}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* Category pill + Availability status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-blue-700 bg-blue-600/8 border border-blue-600/20 px-3 py-1.5 rounded-full truncate">
                            {service.category || "Pet Service"}
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
                    {!description && servicesList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {service.experience && (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                    🐾 {service.experience} yrs exp
                                </span>
                            )}
                            {servicesList.slice(0, 2).map((s, idx) => (
                                <span key={idx} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                    {s}
                                </span>
                            ))}
                            {servicesList.length > 2 && (
                                <span className="text-xs text-gray-400 px-1 self-center">
                                    +{servicesList.length - 2} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Rating row + optional phone + price */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {service.rating ? service.rating : "N/A"}
                        </span>

                        {phone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {phone}
                            </span>
                        )}

                        {price && (
                            <span className="ml-auto text-sm font-bold text-blue-700">
                                ₹{Number(price).toLocaleString()}
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
                        <span>🐾</span> Pet Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🐾</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Pet Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your pet services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-pet-service-form")}
                        className="gap-1.5 bg-blue-600 hover:bg-blue-700"
                    >
                        + Add Pet Service
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
                    <span>🐾</span> Pet Services ({filteredServices.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredServices.map(renderCard)}
            </div>
        </div>
    );
};

export default PetUserService;