import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getNearbyHospitals, Hospital } from "../services/HospitalService.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

// ── Nearby card components (existing)
import NearbyHospitalCard from "../components/cards/Hospital&HealthCare/NearByHospitals";
import NearbyClinicsCard from "../components/cards/Hospital&HealthCare/NearByClinicsCard";
import NearbyDentalCard from "../components/cards/Hospital&HealthCare/NearByDentalClinicsCard";
import NearbyPharmaciesCard from "../components/cards/Hospital&HealthCare/NearByPharmacies";
import NearbyEyeCard from "../components/cards/Hospital&HealthCare/NearByEyeHospital";
import NearbyDermatologistsCard from "../components/cards/Hospital&HealthCare/NearByDermotologists";
import NearbyPhysiotherapyCard from "../components/cards/Hospital&HealthCare/NearByPhysiotheraphy";
import NearbyVetClinicCard from "../components/cards/Hospital&HealthCare/NearByVetHospital";
import NearbyAmbulanceCard from "../components/cards/Hospital&HealthCare/NearByAmbulance";
import NearbyBloodBankCard from "../components/cards/Hospital&HealthCare/NearByBloodBlanks";
import NearbyNursingServiceCard from "../components/cards/Hospital&HealthCare/NearByNursing";
import NearbyDiagnosticLabsCard from "../components/cards/Hospital&HealthCare/NearByDiagnosticlabs";

// ============================================================================
// PHONE POPUP MODAL
// ============================================================================
interface PhonePopupProps {
    hospital: Hospital;
    onClose: () => void;
    onCall: (phone: string) => void;
}

const PhonePopup: React.FC<PhonePopupProps> = ({ hospital, onClose, onCall }) => {
    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeInScale_0.2s_ease-out]">
                {/* Header */}
                <div className="bg-gradient-to-r from-[#00598a] to-[#004a73] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-xl">🏥</span>
                        </div>
                        <div>
                            <p className="text-white font-semibold text-sm leading-tight line-clamp-1">
                                {hospital.name || hospital.hospitalType || "Hospital"}
                            </p>
                            <p className="text-white/70 text-xs">
                                {[hospital.area, hospital.city].filter(Boolean).join(", ") || "Location not set"}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center text-white text-lg font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                        Contact Number
                    </p>

                    <div className="bg-[#00598a]/5 border border-[#00598a]/20 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📞</span>
                            <span className="text-xl font-bold text-gray-800 tracking-wide">
                                {hospital.phone}
                            </span>
                        </div>
                        {/* Copy button */}
                        <button
                            onClick={() => {
                                navigator.clipboard?.writeText(hospital.phone || "");
                            }}
                            title="Copy number"
                            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-gray-500 text-sm"
                        >
                            📋
                        </button>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                        <button
                            onClick={onClose}
                            className="px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl font-medium text-sm hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                onCall(hospital.phone!);
                                onClose();
                            }}
                            className="px-4 py-2.5 bg-[#00598a] text-white rounded-xl font-medium text-sm hover:bg-[#004a73] active:bg-[#003d60] transition-colors flex items-center justify-center gap-2 shadow-md shadow-[#00598a]/30"
                        >
                            <span>📞</span>
                            Call Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// SUBCATEGORY → CARD COMPONENT MAP
// ============================================================================
type CardKey =
    | "hospital"
    | "clinic"
    | "dental"
    | "pharmacy"
    | "eye"
    | "derma"
    | "physio"
    | "vet"
    | "ambulance"
    | "blood"
    | "nursing"
    | "lab";

const CARD_MAP: Record<CardKey, React.ComponentType<any>> = {
    hospital: NearbyHospitalCard,
    clinic: NearbyClinicsCard,
    dental: NearbyDentalCard,
    pharmacy: NearbyPharmaciesCard,
    eye: NearbyEyeCard,
    derma: NearbyDermatologistsCard,
    physio: NearbyPhysiotherapyCard,
    vet: NearbyVetClinicCard,
    ambulance: NearbyAmbulanceCard,
    blood: NearbyBloodBankCard,
    nursing: NearbyNursingServiceCard,
    lab: NearbyDiagnosticLabsCard,
};

