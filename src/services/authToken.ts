/**
 * Access-token handling for the worker API, kept in parity with the mobile app
 * (`src/api/services/workerApi.tsx` in the PartTimeJob repo).
 *
 * Mobile reads the backend-issued token from storage on every request and sends
 * it as `Authorization: Bearer <token>`. The web build stored the same token
 * after OTP verification but never actually transmitted it, so every worker
 * call was going out unauthenticated.
 *
 * Storage keys are checked in order because the same value has been persisted
 * under different names over time; mobile uses `@app_access_token`.
 */

const TOKEN_KEYS = ["token", "accessToken", "@app_access_token", "authToken"] as const;

const readStorage = (): Storage | null => {
    try {
        if (typeof window === "undefined" || !window.localStorage) return null;
        return window.localStorage;
    } catch {
        // Safari private mode throws on access rather than returning null.
        return null;
    }
};

/** The backend-issued access token, or `null` when the user is not signed in. */
export const getAuthToken = (): string | null => {
    const store = readStorage();
    if (!store) return null;

    for (const key of TOKEN_KEYS) {
        try {
            const value = store.getItem(key);
            if (value && value.trim()) return value.trim();
        } catch {
            // Ignore and keep looking.
        }
    }
    return null;
};

/** `{ Authorization: "Bearer ..." }` when signed in, `{}` otherwise. */
export const getAuthHeaders = (): Record<string, string> => {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = (): boolean => getAuthToken() !== null;
