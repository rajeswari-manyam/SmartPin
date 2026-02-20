import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNearbyAgricultureWorkers, AgricultureWorker } from "../services/Agriculture.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

// ── Nearby card components with dummy data ──────────────────────────────────
import TractorServiceCard from "../components/cards/Agriculture/NearByTractor";
import WaterPumpServiceCard from "../components/cards/Agriculture/NearByWaterPumpService";
import FertilizerDealerCard from "../components/cards/Agriculture/NearByFertilizerShops";
import SeedDealerCard from "../components/cards/Agriculture/NearBySeedDealer";
import FarmingToolCard from "../components/cards/Agriculture/NearByFarmingTools";
import VeterinaryClinicCard from "../components/cards/Agriculture/NearByVetenary";

// ============================================================================
// SUBCATEGORY → CARD COMPONENT MAP
// ============================================================================
type CardKey = "tractor" | "waterpump" | "fertilizer" | "seed" | "tools" | "veterinary";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    tractor: TractorServiceCard,
    waterpump: WaterPumpServiceCard,
    fertilizer: FertilizerDealerCard,
    seed: SeedDealerCard,
    tools: FarmingToolCard,
    veterinary: VeterinaryClinicCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("tractor")) return "tractor";
    if (n.includes("water") || n.includes("pump")) return "waterpump";
    if (n.includes("fertilizer")) return "fertilizer";
    if (n.includes("seed")) return "seed";
    if (n.includes("tool") || n.includes("equipment") || n.includes("implement")) return "tools";
    if (n.includes("veterinary") || n.includes("vet") || n.includes("animal") || n.includes("livestock")) return "veterinary";
    return "tractor"; // default
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Agriculture Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getCategoryIcon = (subcategory: string | undefined): string => {
    if (!subcategory) return "🌾";
    const n = subcategory.toLowerCase();
    if (n.includes("tractor")) return "🚜";
    if (n.includes("water") || n.includes("pump")) return "💧";
    if (n.includes("fertilizer")) return "🌱";
    if (n.includes("seed")) return "🌾";
    if (n.includes("tool") || n.includes("equipment")) return "🔧";
    if (n.includes("veterinary") || n.includes("vet") || n.includes("animal")) return "🐄";
    return "🌾";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AgricultureServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyServices, setNearbyServices] = useState<AgricultureWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── Get user location ─────────────────────────────────────────────────────
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

    // ── Fetch nearby when location ready ─────────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetchNearby = async () => {
            setLoading(true);
            setError("");
            try {
                console.log("🌾 Fetching nearby agriculture services...");
                const res = await getNearbyAgricultureWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    10
                );
                console.log("🌾 API Response:", res);

                if (res?.success && res.data) {
                    const all = Array.isArray(res.data) ? res.data : [res.data];
                    console.log("✅ Displaying", all.length, "agriculture services");
                    setNearbyServices(all);
                } else {
                    setNearbyServices([]);
                }
            } catch (e) {
                console.error("❌ Error:", e);
                setError("Failed to load nearby agriculture services");
                setNearbyServices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchNearby();
    }, [userLocation]); // ✅ no subcategory filter — matches RealEstate pattern

    // ── Navigation ────────────────────────────────────────────────────────────
    const handleView = (service: any) => {
        const id = service._id || service.id;
        if (!id) return;
        navigate(`/agriculture-services/details/${id}`);
    };

    const handleAddPost = () => {
        navigate(
            subcategory
                ? `/add-agriculture-service-form?subcategory=${subcategory}`
                : "/add-agriculture-service-form"
        );
    };

    const openDirections = (service: AgricultureWorker) => {
        if (service.latitude && service.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`, "_blank");
        } else if (service.area || service.city) {
            const addr = encodeURIComponent([service.area, service.city, service.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    // ============================================================================
    // REAL API CARD — matches RealEstate card style exactly
    // ============================================================================
    const renderAgricultureCard = (service: AgricultureWorker) => {
        const id = service._id || service.id || "";
        const location = [service.area, service.city].filter(Boolean).join(", ") || "Location not set";
        const servicesList: string[] = Array.isArray(service.services) ? service.services : [];
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const icon = getCategoryIcon(service.category || service.subCategory);

        let distance: string | null = null;
        if (userLocation && service.latitude && service.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, service.latitude, service.longitude);
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(service)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-[#1A5F9E]/5 to-[#1A5F9E]/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.name || service.serviceName || "Service"}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{icon}</span>
                        </div>
                    )}

                    {/* Live Data — top left, matches RealEstate */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-[#1A5F9E] text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Availability — top right, matches RealEstate */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${service.availability
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {service.availability ? 'Available' : 'Busy'}
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
                        {service.name || service.serviceName || service.category || "Unnamed Service"}
                    </h2>

                    {(service.category || service.subCategory) && (
                        <p className="text-sm font-medium text-gray-700">
                            {icon} {service.category || service.subCategory}
                        </p>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold text-[#1A5F9E] flex items-center gap-1">
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Experience + Charge — mirrors RealEstate bedrooms+price row */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            {service.experience != null && (
                                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    📅 {service.experience} yrs exp
                                </span>
                            )}
                            {service.rating && (
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    ⭐ {service.rating}
                                </span>
                            )}
                        </div>
                        {service.serviceCharge != null && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">Charge</p>
                                <p className="text-base font-bold text-[#1A5F9E]">
                                    ₹{service.serviceCharge}
                                    {service.chargeType ? `/${service.chargeType}` : ''}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Services Tags — mirrors RealEstate amenities tags */}
                    {servicesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Services</p>
                            <div className="flex flex-wrap gap-1.5">
                                {servicesList.slice(0, 3).map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                                        <span className="text-[#1A5F9E]">●</span> {s}
                                    </span>
                                ))}
                                {servicesList.length > 3 && (
                                    <span className="text-xs text-[#1A5F9E] font-medium px-1 py-1">
                                        +{servicesList.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Directions + Call — matches RealEstate button row exactly */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(service); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-[#1A5F9E] text-[#1A5F9E] rounded-lg font-medium text-sm hover:bg-[#1A5F9E]/5 transition-colors"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); service.phone && openCall(service.phone); }}
                            disabled={!service.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${service.phone
                                ? 'bg-[#1A5F9E] text-white hover:bg-[#154a7e]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── DUMMY CARDS — always renders first (matches RealEstate pattern) ───────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── NEARBY SERVICES SECTION — renders second (matches RealEstate) ─────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1A5F9E]" />
                </div>
            );
        }

        if (nearbyServices.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🌾</div>
                    <p className="text-gray-500 font-medium">No services found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Check browser console for API debug info</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* "Nearby Services" header with count — mirrors RealEstate */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-[#1A5F9E] text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyServices.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyServices.map(renderAgricultureCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER — DUMMY FIRST, API SECOND (matches RealEstate exactly)
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1A5F9E]/5 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find agriculture services near you</p>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f]"
                    >
                        + Add Listing
                    </Button>
                </div>

                {/* Location status — matches RealEstate */}
                {fetchingLocation && (
                    <div className="bg-[#1A5F9E]/10 border border-[#1A5F9E]/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-[#1A5F9E] border-t-transparent rounded-full" />
                        <span className="text-sm text-[#1A5F9E]">Getting your location...</span>
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

export default AgricultureServicesList;
