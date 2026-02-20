import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteLabour, LabourWorker } from "../services/DailyWage.service";
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

const getIcon = (subCategory?: string) => {
    const n = (subCategory || "").toLowerCase();
    if (n.includes("clean")) return "🧹";
    if (n.includes("construct") || n.includes("mason")) return "🏗️";
    if (n.includes("watch") || n.includes("guard")) return "💂";
    if (n.includes("garden")) return "🌿";
    if (n.includes("event")) return "🎪";
    if (n.includes("loading") || n.includes("unload")) return "📦";
    return "👷";
};

// ============================================================================
// PROPS
// ============================================================================
interface DailyWageUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const DailyWageUserService: React.FC<DailyWageUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [workers, setWorkers] = useState<LabourWorker[]>(data as LabourWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ───────────────────────────────────────────────────────────────
    const filteredWorkers = selectedSubcategory
        ? workers.filter(w =>
            w.subCategory &&
            w.subCategory.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : workers;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-daily-wage-service-form?id=${id}`);
    const handleView = (id: string) => navigate(`/daily-wages/details/${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this worker listing?")) return;
        setDeleteLoading(id);
        try {
            const result = await deleteLabour(id);
            if (result.success) {
                setWorkers(prev => prev.filter(w => w._id !== id));
            } else {
                alert("Failed to delete listing. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting worker:", error);
            alert("Failed to delete listing. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD — matches CourierUserService card layout
    // ============================================================================
    const renderWorkerCard = (worker: LabourWorker) => {
        const id = worker._id || "";
        const imageUrls = (worker.images || []).filter(Boolean) as string[];
        const location = [worker.area, worker.city, worker.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const skills = ensureArray(worker.services);
        const isAvailable = worker.availability;
        const description = worker.description || (worker as any).bio || "";
        const displayName = worker.name || worker.subCategory || "Unnamed Worker";
        const phone = worker.phone || (worker as any).contactNumber || (worker as any).phoneNumber;
        const icon = getIcon(worker.subCategory);

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
                        <div className="w-full h-full flex items-center justify-center bg-orange-500/5">
                            <span className="text-6xl">{icon}</span>
                        </div>
                    )}

                    {/* SubCategory badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {worker.subCategory || "Daily Wage"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500" />
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

                    {/* SubCategory pill + Availability status — side by side */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-orange-700 bg-orange-500/8 border border-orange-500/20 px-3 py-1.5 rounded-full truncate">
                            {worker.subCategory || "Daily Wage"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
                            isAvailable
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-red-500 bg-red-50 border-red-200"
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`} />
                            {isAvailable ? "Available" : "Busy"}
                        </span>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>
                    )}

                    {/* Skill / detail chips (shown when no description) */}
                    {!description && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {worker.experience && (
                                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                                    👷 {worker.experience} yrs exp
                                </span>
                            )}
                            {worker.chargeType && (
                                <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                                    {worker.chargeType}
                                </span>
                            )}
                            {skills.slice(0, 2).map((s, idx) => (
                                <span key={idx} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full border border-orange-200">
                                    {s}
                                </span>
                            ))}
                            {skills.length > 2 && (
                                <span className="text-xs text-gray-400 px-1 self-center">
                                    +{skills.length - 2} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Rating row + optional phone + daily wage */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {(worker as any).rating ? (worker as any).rating : "N/A"}
                        </span>

                        {phone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {phone}
                            </span>
                        )}

                        {worker.dailyWage && (
                            <span className="ml-auto text-sm font-bold text-orange-700">
                                ₹{worker.dailyWage}{worker.chargeType ? `/${worker.chargeType}` : ""}
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
    if (filteredWorkers.length === 0) {
        if (hideEmptyState) return null;

        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>👷</span> Daily Wage Workers (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">👷</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Worker Listings Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your worker listings to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-daily-wage-service-form")}
                        className="gap-1.5 bg-orange-500 hover:bg-orange-600"
                    >
                        + Add Worker Listing
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
                    <span>👷</span> Daily Wage Workers ({filteredWorkers.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredWorkers.map(renderWorkerCard)}
            </div>
        </div>
    );
};

export default DailyWageUserService;