import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyRealEstates, RealEstateWorker } from "../services/RealEstate.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbyPropertyDealersCard from "../components/cards/RealEstate/NearProperty";
import NearbyBuildersCard from "../components/cards/RealEstate/NearByBuilders";
import NearbyInteriorDesignersCard from "../components/cards/RealEstate/NearByInteriorDesigns";
import NearbyRentLeaseCard from "../components/cards/RealEstate/NearByrental";
import NearbyConstructionContractorsCard from "../components/cards/RealEstate/NearByConstructorContractors";

// ============================================================================
// CARD MAP
// ============================================================================
type CardKey = "property" | "builder" | "interior" | "rental" | "construction";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    property: NearbyPropertyDealersCard,
    builder: NearbyBuildersCard,
    interior: NearbyInteriorDesignersCard,
    rental: NearbyRentLeaseCard,
    construction: NearbyConstructionContractorsCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("property") && (n.includes("dealer") || n.includes("agent"))) return "property";
    if (n.includes("builder")) return "builder";
    if (n.includes("interior") || n.includes("design")) return "interior";
    if (n.includes("rent") || n.includes("lease") || n.includes("rental")) return "rental";
    if (n.includes("construction") || n.includes("contractor")) return "construction";
    return "property"; // default
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Real Estate Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const RealEstateList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyRealEstates, setNearbyRealEstates] = useState<RealEstateWorker[]>([]);
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
                console.log("🏠 Fetching nearby real estates...");
                // GET /getNearbyRealEstates?latitude=X&longitude=Y&range=10
                const res = await getNearbyRealEstates(userLocation.latitude, userLocation.longitude, 10);
                console.log("🏠 API Response:", res);
                console.log("🏠 Total records:", res?.data ? (Array.isArray(res.data) ? res.data.length : 1) : 0);
                if (res?.success && res.data) {
                    const all = Array.isArray(res.data) ? res.data : [res.data];
                    console.log("✅ Displaying", all.length, "properties");
                    setNearbyRealEstates(all);
                } else { setNearbyRealEstates([]); }
            } catch (e) {
                console.error("❌ Error:", e);
                setError("Failed to load nearby properties");
                setNearbyRealEstates([]);
            } finally { setLoading(false); }
        };
        fetch_();
    }, [userLocation]); // ✅ no subcategory filter

    const handleView = (re: any) => navigate(`/real-estate/details/${re._id || re.id}`);
    const handleAddPost = () => navigate(subcategory ? `/add-real-estate-form?subcategory=${subcategory}` : "/add-real-estate-form");
    const openDirections = (re: RealEstateWorker) => {
        if (re.latitude && re.longitude) window.open(`https://www.google.com/maps/dir/?api=1&destination=${re.latitude},${re.longitude}`, "_blank");
        else if (re.area || re.city) window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([re.address, re.area, re.city, re.state].filter(Boolean).join(", "))}`, "_blank");
    };
    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    // ============================================================================
    // REAL API CARD — matches courier screenshot style
    // ============================================================================
    const renderRealEstateCard = (re: RealEstateWorker) => {
        const id = re._id || "";
        const location = [re.area, re.city].filter(Boolean).join(", ") || "Location not set";
        const amenitiesList: string[] = typeof re.amenities === 'string'
            ? re.amenities.split(',').map(a => a.trim()).filter(Boolean)
            : Array.isArray(re.amenities) ? re.amenities : [];
        const imageUrls = (re.images || []).filter(Boolean) as string[];

        let distance: string | null = null;
        if (userLocation && re.latitude && re.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, re.latitude, re.longitude);
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(re)}>

                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-green-600/5 to-green-600/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img src={imageUrls[0]} alt={re.name || "Property"} className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">🏠</span>
                        </div>
                    )}

                    {/* Live Data — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-green-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Availability — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${re.availabilityStatus === 'Available'
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {re.availabilityStatus || 'Available'}
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
                        {re.propertyType} — {re.listingType}
                    </h2>

                    {re.name && <p className="text-sm font-medium text-gray-700">{re.name}</p>}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold text-green-600 flex items-center gap-1">
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Bedrooms + Area + Price */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            {re.bedrooms > 0 && (
                                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">🛏️ {re.bedrooms} BHK</span>
                            )}
                            {re.areaSize && (
                                <span className="text-sm text-gray-600 flex items-center gap-1">📏 {re.areaSize} sq ft</span>
                            )}
                        </div>
                        {re.price && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">{re.listingType}</p>
                                <p className="text-base font-bold text-green-600">₹{Number(re.price).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    {amenitiesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Amenities</p>
                            <div className="flex flex-wrap gap-1.5">
                                {amenitiesList.slice(0, 3).map((a, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                                        <span className="text-green-500">●</span> {a}
                                    </span>
                                ))}
                                {amenitiesList.length > 3 && <span className="text-xs text-green-600 font-medium px-1 py-1">+{amenitiesList.length - 3} more</span>}
                            </div>
                        </div>
                    )}

                    {/* Directions + Call */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(re); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-green-600 text-green-600 rounded-lg font-medium text-sm hover:bg-green-50 transition-colors">
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); re.phone && openCall(re.phone); }}
                            disabled={!re.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${re.phone ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}>
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── DUMMY CARDS — always renders first ───────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── NEARBY SERVICES SECTION — renders second ─────────────────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
                </div>
            );
        }

        if (nearbyRealEstates.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🏠</div>
                    <p className="text-gray-500 font-medium">No properties found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Check browser console for API debug info</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* "Nearby Services" header with count — mirrors courier screenshot */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-green-600 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyRealEstates.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyRealEstates.map(renderRealEstateCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER — DUMMY FIRST, API SECOND
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find properties near you</p>
                    </div>
                    <Button variant="primary" size="md" onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f] text-white">
                        + Add Listing
                    </Button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="bg-green-600/10 border border-green-600/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-green-700">Getting your location...</span>
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

export default RealEstateList;
