import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    MapPin, Loader2, ChevronDown, ChevronLeft, ChevronRight,
    ArrowRight, IndianRupee, Briefcase, Calendar
} from "lucide-react";
import { getNearbyJobsForWorker, JobDetail, API_BASE_URL } from "../services/api.service";
import CategoriesData from "../data/categories.json";
import { categories } from "../components/categories/Categories";
import typography from "../styles/typography";

const BRAND = "#00598a";
const BRAND_DARK = "#004a73";

interface AllJobsProps {
    latitude?: number;
    longitude?: number;
    searchText?: string;
    filterCategory?: string;
    workerId?: string;
}

const resolveCategoryName = (raw: string | undefined): string => {
    if (!raw) return "—";
    if (/^\d+$/.test(raw.trim())) {
        const match = categories.find(c => String(c.id) === raw.trim());
        return match?.name ?? raw;
    }
    return raw;
};

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

const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
    const [idx, setIdx] = useState(0);
    const [imgError, setImgError] = useState(false);

    useEffect(() => { setImgError(false); setIdx(0); }, [images]);

    if (!images.length || imgError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#00598a]/10 to-[#00598a]/5">
                <Briefcase size={40} style={{ color: `${BRAND}80` }} />
            </div>
        );
    }

    const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
    const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };

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
                    <button onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <ChevronLeft size={14} />
                    </button>
                    <button onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
                        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <ChevronRight size={14} />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button key={i} onClick={e => { e.stopPropagation(); setIdx(i); }}
                                className={`h-1.5 rounded-full transition-all duration-200 ${i === idx ? "bg-white w-4" : "bg-white/55 w-1.5"}`} />
                        ))}
                    </div>
                    <div className={`absolute bottom-3 right-3 bg-black/55 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full`}>
                        {idx + 1}/{images.length}
                    </div>
                </>
            )}
        </div>
    );
};

