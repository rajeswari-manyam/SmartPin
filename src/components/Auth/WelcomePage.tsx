import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

import voiceIcon from "../../assets/icons/Voice.png";
import LoginForm from "./LoginForm";
import VoiceService from "../../services/voiceService";

const TimesIcon = FaTimes as any;

interface WelcomePageProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenOTP?: (phoneNumber: string) => void;
}

type ViewState = "welcome" | "login" | "signup";

const WelcomePage: React.FC<WelcomePageProps> = ({ isOpen, onClose, onOpenOTP }) => {

    const [view, setView] = useState<ViewState>("welcome");
    const [isListening, setIsListening] = useState(false);
    const [voiceText, setVoiceText] = useState("");

    const voiceService = VoiceService.getInstance();

    /* ------------------ Effects ------------------ */

    // Lock background scroll
    useEffect(() => {
        if (isOpen) {
            setView("welcome");
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
            stopVoice();
        }

        return () => {
            document.body.style.overflow = "unset";
            stopVoice();
        };
    }, [isOpen]);

    // ESC key close
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    /* ------------------ Voice Logic ------------------ */

    const startVoice = () => {
        if (!voiceService.isSpeechRecognitionSupported()) {
            alert("Voice not supported");
            return;
        }

        setVoiceText("");
        setIsListening(true);

        voiceService.startListening(
            (result) => {
                setVoiceText(result.transcript);

                if (result.isFinal) {
                    setIsListening(false);

                    const command = result.transcript.toLowerCase();

                    // Simple voice navigation
                    if (command.includes("login")) {
                        setView("login");
                    } else if (command.includes("sign up") || command.includes("signup")) {
                        setView("signup");
                    }
                }
            },
            (error) => {
                console.error(error);
                setIsListening(false);
            }
        );
    };

    const stopVoice = () => {
        voiceService.stopListening();
        setIsListening(false);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[200]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
                <div
                    className="bg-white w-full max-w-2xl min-h-[520px] rounded-2xl shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <TimesIcon size={22} />
                    </button>

                    <div className="p-8">
                        {view === "welcome" ? (
                            <div className="text-center space-y-6">
                                {/* Icon */}
                                <div className="text-6xl">🔧</div>

                                {/* Title */}
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">
                                        ServiceHub
                                    </h1>
                                    <p className="text-gray-600 mt-1">
                                        Welcome to ServiceHub
                                    </p>
                                </div>

                                {/* Voice Button */}
                                <div
                                    onClick={isListening ? stopVoice : startVoice}
                                    className={`cursor-pointer rounded-full py-3 px-6 transition-all
                                        ${isListening
                                            ? "bg-red-500 animate-pulse"
                                            : "bg-primary"
                                        }`}
                                >
                                    <p className="text-white flex items-center justify-center gap-2 text-sm">
                                        <img src={voiceIcon} alt="Voice" className="w-5 h-5" />
                                        {isListening
                                            ? "Listening"
                                            : "Tap to start voice"}
                                    </p>
                                </div>

                                {/* Live Voice Text */}
                                {voiceText && (
                                    <p className="text-sm text-gray-500">
                                        🎤 {voiceText}
                                    </p>
                                )}

                                {/* Buttons */}
                                <div className="space-y-4 pt-2">
                                    <button
                                        onClick={() => setView("signup")}
                                        className="w-full bg-primary
                                            text-white py-3 rounded-xl font-semibold"
                                    >
                                        Get Started
                                    </button>

                                    <button
                                        onClick={() => setView("login")}
                                        className="w-full border-2 border-primary text-primary
                                            py-3 rounded-xl font-semibold hover:bg-secondary"
                                    >
                                        Already have an account?
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <LoginForm
                                onClose={onClose}
                                initialMode={view === "login" ? "login" : "signup"}
                                onBack={() => setView("welcome")}
                                onOpenOTP={onOpenOTP}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default WelcomePage;
