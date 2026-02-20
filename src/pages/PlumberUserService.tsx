import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserJobs, deleteJob, API_BASE_URL } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

// ============================================================================
// JOB INTERFACE
// ============================================================================
export interface PlumberJob {
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
interface PlumberUserServiceProps {
    userId: string;
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
    onViewDetails?: (jobId: string) => void; // ✅ ADDED
}

// ============================================================================
// IMAGE URL RESOLVER
// ============================================================================
const resolveImageUrl = (path: string): string | null => {
    if (!path || typeof path !== "string") return null;
    const cleaned = path.trim();
    if (!cleaned) return null;
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    const normalized = cleaned.replace(/\\/g, "/");
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    const rel = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return `${base}${rel}`;
};

const getJobImageUrls = (images?: string[]): string[] =>
    (images || []).map(resolveImageUrl).filter(Boolean) as string[];

// ============================================================================
// IMAGE COMPONENT with fallback
// ============================================================================
const JobImage: React.FC<{ images?: string[]; title: string }> = ({ images, title }) => {
    const [currentIdx, setCurrentIdx] = useState(0);
    const [hasError, setHasError] = useState(false);
    const urls = getJobImageUrls(images);

    if (!urls.length || hasError) {
        return (
            <div className="w-full h-44 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                <span className="text-5xl">🔧</span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-44 overflow-hidden bg-gray-100">
            <img
                src={urls[currentIdx]}
                alt={title}
                className="w-full h-full object-cover"
                onError={() => {
                    if (currentIdx < urls.length - 1) setCurrentIdx(i => i + 1);
                    else setHasError(true);
                }}
            />
            {urls.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full">
                    {currentIdx + 1}/{urls.length}
                </div>
            )}
            {urls.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
                    {urls.map((_, i) => (
                        <button
                            key={i}
                            onClick={(e) => { e.stopPropagation(); setCurrentIdx(i); }}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIdx ? "bg-white w-3" : "bg-white/60"}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const PlumberUserService: React.FC<PlumberUserServiceProps> = ({
    userId,
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
    onViewDetails, // ✅ ADDED
}) => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<PlumberJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            if (!userId) { setJobs([]); setLoading(false); return; }
            setLoading(true);
            try {
                const response = await getUserJobs(userId);
                const plumberJobs = (response.jobs || response.data || []).filter((job: any) =>
                    job.category && job.category.toLowerCase() === "plumbing"
                );
                setJobs(plumberJobs);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, [userId]);

    const filteredJobs = selectedSubcategory
        ? jobs.filter(job =>
            job.subcategory &&
            selectedSubcategory.toLowerCase().includes(job.subcategory.toLowerCase())
        )
        : jobs;

    const handleDelete = async (jobId: string) => {
        if (!window.confirm("Delete this service?")) return;
        setDeletingId(jobId);
        try {
            const result = await deleteJob(jobId);
            if (result.success) setJobs(prev => prev.filter(j => j._id !== jobId));
            else alert("Failed to delete service. Please try again.");
        } catch (error) {
            console.error("Error deleting job:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    const openDirections = (job: PlumberJob) => {
        if (job.latitude && job.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`, "_blank");
        } else if (job.area || job.city) {
            const addr = encodeURIComponent([job.area, job.city, job.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    // ✅ Handle View Details — use onViewDetails prop if provided, else navigate normally
    const handleViewDetails = (job: PlumberJob) => {
        if (onViewDetails) {
            onViewDetails(job._id);
        } else {
            navigate(`/plumber-services/details/${job._id}`);
        }
    };

    const renderJobCard = (job: PlumberJob) => {
        const id = job._id || "";
        const location = [job.area, job.city, job.state].filter(Boolean).join(", ") || "Location not set";

        return (
            <div
                key={id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col relative"
                style={{ border: "1px solid #e5e7eb" }}
            >
                <div className="relative">
                    <JobImage images={job.images} title={job.title} />
                    {job.subcategory && (
                        <div className="absolute top-2 left-2">
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full shadow">
                                🔧 {job.subcategory}
                            </span>
                        </div>
                    )}
                    {job.jobType && (
                        <div className="absolute bottom-2 left-2">
                            <span className="inline-flex items-center text-[10px] font-bold bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full shadow">
                                {job.jobType.replace("_", " ")}
                            </span>
                        </div>
                    )}
                    <div className="absolute top-2 right-2 z-10">
                        <ActionDropdown
                            onEdit={(e: React.MouseEvent) => { e.stopPropagation(); navigate(`/add-plumber-service-form?id=${id}`); }}
                            onDelete={(e: React.MouseEvent) => { e.stopPropagation(); handleDelete(id); }}
                        />
                    </div>
                </div>

                <div className="p-4 flex flex-col flex-1 gap-2.5">
                    <h2 className="text-base font-bold text-gray-900 truncate">
                        {job.title || "Unnamed Service"}
                    </h2>
                    <p className="text-xs text-gray-500 flex items-start gap-1">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>
                    {job.description && (
                        <p className="text-xs text-gray-600 line-clamp-2">{job.description}</p>
                    )}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100 mt-1">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Duration</p>
                            <p className="text-xs font-semibold text-gray-800">
                                {job.startDate ? new Date(job.startDate).toLocaleDateString("en-IN") : "—"}
                                {" – "}
                                {job.endDate ? new Date(job.endDate).toLocaleDateString("en-IN") : "—"}
                            </p>
                        </div>
                        {job.servicecharges && (
                            <div className="text-right">
                                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Charges</p>
                                <p className="text-base font-extrabold text-green-600">₹{job.servicecharges}</p>
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-auto pt-1">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDirections(job)}
                            className="flex-1 justify-center gap-1 border-gray-300 text-gray-700 hover:bg-gray-50 text-xs"
                        >
                            📍 Directions
                        </Button>
                        {/* ✅ FIXED: calls handleViewDetails which uses onViewDetails prop */}
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleViewDetails(job)}
                            className="flex-1 justify-center gap-1 text-xs"
                            disabled={deletingId === id}
                        >
                            👁️ View Details
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🔧</span> Plumber Services
                    </h2>
                )}
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            </div>
        );
    }

    if (filteredJobs.length === 0) {
        if (hideEmptyState) return null;
        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🔧</span> Plumber Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                    <div className="text-6xl mb-4">🔧</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Plumber Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your plumber services to showcase them here.
                    </p>
                    <Button variant="primary" size="md" onClick={() => navigate("/add-plumber-service-form")} className="gap-1.5">
                        + Add Plumber Service
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {!hideHeader && (
                <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                    <span>🔧</span> Plumber Services ({filteredJobs.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredJobs.map(renderJobCard)}
            </div>
        </div>
    );
};

export default PlumberUserService;
