// src/services/ShoppingService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

/* =========================
   TYPES
========================= */
export interface ShoppingStore {
  _id?: string;
  userId?: string;
  storeName?: string;
  storeType?: string;
  email?: string;
  phone?: string;
  description?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number | string;
  longitude?: number | string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export interface ShoppingResponse {
  success: boolean;
  count: number;
  data: ShoppingStore[];
}

export interface SingleShoppingResponse {
  success: boolean;
  message?: string;
  data?: ShoppingStore;
}

export interface CreateShoppingResponse {
  success: boolean;
  message: string;
  data?: ShoppingStore;
}

export interface DeleteShoppingResponse {
  success: boolean;
  message: string;
}

export interface UpdateShoppingResponse {
  success: boolean;
  message: string;
  data?: ShoppingStore;
}

export interface UserStoresResponse {
  success: boolean;
  count: number;
  data: ShoppingStore[];
}

/* =========================
   CREATE SHOPPING STORE
========================= */
export const createShoppingStore = async (
  payload: ShoppingStore | FormData
): Promise<CreateShoppingResponse> => {
  try {
    let body: BodyInit;
    let headers: HeadersInit = {};

    // Check if FormData is passed (for image uploads)
    if (payload instanceof FormData) {
      body = payload;
      // Don't set Content-Type - browser will set it with boundary for multipart/form-data
      console.log('📤 Creating store with FormData (includes images)');
      const entries = Array.from(payload.entries());
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });
    } else {
      // Regular JSON payload (backward compatibility)
      const formData = new URLSearchParams();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, String(value));
        }
      });
      body = formData;
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      console.log('📤 Creating store with URLSearchParams (no images)');
    }

    const response = await fetch(`${API_BASE_URL}/shoppingRetailCreate`, {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    });

    const responseText = await response.text();
    console.log('📥 Server response:', responseText);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: `;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += errorData.message || errorData.error || 'Server error';
      } catch {
        errorMessage += responseText || response.statusText;
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return { success: false, message: "Invalid server response" };
    }

  } catch (error: any) {
    console.error("Error creating shopping store:", error);
    return {
      success: false,
      message: error.message || "Failed to create shopping store",
    };
  }
};

/* =========================
   GET NEARBY SHOPPING STORES
========================= */
export const getNearbyShoppingStores = async (
  latitude: number,
  longitude: number,
  distance: number
): Promise<ShoppingResponse> => {
  if (!distance || distance <= 0) {
    throw new Error("Please provide a valid distance in km");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/getNearbyShoppingRetail?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
      { method: "GET", redirect: "follow" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching nearby shopping stores:", error);
    return { success: false, count: 0, data: [] };
  }
};

/* =========================
   GET ALL SHOPPING RETAIL
========================= */
export const getAllShoppingRetail = async (): Promise<ShoppingResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllShoppingRetail`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching all shopping retail:", error);
    return { success: false, count: 0, data: [] };
  }
};

/* =========================
   GET SHOPPING RETAIL BY ID
========================= */
export const getShoppingRetailById = async (
  storeId: string
): Promise<SingleShoppingResponse> => {
  if (!storeId) {
    throw new Error("Store ID is required");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/getShoppingRetailById/${storeId}`,
      {
        method: "GET",
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching shopping retail by id:", error);
    return {
      success: false,
      message: "Failed to fetch shopping retail details",
    };
  }
};

/* =========================
   DELETE SHOPPING RETAIL
========================= */
export const deleteShoppingRetail = async (
  storeId: string
): Promise<DeleteShoppingResponse> => {
  if (!storeId) {
    throw new Error("Store ID is required");
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/deleteShoppingRetail/${storeId}`,
      {
        method: "DELETE",
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting shopping retail:", error);
    return {
      success: false,
      message: "Failed to delete shopping retail",
    };
  }
};

/* =========================
   GET USER STORES
========================= */
export const getUserStores = async (
  userId: string,
  storeType?: string,
  storeName?: string
): Promise<UserStoresResponse> => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const queryParams = new URLSearchParams();
    queryParams.append("userId", userId);

    if (storeType) {
      queryParams.append("storeType", storeType);
    }

    if (storeName) {
      queryParams.append("storeName", storeName);
    }

    const response = await fetch(
      `${API_BASE_URL}/getUserStores?${queryParams.toString()}`,
      {
        method: "GET",
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user stores:", error);
    return {
      success: false,
      count: 0,
      data: [],
    };
  }
};

/* =========================
   UPDATE SHOPPING RETAIL
========================= */
export const updateShoppingRetail = async (
  storeId: string,
  payload: ShoppingStore | FormData
): Promise<UpdateShoppingResponse> => {
  if (!storeId) {
    throw new Error("Store ID is required");
  }

  try {
    let body: BodyInit;

    // Check if FormData is passed (for image uploads)
    if (payload instanceof FormData) {
      body = payload;
      console.log('📤 Updating store with FormData (includes images)');
      const entries = Array.from(payload.entries());
      entries.forEach(([key, value]) => {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });
    } else {
      // Convert object payload to FormData
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach((v) => formData.append(key, v));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      body = formData;
      console.log('📤 Updating store with FormData (from object)');
    }

    const response = await fetch(
      `${API_BASE_URL}/updateShoppingRetail/${storeId}`,
      {
        method: "PUT",
        body,
        redirect: "follow",
      }
    );

    const responseText = await response.text();
    console.log('📥 Server response:', responseText);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: `;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage += errorData.message || errorData.error || 'Server error';
      } catch {
        errorMessage += responseText || response.statusText;
      }
      throw new Error(errorMessage);
    }

    try {
      return JSON.parse(responseText);
    } catch {
      return { success: false, message: "Invalid server response" };
    }

  } catch (error: any) {
    console.error("Error updating shopping retail:", error);
    return {
      success: false,
      message: error.message || "Failed to update shopping retail",
    };
  }
};
