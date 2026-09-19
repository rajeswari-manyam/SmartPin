import React, { useEffect, useRef, useState } from "react";
import LocationIcon from "../assets/icons/Location.png";
import { SearchIcon } from "lucide-react";

type Props = {
    initialLat?: number;
    initialLng?: number;
    onSaveLocation?: (city: string, lat: number, lng: number) => void;
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
    address?: {
        city?: string;
        town?: string;
        village?: string;
        county?: string;
        state?: string;
        country?: string;
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
            city: a.city || a.town || a.village || a.county,
            state: a.state,
            country: a.country,
        },
    };
};

const fetchLocationSuggestions = async (q: string, signal?: AbortSignal): Promise<GeoFeature[]> => {
    if (GEOAPIFY_KEY_VALID) {
        const url = `${GEOAPIFY_BASE}/autocomplete?text=${encodeURIComponent(q)}&limit=6&lang=en&apiKey=${GEOAPIFY_API_KEY}`;
        const res = await fetch(url, { signal });
        if (res.status === 401 || res.status === 403) {
            console.error("Geoapify API key is invalid or not authorized (401/403) — check REACT_APP_GEOAPIFY_API_KEY in .env");
            return [];
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: GeocodeResponse = await res.json();
        return data.features || [];
    }
    await ensureNominatimRateLimit();
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&accept-language=en&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { signal, headers: { "Accept-Language": "en" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: NominatimResult[] = await res.json();
    return (Array.isArray(data) ? data : [])
        .map(nominatimToFeature)
        .filter((f): f is GeoFeature => f !== null);
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

const getFeatureSubtitle = (f: GeoFeature): string => {
    const p = f.properties;
    const main = getFeatureAddress(f);
    const locality = [p.city, p.state, p.country].filter(
        (x, i, a) => x && a.indexOf(x) === i
    ) as string[];
    return locality.filter((x) => !main.includes(x)).join(", ");
};

export default function LocationSelector({
    onSaveLocation,
    onNavigate,
}: Props) {
    const [inputEl, setInputEl] = useState<HTMLInputElement | null>(null);

    const resolvedValueRef = useRef("");
    const actionSeqRef = useRef(0);
    const suggestionsAbortRef = useRef<AbortController | null>(null);

    const invalidateStaleResults = () => {
        actionSeqRef.current += 1;
        suggestionsAbortRef.current?.abort();
    };

    const [query, setQuery] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
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
        if (savedCity && savedLat && savedLng) {
            setCity(savedCity);
            setLat(parseFloat(savedLat));
            setLng(parseFloat(savedLng));
            setInputValue(savedCity);
            setIsSaved(true);
            onSaveLocation?.(savedCity, parseFloat(savedLat), parseFloat(savedLng));
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
        const latitude = getFeatureLat(feature);
        const longitude = getFeatureLng(feature);
        if (!isFinite(latitude) || !isFinite(longitude)) return;
        const formattedAddress = getFeatureAddress(feature);
        const selectedCity = getFeatureCity(feature);
        invalidateStaleResults();
        setLat(latitude);
        setLng(longitude);
        setCity(selectedCity);
        setAddress(formattedAddress);
        setInputValue(formattedAddress);
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
        setLat(null);
        setLng(null);
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
            if (GEOAPIFY_KEY_VALID) {
                const res = await fetch(
                    `${GEOAPIFY_BASE}/reverse?lat=${latitude}&lon=${longitude}&apiKey=${GEOAPIFY_API_KEY}&lang=en`
                );
                const data: GeocodeResponse = await res.json();
                const feature = data.features?.[0];
                if (feature) {
                    const formattedAddress = getFeatureAddress(feature);
                    const extCity = getFeatureCity(feature);
                    setAddress(formattedAddress || extCity);
                    setInputValue(formattedAddress || extCity);
                    setCity(extCity);
                    return extCity;
                }
            }
            await ensureNominatimRateLimit();
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&accept-language=en&lat=${latitude}&lon=${longitude}`
            );
            const data: NominatimResult = await res.json();
            const feature = nominatimToFeature(data);
            if (feature) {
                const formattedAddress = getFeatureAddress(feature);
                const extCity = getFeatureCity(feature);
                setAddress(formattedAddress || extCity);
                setInputValue(formattedAddress || extCity);
                setCity(extCity);
                return extCity;
            }
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
                            localStorage.setItem("userCity", extractedCity);
                            localStorage.setItem("userLatitude", latitude.toString());
                            localStorage.setItem("userLongitude", longitude.toString());
                            onSaveLocation?.(extractedCity, latitude, longitude);
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
            setLat(ipData.lat);
            setLng(ipData.lng);
            setCity(ipData.city);
            setInputValue(ipData.city);
            setAddress(ipData.city);
            setLocationMethod("ip");
            localStorage.setItem("userCity", ipData.city);
            localStorage.setItem("userLatitude", ipData.lat.toString());
            localStorage.setItem("userLongitude", ipData.lng.toString());
            onSaveLocation?.(ipData.city, ipData.lat, ipData.lng);
            setIsSaved(true);
        } else setShowButtons(true);
        setIsLoading(false);
    };

    const handleSelectSuggestion = (feature: GeoFeature) => {
        applyFeature(feature);
    };

    const handleSave = () => {
        if (!city || lat === null || lng === null) return;
        localStorage.setItem("userCity", city);
        localStorage.setItem("userLatitude", lat.toString());
        localStorage.setItem("userLongitude", lng.toString());
        onSaveLocation?.(city, lat, lng);
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
        setLat(null);
        setLng(null);
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
                                                {getFeatureAddress(feature)}
                                            </span>
                                            {getFeatureSubtitle(feature) && (
                                                <span className="block text-xs text-gray-500 truncate">
                                                    {getFeatureSubtitle(feature)}
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