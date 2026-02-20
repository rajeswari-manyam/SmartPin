import React from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

const ThankYouScreen: React.FC = () => {
    const navigate = useNavigate();

    const handleFindMoreWorkers = () => {
        navigate("/workers"); // change route if needed
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 font-['Outfit']">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-12 border border-slate-200">
                <div className="text-center space-y-8 animate-[fadeIn_0.4s_ease-out]">
                    {/* 🎉 Icon */}
                    <div className="flex justify-center">
                        <div className="text-8xl animate-[bounce_1s_ease-in-out]">
                            🎉
                        </div>
                    </div>

                    {/* Title & Message */}
                    <div className="space-y-4">
                        <h1 className={`${typography.heading.h3} text-slate-900`}>
                            Thank You for Your Feedback!
                        </h1>

                        <p className={`${typography.body.base} text-slate-600`}>
                            Your review helps us maintain quality and helps other customers
                            make informed decisions.
                        </p>
                    </div>

                    {/* Success Box */}
                    <div className="bg-gradient-to-br from-green-100 to-green-200 border border-green-300 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-lg">
                        <div className="text-5xl">⭐</div>
                        <p className="text-green-800 font-semibold text-lg">
                            Your review has been published
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4 pt-6">
                        <Button
                            variant="gradient-blue"
                            size="lg"
                            fullWidth
                            onClick={handleFindMoreWorkers}
                        >
                            Find More Workers
                        </Button>

                        <Button
                            variant="outline"
                            size="lg"
                            fullWidth
                            onClick={handleBackToHome}
                        >
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>

            {/* Animations */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
        </div>
    );
};

export default ThankYouScreen;
