// src/services/CreativeArtService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ================= TYPES ================= */

export interface CreativeArtWorker {
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  subCategory?: string;
  description?: string;
  serviceCharge?: number;
  chargeType?: string;
  services?: string[];
  experience?: number;
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

export interface CreativeArtWorkerResponse {
  success: boolean;
  count: number;
  data: CreativeArtWorker[];
}

export interface AddCreativeArtResponse {
  success: boolean;
  message: string;
  data?: CreativeArtWorker;
}

/* ================= ADD CREATIVE ART SERVICE ================= */

/**
 * Add a Creative & Art service
 * @param formData FormData
 * @returns Promise<AddCreativeArtResponse>
 */
export const addCreativeArtService = async (
  formData: FormData
): Promise<AddCreativeArtResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/addCreativeArt`, {
      method: "POST",
      body: formData,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding creative art service:", error);
    return {
      success: false,
      message: "Failed to add creative art service",
    };
  }
};

/* ================= GET NEARBY CREATIVE ART SERVICES ================= */

/**
 * Fetch nearby creative art service providers
 */
export const getNearbyCreativeArtWorkers = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<CreativeArtWorkerResponse> => {
  if (!distance || distance <= 0) {
    throw new Error("Please provide a valid distance in km");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyCreativeArtServices?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching creative art workers:", error);
    return { success: false, count: 0, data: [] };
  }
};
/* ================= GET ALL CREATIVE ART SERVICES ================= */

/**
 * Fetch all creative art services
 * @returns Promise<CreativeArtWorkerResponse>
 */
export const getAllCreativeArtServices = async (): Promise<CreativeArtWorkerResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getAllCreativeArtServices`,
      {
        method: "GET",
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CreativeArtWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all creative art services:", error);
    return {
      success: false,
      count: 0,
      data: [],
    };
  }
};
/* ================= GET CREATIVE ART SERVICE BY ID ================= */

/**
 * Fetch creative art service by ID
 * @param id Creative Art Service ID
 * @returns Promise<CreativeArtWorker | null>
 */
export const getCreativeArtServiceById = async (
  id: string
): Promise<CreativeArtWorker | null> => {
  if (!id) {
    throw new Error("Creative Art Service ID is required");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/getCreativeArtServiceById/${id}`,
      {
        method: "GET",
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // API may return { success, data } or direct object
    return result?.data ?? result;
  } catch (error) {
    console.error("Error fetching creative art service by ID:", error);
    return null;
  }
};
/* ================= DELETE CREATIVE ART SERVICE ================= */

/**
 * Delete creative art service by ID
 * @param id Creative Art Service ID
 * @returns Promise<{ success: boolean; message: string }>
 */
export const deleteCreativeArtService = async (
  id: string
): Promise<{ success: boolean; message: string }> => {
  if (!id) {
    throw new Error("Creative Art Service ID is required for deletion");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/deleteCreativeArtService/${id}`,
      {
        method: "DELETE",
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting creative art service:", error);
    return { success: false, message: "Failed to delete service" };
  }
};
/* ================= UPDATE CREATIVE ART SERVICE ================= */

/**
 * Update a creative art service by ID
 * @param id Creative Art Service ID
 * @param updateData Object with fields to update
 * @returns Promise<{ success: boolean; message: string; data?: CreativeArtWorker }>
 */
export const updateCreativeArtService = async (
  id: string,
  updateData: Partial<CreativeArtWorker>
): Promise<{ success: boolean; message: string; data?: CreativeArtWorker }> => {
  if (!id) {
    throw new Error("Creative Art Service ID is required for update");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/updateCreativeArt/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error updating creative art service:", error);
    return { success: false, message: "Failed to update service" };
  }
};
/* ================= GET USER CREATIVE ARTS ================= */

/**
 * Fetch all creative art services for a user (optionally by category & subCategory)
 * @param userId User ID
 * @param category Optional category filter
 * @param subCategory Optional subCategory filter
 * @returns Promise<CreativeArtWorkerResponse>
 */
export const getUserCreativeArts = async (
  userId: string,
  category?: string,
  subCategory?: string
): Promise<CreativeArtWorkerResponse> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  // Build query string
  const queryParams = new URLSearchParams({ userId });
  if (category) queryParams.append("category", category);
  if (subCategory) queryParams.append("subCategory", subCategory);

  try {
    const response = await fetch(
      `${API_BASE_URL}/getUserCreativeArts?${queryParams.toString()}`,
      {
        method: "GET",
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CreativeArtWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user creative arts:", error);
    return { success: false, count: 0, data: [] };
  }
};
