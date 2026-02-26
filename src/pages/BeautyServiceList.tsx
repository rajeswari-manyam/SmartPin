import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getNearbyBeautyWorkers,
    BeautyWorker,
} from "../services/Beauty.Service.service";
import typography from "../styles/typography";

// ── Nearby dummy card components ─────────────────────────────────────────────
import NearbyBeautyCard from "../components/cards/Beauty/NearByBeauty";
import NearbyFitnessCard from "../components/cards/Beauty/NearByFittness";
import NearbyMakeupCard from "../components/cards/Beauty/NearByMackup";
import NearbySalonCard from "../components/cards/Beauty/NearSaloane";
import NearbySpaServiceCard from "../components/cards/Beauty/NearbySpaServiceCard";
import NearbyYogaCard from "../components/cards/Beauty/NearbyYogaCard";
import NearbyTattooCard from "../components/cards/Beauty/NearTatoo";
import NearbyMehendiCard from "../components/cards/Beauty/NearByMehende";
import NearbySkinClinicCard from "../components/cards/Beauty/NearBySkinClik";

const BRAND = "#00598a";
const BRAND_DARK = "#004a75";

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
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,89,138,0.1)" }}
                >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" style={{ color: BRAND }}>
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                </div>

                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Contact</p>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{name}</h3>
                </div>

                <div
                    className="w-full text-center py-3 px-4 rounded-xl"
                    style={{ backgroundColor: "rgba(0,89,138,0.07)", border: "1px solid rgba(0,89,138,0.2)" }}
                >
                    <p className="text-xl font-bold tracking-wide" style={{ color: BRAND }}>{phone}</p>
                </div>

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
type CardKey =
    | "beauty-parlour"
    | "fitness"
    | "makeup"
    | "salon"
    | "spa"
    | "yoga"
    | "tattoo"
    | "mehendi"
    | "skin-clinic";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    "beauty-parlour": NearbyBeautyCard,
    fitness: NearbyFitnessCard,
    makeup: NearbyMakeupCard,
    salon: NearbySalonCard,
    spa: NearbySpaServiceCard,
    yoga: NearbyYogaCard,
    tattoo: NearbyTattooCard,
    mehendi: NearbyMehendiCard,
    "skin-clinic": NearbySkinClinicCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (sub?: string): CardKey => {
    if (!sub) return "beauty-parlour";
    const n = sub.toLowerCase();
    if ((n.includes("beauty") && n.includes("parlour")) || n.includes("beautician")) return "beauty-parlour";
    if (n.includes("fitness") || n.includes("gym")) return "fitness";
    if (n.includes("makeup") || n.includes("make-up")) return "makeup";
    if (n.includes("salon") || n.includes("saloon") || n.includes("hair")) return "salon";
    if (n.includes("spa") || n.includes("massage")) return "spa";
    if (n.includes("yoga")) return "yoga";
    if (n.includes("tattoo")) return "tattoo";
    if (n.includes("mehendi") || n.includes("mehndi")) return "mehendi";
    if ((n.includes("skin") && n.includes("clinic")) || n.includes("dermatologist") || n.includes("skincare")) return "skin-clinic";
    return "beauty-parlour";
};

const getDisplayTitle = (sub: string | undefined): string => {
    if (!sub) return "All Beauty & Wellness Services";
    return sub
        .split("-")
        .map(w => (w === "&" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)))
        .join(" ");
};

const getCategoryIcon = (sub: string | undefined): string => {
    if (!sub) return "💆";
    const n = sub.toLowerCase();
    if (n.includes("fitness") || n.includes("gym")) return "🏋️";
    if (n.includes("makeup")) return "💄";
    if (n.includes("salon") || n.includes("hair")) return "✂️";
    if (n.includes("spa") || n.includes("massage")) return "🧖";
    if (n.includes("yoga")) return "🧘";
    if (n.includes("tattoo")) return "🎨";
    if (n.includes("mehendi") || n.includes("mehndi")) return "🌿";
    if (n.includes("skin")) return "✨";
    return "💆";
};

