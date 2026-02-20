// src/services/HospitalService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* =======================
   INTERFACES
======================= */

export interface Hospital {   
  id?: string;
  _id?: string;  // Added for MongoDB compatibility
  hospitalName?: string;
  hospitalType?: string;
  departments?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  services?: string;
  images?: string[];
  rating?: number;
  [key: string]: any;
}

export interface HospitalResponse {
  success: boolean;
  count: number;
  data: Hospital[];
}

export interface CreateHospitalPayload {
  userId: string;
  hospitalName: string;
  hospitalType: string;
  departments: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  latitude: string | number;
  longitude: string | number;
  services: string;
  images?: File[];
}

export interface CreateHospitalResponse {
  success: boolean;
  message: string;
  data?: Hospital;
}

/* =======================
   API METHODS
======================= */

/**
 * Fetch nearby hospitals
 */
export const getNearbyHospitals = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<HospitalResponse> => {
  if (!distance || distance <= 0) throw new Error("Please provide a valid distance in km");

  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyHealthcare?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: HospitalResponse = await response.json();
    
    // Normalize the data to ensure consistent ID field
    if (data.success && data.data) {
      data.data = data.data.map(hospital => ({
        ...hospital,
        id: hospital.id || hospital._id
      }));
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Create a new hospital (supports images)
 */
export const createHospital = async (
  payload: CreateHospitalPayload
): Promise<CreateHospitalResponse> => {
  try {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        value.forEach((file) => formData.append("images", file));
      } else {
        formData.append(key, value.toString());
      }
    });

    const response = await fetch(`${API_BASE_URL}/createHealthcare`, {
      method: "POST",
      body: formData,
      redirect: "follow",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: CreateHospitalResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating hospital:", error);
    return { success: false, message: "Failed to create hospital" };
  }
};

/**
 * Update hospital (supports images)
 */
export interface UpdateHospitalPayload {
  hospitalName?: string;
  hospitalType?: string;
  departments?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: string | number;
  longitude?: string | number;
  services?: string;
  images?: File[];
}

export const updateHospital = async (
  hospitalId: string,
  payload: UpdateHospitalPayload
): Promise<CreateHospitalResponse> => {
  try {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === "images" && Array.isArray(value)) {
          value.forEach((file) => formData.append("images", file));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${API_BASE_URL}/updatehealthcare/${hospitalId}`, {
      method: "PUT",
      body: formData,
      redirect: "follow",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: CreateHospitalResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating hospital with ID ${hospitalId}:`, error);
    return { success: false, message: "Failed to update hospital" };
  }
};

/**
 * Delete hospital
 */
export const deleteHospital = async (hospitalId: string): Promise<CreateHospitalResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deletehealthcare/${hospitalId}`, {
      method: "DELETE",
      redirect: "follow",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: CreateHospitalResponse = await response.json();
    return data;
  } catch (error) {
    console.error(`Error deleting hospital with ID ${hospitalId}:`, error);
    return { success: false, message: "Failed to delete hospital" };
  }
};

/**
 * Fetch all hospitals
 */
export const getAllHospitals = async (): Promise<HospitalResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllHealthcare`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: HospitalResponse = await response.json();
    
    // Normalize the data to ensure consistent ID field
    if (data.success && data.data) {
      data.data = data.data.map(hospital => ({
        ...hospital,
        id: hospital.id || hospital._id
      }));
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching all hospitals:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Fetch hospital by ID
 */
export const getHospitalById = async (hospitalId: string): Promise<CreateHospitalResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gethealthcareById/${hospitalId}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: CreateHospitalResponse = await response.json();
    
    // Normalize the data to ensure consistent ID field
    if (data.success && data.data) {
      data.data = {
        ...data.data,
        id: data.data.id || data.data._id
      };
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching hospital with ID ${hospitalId}:`, error);
    return { success: false, message: "Failed to fetch hospital" };
  }
};

/**
 * Fetch hospitals by user ID
 * NOTE: API endpoint is 'getUsersHealth' (not 'getUserHealthcare')
 */
export const getUserHospitals = async (userId: string): Promise<HospitalResponse> => {
  try {
    // Using the correct endpoint from Postman: getUsersHealth
    const response = await fetch(`${API_BASE_URL}/getUsersHealth?userId=${userId}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data: HospitalResponse = await response.json();
    
    // Normalize the data to ensure consistent ID field
    if (data.success && data.data) {
      data.data = data.data.map(hospital => ({
        ...hospital,
        id: hospital.id || hospital._id
      }));
    }
    
    console.log("getUserHospitals API response:", data);
    return data;
  } catch (error) {
    console.error(`Error fetching hospitals for user ID ${userId}:`, error);
    return { success: false, count: 0, data: [] };
  }
};
