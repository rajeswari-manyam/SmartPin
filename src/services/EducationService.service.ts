// src/services/EducationService.service.ts

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export interface EducationService {
  _id?: string;
  userId?: string;
  name?: string;
  type?: string;
  email?: string;
  phone?: string;
  description?: string;
  subjects?: string[];
  qualifications?: string[];
  experience?: string;
  charges?: number | string;
  chargeType?: string;
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

export interface EducationResponse {
  success: boolean;
  count: number;
  data: EducationService[];
}

// ── Helper: extract array from any response shape ─────────────────────────────
const extractArray = (response: any): EducationService[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.educations)) return response.educations;
  if (Array.isArray(response.result)) return response.result;
  if (response.data && Array.isArray(response.data.data)) return response.data.data;
  if (response.data && Array.isArray(response.data.educations)) return response.data.educations;
  if (response.data && typeof response.data === "object") return [response.data];
  return [];
};

/**
 * Fetch nearby educational/training centers.
 * distance defaults to 10 km so the param is never missing/zero.
 */
export const getNearbyEducationCenters = async (
  latitude: number,
  longitude: number,
  distance: number = 10   // ✅ default 10 km — no longer throws when omitted
): Promise<EducationResponse> => {
  // Clamp to a safe minimum instead of throwing
  const safeDistance = (!distance || distance <= 0) ? 10 : distance;

  try {
    const url = `${API_BASE_URL}/getNearbyEducation?latitude=${latitude}&longitude=${longitude}&distance=${safeDistance}`;
    console.log("🎓 getNearbyEducationCenters →", url);

    const response = await fetch(url, { method: "GET", redirect: "follow" });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const raw = await response.json();
    console.log("🎓 getNearbyEducationCenters raw:", raw);

    const data = extractArray(raw);
    return { success: true, count: data.length, data };
  } catch (error) {
    console.error("❌ getNearbyEducationCenters error:", error);
    return { success: false, count: 0, data: [] };
  }
};

/**
 * Create a new education/training service
 */
export const createEducationService = async (
  education: EducationService | FormData
): Promise<any> => {
  try {
    let body: BodyInit;
    let headers: HeadersInit = {};

    if (education instanceof FormData) {
      body = education;
      console.log('📤 Creating education service with FormData (includes images)');
    } else {
      const formData = new URLSearchParams();
      for (const key in education) {
        const value = (education as any)[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, value.join(", "));
          } else {
            formData.append(key, value.toString());
          }
        }
      }
      body = formData;
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    const response = await fetch(`${API_BASE_URL}/educationCreate`, {
      method: "POST",
      headers,
      body,
      redirect: "follow",
    });

    const responseText = await response.text();
    console.log('📥 createEducationService response:', responseText);

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
    console.error("❌ createEducationService error:", error);
    return { success: false, message: error.message || "Failed to create education service" };
  }
};

/**
 * Fetch all educational/training services
 */
export const getAllEducationServices = async (): Promise<EducationResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getAllEducation`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const raw = await response.json();
    const data = extractArray(raw);
    return { success: true, count: data.length, data };
  } catch (error) {
    console.error("❌ getAllEducationServices error:", error);
    return { success: false, count: 0, data: [] };
  }
};

export const getEducationById = async (id: string): Promise<EducationService | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/getEducationById/${id}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // May be wrapped: { data: {...} } or bare object
    return (data && typeof data === "object" && data._id) ? data : (data?.data || data);
  } catch (error) {
    console.error(`❌ getEducationById(${id}) error:`, error);
    return null;
  }
};

/**
 * Update an existing education service
 */
export const updateEducationService = async (
  id: string,
  education: EducationService | FormData
): Promise<any> => {
  try {
    let body: BodyInit;

    if (education instanceof FormData) {
      body = education;
      console.log('📤 Updating education service with FormData');
    } else {
      const formData = new FormData();
      for (const key in education) {
        const value = (education as any)[key];
        if (value !== undefined && value !== null) {
          if (key === "images" && Array.isArray(value)) {
            value.forEach((file: any) => {
              if (file instanceof File) {
                formData.append("images", file, file.name);
              } else if (typeof file === "string") {
                formData.append("images", file);
              }
            });
          } else if (Array.isArray(value)) {
            formData.append(key, value.join(", "));
          } else {
            formData.append(key, value.toString());
          }
        }
      }
      body = formData;
    }

    const response = await fetch(`${API_BASE_URL}/updateEducation/${id}`, {
      method: "PUT",
      body,
      redirect: "follow",
    });

    const responseText = await response.text();
    console.log('📥 updateEducationService response:', responseText);

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

    try { return JSON.parse(responseText); }
    catch { return { success: false, message: "Invalid server response" }; }
  } catch (error: any) {
    console.error(`❌ updateEducationService(${id}) error:`, error);
    return { success: false, message: error.message || "Failed to update education service" };
  }
};

/**
 * Delete an education service
 */
export const deleteEducationService = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/deleteEducation/${id}`, {
      method: "DELETE",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ deleteEducationService(${id}) error:`, error);
    return { success: false, message: "Failed to delete education service" };
  }
};

/**
 * Fetch education/training services for a specific user
 */
export const getUserEducations = async (
  userId: string,
  type?: string,
  name?: string
): Promise<EducationResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("userId", userId);
    if (type) queryParams.append("type", type);
    if (name) queryParams.append("name", name);

    const url = `${API_BASE_URL}/getUserEducations?${queryParams.toString()}`;
    console.log("🎓 getUserEducations →", url);

    const response = await fetch(url, { method: "GET", redirect: "follow" });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const raw = await response.json();
    console.log("🎓 getUserEducations raw:", raw);

    const data = extractArray(raw);
    return { success: true, count: data.length, data };
  } catch (error) {
    console.error(`❌ getUserEducations(${userId}) error:`, error);
    return { success: false, count: 0, data: [] };
  }
};
