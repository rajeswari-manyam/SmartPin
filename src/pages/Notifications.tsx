import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, Circle, RefreshCw,
    Loader2, BellOff, Trash2, Star, StarHalf,
} from 'lucide-react';
import {
    getAllNotifications,
    getNotificationCount,
    markNotificationAsRead,
    deleteNotification,
    getReviews,
    getUserById,
    Notification,
    ReviewData,
} from '../services/api.service';
import { useAccount } from '../context/AccountContext';
import { useAuth } from '../context/AuthContext';
import typography from '../styles/typography';

// ============================================================================
// VISUAL HELPERS
// ============================================================================
const getNotificationConfig = (type: string) => {
    const configs: Record<string, { icon: string; iconBg: string; accent: string }> = {
        NEW_JOB: { icon: '🆕', iconBg: '#EEF2FF', accent: '#6366f1' },
        JOB_ENQUIRY: { icon: '📩', iconBg: '#DBEAFE', accent: '#3b82f6' },
        JOB_CONFIRMED: { icon: '✅', iconBg: '#D1FAE5', accent: '#10b981' },
        PAYMENT: { icon: '💰', iconBg: '#FEF3C7', accent: '#f59e0b' },
        JOB_COMPLETED: { icon: '🔧', iconBg: '#F3E8FF', accent: '#8b5cf6' },
        NEW_MESSAGE: { icon: '💬', iconBg: '#DBEAFE', accent: '#3b82f6' },
    };
    return configs[type] || { icon: '🔔', iconBg: '#F3F4F6', accent: '#6b7280' };
};

