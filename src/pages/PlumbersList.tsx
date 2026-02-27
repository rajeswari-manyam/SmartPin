import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyJobs } from "../services/api.service";

// ── Nearby card components with dummy data ───────────────────────────────────
import NearByPlumbarsCard from "../components/cards/Plumbers/NearByPlumbars";
import NearByElectricianCard from "../components/cards/Plumbers/NearByElectricianCard";
import NearByPaintersCard from "../components/cards/Plumbers/NearByPaintersCard";
import NearByCarpenterCard from "../components/cards/Plumbers/NearByCarpenterCard";
import NearByAcServiceCard from "../components/cards/Plumbers/NearByAcService";
import NearByFridgeRepairCard from "../components/cards/Plumbers/NearByFridgeRepair";
import NearByWashingMachineRepairCard from "../components/cards/Plumbers/NearByWashingMachineRepair";
import NearByGasRepairServiceCard from "../components/cards/Plumbers/NearByGasRepairServiceCard";
import NearByWaterPurifierCard from "../components/cards/Plumbers/NearByWaterPurifier";
import NearBySolarServiceCard from "../components/cards/Plumbers/NearBySolarService";

const BRAND = "#00598a";
const BRAND_DARK = "#004a73";

// ============================================================================
// JOB INTERFACE
// ============================================================================
export interface Job {
    _id: string;
    userId: string;
    title?: string;
    description: string;
    category: string;
    subcategory: string;
    jobType: "FULL_TIME" | "PART_TIME";
    servicecharges: string;
    startDate: string;
    endDate: string;
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    images?: string[];
    distance?: string;
    createdAt: string;
    updatedAt: string;
    status: string;
    phone?: string;
    phoneNumber?: string;
    mobile?: string;
    contact?: string;
}

// ============================================================================
// PHONE POPUP COMPONENT
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
type CardKey =
    | "plumber" | "electrician" | "painter" | "carpenter"
    | "ac" | "fridge" | "washing" | "gas" | "ro" | "solar";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    plumber: NearByPlumbarsCard,
    electrician: NearByElectricianCard,
    painter: NearByPaintersCard,
    carpenter: NearByCarpenterCard,
    ac: NearByAcServiceCard,
    fridge: NearByFridgeRepairCard,
    washing: NearByWashingMachineRepairCard,
    gas: NearByGasRepairServiceCard,
    ro: NearByWaterPurifierCard,
    solar: NearBySolarServiceCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("electrician") || n === "electrical") return "electrician";
    if (n.includes("painter") || n.includes("painting")) return "painter";
    if (n.includes("carpenter")) return "carpenter";
    if ((n.includes("ac") && n.includes("repair")) || n === "ac-repair" || n === "ac-service") return "ac";
    if (n.includes("fridge") || n.includes("refrigerator")) return "fridge";
    if (n.includes("washing") && n.includes("machine")) return "washing";
    if (n.includes("gas") && n.includes("stove")) return "gas";
    if (n.includes("water") && n.includes("purifier") || n.includes("ro")) return "ro";
    if (n.includes("solar")) return "solar";
    return "plumber";
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Plumber & Home Repair Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getJobPhone = (job: Job): string =>
    job.phone || job.phoneNumber || job.mobile || job.contact || "";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const PlumberServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyJobs, setNearbyJobs] = useState<Job[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [apiDebugInfo, setApiDebugInfo] = useState<string>("");
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
                console.log("📍 User location:", pos.coords.latitude, pos.coords.longitude);
            },
            (err) => {
                console.error(err);
                setLocationError("Unable to retrieve your location.");
                setFetchingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    // ── Fetch nearby JOBS when location ready ────────────────────────────────
    useEffect(() => {
        if (!userLocation) return;

        const fetchJobs = async () => {
            setLoading(true);
            setError("");
            setApiDebugInfo("");

            try {
                console.log("🔧 Fetching nearby jobs...");
                console.log("Location:", userLocation);

                const response = await getNearbyJobs(
                    userLocation.latitude,
                    userLocation.longitude
                );

                console.log("🔧 API Response:", response);

                if (response?.success && response.jobs) {
                    console.log("✅ Jobs found:", response.jobs.length);

                    let filteredJobs = response.jobs;
                    if (subcategory) {
                        filteredJobs = response.jobs.filter((job: Job) =>
                            job.subcategory?.toLowerCase().includes(subcategory.toLowerCase()) ||
                            job.category?.toLowerCase().includes(subcategory.toLowerCase())
                        );
                        console.log("📋 Filtered by subcategory:", subcategory, "→", filteredJobs.length, "jobs");
                    }

                    setNearbyJobs(filteredJobs);
                    setApiDebugInfo(`Found ${filteredJobs.length} jobs`);
                } else if (response?.jobs) {
                    console.log("✅ Jobs found (no success flag):", response.jobs.length);
                    setNearbyJobs(response.jobs);
                    setApiDebugInfo(`Found ${response.jobs.length} jobs`);
                } else if (Array.isArray(response)) {
                    console.log("✅ Jobs found (direct array):", response.length);
                    setNearbyJobs(response);
                    setApiDebugInfo(`Found ${response.length} jobs`);
                } else {
                    console.log("⚠️ No jobs in response:", response);
                    setNearbyJobs([]);
                    setApiDebugInfo("No jobs found in your area");
                }
            } catch (e: any) {
                console.error("❌ Error fetching jobs:", e);
                setError(`Failed to load nearby jobs: ${e.message}`);
                setNearbyJobs([]);
                setApiDebugInfo(`Error: ${e.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, [userLocation, subcategory]);

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleView = (job: Job) => {
        navigate(`/job-details/${job._id}`);
    };

    const handleAddPost = () => {
        navigate(subcategory ? `/add-plumber-service-form?subcategory=${subcategory}` : "/add-plumber-service-form");
    };

    const handleCallClick = (e: React.MouseEvent, job: Job) => {
        e.stopPropagation();
        const phone = getJobPhone(job);
        console.log("📞 Call clicked — resolved phone:", phone);
        if (phone) {
            setPhonePopup({ phone, name: job.subcategory || "Service Provider" });
        } else {
            alert("Phone number not available for this job.");
        }
    };

    const handleDirectionsClick = (e: React.MouseEvent, job: Job) => {
        e.stopPropagation();
        if (job.latitude && job.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`,
                "_blank"
            );
        } else if (job.area || job.city) {
            const addr = encodeURIComponent(
                [job.area, job.city, job.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        } else {
            alert("Location not available for this job.");
        }
    };

    // ── Render single JOB card ───────────────────────────────────────────────
    const renderJobCard = (job: Job) => {
        const location = [job.area, job.city, job.state].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (job.images || []).filter(Boolean) as string[];
        const phone = getJobPhone(job);

        // Calculate distance if user location available
        let distance: string | null = null;
        if (userLocation && job.latitude && job.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, job.latitude, job.longitude);
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        // Use distance from API if available
        const apiDistance = job.distance && job.distance !== "0.00" ? `${job.distance} km` : null;

        return (
            <div
                key={job._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100 group"
                onClick={() => handleView(job)}
            >
                {/* ── Image (without badges) ── */}
                <div className="relative h-48 bg-gradient-to-br from-[#00598a]/5 to-[#00598a]/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={job.subcategory || "Job"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🔧</span>
                        </div>
                    )}

                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="p-4 flex flex-col gap-2.5">
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-[#00598a] transition-colors duration-200">
                        {job.subcategory || "Job"}
                    </h2>

                    <p className="text-sm text-gray-600 line-clamp-2">
                        {job.description}
                    </p>

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {(distance || apiDistance) && (
                        <p className="text-sm font-semibold text-[#00598a] flex items-center gap-1">
                            <span>📍</span> {distance || apiDistance} away
                        </p>
                    )}

                    {/* Price info */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500">Service Charge</p>
                            <p className="text-base font-bold text-green-600">₹{job.servicecharges}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {new Date(job.startDate).toLocaleDateString()} - {new Date(job.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* ── Directions + Call buttons ── */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        {/* Directions */}
                        <button
                            onClick={e => handleDirectionsClick(e, job)}
                            className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg font-medium text-xs transition-all duration-200"
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
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                            Directions
                        </button>

                        {/* Call */}
                        <button
                            onClick={e => handleCallClick(e, job)}
                            disabled={!phone}
                            className="flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg font-medium text-xs transition-all duration-200"
                            style={
                                phone
                                    ? { backgroundColor: BRAND, color: "#fff" }
                                    : { backgroundColor: "#d1d5db", color: "#9ca3af", cursor: "not-allowed" }
                            }
                            onMouseEnter={e => { if (phone) (e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK; }}
                            onMouseLeave={e => { if (phone) (e.currentTarget as HTMLElement).style.backgroundColor = BRAND; }}
                            title={phone ? `Call ${phone}` : "No phone number available"}
                        >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                            </svg>
                            Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── Dummy cards ──────────────────────────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} />;
    };

    // ── API nearby jobs ──────────────────────────────────────────────────────
    const renderNearbyJobs = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00598a]" />
                </div>
            );
        }

        if (nearbyJobs.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">🔧</div>
                    <p className="text-gray-500 font-medium">No jobs found in your area.</p>
                    {apiDebugInfo && (
                        <p className="text-xs text-gray-400 mt-2 bg-gray-50 p-2 rounded">
                            Debug: {apiDebugInfo}
                        </p>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Nearby Jobs</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-[#00598a] text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyJobs.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyJobs.map(renderJobCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#00598a]/5 to-white">
            {/* Phone Popup */}
            {phonePopup && (
                <PhonePopup
                    phone={phonePopup.phone}
                    name={phonePopup.name}
                    onClose={() => setPhonePopup(null)}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* ── Header ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight`}>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find service jobs near you</p>
                    </div>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#00598a] hover:bg-[#004a70]"
                    >
                        + Post a Job
                    </Button>
                </div>

                {/* ── Location status ── */}
                {fetchingLocation && (
                    <div className="bg-[#00598a]/10 border border-[#00598a]/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-[#00598a] border-t-transparent rounded-full" />
                        <span className="text-sm text-[#00598a]">Getting your location...</span>
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

                {/* Debug info */}
                {apiDebugInfo && !error && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                        <p className="text-blue-700 text-xs">API Status: {apiDebugInfo}</p>
                    </div>
                )}

                {/* 1. DUMMY CARDS FIRST */}
                <div className="space-y-4">
                    {renderDummyCards()}
                </div>

                {/* 2. API DATA SECOND */}
                {userLocation && !fetchingLocation && renderNearbyJobs()}

            </div>
        </div>
    );
};

export default PlumberServicesList;