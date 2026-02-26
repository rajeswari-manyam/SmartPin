import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Upload, X } from "lucide-react";

import SubCategoriesData from "../data/subcategories.json";
import { createJob, CreateJobPayload } from "../services/api.service";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";
import { categories } from "../components/categories/Categories";
import typography from "../styles/typography";

/* ================= TYPES ================= */
interface SubCategory {
  name: string;
  icon: string;
}
interface SubCategoryGroup {
  categoryId: number;
  items: SubCategory[];
}
interface FormData {
  title: string;
  category: string;
  subcategory: string;
  jobType: "FULL_TIME" | "PART_TIME";
  servicecharges: string;
  startDate: string;
  endDate: string;
  description: string;
  area: string;
  city: string;
  state: string;
  pincode: string;
  images: File[];
  latitude?: number;
  longitude?: number;
}

const subcategoryGroups: SubCategoryGroup[] = SubCategoriesData.subcategories || [];

/* ================= STYLES ================= */
const BRAND = "#00598a";

const inputBase =
  `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
  `focus:outline-none focus:border-[#00598a] focus:ring-1 focus:ring-[#00598a] ` +
  `placeholder-gray-400 transition-all duration-200 ` +
  `${typography.form.input} bg-white`;

/* ================= SUB-COMPONENTS ================= */
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
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
    {title && (
      <div className="flex items-center justify-between mb-1">
        <h3 className={`${typography.card.subtitle} text-gray-900`}>{title}</h3>
        {action}
      </div>
    )}
    {children}
  </div>
);

/* ================= HELPERS ================= */
const reverseGeocode = async (lat: number, lng: number) => {
  const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
  return res.json();
};

