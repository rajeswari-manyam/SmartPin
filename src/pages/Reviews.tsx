import React, { useState, useEffect, useCallback } from "react";
import {
    addReview,
    getReviews,
    getWorkerAverageRating,
    deleteReview,
    ReviewData,
    AverageRatingData,
    RatingBreakdown,
} from "../services/Review.service";

// ─── Screen Props ─────────────────────────────────────────────────────────────
interface ReviewScreenProps {
    workerId: string;
    userId: string;
}

const TAGS = ["All", "5 Stars", "4 Stars", "3 Stars & Below"] as const;
type Tag = (typeof TAGS)[number];

const SORT_OPTIONS = ["Most Recent", "Highest Rated"] as const;
type SortOption = (typeof SORT_OPTIONS)[number];

const JOB_TYPES = [
    "Electrical Repair",
    "AC Installation",
    "Wiring & Switchboard",
    "Fan Installation",
    "Short Circuit Fix",
    "Other",
];

const AVATAR_COLORS = [
    "from-cyan-500 to-blue-600",
    "from-violet-500 to-purple-700",
    "from-rose-400 to-pink-600",
    "from-amber-400 to-orange-500",
    "from-emerald-400 to-teal-600",
    "from-indigo-400 to-blue-700",
    "from-fuchsia-400 to-pink-700",
    "from-lime-400 to-green-600",
];

const colorFor = (id: string): string => {
    const str = id || "x";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash += str.charCodeAt(i);
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const initialsFor = (name = ""): string =>
    name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? "")
        .join("");

// ─── Star Component ───────────────────────────────────────────────────────────
interface StarsProps {
    rating: number;
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onRate?: (r: number) => void;
}

const Stars: React.FC<StarsProps> = ({
    rating,
    size = "md",
    interactive = false,
    onRate,
}) => {
    const [hovered, setHovered] = useState(0);
    const sizeClass =
        size === "sm" ? "text-sm" : size === "lg" ? "text-3xl" : "text-lg";

    return (
        <div className={`flex gap-0.5 ${sizeClass}`}>
            {[1, 2, 3, 4, 5].map((s) => {
                const filled =
                    s <= (interactive ? hovered || Math.round(rating) : Math.round(rating));
                return (
                    <span
                        key={s}
                        className={`transition-all duration-150 ${filled ? "text-amber-400" : "text-gray-200"
                            } ${interactive ? "cursor-pointer hover:scale-125" : ""}`}
                        onMouseEnter={() => interactive && setHovered(s)}
                        onMouseLeave={() => interactive && setHovered(0)}
                        onClick={() => interactive && onRate?.(s)}
                    >
                        ★
                    </span>
                );
            })}
        </div>
    );
};

