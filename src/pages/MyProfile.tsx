import React, { useEffect, useRef, useState } from "react";
import {
  getUserById,
  updateUserById,
  API_BASE_URL,
} from "../services/api.service";
import { useNavigate } from "react-router-dom";

const BRAND = "#00598a";

/* ── helpers ──────────────────────────────────────────────────────────────── */
const inputBase =
  "w-full px-4 py-3 border rounded-xl transition-all text-base text-gray-800 " +
  "placeholder-gray-400 bg-white focus:outline-none " +
  "focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a]";

const inputDisabled =
  "w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 " +
  "text-gray-500 cursor-not-allowed text-base";

const FieldLabel: React.FC<{
  icon: string;
  children: React.ReactNode;
  required?: boolean;
}> = ({ icon, children, required }) => (
  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
    <span>{icon}</span>
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

/* ── component ────────────────────────────────────────────────────────────── */
const MyProfile: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  // ✅ Location: auto-detected silently in background, NEVER displayed
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
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
      } catch {}
    }
    return null;
  };

  /* ── email validation ─────────────────────────────────────────────────── */
  const isEmailValid = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (val.length > 0) {
      setEmailError(
        isEmailValid(val) ? null : "Please enter a valid email address"
      );
    } else {
      setEmailError(null);
    }
  };

  /* ── fetch profile ────────────────────────────────────────────────────── */
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = getUserId();
      if (!userId) {
        setError("Please login again");
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const res = await getUserById(userId);
        if (res.success && res.data) {
          setName(res.data.name || "");
          setEmail(res.data.email || "");
          // Restore saved coords silently from API
          if (res.data.latitude) setLatitude(Number(res.data.latitude));
          if (res.data.longitude) setLongitude(Number(res.data.longitude));
          if (res.data?.profilePic) {
            setProfilePic(
              res.data.profilePic.startsWith("http")
                ? res.data.profilePic
                : `${API_BASE_URL}${res.data.profilePic}`
            );
          }
        } else {
          setError("Failed to load profile data");
        }
      } catch (error: any) {
        setError(error.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  /* ── silent geolocation — no UI, just updates state ──────────────────── */
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      (err) => console.warn("Location unavailable:", err)
    );
  }, []);

  /* ── image handling ───────────────────────────────────────────────────── */
  const handleImageClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5 MB");
      return;
    }
    setProfilePicFile(file);
    setProfilePic(URL.createObjectURL(file));
  };

  /* ── save ─────────────────────────────────────────────────────────────── */
  const handleSave = async () => {
    const userId = getUserId();
    if (!userId) {
      alert("User not found. Please login again.");
      return;
    }
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (email && !isEmailValid(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      const payload: any = { name: name.trim() };
      if (email.trim()) payload.email = email.trim();

      // ✅ Location sent silently to API — not shown to user
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
        setEmailError(null);

        localStorage.setItem("userName", name.trim());
        if (email.trim()) localStorage.setItem("userEmail", email.trim());

        if (res.data?.profilePic) {
          setProfilePic(
            res.data.profilePic.startsWith("http")
              ? res.data.profilePic
              : `${API_BASE_URL}${res.data.profilePic}`
          );
        }

        // Patch userData in localStorage
        const existingUserData = localStorage.getItem("userData");
        if (existingUserData) {
          try {
            const userData = JSON.parse(existingUserData);
            userData.name = name.trim();
            if (email.trim()) userData.email = email.trim();
            localStorage.setItem("userData", JSON.stringify(userData));
          } catch {}
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
    setEmailError(null);
    const userId = getUserId();
    if (userId) {
      try {
        const res = await getUserById(userId);
        if (res.success && res.data) {
          setName(res.data.name || "");
          setEmail(res.data.email || "");
          if (res.data?.profilePic) {
            setProfilePic(
              res.data.profilePic.startsWith("http")
                ? res.data.profilePic
                : `${API_BASE_URL}${res.data.profilePic}`
            );
          }
        }
      } catch (err) {
        console.error("Failed to reload profile:", err);
      }
    }
  };

  /* ── save button disabled state ───────────────────────────────────────── */
  const isSaveDisabled =
    isSaving || (email.length > 0 && !isEmailValid(email));

  /* ── loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div
          className="animate-spin h-12 w-12 border-4 border-t-transparent rounded-full mb-4"
          style={{ borderColor: BRAND, borderTopColor: "transparent" }}
        />
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
            <p className="text-sm text-gray-500 mt-0.5">
              Manage your personal information
            </p>
          </div>
          {!isEditing && (
            <button
              onClick={() => {
                setIsEditing(true);
                setSuccessMessage(null);
                setError(null);
              }}
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
            <div className="relative">
              <div
                onClick={handleImageClick}
                className={`w-28 h-28 rounded-full overflow-hidden flex items-center justify-center shadow-md ${
                  isEditing ? "cursor-pointer" : ""
                }`}
                style={{
                  background: `linear-gradient(135deg, ${BRAND}, #0077b6)`,
                }}
              >
                {profilePic ? (
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
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
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </div>

            {isEditing && profilePicFile && (
              <div className="mt-3 px-4 py-1.5 bg-green-50 border border-green-200 rounded-full">
                <p className="text-xs text-green-700 font-medium">
                  ✓ New image selected: {profilePicFile.name}
                </p>
              </div>
            )}

            {!isEditing && (
              <div className="mt-3 text-center">
                <p className="text-lg font-bold text-gray-900">{name || "—"}</p>
                {email && (
                  <p className="text-sm text-gray-500 mt-0.5">{email}</p>
                )}
              </div>
            )}
          </div>

          {/* Form Fields — only Name and Email shown */}
          <div className="space-y-5">

            {/* Name */}
            <div>
              <FieldLabel icon="👤" required>
                Full Name
              </FieldLabel>
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

            {/* Email */}
            <div>
              <FieldLabel icon="📧">Email</FieldLabel>
              {isEditing ? (
                <>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email address"
                      className={
                        inputBase +
                        " pr-10 " +
                        (emailError
                          ? "border-red-400 focus:ring-red-300 focus:border-red-400"
                          : "border-gray-300")
                      }
                    />
                    {email.length > 0 && (
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                        {isEmailValid(email) ? (
                          <span className="text-green-500 text-lg font-bold">✓</span>
                        ) : (
                          <span className="text-red-400 text-lg font-bold">✗</span>
                        )}
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      ⚠️ {emailError}
                    </p>
                  )}
                  {email.length > 0 && isEmailValid(email) && (
                    <p className="mt-1.5 text-xs text-green-600">
                      ✓ Valid email address
                    </p>
                  )}
                </>
              ) : (
                <div className={inputDisabled}>
                  {email || "Not provided"}
                </div>
              )}
            </div>

            {/* ✅ Phone & Location are intentionally removed from UI */}
            {/* They are still captured and sent to the API silently */}

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
                disabled={isSaveDisabled}
                type="button"
                className={`flex-1 py-3.5 rounded-xl font-semibold text-base text-white shadow-md
                  hover:shadow-lg bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                  transition-all ${isSaveDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
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