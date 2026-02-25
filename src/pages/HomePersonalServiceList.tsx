import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyWorkers } from "../services/api.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbyMaidCard from "../components/cards/Home Repair/NearByMaidService";
import NearbyCookCard from "../components/cards/Home Repair/NearByCookingCard";
import BabySitterCard from "../components/cards/Home Repair/NearBy BabySitterServices";
import ElderCareCard from "../components/cards/Home Repair/NearByElderlyCareService";
import HousekeepingCard from "../components/cards/Home Repair/NearByHouseKeepingService";
import NearbyLaundryCard from "../components/cards/Home Repair/NearByLaundaryCard";
import MineralWaterSuppliers from "../components/cards/Home Repair/NearByWaterSuppliers";

const BRAND = "#00598a";
const BRAND_DARK = "#004a73";
const BRAND_DARKER = "#003d5c";

// ============================================================================
// WORKER INTERFACE
// ============================================================================
export interface HomePersonalWorker {
    _id: string;
    userId: string;
    workerId: string;
    name: string;
    category: string[];
    subCategory: string;
    skill: string;
    serviceCharge: number;
    chargeType: "hour" | "day" | "fixed";
    profilePic?: string;
    images?: string[];
    phone?: string;
    phoneNumber?: string;
    mobile?: string;
    contact?: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
}

// ── Helper: resolve phone from any field name ────────────────────────────────
const getWorkerPhone = (worker: any): string =>
    worker.phone || worker.phoneNumber || worker.mobile || worker.contact || "";

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
                {/* Phone icon */}
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
// CARD MAP
// ============================================================================
type CardKey = "maid" | "cook" | "baby" | "elder" | "housekeeping" | "laundry" | "water";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    maid: NearbyMaidCard,
    cook: NearbyCookCard,
    baby: BabySitterCard,
    elder: ElderCareCard,
    housekeeping: HousekeepingCard,
    laundry: NearbyLaundryCard,
    water: MineralWaterSuppliers,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("maid")) return "maid";
    if (n.includes("cook")) return "cook";
    if (n.includes("baby") || n.includes("sitter")) return "baby";
    if (n.includes("elder")) return "elder";
    if (n.includes("house") || n.includes("keeping")) return "housekeeping";
    if (n.includes("laundry")) return "laundry";
    if (n.includes("water")) return "water";
    return "maid";
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Home & Personal Services";
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

