import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, X, MapPin, Mic } from "lucide-react";

import ProfilePhotoUpload from "../components/WorkerProfile/ProfilePhotoUpload";
import { createWorkerBase, getWorkerByUserId } from "../services/api.service";
import typography from "../styles/typography";

/* ───────────────── CONSTANTS ───────────────── */
const BRAND = "#00598a";

/* ───────────────── TYPES ───────────────── */
type ScreenState = "checking" | "idle" | "loading" | "location_loading";

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

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);

  const [screenState, setScreenState] = useState<ScreenState>("checking");
  const [error, setError] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState("");

  const loading = screenState === "loading" || screenState === "location_loading";
  const isLocationLoading = screenState === "location_loading";

  /* ── Check existing worker ── */
  useEffect(() => {
    const checkWorker = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) { navigate("/loginPage", { replace: true }); return; }

      setEmail(
        localStorage.getItem("userEmail") ||
        localStorage.getItem("email") || ""
      );

      try {
        const res = await getWorkerByUserId(userId);
        if (res?.worker?._id) {
          const workerId = res.worker._id;
          localStorage.setItem("workerId", workerId);
          localStorage.setItem(`worker_id_for_${userId}`, workerId);
          const hasSkills = (res.totalSkills ?? 0) > 0 || (res.workerSkills?.length ?? 0) > 0;
          navigate(hasSkills ? "/home" : "/add-skills", { replace: true });
          return;
        }
      } catch { }

      setScreenState("idle");
    };
    checkWorker();
  }, [navigate]);

  /* ── Location ── */
  const fetchLocation = () => {
    setScreenState("location_loading");
    setError(null);
    setLocationWarning("");

    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setScreenState("idle");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        if (pos.coords.accuracy > 500) setLocationWarning("Low GPS accuracy. Please verify address.");

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          setArea(data.address.road || data.address.neighbourhood || data.address.suburb || "");
          setCity(data.address.city || data.address.town || data.address.village || "");
          setState(data.address.state || "");
          setPincode(data.address.postcode || "");
        } catch { }

        setScreenState("idle");
      },
      (err) => { setError(err.message); setScreenState("idle"); },
      { enableHighAccuracy: true }
    );
  };

  /* ── Submit ── */
  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) { navigate("/loginPage"); return; }

    if (!fullName.trim() || !city.trim()) {
      setError("Name and City are required");
      return;
    }

    try {
      setScreenState("loading");
      setError(null);

      const res = await createWorkerBase({
        userId,
        name: fullName,
        area, city, state, pincode, latitude, longitude,
        phone: phone || undefined,
        profilePic: profilePhotoFile || undefined,
      });

      const workerId = res.worker._id;
      localStorage.setItem("workerId", workerId);
      localStorage.setItem(`worker_id_for_${userId}`, workerId);
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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" style={{ color: BRAND }} />
              <h2 className={`${typography.heading.h6} text-gray-900`}>
                Location Details <span className="text-red-500">*</span>
              </h2>
            </div>
            <button
              onClick={fetchLocation}
              disabled={isLocationLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              <RefreshCw className={`w-4 h-4 ${isLocationLoading ? "animate-spin" : ""}`} />
              {isLocationLoading ? "Detecting..." : "Auto Detect"}
            </button>
          </div>

          {/* Detecting banner */}
          {isLocationLoading && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
              style={{ backgroundColor: "#daeef7", color: BRAND }}>
              <MapPin className="w-4 h-4 animate-pulse" />
              Detecting your location...
            </div>
          )}

          {locationWarning && (
            <div className="flex items-start gap-2 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-700">{locationWarning}</p>
            </div>
          )}

          {/* Address */}
          <div>
            <label className={`block ${typography.form.label} text-gray-700 mb-2`}>Address</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your address"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className={inputClass}
              />
              <button className={micBtn} style={{ backgroundColor: BRAND }}>
                <Mic className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block ${typography.form.label} text-gray-700 mb-2`}>
                City <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={inputClass}
                />
                <button className={micBtn} style={{ backgroundColor: BRAND }}>
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div>
              <label className={`block ${typography.form.label} text-gray-700 mb-2`}>State</label>
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className={`${inputClass} w-full`}
              />
            </div>
          </div>

          {/* Pincode */}
          <div>
            <label className={`block ${typography.form.label} text-gray-700 mb-2`}>Pincode</label>
            <input
              type="text"
              placeholder="Enter pincode"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              maxLength={6}
              className={`${inputClass} w-full`}
            />
          </div>

          {/* Coordinates confirmed */}
          {latitude !== 0 && longitude !== 0 && (
            <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-sm text-green-700">
                <span className="font-semibold">✓ Location set: </span>
                <span className="font-mono text-xs">{latitude.toFixed(5)}, {longitude.toFixed(5)}</span>
              </p>
            </div>
          )}
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
                <span className="animate-spin">⏳</span> Saving...
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