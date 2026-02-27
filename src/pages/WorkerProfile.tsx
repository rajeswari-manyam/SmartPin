import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, MapPin, RefreshCw, User, Phone, CheckCircle, AlertTriangle, X } from "lucide-react";
import ProfilePhotoUpload from "../components/WorkerProfile/ProfilePhotoUpload";
import { createWorkerBase, CreateWorkerBasePayload } from "../services/api.service";
import typography from "../styles/typography";

const BRAND = "#00598a";
const BRAND_LIGHT = "#e8f4fb";
const BRAND_MID = "#cce5f4";

// ── Shared input style ────────────────────────────────────────────────────────
const inputBase =
  `w-full px-4 py-3.5 border border-gray-200 rounded-xl ` +
  `focus:ring-1 focus:ring-[#00598a]/30 focus:border-[#00598a] ` +
  `placeholder-gray-400 transition-all duration-200 ` +
  `text-gray-800 bg-white outline-none`;

const inputDisabled =
  `w-full px-4 py-3.5 border border-gray-100 rounded-xl ` +
  `bg-gray-50 text-gray-400 cursor-not-allowed`;

// ── Section card ──────────────────────────────────────────────────────────────
const Section: React.FC<{
  icon: React.ElementType;
  title: string;
  required?: boolean;
  children: React.ReactNode;
  tinted?: boolean;
}> = ({ icon: Icon, title, required, children, tinted }) => (
  <div
    className="rounded-2xl overflow-hidden border shadow-sm"
    style={{
      backgroundColor: tinted ? "#f0f7fb" : "#fff",
      borderColor: tinted ? BRAND_MID : "#e9ecef",
    }}
  >
    <div
      className="px-5 py-3.5 flex items-center gap-2.5 border-b"
      style={{
        background: tinted
          ? `linear-gradient(135deg, ${BRAND}18, ${BRAND}08)`
          : `linear-gradient(135deg, ${BRAND}0d, ${BRAND}05)`,
        borderColor: tinted ? BRAND_MID : "#f0f0f0",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: BRAND }}
      >
        <Icon size={15} className="text-white" />
      </div>
      <h2 className={`${typography.card.subtitle} text-gray-900 leading-tight`}>
        {title}
        {required && <span className="text-red-500 ml-1">*</span>}
      </h2>
    </div>
    <div className="px-5 py-4 space-y-4">{children}</div>
  </div>
);

