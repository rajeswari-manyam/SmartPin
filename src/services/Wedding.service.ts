// src/services/Wedding.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* =========================
   INTERFACES
========================= */

export interface WeddingWorker {
  _id?: string;
  userId?: string;
  serviceName?: string;
  description?: string;
  subCategory?: string;
  category?: string;
  services?: string[];
  phone?: string;           // ✅ already present — used by phone field
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

export interface WeddingWorkerResponse {
  success: boolean;
  count: number;
  data: WeddingWorker[];
}

export interface SingleWeddingWorkerResponse {
  success: boolean;
  data: WeddingWorker;
  message?: string;
}

/* =========================
   API METHODS
========================= */

/** Add a new wedding service */
export const addWeddingService = async (workerData: FormData): Promise<SingleWeddingWorkerResponse> => {
  try {
    console.log("📤 Adding wedding service...");

    const response = await fetch(`${API_BASE_URL}/addWeddingService`, {
      method: "POST",
      body: workerData,
      redirect: "follow",
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Add Wedding Service Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SingleWeddingWorkerResponse = await response.json();
    console.log("✅ Service added successfully:", data);
    return data;
  } catch (error) {
    console.error("❌ Error adding wedding service:", error);
    throw error;
  }
};

/** Update a wedding service by ID */
export const updateWeddingService = async (id: string, workerData: FormData): Promise<SingleWeddingWorkerResponse> => {
  try {
    console.log(`📤 Updating wedding service ${id}...`);

    const response = await fetch(`${API_BASE_URL}/updateWeddingService/${id}`, {
      method: "PUT",
      body: workerData,
      redirect: "follow",
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Update Wedding Service Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SingleWeddingWorkerResponse = await response.json();
    console.log("✅ Service updated successfully:", data);
    return data;
  } catch (error) {
    console.error(`❌ Error updating wedding service with ID ${id}:`, error);
    throw error;
  }
};

/** Fetch all wedding services */
export const getAllWeddingServices = async (): Promise<WeddingWorkerResponse> => {
  try {
    console.log("📤 Fetching all wedding services...");

    const response = await fetch(`${API_BASE_URL}/getAllWeddingServices`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get All Wedding Services Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WeddingWorkerResponse = await response.json();
    console.log("✅ All services fetched:", data.count);
    return data;
  } catch (error) {
    console.error("❌ Error fetching all wedding services:", error);
    return { success: false, count: 0, data: [] };
  }
};

/** Fetch a wedding service by ID */
export const getWeddingServiceById = async (id: string): Promise<SingleWeddingWorkerResponse> => {
  try {
    console.log(`📤 Fetching wedding service ${id}...`);

    const response = await fetch(`${API_BASE_URL}/getWeddingServiceById/${id}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get Wedding Service By ID Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SingleWeddingWorkerResponse = await response.json();
    console.log("✅ Service fetched:", data);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching wedding service with ID ${id}:`, error);
    throw error;
  }
};

/** Fetch nearby wedding services */
export const getNearbyWeddingWorkers = async (
  latitude: number,
  longitude: number,
  distance: number = 5
): Promise<WeddingWorkerResponse> => {
  if (!distance || distance <= 0) {
    throw new Error("Please provide a valid distance in km");
  }

  try {
    console.log("📤 Fetching nearby wedding services:", { latitude, longitude, distance });

    const response = await fetch(
      `${API_BASE_URL}/getNearbyWeddingServices?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Get Nearby Wedding Services Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: WeddingWorkerResponse = await response.json();
    console.log("✅ Nearby services fetched:", data.count);
    return data;
  } catch (error) {
    console.error("❌ Error fetching nearby wedding services:", error);
    return { success: false, count: 0, data: [] };
  }
};

/** Delete a wedding service by ID */
export const deleteWeddingService = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    console.log(`📤 Deleting wedding service ${id}...`);

    const response = await fetch(`${API_BASE_URL}/deleteWeddingService/${id}`, {
      method: "DELETE",
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Delete Wedding Service Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Service deleted successfully");
    return { success: true, message: data.message || "Deleted successfully" };
  } catch (error) {
    console.error(`❌ Error deleting wedding service with ID ${id}:`, error);
    return { success: false, message: "Failed to delete wedding service" };
  }
};

/** Fetch user's wedding services */
export const getUserWeddingServices = async (
  userId: string
): Promise<{ success: boolean; count?: number; data?: WeddingWorker[] }> => {
  if (!userId) {
    console.error("❌ getUserWeddingServices: userId is required");
    return { success: false, data: [] };
  }

  try {
    console.log("═══════════════════════════════════════");
    console.log("🔍 getUserWeddingServices");
    console.log("═══════════════════════════════════════");
    console.log("📋 UserId:", userId);

    const url = `${API_BASE_URL}/getUserWedding?userId=${userId}`;
    console.log("📡 Request URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      redirect: "follow",
    });

    console.log("📥 Response status:", response.status);
    console.log("📥 Response OK:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);

      if (response.status === 404) {
        console.warn("⚠️ Endpoint not found or no services for this user");
        return { success: false, data: [], count: 0 };
      } else if (response.status === 500) {
        console.error("⚠️ Server error");
        return { success: false, data: [] };
      }

      return { success: false, data: [] };
    }

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      console.error("❌ Response is not JSON");
      return { success: false, data: [] };
    }

    const data = await response.json();
    console.log("✅ API Response data:", data);

    let servicesData: WeddingWorker[] = [];

    if (Array.isArray(data)) {
      servicesData = data;
    } else if (data && Array.isArray(data.data)) {
      servicesData = data.data;
    } else if (data && data.success && Array.isArray(data.data)) {
      servicesData = data.data;
    } else if (data && Array.isArray(data.services)) {
      servicesData = data.services;
    } else if (data && typeof data === 'object') {
      const keys = Object.keys(data);
      for (const key of keys) {
        if (Array.isArray(data[key])) {
          servicesData = data[key];
          break;
        }
      }
    }

    console.log("═══════════════════════════════════════");
    console.log("📊 FINAL RESULTS — Services found:", servicesData.length);
    console.log("═══════════════════════════════════════");

    return { success: true, data: servicesData, count: servicesData.length };
  } catch (error) {
    console.error("❌ getUserWeddingServices exception:", error);
    return { success: false, data: [] };
  }
};