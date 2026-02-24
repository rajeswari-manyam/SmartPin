import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus, MapPin, Calendar, IndianRupee,
    Clock, ChevronRight, ChevronLeft, Loader2, Users, MoreVertical,
    Pencil, Trash2, Briefcase
} from "lucide-react";

import JobIcon from "../assets/icons/ListedJobs.png";
import { getUserJobs, getConfirmedWorkersCount, deleteJob, API_BASE_URL } from "../services/api.service";
import typography, { fontWeight } from "../styles/typography";

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

// ── Image Carousel ────────────────────────────────────────────────────────────
const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const validImages = images.map(resolveImageUrl).filter(Boolean) as string[];

    if (validImages.length === 0) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <Briefcase size={36} style={{ color: `${BRAND}80` }} />
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
            className={`w-full flex items-center gap-2.5 px-4 py-2.5 transition-all duration-200 ${typography.misc.badge}`}
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
    onMenuEnter: () => void;
    onMenuLeave: () => void;
}> = ({ onEdit, onDelete, onMenuEnter, onMenuLeave }) => {
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
        <div
            ref={ref}
            className="relative"
            onMouseEnter={(e) => { e.stopPropagation(); setBtnHovered(true); onMenuEnter(); }}
            onMouseLeave={(e) => { e.stopPropagation(); setBtnHovered(false); onMenuLeave(); }}
        >
            <button
                onClick={(e) => { e.stopPropagation(); setOpen((prev) => !prev); }}
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

// ── My Job Card ───────────────────────────────────────────────────────────────
const MyJobCard: React.FC<{
    job: any;
    onViewApplicants: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ job, onViewApplicants, onEdit, onDelete }) => {
    const [applicantCount, setApplicantCount] = useState<number | null>(null);
    const [cardHovered, setCardHovered] = useState(false);
    const [dropdownActive, setDropdownActive] = useState(false);

    const isHovered = cardHovered && !dropdownActive;

    useEffect(() => {
        if (job._id) {
            getConfirmedWorkersCount(job._id).then(setApplicantCount).catch(() => setApplicantCount(0));
        }
    }, [job._id]);

    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const locationStr = [job.area, job.city, job.state].filter(Boolean).join(", ") || "—";
    const images: string[] = Array.isArray(job.images) ? job.images : [];

    return (
        <div
            onMouseEnter={() => setCardHovered(true)}
            onMouseLeave={() => { setCardHovered(false); setDropdownActive(false); }}
            className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out cursor-pointer"
            style={{
                border: isHovered ? `2px solid ${BRAND}` : "2px solid #f3f4f6",
                boxShadow: isHovered
                    ? `0 8px 30px rgba(0,89,138,0.18), 0 2px 8px rgba(0,89,138,0.10)`
                    : "0 1px 3px rgba(0,0,0,0.06)",
                transform: isHovered ? "translateY(-4px) scale(1.01)" : "translateY(0) scale(1)",
            }}
        >
            {/* ── Image area ── */}
            <div className="relative h-36 flex-shrink-0" style={{ background: `linear-gradient(135deg, ${BRAND}1A, ${BRAND}0D)` }}>
                <ImageCarousel images={images} title={job.title || job.category} />

                {/* Job type badge */}
                <div className="absolute top-2 left-2 z-10">
                    <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${typography.misc.badge}`}
                        style={{
                            backgroundColor: job.jobType === "FULL_TIME" ? "#22c55e" : BRAND,
                            color: "#ffffff",
                        }}
                    >
                        <Clock size={9} />
                        {job.jobType === "FULL_TIME" ? "Full Time" : "Part Time"}
                    </span>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-7 left-2 z-10">
                    <span
                        className={`inline-flex items-center gap-1 text-white px-2 py-0.5 rounded-full ${typography.misc.badge}`}
                        style={{ backgroundColor: BRAND }}
                    >
                        <Calendar size={9} />
                        {duration} day{duration !== 1 ? "s" : ""}
                    </span>
                </div>

                {/* Applicants badge */}
                <div className="absolute bottom-7 right-2 z-10">
                    <span className={`inline-flex items-center gap-1 bg-white/90 text-gray-700 px-2 py-0.5 rounded-full shadow ${typography.misc.badge}`}>
                        <Users size={9} className="text-orange-500" />
                        {applicantCount ?? "—"} applied
                    </span>
                </div>

                {/* 3-Dot */}
                <div className="absolute top-2 right-2 z-20">
                    <JobActionDropdown
                        onEdit={() => onEdit(job._id)}
                        onDelete={() => onDelete(job._id)}
                        onMenuEnter={() => setDropdownActive(true)}
                        onMenuLeave={() => setDropdownActive(false)}
                    />
                </div>
            </div>

            {/* ── Body ── */}
            <div className="p-3 flex flex-col flex-1">
                <div className="flex flex-wrap gap-1 mb-1.5">
                    <span
                        className={`px-2 py-0.5 rounded-full border transition-all duration-300 ${typography.misc.badge}`}
                        style={{
                            backgroundColor: isHovered ? BRAND : `${BRAND}14`,
                            color: isHovered ? "#ffffff" : BRAND,
                            borderColor: isHovered ? BRAND : `${BRAND}33`,
                        }}
                    >
                        {job.category}
                    </span>
                    {job.subcategory && (
                        <span className={`px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200 ${typography.misc.badge}`}>
                            {job.subcategory}
                        </span>
                    )}
                </div>

                <h3
                    className={`line-clamp-1 mb-1 transition-colors duration-300 ${typography.card.subtitle} ${fontWeight.bold}`}
                    style={{ color: isHovered ? BRAND : "#111827" }}
                >
                    {job.title || job.category}
                </h3>

                <div className={`flex items-center gap-1 text-gray-400 mb-1 ${typography.body.xs}`}>
                    <MapPin size={10} className="flex-shrink-0" style={{ color: isHovered ? BRAND : undefined }} />
                    <span className="line-clamp-1">{locationStr}</span>
                </div>

                <div className={`flex items-center gap-1 text-gray-400 mb-3 ${typography.body.xs}`}>
                    <Calendar size={10} className="flex-shrink-0" style={{ color: isHovered ? BRAND : undefined }} />
                    <span>
                        {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" – "}
                        {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>

                <div className="flex-1" />

                <div
                    className="flex items-center justify-between pt-2 border-t transition-colors duration-300"
                    style={{ borderColor: isHovered ? `${BRAND}26` : "#f3f4f6" }}
                >
                    <div className={`flex items-center gap-0.5 text-green-600 ${fontWeight.extrabold} text-base`}>
                        <IndianRupee size={12} className="mt-0.5" />
                        {parseFloat(job.servicecharges || "0").toLocaleString("en-IN")}
                    </div>

                    {/* ── View Applicants Button — brand colored ── */}
                    <button
                        onClick={() => onViewApplicants(job._id)}
                        className={`flex items-center gap-1 text-white px-3 py-1.5 rounded-xl transition-all duration-200 active:scale-95 ${typography.misc.badge}`}
                        style={{
                            backgroundColor: "#f97316", // orange-500 — kept as design intent
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ea6c0a")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f97316")}
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
    const [postBtnHovered, setPostBtnHovered] = useState(false);

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
                            <img
                                src={JobIcon}
                                alt="My Jobs"
                                className="w-7 h-7 object-contain"
                                style={{
                                    filter: "invert(27%) sepia(69%) saturate(548%) hue-rotate(168deg) brightness(87%) contrast(101%)",
                                }}
                            />
                            <h1 className={`text-gray-900 ${typography.heading.h4}`}>My Jobs</h1>
                        </div>
                        <p className={`text-gray-500 ${typography.body.small}`}>Manage your posted jobs and view applicants.</p>
                    </div>

                    {/* ── Post Job Button — brand #00598a ── */}
                    <button
                        onClick={() => navigate("/post-job")}
                        onMouseEnter={() => setPostBtnHovered(true)}
                        onMouseLeave={() => setPostBtnHovered(false)}
                        className={`inline-flex items-center gap-1.5 text-white px-4 py-2 rounded-xl transition-all duration-300 active:scale-95 ${typography.nav.button} ${fontWeight.bold}`}
                        style={{
                            backgroundColor: postBtnHovered ? BRAND_DARK : BRAND,
                            boxShadow: postBtnHovered
                                ? "0 6px 20px rgba(0,89,138,0.40)"
                                : "0 2px 6px rgba(0,89,138,0.20)",
                            transform: postBtnHovered ? "translateY(-2px)" : "translateY(0)",
                        }}
                    >
                        <Plus size={16} /> Post Job
                    </button>
                </div>

                {/* ── My Posted Jobs ── */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <h2 className={`text-gray-800 ${typography.heading.h5}`}>My Posted Jobs</h2>
                        {!loadingMyJobs && (
                            <span
                                className={`px-2 py-0.5 rounded-full ${typography.misc.badge} ${fontWeight.bold}`}
                                style={{ backgroundColor: `${BRAND}1A`, color: BRAND }}
                            >
                                {myJobs.length}
                            </span>
                        )}
                    </div>

                    {loadingMyJobs ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
                        </div>
                    ) : myJobs.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                            <Briefcase size={36} className="text-gray-300 mx-auto mb-3" />
                            <p className={`text-gray-500 mb-1 ${typography.body.small} ${fontWeight.medium}`}>No jobs posted yet</p>
                            <p className={`text-gray-400 mb-4 ${typography.body.xs}`}>Post your first job to find workers near you</p>

                            {/* ── Empty-state Post Button — brand #00598a ── */}
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