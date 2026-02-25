import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getNearbyLabourWorkers,
    LabourWorker,
} from "../services/DailyWage.service";
import Button from "../components/ui/Buttons";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbyWorkersCard from "../components/cards/DailyWages/NearByLoadingWorkers";
import NearbyCleaningScreen from "../components/cards/DailyWages/NearByCleaning";
import NearbyConstructionScreen from "../components/cards/DailyWages/NearByConstructionScreen";
import WashmanScreen from "../components/cards/DailyWages/NearByWashman";

// ============================================================================
// SUBCATEGORY → CARD MAP
// ============================================================================
type CardKey = "loading" | "cleaning" | "construction" | "watchmen";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    loading: NearbyWorkersCard,
    cleaning: NearbyCleaningScreen,
    construction: NearbyConstructionScreen,
    watchmen: WashmanScreen,
};

// ── Brand color ──────────────────────────────────────────────────────────────
const BRAND = "#00598a";
const BRAND_DARK = "#004a73";

// ============================================================================
// HELPERS
// ============================================================================
const normalize = (s?: string) => (s || "").toLowerCase();

const resolveCardKey = (subcategory?: string): CardKey => {
    const n = normalize(subcategory);
    if (n.includes("clean")) return "cleaning";
    if (n.includes("construct") || n.includes("mason") || n.includes("carpenter")) return "construction";
    if (n.includes("watch") || n.includes("security") || n.includes("guard")) return "watchmen";
    return "loading";
};

const titleFromSlug = (slug?: string) =>
    slug
        ? slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "All Daily Wage Workers";

const getIcon = (subcategory?: string) => {
    const n = normalize(subcategory);
    if (n.includes("clean")) return "🧹";
    if (n.includes("construct")) return "🏗️";
    if (n.includes("watch") || n.includes("guard")) return "💂";
    if (n.includes("garden")) return "🌿";
    if (n.includes("event")) return "🎪";
    return "👷";
};