// ============================================================================
// HELPERS
// ============================================================================
const normalizeSubcategory = (sub: string | undefined): string => {
    if (!sub) return "";
    return sub.toLowerCase();
};

const resolveCardKey = (text: string | undefined): CardKey | null => {
    if (!text) return null;
    const n = text.toLowerCase();

    if (n.includes("dental")) return "dental";
    if (n.includes("eye")) return "eye";
    if (n.includes("derma")) return "derma";
    if (n.includes("physio")) return "physio";
    if (n.includes("vet") || n.includes("pet")) return "vet";
    if (n.includes("ambulance")) return "ambulance";
    if (n.includes("blood")) return "blood";
    if (n.includes("nursing")) return "nursing";
    if (n.includes("lab") || n.includes("diagnostic")) return "lab";
    if (n.includes("pharmac") || (n.includes("medical") && n.includes("shop"))) return "pharmacy";
    if (n.includes("clinic")) return "clinic";
    if (n.includes("hospital")) return "hospital";

    return null;
};

const getCardComponentForSubcategory = (
    subcategory: string | undefined
): React.ComponentType<any> | null => {
    const key = resolveCardKey(subcategory);
    if (key && CARD_MAP[key]) return CARD_MAP[key];
    return CARD_MAP.hospital; // Default
};

const shouldShowNearbyCards = (subcategory: string | undefined): boolean => {
    return true; // Always show dummy cards
};

const titleFromSlug = (slug: string | undefined): string => {
    if (!slug) return "All Hospital Services";
    return slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
};

const getDisplayTitle = (subcategory: string | undefined) => titleFromSlug(subcategory);

