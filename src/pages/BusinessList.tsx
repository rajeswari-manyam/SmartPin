import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNearbyBusinessServices, BusinessWorker } from "../services/BusinessService.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

// ── Nearby card components (existing)
import CharteredAccountantCard from "../components/cards/Business/NearByCharteredAccountant";
import EventOrganizersScreen from "../components/cards/Business/NearByEvents";
import InsuranceAgentsCard from "../components/cards/Business/NearByInsuranceAgents";
import NearbyLawyerCard from "../components/cards/Business/NearByLawyers";
import MarketingAgenciesCard from "../components/cards/Business/NearByMarketingAgents";
import NearbyNotaryCard from "../components/cards/Business/NearByNotaryCard";
import RegistrationConsultantsCard from "../components/cards/Business/NearByConsultantCard";
import NearbyPrintingCard from "../components/cards/Business/NearByPrinitingCard";
import PlacementServicesScreen from "../components/cards/Business/NearByPlacement";

// ============================================================================
// SUBCATEGORY → CARD COMPONENT MAP
// ============================================================================
type CardKey =
    | "ca"
    | "event"
    | "insurance"
    | "lawyer"
    | "marketing"
    | "notary"
    | "consultant"
    | "printing"
    | "placement";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    ca: CharteredAccountantCard,
    event: EventOrganizersScreen,
    insurance: InsuranceAgentsCard,
    lawyer: NearbyLawyerCard,
    marketing: MarketingAgenciesCard,
    notary: NearbyNotaryCard,
    consultant: RegistrationConsultantsCard,
    printing: NearbyPrintingCard,
    placement: PlacementServicesScreen,
};

// ============================================================================
// HELPERS
// ============================================================================
const normalizeSubcategory = (sub: string | undefined): string => {
    if (!sub) return "";
    return sub.toLowerCase();
};

const resolveCardKey = (text: string | undefined): CardKey | null => {
    if (!text) return null;
    const n = text.toLowerCase();

    if ((n.includes("chartered") && n.includes("accountant")) || n === "ca" || (n.includes("tax") && n.includes("consultant"))) return "ca";
    if (n.includes("event")) return "event";
    if (n.includes("insurance")) return "insurance";
    if (n.includes("lawyer")) return "lawyer";
    if (n.includes("marketing")) return "marketing";
    if (n.includes("notary")) return "notary";
    if (n.includes("placement")) return "placement";
    if (n.includes("printing") || n.includes("xerox")) return "printing";
    if (n.includes("registration") && n.includes("consultant")) return "consultant";
    if (n.includes("consultant")) return "consultant";

    return null;
};

const getCardComponentForSubcategory = (
    subcategory: string | undefined
): React.ComponentType<any> | null => {
    const key = resolveCardKey(subcategory);
    if (key && CARD_MAP[key]) return CARD_MAP[key];
    return CARD_MAP.ca; // Default
};

const shouldShowNearbyCards = (subcategory: string | undefined): boolean => {
    return true; // Always show dummy cards
};

