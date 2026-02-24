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
    phoneNumber?: string; // Added phone number field
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
// PHONE POPUP COMPONENT
// ============================================================================
interface PhonePopupProps {
    phoneNumber: string;
    workerName: string;
    onClose: () => void;
}

const PhonePopup: React.FC<PhonePopupProps> = ({ phoneNumber, workerName, onClose }) => {
    const handleCall = () => {
        window.location.href = `tel:${phoneNumber}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(phoneNumber);
        // Optional: Add toast notification here
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-sm w-full transform scale-100 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#00598a] text-white p-4 rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">📞</span>
                        <span className="font-semibold">Contact Worker</span>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors text-xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-[#00598a]/10 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">👷</span>
                    </div>
                    
                    <div>
                        <p className="text-gray-500 text-sm mb-1">Calling</p>
                        <h3 className="text-lg font-bold text-gray-900">{workerName}</h3>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <p className="text-2xl font-mono font-bold text-[#00598a] tracking-wider">
                            {phoneNumber}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-[#00598a] hover:text-[#00598a] transition-all duration-200"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copy
                        </button>
                        <button
                            onClick={handleCall}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-[#00598a] text-white rounded-xl font-medium hover:bg-[#004a70] transition-all duration-200 shadow-lg shadow-[#00598a]/25"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
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

    // Phone popup state
    const [selectedWorker, setSelectedWorker] = useState<PlumberWorker | null>(null);

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
            window.open(`https://www.google.com/maps/dir/?api=1&destination=  ${worker.latitude},${worker.longitude}`, "_blank");
        } else if (worker.area || worker.city) {
            const addr = encodeURIComponent([worker.area, worker.city, worker.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=  ${addr}`, "_blank");
        }
    };

    // ── Phone popup handlers ─────────────────────────────────────────────────
    const handleCallClick = (e: React.MouseEvent, worker: PlumberWorker) => {
        e.stopPropagation();
        setSelectedWorker(worker);
    };

    const closePhonePopup = () => {
        setSelectedWorker(null);
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
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100 group"
                onClick={() => handleView(worker)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-[#00598a]/5 to-[#00598a]/10 overflow-hidden">
                    {worker.profilePic || imageUrls.length > 0 ? (
                        <img
                            src={worker.profilePic || imageUrls[0]}
                            alt={worker.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🔧</span>
                        </div>
                    )}

                    {/* Live Data badge — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-[#00598a] text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Charge type badge — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white text-[#00598a] text-xs font-bold rounded-md shadow-md border border-[#00598a]/20 capitalize">
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
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-[#00598a] transition-colors duration-200">
                        {worker.name || "Unnamed Worker"}
                    </h2>

                    {worker.subCategory && (
                        <span className="inline-flex items-center gap-1.5 w-fit text-xs bg-[#00598a]/10 text-[#00598a] px-3 py-1 rounded-md border border-[#00598a]/20">
                            🔧 {worker.subCategory}
                        </span>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold text-[#00598a] flex items-center gap-1">
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
                                <p className="text-base font-bold text-[#00598a]">₹{worker.serviceCharge}</p>
                            </div>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-3 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(worker); }}
                            className="flex items-center justify-center gap-1.5 px-2 py-2.5 border-2 border-[#00598a] text-[#00598a] rounded-lg font-medium text-xs hover:bg-[#00598a] hover:text-white transition-all duration-200"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={(e) => handleCallClick(e, worker)}
                            className="flex items-center justify-center gap-1.5 px-2 py-2.5 border-2 border-green-600 text-green-600 rounded-lg font-medium text-xs hover:bg-green-600 hover:text-white transition-all duration-200"
                        >
                            <span>📞</span> Call
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); handleView(worker); }}
                            className="flex items-center justify-center gap-1.5 px-2 py-2.5 bg-[#00598a] text-white rounded-lg font-medium text-xs hover:bg-[#004a70] transition-all duration-200"
                        >
                            <span>👁️</span> View
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00598a]" />
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
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-[#00598a] text-white text-sm font-bold rounded-full px-2.5">
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
        <div className="min-h-screen bg-gradient-to-b from-[#00598a]/5 to-white">
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
                        className="w-full sm:w-auto justify-center bg-[#00598a] hover:bg-[#004a70]"
                    >
                        + Add Post
                    </Button>
                </div>

                {/* ── Location status ── */}
                {fetchingLocation && (
                    <div className="bg-[#00598a]/10 border border-[#00598a]/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-[#00598a] border-t-transparent rounded-full" />
                        <span className="text-sm text-[#00598a]">Getting your location...</span>
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

            {/* Phone Popup Modal */}
            {selectedWorker && (
                <PhonePopup
                    phoneNumber={selectedWorker.phoneNumber || "+91 98765 43210"}
                    workerName={selectedWorker.name || "Worker"}
                    onClose={closePhonePopup}
                />
            )}
        </div>
    );
};

export default PlumberServicesList;