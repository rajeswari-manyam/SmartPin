/**
 * ============================================================================
 * foodServiceAPI.ts - Food Services API Integration
 * ============================================================================
 * 
 * Centralized API service for all food service operations
 * - Create, Read, Update, Delete operations
 * - Error handling
 * - Type safety
 * - Environment-based configuration
 * 
 * @module foodServiceAPI
 * @version 1.0.0
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FoodService {
    _id: string;
    userId: string;
    name: string;
    type: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    icon: string;
    status: boolean;
    latitude: string;
    longitude: string;
    createdAt?: string;
    updatedAt?: string;

    // Optional properties for display cards / Google Maps like info
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: { open_now: boolean };
    geometry?: { location: { lat: number; lng: number } };
}

export interface CreateFoodServiceData {
    userId: string;
    name: string;
    type: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    icon: string;
    status: string; // 'true' or 'false' as string
    latitude: string;
    longitude: string;
}

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}

// ============================================================================
// API Configuration - Using Environment Variable
// ============================================================================

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '';

export const API_ENDPOINTS = {
    CREATE: `${API_BASE_URL}/create`,
    GET_ALL: `${API_BASE_URL}/getAllFoodServices`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/getFoodServiceById/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/updateFoodService/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/deleteFoodService/${id}`,
};

// ============================================================================
// API Service Class
// ============================================================================

class FoodServiceAPI {
    /**
     * Create a new food service
     * @param data - Food service data
     * @returns Promise with API response
     */
    static async createFoodService(
        data: CreateFoodServiceData
    ): Promise<APIResponse<FoodService>> {
        try {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

            const urlencoded = new URLSearchParams();
            Object.entries(data).forEach(([key, value]) => {
                urlencoded.append(key, value);
            });

            const requestOptions: RequestInit = {
                method: 'POST',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow',
            };

            const response = await fetch(API_ENDPOINTS.CREATE, requestOptions);
            const result = await response.text();
            const parsedResult = JSON.parse(result);

            return {
                success: true,
                data: parsedResult,
                message: 'Food service created successfully',
            };
        } catch (error) {
            console.error('❌ Create Food Service Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to create food service',
            };
        }
    }

    /**
     * Get all food services
     * @returns Promise with array of food services
     */
    static async getAllFoodServices(): Promise<APIResponse<FoodService[]>> {
        try {
            const requestOptions: RequestInit = {
                method: 'GET',
                redirect: 'follow',
            };

            const response = await fetch(API_ENDPOINTS.GET_ALL, requestOptions);
            const result = await response.text();
            const parsedResult = JSON.parse(result);

            return {
                success: true,
                data: Array.isArray(parsedResult) ? parsedResult : [],
                message: 'Food services fetched successfully',
            };
        } catch (error) {
            console.error('❌ Get All Food Services Error:', error);
            return {
                success: false,
                data: [],
                error: error instanceof Error ? error.message : 'Failed to fetch food services',
            };
        }
    }

    /**
     * Get food service by ID
     * @param id - Food service ID
     * @returns Promise with food service data
     */
    static async getFoodServiceById(id: string): Promise<APIResponse<FoodService>> {
        try {
            const requestOptions: RequestInit = {
                method: 'GET',
                redirect: 'follow',
            };

            const response = await fetch(API_ENDPOINTS.GET_BY_ID(id), requestOptions);
            const result = await response.text();
            const parsedResult = JSON.parse(result);

            return {
                success: true,
                data: parsedResult,
                message: 'Food service fetched successfully',
            };
        } catch (error) {
            console.error('❌ Get Food Service By ID Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to fetch food service',
            };
        }
    }

    /**
     * Update an existing food service
     * @param id - Food service ID
     * @param data - Updated food service data
     * @returns Promise with API response
     */
    static async updateFoodService(
        id: string,
        data: CreateFoodServiceData
    ): Promise<APIResponse<FoodService>> {
        try {
            const myHeaders = new Headers();
            myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');

            const urlencoded = new URLSearchParams();
            Object.entries(data).forEach(([key, value]) => {
                urlencoded.append(key, value);
            });

            const requestOptions: RequestInit = {
                method: 'PUT',
                headers: myHeaders,
                body: urlencoded,
                redirect: 'follow',
            };

            const response = await fetch(API_ENDPOINTS.UPDATE(id), requestOptions);
            const result = await response.text();
            const parsedResult = JSON.parse(result);

            return {
                success: true,
                data: parsedResult,
                message: 'Food service updated successfully',
            };
        } catch (error) {
            console.error('❌ Update Food Service Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to update food service',
            };
        }
    }

    /**
     * Delete a food service
     * @param id - Food service ID
     * @returns Promise with API response
     */
    static async deleteFoodService(id: string): Promise<APIResponse<void>> {
        try {
            const requestOptions: RequestInit = {
                method: 'DELETE',
                redirect: 'follow',
            };

            const response = await fetch(API_ENDPOINTS.DELETE(id), requestOptions);
            const result = await response.text();
            const parsedResult = JSON.parse(result);

            return {
                success: true,
                message: 'Food service deleted successfully',
            };
        } catch (error) {
            console.error('❌ Delete Food Service Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to delete food service',
            };
        }
    }

    /**
     * Test API connection
     * @returns Promise with connection status
     */
    static async testConnection(): Promise<APIResponse<{ status: string }>> {
        try {
            const response = await fetch(API_ENDPOINTS.GET_ALL);
            if (response.ok) {
                return {
                    success: true,
                    data: { status: 'connected' },
                    message: 'API connection successful',
                };
            } else {
                return {
                    success: false,
                    error: 'API connection failed',
                };
            }
        } catch (error) {
            console.error('❌ API Connection Test Error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'API connection failed',
            };
        }
    }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Format food service data for display
 */