const titleFromSlug = (slug: string | undefined): string => {
    if (!slug) return "All Business & Professional Services";
    return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

const getDisplayTitle = (subcategory: string | undefined) => titleFromSlug(subcategory);

const normalizeType = (type: string): string => type.toLowerCase().trim().replace(/\s+/g, " ");

const getCategoryIcon = (category?: string): string => {
    if (!category) return "💼";
    const c = category.toLowerCase();
    if (c.includes("accountant") || c.includes("ca") || c.includes("tax")) return "💰";
    if (c.includes("event")) return "🎉";
    if (c.includes("insurance")) return "🛡️";
    if (c.includes("lawyer")) return "⚖️";
    if (c.includes("marketing")) return "📢";
    if (c.includes("notary")) return "📝";
    if (c.includes("consultant") || c.includes("registration")) return "📋";
    if (c.includes("printing") || c.includes("xerox")) return "🖨️";
    if (c.includes("placement")) return "👥";
    return "💼";
};

const ensureStringArray = (input: unknown): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) return (input as any[]).map(String).filter(Boolean);
    if (typeof input === "string") return (input as string).split(",").map((s: string) => s.trim()).filter(Boolean);
    return [];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const BusinessServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyServices, setNearbyServices] = useState<BusinessWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
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
                (error) => {
                    console.error("Location error:", error);
                    setLocationError("Unable to retrieve your location.");
                    setFetchingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        };

        getUserLocation();
    }, []);

    // ── Fetch nearby business services when location is available ─────────────
    useEffect(() => {
        const fetchNearbyBusinessServices = async () => {
            if (!userLocation) return;

            setLoading(true);
            setError("");

            try {
                const distance = 10;
                const response = await getNearbyBusinessServices(
                    userLocation.latitude,
                    userLocation.longitude,
                    distance
                );

                if (response.success && response.data) {
                    const allServices = Array.isArray(response.data) ? response.data : [response.data];

                    if (subcategory) {
                        const targetType = titleFromSlug(subcategory);
                        const normalizedTarget = normalizeType(targetType);
                        const filtered = allServices.filter(
                            (s: BusinessWorker) => s.serviceType && normalizeType(s.serviceType) === normalizedTarget
                        );
                        setNearbyServices(filtered);
                    } else {
                        setNearbyServices(allServices);
                    }
                } else {
                    setNearbyServices([]);
                }
            } catch (err: any) {
                console.error("Error fetching nearby business services:", err);
                setError("Failed to load nearby services");
                setNearbyServices([]);
            } finally {
                setLoading(false);
            }
        };

        if (userLocation) {
            fetchNearbyBusinessServices();
        }
    }, [userLocation, subcategory]);

    const handleView = (service: any) => {
        const id = service.id || service._id;
        navigate(`/business-services/details/${id}`);
    };

    const handleAddPost = () => {
        navigate(
            subcategory
                ? `/add-business-service-form?subcategory=${subcategory}`
                : "/add-business-service-form"
        );
    };

    const openDirections = (service: BusinessWorker) => {
        if (service.latitude && service.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`,
                "_blank"
            );
        } else if (service.area || service.city) {
            const addr = encodeURIComponent(
                [service.area, service.city, service.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const openCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getImageUrls = (images?: string[]): string[] =>
        (images || []).filter(Boolean) as string[];

    // ── Render Business Service Card (matching dummy card style) ──────────────
    const renderBusinessCard = (service: BusinessWorker) => {
        const id = service._id || "";
        const location = [service.area, service.city].filter(Boolean).join(", ") || "Location not set";
        const servicesList = ensureStringArray(service.skills || service.services);
        const imageUrls = getImageUrls(service.images);
        const serviceName = service.title || service.name || "Unnamed Service";
        const category = service.serviceType || service.category || "";

        let distance: string | null = null;
        if (userLocation && service.latitude && service.longitude) {
            const dist = calculateDistance(
                userLocation.latitude, userLocation.longitude,
                service.latitude, service.longitude
            );
            distance = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(service)}
            >
                {/* Image Section - Fixed height like dummy cards */}
                <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img src={imageUrls[0]} alt={serviceName} className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{getCategoryIcon(category)}</span>
                        </div>
                    )}

                    {/* Live Data Badge - Top Left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Image Counter - Bottom Right */}
                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* Body - Consistent padding like dummy cards */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 leading-tight">
                        {serviceName}
                    </h2>

                    <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 text-sm mt-0.5 flex-shrink-0">📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {distance && (
                        <p className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                            <span>📍</span>{distance} away
                        </p>
                    )}

                    {(service.description || service.bio) && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {service.description || service.bio}
                        </p>
                    )}

                    {(service.experience || service.serviceCharge) && (
                        <div className="flex items-center justify-between">
                            {service.experience && (
                                <span className="text-sm text-gray-700 flex items-center gap-1">
                                    <span>📅</span>{service.experience} yrs exp
                                </span>
                            )}
                            {service.serviceCharge && (
                                <span className="text-sm font-bold text-green-600">
                                    ₹{service.serviceCharge}{service.chargeType ? `/${service.chargeType}` : ''}
                                </span>
                            )}
                        </div>
                    )}

                    {category && (
                        <div className="pt-1">
                            <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200 font-medium">
                                {getCategoryIcon(category)} {category}
                            </span>
                        </div>
                    )}

                    {servicesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 mt-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Services</p>
                            <div className="flex flex-wrap gap-1.5">
                                {servicesList.slice(0, 3).map((s, idx) => (
                                    <span key={`${id}-${idx}`}
                                        className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
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

                    {/* Action Buttons - Grid layout matching dummy cards */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); openDirections(service); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors active:bg-blue-100"
                        >
                            <span>📍</span>Directions
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); service.phone && openCall(service.phone); }}
                            disabled={!service.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${service.phone
                                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                        >
                            <span>📞</span>Call
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

                {/* Cards Grid - Match dummy cards layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyServices.map(renderBusinessCard)}
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

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{getDisplayTitle(subcategory)}</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage Business & Professional services</p>
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f] text-white"
                    >
                        + Create Business Service
                    </Button>
                </div>

                {/* Location Status */}
                {fetchingLocation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        <span className="text-sm text-blue-700">Getting your location...</span>
                    </div>
                )}

                {locationError && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg">
                        <p className="text-yellow-700 text-sm">{locationError}</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                )}

                {/* DUMMY CARDS FIRST */}
                {shouldShowNearbyCards(subcategory) && (
                    <div className="space-y-4">
                        {renderCardsSection()}
                    </div>
                )}

                {/* YOUR SERVICES (API DATA) SECOND */}
                {userLocation && !fetchingLocation && renderYourServices()}
            </div>
        </div>
    );
};

export default BusinessServicesList;
