// ============================================================================
// locationUtils.ts
//
// Provider-agnostic helpers that turn a geocoding response into the most
// complete address possible.
//
// Geocoders expose the same concept across many different fields depending on
// how granular the matched place is. A very specific area such as
// "Srinagar Katta" may arrive as `name`, `address_line1`, `road`, `quarter`,
// `suburb`, `neighbourhood`, `locality`, `village`, `town`, `municipality` or
// `district`. Reading only a handful of those fields silently drops the most
// specific component (leaving only "Tadigadapa, Vijayawada, Andhra Pradesh,
// 521137"), so every component is inspected, ordered from specific to general
// and de-duplicated before being joined.
// ============================================================================

import type { SelectedLocation } from "../types/location.types";

/**
 * Union of the address fields returned by the geocoders already used in this
 * project (Geoapify + Nominatim). Every field is optional because providers
 * only return the components they actually know about.
 */
export type GeocodeAddressParts = {
    name?: string;
    address_line1?: string;
    address_line2?: string;
    road?: string;
    street?: string;
    quarter?: string;
    hamlet?: string;
    suburb?: string;
    neighbourhood?: string;
    locality?: string;
    city_district?: string;
    village?: string;
    town?: string;
    municipality?: string;
    district?: string;
    county?: string;
    state_district?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    formatted?: string;
};

/** Nominatim `address` object keys used by this project. */
export type NominatimAddress = {
    road?: string;
    quarter?: string;
    hamlet?: string;
    suburb?: string;
    neighbourhood?: string;
    locality?: string;
    city_district?: string;
    village?: string;
    town?: string;
    municipality?: string;
    district?: string;
    county?: string;
    state_district?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
};

/** Nominatim result (search or reverse) as consumed by this project. */
export type NominatimResult = {
    place_id?: number;
    name?: string;
    display_name?: string;
    lat?: string;
    lon?: string;
    type?: string;
    address?: NominatimAddress;
};

// ── Field ordering ───────────────────────────────────────────────────────────
// Ordered from the most specific component to the most general one.
const DETAILED_AREA_KEYS: Array<keyof GeocodeAddressParts> = [
    "address_line1",
    "address_line2",
    "name",
    "quarter",
    "hamlet",
    "neighbourhood",
    "suburb",
    "locality",
    "city_district",
    "village",
    "town",
    "municipality",
    "district",
];

/**
 * `road` is only used when nothing more specific exists, otherwise a
 * "Srinagar Katta" result would be padded with the street it sits on.
 */
const DETAILED_AREA_FALLBACK_KEYS: Array<keyof GeocodeAddressParts> = ["road"];

// Some providers only populate one of these for the "city" level.
const CITY_KEYS: Array<keyof GeocodeAddressParts> = [
    "city",
    "town",
    "village",
    "municipality",
    "county",
    "state_district",
];

const STATE_KEYS: Array<keyof GeocodeAddressParts> = [
    "state",
    "state_district",
    "county",
];

// ── Small string helpers ──────────────────────────────────────────────────────

const clean = (value?: string | null): string =>
    (value || "")
        .replace(/\s+/g, " ")
        .replace(/^[\s,;]+|[\s,;]+$/g, "")
        .trim();

/** Lower-cased, punctuation-free form used for duplicate detection. */
const normalize = (value: string): string =>
    value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const tokenize = (value: string): string[] => normalize(value).split(" ").filter(Boolean);

const isPostalCodeLike = (value: string): boolean => /^\d{3,10}$/.test(value.trim());

/** True when `needle` appears inside `haystack` as a whole word sequence. */
const containsWordSequence = (haystack: string[], needle: string[]): boolean => {
    if (needle.length === 0 || needle.length > haystack.length) return false;
    for (let i = 0; i + needle.length <= haystack.length; i++) {
        let matched = true;
        for (let j = 0; j < needle.length; j++) {
            if (haystack[i + j] !== needle[j]) {
                matched = false;
                break;
            }
        }
        if (matched) return true;
    }
    return false;
};

/**
 * Providers regularly pack several components into one comma separated value
 * (Geoapify `address_line2`, Nominatim `display_name`, ...). Splitting keeps
 * de-duplication accurate instead of producing "Srinagar Katta, Tadigadapa,
 * Tadigadapa".
 */
const toSegments = (value?: string | null): string[] =>
    (value || "")
        .split(",")
        .map(clean)
        .filter(Boolean);

type PushOptions = {
    /** Keys never treated as duplicate, e.g. the city. */
    ignore?: Set<string>;
    /** Segment filters (e.g. drop the country echoed inside address_line2). */
    reject?: (segment: string) => boolean;
    /**
     * When false, a segment is only skipped if an identical one is already
     * present. Used for city/state/pincode so broader components are never
     * swallowed by a more specific one.
     */
    allowContainment?: boolean;
};

const pushUnique = (target: string[], seen: Set<string>, value: string | undefined, options: PushOptions = {}): void => {
    const { ignore, reject, allowContainment = true } = options;
    for (const segment of toSegments(value)) {
        if (reject?.(segment)) continue;
        const key = normalize(segment);
        if (!key || seen.has(key) || ignore?.has(key)) continue;

        if (allowContainment) {
            const tokens = tokenize(segment);
            const alreadyCovered = target.some((part) => containsWordSequence(tokenize(part), tokens));
            if (alreadyCovered) continue;
        }

        seen.add(key);
        target.push(segment);
    }
};

const firstAvailable = (
    addr: GeocodeAddressParts,
    keys: Array<keyof GeocodeAddressParts>,
    used: Set<string>
): string => {
    for (const key of keys) {
        const value = clean(addr[key]);
        if (!value || isPostalCodeLike(value)) continue;
        if (used.has(normalize(value))) continue;
        return value;
    }
    return "";
};

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Values that belong to the city / state / postcode slots. They are resolved
 * first so that a packed value such as Geoapify's
 * "Tadigadapa, Vijayawada, Andhra Pradesh, 521137, India" contributes only
 * "Tadigadapa" to the detailed area instead of swallowing the region fields.
 */
const getRegionKeys = (addr: GeocodeAddressParts): Set<string> => {
    const keys = new Set<string>();
    const candidates = [
        firstAvailable(addr, CITY_KEYS, new Set()),
        firstAvailable(addr, STATE_KEYS, new Set()),
        clean(addr.postcode),
    ];
    for (const candidate of candidates) {
        const value = normalize(candidate);
        if (value) keys.add(value);
    }
    return keys;
};

/**
 * All locality components more specific than the city, ordered from the most
 * specific to the most general, with duplicates removed.
 *
 * e.g. ["Srinagar Katta", "Tadigadapa"]
 */
export const getDetailedAreaParts = (addr: GeocodeAddressParts = {}): string[] => {
    const countryKey = normalize(clean(addr.country));

    const parts: string[] = [];
    const seen = new Set<string>();
    const options: PushOptions = {
        ignore: getRegionKeys(addr),
        reject: (segment) => {
            // `address_line2` frequently echoes the country — never repeat it.
            const normalizedSegment = normalize(segment);
            return countryKey.length > 0 && normalizedSegment === countryKey;
        },
    };

    for (const key of DETAILED_AREA_KEYS) {
        pushUnique(parts, seen, addr[key], options);
    }

    if (parts.length === 0) {
        for (const key of DETAILED_AREA_FALLBACK_KEYS) {
            pushUnique(parts, seen, addr[key], options);
        }
    }

    return parts;
};

/** City / state / postcode, each de-duplicated against the detailed area. */
export const getRegionParts = (addr: GeocodeAddressParts = {}): string[] => {
    const areaParts = getDetailedAreaParts(addr);
    const used = new Set(areaParts.map(normalize));
    const parts: string[] = [];

    const city = firstAvailable(addr, CITY_KEYS, used);
    if (city) {
        used.add(normalize(city));
        parts.push(city);
    }

    const state = firstAvailable(addr, STATE_KEYS, used);
    if (state) {
        used.add(normalize(state));
        parts.push(state);
    }

    pushUnique(parts, used, addr.postcode, { allowContainment: false });

    return parts;
};

/**
 * The city value used for filtering/searching. Falls back to the detailed
 * area, then state/country, so a city is never lost on district-only results.
 */
export const getCityName = (addr: GeocodeAddressParts = {}): string => {
    const region = getRegionParts(addr);
    if (region.length) return region[0];
    const area = getDetailedAreaParts(addr);
    if (area.length) return area[0];
    return clean(addr.state) || clean(addr.country);
};

/**
 * Complete, duplicate-free address, e.g.
 * "Srinagar Katta, Tadigadapa, Vijayawada, Andhra Pradesh, 521137"
 */
export const buildCompleteAddress = (addr: GeocodeAddressParts = {}): string => {
    const parts = getDetailedAreaParts(addr);
    const seen = new Set(parts.map(normalize));

    for (const region of getRegionParts(addr)) {
        pushUnique(parts, seen, region, { allowContainment: false });
    }

    if (parts.length) return parts.join(", ");
    return clean(addr.formatted) || clean(addr.name);
};

/**
 * The most specific area/locality, e.g. "Srinagar Katta, Tadigadapa".
 * Never empty when any address information exists.
 */
export const getMostSpecificArea = (addr: GeocodeAddressParts = {}): string => {
    const parts = getDetailedAreaParts(addr);
    if (parts.length) return parts.join(", ");
    const region = getRegionParts(addr);
    if (region.length) return region[0];
    return clean(addr.formatted) || clean(addr.name);
};

// ── Nominatim helpers ────────────────────────────────────────────────────────

