import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

/* ================= TYPES ================= */

interface Notification {
    id: number;
    icon: "workers" | "message" | "confirmed";
    title: string;
    description: string;
    timestamp: string;
    isRead: boolean;
}

/* ================= COMPONENT ================= */

const NotificationsScreen: React.FC = () => {
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: 1,
            icon: "workers",
            title: "Workers Matched!",
            description: "12 qualified workers found for your plumbing job request",
            timestamp: "5 minutes ago",
            isRead: false,
        },
        {
            id: 2,
            icon: "message",
            title: "New Message",
            description: 'Ramesh Kumar: "I can start the work tomorrow morning"',
            timestamp: "25 minutes ago",
            isRead: false,
        },
        {
            id: 3,
            icon: "confirmed",
            title: "Job Confirmed",
            description: "Plumbing job scheduled for Dec 15, 2:00 PM",
            timestamp: "2 hours ago",
            isRead: false,
        },
    ]);

    const handleBack = () => {
        navigate(-1);
    };

    const markAllAsRead = () => {
        setNotifications((prev) =>
            prev.map((n) => ({ ...n, isRead: true }))
        );
    };

    const getNotificationIcon = (type: Notification["icon"]) => {
        switch (type) {
            case "workers":
                return <span className="text-3xl">🎉</span>;
            case "message":
                return <MessageCircle size={26} className="text-blue-500" />;
            case "confirmed":
                return <CheckCircle2 size={26} className="text-green-500" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 font-['Poppins']">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                {/* ================= HEADER ================= */}
                <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 px-8 py-6 flex items-center justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        className="text-white border-white hover:bg-white/10"
                    >
                        <span className="flex items-center gap-3">
                            <ArrowLeft size={22} />
                            Back
                        </span>
                    </Button>

                    <Button
                        variant="secondary"
                        onClick={markAllAsRead}
                    >
                        Mark all read
                    </Button>
                </div>

                {/* ================= CONTENT ================= */}
                <div className="p-8">
                    <h2 className={`${typography.heading.h3} text-slate-900 mb-8`}>
                        Recent Updates
                    </h2>

                    <div className="space-y-4">
                        {notifications.map((notification, index) => (
                            <div
                                key={notification.id}
                                className="group relative bg-white border-l-4 border-blue-600 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer animate-[slideIn_0.4s_ease-out]"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        {getNotificationIcon(notification.icon)}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className={`${typography.card.title} group-hover:text-blue-600 transition-colors`}>
                                            {notification.title}
                                        </h3>

                                        <p className={`${typography.body.base} text-slate-600 mt-1`}>
                                            {notification.description}
                                        </p>

                                        <p className="text-sm text-slate-400 mt-1">
                                            {notification.timestamp}
                                        </p>
                                    </div>

                                    {/* Unread Dot */}
                                    {!notification.isRead && (
                                        <div className="w-3 h-3 bg-blue-600 rounded-full mt-2" />
                                    )}
                                </div>

                                {/* Hover Border */}
                                <div className="absolute inset-0 border border-transparent group-hover:border-blue-200 rounded-xl transition-colors pointer-events-none" />
                            </div>
                        ))}
                    </div>

                    {/* ================= EMPTY STATE ================= */}
                    {notifications.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">🔔</div>
                            <h3 className={`${typography.heading.h5}`}>
                                No notifications yet
                            </h3>
                            <p className={`${typography.body.base} text-slate-600`}>
                                We'll notify you when something important happens
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Animations */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
        </div>
    );
};

export default NotificationsScreen;