const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const DailyWagesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyWorkers, setNearbyWorkers] = useState<LabourWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── hover state trackers ─────────────────────────────────────────────────
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [hoveredDir, setHoveredDir] = useState<string | null>(null);
    const [hoveredCall, setHoveredCall] = useState<string | null>(null);

    // ── phone popup ──────────────────────────────────────────────────────────
    const [phonePopup, setPhonePopup] = useState<{ name: string; phone: string } | null>(null);

    // ── Get user location ────────────────────────────────────────────────────
    useEffect(() => {
        setFetchingLocation(true);
        setLocationError("");

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            setFetchingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
                setFetchingLocation(false);
            },
            (err) => {
                console.error("Location error:", err);
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
                const res = await getNearbyLabourWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    10
                );

                if (res?.success && res.data) {
                    let data: LabourWorker[] = Array.isArray(res.data) ? res.data : [];

                    if (subcategory) {
                        const target = titleFromSlug(subcategory).toLowerCase();
                        data = data.filter((w: LabourWorker) =>
                            (w.subCategory && w.subCategory.toLowerCase().includes(target)) ||
                            (w.category && w.category.toLowerCase().includes(target))
                        );
                    }

                    setNearbyWorkers(data);
                } else {
                    setNearbyWorkers([]);
                }
            } catch (err) {
                console.error(err);
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
        navigate(`/daily-wages/details/${worker._id || worker.id}`);
    };

    const handleAddPost = () => {
        navigate(
            subcategory
                ? `/add-daily-wage-service-form?subcategory=${subcategory}`
                : "/add-daily-wage-service-form"
        );
    };

    const openDirections = (worker: LabourWorker) => {
        if (worker.latitude && worker.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${worker.latitude},${worker.longitude}`,
                "_blank"
            );
        } else if (worker.area || worker.city) {
            const addr = encodeURIComponent(
                [worker.area, worker.city, worker.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const openCall = (name: string, phone: string) => {
        setPhonePopup({ name, phone });
    };

    // ============================================================================
    // REAL API CARD
    // ============================================================================
    const renderWorkerCard = (worker: LabourWorker) => {
        const id = worker._id || "";
        const location = [worker.area, worker.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (worker.images || []).filter(Boolean) as string[];
        const skillsList: string[] = Array.isArray(worker.services) ? worker.services : [];

        let distance: string | null = null;
        if (userLocation && worker.latitude && worker.longitude) {
            const dist = calculateDistance(
                userLocation.latitude, userLocation.longitude,
                worker.latitude, worker.longitude
            );
            distance = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
        }

        const isCardHovered = hoveredCard === id;
        const isDirHovered = hoveredDir === id;
        const isCallHovered = hoveredCall === id;
        const workerName = worker.name || worker.subCategory || "Daily Wage Worker";

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer transition-all duration-200"
                style={{
                    border: `1px solid ${isCardHovered ? BRAND : "#f3f4f6"}`,
                    boxShadow: isCardHovered
                        ? `0 8px 25px -5px ${BRAND}40`
                        : "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                }}
                onClick={() => handleView(worker)}
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                {/* ── Image ── */}
                <div
                    className="relative h-48 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${BRAND}10, ${BRAND}1a)` }}
                >
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={workerName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{getIcon(subcategory || worker.subCategory)}</span>
                        </div>
                    )}

                    {/* Live Data badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span
                            className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md"
                            style={{ backgroundColor: BRAND }}
                        >
                            Live Data
                        </span>
                    </div>

                    {/* Availability */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${
                            worker.availability ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {worker.availability ? "Available" : "Busy"}
                        </span>
                    </div>

                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 leading-tight">
                        {workerName}
                    </h2>

                    <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 text-sm mt-0.5 flex-shrink-0">📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {distance && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: BRAND }}>
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {worker.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {worker.description}
                        </p>
                    )}

                    {worker.subCategory && (
                        <div className="pt-1">
                            <span
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border font-medium"
                                style={{
                                    backgroundColor: `${BRAND}12`,
                                    color: BRAND,
                                    borderColor: `${BRAND}40`,
                                }}
                            >
                                👷 {worker.subCategory}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center justify-between pt-0.5">
                        {worker.experience ? (
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                ⭐ {worker.experience} yrs exp
                            </span>
                        ) : <span />}
                        {worker.dailyWage && (
                            <div className="text-right">
                                <span className="text-sm font-bold" style={{ color: BRAND }}>
                                    ₹{worker.dailyWage}
                                </span>
                                {worker.chargeType && (
                                    <span className="text-xs text-gray-500 ml-1">/ {worker.chargeType}</span>
                                )}
                            </div>
                        )}
                    </div>

                    {skillsList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 mt-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills</p>
                            <div className="flex flex-wrap gap-1.5">
                                {skillsList.slice(0, 3).map((s, idx) => (
                                    <span
                                        key={`${id}-${idx}`}
                                        className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200"
                                    >
                                        {s}
                                    </span>
                                ))}
                                {skillsList.length > 3 && (
                                    <span className="text-xs font-medium px-1 py-1" style={{ color: BRAND }}>
                                        +{skillsList.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── CTA Buttons ── */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        {/* Directions — outlined, fills on hover */}
                        <button
                            onClick={(e) => { e.stopPropagation(); openDirections(worker); }}
                            onMouseEnter={() => setHoveredDir(id)}
                            onMouseLeave={() => setHoveredDir(null)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150"
                            style={{
                                border: `2px solid ${BRAND}`,
                                color: isDirHovered ? "#fff" : BRAND,
                                backgroundColor: isDirHovered ? BRAND : "transparent",
                            }}
                        >
                            <span>📍</span> Directions
                        </button>

                        {/* Call — solid, opens popup */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                worker.phone && openCall(workerName, worker.phone);
                            }}
                            onMouseEnter={() => setHoveredCall(id)}
                            onMouseLeave={() => setHoveredCall(null)}
                            disabled={!worker.phone}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150"
                            style={
                                worker.phone
                                    ? {
                                        backgroundColor: isCallHovered ? BRAND_DARK : BRAND,
                                        color: "#fff",
                                        cursor: "pointer",
                                    }
                                    : {
                                        backgroundColor: "#d1d5db",
                                        color: "#6b7280",
                                        cursor: "not-allowed",
                                    }
                            }
                        >
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Dummy Cards ──────────────────────────────────────────────────────────
    const renderCardsSection = () => {
        const Card = CARD_MAP[resolveCardKey(subcategory)];
        return (
            <div>
                <Card onViewDetails={handleView} userLocation={userLocation} />
            </div>
        );
    };

    // ── Real Workers Section ─────────────────────────────────────────────────
    const renderYourWorkers = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div
                        className="animate-spin rounded-full h-8 w-8 border-b-2"
                        style={{ borderColor: BRAND }}
                    />
                </div>
            );
        }

        if (nearbyWorkers.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">👷</div>
                    <p className="text-gray-500">No workers found in your area.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Workers</h2>
                    <span
                        className="inline-flex items-center justify-center min-w-[2rem] h-7 text-white text-sm font-bold rounded-full px-2.5"
                        style={{ backgroundColor: BRAND }}
                    >
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
    // MAIN RENDER
    // ============================================================================
    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {titleFromSlug(subcategory)}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Manage daily wage workers</p>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleAddPost}
                            className="w-full sm:w-auto justify-center bg-[#00598a] hover:bg-[#e08a0f] text-white"
                        >
                            + Add Worker
                        </Button>
                    </div>

                    {/* Location status */}
                    {fetchingLocation && (
                        <div
                            className="rounded-lg p-3 flex items-center gap-2 border"
                            style={{
                                backgroundColor: `${BRAND}15`,
                                borderColor: `${BRAND}30`,
                            }}
                        >
                            <div
                                className="animate-spin h-4 w-4 rounded-full border-2"
                                style={{ borderColor: BRAND, borderTopColor: "transparent" }}
                            />
                            <span className="text-sm font-medium" style={{ color: BRAND }}>
                                Getting your location...
                            </span>
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

                    {/* Dummy Cards always first */}
                    {renderCardsSection()}

                    {/* Real API Workers second */}
                    {userLocation && !fetchingLocation && renderYourWorkers()}

                </div>
            </div>

            {/* ── Phone Popup Modal ── */}
            {phonePopup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                    onClick={() => setPhonePopup(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="px-6 pt-6 pb-4 text-center"
                            style={{ borderBottom: "1px solid #f3f4f6" }}
                        >
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                                style={{ backgroundColor: `${BRAND}15` }}
                            >
                                📞
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{phonePopup.name}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Daily Wage Worker</p>
                        </div>

                        {/* Phone number */}
                        <div className="px-6 py-5 text-center">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                Phone Number
                            </p>
                            <a
                                href={`tel:${phonePopup.phone}`}
                                className="text-3xl font-bold tracking-wide transition-colors"
                                style={{ color: BRAND }}
                            >
                                {phonePopup.phone}
                            </a>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
                            <button
                                onClick={() => setPhonePopup(null)}
                                className="px-4 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <a
                                href={`tel:${phonePopup.phone}`}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white text-sm transition-colors"
                                style={{ backgroundColor: BRAND }}
                                onClick={() => setPhonePopup(null)}
                            >
                                <span>📞</span> Call Now
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DailyWagesList;