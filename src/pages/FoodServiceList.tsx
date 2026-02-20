import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FoodServiceAPI from "../services/FoodService.service";
import type { FoodService } from "../services/FoodService.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { MoreVertical } from "lucide-react";

// ── Nearby dummy cards ────────────────────────────────────────────────────────
import NearbyBakersCard from "../components/cards/Restarents/NearByBackersCard";
import NearbyCafes from "../components/cards/Restarents/NearByCafesCard";
import NearbyIceCreamCard from "../components/cards/Restarents/NearByIceScreamCard";
import NearbyJuiceCard from "../components/cards/Restarents/NearByJuiceShopsCard";
import NearbyRestaurants from "../components/cards/Restarents/NearByRestarentsCard";
import NearbyStreetFoodCard from "../components/cards/Restarents/NearByStreetFoodCard";
import NearbySweetShopCard from "../components/cards/Restarents/NearBySweetShopsCard";
import NearbyCateringService from "../components/cards/Restarents/NearByCateringServiceCard";
import NearbyTiffinServiceCard from "../components/cards/Restarents/NearByTiffinsCard";

// ============================================================================
// CARD MAP
// ============================================================================
const DUMMY_CARD_MAP: Record<string, React.ComponentType<any>> = {
    "bakeries": NearbyBakersCard,
    "cafes": NearbyCafes,
    "ice-cream-parlours": NearbyIceCreamCard,
    "juice-shops": NearbyJuiceCard,
    "restaurants": NearbyRestaurants,
    "street-food": NearbyStreetFoodCard,
    "sweet-shops": NearbySweetShopCard,
    "catering-services": NearbyCateringService,
    "catering": NearbyCateringService,
    "mess-services": NearbyTiffinServiceCard,
    "food-delivery": NearbyTiffinServiceCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Food Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const getIcon = (type?: string, icon?: string): string => {
    if (icon) return icon;
    const t = (type || "").toLowerCase();
    if (t.includes("restaurant")) return "🍽️";
    if (t.includes("cafe")) return "☕";
    if (t.includes("bakery")) return "🍰";
    if (t.includes("street")) return "🌮";
    if (t.includes("juice")) return "🥤";
    if (t.includes("sweet")) return "🍬";
    if (t.includes("ice")) return "🍦";
    if (t.includes("fast")) return "🍔";
    if (t.includes("cloud") || t.includes("kitchen")) return "🍱";
    if (t.includes("catering")) return "🎂";
    return "🍽️";
};

// ============================================================================
// ACTION DROPDOWN
// ============================================================================
const ActionDropdown: React.FC<{
    serviceId: string;
    onEdit: (id: string, e: React.MouseEvent) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
}> = ({ serviceId, onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative" onClick={e => e.stopPropagation()}>
            <button
                onClick={e => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-2 hover:bg-white/80 bg-white/60 backdrop-blur-sm rounded-full transition shadow-sm"
            >
                <MoreVertical size={18} className="text-gray-700" />
            </button>
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={e => { e.stopPropagation(); setIsOpen(false); }} />
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px] z-20">
                        <button onClick={e => { onEdit(serviceId, e); setIsOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-orange-50 flex items-center gap-2 text-orange-600 font-medium">
                            ✏️ Edit
                        </button>
                        <div className="border-t border-gray-100" />
                        <button onClick={e => { onDelete(serviceId, e); setIsOpen(false); }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 font-medium">
                            🗑️ Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const FoodServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [nearbyServices, setNearbyServices] = useState<FoodService[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── Get user location ─────────────────────────────────────────────────────
    useEffect(() => {
        setFetchingLocation(true);
        if (!navigator.geolocation) { setLocationError("Geolocation not supported"); setFetchingLocation(false); return; }
        navigator.geolocation.getCurrentPosition(
            pos => {
                setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setFetchingLocation(false);
            },
            err => { console.error(err); setLocationError("Unable to retrieve your location."); setFetchingLocation(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    // ── Fetch nearby food services when location ready ────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetchNearby = async () => {
            setLoading(true); setError("");
            try {
                // GET /getNearby?latitude=X&longitude=Y
                const res = await fetch(
                    `${API_BASE_URL}/getNearby?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}`,
                    { method: "GET", redirect: "follow" }
                );
                const text = await res.text();
                const parsed = JSON.parse(text);
                const all = Array.isArray(parsed) ? parsed : parsed.data ? (Array.isArray(parsed.data) ? parsed.data : [parsed.data]) : [];
                setNearbyServices(all);
            } catch (e) {
                console.error("❌ Error fetching nearby food services:", e);
                setError("Failed to load nearby food services");
                setNearbyServices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNearby();
    }, [userLocation]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleView = (service: FoodService) => navigate(`/food-services/details/${service._id}`);
    const handleAddPost = () => navigate("/add-food-service-form");

    const handleEdit = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/add-food-service-form/${id}`);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this service?")) return;
        try {
            const res = await FoodServiceAPI.deleteFoodService(id);
            if (res.success) {
                setNearbyServices(prev => prev.filter(s => s._id !== id));
            } else {
                alert(res.error || "Failed to delete service");
            }
        } catch (err) {
            console.error(err);
            alert("Failed to delete service");
        }
    };

    const openDirections = (service: FoodService) => {
        if (service.latitude && service.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`, "_blank");
        } else if (service.area || service.city) {
            const addr = encodeURIComponent([service.area, service.city, service.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    // ============================================================================
    // NEARBY API CARD — mirrors RealEstateList renderRealEstateCard
    // ============================================================================
    const renderNearbyCard = (service: FoodService) => {
        const id = service._id || "";
        const location = [service.area, service.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = ((service as any).images || []).filter(Boolean) as string[];
        const icon = getIcon(service.type, service.icon);

        let distance: string | null = null;
        if (userLocation && service.latitude && service.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, parseFloat(service.latitude), parseFloat(service.longitude));
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(service)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-orange-500/5 to-orange-500/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img src={imageUrls[0]} alt={service.name} className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-50">
                            <span className="text-5xl">{icon}</span>
                        </div>
                    )}

                    {/* Live Data badge — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Status — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${service.status ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {service.status ? "Open" : "Closed"}
                        </span>
                    </div>

                    {/* Action Dropdown */}
                    <div className="absolute bottom-3 right-3 z-10" onClick={e => e.stopPropagation()}>
                        <ActionDropdown serviceId={id} onEdit={handleEdit} onDelete={handleDelete} />
                    </div>

                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {service.name || "Unnamed Service"}
                    </h2>

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold text-orange-500 flex items-center gap-1">
                            📍 {distance} away
                        </p>
                    )}

                    {/* Type + Rating */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-gray-700">
                            <span>{icon}</span> {service.type}
                        </span>
                        {service.rating && (
                            <span className="text-sm text-yellow-600 font-semibold flex items-center gap-1">
                                ⭐ {service.rating.toFixed(1)}
                                {service.user_ratings_total ? ` (${service.user_ratings_total})` : ""}
                            </span>
                        )}
                    </div>

                    {/* Pincode */}
                    {service.pincode && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            📮 Pincode: {service.pincode}
                        </p>
                    )}

                    {/* Directions + View Details */}
                    <div className="grid grid-cols-2 gap-2 pt-2 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(service); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-orange-500 text-orange-500 rounded-lg font-medium text-sm hover:bg-orange-50 transition-colors"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); handleView(service); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-orange-500 text-white rounded-lg font-medium text-sm hover:bg-orange-600 transition-colors"
                        >
                            <span>👁️</span> Details
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Dummy Cards ───────────────────────────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = subcategory ? DUMMY_CARD_MAP[subcategory] : null;
        if (!CardComponent) return null;
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── Nearby Services Section ───────────────────────────────────────────────
    const renderNearbySection = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
                </div>
            );
        }

        if (nearbyServices.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🍽️</div>
                    <p className="text-gray-500 font-medium">No food services found near you.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Food Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-orange-500 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyServices.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyServices.map(renderNearbyCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find food services near you</p>
                    </div>
                    <Button variant="primary" size="md" onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f] text-white">
                        + Add Post
                    </Button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
                        <span className="text-sm text-orange-700">Getting your location...</span>
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
                {renderDummyCards() && (
                    <div className="space-y-4">{renderDummyCards()}</div>
                )}

                {/* ✅ 2. API DATA SECOND */}
                {userLocation && !fetchingLocation && renderNearbySection()}

            </div>
        </div>
    );
};

export default FoodServicesList;
