// src/services/EventService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ===================== INTERFACES ===================== */

export interface EventWorker {
  _id?: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
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

export interface EventWorkerResponse {
  success: boolean;
  count: number;
  data: EventWorker[];
}

export interface AddEventServiceResponse {
  success: boolean;
  message: string;
  data?: EventWorker;
}

/* ===================== GET NEARBY EVENT SERVICES ===================== */

/**
 * Fetch nearby event service workers
 */
export const getNearbyEventWorkers = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<EventWorkerResponse> => {
  if (!distance || distance <= 0) {
    throw new Error("Please provide a valid distance in km");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyEventServices?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching event service workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

/* ===================== ADD EVENT SERVICE ===================== */

/**
 * Add new event service
 */
export const addEventService = async (
  formData: FormData
): Promise<AddEventServiceResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/addEventService`,
      {
        method: "POST",
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding event service:", error);
    return {
      success: false,
      message: "Failed to add event service"
    };
  }
};
/* ===================== GET ALL EVENT SERVICES ===================== */

/**
 * Fetch all event services
 * @returns Promise<EventWorkerResponse>
 */
export const getAllEventServices = async (): Promise<EventWorkerResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/getAllEventServices`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all event services:", error);
    return { success: false, count: 0, data: [] };
  }
};
/* ===================== GET EVENT SERVICE BY ID ===================== */

export interface EventServiceByIdResponse {
  success: boolean;
  data: EventWorker | null;
}

/**
 * Fetch event service by ID
 * @param eventServiceId string
 */
export const getEventServiceById = async (
  eventServiceId: string
): Promise<EventServiceByIdResponse> => {
  if (!eventServiceId) {
    throw new Error("Event service ID is required");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/geteventServiceById/${eventServiceId}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching event service by ID:", error);
    return {
      success: false,
      data: null
    };
  }
};
/* ===================== UPDATE EVENT SERVICE ===================== */

export interface UpdateEventServiceResponse {
  success: boolean;
  message: string;
  data?: EventWorker;
}

/**
 * Update event service by ID
 * @param eventServiceId string
 * @param formData FormData
 */
export const updateEventService = async (
  eventServiceId: string,
  formData: FormData
): Promise<UpdateEventServiceResponse> => {
  if (!eventServiceId) {
    throw new Error("Event service ID is required");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/updateEvent/${eventServiceId}`,
      {
        method: "PUT",
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating event service:", error);
    return {
      success: false,
      message: "Failed to update event service"
    };
  }
};
/* ===================== DELETE EVENT SERVICE ===================== */

export interface DeleteEventServiceResponse {
  success: boolean;
  message: string;
}

/**
 * Delete event service by ID
 * @param eventServiceId string
 */
export const deleteEventService = async (
  eventServiceId: string
): Promise<DeleteEventServiceResponse> => {
  if (!eventServiceId) {
    throw new Error("Event service ID is required");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/deleteEvent/${eventServiceId}`,
      {
        method: "DELETE"
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting event service:", error);
    return {
      success: false,
      message: "Failed to delete event service"
    };
  }
};
/* ===================== GET USER EVENTS ===================== */

export interface GetUserEventsResponse {
  success: boolean;
  count: number;
  data: EventWorker[];
}

/**
 * Fetch user events by userId, category, and name
 */
export const getUserEvents = async (
  userId: string,
  category?: string,
  name?: string
): Promise<GetUserEventsResponse> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const queryParams = new URLSearchParams();

    queryParams.append("userId", userId);

    if (category) {
      queryParams.append("category", category);
    }

    if (name) {
      queryParams.append("name", name);
    }

    const response = await fetch(
      `${API_BASE_URL}/getUserEvents?${queryParams.toString()}`,
      { method: "GET" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user events:", error);
    return {
      success: false,
      count: 0,
      data: []
    };
  }
};
