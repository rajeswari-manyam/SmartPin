import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyHotels, Hotel } from "../services/HotelService.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbyHotelsCard from "../components/cards/Hotel/NearByHotel";
import NearbyResortsCard from "../components/cards/Hotel/NearByResort";
import NearbyLodgesCard from "../components/cards/Hotel/NearByLodge";
import NearbyGuestHouseCard from "../components/cards/Hotel/NearByGuestHouse";
import NearbyTravelCard from "../components/cards/Hotel/NearByTravel";
import NearbyTaxiServiceCard from "../components/cards/Hotel/NearByTaxiService";
import NearbyTrainServiceCard from "../components/cards/Hotel/NearByTrains";
import NearbyBusServiceCard from "../components/cards/Hotel/NearByBuses";
import NearbyVehicleCard from "../components/cards/Hotel/NearByBikeCard";

// ============================================================================
// SUBCATEGORY → CARD MAP
// ============================================================================
type CardKey =
    | "hotel" | "resort" | "lodge" | "guest"
    | "travel" | "taxi" | "train" | "bus" | "vehicle";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    hotel: NearbyHotelsCard,
    resort: NearbyResortsCard,
    lodge: NearbyLodgesCard,
    guest: NearbyGuestHouseCard,
    travel: NearbyTravelCard,
    taxi: NearbyTaxiServiceCard,
    train: NearbyTrainServiceCard,
    bus: NearbyBusServiceCard,
    vehicle: NearbyVehicleCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (text?: string): CardKey => {
    const n = (text || "").toLowerCase();
    if (n.includes("resort")) return "resort";
    if (n.includes("lodge")) return "lodge";
    if (n.includes("guest")) return "guest";
    if (n.includes("travel") || n.includes("tour")) return "travel";
    if (n.includes("taxi") || n.includes("cab")) return "taxi";
    if (n.includes("train")) return "train";
    if (n.includes("bus")) return "bus";
    if (n.includes("vehicle") || n.includes("bike") || n.includes("rental")) return "vehicle";
    return "hotel";
};