const JobCard: React.FC<{
    job: JobDetail;
    onClick: () => void;
    onViewClick: (e: React.MouseEvent) => void;
}> = ({ job, onClick, onViewClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const imgs = getImageUrls(job.images || []);

    const distLabel = job.distance != null
        ? job.distance >= 1000 ? `${(job.distance / 1000).toFixed(1)} km` : `${Math.round(job.distance)} m`
        : null;

    const locationStr = [job.area, job.city, job.state].filter(Boolean).join(", ") || "Nearby";
    const startDate = new Date(job.startDate);
    const endDate = new Date(job.endDate);
    const categoryName = resolveCategoryName(job.category);
    const subcategoryName = job.subcategory || "";

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200"
            style={{
                borderWidth: "1px", borderStyle: "solid",
                borderColor: isHovered ? BRAND : "#f3f4f6",
                boxShadow: isHovered ? "0 8px 24px rgba(0,89,138,0.15)" : "0 1px 4px rgba(0,0,0,0.06)",
                transform: isHovered ? "translateY(-2px)" : "none",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div className="relative h-48 md:h-52 bg-gray-100 flex-shrink-0 overflow-hidden">
                <div className="w-full h-full transition-transform duration-300" style={{ transform: isHovered ? "scale(1.03)" : "scale(1)" }}>
                    <ImageCarousel images={imgs} title={job.title} />
                </div>
                {distLabel && (
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 bg-white/95 text-gray-700 ${typography.misc.badge} px-2 py-1 rounded-full shadow`}>
                            <MapPin size={11} style={{ color: BRAND }} />{distLabel}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col flex-1 px-3 md:px-4 pt-3 pb-4">
                <div className="flex flex-wrap gap-1.5 mb-2">
                    <span className={`${typography.misc.badge} px-2 py-0.5 rounded-full border`}
                        style={{ backgroundColor: "rgba(0,89,138,0.08)", color: BRAND, borderColor: "rgba(0,89,138,0.2)" }}>
                        {categoryName}
                    </span>
                    {subcategoryName && (
                        <span className={`${typography.misc.badge} px-2 py-0.5 rounded-full bg-gray-50 text-gray-600 border border-gray-200`}>
                            {subcategoryName}
                        </span>
                    )}
                </div>

                <h3 className={`${typography.card.title} line-clamp-2 leading-snug mb-1.5`}
                    style={{ color: isHovered ? BRAND : "#111827" }}>
                    {job.title}
                </h3>
                <p className={`${typography.card.description} text-gray-600 mb-2 line-clamp-2`}>{job.description}</p>
                <div className={`flex items-center gap-1.5 mb-1.5 ${typography.body.xs} text-gray-500`}>
                    <MapPin size={12} className="flex-shrink-0 text-gray-400" />
                    <span className="line-clamp-1">{locationStr}</span>
                </div>
                <div className={`flex items-center gap-1.5 mb-3 ${typography.body.xs} text-gray-500`}>
                    <Calendar size={12} className="flex-shrink-0 text-gray-400" />
                    <span>
                        {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" – "}
                        {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                </div>

                <div className="flex-1" />
                <div className="flex items-center justify-between pt-3 border-t"
                    style={{ borderColor: isHovered ? "rgba(0,89,138,0.15)" : "#f3f4f6" }}>
                    <div>
                        <p className="uppercase tracking-wide text-gray-400 mb-0.5" style={{ fontSize: "10px" }}>Service Charges</p>
                        <p className={`${typography.heading.h6} text-green-600 flex items-center gap-0.5 leading-none`}>
                            <IndianRupee size={15} className="mt-0.5" />
                            {parseFloat(job.servicecharges).toLocaleString("en-IN")}
                        </p>
                    </div>
                    <button onClick={onViewClick}
                        className={`flex items-center gap-1.5 text-white ${typography.body.xs} font-bold px-3 md:px-4 py-2 rounded-xl shadow-sm transition-all duration-200 active:scale-95`}
                        style={{ backgroundColor: BRAND }}>
                        View Details <ArrowRight size={14} />
                    </button>
                </div>
            </div>
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

            // Use prop first, then localStorage only — no backend fallback
            const workerId =
                workerIdProp ||
                localStorage.getItem("workerId") ||
                localStorage.getItem("@worker_id");

            if (!workerId) {
                console.warn("⚠️ AllJobs: no workerId available");
                setJobs([]);
                setLoading(false);
                return;
            }

            const res = await getNearbyJobsForWorker(workerId);
            const data: JobDetail[] = res.jobs || [];
            setJobs(data);
            if (data.length === 0) setError("No jobs found near your location");
        } catch (err: any) {
            setError(err.message || "Failed to fetch jobs");
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const filtered = jobs.filter(job => {
        const sl = searchText.toLowerCase();
        const resolvedCat = resolveCategoryName(job.category);
        const matchSearch = !sl
            || job.title.toLowerCase().includes(sl)
            || job.description.toLowerCase().includes(sl)
            || resolvedCat.toLowerCase().includes(sl)
            || (job.subcategory && job.subcategory.toLowerCase().includes(sl));
        const matchCat = selectedCategory === "all" || resolvedCat === selectedCategory;
        const matchRadius = job.distance == null || job.distance <= selectedRadius * 1000;
        return matchSearch && matchCat && matchRadius;
    });

    const categoryLabel = selectedCategory === "all"
        ? "All Categories"
        : CategoriesData.categories.find(c => c.name === selectedCategory)?.name || selectedCategory;

    if (loading) return (
        <div className="min-h-[40vh] flex justify-center items-center">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: BRAND }} />
        </div>
    );

    if (error && jobs.length === 0) return (
        <div className="min-h-[40vh] flex flex-col justify-center items-center p-6">
            <div className="text-center max-w-md">
                <div className="text-6xl mb-4">📋</div>
                <h2 className={`${typography.heading.h4} text-gray-800 mb-2`}>No Jobs Available</h2>
                <p className={`${typography.body.small} text-gray-600 mb-6`}>{error}</p>
                <button onClick={fetchJobs}
                    className={`text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${typography.body.small}`}
                    style={{ backgroundColor: BRAND }}>
                    Try Again
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-3 md:px-6 py-4 md:py-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div>
                    <h1 className={`${typography.heading.h4} text-gray-900 tracking-tight`}>Nearby Job Opportunities</h1>
                    <p className={`${typography.body.xs} text-gray-500 mt-0.5`}>Browse all available jobs in your area</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Radius dropdown */}
                    <div id="radius-dropdown" className="relative">
                        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                            <span className={`${typography.body.xs} text-gray-500 font-medium`}>Within:</span>
                            <button onClick={() => setRadiusDropdownOpen(p => !p)}
                                className={`flex items-center gap-1 ${typography.body.xs} font-semibold text-gray-800`}>
                                {selectedRadius} km
                                <ChevronDown size={13} className={`transition-transform ${radiusDropdownOpen ? "rotate-180" : ""}`} />
                            </button>
                        </div>
                        {radiusDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-28 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1">
                                {RADIUS_OPTIONS.map(r => (
                                    <button key={r} onClick={() => { setSelectedRadius(r); setRadiusDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2 ${typography.body.xs}`}
                                        style={selectedRadius === r ? { backgroundColor: "rgba(0,89,138,0.1)", color: BRAND, fontWeight: 600 } : { color: "#374151" }}>
                                        {r} km
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Category dropdown */}
                    <div id="category-dropdown" className="relative">
                        <button onClick={() => setDropdownOpen(p => !p)}
                            className={`flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 md:px-4 py-2 ${typography.body.xs} font-medium text-gray-700 shadow-sm min-w-[130px] md:min-w-[150px] justify-between`}
                            style={dropdownOpen ? { borderColor: BRAND, color: BRAND } : {}}>
                            <span className="truncate">{categoryLabel}</span>
                            <ChevronDown size={13} className={`flex-shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                <div className="max-h-72 overflow-y-auto py-1">
                                    <button onClick={() => { setSelectedCategory("all"); setDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 ${typography.body.xs}`}
                                        style={selectedCategory === "all" ? { backgroundColor: "rgba(0,89,138,0.1)", color: BRAND, fontWeight: 600 } : { color: "#374151" }}>
                                        All Categories
                                    </button>
                                    <div className="border-t border-gray-100 my-1" />
                                    {CategoriesData.categories.map(cat => (
                                        <button key={cat.name} onClick={() => { setSelectedCategory(cat.name); setDropdownOpen(false); }}
                                            className={`w-full text-left px-4 py-2.5 ${typography.body.xs}`}
                                            style={selectedCategory === cat.name ? { backgroundColor: "rgba(0,89,138,0.1)", color: BRAND, fontWeight: 600 } : { color: "#374151" }}>
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <p className={`mb-4 ${typography.body.xs} text-gray-500`}>
                Found <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
                job{filtered.length !== 1 ? "s" : ""}
                {selectedCategory !== "all" && (
                    <span className="ml-1 font-medium" style={{ color: BRAND }}>in "{categoryLabel}"</span>
                )}
            </p>

            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <div className="text-gray-300 text-5xl mb-4">🔍</div>
                    <p className={`${typography.body.small} text-gray-500`}>
                        No jobs found{searchText ? ` for "${searchText}"` : ""}
                        {selectedCategory !== "all" ? ` in "${categoryLabel}"` : ""}
                    </p>
                    {(searchText || selectedCategory !== "all") && (
                        <button onClick={() => setSelectedCategory("all")}
                            className={`mt-3 font-medium ${typography.body.xs} underline underline-offset-2`}
                            style={{ color: BRAND }}>
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                    {filtered.map(job => (
                        <JobCard key={job._id} job={job}
                            onClick={() => navigate(`/job-details/${job._id}`)}
                            onViewClick={e => { e.stopPropagation(); navigate(`/job-details/${job._id}`); }} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllJobs;