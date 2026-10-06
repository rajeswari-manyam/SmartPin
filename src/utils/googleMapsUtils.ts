// ============================================================================
// googleMapsUtils.ts
//
// Bridges the Google Maps JavaScript API (already configured in
// `src/lib/googleMaps.ts`) to the provider-agnostic address helpers in
// `locationUtils.ts`.
//
// Google returns a place as a flat list of `address_components` using a fixed
// hierarchy (`sublocality_level_5` ... `sublocality_level_1`, `locality`,
// `postal_town`, `administrative_area_level_2`, ...). Reading a single field
// such as `locality` collapses a very specific area like "Srinagar Katta" into
// nothing at all, so every component is mapped onto the shared
// `GeocodeAddressParts` shape and handed to `resolveAddressParts`, which keeps
// the most specific components and removes duplicates.
// ============================================================================

import { loadGoogleMaps } from "../lib/googleMaps";
import { resolveAddressParts, type GeocodeAddressParts } from "./locationUtils";
import type { LocationPickerValue } from "../types/location.types";

/** A single row of the search-suggestions dropdown. */
export type LocationSuggestion = {
    placeId: string;
    title: string;
    subtitle: string;
};

/**
 * Google address-component type -> shared address-part key.
 *
 * The five `sublocality_level_*` components are the ones that actually carry a
 * specific area, so they get distinct keys. They are read in the fixed order
 * declared in `GOOGLE_COMPONENT_ORDER` (most specific first) rather than in the
 * order Google happens to return them, which keeps the output deterministic.
 */
const GOOGLE_COMPONENT_TO_PART: Record<string, keyof GeocodeAddressParts> = {
    street_address: "road",
    route: "road",
    neighborhood: "neighbourhood",
    sublocality_level_5: "quarter",
    sublocality_level_4: "hamlet",
    sublocality_level_3: "suburb",
    sublocality_level_2: "locality",
    sublocality_level_1: "city_district",
    sublocality: "locality",
    postal_town: "town",
    locality: "city",
    administrative_area_level_3: "municipality",
    administrative_area_level_2: "district",
    administrative_area_level_1: "state",
    postal_code: "postcode",
    country: "country",
};

/** Most specific first. `road` is last because it is only a fallback. */
const GOOGLE_COMPONENT_ORDER: string[] = [
    "neighborhood",
    "sublocality_level_5",
    "sublocality_level_4",
    "sublocality_level_3",
    "sublocality_level_2",
    "sublocality_level_1",
    "sublocality",
    "postal_town",
    "locality",
    "administrative_area_level_3",
    "administrative_area_level_2",
    "administrative_area_level_1",
    "postal_code",
    "country",
    "route",
    "street_address",
];

/**
 * Flattens Google's `address_components` into the shared address-part shape.
 * The street is stored in `road`, which `getDetailedAreaParts` only falls back
 * to when no locality exists - that keeps `area` at "Srinagar Katta, Tadigadapa"
 * instead of padding it with the road the point happens to sit on.
 */
export const googleAddressToParts = (
    components?: google.maps.GeocoderAddressComponent[] | null,
    formattedAddress?: string | null,
    placeName?: string | null
): GeocodeAddressParts => {
    const parts: GeocodeAddressParts = {};
    const list = components || [];

    for (const type of GOOGLE_COMPONENT_ORDER) {
        if (parts[GOOGLE_COMPONENT_TO_PART[type]]) continue;
        const component = list.find((c) => c.types.includes(type));
        if (component?.long_name) {
            parts[GOOGLE_COMPONENT_TO_PART[type]] = component.long_name;
        }
    }

    if (placeName) parts.name = placeName;
    if (formattedAddress) parts.formatted = formattedAddress;
    return parts;
};

/** True when the pair is a usable point (rejects `0,0` and non-finite values). */
export const isValidCoordinates = (latitude?: number | null, longitude?: number | null): boolean =>
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    isFinite(latitude) &&
    isFinite(longitude) &&
    !(latitude === 0 && longitude === 0);

