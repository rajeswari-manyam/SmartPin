import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Plus, Users, Pencil, Trash2, MapPin, Calendar, Loader2 } from "lucide-react";
import { getConfirmedWorkersCount } from "../services/api.service";
import { API_BASE_URL } from "../services/api.service";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Job {
    _id: string;
    userId: string;
    category: string;
    subcategory?: string;
    description?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    servicecharges?: string | number;
    jobType?: string;
    startDate?: string;
    endDate?: string;
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
    slots?: number;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface MyJobsPageProps {
    userId: string;
    userName?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const resolveImageUrl = (path?: string): string | null => {
    if (!path) return null;
    const cleaned = path.trim();
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    const rel = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${base}${rel}`;
};

const formatDate = (dateStr?: string): string => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "numeric", year: "numeric" });
};

// ── Job Card ──────────────────────────────────────────────────────────────────
const JobCard: React.FC<{
    job: Job;
    confirmedCount: number;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onViewWorkers: (id: string) => void;
}> = ({ job, confirmedCount, onEdit, onDelete, onViewWorkers }) => {
    const imageUrl = resolveImageUrl(job.images?.[0]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* ── Image ── */}
            {imageUrl && (
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={job.category}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    {/* Category + Subcategory badges */}
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        {job.subcategory && (
                            <span className="text-[10px] font-bold bg-orange-500 text-white px-2 py-0.5 rounded">
                                {job.subcategory}
                            </span>
                        )}
                        {job.category && (
                            <span className="text-[10px] font-semibold bg-white/80 text-gray-700 px-2 py-0.5 rounded backdrop-blur-sm">
                                {job.category}
                            </span>
                        )}
                    </div>
                    {/* Job type badge top right */}
                    {job.jobType && (
                        <span className="absolute top-3 right-3 text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                            {job.jobType}
                        </span>
                    )}
                </div>
            )}

            {/* ── Body ── */}
            <div className="px-4 pt-3 pb-0">
                {/* Description */}
                {job.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{job.description}</p>
                )}

                {/* Title + Job Type (if no image) */}
                <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900 flex-1">
                        {job.category}{job.subcategory ? ` & ${job.subcategory}` : ""}
                    </h3>
                    {!imageUrl && job.jobType && (
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full flex-shrink-0">
                            {job.jobType}
                        </span>
                    )}
                </div>

                {/* User ID (small) */}
                <p className="text-[11px] text-gray-400 mb-2">{job.userId}</p>

                {/* Location */}
                <div className="flex items-center gap-1 mb-2">
                    <MapPin size={12} className="text-orange-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600">
                        {[job.area, job.city, job.state, job.pincode ? `- ${job.pincode}` : ""].filter(Boolean).join(", ")}
                    </span>
                </div>

                {/* Price + Job type */}
                <div className="flex items-center gap-3 mb-2">
                    {job.servicecharges && (
                        <span className="text-green-600 font-extrabold text-base">
                            ₹{job.servicecharges}
                        </span>
                    )}
                    {job.jobType && (
                        <span className="text-[11px] font-bold bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full">
                            {job.jobType.toUpperCase()}
                        </span>
                    )}
                </div>

                {/* Dates */}
                <div className="flex items-center gap-1.5 mb-3">
                    <Calendar size={11} className="text-gray-400" />
                    <span className="text-xs text-gray-500">
                        {formatDate(job.startDate)} – {formatDate(job.endDate)}
                    </span>
                </div>

                {job.createdAt && (
                    <p className="text-[11px] text-gray-400 mb-3">
                        Posted: {formatDate(job.createdAt)}
                    </p>
                )}
            </div>

            {/* ── Action buttons ── */}
            <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                <button
                    onClick={() => onEdit(job._id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gray-100 hover:bg-[#00598a]/60 text-[#00598a] font-semibold text-sm transition active:scale-95"
                >
                    <Pencil size={14} />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(job._id)}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-red-50 hover:bg-[#00598a]/60 text-red-600 font-semibold text-sm transition active:scale-95"
                >
                    <Trash2 size={14} />
                    Delete
                </button>
            </div>

            {/* ── Confirmed Workers Banner ── */}
            {confirmedCount > 0 && (
                <button
                    onClick={() => onViewWorkers(job._id)}
                    className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 px-4 py-3 transition active:scale-[0.99]"
                >
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-orange-500" />
                        <span className="text-sm font-bold text-orange-600">
                            {confirmedCount} worker{confirmedCount > 1 ? "s" : ""} confirmed
                        </span>
                    </div>
                    <span className="text-gray-400 text-lg">›</span>
                </button>
            )}
        </div>
    );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MyJobsPage: React.FC<MyJobsPageProps> = ({ userId, userName = "User" }) => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string>("");
    const [confirmedCounts, setConfirmedCounts] = useState<Record<string, number>>({});
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Fetch jobs for this customer ──────────────────────────────────────────
    const fetchJobs = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError("");

        try {
            const response = await fetch(
                `${API_BASE_URL}/getJobsByUserId?userId=${userId}`,
                { method: "GET", redirect: "follow" }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const data = await response.json();
            const jobList: Job[] = data.data || data.jobs || [];
            setJobs(jobList);

            // ── Fetch confirmed worker counts for all jobs in parallel ──
            const counts: Record<string, number> = {};
            await Promise.all(
                jobList.map(async (job) => {
                    const count = await getConfirmedWorkersCount(job._id);
                    counts[job._id] = count;
                })
            );
            setConfirmedCounts(counts);

        } catch (err: any) {
            setError(err.message || "Failed to load jobs.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // ── Delete job ────────────────────────────────────────────────────────────
    const handleDelete = async (jobId: string) => {
        if (!window.confirm("Are you sure you want to delete this job?")) return;
        setDeleteLoading(jobId);
        try {
            const response = await fetch(`${API_BASE_URL}/deleteJob/${jobId}`, {
                method: "DELETE",
                redirect: "follow",
            });
            const result = await response.json();
            if (result.success) {
                setJobs(prev => prev.filter(j => j._id !== jobId));
            } else {
                alert("Failed to delete job. Please try again.");
            }
        } catch {
            alert("Network error. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ── Loading ───────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                <p className="text-sm text-gray-500">Loading your jobs…</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-5">
            <div className="max-w-lg mx-auto space-y-5">

                {/* ── Header ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900">
                            My Jobs ({jobs.length})
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            Welcome, {userName}! 👋
                        </p>
                    </div>
                    <button
                        onClick={() => fetchJobs(true)}
                        disabled={refreshing}
                        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center shadow-sm hover:bg-[#00598a]/60 transition active:scale-95"
                    >
                        <RefreshCw size={16} className={`text-blue-500 ${refreshing ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* ── Error ── */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                        <p className="text-sm text-red-600">{error}</p>
                        <button onClick={() => fetchJobs()} className="text-xs text-red-500 underline mt-1">
                            Try again
                        </button>
                    </div>
                )}

                {/* ── Empty state ── */}
                {jobs.length === 0 && !error && (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                        <div className="text-6xl mb-4">📋</div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">No Jobs Posted</h3>
                        <p className="text-sm text-gray-400 mb-5">
                            Post your first job to find skilled workers.
                        </p>
                        <button
                            onClick={() => navigate("/post-job")}
                            className="bg-[#00598a] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#00598a]/60 transition"
                        >
                            + Post a Job
                        </button>
                    </div>
                )}

                {/* ── Job Cards ── */}
                {jobs.map((job) => (
                    <div key={job._id} className={deleteLoading === job._id ? "opacity-50 pointer-events-none" : ""}>
                        <JobCard
                            job={job}
                            confirmedCount={confirmedCounts[job._id] ?? 0}
                            onEdit={(id) => navigate(`/edit-job/${id}`)}
                            onDelete={handleDelete}
                            onViewWorkers={(id) => navigate(`/confirmed-workers/${id}`)}
                        />
                    </div>
                ))}

                {/* ── FAB: Add new job ── */}
                <button
                    onClick={() => navigate("/post-job")}
                    className="fixed bottom-24 right-5 w-14 h-14 bg-[#00598a] hover:bg-[#00598a] text-white rounded-full shadow-lg shadow-[#00598a] flex items-center justify-center transition-all active:scale-95 z-50"
                >
                    <Plus size={24} />
                </button>
            </div>
        </div>
    );
};

export default MyJobsPage;
