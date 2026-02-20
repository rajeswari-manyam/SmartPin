import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkerWithSkills, deleteWorkerSkill } from "../services/api.service";
import {
    MoreVertical, Eye, Edit, Trash2, ImageIcon,
    CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight,
    Briefcase, Plus
} from "lucide-react";
import Button from "../components/ui/Buttons";

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

// ─── Inline toast ────────────────────────────────────────────────────────────
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
        rounded-xl shadow-lg text-sm border max-w-sm w-[calc(100%-2rem)]
        ${type === "success"
                    ? "bg-green-50 border-green-300 text-green-800"
                    : "bg-red-50 border-red-300 text-red-800"}`}
        >
            {type === "success"
                ? <CheckCircle size={16} className="flex-shrink-0 text-green-600" />
                : <AlertCircle size={16} className="flex-shrink-0 text-red-600" />}
            <span className="flex-1">{message}</span>
            <button onClick={onDismiss}><X size={14} className="opacity-60" /></button>
        </div>
    );
};

// ─── Create Profile Modal (Screenshot 2 style) ────────────────────────────────
const CreateProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreateProfile: () => void;
}> = ({ isOpen, onClose, onCreateProfile }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                        Create Worker Profile
                    </h3>
                    <p className="text-gray-600 text-sm mb-6">
                        Please create your worker profile first.
                    </p>
                    
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors uppercase tracking-wide"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onCreateProfile}
                            className="px-4 py-2 text-sm font-semibold text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors uppercase tracking-wide"
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
            <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <ImageIcon size={40} className="text-gray-300" />
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
        <div className="relative w-full h-48 overflow-hidden bg-gray-100 group">
            <img
                src={images[idx]}
                alt={`${altBase} ${idx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-200"
            />

            {images.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60
              text-white rounded-full w-8 h-8 flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <ChevronLeft size={18} />
                    </button>

                    <button
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60
              text-white rounded-full w-8 h-8 flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <ChevronRight size={18} />
                    </button>

                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs
            px-2 py-1 rounded-full font-medium">
                        {idx + 1}/{images.length}
                    </div>

                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                                className={`w-2 h-2 rounded-full transition-all
                  ${i === idx ? "bg-white scale-125" : "bg-white/50"}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

// ─── Skill Card (Screenshot 3 style) ──────────────────────────────────────────
const SkillCard: React.FC<{
    skill: WorkerSkill;
    onEdit: () => void;
    onDelete: () => void;
    onView: () => void;
}> = ({ skill, onEdit, onDelete, onView }) => {
    const allImages = (skill.images || []).filter(img => img && img.trim() !== "");

    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow border border-gray-100 overflow-hidden relative">
            {/* Edit Button - Top Right */}
            <button
                onClick={onEdit}
                className="absolute top-3 right-3 z-10 w-10 h-10 bg-[#f09b13] hover:bg-[#e08d0a] rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
                <Edit size={18} className="text-white" />
            </button>

            {/* Image Carousel */}
            <ImageCarousel images={allImages} altBase={skill.subCategory} />

            {/* Card Body */}
            <div className="p-4">
                {/* Category Badge */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full mb-3">
                    <Edit size={12} className="text-blue-600" />
                    <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                        {skill.category?.[0] || "PET SERVICES"}
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {skill.subCategory}
                </h3>

                {/* Divider */}
                <div className="border-t border-gray-100 my-3"></div>

                {/* Service Rate Row */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Service Rate</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-gray-900">₹{skill.serviceCharge}</span>
                            <span className="text-sm text-[#f09b13] font-medium">/ {skill.chargeType === "hour" ? "hour" : skill.chargeType}</span>
                        </div>
                    </div>
                    
                    {/* Active Status Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full border border-green-100">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-semibold text-green-700">Active</span>
                    </div>
                </div>

                {/* Description if exists */}
                {skill.description && (
                    <div className="flex items-start gap-2 mb-4 text-gray-500">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs text-gray-400">i</span>
                        </div>
                        <p className="text-sm line-clamp-2">{skill.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Empty State (Screenshot 1 style) ─────────────────────────────────────────
const EmptyState: React.FC<{ onAddSkill: () => void }> = ({ onAddSkill }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            {/* Briefcase Icon Circle */}
            <div className="w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <Briefcase size={48} className="text-gray-300" strokeWidth={1.5} />
            </div>

            {/* Text Content */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                No Skills Added Yet
            </h2>
            <p className="text-gray-500 text-center mb-8 max-w-xs leading-relaxed">
                Add your professional skills to attract more customers and grow your business
            </p>

            {/* Orange Add Button */}
            <button
                onClick={onAddSkill}
                className="flex items-center gap-2 px-8 py-4 bg-[#f09b13] hover:bg-[#e08d0a] active:bg-[#d67f0a] text-white font-semibold rounded-full shadow-lg shadow-orange-200 transition-all transform hover:scale-105"
            >
                <Plus size={20} />
                Add Your First Skill
            </button>
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────
const WorkerList: React.FC = () => {
    const navigate = useNavigate();
    const workerId = localStorage.getItem("workerId") || localStorage.getItem("@worker_id");
    const phoneNumber = localStorage.getItem("phoneNumber") || localStorage.getItem("userPhone");

    const [profileExists, setProfileExists] = useState(false);
    const [skills, setSkills] = useState<WorkerSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    useEffect(() => {
        const fetchSkills = async () => {
            // If no workerId, user hasn't created a profile yet
            if (!workerId) {
                setProfileExists(false);
                setLoading(false);
                return;
            }
            
            try {
                const res = await getWorkerWithSkills(workerId);
                if (res?.worker) {
                    setProfileExists(true);
                    setSkills(res?.workerSkills || []);
                } else {
                    setProfileExists(false);
                    setSkills([]);
                }
            } catch (error) {
                console.error("Error fetching skills:", error);
                setProfileExists(false);
                setSkills([]);
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, [workerId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = () => setOpenDropdown(null);
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    const handleAddFirstSkill = () => {
        // Check if profile needs to be created first
        if (!profileExists) {
            setShowCreateModal(true);
        } else {
            navigate("/add-skills");
        }
    };

    const handleCreateProfile = () => {
        setShowCreateModal(false);
        navigate("/worker-profile");
    };

    const handleDelete = async (skillId: string) => {
        if (!window.confirm("Delete this skill?")) return;
        try {
            const res = await deleteWorkerSkill(skillId);
            if (res.success) {
                setSkills(prev => prev.filter(s => s._id !== skillId));
                setToast({ message: "Skill deleted successfully", type: "success" });
            }
        } catch {
            setToast({ message: "Failed to delete skill", type: "error" });
        }
    };

    // ── Loading ──
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-3 border-[#f09b13] border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // ── Empty State (New User) ──
    if (!profileExists && skills.length === 0) {
        return (
            <div className="min-h-screen bg-white">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Skills</h1>
                        <p className="text-sm text-gray-500 mt-0.5">0 skills registered</p>
                    </div>
                    <button 
                        onClick={handleAddFirstSkill}
                        className="w-12 h-12 bg-[#f09b13] hover:bg-[#e08d0a] rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                        <Plus size={24} className="text-white" />
                    </button>
                </div>

                <EmptyState onAddSkill={handleAddFirstSkill} />

                {/* Create Profile Modal */}
                <CreateProfileModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onCreateProfile={handleCreateProfile}
                />

                {toast && (
                    <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
                )}
            </div>
        );
    }

    // ── Skills List View ──
    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Skills</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{skills.length} skill{skills.length !== 1 ? 's' : ''} registered</p>
                    </div>
                    <button 
                        onClick={() => navigate("/add-skills")}
                        className="w-12 h-12 bg-[#f09b13] hover:bg-[#e08d0a] rounded-full flex items-center justify-center shadow-lg transition-colors"
                    >
                        <Plus size={24} className="text-white" />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {toast && (
                    <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {skills.map(skill => (
                        <SkillCard
                            key={skill._id}
                            skill={skill}
                            onEdit={() => navigate(`/edit-skill/${skill._id}`)}
                            onDelete={() => handleDelete(skill._id)}
                            onView={() => navigate(`/worker-details/${skill._id}`)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WorkerList;