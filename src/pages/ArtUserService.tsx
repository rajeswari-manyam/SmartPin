import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteCreativeArtService, CreativeArtWorker } from "../services/Creative.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

const BRAND = '#00598a';

// ============================================================================
// HELPERS
// ============================================================================
const getCategoryIcon = (subcategory?: string): string => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("caricature")) return "🎨";
    if (n.includes("painting") || n.includes("painter")) return "🖌️";
    if (n.includes("mural") || n.includes("wall")) return "🖼️";
    if (n.includes("gift") || n.includes("handmade")) return "🎁";
    if (n.includes("craft")) return "✂️";
    return "🎨";
};

// ============================================================================
// PROPS
// ============================================================================
interface ArtUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const ArtUserService: React.FC<ArtUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [arts, setArts] = useState<CreativeArtWorker[]>(data as CreativeArtWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredArts = selectedSubcategory
        ? arts.filter(a =>
            a.subCategory &&
            a.subCategory.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : arts;

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-art-service-form?id=${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        setDeleteLoading(id);
        try {
            const res = await deleteCreativeArtService(id);
            if (res.success) setArts(prev => prev.filter(a => a._id !== id));
            else alert(res.message || "Failed to delete service. Please try again.");
        } catch (error) {
            console.error("Error deleting:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD — matches WeddingUserService card layout with #00598a hover
    // ============================================================================
    const renderArtCard = (art: CreativeArtWorker) => {
        const id = art._id || "";
        const imageUrls = (art.images || []).filter(Boolean) as string[];
        const location = [art.area, art.city, art.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const icon = getCategoryIcon(art.subCategory);
        const isActive = art.availability !== false;
        const phone = (art as any).phone || (art as any).contactNumber || (art as any).phoneNumber;

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-[#00598a]/20 hover:-translate-y-2 hover:border-[#00598a]/40 group"
            >
                {/* ── Image ── */}
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={art.name || "Art Service"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#00598a]/5 group-hover:bg-[#00598a]/10 transition-colors duration-300">
                            <span className="text-6xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
                        </div>
                    )}

                    {/* SubCategory badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm group-hover:bg-[#00598a] transition-colors duration-300">
                            {art.subCategory || "Art Service"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
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
                <div className="p-4">

                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-[#00598a] transition-colors duration-200">
                        {art.name || "Unnamed Service"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-[#00598a] text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* SubCategory pill + Available status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-[#00598a] bg-[#00598a]/10 border border-[#00598a]/20 px-3 py-1.5 rounded-full truncate">
                            {art.subCategory || "Creative & Art"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
                            isActive
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-red-500 bg-red-50 border-red-200"
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                            {isActive ? "Available" : "Busy"}
                        </span>
                    </div>

                    {/* Description */}
                    {art.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{art.description}</p>
                    )}

                    {/* Detail chips (shown when no description) */}
                    {!art.description && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {art.chargeType && (
                                <span className="text-xs bg-[#00598a]/10 text-[#00598a] px-2 py-0.5 rounded-full border border-[#00598a]/20">
                                    {art.chargeType}
                                </span>
                            )}
                            {art.experience != null && (
                                <span className="text-xs bg-[#00598a]/10 text-[#00598a] px-2 py-0.5 rounded-full border border-[#00598a]/20">
                                    🏅 {art.experience} yrs exp
                                </span>
                            )}
                        </div>
                    )}

                    {/* Charge row + optional phone */}
                    <div className="flex items-center gap-2 mb-4">
                        {art.serviceCharge != null ? (
                            <span className="inline-flex items-center gap-1.5 bg-[#00598a]/10 border border-[#00598a]/20 text-[#00598a] text-sm font-semibold px-3 py-1 rounded-full">
                                💰 ₹{Number(art.serviceCharge).toLocaleString()}
                                {art.chargeType ? ` / ${art.chargeType}` : ""}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 bg-[#00598a]/10 border border-[#00598a]/20 text-[#00598a] text-sm font-semibold px-3 py-1 rounded-full">
                                🎨 {art.subCategory || "Art Service"}
                            </span>
                        )}

                        {phone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4 text-[#00598a]" fill="currentColor" viewBox="0 0 20 20">
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
    if (filteredArts.length === 0) {
        if (hideEmptyState) return null;

        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🎨</span> Creative & Art Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center hover:shadow-lg hover:shadow-[#00598a]/10 transition-all duration-300">
                    <div className="text-6xl mb-4 hover:scale-110 transition-transform duration-300">🎨</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Art Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your creative and art services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-art-service-form")}
                        className="gap-1.5 bg-[#00598a] hover:bg-[#004a75]"
                    >
                        + Add Art Service
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
                    <span>🎨</span> Creative & Art Services ({filteredArts.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredArts.map(renderArtCard)}
            </div>
        </div>
    );
};

export default ArtUserService;