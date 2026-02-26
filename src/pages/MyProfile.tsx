import React, { useEffect, useRef, useState } from "react";
import typography from "../styles/typography";
import {
  getUserById,
  updateUserById,
  API_BASE_URL,
} from "../services/api.service";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";

const BRAND = "#00598a";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const inputBase =
  "w-full px-4 py-3 border rounded-xl transition-all text-base text-gray-800 " +
  "placeholder-gray-400 bg-white focus:outline-none " +
  "focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a]";

const inputDisabled =
  "w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 " +
  "text-gray-500 cursor-not-allowed text-base";

const FieldLabel: React.FC<{ icon: string; children: React.ReactNode; required?: boolean }> = ({
  icon,
  children,
  required,
}) => (
  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
    <span>{icon}</span>
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

/* ── component ────────────────────────────────────────────────────────────── */
const MyProfile: React.FC = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── getUserId ────────────────────────────────────────────────────────── */
  const getUserId = () => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserData = localStorage.getItem("userData");
    if (storedUserId) return storedUserId;
    if (storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        return parsed.id || parsed._id || parsed.userId;
      } catch { }
    }
    return null;
  };

  /* ── phone validation ─────────────────────────────────────────────────── */
  const isPhoneValid = (p: string) => /^[6-9]\d{9}$/.test(p);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(val);
    if (val.length > 0) {
      setPhoneError(isPhoneValid(val) ? null : "Must be 10 digits starting with 6–9");
    } else {
      setPhoneError(null);
    }
  };

  /* ── fetch profile ────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = getUserId();
      if (!userId) { setError("Please login again"); setIsLoading(false); return; }
      try {
        setIsLoading(true);
        setError(null);
        const savedPhone = localStorage.getItem("userPhone");
        const res = await getUserById(userId);
        if (res.success && res.data) {
          setName(res.data.name || "");
          const userPhone = res.data.phone || savedPhone || "";
          setPhone(userPhone);
          if (res.data.phone && res.data.phone !== savedPhone)
            localStorage.setItem("userPhone", res.data.phone);
          setEmail(res.data.email || "");
          setLatitude(res.data.latitude ? Number(res.data.latitude) : null);
          setLongitude(res.data.longitude ? Number(res.data.longitude) : null);
          if (res.data?.profilePic) {
            setProfilePic(
              res.data.profilePic.startsWith("http")
                ? res.data.profilePic
                : `${API_BASE_URL}${res.data.profilePic}`
            );
          }
        } else {
          if (savedPhone) setPhone(savedPhone);
          setError("Failed to load profile data");
        }
      } catch (error: any) {
        const savedPhone = localStorage.getItem("userPhone");
        if (savedPhone) setPhone(savedPhone);
        setError(error.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ── geolocation ──────────────────────────────────────────────────────── */
  useEffect(() => {
    if (latitude !== null && longitude !== null) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLatitude(pos.coords.latitude); setLongitude(pos.coords.longitude); },
      (err) => console.error("Location error:", err)
    );
  }, [latitude, longitude]);

  /* ── image handling ───────────────────────────────────────────────────── */
  const handleImageClick = () => { if (isEditing) fileInputRef.current?.click(); };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please select a valid image file"); return; }
    if (file.size > 5 * 1024 * 1024) { alert("Image size should be less than 5 MB"); return; }
    setProfilePicFile(file);
    setProfilePic(URL.createObjectURL(file));
  };

  /* ── save ─────────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    const userId = getUserId();
    if (!userId) { alert("User not found. Please login again."); return; }
    if (!name.trim()) { setError("Name is required"); return; }
    if (phone && !isPhoneValid(phone)) {
      setPhoneError("Please enter a valid 10-digit mobile number starting with 6–9");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const payload: any = { name: name.trim() };
      if (phone.trim()) payload.phone = phone.trim();
      if (latitude !== null && longitude !== null) {
        payload.latitude = latitude;
        payload.longitude = longitude;
      }
      if (profilePicFile) payload.profilePic = profilePicFile;

      const res = await updateUserById(userId, payload);

      if (res.success) {
        setSuccessMessage("Profile updated successfully ✓");
        setIsEditing(false);
        setProfilePicFile(null);
        localStorage.setItem("userName", name.trim());
        if (phone.trim()) localStorage.setItem("userPhone", phone.trim());
        if (res.data?.profilePic) {
          setProfilePic(
            res.data.profilePic.startsWith("http")
              ? res.data.profilePic
              : `${API_BASE_URL}${res.data.profilePic}`
          );
        }
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("profileUpdated"));
        setTimeout(() => navigate("/", { replace: true }), 1500);
      } else {
        throw new Error(res.message || "Update failed");
      }
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  /* ── cancel ───────────────────────────────────────────────────────────── */
  const handleCancel = async () => {
    setIsEditing(false);
    setProfilePicFile(null);
    setError(null);
    setPhoneError(null);
    const userId = getUserId();
    if (userId) {
      try {
        const res = await getUserById(userId);
        if (res.success && res.data) {
          setName(res.data.name || "");
          setPhone(res.data.phone || "");
          setEmail(res.data.email || "");
          setLatitude(res.data.latitude ? Number(res.data.latitude) : null);
          setLongitude(res.data.longitude ? Number(res.data.longitude) : null);
          if (res.data?.profilePic) {
            setProfilePic(
              res.data.profilePic.startsWith("http")
                ? res.data.profilePic
                : `${API_BASE_URL}${res.data.profilePic}`
            );
          }
        }
      } catch (err) { console.error("Failed to reload profile:", err); }
    }
  };

  /* ── loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mb-4"
          style={{ borderColor: BRAND, borderTopColor: "transparent" }} />
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  /* ── no user ──────────────────────────────────────────────────────────── */
  if (error && !getUserId()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all"
            style={{ backgroundColor: BRAND }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  /* ── render ───────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-8 py-5 mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500 mt-0.5">Manage your personal information</p>
          </div>
          {!isEditing && (
            <button
              onClick={() => { setIsEditing(true); setSuccessMessage(null); setError(null); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: BRAND }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* ── Alerts ── */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <span className="text-green-500">✓</span>
            <p className="text-green-700 text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {/* ── Profile Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

          {/* Profile Image */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div
                onClick={handleImageClick}
                className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shadow-md ${isEditing ? "cursor-pointer" : ""}`}
                style={{ background: `linear-gradient(135deg, ${BRAND}, #0077b6)` }}
              >
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {name ? name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>

              {isEditing && (
                <button
                  onClick={handleImageClick}
                  className="absolute bottom-0 right-0 p-2.5 rounded-full text-white shadow-lg transition-all hover:scale-110"
                  style={{ backgroundColor: BRAND }}
                  title="Change profile picture"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              )}

              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleImageChange} />
            </div>

            {isEditing && profilePicFile && (
              <div className="mt-3 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <p className="text-xs text-green-700 font-medium">✓ New image selected: {profilePicFile.name}</p>
              </div>
            )}

            {!isEditing && (
              <div className="mt-3 text-center">
                <p className="text-lg font-bold text-gray-900">{name || "—"}</p>
                {email && <p className="text-sm text-gray-500 mt-0.5">{email}</p>}
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-5">

            {/* Name */}
            <div>
              <FieldLabel icon="👤" required>Full Name</FieldLabel>
              {isEditing ? (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className={inputBase + " border-gray-300"}
                />
              ) : (
                <div className={inputDisabled}>{name || "Not provided"}</div>
              )}
            </div>

            {/* Phone */}
            <div>
              <FieldLabel icon="📱" required>Phone Number</FieldLabel>
              {isEditing ? (
                <>
                  <div className="relative">
                    {/* +91 prefix */}
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <span className="text-gray-600 font-medium text-sm">+91</span>
                      <span className="ml-2 h-5 w-px bg-gray-300" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="9876543210"
                      maxLength={10}
                      inputMode="numeric"
                      className={
                        inputBase +
                        " pl-16 pr-10 " +
                        (phoneError ? "border-red-400 focus:ring-red-300 focus:border-red-400" : "border-gray-300")
                      }
                    />
                    {/* Live validation icon */}
                    {phone.length > 0 && (
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        {isPhoneValid(phone)
                          ? <span className="text-green-500 text-lg font-bold">✓</span>
                          : <span className="text-red-400 text-lg font-bold">✗</span>
                        }
                      </div>
                    )}
                  </div>
                  {/* Hint */}
                  {phone.length === 0 && (
                    <p className="mt-1.5 text-xs text-gray-400">Enter your 10-digit mobile number</p>
                  )}
                  {phoneError && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">⚠️ {phoneError}</p>
                  )}
                  {phone.length > 0 && isPhoneValid(phone) && (
                    <p className="mt-1.5 text-xs text-green-600">✓ Valid mobile number</p>
                  )}
                </>
              ) : (
                <div className={inputDisabled}>
                  {phone ? `+91 ${phone}` : "Not provided"}
                </div>
              )}
            </div>

            {/* Email (read-only always) */}
            {email && (
              <div>
                <FieldLabel icon="📧">Email</FieldLabel>
                <div className={inputDisabled}>{email}</div>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  🔒 Email cannot be changed
                </p>
              </div>
            )}

            {/* Location */}
            {latitude !== null && longitude !== null && (
              <div className="p-4 rounded-xl border" style={{ backgroundColor: "#e8f4fb", borderColor: "#b3d4e8" }}>
                <p className="text-sm font-semibold mb-2 flex items-center gap-1.5" style={{ color: BRAND }}>
                  📍 Current Location
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white rounded-lg px-3 py-2 text-xs text-gray-600 font-mono">
                    Lat: {latitude.toFixed(6)}
                  </div>
                  <div className="bg-white rounded-lg px-3 py-2 text-xs text-gray-600 font-mono">
                    Lng: {longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                type="button"
                className={`flex-1 py-3.5 rounded-xl font-semibold text-base border-2 border-[#00598a] text-[#00598a]
                  hover:bg-[#00598a] hover:text-white active:bg-[#004a73]
                  transition-all ${isSaving ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || (phone.length > 0 && !isPhoneValid(phone))}
                type="button"
                className={`flex-1 py-3.5 rounded-xl font-semibold text-base text-white shadow-md
                  hover:shadow-lg bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                  transition-all ${isSaving || (phone.length > 0 && !isPhoneValid(phone)) ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
                    Saving...
                  </span>
                ) : (
                  "💾 Save Changes"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;