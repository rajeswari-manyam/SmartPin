import React, { useEffect, useRef, useState } from "react";
import LocationIcon from "../assets/icons/Location.png";
import { SearchIcon } from "lucide-react";
import type { SelectedLocation } from "../types/location.types";

type Props = {
    initialLat?: number;
    initialLng?: number;
    onSaveLocation?: (city: string, lat: number, lng: number) => void;
    onLocationSelect?: (loc: SelectedLocation) => void;
    onNavigate?: () => void;
    autoDetect?: boolean;
};

const BG_COLOR = "#F0F0F0";
const PRIMARY_COLOR = "#00598a";

const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY || "";
const GEOAPIFY_KEY_VALID = GEOAPIFY_API_KEY !== "" && GEOAPIFY_API_KEY !== "YOUR_GEOAPIFY_API_KEY";
const GEOAPIFY_BASE = "https://api.geoapify.com/v1/geocode";

interface GeoFeature {
    type: string;
    geometry: { type: string; coordinates: [number, number] } | null;
    properties: {
        address_line1?: string;
        address_line2?: string;
        formatted?: string;
        name?: string;
        city?: string;
        county?: string;
        state?: string;
        country?: string;
        locality?: string;
        district?: string;
        suburb?: string;
        neighbourhood?: string;
        postcode?: string;
        result_type?: string;
        state_district?: string;
        municipality?: string;
        village?: string;
        town?: string;
        city_district?: string;
        street?: string;
        lat?: number;
        lon?: number;
    };
}

interface GeocodeResponse {
    features: GeoFeature[];
}

interface NominatimResult {
    place_id?: number;
    name?: string;
    display_name?: string;
    lat?: string;
    lon?: string;
    type?: string;
    address?: {
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        state?: string;
        country?: string;
        suburb?: string;
        neighbourhood?: string;
        road?: string;
        postcode?: string;
        municipality?: string;
        city_district?: string;
    };
}

let lastNominatimRequest = 0;
const ensureNominatimRateLimit = async (): Promise<void> => {
    const elapsed = Date.now() - lastNominatimRequest;
    if (elapsed < 1100) await new Promise((r) => setTimeout(r, 1100 - elapsed));
    lastNominatimRequest = Date.now();
};

const nominatimToFeature = (item: NominatimResult): GeoFeature | null => {
    const lat = parseFloat(item.lat || "");
    const lon = parseFloat(item.lon || "");
    if (!isFinite(lat) || !isFinite(lon)) return null;
    const a = item.address || {};
    return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [lon, lat] },
        properties: {
            address_line1: item.name || item.display_name?.split(",")[0]?.trim(),
            formatted: item.display_name,
            name: item.name,
            city: a.city || a.town || a.municipality || a.county,
            county: a.county,
            municipality: a.municipality,
            suburb: a.suburb || a.neighbourhood,
            neighbourhood: a.neighbourhood,
            village: a.village,
            town: a.town,
            city_district: a.city_district,
            state: a.state,
            postcode: a.postcode,
            country: a.country,
            result_type: item.type,
        },
    };
};

const GEOAPIFY_AUTOCOMPLETE_LIMIT = 20;
const RESULT_CAP = 15;

