import React from "react";
import Button from "../../ui/Buttons";
import typography from "../../../styles/typography";

interface SuccessScreenProps {
    onContinue: () => void;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ onContinue }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Blurred Background Overlay */}
            <div
                className="absolute inset-0 bg-black/30"
                style={{
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)'
                }}
            />

            {/* White Content Card */}
            <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-scale-in">
                {/* Success Checkmark Animation */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        {/* Pulse Ring */}
                        <div className="absolute inset-0 bg-green-500 rounded-full opacity-20 animate-ping"
                            style={{ animationDuration: '1.5s' }} />

                        {/* Success Circle */}
                        <div className="relative bg-gradient-to-br from-green-400 to-green-600 w-24 h-24 rounded-full flex items-center justify-center shadow-lg">
                            <svg
                                className="w-12 h-12 text-white animate-checkmark"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Success Text */}
                <div className="text-center space-y-3 mb-8">
                    <h2 className={`text-gray-900 font-bold ${typography.heading.h3}`}>
                        Verification Successful!
                    </h2>
                    <p className={`text-gray-600 ${typography.body.base}`}>
                        Your account has been verified successfully
                    </p>
                </div>

                {/* Continue Button */}
                <Button
                    type="button"
                    onClick={onContinue}
                    variant="gradient-blue"
                    size="lg"
                    fullWidth
                    className="shadow-md"
                >
                    Continue to ServiceHub
                </Button>

                {/* Styling */}
                <style>{`
                    @keyframes checkmark {
                        0% {
                            stroke-dasharray: 0 50;
                            opacity: 0;
                            transform: scale(0.8);
                        }
                        50% {
                            opacity: 1;
                        }
                        100% {
                            stroke-dasharray: 50 0;
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    @keyframes scale-in {
                        0% {
                            opacity: 0;
                            transform: scale(0.9);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1);
                        }
                    }

                    .animate-checkmark {
                        animation: checkmark 0.6s ease-in-out forwards;
                    }

                    .animate-scale-in {
                        animation: scale-in 0.3s ease-out forwards;
                    }
                `}</style>
            </div>
        </div>
    );
};

export default SuccessScreen;
