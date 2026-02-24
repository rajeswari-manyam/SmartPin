import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FoodServiceAPI from "../services/FoodService.service";
import type { FoodService } from "../services/FoodService.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

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
import NearbyMessServiceCard from "../components/cards/Restarents/NearByMessServiceCard";
import NearbyFoodDeliveryCard from "../components/cards/Restarents/NearByFoodDeliveryCard";

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
    "mess-services": NearbyMessServiceCard,
    "food-delivery": NearbyFoodDeliveryCard,
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
    const [phoneModal, setPhoneModal] = useState<{ name: string; phone: string } | null>(null);

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

    const openDirections = (service: FoodService) => {
        if (service.latitude && service.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`, "_blank");
        } else if (service.area || service.city) {
            const addr = encodeURIComponent([service.area, service.city, service.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const handleCall = (service: FoodService, e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = (service as any).phone;
        const name = service.name || "Service";
        if (phone) {
            setPhoneModal({ name, phone });
        } else {
            setPhoneModal({ name, phone: "" });
        }
    };

    // ============================================================================
    // NEARBY API CARD — matches screenshot style
    // ============================================================================
    const renderNearbyCard = (service: FoodService) => {
        const id = service._id || "";
        const location = [service.area, service.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = ((service as any).images || []).filter(Boolean) as string[];
        const icon = getIcon(service.type, service.icon);
        const isOpen = service.status;

        let distance: string | null = null;
        if (userLocation && service.latitude && service.longitude) {
            const d = calculateDistance(
                userLocation.latitude, userLocation.longitude,
                parseFloat(service.latitude), parseFloat(service.longitude)
            );
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col cursor-pointer border border-gray-100 active:scale-[0.98] transition-all duration-300 hover:shadow-2xl hover:shadow-[#00598a]/20 hover:-translate-y-2 hover:border-[#00598a]/40"
                onClick={() => handleView(service)}
            >
                {/* ── Image Section ── */}
                <div className="relative h-52 bg-gray-100 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#00598a]/5">
                            <span className="text-5xl">{icon}</span>
                        </div>
                    )}

                    {/* Live Data badge — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00598a] text-white text-xs font-bold rounded-lg shadow">
                            ☁️ Live Data
                        </span>
                    </div>

                    {/* Open/Closed badge — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg shadow ${
                            isOpen ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}>
                            {isOpen ? (
                                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <span className="w-2 h-2 rounded-full bg-white/80 inline-block" />
                            )}
                            {isOpen ? "Open" : "Closed"}
                        </span>
                    </div>

                    {/* Service type — bottom left of image */}
                    <div className="absolute bottom-3 left-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-lg backdrop-blur-sm">
                            {icon} {service.type || "Restaurant"}
                        </span>
                    </div>

                    {/* Image count — bottom right */}
                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* ── Card Body ── */}
                <div className="p-4 flex flex-col gap-2">

                    {/* Name */}
                    <h2 className="text-lg font-bold text-gray-900 line-clamp-1">
                        {service.name || "Unnamed Service"}
                    </h2>

                    {/* Location */}
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                        📍 <span className="line-clamp-1">{location}</span>
                    </p>

                    {/* State + Pincode chips */}
                    <div className="flex flex-wrap gap-2">
                        {service.state && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg">
                                🏛 {service.state}
                            </span>
                        )}
                        {service.pincode && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg">
                                ✉️ {service.pincode}
                            </span>
                        )}
                        {distance && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00598a]/10 text-[#00598a] text-xs font-semibold rounded-lg">
                                📍 {distance}
                            </span>
                        )}
                    </div>

                    {/* Rating */}
                    {service.rating && (
                        <p className="text-sm text-yellow-600 font-semibold flex items-center gap-1">
                            ⭐ {service.rating.toFixed(1)}
                            {service.user_ratings_total ? ` (${service.user_ratings_total} reviews)` : ""}
                        </p>
                    )}

                    {/* ── Action Buttons — Directions + Call ── */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        {/* Directions — outlined brand color */}
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(service); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-[#00598a] text-[#00598a] rounded-xl font-semibold text-sm hover:bg-[#00598a] hover:text-white transition-all duration-200 active:scale-95"
                        >
                            <span>➤</span> Directions
                        </button>

                        {/* Call — solid green */}
                        <button
                            onClick={e => handleCall(service, e)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-500 text-white rounded-xl font-semibold text-sm hover:bg-green-600 transition-all duration-200 active:scale-95"
                        >
                            📞 Call
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00598a]" />
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
                    <h2 className="text-xl font-bold text-gray-800">Your Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-gray-200 text-gray-700 text-sm font-bold rounded-full px-2.5">
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
        <>
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header — title left, create button right (matches hospital page) */}
                <div className="flex items-start justify-between gap-4 mb-2">
                    {/* Left: back + title */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 rounded-full hover:bg-gray-100 transition shrink-0"
                        >
                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-tight">
                                {getDisplayTitle(subcategory)}
                            </h1>
                            <p className="text-xs text-gray-500">Manage Restaurants &amp; Food services</p>
                        </div>
                    </div>

                    {/* Right: Create button — top right corner */}
                    <button
                        onClick={handleAddPost}
                        className="shrink-0 flex items-center gap-2 px-5 py-3 bg-[#00598a] hover:bg-[#004a75] text-white font-semibold text-sm rounded-xl shadow-md transition-colors duration-200 active:scale-95 whitespace-nowrap"
                    >
                        + Create {getDisplayTitle(subcategory)} &amp; Food Service
                    </button>
                </div>

                {/* Location status */}
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

                {/* 1. DUMMY CARDS */}
                {renderDummyCards() && (
                    <div className="space-y-4">{renderDummyCards()}</div>
                )}

                {/* 2. API DATA */}
                {userLocation && !fetchingLocation && renderNearbySection()}

            </div>
        </div>

        {/* ── Phone Number Modal ── */}
        {phoneModal && (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                onClick={() => setPhoneModal(null)}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="px-6 pt-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: '#e8f2f8' }}>
                                <span className="text-xl">📞</span>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base leading-tight">
                                    {phoneModal.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-0.5">Contact Information</p>
                            </div>
                        </div>
                    </div>

                    {/* Phone Number Display */}
                    <div className="px-6 py-5">
                        {phoneModal.phone ? (
                            <>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                    Phone Number
                                </p>
                                <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
                                    <span className="text-xl font-bold text-gray-900 tracking-wide">
                                        {phoneModal.phone}
                                    </span>
                                    <button
                                        onClick={() => navigator.clipboard?.writeText(phoneModal.phone)}
                                        className="p-1.5 hover:bg-gray-200 rounded-lg transition text-gray-500 text-xs"
                                        title="Copy"
                                    >
                                        📋
                                    </button>
                                </div>

                                {/* Action buttons */}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <button
                                        onClick={() => setPhoneModal(null)}
                                        className="py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
                                    >
                                        Close
                                    </button>
                                    <a
                                        href={`tel:${phoneModal.phone}`}
                                        className="py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm text-center transition flex items-center justify-center gap-1.5"
                                    >
                                        📞 Call Now
                                    </a>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="text-center py-4">
                                    <span className="text-4xl">😕</span>
                                    <p className="mt-3 text-gray-500 font-medium">No phone number available for this service.</p>
                                </div>
                                <button
                                    onClick={() => setPhoneModal(null)}
                                    className="w-full mt-4 py-3 rounded-xl bg-[#00598a] text-white font-semibold text-sm transition hover:bg-[#004a75]"
                                >
                                    Close
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )}
        </>
    );
};

export default FoodServicesList;