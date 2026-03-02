// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import VoiceService from "../../services/voiceService";
// import { useAuth } from "../../context/AuthContext";
// import OTPInputForm from "./OtpVerification/OTPInputForm";
// import SuccessScreen from "./OtpVerification/SuccessScreen";
// import UserModal from "../../modal/UserModal";
// import { extractDigits } from "../../utils/OTPUtils";
// import { verifyOtp, resendOtp, getUserById } from "../../services/api.service";
// import { getFcmToken } from "../../lib/fcm";

// // ✅ Match exactly the User type defined in AuthContext
// interface User {
//     id?: string;
//     _id: string;        // required to match AuthContext User
//     email: string;      // required to match AuthContext User
//     phone?: string;
//     name?: string;
//     token?: string;
//     fcmToken?: string;
//     isVerified: boolean;
//     role?: "USER" | "WORKER" | "user" | "worker"; // ✅ typed role
//     latitude?: string;
//     longitude?: string;
//     workerId?: string;
//     hasWorkerProfile?: boolean;
// }

// interface OTPVerificationProps {
//     email: string;
//     onResend?: () => void;
//     onBack: () => void;
//     onContinue?: () => void;
//     onClose?: () => void;
// }

// interface OTPVerifyResponse {
//     success: boolean;
//     message?: string;
//     userId?: string;
//     user?: {
//         id?: string;
//         _id?: string;
//         email?: string;
//         name?: string;
//         token?: string;
//         role?: string;
//     };
//     token?: string;
//     data?: any;
// }

// const OTPVerification: React.FC<OTPVerificationProps> = ({
//     email,
//     onResend,
//     onBack,
//     onContinue,
//     onClose,
// }) => {
//     const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
//     const [timer, setTimer] = useState(60);
//     const [isListening, setIsListening] = useState(false);
//     const [voiceError, setVoiceError] = useState<string | null>(null);
//     const [isVerifying, setIsVerifying] = useState(false);
//     const [showSuccess, setShowSuccess] = useState(false);
//     const [showFirstTimeModal, setShowFirstTimeModal] = useState(false);
//     const [userId, setUserId] = useState<string>("");

//     const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
//     const voiceService = VoiceService.getInstance();
//     const navigate = useNavigate();
//     const { login } = useAuth();
//     const fcmFetchedRef = useRef(false);

//     // ✅ Ref guard prevents triple-firing (state updates are async, refs are sync)
//     const isVerifyingRef = useRef(false);

//     // ✅ Always returns a non-undefined role string safe for both User type and localStorage
//     const normalizeRole = (role?: string | null): "USER" | "WORKER" => {
//         if (!role) return "USER";
//         return role.toUpperCase() === "WORKER" ? "WORKER" : "USER";
//     };

//     // ------------------- FCM TOKEN FETCH -------------------
//     useEffect(() => {
//         if (fcmFetchedRef.current) return;
//         fcmFetchedRef.current = true;

//         const fetchFcm = async () => {
//             try {
//                 const token = await getFcmToken();
//                 if (token) {
//                     localStorage.setItem("fcmToken", token);
//                     console.log("🔥 FCM Token:", token);
//                 }
//             } catch (err) {
//                 console.warn("⚠️ FCM failed (non-blocking)", err);
//             }
//         };

//         fetchFcm();
//     }, []);

//     // ------------------- AUTO VERIFY OTP -------------------
//     useEffect(() => {
//         const otpString = otp.join("");
//         if (otpString.length === 6 && !isVerifyingRef.current) {
//             handleVerifyOTP(otpString);
//         }
//     }, [otp]);

//     // ------------------- WEB OTP AUTO FILL -------------------
//     useEffect(() => {
//         if (!("OTPCredential" in window)) return;

//         const controller = new AbortController();

