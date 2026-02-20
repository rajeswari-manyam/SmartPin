// src/components/auth/OTPVerification/types.ts

export interface VoiceRecognitionResult {
    transcript: string;
    confidence: number;
    isFinal: boolean;
}

export interface OTPVerificationProps {
    phoneNumber: string;
    onVerify: (otp: string) => void;
    onResend: () => void;
    onBack: () => void;
    onContinue?: () => void;
}

export interface OTPInputFormProps {
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

export interface OTPInputBoxesProps {
    otp: string[];
    setOtp: React.Dispatch<React.SetStateAction<string[]>>;
    inputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    isVerifying: boolean;
}

export interface SuccessScreenProps {
    onContinue: () => void;
}
