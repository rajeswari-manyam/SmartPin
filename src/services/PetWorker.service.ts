// src/services/PetService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* ===================== Interfaces ===================== */

export interface PetWorker {
  _id?: string;
  userId?: string;
  // ✅ API field names
  serviceName?: string;     // API sends this — primary name field
  name?: string;            // fallback
  description?: string;     // API sends this — primary description field
  bio?: string;             // fallback
  category?: string;
  email?: string;
  phone?: string;
  services?: string[];
  experience?: number;
  serviceCharge?: number;
  price?: number;           // API sends this
  priceType?: string;       // API sends this
  availableFrom?: string;
  availableTo?: string;
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

export interface PetWorkerResponse {
  success: boolean;
  count?: number;
  data?: PetWorker[];
  message?: string;
}

/* ===================== Add Pet Service ===================== */

export const addPetService = async (formData: FormData): Promise<PetWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/addPetService`, {
      method: "POST",
      body: formData,
      redirect: "follow"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error adding pet service:", error);
    return { success: false, message: "Failed to add pet service" };
  }
};

/* ===================== Get Nearby Pet Workers ===================== */

export const getNearbyPetWorkers = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<PetWorkerResponse> => {
  if (!distance || distance <= 0) throw new Error("Please provide a valid distance in km");
  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyPetServices?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching pet service workers:", error);
    return { success: false, count: 0, data: [] };
  }
};

/* ===================== Get All Pet Services ===================== */

export const getAllPetServices = async (): Promise<PetWorkerResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllPetServices`, {
      method: "GET",
      redirect: "follow"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching all pet services:", error);
    return { success: false, count: 0, data: [] };
  }
};

/* ===================== Get Pet Service By ID ===================== */

export const getPetServiceById = async (serviceId: string): Promise<PetWorkerResponse> => {
  if (!serviceId) throw new Error("Pet service ID is required");
  try {
    const response = await fetch(`${API_BASE_URL}/getPetServiceById/${serviceId}`, {
      method: "GET",
      redirect: "follow"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching pet service by ID:", error);
    return { success: false, data: [] };
  }
};

/* ===================== Update Pet Service ===================== */

export const updatePetServiceById = async (
  serviceId: string,
  formData: FormData
): Promise<PetWorkerResponse> => {
  if (!serviceId) throw new Error("Pet service ID is required");
  try {
    const response = await fetch(`${API_BASE_URL}/updatePetService/${serviceId}`, {
      method: "PUT",
      body: formData,
      redirect: "follow"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error updating pet service:", error);
    return { success: false, message: "Failed to update pet service" };
  }
};

/* ===================== Delete Pet Service ===================== */

export const deletePetServiceById = async (serviceId: string): Promise<PetWorkerResponse> => {
  if (!serviceId) throw new Error("Pet service ID is required");
  try {
    const response = await fetch(`${API_BASE_URL}/deletePetService/${serviceId}`, {
      method: "DELETE",
      redirect: "follow"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error deleting pet service:", error);
    return { success: false, message: "Failed to delete pet service" };
  }
};

/* ===================== Get Pet Services By User ===================== */

export const getUserPetServices = async (userId: string): Promise<PetWorkerResponse> => {
  if (!userId) throw new Error("User ID is required");
  try {
    const response = await fetch(`${API_BASE_URL}/getUserPets?userId=${userId}`, {
      method: "GET",
      redirect: "follow"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user pet services:", error);
    return { success: false, count: 0, data: [], message: "Failed to fetch user pet services" };
  }
};