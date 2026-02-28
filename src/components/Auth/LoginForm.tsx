import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Buttons";
import typography from "../../styles/typography";
import OTPVerification from "./OTPVerification";
import voiceIcon from "../../assets/icons/Voice.png";
import VoiceService from "../../services/voiceService";
import { registerWithOtp } from "../../services/api.service";

interface LoginFormProps {
    onClose: () => void;
    initialMode?: "signup" | "login";
    onBack?: () => void;
    onOpenOTP?: (email: string) => void;
}

type FormStep = "email" | "otp";

const LoginForm: React.FC<LoginFormProps> = ({
    onClose,
    initialMode = "signup",
    onBack,
    onOpenOTP
}) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [isLogin, setIsLogin] = useState(initialMode === "login");
    const [currentStep, setCurrentStep] = useState<FormStep>("email");
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false); // ✅ loading state

    const voiceService = VoiceService.getInstance();

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleVoiceInput = () => {
        if (!voiceService.isSpeechRecognitionSupported()) {
            setVoiceError("Voice not supported");
            setTimeout(() => setVoiceError(null), 5000);
            return;
        }

        if (isListening) {
            voiceService.stopListening();
            setIsListening(false);
            return;
        }

        setIsListening(true);
        setVoiceError(null);

        voiceService.startListening(
            (result) => {
                if (result.isFinal) {
                    setEmail(result.transcript.trim());
                    voiceService.stopListening();
                    setIsListening(false);
                }
            },
            (error) => {
                setVoiceError(error);
                setIsListening(false);
                setTimeout(() => setVoiceError(null), 5000);
            }
        );
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
        e?.preventDefault();

        if (!isValidEmail(email)) {
            alert("Please enter a valid email address");
            return;
        }

        try {
            setIsSending(true); // ✅ start loading
            console.log("Registering with email:", email);
            localStorage.setItem("userEmail", email);
const response = await registerWithOtp({
    email,
    name: "User",
    role: "USER",           // ✅ keep role
    latitude: latitude ?? 0,
    longitude: longitude ?? 0,
} as any);
            console.log("Registration response:", response);

            if (response.success) {
                console.log("OTP sent to email successfully.");

                if (onOpenOTP) {
                    onOpenOTP(email);
                } else {
                    setCurrentStep("otp");
                }
            } else {
                alert(response.message || "Registration failed");
            }
        } catch (error) {
            console.error("Registration error:", error);
            alert("Failed to send OTP. Please try again.");
        } finally {
            setIsSending(false); // ✅ stop loading
        }
    };

    const handleBackToEmail = () => {
        setCurrentStep("email");
    };

    const handleOTPContinue = () => {
        onClose();
        navigate("/role-selection", { replace: true });
    };

    if (currentStep === "otp" && !onOpenOTP) {
        return (
            <OTPVerification
                email={email}
                onBack={handleBackToEmail}
                onContinue={handleOTPContinue}
                onClose={onClose}
            />
        );
    }

    return (
        <div className="space-y-8">
            {onBack && (
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-black absolute top-6 left-6"
                >
                    ← Back
                </button>
            )}

            <div className="text-center pt-6">
                <div className="flex justify-center mb-4">
                    <div className="bg-gradient-to-r from-[#00598a] to-[#003a5c] p-4 rounded-full">
                        <span className={`text-white ${typography.logo.icon}`}>⚡</span>
                    </div>
                </div>
                <h1 className={`text-gray-900 mb-2 ${typography.heading.h3}`}>
                    ServiceHub
                </h1>
                <p className={`text-gray-600 ${typography.body.base}`}>
                    {isLogin ? "Welcome Back" : "Find Professionals"}
                </p>
            </div>

            {/* Voice Assistance Button */}
            <button
                type="button"
                onClick={handleVoiceInput}
                className={`w-full rounded-full py-3 px-6 text-center transition-all flex items-center justify-center gap-2 ${isListening
                    ? "bg-red-600 animate-pulse"
                    : "bg-gradient-to-r from-[#00598a] to-[#003a5c] hover:brightness-110"
                    }`}
            >
                <img src={voiceIcon} alt="Voice" className="w-5 h-5" />
                <p className={`text-white ${typography.body.small}`}>
                    {isListening ? "Listening" : "Voice Assistance"}
                </p>
            </button>

            {/* Email Form */}
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                <div>
                    <label
                        htmlFor="email"
                        className={`block mb-2 text-gray-700 ${typography.form.label}`}
                    >
                        Email Address
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={handleEmailChange}
                            placeholder="your.email@example.com"
                            className={`w-full px-4 pr-14 py-4 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-[#00598a] transition-colors duration-200 ${typography.form.input}`}
                            required
                            disabled={isSending}
                        />
                        <button
                            type="button"
                            onClick={handleVoiceInput}
                            disabled={isSending}
                            className={`absolute inset-y-0 right-0 flex items-center pr-4 transition-colors duration-200 ${isListening
                                ? "text-red-500 animate-pulse"
                                : "text-gray-400 hover:text-[#00598a]"
                                }`}
                            title={isListening ? "Stop listening" : "Use voice input"}
                        >
                            {isListening ? (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="8" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                            )}
                        </button>
                    </div>
                    {voiceError && (
                        <p className={`mt-2 text-red-500 ${typography.form.helper}`}>
                            {voiceError}
                        </p>
                    )}
                </div>

                {/* ✅ Send OTP button with loading state like "Posting..." */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!isValidEmail(email) || isSending}
                    className={`w-full py-4 rounded-xl font-semibold text-white text-base flex items-center justify-center gap-2 transition-all duration-200
                        ${isSending
                            ? "bg-gray-400 cursor-not-allowed opacity-80"
                            : !isValidEmail(email)
                                ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                : "bg-gradient-to-r from-[#00598a] to-[#003a5c] hover:brightness-110 cursor-pointer"
                        }`}
                >
                    {isSending ? (
                        <>
                            {/* Spinner */}
                            <svg
                                className="animate-spin w-5 h-5 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12" cy="12" r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                />
                            </svg>
                            Sending OTP...
                        </>
                    ) : (
                        "Send OTP to Email"
                    )}
                </button>

                {/* Terms & Conditions */}
                {!isLogin && (
                    <p className={`text-center text-gray-500 ${typography.body.xs}`}>
                        Agree to{" "}
                        <a
                            href="/terms"
                            className="text-[#00598a] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms
                        </a>{" "}
                        and{" "}
                        <a
                            href="/privacy"
                            className="text-[#00598a] hover:underline"
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy
                        </a>
                    </p>
                )}
            </form>
        </div>
    );
};

export default LoginForm;