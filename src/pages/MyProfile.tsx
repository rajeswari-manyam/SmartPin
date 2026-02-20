import React, { useEffect, useRef, useState } from "react";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import {
  getUserById,
  updateUserById,
  API_BASE_URL,
} from "../services/api.service";
import { useNavigate } from "react-router-dom";
import { useAccount } from "../context/AccountContext";

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
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ================= GET USER ID ================= */
  const getUserId = () => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserData = localStorage.getItem("userData");

    if (storedUserId) return storedUserId;

    if (storedUserData) {
      try {
        const userData = JSON.parse(storedUserData);
        return userData.id || userData._id || userData.userId;
      } catch (e) {
        console.error("Failed to parse userData:", e);
      }
    }

    return null;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const userId = getUserId();

      if (!userId) {
        console.error("No userId found in localStorage");
        setError("Please login again");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching profile for userId:", userId);

        const savedPhone = localStorage.getItem("userPhone");
        const res = await getUserById(userId);

        console.log("User data received:", res);

        if (res.success && res.data) {
          setName(res.data.name || "");

          const userPhone = res.data.phone || savedPhone || "";
          setPhone(userPhone);

          if (res.data.phone && res.data.phone !== savedPhone) {
            localStorage.setItem("userPhone", res.data.phone);
          }

          setEmail(res.data.email || "");
          setLatitude(res.data.latitude ? Number(res.data.latitude) : null);
          setLongitude(res.data.longitude ? Number(res.data.longitude) : null);

          if (res.data?.profilePic) {
            const picUrl = res.data.profilePic.startsWith('http')
              ? res.data.profilePic
              : `${API_BASE_URL}${res.data.profilePic}`;
            setProfilePic(picUrl);
            console.log("Profile pic URL:", picUrl);
          }

          console.log("✅ Profile loaded successfully");
        } else {
          if (savedPhone) {
            console.log("API failed but using localStorage phone:", savedPhone);
            setPhone(savedPhone);
          }
          setError("Failed to load profile data");
        }
      } catch (error: any) {
        console.error("Profile fetch error:", error);

        const savedPhone = localStorage.getItem("userPhone");
        if (savedPhone) {
          console.log("Error occurred but using localStorage phone:", savedPhone);
          setPhone(savedPhone);
        }

        setError(error.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  /* ================= GEO LOCATION ================= */
  useEffect(() => {
    if (latitude !== null && longitude !== null) return;

    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("Location obtained:", pos.coords);
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
      },
      (err) => {
        console.error("Location error:", err);
      }
    );
  }, [latitude, longitude]);

  /* ================= IMAGE HANDLING ================= */
  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    setProfilePicFile(file);
    setProfilePic(URL.createObjectURL(file));
  };

  /* ================= SAVE PROFILE ================= */
  const handleSave = async () => {
    const userId = getUserId();

    if (!userId) {
      alert("User not found. Please login again.");
      return;
    }

    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload: any = {
        name: name.trim(),
      };

      if (latitude !== null && longitude !== null) {
        payload.latitude = latitude;
        payload.longitude = longitude;
      }

      if (profilePicFile) {
        payload.profilePic = profilePicFile;
      }

      console.log("💾 Saving profile with payload:", {
        ...payload,
        profilePic: profilePicFile ? `File: ${profilePicFile.name}` : "No file"
      });

      const res = await updateUserById(userId, payload);

      console.log("📥 Update response:", res);

      if (res.success) {
        alert("Profile updated successfully ✓");
        setIsEditing(false);
        setProfilePicFile(null);
        navigate("/", { replace: true });

        // Update localStorage with new name
        localStorage.setItem("userName", name.trim());

        // Update profile picture from response
        if (res.data?.profilePic) {
          const picUrl = res.data.profilePic.startsWith('http')
            ? res.data.profilePic
            : `${API_BASE_URL}${res.data.profilePic}`;
          setProfilePic(picUrl);
          console.log("✅ Updated profile pic URL:", picUrl);
        }

        // ✅ IMPORTANT: Trigger event for sidebar to update
        console.log("🔄 Dispatching profile update event...");
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new Event("profileUpdated"));
        console.log("✅ Profile update event dispatched");

      } else {
        throw new Error(res.message || "Update failed");
      }
    } catch (error: any) {
      console.error("❌ Save error:", error);
      const errorMsg = error.message || "Failed to update profile";
      setError(errorMsg);
      alert("Error: " + errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  /* ================= CANCEL ================= */
  const handleCancel = async () => {
    setIsEditing(false);
    setProfilePicFile(null);
    setError(null);

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
            const picUrl = res.data.profilePic.startsWith('http')
              ? res.data.profilePic
              : `${API_BASE_URL}${res.data.profilePic}`;
            setProfilePic(picUrl);
          }
        }
      } catch (err) {
        console.error("Failed to reload profile:", err);
      }
    }
  };

  /* ================= LOADING ================= */
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mb-4" />
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  /* ================= ERROR STATE ================= */
  if (error && !getUserId()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            variant="gradient-blue"
            onClick={() => window.location.href = '/login'}
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`${typography.heading.h2}`}>My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-blue-600 font-medium hover:text-blue-700 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* PROFILE IMAGE */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div
              onClick={handleImageClick}
              className={`w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-[#f09b13] to-[#f0c413] flex items-center justify-center shadow-lg ${isEditing ? 'cursor-pointer hover:opacity-90 transition-opacity' : ''
                }`}
            >
              {profilePic ? (
                <img
                  src={profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-4xl font-bold">
                  {name ? name.charAt(0).toUpperCase() : 'U'}
                </span>
              )}
            </div>

            {isEditing && (
              <>
                <button
                  onClick={handleImageClick}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:scale-110"
                  title="Change profile picture"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                {isEditing && !profilePic && (
                  <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm">Click to upload</span>
                  </div>
                )}
              </>
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
            <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-full">
              <p className="text-sm text-green-700 font-medium">
                ✓ New image selected
              </p>
            </div>
          )}
        </div>

        {/* FORM */}
        <div className="space-y-6">
          {/* Name Field */}
          <div>
            <label className={`${typography.form.label} flex items-center gap-2`}>
              <span>👤</span> Name
            </label>
            <input
              value={name}
              disabled={!isEditing}
              onChange={(e) => setName(e.target.value)}
              className={`w-full mt-2 px-4 py-3 border rounded-xl transition-all ${!isEditing
                ? 'bg-gray-50 text-gray-600 cursor-not-allowed'
                : 'bg-white border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                }`}
              placeholder="Enter your name"
            />
          </div>

          {/* Phone Number Field */}
          <div>
            <label className={`${typography.form.label} flex items-center gap-2`}>
              <span>📱</span> Phone Number
            </label>
            <input
              value={phone || "Not provided"}
              disabled
              className="w-full mt-2 px-4 py-3 border rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span>🔒</span> Phone number is locked and cannot be changed
            </p>
          </div>

          {/* Email Field (if available) */}
          {email && (
            <div>
              <label className={`${typography.form.label} flex items-center gap-2`}>
                <span>📧</span> Email
              </label>
              <input
                value={email}
                disabled
                className="w-full mt-2 px-4 py-3 border rounded-xl bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
          )}

          {/* Location Info */}
          {(latitude !== null && longitude !== null) && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                <span>📍</span> Current Location
              </p>
              <div className="text-xs text-blue-700 space-y-1">
                <p>Latitude: {latitude.toFixed(6)}</p>
                <p>Longitude: {longitude.toFixed(6)}</p>
              </div>
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        {isEditing && (
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              fullWidth
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="gradient-blue"
              fullWidth
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Saving...
                </span>
              ) : (
                "💾 Save Changes"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
