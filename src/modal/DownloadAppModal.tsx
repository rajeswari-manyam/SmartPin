import React from "react";
import QRCode from "react-qr-code";
import MobileIcon from "../assets/icons/mobile.jpeg";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadAppModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-500 text-xl"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-center mb-4">
          Scan QR code and get the app instantly
        </h2>

        {/* QR */}
        <div className="flex justify-center mb-4">
          <QRCode
            value="https://play.google.com/store/apps/details?id=com.yourapp"
            size={160}
          />
        </div>

        <p className="text-center text-sm text-gray-500 mb-4">
          OR
        </p>

        {/* Mobile input */}
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="Enter mobile number"
            className="flex-1 border rounded-lg px-3 py-2 outline-none"
          />
          <button className="bg-blue-600 text-white px-4 rounded-lg font-medium">
            Send
          </button>
        </div>

        {/* Store buttons */}
        <div className="flex justify-center gap-3 mt-5">
          <img src={MobileIcon} alt="Play Store" className="h-8" />
        </div>
      </div>
    </div>
  );
};

export default DownloadAppModal;
