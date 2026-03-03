import React, { useEffect, useState, useCallback } from "react";
import {
    User,
    Mail,
    MapPin,
    Clock,
    RefreshCw,
    Loader2,
    AlertTriangle,
    Pencil,
} from "lucide-react";
import { getUserById, User as UserType } from "../services/api.service";
import UpdateUserModal from "../modal/UserModal";

// ─── props ────────────────────────────────────────────────────────────────────
interface UserProfileScreenProps {
    userId: string;   // pass the logged-in user's ID from AuthContext / route param
}

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
    });

const Avatar: React.FC<{ src?: string; name: string; size?: number }> = ({
    src, name, size = 80,
}) => {
    const [imgErr, setImgErr] = useState(false);
    const initial = name?.[0]?.toUpperCase() ?? "?";

    if (src && !imgErr) {
        return (
            <img
                src={src}
                alt={name}
                onError={() => setImgErr(true)}
                className="rounded-2xl object-cover border-4 border-white shadow-lg"
                style={{ width: size, height: size }}
            />
        );
    }
    return (
        <div
            className="rounded-2xl flex items-center justify-center text-white font-black border-4 border-white shadow-lg bg-[#00598a]"
            style={{ width: size, height: size, fontSize: size * 0.38 }}
        >
            {initial}
        </div>
    );
};

