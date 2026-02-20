import React from "react";
import { Volume2, Loader2 } from "lucide-react";
import Button from "../../ui/Buttons";
import typography from "../../../styles/typography";
import OTPInputBoxes from "./OTPInputBoxes";
import VoiceIcon from "../../../assets/icons/Voice.png";

interface OTPInputFormProps {
    phoneNumber: string;
    otp: string[];
    setOtp: React.Dispatch<React.SetStateAction<string[]>>;
    timer: number;
    isListening: boolean;
    voiceError: string | null;
    isVerifying: boolean;
    inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    onBack: () => void;
    onVerify: (otp: string) => void;
    onResend: () => void;
    onVoiceInput: () => void;
}

const OTPInputForm: React.FC<OTPInputFormProps> = ({
    phoneNumber,
    otp,
    setOtp,
    timer,
    isListening,
    voiceError,
    isVerifying,
    inputRefs,
    onBack,
    onVerify,
    onResend,
    onVoiceInput,
}) => {
    const isOtpComplete = otp.every((digit) => digit !== "");

    const handleReadAloud = () => {
        const otpString = otp.join("");
        if (otpString && otpString.replace(/\s/g, "")) {
            const speech = new SpeechSynthesisUtterance(otpString.split("").join(" "));
            speech.rate = 0.8;
            speech.lang = "en-US";
            window.speechSynthesis.speak(speech);
        }
    };

    const handleVerifyClick = () => {
        const otpString = otp.join("");
        if (otpString.length === 6) {
            onVerify(otpString);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f09b13]/10 via-white to-[#f5b340]/10 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 relative">
                {/* Back Arrow Button */}
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 text-gray-700 hover:text-gray-900 transition-colors"
                    aria-label="Go back"
                    disabled={isVerifying}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                    >
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Header */}
                <div className="text-center space-y-2 mb-8 mt-4">
                    <h2 className={`text-gray-900 font-bold ${typography.heading.h3}`}>
                        Verify OTP
                    </h2>
                    <p className={`text-gray-600 ${typography.body.small}`}>
                        Enter the 6-digit code sent to
                    </p>
                    <p className={`text-gray-900 font-semibold ${typography.body.base}`}>
                        +91 {phoneNumber}
                    </p>
                </div>

                {/* OTP Input Form */}
                <div className="space-y-6">
                    {/* OTP Input Boxes */}
                    <OTPInputBoxes
                        otp={otp}
                        setOtp={setOtp}
                        inputRefs={inputRefs}
                        isVerifying={isVerifying}
                    />

                    {/* Voice Error Message */}
                    {voiceError && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm text-center">
                            {voiceError}
                        </div>
                    )}

                    {/* Voice Input Button */}
                    <button
                        type="button"
                        onClick={onVoiceInput}
                        disabled={isVerifying}
                        className={`w-full py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                          isListening
                            ? "bg-red-600 hover:bg-red-700 animate-pulse"
                            : "bg-gradient-to-r from-[#f09b13] to-[#f5b340] hover:brightness-110"
                        } ${isVerifying ? "opacity-50 cursor-not-allowed" : ""} ${typography.body.base}`}
                    >
                        {isListening ? (
                            <>
                                <div className="w-5 h-5 bg-white rounded-sm" />
                                Stop Listening
                            </>
                        ) : (
                            <>
                                <img src={VoiceIcon} alt="Voice" className="w-5 h-5" />
                                Voice Input
                            </>
                        )}
                    </button>

                    {/* Read OTP Aloud Button */}
                    <button
                        type="button"
                        onClick={handleReadAloud}
                        disabled={!otp.some((digit) => digit !== "") || isVerifying}
                        className={`w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border-2 ${
                          !otp.some((digit) => digit !== "") || isVerifying
                            ? "border-gray-300 text-gray-400 cursor-not-allowed bg-white"
                            : "border-[#f09b13] text-[#f09b13] hover:bg-[#f09b13]/5 bg-white"
                        } ${typography.body.base}`}
                    >
                        <Volume2 className="w-5 h-5" />
                        Read OTP Aloud
                    </button>

                    {/* Verify Button */}
                    <Button
                        type="button"
                        onClick={handleVerifyClick}
                        disabled={!isOtpComplete || isVerifying}
                        variant="primary"
                        size="lg"
                        fullWidth
                        className={!isOtpComplete || isVerifying ? "opacity-50 cursor-not-allowed" : ""}
                    >
                        {isVerifying ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Verifying...
                            </span>
                        ) : (
                            "Verify & Continue"
                        )}
                    </Button>

                    {/* Resend Section */}
                    <div className="text-center space-y-3">
                        <p className={`text-gray-600 ${typography.body.small}`}>
                            Didn't receive code?
                        </p>

                        <button
                            type="button"
                            onClick={onResend}
                            disabled={timer > 0 || isVerifying}
                            className={`w-full py-3 rounded-xl font-semibold transition-all border-2 ${
                              timer > 0 || isVerifying
                                ? "border-gray-300 text-gray-400 cursor-not-allowed bg-white"
                                : "border-[#f09b13] text-[#f09b13] hover:bg-[#f09b13]/5 bg-white"
                            } ${typography.body.base}`}
                        >
                            Resend OTP
                        </button>

                        {timer > 0 && (
                            <p className={`text-green-600 flex items-center justify-center gap-1 ${typography.body.small}`}>
                                <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                </svg>
                                Resend available in {timer}s
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPInputForm;
