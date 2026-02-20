import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin, Loader2, ChevronDown, ChevronLeft, ChevronRight,
    ArrowRight, IndianRupee, Briefcase, Calendar, Clock, Image as ImageIcon
} from "lucide-react";
import { getNearbyJobsForWorker, JobDetail, API_BASE_URL } from "../services/api.service";
import CategoriesData from "../data/categories.json";

interface AllJobsProps {
    latitude?: number;
    longitude?: number;
    searchText?: string;
    filterCategory?: string;
    workerId?: string;
}

// ── resolve relative image paths ────────────────────────────────────────────
const resolveImageUrl = (path: string): string | null => {
    if (!path || typeof path !== "string") return null;
    const cleaned = path.trim();
    if (!cleaned) return null;
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    const rel = cleaned.replace(/\\/g, "/");
    return `${base}${rel.startsWith("/") ? rel : "/" + rel}`;
};

const getImageUrls = (images?: string[]): string[] =>
    (images || []).map(resolveImageUrl).filter(Boolean) as string[];

// ── Shared image carousel ────────────────────────────────────────────────────
const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
    const [idx, setIdx] = useState(0);
    const [imgError, setImgError] = useState(false);

    useEffect(() => { setImgError(false); setIdx(0); }, [images]);

    if (!images.length || imgError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f09b13]/10 to-[#f5b340]/10">
                <Briefcase size={40} className="text-[#f09b13]/50" />
            </div>
        );
    }

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIdx(i => (i - 1 + images.length) % images.length);
    };
    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIdx(i => (i + 1) % images.length);
    };

    return (
        <div className="relative w-full h-full group">
            <img
                src={images[idx]}
                alt={title}
                className="w-full h-full object-cover"
                onError={() => {
                    if (idx < images.length - 1) setIdx(i => i + 1);
                    else setImgError(true);
                }}
            />
            {images.length > 1 && (
                <>
                    {/* Left arrow */}
                    <button
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65
                            text-white rounded-full w-7 h-7 flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <ChevronLeft size={14} />
                    </button>
                    {/* Right arrow */}
                    <button
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65
                            text-white rounded-full w-7 h-7 flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <ChevronRight size={14} />
                    </button>
                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={e => { e.stopPropagation(); setIdx(i); }}
                                className={`h-1.5 rounded-full transition-all duration-200
                                    ${i === idx ? "bg-white w-4" : "bg-white/55 w-1.5"}`}
                            />
                        ))}
                    </div>
                    {/* Counter */}
                    <div className="absolute bottom-3 right-3 bg-black/55 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                        {idx + 1}/{images.length}
                    </div>
                </>
            )}
        </div>
    );
};

const RADIUS_OPTIONS = [2, 5, 10, 20, 50];

