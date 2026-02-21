import React from "react";
import Button from "../ui/Buttons";
import typography from "../../styles/typography";
import VoiceIcon from "../../assets/icons/Voice.png";

interface VoiceInputFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    onVoiceClick: () => void;
    isListening: boolean;
    placeholder?: string;
    required?: boolean;
    type?: "text" | "email" | "number";
}

const VoiceInputField: React.FC<VoiceInputFieldProps> = ({
    label,
    value,
    onChange,
    onVoiceClick,
    isListening,
    placeholder = "",
    required = false,
    type = "text",
}) => {
    return (
        <div className="mb-6">
            <label className={typography.form.label}>
                {label} {required && "*"}
            </label>
            <div className="flex gap-2">
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0B0E92] focus:outline-none"
                    placeholder={placeholder}
                />
                <Button
                    variant="primary"
                    onClick={onVoiceClick}
                    className={`bg-gradient-to-r from-[#00598a] to-[#00598a] ${
                        isListening ? "animate-pulse" : ""
                    }`}
                >
                    <img src={VoiceIcon} className="w-5 h-5" alt="Voice" />
                </Button>
            </div>
        </div>
    );
};

export default VoiceInputField;
