import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { EducationService } from "../services/EducationService.service";

// ── Dummy Nearby Cards ───────────────────────────────────────────────────────
import NearbySchoolCard from "../components/cards/Education/NearBySchoolCard";
import NearbyCollegeCard from "../components/cards/Education/NearByCollegeCard";
import NearbyCoachingCard from "../components/cards/Education/NearByCoaching";
import NearbyComputerTrainingCard from "../components/cards/Education/NearByComputer";
import NearbyMusicClassesCard from "../components/cards/Education/NearByMusicCard";
import NearbySkillCard from "../components/cards/Education/NearBySkillCard";
import NearbySpokenEnglishCard from "../components/cards/Education/NearBySpokenCard";
import NearbyTuitionCard from "../components/cards/Education/NearByTutionCard";

// ============================================================================
// CARD MAP
// ============================================================================
type CardKey =
    | "school" | "college" | "coaching" | "computer"
    | "music" | "skill" | "spoken" | "tuition";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    school: NearbySchoolCard,
    college: NearbyCollegeCard,
    coaching: NearbyCoachingCard,
    computer: NearbyComputerTrainingCard,
    music: NearbyMusicClassesCard,
    skill: NearbySkillCard,
    spoken: NearbySpokenEnglishCard,
    tuition: NearbyTuitionCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("school")) return "school";
    if (n.includes("college")) return "college";
    if (n.includes("coaching")) return "coaching";
    if (n.includes("computer") || n.includes("training")) return "computer";
    if (n.includes("music") || n.includes("dance")) return "music";
    if (n.includes("spoken") || n.includes("english")) return "spoken";
    if (n.includes("skill")) return "skill";
    if (n.includes("tuition")) return "tuition";
    return "school";
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Education Services";
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