const fetchGeoapifyAutocomplete = async (
    q: string,
    signal?: AbortSignal,
    extraParams = ""
): Promise<GeoFeature[]> => {
    if (!GEOAPIFY_KEY_VALID) return [];
    const url =
        `${GEOAPIFY_BASE}/autocomplete` +
        `?text=${encodeURIComponent(q)}` +
        `&filter=countrycode:in` +
        (extraParams ? `&${extraParams}` : "") +
        `&limit=${GEOAPIFY_AUTOCOMPLETE_LIMIT}` +
        `&lang=en` +
        `&apiKey=${GEOAPIFY_API_KEY}`;
    const res = await fetch(url, { signal });
    if (res.status === 401 || res.status === 403) {
        console.error("Geoapify API key is invalid or not authorized (401/403) — check REACT_APP_GEOAPIFY_API_KEY in .env");
        return [];
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: GeocodeResponse = await res.json();
    console.log("India location results:", data.features);
    return data.features || [];
};

const fetchNominatimSuggestions = async (
    q: string,
    signal?: AbortSignal
): Promise<GeoFeature[]> => {
    await ensureNominatimRateLimit();
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=${GEOAPIFY_AUTOCOMPLETE_LIMIT}&accept-language=en&countrycodes=in&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: NominatimResult[] = await res.json();
    console.log("Nominatim suggestions:", data);
    return (Array.isArray(data) ? data : [])
        .map(nominatimToFeature)
        .filter((f): f is GeoFeature => f !== null);
};

const isAnchorFeature = (f: GeoFeature): boolean => {
    const rt = f.properties.result_type || "";
    if (rt === "street" || rt === "address" || rt === "amenity" || rt === "building") return false;
    const lat = getFeatureLat(f);
    const lng = getFeatureLng(f);
    return isFinite(lat) && isFinite(lng);
};

const pickCityAnchor = (features: GeoFeature[]): GeoFeature | undefined => {
    const regionTypes = [
        "city",
        "town",
        "municipality",
        "village",
        "administrative",
        "county",
        "district",
    ];
    const withCity = features.find(
        (f) =>
            regionTypes.includes((f.properties.result_type || "").toLowerCase()) &&
            !!f.properties.city
    );
    if (withCity) return withCity;
    const region = features.find((f) =>
        regionTypes.includes((f.properties.result_type || "").toLowerCase())
    );
    if (region) return region;
    return features.find(isAnchorFeature);
};

const countLocalities = (features: GeoFeature[]): number =>
    features.filter((f) =>
        SPECIFIC_AREA_TYPES.includes((f.properties.result_type || "").toLowerCase())
    ).length;

const fetchLocationSuggestions = async (q: string, signal?: AbortSignal): Promise<GeoFeature[]> => {
    console.log("Location query:", q);
    if (GEOAPIFY_KEY_VALID) {
        const cityResults = await fetchGeoapifyAutocomplete(q, signal);
        console.log("CITY SEARCH RESULTS:", cityResults);

        let combined: GeoFeature[] = [...cityResults];

        // Identify the main Indian city result, then run a focused second search
        // for that city (e.g. "Vijayawada, Andhra Pradesh, India") so Geoapify
        // returns more specific local areas inside it.
        const anchor = pickCityAnchor(cityResults);
        let localityQuery = "";
        if (
            anchor &&
            isFinite(getFeatureLat(anchor)) &&
            isFinite(getFeatureLng(anchor))
        ) {
            const p = anchor.properties;
            const cityName = p.city || p.county || getSuggestionTitle(anchor);
            const stateName = p.state || "";
            localityQuery = [cityName, stateName, "India"].filter(Boolean).join(", ");

            if (localityQuery.trim()) {
                const localityResults = await fetchGeoapifyAutocomplete(localityQuery, signal);
                console.log("LOCALITY SEARCH RESULTS:", localityResults);
                if (localityResults.length) combined = [...combined, ...localityResults];
            }
        }

        let mergedResults = sortSuggestions(combined, q);
        console.log("MERGED LOCATION RESULTS:", mergedResults);

        // Requirement: if Geoapify returned (almost) only city-level results,
        // fall back to Nominatim to try to obtain additional locality results.
        const localityCount = countLocalities(mergedResults);
        if (localityCount < 3 && !signal?.aborted) {
            const nom = await fetchNominatimSuggestions(q, signal);
            let nomResults = sortSuggestions([...mergedResults, ...nom], q);
            if (countLocalities(nomResults) < 3 && localityQuery && localityQuery !== q) {
                const nom2 = await fetchNominatimSuggestions(localityQuery, signal);
                if (nom2.length) nomResults = sortSuggestions([...nomResults, ...nom2], q);
            }
            mergedResults = nomResults;
        }

        return mergedResults.slice(0, RESULT_CAP);
    }

    const nom = await fetchNominatimSuggestions(q, signal);
    return sortSuggestions(nom, q).slice(0, RESULT_CAP);
};

const fetchGeocodeFirst = async (text: string): Promise<GeoFeature | null> => {
    const list = await fetchLocationSuggestions(text);
    return list[0] || null;
};

const getLocationByIP = async (): Promise<{ lat: number; lng: number; city: string } | null> => {
    try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        if (data?.latitude && data?.longitude) {
            return { lat: data.latitude, lng: data.longitude, city: data.city || data.region || "Unknown" };
        }
    } catch (e) {
        console.warn("ipapi.co failed", e);
    }
    try {
        const res = await fetch("http://ip-api.com/json/");
        const data = await res.json();
        if (data?.status === "success") {
            return { lat: data.lat, lng: data.lon, city: data.city || data.regionName || "Unknown" };
        }
    } catch (e) {
        console.warn("ip-api.com failed", e);
    }
    return null;
};

