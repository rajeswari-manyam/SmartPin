/**
 * Map provider selection for `LocationPicker`.
 *
 * Google Maps is preferred, because it is what the rentongovehvehicle location
 * screen uses and it is the only one that labels streets clearly. That requires
 * the Maps JavaScript API to be enabled on the key AND the current origin to be
 * in the key's HTTP referrer allow-list. Neither can be verified from here, and
 * a mismatch fails in the browser rather than at build time, so the picker
 * *tries* Google first and silently falls back to Leaflet/OpenStreetMap.
 *
 * Consequence: the picker works today with no Google setup, and upgrades itself
 * to Google as soon as the key is configured for this domain. The user never
 * sees an error either way.
 */

import { loadGoogleMaps, resetGoogleMapsLoader } from "../lib/googleMaps";

export type MapProvider = "google" | "leaflet";

/**
 * Cached per page-load: once we know Google is unusable we must not pay the
 * script-load + failure cost again on every modal open.
 */
let verdict: MapProvider | null = null;

/**
 * Errors Google raises when the key is not usable from this origin. Matched
 * loosely on purpose - the exact wording differs between `maps/api/js` and the
 * newer importLibrary path.
 */
const KEY_REJECTION =
    /ApiNotActivatedMapError|RefererNotAllowedMapError|InvalidKeyMapError|BillingNotEnabledMapError|ApiTargetBlockedMapError|Google Maps JavaScript API error|forDevelopmentUsageOnly|AuthorizationError|REQUEST_DENIED/i;

const hasUsableKey = (): boolean =>
    String(process.env.REACT_APP_GOOGLE_MAPS_API_KEY || "").trim().length > 0;

/**
 * Attempts to load the Google Maps JavaScript API and confirm the map namespace
 * actually works. Resolves to "leaflet" on any failure rather than rejecting,
 * so the caller never has to handle a broken-map case.
 */
export const resolveMapProvider = async (): Promise<MapProvider> => {
    if (verdict) return verdict;
    if (!hasUsableKey()) {
        verdict = "leaflet";
        return verdict;
    }

    try {
        const g = await loadGoogleMaps();

        // The bootstrap script returns HTTP 200 even for a key that cannot be
        // used, and the real error is only raised when the map namespace is
        // touched. This is the check that actually distinguishes the two.
        const lib = (g.maps as { importLibrary?: (n: string) => Promise<unknown> }).importLibrary;
        if (typeof lib === "function") {
            await lib.call(g.maps, "maps");
        } else if (!g.maps.Map) {
            throw new Error("Google Maps namespace unavailable");
        }

        if (!g.maps.Map) throw new Error("Google Maps namespace unavailable");

        verdict = "google";
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!KEY_REJECTION.test(message)) {
            // An unexpected failure (offline, blocked script) is still a reason
            // to use the provider that has no key dependency.
            console.warn("[LocationPicker] Google Maps unavailable, using OpenStreetMap:", message);
        }
        resetGoogleMapsLoader();
        verdict = "leaflet";
    }

    return verdict;
};

/** Test seam: forget the cached verdict so the next open re-probes. */
export const resetMapProvider = (): void => {
    verdict = null;
};

/**
 * Called when a Google map was constructed but never became usable - the key
 * loaded the script yet was refused when the map actually tried to draw
 * (`ApiTargetBlockedMapError`, `ApiNotActivatedMapError`, disabled billing, and
 * so on). These are reported asynchronously and mostly do not surface as a
 * rejected `importLibrary`, so loading the library successfully is not proof
 * that the key works. Latch the fallback so the failure is not repeated on
 * every later modal open.
 */
export const markGoogleMapsUnusable = (reason: string): void => {
    verdict = "leaflet";
    resetGoogleMapsLoader();
    console.warn(
        "[LocationPicker] Google Maps loaded but the key was refused while drawing " +
            `(${reason}). Falling back to OpenStreetMap. Fix the key in Google Cloud:\n` +
            "  1. APIs & Services -> Library -> enable 'Maps JavaScript API' for the key's project\n" +
            "  2. APIs & Services -> Credentials -> edit the key -> Application restrictions:\n" +
            "       - API restrictions must include 'Maps JavaScript API'\n" +
            `       - HTTP referrers must allow this origin: ${typeof window === "undefined" ? "(ssr)" : window.location.origin + "/*"}`
    );
};