//         navigator.credentials
//             .get({
//                 otp: { transport: ["sms"] },
//                 signal: controller.signal,
//             } as any)
//             .then((cred: any) => {
//                 if (cred?.code) {
//                     const digits = cred.code.replace(/\D/g, "").slice(0, 6);
//                     setOtp(digits.split(""));
//                 }
//             })
//             .catch(() => { });

//         return () => controller.abort();
//     }, []);

//     // ------------------- TIMER -------------------
//     useEffect(() => {
//         if (timer > 0 && !showSuccess && !showFirstTimeModal) {
//             const i = setInterval(() => setTimer(t => t - 1), 1000);
//             return () => clearInterval(i);
//         }
//     }, [timer, showSuccess, showFirstTimeModal]);

//     const isValidMongoId = (id: string) => /^[a-f\d]{24}$/i.test(id);

//     const extractUserId = (res: OTPVerifyResponse): string => {
//         const ids = [
//             res.userId,
//             res.user?.id,
//             res.user?._id,
//             res.data?.userId,
//             res.data?.user?.id,
//             res.data?.user?._id,
//             res.data?.id,
//             res.data?._id,
//         ];
//         return ids.find(id => id && isValidMongoId(id)) || "";
//     };

//     // ------------------- VERIFY OTP -------------------
//     const handleVerifyOTP = async (otpString: string) => {
//         if (isVerifyingRef.current) return;
//         isVerifyingRef.current = true;
//         setIsVerifying(true);

//         try {
//             const fcmToken = localStorage.getItem("fcmToken") || "";

//             console.log("📤 Sending verify-otp:", {
//                 email,
//                 otp: otpString,
//                 fcmToken: fcmToken ? "present" : "skipped",
//             });

//             const response = await verifyOtp({ email, otp: otpString, fcmToken });

//             if (!response.success) {
//                 throw new Error(response.message || "OTP verification failed");
//             }

//             const extractedId = extractUserId(response);
//             if (!extractedId) throw new Error("Invalid user ID in response");

//             setUserId(extractedId);
//             localStorage.setItem("userId", extractedId);
//             localStorage.setItem("userEmail", email);
//             localStorage.setItem("role", "USER");

//             const token = response.token || response.user?.token || response.data?.token;
//             if (token) localStorage.setItem("token", token);

//             await checkUserProfileAndProceed(extractedId);

//         } catch (err: any) {
//             console.error("❌ OTP verification failed:", err);
//             alert(err?.message || "Invalid OTP. Try again.");
//             setOtp(["", "", "", "", "", ""]);
//             inputRefs.current[0]?.focus();
//         } finally {
//             isVerifyingRef.current = false;
//             setIsVerifying(false);
//         }
//     };

//     // ------------------- PROFILE CHECK -------------------
//     const checkUserProfileAndProceed = async (uid: string) => {
//         try {
//             const res = await getUserById(uid);
//             const userData = res?.data;

//             // Treat missing name or default "User" placeholder as first-time user
//             const hasName =
//                 userData?.name &&
//                 userData.name.trim().length > 0 &&
//                 userData.name.trim() !== "User";

//             if (!hasName) {
//                 console.log("🆕 First-time user, showing modal");
//                 setShowFirstTimeModal(true);
//                 return;
//             }

//             // ✅ Cast to any since api.service.ts User type doesn't include role,
//             // but the API response may still return it
//             const rawRole = (userData as any)?.role as string | undefined;
//             const role = normalizeRole(rawRole || localStorage.getItem("role"));
//             localStorage.setItem("role", role);

//             const user: User = {
//                 _id: uid,
//                 id: uid,
//                 email,
//                 name: userData.name,
//                 isVerified: true,
//                 role,                       // ✅ correctly typed
//                 latitude: userData?.latitude,
//                 longitude: userData?.longitude,
//             };

//             console.log("✅ Returning user logged in:", user);
//             login(user);
//             setShowSuccess(true);
//         } catch (err) {
//             console.warn("⚠️ Profile not found, treating as first-time login", err);
//             setShowFirstTimeModal(true);
//         }
//     };

