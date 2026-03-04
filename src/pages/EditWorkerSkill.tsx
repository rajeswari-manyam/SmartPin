import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Buttons";
import ServiceChargesSection from "../components/WorkerProfile/ServiceCharges";
import {
  getWorkerSkillById,
  updateWorkerSkill,
  deleteWorkerSkill,
  UpdateWorkerSkillPayload,
} from "../services/api.service";
import SubCategoriesData from "../data/subcategories.json";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";
import { categories } from "../components/categories/Categories";
import {
  ArrowLeft, Trash2, Loader2, ImagePlus, X,
  Upload, CheckCircle, AlertCircle, MapPin
} from "lucide-react";
import typography from "../styles/typography";

/* ─── Types ─── */
interface SubCategory { name: string; icon: string; }
interface SubCategoryGroup { categoryId: number; items: SubCategory[]; }

const subcategoryGroups: SubCategoryGroup[] = SubCategoriesData.subcategories || [];

// ── Resolve category name (DB) → id (UI) ─────────────────────────────────────
const resolveCategoryId = (categoryValue: string): string => {
  if (!categoryValue) return "";
  const byName = categories.find(c => c.name.toLowerCase() === categoryValue.toLowerCase());
  if (byName) return byName.id;
  const byId = categories.find(c => c.id === categoryValue);
  if (byId) return byId.id;
  return "";
};

// ── Resolve category id → display name ───────────────────────────────────────
const getCategoryName = (categoryId: string): string =>
  categories.find(c => c.id === categoryId)?.name || categoryId;

/* ─── Toast ─── */
type ToastType = "success" | "error";
const Toast: React.FC<{ message: string; type: ToastType; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [onDismiss]);
  return (
    <div className={`flex items-start gap-2 p-3 rounded-xl text-sm shadow mb-4 border
      ${type === "success" ? "bg-green-50 border-green-300 text-green-800" : "bg-red-50 border-red-300 text-red-800"}`}>
      {type === "success"
        ? <CheckCircle size={16} className="flex-shrink-0 mt-0.5 text-green-600" />
        : <AlertCircle size={16} className="flex-shrink-0 mt-0.5 text-red-600" />}
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss}><X size={14} className="opacity-60" /></button>
    </div>
  );
};

