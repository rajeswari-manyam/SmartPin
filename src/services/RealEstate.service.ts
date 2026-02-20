import axios from "axios";

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ;

// ============================================================================
// REAL ESTATE WORKER INTERFACE
// ============================================================================
export interface RealEstateWorker {
    _id?: string;
    userId: string;
    name: string;
    propertyType: string;
    listingType: string;
    email: string;
    phone: string;
    price: number;
    areaSize: number;
    bedrooms: number;
    bathrooms: number;
    furnishingStatus: string;
    availabilityStatus: string;
    address: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    amenities: string;
    description: string;
    images?: string[];
    createdAt?: string;
    updatedAt?: string;
}

export interface RealEstateApiResponse {
    success: boolean;
    message?: string;
    data?: RealEstateWorker | RealEstateWorker[];
    realEstate?: RealEstateWorker;
    realEstates?: RealEstateWorker[];
}

// ============================================================================
// CREATE REAL ESTATE SERVICE
// ============================================================================
export const addRealEstateService = async (formData: FormData): Promise<RealEstateApiResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/createRealEstate`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Add Real Estate Service API error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Add Real Estate Service response:', data);
        return data;
    } catch (error) {
        console.error('Add real estate service error:', error);
        throw error;
    }
};

// ============================================================================
// UPDATE REAL ESTATE SERVICE
// ============================================================================
export const updateRealEstateService = async (
    id: string,
    formData: FormData
): Promise<RealEstateApiResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/updateRealEstate/${id}`, {
            method: 'PUT',
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Update Real Estate Service API error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Update Real Estate Service response:', data);
        return data;
    } catch (error) {
        console.error('Update real estate service error:', error);
        throw error;
    }
};

// ============================================================================
// GET REAL ESTATE SERVICE BY ID
// ============================================================================
export const getRealEstateServiceById = async (id: string): Promise<RealEstateApiResponse> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getRealEstateById/${id}`);
        return response.data;
    } catch (error) {
        console.error('Get real estate by ID error:', error);
        throw error;
    }
};

// ============================================================================
// GET USER'S REAL ESTATE SERVICES
// ============================================================================
export const getUserRealEstates = async (userId: string): Promise<RealEstateApiResponse> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getUserRealEstates`, {
            params: { userId },
        });
        return response.data;
    } catch (error) {
        console.error('Get user real estates error:', error);
        throw error;
    }
};

// ============================================================================
// DELETE REAL ESTATE SERVICE
// ============================================================================
export const deleteRealEstateService = async (realEstateId: string): Promise<RealEstateApiResponse> => {
    try {
        const response = await axios.delete(`${API_BASE_URL}/deleteRealEstate/${realEstateId}`);
        return response.data;
    } catch (error) {
        console.error('Delete real estate service error:', error);
        throw error;
    }
};

// ============================================================================
// GET ALL REAL ESTATE SERVICES
// ============================================================================
export const getAllRealEstateServices = async (): Promise<RealEstateApiResponse> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getAllRealEstates`);
        return response.data;
    } catch (error) {
        console.error('Get all real estate services error:', error);
        throw error;
    }
};

// ============================================================================
// GET NEARBY REAL ESTATE SERVICES
// ============================================================================
export const getNearbyRealEstates = async (
    latitude: number,
    longitude: number,
    range: number = 10
): Promise<RealEstateApiResponse> => {
    try {
        const url = `${API_BASE_URL}/getNearbyRealEstates?latitude=${latitude}&longitude=${longitude}&range=${range}`;

        console.log('Fetching nearby real estates with URL:', url);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Get Nearby Real Estates API error:', errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const data = await response.json();
        console.log('Nearby Real Estates response:', data);
        return data;
    } catch (error) {
        console.error('Get nearby real estates error:', error);
        throw error;
    }
};
