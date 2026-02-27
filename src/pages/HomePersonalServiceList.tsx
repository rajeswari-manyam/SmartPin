import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import typography from "../styles/typography";
import { getNearbyJobs } from "../services/api.service";

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

// ============================================================================
// JOB INTERFACE
// ============================================================================
export interface HomePersonalJob {
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

                {/* Phone number display */}
                <div
                    className="w-full text-center py-3 px-4 rounded-xl"
                    style={{ backgroundColor: "rgba(0,89,138,0.07)", border: "1px solid rgba(0,89,138,0.2)" }}
                >
                    <p className="text-xl font-bold tracking-wide" style={{ color: BRAND }}>{phone}</p>
                </div>

                {/* Action buttons */}
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

const getJobPhone = (job: HomePersonalJob): string =>
    job.phone || job.phoneNumber || job.mobile || job.contact || "";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const HomePersonalServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyJobs, setNearbyJobs] = useState<HomePersonalJob[]>([]);
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
                const response = await getNearbyJobs(userLocation.latitude, userLocation.longitude);

                if (response?.success && response.jobs) {
                    let filteredJobs = response.jobs;
                    if (subcategory) {
                        filteredJobs = response.jobs.filter((job: HomePersonalJob) =>
                            job.subcategory?.toLowerCase().includes(subcategory.toLowerCase()) ||
                            job.category?.toLowerCase().includes(subcategory.toLowerCase())
                        );
                    }
                    setNearbyJobs(filteredJobs);
                    setApiDebugInfo(`Found ${filteredJobs.length} jobs`);
                } else if (response?.jobs) {
                    setNearbyJobs(response.jobs);
                    setApiDebugInfo(`Found ${response.jobs.length} jobs`);
                } else if (Array.isArray(response)) {
                    setNearbyJobs(response);
                    setApiDebugInfo(`Found ${response.length} jobs`);
                } else {
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
    const handleView = (job: HomePersonalJob) => navigate(`/job-details/${job._id}`);

    const handleAddPost = () =>
        navigate(subcategory ? `/add-home-service-form?subcategory=${subcategory}` : "/add-home-service-form");

    const handleCallClick = (e: React.MouseEvent, job: HomePersonalJob) => {
        e.stopPropagation();
        const phone = getJobPhone(job);
        if (phone) {
            setPhonePopup({ phone, name: job.subcategory || "Service Provider" });
        } else {
            alert("Phone number not available for this job.");
        }
    };

    const handleDirectionsClick = (e: React.MouseEvent, job: HomePersonalJob) => {
        e.stopPropagation();
        if (job.latitude && job.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${job.latitude},${job.longitude}`,
                "_blank"
            );
        } else if (job.area || job.city) {
            const addr = encodeURIComponent([job.area, job.city, job.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        } else {
            alert("Location not available for this job.");
        }
    };

    // ── Render single JOB card ───────────────────────────────────────────────
    const renderJobCard = (job: HomePersonalJob) => {
        const location = [job.area, job.city, job.state].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (job.images || []).filter(Boolean) as string[];
        const phone = getJobPhone(job);

        let distance: string | null = null;
        if (userLocation && job.latitude && job.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, job.latitude, job.longitude);
            distance = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }
        const apiDistance = job.distance && job.distance !== "0.00" ? `${job.distance} km` : null;

        return (
            <div
                key={job._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100 group"
                onClick={() => handleView(job)}
            >
                {/* ── Image — no badges ── */}
                <div
                    className="relative h-48 overflow-hidden"
                    style={{ background: `linear-gradient(to bottom right, ${BRAND}0D, ${BRAND}1A)` }}
                >
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={job.subcategory || "Job"}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300">🏠</span>
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
                        {job.subcategory || "Service"}
                    </h2>

                    <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {(distance || apiDistance) && (
                        <p className="text-sm font-semibold text-[#00598a] flex items-center gap-1">
                            <span>📍</span> {distance || apiDistance} away
                        </p>
                    )}

                    {/* Price & Duration */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500">Service Charge</p>
                            <p className="text-base font-bold text-green-600">₹{job.servicecharges}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Duration</p>
                            <p className="text-sm font-semibold text-gray-900">
                                {new Date(job.startDate).toLocaleDateString()} -{" "}
                                {new Date(job.endDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {/* ── Directions + Call ── */}
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
                            {/* Navigation / directions icon */}
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
                    <div className="text-5xl mb-3">🏠</div>
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
                    <h2 className="text-xl font-bold text-gray-800">Nearby Services</h2>
                    <span
                        className="inline-flex items-center justify-center min-w-[2rem] h-7 text-white text-sm font-bold rounded-full px-2.5"
                        style={{ backgroundColor: BRAND }}
                    >
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

            {/* ── Phone Popup ── */}
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
                        <p className="text-sm text-gray-500 mt-1">Find home services near you</p>
                    </div>
                    <button
                        onClick={handleAddPost}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg font-semibold text-white text-sm transition-all duration-200 shadow-sm hover:shadow-md"
                        style={{ backgroundColor: BRAND }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND}
                    >
                        + Post a Job
                    </button>
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

export default HomePersonalServicesList;