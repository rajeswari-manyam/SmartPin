import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

import NearbyChoreographerCard from "../components/cards/Wedding/NearByChoreographer";
import NearbyFlowerDecoration from "../components/cards/Wedding/NearByFlowerDecoration";
import NearbyPanditService from "../components/cards/Wedding/NearByPandit";
import NearbyWeddingBands from "../components/cards/Wedding/NearByWeddingMusic";
import NearbyWeddingPlanner from "../components/cards/Wedding/NearByWeddingPlaners";

import { isWeddingSubcategory, getMainWeddingCategory } from "../utils/SubCategories";
import { getNearbyWeddingWorkers, WeddingWorkerResponse, WeddingWorker } from "../services/Wedding.service";

type CardKey = "wedding-planners" | "poojari" | "music-team" | "flower-decoration" | "sangeet-choreographers";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    "wedding-planners": NearbyWeddingPlanner,
    "poojari": NearbyPanditService,
    "music-team": NearbyWeddingBands,
    "flower-decoration": NearbyFlowerDecoration,
    "sangeet-choreographers": NearbyChoreographerCard,
};

const normalizeSubcategory = (sub: string | undefined): string => {
    if (!sub) return "";
    return sub.toLowerCase().replace(/\//g, "-").replace(/\s+/g, "-");
};

const resolveCardKey = (subcategory?: string): CardKey => {
    const n = normalizeSubcategory(subcategory);
    if (n.includes("planner")) return "wedding-planners";
    if (n.includes("poojari") || n.includes("pandit")) return "poojari";
    if (n.includes("music") || n.includes("band")) return "music-team";
    if (n.includes("flower") || n.includes("decoration")) return "flower-decoration";
    if (n.includes("choreographer") || n.includes("sangeet")) return "sangeet-choreographers";
    return "wedding-planners";
};

const getDisplayTitle = (subcategory: string | undefined) => {
    if (!subcategory) return "All Wedding Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const getCategoryIcon = (subcategory: string | undefined): string => {
    const n = normalizeSubcategory(subcategory);
    if (n.includes("planner")) return "📋";
    if (n.includes("poojari") || n.includes("pandit")) return "🕉️";
    if (n.includes("music") || n.includes("band")) return "🎵";
    if (n.includes("flower") || n.includes("decoration")) return "💐";
    if (n.includes("choreographer") || n.includes("sangeet")) return "💃";
    if (n.includes("catering")) return "🍽️";
    if (n.includes("photography")) return "📸";
    return "💒";
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const WeddingServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyData, setNearbyData] = useState<WeddingWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [distance, setDistance] = useState<number>(10);

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
            (err) => { console.error(err); setLocationError("Unable to retrieve your location."); setFetchingLocation(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    // ── Fetch nearby when location ready ─────────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetch_ = async () => {
            setLoading(true); setError("");
            try {
                console.log("💒 Fetching nearby wedding services...");
                const res: WeddingWorkerResponse = await getNearbyWeddingWorkers(
                    userLocation.latitude, userLocation.longitude, distance
                );
                console.log("💒 API Response:", res);
                console.log("💒 Total records:", res?.data?.length ?? 0);
                if (res?.success && res.data) {
                    const all = Array.isArray(res.data) ? res.data : [res.data];
                    console.log("✅ Displaying", all.length, "services");
                    setNearbyData(all);
                } else { setNearbyData([]); }
            } catch (e) {
                console.error("❌ Error:", e);
                setError("Failed to load nearby services");
                setNearbyData([]);
            } finally { setLoading(false); }
        };
        fetch_();
    }, [userLocation, distance]);

    const handleView = (service: any) => navigate(`/wedding-services/details/${service._id || service.id}`);
    const handleAddPost = () => navigate(subcategory ? `/add-wedding-service-form?subcategory=${subcategory}` : "/add-wedding-service-form");
    const openDirections = (s: WeddingWorker) => {
        if (s.latitude && s.longitude)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${s.latitude},${s.longitude}`, "_blank");
        else if (s.area || s.city)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([s.area, s.city, s.state].filter(Boolean).join(", "))}`, "_blank");
    };

    // ── Inline wedding service card — mirrors RealEstateList ─────────────────
    const renderWeddingCard = (s: WeddingWorker) => {
        const id = s._id || "";
        const location = [s.area, s.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (s.images || []).filter(Boolean) as string[];

        let distance_: string | null = null;
        if (userLocation && s.latitude && s.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, s.latitude, s.longitude);
            distance_ = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(s)}>

                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-pink-600/5 to-pink-600/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img src={imageUrls[0]} alt={s.serviceName || "Service"} className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{getCategoryIcon(subcategory)}</span>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-pink-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>
                    {s.subCategory && (
                        <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md bg-pink-500 text-white">
                                {s.subCategory}
                            </span>
                        </div>
                    )}
                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">{s.serviceName || "Unnamed Service"}</h2>

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance_ && (
                        <p className="text-sm font-semibold text-pink-600 flex items-center gap-1">
                            <span>📍</span> {distance_} away
                        </p>
                    )}

                    {s.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{s.description}</p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex-1" />
                        {s.serviceCharge && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">{s.chargeType || 'Starting at'}</p>
                                <p className="text-base font-bold text-pink-600">₹{Number(s.serviceCharge).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {/* Directions + View */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(s); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-pink-600 text-pink-600 rounded-lg font-medium text-sm hover:bg-pink-50 transition-colors">
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); handleView(s); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm bg-pink-600 text-white hover:bg-pink-700 transition-colors">
                            <span>👁️</span> View
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Dummy cards — always rendered first ──────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── Nearby API section — rendered second ─────────────────────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600" />
                </div>
            );
        }

        if (nearbyData.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">💒</div>
                    <p className="text-gray-500 font-medium">No services found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Try increasing the distance or check back later</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-pink-600 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyData.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyData.map(renderWeddingCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER — DUMMY FIRST, API SECOND
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl sm:text-4xl">{getCategoryIcon(subcategory)}</span>
                        <div>
                            <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                                {getDisplayTitle(subcategory)}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Find the perfect vendors for your special day</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Distance filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600 whitespace-nowrap">Within:</label>
                            <select value={distance} onChange={e => setDistance(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500">
                                <option value={5}>5 km</option>
                                <option value={10}>10 km</option>
                                <option value={20}>20 km</option>
                                <option value={50}>50 km</option>
                                <option value={100}>100 km</option>
                            </select>
                        </div>
                        <Button variant="primary" size="md" onClick={handleAddPost}
                            className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f] text-white">
                            + Add Post
                        </Button>
                    </div>
                </div>

                {/* Status banners */}
                {fetchingLocation && (
                    <div className="bg-pink-600/10 border border-pink-600/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-pink-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-pink-700">Getting your location...</span>
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

export default WeddingServicesList;
