import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic, X, Loader2 } from "lucide-react";

import ProfilePhotoUpload from "../components/WorkerProfile/ProfilePhotoUpload";
import { createWorkerBase, getWorkerWithSkills } from "../services/api.service";
import { resolveWorkerProfile, rememberCreatedWorker } from "../services/workerProfile.service";
import typography from "../styles/typography";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import LocationPicker, { EMPTY_LOCATION } from "../components/LocationPicker";
import type { LocationPickerValue } from "../types/location.types";

/* ───────────────── CONSTANTS ───────────────── */
const BRAND = "#00598a";

/* ───────────────── TYPES ───────────────── */
type ScreenState = "checking" | "idle" | "loading";

/* ───────────────── SHARED STYLES ───────────────── */
const inputClass =
  "flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 " +
  "placeholder-gray-400 focus:outline-none focus:border-[#00598a] focus:ring-1 " +
  "focus:ring-[#00598a] transition bg-white";

const micBtn =
  "w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0 " +
  "hover:opacity-90 transition active:scale-95";

/* ───────────────── COMPONENT ───────────────── */
const WorkerProfile: React.FC = () => {
 const navigate = useNavigate();
 const { setWorkerProfile } = useAuth();
 const { setWorkerProfileId, setHasWorkerProfile } = useAccount();

 const [fullName, setFullName] = useState("");
 const [email, setEmail] = useState("");
 const [phone, setPhone] = useState("");
 const [location, setLocation] = useState<LocationPickerValue>(EMPTY_LOCATION);
 const [locationError, setLocationError] = useState("");

 const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
 const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

 const [screenState, setScreenState] = useState<ScreenState>("checking");
 const [error, setError] = useState<string | null>(null);

 const loading = screenState === "loading";

  /* ── Check existing worker ──
   * Enforces the create-once rule: a profile is only ever created when the
   * server has no worker document for this user. Otherwise the user is
   * redirected straight to the right place, so re-visiting this route (or
   * logging in again) can never show a second "create profile" form.
   */
  useEffect(() => {
  const checkWorker = async () => {
  const userId = localStorage.getItem("userId");
  if (!userId) { navigate("/loginPage", { replace: true }); return; }

  setEmail(
  localStorage.getItem("userEmail") ||
        localStorage.getItem("email") || ""
      );

  try {
  const res = await resolveWorkerProfile(userId);
  if (res.exists && res.workerId) {
  const workerId = res.workerId;
  setWorkerProfile(workerId, true);
  setWorkerProfileId(workerId);
  setHasWorkerProfile(true);

  // A profile with no skills still needs the add-skill step, exactly once.
  let hasSkills = false;
  try {
  const skillsRes = await getWorkerWithSkills(workerId);
  hasSkills = Array.isArray(skillsRes?.workerSkills) && skillsRes.workerSkills.length > 0;
      } catch { hasSkills = false; }

  navigate(hasSkills ? "/home" : "/add-skills", { replace: true });
  return;
      }
    } catch { }

  setScreenState("idle");
    };
  checkWorker();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  /* ── Submit ── */
 const handleSubmit = async () => {
 const userId = localStorage.getItem("userId");
 if (!userId) { navigate("/loginPage"); return; }

 if (!fullName.trim() || !location.city.trim()) {
 setError("Name and City are required");
 return;
    }

    // Coordinates and address must describe the same point, so a profile can
    // only be saved once the map point has been picked/confirmed.
 if (location.latitude === 0 || location.longitude === 0) {
 setLocationError("Please confirm your location on the map.");
 return;
    }
 setLocationError("");

 try {
 setScreenState("loading");
 setError(null);

 const res = await createWorkerBase({
 userId,
 name: fullName,
 area: location.area,
 city: location.city,
 state: location.state,
 pincode: location.pincode,
 latitude: location.latitude,
 longitude: location.longitude,
 phone: phone || undefined,
 profilePic: profilePhotoFile || undefined,
      });

  const workerId = res.worker._id;
  rememberCreatedWorker(userId, workerId);
  setWorkerProfile(workerId, true);
  setWorkerProfileId(workerId);
 setHasWorkerProfile(true);
 navigate("/add-skills", { replace: true });
    } catch (e: any) {
      setError(e.message || "Something went wrong");
 setScreenState("idle");
    }
  };

  /* ── Checking screen ── */
 if (screenState === "checking") {
 return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-10 h-10 border-4 border-t-transparent rounded-full"
 style={{ borderColor: BRAND }} />
      </div>
    );
  }

  /* ── Main UI ── */
 return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <button
 onClick={() => navigate("/")}
 className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className={`${typography.heading.h5} text-gray-900`}>Complete Your Profile</h1>
            <p className={`${typography.body.small} text-gray-500`}>Set up your worker profile to get started</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── Profile Photo ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center gap-4">
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

        {/* ── Personal Details ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
          <h2 className={`${typography.heading.h6} text-gray-900`}>Personal Details</h2>

          {/* Full Name */}
          <div>
            <label className={`block ${typography.form.label} text-gray-700 mb-2`}>
 Full Name <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
 type="text"
 placeholder="Enter your full name"
 value={fullName}
 onChange={(e) => setFullName(e.target.value)}
 className={inputClass}
              />
              <button className={micBtn} style={{ backgroundColor: BRAND }}>
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className={`block ${typography.form.label} text-gray-700 mb-2`}>
 Email Address
            </label>
            <input
 type="email"
 value={email}
 disabled
 className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed w-full`}
            />
          </div>

          {/* Phone */}
          <div>
            <label className={`block ${typography.form.label} text-gray-700 mb-2`}>
 Phone Number
            </label>
            <div className="flex gap-2">
              <input
 type="tel"
 placeholder="Enter your phone number"
 value={phone}
 onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
 maxLength={10}
 className={inputClass}
              />
              <button className={micBtn} style={{ backgroundColor: BRAND }}>
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Location Details ── */}
        <div className="rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5"
 style={{ backgroundColor: "#f0f7fb" }}>
          <LocationPicker
 value={location}
 onLocationChange={setLocation}
 title="Location Details"
 error={locationError}
 autoDetectLabel="Auto Detect"
          />
        </div>

        {/* ── Submit ── */}
        <div className="pb-8 space-y-3">
          <button
 onClick={handleSubmit}
 disabled={loading}
 className="w-full py-4 rounded-xl text-white font-semibold text-base transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed shadow-md"
 style={{ backgroundColor: BRAND }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </span>
            ) : (
              "Save Profile"
            )}
          </button>

          {error && (
            <p className="text-center text-sm text-red-500">* {error}</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default WorkerProfile;