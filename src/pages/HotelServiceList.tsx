import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const BRAND = "#00598a";
const BRAND_DARK = "#004a73";

// ── Helper: resolve phone from any field name ─────────────────────────────────
const getHotelPhone = (hotel: any): string =>
    hotel.phone || hotel.phoneNumber || hotel.mobile || hotel.contact || "";

// ============================================================================
// PHONE POPUP
// ============================================================================
interface PhonePopupProps {
    phone: string;
    name: string;
    onClose: () => void;
}

const PhonePopup: React.FC<PhonePopupProps> = ({ phone, name, onClose }) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
                onClick={e => e.stopPropagation()}
            >
                {/* Icon */}
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,89,138,0.1)" }}
                >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" style={{ color: BRAND }}>
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                </div>

                {/* Name */}
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Contact</p>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{name}</h3>
                </div>

                {/* Phone number */}
                <div
                    className="w-full text-center py-3 px-4 rounded-xl"
                    style={{ backgroundColor: "rgba(0,89,138,0.07)", border: "1px solid rgba(0,89,138,0.2)" }}
                >
                    <p className="text-xl font-bold tracking-wide" style={{ color: BRAND }}>{phone}</p>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3 w-full">
                    <a
                        href={`tel:${phone}`}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                        style={{ backgroundColor: BRAND }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Call Now
                    </a>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                        style={{ color: BRAND, border: `2px solid ${BRAND}`, backgroundColor: "transparent" }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = BRAND;
                            (e.currentTarget as HTMLElement).style.color = "#fff";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLElement).style.color = BRAND;
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

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
    return slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [phonePopup, setPhonePopup] = useState<{ phone: string; name: string } | null>(null);

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
                const res = await getNearbyHotels(userLocation.latitude, userLocation.longitude, 10);
                if (res?.success && res.data) {
                    const all: Hotel[] = Array.isArray(res.data) ? res.data : [res.data];
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
    }, [userLocation]);

    // ── Navigation ───────────────────────────────────────────────────────────
    const handleView = (hotel: any) => navigate(`/hotel-services/details/${hotel._id || hotel.id}`);
    const handleAddPost = () =>
        navigate(subcategory ? `/add-hotel-service-form?subcategory=${subcategory}` : "/add-hotel-service-form");

    const openDirections = (hotel: Hotel) => {
        if (hotel.latitude && hotel.longitude)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${hotel.latitude},${hotel.longitude}`, "_blank");
        else if (hotel.area || hotel.city) {
            const addr = encodeURIComponent([hotel.area, hotel.city, hotel.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const handleCallClick = (e: React.MouseEvent, hotel: Hotel) => {
        e.stopPropagation();
        const phone = getHotelPhone(hotel);
        console.log("📞 Call clicked — resolved phone:", phone);
        if (phone) {
            setPhonePopup({ phone, name: hotel.name || hotel.type || "Hotel Service" });
        } else {
            alert("Phone number not available for this service.");
        }
    };

    // ============================================================================
    // HOTEL CARD
    // ============================================================================
    const renderHotelCard = (hotel: Hotel) => {
        const id = hotel._id || hotel.id || "";
        const location = [hotel.area, hotel.city].filter(Boolean).join(", ") || "Location not specified";
        const servicesList: string[] =
            typeof hotel.service === "string"
                ? hotel.service.split(",").map(s => s.trim()).filter(Boolean)
                : Array.isArray(hotel.service) ? hotel.service : [];
        const imageUrls = (hotel.images || []).filter(Boolean) as string[];
        const isHovered = hoveredCard === id;
        const phone = getHotelPhone(hotel);

        let distance: string | null = null;
        if (userLocation && hotel.latitude && hotel.longitude) {
            const dist = calculateDistance(userLocation.latitude, userLocation.longitude, hotel.latitude, hotel.longitude);
            distance = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200"
                style={{
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: isHovered ? BRAND : "#f3f4f6",
                    boxShadow: isHovered ? "0 8px 24px rgba(0,89,138,0.15)" : "0 1px 3px rgba(0,0,0,0.06)",
                    transform: isHovered ? "translateY(-2px)" : "none",
                }}
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleView(hotel)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={hotel.name || "Hotel"}
                            className="w-full h-full object-cover transition-transform duration-300"
                            style={{ transform: isHovered ? "scale(1.03)" : "scale(1)" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center transition-colors duration-200"
                            style={{ backgroundColor: isHovered ? "rgba(0,89,138,0.07)" : "#f3f4f6" }}
                        >
                            <span className="text-5xl">{getIcon(subcategory, hotel.type)}</span>
                        </div>
                    )}

                    {/* Live Data badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span
                            className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md"
                            style={{ backgroundColor: BRAND }}
                        >
                            Live Data
                        </span>
                    </div>

                    {/* Availability badge */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md bg-green-500 text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            Available
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
                    <h2
                        className="text-lg font-semibold line-clamp-1 leading-tight transition-colors duration-200"
                        style={{ color: isHovered ? BRAND : "#111827" }}
                    >
                        {hotel.name || hotel.type || "Hotel Service"}
                    </h2>

                    <div className="flex items-start gap-1.5">
                        <span className="text-sm mt-0.5 flex-shrink-0" style={{ color: isHovered ? BRAND : "#9ca3af" }}>📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {distance && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: BRAND }}>
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {hotel.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{hotel.description}</p>
                    )}

                    {hotel.type && (
                        <div className="pt-1">
                            <span
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border font-medium transition-colors duration-200"
                                style={isHovered
                                    ? { backgroundColor: "rgba(0,89,138,0.08)", color: BRAND, borderColor: "rgba(0,89,138,0.3)" }
                                    : { backgroundColor: "rgba(0,89,138,0.05)", color: BRAND, borderColor: "rgba(0,89,138,0.2)" }
                                }
                            >
                                {getIcon(hotel.type)} {hotel.type}
                            </span>
                        </div>
                    )}

                    {/* Rating + Price */}
                    <div className="flex items-center justify-between pt-0.5">
                        {hotel.ratings ? (
                            <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">⭐ {hotel.ratings}</span>
                        ) : <span />}
                        {hotel.priceRange && (
                            <div className="text-right">
                                <span className="text-sm font-bold" style={{ color: BRAND }}>₹{hotel.priceRange}</span>
                                <span className="text-xs text-gray-500 ml-1">/ night</span>
                            </div>
                        )}
                    </div>

                    {/* Services tags */}
                    {servicesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 mt-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Services</p>
                            <div className="flex flex-wrap gap-1.5">
                                {servicesList.slice(0, 3).map((s, idx) => (
                                    <span
                                        key={`${id}-${idx}`}
                                        className="inline-flex items-center text-xs px-2 py-1 rounded border transition-colors duration-200"
                                        style={isHovered
                                            ? { backgroundColor: "rgba(0,89,138,0.07)", color: BRAND, borderColor: "rgba(0,89,138,0.25)" }
                                            : { backgroundColor: "#f3f4f6", color: "#374151", borderColor: "#e5e7eb" }
                                        }
                                    >
                                        {s}
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
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(hotel); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                            style={{ border: `2px solid ${BRAND}`, color: BRAND, backgroundColor: "transparent" }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = BRAND;
                                (e.currentTarget as HTMLElement).style.color = "#fff";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLElement).style.color = BRAND;
                            }}
                        >
                            <span>📍</span> Directions
                        </button>

                        <button
                            onClick={e => handleCallClick(e, hotel)}
                            disabled={!phone}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                            style={phone
                                ? { backgroundColor: BRAND, color: "#fff" }
                                : { backgroundColor: "#d1d5db", color: "#9ca3af", cursor: "not-allowed" }
                            }
                            onMouseEnter={e => { if (phone) (e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK; }}
                            onMouseLeave={e => { if (phone) (e.currentTarget as HTMLElement).style.backgroundColor = BRAND; }}
                            title={phone ? `Call ${phone}` : "No phone number available"}
                        >
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Dummy cards ───────────────────────────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} userLocation={userLocation} />;
    };

    // ── Nearby services section ───────────────────────────────────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: BRAND }} />
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
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span
                        className="inline-flex items-center justify-center min-w-[2rem] h-7 text-white text-sm font-bold rounded-full px-2.5"
                        style={{ backgroundColor: BRAND }}
                    >
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
    // MAIN RENDER
    // ============================================================================
    return (
        <div
            className="min-h-screen"
            style={{ background: "linear-gradient(to bottom, rgba(0,89,138,0.04), white)" }}
        >
            {/* ── Phone Popup ── */}
            {phonePopup && (
                <PhonePopup
                    phone={phonePopup.phone}
                    name={phonePopup.name}
                    onClose={() => setPhonePopup(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{titleFromSlug(subcategory)}</h1>
                        <p className="text-sm text-gray-500 mt-1">Find hotel & travel services near you</p>
                    </div>
                    <button
                        onClick={handleAddPost}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ backgroundColor: BRAND }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND}
                    >
                        + Add Post
                    </button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div
                        className="rounded-lg p-3 flex items-center gap-2"
                        style={{ backgroundColor: "rgba(0,89,138,0.08)", border: "1px solid rgba(0,89,138,0.2)" }}
                    >
                        <div
                            className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full"
                            style={{ borderColor: BRAND, borderTopColor: "transparent" }}
                        />
                        <span className="text-sm" style={{ color: BRAND }}>Getting your location...</span>
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
                <div className="space-y-4">{renderDummyCards()}</div>

                {/* 2. API DATA SECOND */}
                {userLocation && !fetchingLocation && renderNearbyServices()}

            </div>
        </div>
    );
};

export default HotelServicesList;