export const formatFoodService = (service: FoodService): string => {
    return `${service.icon} ${service.name} - ${service.area}, ${service.city}`;
};

/**
 * Validate food service data before submission
 */
export const validateFoodServiceData = (data: CreateFoodServiceData): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (!data.name.trim()) {
        errors.push('Name is required');
    }

    if (!data.type.trim()) {
        errors.push('Type is required');
    }

    if (!data.area.trim()) {
        errors.push('Area is required');
    }

    if (!data.city.trim()) {
        errors.push('City is required');
    }

    if (!data.state.trim()) {
        errors.push('State is required');
    }

    if (data.pincode && !/^\d{6}$/.test(data.pincode)) {
        errors.push('Pincode must be 6 digits');
    }

    if (data.latitude && isNaN(parseFloat(data.latitude))) {
        errors.push('Latitude must be a valid number');
    }

    if (data.longitude && isNaN(parseFloat(data.longitude))) {
        errors.push('Longitude must be a valid number');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};

/**
 * Filter food services by type
 */
export const filterByType = (services: FoodService[], type: string): FoodService[] => {
    return services.filter((service) => service.type === type);
};

/**
 * Filter food services by city
 */
export const filterByCity = (services: FoodService[], city: string): FoodService[] => {
    return services.filter((service) => service.city.toLowerCase() === city.toLowerCase());
};

/**
 * Filter active food services
 */
export const filterActive = (services: FoodService[]): FoodService[] => {
    return services.filter((service) => service.status === true);
};

/**
 * Sort food services by name
 */
export const sortByName = (services: FoodService[]): FoodService[] => {
    return [...services].sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Get unique cities from food services
 */
export const getUniqueCities = (services: FoodService[]): string[] => {
    const cities = services.map((service) => service.city);
    return Array.from(new Set(cities)).sort();
};

/**
 * Get unique types from food services
 */
export const getUniqueTypes = (services: FoodService[]): string[] => {
    const types = services.map((service) => service.type);
    return Array.from(new Set(types)).sort();
};

// ============================================================================
// Export API Service
// ============================================================================

export default FoodServiceAPI;
