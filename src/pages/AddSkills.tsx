

import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Briefcase } from "lucide-react";
import { addWorkerSkill, AddWorkerSkillPayload, getWorkerWithSkills, getWorkerById } from "../services/api.service";
import { categories } from "../components/categories/Categories";
import SubCategoriesData from "../components/data/SubCategories.json";
import typography from "../styles/typography";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS — mirrors RN Colors
// ─────────────────────────────────────────────────────────────────────────────
const BRAND       = "#00598a";
const BRAND_LIGHT = "#e8f4fb";

// ─────────────────────────────────────────────────────────────────────────────
// SCREEN STATE — mirrors RN screenState union
// ─────────────────────────────────────────────────────────────────────────────
type ScreenState = "idle" | "submitting" | "success" | "error";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface SubCategoryGroup {
  categoryId: number;
  items: { name: string }[];
}

const subcategoryGroups: SubCategoryGroup[] =
  (SubCategoriesData as any).subcategories || [];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED LAYOUT — mirrors RN section <View> wrappers
// ─────────────────────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}
  >
    {children}
  </div>
);

const CardTitle: React.FC<{
  title: string;
  action?: React.ReactNode;
}> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4">
    <h3 className={`${typography.heading.h6} text-gray-900`}>{title}</h3>
    {action}
  </div>
);

const FieldLabel: React.FC<{
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}> = ({ children, required, optional }) => (
  <label
    className={`block ${typography.form.label} font-semibold text-gray-700 mb-2`}
  >
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
    {optional && (
      <span
        className={`${typography.misc.caption} font-normal text-gray-400 ml-1`}
      >
        (Optional)
      </span>
    )}
  </label>
);

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
);