/** Converts one Google geocoder result into the picker's value shape. */
export const locationFromGeocoderResult = (result: google.maps.GeocoderResult): LocationPickerValue => {
    // No `placeName` here on purpose: a GeocoderResult only carries a `place_id`
    // (an opaque `ChIJ...` token), and `GeocodeAddressParts.name` is a display
    // name - passing the id would surface it as the area when the result has no
    // locality component.
    const parts = googleAddressToParts(result.address_components, result.formatted_address);
    const resolved = resolveAddressParts(parts);
    const position = result.geometry?.location;
    return {
        address: resolved.address,
        area: resolved.area,
        city: resolved.city,
        state: resolved.state,
        pincode: resolved.pincode,
        latitude: position?.lat() ?? 0,
        longitude: position?.lng() ?? 0,
    };
};

/**
 * Promise wrapper around `Geocoder.geocode`. The callback form is used because
 * it is the only overload guaranteed across `@types/google.maps` versions.
 */
const geocodeRequest = (request: google.maps.GeocoderRequest): Promise<google.maps.GeocoderResult[]> =>
    new Promise((resolve, reject) => {
        loadGoogleMaps()
            .then((g) => {
                const geocoder = new g.maps.Geocoder();
                geocoder.geocode(request, (results, status) => {
                    if (status === g.maps.GeocoderStatus.OK && results && results.length) {
                        resolve(results);
                    } else if (status === g.maps.GeocoderStatus.ZERO_RESULTS) {
                        resolve([]);
                    } else {
                        reject(new Error(status || "Geocoding failed"));
                    }
                });
            })
            .catch(reject);
    });

/** Reverse geocodes a point (map click / marker drag / GPS fix). */
export const reverseGeocodeWithGoogle = async (
    latitude: number,
    longitude: number
): Promise<LocationPickerValue | null> => {
    const results = await geocodeRequest({ location: { lat: latitude, lng: longitude } });
    const first = results[0];
    if (!first) return null;
    const location = locationFromGeocoderResult(first);
    return isValidCoordinates(location.latitude, location.longitude) ? location : null;
};

/** Forward geocodes free text (used for the debounced manual-typing search). */
export const forwardGeocodeWithGoogle = async (address: string): Promise<LocationPickerValue | null> => {
    const results = await geocodeRequest({ address });
    const first = results[0];
    if (!first) return null;
    const location = locationFromGeocoderResult(first);
    return isValidCoordinates(location.latitude, location.longitude) ? location : null;
};

/** Resolves a Places suggestion (`prediction.place_id`) to a full location. */
export const resolvePlaceId = async (placeId: string): Promise<LocationPickerValue | null> => {
    const results = await geocodeRequest({ placeId });
    const first = results[0];
    if (!first) return null;
    const location = locationFromGeocoderResult(first);
    return isValidCoordinates(location.latitude, location.longitude) ? location : null;
};

/**
 * Places Autocomplete predictions for the typed query. A `sessionToken` groups
 * the keystroke calls into one billable session, which is why the picker keeps
 * one alive while the user types.
 */
export const fetchPlacePredictions = async (
    input: string,
    sessionToken?: google.maps.places.AutocompleteSessionToken | null
): Promise<LocationSuggestion[]> => {
    const g = await loadGoogleMaps();
    const AutocompleteService = g.maps.places?.AutocompleteService;
    if (!AutocompleteService) return [];

    const service = new AutocompleteService();
    return new Promise((resolve) => {
        const request: google.maps.places.AutocompleteRequest = { input };
        if (sessionToken) request.sessionToken = sessionToken;

        service.getPlacePredictions(request, (response, status) => {
            if (status !== g.maps.places.PlacesServiceStatus.OK || !response) {
                resolve([]);
                return;
            }
            // Depending on the SDK version the callback receives either the
            // predictions directly or an AutocompleteResponse wrapping them.
            const payload = response as
                | google.maps.places.AutocompletePrediction[]
                | { autocomplete_predictions?: google.maps.places.AutocompletePrediction[] };
            const predictions: google.maps.places.AutocompletePrediction[] = Array.isArray(payload)
                ? payload
                : payload.autocomplete_predictions || [];
            resolve(
                predictions.map((prediction) => ({
                    placeId: prediction.place_id,
                    title: prediction.structured_formatting?.main_text || prediction.description,
                    subtitle: prediction.structured_formatting?.secondary_text || prediction.description,
                }))
            );
        });
    });
};

/** Browser GPS. Rejects with a readable message when unavailable or denied. */
export const getBrowserCoordinates = (): Promise<{ latitude: number; longitude: number }> =>
    new Promise((resolve, reject) => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser"));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            (err) => reject(new Error(err.message || "Could not get your location")),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    });