const AllJobs: React.FC<AllJobsProps> = ({
    searchText = "",
    filterCategory,
    workerId: workerIdProp,
}) => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<JobDetail[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");
    const [noProfile, setNoProfile] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(filterCategory || "all");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedRadius, setSelectedRadius] = useState(10);
    const [radiusDropdownOpen, setRadiusDropdownOpen] = useState(false);

    useEffect(() => { fetchJobs(); }, [workerIdProp]);

    useEffect(() => {
        const handle = (e: MouseEvent) => {
            const t = e.target as HTMLElement;
            if (!t.closest("#category-dropdown")) setDropdownOpen(false);
            if (!t.closest("#radius-dropdown")) setRadiusDropdownOpen(false);
        };
        document.addEventListener("mousedown", handle);
        return () => document.removeEventListener("mousedown", handle);
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError("");
            setNoProfile(false);

            const workerId =
                workerIdProp ||
                localStorage.getItem("workerId") ||
                localStorage.getItem("@worker_id") ||
                localStorage.getItem("worker_id");

            if (!workerId) {
                // ── No worker profile yet ──────────────────────────────────
                setNoProfile(true);
                setJobs([]);
                setLoading(false);
                return;
            }

            const res = await getNearbyJobsForWorker(workerId);
            const data: JobDetail[] = res.jobs || [];
            setJobs(data);
            if (data.length === 0) setError("No jobs found near your location");
        } catch (err: any) {
            const msg: string = err.message || "";
            // 404 means worker profile not created yet → show Create Profile screen
            if (
                msg.includes("404") ||
                msg.toLowerCase().includes("not found") ||
                msg.toLowerCase().includes("worker not found") ||
                msg.toLowerCase().includes("profile not found")
            ) {
                setNoProfile(true);
                setJobs([]);
            } else {
                setError(msg || "Failed to fetch jobs");
                setJobs([]);
            }
        } finally {
            setLoading(false);
        }
    };

    const filtered = jobs.filter(job => {
        const sl = searchText.toLowerCase();
        const matchSearch = !sl
            || job.title.toLowerCase().includes(sl)
            || job.description.toLowerCase().includes(sl)
            || job.category.toLowerCase().includes(sl)
            || (job.subcategory && job.subcategory.toLowerCase().includes(sl));
        const matchCat = selectedCategory === "all" || job.category === selectedCategory;
        const matchRadius = job.distance == null || job.distance <= selectedRadius * 1000;
        return matchSearch && matchCat && matchRadius;
    });

    const categoryLabel = selectedCategory === "all"
        ? "All Categories"
        : CategoriesData.categories.find(c => c.name === selectedCategory)?.name || selectedCategory;

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-[40vh] flex justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin text-[#f09b13]" />
        </div>
    );

    // ── No Worker Profile → Create Profile Screen ────────────────────────────
    if (noProfile) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f4f8] px-6">
            {/* Worker illustration emoji */}
            <div className="text-8xl mb-6 select-none">👷</div>

            <h2 className="text-2xl font-extrabold text-gray-900 text-center mb-3">
                Create Your Worker Profile
            </h2>
            <p className="text-gray-500 text-center text-sm max-w-xs mb-10 leading-relaxed">
                Set up your worker profile to get started and find nearby job opportunities.
            </p>

            <button
                onClick={() => navigate("/worker-profile")}
                className="bg-[#f09b13] hover:bg-[#f5b340] active:scale-95 text-white
                    font-bold text-base px-10 py-4 rounded-full shadow-lg
                    transition-all duration-200 w-72"
            >
                Create Profile
            </button>
        </div>
    );

    // ── Generic error ────────────────────────────────────────────────────────
    if (error && jobs.length === 0) return (
        <div className="min-h-[40vh] flex flex-col justify-center items-center p-6">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Jobs Available</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                    onClick={fetchJobs}
                    className="bg-[#f09b13] text-white px-6 py-3 rounded-xl hover:bg-[#f5b340] transition font-semibold"
                >
                    Try Again
                </button>
            </div>
        </div>
    );

    // ── Main Jobs List ───────────────────────────────────────────────────────
    return (
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6">
            {/* Header + filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">
                        Nearby Job Opportunities
                    </h1>
                    <p className="text-xs md:text-sm text-gray-500 mt-0.5">Browse all available jobs in your area</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Radius */}
                    <div id="radius-dropdown" className="relative">
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                            <span className="text-xs md:text-sm text-gray-500 font-medium">Within:</span>
                            <button
                                onClick={() => setRadiusDropdownOpen(p => !p)}
                                className="flex items-center gap-1 text-xs md:text-sm font-semibold text-gray-800 hover:text-[#f09b13]"
                            >
                                {selectedRadius} km
                                <ChevronDown size={13} className={`transition-transform ${radiusDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                        </div>
                        {radiusDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                                {RADIUS_OPTIONS.map(r => (
                                    <button
                                        key={r}
                                        onClick={() => { setSelectedRadius(r); setRadiusDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 text-sm transition-colors
                                            ${selectedRadius === r ? "bg-[#f09b13]/10 text-[#f09b13] font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        {r} km
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Category */}
                    <div id="category-dropdown" className="relative">
                        <button
                            onClick={() => setDropdownOpen(p => !p)}
                            className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 md:px-4 py-2 text-xs md:text-sm font-medium text-gray-700 hover:border-[#f09b13] shadow-sm min-w-[130px] md:min-w-[150px] justify-between"
                        >
                            <span className="truncate">{categoryLabel}</span>
                            <ChevronDown size={13} className={`flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                <div className="max-h-72 overflow-y-auto py-1">
                                    <button
                                        onClick={() => { setSelectedCategory("all"); setDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                                            ${selectedCategory === "all" ? "bg-[#f09b13]/10 text-[#f09b13] font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                                    >
                                        All Categories
                                    </button>
                                    <div className="border-t border-gray-100 my-1" />
                                    {CategoriesData.categories.map(cat => (
                                        <button
                                            key={cat.name}
                                            onClick={() => { setSelectedCategory(cat.name); setDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors
                                                ${selectedCategory === cat.name ? "bg-[#f09b13]/10 text-[#f09b13] font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p className="mb-4 text-sm text-gray-500">
                Found <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
                job{filtered.length !== 1 ? "s" : ""}
                {selectedCategory !== "all" && <span className="ml-1 text-[#f09b13]">in "{categoryLabel}"</span>}
            </p>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-gray-300 text-5xl mb-4">🔍</div>
                    <p className="text-gray-500">
                        No jobs found{searchText ? ` for "${searchText}"` : ""}
                        {selectedCategory !== "all" ? ` in "${categoryLabel}"` : ""}
                    </p>
                    {(searchText || selectedCategory !== "all") && (
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className="mt-3 text-[#f09b13] font-medium text-sm underline underline-offset-2"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {filtered.map(job => {
                        const imgs = getImageUrls(job.images || []);
                        const distLabel = job.distance != null
                            ? job.distance >= 1000
                                ? `${(job.distance / 1000).toFixed(1)} km`
                                : `${Math.round(job.distance)} m`
                            : null;
                        const locationStr = [job.area, job.city, job.state].filter(Boolean).join(", ") || "Nearby";
                        const startDate = new Date(job.startDate);
                        const endDate = new Date(job.endDate);
                        const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

                        return (
                            <div
                                key={job._id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
                                onClick={() => navigate(`/job-details/${job._id}`)}
                            >
                                {/* Image carousel */}
                                <div className="relative h-48 md:h-52 bg-gray-100 flex-shrink-0 overflow-hidden">
                                    <ImageCarousel images={imgs} title={job.title} />

                                    {/* Job type badge */}
                                    <div className="absolute top-3 left-3 z-10">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow
                                            ${job.jobType === "FULL_TIME" ? "bg-green-500 text-white" : "bg-[#f09b13] text-white"}`}>
                                            <Clock size={10} />
                                            {job.jobType === "FULL_TIME" ? "Full Time" : "Part Time"}
                                        </span>
                                    </div>

                                    {/* Distance badge */}
                                    {distLabel && (
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="inline-flex items-center gap-1 bg-white/95 text-gray-700 text-xs font-bold px-2 py-1 rounded-full shadow">
                                                <MapPin size={10} className="text-[#f09b13]" />{distLabel}
                                            </span>
                                        </div>
                                    )}

                                    {/* Duration badge */}
                                    <div className="absolute bottom-3 left-3 z-10">
                                        <span className="inline-flex items-center gap-1 bg-[#f09b13] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                            <Calendar size={10} />
                                            {duration} day{duration !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>

                                {/* Card body */}
                                <div className="flex flex-col flex-1 px-3 md:px-4 pt-3 pb-4">
                                    <div className="flex flex-wrap gap-1.5 mb-2">
                                        <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#f09b13]/10 text-[#f09b13] border border-[#f09b13]/20">
                                            {job.category}
                                        </span>
                                        {job.subcategory && (
                                            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-50 text-gray-600 border border-gray-200">
                                                {job.subcategory}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-sm md:text-base font-bold text-gray-900 line-clamp-2 leading-snug mb-1.5">
                                        {job.title}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{job.description}</p>

                                    <div className="flex items-center gap-1.5 mb-1.5 text-xs text-gray-500">
                                        <MapPin size={11} className="flex-shrink-0 text-gray-400" />
                                        <span className="line-clamp-1">{locationStr}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 mb-3 text-xs text-gray-500">
                                        <Calendar size={11} className="flex-shrink-0 text-gray-400" />
                                        <span>
                                            {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                            {" – "}
                                            {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                        </span>
                                    </div>

                                    <div className="flex-1" />
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Charges</p>
                                            <p className="text-lg md:text-xl font-extrabold text-green-600 flex items-center gap-0.5 leading-none">
                                                <IndianRupee size={14} className="mt-0.5" />
                                                {parseFloat(job.servicecharges).toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                        <button
                                            onClick={e => { e.stopPropagation(); navigate(`/job-details/${job._id}`); }}
                                            className="flex items-center gap-1.5 bg-[#f09b13] hover:bg-[#f5b340] active:scale-95
                                                text-white text-xs md:text-sm font-bold px-3 md:px-4 py-2 rounded-xl shadow-sm transition-all"
                                        >
                                            View <ArrowRight size={13} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default AllJobs;