import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Buttons";
import CategorySelector from "../components/WorkerProfile/CategorySelector";
import ServiceChargesSection from "../components/WorkerProfile/ServiceCharges";
import {
  getWorkerSkillById,
  updateWorkerSkill,
  deleteWorkerSkill,
  UpdateWorkerSkillPayload,
} from "../services/api.service";
import CategoriesData from "../components/data/Categories.json";
import SubCategoriesData from "../components/data/SubCategories.json";
import {
  ArrowLeft, Trash2, Loader2, ImagePlus, X,
  Upload, CheckCircle, AlertCircle, MapPin
} from "lucide-react";

// ✅ Inline toast
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

const EditSkillScreen: React.FC = () => {
  const navigate = useNavigate();
  const { skillId } = useParams<{ skillId: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [skills, setSkills] = useState("");
  const [chargeType, setChargeType] = useState<"hourly" | "daily" | "fixed">("hourly");
  const [chargeAmount, setChargeAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [originalSkill, setOriginalSkill] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  // ✅ New image uploads
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  // ✅ Existing images from server (for display)
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const categories = CategoriesData.categories;
  const subcategories = SubCategoriesData.subcategories;
  const availableSubcategories = selectedCategory
    ? subcategories.find(s => s.categoryId === selectedCategory)?.items || []
    : [];

  const showToast = (message: string, type: ToastType) => setToast({ message, type });

  useEffect(() => {
    const fetchSkillData = async () => {
      if (!skillId) { setFetchLoading(false); return; }
      try {
        const response = await getWorkerSkillById(skillId);
        if (response.success && response.workerSkill) {
          const skill: any = response.workerSkill;
          setOriginalSkill(skill);

          const category = categories.find(c => c.name === skill.category[0]);
          if (category) setSelectedCategory(category.id);
          setSelectedSubcategory(skill.subCategory);
          setSkills(skill.skill || "");
          setChargeAmount(String(skill.serviceCharge));
          setChargeType(skill.chargeType === "hour" ? "hourly" : skill.chargeType === "day" ? "daily" : "fixed");

          // ✅ Load existing images
          const imgs = (skill.images || []).filter((img: string) => img && img.trim() !== "");
          setExistingImages(imgs);
        }
      } catch (err: any) {
        showToast("Failed to load skill data", "error");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchSkillData();
  }, [skillId]);

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

  const handleUpdate = async () => {
    setToast(null);
    if (!skillId) return;
    if (!selectedCategory || !selectedSubcategory || !chargeAmount) {
      showToast("Please fill all required fields.", "error");
      return;
    }

    const categoryName = categories.find(c => c.id === selectedCategory)?.name || "";
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
      setTimeout(() => navigate("/home"), 800);
    } catch (error: any) {
      let msg = "Failed to update skill. Please try again.";
      if (error.message?.includes("Failed to fetch")) msg = "Unable to connect to server.";
      showToast(msg, "error");
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!skillId) return;
    if (!window.confirm("Delete this skill? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await deleteWorkerSkill(skillId);
      if (res.success) {
        showToast("Skill deleted!", "success");
        setTimeout(() => navigate("/home"), 800);
      } else {
        showToast("Failed to delete skill", "error");
        setLoading(false);
      }
    } catch {
      showToast("Failed to delete skill. Please try again.", "error");
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading skill data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 md:py-6 px-3 md:px-6">
      <div className="max-w-2xl mx-auto lg:max-w-5xl">

        {/* Header */}
        <div className="flex items-center mb-4 md:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white transition-colors"
            disabled={loading}
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg md:text-2xl font-bold ml-3 text-gray-800">Edit Skill</h1>
        </div>

        {/* Mobile: stacked | Desktop: side-by-side */}
        <div className="flex flex-col lg:flex-row gap-4 md:gap-6">

          {/* ── LEFT: Current skill snapshot ── */}
          {originalSkill && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden lg:w-80 lg:flex-shrink-0 self-start">
              {/* ✅ Existing images gallery */}
              {existingImages.length > 0 ? (
                <div>
                  <img
                    src={existingImages[0]}
                    alt="Skill"
                    className="w-full h-44 md:h-52 object-cover"
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

              <div className="p-4 md:p-5 space-y-3">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Category</p>
                  <p className="font-semibold text-gray-800">{originalSkill.category[0]}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Subcategory</p>
                  <p className="font-semibold text-gray-800">{originalSkill.subCategory}</p>
                </div>
                {originalSkill.skill && (
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Skill</p>
                    <p className="text-gray-700 text-sm">{originalSkill.skill}</p>
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
                    <div className="flex items-start gap-1.5 text-gray-500 text-xs">
                      <MapPin size={12} className="mt-0.5 flex-shrink-0" />
                      <span>{[originalSkill.area, originalSkill.city, originalSkill.state, originalSkill.pincode].filter(Boolean).join(", ")}</span>
                    </div>
                    {originalSkill.latitude && originalSkill.longitude && (
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${originalSkill.latitude},${originalSkill.longitude}`, "_blank")}
                        className="mt-2 w-full py-1.5 border border-blue-300 text-blue-600 rounded-lg text-xs hover:bg-blue-50 transition-colors"
                      >
                        📍 Open in Maps
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── RIGHT: Edit form ── */}
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-4 md:p-6">
            <h2 className="text-base md:text-lg font-bold mb-4 text-gray-800">Update Skill Information</h2>

            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}

            <CategorySelector
              categories={categories}
              subcategories={availableSubcategories}
              selectedCategory={selectedCategory}
              selectedSubcategory={selectedSubcategory}
              onCategoryChange={e => setSelectedCategory(Number(e.target.value))}
              onSubcategoryChange={setSelectedSubcategory}
            />

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Skills Description</label>
              <textarea
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-50 resize-none"
                placeholder="e.g., Residential Cleaning, Commercial Cleaning"
                value={skills}
                onChange={e => setSkills(e.target.value)}
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="mt-4">
              <ServiceChargesSection
                chargeType={chargeType}
                chargeAmount={chargeAmount}
                onChargeTypeChange={setChargeType}
                onChargeAmountChange={setChargeAmount}
                onVoiceClick={() => { }}
                isListening={false}
              />
            </div>

            {/* ✅ Add new portfolio images */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {existingImages.length > 0 ? "Add More Images" : "Portfolio Images"}
                <span className="text-gray-400 font-normal ml-1">(optional, up to 5)</span>
              </label>

              {newPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {newPreviews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img src={preview} alt={`New ${index + 1}`} className="w-full h-full object-cover rounded-xl border border-gray-200" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
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
                      className="aspect-square border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-blue-400 hover:border-blue-500 transition-colors disabled:opacity-50"
                      disabled={loading}
                    >
                      <ImagePlus size={18} />
                      <span className="text-xs mt-1">Add</span>
                    </button>
                  )}
                </div>
              )}

              {newPreviews.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl py-5 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
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

            {/* Buttons */}
            <div className="space-y-2.5 mt-6">
              <Button fullWidth onClick={handleUpdate} disabled={loading}>
                <span className="text-sm md:text-base">{loading ? "Updating..." : "Update Skill"}</span>
              </Button>

              <button
                onClick={handleDelete}
                disabled={loading}
                className="w-full px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors text-sm font-medium"
              >
                <Trash2 size={15} /> Delete Skill
              </button>

              <button
                onClick={() => navigate("/home")}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors text-sm"
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">⚠️ Note:</span> Deleting this skill permanently removes it from your profile.
              </p>
            </div>
          </div>
        </div>

        <div className="h-4 md:h-0" />
      </div>
    </div>
  );
};

export default EditSkillScreen;
