import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

/* ── API ───────────────────────────────────────── */
import {
    getNearbyCorporateWorkers,
    CorporateWorker,
} from "../services/Corporate.service";

/* ── Dummy Nearby Cards ────────────────────────── */
import NearbyBackgroundVerification from "../components/cards/Corporate/NearByBackgroundVerification";
import CourierServiceCard from "../components/cards/Corporate/NearByCourierCard";
import NearbyCleaningServices from "../components/cards/Corporate/NearBYOfficeCleaning";

/* ============================================================================
   SUBCATEGORY → CARD MAP
============================================================================ */
type CardKey = "background" | "courier" | "cleaning";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    background: NearbyBackgroundVerification,
    courier: CourierServiceCard,
    cleaning: NearbyCleaningServices,
};

/* ============================================================================
   HELPERS
============================================================================ */
const normalize = (s?: string) => (s || "").toLowerCase();

const resolveCardKey = (subcategory?: string): CardKey | null => {
    const n = normalize(subcategory);
    if (n.includes("background")) return "background";
    if (n.includes("courier") || n.includes("document")) return "courier";
    if (n.includes("cleaning") || n.includes("office")) return "cleaning";
    return null;
};

const getCardComponentForSubcategory = (subcategory?: string) => {
    const key = resolveCardKey(subcategory);
    return key ? CARD_MAP[key] : null;
};

const titleFromSlug = (slug?: string) =>
    slug
        ? slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
        : "All Corporate Services";

const getIcon = (subcategory?: string) => {
    const n = normalize(subcategory);
    if (n.includes("background")) return "🔍";
    if (n.includes("courier") || n.includes("document")) return "📦";
    if (n.includes("cleaning") || n.includes("office")) return "🧹";
    if (n.includes("recruitment")) return "👥";
    if (n.includes("it") || n.includes("tech")) return "💻";
    if (n.includes("security")) return "🔒";
    return "🏢";
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

/* ============================================================================
   MAIN COMPONENT
============================================================================ */
const CorporateServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyServices, setNearbyServices] = useState<CorporateWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    /* ── Get user location ─────────────────────────────────────────────────── */
    useEffect(() => {
        setFetchingLocation(true);

        if (!navigator.geolocation) {
            setLocationError("Geolocation not supported");
            setFetchingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
                setFetchingLocation(false);
            },
            () => {
                setLocationError("Unable to fetch location");
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    /* ── Fetch nearby corporate services ───────────────────────────────────── */
    useEffect(() => {
        if (!userLocation) return;

        const fetchNearby = async () => {
            setLoading(true);
            setError("");

            try {
                const response = await getNearbyCorporateWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    10
                );

                if (response.success && response.data) {
                    let data = Array.isArray(response.data) ? response.data : [response.data];

                    if (subcategory) {
                        const target = titleFromSlug(subcategory).toLowerCase();
                        data = data.filter(
                            (s) =>
                                (s.subCategory && s.subCategory.toLowerCase().includes(target)) ||
                                (s.serviceName && s.serviceName.toLowerCase().includes(target))
                        );
                    }

                    setNearbyServices(data);
                } else {
                    setNearbyServices([]);
                }
            } catch (err) {
                setError("Failed to load nearby corporate services");
                setNearbyServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNearby();
    }, [userLocation, subcategory]);

    /* ── Navigation handlers ───────────────────────────────────────────────── */
    const handleView = (service: any) => {
        const id = service._id || service.id;
        navigate(`/corporate-services/details/${id}`);
    };

    const handleAddPost = () => {
        navigate(
            subcategory
                ? `/add-corporative-service-form?subcategory=${subcategory}`
                : "/add-corporative-service-form"
        );
    };

    /* ============================================================================
       REAL API CARD — styled to match HospitalServicesList card
    ============================================================================ */
    const renderCorporateCard = (service: CorporateWorker) => {
        const id = service._id || service.id || "";
        const location =
            [service.area, service.city].filter(Boolean).join(", ") ||
            "Location not specified";

        const imageUrls = (service.images || []).filter(Boolean) as string[];

        let distance: string | null = null;
        if (userLocation && service.latitude && service.longitude) {
            const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                service.latitude,
                service.longitude
            );
            distance = dist < 1
                ? `${(dist * 1000).toFixed(0)} m`
                : `${dist.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(service)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600/5 to-blue-600/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.serviceName || "Corporate Service"}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{getIcon(subcategory || service.subCategory)}</span>
                        </div>
                    )}

                    {/* Live Data badge — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Image counter — bottom right */}
                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex flex-col gap-2.5">
                    {/* Title */}
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 leading-tight">
                        {service.serviceName || "Corporate Service"}
                    </h2>

                    {/* Location */}
                    <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 text-sm mt-0.5 flex-shrink-0">📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {/* Distance */}
                    {distance && (
                        <p className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Description */}
                    {service.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {service.description}
                        </p>
                    )}

                    {/* Subcategory badge */}
                    {service.subCategory && (
                        <div className="pt-1">
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-600/5 text-blue-600 px-2.5 py-1 rounded-md border border-blue-600/20 font-medium">
                                🏢 {service.subCategory}
                            </span>
                        </div>
                    )}

                    {/* Charge */}
                    {service.serviceCharge && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-sm font-bold text-blue-600">
                                ₹{service.serviceCharge}
                            </span>
                            {service.chargeType && (
                                <span className="text-xs text-gray-500">/ {service.chargeType}</span>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (service.latitude && service.longitude) {
                                    window.open(
                                        `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`,
                                        "_blank"
                                    );
                                }
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-600/5 transition-colors active:bg-blue-600/10"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleView(service);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 active:bg-blue-800 transition-colors"
                        >
                            <span>👁️</span> View
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    /* ============================================================================
       DUMMY NEARBY CARDS
    ============================================================================ */
    const renderDummyCards = () => {
        const Card = getCardComponentForSubcategory(subcategory);
        if (!Card) return null;

        return (
            <Card
                onViewDetails={handleView}
                nearbyData={undefined}
                userLocation={userLocation}
            />
        );
    };

    /* ============================================================================
       REAL SERVICES GRID
    ============================================================================ */
    const renderYourServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
            );
        }

        if (nearbyServices.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🏢</div>
                    <p className="text-gray-500">No services found in your area.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Your Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-blue-600 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyServices.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyServices.map(renderCorporateCard)}
                </div>
            </div>
        );
    };

    /* ============================================================================
       MAIN RENDER
    ============================================================================ */
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
                            Manage Corporate & Business services
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f] text-white"
                    >
                        + Add Corporate Service
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

                {/* Dummy Nearby Cards */}
                {renderDummyCards()}

                {/* Real API Services */}
                {userLocation && !fetchingLocation && renderYourServices()}
            </div>
        </div>
    );
};

export default CorporateServicesList;