//     // ------------------- FIRST-TIME USER MODAL COMPLETE -------------------
//     const handleComplete = async (userName: string) => {
//         console.log("✅ First-time user setup complete:", userName);

//         // ✅ normalizeRole casts safely to the union type
//         const role = normalizeRole(localStorage.getItem("role"));

//         const user: User = {
//             _id: userId,
//             id: userId,
//             email,
//             name: userName,
//             isVerified: true,
//             role, // ✅ correctly typed
//         };

//         console.log("✅ First-time user logged in:", user);
//         login(user);
//         setShowFirstTimeModal(false);
//         setShowSuccess(true);
//     };

//     // ------------------- RESEND OTP -------------------
//     const handleResend = async () => {
//         setTimer(60);
//         setOtp(["", "", "", "", "", ""]);
//         isVerifyingRef.current = false;
//         setIsVerifying(false);
//         inputRefs.current[0]?.focus();
//         await resendOtp(email);
//         onResend?.();
//     };

//     // ------------------- VOICE INPUT -------------------
//     const handleVoiceInput = () => {
//         if (!voiceService.isSpeechRecognitionSupported()) {
//             setVoiceError("Voice not supported");
//             return;
//         }

//         setIsListening(true);
//         voiceService.startListening(
//             result => {
//                 const digits = extractDigits(result.transcript).slice(0, 6);
//                 setOtp(digits.split(""));
//                 if (digits.length === 6 && result.isFinal) {
//                     voiceService.stopListening();
//                     setIsListening(false);
//                 }
//             },
//             err => {
//                 setVoiceError(err);
//                 setIsListening(false);
//             }
//         );
//     };

//     const handleSuccessContinue = () => {
//         onClose?.();
//         onContinue?.();
//         navigate("/role-selection", { replace: true });
//     };

//     if (showSuccess) {
//         return <SuccessScreen onContinue={handleSuccessContinue} />;
//     }

//     if (showFirstTimeModal) {
//         return (
//             <>
//                 <OTPInputForm
//                     email={email}
//                     otp={otp}
//                     setOtp={setOtp}
//                     timer={timer}
//                     isListening={isListening}
//                     voiceError={voiceError}
//                     isVerifying={isVerifying}
//                     inputRefs={inputRefs}
//                     onBack={onBack}
//                     onVerify={handleVerifyOTP}
//                     onResend={handleResend}
//                     onVoiceInput={handleVoiceInput}
//                 />
//                 <UserModal
//                     userId={userId}
//                     phoneNumber=""
//                     email={email}
//                     onComplete={handleComplete}
//                 />
//             </>
//         );
//     }

//     return (
//         <OTPInputForm
//             email={email}
//             otp={otp}
//             setOtp={setOtp}
//             timer={timer}
//             isListening={isListening}
//             voiceError={voiceError}
//             isVerifying={isVerifying}
//             inputRefs={inputRefs}
//             onBack={onBack}
//             onVerify={handleVerifyOTP}
//             onResend={handleResend}
//             onVoiceInput={handleVoiceInput}
//         />
//     );
// };

