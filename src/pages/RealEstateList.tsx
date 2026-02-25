import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyRealEstates, RealEstateWorker } from "../services/RealEstate.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbyPropertyDealersCard from "../components/cards/RealEstate/NearProperty";
import NearbyBuildersCard from "../components/cards/RealEstate/NearByBuilders";
import NearbyInteriorDesignersCard from "../components/cards/RealEstate/NearByInteriorDesigns";
import NearbyRentLeaseCard from "../components/cards/RealEstate/NearByrental";
import NearbyConstructionContractorsCard from "../components/cards/RealEstate/NearByConstructorContractors";

// ============================================================================
// CARD MAP
// ============================================================================
type CardKey = "property" | "builder" | "interior" | "rental" | "construction";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    property: NearbyPropertyDealersCard,
    builder: NearbyBuildersCard,
    interior: NearbyInteriorDesignersCard,
    rental: NearbyRentLeaseCard,
    construction: NearbyConstructionContractorsCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("property") && (n.includes("dealer") || n.includes("agent"))) return "property";
    if (n.includes("builder")) return "builder";
    if (n.includes("interior") || n.includes("design")) return "interior";
    if (n.includes("rent") || n.includes("lease") || n.includes("rental")) return "rental";
    if (n.includes("construction") || n.includes("contractor")) return "construction";
    return "property";
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Real Estate Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// CALL POPUP COMPONENT
// ============================================================================
interface CallPopupProps {
    phone: string;
    name: string;
    onClose: () => void;
}

