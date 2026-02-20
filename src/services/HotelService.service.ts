// src/services/HotelService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface Hotel {
    _id?: string;
    userId?: string;
    name?: string;
    type?: string;
    email?: string;
    phone?: string;
    description?: string;
    service?: string;
    priceRange?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    images?: string[];
    latitude?: number;
    longitude?: number;
    ratings?: number;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

export interface HotelResponse {
    success: boolean;
    count: number;
    data: Hotel[];
}

/**
 * Fetch all hotels
 */
export const getAllHotels = async (): Promise<HotelResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/getAllHotelTravel`, {
            method: "GET",
            redirect: "follow",
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: HotelResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching all hotels:", error);
        return { success: false, count: 0, data: [] };
    }
};

/**
 * Fetch nearby hotels
 */
export const getNearbyHotels = async (
    latitude: number,
    longitude: number,
    distance: number
): Promise<HotelResponse> => {
    if (!distance || distance <= 0) {
        throw new Error("Please provide a valid distance in km");
    }
    try {
        const response = await fetch(
            `${API_BASE_URL}/getNearbyhotelTravel?latitude=${latitude}&longitude=${longitude}&distance=${distance}`,
            { method: "GET", redirect: "follow" }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: HotelResponse = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching nearby hotels:", error);
        return { success: false, count: 0, data: [] };
    }
};
/**
 * Create hotel with images (multipart/form-data)
 */
export const createHotelWithImages = async (
  hotel: Hotel,
  images?: File[]
): Promise<any> => {
  try {
    const formData = new FormData();

    // append hotel fields
    Object.entries(hotel).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== "images") {
        formData.append(key, String(value));
      }
    });

    // append images
    if (images && images.length > 0) {
      images.forEach((file) => {
        formData.append("images", file); // backend field name must be "images"
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/createHotelTravel`,
      {
        method: "POST",
        body: formData,
        redirect: "follow",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating hotel with images:", error);
    return { success: false, message: "Failed to create hotel" };
  }
};

/**
 * Fetch a hotel by ID
 */
export const getHotelById = async (hotelId: string): Promise<Hotel | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/gethotelTravelById/${hotelId}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result?.data || null;
  } catch (error) {
    console.error(`Error fetching hotel with ID ${hotelId}:`, error);
    return null;
  }
};

export const updateHotel = async (hotelId: string, hotel: Hotel): Promise<any> => {
  try {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

    const urlencoded = new URLSearchParams();
    Object.entries(hotel).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlencoded.append(key, String(value));
      }
    });

    const requestOptions: RequestInit = {
      method: "PUT",
      headers: myHeaders,
      body: urlencoded,
      redirect: "follow",
    };

    const response = await fetch(`${API_BASE_URL}/updatehotelTravel/${hotelId}`, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error updating hotel with ID ${hotelId}:`, error);
    return { success: false, message: "Failed to update hotel" };
  }
};
export const deleteHotel = async (hotelId: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deletehotelTravel/${hotelId}`, {
      method: "DELETE",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error(`Error deleting hotel with ID ${hotelId}:`, error);
    return { success: false, message: "Failed to delete hotel" };
  }
};

/**
 * Fetch hotels created by a specific user
 */
export const getUserHotels = async (userId: string): Promise<HotelResponse> => {
  try {
    if (!userId) {
      return { success: false, count: 0, data: [] };
    }

    const response = await fetch(
      `${API_BASE_URL}/getUserHotels?userId=${encodeURIComponent(userId)}`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: HotelResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching user hotels:", error);
    return { success: false, count: 0, data: [] };
  }
};

