import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyWorkers } from "../services/api.service";

// ── Nearby card components with dummy data ───────────────────────────────────
import NearByPlumbarsCard from "../components/cards/Plumbers/NearByPlumbars";
import NearByElectricianCard from "../components/cards/Plumbers/NearByElectricianCard";
import NearByPaintersCard from "../components/cards/Plumbers/NearByPaintersCard";
import NearByCarpenterCard from "../components/cards/Plumbers/NearByCarpenterCard";
import NearByAcServiceCard from "../components/cards/Plumbers/NearByAcService";
import NearByFridgeRepairCard from "../components/cards/Plumbers/NearByFridgeRepair";
import NearByWashingMachineRepairCard from "../components/cards/Plumbers/NearByWashingMachineRepair";
import NearByGasRepairServiceCard from "../components/cards/Plumbers/NearByGasRepairServiceCard";
import NearByWaterPurifierCard from "../components/cards/Plumbers/NearByWaterPurifier";
import NearBySolarServiceCard from "../components/cards/Plumbers/NearBySolarService";

// ============================================================================
// WORKER INTERFACE
// ============================================================================
export interface PlumberWorker {
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
type CardKey =
    | "plumber" | "electrician" | "painter" | "carpenter"
    | "ac" | "fridge" | "washing" | "gas" | "ro" | "solar";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    plumber: NearByPlumbarsCard,
    electrician: NearByElectricianCard,
    painter: NearByPaintersCard,
    carpenter: NearByCarpenterCard,
    ac: NearByAcServiceCard,
    fridge: NearByFridgeRepairCard,
    washing: NearByWashingMachineRepairCard,
    gas: NearByGasRepairServiceCard,
    ro: NearByWaterPurifierCard,
    solar: NearBySolarServiceCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("electrician") || n === "electrical") return "electrician";
    if (n.includes("painter") || n.includes("painting")) return "painter";
    if (n.includes("carpenter")) return "carpenter";
    if ((n.includes("ac") && n.includes("repair")) || n === "ac-repair" || n === "ac-service") return "ac";
    if (n.includes("fridge") || n.includes("refrigerator")) return "fridge";
    if (n.includes("washing") && n.includes("machine")) return "washing";
    if (n.includes("gas") && n.includes("stove")) return "gas";
    if (n.includes("water") && n.includes("purifier") || n.includes("ro")) return "ro";
    if (n.includes("solar")) return "solar";
    return "plumber"; // default
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Plumber & Home Repair Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const PlumberServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyWorkers, setNearbyWorkers] = useState<PlumberWorker[]>([]);
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
        const fetchWorkers = async () => {
            setLoading(true);
            setError("");
            try {
                console.log("🔧 Fetching nearby plumber workers...");
                const response = await getNearbyWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    10,
                    "plumber",
                    subcategory || ""
                );
                console.log("🔧 API Response:", response);
                if (response?.success && response.workers) {
                    console.log("✅ Workers found:", response.workers.length);
                    setNearbyWorkers(response.workers);
                } else {
                    setNearbyWorkers([]);
                }
            } catch (e) {
                console.error("❌ Error fetching workers:", e);
                setError("Failed to load nearby workers");
                setNearbyWorkers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, [userLocation, subcategory]);

    // ── Navigation ───────────────────────────────────────────────────────────
    const handleView = (worker: any) => {
        const id = worker._id || worker.id;
        navigate(`/plumber-services/worker/${id}`);
    };

    const handleAddPost = () => {
        navigate(subcategory ? `/add-plumber-service-form?subcategory=${subcategory}` : "/add-plumber-service-form");
    };

    const openDirections = (worker: PlumberWorker) => {
        if (worker.latitude && worker.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${worker.latitude},${worker.longitude}`, "_blank");
        } else if (worker.area || worker.city) {
            const addr = encodeURIComponent([worker.area, worker.city, worker.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    // ── Render single worker card (matches RealEstate card style) ────────────
    const renderWorkerCard = (worker: PlumberWorker) => {
        const id = worker._id || "";
        const location = [worker.area, worker.city, worker.state].filter(Boolean).join(", ") || "Location not set";

        let distance: string | null = null;
        if (userLocation && worker.latitude && worker.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, worker.latitude, worker.longitude);
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        const imageUrls = (worker.images || []).filter(Boolean) as string[];

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(worker)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600/5 to-blue-600/10 overflow-hidden">
                    {worker.profilePic || imageUrls.length > 0 ? (
                        <img
                            src={worker.profilePic || imageUrls[0]}
                            alt={worker.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">🔧</span>
                        </div>
                    )}

                    {/* Live Data badge — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Charge type badge — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-blue-700 text-xs font-bold rounded-md shadow-md border border-blue-100 capitalize">
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
                        <span className="inline-flex items-center gap-1.5 w-fit text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-md border border-blue-100">
                            🔧 {worker.subCategory}
                        </span>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {worker.skill && (
                        <p className="text-sm text-gray-600 line-clamp-2">🛠️ {worker.skill}</p>
                    )}

                    {/* Charge info */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500">Charge Type</p>
                            <p className="text-sm font-semibold text-gray-900 capitalize">
                                Per {worker.chargeType}
                            </p>
                        </div>
                        {worker.serviceCharge && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase tracking-wide">Charges</p>
                                <p className="text-base font-bold text-green-600">₹{worker.serviceCharge}</p>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(worker); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); handleView(worker); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                        >
                            <span>👁️</span> View Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Dummy cards — always shown first ─────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── API nearby workers — shown second ────────────────────────────────────
    const renderNearbyWorkers = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            );
        }

        if (nearbyWorkers.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🔧</div>
                    <p className="text-gray-500 font-medium">No workers found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Check browser console for API debug info</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Header with count — mirrors RealEstate style */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Workers</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-blue-600 text-white text-sm font-bold rounded-full px-2.5">
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
        <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find service workers near you</p>
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

                {/* ── Location status ── */}
                {fetchingLocation && (
                    <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-blue-700">Getting your location...</span>
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

                {/* ✅ 1. DUMMY CARDS FIRST — always visible */}
                <div className="space-y-4">
                    {renderDummyCards()}
                </div>

                {/* ✅ 2. API DATA SECOND — only after location is ready */}
                {userLocation && !fetchingLocation && renderNearbyWorkers()}

            </div>
        </div>
    );
};

export default PlumberServicesList;
