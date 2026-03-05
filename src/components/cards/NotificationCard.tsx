import React from 'react';
import { CheckCircle, Circle, Trash2 } from 'lucide-react';
import { Notification } from '../../services/api.service';
import { getNotificationConfig, formatRelativeTime } from '../../utils/Notificationhelper';
import typography from '../../styles/typography';

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
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                    style={{ backgroundColor: config.iconBg }}
                >
                    {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-lg font-bold truncate ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                        </h3>
                        {isUnread && (
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: config.accent }} />
                        )}
                    </div>

                    <p className="text-base text-gray-500 line-clamp-2 leading-relaxed mb-2">
                        {notification.message}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-gray-400">
                            {formatRelativeTime(notification.createdAt)}
                        </span>
                        <span
                            className="text-sm font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: config.iconBg, color: config.accent }}
                        >
                            {notification.type.replace(/_/g, ' ')}
                        </span>
                        <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${isUnread
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

export default NotificationCard;