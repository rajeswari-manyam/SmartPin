import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader2, BellOff } from 'lucide-react';
import {
    getAllNotifications,
    getNotificationCount,
    markNotificationAsRead,
    deleteNotification,
    getReviews,
    Notification,
    SingleReviewData,
} from "../services/api.service";
import { useAccount } from '../context/AccountContext';
import { useAuth } from '../context/AuthContext';
import typography from '../styles/typography';

import NotificationCard from "../components/cards/NotificationCard";
import DeleteConfirmModal from "../modal/DeleteConfirmModal";
import ReviewsSection from "../modal/ReviewsSection";
import ReviewDetailModal from "../modal/ReviewDetailModal";

// ============================================================================
// MAIN PAGE
// ============================================================================
const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { accountType, workerProfileId } = useAccount();
    const { user } = useAuth();

    const userId = user?._id || localStorage.getItem('userId') || '';

    // ── Resolve workerId from every possible source ───────────────────────────
    const workerId =
        workerProfileId ||
        localStorage.getItem('workerProfileId') ||
        localStorage.getItem('workerId') ||
        localStorage.getItem('@worker_id') ||
        localStorage.getItem('worker_id') ||
        '';

    // ── Active tab ────────────────────────────────────────────────────────────
    const [workerTab, setWorkerTab] = useState<'notifications' | 'reviews'>('notifications');

    const isWorkerView = !!(workerId && accountType === 'worker');
    const currentId = isWorkerView ? workerId : userId;
    const currentRole = isWorkerView ? 'Worker' : 'User';

    // ── State ─────────────────────────────────────────────────────────────────
    const [allNotifications, setAllNotifications] = useState<Notification[]>([]);
    const [liveUnreadCount, setLiveUnreadCount] = useState(0);
    const [workerUnread, setWorkerUnread] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    // ── Review modal state ────────────────────────────────────────────────────
    const [reviewModal, setReviewModal] = useState<SingleReviewData | null>(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    // ============================================================================
    // FETCH
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
                if (currentRole === 'Worker') setWorkerUnread(unread);
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
    // MARK READ
    // ============================================================================
    const handleMarkRead = useCallback(async (id: string) => {
        const notification = allNotifications.find(n => n._id === id);
        if (!notification || notification.isRead) return;

        setAllNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
        setLiveUnreadCount(c => Math.max(0, c - 1));
        if (currentRole === 'Worker') setWorkerUnread(c => Math.max(0, c - 1));

        try {
            await markNotificationAsRead(id);
        } catch {
            setAllNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: false } : n));
            setLiveUnreadCount(c => c + 1);
            if (currentRole === 'Worker') setWorkerUnread(c => c + 1);
        }
    }, [allNotifications, currentRole]);

    const handleMarkAllRead = async () => {
        const unread = allNotifications.filter(n => !n.isRead);
        if (!unread.length) return;
        setAllNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setLiveUnreadCount(0);
        if (currentRole === 'Worker') setWorkerUnread(0);
        await Promise.allSettled(unread.map(n => markNotificationAsRead(n._id)));
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
                if (currentRole === 'Worker') setWorkerUnread(c => Math.max(0, c - 1));
            }
        } catch (err) {
            console.error('❌ Delete error:', err);
        } finally {
            setDeleting(false);
            setPendingDeleteId(null);
        }
    };

    // ============================================================================
    // CARD CLICK — review opens modal, others navigate to job details
    // ============================================================================
    // ============================================================================
    // CARD CLICK — review opens modal, others navigate to job details
    // ============================================================================
    const handleCardClick = async (n: Notification) => {
        if (!n.isRead) handleMarkRead(n._id);

        if (n.type === 'NEW_REVIEW') {
            try {
                setReviewLoading(true);
                const res = await getReviews(currentId);
                if (res.success && res.data?.length) {
                    const match = res.data.find((r: any) => {
                        const uid = typeof r.user === 'object' ? r.user._id : r.user;
                        return uid === n.senderId;
                    }) || res.data[0];

                    if (match) setReviewModal(match as any);
                }
            } catch (err) {
                console.error('Failed to fetch review:', err);
            } finally {
                setReviewLoading(false);
            }
            return;
        }

        const jobId = n.jobId || (n as any).relatedId || (n as any).referenceId;
        if (!jobId) return;
        navigate(`/job-details/${jobId}`);
    };

    // ── Loading ───────────────────────────────────────────────────────────────
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
                            {workerTab !== 'reviews' && allNotifications.some(n => !n.isRead) && (
                                <button
                                    onClick={handleMarkAllRead}
                                    className={`${typography.fontSize.xs} font-semibold text-[#00598a] px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors`}
                                >
                                    Mark all read
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Worker sub-tabs */}
                    {accountType === "worker" && workerId && (
                        <div className="flex items-center gap-2 mt-2">
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

                {workerTab === 'reviews' ? (
                    <ReviewsSection workerId={workerId} />
                ) : (
                    <>
                        {/* Context badge */}
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

                        {/* Review loading overlay */}
                        {reviewLoading && (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                                <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                                <p className={`${typography.body.xs} text-amber-700`}>Loading review…</p>
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

                        {/* List */}
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

                        {/* Empty */}
                        {!error && allNotifications.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                                    <BellOff className="w-9 h-9 text-gray-300" />
                                </div>
                                <h2 className={`${typography.heading.h5} text-gray-800 mb-2`}>No Notifications</h2>
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

            {/* ── Delete Modal ──────────────────────────────────────────────── */}
            {pendingDeleteId && (
                <DeleteConfirmModal
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    deleting={deleting}
                />
            )}

            {/* ── Review Detail Modal ───────────────────────────────────────── */}
            {reviewModal && (
                <ReviewDetailModal
                    review={reviewModal}
                    onClose={() => setReviewModal(null)}
                />
            )}
        </div>
    );
};

export default NotificationsPage;