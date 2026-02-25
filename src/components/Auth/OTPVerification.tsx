import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import VoiceService from "../../services/voiceService";
import { useAuth } from "../../context/AuthContext";
import OTPInputForm from "./OtpVerification/OTPInputForm";
import SuccessScreen from "./OtpVerification/SuccessScreen";
import UserModal from "../../modal/UserModal";
import { extractDigits } from "../../utils/OTPUtils";
import { verifyOtp, resendOtp, getUserById } from "../../services/api.service";
import { generateFCMToken } from "../../firebase/fcm";
interface VoiceRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

interface OTPVerificationProps {
    email: string;
    fcmToken?: string;
    onVerify?: (otp: string) => void;
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
        phone?: string;
        name?: string;
        token?: string;
        fcmToken?: string;
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
    const [userId, setUserId] = useState<string>("");
 
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const voiceService = VoiceService.getInstance();
    const navigate = useNavigate();
    const { login } = useAuth();


    // ------------------- AUTO-VERIFY OTP -------------------
    useEffect(() => {
        const otpString = otp.join("");
        if (otpString.length === 6 && !isVerifying) {
            handleVerifyOTP(otpString);
        }
    }, [otp]);


// ✅ WEBSITE OTP AUTO-FILL (SINGLE, CORRECT IMPLEMENTATION)
useEffect(() => {
    const abortController = new AbortController();

    if (!("OTPCredential" in window)) {
        console.log("❌ Web OTP API not supported");
        return;
    }

    navigator.credentials.get({
        otp: { transport: ["sms"] },
        signal: abortController.signal,
    } as any)
        .then((credential: any) => {
            if (credential?.code) {
                console.log("📩 OTP auto-filled:", credential.code);

                const otpDigits = credential.code
                    .replace(/\D/g, "")
                    .slice(0, 6)
                    .split("");

                setOtp(otpDigits);
            }
        })
        .catch((err) => {
            if (err.name !== "AbortError") {
                console.log("OTP auto-fill error:", err.message);
            }
        });

    return () => abortController.abort();
}, []);

    useEffect(() => {
        if (timer > 0 && !showSuccess && !showFirstTimeModal) {
            const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
            return () => clearInterval(interval);
        }
    }, [timer, showSuccess, showFirstTimeModal]);

    const isValidMongoId = (id: string): boolean => {
        const mongoIdRegex = /^[a-f\d]{24}$/i;
        return mongoIdRegex.test(id);
    };

    const hasLoggedInBefore = (emailAddr: string): boolean => {
        const loggedInEmails = localStorage.getItem("loggedInEmails");
        if (!loggedInEmails) return false;

        try {
            const emails = JSON.parse(loggedInEmails);
            return emails.includes(emailAddr);
        } catch {
            return false;
        }
    };

    const markEmailAsLoggedIn = (emailAddr: string) => {
        const loggedInEmails = localStorage.getItem("loggedInEmails");
        let emails: string[] = [];

        try {
            emails = loggedInEmails ? JSON.parse(loggedInEmails) : [];
        } catch {
            emails = [];
        }

        if (!emails.includes(emailAddr)) {
            emails.push(emailAddr);
            localStorage.setItem("loggedInEmails", JSON.stringify(emails));
        }
    };

    const extractUserId = (response: OTPVerifyResponse): string => {
        const possibleUserIds = [
            { source: "response.userId", value: response.userId },
            { source: "response.user?.id", value: response.user?.id },
            { source: "response.user?._id", value: response.user?._id },
            { source: "response.data?.userId", value: response.data?.userId },
            { source: "response.data?.user?.id", value: response.data?.user?.id },
            { source: "response.data?.user?._id", value: response.data?.user?._id },
            { source: "response.data?.id", value: response.data?.id },
            { source: "response.data?._id", value: response.data?._id },
        ];

        for (const { value } of possibleUserIds) {
            if (value && typeof value === 'string') {
                if (value === email) continue;
                if (isValidMongoId(value)) return value;
                if (value.length > 10) return value;
            }
        }

        return "";
    };

