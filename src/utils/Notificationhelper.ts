// ============================================================================
// VISUAL HELPERS
// ============================================================================
export const getNotificationConfig = (type: string) => {
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

export const formatRelativeTime = (dateStr: string): string => {
    try {
        const diff  = Date.now() - new Date(dateStr).getTime();
        const mins  = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days  = Math.floor(diff / 86400000);
        if (mins  <  1) return 'just now';
        if (mins  < 60) return `${mins} min${mins   !== 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        if (days  <  7) return `${days} day${days   !== 1 ? 's' : ''} ago`;
        return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch { return ''; }
};