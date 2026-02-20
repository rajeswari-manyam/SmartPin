import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNearbyAutomotive, AutomotiveService } from "../services/AutomotiveServcie.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

// ── Nearby card components with dummy data ───────────────────────────────────
import NearbyTowingCard from "../components/cards/Automotive/NearByTowingService";
import NearbyBikeRepairCard from "../components/cards/Automotive/NearByBikeRepairCard";
import NearbyCarRepairCard from "../components/cards/Automotive/NearByCarRepair";
import NearbyBikeWashingCard from "../components/cards/Automotive/NearByBikeWash";
import NearbyCarWashingCard from "../components/cards/Automotive/NearByCarWashing";
import NearbyAutomotiveSparePartsCard from "../components/cards/Automotive/NearByAutomotiveSpareParts";

// ============================================================================
// SUBCATEGORY → CARD COMPONENT MAP
// ============================================================================
type CardKey =
    | "towing"
    | "bikeRepair"
    | "carRepair"
    | "bikeWash"
    | "carWash"
    | "spareParts";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    towing: NearbyTowingCard,
    bikeRepair: NearbyBikeRepairCard,
    carRepair: NearbyCarRepairCard,
    bikeWash: NearbyBikeWashingCard,
    carWash: NearbyCarWashingCard,
    spareParts: NearbyAutomotiveSparePartsCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (text: string | undefined): CardKey | null => {
    if (!text) return null;
    const n = text.toLowerCase();

    if (n.includes("tow")) return "towing";
    if (n.includes("car") && (n.includes("repair") || n.includes("service") || n.includes("mechanic"))) return "carRepair";
    if ((n.includes("bike") || n.includes("two") || n.includes("2")) && (n.includes("repair") || n.includes("service") || n.includes("mechanic"))) return "bikeRepair";
    if (n.includes("car") && n.includes("wash")) return "carWash";
    if (n.includes("bike") && n.includes("wash")) return "bikeWash";
    if (n.includes("spare") || n.includes("parts") || n.includes("accessories")) return "spareParts";
    if (n.includes("car")) return "carRepair";
    if (n.includes("bike") || n.includes("two")) return "bikeRepair";

    return null;
};

const getCardComponentForSubcategory = (
    subcategory: string | undefined
): React.ComponentType<any> | null => {
    const key = resolveCardKey(subcategory);
    if (key && CARD_MAP[key]) return CARD_MAP[key];
    return CARD_MAP.carRepair; // Default
};

const shouldShowNearbyCards = (_subcategory: string | undefined): boolean => {
    return true; // Always show dummy cards
};

