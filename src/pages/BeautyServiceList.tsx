import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserBeautyWorkers, BeautyWorker } from "../services/Beauty.Service.service";
import Button from "../components/ui/Buttons";
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

// ============================================================================
// CARD MAP
// ============================================================================
type CardKey = "beauty-parlour" | "fitness" | "makeup" | "salon" | "spa" | "yoga" | "tattoo" | "mehendi" | "skin-clinic";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    "beauty-parlour": NearbyBeautyCard,
    "fitness": NearbyFitnessCard,
    "makeup": NearbyMakeupCard,
    "salon": NearbySalonCard,
    "spa": NearbySpaServiceCard,
    "yoga": NearbyYogaCard,
    "tattoo": NearbyTattooCard,
    "mehendi": NearbyMehendiCard,
    "skin-clinic": NearbySkinClinicCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const getCardComponentForSubcategory = (sub: string | undefined): React.ComponentType<any> => {
    if (!sub) return CARD_MAP["beauty-parlour"];
    const n = sub.toLowerCase();
    if ((n.includes("beauty") && n.includes("parlour")) || n.includes("beautician")) return CARD_MAP["beauty-parlour"];
    if (n.includes("fitness") || n.includes("gym")) return CARD_MAP["fitness"];
    if (n.includes("makeup") || n.includes("make-up")) return CARD_MAP["makeup"];
    if (n.includes("salon") || n.includes("saloon") || n.includes("hair")) return CARD_MAP["salon"];
    if (n.includes("spa") || n.includes("massage")) return CARD_MAP["spa"];
    if (n.includes("yoga")) return CARD_MAP["yoga"];
    if (n.includes("tattoo")) return CARD_MAP["tattoo"];
    if (n.includes("mehendi") || n.includes("mehndi")) return CARD_MAP["mehendi"];
    if ((n.includes("skin") && n.includes("clinic")) || n.includes("dermatologist") || n.includes("skincare")) return CARD_MAP["skin-clinic"];
    return CARD_MAP["beauty-parlour"];
};

const shouldShowNearbyCards = (sub: string | undefined): boolean => {
    if (!sub) return false;
    const n = sub.toLowerCase();
    return ["beauty", "parlour", "fitness", "gym", "makeup", "salon", "spa", "massage",
        "yoga", "tattoo", "mehendi", "mehndi", "skin", "clinic", "dermatologist", "hair"].some(k => n.includes(k));
};

