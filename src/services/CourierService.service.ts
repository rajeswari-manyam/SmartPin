// src/services/CourierService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export interface CourierWorker {
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  services?: string[];
  experience?: number;
  serviceCharge?: number;
  chargeType?: string;
  bio?: string;
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

export interface CourierWorkerResponse {
  success: boolean;
  count: number;
  data: CourierWorker[];
}

/**
 * Add a new courier service
 * @param formData FormData containing service details
 * @returns Promise<any>
 */
export const addCourierService = async (formData: FormData): Promise<any> => {
  try {
    // 🔍 Debug: Log what we're sending
    console.log('📤 Sending FormData to API:');
    const entries = Array.from(formData.entries());
    entries.forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });

    const response = await fetch(`${API_BASE_URL}/addCourierService`, {
      method: "POST",
      body: formData,
      redirect: "follow",
    });

    // 🔍 Get response text first to see what the server actually returned
    const responseText = await response.text();
    console.log('📥 Server response:', responseText);

    if (!response.ok) {
      // Try to parse error details from server response
      let errorMessage = `HTTP ${response.status}: `;

      try {
        const errorData = JSON.parse(responseText);
        errorMessage += errorData.message || errorData.error || 'Server error';

        // Log detailed error info
        console.error('❌ Server error details:', errorData);

        return {
          success: false,
          message: errorMessage,
          details: errorData
        };
      } catch {
        // If response isn't JSON, return the raw text
        errorMessage += responseText || response.statusText;

        return {
          success: false,
          message: errorMessage,
          details: { rawResponse: responseText }
        };
      }
    }

    // Parse successful response
    try {
      const result = JSON.parse(responseText);
      console.log('✅ Success:', result);
      return result;
    } catch {
      console.error('⚠️ Could not parse success response as JSON:', responseText);
      return { success: false, message: "Invalid server response" };
    }

  } catch (error: any) {
    console.error("❌ Network or fetch error:", error);
    return {
      success: false,
      message: error.message || "Network error - failed to connect to server"
    };
  }
};

/**
 * Fetch nearby courier service workers
 * @param latitude number
 * @param longitude number
 * @param distance number in km (default 5)
 * @returns Promise<CourierWorkerResponse>
 */
export const getNearbyCourierWorkers = async (
  latitude: number,
  longitude: number,
  distance: number = 5
): Promise<CourierWorkerResponse> => {
  if (!distance || distance <= 0) {
    throw new Error("Please provide a valid distance in km");
  }
  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyCourierServices?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CourierWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching courier service workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Fetch all courier services
 * @returns Promise<CourierWorkerResponse>
 */
export const getAllCourierServices = async (): Promise<CourierWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllCourierServices`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CourierWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all courier services:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Fetch a courier service by ID
 * @param id string - the courier service _id
 * @returns Promise<CourierWorker | null>
 */
export const getCourierServiceById = async (id: string): Promise<CourierWorker | null> => {
  if (!id) throw new Error("Courier service ID is required");

  try {
    const response = await fetch(`${API_BASE_URL}/getCourierServiceById/${id}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { success: boolean; data: CourierWorker } = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error(`Error fetching courier service by ID (${id}):`, error);
    return null;
  }
};

/**
 * Update an existing courier service by ID
 * @param id string - the courier service _id
 * @param formData FormData containing updated service details
 * @returns Promise<any>
 */
export const updateCourierService = async (id: string, formData: FormData): Promise<any> => {
  if (!id) throw new Error("Courier service ID is required");

  try {
    // 🔍 Debug: Log what we're sending
    console.log('📤 Updating courier service with FormData:');
    const entries = Array.from(formData.entries());
    entries.forEach(([key, value]) => {
      if (value instanceof File) {
        console.log(`  ${key}: [File] ${value.name}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });

    const response = await fetch(`${API_BASE_URL}/updateCourierService/${id}`, {
      method: "PUT",
      body: formData,
      redirect: "follow",
    });

    const responseText = await response.text();
    console.log('📥 Server response:', responseText);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: `;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += errorData.message || errorData.error || 'Server error';
        console.error('❌ Update error:', errorData);
        return { success: false, message: errorMessage, details: errorData };
      } catch {
        errorMessage += responseText || response.statusText;
        return { success: false, message: errorMessage };
      }
    }

    try {
      const result = JSON.parse(responseText);
      console.log('✅ Update success:', result);
      return result;
    } catch {
      console.error('⚠️ Invalid JSON response:', responseText);
      return { success: false, message: "Invalid server response" };
    }

  } catch (error: any) {
    console.error(`❌ Error updating courier service (${id}):`, error);
    return {
      success: false,
      message: error.message || "Network error"
    };
  }
};

/**
 * Delete a courier service by ID
 * @param id string - the courier service _id
 * @returns Promise<any>
 */
export const deleteCourierService = async (id: string): Promise<any> => {
  if (!id) throw new Error("Courier service ID is required");

  try {
    const response = await fetch(`${API_BASE_URL}/deleteCourierService/${id}`, {
      method: "DELETE",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error deleting courier service (${id}):`, error);
    return { success: false, message: "Failed to delete courier service" };
  }
};

/**
 * Fetch courier services for a specific user, optionally filtered by service name
 * @param userId string - ID of the user
 * @param serviceName string (optional) - filter by service name
 * @returns Promise<CourierWorkerResponse>
 */
export const getUserCourierServices = async (
  userId: string,
  serviceName?: string
): Promise<CourierWorkerResponse> => {
  if (!userId) throw new Error("User ID is required");

  try {
    let url = `${API_BASE_URL}/getUserCourierServices?userId=${userId}`;
    if (serviceName) {
      url += `&serviceName=${encodeURIComponent(serviceName)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CourierWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching courier services for user (${userId}):`, error);
    return { success: false, count: 0, data: [] };
  }
};
