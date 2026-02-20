import * as React from "react";
import { X } from "lucide-react";
import Button from "../components/ui/Buttons";
import { API_BASE_URL } from "../services/api.service";  // ✅ ADD THIS IMPORT

interface UserModalProps {
    phoneNumber: string;
    userId: string;
    onComplete: (userName: string) => void;
    onSkip?: () => void;
}

const UserModal: React.FC<UserModalProps> = ({
    phoneNumber,
    userId,
    onComplete,
    onSkip
}) => {
    const [name, setName] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [latitude, setLatitude] = React.useState<number | null>(null);
    const [longitude, setLongitude] = React.useState<number | null>(null);
    const [locationError, setLocationError] = React.useState<string | null>(null);

    // ✅ Get current location on mount
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

            const updateData: Record<string, string> = {
                name: name.trim(),
            };

            // ✅ Add location if available
            if (latitude !== null && longitude !== null) {
                updateData.latitude = latitude.toString();
                updateData.longitude = longitude.toString();
                console.log("📍 Including location in update:", { latitude, longitude });
            } else {
                console.log("⚠️ No location available, updating name only");
            }

            // ✅ FIXED: Use API_BASE_URL instead of hardcoded IP
            const response = await fetch(`${API_BASE_URL}/updateUserById/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams(updateData),
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem("userName", name.trim());
                localStorage.setItem("isFirstTimeUser", "false");

                const existingUserData = localStorage.getItem("userData");
                if (existingUserData) {
                    const userData = JSON.parse(existingUserData);
                    userData.name = name.trim();
                    localStorage.setItem("userData", JSON.stringify(userData));
                }

                console.log("✅ Name updated successfully:", result);
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
        if (onSkip) {
            onSkip();
        } else {
            localStorage.setItem("isFirstTimeUser", "false");
            onComplete("User");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                <div className="bg-[#f09b13] px-6 py-8 text-center">

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
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#f09b13] text-gray-900"
                            autoFocus
                            disabled={isSubmitting}
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <div className="mb-6 p-3 bg-[#F0F0F0] rounded-lg">

                        <p className="text-xs text-gray-500 mb-1">Registered Phone</p>
                        <p className="text-sm font-semibold text-gray-900">
                            +91 {phoneNumber}
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

                    <div className="space-y-3">
                        <Button
                            type="submit"
                            disabled={isSubmitting || !name.trim()}
                            className="w-full py-3 bg-[#F0F0F0] text-gray-700 rounded-xl font-semibold hover:brightness-95 transition-colors disabled:opacity-50"


                        >
                            {isSubmitting ? "Updating..." : "Continue"}
                        </Button>

                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={isSubmitting}
                            className="w-full py-3 bg-[#F0F0F0] text-gray-700 rounded-xl font-semibold hover:brightness-95 transition-colors disabled:opacity-50"

                        >
                            Skip for now
                        </button>
                    </div>
                </form>

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

export default UserModal;
