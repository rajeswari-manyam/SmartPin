// src/services/BusinessService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ---- Interfaces ----
export interface BusinessWorker {
  _id?: string;
  userId?: string;
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  category?: string;
  subCategory?: string;
  serviceType?: string;
  services?: string[];
  skills?: string;
  experience?: number;
  serviceCharge?: number;
  chargeType?: string;
  bio?: string;
  description?: string;
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

export interface BusinessWorkerResponse {
  success: boolean;
  count: number;
  data: BusinessWorker[];
}

export interface CreateServiceResponse {
  success: boolean;
  message: string;
  data?: BusinessWorker;
}

export interface ServiceByIdResponse {
  success: boolean;
  data?: BusinessWorker;
  message?: string;
}

export interface UpdateServiceResponse {
  success: boolean;
  message: string;
  data?: BusinessWorker;
}

export interface DeleteServiceResponse {
  success: boolean;
  message: string;
}

export interface UserBusinessResponse {
  success: boolean;
  count: number;
  data: BusinessWorker[];
  message?: string;
}

export interface AllServicesResponse {
  success: boolean;
  count: number;
  data: BusinessWorker[];
}

// ── Helper: parse error body from response ────────────────────────────────────
const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const body = await response.json();
    return body.message || body.error || `Server error (${response.status})`;
  } catch {
    return `Server error (${response.status})`;
  }
};

// ---- Fetch nearby business workers ----
export const getNearbyBusinessServices = async (
  latitude: number,
  longitude: number,
  distance?: number
): Promise<BusinessWorkerResponse> => {
  try {
    const url = distance
      ? `${API_BASE_URL}/nearby?latitude=${latitude}&longitude=${longitude}&distance=${distance}`
      : `${API_BASE_URL}/nearby?latitude=${latitude}&longitude=${longitude}`;

    const response = await fetch(url, { method: "GET", redirect: "follow" });
    if (!response.ok) throw new Error(await parseErrorMessage(response));

    return await response.json();
  } catch (error) {
    console.error("Error fetching nearby business workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

// ---- Create new business service ----
export const createBusinessService = async (
  payload: FormData
): Promise<CreateServiceResponse> => {
  const response = await fetch(`${API_BASE_URL}/createService`, {
    method: "POST",
    body: payload,
    redirect: "follow",
  });

  // ✅ Always parse the body — surface the real backend message on failure
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data.message || data.error || `Server error (${response.status})`;
    console.error("❌ createService backend error:", msg, data);
    throw new Error(msg);
  }

  return data as CreateServiceResponse;
};

// ---- Fetch all business services ----
export const getAllBusinessServices = async (): Promise<AllServicesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllServices`, {
      method: "GET",
      redirect: "follow",
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    return await response.json();
  } catch (error) {
    console.error("Error fetching all business services:", error);
    return { success: false, count: 0, data: [] };
  }
};

// ---- Fetch business service by ID ----
export const getBusinessServiceById = async (
  serviceId: string
): Promise<ServiceByIdResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getServiceById/${serviceId}`, {
      method: "GET",
      redirect: "follow",
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    return await response.json();
  } catch (error) {
    console.error(`Error fetching service by ID (${serviceId}):`, error);
    return { success: false, message: "Failed to fetch service" };
  }
};

// ---- Update business service ----
export const updateBusinessService = async (
  serviceId: string,
  payload: FormData
): Promise<UpdateServiceResponse> => {
  const response = await fetch(`${API_BASE_URL}/updateService/${serviceId}`, {
    method: "PUT",
    body: payload,
    redirect: "follow",
  });

  // ✅ Surface real backend message on failure
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const msg = data.message || data.error || `Server error (${response.status})`;
    console.error("❌ updateService backend error:", msg, data);
    throw new Error(msg);
  }

  return data as UpdateServiceResponse;
};

// ---- Delete business service ----
export const deleteBusinessService = async (
  serviceId: string
): Promise<DeleteServiceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deleteService/${serviceId}`, {
      method: "DELETE",
      redirect: "follow",
    });
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    return await response.json();
  } catch (error) {
    console.error(`Error deleting service (${serviceId}):`, error);
    return { success: false, message: "Failed to delete service" };
  }
};

// ---- Fetch business services by user ----
export const getUserBusinessServices = async (
  userId: string,
  serviceType?: string,
  title?: string
): Promise<UserBusinessResponse> => {
  try {
    if (!userId) throw new Error("User ID is required");

    const params = new URLSearchParams({ userId });
    if (serviceType) params.append("serviceType", serviceType);
    if (title) params.append("title", title);

    const response = await fetch(
      `${API_BASE_URL}/getUserBusiness?${params.toString()}`,
      { method: "GET", redirect: "follow" }
    );
    if (!response.ok) throw new Error(await parseErrorMessage(response));
    return await response.json();
  } catch (error) {
    console.error("Error fetching user business services:", error);
    return {
      success: false,
      count: 0,
      data: [],
      message: "Failed to fetch user business services",
    };
  }
};