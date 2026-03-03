import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Phone, Loader2, Users, MapPin,
    UserMinus, X, AlertTriangle, Mail, PhoneCall, Star
} from "lucide-react";
import {
    getWorkerWithSkills,
    getWorkerById,
    getJobById,
    removeEnquiry,
    ConfirmedWorkers,
    getReviews,
    getWorkerAverageRating,
    ReviewData,
    API_BASE_URL,
} from "../services/api.service";

import typography from "../styles/typography";

// ── Helpers ───────────────────────────────────────────────────────────────────
const resolveImageUrl = (path?: string): string | null => {
    if (!path || typeof path !== "string") return null;
    const cleaned = path.trim();
    if (!cleaned) return null;
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    const rel = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${base}${rel}`;
};

const formatChargeType = (ct?: string): string => {
    const map: Record<string, string> = {
        hour: "hour", hourly: "hour",
        day: "day", daily: "day",
        fixed: "fixed", monthly: "month",
        per_project: "project",
    };
    return ct ? (map[ct.toLowerCase()] || ct) : "hour";
};

interface EnrichedWorker {
    _id: string;
    workerId: string;
    userId?: string;
    name: string;
    profilePic: string | null;
    area: string;
    city: string;
    state: string;
    serviceCharge: number;
    chargeType: string;
    isActive: boolean;
    categories: string[];
    subCategories: string[];
    skills: string[];
    phone?: string;
    status: "Enquired" | "Confirmed";
    averageRating?: number;
    totalReviews?: number;
}

// ── Call Popup Modal ──────────────────────────────────────────────────────────
const CallPopupModal: React.FC<{
    workerName: string;
    phone: string;
    profilePic: string | null;
    onClose: () => void;
}> = ({ workerName, phone, profilePic, onClose }) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : phone;
    const initials = (workerName || "?")
        .split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
                <button onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                    <X size={16} className="text-gray-500" />
                </button>
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#0f4c75] flex items-center justify-center mx-auto mb-4 shadow-md">
                    {profilePic ? (
                        <img src={profilePic} alt={workerName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                        <span className={`text-white font-bold ${typography.fontSize["2xl"]}`}>{initials || "?"}</span>
                    )}
                </div>
                <h2 className={`${typography.heading.h5} text-gray-900 text-center mb-1`}>{workerName}</h2>
                <p className={`${typography.misc.caption} text-center mb-5`}>Call this worker directly</p>
                <div className="flex items-center justify-center gap-3 bg-[#0f4c75]/5 border border-[#0f4c75]/20 rounded-2xl px-5 py-4 mb-5">
                    <div className="w-10 h-10 rounded-full bg-[#0f4c75] flex items-center justify-center flex-shrink-0">
                        <Phone size={18} className="text-white" />
                    </div>
                    <span className={`${typography.fontSize.xl} font-bold text-[#0f4c75] tracking-wide`}>{displayPhone}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={onClose}
                        className={`py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-gray-100 text-gray-700 hover:bg-gray-200 transition active:scale-95`}>
                        Cancel
                    </button>
                    <a href={`tel:${cleanPhone}`} onClick={onClose}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-[#0f4c75] hover:bg-[#00598a] text-white shadow-md transition-all active:scale-95`}>
                        <PhoneCall size={15} />
                        Call Now
                    </a>
                </div>
            </div>
        </div>
    );
};

// ── Remove Confirm Modal ──────────────────────────────────────────────────────
const RemoveConfirmModal: React.FC<{
    workerName: string;
    onConfirm: () => void;
    onCancel: () => void;
    removing: boolean;
}> = ({ workerName, onConfirm, onCancel, removing }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
        <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            <button onClick={onCancel}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <X size={16} className="text-gray-500" />
            </button>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h2 className={`${typography.heading.h5} text-gray-900 text-center mb-2`}>Remove Worker?</h2>
            <p className={`${typography.body.xs} text-gray-500 text-center mb-6`}>
                Are you sure you want to remove{" "}
                <span className="font-semibold text-gray-800">{workerName}</span> from this job?
                This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={onCancel} disabled={removing}
                    className={`py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-gray-100 text-gray-700 hover:bg-gray-200 transition active:scale-95 disabled:opacity-50`}>
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={removing}
                    className={`py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-red-500 hover:bg-red-600 text-white shadow-md transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2`}>
                    {removing ? <Loader2 size={15} className="animate-spin" /> : <UserMinus size={15} />}
                    {removing ? "Removing…" : "Yes, Remove"}
                </button>
            </div>
        </div>
    </div>
);

// ── Worker Card ───────────────────────────────────────────────────────────────
const WorkerCard: React.FC<{
    worker: EnrichedWorker;
    jobId: string;
    onRemoved: (id: string) => void;
}> = ({ worker, jobId, onRemoved }) => {
    const navigate = useNavigate();
    const [removing, setRemoving] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);

    const cleanPhone = (worker.phone || "").replace(/\D/g, "");
    const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : null;
    const locationStr = [worker.area, worker.city, worker.state].filter(Boolean).join(", ");
    const initials = (worker.name || "?")
        .split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2);

    const handleRemoveConfirm = async () => {
        try {
            setRemoving(true);
            await removeEnquiry(worker.workerId || worker._id, jobId);
            onRemoved(worker._id);
        } catch {
            alert("Failed to remove worker. Please try again.");
        } finally {
            setRemoving(false);
            setShowRemoveModal(false);
        }
    };

    return (
        <>
            {showCallModal && (
                <CallPopupModal
                    workerName={worker.name}
                    phone={worker.phone || ""}
                    profilePic={worker.profilePic}
                    onClose={() => setShowCallModal(false)}
                />
            )}
            {showRemoveModal && (
                <RemoveConfirmModal
                    workerName={worker.name}
                    onConfirm={handleRemoveConfirm}
                    onCancel={() => setShowRemoveModal(false)}
                    removing={removing}
                />
            )}

            {/* ── Card shell ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full">

                {/* ── Top: Active/Enquired badges ── */}
                <div className="flex items-center justify-between px-3 pt-2.5">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${worker.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full inline-block ${worker.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                        {worker.isActive ? "Active" : "Inactive"}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${worker.status === "Confirmed"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-yellow-100 text-yellow-700 border-yellow-200"}`}>
                        <Mail size={8} />
                        {worker.status}
                    </span>
                </div>

                {/* ── Profile row: pic + name + rating ── */}
                <div className="flex items-center gap-3 px-3 pt-2 pb-2">
                    {/* Profile pic — circular */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-[#0f4c75] flex items-center justify-center flex-shrink-0 shadow">
                        {worker.profilePic ? (
                            <img
                                src={worker.profilePic}
                                alt={worker.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                        ) : (
                            <span className="text-white font-bold text-base select-none">{initials}</span>
                        )}
                    </div>

                    {/* Name + rating */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{worker.name}</h3>
                        {/* Rating inline with name */}
                        <div className="flex items-center gap-1 mt-0.5">
                            <Star size={11} className="text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold text-gray-700">
                                {worker.averageRating && worker.averageRating > 0
                                    ? worker.averageRating.toFixed(1)
                                    : "0.0"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Location ── */}
                {locationStr && (
                    <div className="flex items-center gap-1 px-3 pb-1.5">
                        <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                        <p className="text-[11px] text-gray-500 truncate">{locationStr}</p>
                    </div>
                )}

                <div className="border-t border-gray-100 mx-3" />

                {/* ── Matched Skill section ── */}
                {(worker.categories.length > 0 || worker.subCategories.length > 0 || worker.skills.length > 0) && (
                    <div className="px-3 pt-2 pb-1">
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1">Matched Skill</p>
                        <div className="flex flex-wrap gap-1">
                            {worker.categories.slice(0, 1).map((cat, i) => (
                                <span key={i} className="text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                                    🔵 {cat}
                                </span>
                            ))}
                            {worker.subCategories.slice(0, 1).map((sub, i) => (
                                <span key={i} className="text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full">
                                    🔵 {sub}
                                </span>
                            ))}
                            {worker.skills.slice(0, 1).map((skill, i) => (
                                <span key={i} className="text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 px-2 py-0.5 rounded-full">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Service Charge ── */}
                <div className="px-3 pt-1.5 pb-2">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Service Charge</p>
                    <div className="flex items-baseline gap-1">
                        {worker.serviceCharge > 0 ? (
                            <>
                                <span className="text-sm font-extrabold text-gray-900">
                                    ₹{worker.serviceCharge.toLocaleString("en-IN")}
                                </span>
                                <span className="text-[11px] text-gray-400">/ {formatChargeType(worker.chargeType)}</span>
                            </>
                        ) : (
                            <span className="text-xs text-gray-400">Not set</span>
                        )}
                    </div>
                </div>

                {/* ── Action buttons ── */}
                <div className="px-3 pb-2 grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setShowCallModal(true)}
                        disabled={!cleanPhone}
                        className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs text-white shadow-sm transition-all active:scale-95 bg-[#0f4c75] hover:bg-[#00598a] ${!cleanPhone ? "opacity-40 pointer-events-none" : ""}`}
                    >
                        <Phone size={12} />
                        Call
                    </button>
                    <button
                        onClick={() => setShowRemoveModal(true)}
                        disabled={removing}
                        className="flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all active:scale-95 disabled:opacity-60"
                    >
                        <UserMinus size={12} />
                        Remove
                    </button>
                </div>
                <div className="px-3 pb-3">
                    <button
                        onClick={() => navigate(`/reviews/${worker.workerId}`)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold text-xs bg-amber-400 hover:bg-amber-500 text-white shadow-sm transition-all active:scale-95"
                    >
                        <Star size={12} />
                        Add Review
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Enrich one worker ─────────────────────────────────────────────────────────
const enrichWorker = async (
    cw: ConfirmedWorkers,
    isConfirmed: boolean
): Promise<EnrichedWorker> => {
    const id = cw._id;

    let name: string = "";
    let phone: string = "";
    let profilePic: string | null = null;
    let area: string = "";
    let city: string = "";
    let state: string = "";
    let serviceCharge = 0;
    let chargeType: string = "hour";
    let isActive = true;
    let categories: string[] = [];
    let subCategories: string[] = [];
    let skills: string[] = [];
    let resolvedWorkerId: string | undefined;
    let resolvedUserId: string | undefined;

    // STEP 1: getWorkerById — name, phone, location, profilePic
    try {
        const wRes = await getWorkerById(id);
        if (wRes.success && wRes.data) {
            const w = wRes.data;
            resolvedWorkerId = id;
            resolvedUserId = w.userId || undefined;
            name = w.name || "";
            phone = w.phone || "";
            profilePic = resolveImageUrl(w.profilePic);
            area = w.area || "";
            city = w.city || "";
            state = w.state || "";
            chargeType = w.chargeType || "hour";
            serviceCharge = w.serviceCharge || 0;
            isActive = w.isActive ?? true;
        }
    } catch {
        console.log("getWorkerById failed for id:", id, "— treating as userId");
    }

    // STEP 1b: If id was a userId, resolve real workerId
    if (!resolvedWorkerId) {
        try {
            const res = await fetch(`${API_BASE_URL}/getWorkerByUserId/${id}`);
            if (res.ok) {
                const json = await res.json();
                const w = json?.worker || json?.data || json;
                if (w?._id) {
                    resolvedWorkerId = w._id;
                    resolvedUserId = id;
                    name = name || w.name || "";
                    phone = phone || w.phone || "";
                    profilePic = profilePic || resolveImageUrl(w.profilePic);
                    area = area || w.area || "";
                    city = city || w.city || "";
                    state = state || w.state || "";
                    isActive = w.isActive ?? true;
                    console.log("✅ Resolved workerId from userId:", resolvedWorkerId);
                }
            }
        } catch {
            console.log("getWorkerByUserId fetch failed for id:", id);
        }
    }

    // STEP 2: getWorkerWithSkills — skills, categories, subCategories, serviceCharge
    if (resolvedWorkerId) {
        try {
            const skillRes = await getWorkerWithSkills(resolvedWorkerId);
            if (skillRes.success) {
                const w = skillRes.worker;
                if (w) {
                    name = name || w.name || "";
                    profilePic = profilePic || resolveImageUrl(w.profilePic);
                    area = area || w.area || "";
                    city = city || w.city || "";
                    state = state || w.state || "";
                    resolvedUserId = resolvedUserId || w.userId || undefined;
                }

                if (skillRes.workerSkills?.length) {
                    categories = Array.from(new Set(skillRes.workerSkills.flatMap((s) => s.category || [])));
                    subCategories = Array.from(new Set(skillRes.workerSkills.map((s) => s.subCategory).filter(Boolean)));
                    skills = Array.from(new Set(skillRes.workerSkills.map((s) => s.skill).filter(Boolean)));
                    const fs = skillRes.workerSkills[0];
                    if (fs?.serviceCharge != null && fs.serviceCharge > 0) {
                        serviceCharge = fs.serviceCharge;
                        chargeType = fs.chargeType || chargeType;
                    }
                    if (!area && fs?.area) area = fs.area;
                    if (!city && fs?.city) city = fs.city;
                    if (!state && fs?.state) state = fs.state;
                } else if (skillRes.worker?.categories?.length) {
                    categories = (skillRes.worker.categories || []).flat();
                    subCategories = skillRes.worker.subCategories || [];
                    skills = skillRes.worker.skills || [];
                    if (skillRes.worker.serviceCharge > 0) {
                        serviceCharge = skillRes.worker.serviceCharge;
                        chargeType = skillRes.worker.chargeType || chargeType;
                    }
                }
            }
        } catch {
            console.log("getWorkerWithSkills failed for workerId:", resolvedWorkerId);
        }
    }

    // STEP 3: Ratings
    let averageRating = 0;
    let totalReviews = 0;

    if (resolvedWorkerId) {
        try {
            const avgRes = await getWorkerAverageRating(resolvedWorkerId);
            if (avgRes?.data) {
                averageRating = parseFloat(avgRes.data.averageRating) || 0;
                totalReviews = avgRes.data.totalReviews || 0;
            }
        } catch { /* no ratings yet */ }

        try {
            const reviewRes = await getReviews(resolvedWorkerId);
            const reviewList: ReviewData[] = Array.isArray(reviewRes?.data)
                ? reviewRes.data
                : Array.isArray(reviewRes) ? reviewRes : [];
            if (reviewList.length > 0) {
                const sum = reviewList.reduce((acc, r) => acc + (r.rating || 0), 0);
                averageRating = Number((sum / reviewList.length).toFixed(1));
                totalReviews = reviewList.length;
            }
        } catch { /* skip */ }
    }

    return {
        _id: id,
        workerId: resolvedWorkerId || id,
        userId: resolvedUserId,
        name: name || "Worker",
        phone,
        profilePic,
        area,
        city,
        state,
        serviceCharge,
        chargeType,
        isActive,
        categories,
        subCategories,
        skills,
        status: isConfirmed ? "Confirmed" : "Enquired",
        averageRating,
        totalReviews,
    };
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const JobApplicantsPage: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    const [workers, setWorkers] = useState<EnrichedWorker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jobInfo, setJobInfo] = useState<{ category: string } | null>(null);

    const [enquiredCount, setEnquiredCount] = useState(0);
    const [confirmedCount, setConfirmedCount] = useState(0);
    const totalSlots = 3;

    useEffect(() => {
        if (!jobId) return;
        (async () => {
            try {
                setLoading(true);
                setError(null);

                try {
                    const jobRes = await getJobById(jobId);
                    if (jobRes.success || jobRes.data) {
                        setJobInfo({ category: jobRes.data?.subcategory || jobRes.data?.category || "Job" });
                    }
                } catch { /* non-critical */ }

                const rawRes = await fetch(`${API_BASE_URL}/getConfirmedWorkers/${jobId}`, {
                    method: "GET", redirect: "follow",
                });
                const rawJson = await rawRes.json();

                const confirmedWorkerIds: string[] = (rawJson?.data?.confirmedWorkers || []).filter((w: any) => typeof w === "string");
                const confirmedWorkerObjs: any[] = (rawJson?.data?.confirmedWorkers || []).filter((w: any) => typeof w === "object");
                const enquiredWorkerIds: string[] = rawJson?.data?.enquiredWorkers || [];

                setEnquiredCount(enquiredWorkerIds.length);
                setConfirmedCount(confirmedWorkerIds.length + confirmedWorkerObjs.length);

                type RawEntry = { id: string; confirmed: boolean };
                const allEntries: RawEntry[] = [
                    ...confirmedWorkerObjs.map((w) => ({ id: w._id || w, confirmed: true })),
                    ...confirmedWorkerIds.map((id) => ({ id, confirmed: true })),
                    ...enquiredWorkerIds.map((id) => ({ id, confirmed: false })),
                ];

                if (allEntries.length === 0) {
                    setError("No applicants found for this job.");
                    return;
                }

                const results = await Promise.allSettled(
                    allEntries.map(({ id, confirmed }) => {
                        const cw: ConfirmedWorkers = {
                            _id: id, userId: id, name: "", category: [],
                            subCategories: [], skills: [], serviceCharge: 0,
                            chargeType: "hour", profilePic: "", images: [],
                            area: "", city: "", state: "", pincode: "",
                            latitude: 0, longitude: 0, isActive: true,
                            createdAt: "", updatedAt: "", __v: 0,
                        };
                        return enrichWorker(cw, confirmed);
                    })
                );

                const final: EnrichedWorker[] = results
                    .filter((r): r is PromiseFulfilledResult<EnrichedWorker> => r.status === "fulfilled")
                    .map((r) => r.value);

                setWorkers(final);
            } catch (err) {
                console.error("JobApplicantsPage error:", err);
                setError("Failed to load applicants. Please try again.");
            } finally {
                setLoading(false);
            }
        })();
    }, [jobId]);

    const handleWorkerRemoved = (removedId: string) =>
        setWorkers((prev) => prev.filter((w) => w._id !== removedId));

    const progressPct = Math.min(100, (confirmedCount / totalSlots) * 100);
    const remaining = Math.max(0, totalSlots - confirmedCount);

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className={`${typography.body.xs} text-gray-500`}>Loading applicants…</p>
                </div>
            </div>
        );

    if (error && workers.length === 0)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="text-5xl mb-4">📭</div>
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-2`}>No Applicants Yet</h2>
                    <p className={`${typography.body.xs} text-gray-500 mb-6`}>{error}</p>
                    <button onClick={() => navigate(-1)}
                        className={`bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold ${typography.body.xs}`}>
                        Go Back
                    </button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

                {/* Header */}
                <div className="bg-white border border-gray-100 rounded-2xl px-4 pt-4 pb-3 mt-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)}
                            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition active:scale-95">
                            <ChevronLeft size={18} className="text-gray-600" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className={`${typography.heading.h5} text-gray-900`}>Workers & Enquiries</h1>
                            <p className={`${typography.misc.caption} truncate`}>
                                {jobInfo?.category || "Services"} · {workers.length} worker{workers.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-3 grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                        <div className="flex flex-col items-center py-2.5 gap-0.5">
                            <Mail size={16} className="text-orange-500 mb-0.5" />
                            <span className={`${typography.fontSize.xl} font-extrabold text-orange-500 leading-none`}>{enquiredCount}</span>
                            <span className={`${typography.misc.badge} text-gray-400 mt-0.5`}>Enquired</span>
                        </div>
                        <div className="flex flex-col items-center py-2.5 gap-0.5">
                            <svg className="w-[16px] h-[16px] text-green-500 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
                            </svg>
                            <span className={`${typography.fontSize.xl} font-extrabold text-green-500 leading-none`}>{confirmedCount}</span>
                            <span className={`${typography.misc.badge} text-gray-400 mt-0.5`}>Confirmed</span>
                        </div>
                        <div className="flex flex-col items-center py-2.5 gap-0.5">
                            <Users size={16} className="text-blue-500 mb-0.5" />
                            <span className={`${typography.fontSize.xl} font-extrabold text-blue-500 leading-none`}>{totalSlots}</span>
                            <span className={`${typography.misc.badge} text-gray-400 mt-0.5`}>Max Slots</span>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-2.5">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-700"
                                style={{ width: `${progressPct}%` }} />
                        </div>
                        <p className={`${typography.misc.caption} mt-1`}>
                            {confirmedCount > 0
                                ? `${confirmedCount} confirmed · ${remaining} slot${remaining !== 1 ? "s" : ""} remaining`
                                : `${totalSlots} slots available`}
                        </p>
                    </div>
                </div>

                {/* Cards grid */}
                <div className="py-4 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workers.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users size={36} className="text-gray-300" />
                            </div>
                            <h3 className={`${typography.heading.h6} text-gray-700 mb-1`}>No Workers Yet</h3>
                            <p className={`${typography.body.xs} text-gray-400`}>No workers have applied for this job yet.</p>
                        </div>
                    ) : (
                        workers.map((worker) => (
                            <WorkerCard
                                key={worker._id}
                                worker={worker}
                                jobId={jobId!}
                                onRemoved={handleWorkerRemoved}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobApplicantsPage;