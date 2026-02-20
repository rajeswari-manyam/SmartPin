// components/voice/VoiceButton.tsx
import React from 'react';
import Button from '../ui/Buttons';
import VoiceIcon from '../../assets/icons/Voice.png';

interface VoiceButtonProps {
    isListening: boolean;
    isVoiceSupported: boolean;
    transcript: string;
    error: string | null;
    onClick: () => void;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
    isListening,
    isVoiceSupported,
    transcript,
    error,
    onClick
}) => {
    return (
        <div className="flex flex-col items-center mb-6 sm:mb-8 md:mb-12">
            <Button
                onClick={onClick}
                disabled={!isVoiceSupported}
                variant={isListening ? "danger" : "primary"}
                size="lg"
                className={`flex items-center justify-center gap-3 rounded-full ${isListening ? "animate-pulse" : "hover:scale-105"
                    }`}
            >
                <img src={VoiceIcon} alt="Voice" className="w-5 h-5 sm:w-6 sm:h-6 object-contain" />
                {isListening ? "Stop Listening" : 'Say "Customer" or "Worker"'}
            </Button>

            {/* Transcript Display */}
            {transcript && (
                <div className="mt-4 sm:mt-6 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-[#f09b13]/10 border border-[#f09b13]/20 rounded-lg animate-fade-in w-full sm:w-auto">
                    <p className="text-xs sm:text-sm md:text-base text-[#f09b13] text-center">
                        Heard: <span className="font-semibold">{transcript}</span>
                    </p>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="mt-4 sm:mt-6 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-red-50 border border-red-200 rounded-lg animate-fade-in w-full sm:w-auto">
                    <p className="text-xs sm:text-sm md:text-base text-red-900 text-center">{error}</p>
                </div>
            )}
        </div>
    );
};

export default VoiceButton;
