import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyWorkers } from "../services/api.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbyMaidCard from "../components/cards/Home Repair/NearByMaidService";
import NearbyCookCard from "../components/cards/Home Repair/NearByCookingCard";
import BabySitterCard from "../components/cards/Home Repair/NearBy BabySitterServices";
import ElderCareCard from "../components/cards/Home Repair/NearByElderlyCareService";
import HousekeepingCard from "../components/cards/Home Repair/NearByHouseKeepingService";
import NearbyLaundryCard from "../components/cards/Home Repair/NearByLaundaryCard";
import MineralWaterSuppliers from "../components/cards/Home Repair/NearByWaterSuppliers";

// ============================================================================
// WORKER INTERFACE
// ============================================================================
export interface HomePersonalWorker {
    _id: string;
    userId: string;
    workerId: string;
    name: string;
    category: string[];
    subCategory: string;
    skill: string;
    serviceCharge: number;
    chargeType: "hour" | "day" | "fixed";
    profilePic?: string;
    images?: string[];
    phone?: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// CARD MAP
// ============================================================================
type CardKey = "maid" | "cook" | "baby" | "elder" | "housekeeping" | "laundry" | "water";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    maid: NearbyMaidCard,
    cook: NearbyCookCard,
    baby: BabySitterCard,
    elder: ElderCareCard,
    housekeeping: HousekeepingCard,
    laundry: NearbyLaundryCard,
    water: MineralWaterSuppliers,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("maid")) return "maid";
    if (n.includes("cook")) return "cook";
    if (n.includes("baby") || n.includes("sitter")) return "baby";
    if (n.includes("elder")) return "elder";
    if (n.includes("house") || n.includes("keeping")) return "housekeeping";
    if (n.includes("laundry")) return "laundry";
    if (n.includes("water")) return "water";
    return "maid";
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Home & Personal Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// Extracts worker array from ANY known API response shape
// ============================================================================
const extractWorkers = (response: any): HomePersonalWorker[] => {
    if (!response) return [];

    // Full response dump — expand in browser console to see exact shape
    console.log("🔍 FULL RAW RESPONSE (expand to inspect):", response);
    try {
        console.log("🔍 FULL RAW RESPONSE (JSON):", JSON.stringify(response, null, 2));
    } catch {
        console.log("🔍 Response could not be JSON stringified (may contain circular refs)");
    }

    // Try every common API shape
    const candidates: Array<{ label: string; value: any }> = [
        { label: "response.workers", value: response.workers },
        { label: "response.data?.workers", value: response.data?.workers },
        { label: "response.data (array)", value: response.data },
        { label: "response.result", value: response.result },
        { label: "response.results", value: response.results },
        { label: "response.data?.data", value: response.data?.data },
        { label: "response.data?.result", value: response.data?.result },
        { label: "response.data?.results", value: response.data?.results },
        { label: "response.nearbyWorkers", value: response.nearbyWorkers },
        { label: "response.data?.nearbyWorkers", value: response.data?.nearbyWorkers },
        { label: "response.services", value: response.services },
        { label: "response.data?.services", value: response.data?.services },
    ];

    for (const { label, value } of candidates) {
        if (Array.isArray(value)) {
            console.log(`✅ Workers found at: ${label} — count: ${value.length}`);
            return value as HomePersonalWorker[];
        }
        // Single object with _id — wrap it
        if (value && typeof value === "object" && !Array.isArray(value) && value._id) {
            console.log(`✅ Single worker found at: ${label}, wrapping in array`);
            return [value] as HomePersonalWorker[];
        }
    }

    console.warn("⚠️ Could not extract workers. Top-level keys:", Object.keys(response));
    return [];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const HomePersonalServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyWorkers, setNearbyWorkers] = useState<HomePersonalWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── Get user location ────────────────────────────────────────────────────
    useEffect(() => {
        setFetchingLocation(true);
        if (!navigator.geolocation) {
            setLocationError("Geolocation not supported");
            setFetchingLocation(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setFetchingLocation(false);
                console.log("📍 User location:", pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                console.error(err);
                setLocationError("Unable to retrieve your location.");
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    // ── Fetch nearby workers when location ready ─────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetch_ = async () => {
            setLoading(true);
            setError("");
            try {
                console.log("🏠 Fetching nearby home & personal workers...");
                console.log("📡 Params → lat:", userLocation.latitude, "lng:", userLocation.longitude, "range: 10, category: home, sub:", subcategory || "(none)");

                const response = await getNearbyWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    10,
                    "home",
                    subcategory || ""
                );

                const workers = extractWorkers(response);
                console.log("🏠 Final worker count to display:", workers.length);
                setNearbyWorkers(workers);

            } catch (e) {
                console.error("❌ Error fetching workers:", e);
                setError("Failed to load nearby workers");
                setNearbyWorkers([]);
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, [userLocation]);

    // ── Navigation handlers ──────────────────────────────────────────────────
    const handleView = (worker: any) => navigate(`/home-personal-services/worker/${worker._id || worker.id}`);
    const handleAddPost = () =>
        navigate(subcategory ? `/add-home-service-form?subcategory=${subcategory}` : "/add-home-service-form");

    const openDirections = (worker: HomePersonalWorker) => {
        if (worker.latitude && worker.longitude)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${worker.latitude},${worker.longitude}`, "_blank");
        else if (worker.area || worker.city)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([worker.area, worker.city, worker.state].filter(Boolean).join(", "))}`, "_blank");
    };

    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    // ── Dummy cards — always render first ────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ============================================================================
    // WORKER CARD — mirrors RealEstateList card style
    // ============================================================================
    const renderWorkerCard = (worker: HomePersonalWorker) => {
        const id = worker._id || "";
        const location = [worker.area, worker.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (worker.images || []).filter(Boolean) as string[];

        let distance: string | null = null;
        if (userLocation && worker.latitude && worker.longitude) {
            const d = calculateDistance(
                userLocation.latitude, userLocation.longitude,
                worker.latitude, worker.longitude
            );
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(worker)}
            >
                {/* ── Image / Profile ── */}
                <div className="relative h-48 bg-gradient-to-br from-purple-600/5 to-purple-600/10 overflow-hidden">
                    {worker.profilePic ? (
                        <img
                            src={worker.profilePic}
                            alt={worker.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={worker.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">🏠</span>
                        </div>
                    )}

                    {/* Live Data — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-purple-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Charge type — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md bg-purple-500 text-white capitalize">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            Per {worker.chargeType}
                        </span>
                    </div>

                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {worker.name || "Unnamed Worker"}
                    </h2>

                    {worker.subCategory && (
                        <p className="text-sm font-medium text-gray-700">{worker.subCategory}</p>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold text-purple-600 flex items-center gap-1">
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Skill + Charge */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            {worker.skill && (
                                <span className="text-sm text-gray-600 flex items-center gap-1 line-clamp-1">
                                    🛠️ {worker.skill}
                                </span>
                            )}
                        </div>
                        {worker.serviceCharge && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">Per {worker.chargeType}</p>
                                <p className="text-base font-bold text-purple-600">₹{worker.serviceCharge}</p>
                            </div>
                        )}
                    </div>

                    {/* Directions + Call */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(worker); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-purple-600 text-purple-600 rounded-lg font-medium text-sm hover:bg-purple-50 transition-colors"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); worker.phone && openCall(worker.phone); }}
                            disabled={!worker.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${worker.phone
                                ? "bg-purple-600 text-white hover:bg-purple-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Nearby services section ──────────────────────────────────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
                </div>
            );
        }

        if (nearbyWorkers.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🏠</div>
                    <p className="text-gray-500 font-medium">No workers found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">
                        Open console → look for <strong>🔍 FULL RAW RESPONSE (JSON)</strong> to see the exact API response shape
                    </p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-purple-600 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyWorkers.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyWorkers.map(renderWorkerCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER — DUMMY FIRST, API SECOND
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find home services near you</p>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center"
                    >
                        + Add Post
                    </Button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="bg-purple-600/10 border border-purple-600/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-purple-700">Getting your location...</span>
                    </div>
                )}
                {locationError && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg">
                        <p className="text-yellow-700 text-sm">{locationError}</p>
                    </div>
                )}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                )}

                {/* ✅ 1. DUMMY CARDS FIRST */}
                <div className="space-y-4">
                    {renderDummyCards()}
                </div>

                {/* ✅ 2. API DATA SECOND */}
                {userLocation && !fetchingLocation && renderNearbyServices()}

            </div>
        </div>
    );
};

export default HomePersonalServicesList;
