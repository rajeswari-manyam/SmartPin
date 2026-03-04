import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkerWithSkills, getWorkerByUserId, deleteWorkerSkill } from "../services/api.service";
import {
    MoreVertical, Edit, Trash2, ImageIcon,
    CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight,
    Briefcase, Plus
} from "lucide-react";
import typography from "../styles/typography";

const BRAND = "#00598a";
const BRAND_DARK = "#004a73";

interface WorkerSkill {
    _id: string;
    category: string[];
    subCategory: string;
    skill: string;
    serviceCharge: number;
    chargeType: "hour" | "day" | "fixed";
    profilePic?: string;
    images?: string[];
    description?: string;
}

// ─── Inline toast ─────────────────────────────────────────────────────────────
type ToastType = "success" | "error";
const Toast: React.FC<{ message: string; type: ToastType; onDismiss: () => void }> = ({
    message, type, onDismiss,
}) => {
    useEffect(() => {
        const t = setTimeout(onDismiss, 3000);
        return () => clearTimeout(t);
    }, [onDismiss]);
    return (
        <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3
        rounded-xl shadow-lg border max-w-sm w-[calc(100%-2rem)]
        ${type === "success"
                    ? "bg-green-50 border-green-300 text-green-800"
                    : "bg-red-50 border-red-300 text-red-800"}`}
        >
            {type === "success"
                ? <CheckCircle size={18} className="flex-shrink-0 text-green-600" />
                : <AlertCircle size={18} className="flex-shrink-0 text-red-600" />}
            <span className={`flex-1 ${typography.body.xs}`}>{message}</span>
            <button onClick={onDismiss}><X size={16} className="opacity-60" /></button>
        </div>
    );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal: React.FC<{
    isOpen: boolean;
    skillName: string;
    onCancel: () => void;
    onConfirm: () => void;
    loading?: boolean;
}> = ({ isOpen, skillName, onCancel, onConfirm, loading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="flex flex-col items-center pt-7 pb-4 px-6">
                    <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
                        <Trash2 size={26} className="text-red-500" />
                    </div>
                    <h3 className={`${typography.heading.h6} text-gray-900 mb-2 text-center`}>
                        Delete Skill?
                    </h3>
                    <p className={`${typography.body.xs} text-gray-500 text-center leading-relaxed`}>
                        Are you sure you want to delete{" "}
                        <span className="font-semibold text-gray-700">"{skillName}"</span>?
                        This action cannot be undone.
                    </p>
                </div>
                <div className="border-t border-gray-100" />
                <div className="flex">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className={`flex-1 py-4 ${typography.body.small} font-semibold text-gray-500
                            hover:bg-gray-50 transition-colors border-r border-gray-100 disabled:opacity-50`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`flex-1 py-4 ${typography.body.small} font-semibold text-red-600
                            hover:bg-red-50 transition-colors disabled:opacity-50`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Deleting...
                            </span>
                        ) : "Delete"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Create Profile Modal ─────────────────────────────────────────────────────
const CreateProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreateProfile: () => void;
}> = ({ isOpen, onClose, onCreateProfile }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                <div className="p-6">
                    <h3 className={`${typography.heading.h6} text-gray-900 mb-2`}>
                        Create Worker Profile
                    </h3>
                    <p className={`${typography.body.xs} text-gray-600 mb-6`}>
                        Please create your worker profile first.
                    </p>
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className={`px-4 py-2 ${typography.body.xs} font-semibold rounded-lg transition-colors uppercase tracking-wide`}
                            style={{ color: BRAND }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onCreateProfile}
                            className={`px-4 py-2 ${typography.body.xs} font-semibold rounded-lg transition-colors uppercase tracking-wide`}
                            style={{ color: BRAND }}
                        >
                            Create Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Per-card image carousel ──────────────────────────────────────────────────
const ImageCarousel: React.FC<{ images: string[]; altBase: string }> = ({ images, altBase }) => {
    const [idx, setIdx] = useState(0);

    if (images.length === 0) {
        return (
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                <ImageIcon size={40} className="text-gray-300" />
            </div>
        );
    }

    const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
    const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };

    return (
        <div className="relative w-full h-48 overflow-hidden bg-gray-100 group flex-shrink-0">
            <img
                src={images[idx]}
                alt={`${altBase} ${idx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-200"
            />
            {images.length > 1 && (
                <>
                    <button onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <ChevronRight size={18} />
                    </button>
                    <div className={`absolute bottom-2 right-2 bg-black/50 text-white ${typography.body.xs} px-2 py-1 rounded-full font-medium`}>
                        {idx + 1}/{images.length}
                    </div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button key={i} onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                                className={`w-2 h-2 rounded-full transition-all ${i === idx ? "bg-white scale-125" : "bg-white/50"}`} />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// ─── 3-Dot Dropdown Menu ──────────────────────────────────────────────────────
const CardDropdown: React.FC<{
    isOpen: boolean;
    onToggle: (e: React.MouseEvent) => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}> = ({ isOpen, onToggle, onEdit, onDelete }) => {
    const ref = useRef<HTMLDivElement>(null);

    return (
        <div ref={ref} className="relative" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={onToggle}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 shadow-md"
                style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,89,138,0.85)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0,0,0,0.45)"}
            >
                <MoreVertical size={17} className="text-white" />
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 top-11 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
                    style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.14)" }}
                >
                    <button
                        onClick={onEdit}
                        className={`w-full flex items-center gap-3 px-4 py-3 ${typography.body.xs} font-semibold text-gray-700
                            hover:bg-blue-50 hover:text-[#00598a] transition-colors`}
                    >
                        <Edit size={15} className="text-[#00598a]" />
                        Edit Skill
                    </button>
                    <div className="border-t border-gray-100" />
                    <button
                        onClick={onDelete}
                        className={`w-full flex items-center gap-3 px-4 py-3 ${typography.body.xs} font-semibold text-red-600
                            hover:bg-red-50 transition-colors`}
                    >
                        <Trash2 size={15} className="text-red-500" />
                        Delete Skill
                    </button>
                </div>
            )}
        </div>
    );
};