const toArray = (value: any): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === "string") return value.split(",").map(s => s.trim()).filter(Boolean);
    return [];
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const EducationList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyEducation, setNearbyEducation] = useState<EducationService[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
                console.log("📍 User location:", pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                console.error(err);
                setLocationError("Unable to retrieve your location. Please enable location services.");
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
                console.log("🎓 Fetching nearby education...");
                const { latitude, longitude } = userLocation;
                const url = `${API_BASE_URL}/getNearbyEducation?latitude=${latitude}&longitude=${longitude}&distance=10`;
                const response = await fetch(url, { method: "GET", redirect: "follow" });
                console.log("🎓 HTTP status:", response.status);

                if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);

                const raw = await response.json();
                console.log("🎓 API Response (full):", JSON.stringify(raw, null, 2));
                console.log("🎓 Top-level keys:", Object.keys(raw || {}));

                const extractArray = (obj: any): EducationService[] => {
                    if (!obj) return [];
                    if (Array.isArray(obj)) return obj;
                    const preferredKeys = [
                        "data", "educations", "education", "result",
                        "results", "records", "items", "list", "services"
                    ];
                    for (const key of preferredKeys) {
                        if (Array.isArray(obj[key])) {
                            console.log(`🎓 Found array under key: "${key}" (${obj[key].length} items)`);
                            return obj[key];
                        }
                        if (obj[key] && typeof obj[key] === "object") {
                            for (const innerKey of preferredKeys) {
                                if (Array.isArray(obj[key][innerKey])) {
                                    console.log(`🎓 Found array under key: "${key}.${innerKey}" (${obj[key][innerKey].length} items)`);
                                    return obj[key][innerKey];
                                }
                            }
                        }
                    }
                    for (const key of Object.keys(obj)) {
                        if (Array.isArray(obj[key]) && obj[key].length > 0) {
                            console.log(`🎓 Fallback — found array under key: "${key}" (${obj[key].length} items)`);
                            return obj[key];
                        }
                    }
                    if (typeof obj === "object" && obj._id) return [obj];
                    return [];
                };

                const all: EducationService[] = extractArray(raw);
                console.log("✅ Displaying", all.length, "education services");
                if (all.length > 0) console.log("🎓 Sample record keys:", Object.keys(all[0]));
                setNearbyEducation(all);
            } catch (e: any) {
                console.error("❌ Error:", e);
                setError("Failed to load nearby education services");
                setNearbyEducation([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userLocation]);

    // ── Navigation ───────────────────────────────────────────────────────────
    const handleView = (service: any) => navigate(`/education/details/${service._id || service.id}`);

    const handleAddPost = () =>
        navigate(subcategory ? `/add-education-form?subcategory=${subcategory}` : "/add-education-form");

    const openDirections = (service: EducationService) => {
        if (service.latitude && service.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${Number(service.latitude)},${Number(service.longitude)}`,
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

    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    // ── Dummy cards ───────────────────────────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── Single live API card ──────────────────────────────────────────────────
    const renderEducationCard = (service: EducationService) => {
        const id = service._id || "";
        const location =
            [service.area, service.city, service.state].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (service.images || []).filter(Boolean) as string[];
        const subjects = toArray(service.subjects);
        const isHovered = hoveredCard === id;

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

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col cursor-pointer transition-all duration-200"
                style={{
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderColor: isHovered ? '#00598a' : '#f3f4f6',
                    boxShadow: isHovered
                        ? '0 8px 24px rgba(0, 89, 138, 0.15)'
                        : '0 1px 3px rgba(0,0,0,0.06)',
                    transform: isHovered ? 'translateY(-2px)' : 'none',
                }}
                onMouseEnter={() => setHoveredCard(id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => handleView(service)}
            >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.name || "Education Service"}
                            className="w-full h-full object-cover transition-transform duration-300"
                            style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center transition-colors duration-200"
                            style={{ backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : '#f3f4f6' }}
                        >
                            <span className="text-5xl">🎓</span>
                        </div>
                    )}

                    {/* Live Data — top left */}
                    <div className="absolute top-3 left-3 z-10">
                        <span
                            className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md"
                            style={{ backgroundColor: '#00598a' }}
                        >
                            Live Data
                        </span>
                    </div>

                    {/* Service type — top right */}
                    <div className="absolute top-3 right-3 z-10">
                        <span
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md text-white"
                            style={{ backgroundColor: '#004a73' }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {service.type || "Education"}
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
                    <h2
                        className="text-lg font-semibold line-clamp-1 transition-colors duration-200"
                        style={{ color: isHovered ? '#00598a' : '#111827' }}
                    >
                        {service.name || "Unnamed Service"}
                    </h2>

                    {service.type && (
                        <p className="text-sm font-medium text-gray-700">{service.type}</p>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distance && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: '#00598a' }}>
                            <span>📍</span> {distance} away
                        </p>
                    )}

                    {/* Experience + Charges */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            {service.experience && (
                                <span className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                                    📚 {service.experience} yrs exp
                                </span>
                            )}
                        </div>
                        {service.charges && (
                            <div className="text-right">
                                <p className="text-xs text-gray-500 uppercase">
                                    {service.chargeType || "Charges"}
                                </p>
                                <p className="text-base font-bold" style={{ color: '#00598a' }}>
                                    ₹{Number(service.charges).toLocaleString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Subjects */}
                    {subjects.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                Subjects
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {subjects.slice(0, 3).map((s, i) => (
                                    <span
                                        key={i}
                                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors duration-200"
                                        style={{
                                            backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : '#eff6ff',
                                            color: isHovered ? '#00598a' : '#1d4ed8',
                                            borderColor: isHovered ? 'rgba(0,89,138,0.3)' : '#bfdbfe',
                                        }}
                                    >
                                        <span style={{ color: isHovered ? '#00598a' : '#3b82f6' }}>●</span> {s}
                                    </span>
                                ))}
                                {subjects.length > 3 && (
                                    <span className="text-xs font-medium px-1 py-1" style={{ color: '#00598a' }}>
                                        +{subjects.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Directions + Call */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(service); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                            style={{
                                border: '2px solid #00598a',
                                color: '#00598a',
                                backgroundColor: 'transparent',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = '#00598a';
                                (e.currentTarget as HTMLElement).style.color = '#fff';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = '#00598a';
                            }}
                        >
                            <span>📍</span> Directions
                        </button>
                        <button
                            onClick={e => { e.stopPropagation(); service.phone && openCall(service.phone); }}
                            disabled={!service.phone}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200"
                            style={service.phone
                                ? { backgroundColor: '#00598a', color: '#fff' }
                                : { backgroundColor: '#d1d5db', color: '#9ca3af', cursor: 'not-allowed' }
                            }
                            onMouseEnter={e => {
                                if (service.phone) (e.currentTarget as HTMLElement).style.backgroundColor = '#004a73';
                            }}
                            onMouseLeave={e => {
                                if (service.phone) (e.currentTarget as HTMLElement).style.backgroundColor = '#00598a';
                            }}
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
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00598a' }} />
                </div>
            );
        }

        if (nearbyEducation.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🎓</div>
                    <p className="text-gray-500 font-medium">No education services found in your area.</p>
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
                        style={{ backgroundColor: '#00598a' }}
                    >
                        {nearbyEducation.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyEducation.map(renderEducationCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, rgba(0,89,138,0.04), white)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find education services near you</p>
                    </div>
                    <button
                        onClick={handleAddPost}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ backgroundColor: '#00598a' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#004a73'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#00598a'}
                    >
                        + Add Post
                    </button>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div
                        className="rounded-lg p-3 flex items-center gap-2"
                        style={{ backgroundColor: 'rgba(0,89,138,0.08)', border: '1px solid rgba(0,89,138,0.2)' }}
                    >
                        <div
                            className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full"
                            style={{ borderColor: '#00598a', borderTopColor: 'transparent' }}
                        />
                        <span className="text-sm" style={{ color: '#00598a' }}>Getting your location...</span>
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

                {/* ✅ 1. DUMMY CARDS FIRST */}
                <div className="space-y-4">
                    {renderDummyCards()}
                </div>

                {/* ✅ 2. API DATA SECOND */}
                {userLocation && !fetchingLocation && renderNearbyServices()}

            </div>
        </div>
    );
};

export default EducationList;