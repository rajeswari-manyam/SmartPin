import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, Phone, Loader2, Users, UserMinus, ChevronLeft } from "lucide-react";
import { getConfirmedWorkers, removeEnquiry, ConfirmedWorkers } from "../services/api.service";
import { getUserById, API_BASE_URL } from "../services/api.service";

// ── Resolve profile image URL ─────────────────────────────────────────────────
const resolveImageUrl = (path?: string): string | null => {
    if (!path || typeof path !== "string") return null;
    const cleaned = path.trim();
    if (!cleaned) return null;
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    const rel = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${base}${rel}`;
};

// ── Worker with enriched details ──────────────────────────────────────────────
interface WorkerWithDetails extends ConfirmedWorkers {
    resolvedName: string;
    resolvedPhone: string;
    resolvedImage: string | null;
    status?: string;
}

// ── Worker Card ───────────────────────────────────────────────────────────────
const WorkerCard: React.FC<{
    worker: WorkerWithDetails;
    jobId: string;
    onRemoved: (workerId: string) => void;
}> = ({ worker, jobId, onRemoved }) => {
    const [removing, setRemoving] = useState(false);
    const [removeError, setRemoveError] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    const cleanPhone = (worker.resolvedPhone || "").replace(/\D/g, "");
    const initials = (worker.resolvedName || "?")
        .split(" ")
        .map((n) => n[0] || "")
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const statusColor =
        worker.status === "Confirmed"
            ? { bg: "bg-green-100", text: "text-green-700", dot: "bg-green-500" }
            : worker.status === "Rejected"
            ? { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" }
            : { bg: "bg-yellow-100", text: "text-yellow-700", dot: "bg-yellow-500" };

    const handleRemove = async () => {
        const workerIdToRemove = worker.userId || worker._id;
        if (!workerIdToRemove) return;
        setRemoving(true);
        setRemoveError("");
        try {
            const result = await removeEnquiry(workerIdToRemove, jobId);
            if (result.success) {
                onRemoved(worker._id);
            } else {
                setRemoveError(result.message || "Failed to remove worker.");
                setShowConfirm(false);
            }
        } catch {
            setRemoveError("Network error. Please try again.");
            setShowConfirm(false);
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* ── Card Body ── */}
            <div className="p-5">
                {/* ── Top Row: Avatar + Name + Status ── */}
                <div className="flex items-center gap-4 mb-5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-orange-100 flex items-center justify-center border-2 border-orange-200">
                            {worker.resolvedImage ? (
                                <img
                                    src={worker.resolvedImage}
                                    alt={worker.resolvedName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            ) : (
                                <span className="text-orange-500 font-bold text-xl">
                                    {initials || "?"}
                                </span>
                            )}
                        </div>
                        {/* Online dot */}
                        <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-white" />
                    </div>

                    {/* Name + Status */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                            {worker.resolvedName || "Worker"}
                        </h3>
                        <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mt-1 ${statusColor.bg} ${statusColor.text}`}
                        >
                            <span className={`w-1.5 h-1.5 rounded-full ${statusColor.dot}`} />
                            {worker.status || "Applied"}
                        </span>
                    </div>

                    {/* Remove (X) button */}
                    <button
                        onClick={() => setShowConfirm(true)}
                        disabled={removing}
                        title="Remove worker"
                        className="flex-shrink-0 w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
                    >
                        {removing ? (
                            <Loader2 size={15} className="animate-spin text-red-500" />
                        ) : (
                            <UserMinus size={15} className="text-red-500" />
                        )}
                    </button>
                </div>

                {/* ── Remove error ── */}
                {removeError && (
                    <div className="mb-3 px-3 py-2 bg-red-50 rounded-xl">
                        <p className="text-xs text-red-500">{removeError}</p>
                    </div>
                )}

                {/* ── Divider ── */}
                <div className="border-t border-gray-100 mb-4" />

                {/* ── Personal Details ── */}
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Personal Details
                </p>

                {/* Phone row */}
                <div className="flex items-center gap-3 mb-5 bg-gray-50 rounded-2xl px-4 py-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Phone size={17} className="text-orange-500" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Phone</p>
                        <p className="text-sm font-bold text-gray-900">
                            {worker.resolvedPhone || "—"}
                        </p>
                    </div>
                </div>

                {/* ── Action Buttons ── */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Call */}
                    <a
                        href={cleanPhone ? `tel:${cleanPhone}` : undefined}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                            cleanPhone
                                ? "bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-100"
                                : "bg-gray-100 text-gray-400 pointer-events-none"
                        }`}
                    >
                        <Phone size={16} />
                        Call
                    </a>

                    {/* WhatsApp */}
                    <a
                        href={cleanPhone ? `https://wa.me/91${cleanPhone}` : undefined}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 ${
                            cleanPhone
                                ? "bg-green-500 hover:bg-green-600 text-white shadow-md shadow-green-100"
                                : "bg-gray-100 text-gray-400 pointer-events-none"
                        }`}
                    >
                        {/* WhatsApp SVG icon */}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                        WhatsApp
                    </a>
                </div>
            </div>

            {/* ── Remove Confirmation Banner (slides in from bottom of card) ── */}
            {showConfirm && (
                <div className="border-t border-red-100 bg-red-50 px-5 py-4">
                    <p className="text-sm font-semibold text-red-700 mb-3">
                        Remove <span className="font-bold">{worker.resolvedName}</span> from this job?
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="flex-1 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold text-sm transition hover:bg-gray-50 active:scale-95"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={removing}
                            className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-1.5"
                        >
                            {removing ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Removing…
                                </>
                            ) : (
                                <>
                                    <UserMinus size={14} />
                                    Remove
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
const ConfirmedWorkersPage: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    const [workers, setWorkers] = useState<WorkerWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jobCategory, setJobCategory] = useState<string>("Job");
    const totalSlots = 3;

    useEffect(() => {
        if (!jobId) return;
        (async () => {
            try {
                setLoading(true);
                const res = await getConfirmedWorkers(jobId);
                if (!res.success) {
                    setError("Failed to load confirmed workers.");
                    return;
                }

                // ── Enrich each worker with getUserById ──
                const enriched = await Promise.all(
                    res.data.map(async (worker) => {
                        let name = (worker as any).name || "";
                        let phone = (worker as any).phone || "";
                        let image: string | null = resolveImageUrl(
                            (worker as any).profileImage || (worker as any).profilePic
                        );

                        if ((!name || !phone) && worker.userId) {
                            try {
                                const userRes = await getUserById(worker.userId);
                                if (userRes.success) {
                                    const u = userRes.data as any;
                                    name = name || u.name || "";
                                    phone = phone || u.phone || "";
                                    image =
                                        image ||
                                        resolveImageUrl(
                                            u.profilePic || u.profileImage || u.image || u.avatar || ""
                                        );
                                }
                            } catch {}
                        }

                        return {
                            ...worker,
                            resolvedName: name,
                            resolvedPhone: phone,
                            resolvedImage: image,
                        } as WorkerWithDetails;
                    })
                );

                setWorkers(enriched);
                if (enriched.length > 0) setJobCategory("Carpenters");
            } catch {
                setError("Something went wrong. Please try again.");
            } finally {
                setLoading(false);
            }
        })();
    }, [jobId]);

    const handleWorkerRemoved = (removedId: string) => {
        setWorkers((prev) => prev.filter((w) => w._id !== removedId));
    };

    const filledSlots = workers.length;
    const remainingSlots = Math.max(0, totalSlots - filledSlots);
    const progressPercent = Math.min(100, (filledSlots / totalSlots) * 100);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className="text-sm text-gray-500">Loading workers…</p>
                </div>
            </div>
        );

    // ── Error ─────────────────────────────────────────────────────────────────
    if (error)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
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
            {/* ── Sticky Header ──────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 px-4 pt-12 pb-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-3 max-w-lg mx-auto">
                    {/* Back button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition active:scale-95"
                    >
                        <ChevronLeft size={18} className="text-gray-600" />
                    </button>

                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold text-gray-900">Confirmed Workers</h1>
                        <p className="text-xs text-gray-400">
                            {jobCategory} · {filledSlots}/{totalSlots} slots filled
                        </p>
                    </div>

                    {/* Slot count badge */}
                    <div className="flex-shrink-0 bg-orange-50 border border-orange-200 rounded-full px-3 py-1">
                        <span className="text-xs font-bold text-orange-600">
                            {filledSlots}/{totalSlots}
                        </span>
                    </div>
                </div>

                {/* ── Progress bar ── */}
                <div className="max-w-lg mx-auto mt-3">
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-orange-500 rounded-full transition-all duration-700"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                        {remainingSlots > 0
                            ? `${remainingSlots} slot${remainingSlots > 1 ? "s" : ""} remaining`
                            : "🎉 All slots filled!"}
                    </p>
                </div>
            </div>

            {/* ── Content ─────────────────────────────────────────────────────── */}
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
                {workers.length === 0 ? (
                    /* ── Empty State ── */
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
                            key={worker._id || worker.userId}
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

export default ConfirmedWorkersPage;