    const handleVerifyOTP = async (otpString: string) => {
        if (!otpString || otpString.length !== 6 || isVerifying) {
            return;
        }

        try {
            setIsVerifying(true);
            console.log("🔐 Verifying OTP:", otpString);

   // 🔑 Generate FCM token once user verifies OTP
const fcmToken = await generateFCMToken();

const response: OTPVerifyResponse = await verifyOtp({
  email: email,
  otp: otpString,
  fcmToken: fcmToken || "",
});
            if (response.success) {
                console.log("✅ OTP verified!");

                const extractedUserId = extractUserId(response);

                if (!extractedUserId || extractedUserId === email) {
                    alert("Authentication error. Please try again.");
                    setIsVerifying(false);
                    return;
                }

                setUserId(extractedUserId);
                localStorage.setItem("userId", extractedUserId);
                localStorage.setItem("userEmail", email);
             if (fcmToken) {
    localStorage.setItem("fcmToken", fcmToken);
}
                const token = response.token || response.user?.token || response.data?.token;
                if (token) localStorage.setItem("token", token);

                await checkUserProfileAndProceed(extractedUserId);

            } else {
                console.error("❌ OTP verification failed");
                alert(response.message || "Invalid OTP. Please try again.");
                setIsVerifying(false);
                // Clear OTP fields on failure
                setOtp(["", "", "", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } catch (error: any) {
            console.error("❌ OTP verification error:", error);
            alert("Something went wrong. Please try again.");
            setIsVerifying(false);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();
        }
    };

    const checkUserProfileAndProceed = async (userId: string) => {
        try {
            const isFirstTimeForThisEmail = !hasLoggedInBefore(email);

            if (isFirstTimeForThisEmail) {
                setShowFirstTimeModal(true);
            } else {
                const userResponse = await getUserById(userId);

                if (userResponse.success && userResponse.data) {
                    const userData = userResponse.data;
                    localStorage.setItem("userName", userData.name || "User");
                    localStorage.setItem("isFirstTimeUser", "false");
                    localStorage.setItem("userData", JSON.stringify(userData));

                    const user = {
                        _id: userId,
                        id: userId,
                        phone: email,
                        name: userData.name,
                        isVerified: true,
                        latitude: userData.latitude,
                        longitude: userData.longitude,
                        createdAt: userData.createdAt,
                        updatedAt: userData.updatedAt,
                    };

                    login(user);
                } else {
                    const user = {
                        _id: userId,
                        id: userId,
                        phone: email,
                        name: "User",
                        isVerified: true,
                    };
                    localStorage.setItem("isFirstTimeUser", "false");
                    login(user);
                }

                setShowSuccess(true);
            }
        } catch (error) {
            console.error("❌ Error checking user profile:", error);
            setShowFirstTimeModal(true);
        }
    };

    const handleFirstTimeComplete = async (userName: string) => {
        markEmailAsLoggedIn(email);

        try {
            const userResponse = await getUserById(userId);

            if (userResponse.success && userResponse.data) {
                const userData = userResponse.data;
                localStorage.setItem("userName", userName);
                localStorage.setItem("isFirstTimeUser", "false");
                localStorage.setItem("userData", JSON.stringify(userData));

                const user = {
                    _id: userId,
                    id: userId,
                    phone: email,
                    name: userName,
                    isVerified: true,
                    latitude: userData.latitude,
                    longitude: userData.longitude,
                    createdAt: userData.createdAt,
                    updatedAt: userData.updatedAt,
                };

                login(user);
            } else {
                const user = {
                    _id: userId,
                    id: userId,
                    phone: email,
                    name: userName,
                    isVerified: true,
                };
                localStorage.setItem("userName", userName);
                localStorage.setItem("isFirstTimeUser", "false");
                login(user);
            }
        } catch (error) {
            const user = {
                _id: userId,
                id: userId,
                phone: email,
                name: userName,
                isVerified: true,
            };
            localStorage.setItem("userName", userName);
            localStorage.setItem("isFirstTimeUser", "false");
            login(user);
        }

        setShowFirstTimeModal(false);
        setShowSuccess(true);
    };

    const handleResend = async () => {
        try {
            setTimer(60);
            setOtp(["", "", "", "", "", ""]);
            inputRefs.current[0]?.focus();

            const response = await resendOtp(email);

            if (response.success) {
                alert("OTP sent successfully!");
            } else {
                alert(response.message || "Failed to resend OTP");
            }

            if (onResend) onResend();
        } catch (error) {
            alert("Failed to resend OTP. Please try again.");
        }
    };

    const handleVoiceInput = () => {
        if (!voiceService.isSpeechRecognitionSupported()) {
            setVoiceError("Voice recognition not supported. Use Chrome or Edge.");
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
            (result: VoiceRecognitionResult) => {
                const digits = extractDigits(result.transcript);

                if (digits.length > 0) {
                    const otpArray = digits.slice(0, 6).split("");
                    const filledOtp = [...otpArray, ...Array(6 - otpArray.length).fill("")];
                    setOtp(filledOtp);

                    const nextIndex = Math.min(otpArray.length, 5);
                    inputRefs.current[nextIndex]?.focus();

                    if (digits.length >= 6 && result.isFinal) {
                        voiceService.stopListening();
                        setIsListening(false);
                    }
                }
            },
            (error: string) => {
                setVoiceError(error);
                setIsListening(false);
                setTimeout(() => setVoiceError(null), 5000);
            }
        );
    };

    const handleSuccessContinue = () => {
        if (onClose) onClose();
        if (onContinue) onContinue();
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
                    onComplete={handleFirstTimeComplete}
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
