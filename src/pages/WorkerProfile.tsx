import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mic,
  MapPin,
  RefreshCw,
  User,
  CheckCircle,
  AlertTriangle,
  X,
  Mail,
  Phone,
} from "lucide-react";

import ProfilePhotoUpload from "../components/WorkerProfile/ProfilePhotoUpload";
import {
  createWorkerBase,
  getWorkerWithSkills,getWorkerByUserId
} from "../services/api.service";
import typography from "../styles/typography";

/* ───────────────── CONSTANTS ───────────────── */
const BRAND = "#00598a";

/* ───────────────── TYPES ───────────────── */
type ScreenState = "checking" | "idle" | "loading" | "location_loading";

/* ───────────────── COMPONENT ───────────────── */
const WorkerProfile: React.FC = () => {
  const navigate = useNavigate();

  /* ───────────── FORM STATE ───────────── */
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

  /* ───────────── UI STATE ───────────── */
  const [screenState, setScreenState] = useState<ScreenState>("checking");
  const [error, setError] = useState<string | null>(null);
  const [locationWarning, setLocationWarning] = useState("");

  const loading =
    screenState === "loading" || screenState === "location_loading";

  /* ─────────────────────────────────────────────
     STEP 1: CHECK EXISTING WORKER ON PAGE LOAD
     ───────────────────────────────────────────── */
  useEffect(() => {
  const checkWorker = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/loginPage", { replace: true });
      return;
    }

    setEmail(
      localStorage.getItem("userEmail") ||
      localStorage.getItem("email") ||
      ""
    );

    try {
      // 🔑 ALWAYS trust backend
      const res = await getWorkerByUserId(userId);

      if (res?.worker?._id) {
        const workerId = res.worker._id;

        localStorage.setItem("workerId", workerId);
        localStorage.setItem(`worker_id_for_${userId}`, workerId);

        const hasSkills =
          (res.totalSkills ?? 0) > 0 ||
          (res.workerSkills?.length ?? 0) > 0;

        navigate(hasSkills ? "/home" : "/add-skills", { replace: true });
        return;
      }
    } catch {
      // Worker does NOT exist → allow creation
    }

    setScreenState("idle");
  };

  checkWorker();
}, [navigate]);
  /* ─────────────────────────────────────────────
     LOCATION AUTO-DETECT
     ───────────────────────────────────────────── */
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

        if (pos.coords.accuracy > 500) {
          setLocationWarning("Low GPS accuracy. Please verify address.");
        }

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();

          setArea(
            data.address.road ||
            data.address.neighbourhood ||
            data.address.suburb ||
            ""
          );
          setCity(
            data.address.city ||
            data.address.town ||
            data.address.village ||
            ""
          );
          setState(data.address.state || "");
          setPincode(data.address.postcode || "");
        } catch { }

        setScreenState("idle");
      },
      (err) => {
        setError(err.message);
        setScreenState("idle");
      },
      { enableHighAccuracy: true }
    );
  };

  /* ─────────────────────────────────────────────
     SUBMIT PROFILE
     ───────────────────────────────────────────── */
  const handleSubmit = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      navigate("/loginPage");
      return;
    }

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
        area,
        city,
        state,
        pincode,
        latitude,
        longitude,
        phone: phone || undefined,
        profilePic: profilePhotoFile || undefined,
      });

      const workerId = res.worker._id;
      localStorage.setItem("workerId", workerId);
      localStorage.setItem(`worker_id_for_${userId}`, workerId);

      navigate("/add-skills", { replace: true });
    } catch (e: any) {
      const msg = e?.message?.toLowerCase() || "";

    

      setError(e.message || "Something went wrong");
      setScreenState("idle");
    }
  };

  /* ───────────────── LOADING SCREEN ───────────────── */
  if (screenState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-t-transparent rounded-full"
          style={{ borderColor: BRAND }} />
      </div>
    );
  }

  /* ───────────────── UI ───────────────── */
  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}
      <div className="bg-white p-4 flex items-center gap-3 border-b">
        <button onClick={() => navigate("/")}>
          <ArrowLeft />
        </button>
        <h1 className={typography.heading.h6}>Complete Your Profile</h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">

        {error && (
          <div className="bg-red-50 p-3 rounded flex gap-2">
            <X className="text-red-500" />
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* PHOTO */}
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

        {/* NAME */}
        <input
          placeholder="Full Name *"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-3 rounded border"
        />

        {/* EMAIL */}
        <input
          value={email}
          disabled
          className="w-full p-3 rounded border bg-gray-100"
        />

        {/* PHONE */}
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
          className="w-full p-3 rounded border"
        />

        {/* LOCATION */}
        <button
          onClick={fetchLocation}
          className="w-full p-3 border rounded text-blue-600 flex gap-2 justify-center"
        >
          <RefreshCw size={16} /> Auto Detect Location
        </button>

        {locationWarning && (
          <p className="text-yellow-600 text-sm">{locationWarning}</p>
        )}

        {/* ADDRESS */}
        <input
          placeholder="Area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
          className="w-full p-3 rounded border"
        />
        <input
          placeholder="City *"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full p-3 rounded border"
        />
        <input
          placeholder="State"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="w-full p-3 rounded border"
        />
        <input
          placeholder="Pincode"
          value={pincode}
          onChange={(e) => setPincode(e.target.value)}
          className="w-full p-3 rounded border"
        />

        {/* SUBMIT */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full p-4 rounded text-white"
          style={{ backgroundColor: BRAND }}
        >
          {loading ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
};

export default WorkerProfile;