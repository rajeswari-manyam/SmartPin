import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VoiceService from "../../services/voiceService";
import { useAuth } from "../../context/AuthContext";
import OTPInputForm from "./OtpVerification/OTPInputForm";
import SuccessScreen from "./OtpVerification/SuccessScreen";
import UpdateUserModal from "../../modal/UserModal";
import { extractDigits } from "../../utils/OTPUtils";
import { verifyOtp, resendOtp, getUserById, getWorkerByUserId } from "../../services/api.service";
import { getFcmToken } from "../../lib/fcm";

interface User {
    id?: string;
    _id: string;
    email: string;
    phone?: string;
    name?: string;
    token?: string;
    fcmToken?: string;
    isVerified: boolean;
    role?: "USER" | "WORKER" | "user" | "worker";
    latitude?: string;
    longitude?: string;
    workerId?: string;
    hasWorkerProfile?: boolean;
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
    user?: {
        id?: string;
        _id?: string;
        email?: string;
        name?: string;
        token?: string;
        role?: string;
    };
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

    const userIdRef = useRef<string>("");
    const [userId, setUserId] = useState<string>("");

    const existingCoordsRef = useRef<{ lat: number | null; lng: number | null }>({
        lat: null, lng: null,
    });

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const voiceService = VoiceService.getInstance();
    const navigate = useNavigate();
    const { login } = useAuth();
    const fcmFetchedRef = useRef(false);
    const isVerifyingRef = useRef(false);

    const normalizeRole = (role?: string | null): "USER" | "WORKER" => {
        if (!role) return "USER";
        return role.toUpperCase() === "WORKER" ? "WORKER" : "USER";
    };

    // ─── FCM TOKEN ────────────────────────────────────────────────────────────
    useEffect(() => {
        if (fcmFetchedRef.current) return;
        fcmFetchedRef.current = true;
        const fetchFcm = async () => {
            try {
                const token = await getFcmToken();
                if (token) {
                    localStorage.setItem("fcmToken", token);
                    console.log("🔥 FCM Token:", token);
                }
            } catch (err) {
                console.warn("⚠️ FCM failed (non-blocking)", err);
            }
        };
        fetchFcm();
    }, []);

    // ─── AUTO VERIFY ─────────────────────────────────────────────────────────
    useEffect(() => {
        const otpString = otp.join("");
        if (otpString.length === 6 && !isVerifyingRef.current) {
            handleVerifyOTP(otpString);
        }
    }, [otp]);

