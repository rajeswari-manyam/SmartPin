import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserJobs, deleteJob } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

const BRAND = "#00598a";
const BRAND_DARK = "#004a73";

// ============================================================================
// JOB INTERFACE
// ============================================================================
export interface HomePersonalJob {
    _id: string;
    userId: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    jobType: string;
    servicecharges: string;
    startDate: string;
    endDate: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    images?: string[];
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================
interface HomePersonalUserServiceProps {
    userId: string;
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
    onViewDetails?: (jobId: string) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const HomePersonalUserService: React.FC<HomePersonalUserServiceProps> = ({
    userId,
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
    onViewDetails,
}) => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<HomePersonalJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    const fetchJobs = async () => {
        if (!userId) { setJobs([]); setLoading(false); return; }
        setLoading(true);
        try {
            const response = await getUserJobs(userId);
            const homeJobs = (response.jobs || []).filter((job: any) => {
                if (!job.category) return false;
                const cat = job.category.toLowerCase();
                return cat === "home" || cat === "home-personal" || cat === "homepersonal" || cat.includes("home");
            });
            setJobs(homeJobs);
        } catch (error) {
            console.error("❌ Error fetching jobs:", error);
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchJobs(); }, [userId]);

    const filteredJobs = selectedSubcategory
        ? jobs.filter(j => j.subcategory && j.subcategory.toLowerCase().includes(selectedSubcategory.toLowerCase()))
        : jobs;

    const handleEdit = (id: string) => navigate(`/add-home-service-form?id=${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        setDeleteLoading(id);
        try {
            const result = await deleteJob(id);
            if (result.success) setJobs(prev => prev.filter(j => j._id !== id));
            else alert("Failed to delete service. Please try again.");
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to delete service. Please try again.");
        } finally { setDeleteLoading(null); }
    };

    const handleViewDetails = (id: string) => {
        if (onViewDetails) {
            onViewDetails(id);
        } else {
            navigate(`/home-personal-services/details/${id}`);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🏠</span> Home & Personal Services
                    </h2>
                )}
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div
                        className="animate-spin rounded-full h-8 w-8 border-b-2"
                        style={{ borderColor: BRAND }}
                    />
                </div>
            </div>
        );
    }

    // ── Empty state ──────────────────────────────────────────────────────────
    if (filteredJobs.length === 0) {
        if (hideEmptyState) return null;
        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🏠</span> Home & Personal Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="text-6xl mb-4">🏠</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Home & Personal Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your home and personal services to showcase them here.
                    </p>
                    <button
                        onClick={() => navigate('/add-home-service-form')}
                        className="px-6 py-2.5 rounded-lg font-semibold text-white text-sm transition-all duration-200 shadow-sm"
                        style={{ backgroundColor: BRAND }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND}
                    >
                        + Add Service
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
                    <span>🏠</span> Home & Personal Services ({filteredJobs.length})
                </h2>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredJobs.map((job) => {
                    const id = job._id || "";
                    const location = [job.area, job.city, job.state].filter(Boolean).join(", ") || "Location not specified";
                    const imageUrls = (job.images || []).filter(Boolean) as string[];
                    const isHovered = hoveredCard === id;

                    return (
                        <div
                            key={id}
                            className="bg-white rounded-xl overflow-hidden transition-all duration-200"
                            style={{
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderColor: isHovered ? BRAND : "#e5e7eb",
                                boxShadow: isHovered
                                    ? "0 8px 24px rgba(0,89,138,0.15)"
                                    : "0 1px 3px rgba(0,0,0,0.06)",
                                transform: isHovered ? "translateY(-2px)" : "none",
                            }}
                            onMouseEnter={() => setHoveredCard(id)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            {/* ── Image ── */}
                            <div
                                className="relative h-48 overflow-hidden transition-colors duration-200"
                                style={{
                                    background: isHovered
                                        ? "rgba(0,89,138,0.08)"
                                        : "linear-gradient(135deg, rgba(0,89,138,0.06), rgba(0,89,138,0.03))",
                                }}
                            >
                                {imageUrls.length > 0 ? (
                                    <img
                                        src={imageUrls[0]}
                                        alt={job.title || "Service"}
                                        className="w-full h-full object-cover transition-transform duration-300"
                                        style={{ transform: isHovered ? "scale(1.03)" : "scale(1)" }}
                                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-6xl">🏠</span>
                                    </div>
                                )}

                                {/* Subcategory badge */}
                                <div className="absolute top-3 left-3">
                                    <span
                                        className={`${typography.misc.badge} text-white px-3 py-1 rounded-full shadow-md text-xs font-bold`}
                                        style={{ backgroundColor: BRAND }}
                                    >
                                        {job.subcategory || "Home Service"}
                                    </span>
                                </div>

                                {/* Action dropdown */}
                                <div className="absolute top-3 right-3">
                                    {deleteLoading === id ? (
                                        <div className="bg-white rounded-lg p-2 shadow-lg">
                                            <div
                                                className="animate-spin rounded-full h-5 w-5 border-b-2"
                                                style={{ borderColor: BRAND }}
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

                            {/* ── Details ── */}
                            <div className="p-4">
                                <h3
                                    className={`${typography.heading.h6} mb-2 truncate transition-colors duration-200`}
                                    style={{ color: isHovered ? BRAND : "#111827" }}
                                >
                                    {job.title || "Unnamed Service"}
                                </h3>

                                {job.subcategory && (
                                    <p className="text-sm font-medium text-gray-700 mb-2">{job.subcategory}</p>
                                )}

                                <div className="flex items-start gap-2 mb-3">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"
                                        style={{ color: isHovered ? BRAND : "#9ca3af" }}>
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <p className={`${typography.body.small} text-gray-600 line-clamp-2`}>{location}</p>
                                </div>

                                {job.description && (
                                    <p className={`${typography.body.small} text-gray-600 line-clamp-2 mb-3`}>
                                        {job.description}
                                    </p>
                                )}

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {job.jobType && (
                                        <span
                                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border font-medium transition-colors duration-200"
                                            style={isHovered
                                                ? { backgroundColor: "rgba(0,89,138,0.08)", color: BRAND, borderColor: "rgba(0,89,138,0.3)" }
                                                : { backgroundColor: "#f0f7fb", color: BRAND, borderColor: "rgba(0,89,138,0.2)" }
                                            }
                                        >
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: BRAND }}
                                            />
                                            {job.jobType.replace("_", " ")}
                                        </span>
                                    )}
                                    {job.subcategory && (
                                        <span className="inline-flex items-center text-xs bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md border border-gray-200">
                                            {job.subcategory}
                                        </span>
                                    )}
                                </div>

                                {/* Duration + Charges */}
                                <div className="flex items-center justify-between py-2 border-t border-gray-100 mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                                        <p className="text-sm font-semibold text-gray-700">
                                            {new Date(job.startDate).toLocaleDateString()} –{" "}
                                            {new Date(job.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {job.servicecharges && (
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Charges</p>
                                            <p
                                                className="text-base font-bold"
                                                style={{ color: BRAND }}
                                            >
                                                ₹{job.servicecharges}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* View Details button */}
                                <button
                                    onClick={() => handleViewDetails(id)}
                                    className="w-full mt-2 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200"
                                    style={{
                                        border: `2px solid ${BRAND}`,
                                        color: BRAND,
                                        backgroundColor: "transparent",
                                    }}
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = BRAND;
                                        (e.currentTarget as HTMLElement).style.color = "#fff";
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                                        (e.currentTarget as HTMLElement).style.color = BRAND;
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default HomePersonalUserService;