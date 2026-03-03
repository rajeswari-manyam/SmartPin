import React, { useState, useRef, useEffect } from "react";
import { X, User, Loader2, AlertCircle, MapPin } from "lucide-react";
import { updateUserById } from "../services/api.service";

interface UpdateUserModalProps {
    userId: string;
    reason: "not_found" | "incomplete";
    onSuccess: (updatedName: string) => void;
    onClose: () => void;
    // Coords from the existing user record — used as fallback if geolocation
    // hasn't resolved yet, preventing "Latitude and Longitude are required"
    existingCoords?: { lat: number | null; lng: number | null };
}

const UpdateUserModal: React.FC<UpdateUserModalProps> = ({
    userId,
    reason,
    onSuccess,
    onClose,
    existingCoords,
}) => {
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locStatus, setLocStatus] = useState<"pending" | "got" | "fallback" | "denied">(
        // If we already have coords from the user record, start as "fallback"
        existingCoords?.lat !== null && existingCoords?.lat !== undefined
            ? "fallback"
            : "pending"
    );

    const latRef = useRef<number | null>(existingCoords?.lat ?? null);
    const lngRef = useRef<number | null>(existingCoords?.lng ?? null);

    // Try to get fresh GPS coords — if it works, overwrite the fallback
    useEffect(() => {
        if (!navigator.geolocation) {
            setLocStatus(latRef.current !== null ? "fallback" : "denied");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            pos => {
                latRef.current = pos.coords.latitude;
                lngRef.current = pos.coords.longitude;
                setLocStatus("got");
            },
            () => {
                // GPS failed — keep whatever we already have (existing coords or null)
                setLocStatus(latRef.current !== null ? "fallback" : "denied");
            },
            { timeout: 8000, maximumAge: 60000 }
        );
    }, []);

    const isNotFound = reason === "not_found";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) { setError("Please enter your name."); return; }
        if (name.trim().length < 2) { setError("Name must be at least 2 characters."); return; }

        try {
            setSubmitting(true);
            setError(null);

            // Always send name + coords when available.
            // Priority: fresh GPS → existing user coords → omit
            const payload: Parameters<typeof updateUserById>[1] = {
                name: name.trim(),
            };

            if (latRef.current !== null && lngRef.current !== null) {
                payload.latitude = latRef.current;
                payload.longitude = lngRef.current;
            }

            console.log("📤 updateUserById payload:", payload);

            const result = await updateUserById(userId, payload);

            if (result?.success) {
                localStorage.setItem("userName", name.trim());
                onSuccess(name.trim());
            } else {
                setError(result?.message || "Update failed. Please try again.");
            }
        } catch (err: any) {
            setError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const locLabel = {
        pending: "Detecting location…",
        got: "Location detected",
        fallback: "Using saved location",
        denied: "Location unavailable",
    }[locStatus];

    const locColor = {
        pending: "text-white/50",
        got: "text-green-300",
        fallback: "text-blue-200",
        denied: "text-white/40",
    }[locStatus];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={!isNotFound ? onClose : undefined}
        >
            <div
                className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
                style={{ animation: "slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)" }}
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-[#00598a] px-6 py-7 relative">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        {isNotFound
                            ? <AlertCircle className="w-8 h-8 text-white" />
                            : <User className="w-8 h-8 text-white" />
                        }
                    </div>
                    <h2 className="text-xl font-bold text-white text-center leading-snug">
                        {isNotFound ? "Welcome! Set Up Your Profile" : "Update Your Details"}
                    </h2>
                    <p className="text-white/80 text-sm text-center mt-1">
                        {isNotFound
                            ? "Just enter your name to get started"
                            : "Keep your profile up to date"
                        }
                    </p>

                    {/* location pill */}
                    <div className="flex items-center justify-center gap-1.5 mt-3">
                        <MapPin className={`w-3 h-3 ${locColor}`} />
                        <span className={`text-xs ${locColor}`}>{locLabel}</span>
                    </div>

                    {!isNotFound && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                        >
                            <X className="w-4 h-4 text-white" />
                        </button>
                    )}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => { setName(e.target.value); setError(null); }}
                            placeholder="Enter your name"
                            autoFocus
                            disabled={submitting}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#00598a] transition disabled:opacity-60"
                        />
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-600">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={submitting || !name.trim()}
                        className="w-full py-3 bg-[#00598a] hover:bg-[#004a75] text-white text-sm font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {submitting
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                            : "Save & Continue"
                        }
                    </button>
                </form>
            </div>

            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.96); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </div>
    );
};

export default UpdateUserModal;