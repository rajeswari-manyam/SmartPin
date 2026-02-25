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
    return "supermarket";
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
// CALL POPUP COMPONENT
// ============================================================================
interface CallPopupProps {
    phone: string;
    storeName: string;
    onClose: () => void;
}

const CallPopup: React.FC<CallPopupProps> = ({ phone, storeName, onClose }) => {
    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
            onClick={handleBackdrop}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div
                    className="px-6 py-5 text-center"
                    style={{ background: "linear-gradient(135deg, #00598a 0%, #007ab8 100%)" }}
                >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg line-clamp-1">{storeName}</h3>
                    <p className="text-white/70 text-sm mt-1">Contact Store</p>
                </div>

                {/* Phone display */}
                <div className="px-6 py-6 text-center">
                    <p className="text-gray-500 text-sm mb-2">Phone Number</p>
                    <div className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <span className="text-gray-400 text-lg">📞</span>
                        <span className="text-2xl font-bold tracking-widest" style={{ color: "#00598a" }}>
                            +91 {phone}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <a
                            href={`tel:+91${phone}`}
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                            style={{ backgroundColor: "#00598a" }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call Now
                        </a>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all active:scale-95"
                            style={{ borderColor: "#00598a", color: "#00598a" }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00598a";
                                (e.currentTarget as HTMLButtonElement).style.color = "white";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#00598a";
                            }}
                        >
                            ✕ Close
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
const ShoppingList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyStores, setNearbyStores] = useState<ShoppingStore[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // Call popup state
    const [callPopup, setCallPopup] = useState<{ phone: string; storeName: string } | null>(null);

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
            },
            (err) => {
                console.error(err);
                setLocationError("Unable to retrieve your location.");
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    // ── Fetch nearby stores ──────────────────────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetchNearby = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await getNearbyShoppingStores(userLocation.latitude, userLocation.longitude, 10);
                if (res?.success && res.data) {
                    const all: ShoppingStore[] = Array.isArray(res.data) ? res.data : [res.data];
                    if (subcategory) {
                        const targetType = subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                        setNearbyStores(all.filter(s => s.storeType && s.storeType.toLowerCase().trim() === targetType.toLowerCase().trim()));
                    } else {
                        setNearbyStores(all);
                    }
                } else {
                    setNearbyStores([]);
                }
            } catch (e) {
                setError("Failed to load nearby stores");
                setNearbyStores([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNearby();
    }, [userLocation]);

    // ── Navigation handlers ──────────────────────────────────────────────────
    const handleView = (store: any) => navigate(`/shopping/details/${store._id || store.id}`);

    const handleAddPost = () =>
        navigate(subcategory ? `/add-shopping-form?subcategory=${subcategory}` : "/add-shopping-form");

    const openDirections = (store: ShoppingStore) => {
        if (store.latitude && store.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${Number(store.latitude)},${Number(store.longitude)}`, "_blank");
        } else if (store.area || store.city) {
            const addr = encodeURIComponent([store.area, store.city, store.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const handleCallClick = (e: React.MouseEvent, store: ShoppingStore) => {
        e.stopPropagation();
        if (!store.phone) return;
        setCallPopup({ phone: store.phone, storeName: store.storeName || "Store" });
    };

    // ── Dummy cards ──────────────────────────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── Store card ───────────────────────────────────────────────────────────
    const renderStoreCard = (store: ShoppingStore) => {
        const id = store._id || store.id || "";
        const location = [store.area, store.city, store.state].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (store.images || []).filter(Boolean) as string[];

        let distance: string | null = null;
        if (userLocation && store.latitude && store.longitude) {
            const d = calculateDistance(
                userLocation.latitude, userLocation.longitude,
                Number(store.latitude), Number(store.longitude)
            );
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100 group"
                onClick={() => handleView(store)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={store.storeName || "Store"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 group-hover:bg-[#00598a]/5 transition-colors duration-200">
                            <span className="text-5xl">🛒</span>
                        </div>
                    )}

                    {/* Live Data badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span
                            className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md"
                            style={{ backgroundColor: "#00598a" }}
                        >
                            Live Data
                        </span>
                    </div>

                    {/* Open Now badge */}
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
                <div className="p-4 flex flex-col gap-2.5 flex-1">
                    {/* Store name */}
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-[#00598a] transition-colors duration-200">
                        {store.storeName || "Unnamed Store"}
                    </h2>

                    {/* Store type badge */}
                    {store.storeType && (
                        <div>
                            <span
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border font-medium"
                                style={{ backgroundColor: "#00598a0d", color: "#00598a", borderColor: "#00598a33" }}
                            >
                                🛍️ {store.storeType}
                            </span>
                        </div>
                    )}

                    {/* Location */}
                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {/* Distance */}
                    {distance && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: "#00598a" }}>
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Description */}
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

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-auto">
                        {/* Directions */}
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(store); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                            style={{ borderColor: "#00598a", color: "#00598a" }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00598a";
                                (e.currentTarget as HTMLButtonElement).style.color = "white";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#00598a";
                            }}
                        >
                            <span>📍</span> Directions
                        </button>

                        {/* Call */}
                        <button
                            onClick={e => handleCallClick(e, store)}
                            disabled={!store.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95 ${!store.phone ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "text-white"}`}
                            style={store.phone ? { backgroundColor: "#00598a" } : {}}
                            onMouseEnter={e => {
                                if (!store.phone) return;
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#004a73";
                            }}
                            onMouseLeave={e => {
                                if (!store.phone) return;
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00598a";
                            }}
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#00598a" }} />
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
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span
                        className="inline-flex items-center justify-center min-w-[2rem] h-7 text-white text-sm font-bold rounded-full px-2.5"
                        style={{ backgroundColor: "#00598a" }}
                    >
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
    // MAIN RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
            {/* ── Call Popup ── */}
            {callPopup && (
                <CallPopup
                    phone={callPopup.phone}
                    storeName={callPopup.storeName}
                    onClose={() => setCallPopup(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find stores near you</p>
                    </div>
                    <button
                        onClick={handleAddPost}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                        style={{ backgroundColor: "#00598a" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#004a73"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00598a"; }}
                    >
                        + Add Post
                    </button>
                </div>

                {/* Location fetching status */}
                {fetchingLocation && (
                    <div className="border rounded-lg p-3 flex items-center gap-2" style={{ backgroundColor: "#00598a0d", borderColor: "#00598a33" }}>
                        <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" style={{ borderColor: "#00598a", borderTopColor: "transparent" }} />
                        <span className="text-sm font-medium" style={{ color: "#00598a" }}>Getting your location...</span>
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

                {/* 1. DUMMY CARDS FIRST */}
                <div className="space-y-4">{renderDummyCards()}</div>

                {/* 2. API DATA SECOND */}
                {userLocation && !fetchingLocation && renderNearbyServices()}
            </div>
        </div>
    );
};

export default ShoppingList;