const formatRelativeTime = (dateStr: string): string => {
    try {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (mins < 1) return 'just now';
        if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch { return ''; }
};

// ============================================================================
// STAR RATING DISPLAY
// ============================================================================
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
                <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i <= Math.round(rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200'
                        }`}
                />
            ))}
        </div>
    );
};

// ============================================================================
// REVIEW CARD
// ============================================================================
// ReviewData extended with a resolved display name
type ReviewWithName = ReviewData & { resolvedName: string };

const ReviewCard: React.FC<{ review: ReviewWithName }> = ({ review }) => {
    const reviewerName = review.resolvedName;

    const initials = reviewerName
        .split(' ')
        .map((w: string) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    return (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-4 flex items-start gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <span className={`${typography.fontSize.xs} font-bold text-amber-600`}>
                    {initials}
                </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`${typography.fontSize.sm} font-semibold text-gray-800 truncate`}>
                        {reviewerName}
                    </p>
                    <StarRating rating={review.rating} />
                </div>
                <p className={`${typography.misc.caption} text-gray-600 line-clamp-3 leading-relaxed`}>
                    {review.review}
                </p>
                <p className={`${typography.fontSize.xs} text-gray-400 mt-1.5`}>
                    {formatRelativeTime(review.createdAt)}
                </p>
            </div>
        </div>
    );
};

// ============================================================================
// REVIEWS SECTION (worker-only)
// ============================================================================
const ReviewsSection: React.FC<{ workerId: string }> = ({ workerId }) => {
    const [reviews, setReviews] = useState<ReviewWithName[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!workerId) return;
        setLoading(true);

        getReviews(workerId)
            .then(async res => {
                const raw = res.data || [];

                // For reviews where user is a plain ID string, fetch the real name
                const withNames: ReviewWithName[] = await Promise.all(
                    raw.map(async (r): Promise<ReviewWithName> => {
                        if (typeof r.user === 'object' && r.user !== null) {
                            return { ...r, resolvedName: (r.user as any).name || 'Customer' };
                        }
                        // user is a raw ID string — look up the name
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
            .catch(err => setError(err.message || 'Failed to load reviews'))
            .finally(() => setLoading(false));
    }, [workerId]);

    const avgRating = reviews.length
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const visibleReviews = expanded ? reviews : reviews.slice(0, 3);

    return (
        <div className="mt-2">
            {/* Section header */}
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
                <div className="text-center py-6">
                    <p className={`${typography.body.xs} text-gray-400`}>⚠️ {error}</p>
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

            {/* Review cards */}
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
                            {expanded ? 'Show less' : `Show ${reviews.length - 3} more review${reviews.length - 3 !== 1 ? 's' : ''}`}
                        </button>
                    )}
                </>
            )}
        </div>
    );
};

// ============================================================================
// DELETE CONFIRM MODAL
// ============================================================================
const DeleteConfirmModal: React.FC<{
    onConfirm: () => void;
    onCancel: () => void;
    deleting: boolean;
}> = ({ onConfirm, onCancel, deleting }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
    >
        <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-80 flex flex-col items-center gap-4"
            style={{ animation: 'popIn 0.2s ease-out' }}
            onClick={e => e.stopPropagation()}
        >
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <div className="text-center">
                <h3 className={`${typography.heading.h6} text-gray-900`}>Delete Notification?</h3>
                <p className={`${typography.body.xs} text-gray-500 mt-1`}>This action cannot be undone.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
                <button
                    onClick={onCancel}
                    disabled={deleting}
                    className={`py-2.5 rounded-xl border border-gray-200 ${typography.body.xs} font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50`}
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={deleting}
                    className={`py-2.5 rounded-xl bg-red-500 text-white ${typography.body.xs} font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5`}
                >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    Delete
                </button>
            </div>
        </div>
        <style>{`
            @keyframes popIn {
                from { opacity: 0; transform: scale(0.92); }
                to   { opacity: 1; transform: scale(1); }
            }
        `}</style>
    </div>
);

// ============================================================================
// NOTIFICATION CARD
// ============================================================================
const NotificationCard: React.FC<{
    notification: Notification;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClick: () => void;
}> = ({ notification, onMarkRead, onDelete, onClick }) => {
    const config = getNotificationConfig(notification.type);
    const isUnread = !notification.isRead;

    return (
        <div
            onClick={onClick}
            className={`
                relative bg-white rounded-2xl border transition-all duration-200
                hover:shadow-md cursor-pointer overflow-hidden
                ${isUnread ? 'border-blue-100 shadow-sm shadow-blue-50' : 'border-gray-100 shadow-sm'}
            `}
        >
            {isUnread && (
                <div
                    className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                    style={{ backgroundColor: config.accent }}
                />
            )}

            <div className="flex items-start gap-3 p-4 pl-5">
                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${typography.icon.lg}`}
                    style={{ backgroundColor: config.iconBg }}
                >
                    {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`${typography.fontSize.sm} font-bold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                        </h3>
                        {isUnread && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: config.accent }} />
                        )}
                    </div>

                    <p className={`${typography.misc.caption} line-clamp-2 leading-relaxed mb-1.5`}>
                        {notification.message}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`${typography.fontSize.xs} text-gray-400`}>
                            {formatRelativeTime(notification.createdAt)}
                        </span>
                        <span
                            className={`${typography.misc.badge} px-2 py-0.5 rounded-full`}
                            style={{ backgroundColor: config.iconBg, color: config.accent }}
                        >
                            {notification.type.replace(/_/g, ' ')}
                        </span>
                        <span className={`${typography.misc.badge} px-2 py-0.5 rounded-full ${isUnread
                            ? 'bg-orange-50 text-orange-500 border border-orange-100'
                            : 'bg-green-50 text-green-600 border border-green-100'
                            }`}>
                            {isUnread ? 'Unread' : 'Read'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-1.5 flex-shrink-0 mt-0.5">
                    <button
                        onClick={e => { e.stopPropagation(); onMarkRead(notification._id); }}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                        title={isUnread ? 'Mark as read' : 'Already read'}
                    >
                        {isUnread
                            ? <Circle className="w-5 h-5 text-gray-300" />
                            : <CheckCircle className="w-5 h-5 text-green-400" />
                        }
                    </button>
                    <button
                        onClick={e => { e.stopPropagation(); onDelete(notification._id); }}
                        className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                        title="Delete notification"
                    >
                        <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600 transition-colors" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ROLE TAB
// ============================================================================
const RoleTab: React.FC<{
    label: string; active: boolean; count?: number; onClick: () => void;
}> = ({ label, active, count, onClick }) => (
    <button
        onClick={onClick}
        className={`
            flex items-center gap-1.5 px-4 py-2 rounded-xl ${typography.body.xs} font-semibold
            transition-all duration-200
            ${active ? 'bg-[#00598a] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
        `}
    >
        {label}
        {count != null && count > 0 && (
            <span className={`${typography.fontSize.xs} font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${active ? 'bg-white/25 text-white' : 'bg-gray-300 text-gray-600'}`}>
                {count}
            </span>
        )}
    </button>
);

// ============================================================================
// MAIN PAGE
// ============================================================================
const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { accountType, setAccountType, workerProfileId } = useAccount();
    const { user } = useAuth();

    const userId = user?._id || localStorage.getItem('userId') || '';
    const workerId = workerProfileId || localStorage.getItem('workerId') || '';

    const currentId = accountType === 'worker' ? workerId : userId;
    const currentRole = accountType === 'worker' ? 'Worker' : 'User';

    // ── Notification list ─────────────────────────────────────────────────────
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);

    // ── Counts ────────────────────────────────────────────────────────────────
    const [liveUnreadCount, setLiveUnreadCount] = useState(0);
    const [userUnread, setUserUnread] = useState(0);
    const [workerUnread, setWorkerUnread] = useState(0);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Delete modal ──────────────────────────────────────────────────────────
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Active tab inside worker view ─────────────────────────────────────────
    const [workerTab, setWorkerTab] = useState<'notifications' | 'reviews'>('notifications');

    // ============================================================================
    // FETCH NOTIFICATIONS
    // ============================================================================
    const fetchAll = useCallback(async (isRefresh = false) => {
        if (!currentId) {
            setError(`No ${currentRole} ID found. Please log in again.`);
            setLoading(false);
            return;
        }
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            setError(null);

            const [allRes, countRes] = await Promise.allSettled([
                getAllNotifications(currentRole as 'User' | 'Worker', currentId),
                getNotificationCount(currentRole as 'User' | 'Worker', currentId),
            ]);

            if (allRes.status === 'fulfilled') {
                const sorted = [...(allRes.value.data || [])].sort((a, b) => {
                    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setAllNotifications(sorted);
                const unread = sorted.filter(n => !n.isRead).length;
                if (currentRole === 'User') setUserUnread(unread);
                else setWorkerUnread(unread);
            }

            if (countRes.status === 'fulfilled') {
                setLiveUnreadCount(countRes.value.count ?? 0);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentId, currentRole]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ============================================================================
    // MARK READ — calls real API + updates local state
    // ============================================================================
    const handleMarkRead = useCallback(async (id: string) => {
        const notification = allNotifications.find(n => n._id === id);
        if (!notification || notification.isRead) return;

        // Optimistic update
        setAllNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setLiveUnreadCount(c => Math.max(0, c - 1));
        if (currentRole === 'User') setUserUnread(c => Math.max(0, c - 1));
        else setWorkerUnread(c => Math.max(0, c - 1));

        // Persist to server
        try {
            await markNotificationAsRead(id);
        } catch (err) {
            console.error('❌ markNotificationAsRead error:', err);
            // Rollback on failure
            setAllNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: false } : n));
            setLiveUnreadCount(c => c + 1);
            if (currentRole === 'User') setUserUnread(c => c + 1);
            else setWorkerUnread(c => c + 1);
        }
    }, [allNotifications, currentRole]);

    const handleMarkAllRead = async () => {
        const unreadItems = allNotifications.filter(n => !n.isRead);
        if (unreadItems.length === 0) return;

        // Optimistic update
        setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setLiveUnreadCount(0);
        if (currentRole === 'User') setUserUnread(0);
        else setWorkerUnread(0);

        // Persist all to server in parallel
        await Promise.allSettled(
            unreadItems.map(n => markNotificationAsRead(n._id))
        );
    };

    // ============================================================================
    // DELETE
    // ============================================================================
    const handleDeleteRequest = (id: string) => setPendingDeleteId(id);
    const handleDeleteCancel = () => { if (!deleting) setPendingDeleteId(null); };

    const handleDeleteConfirm = async () => {
        if (!pendingDeleteId) return;
        setDeleting(true);
        try {
            await deleteNotification(pendingDeleteId);
            const wasUnread = allNotifications.find(n => n._id === pendingDeleteId && !n.isRead);
            setAllNotifications(prev => prev.filter(n => n._id !== pendingDeleteId));
            if (wasUnread) {
                setLiveUnreadCount(c => Math.max(0, c - 1));
                if (currentRole === 'User') setUserUnread(c => Math.max(0, c - 1));
                else setWorkerUnread(c => Math.max(0, c - 1));
            }
        } catch (err) {
            console.error('❌ Delete error:', err);
        } finally {
            setDeleting(false);
            setPendingDeleteId(null);
        }
    };

    // ============================================================================
    // CARD CLICK
    // ============================================================================
    const handleCardClick = (n: Notification) => {
        if (!n.isRead) handleMarkRead(n._id);
        if (!n.jobId) return;
        if (currentRole === 'Worker') navigate(`/job-details/${n.jobId}`);
        else navigate(`/job-applicants/${n.jobId}`);
    };

    // ── Loading screen ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-9 h-9 animate-spin text-[#00598a]" />
                    <p className={`${typography.body.xs} text-gray-500`}>Loading notifications…</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ─────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition active:scale-95"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-700" />
                            </button>
                            <div>
                                <h1 className={`${typography.heading.h5} text-gray-900`}>
                                    Notifications
                                </h1>
                                <p className={`${typography.misc.caption} flex items-center gap-1.5`}>
                                    {liveUnreadCount > 0 ? (
                                        <>
                                            <span
                                                className={`inline-flex items-center justify-center w-4 h-4 rounded-full ${typography.fontSize.xs} font-bold text-white`}
                                                style={{ backgroundColor: '#00598a' }}
                                            >
                                                {liveUnreadCount}
                                            </span>
                                            unread
                                        </>
                                    ) : 'All caught up'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => fetchAll(true)}
                                disabled={refreshing}
                                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition active:scale-95 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 text-gray-600 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                            {workerTab === 'notifications' && allNotifications.some(n => !n.isRead) && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className={`${typography.fontSize.xs} font-semibold text-[#00598a] px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors`}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Role tabs */}
                    {workerId && (
                        <div className="flex items-center gap-2 mt-3">
                            <RoleTab
                                label="As Customer"
                                active={accountType === 'user'}
                                count={userUnread}
                                onClick={() => setAccountType('user')}
                            />
                            <RoleTab
                                label="As Worker"
                                active={accountType === 'worker'}
                                count={workerUnread}
                                onClick={() => setAccountType('worker')}
                            />
                        </div>
                    )}

                    {/* Worker sub-tabs: Notifications | Reviews */}
                    {accountType === 'worker' && (
                        <div className="flex items-center gap-2 mt-2">
                            <button
                                onClick={() => setWorkerTab('notifications')}
                                className={`flex-1 py-2 rounded-xl ${typography.body.xs} font-semibold transition-all duration-200 ${workerTab === 'notifications'
                                    ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                🔔 Notifications
                                {workerUnread > 0 && (
                                    <span className="ml-1.5 bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                        {workerUnread}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setWorkerTab('reviews')}
                                className={`flex-1 py-2 rounded-xl ${typography.body.xs} font-semibold transition-all duration-200 ${workerTab === 'reviews'
                                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                    }`}
                            >
                                ⭐ My Reviews
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

                {/* ── REVIEWS TAB (worker only) ──────────────────────────── */}
                {accountType === 'worker' && workerTab === 'reviews' ? (
                    <ReviewsSection workerId={workerId} />
                ) : (
                    <>
                        {/* Context + live count badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`
                                ${typography.misc.badge} px-3 py-1.5 rounded-full
                                ${currentRole === 'User'
                                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                                    : 'bg-indigo-50 text-indigo-600 border border-indigo-100'
                                }
                            `}>
                                {currentRole === 'User'
                                    ? '📋 Showing job enquiries from workers'
                                    : '🔍 Showing new job matches near you'
                                }
                            </span>
                            {liveUnreadCount > 0 && (
                                <span className={`${typography.misc.badge} px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100`}>
                                    🔴 {liveUnreadCount} unread
                                </span>
                            )}
                        </div>

                        {/* Unread banner */}
                        {liveUnreadCount > 0 && (
                            <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                                <span className={`bg-[#00598a] text-white ${typography.fontSize.xs} font-bold px-2.5 py-1 rounded-full`}>
                                    {liveUnreadCount} new
                                </span>
                                <p className={`${typography.body.xs} text-blue-700`}>
                                    You have {liveUnreadCount} unread notification{liveUnreadCount !== 1 ? 's' : ''}
                                </p>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="text-center py-10">
                                <div className="text-5xl mb-3">⚠️</div>
                                <h2 className={`${typography.heading.h6} text-gray-800 mb-1`}>Failed to load</h2>
                                <p className={`${typography.body.xs} text-gray-500 mb-4`}>{error}</p>
                                <button
                                    onClick={() => fetchAll()}
                                    className={`bg-[#00598a] text-white px-5 py-2.5 rounded-xl ${typography.body.xs} font-semibold`}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Notification list */}
                        {!error && allNotifications.length > 0 && (
                            <div className="space-y-3">
                                {allNotifications.map(n => (
                                    <NotificationCard
                                        key={n._id}
                                        notification={n}
                                        onMarkRead={handleMarkRead}
                                        onDelete={handleDeleteRequest}
                                        onClick={() => handleCardClick(n)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Empty state */}
                        {!error && allNotifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                                    <BellOff className="w-9 h-9 text-gray-300" />
                                </div>
                                <h2 className={`${typography.heading.h5} text-gray-800 mb-2`}>
                                    No Notifications
                                </h2>
                                <p className={`${typography.body.small} text-gray-500 max-w-xs leading-relaxed`}>
                                    {currentRole === 'Worker'
                                        ? "You'll be notified when new jobs matching your skills are posted nearby."
                                        : "You'll be notified when workers enquire about your jobs."
                                    }
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── Delete Confirm Modal ───────────────────────────────────────── */}
            {pendingDeleteId && (
                <DeleteConfirmModal
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    deleting={deleting}
                />
            )}
        </div>
    );
};

export default NotificationsPage;