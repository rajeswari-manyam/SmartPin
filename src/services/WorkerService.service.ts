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

// ==================== CREATE WORKER (STEP 1) ====================
export interface CreateWorkerBasePayload {
    userId: string;
    name: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number | string;
    longitude: number | string;
    experience?: string;
    profilePic?: File;
}

export interface CreateWorkerBaseResponse {
    success: boolean;
    message: string;
    worker: {
        _id: string;
        userId: string;
        name: string;
        area: string;
        city: string;
        state: string;
        pincode: string;
        latitude: number;
        longitude: number;
        category: string[];
        subCategories: string[];
        skills: string[];
        serviceCharge: number;
        chargeType: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
    };
}

export const createWorkerBase = async (
    payload: CreateWorkerBasePayload
): Promise<CreateWorkerBaseResponse> => {
    try {
        const formData = new FormData();
        formData.append("userId", payload.userId);
        formData.append("name", payload.name);
        formData.append("area", payload.area);
        formData.append("city", payload.city);
        formData.append("state", payload.state);
        formData.append("pincode", payload.pincode);
        formData.append("latitude", String(payload.latitude));
        formData.append("longitude", String(payload.longitude));

        if (payload.experience) {
            formData.append("experience", payload.experience);
        }
        if (payload.profilePic) {
            formData.append("profilePic", payload.profilePic);
        }

        const response = await fetch(`${API_BASE_URL}/createworkers`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Create Worker Base API error:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Create Worker Base response:", data);
        return data;
    } catch (error) {
        console.error("Create worker base error:", error);
        throw error;
    }
};

// ==================== ADD WORKER SKILL (STEP 2) ====================
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
            console.error("Add Worker Skill API error:", errorText);
            throw new Error(`HTTP error! status: ${response.status}. ${errorText}`);
        }

        const data = await response.json();
        console.log("Add Worker Skill response:", data);
        return data;
    } catch (error) {
        console.error("Add worker skill error:", error);
        throw error;
    }
};

// ==================== COMBINED WORKER CREATION (BOTH STEPS) ====================
export interface CreateWorkerCompletePayload {
    userId: string;
    name: string;
    email?: string;
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
    latitude: number | string;
    longitude: number | string;
    images?: File[];
    profilePic?: File;
}

export const createWorkerComplete = async (
    payload: CreateWorkerCompletePayload
): Promise<{
    success: boolean;
    message: string;
    baseWorker: CreateWorkerBaseResponse;
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
            profilePic: payload.profilePic,
        });

        if (!baseWorkerResponse.success) {
            throw new Error(baseWorkerResponse.message || "Failed to create base worker");
        }

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

        if (!skillResponse.success) {
            throw new Error(skillResponse.message || "Failed to add worker skills");
        }

        console.log("✅ Worker skills added successfully");

        return {
            success: true,
            message: "Worker profile created successfully with skills",
            baseWorker: baseWorkerResponse,
            skillWorker: skillResponse,
        };
    } catch (error: any) {
        console.error("❌ Create worker complete error:", error);
        throw error;
    }
};

// ==================== GET WORKER WITH SKILLS ====================
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
        const response = await fetch(
            `${API_BASE_URL}/getWorkerWithSkills?workerId=${workerId}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ Get worker with skills error:", error);
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

// ==================== GET WORKER SKILL BY ID ====================
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

export const getWorkerSkillById = async (
    skillId: string
): Promise<WorkerSkillResponse> => {
    try {
        const response = await fetch(
            `${API_BASE_URL}/getWorkerSkillById/${skillId}`,
            {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error("❌ Get worker skill by ID error:", error);
        throw error;
    }
};

// ==================== UPDATE WORKER SKILL ====================
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
            formData.append("category", Array.isArray(payload.category)
                ? payload.category.join(",")
                : payload.category);
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
        console.error("❌ Update worker skill error:", error);
        throw error;
    }
};

// ==================== DELETE WORKER SKILL ====================
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
        console.error("❌ Delete worker skill error:", error);
        throw error;
    }
};

export const getAllJobs = async () => {
    const response = await axios.get(`${API_BASE_URL}/getAllJobs`);
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

// ==================== GET NEARBY JOBS FOR WORKER ====================
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
        console.log("🔍 Fetching nearby jobs for worker ID:", workerId);

        const response = await fetch(
            `${API_BASE_URL}/getNearbyJobsWorker/${workerId}`,
            {
                method: "GET",
                redirect: "follow",
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Get Nearby Jobs For Worker API error:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Nearby jobs for worker response:", data);
        return data;
    } catch (error) {
        console.error("❌ Get nearby jobs for worker error:", error);
        throw error;
    }
};

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
        const response = await fetch(
            `${API_BASE_URL}/getAllDataByUserId/${userId}`,
            {
                method: "GET",
                redirect: "follow",
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("getAllDataByUserId API error:", errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ getAllDataByUserId response:", data);
        return data;
    } catch (error) {
        console.error("❌ getAllDataByUserId error:", error);
        throw error;
    }
};