const titleFromSlug = (slug: string | undefined): string => {
    if (!slug) return "All Automotive Services";
    return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

const getDisplayTitle = (subcategory: string | undefined) => titleFromSlug(subcategory);

const normalizeType = (type: string): string =>
    type.toLowerCase().trim().replace(/\s+/g, " ");

// Type-safe helper for services field
const ensureStringArray = (input: unknown): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) return (input as any[]).map(String).filter(Boolean);
    if (typeof input === "string")
        return (input as string).split(",").map((s: string) => s.trim()).filter(Boolean);
    return [];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const AutomotiveList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyServices, setNearbyServices] = useState<AutomotiveService[]>([]);
    const [userLocation, setUserLocation] = useState<{
        latitude: number;
        longitude: number;
    } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── Get user's location on component mount ────────────────────────────────
    useEffect(() => {
        const getUserLocation = () => {
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
        };

        getUserLocation();
    }, []);

    // ── Fetch nearby automotives when location is available ───────────────────
    useEffect(() => {
        const fetchNearbyAutomotives = async () => {
            if (!userLocation) return;

            setLoading(true);
            setError("");

            try {
                const distance = 10;
                const response = await getNearbyAutomotive(
                    userLocation.latitude,
                    userLocation.longitude,
                    distance
                );

                if (response.success && response.data) {
                    const allServices = Array.isArray(response.data)
                        ? response.data
                        : [response.data];

                    if (subcategory) {
                        const targetType = titleFromSlug(subcategory);
                        const normalizedTarget = normalizeType(targetType);
                        const filtered = allServices.filter(
                            (s) =>
                                s.businessType &&
                                normalizeType(s.businessType) === normalizedTarget
                        );
                        setNearbyServices(filtered);
                    } else {
                        setNearbyServices(allServices);
                    }
                } else {
                    setNearbyServices([]);
                }
            } catch (err: any) {
                console.error("Error fetching nearby automotives:", err);
                setError("Failed to load nearby services");
                setNearbyServices([]);
            } finally {
                setLoading(false);
            }
        };

        if (userLocation) {
            fetchNearbyAutomotives();
        }
    }, [userLocation, subcategory]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleView = (automotive: any) => {
        const id = automotive.id || automotive._id;
        navigate(`/automotive-services/details/${id}`);
    };

    const handleAddPost = () => {
        navigate(
            subcategory
                ? `/add-automotive-form?subcategory=${subcategory}`
                : "/add-automotive-form"
        );
    };

    const openDirections = (automotive: AutomotiveService) => {
        if (automotive.latitude && automotive.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${automotive.latitude},${automotive.longitude}`,
                "_blank"
            );
        } else if (automotive.area || automotive.city) {
            const addr = encodeURIComponent(
                [automotive.area, automotive.city, automotive.state]
                    .filter(Boolean)
                    .join(", ")
            );
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${addr}`,
                "_blank"
            );
        }
    };

    const openCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    const getImageUrls = (images?: string[]): string[] =>
        (images || []).filter(Boolean) as string[];

    // ── Render Automotive Card (matching dummy card style) ────────────────────
    const renderAutomotiveCard = (automotive: AutomotiveService) => {
        const id = automotive._id || "";
        const location =
            [automotive.area, automotive.city].filter(Boolean).join(", ") ||
            "Location not set";
        const servicesList = ensureStringArray(automotive.services);
        const imageUrls = getImageUrls(automotive.images);

        let distance: string | null = null;
        if (userLocation && automotive.latitude && automotive.longitude) {
            const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                automotive.latitude,
                automotive.longitude
            );
            distance =
                dist < 1
                    ? `${(dist * 1000).toFixed(0)} m`
                    : `${dist.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(automotive)}
            >
                {/* ── Image Section ── */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={automotive.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">🚗</span>
                        </div>
                    )}

                    {/* Live Data Badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Image Counter */}
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
                        {automotive.name || automotive.businessType || "Unnamed Service"}
                    </h2>

                    {/* Location */}
                    <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 text-sm mt-0.5 flex-shrink-0">📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {/* Distance */}
                    {distance && (
                        <p className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                            <span>📍</span>
                            {distance} away
                        </p>
                    )}

                    {/* Description */}
                    {automotive.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {automotive.description}
                        </p>
                    )}

                    {/* Experience & Price */}
                    {(automotive.experience !== undefined || automotive.priceRange) && (
                        <div className="flex items-center justify-between">
                            {automotive.experience !== undefined && (
                                <span className="text-sm text-gray-700 flex items-center gap-1">
                                    <span>📅</span>
                                    {automotive.experience} yrs exp
                                </span>
                            )}
                            {automotive.priceRange && (
                                <span className="text-sm font-bold text-green-600">
                                    ₹{automotive.priceRange}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Business Type Badge */}
                    {automotive.businessType && (
                        <div className="pt-1">
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 font-medium">
                                🚗 {automotive.businessType}
                            </span>
                        </div>
                    )}

                    {/* Availability */}
                    {automotive.availability && (
                        <span className="inline-flex items-center gap-1.5 text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-md border border-green-200 font-medium w-fit">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            {automotive.availability}
                        </span>
                    )}

                    {/* Services Tags */}
                    {servicesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 mt-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Services
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {servicesList.slice(0, 3).map((service, idx) => (
                                    <span
                                        key={`${id}-${idx}`}
                                        className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200"
                                    >
                                        {service}
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

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openDirections(automotive);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors active:bg-blue-100"
                        >
                            <span>📍</span>
                            Directions
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                automotive.phone && openCall(automotive.phone);
                            }}
                            disabled={!automotive.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${automotive.phone
                                ? "bg-green-500 text-white hover:bg-green-600 active:bg-green-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <span>📞</span>
                            Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Render Cards Section (Dummy Data) ─────────────────────────────────────
    const renderCardsSection = () => {
        const CardComponent = getCardComponentForSubcategory(subcategory);
        if (!CardComponent) return null;

        return (
            <div>
                <CardComponent
                    onViewDetails={handleView}
                    nearbyData={undefined}
                    userLocation={userLocation}
                />
            </div>
        );
    };

    // ── Render Your Services (API Data) ──────────────────────────────────────
    const renderYourServices = () => {
        if (nearbyServices.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <p className="text-gray-500">No services found in your area.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Your Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-blue-600 text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyServices.length}
                    </span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyServices.map(renderAutomotiveCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage Automotive services
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f] text-white"
                    >
                        + Create Automotive Service
                    </Button>
                </div>

                {/* ── Location Status ── */}
                {fetchingLocation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-blue-700">Getting your location...</span>
                    </div>
                )}

                {locationError && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg">
                        <p className="text-yellow-700 text-sm">{locationError}</p>
                    </div>
                )}

                {/* ── API Error ── */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                )}

                {/* ── DUMMY CARDS FIRST — always render ── */}
                {shouldShowNearbyCards(subcategory) && (
                    <div className="space-y-4">
                        {renderCardsSection()}
                    </div>
                )}

                {/* ── YOUR SERVICES (API DATA) SECOND ── */}
                {userLocation && !fetchingLocation && renderYourServices()}
            </div>
        </div>
    );
};

export default AutomotiveList;
