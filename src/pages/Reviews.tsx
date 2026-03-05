import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import {
    getReviews,
    addReview,
    updateReview,
    deleteReview,
    ReviewData,
    API_BASE_URL,
} from "../services/api.service";

import RatingSummary from "../components/Reviews/RatingSummary";
import UserReviewCard from "../components/Reviews/UserReviewCard";
import ReviewForm from "../components/Reviews/ReviewForm";
import ReviewCard from "../components/Reviews/ReviewsCard";

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

    // ── Resolve worker ID ────────────────────────────────────────────────────
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

    // ── Fetch reviews ────────────────────────────────────────────────────────
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

    // ── Derived ──────────────────────────────────────────────────────────────
    const userReview = reviews.find(r => typeof r.user === "object" && r.user?._id === userId);
    const otherReviews = reviews.filter(r => !(typeof r.user === "object" && r.user?._id === userId));

    // ── Actions ──────────────────────────────────────────────────────────────
    const handleAddReview = async () => {
        if (!actualWorkerId || !userId || !reviewText.trim()) { alert("Please write a review"); return; }
        try {
            await addReview(userId, actualWorkerId, rating, reviewText);
            setReviewText(""); setRating(3); setShowForm(false);
            navigate(-1); // ← navigate back to job applicant page after submitting
        } catch (e: any) { alert(e?.message || "Failed"); }
    };

    const handleUpdateReview = async () => {
        if (!editReviewId) return;
        try {
            await updateReview(editReviewId, rating, reviewText);
            setIsEditing(false); setEditReviewId(null); setReviewText(""); setRating(3);
            navigate(-1); // ← navigate back to job applicant page after updating
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

    // ── Loading ──────────────────────────────────────────────────────────────
    if (resolving) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#00598a" }} />
                <p className="text-base text-gray-500">Loading…</p>
            </div>
        </div>
    );

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <div className="bg-white sticky top-0 z-10 px-4 py-3.5 flex items-center gap-3 shadow-sm">
                <button
                    onClick={() => navigate(-1)}
                    className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition active:scale-95"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div className="flex-1 text-center">
                    <h1 className="text-xl font-bold text-gray-900">Reviews</h1>
                    <p className="text-sm text-gray-400 mt-0.5">
                        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </p>
                </div>
                <div className="w-11" />
            </div>

            {/* Content */}
            <div className="w-full max-w-xl mx-auto px-4 pt-4 pb-24 space-y-4">

                {/* Rating summary */}
                <RatingSummary reviews={reviews} />

                {/* Your review (display) */}
                {userReview && !isEditing && (
                    <UserReviewCard
                        review={userReview}
                        userName={(user as any)?.name || ""}
                        onEdit={startEdit}
                        onDelete={handleDeleteReview}
                    />
                )}

                {/* Write / Edit form */}
                {(isEditing || (!userReview && showForm)) && (
                    <ReviewForm
                        rating={rating}
                        reviewText={reviewText}
                        isEditing={isEditing}
                        onRating={setRating}
                        onText={setReviewText}
                        onSubmit={isEditing ? handleUpdateReview : handleAddReview}
                        onCancel={isEditing ? cancelEdit : () => setShowForm(false)}
                    />
                )}

                {/* Write Review CTA */}
                {!userReview && !showForm && !isEditing && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="w-full text-white text-base font-bold py-4 rounded-2xl transition shadow-sm active:scale-95"
                        style={{ backgroundColor: "#00598a" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#004a75")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#00598a")}
                    >
                        ✍️ Write a Review
                    </button>
                )}

                {/* All reviews */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-9 h-9 animate-spin" style={{ color: "#00598a" }} />
                    </div>
                ) : (
                    <>
                        {otherReviews.length > 0 && (
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 px-1">
                                    All Reviews ({otherReviews.length})
                                </p>
                                <div className="space-y-3">
                                    {otherReviews.map(review => (
                                        <ReviewCard key={review._id} review={review} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {reviews.length === 0 && (
                            <div className="text-center py-20">
                                <div className="text-6xl mb-4">⭐</div>
                                <p className="text-lg font-semibold text-gray-600 mb-1">No reviews yet</p>
                                <p className="text-base text-gray-400">Be the first to review this worker!</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Reviews;