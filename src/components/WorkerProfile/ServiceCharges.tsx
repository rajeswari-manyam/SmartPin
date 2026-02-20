import React from "react";
import Button from "../ui/Buttons";
import typography from "../../styles/typography";
import VoiceIcon from "../../assets/icons/Voice.png";

interface ServiceChargesSectionProps {
    chargeType: "hourly" | "daily" | "fixed";
    chargeAmount: string;
    onChargeTypeChange: (type: "hourly" | "daily" | "fixed") => void;
    onChargeAmountChange: (amount: string) => void;
    onVoiceClick: () => void;
    isListening: boolean;
}

const ServiceChargesSection: React.FC<ServiceChargesSectionProps> = ({
    chargeType,
    chargeAmount,
    onChargeTypeChange,
    onChargeAmountChange,
    onVoiceClick,
    isListening,
}) => {
    return (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                💰 Service Charges *
            </h3>

            <div className="mb-4">
                <label className={typography.form.label}>Charge Type</label>
                <div className="grid grid-cols-3 gap-3">
                    <button
                        type="button"
                        onClick={() => onChargeTypeChange("hourly")}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                            chargeType === "hourly"
                                ? "bg-gradient-to-r from-[#f09b13] to-[#f0c413] text-white"
                                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#f09b13]"
                        }`}
                    >
                        Per Hour
                    </button>
                    <button
                        type="button"
                        onClick={() => onChargeTypeChange("daily")}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                            chargeType === "daily"
                                ? "bg-gradient-to-r from-[#f09b13] to-[#f0c413] text-white"
                                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#f09b13]"
                        }`}
                    >
                        Per Day
                    </button>
                    <button
                        type="button"
                        onClick={() => onChargeTypeChange("fixed")}
                        className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                            chargeType === "fixed"
                                ? "bg-gradient-to-r from-[#f09b13] to-[#f0c413] text-white"
                                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#f09b13]"
                        }`}
                    >
                        Fixed
                    </button>
                </div>
            </div>

            <div>
                <label className={typography.form.label}>Amount (₹) *</label>
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                            ₹
                        </span>
                        <input
                            type="number"
                            value={chargeAmount}
                            onChange={(e) => onChargeAmountChange(e.target.value)}
                            className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0B0E92] focus:outline-none"
                            placeholder="Enter amount"
                        />
                    </div>
                    <Button
                        variant="primary"
                        onClick={onVoiceClick}
                        className={`bg-gradient-to-r from-[#f09b13] to-[#f0c413] ${
                            isListening ? "animate-pulse" : ""
                        }`}
                    >
                        <img src={VoiceIcon} className="w-5 h-5" alt="Voice" />
                    </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    {chargeType === "hourly" && "Charge per hour of work"}
                    {chargeType === "daily" && "Charge per day of work"}
                    {chargeType === "fixed" && "Fixed charge per project"}
                </p>
            </div>
        </div>
    );
};

export default ServiceChargesSection;
