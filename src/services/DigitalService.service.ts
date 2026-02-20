// src/services/DigitalService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export interface DigitalWorker {
  _id?: string;
  userId?: string;
  // ✅ API field names
  serviceName?: string;       // API sends this — primary name field
  name?: string;              // fallback
  description?: string;       // API sends this — primary description field
  bio?: string;               // fallback
  subCategory?: string;       // API sends this (e.g. "Web Development")
  category?: string;          // broad category (e.g. "Tech & Digital Services")
  email?: string;
  phone?: string;
  services?: string[];
  experience?: number;
  serviceCharge?: number;
  chargeType?: string;
  images?: string[];
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  availability?: boolean;
  rating?: number;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface DigitalWorkerResponse {
  success: boolean;
  count: number;
  data: DigitalWorker[];
}

/**
 * Add a new digital service
 */
export const addDigitalService = async (formData: FormData): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/addDigitalService`, {
      method: "POST",
      body: formData,
      redirect: "follow",
    });

    const responseText = await response.text();

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return { success: false, message: errorData.message || errorData.error || "Server error", details: errorData };
      } catch {
        return { success: false, message: responseText || response.statusText };
      }
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return { success: false, message: "Invalid server response" };
    }
  } catch (error: any) {
    console.error("❌ Network or fetch error:", error);
    return { success: false, message: error.message || "Network error" };
  }
};

/**
 * Fetch nearby digital service workers
 */
export const getNearbyDigitalWorkers = async (
  latitude: number,
  longitude: number,
  distance: number = 5
): Promise<DigitalWorkerResponse> => {
  if (!distance || distance <= 0) throw new Error("Please provide a valid distance in km");
  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyDigitalServices?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching digital service workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Fetch all digital services
 */
export const getAllDigitalServices = async (): Promise<DigitalWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllDigitalServices`, {
      method: "GET",
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching all digital services:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Fetch a digital service by ID
 */
export const getDigitalServiceById = async (id: string): Promise<DigitalWorker | null> => {
  if (!id) throw new Error("Digital service ID is required");
  try {
    const response = await fetch(`${API_BASE_URL}/getDigitalServiceById/${id}`, {
      method: "GET",
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data: { success: boolean; data: DigitalWorker } = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error(`Error fetching digital service by ID (${id}):`, error);
    return null;
  }
};

/**
 * Update an existing digital service by ID
 */
export const updateDigitalService = async (id: string, formData: FormData): Promise<any> => {
  if (!id) throw new Error("Digital service ID is required");
  try {
    const response = await fetch(`${API_BASE_URL}/updateDigitalService/${id}`, {
      method: "PUT",
      body: formData,
      redirect: "follow",
    });
    const responseText = await response.text();
    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        return { success: false, message: errorData.message || errorData.error || "Server error", details: errorData };
      } catch {
        return { success: false, message: responseText || response.statusText };
      }
    }
    try {
      return JSON.parse(responseText);
    } catch {
      return { success: false, message: "Invalid server response" };
    }
  } catch (error: any) {
    console.error(`❌ Error updating digital service (${id}):`, error);
    return { success: false, message: error.message || "Network error" };
  }
};

/**
 * Delete a digital service by ID
 */
export const deleteDigitalService = async (id: string): Promise<any> => {
  if (!id) throw new Error("Digital service ID is required");
  try {
    const response = await fetch(`${API_BASE_URL}/deleteDigitalService/${id}`, {
      method: "DELETE",
      redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error deleting digital service (${id}):`, error);
    return { success: false, message: "Failed to delete digital service" };
  }
};

/**
 * Fetch digital services for a specific user
 */
export const getUserDigitalServices = async (
  userId: string,
  serviceName?: string
): Promise<DigitalWorkerResponse> => {
  if (!userId) throw new Error("User ID is required");
  try {
    let url = `${API_BASE_URL}/getUserDigitalServices?userId=${userId}`;
    if (serviceName) url += `&serviceName=${encodeURIComponent(serviceName)}`;
    const response = await fetch(url, { method: "GET", redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching digital services for user (${userId}):`, error);
    return { success: false, count: 0, data: [] };
  }
};