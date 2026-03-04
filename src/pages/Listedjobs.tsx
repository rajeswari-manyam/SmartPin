import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus, MapPin, Calendar, IndianRupee,
    ChevronRight, ChevronLeft, Loader2, MoreVertical,
    Pencil, Trash2, Briefcase, Eye, Layers
} from "lucide-react";

import JobIcon from "../assets/icons/ListedJobs.png";
import { getUserJobs, getConfirmedWorkersCount, deleteJob, API_BASE_URL } from "../services/api.service";
import typography from "../styles/typography";
import { categories } from "../components/categories/Categories";

const BRAND = "#00598a";
const BRAND_DARK = "#004a75";

interface ListedJobsProps {
    userId: string;
}

const resolveImageUrl = (path?: string): string | null => {
    if (!path || typeof path !== "string") return null;
    const cleaned = path.trim();
    if (!cleaned) return null;
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    return `${base}${cleaned.startsWith("/") ? cleaned : "/" + cleaned}`;
};

const getCategoryDisplayName = (categoryValue: string): string => {
    if (!categoryValue) return "Unknown";
    const categoryById = categories.find(c => c.id === categoryValue);
    if (categoryById) return categoryById.name;
    const categoryByName = categories.find(c => c.name.toLowerCase() === categoryValue.toLowerCase());
    if (categoryByName) return categoryByName.name;
    return categoryValue;
};

// ── Dropdown Item ─────────────────────────────────────────────────────────────
const DropdownItem: React.FC<{
    icon: React.ReactNode;
    label: string;
    onClick: (e: React.MouseEvent) => void;
    danger?: boolean;
}> = ({ icon, label, onClick, danger }) => {
    const [hovered, setHovered] = useState(false);
    return (
        <button
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 transition-all duration-200 text-sm"
            style={{
                backgroundColor: hovered ? (danger ? "#ef4444" : BRAND) : "transparent",
                color: hovered ? "#ffffff" : danger ? "#ef4444" : "#374151",
            }}
        >
            <span style={{ color: hovered ? "#ffffff" : danger ? "#ef4444" : "#6b7280", display: "flex" }}>
                {icon}
            </span>
            {label}
        </button>
    );
};

// ── 3-Dot Dropdown ────────────────────────────────────────────────────────────
const JobActionDropdown: React.FC<{
    onEdit: () => void;
    onDelete: () => void;
}> = ({ onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const [btnHovered, setBtnHovered] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((prev) => !prev); }}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full shadow transition-all duration-200 active:scale-95"
                style={{
                    backgroundColor: btnHovered ? BRAND : "rgba(255,255,255,0.92)",
                    color: btnHovered ? "#ffffff" : "#4b5563",
                }}
            >
                <MoreVertical size={16} />
            </button>
            {open && (
                <div className="absolute right-0 top-9 z-50 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <DropdownItem icon={<Pencil size={14} />} label="Edit"
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }} />
                    <div className="h-px bg-gray-100" />
                    <DropdownItem icon={<Trash2 size={14} />} label="Delete" danger
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }} />
                </div>
            )}
        </div>
    );
};

// ── Image Carousel ────────────────────────────────────────────────────────────
const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const validImages = images.map(resolveImageUrl).filter(Boolean) as string[];

    if (validImages.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                <span className="text-4xl mb-2">📷</span>
                <span className="text-gray-400 text-sm">No Image</span>
            </div>
        );
    }

    const prev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex(i => i === 0 ? validImages.length - 1 : i - 1); };
    const next = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex(i => i === validImages.length - 1 ? 0 : i + 1); };

    return (
        <div className="relative w-full h-full overflow-hidden">
            <div className="flex h-full transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
                {validImages.map((url, i) => (
                    <img key={i} src={url} alt={`${title} ${i + 1}`} className="w-full h-full object-cover flex-shrink-0" style={{ minWidth: "100%" }} />
                ))}
            </div>
            {validImages.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/40 hover:bg-black/65 text-white rounded-full transition active:scale-90 z-10">
                        <ChevronLeft size={15} />
                    </button>
                    <button onClick={next} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center bg-black/40 hover:bg-black/65 text-white rounded-full transition active:scale-90 z-10">
                        <ChevronRight size={15} />
                    </button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {validImages.map((_, i) => (
                            <button key={i} onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={`rounded-full transition-all ${i === currentIndex ? "w-3 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`} />
                        ))}
                    </div>
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 pointer-events-none">
                        {currentIndex + 1} / {validImages.length}
                    </div>
                </>
            )}
        </div>
    );
};

