// src/services/BusinessService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ---- Interfaces ----
export interface BusinessWorker {
  _id?: string;
  userId?: string;
  name?: string;
  title?: string; // API field
  email?: string;
  phone?: string;
  category?: string;
  serviceType?: string; // API field
  services?: string[];
  skills?: string; // API field (comma-separated string)
  experience?: number;
  serviceCharge?: number;
  chargeType?: string;
  bio?: string;
  description?: string; // API field
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

// ---- Fetch nearby business workers ----
export const getNearbyBusinessServices = async (
  latitude: number,
  longitude: number,
  distance?: number
): Promise<BusinessWorkerResponse> => {
  try {
    // Build URL based on whether distance is provided
    const url = distance
      ? `${API_BASE_URL}/nearby?latitude=${latitude}&longitude=${longitude}&distance=${distance}`
      : `${API_BASE_URL}/nearby?latitude=${latitude}&longitude=${longitude}`;

    const response = await fetch(url, {
      method: "GET",
      redirect: "follow"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BusinessWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching business workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

// ---- Create new business service (with FormData support for images) ----
export const createBusinessService = async (
  payload: FormData
): Promise<CreateServiceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/createService`, {
      method: "POST",
      body: payload,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CreateServiceResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating business service:", error);
    return { success: false, message: "Failed to create service" };
  }
};

// ---- Fetch all business services ----
export const getAllBusinessServices = async (): Promise<AllServicesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllServices`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: AllServicesResponse = await response.json();
    return data;
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ServiceByIdResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching service by ID (${serviceId}):`, error);
    return { success: false, message: "Failed to fetch service" };
  }
};

// ---- Update business service (with FormData support for images) ----
export const updateBusinessService = async (
  serviceId: string,
  payload: FormData
): Promise<UpdateServiceResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/updateService/${serviceId}`, {
      method: "PUT",
      body: payload,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: UpdateServiceResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating service (${serviceId}):`, error);
    return { success: false, message: "Failed to update service" };
  }
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

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DeleteServiceResponse = await response.json();
    return data;
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
    if (!userId) {
      throw new Error("User ID is required");
    }

    const params = new URLSearchParams({ userId });

    if (serviceType) params.append("serviceType", serviceType);
    if (title) params.append("title", title);

    const response = await fetch(
      `${API_BASE_URL}/getUserBusiness?${params.toString()}`,
      {
        method: "GET",
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: UserBusinessResponse = await response.json();
    return data;
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
