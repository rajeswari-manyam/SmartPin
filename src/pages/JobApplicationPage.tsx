import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Phone, Loader2, Users, MapPin,
    Tag, ChevronUp, ChevronDown, Grid3x3, Layers, Wrench,
    UserMinus, X, AlertTriangle, Mail
} from "lucide-react";
import {
    getConfirmedWorkers,
    getWorkerWithSkills,
    getWorkerById,
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
    status: "Enquired" | "Confirmed";
}

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
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">Remove Worker?</h2>
            <p className="text-sm text-gray-500 text-center mb-6">
                Are you sure you want to remove{" "}
                <span className="font-semibold text-gray-800">{workerName}</span> from this job?
                This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={onCancel} disabled={removing}
                    className="py-3.5 rounded-2xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition active:scale-95 disabled:opacity-50">
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={removing}
                    className="py-3.5 rounded-2xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white shadow-md transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
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
    const [expanded, setExpanded] = useState(true);
    const [removing, setRemoving] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);

    const cleanPhone = (worker.phone || "").replace(/\D/g, "");
    const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : null;
    const locationStr = [worker.area, worker.city, worker.state].filter(Boolean).join(", ");
    const initials = (worker.name || "?")
        .split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2);

    // Status badge colours
    const statusStyle =
        worker.status === "Confirmed"
            ? { bg: "bg-green-100", text: "text-green-700", icon: "text-green-500" }
            : { bg: "bg-yellow-100", text: "text-yellow-700", icon: "text-yellow-500" };

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
            {showRemoveModal && (
                <RemoveConfirmModal
                    workerName={worker.name}
                    onConfirm={handleRemoveConfirm}
                    onCancel={() => setShowRemoveModal(false)}
                    removing={removing}
                />
            )}

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5">

                    {/* ── Top row: avatar + name/status + chevron ── */}
                    <div className="flex items-start gap-4">

                        {/* Avatar */}
                        <div className="relative flex-shrink-0">
                            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#0f4c75] flex items-center justify-center">
                                {worker.profilePic ? (
                                    <img
                                        src={worker.profilePic}
                                        alt={worker.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                                    />
                                ) : (
                                    <span className="text-white font-bold text-2xl">{initials || "?"}</span>
                                )}
                            </div>
                            {/* Online dot */}
                            <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${worker.isActive ? "bg-green-400" : "bg-gray-400"}`} />
                        </div>

                        {/* Name + enquired badge + location + active */}
                        <div className="flex-1 min-w-0">

                            {/* Name row with status badge */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-bold text-gray-900 truncate">
                                    {worker.name}
                                </h3>
                                {/* ✅ Enquired / Confirmed badge */}
                                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${worker.status === "Confirmed"
                                    ? "bg-green-50 text-green-600 border-green-200"
                                    : "bg-yellow-50 text-yellow-600 border-yellow-200"
                                    }`}>
                                    <Mail size={10} />
                                    {worker.status}
                                </span>
                            </div>

                            {/* Location — always shown */}
                            <div className="flex items-center gap-1 mt-1">
                                <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                                <p className="text-xs text-gray-500 truncate">
                                    {locationStr || "Location not set"}
                                </p>
                            </div>

                            {/* Active badge */}
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-1.5 ${worker.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${worker.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                                {worker.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>

                        {/* Expand / Collapse */}
                        <button
                            onClick={() => setExpanded((v) => !v)}
                            className="w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center flex-shrink-0 transition active:scale-95">
                            {expanded
                                ? <ChevronUp size={16} className="text-gray-500" />
                                : <ChevronDown size={16} className="text-gray-500" />}
                        </button>
                    </div>

                    {/* ── Expandable details ── */}
                    {expanded && (
                        <div className="mt-4 space-y-4">
                            <div className="border-t border-gray-100" />

                            {/* Rate */}
                            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-full">
                                <Tag size={13} className="text-teal-500" />
                                <span className="text-sm font-bold">
                                    {worker.serviceCharge > 0
                                        ? `₹${worker.serviceCharge} / ${formatChargeType(worker.chargeType)}`
                                        : `₹0 / ${formatChargeType(worker.chargeType)}`}
                                </span>
                            </div>

                            {/* Category */}
                            {worker.categories.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Grid3x3 size={10} /> Category
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {worker.categories.map((cat, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-50 text-orange-600 border border-orange-200 px-3 py-1.5 rounded-full">
                                                <Grid3x3 size={11} /> {cat}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subcategory */}
                            {worker.subCategories.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Layers size={10} /> Subcategory
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {worker.subCategories.map((sub, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1.5 rounded-full">
                                                <Layers size={11} /> {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Skills */}
                            {worker.skills.length > 0 && (
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Wrench size={10} /> Skills
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {worker.skills.map((skill, i) => (
                                            <span key={i} className="inline-flex items-center gap-1.5 text-xs font-bold bg-violet-50 text-violet-600 border border-violet-200 px-3 py-1.5 rounded-full">
                                                <Wrench size={11} /> {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Action buttons ── */}
                <div className="px-5 pb-5 grid grid-cols-2 gap-3">

                    {/* Call button — shows phone number if available, else just "Call" */}
                    {displayPhone ? (
                        <a
                            href={`tel:${cleanPhone}`}
                            className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-[#0f4c75] hover:bg-[#0d3d5e] text-white shadow-md transition-all active:scale-95"
                        >
                            <Phone size={15} />
                            <span className="truncate">{displayPhone}</span>
                        </a>
                    ) : (
                        <a
                            href={cleanPhone ? `tel:${cleanPhone}` : undefined}
                            className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-[#0f4c75] hover:bg-[#0d3d5e] text-white shadow-md transition-all active:scale-95 ${!cleanPhone ? "opacity-50 pointer-events-none" : ""}`}
                        >
                            <Phone size={15} />
                            Call
                        </a>
                    )}

                    {/* Remove button */}
                    <button
                        onClick={() => setShowRemoveModal(true)}
                        disabled={removing}
                        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-100 transition-all active:scale-95 disabled:opacity-60 disabled:pointer-events-none"
                    >
                        <UserMinus size={15} />
                        Remove
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Enrich one worker ID ──────────────────────────────────────────────────────
const enrichWorker = async (
    cw: ConfirmedWorkers,
    isConfirmed: boolean
): Promise<EnrichedWorker> => {
    const id = cw._id;

    let name: string = cw.name || "";
    let phone: string = "";
    let profilePic = resolveImageUrl(cw.profilePic);
    let area: string = cw.area || "";
    let city: string = cw.city || "";
    let state: string = cw.state || "";
    let serviceCharge = cw.serviceCharge || 0;
    let chargeType: string = cw.chargeType || "hour";
    let isActive = cw.isActive ?? true;
    let categories: string[] = Array.isArray(cw.category) ? cw.category : [];
    let subCategories = cw.subCategories || [];
    let skills = cw.skills || [];
    let resolvedWorkerId: string | undefined;
    let resolvedUserId: string | undefined;

    // A. Try as Worker ID → getWorkerById
    try {
        const wRes = await getWorkerById(id);
        if (wRes.success && wRes.data) {
            const w = wRes.data;
            resolvedWorkerId = id;
            resolvedUserId = w.userId || undefined;
            if (w.name) name = w.name;
            if (w.profilePic) profilePic = resolveImageUrl(w.profilePic) || profilePic;
            if (w.area) area = w.area;   // ✅ explicit — never skipped
            if (w.city) city = w.city;
            if (w.state) state = w.state;
            if (w.chargeType) chargeType = w.chargeType;
            if (w.serviceCharge != null) serviceCharge = w.serviceCharge;
            isActive = w.isActive ?? isActive;
            const rawCats = Array.isArray(w.category) ? w.category : w.category ? [w.category] : [];
            if (rawCats.length) categories = rawCats as string[];
            if (w.subCategories?.length) subCategories = w.subCategories;
            if (w.skills?.length) skills = w.skills;
        }
    } catch { /* id may be a userId */ }

    // B. getWorkerWithSkills for richer skills + location data
    if (resolvedWorkerId) {
        try {
            const skillRes = await getWorkerWithSkills(resolvedWorkerId);
            if (skillRes.success && skillRes.worker) {
                const w = skillRes.worker;
                name = name || w.name || "";
                profilePic = profilePic || resolveImageUrl(w.profilePic);
                area = area || w.area || "";
                city = city || w.city || "";
                state = state || w.state || "";
                serviceCharge = (serviceCharge === 0 && w.serviceCharge > 0) ? w.serviceCharge : serviceCharge;
                chargeType = chargeType || w.chargeType || "hour";
                resolvedUserId = resolvedUserId || w.userId || undefined;

                if (skillRes.workerSkills?.length) {
                    categories = Array.from(new Set(skillRes.workerSkills.flatMap((s) => s.category || [])));
                    subCategories = Array.from(new Set(skillRes.workerSkills.map((s) => s.subCategory).filter(Boolean)));
                    skills = Array.from(new Set(skillRes.workerSkills.map((s) => s.skill).filter(Boolean)));
                    // ✅ workerSkills docs also store area/city/state — use as fallback
                    const fs = skillRes.workerSkills[0];
                    if (!area && fs?.area) area = fs.area;
                    if (!city && fs?.city) city = fs.city;
                    if (!state && fs?.state) state = fs.state;
                } else if (w.categories?.length) {
                    categories = (w.categories || []).flat();
                    subCategories = w.subCategories?.length ? w.subCategories : subCategories;
                    skills = w.skills?.length ? w.skills : skills;
                }
            }
        } catch { /* skip */ }
    }

    // C. getUserById — either with resolvedUserId or raw id if A failed
    const userIdToTry = resolvedUserId || (!resolvedWorkerId ? id : undefined);
    if (userIdToTry) {
        try {
            const userRes = await getUserById(userIdToTry);
            if (userRes.success && userRes.data) {
                const u = userRes.data as any;
                if (!name && u.name) name = u.name;
                if (u.phone) phone = u.phone;
                profilePic = profilePic || resolveImageUrl(u.profilePic);
                // ✅ Some user docs carry location fields too — use as last resort
                if (!area && u.area) area = u.area;
                if (!city && u.city) city = u.city;
                if (!state && u.state) state = u.state;
            }
        } catch { /* skip */ }
    }

    // D. Fallback phone with resolvedUserId if C used raw id
    if (!phone && resolvedUserId && resolvedUserId !== userIdToTry) {
        try {
            const userRes = await getUserById(resolvedUserId);
            if (userRes.success && userRes.data?.phone) phone = userRes.data.phone;
        } catch { /* skip */ }
    }

    return {
        _id: id,
        workerId: resolvedWorkerId || id,
        userId: resolvedUserId || userIdToTry,
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

    // Stats for header
    const [enquiredCount, setEnquiredCount] = useState(0);
    const [confirmedCount, setConfirmedCount] = useState(0);
    const totalSlots = 3;

    useEffect(() => {
        if (!jobId) return;
        (async () => {
            try {
                setLoading(true);
                setError(null);

                // Job info
                try {
                    const jobRes = await getJobById(jobId);
                    if (jobRes.success || jobRes.data) {
                        setJobInfo({ category: jobRes.data?.subcategory || jobRes.data?.category || "Job" });
                    }
                } catch { /* non-critical */ }

                // Raw API call to get both arrays
                const rawRes = await fetch(`${API_BASE_URL}/getConfirmedWorkers/${jobId}`, {
                    method: "GET", redirect: "follow",
                });
                const rawJson = await rawRes.json();
                const confirmedWorkerIds: string[] = (rawJson?.data?.confirmedWorkers || []).filter((w: any) => typeof w === "string");
                const confirmedWorkerObjs: any[] = (rawJson?.data?.confirmedWorkers || []).filter((w: any) => typeof w === "object");
                const enquiredWorkerIds: string[] = rawJson?.data?.enquiredWorkers || [];

                setEnquiredCount(enquiredWorkerIds.length);
                setConfirmedCount(confirmedWorkerIds.length + confirmedWorkerObjs.length);

                // Build a combined list with status tag
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

                // Enrich in parallel
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
                    <button onClick={() => navigate(-1)} className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold">
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
                    <button onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition active:scale-95">
                        <ChevronLeft size={18} className="text-gray-600" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-gray-900">Workers & Enquiries</h1>
                        <p className="text-xs text-gray-400 truncate">
                            {jobInfo?.category || "Services"} · {workers.length} worker{workers.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>

                {/* ── Stats row: Enquired | Confirmed | Max Slots ── */}
                <div className="max-w-lg mx-auto mt-4 grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="flex flex-col items-center py-3 gap-0.5">
                        <Mail size={18} className="text-orange-500 mb-0.5" />
                        <span className="text-2xl font-extrabold text-orange-500 leading-none">{enquiredCount}</span>
                        <span className="text-[11px] text-gray-400 font-medium mt-0.5">Enquired</span>
                    </div>
                    <div className="flex flex-col items-center py-3 gap-0.5">
                        <svg className="w-[18px] h-[18px] text-green-500 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
                        </svg>
                        <span className="text-2xl font-extrabold text-green-500 leading-none">{confirmedCount}</span>
                        <span className="text-[11px] text-gray-400 font-medium mt-0.5">Confirmed</span>
                    </div>
                    <div className="flex flex-col items-center py-3 gap-0.5">
                        <Users size={18} className="text-blue-500 mb-0.5" />
                        <span className="text-2xl font-extrabold text-blue-500 leading-none">{totalSlots}</span>
                        <span className="text-[11px] text-gray-400 font-medium mt-0.5">Max Slots</span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="max-w-lg mx-auto mt-3">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                        {confirmedCount > 0
                            ? `${confirmedCount} confirmed · ${remaining} slot${remaining !== 1 ? "s" : ""} remaining`
                            : `${totalSlots} slots available`}
                    </p>
                </div>
            </div>

            {/* ── Cards ── */}
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                {workers.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={36} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">No Workers Yet</h3>
                        <p className="text-sm text-gray-400">No workers have applied for this job yet.</p>
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
    );
};

export default JobApplicantsPage;