const extractWorkers = (response: any): HomePersonalWorker[] => {
    if (!response) return [];
    console.log("🔍 FULL RAW RESPONSE:", response);

    const candidates: Array<{ label: string; value: any }> = [
        { label: "response.workers",               value: response.workers },
        { label: "response.data?.workers",         value: response.data?.workers },
        { label: "response.data (array)",          value: response.data },
        { label: "response.result",                value: response.result },
        { label: "response.results",               value: response.results },
        { label: "response.data?.data",            value: response.data?.data },
        { label: "response.data?.result",          value: response.data?.result },
        { label: "response.data?.results",         value: response.data?.results },
        { label: "response.nearbyWorkers",         value: response.nearbyWorkers },
        { label: "response.data?.nearbyWorkers",   value: response.data?.nearbyWorkers },
        { label: "response.services",              value: response.services },
        { label: "response.data?.services",        value: response.data?.services },
    ];

    for (const { label, value } of candidates) {
        if (Array.isArray(value)) {
            console.log(`✅ Workers found at: ${label} — count: ${value.length}`);
            if (value.length > 0) {
                console.log("📞 First worker phone fields:", {
                    phone: value[0].phone,
                    phoneNumber: value[0].phoneNumber,
                    mobile: value[0].mobile,
                    contact: value[0].contact,
                });
            }
            return value as HomePersonalWorker[];
        }
        if (value && typeof value === "object" && !Array.isArray(value) && value._id) {
            console.log(`✅ Single worker found at: ${label}, wrapping in array`);
            return [value] as HomePersonalWorker[];
        }
    }

    console.warn("⚠️ Could not extract workers. Top-level keys:", Object.keys(response));
    return [];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const HomePersonalServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyWorkers, setNearbyWorkers] = useState<HomePersonalWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [phonePopup, setPhonePopup] = useState<{ phone: string; name: string } | null>(null);

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

    // ── Fetch nearby workers when location ready ─────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetch_ = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await getNearbyWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    10,
                    "home",
                    subcategory || ""
                );
                setNearbyWorkers(extractWorkers(response));
            } catch (e) {
                console.error("❌ Error fetching workers:", e);
                setError("Failed to load nearby workers");
                setNearbyWorkers([]);
            } finally {
                setLoading(false);
            }
        };
        fetch_();
    }, [userLocation]);

    // ── Navigation handlers ──────────────────────────────────────────────────
    const handleView = (worker: any) =>
        navigate(`/home-personal-services/worker/${worker._id || worker.id}`);

    const handleAddPost = () =>
        navigate(subcategory ? `/add-home-service-form?subcategory=${subcategory}` : "/add-home-service-form");

    const openDirections = (worker: HomePersonalWorker) => {
        if (worker.latitude && worker.longitude)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${worker.latitude},${worker.longitude}`, "_blank");
        else if (worker.area || worker.city)
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent([worker.area, worker.city, worker.state].filter(Boolean).join(", "))}`, "_blank");
    };

    const handleCallClick = (e: React.MouseEvent, worker: HomePersonalWorker) => {
        e.stopPropagation();
        const phone = getWorkerPhone(worker);
        console.log("📞 Call clicked — resolved phone:", phone);
        if (phone) {
            setPhonePopup({ phone, name: worker.name || "Service Worker" });
        } else {
            alert("Phone number not available for this worker.");
        }
    };

    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ============================================================================
    // WORKER CARD
    // ============================================================================
    const renderWorkerCard = (worker: HomePersonalWorker) => {
        const id = worker._id || "";
        const location = [worker.area, worker.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (worker.images || []).filter(Boolean) as string[];
        const isHovered = hoveredCard === id;
        const phone = getWorkerPhone(worker);

        let distance: string | null = null;
        if (userLocation && worker.latitude && worker.longitude) {
            const d = calculateDistance(
                userLocation.latitude, userLocation.longitude,
                worker.latitude, worker.longitude
            );
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-200"
                style={{
                    borderWidth: "1px",
                    borderStyle: "solid",
                    borderColor: isHovered ? BRAND : "#f3f4f6",
                    boxShadow: isHovered
                        ? "0 8px 24px rgba(0,89,138,0.15)"
                        : "0 1px 3px rgba(0,0,0,0.06)",
                    transform: isHovered ? "translateY(-2px)" : "none",
                }}
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleView(worker)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 overflow-hidden">
                    {worker.profilePic ? (
                        <img
                            src={worker.profilePic}
                            alt={worker.name}
                            className="w-full h-full object-cover transition-transform duration-300"
                            style={{ transform: isHovered ? "scale(1.03)" : "scale(1)" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={worker.name}
                            className="w-full h-full object-cover transition-transform duration-300"
                            style={{ transform: isHovered ? "scale(1.03)" : "scale(1)" }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center transition-colors duration-200"
                            style={{ backgroundColor: isHovered ? "rgba(0,89,138,0.07)" : "#f3f4f6" }}
                        >
                            <span className="text-5xl">🏠</span>
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

                    {/* Charge type badge */}
                    <div className="absolute top-3 right-3 z-10">
                        <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md text-white capitalize"
                            style={{ backgroundColor: BRAND }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            Per {worker.chargeType}
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
                        className="text-lg font-semibold line-clamp-1 transition-colors duration-200"
                        style={{ color: isHovered ? BRAND : "#111827" }}
                    >
                        {worker.name || "Unnamed Worker"}
                    </h2>

                    {worker.subCategory && (
                        <p className="text-sm font-medium text-gray-700">{worker.subCategory}</p>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p
                            className="text-sm font-semibold flex items-center gap-1"
                            style={{ color: BRAND }}
                        >
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Skill + Charge */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            {worker.skill && (
                                <span className="text-sm text-gray-600 flex items-center gap-1 line-clamp-1">
                                    🛠️ {worker.skill}
                                </span>
                            )}
                        </div>
                        {worker.serviceCharge && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">Per {worker.chargeType}</p>
                                <p
                                    className="text-base font-bold"
                                    style={{ color: BRAND }}
                                >
                                    ₹{worker.serviceCharge}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Directions + Call */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(worker); }}
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
                            onClick={e => handleCallClick(e, worker)}
                            disabled={!phone}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                            style={
                                phone
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

    // ── Nearby services section ──────────────────────────────────────────────
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

        if (nearbyWorkers.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🏠</div>
                    <p className="text-gray-500 font-medium">No workers found in your area.</p>
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
                        {nearbyWorkers.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyWorkers.map(renderWorkerCard)}
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
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find home services near you</p>
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

export default HomePersonalServicesList;