// ─── Review Card ──────────────────────────────────────────────────────────────
interface ReviewCardProps {
    review: ReviewData;
    index: number;
    onDelete: (id: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, index, onDelete }) => {
    const [liked, setLiked] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const authorName = review.user?.name ?? "Anonymous";
    const avatarColor = colorFor(review.user?._id ?? review._id);
    const initials = initialsFor(authorName);
    const dateStr = review.createdAt
        ? new Date(review.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "";

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await deleteReview(review._id);
            onDelete(review._id);
        } catch (e) {
            console.error(e);
            setDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <div
            className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            style={{ animationDelay: `${index * 60}ms` }}
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                    <div
                        className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm`}
                    >
                        {initials}
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 text-sm">
                                {authorName}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <Stars rating={review.rating} size="sm" />
                            <span className="text-xs text-gray-400">{dateStr}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review text */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {review.review}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <button
                    onClick={() => setLiked((l) => !l)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${liked
                            ? "bg-[#00598a] text-white"
                            : "bg-gray-100 text-gray-500 hover:bg-[#e8f4fb] hover:text-[#00598a]"
                        }`}
                >
                    👍 Helpful
                </button>

                {!showConfirm ? (
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                        Delete
                    </button>
                ) : (
                    <div className="flex gap-2 items-center">
                        <span className="text-xs text-gray-500">Sure?</span>
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="text-xs font-semibold text-white bg-red-500 px-2 py-1 rounded-lg hover:bg-red-600 disabled:opacity-50"
                        >
                            {deleting ? "…" : "Yes"}
                        </button>
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                        >
                            No
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Write Review Modal ───────────────────────────────────────────────────────
interface WriteReviewModalProps {
    onClose: () => void;
    onSubmitted: (review: ReviewData) => void;
    userId: string;
    workerId: string;
}

const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
    onClose,
    onSubmitted,
    userId,
    workerId,
}) => {
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    const [jobType, setJobType] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (rating === 0 || text.trim().length < 10) return;
        setSubmitting(true);
        setError("");
        try {
            const result = await addReview({
                userId: userId,
                workerId: workerId,
                rating,
                review: text.trim(),
            });
            if (result.success) {
                setSubmitted(true);
                onSubmitted(result.data);
                setTimeout(onClose, 1800);
            } else {
                setError(result.message ?? "Something went wrong.");
            }
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Network error.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#00598a] to-[#003a5c] px-6 py-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3
                                className="text-white font-bold text-lg"
                                style={{ fontFamily: "Georgia, serif" }}
                            >
                                Write a Review
                            </h3>
                            <p className="text-white/70 text-sm">
                                Share your experience with this worker
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {submitted ? (
                    <div className="p-10 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h4
                            className="text-xl font-bold text-gray-900 mb-2"
                            style={{ fontFamily: "Georgia, serif" }}
                        >
                            Thank you!
                        </h4>
                        <p className="text-gray-500 text-sm">
                            Your review has been submitted.
                        </p>
                    </div>
                ) : (
                    <div className="p-6 space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        {/* Star Rating */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                Overall Rating <span className="text-red-400">*</span>
                            </label>
                            <div className="flex items-center gap-3">
                                <Stars
                                    rating={rating}
                                    size="lg"
                                    interactive
                                    onRate={setRating}
                                />
                                {rating > 0 && (
                                    <span className="text-sm font-semibold text-[#00598a]">
                                        {["", "Poor", "Fair", "Good", "Great", "Excellent!"][rating]}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Job Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Job Type
                            </label>
                            <select
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#00598a] focus:ring-2 focus:ring-[#00598a]/10 transition-all"
                            >
                                <option value="">Select job type…</option>
                                {JOB_TYPES.map((t) => (
                                    <option key={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Review Text */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Your Review <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                rows={4}
                                value={text}
                                onChange={(e) => setText(e.target.value.slice(0, 500))}
                                placeholder="Describe your experience — quality, punctuality, professionalism…"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#00598a] focus:ring-2 focus:ring-[#00598a]/10 transition-all resize-none"
                            />
                            <div className="text-right text-xs text-gray-400 mt-1">
                                {text.length} / 500
                            </div>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || text.trim().length < 10 || submitting}
                            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 ${rating > 0 && text.trim().length >= 10 && !submitting
                                    ? "bg-gradient-to-r from-[#00598a] to-[#003a5c] text-white shadow-lg shadow-[#00598a]/25 hover:brightness-110 active:scale-[0.98]"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                }`}
                        >
                            {submitting ? "Submitting…" : "Submit Review"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Rating Summary Card ──────────────────────────────────────────────────────
interface RatingSummaryProps {
    avgRating: string;
    totalReviews: number;
    breakdown: RatingBreakdown;
}

const RatingSummary: React.FC<RatingSummaryProps> = ({
    avgRating,
    totalReviews,
    breakdown,
}) => (
    <div className="bg-white rounded-2xl p-5 shadow-xl absolute -bottom-14 left-0 right-0 mx-auto max-w-3xl">
        <div className="flex flex-col sm:flex-row gap-5 items-center">
            {/* Big average */}
            <div className="text-center flex-shrink-0 px-4">
                <div
                    className="text-6xl font-black text-[#00598a]"
                    style={{ fontFamily: "Georgia, serif", lineHeight: 1 }}
                >
                    {avgRating}
                </div>
                <Stars rating={Math.round(parseFloat(avgRating))} size="md" />
                <div className="text-xs text-gray-400 mt-1">{totalReviews} total reviews</div>
            </div>

            <div className="w-px h-16 bg-gray-100 hidden sm:block" />

            {/* Breakdown bars */}
            <div className="flex-1 w-full space-y-1.5">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                    const key = `${star}_star` as keyof RatingBreakdown;
                    const count = breakdown?.[key]?.count ?? 0;
                    const pct =
                        totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                    return (
                        <div key={star} className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-3 text-right font-semibold">
                                {star}
                            </span>
                            <span className="text-amber-400 text-sm">★</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <span className="text-xs text-gray-400 w-7 text-right">{count}</span>
                        </div>
                    );
                })}
            </div>

            <div className="w-px h-16 bg-gray-100 hidden sm:block" />

            {/* Quick stats */}
            <div className="flex sm:flex-col gap-4 sm:gap-2 flex-shrink-0 px-2">
                <div className="text-center">
                    <div className="text-xl font-black text-emerald-500">
                        {totalReviews > 0 ? "98%" : "—"}
                    </div>
                    <div className="text-xs text-gray-400">Would rehire</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-black text-[#00598a]">
                        {avgRating || "—"}
                    </div>
                    <div className="text-xs text-gray-400">Avg rating</div>
                </div>
            </div>
        </div>
    </div>
);

// ─── Main Review Screen ───────────────────────────────────────────────────────
const ReviewScreen: React.FC<ReviewScreenProps> = ({ workerId, userId }) => {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [ratingData, setRatingData] = useState<AverageRatingData>({
        averageRating: "0.0",
        totalReviews: 0,
        ratings: {
            "1_star": { count: 0, percentage: "0.0" },
            "2_star": { count: 0, percentage: "0.0" },
            "3_star": { count: 0, percentage: "0.0" },
            "4_star": { count: 0, percentage: "0.0" },
            "5_star": { count: 0, percentage: "0.0" },
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [activeTag, setActiveTag] = useState<Tag>("All");
    const [sortBy, setSortBy] = useState<SortOption>("Most Recent");
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState("");

    // ── Fetch data ──────────────────────────────────────────────────────────────
    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [reviewsRes, ratingRes] = await Promise.all([
                getReviews(workerId),
                getWorkerAverageRating(workerId),
            ]);
            if (reviewsRes.success) setReviews(reviewsRes.data);
            if (ratingRes.success) setRatingData(ratingRes.data);
        } catch (e: unknown) {
            setError(
                e instanceof Error ? e.message : "Failed to load reviews. Check your connection."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // ── Handlers ────────────────────────────────────────────────────────────────
    const refreshRating = () => {
        getWorkerAverageRating(workerId)
            .then((r) => {
                if (r.success) setRatingData(r.data);
            })
            .catch(console.error);
    };

    const handleNewReview = (newReview: ReviewData) => {
        setReviews((prev) => [newReview, ...prev]);
        refreshRating();
    };

    const handleDelete = (deletedId: string) => {
        setReviews((prev) => prev.filter((r) => r._id !== deletedId));
        refreshRating();
    };

    // ── Filter & sort ───────────────────────────────────────────────────────────
    const filtered = reviews.filter((r) => {
        const q = search.toLowerCase();
        const matchSearch =
            !q ||
            r.review?.toLowerCase().includes(q) ||
            r.user?.name?.toLowerCase().includes(q);

        const matchTag =
            activeTag === "All" ||
            (activeTag === "5 Stars" && r.rating >= 4.5) ||
            (activeTag === "4 Stars" && r.rating >= 3.5 && r.rating < 4.5) ||
            (activeTag === "3 Stars & Below" && r.rating < 3.5);

        return matchSearch && matchTag;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (sortBy === "Highest Rated") return b.rating - a.rating;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', sans-serif" }}>

            {/* ── TOP HEADER ── */}
            <div className="bg-gradient-to-br from-[#00598a] via-[#004d7a] to-[#003a5c] px-4 sm:px-6 pt-8 pb-16 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-32 translate-x-32" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-24 -translate-x-24" />

                <div className="max-w-3xl mx-auto relative">
                    <button className="flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
                        ← Back
                    </button>

                    {/* Worker info */}
                    <div className="flex items-center gap-4 mb-6">
                        <div
                            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-2xl shadow-xl flex-shrink-0"
                            style={{ fontFamily: "Georgia, serif" }}
                        >
                            V
                        </div>
                        <div>
                            <h1
                                className="text-white font-bold text-2xl"
                                style={{ fontFamily: "Georgia, serif" }}
                            >
                                Venkat Rao
                            </h1>
                            <p className="text-white/70 text-sm">Electrician · Hyderabad</p>
                            <div className="flex items-center gap-2 mt-1">
                                <Stars
                                    rating={Math.round(parseFloat(ratingData.averageRating))}
                                    size="sm"
                                />
                                <span className="text-white/80 text-sm font-medium">
                                    {ratingData.averageRating} · {ratingData.totalReviews} reviews
                                </span>
                            </div>
                        </div>
                    </div>

                    <RatingSummary
                        avgRating={ratingData.averageRating}
                        totalReviews={ratingData.totalReviews}
                        breakdown={ratingData.ratings}
                    />
                </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-10">

                {/* Write Review Button */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#00598a] to-[#003a5c] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-[#00598a]/20 hover:brightness-110 active:scale-95 transition-all duration-150"
                    >
                        ✏️ Write a Review
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 flex items-center gap-2">
                        ⚠️ {error}
                        <button
                            onClick={fetchData}
                            className="ml-auto underline text-red-500 hover:text-red-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Search */}
                <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
                        🔍
                    </span>
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search reviews…"
                        className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 outline-none focus:border-[#00598a] focus:ring-2 focus:ring-[#00598a]/10 transition-all shadow-sm"
                    />
                </div>

                {/* Filters row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                    <div className="flex gap-2 flex-wrap">
                        {TAGS.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => setActiveTag(tag)}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${activeTag === tag
                                        ? "bg-gradient-to-r from-[#00598a] to-[#003a5c] text-white shadow-md"
                                        : "bg-white text-gray-500 border border-gray-200 hover:border-[#00598a] hover:text-[#00598a]"
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#00598a] cursor-pointer transition-all hover:border-[#00598a] flex-shrink-0"
                    >
                        {SORT_OPTIONS.map((o) => (
                            <option key={o}>{o}</option>
                        ))}
                    </select>
                </div>

                {/* Count */}
                <p className="text-xs text-gray-400 font-medium mb-4">
                    Showing {sorted.length} of {ratingData.totalReviews} reviews
                </p>

                {/* Loading skeleton */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm animate-pulse"
                            >
                                <div className="flex gap-3 mb-3">
                                    <div className="w-11 h-11 rounded-full bg-gray-200" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-1/3" />
                                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-3 bg-gray-100 rounded w-full" />
                                    <div className="h-3 bg-gray-100 rounded w-5/6" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sorted.length > 0 ? (
                    <div className="space-y-4">
                        {sorted.map((r, i) => (
                            <ReviewCard
                                key={r._id}
                                review={r}
                                index={i}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                        <div className="text-5xl mb-3">🔍</div>
                        <h4 className="text-gray-700 font-semibold mb-1">No reviews found</h4>
                        <p className="text-gray-400 text-sm">
                            Try a different filter or search term.
                        </p>
                    </div>
                )}

                {/* Refresh */}
                {sorted.length > 0 && !loading && (
                    <div className="text-center mt-8">
                        <button
                            onClick={fetchData}
                            className="px-8 py-3 bg-white border-2 border-[#00598a] text-[#00598a] text-sm font-semibold rounded-xl hover:bg-[#e8f4fb] transition-all duration-200 active:scale-95"
                        >
                            Refresh Reviews
                        </button>
                    </div>
                )}
            </div>

            {/* ── WRITE REVIEW MODAL ── */}
            {showModal && (
                <WriteReviewModal
                    onClose={() => setShowModal(false)}
                    onSubmitted={handleNewReview}
                    userId={userId}
                    workerId={workerId}
                />
            )}
        </div>
    );
};

export default ReviewScreen;