// types.ts - All type definitions

export type PaymentType = 'Hourly' | 'Fixed';
export type TabType = 'matched' | 'invitations' | 'my-jobs';
export type JobCategory = 'plumbing' | 'electrical' | 'carpentry' | 'painting' | 'cleaning' | 'other';
export type JobStatus = 'available' | 'in-progress' | 'completed' | 'cancelled';

export interface Job {
    id: string;
    title: string;
    description: string;
    paymentType: PaymentType;
    rate: number;
    currency: string;
    distance: number;
    category: JobCategory;
    status: JobStatus;
    postedAt: Date;
    location: {
        latitude: number;
        longitude: number;
        address: string;
    };
    client: {
        id: string;
        name: string;
        rating: number;
        reviewCount: number;
        verified: boolean;
    };
    requirements?: string[];
    estimatedDuration?: number;
    urgency: 'low' | 'medium' | 'high';
}

export interface JobCardProps {
    job: Job;
    index?: number;
    onViewDetails?: (jobId: string) => void;
    onAccept?: (jobId: string) => void;
}

// Renamed from Props to NearByJobsProps
export interface NearByJobsProps {
    initialTab?: TabType;
    jobs?: Job[];
    onJobAccept?: (jobId: string) => Promise<void>;
    onJobView?: (jobId: string) => void;
}

export interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
}
