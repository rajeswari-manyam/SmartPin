import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react';

type NotificationType = 'workers_matched' | 'new_message' | 'job_confirmed' | 'payment' | 'job_completed';

interface Notification {
    id: string;
    type: NotificationType;
    icon: string;
    iconColor: string;
    iconBg: string;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
}

const staticNotifications: Notification[] = [
    {
        id: '1',
        type: 'workers_matched',
        icon: '🎉',
        iconColor: '#6366f1',
        iconBg: '#EEF2FF',
        title: 'Workers Matched!',
        message: '12 qualified workers found for your plumbing job request',
        timestamp: '5 minutes ago',
        read: false,
    },
    {
        id: '2',
        type: 'new_message',
        icon: '💬',
        iconColor: '#3b82f6',
        iconBg: '#DBEAFE',
        title: 'New Message',
        message: 'Ramesh Kumar: "I can start the work tomorrow morning"',
        timestamp: '25 minutes ago',
        read: false,
    },
    {
        id: '3',
        type: 'job_confirmed',
        icon: '✅',
        iconColor: '#10b981',
        iconBg: '#D1FAE5',
        title: 'Job Confirmed',
        message: 'Plumbing job scheduled for Dec 15, 2:00 PM',
        timestamp: '2 hours ago',
        read: false,
    },
    {
        id: '4',
        type: 'payment',
        icon: '💰',
        iconColor: '#f59e0b',
        iconBg: '#FEF3C7',
        title: 'Payment Received',
        message: '₹850 received for electrical work',
        timestamp: '1 day ago',
        read: true,
    },
    {
        id: '5',
        type: 'job_completed',
        icon: '🔧',
        iconColor: '#8b5cf6',
        iconBg: '#F3E8FF',
        title: 'Job Completed',
        message: 'Carpenter work completed successfully. Please rate your experience.',
        timestamp: '2 days ago',
        read: true,
    },
];

const NotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>(staticNotifications);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, read: true } : notif
            )
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev =>
            prev.map(notif => ({ ...notif, read: true }))
        );
    };

    const handleBack = () => {
        // Navigate back logic here
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-4 sm:py-6">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-6 h-6" />
                            <span className="text-lg font-semibold">Back</span>
                        </button>

                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllAsRead}
                                className="text-blue-600 hover:text-blue-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Title Section */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Recent Updates</h1>
                    {unreadCount > 0 && (
                        <div className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            {unreadCount} new
                        </div>
                    )}
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`bg-white rounded-lg p-4 shadow-sm border-l-4 transition-all hover:shadow-md ${!notification.read
                                    ? 'border-l-blue-600 bg-blue-50/30'
                                    : 'border-l-transparent'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <div
                                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: notification.iconBg }}
                                >
                                    <span className="text-2xl">{notification.icon}</span>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-base font-bold text-gray-900">
                                            {notification.title}
                                        </h3>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {notification.timestamp}
                                    </p>
                                </div>

                                {/* Mark as Read Button */}
                                <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    {notification.read ? (
                                        <CheckCircle className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-gray-400" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {notifications.length === 0 && (
                    <div className="text-center py-16 px-6">
                        <div className="text-6xl mb-4">🔔</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">
                            No Notifications
                        </h2>
                        <p className="text-sm text-gray-600">
                            You're all caught up! Check back later for updates.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
