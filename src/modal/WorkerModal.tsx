import * as React from "react";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WorkerModalProps {
    phoneNumber: string;
    userId: string;
    onComplete: (userName: string) => void;
}

const WorkerModal: React.FC<WorkerModalProps> = ({
    phoneNumber,
    userId,
    onComplete
}) => {
    const navigate = useNavigate();
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
                    console.log("📍 Worker location captured:", {
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
                console.log("📍 Including location in worker update:", { latitude, longitude });
            }

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/updateUserById/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams(updateData),
            });

            const result = await response.json();

            if (result.success) {
                // Store name in localStorage
                localStorage.setItem("userName", name.trim());
                localStorage.setItem("isFirstTimeWorker", "false");

                const existingUserData = localStorage.getItem("userData");
                if (existingUserData) {
                    const userData = JSON.parse(existingUserData);
                    userData.name = name.trim();
                    localStorage.setItem("userData", JSON.stringify(userData));
                }

                console.log("✅ Worker name updated successfully:", result);
                
                // Close modal and proceed to profile creation
                onComplete(name.trim());
            } else {
                setError(result.message || "Failed to update name");
            }
        } catch (error) {
            console.error("❌ Error updating worker name:", error);
            setError("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
                <div className="bg-gradient-to-r from-[#00598a] to-[#00598a] px-6 py-8 text-center">
                    <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                        <span className="text-4xl">👷‍♂️</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Welcome to ServiceHub!
                    </h2>
                    <p className="text-white/90 text-sm">
                        Let's set up your worker profile
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="mb-6">
                        <label
                            htmlFor="name"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                            What's your name?
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setError(null);
                            }}
                            placeholder="Enter your full name"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 transition-colors text-gray-900"
                            autoFocus
                            disabled={isSubmitting}
                        />
                        {error && (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                    </div>

                    <div className="mb-6 p-3 bg-gray-50 rounded-lg">
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

                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800">
                            <span className="font-semibold">Next step:</span> After entering your name, 
                            you'll create your complete worker profile with skills and services.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !name.trim()}
                        className="w-full py-3 bg-gradient-to-r from-[#00598a] to-[#00598a] text-white rounded-xl font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isSubmitting ? "Saving..." : "Continue to Profile Setup"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WorkerModal;
