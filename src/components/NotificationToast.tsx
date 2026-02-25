// src/components/NotificationToast.tsx
import React, { useEffect, useState, useCallback } from "react";
import { onForegroundMessage }                     from "../firebase/firebaseConfig";  // ✅ correct path
import { MessagePayload }                          from "firebase/messaging";
import { X }                                       from "lucide-react";
import { useNavigate }                             from "react-router-dom";

interface ToastData {
    id:    string;
    title: string;
    body:  string;
    icon?: string;
    url?:  string;
    type?: string;
}

const getTypeConfig = (type?: string) => {
    const map: Record<string, { bg: string; accent: string; emoji: string }> = {
        NEW_JOB:       { bg: "#EEF2FF", accent: "#6366f1", emoji: "🆕" },
        JOB_ENQUIRY:   { bg: "#DBEAFE", accent: "#3b82f6", emoji: "📩" },
        JOB_CONFIRMED: { bg: "#D1FAE5", accent: "#10b981", emoji: "✅" },
        PAYMENT:       { bg: "#FEF3C7", accent: "#f59e0b", emoji: "💰" },
        JOB_COMPLETED: { bg: "#F3E8FF", accent: "#8b5cf6", emoji: "🔧" },
        NEW_MESSAGE:   { bg: "#DBEAFE", accent: "#3b82f6", emoji: "💬" },
    };
    return map[type || ""] || { bg: "#F0F9FF", accent: "#00598a", emoji: "🔔" };
};

// ── Single Toast ──────────────────────────────────────────────────
const Toast: React.FC<{ toast: ToastData; onClose: (id: string) => void }> = ({ toast, onClose }) => {
    const navigate = useNavigate();
    const config   = getTypeConfig(toast.type);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 30);
        return () => clearTimeout(t);
    }, []);

    const handleClick = () => {
        onClose(toast.id);
        navigate(toast.url || "/notifications");
    };

    return (
        <div
            onClick={handleClick}
            className="cursor-pointer w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex items-start gap-3 p-4 transition-all duration-300"
            style={{
                opacity:    visible ? 1 : 0,
                transform:  visible ? "translateY(0)" : "translateY(16px)",
                borderLeft: `4px solid ${config.accent}`,
            }}
        >
            {/* Icon */}
            <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ backgroundColor: config.bg }}
            >
                {toast.icon
                    ? <img src={toast.icon} alt="" className="w-7 h-7 rounded" />
                    : config.emoji
                }
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{toast.title}</p>
                <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{toast.body}</p>
                <p className="text-[10px] font-semibold mt-1" style={{ color: config.accent }}>
                    Tap to view →
                </p>
            </div>

            {/* Close */}
            <button
                onClick={e => { e.stopPropagation(); onClose(toast.id); }}
                className="flex-shrink-0 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>
        </div>
    );
};

// ── Toast Container ───────────────────────────────────────────────
const NotificationToast: React.FC = () => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    useEffect(() => {
        // onForegroundMessage now returns the unsubscribe function directly ✅
        const unsubscribe = onForegroundMessage((payload: MessagePayload) => {
            console.log("📲 Foreground FCM message:", payload);

            // Play notification sound
            try {
                const audio = new Audio("/notification-sound.mp3");
                audio.volume = 0.6;
                audio.play().catch(() => {});
            } catch {}

            const toast: ToastData = {
                id:    Date.now().toString(),
                title: payload.notification?.title || (payload.data as any)?.title || "New Notification",
                body:  payload.notification?.body  || (payload.data as any)?.body  || "",
                icon:  payload.notification?.icon  || (payload.data as any)?.icon,
                url:   (payload.data as any)?.url,
                type:  (payload.data as any)?.type,
            };

            setToasts(prev => [toast, ...prev].slice(0, 5));
            setTimeout(() => removeToast(toast.id), 6000);
        });

        return () => unsubscribe();   // cleanup on unmount
    }, [removeToast]);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-4 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className="pointer-events-auto">
                    <Toast toast={t} onClose={removeToast} />
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;