// ─── Skill Card ───────────────────────────────────────────────────────────────
const SkillCard: React.FC<{
    skill: WorkerSkill;
    dropdownOpen: boolean;
    onToggleDropdown: (id: string | null) => void;
    onEdit: () => void;
    onDelete: () => void;
}> = ({ skill, dropdownOpen, onToggleDropdown, onEdit, onDelete }) => {
    const [isHovered, setIsHovered] = useState(false);
    const allImages = (skill.images || []).filter(img => img && img.trim() !== "");
    const skillDescription = skill.skill && skill.skill !== "General" ? skill.skill : (skill.description || "");

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleDropdown(dropdownOpen ? null : skill._id);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleDropdown(null);
        onEdit();
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleDropdown(null);
        onDelete();
    };

    return (
        <div
            className="bg-white rounded-2xl shadow-md overflow-hidden relative transition-all duration-200 flex flex-col"
            style={{
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: isHovered ? BRAND : "#f3f4f6",
                boxShadow: isHovered ? `0 8px 24px rgba(0,89,138,0.15)` : "0 2px 8px rgba(0,0,0,0.06)",
                transform: isHovered ? "translateY(-2px)" : "none",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 3-dot menu */}
            <div className="absolute top-3 right-3 z-10">
                <CardDropdown
                    isOpen={dropdownOpen}
                    onToggle={handleToggle}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* Image Carousel */}
            <ImageCarousel images={allImages} altBase={skill.subCategory} />

            {/* Card Body */}
            <div className="p-4 flex flex-col min-w-0">

                {/* Category Badge */}
                <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 transition-colors duration-200 self-start flex-shrink-0"
                    style={{ backgroundColor: isHovered ? "rgba(0,89,138,0.1)" : "#eff6ff" }}
                >
                    <span
                        className={`${typography.misc.badge} uppercase tracking-wider`}
                        style={{ color: isHovered ? BRAND : "#1d4ed8" }}
                    >
                        {skill.category?.[0] || "SKILL"}
                    </span>
                </div>

                {/* Subcategory Title */}
                <h3
                    className="font-bold text-lg mb-3 transition-colors duration-200 truncate flex-shrink-0"
                    style={{ color: isHovered ? BRAND : "#111827" }}
                >
                    {skill.subCategory}
                </h3>

                {/* Skill Description */}
                {skillDescription && (
                    <p
                        className={`${typography.body.xs} text-gray-500 mb-3 flex-shrink-0`}
                        style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            whiteSpace: "normal",
                        }}
                    >
                        {skillDescription}
                    </p>
                )}

                {/* Divider */}
                <div
                    className="border-t my-3 transition-colors duration-200 flex-shrink-0"
                    style={{ borderColor: isHovered ? "rgba(0,89,138,0.15)" : "#f3f4f6" }}
                />

                {/* Service Rate Row */}
                <div className="flex items-center justify-between flex-shrink-0">
                    <div>
                        <p className={`${typography.body.xs} text-gray-400 uppercase tracking-wider mb-1`}>
                            Service Rate
                        </p>
                        <div className="flex items-baseline gap-1">
                            <span className={`${typography.heading.h5} text-gray-900`}>
                                ₹{skill.serviceCharge}
                            </span>
                            <span className={`${typography.body.xs} font-medium`} style={{ color: BRAND }}>
                                / {skill.chargeType === "hour" ? "hour" : skill.chargeType}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100 flex-shrink-0">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                        <span className={`${typography.body.xs} font-semibold text-green-700`}>Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyState: React.FC<{ onAddSkill: () => void }> = ({ onAddSkill }) => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center mb-6">
            <Briefcase size={48} className="text-gray-300" strokeWidth={1.5} />
        </div>
        <h2 className={`${typography.heading.h5} text-gray-900 mb-3 text-center`}>No Skills Added Yet</h2>
        <p className={`${typography.body.small} text-gray-500 text-center mb-8 max-w-xs leading-relaxed`}>
            Add your professional skills to attract more customers and grow your business
        </p>
        <button
            onClick={onAddSkill}
            className={`flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-full shadow-lg transition-all transform hover:scale-105 ${typography.body.small}`}
            style={{ backgroundColor: BRAND }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND}
        >
            <Plus size={22} />
            Add Your First Skill
        </button>
    </div>
);

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonCard: React.FC = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse">
        <div className="w-full h-48 bg-gray-200" />
        <div className="p-4 space-y-3">
            <div className="h-6 w-24 bg-gray-200 rounded-full" />
            <div className="h-5 w-3/4 bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-100 rounded" />
            <div className="h-4 w-2/3 bg-gray-100 rounded" />
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <div className="h-6 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-20 bg-gray-100 rounded-full" />
            </div>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const WorkerList: React.FC = () => {
    const navigate = useNavigate();

    const [resolvedWorkerId, setResolvedWorkerId] = useState<string | null>(null);
    const [profileExists, setProfileExists] = useState(false);
    const [skills, setSkills] = useState<WorkerSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const [deleteModal, setDeleteModal] = useState<{
        open: boolean; skillId: string; skillName: string; loading: boolean;
    }>({ open: false, skillId: "", skillName: "", loading: false });

    /* ── Step 1: Resolve workerId ── */
    useEffect(() => {
        const resolveWorkerId = async () => {
            // 1️⃣ Direct hit — already stored
            const direct = localStorage.getItem("workerId");
            if (direct) { setResolvedWorkerId(direct); return; }

            // 2️⃣ Keyed by userId — stored during previous session
            const userId = localStorage.getItem("userId");
            if (userId) {
                const keyed = localStorage.getItem(`worker_id_for_${userId}`);
                if (keyed) { setResolvedWorkerId(keyed); return; }

                // 3️⃣ Fallback — fetch from API using userId
                try {
                    const res = await getWorkerByUserId(userId);
                    const id = res?.worker?._id;
                    if (id) {
                        // Persist so next time it's instant
                        localStorage.setItem("workerId", id);
                        localStorage.setItem(`worker_id_for_${userId}`, id);
                        setResolvedWorkerId(id);
                        return;
                    }
                } catch { /* no profile yet */ }
            }

            // 4️⃣ Legacy key
            const legacy = localStorage.getItem("@worker_id");
            if (legacy) { setResolvedWorkerId(legacy); return; }

            setResolvedWorkerId(null);
        };

        resolveWorkerId();
    }, []);

    /* ── Step 2: Fetch skills once workerId is known ── */
    useEffect(() => {
        if (resolvedWorkerId === null && !loading) return; // still resolving, wait
        if (resolvedWorkerId === undefined) return;

        const fetchSkills = async () => {
            if (!resolvedWorkerId) {
                setProfileExists(false);
                setLoading(false);
                return;
            }
            try {
                const res = await getWorkerWithSkills(resolvedWorkerId);
                if (res?.worker) {
                    setProfileExists(true);
                    setSkills(res.workerSkills || []);
                } else {
                    setProfileExists(false);
                    setSkills([]);
                }
            } catch {
                setProfileExists(false);
                setSkills([]);
            } finally {
                setLoading(false);
            }
        };

        if (resolvedWorkerId !== null) {
            fetchSkills();
        } else {
            // resolvedWorkerId resolved to null (no profile)
            setProfileExists(false);
            setLoading(false);
        }
    }, [resolvedWorkerId]);

    /* ── Close dropdown on outside click ── */
    useEffect(() => {
        const handler = () => setOpenDropdown(null);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    const handleAddFirstSkill = () => {
        if (!profileExists) setShowCreateModal(true);
        else navigate("/add-skills");
    };

    const requestDelete = (skill: WorkerSkill) => {
        setDeleteModal({ open: true, skillId: skill._id, skillName: skill.subCategory, loading: false });
    };

    const confirmDelete = async () => {
        setDeleteModal(d => ({ ...d, loading: true }));
        try {
            const res = await deleteWorkerSkill(deleteModal.skillId);
            if (res.success) {
                setSkills(prev => prev.filter(s => s._id !== deleteModal.skillId));
                setToast({ message: "Skill deleted successfully", type: "success" });
            } else {
                setToast({ message: "Failed to delete skill", type: "error" });
            }
        } catch {
            setToast({ message: "Failed to delete skill", type: "error" });
        } finally {
            setDeleteModal({ open: false, skillId: "", skillName: "", loading: false });
        }
    };

    /* ── Loading ── */
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 pb-20">
                <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4">
                    <div className="flex items-center justify-between max-w-7xl mx-auto">
                        <div>
                            <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse mt-1.5" />
                        </div>
                        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    /* ── No profile / no skills ── */
    if (!profileExists) {
        return (
            <div className="min-h-screen bg-white">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                    <div>
                        <h1 className={`${typography.heading.h5} text-gray-900`}>My Skills</h1>
                        <p className={`${typography.body.xs} text-gray-500 mt-0.5`}>0 skills registered</p>
                    </div>
                    <button
                        onClick={handleAddFirstSkill}
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
                        style={{ backgroundColor: BRAND }}
                    >
                        <Plus size={24} className="text-white" />
                    </button>
                </div>
                <EmptyState onAddSkill={handleAddFirstSkill} />
                <CreateProfileModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreateProfile={() => { setShowCreateModal(false); navigate("/worker-profile"); }}
                />
                {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
            </div>
        );
    }

    /* ── Skills list ── */
    return (
        <div className="min-h-screen bg-gray-50 pb-20">

            {/* Sticky Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className={`${typography.heading.h5} text-gray-900`}>My Skills</h1>
                        <p className={`${typography.body.xs} text-gray-500 mt-0.5`}>
                            {skills.length} skill{skills.length !== 1 ? "s" : ""} registered
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/add-skills")}
                        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
                        style={{ backgroundColor: BRAND }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND}
                    >
                        <Plus size={24} className="text-white" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {skills.length === 0 ? (
                    <EmptyState onAddSkill={() => navigate("/add-skills")} />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skills.map(skill => (
                            <SkillCard
                                key={skill._id}
                                skill={skill}
                                dropdownOpen={openDropdown === skill._id}
                                onToggleDropdown={setOpenDropdown}
                                onEdit={() => navigate(`/edit-skill/${skill._id}`)}
                                onDelete={() => requestDelete(skill)}
                            />
                        ))}
                    </div>
                )}
            </div>

            <DeleteConfirmModal
                isOpen={deleteModal.open}
                skillName={deleteModal.skillName}
                onCancel={() => setDeleteModal(d => ({ ...d, open: false }))}
                onConfirm={confirmDelete}
                loading={deleteModal.loading}
            />

            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </div>
    );
};

export default WorkerList;