// src/services/BeautyService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface BeautyWorker {
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

export interface BeautyWorkerResponse {
  success: boolean;
  count: number;
  data: BeautyWorker[];
}

/**
 * Fetch nearby beauty & wellness workers
 */
export const getNearbyBeautyWorkers = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<BeautyWorkerResponse> => {
  if (!distance || distance <= 0) {
    throw new Error("Please provide a valid distance in km");
  }
  try {
    const response = await fetch(
      `${API_BASE_URL}/getnearbybeautyworkers?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BeautyWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching beauty workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Create a beauty worker.
 * Uses multipart/form-data so image files can be sent.
 * services array is sent as repeated services[] keys — matching backend expectation.
 */
export const createBeautyWorker = async (
  worker: Partial<BeautyWorker>,
  imageFiles?: File[]
): Promise<any> => {
  try {
    const formData = new FormData();

    // Append scalar fields
    const scalarFields = [
      "userId", "name", "email", "phone", "category",
      "experience", "serviceCharge", "bio",
      "area", "city", "state", "pincode",
      "latitude", "longitude", "availability",
    ];

    scalarFields.forEach((key) => {
      const value = worker[key];
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    // services → repeated services[] keys  e.g. services[]="Makeup Artist"
    if (Array.isArray(worker.services)) {
      worker.services.forEach((s) => {
        formData.append("services[]", s);
      });
    }

    // Attach image files
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images", file, file.name);
      });
    }

    const response = await fetch(`${API_BASE_URL}/beautycreate`, {
      method: "POST",
      // Do NOT set Content-Type — browser sets it with boundary automatically
      body: formData,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error creating beauty worker:", message);
    return { success: false, message };
  }
};

/**
 * Fetch all beauty & wellness workers
 */
export const getAllBeautyWorkers = async (): Promise<BeautyWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllBeautyWellnessWorkers`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BeautyWorkerResponse = await response.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Error fetching all beauty workers:", message);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Fetch a single beauty worker by ID
 */
export const getBeautyWorkerById = async (id: string): Promise<BeautyWorker | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getbeautyworkerById/${id}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BeautyWorker = await response.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error fetching beauty worker with ID ${id}:`, message);
    return null;
  }
};

/**
 * Update a beauty worker by ID.
 * Sends multipart/form-data with services[] keys and optional new image files.
 * existingImages are NOT forwarded to the backend — the server keeps them as-is
 * unless you have a dedicated "remove image" endpoint.
 */
export const updateBeautyWorker = async (
  id: string,
  worker: Partial<BeautyWorker>,
  imageFiles?: File[]
): Promise<any> => {
  try {
    const formData = new FormData();

    // Append scalar fields
    const scalarFields = [
      "userId", "name", "email", "phone", "category",
      "experience", "serviceCharge", "bio",
      "area", "city", "state", "pincode",
      "latitude", "longitude", "availability",
    ];

    scalarFields.forEach((key) => {
      const value = worker[key];
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

    // services → repeated services[] keys
    if (Array.isArray(worker.services)) {
      worker.services.forEach((s) => {
        formData.append("services[]", s);
      });
    }

    // Attach new image files only
    if (imageFiles && imageFiles.length > 0) {
      imageFiles.forEach((file) => {
        formData.append("images", file, file.name);
      });
    }

    const response = await fetch(`${API_BASE_URL}/updatebeautyworker/${id}`, {
      method: "PUT",
      body: formData,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error updating beauty worker with ID ${id}:`, message);
    return { success: false, message };
  }
};

/**
 * Delete a beauty worker by ID
 */
export const deleteById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deleteById?id=${id}`, {
      method: "DELETE",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error deleting beauty worker with ID ${id}:`, message);
    return { success: false, message };
  }
};

/**
 * Fetch beauty workers for a specific user filtered by category and services
 */
export const getUserBeautyWorkers = async (
  userId: string,
  category?: string,
  services?: string
): Promise<BeautyWorkerResponse> => {
  try {
    const params = new URLSearchParams({ userId });
    if (category) params.append("category", category);
    if (services) params.append("services", services);

    const response = await fetch(`${API_BASE_URL}/getUserBeautyWorkers?${params.toString()}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: BeautyWorkerResponse = await response.json();
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error fetching beauty workers for user ${userId}:`, message);
    return { success: false, count: 0, data: [] };
  }
};
