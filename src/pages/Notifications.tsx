import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, CheckCircle, Circle, RefreshCw,
    Loader2, BellOff, Trash2, Eye, EyeOff,
} from 'lucide-react';
import {
    getAllNotifications,
    getReadNotifications,
    getUnreadNotifications,
    getNotificationCount,
    deleteNotification,
    Notification,
} from '../services/api.service';
import { useAccount } from '../context/AccountContext';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// VISUAL HELPERS
// ============================================================================
const getNotificationConfig = (type: string) => {
    const configs: Record<string, { icon: string; iconBg: string; accent: string }> = {
        NEW_JOB:       { icon: '🆕', iconBg: '#EEF2FF', accent: '#6366f1' },
        JOB_ENQUIRY:   { icon: '📩', iconBg: '#DBEAFE', accent: '#3b82f6' },
        JOB_CONFIRMED: { icon: '✅', iconBg: '#D1FAE5', accent: '#10b981' },
        PAYMENT:       { icon: '💰', iconBg: '#FEF3C7', accent: '#f59e0b' },
        JOB_COMPLETED: { icon: '🔧', iconBg: '#F3E8FF', accent: '#8b5cf6' },
        NEW_MESSAGE:   { icon: '💬', iconBg: '#DBEAFE', accent: '#3b82f6' },
    };
    return configs[type] || { icon: '🔔', iconBg: '#F3F4F6', accent: '#6b7280' };
};

const formatRelativeTime = (dateStr: string): string => {
    try {
        const diff  = Date.now() - new Date(dateStr).getTime();
        const mins  = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days  = Math.floor(diff / 86400000);
        if (mins  < 1)  return 'just now';
        if (mins  < 60) return `${mins} min${mins  !== 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        if (days  < 7)  return `${days} day${days  !== 1 ? 's' : ''} ago`;
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch { return ''; }
};

// ============================================================================
// TYPES
// ============================================================================
type FilterTab = 'all' | 'unread' | 'read';

// ============================================================================
// DELETE CONFIRM MODAL
// ============================================================================
const DeleteConfirmModal: React.FC<{
    onConfirm: () => void;
    onCancel:  () => void;
    deleting:  boolean;
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
                <h3 className="text-base font-bold text-gray-900">Delete Notification?</h3>
                <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
                <button
                    onClick={onCancel}
                    disabled={deleting}
                    className="py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={deleting}
                    className="py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
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
    onMarkRead:   (id: string) => void;
    onDelete:     (id: string) => void;
    onClick:      () => void;
}> = ({ notification, onMarkRead, onDelete, onClick }) => {
    const config   = getNotificationConfig(notification.type);
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
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ backgroundColor: config.iconBg }}
                >
                    {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className={`text-sm font-bold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                        </h3>
                        {isUnread && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: config.accent }} />
                        )}
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-1.5">
                        {notification.message}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] text-gray-400">{formatRelativeTime(notification.createdAt)}</span>
                        <span
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: config.iconBg, color: config.accent }}
                        >
                            {notification.type.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isUnread
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
                            ? <Circle      className="w-5 h-5 text-gray-300" />
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
            flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold
            transition-all duration-200
            ${active ? 'bg-[#00598a] text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
        `}
    >
        {label}
        {count != null && count > 0 && (
            <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                active ? 'bg-white/25 text-white' : 'bg-gray-300 text-gray-600'
            }`}>
                {count}
            </span>
        )}
    </button>
);

