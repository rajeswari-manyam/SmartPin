import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
    getReviews,
    addReview,
    updateReview,
    deleteReview,
    ReviewData,
    API_BASE_URL,
} from "../services/api.service";
import { Star, ChevronLeft, Loader2, Pencil, Trash2 } from "lucide-react";
import typography from "../styles/typography";

/* ─── helpers ─────────────────────────────────────── */

const avatarColor = (name: string) => {
    const colors = ["#00598a", "#2e7d32", "#c62828", "#6a1b9a", "#00695c", "#e65100", "#283593", "#558b2f"];
    let h = 0;
    for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
    return colors[Math.abs(h) % colors.length];
};

const Stars = ({
    value, size = "md", onClick,
}: {
    value: number; size?: "sm" | "md" | "lg"; onClick?: (v: number) => void;
}) => {
    const sz = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-7 h-7" }[size];
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    onClick={() => onClick?.(s)}
                    className={`${sz} ${onClick ? "cursor-pointer active:scale-110" : ""} transition-all ${s <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-100"}`}
                />
            ))}
        </div>
    );
};

const RatingBadge = ({ value }: { value: number }) => (
    <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-xs font-bold px-2 py-0.5 rounded-full">
        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
        {value.toFixed(1)}
    </span>
);

const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

/* ─── main component ──────────────────────────────── */

