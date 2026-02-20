// src/services/IndustrialService.service.ts — FIXED STANDALONE (no Hospital imports)

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ===================== INTERFACES ===================== */

export interface IndustrialWorker {
  _id?: string;
  userId?: string;
  serviceName?: string;
  description?: string;
  category?: string;
  subCategory?: string;
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
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface IndustrialWorkerResponse {
  success: boolean;
  count?: number;
  data?: IndustrialWorker[] | IndustrialWorker;
  message?: string;
}

/* ===================== ADD INDUSTRIAL SERVICE ===================== */

/**
 * Add a new industrial service
 * Matches the API curl exactly:
 *   POST /addIndustrialService  (multipart/form-data)
 */
export const addIndustrialService = async (
  payload: {
    userId: string;
    serviceName: string;
    description: string;
    category: string;
    subCategory: string;
    serviceCharge: string | number;
    chargeType: string;
    latitude: number;
    longitude: number;
    area: string;
    city: string;
    state: string;
    pincode: string;
    images?: File[];
  }
): Promise<IndustrialWorkerResponse> => {
  try {
    const formData = new FormData();

    formData.append("userId", payload.userId);
    formData.append("serviceName", payload.serviceName);
    formData.append("description", payload.description);
    formData.append("category", payload.category);
    formData.append("subCategory", payload.subCategory);
    formData.append("serviceCharge", String(payload.serviceCharge));
    formData.append("chargeType", payload.chargeType);
    formData.append("latitude", String(payload.latitude));
    formData.append("longitude", String(payload.longitude));
    formData.append("area", payload.area);
    formData.append("city", payload.city);
    formData.append("state", payload.state);
    formData.append("pincode", payload.pincode);

    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        // ✅ Append with filename — matches the API curl exactly
        formData.append("images", file, file.name);
      });
    }

    console.log("📤 addIndustrialService → POST", `${API_BASE_URL}/addIndustrialService`);

    const response = await fetch(`${API_BASE_URL}/addIndustrialService`, {
      method: "POST",
      body: formData,
      // ✅ Do NOT set Content-Type header — browser sets it automatically with boundary
    });

    const text = await response.text();
    console.log("📥 addIndustrialService raw response:", text);

    if (!response.ok) {
      let msg = `HTTP ${response.status}`;
      try { msg = JSON.parse(text)?.message || msg; } catch { }
      throw new Error(msg);
    }

    try {
      return JSON.parse(text);
    } catch {
      return { success: true, message: text };
    }
  } catch (error: any) {
    console.error("❌ Error adding industrial service:", error);
    return {
      success: false,
      message: error.message || "Failed to add industrial service",
    };
  }
};

/* ===================== GET NEARBY INDUSTRIAL WORKERS ===================== */

/**
 * Fetch nearby industrial service workers
 * GET /getNearbyIndustrialServices?latitude=X&longitude=Y&distance=D
 */
export const getNearbyIndustrialWorkers = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<IndustrialWorkerResponse> => {
  if (!distance || distance <= 0) {
    throw new Error("Please provide a valid distance in km");
  }

  try {
    const url = `${API_BASE_URL}/getNearbyIndustrialServices?latitude=${latitude}&longitude=${longitude}&distance=${distance}`;
    console.log("📤 getNearbyIndustrialWorkers → GET", url);

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching industrial service workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

/* ===================== GET ALL INDUSTRIAL SERVICES ===================== */

/**
 * Fetch all industrial services
 * GET /getAllIndustrialServices
 */
export const getAllIndustrialServices = async (): Promise<IndustrialWorkerResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getAllIndustrialServices`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all industrial services:", error);
    return { success: false, count: 0, data: [] };
  }
};

/* ===================== GET INDUSTRIAL SERVICE BY ID ===================== */

/**
 * Fetch industrial service by ID
 * GET /getIndustrialServiceById/:serviceId
 */
export const getIndustrialServiceById = async (
  serviceId: string
): Promise<IndustrialWorkerResponse> => {
  if (!serviceId) throw new Error("Service ID is required");

  try {
    const response = await fetch(
      `${API_BASE_URL}/getIndustrialServiceById/${serviceId}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching industrial service by ID:", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch industrial service by ID",
    };
  }
};