    // ─── TIMER ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (timer > 0 && !showSuccess && !showFirstTimeModal) {
            const i = setInterval(() => setTimer(t => t - 1), 1000);
            return () => clearInterval(i);
        }
    }, [timer, showSuccess, showFirstTimeModal]);

    const isValidMongoId = (id: string) => /^[a-f\d]{24}$/i.test(id);

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

    // ─── VERIFY OTP ───────────────────────────────────────────────────────────
    const handleVerifyOTP = async (otpString: string) => {
        if (isVerifyingRef.current) return;
        isVerifyingRef.current = true;
        setIsVerifying(true);

        try {
            const fcmToken = localStorage.getItem("fcmToken") || "";
            const response = await verifyOtp({ email, otp: otpString, fcmToken });

            if (!response.success) {
                throw new Error(response.message || "OTP verification failed");
            }

            const extractedId = extractUserId(response);
            if (!extractedId) throw new Error("Invalid user ID in response");

            userIdRef.current = extractedId;
            setUserId(extractedId);

            localStorage.setItem("userId", extractedId);
            localStorage.setItem("userEmail", email);
            localStorage.setItem("role", "USER");

            const token = response.token || response.user?.token || response.data?.token;
            if (token) localStorage.setItem("token", token);

            await checkUserProfileAndProceed(extractedId);
        } catch (err: any) {
            console.error("❌ OTP verification failed:", err);
            alert(err?.message || "Invalid OTP. Try again.");
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        } finally {
            isVerifyingRef.current = false;
            setIsVerifying(false);
        }
    };

    // ─── PROFILE CHECK ────────────────────────────────────────────────────────
    const checkUserProfileAndProceed = async (uid: string) => {
        const hasSeenModal = localStorage.getItem(`isFirstTimeUser_${uid}`) === "false";

        try {
            const [userRes, workerRes] = await Promise.allSettled([
                getUserById(uid),
                getWorkerByUserId(uid),
            ]);

            const userData = userRes.status === "fulfilled" ? userRes.value?.data : null;
            const workerData = workerRes.status === "fulfilled" ? workerRes.value?.data : null;

            // ── WORKER PATH ───────────────────────────────────────────────────
            if (workerData?._id) {
                console.log("👷 Existing worker found:", workerData._id);

                localStorage.setItem("role", "WORKER");
                localStorage.setItem("workerId", workerData._id);
                localStorage.setItem("userName", workerData.name || userData?.name || "Worker");
                localStorage.setItem(`isFirstTimeUser_${uid}`, "false");

                const user: User = {
                    _id: uid,
                    id: uid,
                    email,
                    name: workerData.name || userData?.name || "Worker",
                    isVerified: true,
                    role: "WORKER",
                    workerId: workerData._id,
                    hasWorkerProfile: true,
                    latitude: workerData.latitude ? String(workerData.latitude) : userData?.latitude,
                    longitude: workerData.longitude ? String(workerData.longitude) : userData?.longitude,
                };

                login(user);
                setShowSuccess(true);
                return;
            }

            // ── USER PATH ─────────────────────────────────────────────────────
            const isDefaultOrEmptyName =
                !userData?.name ||
                userData.name.trim().length === 0 ||
                userData.name.trim().toLowerCase() === "user";

            if (isDefaultOrEmptyName && !hasSeenModal) {
                existingCoordsRef.current = {
                    lat: userData?.latitude ? parseFloat(String(userData.latitude)) : null,
                    lng: userData?.longitude ? parseFloat(String(userData.longitude)) : null,
                };
                console.log("🆕 New user detected — showing setup modal");
                setShowFirstTimeModal(true);
                return;
            }

            localStorage.setItem("role", "USER");
            localStorage.setItem(`isFirstTimeUser_${uid}`, "false");

            const user: User = {
                _id: uid,
                id: uid,
                email,
                name: userData?.name || localStorage.getItem("userName") || "User",
                isVerified: true,
                role: "USER",
                latitude: userData?.latitude,
                longitude: userData?.longitude,
            };

            login(user);
            setShowSuccess(true);

        } catch (err) {
            console.warn("⚠️ Profile fetch failed", err);
            if (hasSeenModal) {
                const role = normalizeRole(localStorage.getItem("role"));
                login({
                    _id: uid, email,
                    name: localStorage.getItem("userName") || "User",
                    isVerified: true, role,
                });
                setShowSuccess(true);
            } else {
                existingCoordsRef.current = { lat: null, lng: null };
                console.log("🆕 New user (no profile) — showing setup modal");
                setShowFirstTimeModal(true);
            }
        }
    };

    // ─── MODAL SUCCESS CALLBACK ───────────────────────────────────────────────
    const handleModalSuccess = (userName: string) => {
        const uid = userIdRef.current;
        const role = normalizeRole(localStorage.getItem("role"));

        localStorage.setItem(`isFirstTimeUser_${uid}`, "false");
        localStorage.setItem("userName", userName);

        const user: User = {
            _id: uid,
            id: uid,
            email,
            name: userName,
            isVerified: true,
            role,
        };

        console.log("✅ First-time user logged in:", user);
        login(user);
        setShowFirstTimeModal(false);
        setShowSuccess(true);
    };

    // ─── RESEND ───────────────────────────────────────────────────────────────
    const handleResend = async () => {
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        isVerifyingRef.current = false;
        setIsVerifying(false);
        inputRefs.current[0]?.focus();
        await resendOtp(email);
        onResend?.();
    };

    // ─── VOICE ────────────────────────────────────────────────────────────────
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
            err => { setVoiceError(err); setIsListening(false); }
        );
    };

    const handleSuccessContinue = () => {
        onClose?.();
        onContinue?.();
        navigate("/role-selection", { replace: true });
    };

    // ─── RENDER ───────────────────────────────────────────────────────────────

    if (showSuccess) {
        return <SuccessScreen onContinue={handleSuccessContinue} />;
    }

    if (showFirstTimeModal) {
        return (
            <UpdateUserModal
                userId={userIdRef.current}
                reason="not_found"
                existingCoords={existingCoordsRef.current}
                onSuccess={handleModalSuccess}
                onClose={() => { /* non-dismissible for first-time users */ }}
            />
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