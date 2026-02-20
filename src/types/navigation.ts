// Navigation and Job Types

export interface JobType {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number;
    jobData?: any;
    category?: string;
    rating?: number;
    user_ratings_total?: number;
}

export interface NavigationState {
    from?: string;
    job?: JobType;
    [key: string]: any;
}
