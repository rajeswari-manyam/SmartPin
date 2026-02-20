import React, { useEffect, useState } from 'react';
import { AlertCircle, Loader2, Clock, CheckCircle, AlertTriangle, ArrowLeft, Calendar, User } from 'lucide-react';
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

const ViewTicketsScreen: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string>('');
    const [userRole, setUserRole] = useState<'User' | 'Worker'>('User');

    useEffect(() => {
        // Get user data from localStorage
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
                console.log('Fetched tickets:', response);
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

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'HIGH':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'MEDIUM':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'LOW':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN':
                return 'bg-blue-100 text-blue-800';
            case 'IN_PROGRESS':
                return 'bg-purple-100 text-purple-800';
            case 'RESOLVED':
                return 'bg-green-100 text-green-800';
            case 'CLOSED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'OPEN':
                return <Clock className="w-4 h-4" />;
            case 'IN_PROGRESS':
                return <AlertTriangle className="w-4 h-4" />;
            case 'RESOLVED':
                return <CheckCircle className="w-4 h-4" />;
            case 'CLOSED':
                return <CheckCircle className="w-4 h-4" />;
            default:
                return <Clock className="w-4 h-4" />;
        }
    };

    const handleTicketClick = (ticketId: string) => {
        // Replace with: navigate(`/view-ticket-detail/${ticketId}`);
        window.location.href = `/view-ticket-detail/${ticketId}`;
    };

    const handleBackClick = () => {
        // Replace with: navigate('/raise-ticket');
        window.location.href = '/raise-ticket';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                    <p className="text-gray-600">Loading your tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={handleBackClick}
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4 font-semibold"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Create Ticket
                    </button>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">My Support Tickets</h1>
                    <p className="text-gray-600">
                        View and track all your support requests
                    </p>
                </div>

                {/* Debug Info (Remove in production) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
                        <strong>Debug Info:</strong> User ID: {userId || 'Not set'} | Role: {userRole} | Tickets: {tickets.length}
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!error && tickets.length === 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets yet</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't created any support tickets yet.
                        </p>
                        <button
                            onClick={handleBackClick}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                        >
                            Create Your First Ticket
                        </button>
                    </div>
                )}

                {/* Tickets Grid */}
                {!error && tickets.length > 0 && (
                    <div className="space-y-4">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket._id}
                                onClick={() => handleTicketClick(ticket._id)}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                            {ticket.subject}
                                        </h3>
                                        <p className="text-gray-600 line-clamp-2">
                                            {ticket.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    {/* Status Badge */}
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusColor(ticket.status)}`}>
                                        {getStatusIcon(ticket.status)}
                                        {ticket.status.replace('_', ' ')}
                                    </div>

                                    {/* Priority Badge */}
                                    <div className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority}
                                    </div>

                                    {/* Role Badge */}
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm bg-gray-100 text-gray-700">
                                        <User className="w-4 h-4" />
                                        {ticket.raisedByRole}
                                    </div>

                                    {/* Date */}
                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 ml-auto">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Info Box */}
                {tickets.length > 0 && (
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Tip:</strong> Click on any ticket to view full details and track its progress.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ViewTicketsScreen;