const getDisplayTitle = (sub: string | undefined): string => {
    if (!sub) return "All Beauty & Wellness Services";
    return sub.split("-").map(w => w === "&" ? "&" : w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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

const normalizeType = (t: string): string => t.toLowerCase().trim().replace(/\s+/g, " ");

// ── Pure utilities outside component ────────────────────────────────────────
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getImageUrls = (images?: string[]): string[] =>
    (images || []).filter((u): u is string => Boolean(u));

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
            err => {
                console.error("Location error:", err);
                setLocationError("Unable to retrieve your location.");
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    // ── Fetch all beauty workers → filter by subcategory + distance ──────────
    useEffect(() => {
        if (!userLocation) return;
        const fetchServices = async () => {
            setLoading(true);
            setError("");
            try {
                // getUserBeautyWorkers with no userId returns all workers,
                // falling back to a broad fetch. Adjust endpoint if needed.
                const response = await getUserBeautyWorkers("");
                const allWorkers: BeautyWorker[] = response.success ? (response.data || []) : [];

                // Step 1: filter by subcategory
                const byCategory = subcategory
                    ? allWorkers.filter((w: BeautyWorker) =>
                        w.category && normalizeType(w.category).includes(normalizeType(getDisplayTitle(subcategory)))
                    )
                    : allWorkers;

                // Step 2: sort by distance within 50 km
                const withCoords = byCategory
                    .filter((w: BeautyWorker) => w.latitude && w.longitude)
                    .map((w: BeautyWorker) => ({
                        worker: w,
                        dist: calculateDistance(userLocation.latitude, userLocation.longitude, w.latitude!, w.longitude!),
                    }))
                    .filter(({ dist }) => dist <= 50)
                    .sort((a, b) => a.dist - b.dist)
                    .map(({ worker }) => worker);

                const withoutCoords = byCategory.filter(
                    (w: BeautyWorker) => !w.latitude || !w.longitude
                );

                setNearbyServices([...withCoords, ...withoutCoords]);
            } catch (err) {
                console.error("Error fetching beauty services:", err);
                setError("Failed to load services");
                setNearbyServices([]);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, [userLocation, subcategory]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleView = (service: BeautyWorker) => {
        const id = service._id;
        if (!id) return;
        navigate(`/beauty-services/details/${id}`);
    };

    const handleAddPost = () => {
        navigate(subcategory
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

    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    // ── Render single live API card ──────────────────────────────────────────
    const renderBeautyCard = (worker: BeautyWorker) => {
        const id = worker._id || "";
        const location = [worker.area, worker.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = getImageUrls(worker.images); // images already full URLs from backend
        const services = Array.isArray(worker.services) ? worker.services : [];

        let distanceLabel: string | null = null;
        if (userLocation && worker.latitude && worker.longitude) {
            const dist = calculateDistance(userLocation.latitude, userLocation.longitude, worker.latitude, worker.longitude);
            distanceLabel = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(worker)}
            >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-rose-50 to-pink-100 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img src={imageUrls[0]} alt={worker.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{getCategoryIcon(subcategory)}</span>
                        </div>
                    )}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-rose-600 text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>
                    {worker.category && (
                        <div className="absolute top-3 right-3 z-10">
                            <span className="inline-flex items-center px-2.5 py-1 bg-black/60 text-white text-xs font-medium rounded-md backdrop-blur-sm">
                                {worker.category}
                            </span>
                        </div>
                    )}
                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 leading-tight">
                        {worker.name || worker.category || "Unnamed Service"}
                    </h2>

                    <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 text-sm mt-0.5 shrink-0">📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {distanceLabel && (
                        <p className="text-sm font-semibold text-rose-600 flex items-center gap-1">
                            <span>🛣️</span> {distanceLabel} away
                        </p>
                    )}

                    {worker.bio && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{worker.bio}</p>
                    )}

                    {/* Rating + experience */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {worker.rating && (
                            <span className="flex items-center gap-1 text-sm font-semibold text-gray-800">
                                <span className="text-yellow-500">⭐</span> {worker.rating}
                            </span>
                        )}
                        {worker.experience && (
                            <span className="text-xs text-gray-500">• {worker.experience} yrs exp</span>
                        )}
                        {worker.serviceCharge && (
                            <span className="ml-auto text-sm font-bold text-rose-700">₹{worker.serviceCharge}+</span>
                        )}
                    </div>

                    {/* Availability badge */}
                    <div>
                        <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-full font-medium border ${worker.availability
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-50 text-gray-600 border-gray-200"}`}>
                            {worker.availability ? "✓ Available" : "⏸ Unavailable"}
                        </span>
                    </div>

                    {/* Services tags */}
                    {services.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Services</p>
                            <div className="flex flex-wrap gap-1.5">
                                {services.slice(0, 3).map((s, idx) => (
                                    <span key={idx} className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-200">
                                        {s}
                                    </span>
                                ))}
                                {services.length > 3 && (
                                    <span className="text-xs text-rose-500 font-medium px-1 py-0.5">
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
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-rose-600 text-rose-600 rounded-lg font-medium text-sm hover:bg-rose-50 transition-colors active:bg-rose-100"
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); worker.phone && openCall(worker.phone); }}
                            disabled={!worker.phone}
                            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-colors ${worker.phone
                                ? "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                        >
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Render dummy nearby cards ────────────────────────────────────────────
    const renderCardsSection = () => {
        const CardComponent = getCardComponentForSubcategory(subcategory);
        return (
            <div className="space-y-4">
                <h2 className={`${typography.heading.h4} text-gray-800 flex items-center gap-2`}>
                    <span className="shrink-0">{getCategoryIcon(subcategory)}</span>
                    <span className="truncate">Nearby {getDisplayTitle(subcategory)}</span>
                </h2>
                <CardComponent onViewDetails={handleView} nearbyData={undefined} userLocation={userLocation} />
            </div>
        );
    };

    // ── Render live API services section ─────────────────────────────────────
    const renderYourServices = () => {
        if (loading) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">Loading services near you...</p>
                </div>
            );
        }
        if (nearbyServices.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-4xl mb-3">💆</div>
                    <p className="text-gray-500 font-medium">No services found in your area.</p>
                    <p className="text-gray-400 text-sm mt-1">Be the first to add one!</p>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Services Near You</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-rose-600 text-white text-sm font-bold rounded-full px-2.5">
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
        <div className="min-h-screen bg-gradient-to-b from-rose-50/30 to-white">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 space-y-6 sm:space-y-8">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl sm:text-4xl">{getCategoryIcon(subcategory)}</span>
                        <div>
                            <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                                {getDisplayTitle(subcategory)}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">Beauty & wellness services near you</p>
                        </div>
                    </div>
                    <Button variant="primary" size="md" onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#f09b13] hover:bg-[#e08a0f] text-white">
                        + Add Post
                    </Button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-rose-600 border-t-transparent rounded-full" />
                        <span className="text-sm text-rose-700">Getting your location...</span>
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

                {/* Dummy nearby cards */}
                {shouldShowNearbyCards(subcategory) && renderCardsSection()}

                {/* Fallback */}
                {!shouldShowNearbyCards(subcategory) && !userLocation && !fetchingLocation && (
                    <div className="text-center py-20">
                        <div className="text-6xl mb-4">💆</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Services Found</h3>
                        <p className="text-gray-600">Select a category or add a new service!</p>
                    </div>
                )}

                {/* Live API cards */}
                {userLocation && !fetchingLocation && renderYourServices()}
            </div>
        </div>
    );
};

export default BeautyServicesList;