/* ─── Component ─── */
const EditSkillScreen: React.FC = () => {
  const navigate = useNavigate();
  const { skillId } = useParams<{ skillId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ───────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState("");   // category id
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [skills, setSkills] = useState("");
  const [chargeType, setChargeType] = useState<"hourly" | "daily" | "fixed">("hourly");
  const [chargeAmount, setChargeAmount] = useState("");

  // ── UI state ─────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [originalSkill, setOriginalSkill] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // ── Images ───────────────────────────────────────────────────────────────
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // ── Filtered subcategories based on selected category id ─────────────────
  const getFilteredSubcategories = (): SubCategory[] => {
    if (!selectedCategory) return [];
    const group = subcategoryGroups.find(g => String(g.categoryId) === selectedCategory);
    return group?.items || [];
  };
  const filteredSubcategories = getFilteredSubcategories();

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  // ── Fetch skill data ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSkillData = async () => {
      if (!skillId) { setFetchLoading(false); return; }
      try {
        const response = await getWorkerSkillById(skillId);
        if (response.success && response.workerSkill) {
          const skill: any = response.workerSkill;
          setOriginalSkill(skill);

          // Resolve category name → id
          const catName = Array.isArray(skill.category) ? skill.category[0] : skill.category;
          const resolvedId = resolveCategoryId(catName);
          setSelectedCategory(resolvedId);
          setSelectedSubcategory(skill.subCategory || "");
          setSkills(skill.skill || "");
          setChargeAmount(String(skill.serviceCharge));
          setChargeType(skill.chargeType === "hour" ? "hourly" : skill.chargeType === "day" ? "daily" : "fixed");

          const imgs = (skill.images || []).filter((img: string) => img && img.trim() !== "");
          setExistingImages(imgs);
        }
      } catch {
        showToast("Failed to load skill data", "error");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchSkillData();
  }, [skillId]);

  // ── Clear subcategory if category changes ────────────────────────────────
  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      const isValid = getFilteredSubcategories().some(s => s.name === selectedSubcategory);
      if (!isValid) setSelectedSubcategory("");
    }
  }, [selectedCategory]);

  // ── Image helpers ─────────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const combined = [...newImages, ...files].slice(0, 5);
    setNewImages(combined);
    Promise.all(
      combined.map(f => new Promise<string>(resolve => {
        const r = new FileReader();
        r.onload = () => resolve(r.result as string);
        r.readAsDataURL(f);
      }))
    ).then(setNewPreviews);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  // ── Update ────────────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    setToast(null);
    if (!skillId) return;
    if (!selectedCategory || !selectedSubcategory || !chargeAmount) {
      showToast("Please fill all required fields.", "error");
      return;
    }

    // ✅ Resolve category id → name before sending to backend
    const categoryName = getCategoryName(selectedCategory);

    const payload: UpdateWorkerSkillPayload = {
      category: categoryName,
      subCategory: selectedSubcategory,
      skill: skills || "General",
      serviceCharge: Number(chargeAmount),
      chargeType: chargeType === "hourly" ? "hour" : chargeType === "daily" ? "day" : "fixed",
    };

    setLoading(true);
    try {
      const res = await updateWorkerSkill(skillId, payload);
      if (!res || !res.success) {
        showToast("Failed to update skill. Please try again.", "error");
        setLoading(false);
        return;
      }
      showToast("Skill updated successfully!", "success");
      setTimeout(() => navigate("/my-skills"), 800);
    } catch (error: any) {
      let msg = "Failed to update skill. Please try again.";
      if (error.message?.includes("Failed to fetch")) msg = "Unable to connect to server.";
      showToast(msg, "error");
      setLoading(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!skillId) return;
    if (!window.confirm("Delete this skill? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await deleteWorkerSkill(skillId);
      if (res.success) {
        showToast("Skill deleted!", "success");
        setTimeout(() => navigate("/my-skills"), 800);
      } else {
        showToast("Failed to delete skill", "error");
        setLoading(false);
      }
    } catch {
      showToast("Failed to delete skill. Please try again.", "error");
      setLoading(false);
    }
  };

  // ── Loading screen ────────────────────────────────────────────────────────
  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading skill data...</p>
        </div>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 sm:p-3 rounded-full hover:bg-white transition"
            disabled={loading}
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <h1 className={typography.heading.h3}>Edit Skill</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">

          {/* ── LEFT: Current skill snapshot ── */}
          {originalSkill && (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden lg:sticky lg:top-6">

              {/* Images */}
              {existingImages.length > 0 ? (
                <div>
                  <img
                    src={existingImages[0]}
                    alt="Skill"
                    className="w-full h-48 sm:h-64 object-cover"
                  />
                  {existingImages.length > 1 && (
                    <div className="grid grid-cols-4 gap-1 p-1">
                      {existingImages.slice(1, 5).map((img, i) => (
                        <div key={i} className="relative aspect-square">
                          <img src={img} alt="" className="w-full h-full object-cover rounded" />
                          {i === 3 && existingImages.length > 5 && (
                            <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                              <span className="text-white text-xs font-bold">+{existingImages.length - 5}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                  <span className="text-4xl">🔧</span>
                </div>
              )}

              {/* Details */}
              <div className="p-4 sm:p-5 space-y-3 text-sm">

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Category</p>
                  <p className="font-semibold text-gray-800">
                    {Array.isArray(originalSkill.category) ? originalSkill.category[0] : originalSkill.category}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Subcategory</p>
                  <p className="font-semibold text-gray-800">{originalSkill.subCategory}</p>
                </div>

                {originalSkill.skill && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Description</p>
                    <p className="text-gray-700 leading-relaxed break-words overflow-hidden">{originalSkill.skill}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Charge</p>
                    <p className="text-green-600 font-bold text-xl">
                      ₹{originalSkill.serviceCharge}
                      <span className="text-sm text-gray-400 font-normal ml-1">
                        / {originalSkill.chargeType === "hour" ? "hr" : originalSkill.chargeType === "day" ? "day" : "fixed"}
                      </span>
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Active</span>
                </div>

                {/* Location */}
                {(originalSkill.area || originalSkill.city) && (
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Location</p>
                    <div className="flex items-start gap-1.5 text-gray-600 text-xs">
                      <MapPin size={13} className="mt-0.5 flex-shrink-0 text-blue-500" />
                      <span>
                        {[originalSkill.area, originalSkill.city, originalSkill.state, originalSkill.pincode]
                          .filter(Boolean).join(", ")}
                      </span>
                    </div>
                    {originalSkill.latitude && originalSkill.longitude && (
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.google.com/maps/search/?api=1&query=${originalSkill.latitude},${originalSkill.longitude}`,
                            "_blank"
                          )
                        }
                        className="mt-2 w-full py-2 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-xs font-medium"
                      >
                        <MapPin size={13} /> View on Google Maps
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── RIGHT: Edit form ── */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
            <h2 className={`${typography.heading.h5} mb-4 sm:mb-6 text-gray-800`}>
              Update Skill Information
            </h2>

            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

            <div className="space-y-4 sm:space-y-5">

              {/* ── Category — IconSelect (same as UpdateJob) ── */}
              <div>
                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                  Category *
                </label>
                <IconSelect
                  label=""
                  value={selectedCategory}
                  placeholder="Select Category"
                  options={categories.map(c => ({ id: c.id, name: c.name, icon: c.icon }))}
                  onChange={(val) => setSelectedCategory(val)}
                  disabled={loading}
                />
                {selectedCategory && (
                  <p className="mt-1 text-xs text-gray-400">
                    Will save as:{" "}
                    <span className="font-semibold text-gray-600">{getCategoryName(selectedCategory)}</span>
                  </p>
                )}
              </div>

              {/* ── Subcategory — IconSelect (same as UpdateJob) ── */}
              <div>
                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                  Subcategory *
                </label>
                <IconSelect
                  label=""
                  value={selectedSubcategory}
                  placeholder={
                    selectedCategory
                      ? filteredSubcategories.length === 0
                        ? "No subcategories available"
                        : "Select Subcategory"
                      : "Select category first"
                  }
                  options={filteredSubcategories.map(s => ({
                    name: s.name,
                    icon: SUBCATEGORY_ICONS[s.name],
                  }))}
                  onChange={(val) => setSelectedSubcategory(val)}
                  disabled={loading || !selectedCategory || filteredSubcategories.length === 0}
                />
              </div>

              {/* Skills Description */}
              <div>
                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                  Skills Description
                </label>
                <textarea
                  className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none ${typography.form.input}`}
                  placeholder="e.g., Residential Cleaning, Commercial Cleaning"
                  value={skills}
                  onChange={e => setSkills(e.target.value)}
                  disabled={loading}
                  rows={3}
                />
              </div>

              {/* Service Charges */}
              <div>
                <ServiceChargesSection
                  chargeType={chargeType}
                  chargeAmount={chargeAmount}
                  onChargeTypeChange={setChargeType}
                  onChargeAmountChange={setChargeAmount}
                  onVoiceClick={() => { }}
                  isListening={false}
                />
              </div>

              {/* Portfolio Images */}
              <div>
                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                  {existingImages.length > 0 ? "Add More Images" : "Portfolio Images"}
                  <span className="text-gray-400 font-normal ml-1">(optional, up to 5)</span>
                </label>

                {newPreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {newPreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={preview}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-cover rounded-xl border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                          disabled={loading}
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                    {newImages.length < 5 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-blue-400 hover:border-blue-500 transition disabled:opacity-50"
                        disabled={loading}
                      >
                        <ImagePlus size={18} />
                        <span className="text-xs mt-1">Add</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-gray-300 rounded-xl py-5 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition disabled:opacity-50"
                    disabled={loading}
                  >
                    <Upload size={24} className="mb-1.5" />
                    <span className="text-sm font-medium">Upload Work Photos</span>
                    <span className="text-xs mt-0.5">JPG, PNG up to 5 images</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={loading}
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Button fullWidth onClick={handleUpdate} disabled={loading}>
                  <span className={typography.body.base}>
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" /> Updating...
                      </span>
                    ) : "Update Skill"}
                  </span>
                </Button>

                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition text-sm font-medium"
                >
                  <Trash2 size={15} /> Delete Skill
                </button>

                <button
                  onClick={() => navigate("/my-skills")}
                  disabled={loading}
                  className="w-full px-4 py-2.5 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition text-sm"
                >
                  Cancel
                </button>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-xs text-yellow-800">
                  <span className="font-semibold">⚠️ Note:</span> Deleting this skill permanently removes it from your profile.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditSkillScreen;