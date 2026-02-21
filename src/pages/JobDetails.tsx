import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, ChevronRight, MapPin, Calendar,
    Users, Briefcase, Tag, Navigation, Mail, Clock, Share2,
    CheckCircle, Loader2,
} from "lucide-react";
import { getJobById, getUserById, API_BASE_URL } from "../services/api.service";
import { sendEnquiryToJob, checkJobApplication } from "../services/api.service";
import { JobDetailsProps } from "../types/job.types";

// ── Smart image URL resolver ──────────────────────────────────────────────────
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
const getImageUrls = (images?: string[]): string[] =>
    (images || []).map(resolveImageUrl).filter(Boolean) as string[];

// ── Image Carousel ────────────────────────────────────────────────────────────
const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
    const [idx, setIdx] = useState(0);
    const [errored, setErrored] = useState(false);
    useEffect(() => { setIdx(0); setErrored(false); }, [images]);

    if (!images.length || errored) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100">
                <span className="text-7xl select-none">🔧</span>
            </div>
        );
    }
    return (
        <div className="relative w-full h-full group">
            <img src={images[idx]} alt={title} className="w-full h-full object-cover object-center"
                onError={() => { if (idx < images.length - 1) setIdx(i => i + 1); else setErrored(true); }} />
            {images.length > 1 && (
                <>
                    <button onClick={e => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronLeft size={16} className="text-gray-700" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                        <ChevronRight size={16} className="text-gray-700" />
                    </button>
                    <div className="absolute top-3 right-16 bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
                        {idx + 1} / {images.length}
                    </div>
                </>
            )}
        </div>
    );
};

// ── Detail Row ────────────────────────────────────────────────────────────────
const DetailRow: React.FC<{
    icon: React.ReactNode; label: string; value: React.ReactNode;
    iconColor?: string; last?: boolean;
}> = ({ icon, label, value, iconColor = "text-teal-500", last }) => (
    <div className={`flex items-start gap-3 py-3.5 ${!last ? "border-b border-gray-100" : ""}`}>
        <div className={`mt-0.5 flex-shrink-0 ${iconColor}`}>{icon}</div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
            <div className="text-sm font-semibold text-gray-900 break-words">{value}</div>
        </div>
    </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
};
const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

// ── Main Component ────────────────────────────────────────────────────────────
const JobDetailsPage: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    const [job, setJob] = useState<JobDetailsProps | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
    const [distance, setDistance] = useState("N/A");

    // ── Enquiry state ─────────────────────────────────────────────────────────
    const [enquirySent, setEnquirySent] = useState(false);       // already applied?
    const [enquiryLoading, setEnquiryLoading] = useState(false); // sending in progress
    const [enquiryError, setEnquiryError] = useState<string>("");

    // Get logged-in worker's workerId from localStorage
    // The worker must have workerId stored after registration/login
    const currentWorkerId = localStorage.getItem("workerId") || localStorage.getItem("userId") || "";

    // ── Fetch job data ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!jobId) return;
        (async () => {
            try {
                setLoading(true);
                const jobRes = await getJobById(jobId);
                if (!jobRes.success) { setError("Job not found"); return; }
                const jd = jobRes.data;
                setImageUrls(getImageUrls(jd.images));

                let customerName = "Customer", customerPhone = "";
                let customerLat: number | null = null, customerLng: number | null = null;
                try {
                    const userRes = await getUserById(jd.userId);
                    if (userRes.success) {
                        customerName = userRes.data.name;
                        customerPhone = userRes.data.phone;
                        customerLat = Number(userRes.data.latitude);
                        customerLng = Number(userRes.data.longitude);
                    }
                } catch { }

                if (navigator.geolocation && customerLat && customerLng) {
                    try {
                        const pos = await new Promise<GeolocationPosition>((res, rej) =>
                            navigator.geolocation.getCurrentPosition(res, rej));
                        setDistance(calcDistance(pos.coords.latitude, pos.coords.longitude, customerLat!, customerLng!));
                    } catch { }
                }

                setJob({
                    title: jd.subcategory ? `${jd.subcategory} – ${jd.category}` : jd.category,
                    customerDetails: { name: customerName, phone: customerPhone, distance, rating: 4.7, reviewCount: 23 },
                    jobInformation: {
                        type: jd.jobType, budget: jd.servicecharges, budgetType: "fixed",
                        description: jd.description || "No description provided",
                        startDate: formatDate(jd.startDate), endDate: formatDate(jd.endDate),
                        area: jd.area, city: jd.city, state: jd.state, pincode: jd.pincode,
                        location: [jd.area, jd.city, jd.state].filter(Boolean).join(", "),
                        category: jd.category, subcategory: jd.subcategory,
                        latitude: jd.latitude, longitude: jd.longitude,
                        images: jd.images || [], createdAt: jd.createdAt, updatedAt: jd.updatedAt,
                    },
                    mapUrl: `https://www.google.com/maps?q=${jd.latitude},${jd.longitude}&output=embed`,
                });

                // ── Check if this worker already applied ──────────────────────
                if (currentWorkerId && jobId) {
                    const { checkJobApplication } = await import("../services/api.service");
                    const alreadyApplied = await checkJobApplication(jobId, currentWorkerId);
                    setEnquirySent(alreadyApplied);
                }

            } catch { setError("Failed to load job details"); }
            finally { setLoading(false); }
        })();
    }, [jobId, currentWorkerId]);

    // ── Send Enquiry (confirm job) ────────────────────────────────────────────
    const handleSendEnquiry = async () => {
        if (!jobId || !currentWorkerId) {
            setEnquiryError("Unable to send enquiry. Please login again.");
            return;
        }
        if (enquirySent) return; // already applied

        setEnquiryLoading(true);
        setEnquiryError("");
        try {
            const result = await sendEnquiryToJob(jobId, currentWorkerId); // ✅ sends workerId
            if (result.success) {
                setEnquirySent(true);
            } else {
                setEnquiryError(result.message || "Failed to send enquiry. Try again.");
            }
        } catch (err: any) {
            setEnquiryError("Network error. Please try again.");
        } finally {
            setEnquiryLoading(false);
        }
    };

    // ── Loading / Error states ────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-sm text-gray-500">Loading details…</p>
            </div>
        </div>
    );

    if (error || !job) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
            <div className="text-center max-w-sm">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Not Found</h2>
                <p className="text-gray-500 mb-6">{error || "Job not available"}</p>
                <button onClick={() => navigate(-1)} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold">Go Back</button>
            </div>
        </div>
    );

    const { jobInformation, customerDetails } = job;
    const directionsUrl = jobInformation.latitude && jobInformation.longitude
        ? `https://www.google.com/maps/dir/?api=1&destination=${jobInformation.latitude},${jobInformation.longitude}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(jobInformation.location || "")}`;
    const mapsOpenUrl = `https://www.google.com/maps?q=${jobInformation.latitude},${jobInformation.longitude}`;

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center">
            <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-hidden" style={{ minHeight: "100vh" }}>

                {/* ══ SCROLLABLE AREA ═════════════════════════════════════════ */}
                <div className="overflow-y-auto" style={{ paddingBottom: "88px", height: "100vh" }}>

                    {/* ── HERO IMAGE ─────────────────────────────────────────── */}
                    <div className="relative h-60 sm:h-72 bg-gray-200 overflow-hidden flex-shrink-0">
                        <ImageCarousel images={imageUrls} title={job.title} />
                        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                        <button onClick={() => navigate(-1)}
                            className="absolute top-4 left-3 z-20 flex items-center gap-1 bg-white/90 hover:bg-white rounded-full pl-2 pr-3 py-1.5 shadow-md transition active:scale-95">
                            <ChevronLeft size={18} className="text-gray-800" />
                            <span className="text-xs font-bold text-green-600">Open</span>
                        </button>

                        <button
                            onClick={() => navigator.share?.({ title: job.title, url: window.location.href }).catch(() => { })}
                            className="absolute top-4 right-3 z-20 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition active:scale-95">
                            <Share2 size={17} className="text-gray-700" />
                        </button>

                        {distance !== "N/A" && (
                            <div className="absolute top-4 right-14 z-20">
                                <span className="inline-flex items-center gap-1 bg-white/90 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-full shadow">
                                    <MapPin size={10} className="text-orange-500" />{distance}
                                </span>
                            </div>
                        )}

                        <div className="absolute bottom-0 left-0 right-0 px-4 pb-3 z-10">
                            <div className="flex flex-wrap gap-1.5 mb-1.5">
                                {jobInformation.subcategory && (
                                    <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                                        {jobInformation.subcategory}
                                    </span>
                                )}
                                {jobInformation.category && (
                                    <span className="bg-white/20 text-white text-[10px] font-semibold px-2 py-0.5 rounded backdrop-blur-sm">
                                        {jobInformation.category}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-baseline gap-2 flex-wrap">
                                {jobInformation.budget && (
                                    <span className="text-white font-extrabold text-2xl leading-none tracking-tight">
                                        ₹{jobInformation.budget}
                                    </span>
                                )}
                                <h1 className="text-white font-bold text-sm leading-snug line-clamp-2 flex-1">
                                    {job.title}
                                </h1>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                                {jobInformation.type && (
                                    <span className="inline-flex items-center gap-1 bg-green-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        <Briefcase size={9} />{jobInformation.type}
                                    </span>
                                )}
                                <span className="inline-flex items-center gap-1 text-white/80 text-[10px]">
                                    <Calendar size={9} />{jobInformation.startDate}
                                </span>
                                <span className="inline-flex items-center gap-1 text-white/80 text-[10px]">
                                    <Users size={9} />3 slots
                                </span>
                                <span className="ml-auto inline-flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    <span className="w-1 h-1 rounded-full bg-white" />Open
                                </span>
                            </div>
                            <div className="flex items-center gap-1 mt-1.5">
                                <MapPin size={9} className="text-white/70 flex-shrink-0" />
                                <span className="text-white/80 text-[10px] truncate">
                                    {[jobInformation.area, jobInformation.city, jobInformation.state].filter(Boolean).join(", ")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── WHITE BODY ─────────────────────────────────────────── */}
                    <div className="bg-white px-4 pt-5 pb-4 space-y-4">

                        {/* ── Already Applied Banner ─── */}
                        {enquirySent && (
                            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                                <CheckCircle size={18} className="text-green-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-green-700">Enquiry Sent!</p>
                                    <p className="text-xs text-green-600">You have applied for this job. The customer will contact you soon.</p>
                                </div>
                            </div>
                        )}

                        {/* Title + badges */}
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2.5">
                                {jobInformation.category || job.title}
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {jobInformation.type && (
                                    <span className="bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                                        {jobInformation.type}
                                    </span>
                                )}
                                {jobInformation.subcategory && (
                                    <span className="border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                        {jobInformation.subcategory}
                                    </span>
                                )}
                                {jobInformation.category && (
                                    <span className="border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1 rounded-full">
                                        {jobInformation.category}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 3-col stats */}
                        <div className="rounded-2xl border border-gray-100 shadow-sm grid grid-cols-3 divide-x divide-gray-100 overflow-hidden">
                            <div className="flex flex-col items-center justify-center gap-0.5 py-4 px-2">
                                <MapPin size={20} className="text-orange-500 mb-0.5" />
                                <span className="text-sm font-bold text-gray-900 text-center leading-tight">{jobInformation.city || "—"}</span>
                                <a href={mapsOpenUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-orange-500 font-semibold mt-0.5">Tap to open</a>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-0.5 py-4 px-2">
                                <Navigation size={20} className="text-orange-500 mb-0.5" />
                                <span className="text-sm font-bold text-gray-900">{distance}</span>
                                <span className="text-[11px] text-gray-400 font-medium mt-0.5">Distance</span>
                            </div>
                            <div className="flex flex-col items-center justify-center gap-0.5 py-4 px-2">
                                <Calendar size={20} className="text-orange-500 mb-0.5" />
                                <span className="text-sm font-bold text-gray-900 text-center leading-tight">{jobInformation.startDate}</span>
                                <span className="text-[11px] text-gray-400 font-medium mt-0.5">Start</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="rounded-2xl border border-gray-100 shadow-sm p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{jobInformation.description}</p>
                        </div>

                        {/* Job Details rows */}
                        <div className="rounded-2xl border border-gray-100 shadow-sm px-4 pt-1 pb-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest pt-3 pb-1">Job Details</p>
                            <DetailRow icon={<Tag size={16} />} iconColor="text-teal-500" label="Charges"
                                value={<span className="text-green-600 font-bold text-base">{jobInformation.budget ? `₹${jobInformation.budget}` : "Negotiable"}</span>} />
                            <DetailRow icon={<Briefcase size={16} />} iconColor="text-gray-400" label="Job Type" value={jobInformation.type || "Full Time"} />
                            <DetailRow icon={<Calendar size={16} />} iconColor="text-gray-400" label="Start Date" value={jobInformation.startDate} />
                            <DetailRow icon={<Clock size={16} />} iconColor="text-gray-400" label="End Date" value={jobInformation.endDate} />
                            <DetailRow icon={<Mail size={16} />} iconColor="text-gray-400" label="Pincode" value={jobInformation.pincode || "—"} />
                            <DetailRow icon={<MapPin size={16} />} iconColor="text-gray-400" label="Location" last
                                value={
                                    <div className="flex items-center justify-between gap-2">
                                        <a href={mapsOpenUrl} target="_blank" rel="noopener noreferrer"
                                            className="text-orange-500 font-semibold hover:underline flex-1 text-sm">
                                            {[jobInformation.area, jobInformation.city, jobInformation.state].filter(Boolean).join(", ")}
                                        </a>
                                        <a href={directionsUrl} target="_blank" rel="noopener noreferrer"
                                            className="flex-shrink-0 text-gray-400 hover:text-orange-500 transition">
                                            <Navigation size={15} />
                                        </a>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* ══ BOTTOM BAR ══════════════════════════════════════════════ */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] px-4 py-3">
                    {/* Error message */}
                    {enquiryError && (
                        <p className="text-xs text-red-500 text-center mb-2">{enquiryError}</p>
                    )}

                    {enquirySent ? (
                        /* ── Already applied: show green confirmed button ── */
                        <button
                            disabled
                            className="flex items-center justify-center gap-2 w-full bg-green-500 text-white font-bold text-base py-4 rounded-2xl"
                        >
                            <CheckCircle size={18} />
                            Enquiry Sent ✓
                        </button>
                    ) : (
                        /* ── Not applied yet: show Send Enquiry button ── */
                        <button
                            onClick={handleSendEnquiry}
                            disabled={enquiryLoading}
                            className="flex items-center justify-center gap-2 w-full bg-[#00598a] hover:bg-[#00598a] #00598a    disabled:bg-orange-300 text-white font-bold text-base py-4 rounded-2xl shadow-md shadow-orange-100 transition-all active:scale-[0.98]"
                        >
                            {enquiryLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Sending…
                                </>
                            ) : (
                                <>
                                    <Mail size={18} />
                                    Send Enquiry
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobDetailsPage;