// ============================================================================
// FILTER TAB BAR — All / Unread / Read
// ============================================================================
const FilterTabBar: React.FC<{
    active:       FilterTab;
    allCount:     number;
    unreadCount:  number;
    readCount:    number;
    onChange:     (tab: FilterTab) => void;
    loading:      boolean;
}> = ({ active, allCount, unreadCount, readCount, onChange, loading }) => {
    const tabs: { key: FilterTab; label: string; count: number; icon: React.ReactNode }[] = [
        { key: 'all',    label: 'All',    count: allCount,    icon: null },
        { key: 'unread', label: 'Unread', count: unreadCount, icon: <EyeOff className="w-3.5 h-3.5" /> },
        { key: 'read',   label: 'Read',   count: readCount,   icon: <Eye   className="w-3.5 h-3.5" /> },
    ];

    return (
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            {tabs.map(tab => (
                <button
                    key={tab.key}
                    onClick={() => onChange(tab.key)}
                    disabled={loading}
                    className={`
                        flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg
                        text-xs font-semibold transition-all duration-200 disabled:opacity-60
                        ${active === tab.key
                            ? 'bg-white text-[#00598a] shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }
                    `}
                >
                    {tab.icon}
                    {tab.label}
                    {tab.count > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                            active === tab.key ? 'bg-[#00598a] text-white' : 'bg-gray-200 text-gray-600'
                        }`}>
                            {tab.count}
                        </span>
                    )}
                    {loading && active === tab.key && <Loader2 className="w-3 h-3 animate-spin" />}
                </button>
            ))}
        </div>
    );
};

// ============================================================================
// MAIN PAGE
// ============================================================================
const NotificationsPage: React.FC = () => {
    const navigate = useNavigate();
    const { accountType, setAccountType, workerProfileId } = useAccount();
    const { user } = useAuth();

    const userId   = user?._id || localStorage.getItem('userId') || '';
    const workerId = workerProfileId || localStorage.getItem('workerId') || '';

    const currentId   = accountType === 'worker' ? workerId : userId;
    const currentRole = accountType === 'worker' ? 'Worker' : 'User';

    // ── Notification lists (one per API) ─────────────────────────────────────
    const [allNotifications,    setAllNotifications]    = useState<Notification[]>([]);
    const [readNotifications,   setReadNotifications]   = useState<Notification[]>([]);
    const [unreadNotifications, setUnreadNotifications] = useState<Notification[]>([]);

    // ── Counts ────────────────────────────────────────────────────────────────
    const [liveUnreadCount, setLiveUnreadCount] = useState(0);
    const [userUnread,      setUserUnread]      = useState(0);
    const [workerUnread,    setWorkerUnread]    = useState(0);

    // ── UI state ──────────────────────────────────────────────────────────────
    const [activeFilter,  setActiveFilter]  = useState<FilterTab>('all');
    const [loading,       setLoading]       = useState(true);
    const [filterLoading, setFilterLoading] = useState(false);
    const [refreshing,    setRefreshing]    = useState(false);
    const [error,         setError]         = useState<string | null>(null);

    // ── Delete modal ──────────────────────────────────────────────────────────
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
    const [deleting,        setDeleting]        = useState(false);

    // ── Which list to show ────────────────────────────────────────────────────
    const displayedNotifications =
        activeFilter === 'read'   ? readNotifications   :
        activeFilter === 'unread' ? unreadNotifications :
        allNotifications;

    // ============================================================================
    // FETCH — fire all 4 APIs in parallel on mount / refresh
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

            const [allRes, readRes, unreadRes, countRes] = await Promise.allSettled([
                getAllNotifications(currentRole as 'User' | 'Worker', currentId),
                getReadNotifications(currentRole as 'User' | 'Worker', currentId),
                getUnreadNotifications(currentRole as 'User' | 'Worker', currentId),
                getNotificationCount(currentRole as 'User' | 'Worker', currentId),
            ]);

            // All notifications
            if (allRes.status === 'fulfilled') {
                const sorted = [...(allRes.value.data || [])].sort((a, b) => {
                    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                });
                setAllNotifications(sorted);
                const unread = sorted.filter(n => !n.isRead).length;
                if (currentRole === 'User') setUserUnread(unread);
                else                        setWorkerUnread(unread);
            }

            // Read notifications — response is NotificationsResponse, unwrap .data
            if (readRes.status === 'fulfilled') {
                setReadNotifications(
                    [...(readRes.value.data || [])].sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                );
            } else {
                console.warn('⚠️ /read API failed:', readRes.reason);
            }

            // Unread notifications — response is NotificationsResponse, unwrap .data
            if (unreadRes.status === 'fulfilled') {
                setUnreadNotifications(
                    [...(unreadRes.value.data || [])].sort((a, b) =>
                        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                    )
                );
            } else {
                console.warn('⚠️ /unread API failed:', unreadRes.reason);
            }

            // Live count — response is NotificationCountResponse, unwrap .count
            if (countRes.status === 'fulfilled') {
                setLiveUnreadCount(countRes.value.count ?? 0);
            } else {
                console.warn('⚠️ /count API failed:', countRes.reason);
            }

        } catch (err: any) {
            setError(err.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [currentId, currentRole]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    // ── Re-fetch read/unread lists when switching filter tabs ─────────────────
    const handleFilterChange = async (tab: FilterTab) => {
        setActiveFilter(tab);
        if (tab === 'all' || !currentId) return;

        setFilterLoading(true);
        try {
            if (tab === 'read') {
                const res = await getReadNotifications(currentRole as 'User' | 'Worker', currentId);
                setReadNotifications([...(res.data || [])].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ));
            } else if (tab === 'unread') {
                const res = await getUnreadNotifications(currentRole as 'User' | 'Worker', currentId);
                setUnreadNotifications([...(res.data || [])].sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ));
            }
        } catch (err) {
            console.warn(`⚠️ Filter fetch failed for tab: ${tab}`, err);
        } finally {
            setFilterLoading(false);
        }
    };

    // ============================================================================
    // MARK READ — updates all three local lists
    // ============================================================================
    const handleMarkRead = (id: string) => {
        setUnreadNotifications(prev => prev.filter(n => n._id !== id));

        setAllNotifications(prev => {
            const found = prev.find(n => n._id === id);
            if (found && !found.isRead) {
                setReadNotifications(r => {
                    const exists = r.some(n => n._id === id);
                    return exists ? r : [{ ...found, isRead: true }, ...r];
                });
            }
            return prev.map(n => n._id === id ? { ...n, isRead: true } : n);
        });

        setLiveUnreadCount(c => Math.max(0, c - 1));
        if (currentRole === 'User') setUserUnread(c => Math.max(0, c - 1));
        else                        setWorkerUnread(c => Math.max(0, c - 1));
    };

    const handleMarkAllRead = () => {
        const unread = allNotifications.filter(n => !n.isRead).length;
        const markAll = (list: Notification[]) => list.map(n => ({ ...n, isRead: true }));

        setAllNotifications(markAll);
        setReadNotifications(prev => {
            const existingIds = new Set(prev.map(n => n._id));
            const newlyRead = allNotifications
                .filter(n => !n.isRead)
                .map(n => ({ ...n, isRead: true }))
                .filter(n => !existingIds.has(n._id));
            return [...newlyRead, ...prev];
        });
        setUnreadNotifications([]);
        setLiveUnreadCount(0);
        if (currentRole === 'User') setUserUnread(c => Math.max(0, c - unread));
        else                        setWorkerUnread(c => Math.max(0, c - unread));
    };

    // ============================================================================
    // DELETE — removes from all three local lists
    // ============================================================================
    const handleDeleteRequest  = (id: string) => setPendingDeleteId(id);
    const handleDeleteCancel   = () => { if (!deleting) setPendingDeleteId(null); };

    const handleDeleteConfirm = async () => {
        if (!pendingDeleteId) return;
        setDeleting(true);
        try {
            await deleteNotification(pendingDeleteId);

            const wasUnread = allNotifications.find(n => n._id === pendingDeleteId && !n.isRead);
            const removeById = (list: Notification[]) => list.filter(n => n._id !== pendingDeleteId);

            setAllNotifications(removeById);
            setReadNotifications(removeById);
            setUnreadNotifications(removeById);

            if (wasUnread) {
                setLiveUnreadCount(c => Math.max(0, c - 1));
                if (currentRole === 'User') setUserUnread(c => Math.max(0, c - 1));
                else                        setWorkerUnread(c => Math.max(0, c - 1));
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
        if (!n.jobId)  return;
        if (currentRole === 'Worker') navigate(`/job-details/${n.jobId}`);
        else                          navigate(`/job-applicants/${n.jobId}`);
    };

    // ── Loading screen ────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-9 h-9 animate-spin text-[#00598a]" />
                    <p className="text-sm text-gray-500">Loading notifications…</p>
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
                                <h1 className="text-lg font-bold text-gray-900">Notifications</h1>
                                <p className="text-xs text-gray-400 flex items-center gap-1.5">
                                    {liveUnreadCount > 0 ? (
                                        <>
                                            <span
                                                className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white"
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
                                    className="text-xs font-semibold text-[#00598a] px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
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
                                onClick={() => { setAccountType('user'); setActiveFilter('all'); }}
                            />
                            <RoleTab
                                label="As Worker"
                                active={accountType === 'worker'}
                                count={workerUnread}
                                onClick={() => { setAccountType('worker'); setActiveFilter('all'); }}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ── Content ───────────────────────────────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 py-5 space-y-4">

                <FilterTabBar
                    active={activeFilter}
                    allCount={allNotifications.length}
                    unreadCount={unreadNotifications.length}
                    readCount={readNotifications.length}
                    onChange={handleFilterChange}
                    loading={filterLoading}
                />

                {/* Context + live count badges */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className={`
                        text-xs font-semibold px-3 py-1.5 rounded-full
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
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 border border-orange-100">
                            🔴 {liveUnreadCount} unread
                        </span>
                    )}
                </div>

                {/* Unread banner (only on "All" tab) */}
                {liveUnreadCount > 0 && activeFilter === 'all' && (
                    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                        <span className="bg-[#00598a] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                            {liveUnreadCount} new
                        </span>
                        <p className="text-sm text-blue-700">
                            You have {liveUnreadCount} unread notification{liveUnreadCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="text-center py-10">
                        <div className="text-5xl mb-3">⚠️</div>
                        <h2 className="text-base font-bold text-gray-800 mb-1">Failed to load</h2>
                        <p className="text-sm text-gray-500 mb-4">{error}</p>
                        <button
                            onClick={() => fetchAll()}
                            className="bg-[#00598a] text-white px-5 py-2.5 rounded-xl text-sm font-semibold"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Filter loading spinner */}
                {filterLoading && (
                    <div className="flex justify-center py-6">
                        <Loader2 className="w-6 h-6 animate-spin text-[#00598a]" />
                    </div>
                )}

                {/* Notification list */}
                {!error && !filterLoading && displayedNotifications.length > 0 && (
                    <div className="space-y-3">
                        {displayedNotifications.map(n => (
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
                {!error && !filterLoading && displayedNotifications.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
                            {activeFilter === 'read'   ? <Eye     className="w-9 h-9 text-gray-300" /> :
                             activeFilter === 'unread' ? <EyeOff  className="w-9 h-9 text-gray-300" /> :
                                                         <BellOff className="w-9 h-9 text-gray-300" />
                            }
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            {activeFilter === 'read'   ? 'No Read Notifications'   :
                             activeFilter === 'unread' ? 'No Unread Notifications' :
                             'No Notifications'}
                        </h2>
                        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                            {activeFilter === 'read'
                                ? 'Notifications you have read will appear here.'
                                : activeFilter === 'unread'
                                ? "You're all caught up! No unread notifications."
                                : currentRole === 'Worker'
                                ? "You'll be notified when new jobs matching your skills are posted nearby."
                                : "You'll be notified when workers enquire about your jobs."
                            }
                        </p>
                    </div>
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