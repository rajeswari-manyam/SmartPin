import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin } from "lucide-react";
import LocationSection from "../components/WorkerProfile/LocationSection";
import ProfilePhotoUpload from "../components/WorkerProfile/ProfilePhotoUpload";
import { createWorkerBase, CreateWorkerBasePayload } from "../services/api.service";
import typography from "../styles/typography";

const BRAND = '#00598a';

// ── Shared input style ────────────────────────────────────────────────────────
const inputBase =
  `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
  `focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a] ` +
  `placeholder-gray-400 transition-all duration-200 ` +
  `${typography.form.input} text-gray-800 bg-white`;

const inputDisabled =
  `w-full px-4 py-3 border border-gray-200 rounded-xl ` +
  `bg-gray-50 text-gray-500 cursor-not-allowed ` +
  `${typography.form.input}`;

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat' as const,
  backgroundPosition: 'right 0.75rem center',
  backgroundSize: '1.5em 1.5em',
  paddingRight: '2.5rem',
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
    {children}{required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const SectionCard: React.FC<{
  title?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}> = ({ title, children, action }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
    {title && (
      <div className="flex items-center justify-between mb-1">
        <h3 className={`${typography.card.subtitle} text-gray-900`}>{title}</h3>
        {action}
      </div>
    )}
    {children}
  </div>
);

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-2 gap-6">{children}</div>
);

// ============================================================================
// COMPONENT
// ============================================================================
const WorkerProfile: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("");

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState("");

  // Get phone from localStorage on mount
  React.useEffect(() => {
    const phone = localStorage.getItem("phoneNumber") || localStorage.getItem("userPhone") || "";
    setPhoneNumber(phone);
  }, []);

  // ── Location ──────────────────────────────────────────────────────────────
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
            `⚠️ Low accuracy detected (~${Math.round(pos.coords.accuracy)}m). Please verify the address fields below.`
          );
        }
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          setAddress(data.address.road || data.address.neighbourhood || data.address.suburb || "");
          setCity(data.address.city || data.address.town || data.address.village || "");
          setState(data.address.state || "");
          setPincode(data.address.postcode || "");
        } catch (err) {
          console.error("Error fetching address:", err);
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

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/loginPage"); return; }

    if (!fullName.trim() || !address.trim() || !city.trim() || !state.trim() || !pincode.trim() || !experience) {
      setError("Please fill all required fields");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload: CreateWorkerBasePayload = {
        userId,
        name: fullName,
        area: address,
        city,
        state,
        pincode,
        latitude,
        longitude,
        experience,
        profilePic: profilePhotoFile ?? undefined,
      };

      const res = await createWorkerBase(payload);
      if (!res.success) throw new Error(res.message);

      localStorage.setItem("workerId", res.worker._id);
      localStorage.setItem("@worker_id", res.worker._id);

      navigate("/add-skills");
    } catch (e: any) {
      setError(e.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            disabled={loading}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className={`${typography.heading.h5} text-gray-900`}>Create Worker Profile</h1>
            <p className={`${typography.body.xs} text-gray-500 mt-0.5`}>
              Fill in your details to start receiving job requests
            </p>
          </div>
        </div>
      </div>

      {/* ── Wide container ── */}
      <div className="max-w-6xl mx-auto px-8 py-6 space-y-4">

        {/* Error alert */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <span className="text-red-600 mt-0.5 shrink-0">⚠️</span>
            <div>
              <p className={`font-semibold text-red-800 ${typography.body.small}`}>Error</p>
              <p className={`text-red-700 ${typography.body.small}`}>{error}</p>
            </div>
          </div>
        )}

        {/* ─── PROFILE PHOTO (full width centred) ─── */}
        <SectionCard title="Profile Photo">
          <div className="flex justify-center py-2">
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
          </div>
        </SectionCard>

        {/* ─── ROW 1: FULL NAME + PHONE ─── */}
        <SectionCard title="Personal Information">
          <TwoCol>
            <div>
              <FieldLabel required>Full Name</FieldLabel>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                className={loading ? inputDisabled : inputBase}
              />
            </div>
            <div>
              <FieldLabel required>Phone Number</FieldLabel>
              <input
                type="tel"
                value={phoneNumber}
                disabled
                className={inputDisabled}
              />
              <p className={`mt-1.5 ${typography.body.xs} text-gray-400 flex items-center gap-1`}>
                🔒 Phone number is locked
              </p>
            </div>
          </TwoCol>
        </SectionCard>

        {/* ─── ROW 2: EXPERIENCE + EMAIL ─── */}
        <SectionCard title="Professional Details">
          <TwoCol>
            <div>
              <FieldLabel required>Years of Experience</FieldLabel>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                disabled={loading}
                className={(loading ? inputDisabled : inputBase) + ' appearance-none'}
                style={selectStyle}
              >
                <option value="">Select experience level</option>
                <option value="0-1">Less than 1 year</option>
                <option value="1-3">1–3 years</option>
                <option value="3-5">3–5 years</option>
                <option value="5-10">5–10 years</option>
                <option value="10+">10+ years</option>
              </select>
            </div>
            <div>
              <FieldLabel>Email</FieldLabel>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className={loading ? inputDisabled : inputBase}
              />
            </div>
          </TwoCol>
        </SectionCard>

        {/* ─── LOCATION ─── */}
        <SectionCard
          title="Service Location"
          action={
            <button
              type="button"
              onClick={fetchLocation}
              disabled={locationLoading || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white
                                bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                                transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {locationLoading ? (
                <><span className="animate-spin mr-1">⌛</span>Detecting...</>
              ) : (
                <><MapPin className="w-4 h-4" />Auto Detect</>
              )}
            </button>
          }
        >
          {locationWarning && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
              <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
            </div>
          )}

          {/* Area + City */}
          <TwoCol>
            <div>
              <FieldLabel required>Area / Street</FieldLabel>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Banjara Hills"
                disabled={loading}
                className={loading ? inputDisabled : inputBase}
              />
            </div>
            <div>
              <FieldLabel required>City</FieldLabel>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Hyderabad"
                disabled={loading}
                className={loading ? inputDisabled : inputBase}
              />
            </div>
          </TwoCol>

          {/* State + PIN */}
          <TwoCol>
            <div>
              <FieldLabel required>State</FieldLabel>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Telangana"
                disabled={loading}
                className={loading ? inputDisabled : inputBase}
              />
            </div>
            <div>
              <FieldLabel required>PIN Code</FieldLabel>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="e.g. 500016"
                maxLength={6}
                disabled={loading}
                className={loading ? inputDisabled : inputBase}
              />
            </div>
          </TwoCol>

          {/* Tip box */}
          <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ee', border: '1px solid #f0c070' }}>
            <p className={`${typography.body.small}`} style={{ color: '#7a4f00' }}>
              📍 <span className="font-medium">Tip:</span> Click "Auto Detect" to fill your location automatically, or enter it manually above.
            </p>
          </div>

          {/* Coords confirmation */}
          {latitude !== 0 && longitude !== 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className={`${typography.body.small} text-green-800`}>
                <span className="font-semibold">✓ Location set: </span>
                <span className="font-mono text-xs">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </span>
              </p>
            </div>
          )}
        </SectionCard>

        {/* ── Tip banner ── */}
        <div className="p-4 rounded-xl" style={{ backgroundColor: '#e8f4fb', border: '1px solid #b3d4e8' }}>
          <p className={`${typography.body.small}`} style={{ color: BRAND }}>
            💡 <span className="font-semibold">Tip:</span> Complete your profile to start receiving job requests from customers in your area.
          </p>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-4 pt-2 pb-8 justify-end">
          <button
            onClick={() => navigate("/")}
            type="button"
            disabled={loading}
            className={`px-10 py-3.5 rounded-xl font-semibold text-[#00598a]
                            bg-white border-2 border-[#00598a]
                            hover:bg-[#00598a] hover:text-white
                            active:bg-[#004a73] active:text-white
                            transition-all ${typography.body.base}
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            type="button"
            className={`px-10 py-3.5 rounded-xl font-semibold text-white
                            transition-all shadow-md hover:shadow-lg
                            bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                            ${typography.body.base}
                            ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block" />
                Saving...
              </span>
            ) : (
              "Continue to Add Skills →"
            )}
          </button>
        </div>

        <p className={`${typography.body.xs} text-gray-500 text-center pb-4`}>
          <span className="text-red-500">*</span> Required fields
        </p>

      </div>
    </div>
  );
};

export default WorkerProfile;