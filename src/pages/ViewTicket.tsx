import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Clock, CheckCircle, AlertTriangle, ArrowLeft, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTicketsByUserId } from '../services/api.service';

interface Ticket {
    _id: string;
    raisedById: string;
    raisedByRole: string;
    subject: string;
    description: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
    createdAt: string;
    updatedAt: string;
}

type FilterTab = 'ALL' | 'ACTIVE' | 'RESOLVED';

const ViewTicketsScreen: React.FC = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [userRole, setUserRole] = useState<'User' | 'Worker'>('User');
    const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const user = JSON.parse(storedUser);
                setUserId(user._id || user.id || user.userId);
                setUserRole(user.role || 'User');
            }
        } catch (error) {
            console.error('Error reading user from localStorage:', error);
            setError('Failed to get user information');
        }
    }, []);

    useEffect(() => {
        const fetchTickets = async () => {
            if (!userId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await getTicketsByUserId(userId, userRole);
                setTickets(response.tickets || []);
            } catch (err: any) {
                console.error('Error fetching tickets:', err);
                setError(err.message || 'Failed to load tickets');
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [userId, userRole]);

    // Classify tickets
    const activeStatuses: Ticket['status'][] = ['OPEN', 'IN_PROGRESS'];
    const resolvedStatuses: Ticket['status'][] = ['RESOLVED', 'CLOSED'];

    const activeTickets = tickets.filter(t => activeStatuses.includes(t.status));
    const resolvedTickets = tickets.filter(t => resolvedStatuses.includes(t.status));

    const filteredTickets = activeFilter === 'ACTIVE'
        ? activeTickets
        : activeFilter === 'RESOLVED'
        ? resolvedTickets
        : tickets;

    // Derive a short ID from the full _id
    const shortId = (id: string) => id.slice(-6).toUpperCase();

    // Priority dot color
    const priorityDotColor = (priority: string) => {
        switch (priority) {
            case 'HIGH': return '#ef4444';
            case 'MEDIUM': return '#f59e0b';
            case 'LOW': return '#22c55e';
            default: return '#9ca3af';
        }
    };

    // Status badge style
    const statusBadge = (status: string) => {
        switch (status) {
            case 'OPEN':
                return { bg: '#fff0f0', text: '#e53e3e', dot: '#e53e3e' };
            case 'IN_PROGRESS':
                return { bg: '#fffbeb', text: '#d97706', dot: '#d97706' };
            case 'RESOLVED':
                return { bg: '#f0fff4', text: '#16a34a', dot: '#16a34a' };
            case 'CLOSED':
                return { bg: '#f3f4f6', text: '#6b7280', dot: '#6b7280' };
            default:
                return { bg: '#f3f4f6', text: '#6b7280', dot: '#6b7280' };
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#00598a' }} />
                    <p className="text-gray-500 text-sm">Loading your tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900">Support Tickets</h1>
                    </div>
                    <button
                        onClick={() => navigate('/raise-ticket')}
                        className="p-2 rounded-full hover:bg-blue-50 transition"
                        style={{ color: '#00598a' }}
                        title="Create new ticket"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    {/* Total */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                        <p className="text-3xl font-bold text-gray-800">{tickets.length}</p>
                        <p className="text-sm text-gray-500 mt-1">Total</p>
                    </div>
                    {/* Active */}
                    <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: '#fff0f0' }}>
                        <p className="text-3xl font-bold" style={{ color: '#e53e3e' }}>{activeTickets.length}</p>
                        <p className="text-sm mt-1" style={{ color: '#e53e3e' }}>Active</p>
                    </div>
                    {/* Resolved */}
                    <div className="rounded-2xl p-4 shadow-sm text-center" style={{ backgroundColor: '#f0fdf4' }}>
                        <p className="text-3xl font-bold" style={{ color: '#16a34a' }}>{resolvedTickets.length}</p>
                        <p className="text-sm mt-1" style={{ color: '#16a34a' }}>Resolved</p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-5">
                    {(['ALL', 'ACTIVE', 'RESOLVED'] as FilterTab[]).map((tab) => {
                        const count = tab === 'ALL' ? tickets.length : tab === 'ACTIVE' ? activeTickets.length : resolvedTickets.length;
                        const isActive = activeFilter === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveFilter(tab)}
                                className="px-4 py-2 rounded-full text-sm font-semibold transition-all border"
                                style={
                                    isActive
                                        ? { backgroundColor: '#00598a', color: '#ffffff', borderColor: '#00598a' }
                                        : { backgroundColor: '#ffffff', color: '#6b7280', borderColor: '#e5e7eb' }
                                }
                            >
                                {tab === 'ALL' ? `All (${count})` : tab === 'ACTIVE' ? `Active (${count})` : `Resolved (${count})`}
                            </button>
                        );
                    })}
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!error && filteredTickets.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">No tickets found</h3>
                        <p className="text-gray-500 text-sm mb-5">
                            {activeFilter === 'ALL'
                                ? "You haven't created any support tickets yet."
                                : `No ${activeFilter.toLowerCase()} tickets at the moment.`}
                        </p>
                        {activeFilter === 'ALL' && (
                            <button
                                onClick={() => navigate('/raise-ticket')}
                                className="px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                                style={{ backgroundColor: '#00598a' }}
                            >
                                Create Your First Ticket
                            </button>
                        )}
                    </div>
                )}

                {/* Ticket Cards */}
                {!error && filteredTickets.length > 0 && (
                    <div className="space-y-3">
                        {filteredTickets.map((ticket) => {
                            const badge = statusBadge(ticket.status);
                            return (
                                <div
                                    key={ticket._id}
                                    onClick={() => navigate(`/view-ticket-detail/${ticket._id}`)}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    {/* Card Header */}
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            {/* Priority Dot Icon */}
                                            <div
                                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                                                style={{ backgroundColor: priorityDotColor(ticket.priority) + '22' }}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full"
                                                    style={{ backgroundColor: priorityDotColor(ticket.priority) }}
                                                />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-base leading-tight">
                                                    {ticket.subject}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    ID: {shortId(ticket._id)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0"
                                            style={{ backgroundColor: badge.bg, color: badge.text }}
                                        >
                                            <div
                                                className="w-1.5 h-1.5 rounded-full"
                                                style={{ backgroundColor: badge.dot }}
                                            />
                                            {ticket.status.replace('_', ' ')}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-500 text-sm line-clamp-2 ml-12 mb-3">
                                        {ticket.description}
                                    </p>

                                    {/* Divider */}
                                    <div className="border-t border-gray-100 pt-3 flex items-center gap-2 ml-12">
                                        <Calendar className="w-4 h-4 text-gray-400" />
                                        <span className="text-xs text-gray-400">
                                            {formatDate(ticket.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom tip */}
                {filteredTickets.length > 0 && (
                    <div className="mt-5 rounded-xl p-4 border" style={{ backgroundColor: '#f0f7fc', borderColor: '#bee3f8' }}>
                        <p className="text-xs" style={{ color: '#005580' }}>
                            <strong>Tip:</strong> Tap any ticket to view full details and track its progress.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewTicketsScreen;