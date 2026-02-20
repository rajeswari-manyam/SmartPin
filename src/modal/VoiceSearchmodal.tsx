import React from "react";
import VoiceIcon from "../assets/icons/Voice.png";

interface VoiceSearchModalProps {
  isOpen: boolean;
  isListening: boolean;
  transcript: string;
  onClose: () => void;
}

const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  isListening,
  transcript,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative animate-scale-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Content */}
          <div className="flex flex-col items-center text-center">
            {/* Animated Microphone Icon */}
            <div className="relative mb-6">
              {/* Pulsing Rings */}
              {isListening && (
                <>
                  <div className="absolute inset-0 rounded-full bg-[#f09b13] opacity-20 animate-ping" />
                  <div
                    className="absolute inset-0 rounded-full bg-[#f09b13] opacity-30 animate-pulse"
                    style={{ animationDelay: "0.3s" }}
                  />
                </>
              )}

              {/* Microphone Circle */}
              <div
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
                  isListening
                    ? "bg-gradient-to-br from-[#f09b13] to-[#f5b340] shadow-lg"
                    : "bg-gray-300"
                }`}
              >
                <img
                  src={VoiceIcon}
                  alt="Microphone"
                  className="w-12 h-12 invert"
                />
              </div>
            </div>

            {/* Status Text */}
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {isListening ? "Listening..." : "Ready to Listen"}
            </h3>

            <p className="text-sm text-gray-500 mb-6">
              {isListening
                ? "Speak now, we're listening"
                : "Click the microphone to start"}
            </p>

            {/* Transcript Display */}
            <div className="w-full min-h-[80px] max-h-[120px] overflow-y-auto bg-[#f09b13]/10 rounded-xl p-4 mb-6">
              {transcript ? (
                <p className="text-gray-700 text-left">{transcript}</p>
              ) : (
                <p className="text-gray-400 italic">
                  Your voice will appear here...
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full">
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gradient-to-r from-[#f09b13] to-[#f5b340] hover:from-[#f5b340] hover:to-[#ffb040] text-white"
                }`}
              >
                {isListening ? "Stop" : "Start"}
              </button>
            </div>

            {/* Tips */}
            <div className="mt-6 text-xs text-gray-400">
              <p>💡 Tip: Speak clearly and at a moderate pace</p>
            </div>
          </div>
        </div>
      </div>

     
    </>
  );
};

export default VoiceSearchModal;