/** Flattens a Nominatim result into the shared address-part shape. */
export const nominatimToAddressParts = (result?: NominatimResult | null): GeocodeAddressParts => {
    const address = result?.address || {};
    const displayName = clean(result?.display_name);
    return {
        name: clean(result?.name) || (displayName ? displayName.split(",")[0].trim() : ""),
        road: address.road,
        quarter: address.quarter,
        hamlet: address.hamlet,
        suburb: address.suburb,
        neighbourhood: address.neighbourhood,
        locality: address.locality,
        city_district: address.city_district,
        village: address.village,
        town: address.town,
        municipality: address.municipality,
        district: address.district,
        county: address.county,
        state_district: address.state_district,
        city: address.city,
        state: address.state,
        country: address.country,
        postcode: address.postcode,
        formatted: displayName,
    };
};

/** Flattens a Geoapify `properties` object into the shared address-part shape. */
export const geoapifyToAddressParts = (properties: GeocodeAddressParts = {}): GeocodeAddressParts => ({
    name: properties.name,
    address_line1: properties.address_line1,
    address_line2: properties.address_line2,
    road: properties.road || properties.street,
    quarter: properties.quarter,
    hamlet: properties.hamlet,
    suburb: properties.suburb,
    neighbourhood: properties.neighbourhood,
    locality: properties.locality,
    city_district: properties.city_district,
    village: properties.village,
    town: properties.town,
    municipality: properties.municipality,
    district: properties.district,
    county: properties.county,
    state_district: properties.state_district,
    city: properties.city,
    state: properties.state,
    country: properties.country,
    postcode: properties.postcode,
    formatted: properties.formatted,
});

/**
 * Address-parsing result for a detected coordinate, including the most
 * specific area so callers never fall back to a bare city/suburb.
 */
export type ResolvedAddress = {
    area: string;
    city: string;
    state: string;
    pincode: string;
    address: string;
};

export const resolveAddressParts = (addr: GeocodeAddressParts = {}): ResolvedAddress => ({
    area: getMostSpecificArea(addr),
    city: getCityName(addr),
    state: clean(addr.state),
    pincode: clean(addr.postcode),
    address: buildCompleteAddress(addr),
});

const NOMINATIM_REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

/**
 * Reverse geocodes a coordinate with the project's existing Nominatim provider.
 * `addressdetails=1` is required so the most specific components (`name`,
 * `quarter`, `hamlet`, `neighbourhood`, ...) are part of the response.
 */
export const reverseGeocodeAddress = async (lat: number, lng: number): Promise<ResolvedAddress | null> => {
    const res = await fetch(
        `${NOMINATIM_REVERSE_URL}?format=json&addressdetails=1&accept-language=en&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: NominatimResult = await res.json();
    if (!data || !data.address) return null;
    return resolveAddressParts(nominatimToAddressParts(data));
};

// ── LocationSelector hand-off ─────────────────────────────────────────────────

/** localStorage keys written by `LocationSelector`. */
export const LOCATION_STORAGE_KEYS = {
    address: "userLocationAddress",
    area: "userLocationArea",
    city: "userCity",
    state: "userLocationState",
    pincode: "userLocationPincode",
    latitude: "userLatitude",
    longitude: "userLongitude",
} as const;

export const saveLocationToStorage = (loc: SelectedLocation): void => {
    localStorage.setItem(LOCATION_STORAGE_KEYS.address, loc.address);
    localStorage.setItem(LOCATION_STORAGE_KEYS.area, loc.area);
    localStorage.setItem(LOCATION_STORAGE_KEYS.city, loc.city);
    localStorage.setItem(LOCATION_STORAGE_KEYS.state, loc.state);
    localStorage.setItem(LOCATION_STORAGE_KEYS.pincode, loc.pincode);
    localStorage.setItem(LOCATION_STORAGE_KEYS.latitude, String(loc.latitude));
    localStorage.setItem(LOCATION_STORAGE_KEYS.longitude, String(loc.longitude));
};

/**
 * Reads back the location chosen in `LocationSelector` so post forms can
 * pre-fill the complete (including the most specific area) address instead of
 * asking the user to retype it.
 */
export const readSavedLocation = (): SelectedLocation | null => {
    if (typeof localStorage === "undefined") return null;
    const city = clean(localStorage.getItem(LOCATION_STORAGE_KEYS.city));
    const latitude = parseFloat(localStorage.getItem(LOCATION_STORAGE_KEYS.latitude) || "");
    const longitude = parseFloat(localStorage.getItem(LOCATION_STORAGE_KEYS.longitude) || "");
    if (!city || !isFinite(latitude) || !isFinite(longitude)) return null;

    const area = clean(localStorage.getItem(LOCATION_STORAGE_KEYS.area));
    return {
        address: clean(localStorage.getItem(LOCATION_STORAGE_KEYS.address)) || city,
        area,
        areaParts: area.split(",").map((part) => part.trim()).filter(Boolean),
        city,
        state: clean(localStorage.getItem(LOCATION_STORAGE_KEYS.state)),
        pincode: clean(localStorage.getItem(LOCATION_STORAGE_KEYS.pincode)),
        latitude,
        longitude,
    };
};
