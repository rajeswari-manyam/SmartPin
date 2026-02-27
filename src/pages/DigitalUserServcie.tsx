import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDigitalService, DigitalWorker } from "../services/DigitalService.service";
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

const getServiceIcon = (category?: string): string => {
    if (!category) return "💻";
    const n = category.toLowerCase();
    if (n.includes("website") || n.includes("web")) return "🌐";
    if (n.includes("mobile") || n.includes("app")) return "📱";
    if (n.includes("graphic") || n.includes("design")) return "🎨";
    if (n.includes("marketing") || n.includes("seo")) return "📈";
    if (n.includes("software") || n.includes("development")) return "⚙️";
    if (n.includes("cctv") || n.includes("security")) return "📹";
    if (n.includes("repair")) return "🔧";
    if (n.includes("data") || n.includes("analytics")) return "📊";
    return "💻";
};

// ============================================================================
// PROPS
// ============================================================================
interface DigitalUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideEmptyState?: boolean;
    hideHeader?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const DigitalUserService: React.FC<DigitalUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideEmptyState = false,
    hideHeader = false,
}) => {
    const navigate = useNavigate();

    const [digitalServices, setDigitalServices] = useState<DigitalWorker[]>(data as DigitalWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // ✅ sync state when prop data arrives asynchronously from parent
    useEffect(() => {
        setDigitalServices(data as DigitalWorker[]);
    }, [data]);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredServices = selectedSubcategory
        ? digitalServices.filter(s =>
            s.category && s.category.toLowerCase() === selectedSubcategory.toLowerCase()
        )
        : digitalServices;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-digital-service-form?id=${id}`);
    const handleView = (id: string) => navigate(`/tech-services/details/${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        setDeleteLoading(id);
        try {
            const result = await deleteDigitalService(id);
            if (result.success) {
                setDigitalServices(prev => prev.filter(s => s._id !== id));
            } else {
                alert("Failed to delete service. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting digital service:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD
    // ============================================================================
    const renderCard = (service: DigitalWorker) => {
        const id = service._id || "";
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const location = [service.area, service.city, service.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const servicesList = ensureArray(service.services);
        const icon = getServiceIcon(service.category);
        const isAvailable = service.availability;
        const description = service.bio || service.description || "";
        const displayName = service.serviceName || service.name || "Unnamed Service";
        const phone = (service as any).phone || (service as any).contactNumber || (service as any).phoneNumber;
        const isHovered = hoveredCard === id;

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-200"
                style={{
                    boxShadow: isHovered
                        ? "0 8px 24px rgba(0, 89, 138, 0.15)"
                        : undefined,
                    borderColor: isHovered ? "#00598a" : undefined,
                    transform: isHovered ? "translateY(-2px)" : undefined,
                }}
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
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
                        <div
                            className="w-full h-full flex items-center justify-center transition-colors duration-200"
                            style={{ backgroundColor: isHovered ? "rgba(0, 89, 138, 0.06)" : "rgba(79, 70, 229, 0.05)" }}
                        >
                            <span className="text-6xl">{icon}</span>
                        </div>
                    )}

                    {/* Category badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {service.subCategory || service.category || "Digital Service"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div
                                    className="animate-spin rounded-full h-5 w-5 border-b-2"
                                    style={{ borderColor: "#00598a" }}
                                />
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
                        className="text-lg font-bold text-gray-900 mb-1 truncate transition-colors duration-200"
                        style={{ color: isHovered ? "#00598a" : undefined }}
                    >
                        {displayName}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* Category pill + Availability status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="flex-1 text-center text-sm font-medium px-3 py-1.5 rounded-full truncate border transition-colors duration-200"
                            style={{
                                color: isHovered ? "#00598a" : "#4338ca",
                                backgroundColor: isHovered ? "rgba(0, 89, 138, 0.07)" : "rgba(79, 70, 229, 0.05)",
                                borderColor: isHovered ? "rgba(0, 89, 138, 0.25)" : "rgba(79, 70, 229, 0.2)",
                            }}
                        >
                            {service.subCategory || service.category || "Digital Service"}
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
                            {service.chargeType && (
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200"
                                    style={{
                                        color: isHovered ? "#00598a" : "#4338ca",
                                        backgroundColor: isHovered ? "rgba(0, 89, 138, 0.07)" : "#eef2ff",
                                        borderColor: isHovered ? "rgba(0, 89, 138, 0.25)" : "#c7d2fe",
                                    }}
                                >
                                    {service.chargeType}
                                </span>
                            )}
                            {service.experience && (
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200"
                                    style={{
                                        color: isHovered ? "#00598a" : "#4338ca",
                                        backgroundColor: isHovered ? "rgba(0, 89, 138, 0.07)" : "#eef2ff",
                                        borderColor: isHovered ? "rgba(0, 89, 138, 0.25)" : "#c7d2fe",
                                    }}
                                >
                                    💼 {service.experience} yrs exp
                                </span>
                            )}
                            {servicesList.slice(0, 2).map((s, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200"
                                    style={{
                                        color: isHovered ? "#00598a" : "#4338ca",
                                        backgroundColor: isHovered ? "rgba(0, 89, 138, 0.07)" : "#eef2ff",
                                        borderColor: isHovered ? "rgba(0, 89, 138, 0.25)" : "#c7d2fe",
                                    }}
                                >
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

                    {/* Rating row + optional phone + charge */}
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

                        {service.serviceCharge && (
                            <span
                                className="ml-auto text-sm font-bold transition-colors duration-200"
                                style={{ color: isHovered ? "#00598a" : "#4338ca" }}
                            >
                                ₹{Number(service.serviceCharge).toLocaleString()}
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
                        <span>💻</span> Tech & Digital Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">💻</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Digital Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your tech and digital services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-digital-service-form")}
                        className="gap-1.5 !bg-[#00598a] hover:!bg-[#004a75]"
                    >
                        + Add Digital Service
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
                    <span>💻</span> Tech & Digital Services ({filteredServices.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredServices.map(renderCard)}
            </div>
        </div>
    );
};

export default DigitalUserService;