const inputCls =
  "w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 " +
  "placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] " +
  "focus:ring-1 focus:ring-[#00598a] transition-all";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AddSkillsScreen: React.FC = () => {
  const navigate     = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──────────────────────────────────────────────────────────────
  const [selectedCategory,    setSelectedCategory]    = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [skillDescription,    setSkillDescription]    = useState("");
  const [chargeType,          setChargeType]          = useState<"hour" | "day">("hour");
  const [chargeAmount,        setChargeAmount]        = useState("");
  const [images,              setImages]              = useState<File[]>([]);
  const [imagePreviews,       setImagePreviews]       = useState<string[]>([]);

  // ── Screen state machine ─────────────────────────────────────────────────────
  const [screenState,    setScreenState]    = useState<ScreenState>("idle");
  const [error,          setError]          = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ── Init: resolve workerId from API if localStorage cache is missing ─────────
  // This is the KEY fix: after logout+login, userId is in localStorage but
  // workerId is gone. We look it up via getWorkerById(userId) so the worker
  // never has to create their profile again.
  const [resolving,        setResolving]        = useState(true);
  const [resolvedWorkerId, setResolvedWorkerId] = useState<string | null>(null);

  useEffect(() => {
    const resolveWorker = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        navigate("/loginPage", { replace: true });
        return;
      }

      // Check all cached keys — including the userId-keyed permanent key
      // that survives logout/login cycles
      const cached =
        localStorage.getItem("workerId") ||
        localStorage.getItem("@worker_id") ||
        localStorage.getItem(`worker_id_for_${userId}`);

      if (cached) {
        // Validate the cached ID is still live on the server
        try {
          await getWorkerWithSkills(cached);
          // Valid — sync all cache keys and show the form
          localStorage.setItem("workerId",                cached);
          localStorage.setItem("@worker_id",              cached);
          localStorage.setItem(`worker_id_for_${userId}`, cached);
          setResolvedWorkerId(cached);
          setResolving(false);
          return;
        } catch {
          // Stale/invalid — clear all cache keys
          localStorage.removeItem("workerId");
          localStorage.removeItem("@worker_id");
          localStorage.removeItem(`worker_id_for_${userId}`);
        }
      }

      // No valid workerId found → worker has never created a profile
      // Send to WorkerProfile which handles creation and caches the new ID
      navigate("/worker-profile", { replace: true });
      setResolving(false);
    };

    resolveWorker();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived booleans
  const loading = screenState === "submitting";

  // ── Derived subcategories ─────────────────────────────────────────────────
  const filteredSubcategories = selectedCategory
    ? subcategoryGroups.find(
        (g) => String(g.categoryId) === selectedCategory
      )?.items || []
    : [];

  // ── Image helpers — mirrors RN image selection handlers ───────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const slots = 5 - images.length;
    if (slots <= 0) {
      setError("Maximum 5 images allowed");
      return;
    }
    const valid = files.slice(0, slots).filter((f) => {
      if (!f.type.startsWith("image/")) {
        setError(`${f.name} is not a valid image`);
        return false;
      }
      if (f.size > 5 * 1024 * 1024) {
        setError(`${f.name} exceeds 5 MB`);
        return false;
      }
      return true;
    });
    if (!valid.length) return;
    const previews: string[] = [];
    valid.forEach((f) => {
      const r = new FileReader();
      r.onloadend = () => {
        previews.push(r.result as string);
        if (previews.length === valid.length)
          setImagePreviews((p) => [...p, ...previews]);
      };
      r.readAsDataURL(f);
    });
    setImages((p) => [...p, ...valid]);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev)        => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Submit — mirrors RN handleSubmit with same guard + error classification ─
  const handleSubmit = async () => {
    setError("");
    setSuccessMessage("");

    // Use the resolved workerId (set on mount from API if localStorage was empty)
    const workerId = resolvedWorkerId;
    if (!workerId) {
      // Still no workerId → worker has never created a profile
      navigate("/worker-profile", { replace: true });
      return;
    }

    if (!selectedCategory || !chargeAmount) {
      setError("Please fill all required fields.");
      return;
    }

    const categoryName =
      categories.find((c) => c.id === selectedCategory)?.name ||
      selectedCategory;

    const payload: AddWorkerSkillPayload = {
      workerId,
      category:      categoryName,
      subCategory:   selectedSubcategory || "General",
      skill:         skillDescription    || "General",
      serviceCharge: Number(chargeAmount),
      chargeType,
      images:        images.length > 0 ? images : undefined,
    };

    setScreenState("submitting");
    try {
      const res = await addWorkerSkill(payload);
      if (!res?.success) {
        setError(res?.message || "Failed to add skill.");
        setScreenState("error");
        return;
      }

      // Mirrors RN: AsyncStorage.setItem('workerSkillId', ...)
      localStorage.setItem("workerSkillId", res.skill._id);

      setSuccessMessage("Skill added successfully!");
      setScreenState("success");
  setTimeout(() => navigate("/my-skills"), 1500);
    } catch (err: any) {
      // Mirrors RN error classification block
      let msg = "Failed to add skill. Please try again.";
      if (
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("ERR_CONNECTION_REFUSED")
      ) {
        msg = "Unable to connect to server.";
      } else if (err.message?.includes("409")) {
        msg = "This skill is already added.";
      } else if (err.response) {
        msg = err.response.data?.message || msg;
      }
      setError(msg);
      setScreenState("error");
    }
  };

  const maxImagesReached = images.length >= 5;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  // Show spinner while resolving workerId from API (post-login, no cache)
  if (resolving) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
        <div
          className="w-12 h-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }}
        />
        <p className="text-sm text-gray-500 font-medium">Loading your profile…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky Header — mirrors RN sticky header pattern ── */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            disabled={loading}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition disabled:opacity-50"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex-1">
            <h1 className={`${typography.heading.h5} text-gray-900`}>
              Add a Skill
            </h1>
            <p className={`${typography.body.small} text-gray-500`}>
              Fill in the details to publish your skill listing
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6 space-y-4">

        {/* ── Alert banners — mirrors RN error / success state blocks ── */}
        {error && (
          <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
            <span className="text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
            <div>
              <p className="font-semibold text-red-800 mb-0.5">Error</p>
              <p className={`${typography.form.error} text-red-700`}>{error}</p>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <span className="text-green-600">✓</span>
            <p className={`${typography.body.small} text-green-700`}>
              {successMessage}
            </p>
          </div>
        )}

        {/* ─── ROW 1: Category + Subcategory ─── */}
        <Card>
          <TwoCol>
            <div>
              <FieldLabel required>Category</FieldLabel>
              <IconSelect
                label=""
                value={selectedCategory}
                placeholder="Select category"
                options={categories.map((c) => ({
                  name: c.name,
                  icon: SUBCATEGORY_ICONS[c.name],
                  id:   c.id,
                }))}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setSelectedSubcategory("");
                }}
                disabled={loading}
              />
            </div>
            <div>
              <FieldLabel optional>Subcategory</FieldLabel>
              <IconSelect
                label=""
                value={selectedSubcategory}
                placeholder={
                  filteredSubcategories.length === 0
                    ? "Select category first"
                    : "Select subcategory"
                }
                options={filteredSubcategories.map((s) => ({
                  name: s.name,
                  icon: SUBCATEGORY_ICONS[s.name],
                }))}
                onChange={setSelectedSubcategory}
                disabled={loading || filteredSubcategories.length === 0}
              />
            </div>
          </TwoCol>
        </Card>

        {/* ─── ROW 2: Pricing ─── */}
        <Card>
          <CardTitle title="Pricing" />
          <TwoCol>
            <div>
              <FieldLabel required>Charge Type</FieldLabel>
              <div className="grid grid-cols-2 border border-gray-200 rounded-xl overflow-hidden">
                {(["hour", "day"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setChargeType(type)}
                    disabled={loading}
                    className={`py-3.5 font-semibold text-sm transition-colors ${
                      chargeType === type
                        ? "text-white"
                        : "bg-white text-gray-500 hover:bg-gray-50"
                    }`}
                    style={
                      chargeType === type
                        ? { backgroundColor: BRAND }
                        : {}
                    }
                  >
                    Per {type === "hour" ? "Hour" : "Day"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <FieldLabel required>Service Charges (₹)</FieldLabel>
              <div className="relative">
                <div
                  className="absolute left-0 top-0 bottom-0 w-12 flex items-center justify-center rounded-l-xl border-r border-gray-200"
                  style={{ backgroundColor: BRAND_LIGHT }}
                >
                  <span className="font-bold text-sm" style={{ color: BRAND }}>
                    ₹
                  </span>
                </div>
                <input
                  type="number"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  placeholder="Amount"
                  disabled={loading}
                  className={
                    inputCls +
                    " pl-14 disabled:bg-gray-50 disabled:cursor-not-allowed"
                  }
                />
              </div>
              {chargeAmount && Number(chargeAmount) > 0 && (
                <p
                  className={`${typography.misc.caption} mt-1.5 font-medium`}
                  style={{ color: BRAND }}
                >
                  ₹{chargeAmount}/{chargeType === "hour" ? "hr" : "day"}
                  {chargeType === "hour"
                    ? ` · ₹${(
                        Number(chargeAmount) * 8
                      ).toLocaleString()} for 8 hrs`
                    : ""}
                </p>
              )}
            </div>
          </TwoCol>
        </Card>

        {/* ─── ROW 3: Skill Description ─── */}
        <Card>
          <CardTitle title="Skill Description" />
          <div>
            <FieldLabel optional>Describe your expertise</FieldLabel>
            <div className="relative">
              <textarea
                className={
                  inputCls +
                  " resize-none min-h-[120px] pb-8 disabled:bg-gray-50 disabled:cursor-not-allowed"
                }
                placeholder="e.g. Experienced in residential and commercial electrical work, wiring, panel upgrades, and troubleshooting..."
                value={skillDescription}
                onChange={(e) => {
                  if (e.target.value.length <= 500)
                    setSkillDescription(e.target.value);
                }}
                disabled={loading}
              />
              {/* Character progress bar */}
              <div className="absolute bottom-3 left-4 right-4 flex items-center gap-2">
                <div className="h-1 flex-1 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(skillDescription.length / 500) * 100}%`,
                      backgroundColor:
                        skillDescription.length > 400 ? "#f59e0b" : BRAND,
                    }}
                  />
                </div>
                <span
                  className={`${typography.misc.caption} flex-shrink-0 text-gray-400`}
                >
                  {skillDescription.length}/500
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* ─── ROW 4: Photos ─── */}
        <Card>
          <CardTitle title={`Skill Images (${images.length}/5)`} />
          <TwoCol>
            {/* Upload zone */}
            <label
              className={`block ${
                maxImagesReached ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={maxImagesReached || loading}
              />
              <div
                className="border-2 border-dashed rounded-2xl p-10 text-center h-full flex items-center justify-center transition-colors"
                style={{
                  borderColor:     maxImagesReached ? "#d1d5db" : "#7ab3cc",
                  backgroundColor: maxImagesReached
                    ? "#f9fafb"
                    : "rgba(0,89,138,0.04)",
                  minHeight: "180px",
                }}
              >
                <div className="flex flex-col items-center gap-3">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "rgba(0,89,138,0.1)" }}
                  >
                    <Upload className="w-8 h-8" style={{ color: BRAND }} />
                  </div>
                  <div>
                    <p
                      className={`${typography.form.label} text-gray-700 font-medium`}
                    >
                      {maxImagesReached
                        ? "Maximum limit reached"
                        : `Add Photos (${5 - images.length} slots left)`}
                    </p>
                    <p
                      className={`${typography.body.xs} text-gray-400 mt-1`}
                    >
                      Maximum 5 images · 5 MB each
                    </p>
                  </div>
                </div>
              </div>
            </label>

            {/* Previews / empty state */}
            {imagePreviews.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square group">
                    <img
                      src={src}
                      alt={`Preview ${i + 1}`}
                      className="w-full h-full object-cover rounded-xl border-2"
                      style={{ borderColor: BRAND }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      disabled={loading}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <span
                      className="absolute bottom-1.5 left-1.5 text-white text-xs px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: BRAND }}
                    >
                      New
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl"
                style={{ minHeight: "180px" }}
              >
                <p className={`${typography.body.small} text-gray-400`}>
                  Uploaded images will appear here
                </p>
              </div>
            )}
          </TwoCol>
        </Card>

        {/* ── Action Buttons — mirrors RN <Pressable> action buttons ── */}
        <div className="flex gap-4 pt-2 pb-8 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className={`px-10 py-3.5 rounded-xl font-semibold
              text-[#00598a] bg-white border-2 border-[#00598a]
              hover:bg-[#00598a] hover:text-white
              active:bg-[#004a73] active:text-white
              transition-all ${typography.body.base}
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`px-10 py-3.5 rounded-xl font-semibold text-white
              transition-all shadow-md hover:shadow-lg
              bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
              ${typography.body.base}
              ${loading ? "cursor-not-allowed opacity-70" : ""}`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Publishing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Briefcase className="w-5 h-5" />
                Add Skill
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSkillsScreen;