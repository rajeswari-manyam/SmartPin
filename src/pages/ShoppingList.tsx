import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNearbyShoppingStores, ShoppingStore } from "../services/ShoppingService.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

// ── Nearby card components with dummy data
import NearbySupermarketCard from "../components/cards/Shopping/NearBysuperMarket";
import NearbyStationaryCard from "../components/cards/Shopping/NearbyStationaryCard";
import NearbyShoeCard from "../components/cards/Shopping/NearByShoeCard";
import NearbyOpticalCard from "../components/cards/Shopping/NearByOpticalCard";
import NearbyMobileCard from "../components/cards/Shopping/NearByMobileCard";
import NearbyJewelleryCard from "../components/cards/Shopping/NearByjewellar";
import NearbyGiftCard from "../components/cards/Shopping/NearByGiftCard";
import NearbyFurnitureCard from "../components/cards/Shopping/NearbyFurnitureCard";
import NearbyElectronicCard from "../components/cards/Shopping/NearbyElectronicCard";
import NearbyClothingCard from "../components/cards/Shopping/NearByClothingCard";

// ============================================================================
// SUBCATEGORY → CARD COMPONENT MAP
// ============================================================================
type CardKey =
    | "supermarket" | "stationary" | "shoe" | "optical" | "mobile"
    | "jewellery" | "gift" | "furniture" | "electronic" | "clothing";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    supermarket: NearbySupermarketCard,
    stationary: NearbyStationaryCard,
    shoe: NearbyShoeCard,
    optical: NearbyOpticalCard,
    mobile: NearbyMobileCard,
    jewellery: NearbyJewelleryCard,
    gift: NearbyGiftCard,
    furniture: NearbyFurnitureCard,
    electronic: NearbyElectronicCard,
    clothing: NearbyClothingCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("supermarket") || n.includes("grocery")) return "supermarket";
    if (n.includes("stationar")) return "stationary";
    if (n.includes("shoe")) return "shoe";
    if (n.includes("optical")) return "optical";
    if (n.includes("mobile")) return "mobile";
    if (n.includes("jeweller") || n.includes("jewelry")) return "jewellery";
    if (n.includes("gift")) return "gift";
    if (n.includes("furniture")) return "furniture";
    if (n.includes("electronic")) return "electronic";
    if (n.includes("clothing") || n.includes("cloth")) return "clothing";
    return "supermarket"; // default
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Shopping & Retail";
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
// MAIN COMPONENT
// ============================================================================
const ShoppingList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyStores, setNearbyStores] = useState<ShoppingStore[]>([]);
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

    // ── Fetch nearby stores when location is ready ───────────────────────────
    useEffect(() => {
        if (!userLocation) return;

        const fetchNearby = async () => {
            setLoading(true);
            setError("");
            try {
                console.log("🛒 Fetching nearby stores...");
                const res = await getNearbyShoppingStores(userLocation.latitude, userLocation.longitude, 10);
                console.log("🛒 API Response:", res);
                console.log("🛒 Total records:", res?.data ? (Array.isArray(res.data) ? res.data.length : 1) : 0);

                if (res?.success && res.data) {
                    const all: ShoppingStore[] = Array.isArray(res.data) ? res.data : [res.data];

                    if (subcategory) {
                        const targetType = subcategory
                            .split("-")
                            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                            .join(" ");
                        const filtered = all.filter(
                            s => s.storeType &&
                                s.storeType.toLowerCase().trim() === targetType.toLowerCase().trim()
                        );
                        console.log(`✅ Filtered stores for "${targetType}":`, filtered.length);
                        setNearbyStores(filtered);
                    } else {
                        console.log("✅ Displaying all", all.length, "stores");
                        setNearbyStores(all);
                    }
                } else {
                    setNearbyStores([]);
                }
            } catch (e) {
                console.error("❌ Error:", e);
                setError("Failed to load nearby stores");
                setNearbyStores([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNearby();
    }, [userLocation]); // ✅ no subcategory dependency — matches RealEstateList pattern

    // ── Navigation handlers ──────────────────────────────────────────────────
    const handleView = (store: any) => {
        const id = store._id || store.id;
        console.log("Viewing store details:", id);
        navigate(`/shopping/details/${id}`);
    };

    const handleAddPost = () =>
        navigate(subcategory ? `/add-shopping-form?subcategory=${subcategory}` : "/add-shopping-form");

    const openDirections = (store: ShoppingStore) => {
        if (store.latitude && store.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${Number(store.latitude)},${Number(store.longitude)}`,
                "_blank"
            );
        } else if (store.area || store.city) {
            const addr = encodeURIComponent(
                [store.area, store.city, store.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const openCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    // ── Dummy cards — always render first ───────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── Inline API store card — mirrors RealEstateList card style ────────────
    const renderStoreCard = (store: ShoppingStore) => {
        const id = store._id || store.id || "";
        const location =
            [store.area, store.city, store.state].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (store.images || []).filter(Boolean) as string[];

        let distance: string | null = null;
        if (userLocation && store.latitude && store.longitude) {
            const d = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                Number(store.latitude),
                Number(store.longitude)
            );
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(store)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600/5 to-blue-600/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={store.storeName || "Store"}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">🛒</span>
                        </div>
                    )}

                    {/* Live Data — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Open/Closed — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md bg-green-500 text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            Open Now
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
                        {store.storeName || "Unnamed Store"}
                    </h2>

                    {store.storeType && (
                        <p className="text-sm font-medium text-gray-700">{store.storeType}</p>
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

                    {store.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 pt-1 border-t border-gray-100">
                            {store.description}
                        </p>
                    )}

                    {/* Phone badge */}
                    {store.phone && (
                        <div className="flex flex-wrap gap-1.5">
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                                📞 {store.phone}
                            </span>
                        </div>
                    )}

                    {/* Directions + Call */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(store); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); store.phone && openCall(store.phone); }}
                            disabled={!store.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${store.phone
                                ? "bg-blue-600 text-white hover:bg-blue-700"
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

    // ── Nearby services section — renders after dummy cards ──────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            );
        }

        if (nearbyStores.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🛒</div>
                    <p className="text-gray-500 font-medium">No stores found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Check browser console for API debug info</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Nearby Services header with count — mirrors RealEstateList */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-blue-600 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyStores.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyStores.map(renderStoreCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER — DUMMY FIRST, API SECOND  (mirrors RealEstateList exactly)
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find stores near you</p>
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

                {/* Location fetching status */}
                {fetchingLocation && (
                    <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-blue-700">Getting your location...</span>
                    </div>
                )}

                {/* Location error */}
                {locationError && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg">
                        <p className="text-yellow-700 text-sm">{locationError}</p>
                    </div>
                )}

                {/* API error */}
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

export default ShoppingList;
