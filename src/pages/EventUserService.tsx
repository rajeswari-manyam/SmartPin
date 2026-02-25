import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteEventService, EventWorker } from "../services/EventWorker.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

// ============================================================================
// HELPERS
// ============================================================================
const buildImageUrl = (path: string): string => {
    if (!path) return "";
    if (/^(https?:\/\/|blob:|data:)/i.test(path)) return path;
    const clean = path.replace(/\\/g, "/").replace(/^\//, "");
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    return `${base}/${clean}`;
};

const getImageUrls = (images?: string[]): string[] =>
    (images || []).map(buildImageUrl).filter(Boolean);

// ============================================================================
// PROPS
// ============================================================================
interface EventUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const EventUserService: React.FC<EventUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();

    const [events, setEvents] = useState<EventWorker[]>(data as EventWorker[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredEvents = selectedSubcategory
        ? events.filter(e =>
            e.category &&
            e.category.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : events;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-event-service-form?id=${id}`);
    const handleView = (id: string) => navigate(`/event-services/details/${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this event service?")) return;
        setDeleteLoading(id);
        try {
            const res = await deleteEventService(id);
            if (res.success) {
                setEvents(prev => prev.filter(e => e._id !== id));
            } else {
                alert(res.message || "Failed to delete service. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("Failed to delete service. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    // ============================================================================
    // CARD
    // ============================================================================
    const renderEventCard = (event: EventWorker) => {
        const id = event._id || "";
        const imageUrls = getImageUrls(event.images);
        const location = [event.area, event.city, event.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const services = event.services || [];
        const isAvailable = event.availability;
        const description = event.description || event.bio || "";
        const displayName = event.name || "Unnamed Service";
        const phone = (event as any).phone || (event as any).contactNumber || (event as any).phoneNumber;
        const isHovered = hoveredCard === id;

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm transition-all duration-200"
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
            >
                {/* ── Image ── */}
                <div className="relative h-52">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={displayName}
                            className="w-full h-full object-cover transition-transform duration-300"
                            style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div
                            className="w-full h-full flex items-center justify-center transition-colors duration-200"
                            style={{ backgroundColor: isHovered ? 'rgba(0,89,138,0.06)' : 'rgba(147,51,234,0.05)' }}
                        >
                            <span className="text-6xl">🎉</span>
                        </div>
                    )}

                    {/* Category badge — bottom left */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {event.category || "Event Service"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div
                                    className="animate-spin rounded-full h-5 w-5 border-b-2"
                                    style={{ borderColor: '#00598a' }}
                                />
                            </div>
                        ) : (
                            <ActionDropdown
                                onEdit={() => handleEdit(id)}
                                onDelete={() => handleDelete(id)}
                            />
                        )}
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="p-4">

                    {/* Name */}
                    <h3
                        className="text-lg font-bold mb-1 truncate transition-colors duration-200"
                        style={{ color: isHovered ? '#00598a' : '#111827' }}
                    >
                        {displayName}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* Category pill + Availability status */}
                    <div className="flex items-center gap-2 mb-3">
                        <span
                            className="flex-1 text-center text-sm font-medium px-3 py-1.5 rounded-full truncate border transition-colors duration-200"
                            style={{
                                color: isHovered ? '#00598a' : '#7e22ce',
                                backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : 'rgba(147,51,234,0.05)',
                                borderColor: isHovered ? 'rgba(0,89,138,0.25)' : 'rgba(147,51,234,0.2)',
                            }}
                        >
                            {event.category || "Event Service"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
                            isAvailable
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-red-500 bg-red-50 border-red-200"
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-500"}`} />
                            {isAvailable ? "Available" : "Busy"}
                        </span>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>
                    )}

                    {/* Service detail chips */}
                    {!description && services.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {event.experience && (
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200"
                                    style={{
                                        color: isHovered ? '#00598a' : '#7e22ce',
                                        backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : '#faf5ff',
                                        borderColor: isHovered ? 'rgba(0,89,138,0.25)' : '#e9d5ff',
                                    }}
                                >
                                    🎉 {event.experience} yrs exp
                                </span>
                            )}
                            {event.chargeType && (
                                <span
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200"
                                    style={{
                                        color: isHovered ? '#00598a' : '#7e22ce',
                                        backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : '#faf5ff',
                                        borderColor: isHovered ? 'rgba(0,89,138,0.25)' : '#e9d5ff',
                                    }}
                                >
                                    {event.chargeType}
                                </span>
                            )}
                            {services.slice(0, 2).map((s, idx) => (
                                <span
                                    key={idx}
                                    className="text-xs px-2 py-0.5 rounded-full border transition-colors duration-200"
                                    style={{
                                        color: isHovered ? '#00598a' : '#7e22ce',
                                        backgroundColor: isHovered ? 'rgba(0,89,138,0.07)' : '#faf5ff',
                                        borderColor: isHovered ? 'rgba(0,89,138,0.25)' : '#e9d5ff',
                                    }}
                                >
                                    {s}
                                </span>
                            ))}
                            {services.length > 2 && (
                                <span className="text-xs text-gray-400 px-1 self-center">
                                    +{services.length - 2} more
                                </span>
                            )}
                        </div>
                    )}

                    {/* Rating row + phone + charge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {(event as any).rating ? (event as any).rating : "N/A"}
                        </span>

                        {phone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {phone}
                            </span>
                        )}

                        {event.serviceCharge && (
                            <span
                                className="ml-auto text-sm font-bold transition-colors duration-200"
                                style={{ color: isHovered ? '#00598a' : '#7e22ce' }}
                            >
                                ₹{Number(event.serviceCharge).toLocaleString()}
                            </span>
                        )}
                    </div>

                </div>
            </div>
        );
    };

    // ============================================================================
    // EMPTY STATE
    // ============================================================================
    if (filteredEvents.length === 0) {
        if (hideEmptyState) return null;

        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🎉</span> Event Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🎉</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Event Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your event services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-event-service-form")}
                        className="gap-1.5 !bg-[#00598a] hover:!bg-[#004a75]"
                    >
                        + Add Event Service
                    </Button>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div>
            {!hideHeader && (
                <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                    <span>🎉</span> Event Services ({filteredEvents.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredEvents.map(renderEventCard)}
            </div>
        </div>
    );
};

export default EventUserService;