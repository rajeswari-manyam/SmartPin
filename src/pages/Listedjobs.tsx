import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Briefcase, Plus, MapPin, Calendar, IndianRupee,
    Clock, ChevronRight, ChevronLeft, Loader2, Users, MoreVertical,
    Pencil, Trash2
} from "lucide-react";

import { getUserJobs, getConfirmedWorkersCount, deleteJob, API_BASE_URL } from "../services/api.service";

interface ListedJobsProps {
    userId: string;
}

// ── Resolve image URLs ────────────────────────────────────────────────────────
const resolveImageUrl = (path?: string): string | null => {
    if (!path || typeof path !== "string") return null;
    const cleaned = path.trim();
    if (!cleaned) return null;
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    return `${base}${cleaned.startsWith("/") ? cleaned : "/" + cleaned}`;
};

// ── Image Carousel ────────────────────────────────────────────────────────────
const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const validImages = images.map(resolveImageUrl).filter(Boolean) as string[];

    if (validImages.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Briefcase size={36} className="text-[#f09b13]/50" />
            </div>
        );
    }

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((i) => (i === 0 ? validImages.length - 1 : i - 1));
    };

    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentIndex((i) => (i === validImages.length - 1 ? 0 : i + 1));
    };

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Sliding images */}
            <div
                className="flex h-full transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {validImages.map((url, i) => (
                    <img
                        key={i}
                        src={url}
                        alt={`${title} ${i + 1}`}
                        className="w-full h-full object-cover flex-shrink-0"
                        style={{ minWidth: "100%" }}
                    />
                ))}
            </div>

            {/* Left / Right arrows — only if more than 1 image */}
            {validImages.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center
                            bg-black/40 hover:bg-black/65 text-white rounded-full transition active:scale-90 z-10"
                    >
                        <ChevronLeft size={15} />
                    </button>
                    <button
                        onClick={next}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center
                            bg-black/40 hover:bg-black/65 text-white rounded-full transition active:scale-90 z-10"
                    >
                        <ChevronRight size={15} />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                        {validImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={`rounded-full transition-all ${i === currentIndex
                                    ? "w-3 h-1.5 bg-white"
                                    : "w-1.5 h-1.5 bg-white/50"
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Counter badge top-center */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 pointer-events-none">
                        {currentIndex + 1} / {validImages.length}
                    </div>
                </>
            )}
        </div>
    );
};

// ── 3-Dot Dropdown Menu ───────────────────────────────────────────────────────
const JobActionDropdown: React.FC<{
    onEdit: () => void;
    onDelete: () => void;
}> = ({ onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen((prev) => !prev);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 hover:bg-white text-gray-600 shadow transition active:scale-95"
            >
                <MoreVertical size={16} />
            </button>

            {open && (
                <div className="absolute right-0 top-9 z-50 w-36 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            onEdit();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f09b13]/10 hover:text-[#f09b13] transition"
                    >
                        <Pencil size={14} />
                        Edit
                    </button>
                    <div className="h-px bg-gray-100" />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            onDelete();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
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

    useEffect(() => {
        if (job._id) {
            getConfirmedWorkersCount(job._id)
                .then(setApplicantCount)
                .catch(() => setApplicantCount(0));
        }
    }, [job._id]);

    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const locationStr = [job.area, job.city, job.state].filter(Boolean).join(", ") || "—";
    const images: string[] = Array.isArray(job.images) ? job.images : [];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">

            {/* ── Image Carousel ── */}
            <div className="relative h-36 bg-gradient-to-br from-[#f09b13]/10 to-[#f5b340]/10 flex-shrink-0">
                <ImageCarousel images={images} title={job.title || job.category} />

                {/* Job type badge — bottom-left (above dots) */}
                <div className="absolute top-2 left-2 z-10">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold
                        ${job.jobType === "FULL_TIME" ? "bg-green-500 text-white" : "bg-[#f09b13] text-white"}`}>
                        <Clock size={9} />
                        {job.jobType === "FULL_TIME" ? "Full Time" : "Part Time"}
                    </span>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-7 left-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-[#f09b13] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        <Calendar size={9} />
                        {duration} day{duration !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Applicants badge */}
                <div className="absolute bottom-7 right-2 z-10">
                    <span className="inline-flex items-center gap-1 bg-white/90 text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full shadow">
                        <Users size={9} className="text-orange-500" />
                        {applicantCount ?? "—"} applied
                    </span>
                </div>

                {/* 3-Dot Action Dropdown — top-right, above carousel counter */}
                <div className="absolute top-2 right-2 z-20">
                    <JobActionDropdown
                        onEdit={() => onEdit(job._id)}
                        onDelete={() => onDelete(job._id)}
                    />
                </div>
            </div>

            {/* Body */}
            <div className="p-3 flex flex-col flex-1">
                <div className="flex flex-wrap gap-1 mb-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#f09b13]/10 text-[#f09b13] border border-[#f09b13]/20 font-medium">
                        {job.category}
                    </span>
                    {job.subcategory && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 font-medium">
                            {job.subcategory}
                        </span>
                    )}
                </div>

                <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
                    {job.title || job.category}
                </h3>

                <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
                    <MapPin size={10} className="flex-shrink-0" />
                    <span className="line-clamp-1">{locationStr}</span>
                </div>

                <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                    <Calendar size={10} className="flex-shrink-0" />
                    <span>
                        {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" – "}
                        {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>

                <div className="flex-1" />

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-0.5 text-green-600 font-extrabold text-base">
                        <IndianRupee size={12} className="mt-0.5" />
                        {parseFloat(job.servicecharges || "0").toLocaleString("en-IN")}
                    </div>
                    <button
                        onClick={() => onViewApplicants(job._id)}
                        className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition active:scale-95"
                    >
                        Applicants <ChevronRight size={12} />
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
        <div className="min-h-screen bg-gray-50 px-3 sm:px-4 py-4 sm:py-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Briefcase className="w-6 h-6 text-[#f09b13]" />
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Find Jobs</h1>
                        </div>
                        <p className="text-sm text-gray-500">
                            Discover available service jobs in your area.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/post-job")}
                        className="inline-flex items-center gap-1.5 bg-[#f09b13] hover:bg-[#f5b340] text-white text-sm font-bold px-4 py-2 rounded-xl transition active:scale-95"
                    >
                        <Plus size={16} /> Post Job
                    </button>
                </div>

                {/* ── My Posted Jobs ── */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className="text-lg font-bold text-gray-800">My Posted Jobs</h2>
                        {!loadingMyJobs && (
                            <span className="text-xs bg-[#f09b13]/10 text-[#f09b13] font-bold px-2 py-0.5 rounded-full">
                                {myJobs.length}
                            </span>
                        )}
                    </div>

                    {loadingMyJobs ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin text-[#f09b13]" />
                        </div>
                    ) : myJobs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                            <Briefcase size={36} className="text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium mb-1">No jobs posted yet</p>
                            <p className="text-xs text-gray-400 mb-4">Post your first job to find workers near you</p>
                            <button
                                onClick={() => navigate("/post-job")}
                                className="inline-flex items-center gap-1.5 bg-[#f09b13] text-white text-sm font-bold px-4 py-2 rounded-xl"
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