const CallPopup: React.FC<CallPopupProps> = ({ phone, name, onClose }) => {
    // Close on backdrop click
    const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape
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
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div
                    className="px-6 py-5 text-center"
                    style={{ background: "linear-gradient(135deg, #00598a 0%, #007ab8 100%)" }}
                >
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <h3 className="text-white font-bold text-lg line-clamp-1">{name}</h3>
                    <p className="text-white/70 text-sm mt-1">Contact Property Owner</p>
                </div>

                {/* Phone display */}
                <div className="px-6 py-6 text-center">
                    <p className="text-gray-500 text-sm mb-2">Phone Number</p>
                    <div className="flex items-center justify-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                        <span className="text-gray-400 text-lg">📞</span>
                        <span className="text-2xl font-bold tracking-widest" style={{ color: "#00598a" }}>
                            +91 {phone}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 mt-5">
                        <a
                            href={`tel:+91${phone}`}
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90 active:scale-95"
                            style={{ backgroundColor: "#00598a" }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            Call Now
                        </a>
                        <button
                            onClick={onClose}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm border-2 transition-all active:scale-95"
                            style={{ borderColor: "#00598a", color: "#00598a" }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00598a";
                                (e.currentTarget as HTMLButtonElement).style.color = "white";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#00598a";
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

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const RealEstateList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyRealEstates, setNearbyRealEstates] = useState<RealEstateWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // Call popup state
    const [callPopup, setCallPopup] = useState<{ phone: string; name: string } | null>(null);

    // ── Get user location ────────────────────────────────────────────────────
    useEffect(() => {
        setFetchingLocation(true);
        if (!navigator.geolocation) { setLocationError("Geolocation not supported"); setFetchingLocation(false); return; }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
                setFetchingLocation(false);
            },
            (err) => { console.error(err); setLocationError("Unable to retrieve your location."); setFetchingLocation(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    // ── Fetch nearby when location ready ─────────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetch_ = async () => {
            setLoading(true); setError("");
            try {
                const res = await getNearbyRealEstates(userLocation.latitude, userLocation.longitude, 10);
                if (res?.success && res.data) {
                    const all = Array.isArray(res.data) ? res.data : [res.data];
                    setNearbyRealEstates(all);
                } else { setNearbyRealEstates([]); }
            } catch (e) {
                setError("Failed to load nearby properties");
                setNearbyRealEstates([]);
            } finally { setLoading(false); }
        };
        fetch_();
    }, [userLocation]);

    const handleView = (re: any) => navigate(`/real-estate/details/${re._id || re.id}`);
    const handleAddPost = () => navigate(subcategory ? `/add-real-estate-form?subcategory=${subcategory}` : "/add-real-estate-form");

    const openDirections = (re: RealEstateWorker) => {
        if (re.latitude && re.longitude)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${re.latitude},${re.longitude}`, "_blank");
        else if (re.area || re.city)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([re.address, re.area, re.city, re.state].filter(Boolean).join(", "))}`, "_blank");
    };

    const handleCallClick = (e: React.MouseEvent, re: RealEstateWorker) => {
        e.stopPropagation();
        if (!re.phone) return;
        setCallPopup({
            phone: re.phone,
            name: re.name || `${re.propertyType} — ${re.listingType}` || "Property",
        });
    };

    // ============================================================================
    // REAL API CARD
    // ============================================================================
    const renderRealEstateCard = (re: RealEstateWorker) => {
        const id = re._id || "";
        const location = [re.area, re.city].filter(Boolean).join(", ") || "Location not set";
        const amenitiesList: string[] =
            typeof re.amenities === "string"
                ? re.amenities.split(",").map(a => a.trim()).filter(Boolean)
                : Array.isArray(re.amenities) ? re.amenities : [];
        const imageUrls = (re.images || []).filter(Boolean) as string[];

        let distance: string | null = null;
        if (userLocation && re.latitude && re.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, re.latitude, re.longitude);
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100 group"
                onClick={() => handleView(re)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={re.name || "Property"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 group-hover:bg-[#00598a]/5 transition-colors duration-200">
                            <span className="text-5xl">🏠</span>
                        </div>
                    )}

                    {/* Live Data badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span
                            className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md"
                            style={{ backgroundColor: "#00598a" }}
                        >
                            Live Data
                        </span>
                    </div>

                    {/* Availability badge */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${re.availabilityStatus === "Available" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {re.availabilityStatus || "Available"}
                        </span>
                    </div>

                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex flex-col gap-2.5 flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-[#00598a] transition-colors duration-200">
                        {re.propertyType} — {re.listingType}
                    </h2>

                    {re.name && <p className="text-sm font-medium text-gray-700">{re.name}</p>}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: "#00598a" }}>
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Bedrooms + Area + Price */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            {re.bedrooms > 0 && (
                                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">🛏️ {re.bedrooms} BHK</span>
                            )}
                            {re.areaSize && (
                                <span className="text-sm text-gray-600 flex items-center gap-1">📏 {re.areaSize} sq ft</span>
                            )}
                        </div>
                        {re.price && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">{re.listingType}</p>
                                <p className="text-base font-bold" style={{ color: "#00598a" }}>₹{Number(re.price).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {/* Amenities */}
                    {amenitiesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Amenities</p>
                            <div className="flex flex-wrap gap-1.5">
                                {amenitiesList.slice(0, 3).map((a, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200">
                                        <span style={{ color: "#00598a" }}>●</span> {a}
                                    </span>
                                ))}
                                {amenitiesList.length > 3 && (
                                    <span className="text-xs font-medium px-1 py-1" style={{ color: "#00598a" }}>
                                        +{amenitiesList.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-auto">
                        {/* Directions */}
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(re); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 rounded-lg font-medium text-sm transition-all active:scale-95"
                            style={{ borderColor: "#00598a", color: "#00598a" }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00598a";
                                (e.currentTarget as HTMLButtonElement).style.color = "white";
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#00598a";
                            }}
                        >
                            <span>📍</span> Directions
                        </button>

                        {/* Call */}
                        <button
                            onClick={e => handleCallClick(e, re)}
                            disabled={!re.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all active:scale-95 ${!re.phone ? "bg-gray-300 text-gray-500 cursor-not-allowed" : "text-white"}`}
                            style={re.phone ? { backgroundColor: "#00598a" } : {}}
                            onMouseEnter={e => {
                                if (!re.phone) return;
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#004a73";
                            }}
                            onMouseLeave={e => {
                                if (!re.phone) return;
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00598a";
                            }}
                        >
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── DUMMY CARDS ──────────────────────────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── NEARBY SERVICES ──────────────────────────────────────────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: "#00598a" }} />
                </div>
            );
        }

        if (nearbyRealEstates.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🏠</div>
                    <p className="text-gray-500 font-medium">No properties found in your area.</p>
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
                        style={{ backgroundColor: "#00598a" }}
                    >
                        {nearbyRealEstates.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyRealEstates.map(renderRealEstateCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50/30 to-white">
            {/* ── Call Popup ── */}
            {callPopup && (
                <CallPopup
                    phone={callPopup.phone}
                    name={callPopup.name}
                    onClose={() => setCallPopup(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find properties near you</p>
                    </div>
                    <button
                        onClick={handleAddPost}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-all shadow-md hover:shadow-lg active:scale-95"
                        style={{ backgroundColor: "#00598a" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#004a73"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#00598a"; }}
                    >
                        + Add Listing
                    </button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="border rounded-lg p-3 flex items-center gap-2" style={{ backgroundColor: "#00598a0d", borderColor: "#00598a33" }}>
                        <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" style={{ borderColor: "#00598a", borderTopColor: "transparent" }} />
                        <span className="text-sm font-medium" style={{ color: "#00598a" }}>Getting your location...</span>
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

export default RealEstateList;