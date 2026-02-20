// src/services/LabourService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

export interface LabourWorker {
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  description?: string;
  category?: string;
  subCategory?: string;
  services?: string[];
  experience?: number;
  dailyWage?: number;
  chargeType?: string;
  serviceCharge?: number;
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

export interface LabourWorkerResponse {
  success: boolean;
  count: number;
  data: LabourWorker[];
}

export interface SingleLabourResponse {
  success: boolean;
  data: LabourWorker;
}

// images removed from payload types — passed as a separate File[] arg
export interface AddLabourPayload {
  userId: string;
  description: string;
  category: string;
  subCategory: string;
  dailyWage: string;
  chargeType: string;
  latitude: string;
  longitude: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  name?: string;
  phone?: string;
  email?: string;
}

export interface UpdateLabourPayload {
  description?: string;
  category?: string;
  subCategory?: string;
  dailyWage?: string;
  chargeType?: string;
  latitude?: string;
  longitude?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  name?: string;
  phone?: string;
  email?: string;
  availability?: boolean;
}

/**
 * Add a new labour worker.
 * Scalar fields in payload; image File objects passed as separate imageFiles arg.
 * Backend: formdata.append("images", file) — plain "images" key, no Content-Type header.
 */
export const addLabour = async (
  payload: AddLabourPayload,
  imageFiles?: File[]
): Promise<any> => {
  try {
    const formdata = new FormData();

    formdata.append("userId", payload.userId);
    formdata.append("description", payload.description);
    formdata.append("category", payload.category);
    formdata.append("subCategory", payload.subCategory);
    formdata.append("dailyWage", payload.dailyWage);
    formdata.append("chargeType", payload.chargeType);
    formdata.append("latitude", payload.latitude);
    formdata.append("longitude", payload.longitude);
    formdata.append("area", payload.area);
    formdata.append("city", payload.city);
    formdata.append("state", payload.state);
    formdata.append("pincode", payload.pincode);

    if (payload.name) formdata.append("name", payload.name);
    if (payload.phone) formdata.append("phone", payload.phone);
    if (payload.email) formdata.append("email", payload.email);

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formdata.append("images", file, file.name);
      });
    }

    const response = await fetch(`${API_BASE_URL}/addLabour`, {
      method: "POST",
      body: formdata,
      redirect: "follow",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error adding labour:", error);
    throw error;
  }
};

/**
 * Update a labour worker by ID.
 * Uses FormData (not JSON) so new image files can be included.
 * Existing server images are preserved — only new files need to be sent.
 */
export const updateLabour = async (
  labourId: string,
  payload: UpdateLabourPayload,
  imageFiles?: File[]
): Promise<any> => {
  try {
    const formdata = new FormData();

    if (payload.description !== undefined) formdata.append("description", payload.description);
    if (payload.category !== undefined) formdata.append("category", payload.category);
    if (payload.subCategory !== undefined) formdata.append("subCategory", payload.subCategory);
    if (payload.dailyWage !== undefined) formdata.append("dailyWage", payload.dailyWage);
    if (payload.chargeType !== undefined) formdata.append("chargeType", payload.chargeType);
    if (payload.latitude !== undefined) formdata.append("latitude", payload.latitude);
    if (payload.longitude !== undefined) formdata.append("longitude", payload.longitude);
    if (payload.area !== undefined) formdata.append("area", payload.area);
    if (payload.city !== undefined) formdata.append("city", payload.city);
    if (payload.state !== undefined) formdata.append("state", payload.state);
    if (payload.pincode !== undefined) formdata.append("pincode", payload.pincode);
    if (payload.name !== undefined) formdata.append("name", payload.name);
    if (payload.phone !== undefined) formdata.append("phone", payload.phone);
    if (payload.email !== undefined) formdata.append("email", payload.email);
    if (payload.availability !== undefined)
      formdata.append("availability", payload.availability.toString());

    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formdata.append("images", file, file.name);
      });
    }

    const response = await fetch(`${API_BASE_URL}/updateLabour/${labourId}`, {
      method: "PUT",
      body: formdata,
      redirect: "follow",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating labour:", error);
    throw error;
  }
};

export const getAllLabours = async (): Promise<LabourWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllLabours`, {
      method: "GET", redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching all labours:", error);
    return { success: false, count: 0, data: [] };
  }
};

export const getLabourById = async (
  labourId: string
): Promise<SingleLabourResponse | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getLabourById/${labourId}`, {
      method: "GET", redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching labour by ID:", error);
    return null;
  }
};

export const deleteLabour = async (labourId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deleteLabour/${labourId}`, {
      method: "DELETE", redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting labour:", error);
    throw error;
  }
};

export const getUserLabours = async (
  userId: string,
  subCategory?: string
): Promise<LabourWorkerResponse> => {
  try {
    let url = `${API_BASE_URL}/getUserLabours?userId=${userId}`;
    if (subCategory) url += `&subCategory=${encodeURIComponent(subCategory)}`;
    const response = await fetch(url, { method: "GET", redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user labours:", error);
    return { success: false, count: 0, data: [] };
  }
};

export const getNearbyLabourWorkers = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<LabourWorkerResponse> => {
  if (!distance || distance <= 0)
    throw new Error("Please provide a valid distance in km");
  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyLabours?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching labour workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

const LabourService = {
  addLabour,
  getAllLabours,
  getLabourById,
  deleteLabour,
  updateLabour,
  getUserLabours,
  getNearbyLabourWorkers,
};

export default LabourService;
