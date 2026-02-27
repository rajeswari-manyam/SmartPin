import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus, MapPin, Calendar, IndianRupee,
    ChevronRight, ChevronLeft, Loader2, Users, MoreVertical,
    Pencil, Trash2, Briefcase, Eye
} from "lucide-react";

import JobIcon from "../assets/icons/ListedJobs.png";
import { getUserJobs, getConfirmedWorkersCount, deleteJob, API_BASE_URL } from "../services/api.service";
import typography, { fontWeight } from "../styles/typography";
import { categories } from "../components/categories/Categories";

// ── Brand Color ───────────────────────────────────────────────────────────────
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

// Helper to get category name from ID or name
const getCategoryDisplayName = (categoryValue: string): string => {
    if (!categoryValue) return "Unknown";
    
    // Check if it's an ID (numeric string)
    const categoryById = categories.find(c => c.id === categoryValue);
    if (categoryById) return categoryById.name;
    
    // Check if it's already a name
    const categoryByName = categories.find(c => c.name.toLowerCase() === categoryValue.toLowerCase());
    if (categoryByName) return categoryByName.name;
    
    // Return as-is if not found
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
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 transition-all duration-200 text-sm`}
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
                    <DropdownItem
                        icon={<Pencil size={14} />}
                        label="Edit"
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onEdit(); }}
                    />
                    <div className="h-px bg-gray-100" />
                    <DropdownItem
                        icon={<Trash2 size={14} />}
                        label="Delete"
                        danger
                        onClick={(e) => { e.stopPropagation(); setOpen(false); onDelete(); }}
                    />
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

    const prev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex((i) => (i === 0 ? validImages.length - 1 : i - 1)); };
    const next = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex((i) => (i === validImages.length - 1 ? 0 : i + 1)); };

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
    
    // Get proper category name
    const categoryName = getCategoryDisplayName(job.category);

    // Format date like screenshot: 1/10/2026 – 1/15/2026
    const formatDate = (date: Date) => {
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    };
    const dateRange = `${formatDate(startDate)} – ${formatDate(endDate)}`;
    const postedDate = new Date(job.createdAt || job.postedAt || Date.now()).toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric"
    });

    useEffect(() => {
        if (job._id) {
            getConfirmedWorkersCount(job._id).then(setApplicantCount).catch(() => setApplicantCount(0));
        }
    }, [job._id]);

    return (
        <div
            onMouseEnter={() => setCardHovered(true)}
            onMouseLeave={() => setCardHovered(false)}
            className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-300 ease-in-out"
            style={{
                borderColor: cardHovered ? BRAND : "#e5e7eb",
                boxShadow: cardHovered ? "0 4px 20px rgba(0,89,138,0.15)" : "0 1px 3px rgba(0,0,0,0.08)",
                transform: cardHovered ? "translateY(-2px)" : "translateY(0)",
            }}
        >
            {/* ── Image area ── */}
            <div className="relative h-40 bg-gray-100">
                <ImageCarousel images={images} title={job.title || categoryName} />

                {/* 3-Dot Dropdown - Top Right */}
                <div className="absolute top-2 right-2 z-20">
                    <JobActionDropdown
                        onEdit={() => onEdit(job._id)}
                        onDelete={() => onDelete(job._id)}
                    />
                </div>
            </div>

            {/* ── Body ── */}
            <div className="p-4">
                {/* Title */}
                <h3 className={`text-lg font-bold text-gray-900 mb-2 line-clamp-1 ${typography.card.title}`}>
                    {job.title || categoryName}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {job.description || "Need a skilled worker for this job"}
                </p>

                {/* Location */}
                <div className="flex items-center gap-1.5 mb-2 text-gray-600">
                    <MapPin size={14} className="text-red-500 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{locationStr}</span>
                </div>

                {/* Price and Job Type */}
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-bold text-base flex items-center">
                        <IndianRupee size={14} className="inline" />
                        {parseFloat(job.servicecharges || "0").toLocaleString("en-IN")}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        job.jobType === "FULL_TIME" 
                            ? "bg-yellow-100 text-yellow-700" 
                            : "bg-blue-100 text-blue-700"
                    }`}>
                        {job.jobType === "FULL_TIME" ? "FULL-TIME" : "PART-TIME"}
                    </span>
                </div>

                {/* Date Range with calendar icon */}
                <div className="flex items-center gap-1.5 mb-1 text-gray-600">
                    <Calendar size={14} className="flex-shrink-0" />
                    <span className="text-sm">{dateRange}</span>
                </div>

                {/* Posted date */}
                <p className="text-gray-400 text-xs mb-4">
                    Posted: {postedDate}
                </p>

                {/* View Applicants Button */}
                <button
                    onClick={() => onViewApplicants(job._id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00598a] text-white font-medium text-sm hover:bg-[#004a73] transition-colors mb-3"
                >
                    <Eye size={16} />
                    View Applicants {applicantCount !== null && `(${applicantCount})`}
                </button>
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
                setMyJobs((prev) => prev.filter((j) => j._id !== jobId));
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
        <div className="min-h-screen bg-gray-50 px-4 py-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className={`text-2xl font-bold text-gray-900`}>
                            My Jobs ({myJobs.length})
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm">Welcome, Cherry! 👋</p>
                </div>

                {/* ── My Posted Jobs ── */}
                <div>
                    {loadingMyJobs ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
                        </div>
                    ) : myJobs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                            <Briefcase size={36} className="text-gray-300 mx-auto mb-3" />
                            <p className={`text-gray-500 mb-1 ${typography.body.small} ${fontWeight.medium}`}>No jobs posted yet</p>
                            <p className={`text-gray-400 mb-4 ${typography.body.xs}`}>Post your first job to find workers near you</p>
                            <button
                                onClick={() => navigate("/post-job")}
                                className={`inline-flex items-center gap-1.5 text-white px-4 py-2 rounded-xl transition-all duration-300 active:scale-95 ${typography.body.small} ${fontWeight.bold}`}
                                style={{ backgroundColor: BRAND }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRAND)}
                            >
                                <Plus size={14} /> Post a Job
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {myJobs.map((job) => (
                                <div
                                    key={job._id}
                                    className={`transition-opacity ${deletingId === job._id ? "opacity-40 pointer-events-none" : ""}`}
                                >
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
        </div>
    );
};

export default ListedJobs;