import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, Circle, RefreshCw,
    Loader2, BellOff, Trash2, Star,
} from 'lucide-react';
import {
    getAllNotifications,
    getNotificationCount,
    markNotificationAsRead,
    deleteNotification,
    getReviews,          // ← imported to fetch real review data
    Notification,
    ReviewData,          // ← imported for typing
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
        NEW_REVIEW: { icon: '⭐', iconBg: '#FFFBEB', accent: '#f59e0b' },
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
// STAR ROW (read-only)
// ============================================================================
const StarRow: React.FC<{ value: number }> = ({ value }) => (
    <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(s => (
            <Star
                key={s}
                className={`w-3.5 h-3.5 ${s <= value
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-200 fill-gray-200'
                    }`}
            />
        ))}
    </div>
);

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
// REVIEW NOTIFICATION CARD
// Calls getReviews(workerId) on mount and renders the latest real review inline
// ============================================================================
const ReviewNotificationCard: React.FC<{
    notification: Notification;
    workerId: string;
    markingReadId: string | null;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClick: () => void;
}> = ({ notification, workerId, markingReadId, onMarkRead, onDelete, onClick }) => {

    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [fetching, setFetching] = useState(true);

    // ── fetch the worker's actual reviews via getReviews ──
    useEffect(() => {
        if (!workerId) { setFetching(false); return; }
        getReviews(workerId)
            .then(res => setReviews(res.data || []))
            .catch(() => setReviews([]))
            .finally(() => setFetching(false));
    }, [workerId]);

    // Pick the most-recently posted review to preview
    const latestReview: ReviewData | null = reviews.length
        ? [...reviews].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
        : null;

    const reviewerName = latestReview
        ? typeof latestReview.user === 'object'
            ? latestReview.user?.name || 'Customer'
            : 'Customer'
        : 'Customer';

    const isUnread = !notification.isRead;
    const isMarking = markingReadId === notification._id;

    return (
        <div
            onClick={onClick}
            className={`
                relative bg-white rounded-2xl border transition-all duration-200
                hover:shadow-md cursor-pointer overflow-hidden
                ${isUnread
                    ? 'border-yellow-200 shadow-sm shadow-yellow-50'
                    : 'border-gray-100 shadow-sm'}
            `}
        >
            {/* yellow accent bar on left */}
            {isUnread && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-yellow-400" />
            )}

            <div className="p-4 pl-5">

                {/* ── top row: icon + title + action buttons ── */}
                <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl bg-yellow-50 border border-yellow-100">
                        ⭐
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className={`${typography.fontSize.sm} font-bold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                            </h3>
                            {isUnread && (
                                <span className="w-2 h-2 rounded-full flex-shrink-0 bg-yellow-400" />
                            )}
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-1">
                            {notification.message}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap mt-1.5">
                            <span className="text-xs text-gray-400">
                                {formatRelativeTime(notification.createdAt)}
                            </span>
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                                New Review
                            </span>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isUnread
                                ? 'bg-orange-50 text-orange-500 border border-orange-100'
                                : 'bg-green-50 text-green-600 border border-green-100'
                                }`}>
                                {isUnread ? 'Unread' : 'Read'}
                            </span>
                        </div>
                    </div>

                    {/* mark-read + delete buttons */}
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 mt-0.5">
                        <button
                            onClick={e => { e.stopPropagation(); if (isUnread) onMarkRead(notification._id); }}
                            disabled={isMarking || !isUnread}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                            title={isUnread ? 'Mark as read' : 'Already read'}
                        >
                            {isMarking
                                ? <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
                                : isUnread
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

                {/* ── review preview fetched via getReviews ── */}
                <div className="mt-3 pt-3 border-t border-yellow-100">
                    {fetching ? (
                        <div className="flex items-center gap-2 text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-xs">Loading review…</span>
                        </div>
                    ) : latestReview ? (
                        <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                            {/* reviewer avatar + name + stars */}
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                        {reviewerName[0]?.toUpperCase() ?? 'C'}
                                    </div>
                                    <span className="text-xs font-semibold text-gray-800">{reviewerName}</span>
                                </div>
                                <StarRow value={latestReview.rating} />
                            </div>
                            {/* review text */}
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 italic">
                                "{latestReview.review}"
                            </p>
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Could not load review details.</p>
                    )}

                    <p className="text-xs font-semibold text-yellow-600 mt-2">
                        Tap to see all your reviews →
                    </p>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// GENERIC NOTIFICATION CARD
// ============================================================================
const NotificationCard: React.FC<{
    notification: Notification;
    workerId: string;
    markingReadId: string | null;
    onMarkRead: (id: string) => void;
    onDelete: (id: string) => void;
    onClick: () => void;
}> = ({ notification, workerId, markingReadId, onMarkRead, onDelete, onClick }) => {

    // Route NEW_REVIEW type to the dedicated card that uses getReviews
    if (notification.type === 'NEW_REVIEW') {
        return (
            <ReviewNotificationCard
                notification={notification}
                workerId={workerId}
                markingReadId={markingReadId}
                onMarkRead={onMarkRead}
                onDelete={onDelete}
                onClick={onClick}
            />
        );
    }

    const config = getNotificationConfig(notification.type);
    const isUnread = !notification.isRead;
    const isMarking = markingReadId === notification._id;

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
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
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
                        onClick={e => { e.stopPropagation(); if (isUnread) onMarkRead(notification._id); }}
                        disabled={isMarking || !isUnread}
                        className="p-1.5 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                        title={isUnread ? 'Mark as read' : 'Already read'}
                    >
                        {isMarking
                            ? <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                            : isUnread
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
            <span className={`${typography.fontSize.xs} font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${active ? 'bg-white/25 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
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

    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [liveUnreadCount, setLiveUnreadCount] = useState(0);
    const [userUnread, setUserUnread] = useState(0);
    const [workerUnread, setWorkerUnread] = useState(0);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [markingReadId, setMarkingReadId] = useState<string | null>(null);

    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Fetch notifications ──────────────────────────────────────────────────
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

    // ── Mark read ────────────────────────────────────────────────────────────
    const handleMarkRead = useCallback(async (id: string) => {
        const target = allNotifications.find(n => n._id === id);
        if (!target || target.isRead) return;

        setAllNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setLiveUnreadCount(c => Math.max(0, c - 1));
        if (currentRole === 'User') setUserUnread(c => Math.max(0, c - 1));
        else setWorkerUnread(c => Math.max(0, c - 1));

        setMarkingReadId(id);
        try {
            await markNotificationAsRead(id);
        } catch (err) {
            console.error('❌ markNotificationAsRead failed, reverting:', err);
            setAllNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: false } : n));
            setLiveUnreadCount(c => c + 1);
            if (currentRole === 'User') setUserUnread(c => c + 1);
            else setWorkerUnread(c => c + 1);
        } finally {
            setMarkingReadId(null);
        }
    }, [allNotifications, currentRole]);

    // ── Mark all read ────────────────────────────────────────────────────────
    const handleMarkAllRead = useCallback(async () => {
        const unreadIds = allNotifications.filter(n => !n.isRead).map(n => n._id);
        if (unreadIds.length === 0) return;

        setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setLiveUnreadCount(0);
        if (currentRole === 'User') setUserUnread(0);
        else setWorkerUnread(0);

        const results = await Promise.allSettled(unreadIds.map(id => markNotificationAsRead(id)));
        results.forEach((r, i) => {
            if (r.status === 'rejected') console.error(`❌ Failed to mark ${unreadIds[i]}:`, r.reason);
        });
    }, [allNotifications, currentRole]);

    // ── Delete ────────────────────────────────────────────────────────────────
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

    // ── Card click ────────────────────────────────────────────────────────────
    const handleCardClick = (n: Notification) => {
        if (!n.isRead) handleMarkRead(n._id);

        // NEW_REVIEW in worker mode → go to their own reviews page
        if (n.type === 'NEW_REVIEW' && currentRole === 'Worker') {
            navigate(`/reviews/${workerId}`);
            return;
        }

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

    const reviewCount = allNotifications.filter(n => n.type === 'NEW_REVIEW').length;

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
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
                                <h1 className={`${typography.heading.h5} text-gray-900`}>Notifications</h1>
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
                            {allNotifications.some(n => !n.isRead) && (
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
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

                {/* Context badges */}
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
                            : '🔍 Showing job matches & reviews'}
                    </span>
                    {liveUnreadCount > 0 && (
                        <span className={`${typography.misc.badge} px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100`}>
                            🔴 {liveUnreadCount} unread
                        </span>
                    )}
                    {currentRole === 'Worker' && reviewCount > 0 && (
                        <span className={`${typography.misc.badge} px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200`}>
                            ⭐ {reviewCount} review{reviewCount !== 1 ? 's' : ''}
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

                {/* Review highlight banner — worker mode only */}
                {currentRole === 'Worker' && allNotifications.some(n => n.type === 'NEW_REVIEW' && !n.isRead) && (
                    <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
                        <span className="text-2xl">⭐</span>
                        <div>
                            <p className={`${typography.body.xs} font-bold text-yellow-800`}>
                                You received a new customer review!
                            </p>
                            <p className={`${typography.fontSize.xs} text-yellow-600 mt-0.5`}>
                                Tap the card below to see the full details.
                            </p>
                        </div>
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

                {/* Notification list — workerId passed down so ReviewNotificationCard can call getReviews */}
                {!error && allNotifications.length > 0 && (
                    <div className="space-y-3">
                        {allNotifications.map(n => (
                            <NotificationCard
                                key={n._id}
                                notification={n}
                                workerId={workerId}
                                markingReadId={markingReadId}
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
                        <h2 className={`${typography.heading.h5} text-gray-800 mb-2`}>No Notifications</h2>
                        <p className={`${typography.body.small} text-gray-500 max-w-xs leading-relaxed`}>
                            {currentRole === 'Worker'
                                ? "You'll be notified when new jobs match your skills or customers leave reviews."
                                : "You'll be notified when workers enquire about your jobs."
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* ── Delete Modal ── */}
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