// export default OTPVerification;














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
    const [userId, setUserId] = useState<string>("");

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

    // ─── AUTO VERIFY when all 6 digits filled ────────────────────────────────
    useEffect(() => {
        const otpString = otp.join("");
        if (otpString.length === 6 && !isVerifyingRef.current) {
            handleVerifyOTP(otpString);
        }
    }, [otp]);

    // ─── WEB OTP API (SMS autofill — Chrome Android) ─────────────────────────
    useEffect(() => {
        if (!("OTPCredential" in window)) return;
        const controller = new AbortController();
        navigator.credentials
            .get({ otp: { transport: ["sms"] }, signal: controller.signal } as any)
            .then((cred: any) => {
                if (cred?.code) {
                    const digits = cred.code.replace(/\D/g, "").slice(0, 6);
                    setOtp(digits.split(""));
                }
            })
            .catch(() => { });
        return () => controller.abort();
    }, []);

    // ─── CLIPBOARD PASTE AUTOFILL ─────────────────────────────────────────────
    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            const pasted = e.clipboardData?.getData("text") ?? "";
            const digits = pasted.replace(/\D/g, "").slice(0, 6);
            if (digits.length === 0) return;

            e.preventDefault();

            const filled = digits.split("");
            setOtp(prev => {
                const next = [...prev];
                filled.forEach((d, i) => { next[i] = d; });
                return next;
            });

            const focusIndex = Math.min(filled.length, 5);
            setTimeout(() => inputRefs.current[focusIndex]?.focus(), 0);
        };

        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, []);

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

        // ✅ FIX 1: Check localStorage FIRST — if this user has already seen/completed
        // the modal before (on any previous login), NEVER show it again.
        const hasSeenModal = localStorage.getItem(`isFirstTimeUser_${uid}`) === "false";

        try {
            const res = await getUserById(uid);
            const userData = res?.data;

            const hasName =
                userData?.name &&
                userData.name.trim().length > 0 &&
                userData.name.trim().toLowerCase() !== "user";

            // ✅ FIX 2: Only show modal if user has no real name AND has never seen modal
            if (!hasName && !hasSeenModal) {
                setShowFirstTimeModal(true);
                return;
            }

            // Returning user or already-named user — log straight in
            const rawRole = (userData as any)?.role as string | undefined;
            const role = normalizeRole(rawRole || localStorage.getItem("role"));
            localStorage.setItem("role", role);

            // Mark as seen so modal never appears again for this userId
            localStorage.setItem(`isFirstTimeUser_${uid}`, "false");

            const user: User = {
                _id: uid,
                id: uid,
                email,
                name: userData?.name || localStorage.getItem("userName") || "User",
                isVerified: true,
                role,
                latitude: userData?.latitude,
                longitude: userData?.longitude,
            };

            login(user);
            setShowSuccess(true);
        } catch (err) {
            console.warn("⚠️ Profile fetch failed", err);

            // ✅ FIX 3: If API fails for a returning user (hasSeenModal = true),
            // log them in with stored data instead of incorrectly showing the modal.
            if (hasSeenModal) {
                const role = normalizeRole(localStorage.getItem("role"));
                const user: User = {
                    _id: uid,
                    id: uid,
                    email,
                    name: localStorage.getItem("userName") || "User",
                    isVerified: true,
                    role,
                };
                login(user);
                setShowSuccess(true);
            } else {
                // Genuine first-time user — show modal
                setShowFirstTimeModal(true);
            }
        }
    };

    // ─── FIRST-TIME USER COMPLETE ─────────────────────────────────────────────
    const handleComplete = async (userName: string) => {
        const role = normalizeRole(localStorage.getItem("role"));
        const user: User = {
            _id: userId,
            id: userId,
            email,
            name: userName,
            isVerified: true,
            role,
        };
        login(user);
        setShowFirstTimeModal(false);
        setShowSuccess(true);
    };

    // ─── RESEND OTP ───────────────────────────────────────────────────────────
    const handleResend = async () => {
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        isVerifyingRef.current = false;
        setIsVerifying(false);
        inputRefs.current[0]?.focus();
        await resendOtp(email);
        onResend?.();
    };

    // ─── VOICE INPUT ──────────────────────────────────────────────────────────
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

    // ─── RENDER ───────────────────────────────────────────────────────────────

    if (showSuccess) {
        return <SuccessScreen onContinue={handleSuccessContinue} />;
    }

    // Only UserModal — no OTPInputForm behind it
    if (showFirstTimeModal) {
        return (
            <UserModal
                userId={userId}
                phoneNumber=""
                email={email}
                onComplete={handleComplete}
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