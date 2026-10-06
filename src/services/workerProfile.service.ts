/**
 * Single source of truth for "does this signed-in user already have a worker
 * profile?", shared by every gate in the worker flow.
 *
 * The bug this fixes: each screen used to answer that question differently -
 * some trusted `localStorage`, some read a different key off the API response -
 * so a returning worker was shown "Create Profile" again after already having
 * one. Mobile avoids this by always resolving the id from the server
 * (`resolveWorkerIdForCurrentUser` in WorkerHomeScreen) and clearing the stored
 * id when the lookup comes back empty.
 *
 * The contract is now: the server decides, local storage is only a cache of the
 * answer.
 */

import { getWorkerByUserId } from "./api.service";

const WORKER_ID_KEY = "@worker_id";

export interface ResolvedWorkerProfile {
    exists: boolean;
    workerId: string | null;
    worker: any | null;
}

/** Every storage location the app has used for the worker id over time. */
const workerIdKeys = (userId: string): string[] => [
    "@worker_id",
    "workerId",
    ...(userId ? [`worker_id_for_${userId}`] : []),
];

const clearStoredWorkerId = (userId: string): void => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return;
        workerIdKeys(userId).forEach((key) => window.localStorage.removeItem(key));
    } catch {
        // Storage unavailable; nothing to clear.
    }
};

const storeWorkerId = (userId: string, workerId: string): void => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return;
        workerIdKeys(userId).forEach((key) => window.localStorage.setItem(key, workerId));
    } catch {
        // Storage unavailable; the value still lives in the returned object.
    }
};

/**
 * Resolves the signed-in user's worker profile.
 *
 * Always asks the server first (with the mobile fallback chain inside
 * `getWorkerByUserId`). A stored id is only used to confirm an existing
 * profile - it can never cause a "profile exists" answer on its own, which is
 * what stopped deleted/never-created profiles from being reported as present.
 */
export const resolveWorkerProfile = async (
    userId?: string | null
): Promise<ResolvedWorkerProfile> => {
    const uid =
        userId ||
        (typeof window !== "undefined" ? window.localStorage.getItem("userId") : null) ||
        null;

    if (!uid) return { exists: false, workerId: null, worker: null };

    try {
        const res = await getWorkerByUserId(uid);
        const worker = res?.worker || res?.data || null;
        if (worker?._id) {
            storeWorkerId(uid, worker._id);
            return { exists: true, workerId: worker._id, worker };
        }
    } catch {
        // Fall through to the not-found result.
    }

    // No worker document on the server: drop any stale local id so the next
    // render shows the create-profile path instead of a dead profile.
    clearStoredWorkerId(uid);
    return { exists: false, workerId: null, worker: null };
};

/** Marks a freshly created profile so the rest of the app agrees immediately. */
export const rememberCreatedWorker = (userId: string, workerId: string): void => {
    storeWorkerId(userId, workerId);
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem("hasWorkerProfile", "true");
        }
    } catch {
        // Ignore.
    }
};

/** True when the current user is known to be a worker. Safe for early render. */
export const hasStoredWorkerProfile = (): boolean => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return false;
        if (window.localStorage.getItem("hasWorkerProfile") === "true") return true;
        return Boolean(window.localStorage.getItem(WORKER_ID_KEY));
    } catch {
        return false;
    }
};