const forwardGeocode = async (area: string, city: string, state: string, pincode: string) => {
  try {
    const query = `${area}, ${city}, ${state}, ${pincode}, India`;
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await res.json();
    if (data && data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

/* ================= COMPONENT ================= */
const PostJob: React.FC = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const [formData, setFormData] = useState<FormData>({
    title: "", category: "", subcategory: "", jobType: "FULL_TIME",
    servicecharges: "", startDate: "", endDate: "", description: "",
    area: "", city: "", state: "", pincode: "", images: [],
    latitude: undefined, longitude: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [locationWarning, setLocationWarning] = useState("");

  const getFilteredSubcategories = (): SubCategory[] => {
    if (!formData.category) return [];
    const group = subcategoryGroups.find(g => String(g.categoryId) === formData.category);
    return group?.items || [];
  };
  const filteredSubcategories = getFilteredSubcategories();

  useEffect(() => {
    const prefillDataStr = localStorage.getItem("jobPrefillData");
    if (prefillDataStr) {
      try {
        const prefillData = JSON.parse(prefillDataStr);
        const foundCategory = categories.find(
          cat =>
            cat.name.toLowerCase().includes(prefillData.category?.toLowerCase()) ||
            prefillData.category?.toLowerCase().includes(cat.name.toLowerCase())
        );
        setFormData(prev => ({
          ...prev,
          category: foundCategory ? foundCategory.id : "",
          subcategory: prefillData.subcategory || "",
          area: prefillData.area || "",
          latitude: prefillData.latitude,
          longitude: prefillData.longitude,
        }));
        localStorage.removeItem("jobPrefillData");
      } catch (err) {
        console.error("Error parsing prefill data:", err);
      }
    }
  }, []);

  useEffect(() => {
    if (formData.category && formData.subcategory) {
      const isValid = getFilteredSubcategories().some(sub => sub.name === formData.subcategory);
      if (!isValid) setFormData(prev => ({ ...prev, subcategory: "" }));
    }
  }, [formData.category]);

  useEffect(() => {
    const detectLocation = async () => {
      if (formData.area && formData.city && formData.state && formData.pincode) {
        setIsGeocodingLoading(true);
        const coords = await forwardGeocode(formData.area, formData.city, formData.state, formData.pincode);
        if (coords) setFormData(prev => ({ ...prev, latitude: coords.latitude, longitude: coords.longitude }));
        setIsGeocodingLoading(false);
      }
    };
    const timeoutId = setTimeout(detectLocation, 1500);
    return () => clearTimeout(timeoutId);
  }, [formData.area, formData.city, formData.state, formData.pincode]);

  const handleUseCurrentLocation = () => {
    setLocationLoading(true);
    setError("");
    setLocationWarning("");
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser");
      setLocationLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        if (accuracy > 500) {
          setLocationWarning(
            `⚠️ Low accuracy detected (~${Math.round(accuracy)}m). Your device may not have GPS. ` +
            `The address fields below may be approximate — please verify and correct if needed.`
          );
        }
        try {
          const data = await reverseGeocode(latitude, longitude);
          setFormData(prev => ({
            ...prev, latitude, longitude,
            area: data.address.suburb || data.address.neighbourhood || data.address.road || prev.area,
            city: data.address.city || data.address.town || data.address.village || prev.city,
            state: data.address.state || prev.state,
            pincode: data.address.postcode || prev.pincode,
          }));
        } catch { setError("Failed to fetch address from location"); }
        setLocationLoading(false);
      },
      (err) => {
        setError(`Location error: ${err.message}`);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const availableSlots = 5 - formData.images.length;
    if (availableSlots <= 0) { setError("Maximum 5 images allowed"); return; }
    const validFiles = Array.from(files).slice(0, availableSlots).filter(file => {
      if (!file.type.startsWith("image/")) { setError(`${file.name} is not a valid image`); return false; }
      if (file.size > 5 * 1024 * 1024) { setError(`${file.name} exceeds 5 MB`); return false; }
      return true;
    });
    if (!validFiles.length) return;
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === validFiles.length) setImagePreviews(prev => [...prev, ...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    setFormData(prev => ({ ...prev, images: [...prev.images, ...validFiles] }));
    setError("");
  };

  const handleRemoveImage = (i: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const maxImagesReached = formData.images.length >= 5;

  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");
    if (!formData.category) { setError("Please select a category"); return; }
    if (!formData.servicecharges) { setError("Please enter service charges"); return; }
    if (!formData.startDate || !formData.endDate) { setError("Please select start and end dates"); return; }
    if (!formData.description.trim()) { setError("Please enter a description"); return; }
    if (!formData.area || !formData.city || !formData.state || !formData.pincode) { setError("Please fill in all location fields"); return; }
    if (!formData.latitude || !formData.longitude) { setError("Location coordinates not detected. Please check your address or use Auto Detect."); return; }
    if (!user?._id) { setError("User not logged in. Please log in first."); return; }
    try {
      setIsSubmitting(true);
      const jobData: CreateJobPayload = {
        userId: user._id,
        name: localStorage.getItem("userName") || "",
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        subcategory: formData.subcategory.trim() || undefined,
        jobType: formData.jobType,
        servicecharges: formData.servicecharges,
        startDate: formData.startDate,
        endDate: formData.endDate,
        area: formData.area.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
        latitude: formData.latitude!,
        longitude: formData.longitude!,
        images: formData.images,
      };
      const response = await createJob(jobData);
      if (response.success || response.data?._id) {
        setSuccessMessage("Job posted successfully!");
        setTimeout(() => navigate("/listed-jobs"), 1500);
      } else {
        throw new Error(response.message || "Failed to create job");
      }
    } catch (err: any) {
      console.error("Error creating job:", err);
      setError(err.response?.data?.message || err.message || "Failed to create job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => navigate(-1);

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={handleCancel} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className={`${typography.heading.h5} text-gray-900`}>Post a Job</h1>
            <p className={`${typography.body.small} text-gray-500`}>Fill in the details to create a new job listing</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

        {/* Alerts */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-red-600 mt-0.5">⚠️</span>
              <div className="flex-1">
                <p className="font-semibold text-red-800 mb-1">Please fix the following</p>
                <p className={`${typography.form.error} text-red-700`}>{error}</p>
              </div>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <span className="text-green-600 text-lg">✓</span>
            <p className={`${typography.body.small} text-green-700 font-medium`}>{successMessage}</p>
          </div>
        )}

        {/* ─── SECTION 1: Job Details ─── */}
        <SectionCard>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>Job Title</FieldLabel>
              <input
                type="text" name="title" value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. House Cleaning, Plumbing Work"
                className={inputBase}
              />
            </div>
            <div>
              <FieldLabel required>Job Type</FieldLabel>
              <div className="flex gap-3">
                {(["FULL_TIME", "PART_TIME"] as const).map(type => (
                  <button
                    key={type} type="button"
                    onClick={() => setFormData(prev => ({ ...prev, jobType: type }))}
                    className={`flex-1 py-3 rounded-xl border-2 font-semibold transition-all duration-150 ${typography.body.base} ${formData.jobType === type
                      ? "border-[#00598a] bg-[#e8f4fb] text-[#00598a]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700"
                      }`}
                  >
                    {type === "FULL_TIME" ? "Full Time" : "Part Time"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Category</FieldLabel>
              <IconSelect
                label=""
                value={formData.category}
                placeholder="Select Category"
                options={categories.map(c => ({ id: c.id, name: c.name, icon: c.icon }))}
                onChange={(val) => setFormData(prev => ({ ...prev, category: val, subcategory: "" }))}
              />
            </div>
            <div>
              <FieldLabel>Subcategory</FieldLabel>
              <IconSelect
                label=""
                value={formData.subcategory}
                placeholder={formData.category ? "Select Subcategory" : "Select category first"}
                disabled={!formData.category}
                options={filteredSubcategories.map(s => ({ name: s.name, icon: SUBCATEGORY_ICONS[s.name] }))}
                onChange={(val) => setFormData(prev => ({ ...prev, subcategory: val }))}
              />
            </div>
          </div>
        </SectionCard>

        {/* ─── SECTION 2: Pricing & Schedule ─── */}
        <SectionCard title="Pricing & Schedule">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Service Charges (₹)</FieldLabel>
              <input
                name="servicecharges" type="number" placeholder="Amount" min="0"
                value={formData.servicecharges} onChange={handleInputChange} className={inputBase}
              />
            </div>
            <div />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Start Date</FieldLabel>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className={inputBase} />
            </div>
            <div>
              <FieldLabel required>End Date</FieldLabel>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className={inputBase} />
            </div>
          </div>
          {formData.startDate && formData.endDate && (
            <div className="rounded-xl p-3" style={{ backgroundColor: '#e8f4fb', border: '1px solid #b3d5e8' }}>
              <p className={`${typography.body.small} font-medium flex items-center gap-3`} style={{ color: BRAND }}>
                <span>📅 {new Date(formData.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <span>→</span>
                <span>{new Date(formData.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </p>
            </div>
          )}
        </SectionCard>

        {/* ─── SECTION 3: Description ─── */}
        <SectionCard title="Job Description">
          <div>
            <FieldLabel required>Description</FieldLabel>
            <textarea
              name="description"
              placeholder="Describe the job in detail — include responsibilities, requirements, tools needed, or any other relevant information…"
              rows={4} value={formData.description} onChange={handleInputChange}
              className={inputBase + " resize-none"}
            />
            <p className={`${typography.misc.caption} mt-2 text-right`}>{formData.description.length} characters</p>
          </div>
        </SectionCard>

        {/* ─── SECTION 4: Location ─── */}
        <SectionCard
          title="Service Location"
          action={
            <button
              type="button" onClick={handleUseCurrentLocation} disabled={locationLoading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: BRAND }}
            >
              {locationLoading
                ? <><span className="animate-spin text-sm">⌛</span> Detecting...</>
                : <><MapPin className="w-4 h-4" /> Auto Detect</>
              }
            </button>
          }
        >
          {locationWarning && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
              <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
              <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Area / Locality</FieldLabel>
              <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g. Madhapur" className={inputBase} />
            </div>
            <div>
              <FieldLabel required>City</FieldLabel>
              <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Hyderabad" className={inputBase} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel required>State</FieldLabel>
              <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g. Telangana" className={inputBase} />
            </div>
            <div>
              <FieldLabel required>PIN Code</FieldLabel>
              <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="e.g. 500081" className={inputBase} />
            </div>
          </div>

          {/* Tip */}
          {!formData.latitude && !formData.longitude && (
            <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
              <p className={`${typography.body.small} text-amber-800`}>
                💡 <span className="font-medium">Tip:</span> Use auto-detect to fill location automatically from your device GPS.
              </p>
            </div>
          )}

          {isGeocodingLoading ? (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ backgroundColor: '#e8f4fb', border: '1px solid #b3d5e8' }}>
              <span className="animate-spin">⌛</span>
              <p className={`${typography.body.small} font-medium`} style={{ color: BRAND }}>Detecting coordinates…</p>
            </div>
          ) : formData.latitude && formData.longitude ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3">
              <p className={`${typography.body.small} text-green-800`}>
                <span className="font-semibold">✓ Location set: </span>
                <span className="font-mono text-xs ml-1">
                  {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </span>
              </p>
            </div>
          ) : null}
        </SectionCard>

        {/* ─── SECTION 5: Photos ─── */}
        <SectionCard title={`Job Photos (${formData.images.length}/5)`}>
          <label className="cursor-pointer block">
            <input type="file" accept="image/*" multiple onChange={handleFileChange} className="hidden" disabled={maxImagesReached} />
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${maxImagesReached ? "border-gray-200 bg-gray-50 cursor-not-allowed" : "hover:opacity-90 cursor-pointer"}`}
              style={!maxImagesReached ? { borderColor: BRAND, backgroundColor: '#f0f7fb' } : {}}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0eff7' }}>
                  <Upload className="w-8 h-8" style={{ color: BRAND }} />
                </div>
                <div>
                  <p className={`${typography.form.input} font-medium text-gray-700`}>
                    {maxImagesReached ? "Maximum 5 images reached" : `Tap to upload job photos`}
                  </p>
                  <p className={`${typography.body.small} text-gray-500 mt-1`}>Maximum 5 images · 5 MB each</p>
                </div>
              </div>
            </div>
          </label>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-4">
              {formData.images.map((file, i) => (
                <div key={i} className="relative aspect-square group">
                  <img
                    src={imagePreviews[i]} alt={`Preview ${i + 1}`}
                    className="w-full h-full object-cover rounded-xl border-2"
                    style={{ borderColor: BRAND }}
                  />
                  <button
                    type="button" onClick={() => handleRemoveImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                  <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* ── Action Buttons ── */}
        <div className="flex gap-4 pt-2 pb-8">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !!successMessage}
            type="button"
            className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg ${typography.body.base} ${isSubmitting || successMessage ? "opacity-70 cursor-not-allowed" : "hover:opacity-90"}`}
            style={{ backgroundColor: BRAND }}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>Posting…
              </span>
            ) : successMessage ? (
              <span className="flex items-center justify-center gap-2"><span>✓</span> Done</span>
            ) : "Post Job"}
          </button>
          <button
            onClick={handleCancel} type="button" disabled={isSubmitting}
            className={`px-8 py-3.5 rounded-xl font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all ${typography.body.base} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};

export default PostJob;