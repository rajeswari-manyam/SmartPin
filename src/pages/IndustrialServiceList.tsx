import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import { getNearbyIndustrialWorkers, IndustrialWorker, IndustrialWorkerResponse } from "../services/IndustrialService.service";

// ── Nearby dummy card components ─────────────────────────────────────────────
import BorewellServiceCard from "../components/cards/Industrial/NearByBoreWell";
import FabricatorServiceCard from "../components/cards/Industrial/NearByfabricators";
import TransporterServiceCard from "../components/cards/Industrial/NearByTransport";
import WaterTankCleaningCard from "../components/cards/Industrial/NearByWaterTankCleaning";
import ScrapDealerCard from "../components/cards/Industrial/NearByScrapDealers";
import MachineWorkCard from "../components/cards/Industrial/NearByMachine";

// ============================================================================
// CARD MAP
// ============================================================================
type CardKey = "borewell" | "fabricators" | "transporters" | "water-tank-cleaning" | "scrap-dealers" | "machine-repair";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    borewell: BorewellServiceCard,
    fabricators: FabricatorServiceCard,
    transporters: TransporterServiceCard,
    "water-tank-cleaning": WaterTankCleaningCard,
    "scrap-dealers": ScrapDealerCard,
    "machine-repair": MachineWorkCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const resolveCardKey = (subcategory?: string): CardKey => {
    const n = (subcategory || "").toLowerCase();
    if (n.includes("borewell") || n.includes("bore") || n.includes("well")) return "borewell";
    if (n.includes("fabricat") || n.includes("steel") || n.includes("metal")) return "fabricators";
    if (n.includes("transport") || n.includes("logistics") || n.includes("cargo")) return "transporters";
    if (n.includes("water") || n.includes("tank") || n.includes("cleaning")) return "water-tank-cleaning";
    if (n.includes("scrap") || n.includes("recycle") || n.includes("waste")) return "scrap-dealers";
    if (n.includes("machine") || n.includes("repair") || n.includes("maintenance")) return "machine-repair";
    return "borewell";
};

const getDisplayTitle = (subcategory?: string): string => {
    if (!subcategory) return "All Industrial Services";
    return subcategory.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
};

