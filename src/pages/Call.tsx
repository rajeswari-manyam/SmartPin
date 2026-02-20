import React, { useState } from "react";
import { PhoneOff } from "lucide-react";
import Button from "../components/ui/Buttons";
import typography, { combineTypography } from "../styles/typography";

const CallingScreen: React.FC = () => {
    const [isCallActive, setIsCallActive] = useState(true);

    const handleEndCall = () => {
        setIsCallActive(false);
        // Add end call logic here (navigate, API, etc.)
    };

    if (!isCallActive) {
        return null; // or redirect / show call ended screen
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-8 font-['DM_Sans']">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/60">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white py-6 px-8">
                    <h1 className={combineTypography(typography.heading.h1, "text-white")}>
                        Calling...
                    </h1>
                </div>

                {/* Content */}
                <div className="flex flex-col items-center justify-center min-h-[600px] bg-gradient-to-b from-slate-50 to-white p-12">

                    {/* Avatar */}
                    <div className="relative mb-12 animate-[pulse_2s_ease-in-out_infinite]">
                        <div className="absolute inset-0 bg-blue-400/30 rounded-full blur-3xl scale-110 animate-[ping_2s_ease-in-out_infinite]" />
                        <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 flex items-center justify-center text-white shadow-2xl border-8 border-white">
                            <span className="text-7xl font-bold">RK</span>
                        </div>
                    </div>

                    {/* Name */}
                    <h2
                        className={combineTypography(
                            typography.heading.h2,
                            "text-slate-900 mb-3 tracking-tight"
                        )}
                    >
                        Ramesh Kumar
                    </h2>

                    {/* Status */}
                    <p className="text-xl text-slate-500 mb-16 animate-[pulse_1.5s_ease-in-out_infinite]">
                        Calling...
                    </p>

                    {/* End Call Button (USING CUSTOM BUTTON) */}
                    <Button
                        onClick={handleEndCall}
                        variant="danger"
                        className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-2xl shadow-red-300/50 hover:scale-110 active:scale-95 transition-all"
                    >
                        <span className="absolute inset-0 rounded-full bg-red-400/40 blur-xl" />
                        <PhoneOff size={36} className="text-white relative z-10" />
                    </Button>

                    {/* Helper Text */}
                    <p
                        className={combineTypography(
                            typography.body.xs,
                            "text-slate-500 mt-6 tracking-wide"
                        )}
                    >
                        Tap to end call
                    </p>
                </div>
            </div>

            {/* Animations */}
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }

        @keyframes ping {
          0% { transform: scale(1); opacity: 1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default CallingScreen;