const titleFromSlug = (slug?: string): string => {
    if (!slug) return "All Hotel & Travel Services";
    return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const getIcon = (subcategory?: string, type?: string): string => {
    const n = (subcategory || type || "").toLowerCase();
    if (n.includes("resort")) return "🏖️";
    if (n.includes("lodge")) return "🏕️";
    if (n.includes("guest")) return "🏡";
    if (n.includes("travel") || n.includes("tour")) return "✈️";
    if (n.includes("taxi") || n.includes("cab")) return "🚕";
    if (n.includes("train")) return "🚆";
    if (n.includes("bus")) return "🚌";
    if (n.includes("vehicle") || n.includes("bike")) return "🛵";
    return "🏨";
};

const calculateDistance = (
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const HotelServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyHotels, setNearbyHotels] = useState<Hotel[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── Get user location ────────────────────────────────────────────────────
    useEffect(() => {
        setFetchingLocation(true);
        setLocationError("");

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            setFetchingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ latitude, longitude });
                setFetchingLocation(false);
                console.log("📍 User location:", latitude, longitude);
            },
            (err) => {
                console.error("Location error:", err);
                setLocationError("Unable to retrieve your location.");
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    // ── Fetch nearby hotels when location ready ──────────────────────────────
    useEffect(() => {
        if (!userLocation) return;

        const fetchNearbyHotels = async () => {
            setLoading(true);
            setError("");

            try {
                console.log("🏨 Fetching nearby hotels...");
                // GET /getNearbyhotelTravel?latitude=X&longitude=Y&distance=10
                const res = await getNearbyHotels(
                    userLocation.latitude,
                    userLocation.longitude,
                    10
                );

                console.log("🏨 API Response:", res);
                console.log("🏨 Total records:", res?.data?.length ?? 0);

                if (res?.success && res.data) {
                    // ✅ No subcategory filter — show ALL nearby results
                    const all: Hotel[] = Array.isArray(res.data) ? res.data : [res.data];
                    console.log("✅ Displaying", all.length, "hotels");
                    setNearbyHotels(all);
                } else {
                    setNearbyHotels([]);
                }
            } catch (e) {
                console.error("❌ Error fetching hotels:", e);
                setError("Failed to load nearby services");
                setNearbyHotels([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNearbyHotels();
    }, [userLocation]); // ✅ no subcategory dep

    // ── Navigation ───────────────────────────────────────────────────────────
    const handleView = (hotel: any) => {
        navigate(`/hotel-services/details/${hotel._id || hotel.id}`);
    };

    const handleAddPost = () => {
        navigate(
            subcategory
                ? `/add-hotel-service-form?subcategory=${subcategory}`
                : "/add-hotel-service-form"
        );
    };

    const openDirections = (hotel: Hotel) => {
        if (hotel.latitude && hotel.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude},${hotel.longitude}`,
                "_blank"
            );
        } else if (hotel.area || hotel.city) {
            const addr = encodeURIComponent(
                [hotel.area, hotel.city, hotel.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    // ============================================================================
    // REAL API CARD — same style as the courier screenshot
    // ============================================================================
    const renderHotelCard = (hotel: Hotel) => {
        const id = hotel._id || hotel.id || "";
        const location =
            [hotel.area, hotel.city].filter(Boolean).join(", ") || "Location not specified";

        const servicesList: string[] =
            typeof hotel.service === "string"
                ? hotel.service.split(",").map((s) => s.trim()).filter(Boolean)
                : Array.isArray(hotel.service)
                    ? hotel.service
                    : [];

        const imageUrls = (hotel.images || []).filter(Boolean) as string[];

        let distance: string | null = null;
        if (userLocation && hotel.latitude && hotel.longitude) {
            const dist = calculateDistance(
                userLocation.latitude, userLocation.longitude,
                hotel.latitude, hotel.longitude
            );
            distance = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(hotel)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600/5 to-blue-600/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={hotel.name || "Hotel"}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{getIcon(subcategory, hotel.type)}</span>
                        </div>
                    )}

                    {/* Live Data badge — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Availability badge — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md bg-green-500 text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            Available
                        </span>
                    </div>

                    {/* Image counter */}
                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 leading-tight">
                        {hotel.name || hotel.type || "Hotel Service"}
                    </h2>

                    <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 text-sm mt-0.5 flex-shrink-0">📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {distance && (
                        <p className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {hotel.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {hotel.description}
                        </p>
                    )}

                    {hotel.type && (
                        <div className="pt-1">
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-600/5 text-blue-600 px-2.5 py-1 rounded-md border border-blue-600/20 font-medium">
                                {getIcon(hotel.type)} {hotel.type}
                            </span>
                        </div>
                    )}

                    {/* Rating + Price */}
                    <div className="flex items-center justify-between pt-0.5">
                        {hotel.ratings ? (
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                ⭐ {hotel.ratings}
                            </span>
                        ) : <span />}
                        {hotel.priceRange && (
                            <div className="text-right">
                                <span className="text-sm font-bold text-blue-600">
                                    ₹{hotel.priceRange}
                                </span>
                                <span className="text-xs text-gray-500 ml-1">/ night</span>
                            </div>
                        )}
                    </div>

                    {/* Services tags */}
                    {servicesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 mt-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Services
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {servicesList.slice(0, 3).map((s, idx) => (
                                    <span
                                        key={`${id}-${idx}`}
                                        className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200"
                                    >
                                        {s}
                                    </span>
                                ))}
                                {servicesList.length > 3 && (
                                    <span className="text-xs text-blue-600 font-medium px-1 py-1">
                                        +{servicesList.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Directions + Call — exact same as screenshot */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); openDirections(hotel); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-600/5 transition-colors active:bg-blue-600/10"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); hotel.phone && openCall(hotel.phone); }}
                            disabled={!hotel.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${hotel.phone
                                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
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

    // ── DUMMY CARDS — always renders first ───────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return (
            <div>
                <CardComponent onViewDetails={handleView} userLocation={userLocation} />
            </div>
        );
    };

    // ── REAL API SECTION — renders second (mirrors screenshot "Nearby Services") ──
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            );
        }

        if (nearbyHotels.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">{getIcon(subcategory)}</div>
                    <p className="text-gray-500 font-medium">No services found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Check browser console for API debug info</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* "Nearby Services" header with count — matches screenshot exactly */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-blue-600 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyHotels.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyHotels.map(renderHotelCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER — DUMMY FIRST, API SECOND (matches screenshot)
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {titleFromSlug(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage Hotel & Travel services
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f] text-white"
                    >
                        + Add Post
                    </Button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-blue-600">Getting your location...</span>
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

                {/* ✅ 1. DUMMY CARDS FIRST — always shown */}
                <div className="space-y-4">
                    {renderDummyCards()}
                </div>

                {/* ✅ 2. API DATA SECOND — shown once location resolves */}
                {userLocation && !fetchingLocation && renderNearbyServices()}

            </div>
        </div>
    );
};

export default HotelServicesList;
