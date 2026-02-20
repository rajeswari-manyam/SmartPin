// pages/RoleSelection.tsx
import React, { useState } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { FaUser, FaUserTie } from "react-icons/fa";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from '../components/ui/Buttons';
import { RoleCard } from '../components/Role/RoleCard';
import { VoiceButton } from '../components/voice/Voice';
import workerIcon from '../assets/icons/user.jpeg';
import customerIcon from '../assets/icons/Customer.jpeg';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useAccount } from '../context/AccountContext';
const ArrowLeft = FaArrowLeft as any;

const WorkerIconComponent = ({ size, ...props }: any) => (
    <img
        src={workerIcon}
        alt="Worker"
        style={{ width: size || 80, height: size || 80 }}
        className="rounded-full object-cover"
        {...props}
    />
);

const CustomerIconComponent = ({ size, ...props }: any) => (
    <img
        src={customerIcon}
        alt="Customer"
        style={{ width: size || 80, height: size || 80 }}
        className="rounded-full object-cover"
        {...props}
    />
);

const RoleSelection: React.FC = () => {
    const [selectedRole, setSelectedRole] = useState<"worker" | "user" | null>(null);


    const { setAccountType } = useAccount();
    const navigate = useNavigate();
    const { user } = useAuth(); // ✅ Get user from auth context

  const {
    isListening,
    transcript,
    error,
    isVoiceSupported,
    handleVoiceClick,
    stopListening
} = useVoiceRecognition((role: "worker" | "customer") => {
    const mappedRole: "worker" | "user" = role === "customer" ? "user" : "worker";
    setSelectedRole(mappedRole);
});
    const handleRoleSelection = (role: 'worker' | 'user') => {
        setAccountType(role);
        stopListening(); // your voice logic
        navigate("/home");
    };

    const handleContinue = () => {
        navigate("/select-category");
    };

    const handleBack = () => {
        navigate("/home");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-4 md:p-6">
            <div className="w-full max-w-5xl mx-auto">
                {/* Main Content Card */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 md:p-8 lg:p-12 relative">
                    {/* Back Arrow */}
                    <Button
                        onClick={handleBack}
                        variant="outline"
                        size="sm"
                        className="absolute top-4 left-4 flex items-center gap-2"
                    >
                        <ArrowLeft />
                        Back
                    </Button>

                    {/* Header */}
                    <div className="mt-8 sm:mt-10 md:mt-0">
                        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 text-center mb-2 sm:mb-3 md:mb-4 px-2">
                            How would you like to use our platform?
                        </h2>
                        <p className="text-sm sm:text-base md:text-lg text-gray-600 text-center mb-6 sm:mb-8 md:mb-12 px-2">
                            Choose your role to get started with our services
                        </p>
                    </div>

                    {/* Voice Button */}
                    <VoiceButton
                        isListening={isListening}
                        isVoiceSupported={isVoiceSupported}
                        transcript={transcript}
                        error={error}
                        onClick={handleVoiceClick}
                    />

                    {/* Role Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
                        <RoleCard
                            IconComponent={FaUser}
                            title="Customer"
                            description="Find and hire skilled professionals for your service needs"
                            isSelected={selectedRole === "user"}
                            onClick={() => handleRoleSelection("user")}
                        />
                        <RoleCard
                            IconComponent={FaUserTie}
                            title="Worker"
                            description="Offer your services and find jobs nearby"
                            isSelected={selectedRole === "worker"}
                            onClick={() => handleRoleSelection("worker")}
                        />

                    </div>

                    {/* Continue Button - Only for Customer */}
                    {selectedRole === 'user' && (
                        <div className="mt-6 sm:mt-8 md:mt-10 flex justify-center animate-fade-in">
                            <button
                                className="px-6 sm:px-8 md:px-10 py-3 sm:py-3.5 md:py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-all duration-300 text-sm sm:text-base md:text-lg w-full sm:w-auto"
                                onClick={handleContinue}
                            >
                                Continue as Customer
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Info */}
                <div className="text-center mt-4 sm:mt-6 md:mt-8 text-gray-600 px-4">
                    <p className="text-xs sm:text-sm md:text-base">
                        {isVoiceSupported
                            ? "Select your role to access our complete range of services"
                            : "Voice recognition not available - please click a role to select"}
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default RoleSelection;