const getFeatureLat = (f: GeoFeature): number => f.properties.lat ?? f.geometry?.coordinates?.[1] ?? NaN;
const getFeatureLng = (f: GeoFeature): number => f.properties.lon ?? f.geometry?.coordinates?.[0] ?? NaN;

const getFeatureCity = (f: GeoFeature): string => {
    const p = f.properties;
    return p.city || p.county || p.state || p.country || "";
};

const getFeatureAddress = (f: GeoFeature): string => {
    const p = f.properties;
    const main =
        p.name && p.name !== p.address_line1 && !p.address_line1?.startsWith(p.name)
            ? p.name
            : p.address_line1 || p.formatted || p.name || "";
    const parts = [main, p.address_line2].filter(Boolean) as string[];
    const joined = parts.join(", ");
    const locality = [p.city, p.state, p.country].filter(
        (x, i, a) => x && a.indexOf(x) === i && !joined.includes(x)
    ) as string[];
    if (!p.formatted) parts.push(locality.join(", "));
    return parts.filter(Boolean).join(", ");
};

const getSuggestionTitle = (f: GeoFeature): string => {
    const p = f.properties;
    const pick = (v?: string) => (v || "").trim();
    return (
        pick(p.suburb) ||
        pick(p.neighbourhood) ||
        pick(p.locality) ||
        pick(p.district) ||
        pick(p.city_district) ||
        pick(p.municipality) ||
        pick(p.village) ||
        pick(p.town) ||
        pick(p.name) ||
        pick(p.city) ||
        pick(p.county) ||
        pick(p.address_line1) ||
        pick(p.formatted)
    );
};

const getSuggestionSubtitle = (f: GeoFeature): string => {
    const p = f.properties;
    const title = getSuggestionTitle(f).toLowerCase();
    const countyFallback = p.county || p.district || p.state_district;
    const candidates = [
        p.city,
        countyFallback,
        p.state,
        p.postcode,
    ].filter((x): x is string => !!x && x.trim() !== "");

    const out: string[] = [];
    for (const cand of candidates) {
        const lower = cand.trim().toLowerCase();
        if (!lower) continue;
        if (title.includes(lower)) continue;
        if (out.some((x) => x.toLowerCase() === lower)) continue;
        out.push(cand.trim());
    }
    return out.join(", ");
};

const SPECIFIC_AREA_TYPES = [
    "suburb",
    "neighbourhood",
    "locality",
    "district",
    "city_district",
    "municipality",
    "village",
    "town",
];

const sortSuggestions = (
    features: GeoFeature[],
    q: string
): GeoFeature[] => {
    const query = q.trim().toLowerCase();

    const seen = new Set<string>();
    const unique: GeoFeature[] = [];

    for (const feature of features) {
        const title = getSuggestionTitle(feature)
            .trim()
            .toLowerCase();
        const city = (feature.properties.city || "").trim().toLowerCase();
        const state = (feature.properties.state || "").trim().toLowerCase();
        const key = `${title}||${city}||${state}`;

        if (!title || seen.has(key)) continue;

        seen.add(key);
        unique.push(feature);
    }

    return unique
        .map((feature, index) => {
            const p = feature.properties;
            const title = getSuggestionTitle(feature)
                .trim()
                .toLowerCase();

            const resultType =
                (p.result_type || "").toLowerCase();

            let typePriority = 10;

            // SPECIFIC AREAS FIRST
            if (SPECIFIC_AREA_TYPES.includes(resultType)) {
                typePriority = 0;
            }

            // CITY SECOND
            else if (resultType === "city") {
                typePriority = 5;
            }

            // COUNTY / STATE / COUNTRY LAST
            else if (
                [
                    "county",
                    "state_district",
                    "state",
                    "country",
                ].includes(resultType)
            ) {
                typePriority = 8;
            }

            const cityName = (p.city || "").trim().toLowerCase();
            const ref = (cityName || query).replace(/[^a-z]/gi, "");
            const titleAlpha = title.replace(/[^a-z]/gi, "");
            const isRedundantCityVariant =
                titleAlpha.startsWith(ref) && titleAlpha.length > ref.length;

            let textPriority = 2;

            if (title === query) {
                textPriority = 1;
            } else if (title.startsWith(query)) {
                textPriority = 0;
            }

            // When a locality merely repeats the city name (e.g. "Vijayawada
            // (Rural)"), rank genuinely distinct area names (Patamata, Gunadala,
            // ...) above it so city variants do not dominate the dropdown.
            if (typePriority === 0 && isRedundantCityVariant) {
                textPriority = 3;
            }

            return {
                feature,
                index,
                typePriority,
                textPriority,
            };
        })
        .sort((a, b) => {
            if (a.typePriority !== b.typePriority) {
                return a.typePriority - b.typePriority;
            }

            if (a.textPriority !== b.textPriority) {
                return a.textPriority - b.textPriority;
            }

            return a.index - b.index;
        })
        .map(item => item.feature)
        .slice(0, 15);
};

