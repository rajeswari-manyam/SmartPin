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

const GOOGLE_MAPS_API_KEY = "AIzaSyA6myHzS10YXdcazAFalmXvDkrYCp5cLc8";
const BG_COLOR = "#F0F0F0";
const PRIMARY_COLOR = "#00598a";

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

export default function LocationSelector({
    initialLat,
    initialLng,
    onSaveLocation,
    onNavigate,
    autoDetect = true,
}: Props) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const [query, setQuery] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");
    const [lat, setLat] = useState<number | null>(null);
    const [lng, setLng] = useState<number | null>(null);
    const [googleMaps, setGoogleMaps] = useState<typeof google | null>(null);
    const [showButtons, setShowButtons] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [autoDetected, setAutoDetected] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [locationMethod, setLocationMethod] = useState<"gps" | "ip" | "manual" | null>(null);

    useEffect(() => {
        if (window.google?.maps) { setGoogleMaps(window.google); return; }
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => setGoogleMaps(window.google);
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (!googleMaps || !inputRef.current) return;
        const auto = new googleMaps.maps.places.Autocomplete(inputRef.current, {
            fields: ["geometry", "formatted_address", "address_components"],
        });
        auto.addListener("place_changed", () => {
            const place = auto.getPlace();
            if (!place.geometry?.location) return;
            const latitude = place.geometry.location.lat();
            const longitude = place.geometry.location.lng();
            setLat(latitude);
            setLng(longitude);
            setAddress(place.formatted_address || "");
            setQuery(place.formatted_address || "");
            extractCity(place.address_components || []);
            setShowButtons(true);
            setIsEditing(false);
        });
    }, [googleMaps]);

    useEffect(() => {
        const savedCity = localStorage.getItem("userCity");
        const savedLat = localStorage.getItem("userLatitude");
        const savedLng = localStorage.getItem("userLongitude");
        if (savedCity && savedLat && savedLng) {
            setCity(savedCity);
            setLat(parseFloat(savedLat));
            setLng(parseFloat(savedLng));
            setQuery(savedCity);
            setAddress(savedCity);
            setIsSaved(true);
            onSaveLocation?.(savedCity, parseFloat(savedLat), parseFloat(savedLng));
            return;
        }
        if (autoDetect && !autoDetected && !initialLat && !initialLng) {
            setAutoDetected(true);
            handleUseCurrent();
        }
    }, [autoDetect, autoDetected, initialLat, initialLng]);

    const extractCity = (components: google.maps.GeocoderAddressComponent[]) => {
        const result =
            components.find((c) => c.types.includes("locality")) ||
            components.find((c) => c.types.includes("administrative_area_level_2")) ||
            components.find((c) => c.types.includes("administrative_area_level_1")) ||
            components.find((c) => c.types.includes("country"));
        setCity(result?.long_name || "");
        return result?.long_name || "";
    };

    const handleInputClick = () => {
        if (isSaved && !isEditing) {
            setIsSaved(false);
            setIsEditing(true);
            setQuery("");
            setCity("");
            setAddress("");
            setLat(null);
            setLng(null);
            setShowButtons(true);
            setLocationMethod(null);
            setTimeout(() => inputRef.current?.focus(), 50);
        } else if (!showButtons) {
            setShowButtons(true);
        }
    };

    const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
        if (googleMaps) {
            return new Promise((resolve) => {
                const geocoder = new googleMaps.maps.Geocoder();
                geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
                    if (status === "OK" && results?.[0]) {
                        const formattedAddress = results[0].formatted_address || "";
                        setAddress(formattedAddress);
                        setQuery(formattedAddress);
                        const extractedCity = extractCity(results[0].address_components || []);
                        resolve(extractedCity);
                    } else resolve("");
                });
            });
        }
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            if (data?.address) {
                const cityName = data.address.city || data.address.town || data.address.village || data.address.state || "";
                const fullAddress = data.display_name || cityName;
                setAddress(fullAddress);
                setQuery(fullAddress);
                setCity(cityName);
                return cityName;
            }
        } catch (e) { console.warn("Nominatim failed", e); }
        return "";
    };

    const handleUseCurrent = async () => {
        setIsLoading(true);
        setShowButtons(false);
        setIsEditing(false);
        const isSecureContext =
            window.isSecureContext ||
            window.location.protocol === "https:" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";

        if (navigator.geolocation && isSecureContext) {
            await new Promise<void>((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    async (pos) => {
                        const latitude = pos.coords.latitude;
                        const longitude = pos.coords.longitude;
                        setLat(latitude);
                        setLng(longitude);
                        setLocationMethod("gps");
                        const extractedCity = await reverseGeocode(latitude, longitude);
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
                        await tryIPLocation();
                        resolve();
                    },
                    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
                );
            });
        } else {
            await tryIPLocation();
        }
    };

    const tryIPLocation = async () => {
        setIsLoading(true);
        const ipData = await getLocationByIP();
        if (ipData) {
            setLat(ipData.lat);
            setLng(ipData.lng);
            setCity(ipData.city);
            setQuery(ipData.city);
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

    const handleSave = () => {
        if (!city || lat === null || lng === null) return;
        localStorage.setItem("userCity", city);
        localStorage.setItem("userLatitude", lat.toString());
        localStorage.setItem("userLongitude", lng.toString());
        onSaveLocation?.(city, lat, lng);
        setIsSaved(true);
        setIsEditing(false);
        setShowButtons(false);
        setTimeout(() => onNavigate?.(), 800);
    };

    const handleClear = () => {
        setQuery("");
        setCity("");
        setAddress("");
        setLat(null);
        setLng(null);
        setShowButtons(true);
        setIsSaved(false);
        setIsEditing(true);
        setLocationMethod(null);
        setTimeout(() => inputRef.current?.focus(), 50);
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
                <div
                    className="flex items-center rounded-2xl border-2 shadow-sm overflow-hidden"
                    style={{ backgroundColor: BG_COLOR, borderColor: PRIMARY_COLOR }}
                >
                    <div className="pl-4 shrink-0">
                        <img src={LocationIcon} className="w-5 h-5" alt="Location" />
                    </div>

                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onClick={handleInputClick}
                        disabled={isLoading}
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
                        disabled={!city || !lat || !lng}
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