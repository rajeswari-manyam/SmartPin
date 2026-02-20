import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyCreativeArtWorkers, CreativeArtWorker } from "../services/Creative.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import CraftBusinessCard from "../components/cards/Art Service/NearByCraft";
import CaricatureArtistListing from "../components/cards/Art Service/NearByCaricature";
import PainterListing from "../components/cards/Art Service/NearByPrinter";
import WallMuralListing from "../components/cards/Art Service/NearByWallMural";
import NearByHandMadeGifts from "../components/cards/Art Service/NearByHandMadeGifts";

// ============================================================================
// CARD MAP
// ============================================================================
type CardKey = "craft" | "caricature" | "painting" | "mural" | "gift";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    craft: CraftBusinessCard,
    caricature: CaricatureArtistListing,
    painting: PainterListing,
    mural: WallMuralListing,
    gift: NearByHandMadeGifts,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("craft")) return "craft";
    if (n.includes("caricature")) return "caricature";
    if (n.includes("painting") || n.includes("painter")) return "painting";
    if (n.includes("mural") || n.includes("wall")) return "mural";
    if (n.includes("gift") || n.includes("handmade")) return "gift";
    return "craft"; // default
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Creative & Art Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getCategoryIcon = (subcategory?: string): string => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("caricature")) return "🎨";
    if (n.includes("painting") || n.includes("painter")) return "🖌️";
    if (n.includes("mural") || n.includes("wall")) return "🖼️";
    if (n.includes("gift") || n.includes("handmade")) return "🎁";
    if (n.includes("craft")) return "✂️";
    return "🎨";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const ArtServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyArts, setNearbyArts] = useState<CreativeArtWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── Get user location ─────────────────────────────────────────────────────
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
        const fetchNearby = async () => {
            setLoading(true); setError("");
            try {
                console.log("🎨 Fetching nearby art services...");
                const res = await getNearbyCreativeArtWorkers(userLocation.latitude, userLocation.longitude, 10);
                console.log("🎨 API Response:", res);
                if (res?.success && res.data) {
                    const all = Array.isArray(res.data) ? res.data : [res.data];
                    console.log("✅ Displaying", all.length, "art services");
                    setNearbyArts(all);
                } else { setNearbyArts([]); }
            } catch (e) {
                console.error("❌ Error:", e);
                setError("Failed to load nearby art services");
                setNearbyArts([]);
            } finally { setLoading(false); }
        };
        fetchNearby();
    }, [userLocation]); // ✅ no subcategory filter — matches RealEstate

    const handleView = (art: any) => navigate(`/art-services/details/${art._id || art.id}`);
    const handleAddPost = () => navigate(subcategory ? `/add-art-service-form?subcategory=${subcategory}` : "/add-art-service-form");
    const openDirections = (art: CreativeArtWorker) => {
        if (art.latitude && art.longitude) window.open(`https://www.google.com/maps/dir/?api=1&destination=${art.latitude},${art.longitude}`, "_blank");
        else if (art.area || art.city) window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([art.area, art.city, art.state].filter(Boolean).join(", "))}`, "_blank");
    };
    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    // ============================================================================
    // REAL API CARD — matches RealEstate card style exactly
    // ============================================================================
    const renderArtCard = (art: CreativeArtWorker) => {
        const id = art._id || "";
        const location = [art.area, art.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (art.images || []).filter(Boolean) as string[];
        const icon = getCategoryIcon(art.subCategory || art.category);

        let distance: string | null = null;
        if (userLocation && art.latitude && art.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, art.latitude, art.longitude);
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(art)}>

                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-amber-600/5 to-amber-600/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img src={imageUrls[0]} alt={art.name || "Art Service"} className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{icon}</span>
                        </div>
                    )}

                    {/* Live Data — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-amber-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Availability — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${art.availability !== false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {art.availability !== false ? 'Available' : 'Busy'}
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
                        {art.name || "Unnamed Service"}
                    </h2>

                    {(art.subCategory || art.category) && (
                        <p className="text-sm font-medium text-gray-700">
                            {icon} {art.subCategory || art.category}
                        </p>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold text-amber-600 flex items-center gap-1">
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Charge row — mirrors RealEstate bedrooms+price row */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            {art.experience != null && (
                                <span className="text-sm font-semibold text-gray-700">📅 {art.experience} yrs exp</span>
                            )}
                            {art.rating && (
                                <span className="text-sm text-gray-600">⭐ {art.rating}</span>
                            )}
                        </div>
                        {art.serviceCharge != null && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">{art.chargeType || 'Charge'}</p>
                                <p className="text-base font-bold text-amber-600">₹{art.serviceCharge}</p>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {art.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{art.description}</p>
                    )}

                    {/* Directions + Call — matches RealEstate button row */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(art); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-amber-600 text-amber-600 rounded-lg font-medium text-sm hover:bg-amber-50 transition-colors">
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); art.phone && openCall(art.phone); }}
                            disabled={!art.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${art.phone ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── DUMMY CARDS — always renders first (matches RealEstate) ──────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── NEARBY SERVICES — renders second (matches RealEstate) ────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
                </div>
            );
        }
        if (nearbyArts.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🎨</div>
                    <p className="text-gray-500 font-medium">No art services found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Check browser console for API debug info</p>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-amber-600 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyArts.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyArts.map(renderArtCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER — DUMMY FIRST, API SECOND (matches RealEstate exactly)
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find creative & art services near you</p>
                    </div>
                    <Button variant="primary" size="md" onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f]">
                        + Add Listing
                    </Button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-amber-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-amber-700">Getting your location...</span>
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

export default ArtServicesList;