// ─── InfoRow ──────────────────────────────────────────────────────────────────
const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({
    icon, label, value,
}) => (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-[#e8f4fb] flex items-center justify-center flex-shrink-0 mt-0.5">
            {icon}
        </div>
        <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-sm font-semibold text-gray-800 mt-0.5 break-all">{value}</p>
        </div>
    </div>
);

// ─── main component ───────────────────────────────────────────────────────────
const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ userId }) => {

    type ScreenState = "loading" | "found" | "not_found" | "error";

    const [screenState, setScreenState] = useState<ScreenState>("loading");
    const [userData,    setUserData]    = useState<UserType | null>(null);
    const [errorMsg,    setErrorMsg]    = useState<string>("");

    // modal: "not_found" forces it open; "edit" is voluntary edit
    const [modalReason, setModalReason] = useState<"not_found" | "incomplete" | null>(null);

    // ── fetch ─────────────────────────────────────────────────────────────────
    const loadUser = useCallback(async () => {
        if (!userId) {
            setErrorMsg("No user ID provided.");
            setScreenState("error");
            return;
        }

        setScreenState("loading");
        setErrorMsg("");

        try {
            const res = await getUserById(userId);

            // backend sends { success: true, data: {...} }  OR  { success: false }
            if (res?.success && res?.data) {
                setUserData(res.data);
                setScreenState("found");
            } else {
                // success: false — user exists in auth but not in DB
                setUserData(null);
                setScreenState("not_found");
                setModalReason("not_found");
            }
        } catch (err: any) {
            const status = err?.response?.status;

            if (status === 404) {
                // 404 → user truly does not exist
                setUserData(null);
                setScreenState("not_found");
                setModalReason("not_found");
            } else {
                setErrorMsg(err?.message || "Failed to load user data.");
                setScreenState("error");
            }
        }
    }, [userId]);

    useEffect(() => { loadUser(); }, [loadUser]);

    // ── after modal saves ─────────────────────────────────────────────────────
    const handleModalSuccess = async (updatedName: string) => {
        setModalReason(null);
        // re-fetch to get the full updated object from backend
        try {
            const res = await getUserById(userId);
            if (res?.success && res?.data) {
                setUserData(res.data);
            } else {
                // fallback: patch local state with the name we just saved
                setUserData(prev => prev
                    ? { ...prev, name: updatedName }
                    : { _id: userId, name: updatedName, email: "", createdAt: "", updatedAt: "" }
                );
            }
        } catch {
            setUserData(prev => prev
                ? { ...prev, name: updatedName }
                : { _id: userId, name: updatedName, email: "", createdAt: "", updatedAt: "" }
            );
        }
        setScreenState("found");
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER STATES
    // ─────────────────────────────────────────────────────────────────────────

    // ── loading ───────────────────────────────────────────────────────────────
    if (screenState === "loading") {
        return (
            <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-[#00598a]" />
                    <p className="text-sm text-gray-500 font-medium">Loading profile…</p>
                </div>
            </div>
        );
    }

    // ── error ─────────────────────────────────────────────────────────────────
    if (screenState === "error") {
        return (
            <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center px-6">
                <div className="bg-white rounded-3xl shadow-md p-8 max-w-sm w-full text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-sm text-gray-500 mb-6">{errorMsg}</p>
                    <button
                        onClick={loadUser}
                        className="w-full py-3 bg-[#00598a] hover:bg-[#004a75] text-white text-sm font-bold rounded-xl transition flex items-center justify-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // FOUND — main profile card
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f0f4f8]">

            {/* ── top band ── */}
            <div className="bg-[#00598a] h-40" />

            {/* ── card ── */}
            <div className="max-w-md mx-auto px-4 -mt-20 pb-10">
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

                    {/* avatar + name row */}
                    <div className="px-6 pt-6 pb-4 flex items-end gap-4">
                        <Avatar
                            src={userData?.profilePic}
                            name={userData?.name || "?"}
                            size={80}
                        />
                        <div className="flex-1 min-w-0 mb-1">
                            <h1 className="text-xl font-black text-gray-900 truncate leading-tight">
                                {userData?.name || "—"}
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Member since {userData?.createdAt ? fmtDate(userData.createdAt) : "—"}
                            </p>
                        </div>
                        <button
                            onClick={() => setModalReason("incomplete")}
                            className="mb-1 flex-shrink-0 w-9 h-9 rounded-xl bg-[#e8f4fb] hover:bg-[#d0eaf6] flex items-center justify-center transition"
                            title="Edit profile"
                        >
                            <Pencil className="w-4 h-4 text-[#00598a]" />
                        </button>
                    </div>

                    {/* divider */}
                    <div className="h-px bg-gray-100 mx-6" />

                    {/* info rows */}
                    <div className="px-6 py-2">
                        {userData?.email && (
                            <InfoRow
                                icon={<Mail className="w-4 h-4 text-[#00598a]" />}
                                label="Email"
                                value={userData.email}
                            />
                        )}
                        {userData?.latitude && userData?.longitude && (
                            <InfoRow
                                icon={<MapPin className="w-4 h-4 text-[#00598a]" />}
                                label="Location"
                                value={`${parseFloat(userData.latitude).toFixed(4)}, ${parseFloat(userData.longitude).toFixed(4)}`}
                            />
                        )}
                        {userData?.updatedAt && (
                            <InfoRow
                                icon={<Clock className="w-4 h-4 text-[#00598a]" />}
                                label="Last Updated"
                                value={fmtDate(userData.updatedAt)}
                            />
                        )}
                        {!userData?.email && !userData?.latitude && (
                            <div className="py-6 text-center">
                                <User className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                                <p className="text-sm text-gray-400">No details on record</p>
                                <button
                                    onClick={() => setModalReason("incomplete")}
                                    className="mt-3 text-xs font-semibold text-[#00598a] underline underline-offset-2"
                                >
                                    Add details
                                </button>
                            </div>
                        )}
                    </div>

                    {/* refresh footer */}
                    <div className="px-6 pb-5 pt-1">
                        <button
                            onClick={loadUser}
                            className="w-full py-2.5 border-2 border-[#00598a]/20 hover:border-[#00598a]/50 text-[#00598a] text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                    </div>
                </div>
            </div>

            {/* ── modal (not_found forces open, incomplete is dismissible) ── */}
            {modalReason && (
                <UpdateUserModal
                    userId={userId}
                    reason={modalReason}
                    onSuccess={handleModalSuccess}
                    onClose={() => {
                        if (modalReason !== "not_found") setModalReason(null);
                    }}
                />
            )}
        </div>
    );
};

export default UserProfileScreen;