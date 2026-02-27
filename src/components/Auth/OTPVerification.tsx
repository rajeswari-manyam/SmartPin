
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VoiceService from "../../services/voiceService";
import { useAuth } from "../../context/AuthContext";
import OTPInputForm from "./OtpVerification/OTPInputForm";
import SuccessScreen from "./OtpVerification/SuccessScreen";
import UserModal from "../../modal/UserModal";
import { extractDigits } from "../../utils/OTPUtils";
import { verifyOtp, resendOtp, getUserById } from "../../services/api.service";
import { getFcmToken } from "../../lib/fcm";

interface VoiceRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

interface User {
    id?: string;
    _id?: string;
    email?: string;
    phone?: string;
    name?: string;
    token?: string;
    fcmToken?: string;
}

interface OTPVerificationProps {
    email: string;
    onResend?: () => void;
    onBack: () => void;
    onContinue?: () => void;
    onClose?: () => void;
}

interface OTPVerifyResponse {
    success: boolean;
    message?: string;
    userId?: string;
    user?: User;
    token?: string;
    data?: any;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
    email,
    onResend,
    onBack,
    onContinue,
    onClose,
}) => {
    const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(60);
    const [isListening, setIsListening] = useState(false);
    const [voiceError, setVoiceError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
    const [userId, setUserId] = useState<string>("");

    const [fcmToken, setFcmToken] = useState<string>("");

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const voiceService = VoiceService.getInstance();
    const navigate = useNavigate();
    const { login } = useAuth();

    // ------------------- GET FCM TOKEN (ONCE) -------------------
    useEffect(() => {
        const fetchFcm = async () => {
            try {
                const token = await getFcmToken();
                if (token) {
                    setFcmToken(token);
                    localStorage.setItem("fcmToken", token);
                    console.log("🔥 FCM Token:", token);
                }
            } catch (err) {
                console.warn("⚠️ FCM failed (non-blocking)", err);
            }
        };

        fetchFcm();
    }, []);

    // ------------------- AUTO VERIFY OTP -------------------
    useEffect(() => {
        const otpString = otp.join("");
        if (otpString.length === 6 && !isVerifying) {
            handleVerifyOTP(otpString);
        }
    }, [otp]);

    // ------------------- WEB OTP AUTO FILL -------------------
    useEffect(() => {
        if (!("OTPCredential" in window)) return;

        const controller = new AbortController();

        navigator.credentials
            .get({
                otp: { transport: ["sms"] },
                signal: controller.signal,
            } as any)
            .then((cred: any) => {
                if (cred?.code) {
                    const digits = cred.code.replace(/\D/g, "").slice(0, 6);
                    setOtp(digits.split(""));
                }
            })
            .catch(() => { });

        return () => controller.abort();
    }, []);

    // ------------------- TIMER -------------------
    useEffect(() => {
        if (timer > 0 && !showSuccess && !showFirstTimeModal) {
            const i = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(i);
        }
    }, [timer, showSuccess, showFirstTimeModal]);

    const isValidMongoId = (id: string) =>
        /^[a-f\d]{24}$/i.test(id);

    const extractUserId = (res: OTPVerifyResponse): string => {
        const ids = [
            res.userId,
            res.user?.id,
            res.user?._id,
            res.data?.userId,
            res.data?.user?.id,
            res.data?.user?._id,
            res.data?.id,
            res.data?._id,
        ];
        return ids.find(id => id && isValidMongoId(id)) || "";
    };

    // ------------------- VERIFY OTP -------------------
    const handleVerifyOTP = async (otpString: string) => {
        if (isVerifying) return;

        try {
            setIsVerifying(true);

            const response = await verifyOtp({
                email,
                otp: otpString,
                fcmToken: fcmToken || localStorage.getItem("fcmToken") || "",
            });

            if (!response.success) {
                throw new Error(response.message);
            }

            const extractedId = extractUserId(response);
            if (!extractedId) throw new Error("Invalid user");

            setUserId(extractedId);
            localStorage.setItem("userId", extractedId);
            localStorage.setItem("userEmail", email);

            const token =
                response.token ||
                response.user?.token ||
                response.data?.token;

            if (token) localStorage.setItem("token", token);

            await checkUserProfileAndProceed(extractedId);

        } catch (err) {
            alert("Invalid OTP. Try again.");
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    // ------------------- PROFILE CHECK -------------------
    const checkUserProfileAndProceed = async (uid: string) => {
        try {
            const res = await getUserById(uid);
            const userData = res?.data;

            const user = {
                _id: uid,
                id: uid,
                phone: email,
                name: userData?.name || "User",
                isVerified: true,
                latitude: userData?.latitude,
                longitude: userData?.longitude,
            };

            login(user);
            setShowSuccess(true);
        } catch {
            setShowFirstTimeModal(true);
        }
    };

    // ------------------- RESEND OTP -------------------
    const handleResend = async () => {
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
        await resendOtp(email);
        onResend?.();
    };

    // ------------------- VOICE INPUT -------------------
    const handleVoiceInput = () => {
        if (!voiceService.isSpeechRecognitionSupported()) {
            setVoiceError("Voice not supported");
            return;
        }

        setIsListening(true);
        voiceService.startListening(
            result => {
                const digits = extractDigits(result.transcript).slice(0, 6);
                setOtp(digits.split(""));
                if (digits.length === 6 && result.isFinal) {
                    voiceService.stopListening();
                    setIsListening(false);
                }
            },
            err => {
                setVoiceError(err);
                setIsListening(false);
            }
        );
    };

    const handleSuccessContinue = () => {
        onClose?.();
        onContinue?.();
        navigate("/role-selection", { replace: true });
    };

    if (showSuccess) {
        return <SuccessScreen onContinue={handleSuccessContinue} />;
    }

    if (showFirstTimeModal) {
        return (
            <>
                <OTPInputForm
                    email={email}
                    otp={otp}
                    setOtp={setOtp}
                    timer={timer}
                    isListening={isListening}
                    voiceError={voiceError}
                    isVerifying={isVerifying}
                    inputRefs={inputRefs}
                    onBack={onBack}
                    onVerify={handleVerifyOTP}
                    onResend={handleResend}
                    onVoiceInput={handleVoiceInput}
                />
                <UserModal
                    phoneNumber={email}
                    userId={userId}
                    onComplete={() => setShowSuccess(true)}
                />
            </>
        );
    }

    return (
        <OTPInputForm
            email={email}
            otp={otp}
            setOtp={setOtp}
            timer={timer}
            isListening={isListening}
            voiceError={voiceError}
            isVerifying={isVerifying}
            inputRefs={inputRefs}
            onBack={onBack}
            onVerify={handleVerifyOTP}
            onResend={handleResend}
            onVoiceInput={handleVoiceInput}
        />
    );
};

export default OTPVerification;