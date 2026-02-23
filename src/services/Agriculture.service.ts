// src/services/Agriculture.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface AgricultureWorker {
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  services?: string[];
  experience?: number;
  serviceCharge?: number;
  bio?: string;
  images?: string[];
  area?: string;
  city?: string;
  state?: string;
  pinCode?: string;
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

export interface AgricultureWorkerResponse {
  success: boolean;
  count: number;
  data: AgricultureWorker[];
}

/**
 * Fetch nearby agriculture service workers
 */
export const getNearbyAgricultureWorkers = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<AgricultureWorkerResponse> => {
  if (!distance || distance <= 0) {
    throw new Error("Please provide a valid distance in km");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyAgriculture?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AgricultureWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching agriculture workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

// ── ADD payload ──────────────────────────────────────────────────────────────
export interface AddAgriculturePayload {
  userId: string;
  serviceName: string;
  phone: string;        // ✅ ADDED
  description: string;
  subCategory: string;
  serviceCharge: number;
  chargeType: string;
  latitude: number;
  longitude: number;
  area: string;
  city: string;
  state: string;
  pinCode: string;      // ✅ ADDED
  images: File[];
}

export const addAgricultureService = async (
  payload: AddAgriculturePayload
): Promise<any> => {
  try {
    const formData = new FormData();

    formData.append("userId", payload.userId);
    formData.append("serviceName", payload.serviceName);
    formData.append("phone", payload.phone);               // ✅ ADDED
    formData.append("description", payload.description);
    formData.append("subCategory", payload.subCategory);
    formData.append("serviceCharge", payload.serviceCharge.toString());
    formData.append("chargeType", payload.chargeType);
    formData.append("latitude", payload.latitude.toString());
    formData.append("longitude", payload.longitude.toString());
    formData.append("area", payload.area);
    formData.append("city", payload.city);
    formData.append("state", payload.state);
    formData.append("pinCode", payload.pinCode);           // ✅ ADDED

    payload.images.forEach((image) => {
      formData.append("images", image);
    });

    const response = await fetch(`${API_BASE_URL}/addAgriculture`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Add Agriculture Error:", errorText);
      throw new Error(`Failed to add agriculture service: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("addAgricultureService error:", error);
    throw error;
  }
};

// ── GET / READ interfaces ────────────────────────────────────────────────────
export interface AgricultureService {
  _id: string;
  userId: string;
  serviceName: string;
  phone: string;        // ✅ ADDED
  description: string;
  subCategory: string;
  serviceCharge: number;
  chargeType: string;
  latitude: number;
  longitude: number;
  area: string;
  city: string;
  state: string;
  pinCode: string;      // ✅ ADDED
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export const getAgricultureById = async (
  agricultureId: string
): Promise<AgricultureService> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getAgricultureById/${agricultureId}`,
      { method: "GET" }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Get Agriculture By ID Error:", errorText);
      throw new Error(`Failed to fetch agriculture service: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("getAgricultureById error:", error);
    throw error;
  }
};

export const deleteAgricultureById = async (
  agricultureId: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/deleteAgriculture/${agricultureId}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete Agriculture Error:", errorText);
      throw new Error(`Failed to delete agriculture service: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("deleteAgricultureById error:", error);
    throw error;
  }
};

export const getAllAgricultureServices = async (): Promise<AgricultureService[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllAgriculture`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Get All Agriculture Error:", errorText);
      throw new Error(`Failed to fetch agriculture services: ${response.status}`);
    }

    const data = await response.json();

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    return [];
  } catch (error) {
    console.error("getAllAgricultureServices error:", error);
    return [];
  }
};

// ── UPDATE payload ───────────────────────────────────────────────────────────
export interface UpdateAgriculturePayload {
  serviceName?: string;
  phone?: string;       // ✅ ADDED
  description?: string;
  subCategory?: string;
  serviceCharge?: number;
  chargeType?: string;
  latitude?: number;
  longitude?: number;
  area?: string;
  city?: string;
  state?: string;
  pinCode?: string;     // ✅ ADDED
  images?: File[];
}

export const updateAgricultureById = async (
  agricultureId: string,
  payload: UpdateAgriculturePayload & { existingImages?: string[] }
): Promise<AgricultureService> => {
  try {
    const formData = new FormData();

    if (payload.serviceName) formData.append("serviceName", payload.serviceName);
    if (payload.phone) formData.append("phone", payload.phone);         // ✅ ADDED
    if (payload.description) formData.append("description", payload.description);
    if (payload.subCategory) formData.append("subCategory", payload.subCategory);
    if (payload.serviceCharge !== undefined)
      formData.append("serviceCharge", payload.serviceCharge.toString());
    if (payload.chargeType) formData.append("chargeType", payload.chargeType);
    if (payload.latitude !== undefined)
      formData.append("latitude", payload.latitude.toString());
    if (payload.longitude !== undefined)
      formData.append("longitude", payload.longitude.toString());
    if (payload.area) formData.append("area", payload.area);
    if (payload.city) formData.append("city", payload.city);
    if (payload.state) formData.append("state", payload.state);
    if (payload.pinCode) formData.append("pinCode", payload.pinCode);     // ✅ ADDED

    if (payload.existingImages) {
      formData.append("existingImages", JSON.stringify(payload.existingImages));
    }

    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((img) => {
        formData.append("images", img);
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/updateAgricultureById/${agricultureId}`,
      { method: "PUT", body: formData }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Update Agriculture Error:", errorText);
      throw new Error(`Failed to update agriculture service: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("updateAgricultureById error:", error);
    throw error;
  }
};

// ============================================================================
// getUserAgricultureServices
// ============================================================================
export const getUserAgricultureServices = async (
  userId: string,
  serviceName?: string
): Promise<AgricultureService[]> => {
  try {
    console.log("🔍 Fetching user agriculture services for userId:", userId);

    const params = new URLSearchParams({ userId });
    if (serviceName) params.append("serviceName", serviceName);

    const url = `${API_BASE_URL}/getUserAgriculture?${params.toString()}`;
    console.log("📡 Request URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: { 'Accept': 'application/json' },
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ API Error Response:", errorText);
      if (response.status === 404) {
        console.warn("⚠️ Endpoint not found. Check if '/getUserAgriculture' exists on backend");
      }
      return [];
    }

    const data = await response.json();
    console.log("✅ API Response data:", data);

    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) return data.data;
    if (data && Array.isArray(data.services)) return data.services;
    if (data && typeof data === 'object') {
      const arrayValue = Object.values(data).find(val => Array.isArray(val));
      if (arrayValue) return arrayValue as AgricultureService[];
    }

    console.warn("⚠️ No valid data found in response, returning empty array");
    return [];
  } catch (error) {
    console.error("❌ getUserAgricultureServices error:", error);
    return [];
  }
};