const getImageUrls = (images?: string[]): string[] =>
    (images || []).filter((u): u is string => Boolean(u));

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const BeautyServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyServices, setNearbyServices] = useState<BeautyWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [phonePopup, setPhonePopup] = useState<{ phone: string; name: string } | null>(null);

    // ── Get user location on mount ───────────────────────────────────────────
    useEffect(() => {
        setFetchingLocation(true);
        setLocationError("");
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            setFetchingLocation(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
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

    // ── Fetch nearby beauty workers ──────────────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;

        const fetchNearbyServices = async () => {
            setLoading(true);
            setError("");
            try {
                console.log("📍 Fetching beauty workers at:", userLocation.latitude, userLocation.longitude);

                const response = await getNearbyBeautyWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    10
                );

                console.log("📦 Beauty API response:", response);

                if (!response.success) {
                    console.warn("⚠️ API returned success: false");
                    setNearbyServices([]);
                    return;
                }

                const allWorkers: BeautyWorker[] = Array.isArray(response.data) ? response.data : [];
                console.log("✅ Total workers from API:", allWorkers.length);

                // ── KEY FIX: Workers with empty/null category are shown on ALL subcategory pages.
                // Only filter out workers whose category is non-empty AND doesn't match.
                const filtered = subcategory
                    ? allWorkers.filter((w: BeautyWorker) => {
                        const cat = (w.category || "").trim();
                        // Empty category → always show
                        if (cat === "") return true;
                        // Match subcategory slug against worker category (case-insensitive)
                        const subWords = subcategory.toLowerCase().replace(/-/g, " ");
                        const catLower = cat.toLowerCase();
                        return (
                            catLower.includes(subWords) ||
                            subWords.includes(catLower) ||
                            subcategory.toLowerCase().split("-").some(word => word.length > 2 && catLower.includes(word))
                        );
                    })
                    : allWorkers;

                console.log("🔍 Filtered workers:", filtered.length, "for subcategory:", subcategory);

                // Sort by distance (closest first), push workers without coords to end
                const withCoords = filtered
                    .filter(w => w.latitude && w.longitude)
                    .map(w => ({
                        worker: w,
                        dist: calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            w.latitude!,
                            w.longitude!
                        ),
                    }))
                    .sort((a, b) => a.dist - b.dist)
                    .map(({ worker }) => worker);

                const withoutCoords = filtered.filter(w => !w.latitude || !w.longitude);
                setNearbyServices([...withCoords, ...withoutCoords]);
            } catch (err) {
                console.error("❌ Error fetching nearby beauty services:", err);
                setError("Failed to load nearby services. Please try again.");
                setNearbyServices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchNearbyServices();
    }, [userLocation, subcategory]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleView = (service: BeautyWorker) => {
        const id = service._id;
        if (!id) return;
        navigate(`/beauty-services/details/${id}`);
    };

    const handleAddPost = () => {
        navigate(
            subcategory
                ? `/add-beauty-service-form?subcategory=${subcategory}`
                : "/add-beauty-service-form"
        );
    };

    const openDirections = (w: BeautyWorker) => {
        if (w.latitude && w.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${w.latitude},${w.longitude}`, "_blank");
        } else if (w.area || w.city) {
            const addr = encodeURIComponent([w.area, w.city, w.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const handleCallClick = (e: React.MouseEvent, worker: BeautyWorker) => {
        e.stopPropagation();
        if (worker.phone) {
            setPhonePopup({ phone: worker.phone, name: worker.name || worker.category || "Beauty Service" });
        } else {
            alert("Phone number not available for this service.");
        }
    };

    // ── Render single live API card ──────────────────────────────────────────
    const renderBeautyCard = (worker: BeautyWorker) => {
        const id = worker._id || "";
        const location = [worker.area, worker.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = getImageUrls(worker.images);
        const services = Array.isArray(worker.services) ? worker.services : [];
        const isHovered = hoveredCard === id;

        let distanceLabel: string | null = null;
        if (userLocation && worker.latitude && worker.longitude) {
            const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                worker.latitude,
                worker.longitude
            );
            distanceLabel = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
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
                onClick={() => handleView(worker)}
            >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    {imageUrls.length > 0 ? (
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
                            <span className="text-5xl">{getCategoryIcon(subcategory)}</span>
                        </div>
                    )}

                    {/* Nearby badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span
                            className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md"
                            style={{ backgroundColor: BRAND }}
                        >
                            Nearby
                        </span>
                    </div>

                    {/* Category badge — only show if non-empty */}
                    {worker.category && worker.category.trim() !== "" && (
                        <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md bg-black/60 text-white backdrop-blur-sm">
                                {worker.category}
                            </span>
                        </div>
                    )}

                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2
                        className="text-lg font-semibold line-clamp-1 leading-tight transition-colors duration-200"
                        style={{ color: isHovered ? BRAND : "#111827" }}
                    >
                        {worker.name || worker.category || "Unnamed Service"}
                    </h2>

                    <div className="flex items-start gap-1.5">
                        <span className="text-sm mt-0.5 flex-shrink-0" style={{ color: isHovered ? BRAND : "#9ca3af" }}>📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {distanceLabel && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: BRAND }}>
                            <span>🛣️</span> {distanceLabel} away
                        </p>
                    )}

                    {worker.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{worker.bio}</p>
                    )}

                    {/* Rating + experience + price */}
                    <div className="flex items-center justify-between pt-0.5">
                        <div className="flex items-center gap-2">
                            {worker.rating !== undefined && worker.rating > 0 && (
                                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    ⭐ {worker.rating}
                                </span>
                            )}
                            {worker.experience && (
                                <span className="text-xs text-gray-500">• {worker.experience} yrs exp</span>
                            )}
                        </div>
                        {worker.serviceCharge && (
                            <span className="text-sm font-bold" style={{ color: BRAND }}>₹{worker.serviceCharge}+</span>
                        )}
                    </div>

                    {/* Availability badge */}
                    <div>
                        <span
                            className="inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border transition-colors duration-200"
                            style={worker.availability
                                ? { backgroundColor: "rgba(0,89,138,0.07)", color: BRAND, borderColor: "rgba(0,89,138,0.25)" }
                                : { backgroundColor: "#f9fafb", color: "#6b7280", borderColor: "#e5e7eb" }
                            }
                        >
                            {worker.availability ? "✓ Available" : "⏸ Unavailable"}
                        </span>
                    </div>

                    {/* Services tags */}
                    {services.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 mt-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Services</p>
                            <div className="flex flex-wrap gap-1.5">
                                {services.slice(0, 3).map((s, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center text-xs px-2 py-1 rounded border transition-colors duration-200"
                                        style={isHovered
                                            ? { backgroundColor: "rgba(0,89,138,0.07)", color: BRAND, borderColor: "rgba(0,89,138,0.25)" }
                                            : { backgroundColor: "#f3f4f6", color: "#374151", borderColor: "#e5e7eb" }
                                        }
                                    >
                                        {s}
                                    </span>
                                ))}
                                {services.length > 3 && (
                                    <span className="text-xs font-medium px-1 py-1" style={{ color: BRAND }}>
                                        +{services.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
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
                            disabled={!worker.phone}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                            style={worker.phone
                                ? { backgroundColor: BRAND, color: "#fff" }
                                : { backgroundColor: "#d1d5db", color: "#9ca3af", cursor: "not-allowed" }
                            }
                            onMouseEnter={e => { if (worker.phone) (e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK; }}
                            onMouseLeave={e => { if (worker.phone) (e.currentTarget as HTMLElement).style.backgroundColor = BRAND; }}
                            title={worker.phone ? `Call ${worker.phone}` : "No phone number available"}
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
        return <CardComponent onViewDetails={handleView} nearbyData={undefined} userLocation={userLocation} />;
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
        if (nearbyServices.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">{getCategoryIcon(subcategory)}</div>
                    <p className="text-gray-500 font-medium">No services found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Try adding a new service or check back later!</p>
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
                        {nearbyServices.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyServices.map(renderBeautyCard)}
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
                        <h1 className="text-2xl font-bold text-gray-900">{getDisplayTitle(subcategory)}</h1>
                        <p className="text-sm text-gray-500 mt-1">Beauty & wellness services near you</p>
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

export default BeautyServicesList;