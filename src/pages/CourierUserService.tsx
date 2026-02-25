import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCourierService, CourierWorker } from "../services/CourierService.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

const ensureArray = (input: any): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === "string") return input.split(",").map(s => s.trim()).filter(Boolean);
    return [];
};

const getIcon = (category?: string) => {
    const n = (category || "").toLowerCase();
    if (n.includes("packer") || n.includes("mover")) return "🚛";
    if (n.includes("parcel") || n.includes("logistics")) return "📦";
    if (n.includes("cargo")) return "🏭";
    if (n.includes("delivery")) return "🛵";
    return "📦";
};

interface CourierUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

const CourierUserService: React.FC<CourierUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [couriers, setCouriers] = useState<CourierWorker[]>(data as CourierWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    const filteredCouriers = selectedSubcategory
        ? couriers.filter(c =>
            c.category &&
            c.category.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : couriers;

    const handleEdit = (id: string) => navigate(`/add-courier-service-form?id=${id}`);
    const handleView = (id: string) => navigate(`/courier-services/details/${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this courier service?")) return;
        setDeleteLoading(id);
        try {
            const result = await deleteCourierService(id);
            if (result.success) {
                setCouriers(prev => prev.filter(c => c._id !== id));
            } else {
                alert("Failed to delete service. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting courier:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const renderCourierCard = (courier: CourierWorker) => {
        const id = courier._id || "";
        const imageUrls = (courier.images || []).filter(Boolean) as string[];
        const location = [courier.area, courier.city, courier.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const services = ensureArray(courier.services);
        const isAvailable = courier.availability;
        const description = courier.bio || (courier as any).description || "";
        const displayName = courier.serviceName || courier.name || "Unnamed Service";
        const phone = courier.phone || (courier as any).contactNumber || (courier as any).phoneNumber;
        const icon = getIcon(courier.category);

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 
                         transition-all duration-300 ease-in-out
                         hover:shadow-lg hover:border-[#00598a]/30 hover:-translate-y-1
                         group cursor-pointer"
            >
                {/* ── Image ── */}
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={displayName}
                            className="w-full h-full object-cover transition-transform duration-300 
                                     group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#00598a]/5 
                                      transition-colors duration-300 group-hover:bg-[#00598a]/10">
                            <span className="text-6xl transition-transform duration-300 
                                           group-hover:scale-110 group-hover:rotate-3">{icon}</span>
                        </div>
                    )}

                    {/* Category badge */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg 
                                       backdrop-blur-sm transition-all duration-300 
                                       group-hover:bg-[#00598a] group-hover:text-white group-hover:px-4">
                            {courier.subCategory || courier.category || "Courier"}
                        </span>
                    </div>

                    {/* Action menu */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 
                                  transition-opacity duration-300">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00598a]" />
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
                <div className="p-4 transition-colors duration-300 group-hover:bg-[#00598a]/5">

                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate 
                                 transition-colors duration-300 group-hover:text-[#00598a]">
                        {displayName}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm transition-colors duration-300 
                                       group-hover:text-[#00598a]">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1 
                                    transition-colors duration-300 group-hover:text-gray-700">{location}</p>
                    </div>

                    {/* Category pill + Availability */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-[#00598a] bg-[#00598a]/8 
                                       border border-[#00598a]/20 px-3 py-1.5 rounded-full truncate
                                       transition-all duration-300 
                                       group-hover:bg-[#00598a] group-hover:text-white 
                                       group-hover:border-[#00598a]">
                            {courier.subCategory || courier.category || "Courier"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border 
                                        transition-all duration-300
                                        ${isAvailable
                                ? "text-green-600 bg-green-50 border-green-200 group-hover:bg-green-100"
                                : "text-red-500 bg-red-50 border-red-200 group-hover:bg-red-100"
                            }`}>
                            <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`} />
                            {isAvailable ? "Available" : "Busy"}
                        </span>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3 
                                    transition-colors duration-300 group-hover:text-gray-700">
                            {description}
                        </p>
                    )}

                    {/* Service detail chips */}
                    {!description && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {courier.experience && (
                                <span className="text-xs bg-[#00598a]/8 text-[#00598a] px-2 py-0.5 rounded-full border border-[#00598a]/20
                                               transition-all duration-300 
                                               group-hover:bg-[#00598a] group-hover:text-white 
                                               group-hover:border-[#00598a]">
                                    📦 {courier.experience} yrs exp
                                </span>
                            )}
                            {courier.chargeType && (
                                <span className="text-xs bg-[#00598a]/8 text-[#00598a] px-2 py-0.5 rounded-full border border-[#00598a]/20
                                               transition-all duration-300 
                                               group-hover:bg-[#00598a] group-hover:text-white 
                                               group-hover:border-[#00598a]">
                                    {courier.chargeType}
                                </span>
                            )}
                            {services.slice(0, 2).map((s, idx) => (
                                <span key={idx}
                                      className="text-xs bg-[#00598a]/8 text-[#00598a] px-2 py-0.5 rounded-full border border-[#00598a]/20
                                               transition-all duration-300 
                                               group-hover:bg-[#00598a] group-hover:text-white 
                                               group-hover:border-[#00598a]">
                                    {s}
                                </span>
                            ))}
                            {services.length > 2 && (
                                <span className="text-xs text-gray-400 px-1 self-center transition-colors duration-300
                                               group-hover:text-gray-600">
                                    +{services.length - 2} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Rating + phone + charge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full
                                       transition-all duration-300 
                                       group-hover:bg-[#00598a] group-hover:text-white 
                                       group-hover:border-[#00598a]">
                            ⭐ {(courier as any).rating ? (courier as any).rating : "N/A"}
                        </span>

                        {phone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1 
                                           transition-colors duration-300 group-hover:text-gray-700">
                                <svg className="w-4 h-4 text-gray-400 transition-colors duration-300 
                                              group-hover:text-[#00598a]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {phone}
                            </span>
                        )}

                        {courier.serviceCharge && (
                            <span className="ml-auto text-sm font-bold text-[#00598a] 
                                           transition-colors duration-300 group-hover:text-[#004a73]">
                                ₹{courier.serviceCharge}{courier.chargeType ? `/${courier.chargeType}` : ""}
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(id);
                            }}
                            className="flex-1 bg-[#00598a] text-white text-sm font-semibold py-2 px-4 rounded-lg
                                     transition-all duration-300 
                                     hover:bg-[#004a73] hover:shadow-md 
                                     active:scale-95"
                        >
                            Edit Service
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(id);
                            }}
                            className="bg-red-500 text-white text-sm font-semibold py-2 px-4 rounded-lg
                                     transition-all duration-300 
                                     hover:bg-red-600 hover:shadow-md 
                                     active:scale-95"
                        >
                            Delete
                        </button>
                    </div>

                </div>
            </div>
        );
    };

    // ── Empty State ──────────────────────────────────────────────────────────
    if (filteredCouriers.length === 0) {
        if (hideEmptyState) return null;

        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>📦</span> Courier Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4 transition-transform duration-300 hover:scale-110">📦</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Courier Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your courier services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-courier-service-form")}
                        className="gap-1.5 bg-[#00598a] hover:bg-[#004a73] text-white transition-colors duration-300"
                    >
                        + Add Courier Service
                    </Button>
                </div>
            </div>
        );
    }

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div>
            {!hideHeader && (
                <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                    <span>📦</span> Courier Services ({filteredCouriers.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredCouriers.map(renderCourierCard)}
            </div>
        </div>
    );
};

export default CourierUserService;