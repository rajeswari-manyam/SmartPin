import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";

import SearchContainer from "../components/SearchContainer";
import PromoSlides from "../components/PromoSlides";
import Categories from "../components/Categories";
import WelcomePage from "../components/Auth/WelcomePage";
import AllJobs from "./AllJobs";

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

// ── Resolve workerId from ALL possible localStorage keys ──────────────────────
const resolveWorkerId = (): string | null => {
    // 1. Direct string keys
    const directKeys = [
        "workerId", "@worker_id", "worker_id", "workerid", "WorkerId", "WORKER_ID",
    ];
    for (const key of directKeys) {
        const val = localStorage.getItem(key);
        if (val && val !== "null" && val !== "undefined") {
            console.log(`✅ workerId found at localStorage["${key}"]="${val}"`);
            return val;
        }
    }

    // 2. Inside JSON objects
    const jsonKeys = [
        "worker", "workerData", "workerProfile",
        "user", "userData", "currentUser", "authUser", "profile",
    ];
    for (const key of jsonKeys) {
        const raw = localStorage.getItem(key);
        if (!raw || raw === "null" || raw === "undefined") continue;
        try {
            const parsed = JSON.parse(raw);
            const id =
                parsed?._id ||
                parsed?.workerId ||
                parsed?.worker_id ||
                parsed?.id ||
                parsed?.worker?._id ||
                parsed?.worker?.id;
            if (id && typeof id === "string") {
                console.log(`✅ workerId found inside localStorage["${key}"] as "${id}"`);
                return id;
            }
        } catch {
            // not JSON
        }
    }

    // 3. Debug dump — helps identify the correct key
    console.warn("❌ workerId not found. Dumping all localStorage:");
    Object.keys(localStorage).forEach(k => {
        const v = localStorage.getItem(k) ?? "";
        console.log(`  ["${k}"] = ${v.substring(0, 120)}`);
    });

    return null;
};

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { accountType } = useAccount();

    const [showWelcome, setShowWelcome] = useState(false);

    const [userLocation, setUserLocation] = useState<{
        latitude: number | null;
        longitude: number | null;
        city?: string;
    }>({ latitude: null, longitude: null, city: undefined });

    const [locationDetecting, setLocationDetecting] = useState(true);
    const [locationError, setLocationError] = useState("");

    const [topSearchText, setTopSearchText] = useState("");

    // ── Resolve workerId once on mount ───────────────────────────────────────
    const [workerId, setWorkerId] = useState<string | null>(null);

    const isWorker = isAuthenticated && accountType === "worker";

    useEffect(() => {
        detectLocation();
    }, []);

    // Re-resolve workerId whenever auth state changes
    useEffect(() => {
        if (isWorker) {
            const id = resolveWorkerId();
            setWorkerId(id);
            if (!id) {
                console.warn("Worker is logged in but workerId could not be found in localStorage.");
            }
        }
    }, [isWorker, isAuthenticated]);

    const saveAndSet = (city: string, lat: number, lng: number) => {
        setUserLocation({ latitude: lat, longitude: lng, city });
        localStorage.setItem("userLatitude", lat.toString());
        localStorage.setItem("userLongitude", lng.toString());
        localStorage.setItem("userCity", city);
        setLocationDetecting(false);
        setLocationError("");
    };

    const detectLocation = async () => {
        setLocationDetecting(true);
        setLocationError("");

        const savedLat = localStorage.getItem("userLatitude");
        const savedLng = localStorage.getItem("userLongitude");
        const savedCity = localStorage.getItem("userCity");

        if (savedLat && savedLng && savedCity) {
            setUserLocation({
                latitude: parseFloat(savedLat),
                longitude: parseFloat(savedLng),
                city: savedCity,
            });
            setLocationDetecting(false);
            return;
        }

        const isSecureContext =
            window.isSecureContext ||
            window.location.protocol === "https:" ||
            window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1";

        if (navigator.geolocation && isSecureContext) {
            const gpsResult = await new Promise<{ lat: number; lng: number } | null>((resolve) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => resolve(null),
                    { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
                );
            });
            if (gpsResult) {
                const city = await reverseGeocodeNominatim(gpsResult.lat, gpsResult.lng);
                saveAndSet(city || "Unknown Location", gpsResult.lat, gpsResult.lng);
                return;
            }
        }

        const ipData = await getLocationByIP();
        if (ipData) {
            saveAndSet(ipData.city, ipData.lat, ipData.lng);
            return;
        }

        setLocationError("Unable to detect your location. Please enable location services.");
        setLocationDetecting(false);
    };

    const reverseGeocodeNominatim = async (lat: number, lng: number): Promise<string> => {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
                { headers: { "Accept-Language": "en" } }
            );
            const data = await res.json();
            return (
                data?.address?.city ||
                data?.address?.town ||
                data?.address?.village ||
                data?.address?.state ||
                ""
            );
        } catch {
            return "";
        }
    };

    const handleLocationChange = (city: string, lat: number, lng: number) => {
        saveAndSet(city, lat, lng);
    };

    const handleSearchChange = (text: string) => {
        setTopSearchText(text);
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── TOP SEARCH BAR ──────────────────────────────────────── */}
            <SearchContainer
                onLocationChange={handleLocationChange}
                onSearchChange={handleSearchChange}
            />

            {/* ── CONTENT ─────────────────────────────────────────────── */}
            <div className="pt-2">

                {/* Location pill */}
                {!locationDetecting && userLocation.city && userLocation.latitude && userLocation.longitude && (
                    <div className="max-w-7xl mx-auto px-4 md:px-6 py-2">
                        <div className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                            <span className="text-red-500">📍</span>
                            <span>
                                Showing results for{" "}
                                <span className="font-semibold text-gray-900">{userLocation.city}</span>
                            </span>
                        </div>
                    </div>
                )}

                {/* Loading location */}
                {locationDetecting ? (
                    <div className="flex flex-col items-center justify-center mt-20 gap-3">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 text-sm">Detecting your location...</p>
                    </div>

                ) : locationError ? (
                    /* Location Error */
                    <div className="max-w-xl mx-auto bg-yellow-50 border border-yellow-300 p-6 rounded-xl shadow mt-10 text-center">
                        <div className="text-5xl mb-4">📍</div>
                        <h2 className="text-xl font-bold text-yellow-800 mb-2">Location Required</h2>
                        <p className="text-yellow-700 text-sm mb-4">{locationError}</p>
                        <button
                            onClick={detectLocation}
                            className="bg-yellow-600 text-white px-6 py-2.5 rounded-lg hover:bg-yellow-700 transition font-medium text-sm"
                        >
                            Try Again
                        </button>
                    </div>

                ) : !userLocation.latitude || !userLocation.longitude ? (
                    /* No Location */
                    <div className="max-w-xl mx-auto bg-gray-100 p-6 rounded-xl shadow mt-10 text-center">
                        <div className="text-5xl mb-4">🌍</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Location Not Available</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            Please enable location services or select a location manually.
                        </p>
                    </div>

                ) : isWorker ? (
                    /* ── WORKER FLOW ─────────────────────────────────────── */
                    workerId ? (
                        <AllJobs
                            latitude={userLocation.latitude}
                            longitude={userLocation.longitude}
                            searchText={topSearchText}
                            workerId={workerId}
                        />
                    ) : (
                        /* Worker logged in but no workerId found */
                        <div className="max-w-xl mx-auto bg-orange-50 border border-orange-300 p-6 rounded-xl shadow mt-10 text-center">
                            <div className="text-5xl mb-4">⚠️</div>
                            <h2 className="text-xl font-bold text-orange-800 mb-2">Profile Incomplete</h2>
                            <p className="text-orange-700 text-sm mb-4">
                                Your worker profile could not be found. Please complete your profile setup.
                            </p>
                            <button
                                onClick={() => navigate("/profile-setup")}
                                className="bg-orange-600 text-white px-6 py-2.5 rounded-lg hover:bg-orange-700 transition font-medium text-sm"
                            >
                                Complete Profile
                            </button>
                        </div>
                    )

                ) : (
                    /* ── CUSTOMER FLOW ───────────────────────────────────── */
                    <>
                        <PromoSlides />
                        <Categories
                            onCategoryClick={() => {
                                if (!isAuthenticated) {
                                    setShowWelcome(true);
                                    return false;
                                }
                                return true;
                            }}
                        />
                    </>
                )}
            </div>

            <WelcomePage isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
        </div>
    );
};

export default HomePage;
