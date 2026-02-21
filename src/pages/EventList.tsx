import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyEventWorkers, EventWorker } from "../services/EventWorker.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbyPartyDecorationCard from "../components/cards/Events/NearByPartyDecoration";
import NearbyMandapCard from "../components/cards/Events/NearMandapDecoration";
import NearbyDJCard from "../components/cards/Events/NearByDj";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

// ── Build a proper absolute image URL from a raw backend path ────────────────
const buildImageUrl = (path: string): string => {
    if (!path) return "";
    // Already a full URL — return as-is
    if (/^(https?:\/\/|blob:|data:)/i.test(path)) return path;
    // Normalise Windows backslashes and strip leading slash
    const clean = path.replace(/\\/g, "/").replace(/^\//, "");
    // Strip trailing slash from base to avoid double-slash
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    const url = `${base}/${clean}`;
    console.log("🖼️ Image URL built:", path, "=>", url);
    return url;
};

const getImageUrls = (images?: string[]): string[] => {
    if (!images || images.length === 0) return [];
    const urls = images.map(buildImageUrl).filter(Boolean);
    console.log("🖼️ All image URLs:", urls);
    return urls;
};

// ============================================================================
// CARD MAP
// ============================================================================
type CardKey = "party" | "mandap" | "dj";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    party: NearbyPartyDecorationCard,
    mandap: NearbyMandapCard,
    dj: NearbyDJCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("mandap") || (n.includes("wedding") && n.includes("decor"))) return "mandap";
    if (n.includes("dj") || n.includes("disc") || n.includes("jockey")) return "dj";
    return "party";
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Event Services";
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

const extractEventWorkers = (response: any): EventWorker[] => {
    if (!response) return [];
    console.log("🔍 FULL RAW RESPONSE:", response);
    const candidates = [
        response.data,
        response.workers,
        response.data?.data,
        response.data?.workers,
        response.result,
        response.results,
        response.data?.result,
        response.nearbyServices,
        response.services,
    ];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            console.log(`✅ Event workers found — count: ${candidate.length}`);
            return candidate as EventWorker[];
        }
        if (candidate && typeof candidate === "object" && !Array.isArray(candidate) && candidate._id) {
            return [candidate] as EventWorker[];
        }
    }
    console.warn("⚠️ Could not extract event workers. Keys:", Object.keys(response));
    return [];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const EventServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyEventWorkers, setNearbyEventWorkers] = useState<EventWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── Get user location ────────────────────────────────────────────────────
    useEffect(() => {
        setFetchingLocation(true);
        if (!navigator.geolocation) { setLocationError("Geolocation not supported"); setFetchingLocation(false); return; }
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

    // ── Fetch nearby when location ready ─────────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetch_ = async () => {
            setLoading(true); setError("");
            try {
                console.log("🎉 Fetching nearby event services...");
                const response = await getNearbyEventWorkers(userLocation.latitude, userLocation.longitude, 10);
                console.log("🎉 API Response:", response);
                const workers = extractEventWorkers(response);
                console.log("🎉 Final count:", workers.length);
                setNearbyEventWorkers(workers);
            } catch (e) {
                console.error("❌ Error:", e);
                setError("Failed to load nearby event services");
                setNearbyEventWorkers([]);
            } finally { setLoading(false); }
        };
        fetch_();
    }, [userLocation]);

    // ── Navigation handlers ──────────────────────────────────────────────────
    const handleView = (event: any) => navigate(`/event-services/details/${event._id || event.id}`);
    const handleAddPost = () =>
        navigate(subcategory ? `/add-event-service-form?subcategory=${subcategory}` : "/add-event-service-form");
    const openDirections = (event: EventWorker) => {
        if (event.latitude && event.longitude)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`, "_blank");
        else if (event.area || event.city)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([event.area, event.city, event.state].filter(Boolean).join(", "))}`, "_blank");
    };
    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    // ── Dummy cards — always render first ────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ============================================================================
    // EVENT WORKER CARD
    // ============================================================================
    const renderEventWorkerCard = (event: EventWorker) => {
        const id = event._id || "";
        const location = [event.area, event.city].filter(Boolean).join(", ") || "Location not set";

        // ✅ Build proper absolute URLs for every image path
        const imageUrls = getImageUrls(event.images);

        const services = event.services || [];

        let distance: string | null = null;
        if (userLocation && event.latitude && event.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, event.latitude, event.longitude);
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(event)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 overflow-hidden bg-gray-100">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={event.name || "Event Service"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100"><span style="font-size:3rem">🎉</span></div>`;
                                }
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
                            <span className="text-5xl">🎉</span>
                        </div>
                    )}

                    {/* Live Data — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-purple-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Availability — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${event.availability ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {event.availability ? "Available" : "Busy"}
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
                        {event.name || "Unnamed Service"}
                    </h2>

                    {event.category && (
                        <p className="text-sm font-medium text-gray-700">{event.category}</p>
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

                    {/* Experience + Charge */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            {event.experience && (
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    🎉 {event.experience} yrs exp
                                </span>
                            )}
                        </div>
                        {event.serviceCharge && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">{event.chargeType || "Charge"}</p>
                                <p className="text-base font-bold text-purple-600">₹{event.serviceCharge}</p>
                            </div>
                        )}
                    </div>

                    {/* Services offered */}
                    {services.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Services</p>
                            <div className="flex flex-wrap gap-1.5">
                                {services.slice(0, 3).map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                                        <span className="text-purple-500">●</span> {s}
                                    </span>
                                ))}
                                {services.length > 3 && (
                                    <span className="text-xs text-purple-600 font-medium px-1 py-1">+{services.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Directions + Call */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(event); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-purple-600 text-purple-600 rounded-lg font-medium text-sm hover:bg-purple-50 transition-colors"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); event.phone && openCall(event.phone); }}
                            disabled={!event.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${event.phone
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

        if (nearbyEventWorkers.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🎉</div>
                    <p className="text-gray-500 font-medium">No event services found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Check browser console for API debug info</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-purple-600 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyEventWorkers.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyEventWorkers.map(renderEventWorkerCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
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
                        <p className="text-sm text-gray-500 mt-1">Find event services near you</p>
                    </div>
                    <Button variant="primary" size="md" onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#00598a] hover:bg-[#e08a0f] text-white">
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

                {/* 1. DUMMY CARDS FIRST */}
                <div className="space-y-4">
                    {renderDummyCards()}
                </div>

                {/* 2. API DATA SECOND */}
                {userLocation && !fetchingLocation && renderNearbyServices()}

            </div>
        </div>
    );
};

export default EventServicesList;
