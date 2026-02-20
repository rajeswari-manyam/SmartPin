// src/services/Corporate.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface CorporateWorker {
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
  pincode?: string;
  latitude?: number;
  longitude?: number;
  availability?: boolean | string;
  rating?: number;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface CorporateWorkerResponse {
  success: boolean;
  count: number;
  data: CorporateWorker[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

/* ================= PAYLOAD TYPES ================= */

// Images removed from payload types — passed as separate File[] arg to keep
// scalar data and binary files cleanly separated (same pattern as Beauty service)

export interface AddCorporateServicePayload {
  userId: string;
  serviceName: string;
  description: string;
  subCategory: string;
  serviceCharge: number;
  chargeType: string;
  latitude: number;
  longitude: number;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

export interface UpdateCorporateServicePayload {
  userId: string;
  serviceName: string;
  description: string;
  subCategory: string;
  serviceCharge: number;
  chargeType: string;
  latitude: number;
  longitude: number;
  area: string;
  city: string;
  state: string;
  pincode: string;
}

/* ================= ADD CORPORATE SERVICE ================= */

/**
 * Add a corporate service.
 * Scalar fields go in payload; image File objects passed separately.
 * Backend expects: formdata.append("images", file)  — plain "images" key, no "[]"
 */
export const addCorporateService = async (
  payload: AddCorporateServicePayload,
  imageFiles?: File[]
): Promise<ApiResponse> => {
  try {
    const formData = new FormData();

    // ── Scalar fields ────────────────────────────────────────────────────────
    formData.append("userId",        payload.userId);
    formData.append("serviceName",   payload.serviceName);
    formData.append("description",   payload.description);
    formData.append("subCategory",   payload.subCategory);
    formData.append("serviceCharge", payload.serviceCharge.toString());
    formData.append("chargeType",    payload.chargeType);
    formData.append("latitude",      payload.latitude.toString());
    formData.append("longitude",     payload.longitude.toString());
    formData.append("area",          payload.area);
    formData.append("city",          payload.city);
    formData.append("state",         payload.state);
    formData.append("pincode",       payload.pincode);

    // ── Image files — plain "images" key, matching backend ───────────────────
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images", file, file.name);
      });
    }

    // Do NOT set Content-Type — browser adds multipart boundary automatically
    const response = await fetch(`${API_BASE_URL}/addCorporateService`, {
      method: "POST",
      body: formData,
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Add Corporate Service Error:", errorText);
      throw new Error(`Failed to add corporate service: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding corporate service:", error);
    return { success: false, message: "Failed to add corporate service" };
  }
};

/* ================= UPDATE CORPORATE SERVICE ================= */

/**
 * Update a corporate service by ID.
 * New image File objects passed separately — existing server images are
 * preserved by the backend automatically (no re-upload needed).
 */
export const updateCorporateService = async (
  corporateId: string,
  payload: UpdateCorporateServicePayload,
  imageFiles?: File[]
): Promise<{ success: boolean; data?: any; message?: string }> => {
  if (!corporateId) throw new Error("Corporate ID is required");

  try {
    const formData = new FormData();

    // ── Scalar fields ────────────────────────────────────────────────────────
    formData.append("userId",        payload.userId);
    formData.append("serviceName",   payload.serviceName);
    formData.append("description",   payload.description);
    formData.append("subCategory",   payload.subCategory);
    formData.append("serviceCharge", payload.serviceCharge.toString());
    formData.append("chargeType",    payload.chargeType);
    formData.append("latitude",      payload.latitude.toString());
    formData.append("longitude",     payload.longitude.toString());
    formData.append("area",          payload.area);
    formData.append("city",          payload.city);
    formData.append("state",         payload.state);
    formData.append("pincode",       payload.pincode);

    // ── New image files only — plain "images" key, matching backend ──────────
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images", file, file.name);
      });
    }

    const response = await fetch(`${API_BASE_URL}/updateCorporate/${corporateId}`, {
      method: "PUT",
      body: formData,
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Update Corporate Error:", errorText);
      throw new Error(`Failed to update corporate service: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating corporate service:", error);
    return { success: false, message: "Failed to update corporate service" };
  }
};

/* ================= GET NEARBY CORPORATE ================= */

export const getNearbyCorporateWorkers = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<CorporateWorkerResponse> => {
  if (!distance || distance <= 0)
    throw new Error("Please provide a valid distance in km");

  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyCorporate?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Get Nearby Corporate Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching corporate workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

/* ================= GET ALL CORPORATE SERVICES ================= */

export const getAllCorporateServices = async (): Promise<CorporateWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllCorporate`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Get All Corporate Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all corporate services:", error);
    return { success: false, count: 0, data: [] };
  }
};

/* ================= GET CORPORATE BY ID ================= */

export const getCorporateById = async (
  corporateId: string
): Promise<{ success: boolean; data: any }> => {
  if (!corporateId) throw new Error("Corporate ID is required");

  try {
    const response = await fetch(`${API_BASE_URL}/getCorporateById/${corporateId}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Get Corporate By ID Error:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching corporate by ID:", error);
    return { success: false, data: null };
  }
};

/* ================= DELETE CORPORATE SERVICE ================= */

export const deleteCorporateService = async (
  corporateId: string
): Promise<{ success: boolean; message?: string }> => {
  if (!corporateId) throw new Error("Corporate ID is required");

  try {
    const response = await fetch(`${API_BASE_URL}/deleteCorporate/${corporateId}`, {
      method: "DELETE",
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Delete Corporate Error:", errorText);
      throw new Error(`Failed to delete corporate service: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting corporate service:", error);
    return { success: false, message: "Failed to delete corporate service" };
  }
};

/* ================= GET USER CORPORATE SERVICES ================= */

export interface GetUserCorporateParams {
  userId: string;
  serviceName?: string;
}

export const getUserCorporateServices = async (
  params: GetUserCorporateParams
): Promise<{ success: boolean; count?: number; data?: any[] }> => {
  if (!params.userId) throw new Error("userId is required");

  const query = new URLSearchParams({
    userId: params.userId,
    ...(params.serviceName ? { serviceName: params.serviceName } : {}),
  }).toString();

  try {
    const url = `${API_BASE_URL}/getUserCorporate/?${query}`;
    const response = await fetch(url, {
      method: "GET",
      headers: { Accept: "application/json" },
      redirect: "follow",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Get User Corporate Error:", errorText);
      return { success: false, data: [] };
    }

    const data = await response.json();

    if (Array.isArray(data))
      return { success: true, data, count: data.length };
    if (data && Array.isArray(data.data))
      return { success: true, data: data.data, count: data.count ?? data.data.length };
    if (data && Array.isArray(data.services))
      return { success: true, data: data.services, count: data.services.length };

    const arrayValue = Object.values(data ?? {}).find((v) => Array.isArray(v));
    if (arrayValue)
      return { success: true, data: arrayValue as any[], count: (arrayValue as any[]).length };

    return { success: false, data: [] };
  } catch (error) {
    console.error("getUserCorporateServices error:", error);
    return { success: false, data: [] };
  }
};
