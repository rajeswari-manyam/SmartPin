import React from "react";
import Button from "../ui/Buttons";
import typography from "../../styles/typography";
import VoiceIcon from "../../assets/icons/Voice.png";
import LocationIcon from "../../assets/icons/Location.png";

interface LocationSectionProps {
  address: string;
  city: string;
  state: string;
  pincode: string;

  latitude?: number;
  longitude?: number;
  isGeocodingLoading?: boolean;

  onAddressChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
  onPincodeChange: (value: string) => void;

  onAddressVoice: () => void;
  onCityVoice: () => void;
  onUseCurrentLocation: () => void;

  isAddressListening: boolean;
  isCityListening: boolean;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  address,
  city,
  state,
  pincode,
  latitude,
  longitude,
  isGeocodingLoading,

  onAddressChange,
  onCityChange,
  onStateChange,
  onPincodeChange,

  onAddressVoice,
  onCityVoice,
  onUseCurrentLocation,

  isAddressListening,
  isCityListening,
}) => {
  return (
    <div className="mb-6 p-4 bg-green-50 rounded-xl border-2 border-green-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <img src={LocationIcon} className="w-6 h-6" alt="Location" />
        Location Details *
      </h3>

      {/* ADDRESS */}
      <div className="mb-4">
        <label className={typography.form.label}>Street Address</label>
        <div className="flex gap-2">
          <input
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#00598a] focus:outline-none"
            placeholder="House / Building / Street"
          />
          <Button
            variant="primary"
            onClick={onAddressVoice}
            className={`bg-gradient-to-r from-[#00598a] to-[#00598a]  ${
              isAddressListening ? "animate-pulse" : ""
            }`}
          >
            <img src={VoiceIcon} className="w-5 h-5" alt="Voice" />
          </Button>
        </div>
      </div>

      {/* CITY + STATE */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={typography.form.label}>City *</label>
          <div className="flex gap-2">
            <input
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#00598a] focus:outline-none"
              placeholder="City"
            />
            <Button
              variant="primary"
              onClick={onCityVoice}
              className={`bg-gradient-to-r from-[#00598a] to-[#00598a] ${
                isCityListening ? "animate-pulse" : ""
              }`}
            >
              <img src={VoiceIcon} className="w-5 h-5" alt="Voice" />
            </Button>
          </div>
        </div>

        <div>
          <label className={typography.form.label}>State</label>
          <input
            value={state}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0B0E92] focus:outline-none"
            placeholder="State"
          />
        </div>
      </div>

      {/* PINCODE */}
      <div className="mb-4">
        <label className={typography.form.label}>Pincode</label>
        <input
          value={pincode}
          onChange={(e) => onPincodeChange(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0B0E92] focus:outline-none"
          placeholder="6-digit pincode"
          maxLength={6}
        />
      </div>

      {/* STATUS + CURRENT LOCATION */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border">
        <div className="text-xs">
          {isGeocodingLoading ? (
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              Detecting location...
            </span>
          ) : latitude && longitude ? (
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
              📍 {latitude.toFixed(6)}, {longitude.toFixed(6)}
            </span>
          ) : (
            <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
              📍 Location not detected
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onUseCurrentLocation}
          className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline"
        >
          📍 Use Current Location
        </button>
      </div>
    </div>
  );
};

export default LocationSection;