const Reviews: React.FC = () => {
    const { workerId: workerParamId } = useParams<{ workerId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const userId = user?._id || "";

    const [actualWorkerId, setActualWorkerId] = useState("");
    const [resolving, setResolving] = useState(true);
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(false);

    const [rating, setRating] = useState(3);
    const [reviewText, setReviewText] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editReviewId, setEditReviewId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);

    /* ── resolve worker id ── */
    useEffect(() => {
        const resolve = async () => {
            if (!workerParamId) { setResolving(false); return; }
            setResolving(true);
            try {
                const r = await fetch(`${API_BASE_URL}/getWorkerById/${workerParamId}`);
                const j = await r.json();
                if (j.success && j.data?._id) { setActualWorkerId(j.data._id); setResolving(false); return; }
            } catch { }
            try {
                const r = await fetch(`${API_BASE_URL}/getWorkerByUserId/${workerParamId}`);
                const j = await r.json();
                const w = j?.worker || j?.data || j;
                if (w?._id) { setActualWorkerId(w._id); setResolving(false); return; }
            } catch { }
            setActualWorkerId(workerParamId);
            setResolving(false);
        };
        resolve();
    }, [workerParamId]);

    /* ── fetch reviews ── */
    const fetchReviews = async () => {
        if (!actualWorkerId) return;
        try {
            setLoading(true);
            const res = await getReviews(actualWorkerId);
            setReviews(res.data || []);
        } catch { setReviews([]); }
        finally { setLoading(false); }
    };
    useEffect(() => { if (actualWorkerId) fetchReviews(); }, [actualWorkerId]);

    /* ── derived ── */
    const userReview = reviews.find(r => typeof r.user === "object" && r.user?._id === userId);
    const otherReviews = reviews.filter(r => !(typeof r.user === "object" && r.user?._id === userId));

    const avg = reviews.length
        ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const breakdown = [5, 4, 3, 2, 1].map(n => ({
        star: n,
        count: reviews.filter(r => r.rating === n).length,
    }));
    const maxCount = Math.max(...breakdown.map(b => b.count), 1);

    /* ── actions ── */
    const handleAddReview = async () => {
        if (!actualWorkerId || !userId || !reviewText.trim()) { alert("Please write a review"); return; }
        try {
            await addReview(userId, actualWorkerId, rating, reviewText);
            setReviewText(""); setRating(3); setShowForm(false);
            fetchReviews();
        } catch (e: any) { alert(e?.message || "Failed"); }
    };

    const handleUpdateReview = async () => {
        if (!editReviewId) return;
        try {
            await updateReview(editReviewId, rating, reviewText);
            setIsEditing(false); setEditReviewId(null); setReviewText(""); setRating(3);
            fetchReviews();
        } catch (e: any) { alert(e?.message || "Failed"); }
    };

    const handleDeleteReview = async (id: string) => {
        if (!window.confirm("Delete this review?")) return;
        try { await deleteReview(id); fetchReviews(); }
        catch (e: any) { alert(e?.message || "Failed"); }
    };

    const startEdit = (r: ReviewData) => {
        setIsEditing(true); setEditReviewId(r._id);
        setRating(r.rating); setReviewText(r.review);
        setShowForm(true);
    };

    const cancelEdit = () => {
        setIsEditing(false); setEditReviewId(null);
        setReviewText(""); setRating(3); setShowForm(false);
    };

    /* ── loading ── */
    if (resolving) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#00598a" }} />
                <p className={`${typography.body.xs} text-gray-500`}>Loading…</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">

            {/* ── Header ── */}
            <div className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <div className="flex-1 text-center">
                    <h1 className={`${typography.heading.h6} text-gray-900`}>Reviews</h1>
                    <p className={`${typography.misc.caption}`}>{reviews.length} review{reviews.length !== 1 ? "s" : ""}</p>
                </div>
                <div className="w-9" />
            </div>

            <div className="max-w-lg mx-auto px-4 pt-4 pb-10 space-y-4">

                {/* ── Rating Summary Card ── */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* big number */}
                        <div className="flex flex-col items-center min-w-[80px] sm:min-w-[90px]">
                            <span
                                className="text-5xl sm:text-6xl font-black leading-none"
                                style={{ color: "#00598a" }}
                            >
                                {avg.toFixed(1)}
                            </span>
                            <div className="mt-2">
                                <Stars value={Math.round(avg)} size="sm" />
                            </div>
                            <p className={`${typography.misc.caption} mt-1 text-center`}>{reviews.length} reviews</p>
                        </div>

                        {/* divider */}
                        <div className="w-px h-20 bg-gray-100 flex-shrink-0" />

                        {/* breakdown bars */}
                        <div className="flex-1 space-y-1.5">
                            {breakdown.map(({ star, count }) => (
                                <div key={star} className="flex items-center gap-2">
                                    <span className={`${typography.fontSize.xs} text-gray-500 w-3 text-right`}>{star}</span>
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${(count / maxCount) * 100}%`,
                                                backgroundColor: "#00598a",
                                            }}
                                        />
                                    </div>
                                    <span className={`${typography.fontSize.xs} text-gray-500 w-3`}>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Your Review (display) ── */}
                {userReview && !isEditing && (
                    <div>
                        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: "#00598a" }}
                                >
                                    <span className="text-white text-[10px] font-bold">
                                        {(user as any)?.name?.[0]?.toUpperCase() || "Y"}
                                    </span>
                                </div>
                                <span
                                    className={`${typography.body.xs} font-bold`}
                                    style={{ color: "#00598a" }}
                                >
                                    Your Review
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => startEdit(userReview)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition ${typography.fontSize.xs} font-semibold text-gray-700 active:scale-95`}
                                >
                                    <Pencil className="w-3 h-3" /> Edit
                                </button>
                                <button
                                    onClick={() => handleDeleteReview(userReview._id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 hover:bg-red-100 transition ${typography.fontSize.xs} font-semibold text-red-600 active:scale-95`}
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <Stars value={userReview.rating} size="sm" />
                                    <RatingBadge value={userReview.rating} />
                                </div>
                                <span className={`${typography.misc.caption}`}>{fmtDate(userReview.createdAt)}</span>
                            </div>
                            <p className={`${typography.body.xs} text-gray-700 leading-relaxed`}>{userReview.review}</p>
                        </div>
                    </div>
                )}

                {/* ── Write / Edit Form ── */}
                {(isEditing || (!userReview && showForm)) && (
                    <div className="bg-white rounded-2xl p-5 shadow-sm">
                        <h3 className={`${typography.body.xs} font-bold text-gray-900 mb-4`}>
                            {isEditing ? "Edit Your Review" : "Write a Review"}
                        </h3>

                        <div className="mb-4">
                            <Stars value={rating} size="lg" onClick={setRating} />
                        </div>

                        <textarea
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                            rows={4}
                            placeholder="Share your experience with this worker..."
                            className={`w-full ${typography.body.xs} border border-gray-200 rounded-xl p-3 resize-none focus:outline-none focus:ring-2 bg-gray-50 transition`}
                            style={{ "--tw-ring-color": "#00598a" } as React.CSSProperties}
                            onFocus={e => e.target.style.borderColor = "#00598a"}
                            onBlur={e => e.target.style.borderColor = ""}
                        />

                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={isEditing ? handleUpdateReview : handleAddReview}
                                className={`flex-1 text-white ${typography.body.xs} font-bold py-3 rounded-xl transition active:scale-95 shadow-sm`}
                                style={{ backgroundColor: "#00598a" }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#004a75")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#00598a")}
                            >
                                {isEditing ? "Update Review" : "Submit Review"}
                            </button>
                            <button
                                onClick={isEditing ? cancelEdit : () => setShowForm(false)}
                                className={`px-5 border border-gray-200 rounded-xl ${typography.body.xs} text-gray-600 hover:bg-gray-50 transition active:scale-95`}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Write Review CTA ── */}
                {!userReview && !showForm && !isEditing && (
                    <button
                        onClick={() => setShowForm(true)}
                        className={`w-full text-white ${typography.body.xs} font-bold py-3.5 rounded-2xl transition shadow-sm active:scale-95`}
                        style={{ backgroundColor: "#00598a" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#004a75")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#00598a")}
                    >
                        ✍️ Write a Review
                    </button>
                )}

                {/* ── All Reviews ── */}
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#00598a" }} />
                    </div>
                ) : (
                    <>
                        {otherReviews.length > 0 && (
                            <div>
                                <p className={`${typography.misc.caption} font-bold uppercase tracking-widest mb-3`}>
                                    All Reviews ({otherReviews.length})
                                </p>
                                <div className="space-y-3">
                                    {otherReviews.map(review => {
                                        const name = typeof review.user === "object"
                                            ? review.user?.name || "Anonymous"
                                            : "Anonymous";
                                        const initial = name[0]?.toUpperCase();
                                        const color = avatarColor(name);
                                        return (
                                            <div key={review._id} className="bg-white rounded-2xl p-4 shadow-sm">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div
                                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-sm"
                                                        style={{ backgroundColor: color }}
                                                    >
                                                        {initial}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between flex-wrap gap-1">
                                                            <p className={`${typography.body.xs} font-semibold text-gray-900 truncate`}>{name}</p>
                                                            <span className={`${typography.misc.caption} flex-shrink-0`}>{fmtDate(review.createdAt)}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Stars value={review.rating} size="sm" />
                                                            <RatingBadge value={review.rating} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className={`${typography.body.xs} text-gray-700 leading-relaxed`}>{review.review}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* empty state */}
                        {reviews.length === 0 && (
                            <div className="text-center py-16">
                                <div className="text-5xl mb-4">⭐</div>
                                <p className={`${typography.body.xs} font-semibold text-gray-600`}>No reviews yet</p>
                                <p className={`${typography.misc.caption} mt-1`}>Be the first to review this worker!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Reviews;