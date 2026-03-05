import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Navigation,
  Calendar,
  Briefcase,
  Share2,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Mail,
  Phone,
  Star,
  Clock,
  User,
} from "lucide-react";
import {
  getJobById,
  getUserById,
  API_BASE_URL,
  sendEnquiryToJob,
  checkJobApplication,
} from "../services/api.service";
import typography from "../styles/typography";

// ── Types ─────────────────────────────────────────────────────────────────────
interface JobData {
  _id: string;
  userId: string;
  category: string;
  subcategory?: string;
  jobType?: string;
  servicecharges?: string | number;
  description?: string;
  startDate?: string;
  endDate?: string;
  area?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number | string;
  longitude?: number | string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const resolveImageUrl = (path: string): string | null => {
  if (!path || typeof path !== "string") return null;
  const cleaned = path.trim();
  if (!cleaned) return null;
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
  const normalized = cleaned.replace(/\\/g, "/");
  const base = (API_BASE_URL || "").replace(/\/$/, "");
  const rel = normalized.startsWith("/") ? normalized : `/${normalized}`;
  return `${base}${rel}`;
};

const getImageUrls = (images?: string[]): string[] =>
  (images || []).map(resolveImageUrl).filter(Boolean) as string[];

const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const calcDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
};

const timeAgo = (dateStr?: string): string => {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// ── Image Carousel ────────────────────────────────────────────────────────────
const ImageCarousel: React.FC<{ images: string[]; title: string }> = ({ images, title }) => {
  const [idx, setIdx] = useState(0);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setIdx(0);
    setErrored(false);
  }, [images]);

  if (!images.length || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
        <span className="text-6xl opacity-20">🔧</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full group">
      <img
        src={images[idx]}
        alt={title}
        className="w-full h-full object-cover object-center"
        onError={() => {
          if (idx < images.length - 1) setIdx((i) => i + 1);
          else setErrored(true);
        }}
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i - 1 + images.length) % images.length); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft size={16} className="text-gray-700" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIdx((i) => (i + 1) % images.length); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight size={16} className="text-gray-700" />
          </button>
          <div className={`absolute top-2 right-2 bg-black/50 text-white ${typography.misc.badge} px-2.5 py-0.5 rounded-full`}>
            {idx + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
};

