import * as React from "react";
import { X } from "lucide-react";
import Button from "../components/ui/Buttons";
import { API_BASE_URL } from "../services/api.service";

interface UserModalProps {
    phoneNumber: string;   // kept for compatibility — pass "" for email-based login
    userId: string;
    email?: string;        // pass email here for email-based login
    onComplete: (userName: string) => void;
    onSkip?: () => void;
}

const UserModal: React.FC<UserModalProps> = ({
    phoneNumber,
    userId,
    email,
    onComplete,
    onSkip
}) => {
    const [name, setName] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [latitude, setLatitude] = React.useState<number | null>(null);
    const [longitude, setLongitude] = React.useState<number | null>(null);
    const [locationError, setLocationError] = React.useState<string | null>(null);

    // Show email if available, otherwise phone
    const contactLabel = email ? "Registered Email" : "Registered Phone";
    const contactValue = email || phoneNumber || "";

    React.useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                    console.log("📍 Location captured:", {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.error("❌ Error getting location:", error);
                    setLocationError("Unable to get location");
                }
            );
        } else {
            setLocationError("Geolocation not supported");
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            setError("Please enter your name");
            return;
        }

        if (name.trim().length < 2) {
            setError("Name must be at least 2 characters");
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            const formData = new FormData();
            formData.append("name", name.trim());

            if (latitude !== null && longitude !== null) {
                formData.append("latitude", latitude.toString());
                formData.append("longitude", longitude.toString());
                console.log("📍 Including location in update:", { latitude, longitude });
            } else {
                console.log("⚠️ No location available, updating name only");
            }

            const response = await fetch(`${API_BASE_URL}/updateUserById/${userId}`, {
                method: "PUT",
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem("userName", name.trim());

                // ✅ FIX: Mark this user ID as NOT first-time, keyed by userId
                // so returning users are never shown this modal again
                localStorage.setItem(`isFirstTimeUser_${userId}`, "false");
                localStorage.setItem("isFirstTimeUser", "false"); // legacy key

                const existingUserData = localStorage.getItem("userData");
                if (existingUserData) {
                    try {
                        const userData = JSON.parse(existingUserData);
                        userData.name = name.trim();
                        localStorage.setItem("userData", JSON.stringify(userData));
                    } catch {
                        // ignore parse errors
                    }
                }

                console.log("✅ Name updated successfully:", result.data);
                onComplete(name.trim());
            } else {
                setError(result.message || "Failed to update name");
            }
        } catch (error) {
            console.error("❌ Error updating name:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkip = () => {
        // ✅ FIX: Also mark as seen when skipping so it doesn't reappear
        localStorage.setItem(`isFirstTimeUser_${userId}`, "false");
        localStorage.setItem("isFirstTimeUser", "false");

        if (onSkip) {
            onSkip();
        } else {
            onComplete("User");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="bg-[#00598a] px-6 py-8 text-center">
                    <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl">😊</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome to ServiceHub!
                    </h2>
                    <p className="text-white/90 text-sm">
                        You are a first-time user
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            What should we call you?
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError(null);
                            }}
                            placeholder="Enter your name"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#00598a] text-gray-900"
                            autoFocus
                            disabled={isSubmitting}
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    {/* Contact info — shows email or phone */}
                    {contactValue && (
                        <div className="mb-6 p-3 bg-[#F0F0F0] rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">{contactLabel}</p>
                            <p className="text-sm font-semibold text-gray-900 break-all">
                                {contactValue}
                            </p>

                            {latitude && longitude ? (
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                    <span>📍</span>
                                    Location detected
                                </p>
                            ) : locationError ? (
                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                    <span>⚠️</span>
                                    {locationError}
                                </p>
                            ) : (
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <span>📍</span>
                                    Detecting location...
                                </p>
                            )}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="w-full py-3 bg-[#F0F0F0] text-gray-700 rounded-xl font-semibold hover:brightness-95 transition-colors disabled:opacity-50"
                    >
                        {isSubmitting ? "Updating..." : "Continue"}
                    </Button>
                </form>

                {/* Skip / Close button */}
                <Button
                    onClick={handleSkip}
                    disabled={isSubmitting}
                    className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// ✅ Helper exported so OTPVerification / AuthContext can call it BEFORE
//    rendering UserModal, to decide whether to show it at all.
//
// Usage (wherever you decide to show UserModal):
//
//   import { shouldShowUserModal } from "./UserModal";
//
//   const showModal = shouldShowUserModal(userId, userName);
//   if (showModal) { /* render <UserModal /> */ }
//
// ─────────────────────────────────────────────────────────────────────────────
export const shouldShowUserModal = (userId: string, userName?: string | null): boolean => {
    if (!userId) return false;

    // 1. Per-user key takes priority — if we've already seen this user, never show again
    const perUserKey = localStorage.getItem(`isFirstTimeUser_${userId}`);
    if (perUserKey === "false") return false;

    // 2. If the user already has a real name (not empty / "User"), don't show
    if (userName && userName.trim() !== "" && userName.trim().toLowerCase() !== "user") {
        // Mark them as seen so we skip this check next time
        localStorage.setItem(`isFirstTimeUser_${userId}`, "false");
        return false;
    }

    // 3. Legacy: if the old flag is false and the per-user key wasn't set yet, honour it
    const legacyKey = localStorage.getItem("isFirstTimeUser");
    if (legacyKey === "false") {
        localStorage.setItem(`isFirstTimeUser_${userId}`, "false");
        return false;
    }

    // 4. Only show if backend explicitly returned isFirstTimeUser: true
    //    (caller should pass this from the login API response)
    return true;
};

export default UserModal;