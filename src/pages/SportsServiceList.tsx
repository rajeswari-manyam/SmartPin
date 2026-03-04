import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNearbySportsWorkers, SportsWorker } from "../services/Sports.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

// ── Nearby card components (dummy cards)
import NearbyPlayAreaCard from "../components/cards/Sports/NearByPlayArear";
import NearbySportsCard from "../components/cards/Sports/NearBySports";
import NearbyFitnessCard from "../components/cards/Beauty/NearByFittness";
import NearbyStadiumCard from "../components/cards/Sports/NearByStadium";

// ============================================================================
// SUBCATEGORY → CARD COMPONENT MAP
// ============================================================================
type CardKey = "gym" | "sports" | "play" | "stadium";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    gym: NearbyFitnessCard,
    sports: NearbySportsCard,
    play: NearbyPlayAreaCard,
    stadium: NearbyStadiumCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const getCardKeyFromSubCategory = (subCategory: string | undefined): CardKey => {
    if (!subCategory) return "sports";
    const n = subCategory.toLowerCase();
    if (n.includes("gym") || n.includes("fitness") || n.includes("yoga")) return "gym";
    if (n.includes("stadium") || n.includes("ground")) return "stadium";
    if (n.includes("play") || n.includes("indoor") || n.includes("kids")) return "play";
    return "sports";
};