const buildSelectedLocation = (feature: GeoFeature): SelectedLocation | null => {
    const latitude = getFeatureLat(feature);
    const longitude = getFeatureLng(feature);
    if (!isFinite(latitude) || !isFinite(longitude)) return null;
    const p = feature.properties;
    const area =
        p.suburb ||
        p.neighbourhood ||
        p.locality ||
        p.district ||
        p.municipality ||
        p.village ||
        p.town ||
        p.city_district ||
        "";
    return {
        address: getFeatureAddress(feature),
        area,
        city: getFeatureCity(feature),
        state: p.state || "",
        pincode: p.postcode || "",
        latitude,
        longitude,
    };
};

const saveSelectedLocation = (loc: SelectedLocation): void => {
    localStorage.setItem("userLocationAddress", loc.address);
    localStorage.setItem("userLocationArea", loc.area);
    localStorage.setItem("userCity", loc.city);
    localStorage.setItem("userLocationState", loc.state);
    localStorage.setItem("userLocationPincode", loc.pincode);
    localStorage.setItem("userLatitude", String(loc.latitude));
    localStorage.setItem("userLongitude", String(loc.longitude));
};

export default function LocationSelector({
    onSaveLocation,
    onLocationSelect,
    onNavigate,
}: Props) {
    const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null);

    const resolvedValueRef = useRef("");
    const actionSeqRef = useRef(0);
    const suggestionsAbortRef = useRef<AbortController | null>(null);
    const selectedLocationRef = useRef<SelectedLocation | null>(null);

    const invalidateStaleResults = () => {
        actionSeqRef.current += 1;
        suggestionsAbortRef.current?.abort();
    };

    const [query, setQuery] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [area, setArea] = useState("");
    const [selectedState, setSelectedState] = useState("");
    const [pincode, setPincode] = useState("");
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [suggestions, setSuggestions] = useState<GeoFeature[]>([]);
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const [showButtons, setShowButtons] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [locationMethod, setLocationMethod] = useState<"gps" | "ip" | "manual" | null>(null);

    useEffect(() => {
        const savedCity = localStorage.getItem("userCity");
        const savedLat = localStorage.getItem("userLatitude");
        const savedLng = localStorage.getItem("userLongitude");
        const savedAddress = localStorage.getItem("userLocationAddress");
        const savedArea = localStorage.getItem("userLocationArea");
        const savedState = localStorage.getItem("userLocationState");
        const savedPincode = localStorage.getItem("userLocationPincode");
        if (savedCity && savedLat && savedLng) {
            const restored: SelectedLocation = {
                address: savedAddress || savedCity,
                area: savedArea || "",
                city: savedCity,
                state: savedState || "",
                pincode: savedPincode || "",
                latitude: parseFloat(savedLat),
                longitude: parseFloat(savedLng),
            };
            selectedLocationRef.current = restored;
            setAddress(restored.address);
            setArea(restored.area);
            setSelectedState(restored.state);
            setPincode(restored.pincode);
            setCity(restored.city);
            setLat(restored.latitude);
            setLng(restored.longitude);
            setInputValue(restored.address);
            setIsSaved(true);
            onSaveLocation?.(restored.city, restored.latitude, restored.longitude);
        }
    }, []);

    // ── Debounced autocomplete (Geoapify → Nominatim fallback) ──────────────────
    useEffect(() => {
        if (!query || isSaved) {
            setSuggestions([]);
            setSuggestionsOpen(false);
            return;
        }
        const q = query.trim();
        if (q.length < 2) {
            setSuggestions([]);
            setSuggestionsOpen(false);
            return;
        }
        const timer = setTimeout(async () => {
            suggestionsAbortRef.current?.abort();
            const controller = new AbortController();
            suggestionsAbortRef.current = controller;
            try {
                const features = await fetchLocationSuggestions(q, controller.signal);
                console.log("Location search:", q, "results:", features);
                setSuggestions(features);
                setSuggestionsOpen(features.length > 0);
            } catch (err: any) {
                if (err?.name !== "AbortError") console.warn("Autocomplete failed:", err);
            }
        }, 350);
        return () => clearTimeout(timer);
    }, [query, isSaved]);

    const setInputValue = (value: string) => {
        resolvedValueRef.current = value;
        setQuery(value);
    };

    const applyFeature = (feature: GeoFeature) => {
        const loc = buildSelectedLocation(feature);
        if (!loc) return;
        invalidateStaleResults();
        selectedLocationRef.current = loc;
        setLat(loc.latitude);
        setLng(loc.longitude);
        setCity(loc.city);
        setArea(loc.area);
        setSelectedState(loc.state);
        setPincode(loc.pincode);
        setAddress(loc.address);
        setInputValue(loc.address);
        setSuggestions([]);
        setSuggestionsOpen(false);
        setShowButtons(true);
        setIsEditing(true);
        setLocationMethod("manual");
    };

    // Resolve a manually typed location (Enter key) via geocoding.
    const geocodeText = async (text: string): Promise<void> => {
        const actionSeq = actionSeqRef.current;
        try {
            const feature = await fetchGeocodeFirst(text);
            if (actionSeqRef.current !== actionSeq) return;
            if (feature) {
                applyFeature(feature);
            } else {
                console.warn("Geocoder could not resolve:", text);
            }
        } catch (err) {
            console.warn("Geocode failed:", err);
        }
    };

    const handleInputKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const value = (inputEl?.value ?? query).trim();
        if (!value) return;
        if (value === resolvedValueRef.current) return;
        setSuggestionsOpen(false);
        await geocodeText(value);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        if (value === resolvedValueRef.current) return;
        resolvedValueRef.current = "";
        invalidateStaleResults();
        setCity("");
        setAddress("");
        setArea("");
        setSelectedState("");
        setPincode("");
        setLat(null);
        setLng(null);
        selectedLocationRef.current = null;
        setLocationMethod(null);
        setIsSaved(false);
    };

    const handleInputClick = () => {
        if (isSaved && !isEditing) {
            invalidateStaleResults();
            setIsSaved(false);
            setIsEditing(true);
            setInputValue("");
            setCity("");
            setAddress("");
            setLat(null);
            setLng(null);
            setShowButtons(true);
            setLocationMethod(null);
            setTimeout(() => inputEl?.focus(), 50);
        } else if (!showButtons) {
            setShowButtons(true);
        }
    };

    const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
        try {
            const applyReverse = (feature: GeoFeature): string => {
                const loc = buildSelectedLocation(feature);
                const formattedAddress = getFeatureAddress(feature);
                const extCity = getFeatureCity(feature);
                if (loc) {
                    selectedLocationRef.current = loc;
                    setAddress(loc.address);
                    setArea(loc.area);
                    setSelectedState(loc.state);
                    setPincode(loc.pincode);
                } else {
                    setArea("");
                    setSelectedState("");
                    setPincode("");
                }
                setInputValue(formattedAddress || extCity);
                setCity(extCity);
                return extCity;
            };
            if (GEOAPIFY_KEY_VALID) {
                const res = await fetch(
                    `${GEOAPIFY_BASE}/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=en`
                );
                const data: GeocodeResponse = await res.json();
                const feature = data.features?.[0];
                if (feature) return applyReverse(feature);
            }
            await ensureNominatimRateLimit();
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&accept-language=en&lat=${latitude}&lon=${longitude}`
            );
            const data: NominatimResult = await res.json();
            const feature = nominatimToFeature(data);
            if (feature) return applyReverse(feature);
        } catch (e) { console.warn("Reverse geocode failed", e); }
        return "";
    };

    const handleUseCurrent = async () => {
        invalidateStaleResults();
        setIsLoading(true);
        setShowButtons(false);
        setIsEditing(false);
        const actionSeq = actionSeqRef.current;
        const isStale = () => actionSeqRef.current !== actionSeq;
        const isSecureContext =
            window.isSecureContext ||
            window.location.protocol === "https:" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";

        if (navigator.geolocation && isSecureContext) {
            await new Promise<void>((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        if (isStale()) { setIsLoading(false); resolve(); return; }
                        const latitude = pos.coords.latitude;
                        const longitude = pos.coords.longitude;
                        setLat(latitude);
                        setLng(longitude);
                        setLocationMethod("gps");
                        const extractedCity = await reverseGeocode(latitude, longitude);
                        if (isStale()) { setIsLoading(false); resolve(); return; }
                        if (extractedCity) {
                            const loc =
                                selectedLocationRef.current ??
                                {
                                    address: extractedCity,
                                    area: "",
                                    city: extractedCity,
                                    state: "",
                                    pincode: "",
                                    latitude,
                                    longitude,
                                };
                            selectedLocationRef.current = loc;
                            saveSelectedLocation(loc);
                            onSaveLocation?.(loc.city, loc.latitude, loc.longitude);
                            onLocationSelect?.(loc);
                            setIsSaved(true);
                        } else setShowButtons(true);
                        setIsLoading(false);
                        resolve();
                    },
                    async (error) => {
                        console.warn("GPS failed:", error.message);
                        if (!isStale()) await tryIPLocation(actionSeq);
                        else setIsLoading(false);
                        resolve();
                    },
                    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                );
            });
        } else {
            await tryIPLocation(actionSeq);
        }
    };

    const tryIPLocation = async (actionSeq = actionSeqRef.current) => {
        setIsLoading(true);
        const ipData = await getLocationByIP();
        if (actionSeqRef.current !== actionSeq) {
            setIsLoading(false);
            return;
        }
        if (ipData) {
            const loc: SelectedLocation = {
                address: ipData.city,
                area: "",
                city: ipData.city,
                state: "",
                pincode: "",
                latitude: ipData.lat,
                longitude: ipData.lng,
            };
            selectedLocationRef.current = loc;
            setLat(loc.latitude);
            setLng(loc.longitude);
            setCity(loc.city);
            setArea(loc.area);
            setSelectedState(loc.state);
            setPincode(loc.pincode);
            setInputValue(loc.address);
            setAddress(loc.address);
            setLocationMethod("ip");
            saveSelectedLocation(loc);
            onSaveLocation?.(loc.city, loc.latitude, loc.longitude);
            onLocationSelect?.(loc);
            setIsSaved(true);
        } else setShowButtons(true);
        setIsLoading(false);
    };

    const handleSelectSuggestion = (feature: GeoFeature) => {
        applyFeature(feature);
    };

    const handleSave = () => {
        const loc = selectedLocationRef.current;
        if (!loc) return;
        saveSelectedLocation(loc);
        onSaveLocation?.(loc.city, loc.latitude, loc.longitude);
        onLocationSelect?.(loc);
        setIsSaved(true);
        setIsEditing(false);
        setShowButtons(false);
        setSuggestionsOpen(false);
        setTimeout(() => onNavigate?.(), 800);
    };

    const handleClear = () => {
        invalidateStaleResults();
        setInputValue("");
        setCity("");
        setAddress("");
        setArea("");
        setSelectedState("");
        setPincode("");
        setLat(null);
        setLng(null);
        selectedLocationRef.current = null;
        setSuggestions([]);
        setSuggestionsOpen(false);
        setShowButtons(true);
        setIsSaved(false);
        setIsEditing(true);
        setLocationMethod(null);
        setTimeout(() => inputEl?.focus(), 50);
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-3 px-4 sm:px-0">

            {/* LOADING */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center py-4 gap-2">
                    <div
                        className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
                        style={{ borderColor: PRIMARY_COLOR, borderTopColor: "transparent" }}
                    />
                    <p className="text-sm font-medium" style={{ color: PRIMARY_COLOR }}>
                        Detecting your location…
                    </p>
                </div>
            )}

            {/* INPUT */}
            {!isLoading && (
                <div className="relative">
                    <div
                        className="flex items-center rounded-2xl border-2 shadow-sm overflow-hidden"
                        style={{ backgroundColor: BG_COLOR, borderColor: PRIMARY_COLOR }}
                    >
                        <div className="pl-4 shrink-0">
                            <img src={LocationIcon} className="w-5 h-5" alt="Location" />
                        </div>

                        <input
                            ref={setInputEl}
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={handleInputKeyDown}
                            onClick={handleInputClick}
                            disabled={isLoading}
                            autoComplete="off"
                            className="flex-1 min-w-0 px-3 py-4 text-sm sm:text-base outline-none bg-transparent"
                            style={{ color: PRIMARY_COLOR }}
                            placeholder="Enter your location"
                        />

                        {query && !isSaved && !isLoading && (
                            <button
                                onClick={handleClear}
                                className="pr-4 shrink-0 text-xl leading-none"
                                style={{ color: PRIMARY_COLOR }}
                                aria-label="Clear"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* SUGGESTIONS */}
                    {suggestionsOpen && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-2 rounded-xl bg-white shadow-xl border border-gray-100 overflow-hidden">
                            <ul className="py-1 max-h-72 overflow-y-auto">
                                {suggestions.map((feature, idx) => (
                                    <li key={idx}>
                                        <button
                                            type="button"
                                            onMouseDown={(e) => e.preventDefault()}
                                            onClick={() => handleSelectSuggestion(feature)}
                                            className="w-full text-left px-4 py-2.5 hover:bg-[#e6f2f8] transition text-sm"
                                        >
                                            <span className="block text-gray-800 font-medium truncate">
                                                {getSuggestionTitle(feature)}
                                            </span>
                                            {getSuggestionSubtitle(feature) && (
                                                <span className="block text-xs text-gray-500 truncate">
                                                    {getSuggestionSubtitle(feature)}
                                                </span>
                                            )}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <div className="px-3 py-1.5 border-t border-gray-100 text-[10px] text-gray-400">
                                © OpenStreetMap contributors · Powered by Geoapify
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* SELECTED LOCATION PREVIEW */}
            {address && !isSaved && !isLoading && isEditing && (
                <div
                    className="p-4 rounded-xl border"
                    style={{ backgroundColor: BG_COLOR, borderColor: PRIMARY_COLOR }}
                >
                    <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: PRIMARY_COLOR }}>
                        Selected Location
                    </p>
                    <p className="text-sm text-gray-700 leading-snug">{address}</p>
                    {city && (
                        <span
                            className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ border: `1px solid ${PRIMARY_COLOR}`, color: PRIMARY_COLOR }}
                        >
                            {city}
                        </span>
                    )}
                </div>
            )}

            {/* BUTTONS — stacked on mobile, side by side on sm+ */}
            {showButtons && !isSaved && !isLoading && (
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleUseCurrent}
                        className="w-full sm:flex-1 py-4 rounded-2xl text-sm sm:text-base font-semibold border-2 transition-opacity active:opacity-70"
                        style={{
                            backgroundColor: BG_COLOR,
                            borderColor: PRIMARY_COLOR,
                            color: PRIMARY_COLOR,
                        }}
                    >
                     <SearchIcon className="w-4 h-4" /> Use Current Location
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={!city || lat === null || lng === null}
                        className="w-full sm:flex-1 py-4 rounded-2xl text-sm sm:text-base font-semibold text-white transition-opacity active:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                        Save & Continue
                    </button>
                </div>
            )}

            {/* HELPER TEXT */}
            {!isSaved && !isLoading && !address && !showButtons && (
                <p className="text-xs sm:text-sm text-center text-gray-500 px-2">
                    Start typing to search, or tap "Use Current Location"
                </p>
            )}

            {/* SAVED CONFIRMATION */}
            {isSaved && !isLoading && (
                <div
                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                    style={{ backgroundColor: "#e6f2f8", color: PRIMARY_COLOR }}
                >
                    <span>✅</span>
                    <span>Location saved: <strong>{city}</strong></span>
                </div>
            )}
        </div>
    );
}