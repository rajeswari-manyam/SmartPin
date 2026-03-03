import axios from "axios";

export const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "";

const API_FORM = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/x-www-form-urlencoded",
    },
});

const API_MULTIPART = axios.create({
    baseURL: API_BASE_URL,
});

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — Email-based OTP login (no phone login)
// ─────────────────────────────────────────────────────────────────────────────

export interface RegisterWithOtpParams {
    email: string;
    name: string;
    latitude: number;
    longitude: number;
    role?: string;
}

interface VerifyOtpParams {
    email: string;
    otp: string;
    fcmToken: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    otp?: string;
    data?: any;
    token?: string;
    user?: {
        id: string;
        email: string;
        name: string;
        token?: string;
    };
}

export const registerWithOtp = async (params: RegisterWithOtpParams): Promise<ApiResponse> => {
    try {
        const formData = new URLSearchParams();
        formData.append("email", params.email);
        formData.append("name", params.name);
        formData.append("latitude", params.latitude.toString());
        formData.append("longitude", params.longitude.toString());

        const response = await fetch(`${API_BASE_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
        });

        const data = await response.json();

        // 409 = email already exists, OTP still sent — treat as success
        if (response.status === 409) {
            return { success: true, ...data };
        }

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return data;
    } catch (error) {
        console.error("Register with OTP error:", error);
        throw error;
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// REPLACE ONLY THIS FUNCTION in your api.service.ts
// ─────────────────────────────────────────────────────────────────────────────

export const verifyOtp = async (params: VerifyOtpParams): Promise<ApiResponse> => {
    try {
        const formData = new URLSearchParams();
        formData.append("email", params.email);
        formData.append("otp", params.otp);

        // ✅ FIXED: Only send fcmToken if it's non-empty — empty string causes 400
        if (params.fcmToken && params.fcmToken.trim().length > 0) {
            formData.append("fcmToken", params.fcmToken);
        }

        console.log("📤 verify-otp request:", {
            email: params.email,
            otp: params.otp,
            fcmToken: params.fcmToken ? "present" : "skipped (empty)",
        });

        const response = await fetch(`${API_BASE_URL}/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ verify-otp response body:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Verify OTP error:", error);
        throw error;
    }
};

export const resendOtp = async (email: string): Promise<ApiResponse> => {
    try {
        const formData = new URLSearchParams();
        formData.append("email", email);

        const response = await fetch(`${API_BASE_URL}/resend-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Resend OTP error:", error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateJobPayload {
    userId: string;
    title: string;
    name: string;
    phone?: string;       // optional (email-based login)
    description: string;
    category: string;
    subcategory?: string;
    jobType: "FULL_TIME" | "PART_TIME";
    servicecharges: string;
    startDate: string;
    endDate: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number | string;
    longitude: number | string;
    images?: File[];
}

export const createJob = async (data: CreateJobPayload) => {
    const formData = new FormData();
    formData.append("userId", data.userId);
    formData.append("title", data.title);
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("category", data.category);
    if (data.subcategory) formData.append("subcategory", data.subcategory);
    formData.append("jobType", data.jobType);
    formData.append("servicecharges", data.servicecharges);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    if (data.phone) formData.append("phone", data.phone);
    formData.append("area", data.area);
    formData.append("city", data.city);
    formData.append("state", data.state);
    formData.append("pincode", data.pincode);
    formData.append("latitude", String(data.latitude));
    formData.append("longitude", String(data.longitude));
    if (data.images?.length) {
        data.images.forEach((file) => formData.append("images", file));
    }

    const response = await API_MULTIPART.post("/jobcreate", formData);
    return response.data;
};

export const getJobById = async (id: string) => {
    const response = await axios.get(`${API_BASE_URL}/getJobById/${id}`);
    return response.data;
};

export const deleteJob = async (jobId: string) => {
    const response = await axios.delete(`${API_BASE_URL}/deleteJob/${jobId}`);
    return response.data;
};

export interface UpdateJobPayload {
    title?: string;
    description?: string;
    category?: string;
    latitude?: number | string;
    longitude?: number | string;
    images?: File[];
}

export const updateJob = async (jobId: string, payload: any) => {
    const formData = new FormData();
    if (payload.title) formData.append("title", payload.title);
    if (payload.description) formData.append("description", payload.description);
    if (payload.category) formData.append("category", payload.category);
    if (payload.subcategory) formData.append("subcategory", payload.subcategory);
    if (payload.price) formData.append("price", payload.price);
    if (payload.location) formData.append("location", payload.location);
    if (payload.latitude) formData.append("latitude", payload.latitude.toString());
    if (payload.longitude) formData.append("longitude", payload.longitude.toString());
    if (payload.images?.length) {
        payload.images.forEach((image: File) => formData.append("images", image));
    }

    const response = await fetch(`${API_BASE_URL}/updateJob/${jobId}`, {
        method: "PUT",
        body: formData,
    });
    return response.json();
};

export const getAllJobs = async () => {
    const response = await axios.get(`${API_BASE_URL}/getAllJobs`);
    return response.data;
};

export const getUserJobs = async (userId: string) => {
    const response = await axios.get(`${API_BASE_URL}/getUserJobs`, { params: { userId } });
    return response.data;
};

export const getNearbyJobs = async (latitude: number, longitude: number) => {
    const res = await fetch(
        `${API_BASE_URL}/getNearbyJobs?latitude=${latitude}&longitude=${longitude}`,
        { method: "GET", redirect: "follow" }
    );
    if (!res.ok) throw new Error("Failed to fetch nearby jobs");
    return res.json();
};

export interface JobDetail {
    _id: string;
    userId: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    jobType: "FULL_TIME" | "PART_TIME";
    servicecharges: string;
    startDate: string;
    endDate: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    images?: string[];
    distance?: number;
    createdAt: string;
    updatedAt: string;
}

export interface NearbyJobsForWorkerResponse {
    success: boolean;
    message: string;
    count: number;
    jobs: JobDetail[];
}

export const getNearbyJobsForWorker = async (
    workerId: string
): Promise<NearbyJobsForWorkerResponse> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/getNearbyJobsWorker/${workerId}`,
            { method: "GET", redirect: "follow" }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Get Nearby Jobs For Worker API error:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ Get nearby jobs for worker error:", error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// WORKERS — nearby search
// ─────────────────────────────────────────────────────────────────────────────

export const getNearbyWorkers = async (
    latitude: number,
    longitude: number,
    range: number,
    category: string,
    subcategory: string
) => {
    const url =
        `${API_BASE_URL}/getNearbyWorkers` +
        `?latitude=${latitude}&longitude=${longitude}&range=${range}` +
        `&category=${encodeURIComponent(category.trim())}` +
        `&subcategory=${encodeURIComponent(subcategory.trim())}`;

    const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
};

export const getUserLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                }),
            (error) => reject(error)
        );
    });
};

