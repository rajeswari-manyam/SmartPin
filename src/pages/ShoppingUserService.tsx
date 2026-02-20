import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { deleteShoppingRetail, ShoppingStore } from "../services/ShoppingService.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";

// ============================================================================
// THREE-DOT DROPDOWN
// ============================================================================
interface ThreeDotMenuProps {
    onEdit: () => void;
    onDelete: () => void;
}

const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({ onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="19" r="2" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-10 z-50 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden min-w-[130px]">
                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit
                    </button>
                    <div className="h-px bg-gray-100" />
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(); setOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                            <path d="M10 11v6M14 11v6" />
                            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                        </svg>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// PROPS
// ============================================================================
interface ShoppingUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideEmptyState?: boolean;
    hideHeader?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================
const ShoppingUserService: React.FC<ShoppingUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideEmptyState = false,
    hideHeader = false,
}) => {
    const navigate = useNavigate();
    const [stores, setStores] = useState<ShoppingStore[]>(data as ShoppingStore[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filteredStores = selectedSubcategory
        ? stores.filter(s =>
            s.storeType?.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : stores;

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleEdit = (id: string) => navigate(`/add-shopping-form?id=${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this store?")) return;
        setDeleteLoading(id);
        try {
            const result = await deleteShoppingRetail(id);
            if (result.success) {
                setStores(prev => prev.filter(s => s._id !== id));
            } else {
                alert(result.message || "Failed to delete store. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting store:", error);
            alert("Failed to delete store. Please try again.");
        } finally {
            setDeleteLoading(null);
        }
    };

    const handleView = (id: string) => navigate(`/shopping/details/${id}`);

    const openDirections = (store: ShoppingStore) => {
        if (store.latitude && store.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${Number(store.latitude)},${Number(store.longitude)}`,
                "_blank"
            );
        } else if (store.area || store.city) {
            const addr = encodeURIComponent(
                [store.area, store.city, store.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    // ============================================================================
    // CARD — matches screenshot style
    // ============================================================================
    const renderCard = (store: ShoppingStore) => {
        const id = store._id || "";
        const location = [store.area, store.city, store.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const imageUrls = (store.images || []).filter(Boolean) as string[];
        const isActive = (store as any).status === "active" || (store as any).isActive;

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 cursor-pointer"
                onClick={() => handleView(id)}
            >
                {/* ── Image ── */}
                <div className="relative w-full" style={{ height: "200px" }}>
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={store.storeName || "Store"}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                            <span className="text-7xl">🛒</span>
                        </div>
                    )}

                    {/* Dark gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Store type badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="text-white text-xs font-semibold bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                            {store.storeType || "Shopping & Retail"}
                        </span>
                    </div>

                    {/* Three-dot menu — top right */}
                    <div className="absolute top-3 right-3" onClick={e => e.stopPropagation()}>
                        {deleteLoading === id ? (
                            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40">
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            </div>
                        ) : (
                            <ThreeDotMenu
                                onEdit={() => handleEdit(id)}
                                onDelete={() => handleDelete(id)}
                            />
                        )}
                    </div>
                </div>

                {/* ── Card Body ── */}
                <div className="p-4">
                    {/* Name */}
                    <h3 className="text-[17px] font-bold text-gray-900 mb-1 truncate">
                        {store.storeName || "Unnamed Store"}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-sm">📍</span>
                        <p className="text-sm text-gray-500 truncate">{location}</p>
                    </div>

                    {/* Category pill + Active badge */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-sm text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full font-medium">
                            {store.storeType || "Shopping & Retail"}
                        </span>
                        {isActive !== undefined && (
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                                isActive
                                    ? "text-green-600 bg-green-50 border-green-200"
                                    : "text-gray-400 bg-gray-50 border-gray-200"
                            }`}>
                                <span className={`inline-block w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
                                {isActive ? "Active" : "Inactive"}
                            </span>
                        )}
                    </div>

                    {/* Description */}
                    {store.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {store.description}
                        </p>
                    )}

                    {/* Phone */}
                    {store.phone && (
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-sm text-gray-600">📞 {store.phone}</span>
                        </div>
                    )}

                    {/* Rating row */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {(store as any).ratings || "N/A"}
                        </span>
                    </div>

                    {/* Action buttons */}

                       
                      
                 
                </div>
            </div>
        );
    };

    // ============================================================================
    // EMPTY STATE
    // ============================================================================
    if (filteredStores.length === 0) {
        if (hideEmptyState) return null;

        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🛒</span> Shopping & Retail (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
                    <div className="text-6xl mb-4">🛒</div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">No Shopping Services Yet</h3>
                    <p className="text-sm text-gray-500 mb-5">
                        Start adding your shopping and retail services to showcase them here.
                    </p>
                    <button
                        onClick={() => navigate("/add-shopping-form")}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        + Add Shopping Service
                    </button>
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
                <h2 className={`${typography.heading.h5} text-gray-800 mb-4 flex items-center gap-2`}>
                    <span>🛒</span> Shopping & Retail ({filteredStores.length})
                </h2>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredStores.map(renderCard)}
            </div>
        </div>
    );
};

export default ShoppingUserService;