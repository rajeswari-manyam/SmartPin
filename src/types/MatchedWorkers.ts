// types/MatchedWorkers.ts

export interface MatchedWorkersProps {
    id: string | number;
    name: string;
    initials: string;
    rating: number;
    reviews: number;
    distance: string;
    price: string;
    priceValue: number; // ✅ Added for filtering/sorting
    experience: string;
    experienceYears: number; // ✅ Added for filtering
    category?: string;
    email?: string;
    latitude?: number;
    longitude?: number;
    isActive?: boolean;
}