export const getAllWorkers = async () => {
    const response = await axios.get(`${API_BASE_URL}/getAllWorkers`);
    return response.data;
};

export interface Worker {
    _id: string;
    userId: string;
    name: string;
    email?: string;
     phone?: string;          // ✅ ADD THIS LINE
    category: string | string[];
    subCategories?: string[];
    skills?: string[];
    bio?: string;
    chargeType: "hour" | "day";
    serviceCharge: number;
    latitude: number;
    longitude: number;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    isActive: boolean;
    images?: string[];
    profilePic?: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export const getWorkerById = async (workerId: string): Promise<{ success: boolean; data: Worker }> => {
    const response = await axios.get(`${API_BASE_URL}/getWorkerById/${workerId}`);
    return response.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE WORKER — Step 1  POST /createworkers
//
// Backend contract (confirmed via Postman):
//   Fields  : userId, name, area, city, state, pincode,
//             latitude, longitude, phone (optional), profilePic (optional File)
//   Response: { success, message, worker: { _id, userId, name, phone, ... } }
// ─────────────────────────────────────────────────────────────────────────────
export interface CreateWorkerBasePayload {
    userId: string;
    name: string;
    area?: string;
    city: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    profilePic?: File;
}

export interface WorkerResponse {
    success: boolean;
    message: string;
    worker: {
        _id: string;
        userId: string;
        name: string;
        phone?: string;
        profilePic?: string;
        city: string;
        state?: string;
        pincode?: string;
        latitude?: number;
        longitude?: number;
    };
}

/* ─────────────────────────────────────────────
   CREATE WORKER PROFILE
   POST /createworkers
   ───────────────────────────────────────────── */
export const createWorkerBase = async (
    payload: CreateWorkerBasePayload
): Promise<WorkerResponse> => {
    try {
        const formData = new FormData();

        formData.append("userId", payload.userId);
        formData.append("name", payload.name);
        formData.append("city", payload.city);

        if (payload.area) formData.append("area", payload.area);
        if (payload.state) formData.append("state", payload.state);
        if (payload.pincode) formData.append("pincode", payload.pincode);
        if (payload.phone) formData.append("phone", payload.phone);
        if (payload.latitude !== undefined)
            formData.append("latitude", String(payload.latitude));
        if (payload.longitude !== undefined)
            formData.append("longitude", String(payload.longitude));
        if (payload.profilePic)
            formData.append("profilePic", payload.profilePic);

        const res = await API_MULTIPART.post("/createworkers", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data;
    } catch (err: any) {
        const message =
            err?.response?.data?.message ||
            err?.message ||
            "Failed to create worker profile";

        throw new Error(message);
    }
};
// ─────────────────────────────────────────────────────────────────────────────
// ADD WORKER SKILL — Step 2  POST /addworkerSkill
// ─────────────────────────────────────────────────────────────────────────────

export interface AddWorkerSkillPayload {
    workerId: string;
    category: string | string[];
    subCategory: string;
    skill: string;
    serviceCharge: number;
    chargeType: "hour" | "day" | "fixed";
    images?: File[];
}

export interface AddWorkerSkillResponse {
    success: boolean;
    message: string;
    skill: {
        _id: string;
        userId: string;
        workerId: string;
        name: string;
        category: string[];
        subCategory: string;
        skill: string;
        serviceCharge: number;
        chargeType: string;
        area: string;
        city: string;
        state: string;
        pincode: string;
        latitude: number;
        longitude: number;
        createdAt: string;
        updatedAt: string;
    };
}

export const addWorkerSkill = async (
    payload: AddWorkerSkillPayload
): Promise<AddWorkerSkillResponse> => {
    try {
        const formData = new FormData();
        formData.append("workerId", payload.workerId);

        const categoryString = Array.isArray(payload.category)
            ? payload.category.join(",")
            : payload.category;
        formData.append("category", categoryString);

        formData.append("subCategory", payload.subCategory);
        formData.append("skill", payload.skill);
        formData.append("serviceCharge", String(payload.serviceCharge));
        formData.append("chargeType", payload.chargeType);

        if (payload.images?.length) {
            payload.images.forEach((file) => formData.append("images", file));
        }

        const response = await fetch(`${API_BASE_URL}/addworkerSkill`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("addWorkerSkill API error:", errorText);
            throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
        }

        const data: AddWorkerSkillResponse = await response.json();
        console.log("✅ addWorkerSkill response:", data);
        return data;
    } catch (error) {
        console.error("❌ addWorkerSkill error:", error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED WORKER CREATION (Step 1 + Step 2)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateWorkerCompletePayload {
    userId: string;
    name: string;
    email?: string;
    /** Optional phone — auto-detected, not used for login */
    phone?: string;
    category: string | string[];
    subCategory: string;
    skills: string;
    bio?: string;
    serviceCharge: number;
    chargeType: "hour" | "day";
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
    images?: File[];
    profilePic?: File;
}

export const createWorkerComplete = async (
    payload: CreateWorkerCompletePayload
): Promise<{
    success: boolean;
    message: string;
    baseWorker: WorkerResponse;
    skillWorker: AddWorkerSkillResponse;
}> => {
    try {
        console.log("📝 Step 1: Creating base worker profile...");

        const baseWorkerResponse = await createWorkerBase({
            userId: payload.userId,
            name: payload.name,
            area: payload.area,
            city: payload.city,
            state: payload.state,
            pincode: payload.pincode,
            latitude: payload.latitude,
            longitude: payload.longitude,
            phone: payload.phone,
            profilePic: payload.profilePic,
        });

        const workerId = baseWorkerResponse.worker._id;
        console.log("✅ Base worker created with ID:", workerId);

        console.log("📝 Step 2: Adding worker skills...");

        const skillResponse = await addWorkerSkill({
            workerId,
            category: payload.category,
            subCategory: payload.subCategory,
            skill: payload.skills,
            serviceCharge: payload.serviceCharge,
            chargeType: payload.chargeType,
            images: payload.images,
        });

        console.log("✅ Worker skills added successfully");

        return {
            success: true,
            message: "Worker profile created successfully with skills",
            baseWorker: baseWorkerResponse,
            skillWorker: skillResponse,
        };
    } catch (error: any) {
        console.error("❌ createWorkerComplete error:", error);
        throw error;
    }
};
// 🔹 Get worker using userId (used on WorkerProfile page)
export const getWorkerByUserId = async (userId: string) => {
    const res = await fetch(
        `${API_BASE_URL}/getWorkerByUserId/${userId}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!res.ok) {
        throw new Error("Worker not found");
    }

    return res.json();
};
// ─────────────────────────────────────────────────────────────────────────────
// GET WORKER WITH SKILLS
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkerSkillDetail {
    _id: string;
    userId: string;
    workerId: string;
    name: string;
    category: string[];
    subCategory: string;
    skill: string;
    serviceCharge: number;
    chargeType: "hour" | "day";
    profilePic: string;
    images: string[];
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface WorkerWithSkillsResponse {
    success: boolean;
    source: "Worker" | "WorkerSkill";
    worker: {
        _id: string;
        userId: string;
        name: string;
        profilePic: string;
        images: string[];
        area: string;
        city: string;
        state: string;
        pincode: string;
        latitude: number;
        longitude: number;
        serviceCharge: number;
        chargeType: "hour" | "day";
        skills: string[];
        categories: string[][];
        subCategories: string[];
    };
    totalSkills: number;
    workerSkills: WorkerSkillDetail[];
}

export const getWorkerWithSkills = async (
    workerId: string
): Promise<WorkerWithSkillsResponse> => {
    try {
        const response = await API_MULTIPART.get(`/getWorkerWithSkills`, {
            params: { workerId }
        });
        return response.data;
    } catch (error) {
        console.error("❌ getWorkerWithSkills error:", error);
        throw error;
    }
};

export interface WorkerListItem {
    _id: string;
    name: string;
    profilePic: string;
    images: string[];
    skills: string[];
    categories: string[];
    subCategories: string[];
    serviceCharge: number;
    chargeType: "hour" | "day" | "";
    area: string;
    city: string;
    state: string;
    pincode: string;
    totalSkills: number;
}

export const getWorkersWithSkills = async (): Promise<{
    success: boolean;
    count: number;
    workers: WorkerListItem[];
}> => {
    const response = await fetch(`${API_BASE_URL}/getWorkersWithSkills`);
    if (!response.ok) throw new Error("Failed to fetch workers");
    return response.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// WORKER SKILL CRUD
// ─────────────────────────────────────────────────────────────────────────────

export interface WorkerSkillResponse {
    success: boolean;
    workerSkill: {
        _id: string;
        userId: string;
        workerId: string;
        name: string;
        category: string[];
        subCategory: string;
        skill: string;
        serviceCharge: number;
        chargeType: "hour" | "day";
        profilePic: string;
        images: string[];
        area: string;
        city: string;
        state: string;
        pincode: string;
        latitude: number;
        longitude: number;
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
}

export const getWorkerSkillById = async (skillId: string): Promise<WorkerSkillResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/getWorkerSkillById/${skillId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ getWorkerSkillById error:", error);
        throw error;
    }
};

export interface UpdateWorkerSkillPayload {
    category?: string | string[];
    subCategory?: string;
    skill?: string;
    serviceCharge?: number;
    chargeType?: "hour" | "day" | "fixed";
}

export const updateWorkerSkill = async (
    skillId: string,
    payload: UpdateWorkerSkillPayload
): Promise<WorkerSkillResponse> => {
    try {
        const formData = new URLSearchParams();
        if (payload.category) {
            formData.append(
                "category",
                Array.isArray(payload.category) ? payload.category.join(",") : payload.category
            );
        }
        if (payload.subCategory) formData.append("subCategory", payload.subCategory);
        if (payload.skill) formData.append("skill", payload.skill);
        if (payload.serviceCharge !== undefined)
            formData.append("serviceCharge", String(payload.serviceCharge));
        if (payload.chargeType) formData.append("chargeType", payload.chargeType);

        const response = await fetch(`${API_BASE_URL}/updateWorkerSkillById/${skillId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ updateWorkerSkill error:", error);
        throw error;
    }
};

export const deleteWorkerSkill = async (
    skillId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/deleteWorkerSkill/${skillId}`, {
            method: "DELETE",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ deleteWorkerSkill error:", error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateUserPayload {
    name?: string;
    email?: string;
    phone?: string;
    category?: string;
    subCategory?: string;
    latitude?: number | string;
    longitude?: number | string;
    role?: string;
    profilePic?: File;
}

/** email is required (email-based login); phone is optional */
export interface User {
    _id: string;
    email: string;
    phone?: string;
    name: string;
    latitude?: string;
    longitude?: string;
    profilePic?: string;
    isVerified?: boolean;
    createdAt: string;
    updatedAt: string;
}

export const getUserById = async (userId: string): Promise<{ success: boolean; data: User }> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getUserById/${userId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to fetch user data");
    }
};

export const updateUserById = async (userId: string, payload: UpdateUserPayload) => {
    try {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value instanceof File ? value : String(value));
            }
        });

        const response = await axios.put(`${API_BASE_URL}/updateUserById/${userId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
        } else if (error.request) {
            throw new Error("No response from server. Please check your connection.");
        } else {
            throw new Error(error.message || "Failed to update profile");
        }
    }
};

export const getAllUsers = async (): Promise<{ success: boolean; data: User[] }> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/getAllUsers`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to fetch users");
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// BOOKINGS
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateBookingPayload {
    customer: string;
    worker: string;
    bookingType: "HOURLY" | "DAILY" | "MONTHLY";
    hours?: number;
    days?: number;
    months?: number;
    price: number;
    startDate: string;
    remarks?: string;
}

export const createBooking = async (
    payload: CreateBookingPayload
): Promise<{ success: boolean; message: string; data: any }> => {
    try {
        const formData = new URLSearchParams();
        formData.append("customer", payload.customer);
        formData.append("worker", payload.worker);
        formData.append("bookingType", payload.bookingType);
        formData.append("price", String(payload.price));
        formData.append("startDate", payload.startDate);
        if (payload.hours) formData.append("hours", String(payload.hours));
        if (payload.days) formData.append("days", String(payload.days));
        if (payload.months) formData.append("months", String(payload.months));
        if (payload.remarks) formData.append("remarks", payload.remarks);

        const response = await fetch(`${API_BASE_URL}/createBooking`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
        });
        if (!response.ok) throw new Error(await response.text());
        return await response.json();
    } catch (error) {
        console.error("Create booking error:", error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT TICKETS
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateTicketPayload {
    raisedById: string;
    raisedByRole: "User" | "Worker";
    subject: string;
    description: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface TicketResponse {
    message: string;
    ticket: {
        _id: string;
        raisedById: string;
        raisedByRole: string;
        subject: string;
        description: string;
        priority: string;
        status: string;
        createdAt: string;
        updatedAt: string;
        __v: number;
    };
}

export const createTicket = async (payload: CreateTicketPayload): Promise<TicketResponse> => {
    try {
        const formData = new URLSearchParams();
        formData.append("raisedById", payload.raisedById);
        formData.append("raisedByRole", payload.raisedByRole);
        formData.append("subject", payload.subject);
        formData.append("description", payload.description);
        formData.append("priority", payload.priority);

        const response = await fetch(`${API_BASE_URL}/create`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Create ticket error:", error);
        throw error;
    }
};

export interface GetTicketsResponse {
    message: string;
    tickets: Array<{
        _id: string;
        raisedById: string;
        raisedByRole: string;
        subject: string;
        description: string;
        priority: "LOW" | "MEDIUM" | "HIGH";
        status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
        createdAt: string;
        updatedAt: string;
        __v: number;
    }>;
}

export const getTicketsByUserId = async (
    userId: string,
    userRole: "User" | "Worker"
): Promise<GetTicketsResponse> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/getTicketById/${userId}?raisedById=${userId}&raisedByRole=${userRole}`
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("Get tickets error:", error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// USER DATA (aggregate)
// ─────────────────────────────────────────────────────────────────────────────

export interface ServiceItem {
    _id: string;
    userId: string;
    subcategory?: string;
    [key: string]: any;
}

export interface AllUserData {
    agriculture?: ServiceItem[];
    automotive?: ServiceItem[];
    beauty?: ServiceItem[];
    business?: ServiceItem[];
    corporate?: ServiceItem[];
    creative?: ServiceItem[];
    dailyWage?: ServiceItem[];
    techDigital?: ServiceItem[];
    education?: ServiceItem[];
    events?: ServiceItem[];
    food?: ServiceItem[];
    healthcare?: ServiceItem[];
    hotelTravel?: ServiceItem[];
    industrialLocal?: ServiceItem[];
    courier?: ServiceItem[];
    pet?: ServiceItem[];
    realEstate?: ServiceItem[];
    shopping?: ServiceItem[];
    sports?: ServiceItem[];
    wedding?: ServiceItem[];
    [key: string]: ServiceItem[] | undefined;
}

export interface GetAllDataByUserIdResponse {
    success: boolean;
    message?: string;
    data: AllUserData;
}

export const getAllDataByUserId = async (
    userId: string
): Promise<GetAllDataByUserIdResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/getAllDataByUserId/${userId}`, {
            method: "GET",
            redirect: "follow",
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("getAllDataByUserId API error:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("❌ getAllDataByUserId error:", error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// ENQUIRIES
// ─────────────────────────────────────────────────────────────────────────────

export const removeEnquiry = async (
    workerId: string,
    jobId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const urlencoded = new URLSearchParams();
        urlencoded.append("workerId", workerId);
        urlencoded.append("jobId", jobId);

        const response = await fetch(`${API_BASE_URL}/removeEnquiry`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: urlencoded,
            redirect: "follow",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ removeEnquiry error:", error);
        throw error;
    }
};

export const sendEnquiryToJob = async (
    jobId: string,
    workerId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const urlencoded = new URLSearchParams();
        urlencoded.append("jobId", jobId);
        urlencoded.append("workerId", workerId);

        const response = await fetch(`${API_BASE_URL}/sendEnquiryjob`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: urlencoded,
            redirect: "follow",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ sendEnquiryToJob error:", error);
        throw error;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIRMED WORKERS
// ─────────────────────────────────────────────────────────────────────────────

export interface ConfirmedWorkers {
    _id: string;
    userId: string;
    name: string;
    category: string[];
    subCategories: string[];
    skills: string[];
    serviceCharge: number;
    chargeType: "hour" | "day";
    profilePic: string;
    images: string[];
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface GetConfirmedWorkersResponse {
    success: boolean;
    message?: string;
    data: ConfirmedWorkers[];
}

export const getConfirmedWorkers = async (
    jobId: string
): Promise<GetConfirmedWorkersResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/getConfirmedWorkers/${jobId}`, {
            method: "GET",
            redirect: "follow",
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();

        const confirmedWorkers: ConfirmedWorkers[] = (json?.data?.confirmedWorkers || []).filter(
            (w: any) => typeof w === "object" && w !== null
        );

        const enquiredWorkerIds: string[] = (json?.data?.enquiredWorkers || []).filter(
            (w: any) => typeof w === "string"
        );

        const workers: ConfirmedWorkers[] =
            confirmedWorkers.length > 0
                ? confirmedWorkers
                : enquiredWorkerIds.map((id) => ({
                    _id: id,
                    userId: id,
                    name: "",
                    category: [],
                    subCategories: [],
                    skills: [],
                    serviceCharge: 0,
                    chargeType: "hour" as const,
                    profilePic: "",
                    images: [],
                    area: "",
                    city: "",
                    state: "",
                    pincode: "",
                    latitude: 0,
                    longitude: 0,
                    isActive: true,
                    createdAt: "",
                    updatedAt: "",
                    __v: 0,
                }));

        return {
            success: json.success ?? true,
            message: json.message,
            data: workers,
        };
    } catch (error) {
        console.error("❌ getConfirmedWorkers error:", error);
        throw error;
    }
};

export const checkJobApplication = async (
    jobId: string,
    workerId: string
): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/getConfirmedWorkers/${jobId}`, {
            method: "GET",
            redirect: "follow",
        });

        if (!response.ok) return false;

        const json = await response.json();

        const confirmed: any[] = json?.data?.confirmedWorkers || [];
        const confirmedMatch = confirmed.some(
            (w) => typeof w === "object" && (w._id === workerId || w.userId === workerId)
        );

        const enquired: any[] = json?.data?.enquiredWorkers || [];
        const enquiredMatch = enquired.some(
            (id) => typeof id === "string" && id === workerId
        );

        return confirmedMatch || enquiredMatch;
    } catch (error) {
        console.error("❌ checkJobApplication error:", error);
        return false;
    }
};

export const getConfirmedWorkersCount = async (jobId: string): Promise<number> => {
    try {
        const response = await fetch(`${API_BASE_URL}/getConfirmedWorkers/${jobId}`, {
            method: "GET",
            redirect: "follow",
        });

        if (!response.ok) return 0;

        const json = await response.json();
        const confirmed: any[] = json?.data?.confirmedWorkers || [];
        const enquired: any[] = json?.data?.enquiredWorkers || [];

        return confirmed.length > 0 ? confirmed.length : enquired.length;
    } catch (error) {
        console.error("❌ getConfirmedWorkersCount error:", error);
        return 0;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface Notification {
    _id: string;
    receiverId: string;
    receiverModel: "User" | "Worker";
    senderId: string;
    senderModel: "User" | "Worker";
    title: string;
    message: string;
    type: "NEW_JOB" | "JOB_ENQUIRY" | "JOB_CONFIRMED" | "PAYMENT" | "JOB_COMPLETED" | string;
    jobId?: string;
    isRead: boolean;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface NotificationsResponse {
    success: boolean;
    count: number;
    data: Notification[];
}

export type GetAllNotificationsResponse = NotificationsResponse;
export type NotificationItem = Notification;

export interface NotificationCountResponse {
    success: boolean;
    count: number;
}

export const getAllNotifications = async (
    role: "User" | "Worker",
    id: string
): Promise<NotificationsResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/getAllNotifications/${role}/${id}`, {
            method: "GET",
            redirect: "follow",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ getAllNotifications error:", error);
        throw error;
    }
};

export const getUnreadNotifications = async (
    role: "User" | "Worker",
    id: string
): Promise<NotificationsResponse> => {
    const response = await fetch(`${API_BASE_URL}/unread/${role}/${id}`, {
        method: "GET",
        redirect: "follow",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
};

export const getReadNotifications = async (
    role: "User" | "Worker",
    id: string
): Promise<NotificationsResponse> => {
    const all = await getAllNotifications(role, id);
    const readData = (all.data || []).filter((n) => n.isRead);
    return { success: all.success, count: readData.length, data: readData };
};

export const markNotificationAsRead = async (
    notificationId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/read/${notificationId}`, {
            method: "PUT",
            redirect: "follow",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ markNotificationAsRead error:", error);
        throw error;
    }
};

export const deleteNotification = async (
    notificationId: string
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_BASE_URL}/deleteNotification/${notificationId}`, {
            method: "DELETE",
            redirect: "follow",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ deleteNotification error:", error);
        throw error;
    }
};

export const getNotificationCount = async (
    role: "User" | "Worker",
    id: string
): Promise<NotificationCountResponse> => {
    const { data } = await axios.get<{ success: boolean; unreadCount?: number; count?: number }>(
        `${API_BASE_URL}/count/${role}/${id}`
    );
    return {
        success: data.success,
        count: data.unreadCount ?? data.count ?? 0,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// FCM TOKEN
// ─────────────────────────────────────────────────────────────────────────────

export const saveFcmToken = async (
    userId: string,
    role: "User" | "Worker",
    fcmToken: string
): Promise<void> => {
    try {
        const body = new URLSearchParams();
        body.append("userId", userId);
        body.append("role", role);
        body.append("fcmToken", fcmToken);

        const res = await fetch(`${API_BASE_URL}/saveFcmToken`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (res.ok) console.log(`✅ FCM token saved for ${role}: ${userId}`);
        else console.warn("⚠️ Failed to save FCM token:", res.status);
    } catch (err) {
        console.warn("⚠️ saveFcmToken error:", err);
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFY MATCHING WORKERS
// ─────────────────────────────────────────────────────────────────────────────

export interface NotifyMatchingWorkersResponse {
    success: boolean;
    message: string;
    notifiedCount?: number;
}

export const notifyMatchingWorkers = async (
    jobId: string
): Promise<NotifyMatchingWorkersResponse> => {
    try {
        const body = new URLSearchParams();
        body.append("jobId", jobId);

        const response = await fetch(`${API_BASE_URL}/notifyMatchingWorkers`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ notifyMatchingWorkers error:", error);
        throw error;
    }
};
// ─────────────────────────────────────────────
// REVIEWS
// ─────────────────────────────────────────────
// Get reviews (query string, not path param)
export interface ReviewData {
    _id: string;
    user: string | { _id: string; name: string };
    worker: string;
    rating: number;
    review: string;
    createdAt: string;
    updatedAt: string;
}

export const getReviews = async (
    workerId: string
): Promise<{ success: boolean; data: ReviewData[] }> => {
    const res = await fetch(
        `${API_BASE_URL}/getReviews?workerId=${workerId}`
    );

    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }

    return res.json();
};
export const addReview = async (
  userId: string,
  workerId: string,
  rating: number,
  review: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const formData = new URLSearchParams();
  formData.append("userId", userId);
  formData.append("workerId", workerId);
  formData.append("rating", String(rating));
  formData.append("review", review);

  const res = await fetch(`${API_BASE_URL}/addReview`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json?.message || `HTTP error! status: ${res.status}`);
  }

  return json;
};
// Update review
export const updateReview = async (
  reviewId: string,
  rating: number,
  review: string
) => {
  const formData = new URLSearchParams();
  formData.append("rating", String(rating));
  formData.append("review", review);

  const res = await fetch(`${API_BASE_URL}/updateReview/${reviewId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

// Delete review
export const deleteReview = async (reviewId: string) => {
  const res = await fetch(`${API_BASE_URL}/deleteReview/${reviewId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};

// Worker average rating
export const getWorkerAverageRating = async (workerId: string) => {
  const res = await fetch(`${API_BASE_URL}/getWorkerAverageRating?workerId=${workerId}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
};
