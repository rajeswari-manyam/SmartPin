import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Phone, Loader2, Users, MapPin,
    Tag, ChevronUp, ChevronDown, Grid3x3, Layers, Wrench, UserMinus, Eye, X, AlertTriangle
} from "lucide-react";
import {
    getConfirmedWorkers,
    getWorkerWithSkills,
    getJobById,
    getUserById,
    removeEnquiry,
    ConfirmedWorkers,
    API_BASE_URL,
} from "../services/api.service";

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

// ── Types ─────────────────────────────────────────────────────────────────────
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
    status?: string;
}

// ── Remove Confirm Modal ──────────────────────────────────────────────────────
const RemoveConfirmModal: React.FC<{
    workerName: string;
    onConfirm: () => void;
    onCancel: () => void;
    removing: boolean;
}> = ({ workerName, onConfirm, onCancel, removing }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onCancel}
        />
        {/* Modal */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
                onClick={onCancel}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
            >
                <X size={16} className="text-gray-500" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
            </div>

            {/* Text */}
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Remove Worker?</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-gray-800">{workerName}</span> from this job?
                This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={onCancel}
                    disabled={removing}
                    className="py-3.5 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition active:scale-95 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={removing}
                    className="py-3.5 rounded-2xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-100 transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                    {removing ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : (
                        <UserMinus size={15} />
                    )}
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
    onRemoved: (workerId: string) => void;
}> = ({ worker, jobId, onRemoved }) => {
    const [expanded, setExpanded] = useState(true);
    const [removing, setRemoving] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showPhone, setShowPhone] = useState(false);

    const cleanPhone = (worker.phone || "").replace(/\D/g, "");
    const locationStr = [worker.area, worker.city, worker.state].filter(Boolean).join(", ");
    const initials = (worker.name || "?")
        .split(" ")
        .map((n) => n[0] || "")
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleRemoveConfirm = async () => {
        try {
            setRemoving(true);
            await removeEnquiry(worker.workerId || worker._id, jobId);
            onRemoved(worker._id);
        } catch (err) {
            console.error("Remove worker failed:", err);
            alert("Failed to remove worker. Please try again.");
        } finally {
            setRemoving(false);
            setShowRemoveModal(false);
        }
    };

    return (
        <>
            {/* Remove Confirm Modal */}
            {showRemoveModal && (
                <RemoveConfirmModal
                    workerName={worker.name || "this worker"}
                    onConfirm={handleRemoveConfirm}
                    onCancel={() => setShowRemoveModal(false)}
                    removing={removing}
                />
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                {/* ── Header Row ── */}
                <div className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center border-2 border-gray-200">
                                {worker.profilePic ? (
                                    <img
                                        src={worker.profilePic}
                                        alt={worker.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                ) : (
                                    <span className="text-white font-bold text-xl">{initials || "?"}</span>
                                )}
                            </div>
                            <div
                                className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                    worker.isActive ? "bg-green-400" : "bg-gray-400"
                                }`}
                            />
                        </div>

                        {/* Name + Location + Status */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 truncate">{worker.name || "Worker"}</h3>
                            {locationStr && (
                                <div className="flex items-center gap-1 mt-0.5">
                                    <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                                    <p className="text-xs text-gray-500 truncate">{locationStr}</p>
                                </div>
                            )}

                            {/* ── Phone Number Display ── */}
                            {showPhone && cleanPhone ? (
                                <div className="flex items-center gap-1 mt-1">
                                    <Phone size={11} className="text-blue-400 flex-shrink-0" />
                                    <a
                                        href={`tel:${cleanPhone}`}
                                        className="text-xs font-semibold text-blue-500 hover:underline"
                                    >
                                        +91 {cleanPhone}
                                    </a>
                                </div>
                            ) : null}

                            <span
                                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-1.5 ${
                                    worker.isActive
                                        ? "bg-green-100 text-green-700"
                                        : "bg-gray-100 text-gray-500"
                                }`}
                            >
                                <span
                                    className={`w-1.5 h-1.5 rounded-full ${
                                        worker.isActive ? "bg-green-500" : "bg-gray-400"
                                    }`}
                                />
                                {worker.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        {/* Expand / Collapse toggle */}
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0 transition active:scale-95"
                        >
                            {expanded ? (
                                <ChevronUp size={16} className="text-gray-600" />
                            ) : (
                                <ChevronDown size={16} className="text-gray-600" />
                            )}
                        </button>
                    </div>

                    {/* ── Expandable Detail Section ── */}
                    {expanded && (
                        <div className="mt-4 space-y-4">
                            <div className="border-t border-gray-100" />

                            {/* Charge Rate */}
                            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full">
                                <Tag size={13} className="text-teal-500" />
                                <span className="text-sm font-bold">
                                    ₹{worker.serviceCharge} / {formatChargeType(worker.chargeType)}
                                </span>
                            </div>

                            {/* Category */}
                            {worker.categories.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Grid3x3 size={10} />
                                        Category
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {worker.categories.map((cat, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full"
                                            >
                                                <Grid3x3 size={11} />
                                                {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subcategory */}
                            {worker.subCategories.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Layers size={10} />
                                        Subcategory
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {worker.subCategories.map((sub, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-full"
                                            >
                                                <Layers size={11} />
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            {worker.skills.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Wrench size={10} />
                                        Skills
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {worker.skills.map((skill, i) => (
                                            <span
                                                key={i}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold bg-violet-50 text-violet-600 border border-violet-200 px-3 py-1.5 rounded-full"
                                            >
                                                <Wrench size={11} />
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Show Number + Remove Buttons ── */}
                <div className="px-5 pb-5 grid grid-cols-2 gap-2">
                    {/* Show Number Button */}
                    {showPhone && cleanPhone ? (
                        <a
                            href={`tel:${cleanPhone}`}
                            className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl font-bold text-sm bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-100 transition-all active:scale-95"
                        >
                            <Phone size={15} />
                            +91 {cleanPhone}
                        </a>
                    ) : (
                        <button
                            onClick={() => setShowPhone(true)}
                            className={`flex items-center justify-center gap-1.5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                                cleanPhone
                                    ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-100"
                                    : "bg-gray-100 text-gray-400 pointer-events-none"
                            }`}
                        >
                            <Eye size={15} />
                            {cleanPhone ? "Show Number" : "No Phone"}
                        </button>
                    )}

                    {/* Remove Button */}
                    <button
                        onClick={() => setShowRemoveModal(true)}
                        disabled={removing}
                        className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-100 transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                    >
                        <UserMinus size={15} />
                        Remove
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const JobApplicantsPage: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    const [workers, setWorkers] = useState<EnrichedWorker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jobInfo, setJobInfo] = useState<{ category: string; subcategory?: string } | null>(null);
    const totalSlots = 3;

    useEffect(() => {
        if (!jobId) return;
        (async () => {
            try {
                setLoading(true);
                setError(null);

                // ── 1. Get job info ──
                try {
                    const jobRes = await getJobById(jobId);
                    if (jobRes.success || jobRes.data) {
                        setJobInfo({
                            category: jobRes.data?.subcategory || jobRes.data?.category || "Job",
                            subcategory: jobRes.data?.subcategory,
                        });
                    }
                } catch { /* non-critical */ }

                // ── 2. Get confirmed workers ──
                const res = await getConfirmedWorkers(jobId);
                if (!res.success || res.data.length === 0) {
                    setError("No applicants found for this job.");
                    return;
                }

                // ── 3. Enrich each worker with full details + phone number ──
                const enriched = await Promise.allSettled(
                    res.data.map(async (cw: ConfirmedWorkers) => {
                        const wId = cw._id;

                        let name: string = cw.name || "";
                        let phone: string = "";
                        let profilePic: string | null = resolveImageUrl(cw.profilePic);
                        let area: string = cw.area || "";
                        let city: string = cw.city || "";
                        let state: string = cw.state || "";
                        let serviceCharge: number = cw.serviceCharge || 0;
                        let chargeType: string = cw.chargeType || "hour";
                        let isActive: boolean = cw.isActive ?? true;
                        let categories: string[] = Array.isArray(cw.category) ? cw.category : [];
                        let subCategories: string[] = cw.subCategories || [];
                        let skills: string[] = cw.skills || [];

                        // ── Fetch phone number from user profile ──
                        if (cw.userId) {
                            try {
                                const userRes = await getUserById(cw.userId);
                                if (userRes.success && userRes.data?.phone) {
                                    phone = userRes.data.phone;
                                }
                            } catch { /* phone fetch failed, leave empty */ }
                        }

                        // ── Try getWorkerWithSkills for richer data ──
                        if (wId) {
                            try {
                                const skillRes = await getWorkerWithSkills(wId);
                                if (skillRes.success && skillRes.worker) {
                                    const w = skillRes.worker;
                                    name = name || w.name || "";
                                    profilePic = profilePic || resolveImageUrl(w.profilePic);
                                    area = area || w.area || "";
                                    city = city || w.city || "";
                                    state = state || w.state || "";
                                    serviceCharge = w.serviceCharge ?? serviceCharge;
                                    chargeType = w.chargeType || chargeType;
                                    isActive = true;

                                    if (skillRes.workerSkills?.length) {
                                        const allCats = skillRes.workerSkills.flatMap((s) => s.category || []);
                                        const allSubs = skillRes.workerSkills.map((s) => s.subCategory).filter(Boolean);
                                        const allSkills = skillRes.workerSkills.map((s) => s.skill).filter(Boolean);
                                        categories = Array.from(new Set(allCats));
                                        subCategories = Array.from(new Set(allSubs));
                                        skills = Array.from(new Set(allSkills));
                                    } else {
                                        categories = (w.categories || []).flat();
                                        subCategories = w.subCategories || [];
                                        skills = w.skills || [];
                                    }

                                    // Also try userId from worker response for phone
                                    if (!phone && w.userId) {
                                        try {
                                            const userRes = await getUserById(w.userId);
                                            if (userRes.success && userRes.data?.phone) {
                                                phone = userRes.data.phone;
                                            }
                                        } catch { /* ignore */ }
                                    }
                                }
                            } catch { /* use raw cw data */ }
                        }

                        return {
                            _id: cw._id,
                            workerId: wId,
                            userId: cw.userId,
                            name,
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
                        } as EnrichedWorker;
                    })
                );

                const finalWorkers = enriched
                    .filter(
                        (r): r is PromiseFulfilledResult<EnrichedWorker> => r.status === "fulfilled"
                    )
                    .map((r) => r.value);

                setWorkers(finalWorkers);
            } catch {
                setError("Failed to load applicants. Please try again.");
            } finally {
                setLoading(false);
            }
        })();
    }, [jobId]);

    // ── Remove worker from list after successful API call ──
    const handleWorkerRemoved = (removedId: string) => {
        setWorkers((prev) => prev.filter((w) => w._id !== removedId));
    };

    const filledSlots = workers.length;
    const remainingSlots = Math.max(0, totalSlots - filledSlots);
    const progressPercent = Math.min(100, (filledSlots / totalSlots) * 100);
    const headerSubtitle = jobInfo?.category || "Services";

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className="text-sm text-gray-500">Loading applicants…</p>
                </div>
            </div>
        );

    if (error && workers.length === 0)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="text-5xl mb-4">📭</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">No Applicants Yet</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Sticky Header ── */}
            <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition active:scale-95"
                    >
                        <ChevronLeft size={18} className="text-gray-600" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-gray-900">Confirmed Workers</h1>
                        <p className="text-xs text-gray-400 truncate">
                            {headerSubtitle} · {filledSlots}/{totalSlots} slots
                        </p>
                    </div>
                    <div className="flex-shrink-0 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                        <span className="text-xs font-bold text-orange-600">
                            {filledSlots}/{totalSlots}
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="max-w-lg mx-auto mt-3">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-700"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                        {filledSlots > 0
                            ? `${filledSlots} confirmed · ${remainingSlots} slot${remainingSlots !== 1 ? "s" : ""} remaining`
                            : `${totalSlots} slots available`}
                    </p>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                {workers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={36} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">No Workers Yet</h3>
                        <p className="text-sm text-gray-400">
                            No workers have applied for this job yet.
                        </p>
                    </div>
                ) : (
                    workers.map((worker) => (
                        <WorkerCard
                            key={worker._id || worker.workerId}
                            worker={worker}
                            jobId={jobId!}
                            onRemoved={handleWorkerRemoved}
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default JobApplicantsPage;