const getCategoryIcon = (subcategory?: string): string => {
    if (!subcategory) return "🏭";
    const n = subcategory.toLowerCase();
    if (n.includes("borewell") || n.includes("bore")) return "🚜";
    if (n.includes("fabricat") || n.includes("steel")) return "🔧";
    if (n.includes("transport") || n.includes("logistics")) return "🚛";
    if (n.includes("water") || n.includes("tank")) return "💧";
    if (n.includes("scrap") || n.includes("recycle")) return "♻️";
    if (n.includes("machine") || n.includes("repair")) return "⚙️";
    if (n.includes("mover") || n.includes("packer")) return "📦";
    return "🏭";
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ============================================================================
// PHONE POPUP
// ============================================================================
interface PhonePopupProps {
    phone: string;
    serviceName: string;
    onClose: () => void;
}

const PhonePopup: React.FC<PhonePopupProps> = ({ phone, serviceName, onClose }) => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
        />
        {/* Modal */}
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-xs w-full overflow-hidden">
            {/* Header */}
            <div className="px-6 py-7 text-center" style={{ backgroundColor: '#00598a' }}>
                <div
                    className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                    <span className="text-4xl">📞</span>
                </div>
                <h3 className="text-xl font-bold text-white">Contact</h3>
                <p className="text-white/80 text-sm mt-1 truncate">{serviceName}</p>
            </div>

            {/* Body */}
            <div className="p-6 text-center space-y-4">
                <p className="text-gray-500 text-sm">Phone Number</p>
                <p className="text-3xl font-bold tracking-widest" style={{ color: '#00598a' }}>
                    {phone}
                </p>

                {/* Call button */}
                <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-semibold text-white text-base transition-all"
                    style={{ backgroundColor: '#00598a' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#004a73'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#00598a'}
                >
                    📞 Call Now
                </a>

                {/* Cancel */}
                <button
                    onClick={onClose}
                    className="w-full py-3 rounded-xl font-semibold text-base transition-all"
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
                    Cancel
                </button>
            </div>

            {/* Close X */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white p-1.5 rounded-full transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
                ✕
            </button>
        </div>
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const IndustrialServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyData, setNearbyData] = useState<IndustrialWorker[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);
    const [distance, setDistance] = useState<number>(10);

    // ── Phone popup state ────────────────────────────────────────────────────
    const [phonePopup, setPhonePopup] = useState<{ phone: string; serviceName: string } | null>(null);

    // ── Get user location ────────────────────────────────────────────────────
    useEffect(() => {
        setFetchingLocation(true);
        if (!navigator.geolocation) { setLocationError("Geolocation not supported"); setFetchingLocation(false); return; }
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
        const fetchNearby = async () => {
            setLoading(true);
            setError("");
            try {
                const res: IndustrialWorkerResponse = await getNearbyIndustrialWorkers(
                    userLocation.latitude,
                    userLocation.longitude,
                    distance
                );
                if (res?.success && res.data) {
                    const all = Array.isArray(res.data) ? res.data : [res.data];
                    setNearbyData(all);
                } else { setNearbyData([]); }
            } catch (e) {
                console.error("❌ Error:", e);
                setError("Failed to load nearby industrial services");
                setNearbyData([]);
            } finally { setLoading(false); }
        };
        fetchNearby();
    }, [userLocation, distance]);

    // ── Navigation handlers ──────────────────────────────────────────────────
    const handleView = (service: any) => {
        const id = service._id || service.id;
        navigate(`/industrial-services/details/${id}`);
    };

    const handleAddPost = () => {
        navigate(
            subcategory
                ? `/add-industrial-service-form?subcategory=${subcategory}`
                : "/add-industrial-service-form"
        );
    };

    const openDirections = (service: IndustrialWorker) => {
        if (service.latitude && service.longitude) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${service.latitude},${service.longitude}`, "_blank");
        } else if (service.area || service.city) {
            const addr = encodeURIComponent([service.area, service.city, service.state].filter(Boolean).join(", "));
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    // ============================================================================
    // REAL API CARD
    // ============================================================================
    const renderIndustrialCard = (service: IndustrialWorker) => {
        const id = service._id || "";
        const location = [service.area, service.city].filter(Boolean).join(", ") || "Location not set";
        const imageUrls = (service.images || []).filter(Boolean) as string[];

        let distanceLabel: string | null = null;
        if (userLocation && service.latitude && service.longitude) {
            const d = calculateDistance(userLocation.latitude, userLocation.longitude, service.latitude, service.longitude);
            distanceLabel = d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col cursor-pointer border border-gray-100"
                onClick={() => handleView(service)}
            >
                {/* ── Image ── */}
                <div className="relative h-48 bg-gradient-to-br from-blue-600/5 to-blue-600/10 overflow-hidden">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={service.serviceName || "Industrial Service"}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <span className="text-5xl">{getCategoryIcon(service.category)}</span>
                        </div>
                    )}

                    {/* Live Data badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span
                            className="inline-flex items-center px-2.5 py-1 text-white text-xs font-bold rounded-md shadow-md"
                            style={{ backgroundColor: '#00598a' }}
                        >
                            Live Data
                        </span>
                    </div>

                    {/* Availability badge */}
                    <div className="absolute top-3 right-3 z-10">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md shadow-md ${
                            service.availability !== false ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/80" />
                            {service.availability !== false ? 'Available' : 'Unavailable'}
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
                    <h2 className="text-lg font-semibold text-gray-900 line-clamp-1">
                        {service.serviceName || "Industrial Service"}
                    </h2>

                    {service.category && (
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                            <span>{getCategoryIcon(service.category)}</span>
                            {service.category}
                            {service.subCategory && <span className="text-gray-400">· {service.subCategory}</span>}
                        </p>
                    )}

                    <p className="text-sm text-gray-500 flex items-start gap-1.5">
                        <span className="shrink-0 mt-0.5">📍</span>
                        <span className="line-clamp-1">{location}</span>
                    </p>

                    {distanceLabel && (
                        <p className="text-sm font-semibold flex items-center gap-1" style={{ color: '#00598a' }}>
                            <span>📍</span> {distanceLabel} away
                        </p>
                    )}

                    {/* Service Charge + Charge Type */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wide">Service Charge</p>
                            <p className="text-base font-bold" style={{ color: '#00598a' }}>
                                ₹{service.serviceCharge?.toLocaleString() || "N/A"}
                            </p>
                        </div>
                        {service.chargeType && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                {service.chargeType}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {service.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                    )}

                    {/* Directions + Call */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        {/* Directions — outline */}
                        <button
                            onClick={e => { e.stopPropagation(); openDirections(service); }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all border-2"
                            style={{ borderColor: '#00598a', color: '#00598a', backgroundColor: 'transparent' }}
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

                        {/* Call — solid, opens popup */}
                        <button
                            onClick={e => {
                                e.stopPropagation();
                                if (service.phone) {
                                    setPhonePopup({
                                        phone: service.phone,
                                        serviceName: service.serviceName || 'Industrial Service',
                                    });
                                }
                            }}
                            disabled={!service.phone}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all text-white"
                            style={{
                                backgroundColor: service.phone ? '#00598a' : '#d1d5db',
                                cursor: service.phone ? 'pointer' : 'not-allowed',
                            }}
                            onMouseEnter={e => {
                                if (service.phone)
                                    (e.currentTarget as HTMLElement).style.backgroundColor = '#004a73';
                            }}
                            onMouseLeave={e => {
                                if (service.phone)
                                    (e.currentTarget as HTMLElement).style.backgroundColor = '#00598a';
                            }}
                        >
                            <span>📞</span> Call
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ── DUMMY CARDS ───────────────────────────────────────────────────────────
    const renderDummyCards = () => {
        const CardComponent = CARD_MAP[resolveCardKey(subcategory)];
        return <CardComponent onViewDetails={handleView} nearbyData={[]} userLocation={userLocation} />;
    };

    // ── NEARBY SERVICES SECTION ───────────────────────────────────────────────
    const renderNearbyServices = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00598a' }} />
                </div>
            );
        }

        if (nearbyData.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <div className="text-5xl mb-3">{getCategoryIcon(subcategory)}</div>
                    <p className="text-gray-500 font-medium">No industrial services found in your area.</p>
                    <p className="text-xs text-gray-400 mt-1">Try increasing the search distance.</p>
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
                        {nearbyData.length}
                    </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyData.map(renderIndustrialCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className={`${typography.heading.h3} text-gray-800 leading-tight flex items-center gap-3`}>
                            <span className="text-4xl">{getCategoryIcon(subcategory)}</span>
                            {getDisplayTitle(subcategory)}
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">Find industrial services near you</p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        {/* Distance filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600 whitespace-nowrap">Within:</label>
                            <select
                                value={distance}
                                onChange={e => setDistance(Number(e.target.value))}
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2"
                                style={{ '--tw-ring-color': '#00598a' } as React.CSSProperties}
                            >
                                <option value={5}>5 km</option>
                                <option value={10}>10 km</option>
                                <option value={20}>20 km</option>
                                <option value={50}>50 km</option>
                                <option value={100}>100 km</option>
                            </select>
                        </div>

                        <button
                            onClick={handleAddPost}
                            className="px-5 py-2.5 rounded-lg font-semibold text-sm text-white transition-all w-full sm:w-auto justify-center"
                            style={{ backgroundColor: '#00598a' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#004a73'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = '#00598a'}
                        >
                            + Add Post
                        </button>
                    </div>
                </div>

                {/* Location status */}
                {fetchingLocation && (
                    <div className="rounded-lg p-3 flex items-center gap-2" style={{ backgroundColor: '#e8f2f8', border: '1px solid #b3d4e8' }}>
                        <div className="animate-spin h-4 w-4 border-2 border-t-transparent rounded-full" style={{ borderColor: '#00598a', borderTopColor: 'transparent' }} />
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

                {/* 1. DUMMY CARDS FIRST */}
                <div className="space-y-4">
                    {renderDummyCards()}
                </div>

                {/* 2. API DATA SECOND */}
                {userLocation && !fetchingLocation && renderNearbyServices()}

            </div>

            {/* ── Phone Popup ── */}
            {phonePopup && (
                <PhonePopup
                    phone={phonePopup.phone}
                    serviceName={phonePopup.serviceName}
                    onClose={() => setPhonePopup(null)}
                />
            )}
        </div>
    );
};

export default IndustrialServicesList;