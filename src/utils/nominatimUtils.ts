/**
 * Nominatim (OpenStreetMap) geocoding for `LocationPicker`.
 *
 * This is the same engine the mobile app uses in
 * `PartTimeJob/src/services/LocationService.tsx`, where it is the PRIMARY
 * provider and Google is disabled (`USE_GOOGLE = false`).
 *
 * Why not Google: the Maps JavaScript, Geocoding and Places APIs are not
 * activated on the FlexHours Cloud project, so every Google-backed call in the
 * browser fails with `ApiNotActivatedMapError` / `REQUEST_DENIED`. The
 * rentongovehicle key cannot be substituted either - it is HTTP referrer
 * restricted, which web services reject outright. Nominatim needs no key, no
 * billing and no console setup, so location works immediately.
 */

import {
    buildCompleteAddress,
    getCityName,
    getDetailedAreaParts,
    getMostSpecificArea,
    nominatimToAddressParts,
    type GeocodeAddressParts,
    type NominatimResult,
} from "./locationUtils";
import type { LocationPickerValue } from "../types/location.types";

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

/** Mirrors the shape `LocationPicker` already renders, so the UI is unchanged. */
export type LocationSuggestion = {
    placeId: string;
    title: string;
    subtitle: string;
    latitude: number;
    longitude: number;
};

const clean = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/**
 * Nominatim's public instance allows at most 1 request/second. Typing fires a
 * debounced request per keystroke, so every call is queued behind this gate
 * instead of firing in parallel (which returns 429 and empty results).
 */
let lastRequestAt = 0;
const MIN_GAP_MS = 1100;

const waitForSlot = async (): Promise<void> => {
    const wait = lastRequestAt + MIN_GAP_MS - Date.now();
    if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
    lastRequestAt = Date.now();
};

const request = async <T,>(path: string, params: Record<string, string>): Promise<T | null> => {
    await waitForSlot();
    const qs = new URLSearchParams({ format: "json", "accept-language": "en", ...params }).toString();
    try {
        const res = await fetch(`${NOMINATIM_BASE}/${path}?${qs}`, {
            headers: { Accept: "application/json" },
        });
        // 429 = over the rate limit, 403 = blocked User-Agent. Both are expected
        // transiently here, so they resolve to "no result" rather than throwing.
        if (!res.ok) return null;
        return (await res.json()) as T;
    } catch {
        return null;
    }
};

/** Builds the picker's value from a Nominatim `address` object. */
const toPickerValue = (parts: GeocodeAddressParts, lat: number, lng: number): LocationPickerValue => ({
    address: buildCompleteAddress(parts),
    area: getMostSpecificArea(parts),
    city: getCityName(parts),
    state: clean(parts.state),
    pincode: clean(parts.postcode),
    latitude: lat,
    longitude: lng,
});

const toNumber = (value: unknown): number => {
    const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
    return Number.isFinite(n) ? n : 0;
};

/**
 * Forward-geocodes free text into coordinates + a structured address.
 *
 * Nominatim only indexes recognisable places, so a very specific address
 * ("Srinagar Katta, Tadigadapa, Andhra Pradesh, 521137") returns nothing even
 * though the rest of it is perfectly searchable ("Tadigadapa, Andhra Pradesh,
 * 521137"). Rather than failing, the query is progressively relaxed by dropping
 * leading segments, so the pin still lands on the right part of town. The typed
 * text is never rewritten - only the coordinates are adopted.
 */
export const geocodeAddressNominatim = async (query: string): Promise<LocationPickerValue | null> => {
    const text = query.trim();
    if (text.length < 3) return null;

    const segments = text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    // Most specific first, then drop the leading (most local) segment each time.
    const attempts: string[] = [text];
    for (let drop = 1; drop < segments.length; drop += 1) {
        attempts.push(segments.slice(drop).join(", "));
    }
    // A pincode on its own is a reliable last resort in India.
    if (/\b\d{6}\b/.test(text)) attempts.push(clean(text.match(/\b\d{6}\b/)?.[0]));

    for (const attempt of attempts) {
        if (attempt.trim().length < 3) continue;

        const data = await request<NominatimResult[]>("search", {
            q: attempt,
            addressdetails: "1",
            limit: "1",
            countrycodes: "in",
        });
        if (!data || data.length === 0) continue;

        const hit = data[0];
        const lat = toNumber(hit.lat);
        const lng = toNumber(hit.lon);
        if (!lat || !lng) continue;

        // Keep the address the user actually typed; only adopt coordinates.
        return {
            ...toPickerValue(nominatimToAddressParts(hit), lat, lng),
            address: text,
        };
    }

    return null;
};

/**
 * Reverse-geocodes a dropped pin / GPS fix into a structured address.
 * `addressdetails=1` is required so the most specific components
 * (`quarter`, `hamlet`, `neighbourhood`, ...) are present in the response.
 */
export const reverseGeocodeNominatim = async (
    lat: number,
    lng: number
): Promise<LocationPickerValue | null> => {
    const data = await request<NominatimResult>("reverse", {
        lat: String(lat),
        lon: String(lng),
        addressdetails: "1",
    });
    if (!data || !data.address) return null;
    return toPickerValue(nominatimToAddressParts(data), lat, lng);
};

/** Autocomplete for the search box. Results carry their own coordinates. */
export const searchPlacesNominatim = async (query: string): Promise<LocationSuggestion[]> => {
    const text = query.trim();
    if (text.length < 3) return [];

    const data = await request<NominatimResult[]>("search", {
        q: text,
        addressdetails: "1",
        limit: "8",
        countrycodes: "in",
    });
    if (!data || data.length === 0) return [];

    return data
        .map((item) => {
            const parts = nominatimToAddressParts(item);
            const display = clean(item.display_name);
            const segments = display.split(",").map((s) => s.trim()).filter(Boolean);
            const detailed = getDetailedAreaParts(parts);
            return {
                placeId: String(item.place_id ?? display),
                title: detailed.length > 0 ? detailed.join(", ") : segments[0] || display,
                subtitle: segments.slice(1).join(", ") || display,
                latitude: toNumber(item.lat),
                longitude: toNumber(item.lon),
            };
        })
        .filter((s) => s.latitude !== 0 && s.longitude !== 0);
};

/** Resolves a chosen suggestion to a full address. */
export const resolveSuggestion = async (suggestion: LocationSuggestion): Promise<LocationPickerValue | null> => {
    const { latitude, longitude } = suggestion;
    if (!latitude || !longitude) return null;
    return reverseGeocodeNominatim(latitude, longitude);
};