const normalizeType = (type: string): string => type.toLowerCase().trim().replace(/\s+/g, " ");

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const HospitalServicesList: React.FC = () => {
    const { subcategory } = useParams<{ subcategory?: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [nearbyServices, setNearbyServices] = useState<Hospital[]>([]);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [locationError, setLocationError] = useState("");
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // ── Phone popup state ──
    const [phonePopupHospital, setPhonePopupHospital] = useState<Hospital | null>(null);

    // ── Get user's location on component mount ──
    useEffect(() => {
        const getUserLocation = () => {
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
                    console.log("📍 User location:", latitude, longitude);
                },
                (error) => {
                    console.error("Location error:", error);
                    setLocationError("Unable to retrieve your location.");
                    setFetchingLocation(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        };

        getUserLocation();
    }, []);

    // ── Fetch nearby hospitals when location is available ──
    useEffect(() => {
        const fetchNearbyHospitals = async () => {
            if (!userLocation) return;

            setLoading(true);
            setError("");

            try {
                const distance = 10;
                const response = await getNearbyHospitals(
                    userLocation.latitude,
                    userLocation.longitude,
                    distance
                );

                if (response.success && response.data) {
                    const allServices = Array.isArray(response.data) ? response.data : [response.data];

                    if (subcategory) {
                        const targetType = titleFromSlug(subcategory);
                        const normalizedTarget = normalizeType(targetType);
                        const filtered = allServices.filter(
                            (s) => s.hospitalType && normalizeType(s.hospitalType) === normalizedTarget
                        );
                        setNearbyServices(filtered);
                    } else {
                        setNearbyServices(allServices);
                    }
                } else {
                    setNearbyServices([]);
                }
            } catch (err: any) {
                console.error("Error fetching nearby hospitals:", err);
                setError("Failed to load nearby services");
                setNearbyServices([]);
            } finally {
                setLoading(false);
            }
        };

        if (userLocation) {
            fetchNearbyHospitals();
        }
    }, [userLocation, subcategory]);

    const handleView = (hospital: any) => {
        const id = hospital.id || hospital._id;
        navigate(`/hospital-services/details/${id}`);
    };

    const handleAddPost = () => {
        navigate(
            subcategory
                ? `/add-hospital-service-form?subcategory=${subcategory}`
                : "/add-hospital-service-form"
        );
    };

    const openDirections = (hospital: Hospital) => {
        if (hospital.latitude && hospital.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`,
                "_blank"
            );
        } else if (hospital.area || hospital.city) {
            const addr = encodeURIComponent(
                [hospital.address, hospital.area, hospital.city, hospital.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const openCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getImageUrls = (images?: string[]): string[] => {
        return (images || []).filter(Boolean) as string[];
    };

    // ── Render Hospital Card ──
    const renderHospitalCard = (hospital: Hospital) => {
        const id = hospital._id || hospital.id || "";
        const location = [hospital.area, hospital.city].filter(Boolean).join(", ") || "Location not set";

        const servicesList: string[] = (hospital.services && typeof hospital.services === 'string')
            ? hospital.services.split(',').map(s => s.trim()).filter(Boolean)
            : (Array.isArray(hospital.services) ? hospital.services : []);

        const imageUrls = getImageUrls(hospital.images);

        let distance: string | null = null;
        if (userLocation && hospital.latitude && hospital.longitude) {
            const dist = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                hospital.latitude,
                hospital.longitude
            );
            distance = dist < 1 ? `${(dist * 1000).toFixed(0)} m` : `${dist.toFixed(1)} km`;
        }

        return (
            <div
                key={id}
                className="bg-white rounded-xl shadow-sm hover:shadow-2xl hover:shadow-[#00598a]/20 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer border border-gray-100 hover:border-[#00598a] hover:-translate-y-1 group"
                onClick={() => handleView(hospital)}
            >
                {/* Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-[#00598a]/5 to-[#00598a]/10 overflow-hidden">
                    {/* Top accent bar that slides in on hover */}
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#00598a] z-10 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={hospital.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 group-hover:bg-[#00598a]/5 transition-colors duration-300">
                            <span className="text-5xl group-hover:scale-110 transition-transform duration-300 inline-block">🏥</span>
                        </div>
                    )}

                    {/* Live Data Badge */}
                    <div className="absolute top-3 left-3 z-10">
                        <span className="inline-flex items-center px-2.5 py-1 bg-[#00598a] text-white text-xs font-bold rounded-md shadow-md">
                            Live Data
                        </span>
                    </div>

                    {/* Image Counter */}
                    {imageUrls.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                            1 / {imageUrls.length}
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col gap-2.5">
                    {/* Title */}
                    <h2 className="text-lg font-semibold text-gray-900 group-hover:text-[#00598a] transition-colors duration-200 line-clamp-1 leading-tight">
                        {hospital.name || hospital.hospitalType || "Unnamed Hospital"}
                    </h2>

                    {/* Location */}
                    <div className="flex items-start gap-1.5">
                        <span className="text-gray-400 text-sm mt-0.5 flex-shrink-0">📍</span>
                        <p className="text-sm text-gray-600 line-clamp-1">{location}</p>
                    </div>

                    {/* Distance */}
                    {distance && (
                        <p className="text-sm font-semibold text-[#00598a] flex items-center gap-1">
                            <span>📍</span>
                            {distance} away
                        </p>
                    )}

                    {/* Description */}
                    {hospital.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {hospital.description}
                        </p>
                    )}

                    {/* Operating Hours */}
                    {hospital.operatingHours && (
                        <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <span className="text-gray-400">🕐</span>
                            <span>{hospital.operatingHours}</span>
                        </div>
                    )}

                    {/* Hospital Type Badge */}
                    {hospital.hospitalType && (
                        <div className="pt-1">
                            <span className="inline-flex items-center gap-1 text-xs bg-[#00598a]/5 text-[#00598a] px-2.5 py-1 rounded-md border border-[#00598a]/20 font-medium group-hover:bg-[#00598a]/10 transition-colors duration-200">
                                ⭐ {hospital.hospitalType}
                            </span>
                        </div>
                    )}

                    {/* Rating */}
                    {hospital.rating && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-yellow-500 text-sm">⭐</span>
                            <span className="text-sm font-bold text-gray-900">{hospital.rating}</span>
                            {hospital.reviewCount && (
                                <span className="text-xs text-gray-500">({hospital.reviewCount} reviews)</span>
                            )}
                        </div>
                    )}

                    {/* Services Tags */}
                    {servicesList.length > 0 && (
                        <div className="pt-2 border-t border-gray-100 mt-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                Services
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {servicesList.slice(0, 3).map((service, idx) => (
                                    <span
                                        key={`${id}-${idx}`}
                                        className="inline-flex items-center text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-200 group-hover:border-[#00598a]/20 group-hover:bg-[#00598a]/5 group-hover:text-[#00598a] transition-colors duration-200"
                                    >
                                        {service}
                                    </span>
                                ))}
                                {servicesList.length > 3 && (
                                    <span className="text-xs text-[#00598a] font-medium px-1 py-1">
                                        +{servicesList.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-3 mt-1">
                        {/* Directions Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                openDirections(hospital);
                            }}
                            className="flex items-center justify-center gap-1.5 px-3 py-2.5 border-2 border-[#00598a] text-[#00598a] rounded-lg font-medium text-sm hover:bg-[#00598a] hover:text-white transition-all duration-200 active:scale-95"
                        >
                            <span>📍</span>
                            Directions
                        </button>

                        {/* Call Button — shows popup with phone number */}
                        <div className="relative group/call">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (hospital.phone) {
                                        setPhonePopupHospital(hospital);
                                    }
                                }}
                                disabled={!hospital.phone}
                                className={`w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 active:scale-95 ${
                                    hospital.phone
                                        ? "bg-[#00598a] text-white hover:bg-[#004a73] hover:shadow-lg hover:shadow-[#00598a]/30 hover:-translate-y-0.5"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <span>📞</span>
                                Call
                            </button>

                            {/* Hover tooltip showing phone number */}
                            {hospital.phone && (
                                <div
                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/call:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-lg"
                                    style={{ backgroundColor: "#00598a" }}
                                >
                                    <span className="font-semibold">{hospital.phone}</span>
                                    {/* Arrow */}
                                    <div
                                        className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
                                        style={{ borderTopColor: "#00598a" }}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // ── Render Cards Section (Dummy Data) ──
    const renderCardsSection = () => {
        const CardComponent = getCardComponentForSubcategory(subcategory);
        if (!CardComponent) return null;

        return (
            <div>
                <CardComponent
                    onViewDetails={handleView}
                    nearbyData={undefined}
                    userLocation={userLocation}
                />
            </div>
        );
    };

    // ── Render Your Services (API Data) ──
    const renderYourServices = () => {
        if (nearbyServices.length === 0) {
            return (
                <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                    <p className="text-gray-500">No services found in your area.</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-gray-800">Your Services</h2>
                    <span className="inline-flex items-center justify-center min-w-[2rem] h-7 bg-[#00598a] text-white text-sm font-bold rounded-full px-2.5">
                        {nearbyServices.length}
                    </span>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {nearbyServices.map(renderHospitalCard)}
                </div>
            </div>
        );
    };

    // ============================================================================
    // MAIN RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Phone Popup Modal ── */}
            {phonePopupHospital && (
                <PhonePopup
                    hospital={phonePopupHospital}
                    onClose={() => setPhonePopupHospital(null)}
                    onCall={openCall}
                />
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{getDisplayTitle(subcategory)}</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage Hospitals & Healthcare services</p>
                    </div>

                    <Button
                        variant="primary"
                        size="md"
                        onClick={handleAddPost}
                        className="w-full sm:w-auto justify-center bg-[#00598a] hover:bg-[#004a73] text-white"
                    >
                        + Create Hospitals & Healthcare Service
                    </Button>
                </div>

                {/* Location Status */}
                {fetchingLocation && (
                    <div className="bg-[#00598a]/10 border border-[#00598a]/20 rounded-lg p-3 flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-[#00598a] border-t-transparent rounded-full"></div>
                        <span className="text-sm text-[#00598a]">Getting your location...</span>
                    </div>
                )}

                {locationError && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-lg">
                        <p className="text-yellow-700 text-sm">{locationError}</p>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                        <p className="text-red-700 font-medium text-sm">{error}</p>
                    </div>
                )}

                {/* DUMMY CARDS FIRST */}
                {shouldShowNearbyCards(subcategory) && (
                    <div className="space-y-4">
                        {renderCardsSection()}
                    </div>
                )}

                {/* YOUR SERVICES (API DATA) SECOND */}
                {userLocation && !fetchingLocation && renderYourServices()}
            </div>
        </div>
    );
};

export default HospitalServicesList;