// ── Field label ───────────────────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
  children,
  required,
}) => (
  <label className={`block ${typography.form.label} text-gray-700 mb-1.5`}>
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

// ── Voice input row ───────────────────────────────────────────────────────────
const VoiceInput: React.FC<{
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  maxLength?: number;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}> = ({ type = "text", value, onChange, placeholder, disabled, maxLength, inputMode }) => (
  <div className="flex gap-2">
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      inputMode={inputMode}
      className={`flex-1 ${typography.form.input} ${disabled ? inputDisabled : inputBase} ${
        value && !disabled ? "border-[#00598a] ring-1 ring-[#00598a]/20" : ""
      }`}
    />
    <button
      type="button"
      className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 transition-opacity hover:opacity-90 active:opacity-80"
      style={{ backgroundColor: BRAND }}
      disabled={disabled}
    >
      <Mic size={17} />
    </button>
  </div>
);

// ============================================================================
// COMPONENT
// ============================================================================
const WorkerProfile: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName]               = useState("");
  const [phoneNumber, setPhoneNumber]         = useState("");
  const [address, setAddress]                 = useState("");
  const [city, setCity]                       = useState("");
  const [state, setState]                     = useState("");
  const [pincode, setPincode]                 = useState("");
  const [latitude, setLatitude]               = useState(0);
  const [longitude, setLongitude]             = useState(0);
  const [profilePhoto, setProfilePhoto]       = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState("");

  React.useEffect(() => {
    const phone =
      localStorage.getItem("phoneNumber") ||
      localStorage.getItem("userPhone") ||
      "";
    setPhoneNumber(phone);
  }, []);

  const fetchLocation = () => {
    setLocationLoading(true);
    setLocationWarning("");
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);
        if (pos.coords.accuracy > 500) {
          setLocationWarning(
            `Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify the address fields.`
          );
        }
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          setAddress(
            data.address.road ||
            data.address.neighbourhood ||
            data.address.suburb ||
            ""
          );
          setCity(data.address.city || data.address.town || data.address.village || "");
          setState(data.address.state || "");
          setPincode(data.address.postcode || "");
        } catch (err) {
          console.error("Reverse geocode error:", err);
        }
        setLocationLoading(false);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/loginPage"); return; }

    if (!fullName.trim() || !city.trim()) {
      setError("Name and City are required");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("name", fullName);
      formData.append("area", address);
      formData.append("city", city);
      formData.append("state", state);
      formData.append("pincode", pincode);
      formData.append("latitude", String(latitude));
      formData.append("longitude", String(longitude));
      if (phoneNumber) formData.append("phone", phoneNumber);
      if (profilePhotoFile) formData.append("profilePic", profilePhotoFile);

      const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
      const response = await fetch(`${API_BASE_URL}/createworkers`, {
        method: "POST",
        body: formData,
        redirect: "follow",
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const res = await response.json();
      if (!res.success) throw new Error(res.message || "Failed to create profile");

      localStorage.setItem("workerId", res.worker._id);
      localStorage.setItem("@worker_id", res.worker._id);
      navigate("/add-skills");
    } catch (e: any) {
      setError(e.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f7fa" }}>

      {/* ── Header ── */}
      <div
        className="sticky top-0 z-10 bg-white px-4 py-3.5 flex items-center gap-3"
        style={{ borderBottom: "1px solid #e9ecef" }}
      >
        <button
          onClick={() => navigate("/")}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1">
          <h1 className={`${typography.heading.h6} text-gray-900 leading-tight`}>
            Complete Your Profile
          </h1>
          <p className={`${typography.misc.caption} leading-none`}>
            Tell us about yourself to get started
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-10">

        {/* ── Error banner ── */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <X size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className={`${typography.form.error} flex-1`}>{error}</p>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X size={14} />
            </button>
          </div>
        )}

        {/* ══ Personal Information ══════════════════════════════════════════ */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Card header */}
          <div
            className="px-5 py-3.5 flex items-center gap-2.5 border-b"
            style={{
              background: `linear-gradient(135deg, ${BRAND}0d, ${BRAND}05)`,
              borderColor: "#f0f0f0",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: BRAND }}
            >
              <User size={15} className="text-white" />
            </div>
            <h2 className={`${typography.card.subtitle} text-gray-900 leading-tight`}>
              Personal Information
            </h2>
          </div>

          <div className="px-5 py-5 space-y-5">

            {/* Profile photo — centered at top */}
            <div className="flex flex-col items-center gap-2">
              <ProfilePhotoUpload
                profilePhoto={profilePhoto}
                onPhotoUpload={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setProfilePhotoFile(file);
                  const r = new FileReader();
                  r.onload = () => setProfilePhoto(r.result as string);
                  r.readAsDataURL(file);
                }}
              />
              <p className={`${typography.misc.caption} text-center`}>
                {profilePhoto ? "Tap to change photo" : "Upload profile photo (optional)"}
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Full Name — full width */}
            <div>
              <Label required>Full Name</Label>
              <VoiceInput
                value={fullName}
                onChange={setFullName}
                placeholder="Enter your full name"
                disabled={loading}
              />
            </div>

            {/* Phone Number — full width */}
            <div>
              <Label>Phone Number</Label>
              <VoiceInput
                type="tel"
                value={phoneNumber}
                onChange={setPhoneNumber}
                placeholder="Enter your phone number"
                disabled={loading}
              />
            </div>

          </div>
        </div>

        {/* ══ Location Details ══════════════════════════════════════════════ */}
        <Section icon={MapPin} title="Location Details" required tinted>

          {/* Auto-detect button — full width */}
          <button
            type="button"
            onClick={fetchLocation}
            disabled={locationLoading || loading}
            className="w-full px-4 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all disabled:opacity-60 hover:bg-blue-50/50"
            style={{ borderColor: BRAND, color: BRAND }}
          >
            <RefreshCw size={15} className={locationLoading ? "animate-spin" : ""} />
            <span className={`${typography.misc.badge}`} style={{ color: BRAND }}>
              {locationLoading ? "Detecting your location..." : "Auto-Detect My Location"}
            </span>
          </button>

          {/* Location status alerts */}
          {locationWarning && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle size={15} className="text-yellow-600 mt-0.5 flex-shrink-0" />
              <p className={`${typography.misc.caption} text-yellow-800`}>{locationWarning}</p>
            </div>
          )}

          {locationLoading && (
            <div className="rounded-xl p-3 flex items-center gap-2" style={{ backgroundColor: BRAND_LIGHT }}>
              <MapPin size={15} style={{ color: BRAND }} className="animate-pulse" />
              <p className={`${typography.misc.caption}`} style={{ color: BRAND }}>
                Detecting your location…
              </p>
            </div>
          )}

          {latitude !== 0 && longitude !== 0 && !locationLoading && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle size={15} className="text-green-600 flex-shrink-0" />
              <p className={`${typography.misc.caption} text-green-800`}>
                Location detected: {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </p>
            </div>
          )}

          {/* Street Address — full width */}
          <div>
            <Label>Street Address</Label>
            <VoiceInput
              value={address}
              onChange={setAddress}
              placeholder="Enter your street address"
              disabled={loading}
            />
          </div>

          {/* City — full width */}
          <div>
            <Label required>City</Label>
            <div className="flex gap-2">
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                disabled={loading}
                className={[
                  "flex-1",
                  typography.form.input,
                  loading ? inputDisabled : inputBase,
                  city && !loading ? "border-[#00598a] ring-1 ring-[#00598a]/20" : "",
                ].join(" ")}
              />
              <button
                type="button"
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: BRAND }}
              >
                <Mic size={15} />
              </button>
            </div>
          </div>

          {/* State — full width */}
          <div>
            <Label>State</Label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="Enter your state"
              disabled={loading}
              className={[
                typography.form.input,
                loading ? inputDisabled : inputBase,
                state && !loading ? "border-[#00598a] ring-1 ring-[#00598a]/20" : "",
              ].join(" ")}
            />
          </div>

          {/* Pincode — full width */}
          <div>
            <Label>Pincode</Label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="Enter 6-digit pincode"
              maxLength={6}
              inputMode="numeric"
              disabled={loading}
              className={[
                typography.form.input,
                loading ? inputDisabled : inputBase,
                pincode.length === 6 ? "border-[#00598a] ring-1 ring-[#00598a]/20" : "",
              ].join(" ")}
            />
            {pincode.length > 0 && pincode.length < 6 && (
              <p className={`${typography.misc.caption} text-amber-600 mt-1.5`}>
                {6 - pincode.length} more digit{6 - pincode.length !== 1 ? "s" : ""} needed
              </p>
            )}
          </div>

        </Section>

        {/* ── Required note + Save Button ── */}
        <p className={`${typography.misc.caption} text-red-500 text-center`}>
          * Name and City are required fields
        </p>

        <button
          onClick={handleSubmit}
          disabled={loading}
          type="button"
          className={[
            "w-full py-4 rounded-2xl text-white transition-all active:scale-[0.99]",
            typography.form.label,
            "font-bold disabled:opacity-70",
          ].join(" ")}
          style={{
            background: loading ? BRAND : `linear-gradient(135deg, #00598a, #0077b6)`,
            boxShadow: loading ? "none" : `0 4px 20px ${BRAND}55`,
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block" />
              Saving Profile...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <User size={18} />
              Save &amp; Continue
            </span>
          )}
        </button>

        <div className="h-4" />
      </div>
    </div>
  );
};

export default WorkerProfile;