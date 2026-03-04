import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyDigitalWorkers, DigitalWorker } from "../services/DigitalService.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbyCCTVCard from "../components/cards/Tech&DigitalService/NearByCCTVCard";
import NearbyDigitalMarketingCard from "../components/cards/Tech&DigitalService/NearByDigitalMarketingCard";
import NearbyGraphicDesignerCard from "../components/cards/Tech&DigitalService/NearByGraphicCard";
import NearbyInternetWebsiteCard from "../components/cards/Tech&DigitalService/NearbyInternetWebsiteCard";
import NearbyLaptopRepairCard from "../components/cards/Tech&DigitalService/NearByLaptop";
import NearbyMobileRepairCard from "../components/cards/Tech&DigitalService/NearByMobileCard";
import NearbySoftwareCard from "../components/cards/Tech&DigitalService/NearBysoftwareCard";
import NearbyWebsiteCard from "../components/cards/Tech&DigitalService/NearByWebsiteCard";

// ============================================================================
// CARD MAP
// ============================================================================
type CardKey =
    | "cctv" | "digital-marketing" | "graphic-design" | "internet-website"
    | "laptop-repair" | "mobile-repair" | "software" | "website";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    "cctv": NearbyCCTVCard,
    "digital-marketing": NearbyDigitalMarketingCard,
    "graphic-design": NearbyGraphicDesignerCard,
    "internet-website": NearbyInternetWebsiteCard,
    "laptop-repair": NearbyLaptopRepairCard,
    "mobile-repair": NearbyMobileRepairCard,
    "software": NearbySoftwareCard,
    "website": NearbyWebsiteCard,
};

// ── Brand color ──────────────────────────────────────────────────────────────
const BRAND = "#00598a";
const BRAND_DARK = "#004a73";

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("cctv") || (n.includes("security") && n.includes("system"))) return "cctv";
    if (n.includes("digital") && n.includes("marketing")) return "digital-marketing";
    if (n.includes("graphic") && n.includes("design")) return "graphic-design";
    if (n.includes("internet") && n.includes("website")) return "internet-website";
    if (n.includes("laptop") && n.includes("repair")) return "laptop-repair";
    if (n.includes("mobile") && n.includes("repair")) return "mobile-repair";
    if (n.includes("software")) return "software";
    return "website";
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Tech & Digital Services";
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

