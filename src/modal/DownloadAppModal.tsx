import React from "react";
import MobileIcon from "../assets/icons/mobile.jpeg";
import { typography } from "../styles/typography";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const DownloadAppModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 relative text-center shadow-xl">

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-3 right-4 text-gray-500 hover:text-gray-700 ${typography.icon.sm}`}
        >
          ✕
        </button>

        {/* App Icon */}
        <div className="flex justify-center mb-4">
          <img src={MobileIcon} alt="App Icon" className="h-14 w-14 rounded-xl" />
        </div>

        {/* Title */}
        <h2 className={`${typography.heading.h5} mb-2`}>
          App Coming Soon 🚀
        </h2>

        {/* Description */}
        <p className={`${typography.body.xs} text-gray-600 mb-5`}>
          We are working hard to launch our mobile app.
          Stay tuned — it will be available soon!
        </p>

        {/* Disabled Info Box */}
        <div className={`bg-gray-100 text-gray-400 ${typography.misc.caption} rounded-lg py-2 mb-5`}>
          App download will be enabled after launch
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className={`${typography.nav.button} text-white px-6 py-2 rounded-lg transition-opacity hover:opacity-90 active:opacity-80`}
          style={{ backgroundColor: "#00598a" }}
        >
          Okay
        </button>
      </div>
    </div>
  );
};

export default DownloadAppModal;