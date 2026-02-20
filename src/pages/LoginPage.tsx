import React, { useState } from "react";
import OTPVerification from "../components/Auth/OTPVerification";

// This is your Login/Auth component that shows the OTP popup
const LoginPage: React.FC = () => {
    const [showOTPPopup, setShowOTPPopup] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");

    // Handle sending OTP
    const handleSendOTP = (phone: string) => {
        setPhoneNumber(phone);
        setShowOTPPopup(true);
    };

    // Handle OTP verification
    const handleVerify = (otp: string) => {
        console.log("Verifying OTP:", otp);
        // Your API call here
    };

    // Handle OTP resend
    const handleResend = () => {
        console.log("Resending OTP to:", phoneNumber);
        // Your API call here
    };

    // 🔥 IMPORTANT: This function closes the popup
    const closeOTPPopup = () => {
        setShowOTPPopup(false);
    };

    return (
        <div>
            {/* Your login form */}
            <div className="p-4">
                <button
                    onClick={() => handleSendOTP("9876543210")}
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Login with OTP
                </button>
            </div>

            {/* 🔥 OTP Popup - Conditionally rendered */}
            {showOTPPopup && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                  <OTPVerification
  phoneNumber={phoneNumber}
  onResend={handleResend}
  onBack={closeOTPPopup}
  onClose={closeOTPPopup}
  onContinue={closeOTPPopup}
/>

                </div>
            )}
        </div>
    );
};

export default LoginPage;