const getServiceIcon = (category?: string): string => {
    if (!category) return "💻";
    const n = category.toLowerCase();
    if (n.includes("website") || n.includes("web")) return "🌐";
    if (n.includes("mobile") || n.includes("app")) return "📱";
    if (n.includes("graphic") || n.includes("design")) return "🎨";
    if (n.includes("marketing") || n.includes("seo")) return "📈";
    if (n.includes("software") || n.includes("development")) return "⚙️";
    if (n.includes("cctv") || n.includes("security")) return "📹";
    if (n.includes("repair")) return "🔧";
    return "💻";
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const DigitalServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyData, setNearbyData] = useState<DigitalWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── hover state trackers ─────────────────────────────────────────────────
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [hoveredDir, setHoveredDir] = useState<string | null>(null);
    const [hoveredCall, setHoveredCall] = useState<string | null>(null);

    // ── phone popup ──────────────────────────────────────────────────────────
    const [phonePopup, setPhonePopup] = useState<{ name: string; phone: string } | null>(null);

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

    // ── Fetch nearby when location ready ─────────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const load = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await getNearbyDigitalWorkers(userLocation.latitude, userLocation.longitude, 10);
                if (res?.success && res.data) {
                    const all = Array.isArray(res.data) ? res.data : [res.data];
                    setNearbyData(all);
                } else {
                    setNearbyData([]);
                }
            } catch (e) {
                console.error(e);
                setError("Failed to load nearby digital services");
                setNearbyData([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userLocation]);

    // ── Navigation ───────────────────────────────────────────────────────────
    const handleView = (service: any) => navigate(`/tech-services/details/${service._id || service.id}`);

    const handleAddPost = () =>
        navigate(subcategory ? `/add-digital-service-form?subcategory=${subcategory}` : "/add-digital-service-form");

    const openDirections = (service: DigitalWorker) => {
        if (service.latitude && service.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`,
                "_blank"
            );
        } else if (service.area || service.city) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    [service.area, service.city, service.state].filter(Boolean).join(", ")
                )}`,
                "_blank"
            );
        }
    };

    const openCall = (name: string, phone: string) => {
        setPhonePopup({ name, phone });
    };

    // ── Dummy cards ───────────────────────────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── Single live API card ──────────────────────────────────────────────────
    const renderDigitalCard = (service: DigitalWorker) => {
        const id = service._id || "";
        const location =
            [service.area, service.city, service.state].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const servicesList = service.services || [];
        const icon = getServiceIcon(service.category);
        const serviceName = service.name || "Unnamed Service";

        let distance: string | null = null;
        if (userLocation && service.latitude && service.longitude) {
            const d = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                Number(service.latitude),
                Number(service.longitude)
            );
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        const isCardHovered = hoveredCard === id;
        const isDirHovered = hoveredDir === id;
        const isCallHovered = hoveredCall === id;

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer transition-all duration-200"
                style={{
                    border: `1px solid ${isCardHovered ? BRAND : "#f3f4f6"}`,
                    boxShadow: isCardHovered
                        ? `0 8px 25px -5px ${BRAND}40`
                        : "0 1px 3px 0 rgb(0 0 0 / 0.1)",
                    transform: isCardHovered ? "translateY(-3px)" : "translateY(0)",
                }}
                onClick={() => handleView(service)}
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
            >
                {/* Image */}
                <div
                    className="relative h-48 overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${BRAND}10, ${BRAND}1a)` }}
                >
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={serviceName}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{icon}</span>
                        </div>
                    )}

                    {/* Live Data — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span
                            className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md"
                            style={{ backgroundColor: BRAND }}
                        >
                            Live Data
                        </span>
                    </div>

                    {/* Availability — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${
                            service.availability ? "bg-green-500 text-white" : "bg-red-500 text-white"
                        }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {service.availability ? "Available" : "Unavailable"}
                        </span>
                    </div>

                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {serviceName}
                    </h2>

                    {service.category && (
                        <span
                            className="inline-flex items-center text-xs px-2.5 py-1 rounded-md border font-medium self-start"
                            style={{
                                backgroundColor: `${BRAND}12`,
                                color: BRAND,
                                borderColor: `${BRAND}40`,
                            }}
                        >
                            {service.category}
                        </span>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: BRAND }}>
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Experience + Charge */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            {service.experience && (
                                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    💼 {service.experience} yrs exp
                                </span>
                            )}
                        </div>
                        {service.serviceCharge && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">
                                    {service.chargeType || "Charge"}
                                </p>
                                <p className="text-base font-bold" style={{ color: BRAND }}>
                                    ₹{Number(service.serviceCharge).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Services offered */}
                    {servicesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Services
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {servicesList.slice(0, 3).map((s, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border"
                                        style={{
                                            backgroundColor: `${BRAND}10`,
                                            color: BRAND,
                                            borderColor: `${BRAND}30`,
                                        }}
                                    >
                                        <span style={{ color: BRAND }}>●</span> {s}
                                    </span>
                                ))}
                                {servicesList.length > 3 && (
                                    <span className="text-xs font-medium px-1 py-1" style={{ color: BRAND }}>
                                        +{servicesList.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Directions + Call */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        {/* Directions — outlined, fills on hover */}
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(service); }}
                            onMouseEnter={() => setHoveredDir(id)}
                            onMouseLeave={() => setHoveredDir(null)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150"
                            style={{
                                border: `2px solid ${BRAND}`,
                                color: isDirHovered ? "#fff" : BRAND,
                                backgroundColor: isDirHovered ? BRAND : "transparent",
                            }}
                        >
                            <span>📍</span> Directions
                        </button>

                        {/* Call — solid, opens popup */}
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                service.phone && openCall(serviceName, service.phone);
                            }}
                            onMouseEnter={() => setHoveredCall(id)}
                            onMouseLeave={() => setHoveredCall(null)}
                            disabled={!service.phone}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-150"
                            style={
                                service.phone
                                    ? {
                                        backgroundColor: isCallHovered ? BRAND_DARK : BRAND,
                                        color: "#fff",
                                        cursor: "pointer",
                                    }
                                    : {
                                        backgroundColor: "#d1d5db",
                                        color: "#6b7280",
                                        cursor: "not-allowed",
                                    }
                            }
                        >
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Nearby services section ───────────────────────────────────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div
                        className="animate-spin rounded-full h-8 w-8 border-b-2"
                        style={{ borderColor: BRAND }}
                    />
                </div>
            );
        }

        if (nearbyData.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">💻</div>
                    <p className="text-gray-500 font-medium">No digital services found in your area.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span
                        className="inline-flex items-center justify-center min-w-[2rem] h-7 text-white text-sm font-bold rounded-full px-2.5"
                        style={{ backgroundColor: BRAND }}
                    >
                        {nearbyData.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyData.map(renderDigitalCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    return (
        <>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                                {getDisplayTitle(subcategory)}
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">Find digital services near you</p>
                        </div>
                        <Button
                            variant="primary"
                            size="md"
                            onClick={handleAddPost}
                            className="w-full sm:w-auto justify-center bg-[#00598a] hover:bg-[#004a73] text-white"
                        >
                            + Attach Tech & Digital Service
                        </Button>
                    </div>

                    {/* Location status */}
                    {fetchingLocation && (
                        <div
                            className="rounded-lg p-3 flex items-center gap-2 border"
                            style={{
                                backgroundColor: `${BRAND}15`,
                                borderColor: `${BRAND}30`,
                            }}
                        >
                            <div
                                className="animate-spin h-4 w-4 rounded-full border-2"
                                style={{ borderColor: BRAND, borderTopColor: "transparent" }}
                            />
                            <span className="text-sm font-medium" style={{ color: BRAND }}>
                                Getting your location...
                            </span>
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

                    {/* 1. DUMMY CARDS FIRST */}
                    <div className="space-y-4">
                        {renderDummyCards()}
                    </div>

                    {/* 2. API DATA SECOND */}
                    {userLocation && !fetchingLocation && renderNearbyServices()}

                </div>
            </div>

            {/* ── Phone Popup Modal ── */}
            {phonePopup && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
                    onClick={() => setPhonePopup(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div
                            className="px-6 pt-6 pb-4 text-center"
                            style={{ borderBottom: "1px solid #f3f4f6" }}
                        >
                            <div
                                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-3"
                                style={{ backgroundColor: `${BRAND}15` }}
                            >
                                📞
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{phonePopup.name}</h3>
                            <p className="text-sm text-gray-500 mt-0.5">Digital Service</p>
                        </div>

                        {/* Phone number */}
                        <div className="px-6 py-5 text-center">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">
                                Phone Number
                            </p>
                            <a
                                href={`tel:${phonePopup.phone}`}
                                className="text-3xl font-bold tracking-wide transition-colors"
                                style={{ color: BRAND }}
                            >
                                {phonePopup.phone}
                            </a>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 px-6 pb-6">
                            <button
                                onClick={() => setPhonePopup(null)}
                                className="px-4 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <a
                                href={`tel:${phonePopup.phone}`}
                                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-white text-sm transition-colors"
                                style={{ backgroundColor: BRAND }}
                                onClick={() => setPhonePopup(null)}
                            >
                                <span>📞</span> Call Now
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DigitalServicesList;