/* ===================== UPDATE INDUSTRIAL SERVICE ===================== */

/**
 * Update industrial service by ID
 * PUT /updateIndustrialService/:serviceId  (multipart/form-data)
 */
export const updateIndustrialService = async (
  serviceId: string,
  payload: {
    serviceName?: string;
    description?: string;
    category?: string;
    subCategory?: string;
    serviceCharge?: string | number;
    chargeType?: string;
    latitude?: number;
    longitude?: number;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    images?: File[];
  }
): Promise<IndustrialWorkerResponse> => {
  if (!serviceId) throw new Error("Service ID is required");

  try {
    const formData = new FormData();

    if (payload.serviceName !== undefined) formData.append("serviceName", payload.serviceName);
    if (payload.description !== undefined) formData.append("description", payload.description);
    if (payload.category !== undefined) formData.append("category", payload.category);
    if (payload.subCategory !== undefined) formData.append("subCategory", payload.subCategory);
    if (payload.serviceCharge !== undefined) formData.append("serviceCharge", String(payload.serviceCharge));
    if (payload.chargeType !== undefined) formData.append("chargeType", payload.chargeType);
    if (payload.latitude !== undefined) formData.append("latitude", String(payload.latitude));
    if (payload.longitude !== undefined) formData.append("longitude", String(payload.longitude));
    if (payload.area !== undefined) formData.append("area", payload.area);
    if (payload.city !== undefined) formData.append("city", payload.city);
    if (payload.state !== undefined) formData.append("state", payload.state);
    if (payload.pincode !== undefined) formData.append("pincode", payload.pincode);

    if (payload.images && payload.images.length > 0) {
      payload.images.forEach((file) => {
        formData.append("images", file, file.name);
      });
    }

    console.log("📤 updateIndustrialService → PUT", `${API_BASE_URL}/updateIndustrialService/${serviceId}`);

    const response = await fetch(
      `${API_BASE_URL}/updateIndustrialService/${serviceId}`,
      { method: "PUT", body: formData }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error updating industrial service:", error);
    return {
      success: false,
      message: error.message || "Failed to update industrial service",
    };
  }
};

/* ===================== DELETE INDUSTRIAL SERVICE ===================== */

/**
 * Delete industrial service by ID
 * DELETE /deleteIndustrialService/:serviceId
 */
export const deleteIndustrialService = async (
  serviceId: string
): Promise<IndustrialWorkerResponse> => {
  if (!serviceId) throw new Error("Service ID is required");

  try {
    const response = await fetch(
      `${API_BASE_URL}/deleteIndustrialService/${serviceId}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting industrial service:", error);
    return {
      success: false,
      message: "Failed to delete industrial service",
    };
  }
};

/* ===================== GET USER INDUSTRIAL SERVICES ===================== */

/**
 * Fetch industrial services for a user with optional filters
 * GET /getUserIndustrial?userId=X&category=Y&subCategory=Z&serviceName=W
 */
export const getUserIndustrialServices = async (
  params: {
    userId: string;
    category?: string;
    subCategory?: string;
    serviceName?: string;
  }
): Promise<IndustrialWorkerResponse> => {
  if (!params.userId) throw new Error("User ID is required");

  try {
    const queryParams = new URLSearchParams();
    queryParams.append("userId", params.userId);
    if (params.category) queryParams.append("category", params.category);
    if (params.subCategory) queryParams.append("subCategory", params.subCategory);
    if (params.serviceName) queryParams.append("serviceName", params.serviceName);

    const url = `${API_BASE_URL}/getUserIndustrial?${queryParams.toString()}`;
    console.log("📤 getUserIndustrialServices → GET", url);

    const response = await fetch(url, { method: "GET" });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user industrial services:", error);
    return {
      success: false,
      count: 0,
      data: [],
      message: "Failed to fetch user industrial services",
    };
  }
};
