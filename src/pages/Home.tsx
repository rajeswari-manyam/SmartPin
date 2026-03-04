import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import LocationIcon from "../assets/icons/Location.png";
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

const resolveWorkerId = (user: any): string | null => {
    if (user?.workerId) return user.workerId;
    for (const key of ["workerId", "@worker_id", "worker_id"]) {
        const val = localStorage.getItem(key);
        if (val && val !== "null" && val !== "undefined") return val;
    }
    try {
        const raw = localStorage.getItem("user");
        if (raw) {
            const parsed = JSON.parse(raw);
            const id = parsed?.workerId || parsed?.worker?._id;
            if (id && typeof id === "string") return id;
        }
    } catch { }
    return null;
};

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
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
    const [workerId, setWorkerId] = useState<string | null>(null);

    const isWorker = isAuthenticated && accountType === "worker";

    useEffect(() => {
        detectLocation();
    }, []);

    useEffect(() => {
        if (!isWorker) return;
        const id = resolveWorkerId(user);
        if (id) {
            setWorkerId(id);
        } else {
            console.warn("⚠️ No workerId found in storage.");
        }
    }, [isWorker, user]);

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

    /* ── Reusable status screens ── */
    const LocationDetectingScreen = () => (
        <div className="flex flex-col items-center justify-center mt-16 md:mt-24 gap-4 px-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            <p className="text-gray-500 text-sm text-center">Detecting your location...</p>
        </div>
    );

    const LocationErrorScreen = () => (
        <div className="mx-4 md:max-w-xl md:mx-auto bg-yellow-50 border border-yellow-300 p-5 md:p-8 rounded-2xl shadow mt-8 md:mt-12 text-center">
            <div className="text-4xl md:text-5xl mb-3">📍</div>
            <h2 className="text-lg md:text-xl font-bold text-yellow-800 mb-2">Location Required</h2>
            <p className="text-yellow-700 text-sm mb-5 leading-relaxed">{locationError}</p>
            <button
                onClick={detectLocation}
                className="w-full md:w-auto bg-yellow-600 text-white px-6 py-3 rounded-xl hover:bg-yellow-700 active:scale-95 transition-all font-medium text-sm"
            >
                Try Again
            </button>
        </div>
    );

    const LocationUnavailableScreen = () => (
        <div className="mx-4 md:max-w-xl md:mx-auto bg-gray-100 p-5 md:p-8 rounded-2xl shadow mt-8 md:mt-12 text-center">
            <div className="text-4xl md:text-5xl mb-3">🌍</div>
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">Location Not Available</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
                Please enable location services or select a location manually.
            </p>
        </div>
    );

    const ProfileIncompleteScreen = () => (
        <div className="mx-4 md:max-w-xl md:mx-auto bg-orange-50 border border-orange-300 p-5 md:p-8 rounded-2xl shadow mt-8 md:mt-12 text-center">
            <div className="text-4xl md:text-5xl mb-3">⚠️</div>
            <h2 className="text-lg md:text-xl font-bold text-orange-800 mb-2">Profile Incomplete</h2>
            <p className="text-orange-700 text-sm mb-5 leading-relaxed">
                Your worker profile could not be found. Please complete your profile setup.
            </p>
            <button
                onClick={() => navigate("/worker-profile")}
                className="w-full md:w-auto bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 active:scale-95 transition-all font-medium text-sm"
            >
                Complete Profile
            </button>
        </div>
    );

    const renderContent = () => {
        if (locationDetecting) return <LocationDetectingScreen />;
        if (locationError) return <LocationErrorScreen />;
        if (!userLocation.latitude || !userLocation.longitude) return <LocationUnavailableScreen />;

        if (isWorker) {
            return workerId ? (
                <AllJobs
                    latitude={userLocation.latitude}
                    longitude={userLocation.longitude}
                    searchText={topSearchText}
                    workerId={workerId}
                />
            ) : (
                <ProfileIncompleteScreen />
            );
        }

        return (
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
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Search Bar */}
            <SearchContainer
                onLocationChange={handleLocationChange}
                onSearchChange={handleSearchChange}
            />

            {/* Location pill */}
            {!locationDetecting && userLocation.city && userLocation.latitude && userLocation.longitude && (
                <div className="max-w-7xl mx-auto px-3 md:px-6 pt-2 pb-1">
                    <div className="inline-flex items-center gap-1.5 text-xs md:text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm">
                        <img src={LocationIcon} className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" alt="Location" />
                        <span className="truncate max-w-[220px] md:max-w-none">
                            Showing results for{" "}
                            <span className="font-semibold text-gray-900">{userLocation.city}</span>
                        </span>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="pb-6">
                {renderContent()}
            </div>

            <WelcomePage isOpen={showWelcome} onClose={() => setShowWelcome(false)} />
        </div>
    );
};

export default HomePage;