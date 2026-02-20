// src/services/SportsActivityService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* =========================
   INTERFACES
========================= */

export interface SportsWorker {
  _id?: string;
  userId?: string;
  serviceName?: string;
  description?: string;
  category?: string;
  subCategory?: string;
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

export interface SportsWorkerResponse {
  success: boolean;
  count: number;
  data: SportsWorker[];
}

export interface SingleSportsWorkerResponse {
  success: boolean;
  data: SportsWorker;
}

/* =========================
   API METHODS
========================= */

/**
 * Add a new sports activity provider
 * @param workerData FormData containing all worker info + images
 */
export const addSportsActivity = async (workerData: FormData): Promise<SingleSportsWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/addSportsActivity`, {
      method: "POST",
      body: workerData,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SingleSportsWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error adding sports activity:", error);
    return { success: false, data: {} as SportsWorker };
  }
};

/**
 * Fetch nearby sports activity service providers
 * @param latitude number
 * @param longitude number
 * @param distance number in km (default 5)
 */
export const getNearbySportsWorkers = async (
  latitude: number,
  longitude: number,
  distance: number = 5
): Promise<SportsWorkerResponse> => {
  if (!distance || distance <= 0) {
    throw new Error("Please provide a valid distance in km");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbySportsActivities?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SportsWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sports activity workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Fetch a single sports activity worker by ID
 * @param id string
 */
export const getSportsWorkerById = async (id: string): Promise<SingleSportsWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getSportsWorkerById?id=${id}`, { method: "GET" });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: SingleSportsWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching sports worker:", error);
    return { success: false, data: {} as SportsWorker };
  }
};

/**
 * Fetch all sports activity service providers
 * @returns Promise<SportsWorkerResponse>
 */
export const getAllSportsActivities = async (): Promise<SportsWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllSportsActivities`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SportsWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching all sports activities:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Fetch a single sports activity provider by ID
 * @param id string - sports activity ID
 * @returns Promise<SingleSportsWorkerResponse>
 */
export const getSportsActivityById = async (id: string): Promise<SingleSportsWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getSportsActivityById/${id}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SingleSportsWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching sports activity with ID ${id}:`, error);
    return { success: false, data: {} as SportsWorker };
  }
};

/**
 * Update a sports activity provider by ID
 * @param id string - sports activity ID
 * @param workerData FormData - contains updated fields and images
 * @returns Promise<SingleSportsWorkerResponse>
 */
export const updateSportsActivity = async (
  id: string,
  workerData: FormData
): Promise<SingleSportsWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/updateSportsActivity/${id}`, {
      method: "PUT",
      body: workerData,
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: SingleSportsWorkerResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating sports activity with ID ${id}:`, error);
    return { success: false, data: {} as SportsWorker };
  }
};

/**
 * Delete a sports activity by ID
 * @param id string - sports activity ID
 * @returns Promise<{ success: boolean; message?: string }>
 */
export const deleteSportsActivity = async (id: string): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deleteSportsActivity/${id}`, {
      method: "DELETE",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, message: data.message || "Deleted successfully" };
  } catch (error) {
    console.error(`Error deleting sports activity with ID ${id}:`, error);
    return { success: false, message: "Failed to delete sports activity" };
  }
};

/**
 * Fetch sports activities by user ID
 * FIXED: Changed endpoint from /getSportsByUserId to /getUserSports with query param
 * @param userId string - user ID
 * @returns Promise<SportsWorkerResponse>
 */
export const getUserSportsActivities = async ({ userId }: { userId: string }): Promise<SportsWorkerResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getUserSports?userId=${userId}`,
      {
        method: "GET",
        redirect: "follow"
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user sports activities:", error);
    return { success: false, count: 0, data: [] };
  }
};
