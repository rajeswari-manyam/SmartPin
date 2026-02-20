import { Job } from '../../types/Job';

// Format relative time
export const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
};

// Urgency badge color
export const getUrgencyColor = (urgency: Job['urgency']): string => {
    switch (urgency) {
        case 'high': return 'bg-red-100 text-red-700 border-red-200';
        case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'low': return 'bg-green-100 text-green-700 border-green-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};
