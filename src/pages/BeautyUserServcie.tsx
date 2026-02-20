import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteById, BeautyWorker } from "../services/Beauty.Service.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
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

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? services.filter(s =>
            s.category &&
            s.category.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : services;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-beauty-service-form?id=${id}`);
    const handleView = (id: string) => navigate(`/beauty-services/details/${id}`);

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

    const openDirections = (beauty: BeautyWorker) => {
        if (beauty.latitude && beauty.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${beauty.latitude},${beauty.longitude}`,
                "_blank"
            );
        } else if (beauty.area || beauty.city) {
            const addr = encodeURIComponent(
                [beauty.area, beauty.city, beauty.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

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
        const phone = beauty.phone;
        const description = beauty.bio || "";

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
                            alt={beauty.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-rose-50">
                            <span className="text-6xl">💅</span>
                        </div>
                    )}

                    {/* Category badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {beauty.category || "Beauty & Wellness"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-rose-600" />
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
                        {beauty.name || "Unnamed Service"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-red-500 text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* Category pill + Active status */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full truncate">
                            {beauty.category || "Beauty & Wellness"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
                            isAvailable
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

                    {/* Services chips (if no description, show these) */}
                    {!description && servicesList.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {servicesList.slice(0, 3).map((svc, idx) => (
                                <span key={idx} className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                                    {svc}
                                </span>
                            ))}
                            {servicesList.length > 3 && (
                                <span className="text-xs text-gray-400">+{servicesList.length - 3} more</span>
                            )}
                        </div>
                    )}

                    {/* Star rating row */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {beauty.rating ? beauty.rating : "4.5"}
                        </span>
                        {beauty.experience && (
                            <span className="text-sm text-gray-500">
                                {beauty.experience} yr{beauty.experience !== 1 ? "s" : ""} exp
                            </span>
                        )}
                        {beauty.serviceCharge && (
                            <span className="ml-auto text-sm font-bold text-rose-700">
                                ₹{beauty.serviceCharge}+
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
                        <span>💅</span> Beauty & Wellness Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-sm">
                    <div className="text-6xl mb-4">💅</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Beauty Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your beauty and wellness services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-beauty-service-form")}
                        className="gap-1.5"
                    >
                        + Add Beauty Service
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