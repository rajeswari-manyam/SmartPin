// Shared TypeScript interfaces for job-related components

export interface CustomerDetails {
    name: string;
    phone: string;
    distance: string;
    rating: number;
    reviewCount: number;
}

export interface JobInformation {
    type: string;
    budget: string;
    budgetType: "hour" | "fixed";
}

export interface JobDetailsProps {
    title: string;
    customerDetails: CustomerDetails;
    jobInformation: JobInformation;
    mapUrl?: string;
    onMapClick?: () => void;
    onCall?: (phone: string) => void;
    onMessage?: () => void;
    onAcceptJob?: () => void;
}
