import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, X, AlertTriangle, Check, Calendar, ArrowRight, Loader2 } from "lucide-react";

import SubCategoriesData from "../data/subcategories.json";
import { createJob, CreateJobPayload } from "../services/api.service";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";
import { categories } from "../components/categories/Categories";
import typography from "../styles/typography";
import { readSavedLocation, saveLocationToStorage } from "../utils/locationUtils";
import LocationPicker from "../components/LocationPicker";
import type { LocationPickerValue } from "../types/location.types";

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
 category: string;       // stores category id for UI filtering
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
 const [imagePreviews, setImagePreviews] = useState<string[]>([]);
 const [error, setError] = useState("");
 const [successMessage, setSuccessMessage] = useState("");

 const getFilteredSubcategories = (): SubCategory[] => {
 if (!formData.category) return [];
 const group = subcategoryGroups.find(g => String(g.categoryId) === formData.category);
 return group?.items || [];
  };
 const filteredSubcategories = getFilteredSubcategories();

  // ── Helper: resolve category id → name ───────────────────────────────────
 const getCategoryName = (categoryId: string): string =>
 categories.find(c => c.id === categoryId)?.name || categoryId;

 useEffect(() => {
 const prefillDataStr = localStorage.getItem("jobPrefillData");
 let prefillData: any = null;
 if (prefillDataStr) {
 try {
 prefillData = JSON.parse(prefillDataStr);
 localStorage.removeItem("jobPrefillData");
      } catch (err) {
 console.error("Error parsing prefill data:", err);
      }
    }

    // Location chosen in LocationSelector, used as a fallback for anything the
    // handoff did not provide so the most specific area is never lost.
 const saved = readSavedLocation();

 if (!prefillData && !saved) return;

 const foundCategory = prefillData
      ? categories.find(
 cat =>
            cat.name.toLowerCase().includes(prefillData.category?.toLowerCase() || "") ||
            (prefillData.category?.toLowerCase() || "").includes(cat.name.toLowerCase())
        )
      : undefined;

 setFormData(prev => ({
      ...prev,
 category: foundCategory ? foundCategory.id : prev.category,
 subcategory: prefillData?.subcategory || prev.subcategory,
    }));

    // The address and its coordinates live in <LocationPicker />. Persist the
    // handoff through the same storage the picker seeds itself from, so the map
    // opens on the location the user already picked.
    const area = prefillData?.area || saved?.area || "";
    const city = saved?.city || "";
    const state = saved?.state || "";
    const pincode = saved?.pincode || "";
 const latitude = prefillData?.latitude ?? saved?.latitude ?? 0;
 const longitude = prefillData?.longitude ?? saved?.longitude ?? 0;
 if (area || city || state || pincode) {
 saveLocationToStorage({
 address: [area, city, state, pincode].filter(Boolean).join(", "),
 area,
 city,
 state,
 pincode,
 latitude,
 longitude,
      });
    }
    // Manual entry always wins: this only fills a completely empty form.
  }, []);

 useEffect(() => {
 if (formData.category && formData.subcategory) {
 const isValid = getFilteredSubcategories().some(sub => sub.name === formData.subcategory);
 if (!isValid) setFormData(prev => ({ ...prev, subcategory: "" }));
    }
  }, [formData.category]);

  // Location is owned by <LocationPicker />: it geocodes the typed address,
  // reverse-geocodes the map pin and keeps the two in sync, so the coordinates
  // are never stale.
 const handleLocationChange = (next: LocationPickerValue) => {
 setFormData(prev => ({
      ...prev,
 area: next.area,
 city: next.city,
 state: next.state,
 pincode: next.pincode,
 latitude: next.latitude || undefined,
 longitude: next.longitude || undefined,
    }));
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
 if (!formData.latitude || !formData.longitude) { setError("Location not set yet. Press \"Select Location on Map\" (or Auto Detect) and confirm the location on the map."); return; }
 if (!user?._id) { setError("User not logged in. Please log in first."); return; }

 try {
 setIsSubmitting(true);

      // ✅ Resolve category id → name before sending to backend
 const categoryName = getCategoryName(formData.category);

 const jobData: CreateJobPayload = {
 userId: user._id,
        name: localStorage.getItem("userName") || "",
 title: formData.title.trim(),
 description: formData.description.trim(),
 category: categoryName,          // Send "Carpenters" not "3"
 subcategory: formData.subcategory.trim() || undefined,
 jobType: formData.jobType,
 servicecharges: formData.servicecharges,
 startDate: formData.startDate,
 endDate: formData.endDate,
        phone: localStorage.getItem("userPhone") || "",
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
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-red-800 mb-1">Please fix the following</p>
                <p className={`${typography.form.error} text-red-700`}>{error}</p>
              </div>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
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
              {/* Preview resolved name so user can verify */}
              {formData.category && (
                <p className="mt-1 text-xs text-gray-400">
 Will save as: <span className="font-semibold text-gray-600">{getCategoryName(formData.category)}</span>
                </p>
              )}
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
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(formData.startDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
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
        <SectionCard title="Service Location">
          <LocationPicker
 onLocationChange={handleLocationChange}
 error={error.startsWith("Location") || error.startsWith("Please fill in all location") ? error : ""}
 useSavedLocation={false}
 title=""
          />
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
                <Loader2 className="w-4 h-4 animate-spin" />Posting…
              </span>
            ) : successMessage ? (
              <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4 shrink-0" /> Done</span>
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