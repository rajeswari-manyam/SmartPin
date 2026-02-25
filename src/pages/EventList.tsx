import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import typography from "../styles/typography";
import { getNearbyEventWorkers, EventWorker } from "../services/EventWorker.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbyPartyDecorationCard from "../components/cards/Events/NearByPartyDecoration";
import NearbyMandapCard from "../components/cards/Events/NearMandapDecoration";
import NearbyDJCard from "../components/cards/Events/NearByDj";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const buildImageUrl = (path: string): string => {
    if (!path) return "";
    if (/^(https?:\/\/|blob:|data:)/i.test(path)) return path;
    const clean = path.replace(/\\/g, "/").replace(/^\//, "");
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    const url = `${base}/${clean}`;
    console.log("🖼️ Image URL built:", path, "=>", url);
    return url;
};

const getImageUrls = (images?: string[]): string[] => {
    if (!images || images.length === 0) return [];
    return images.map(buildImageUrl).filter(Boolean);
};

// ── Helper: extract phone from event (handles multiple possible field names) ──
const getEventPhone = (event: any): string => {
    return (
        event.phone ||
        event.phoneNumber ||
        event.mobile ||
        event.mobileNumber ||
        event.contact ||
        event.contactNumber ||
        event.telephone ||
        ""
    );
};

// ============================================================================
// PHONE POPUP COMPONENT
// ============================================================================
interface PhonePopupProps {
    phone: string;
    name: string;
    onClose: () => void;
}

const PhonePopup: React.FC<PhonePopupProps> = ({ phone, name, onClose }) => {
    // Close on Escape key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Phone icon */}
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,89,138,0.1)" }}
                >
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" style={{ color: "#00598a" }}>
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                </div>

                {/* Service name */}
                <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Contact</p>
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{name}</h3>
                </div>

                {/* Phone number display */}
                <div
                    className="w-full text-center py-3 px-4 rounded-xl"
                    style={{ backgroundColor: "rgba(0,89,138,0.07)", border: "1px solid rgba(0,89,138,0.2)" }}
                >
                    <p className="text-xl font-bold tracking-wide" style={{ color: "#00598a" }}>
                        {phone}
                    </p>
                </div>

                {/* Buttons */}
                <div className="grid grid-cols-2 gap-3 w-full">
                    <a
                        href={`tel:${phone}`}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200"
                        style={{ backgroundColor: "#00598a" }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#004a73")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#00598a")}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        Call Now
                    </a>
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200"
                        style={{ color: "#00598a", border: "2px solid #00598a", backgroundColor: "transparent" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "#00598a";
                            (e.currentTarget as HTMLElement).style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                            (e.currentTarget as HTMLElement).style.color = "#00598a";
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
type CardKey = "party" | "mandap" | "dj";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    party: NearbyPartyDecorationCard,
    mandap: NearbyMandapCard,
    dj: NearbyDJCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("mandap") || (n.includes("wedding") && n.includes("decor"))) return "mandap";
    if (n.includes("dj") || n.includes("disc") || n.includes("jockey")) return "dj";
    return "party";
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Event Services";
    return subcategory
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

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

const extractEventWorkers = (response: any): EventWorker[] => {
    if (!response) return [];
    console.log("🔍 FULL RAW RESPONSE:", response);
    const candidates = [
        response.data,
        response.workers,
        response.data?.data,
        response.data?.workers,
        response.result,
        response.results,
        response.data?.result,
        response.nearbyServices,
        response.services,
    ];
    for (const candidate of candidates) {
        if (Array.isArray(candidate)) {
            console.log(`✅ Event workers found — count: ${candidate.length}`);
            // Debug: log phone fields of first worker
            if (candidate.length > 0) {
                console.log("📞 First worker phone fields:", {
                    phone: candidate[0].phone,
                    phoneNumber: candidate[0].phoneNumber,
                    mobile: candidate[0].mobile,
                    contact: candidate[0].contact,
                    allKeys: Object.keys(candidate[0]),
                });
            }
            return candidate as EventWorker[];
        }
        if (candidate && typeof candidate === "object" && !Array.isArray(candidate) && candidate._id) {
            return [candidate] as EventWorker[];
        }
    }
    console.warn("⚠️ Could not extract event workers. Keys:", Object.keys(response));
    return [];
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const EventServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyEventWorkers, setNearbyEventWorkers] = useState<EventWorker[]>([]);
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

    // ── Fetch nearby when location ready ─────────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;
        const fetchWorkers = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await getNearbyEventWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    10
                );
                const workers = extractEventWorkers(response);
                setNearbyEventWorkers(workers);
            } catch (e) {
                console.error("❌ Error:", e);
                setError("Failed to load nearby event services");
                setNearbyEventWorkers([]);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();
    }, [userLocation]);

    // ── Navigation handlers ──────────────────────────────────────────────────
    const handleView = (event: any) =>
        navigate(`/event-services/details/${event._id || event.id}`);

    const handleAddPost = () =>
        navigate(
            subcategory
                ? `/add-event-service-form?subcategory=${subcategory}`
                : "/add-event-service-form"
        );

    const openDirections = (event: EventWorker) => {
        if (event.latitude && event.longitude)
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${event.latitude},${event.longitude}`,
                "_blank"
            );
        else if (event.area || event.city)
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    [event.area, event.city, event.state].filter(Boolean).join(", ")
                )}`,
                "_blank"
            );
    };

    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── Open phone popup ─────────────────────────────────────────────────────
    const handleCallClick = (e: React.MouseEvent, event: EventWorker) => {
        e.stopPropagation();
        const phone = getEventPhone(event);
        console.log("📞 Call clicked. Resolved phone:", phone, "| Raw event:", event);
        if (phone) {
            setPhonePopup({ phone, name: event.name || "Event Service" });
        } else {
            alert("Phone number not available for this service.");
        }
    };

    // ============================================================================
    // EVENT WORKER CARD
    // ============================================================================
    const renderEventWorkerCard = (event: EventWorker) => {
        const id = event._id || "";
        const location =
            [event.area, event.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = getImageUrls(event.images);
        const services = event.services || [];
        const isHovered = hoveredCard === id;
        const phone = getEventPhone(event);

        let distance: string | null = null;
        if (userLocation && event.latitude && event.longitude) {
            const d = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                event.latitude,
                event.longitude
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
                    borderColor: isHovered ? "#00598a" : "#f3f4f6",
                    boxShadow: isHovered
                        ? "0 8px 24px rgba(0, 89, 138, 0.15)"
                        : "0 1px 3px rgba(0,0,0,0.06)",
                    transform: isHovered ? "translateY(-2px)" : "none",
                }}
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleView(event)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={event.name || "Event Service"}
                            className="w-full h-full object-cover transition-transform duration-300"
                            style={{ transform: isHovered ? "scale(1.03)" : "scale(1)" }}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.style.display = "none";
                                const parent = target.parentElement;
                                if (parent) {
                                    parent.innerHTML = `<div class="w-full h-full flex items-center justify-center" style="background:rgba(0,89,138,0.05)"><span style="font-size:3rem">🎉</span></div>`;
                                }
                            }}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center transition-colors duration-200"
                            style={{
                                backgroundColor: isHovered ? "rgba(0,89,138,0.07)" : "#f3f4f6",
                            }}
                        >
                            <span className="text-5xl">🎉</span>
                        </div>
                    )}

                    <div className="absolute top-3 left-3 z-10">
                        <span
                            className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md"
                            style={{ backgroundColor: "#00598a" }}
                        >
                            Live Data
                        </span>
                    </div>

                    <div className="absolute top-3 right-3 z-10">
                        <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${
                                event.availability ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {event.availability ? "Available" : "Busy"}
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
                        style={{ color: isHovered ? "#00598a" : "#111827" }}
                    >
                        {event.name || "Unnamed Service"}
                    </h2>

                    {event.category && (
                        <p className="text-sm font-medium text-gray-700">{event.category}</p>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p
                            className="text-sm font-semibold flex items-center gap-1"
                            style={{ color: "#00598a" }}
                        >
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            {event.experience && (
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    🎉 {event.experience} yrs exp
                                </span>
                            )}
                        </div>
                        {event.serviceCharge && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">
                                    {event.chargeType || "Charge"}
                                </p>
                                <p className="text-base font-bold" style={{ color: "#00598a" }}>
                                    ₹{event.serviceCharge}
                                </p>
                            </div>
                        )}
                    </div>

                    {services.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Services
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {services.slice(0, 3).map((s, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors duration-200"
                                        style={{
                                            backgroundColor: isHovered ? "rgba(0,89,138,0.07)" : "#f3f4f6",
                                            color: isHovered ? "#00598a" : "#374151",
                                            borderColor: isHovered ? "rgba(0,89,138,0.25)" : "#e5e7eb",
                                        }}
                                    >
                                        <span style={{ color: isHovered ? "#00598a" : "#a855f7" }}>●</span>{" "}
                                        {s}
                                    </span>
                                ))}
                                {services.length > 3 && (
                                    <span
                                        className="text-xs font-medium px-1 py-1"
                                        style={{ color: "#00598a" }}
                                    >
                                        +{services.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Directions + Call */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); openDirections(event); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                            style={{ border: "2px solid #00598a", color: "#00598a", backgroundColor: "transparent" }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "#00598a";
                                (e.currentTarget as HTMLElement).style.color = "#fff";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                                (e.currentTarget as HTMLElement).style.color = "#00598a";
                            }}
                        >
                            <span>📍</span> Directions
                        </button>

                        {/* ── Call Button → opens PhonePopup ── */}
                        <button
                            onClick={(e) => handleCallClick(e, event)}
                            disabled={!phone}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                            style={
                                phone
                                    ? { backgroundColor: "#00598a", color: "#fff" }
                                    : { backgroundColor: "#d1d5db", color: "#9ca3af", cursor: "not-allowed" }
                            }
                            onMouseEnter={(e) => {
                                if (phone)
                                    (e.currentTarget as HTMLElement).style.backgroundColor = "#004a73";
                            }}
                            onMouseLeave={(e) => {
                                if (phone)
                                    (e.currentTarget as HTMLElement).style.backgroundColor = "#00598a";
                            }}
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
                        style={{ borderColor: "#00598a" }}
                    />
                </div>
            );
        }
        if (nearbyEventWorkers.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🎉</div>
                    <p className="text-gray-500 font-medium">No event services found in your area.</p>
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
                        {nearbyEventWorkers.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyEventWorkers.map(renderEventWorkerCard)}
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
                        <p className="text-sm text-gray-500 mt-1">Find event services near you</p>
                    </div>
                    <button
                        onClick={handleAddPost}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ backgroundColor: "#00598a" }}
                        onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.backgroundColor = "#004a73")
                        }
                        onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.backgroundColor = "#00598a")
                        }
                    >
                        + Add Post
                    </button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div
                        className="rounded-lg p-3 flex items-center gap-2"
                        style={{
                            backgroundColor: "rgba(0,89,138,0.08)",
                            border: "1px solid rgba(0,89,138,0.2)",
                        }}
                    >
                        <div
                            className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full"
                            style={{ borderColor: "#00598a", borderTopColor: "transparent" }}
                        />
                        <span className="text-sm" style={{ color: "#00598a" }}>
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
                <div className="space-y-4">{renderDummyCards()}</div>

                {/* 2. API DATA SECOND */}
                {userLocation && !fetchingLocation && renderNearbyServices()}
            </div>
        </div>
    );
};

export default EventServicesList;