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
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    category: string;
    subcategory: string;
    // Additional fields from backend
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    images: string[];
    createdAt: string;
    updatedAt: string;
}

export interface JobDetailsProps {
    title: string;
    customerDetails: CustomerDetails;
    jobInformation: JobInformation;
    mapUrl: string;
    onMapClick?: () => void;
    onCall?: (phone: string) => void;
    onMessage?: () => void;
    onAcceptJob?: () => void;
}