const getSubCategoryFromUrl = (subcategory: string | undefined): string | undefined => {
    if (!subcategory) return undefined;
    return subcategory
        .split("-")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const normalizeSubCategory = (subCategory: string): string =>
    subCategory.toLowerCase().trim().replace(/\s+/g, " ");

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getServiceIcon = (subCategory?: string): string => {
    if (!subCategory) return "🏃";
    const n = subCategory.toLowerCase();
    if (n.includes("gym") || n.includes("fitness")) return "💪";
    if (n.includes("yoga")) return "🧘";
    if (n.includes("swimming")) return "🏊";
    if (n.includes("cricket")) return "🏏";
    if (n.includes("football") || n.includes("soccer")) return "⚽";
    if (n.includes("basketball")) return "🏀";
    if (n.includes("tennis")) return "🎾";
    if (n.includes("badminton")) return "🏸";
    if (n.includes("stadium") || n.includes("ground")) return "🏟️";
    if (n.includes("play") || n.includes("indoor")) return "🎮";
    return "🏃";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const SportsServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    // ── state ────────────────────────────────────────────────────────────────
    const [nearbyServices, setNearbyServices] = useState<SportsWorker[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // ── Call popup state ─────────────────────────────────────────────────────
    const [callPopup, setCallPopup] = useState<{ name: string; phone: string } | null>(null);

    // ── Get user location first, then fetch ──────────────────────────────────
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
                setLocationError(
                    err.code === 1
                        ? "Location access denied. Please enable location services to see nearby services."
                        : "Unable to retrieve your location."
                );
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
        );
    }, []);

    // ── Fetch nearby when location is ready ──────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetchNearbySports = async () => {
            setLoading(true);
            setError("");
            try {
                console.log("🏃 Fetching nearby sports services...");
                const response = await getNearbySportsWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    10
                );
                console.log("🏃 API Response:", response);

                if (response.success) {
                    const allServices = response.data || [];
                    console.log("✅ Total sports services fetched:", allServices.length);

                    if (subcategory) {
                        const targetSubCategory = getSubCategoryFromUrl(subcategory);
                        if (targetSubCategory) {
                            const normalizedTarget = normalizeSubCategory(targetSubCategory);
                            const filtered = allServices.filter(s =>
                                s.subCategory && normalizeSubCategory(s.subCategory) === normalizedTarget
                            );
                            console.log(`Filtered for ${targetSubCategory}:`, filtered.length);
                            setNearbyServices(filtered);
                        } else {
                            setNearbyServices(allServices);
                        }
                    } else {
                        setNearbyServices(allServices);
                    }
                } else {
                    console.warn("API returned success=false");
                    setNearbyServices([]);
                }
            } catch (err: any) {
                console.error("❌ fetchNearbySports error:", err);
                setError("Failed to load nearby services");
                setNearbyServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNearbySports();
    }, [userLocation, subcategory]);

    // ── navigation handlers ──────────────────────────────────────────────────
    const handleView = (service: any) => {
        const id = service._id || service.id || service;
        console.log("Viewing sports service:", id);
        navigate(`/sports-services/details/${id}`);
    };

    const handleAddPost = () => {
        navigate(subcategory
            ? `/add-sports-service-form?subcategory=${subcategory}`
            : "/add-sports-service-form"
        );
    };

    const openDirections = (service: SportsWorker) => {
        if (service.latitude && service.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`, "_blank");
        } else if (service.area || service.city) {
            const addr = encodeURIComponent(
                [service.area, service.city, service.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    // ── display helpers ──────────────────────────────────────────────────────
    const getDisplayTitle = () =>
        subcategory
            ? subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
            : "All Sports & Fitness Services";

    // ============================================================================
    // REAL API CARD — with hover color #00598a + call popup
    // ============================================================================
    const renderSportsCard = (service: SportsWorker) => {
        const id = service._id || "";
        const location = [service.area, service.city].filter(Boolean).join(", ") || "Location not set";
        const servicesList = service.services || [];
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const icon = getServiceIcon(service.subCategory);

        // Resolve phone number from whichever field your SportsWorker type uses
        const phoneNumber =
            (service as any).phone ||
            (service as any).mobile ||
            (service as any).contact ||
            (service as any).phoneNumber ||
            "Not available";

        let distance: string | null = null;
        if (userLocation && service.latitude && service.longitude) {
            const d = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                service.latitude,
                service.longitude
            );
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                style={{ transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s" }}
                onClick={() => handleView(id)}
                onMouseEnter={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "#00598a";
                    el.style.boxShadow = "0 6px 24px rgba(0,89,138,0.18)";
                    el.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                    const el = e.currentTarget as HTMLDivElement;
                    el.style.borderColor = "#f3f4f6";
                    el.style.boxShadow = "";
                    el.style.transform = "";
                }}
            >
                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600/5 to-blue-600/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.serviceName || "Service"}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{icon}</span>
                        </div>
                    )}

                    {/* Live Data — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Availability — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${service.availability
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {service.availability ? 'Available' : 'Unavailable'}
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
                        {service.serviceName || "Unnamed Service"}
                    </h2>

                    {service.subCategory && (
                        <p className="text-sm font-medium text-gray-700">
                            {icon} {service.subCategory}
                        </p>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: "#00598a" }}>
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Experience + Charge */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            {service.experience && (
                                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    ⭐ {service.experience} yrs exp
                                </span>
                            )}
                            {service.rating && (
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    ⭐ {service.rating}
                                </span>
                            )}
                        </div>
                        {service.serviceCharge && service.chargeType && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">Charge</p>
                                <p className="text-base font-bold" style={{ color: "#00598a" }}>
                                    ₹{service.serviceCharge}/{service.chargeType}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Services Tags */}
                    {servicesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Services</p>
                            <div className="flex flex-wrap gap-1.5">
                                {servicesList.slice(0, 3).map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                                        <span style={{ color: "#00598a" }}>●</span> {s}
                                    </span>
                                ))}
                                {servicesList.length > 3 && (
                                    <span className="text-xs font-medium px-1 py-1" style={{ color: "#00598a" }}>
                                        +{servicesList.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Directions + Call + View — 3-column button row */}
                    <div className="grid grid-cols-3 gap-2 pt-3 mt-1">
                        {/* Directions */}
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(service); }}
                            className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg font-medium text-xs border-2 hover:bg-blue-50 transition-colors"
                            style={{ borderColor: "#00598a", color: "#00598a" }}
                        >
                            <span>📍</span> Directions
                        </button>

                        {/* Call — opens popup */}
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                setCallPopup({
                                    name: service.serviceName || "Service",
                                    phone: phoneNumber,
                                });
                            }}
                            className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg font-medium text-xs text-white transition-colors hover:opacity-90"
                            style={{ backgroundColor: "#22c55e" }}
                        >
                            📞 Call
                        </button>

                        {/* View */}
                        <button
                            onClick={e => { e.stopPropagation(); handleView(id); }}
                            className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg font-medium text-xs text-white transition-colors hover:opacity-90"
                            style={{ backgroundColor: "#00598a" }}
                        >
                            <span>👁️</span> View
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── DUMMY CARDS — always renders first ───────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[getCardKeyFromSubCategory(subcategory)];
        return (
            <CardComponent
                onViewDetails={handleView}
            />
        );
    };

    // ── NEARBY SERVICES SECTION ──────────────────────────────────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            );
        }

        if (nearbyServices.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🏃</div>
                    <p className="text-gray-500 font-medium">No services found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Check browser console for API debug info</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* "Nearby Services" header with count */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span
                        className="inline-flex items-center justify-center min-w-[2rem] h-7 text-white text-sm font-bold rounded-full px-2.5"
                        style={{ backgroundColor: "#00598a" }}
                    >
                        {nearbyServices.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyServices.map(renderSportsCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle()}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find sports services near you</p>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center"
                    >
                        + Attach Sports & Fitness Service
                    </Button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-blue-700">Getting your location...</span>
                    </div>
                )}

                {locationError && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">📍</span>
                            <div>
                                <p className={`${typography.body.small} text-yellow-800 font-semibold mb-1`}>
                                    Location Access Required
                                </p>
                                <p className={`${typography.body.xs} text-yellow-700`}>{locationError}</p>
                            </div>
                        </div>
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

            {/* ── Call Popup Modal ── */}
            {callPopup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setCallPopup(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-6 w-80 flex flex-col items-center gap-4"
                        style={{ animation: "popIn 0.2s ease-out" }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Icon */}
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
                            style={{ backgroundColor: "#e6f2f8" }}
                        >
                            📞
                        </div>

                        {/* Service name */}
                        <div className="text-center">
                            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Call</p>
                            <h3 className="text-lg font-bold text-gray-900 mt-0.5 line-clamp-1">
                                {callPopup.name}
                            </h3>
                        </div>

                        {/* Phone number — tappable link */}
                        <a
                            href={`tel:${callPopup.phone}`}
                            className="w-full py-3.5 rounded-xl text-white text-center text-lg font-bold tracking-wide transition-opacity hover:opacity-90 active:opacity-80"
                            style={{ backgroundColor: "#00598a" }}
                        >
                            {callPopup.phone}
                        </a>

                        {/* Cancel */}
                        <button
                            onClick={() => setCallPopup(null)}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
                        >
                            Cancel
                        </button>
                    </div>

                    {/* Pop-in animation */}
                    <style>{`
                        @keyframes popIn {
                            from { opacity: 0; transform: scale(0.92); }
                            to   { opacity: 1; transform: scale(1); }
                        }
                    `}</style>
                </div>
            )}
        </div>
    );
};

export default SportsServicesList;