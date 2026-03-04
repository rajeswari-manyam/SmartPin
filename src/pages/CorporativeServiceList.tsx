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
   CALL POPUP COMPONENT
============================================================================ */
interface CallPopupProps {
    phone: string;
    serviceName: string;
    onClose: () => void;
}

const CallPopup: React.FC<CallPopupProps> = ({ phone, serviceName, onClose }) => {
    // Close on backdrop click
    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape key
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
                {/* Header */}
                <div className="px-6 py-5 text-center" style={{ background: 'linear-gradient(135deg, #00598a 0%, #007ab8 100%)' }}>
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{serviceName}</h3>
                    <p className="text-white/70 text-sm mt-1">Contact Service Provider</p>
                </div>

                {/* Phone number display */}
                <div className="px-6 py-6 text-center">
                    <p className="text-gray-500 text-sm mb-2">Phone Number</p>
                    <div className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <span className="text-gray-400 text-lg">📞</span>
                        <span className="text-2xl font-bold tracking-widest" style={{ color: '#00598a' }}>
                            +91 {phone}
                        </span>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        {/* Call Now */}
                        <a
                            href={`tel:+91${phone}`}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:bg-[#00598a]/90 active:scale-95"
                            style={{ backgroundColor: '#00598a' }}
                            onClick={onClose}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call Now
                        </a>

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:text-white active:scale-95"
                            style={{ borderColor: '#00598a', color: '#00598a' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00598a';
                                (e.currentTarget as HTMLButtonElement).style.color = 'white';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                                (e.currentTarget as HTMLButtonElement).style.color = '#00598a';
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

/* ============================================================================
   MAIN COMPONENT
============================================================================ */
const CorporateServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyServices, setNearbyServices] = useState<CorporateWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // Call popup state
    const [callPopup, setCallPopup] = useState<{ phone: string; serviceName: string } | null>(null);

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
                setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
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
                const response = await getNearbyCorporateWorkers(userLocation.latitude, userLocation.longitude, 10);
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

    const handleCall = (e: React.MouseEvent, service: CorporateWorker) => {
        e.stopPropagation();
        const phone = service.phone || "";
        if (!phone) return;
        setCallPopup({ phone, serviceName: service.serviceName || "Corporate Service" });
    };

    /* ============================================================================
       REAL API CARD
    ============================================================================ */
    const renderCorporateCard = (service: CorporateWorker) => {
        const id = service._id || service.id || "";
        const location = [service.area, service.city].filter(Boolean).join(", ") || "Location not specified";
        const imageUrls = (service.images || []).filter(Boolean) as string[];

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
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100 group"
                onClick={() => handleView(service)}
                style={{ '--hover-color': '#00598a' } as React.CSSProperties}
            >
                {/* ── Image ── */}
                <div className="relative h-48 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.serviceName || "Corporate Service"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 group-hover:bg-[#00598a]/150 transition-colors duration-200">
                            <span className="text-5xl">{getIcon(subcategory || service.subCategory)}</span>
                        </div>
                    )}

                    {/* Live Data badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md" style={{ backgroundColor: '#00598a' }}>
                            Live Data
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
                <div className="p-4 flex flex-col gap-2.5 flex-1">
                    {/* Title */}
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 leading-tight group-hover:text-[#00598a] transition-colors duration-200">
                        {service.serviceName || "Corporate Service"}
                    </h2>

                    {/* Location */}
                    <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 text-sm mt-0.5 flex-shrink-0">📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {/* Distance */}
                    {distance && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: '#00598a' }}>
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
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border font-medium"
                                style={{ backgroundColor: '#00598a0d', color: '#00598a', borderColor: '#00598a33' }}>
                                🏢 {service.subCategory}
                            </span>
                        </div>
                    )}

                    {/* Charge */}
                    {service.serviceCharge && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-sm font-bold" style={{ color: '#00598a' }}>
                                ₹{service.serviceCharge}
                            </span>
                            {service.chargeType && (
                                <span className="text-xs text-gray-500">/ {service.chargeType}</span>
                            )}
                        </div>
                    )}

                    {/* ── Action Buttons: 3 cols ── */}
                    <div className="grid grid-cols-3 gap-2 pt-3 mt-auto">
                        {/* Directions */}
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
                            className="flex items-center justify-center gap-1 px-2 py-2.5 border-2 rounded-lg font-medium text-xs transition-all hover:text-white active:scale-95"
                            style={{ borderColor: '#00598a', color: '#00598a' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00598a';
                                (e.currentTarget as HTMLButtonElement).style.color = 'white';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                                (e.currentTarget as HTMLButtonElement).style.color = '#00598a';
                            }}
                        >
                            📍 Dir.
                        </button>

                        {/* Call */}
                        <button
                            onClick={(e) => handleCall(e, service)}
                            className="flex items-center justify-center gap-1 px-2 py-2.5 border-2 rounded-lg font-medium text-xs transition-all hover:text-white active:scale-95"
                            style={{ borderColor: '#00598a', color: '#00598a' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00598a';
                                (e.currentTarget as HTMLButtonElement).style.color = 'white';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                                (e.currentTarget as HTMLButtonElement).style.color = '#00598a';
                            }}
                        >
                            📞 Call
                        </button>

                        {/* View */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleView(service); }}
                            className="flex items-center justify-center gap-1 px-2 py-2.5 rounded-lg font-medium text-xs text-white transition-all active:scale-95"
                            style={{ backgroundColor: '#00598a' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#004a73'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00598a'; }}
                        >
                            👁️ View
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
        return <Card onViewDetails={handleView} nearbyData={undefined} userLocation={userLocation} />;
    };

    /* ============================================================================
       REAL SERVICES GRID
    ============================================================================ */
    const renderYourServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00598a' }} />
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
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 text-white text-sm font-bold rounded-full px-2.5" style={{ backgroundColor: '#00598a' }}>
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
            {/* ── Call Popup ── */}
            {callPopup && (
                <CallPopup
                    phone={callPopup.phone}
                    serviceName={callPopup.serviceName}
                    onClose={() => setCallPopup(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{titleFromSlug(subcategory)}</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage Corporate & Business services</p>
                    </div>

                    <button
                        onClick={handleAddPost}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                        style={{ backgroundColor: '#00598a' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#004a73'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#00598a'; }}
                    >
                        + Attach Corporate & Office Service
                    </button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="border rounded-lg p-3 flex items-center gap-2" style={{ backgroundColor: '#00598a0d', borderColor: '#00598a33' }}>
                        <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" style={{ borderColor: '#00598a', borderTopColor: 'transparent' }} />
                        <span className="text-sm font-medium" style={{ color: '#00598a' }}>Getting your location...</span>
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