import React, { useEffect, useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import ReviewCard from "../components/Reviews/ReviewsCard";
import StarRating from "../components/Reviews/StartRating";
import { ReviewWithName } from "../types/Notification.types";
import { getReviews, getUserById } from "../services/api.service";
import typography from "../styles/typography";

// ============================================================================
// REVIEWS SECTION (worker-only)
// ============================================================================
const ReviewsSection: React.FC<{ workerId: string }> = ({ workerId }) => {
    const [reviews,  setReviews]  = useState<ReviewWithName[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [error,    setError]    = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        // Resolve workerId from prop or fall back through all localStorage keys
        const id =
            workerId?.trim()                              ||
            localStorage.getItem('workerProfileId')?.trim() ||
            localStorage.getItem('workerId')?.trim()        ||
            localStorage.getItem('@worker_id')?.trim()      ||
            localStorage.getItem('worker_id')?.trim()       ||
            '';

        console.log('📝 ReviewsSection mounting with workerId:', id);

        if (!id) {
            setLoading(false);
            setError('Worker profile ID not found.');
            return;
        }

        setLoading(true);
        setError(null);

        getReviews(id)
            .then(async res => {
                console.log('✅ ReviewsSection API response:', res);
                const raw = res.data || [];

                const withNames: ReviewWithName[] = await Promise.all(
                    raw.map(async (r): Promise<ReviewWithName> => {
                        if (typeof r.user === 'object' && r.user !== null) {
                            return { ...r, resolvedName: (r.user as any).name || 'Customer' };
                        }
                        try {
                            const userRes = await getUserById(r.user as unknown as string);
                            return { ...r, resolvedName: userRes.data?.name || 'Customer' };
                        } catch {
                            return { ...r, resolvedName: 'Customer' };
                        }
                    })
                );

                setReviews(withNames);
            })
            .catch(err => {
                console.error('❌ ReviewsSection fetch error:', err);
                setError(err.message || 'Failed to load reviews');
            })
            .finally(() => setLoading(false));
    }, [workerId]);

    const avgRating      = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;
    const visibleReviews = expanded ? reviews : reviews.slice(0, 3);

    return (
        <div className="mt-2">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-lg">⭐</span>
                    <h2 className={`${typography.heading.h6} text-gray-900`}>My Reviews</h2>
                    {reviews.length > 0 && (
                        <span className={`${typography.misc.badge} px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100`}>
                            {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-1.5">
                        <StarRating rating={avgRating} />
                        <span className={`${typography.fontSize.sm} font-bold text-amber-500`}>
                            {avgRating.toFixed(1)}
                        </span>
                    </div>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3">
                        <Star className="w-6 h-6 text-red-200" />
                    </div>
                    <p className={`${typography.body.xs} text-red-400`}>⚠️ {error}</p>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && reviews.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mb-3">
                        <Star className="w-6 h-6 text-amber-200" />
                    </div>
                    <p className={`${typography.body.xs} text-gray-500`}>No reviews yet</p>
                    <p className={`${typography.fontSize.xs} text-gray-400 mt-1`}>
                        Complete jobs to receive reviews from customers.
                    </p>
                </div>
            )}

            {/* Cards */}
            {!loading && !error && reviews.length > 0 && (
                <>
                    <div className="space-y-3">
                        {visibleReviews.map(r => (
                            <ReviewCard key={r._id} review={r} />
                        ))}
                    </div>
                    {reviews.length > 3 && (
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className={`mt-3 w-full py-2.5 rounded-xl border border-amber-200 ${typography.body.xs} font-semibold text-amber-600 hover:bg-amber-50 transition-colors`}
                        >
                            {expanded
                                ? 'Show less'
                                : `Show ${reviews.length - 3} more review${reviews.length - 3 !== 1 ? 's' : ''}`
                            }
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

export default ReviewsSection;