// ── Stat Cell ────────────────────────────────────────────────────────────────
const StatCell: React.FC<{
  icon: React.ReactNode;
  value: React.ReactNode;
  label?: React.ReactNode;
  last?: boolean;
}> = ({ icon, value, label, last }) => (
  <div
    className={`flex flex-col items-center justify-center py-4 px-3 text-center ${!last ? "border-r border-gray-100" : ""
      }`}
  >
    <div className={`text-[#00598a] mb-1.5 ${typography.icon.sm}`}>{icon}</div>
    <div className={`${typography.body.xs} font-extrabold text-gray-900 leading-tight`}>{value}</div>
    <div className={`${typography.misc.caption} mt-0.5`}>{label}</div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const JobDetailsPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();

  const [jobData, setJobData] = useState<JobData | null>(null);
  const [customerName, setCustomerName] = useState<string>("Customer");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [distance, setDistance] = useState<string>("N/A");
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [enquirySent, setEnquirySent] = useState<boolean>(false);
  const [enquiryLoading, setEnquiryLoading] = useState<boolean>(false);
  const [enquiryError, setEnquiryError] = useState<string>("");

  const currentWorkerId =
    localStorage.getItem("workerId") || localStorage.getItem("userId") || "";

  useEffect(() => {
    if (!jobId) return;
    (async () => {
      try {
        setPageLoading(true);
        const jobRes = await getJobById(jobId);
        if (!jobRes.success) { setError("Job not found"); return; }
        const jd: JobData = jobRes.data;
        setJobData(jd);
        setImageUrls(getImageUrls(jd.images));

        let custLat: number | null = null;
        let custLng: number | null = null;
        try {
          const userRes = await getUserById(jd.userId);
          if (userRes.success) {
            setCustomerName(userRes.data.name || "Customer");
            custLat = Number(userRes.data.latitude);
            custLng = Number(userRes.data.longitude);
          }
        } catch { /* ignore */ }

        if (navigator.geolocation && custLat && custLng) {
          try {
            const pos = await new Promise<GeolocationPosition>((res, rej) =>
              navigator.geolocation.getCurrentPosition(res, rej)
            );
            setDistance(calcDistance(pos.coords.latitude, pos.coords.longitude, custLat!, custLng!));
          } catch { /* ignore */ }
        }

        if (currentWorkerId && jobId) {
          try {
            const alreadyApplied = await checkJobApplication(jobId, currentWorkerId);
            setEnquirySent(alreadyApplied);
          } catch { /* ignore */ }
        }
      } catch {
        setError("Failed to load job details");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [jobId, currentWorkerId]);

  const handleSendEnquiry = async (): Promise<void> => {
    if (!jobId || !currentWorkerId) {
      setEnquiryError("Unable to send enquiry. Please login again.");
      return;
    }
    if (enquirySent) return;
    setEnquiryLoading(true);
    setEnquiryError("");
    try {
      const result = await sendEnquiryToJob(jobId, currentWorkerId);
      if (result.success) {
        setEnquirySent(true);
        navigate("/");           // ← navigate home on success
      } else {
        setEnquiryError(result.message || "Failed to send enquiry. Try again.");
      }
    } catch {
      setEnquiryError("Network error. Please try again.");
    } finally {
      setEnquiryLoading(false);
    }
  };

  // ── Loading State ──────────────────────────────────────────────────────────
  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3">
        <div className="w-10 h-10 border-4 border-[#00598a]/20 border-t-[#00598a] rounded-full animate-spin" />
        <p className={`${typography.misc.caption} font-medium`}>Loading job details…</p>
      </div>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────
  if (error || !jobData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-3 p-6">
        <AlertTriangle size={48} className="text-amber-400" />
        <h2 className={typography.heading.h5}>Not Found</h2>
        <p className={typography.misc.caption}>{error || "Job not available"}</p>
        <button
          onClick={() => navigate(-1)}
          className={`mt-2 px-5 py-2 bg-[#00598a] text-white rounded-xl font-bold ${typography.body.xs} hover:bg-[#004a75] transition-colors`}
        >
          Go Back
        </button>
      </div>
    );
  }

  const title = jobData.subcategory
    ? `${jobData.subcategory} – ${jobData.category}`
    : jobData.category;
  const startDate = formatDate(jobData.startDate);
  const location = [jobData.area, jobData.city, jobData.state].filter(Boolean).join(", ");
  const mapsOpenUrl = `https://www.google.com/maps?q=${jobData.latitude},${jobData.longitude}`;
  const directionsUrl =
    jobData.latitude && jobData.longitude
      ? `https://www.google.com/maps/dir/?api=1&destination=${jobData.latitude},${jobData.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-6">

      {/* ── Top Nav ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-1 text-[#00598a] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors ${typography.body.xs} font-semibold`}
          >
            <ChevronLeft size={15} /> Back
          </button>

          <div className={`hidden sm:flex items-center gap-1.5 ${typography.misc.caption}`}>
            <span>Jobs</span>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="font-semibold text-gray-900 max-w-xs truncate">{title}</span>
          </div>

          <button
            onClick={() =>
              navigator.share?.({ title, url: window.location.href }).catch(() => { })
            }
            className={`flex items-center gap-1 text-gray-400 hover:text-[#00598a] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors ${typography.body.xs} font-medium`}
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* ── Page Body ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex flex-col gap-4">

            {/* Hero Image */}
            <div className="relative rounded-xl overflow-hidden h-52 sm:h-64 bg-gradient-to-br from-blue-50 to-orange-50 shadow-sm">
              <ImageCarousel images={imageUrls} title={title} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent pointer-events-none" />

              <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 z-10">
                <div className="flex flex-wrap gap-1.5 mb-2 items-center">
                  {jobData.category && (
                    <span className={`bg-orange-500 text-white ${typography.misc.badge} px-2.5 py-0.5 rounded-md`}>
                      {jobData.category}
                    </span>
                  )}
                  {jobData.subcategory && (
                    <span className={`bg-white/20 backdrop-blur-sm text-white ${typography.misc.badge} px-2.5 py-0.5 rounded-md`}>
                      {jobData.subcategory}
                    </span>
                  )}
                  <span className={`ml-auto flex items-center gap-1 bg-green-500 text-white ${typography.misc.badge} px-2.5 py-0.5 rounded-full`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white" /> Open
                  </span>
                </div>

                <div className="flex items-baseline gap-3 flex-wrap">
                  {jobData.servicecharges && (
                    <span className={`text-white font-extrabold ${typography.heading.h5} leading-none`}>
                      ₹{jobData.servicecharges}
                    </span>
                  )}
                  <h1 className={`text-white ${typography.card.subtitle} flex-1 leading-snug`}>{title}</h1>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                  {jobData.jobType && (
                    <span className={`flex items-center gap-1 bg-[#00598a]/80 text-white ${typography.misc.badge} px-2.5 py-0.5 rounded-full`}>
                      <Briefcase size={11} /> {jobData.jobType}
                    </span>
                  )}
                  <span className={`flex items-center gap-1 text-white/70 ${typography.misc.caption}`}>
                    <Calendar size={11} /> {startDate}
                  </span>
                  {(jobData.area || jobData.city) && (
                    <span className={`flex items-center gap-1 text-white/70 ${typography.misc.caption}`}>
                      <MapPin size={11} /> {[jobData.area, jobData.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Enquiry Sent Banner */}
            {enquirySent && (
              <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className={`${typography.body.xs} font-bold text-green-700`}>
                    Enquiry Sent Successfully!
                  </p>
                  <p className={`${typography.misc.caption} text-green-600 mt-0.5`}>
                    The customer will review your application and contact you soon.
                  </p>
                </div>
              </div>
            )}

            {/* Job Header Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <h2 className={`${typography.card.title} text-gray-900 mb-1`}>
                {jobData.category || title}
              </h2>
              <p className={typography.misc.caption}>
                {jobData.createdAt ? `Posted ${timeAgo(jobData.createdAt)} · ` : ""}
                {[jobData.city, jobData.state].filter(Boolean).join(", ")}
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {jobData.jobType && (
                  <span className={`${typography.misc.badge} bg-orange-50 border border-orange-200 text-orange-600 px-2.5 py-0.5 rounded-full`}>
                    {jobData.jobType}
                  </span>
                )}
                {jobData.subcategory && (
                  <span className={`${typography.misc.badge} border border-gray-200 text-gray-500 px-2.5 py-0.5 rounded-full`}>
                    {jobData.subcategory}
                  </span>
                )}
                {jobData.category && (
                  <span className={`${typography.misc.badge} border border-gray-200 text-gray-500 px-2.5 py-0.5 rounded-full`}>
                    {jobData.category}
                  </span>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm grid grid-cols-3 divide-x divide-gray-100 overflow-hidden">
              <StatCell
                icon={<MapPin size={18} />}
                value={<span className={typography.body.xs}>{jobData.city || "—"}</span>}
                label={
                  <a
                    href={mapsOpenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[#00598a] font-semibold hover:underline ${typography.misc.caption}`}
                  >
                    Open map
                  </a>
                }
              />
              <StatCell
                icon={<Navigation size={18} />}
                value={<span className={typography.body.xs}>{distance}</span>}
                label="Distance"
              />
              <StatCell
                icon={<Calendar size={18} />}
                value={<span className={typography.body.xs}>{startDate}</span>}
                label="Start Date"
                last
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className={`${typography.search.label} text-gray-400 mb-2`}>About this job</p>
              <p className={`${typography.body.small} text-gray-600 leading-relaxed`}>
                {jobData.description || "No description provided."}
              </p>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className={`${typography.search.label} text-gray-400 mb-2`}>Location</p>
              <div className="flex items-start gap-2 mb-3">
                <MapPin size={15} className="text-[#00598a] flex-shrink-0 mt-0.5" />
                <span className={`${typography.body.xs} font-semibold text-gray-800`}>
                  {[location, jobData.pincode].filter(Boolean).join(" – ")}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={mapsOpenUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gray-50 border border-blue-100 text-[#00598a] ${typography.body.xs} font-bold hover:bg-blue-50 transition-colors`}
                >
                  <MapPin size={13} /> View
                </a>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#00598a] hover:bg-[#004a75] text-white ${typography.body.xs} font-bold transition-colors`}
                >
                  <Navigation size={13} /> Directions
                </a>
              </div>
            </div>

            {/* Posted By + Send Enquiry Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
              <p className={`${typography.search.label} text-gray-400`}>Posted By</p>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00598a]/10 to-blue-100 flex items-center justify-center flex-shrink-0 border border-blue-100">
                  <User size={22} className="text-[#00598a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`${typography.card.subtitle} text-gray-900 truncate`}>{customerName}</p>
                    <span className={`flex items-center gap-0.5 text-amber-400 ${typography.body.xs} font-bold`}>
                      <Star size={12} fill="currentColor" /> 4.7
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`flex items-center gap-1 ${typography.misc.caption}`}>
                      <Clock size={10} />
                      {jobData?.createdAt ? `Posted ${timeAgo(jobData.createdAt)}` : "Recently posted"}
                    </span>
                    <span className={`inline-flex items-center gap-1 bg-green-50 text-green-600 ${typography.misc.badge} px-1.5 py-0.5 rounded-full border border-green-100`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-center">
                  <p className={`${typography.heading.h5} text-[#00598a]`}>3</p>
                  <p className={`${typography.misc.caption} leading-tight`}>Slots<br />Left</p>
                </div>
              </div>

              {enquiryError && (
                <p className={`${typography.form.error} text-center`}>{enquiryError}</p>
              )}

              {enquirySent ? (
                <button
                  disabled
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-green-50 border-2 border-green-200 text-green-600 font-bold ${typography.body.xs}`}
                >
                  <CheckCircle size={16} /> Enquiry Sent ✓
                </button>
              ) : (
                <button
                  onClick={handleSendEnquiry}
                  disabled={enquiryLoading}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#00598a] hover:bg-[#004a75] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold ${typography.body.xs} transition-all active:scale-[0.98] shadow-md shadow-[#00598a]/25`}
                >
                  {enquiryLoading ? (
                    <><Loader2 size={15} className="animate-spin" /> Sending…</>
                  ) : (
                    <><Mail size={15} /> Send Enquiry</>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

    </div>
  );
};

export default JobDetailsPage;