// ── My Job Card ───────────────────────────────────────────────────────────────
const MyJobCard: React.FC<{
    job: any;
    onViewApplicants: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ job, onViewApplicants, onEdit, onDelete }) => {
    const [applicantCount, setApplicantCount] = useState<number | null>(null);
    const [cardHovered, setCardHovered] = useState(false);

    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const locationStr = [job.area, job.city, job.state].filter(Boolean).join(", ") || "—";
    const images: string[] = Array.isArray(job.images) ? job.images : [];
    const categoryName = getCategoryDisplayName(job.category);

    const subCategoryRaw = job.subCategory || job.subcategory || job.subCategories || job.subcategories || "";
    const subCategoryList: string[] = Array.isArray(subCategoryRaw)
        ? subCategoryRaw.filter(Boolean)
        : subCategoryRaw ? [subCategoryRaw] : [];

    const formatDate = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
    const dateRange = `${formatDate(startDate)} – ${formatDate(endDate)}`;
    const postedDate = new Date(job.createdAt || job.postedAt || Date.now()).toLocaleDateString("en-US", {
        month: "numeric", day: "numeric", year: "numeric",
    });

    // Truncate description to max 100 chars as a hard fallback
    const rawDesc = job.description || "Need a skilled worker for this job";
    const description = rawDesc.length > 100 ? rawDesc.slice(0, 100) + "…" : rawDesc;

    useEffect(() => {
        if (job._id) {
            getConfirmedWorkersCount(job._id).then(setApplicantCount).catch(() => setApplicantCount(0));
        }
    }, [job._id]);

    return (
        <div
            onMouseEnter={() => setCardHovered(true)}
            onMouseLeave={() => setCardHovered(false)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 ease-in-out flex flex-col"
            style={{
                borderColor: cardHovered ? BRAND : "#e5e7eb",
                boxShadow: cardHovered ? "0 4px 20px rgba(0,89,138,0.15)" : "0 1px 3px rgba(0,0,0,0.08)",
                transform: cardHovered ? "translateY(-2px)" : "translateY(0)",
            }}
        >
            {/* ── Image area ── */}
            <div className="relative h-40 bg-gray-100 flex-shrink-0">
                <ImageCarousel images={images} title={job.title || categoryName} />
                <div className="absolute top-2 right-2 z-20">
                    <JobActionDropdown onEdit={() => onEdit(job._id)} onDelete={() => onDelete(job._id)} />
                </div>
            </div>

            {/* ── Card Body ── */}
            <div className="p-4 flex flex-col flex-1 min-w-0">

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-1 truncate flex-shrink-0">
                    {job.title || categoryName}
                </h3>

                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3 flex-shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#e8f4fb] text-[#00598a] border border-[#00598a]/20 whitespace-nowrap">
                        <Briefcase size={10} />
                        {categoryName}
                    </span>
                    {subCategoryList.slice(0, 2).map((sub, i) => (
                        <span key={i} className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200 whitespace-nowrap">
                            <Layers size={10} />
                            {sub}
                        </span>
                    ))}
                    {subCategoryList.length > 2 && (
                        <span className="inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-500 whitespace-nowrap">
                            +{subCategoryList.length - 2}
                        </span>
                    )}
                </div>

                {/* ── Description — hard clamped, always 2 lines, word-break ── */}
                <div className="flex-shrink-0 mb-3" style={{ minHeight: "2.5rem" }}>
                    <p
                        className="text-gray-600 text-sm leading-5 w-full"
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            wordBreak: "break-all",
                            overflowWrap: "break-word",
                            whiteSpace: "normal",
                            maxHeight: "2.5rem",
                        }}
                    >
                        {description}
                    </p>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-2 text-gray-600 flex-shrink-0 min-w-0">
                    <MapPin size={14} className="text-red-500 flex-shrink-0" />
                    <span className="text-sm truncate">{locationStr}</span>
                </div>

                {/* Price + Job type */}
                <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                    <span className="text-green-600 font-bold text-base flex items-center gap-0.5">
                        <IndianRupee size={14} />
                        {parseFloat(job.servicecharges || "0").toLocaleString("en-IN")}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${job.jobType === "FULL_TIME" ? "bg-yellow-100 text-yellow-700" : "bg-blue-100 text-blue-700"
                        }`}>
                        {job.jobType === "FULL_TIME" ? "FULL-TIME" : "PART-TIME"}
                    </span>
                </div>

                {/* Date range */}
                <div className="flex items-center gap-1.5 mb-1 text-gray-600 flex-shrink-0">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="text-sm">{dateRange}</span>
                </div>
                <p className="text-gray-400 text-xs mb-4 flex-shrink-0">Posted: {postedDate}</p>

                {/* Button pinned to bottom */}
                <div className="mt-auto">
                    <button
                        onClick={() => onViewApplicants(job._id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-medium text-sm transition-colors"
                        style={{ backgroundColor: BRAND }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRAND)}
                    >
                        <Eye size={16} />
                        View Applicants {applicantCount !== null && `(${applicantCount})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ListedJobs: React.FC<ListedJobsProps> = ({ userId }) => {
    const navigate = useNavigate();
    const [myJobs, setMyJobs] = useState<any[]>([]);
    const [loadingMyJobs, setLoadingMyJobs] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        setLoadingMyJobs(true);
        getUserJobs(userId)
            .then((res) => {
                const jobs = res.jobs || res.data || (Array.isArray(res) ? res : []);
                setMyJobs(jobs);
            })
            .catch(() => setMyJobs([]))
            .finally(() => setLoadingMyJobs(false));
    }, [userId]);

    const handleViewApplicants = (jobId: string) => navigate(`/job-applicants/${jobId}`);
    const handleEdit = (jobId: string) => navigate(`/update-job/${jobId}`);

    const handleDelete = async (jobId: string) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        setDeletingId(jobId);
        try {
            const result = await deleteJob(jobId);
            if (result.success) {
                setMyJobs(prev => prev.filter(j => j._id !== jobId));
            } else {
                alert("Failed to delete job. Please try again.");
            }
        } catch (error) {
            console.error("Delete job error:", error);
            alert("Failed to delete job. Please try again.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Sticky Header */}
            <div
                className="sticky top-0 z-10 bg-white px-4 py-3.5 flex items-center justify-between"
                style={{ borderBottom: "1px solid #e9ecef", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
                <div className="flex items-center gap-2.5">
                    <img src={JobIcon} alt="Jobs" className="w-8 h-8 object-contain flex-shrink-0" />
                    <div>
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">My Jobs</h1>
                        {!loadingMyJobs && (
                            <p className="text-xs text-gray-400 leading-none">
                                {myJobs.length} job{myJobs.length !== 1 ? "s" : ""} posted
                            </p>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => navigate("/post-job")}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 active:scale-95 shadow-sm hover:shadow-md"
                    style={{ background: `linear-gradient(135deg, ${BRAND}, #0077b6)`, boxShadow: `0 2px 10px ${BRAND}44` }}
                    onMouseEnter={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${BRAND_DARK}, #005f93)`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${BRAND}, #0077b6)`)}
                >
                    <Plus size={16} />
                    Post Job
                </button>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {loadingMyJobs ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
                    </div>
                ) : myJobs.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "#e8f4fb" }}>
                            <img src={JobIcon} alt="No jobs" className="w-10 h-10 object-contain" />
                        </div>
                        <p className="text-gray-700 mb-1 font-semibold text-base">No jobs posted yet</p>
                        <p className="text-gray-400 mb-6 text-sm">Post your first job to find skilled workers near you</p>
                        <button
                            onClick={() => navigate("/post-job")}
                            className="inline-flex items-center gap-2 text-white px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
                            style={{ background: `linear-gradient(135deg, ${BRAND}, #0077b6)` }}
                            onMouseEnter={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${BRAND_DARK}, #005f93)`)}
                            onMouseLeave={e => (e.currentTarget.style.background = `linear-gradient(135deg, ${BRAND}, #0077b6)`)}
                        >
                            <Plus size={16} />
                            Post Your First Job
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                        {myJobs.map(job => (
                            <div key={job._id} className={`transition-opacity ${deletingId === job._id ? "opacity-40 pointer-events-none" : ""}`}>
                                <MyJobCard
                                    job={job}
                                    onViewApplicants={handleViewApplicants}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ListedJobs;