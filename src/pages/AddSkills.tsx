import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, X, Briefcase } from "lucide-react";
import { addWorkerSkill, AddWorkerSkillPayload } from "../services/api.service";
import { categories } from "../components/categories/Categories";
import SubCategoriesData from "../components/data/SubCategories.json";
import typography from "../styles/typography";

const BRAND = "#00598a";
const BRAND_LIGHT = "#e8f4fb";

interface SubCategoryGroup {
  categoryId: number;
  items: { name: string }[];
}

const subcategoryGroups: SubCategoryGroup[] =
  SubCategoriesData.subcategories || [];

const Label: React.FC<{ text: string; required?: boolean; optional?: boolean }> = ({
  text, required, optional,
}) => (
  <label className={`block ${typography.form.label} text-gray-700 mb-1.5`}>
    {text}
    {required && <span className="text-red-500 ml-0.5">*</span>}
    {optional && (
      <span className={`${typography.misc.caption} font-normal text-gray-400 ml-1`}>(Optional)</span>
    )}
  </label>
);

const StyledSelect: React.FC<{
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder: string;
  children: React.ReactNode;
}> = ({ value, onChange, disabled, placeholder, children }) => (
  <div className="relative">
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`
        w-full px-3.5 py-3 border rounded-xl appearance-none bg-white
        ${typography.form.input} text-gray-800 outline-none transition-all
        border-gray-200 focus:border-[#00598a] focus:ring-1 focus:ring-[#00598a]/20
        disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400
      `}
    >
      <option value="">{placeholder}</option>
      {children}
    </select>
    <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  </div>
);

const SectionHeading: React.FC<{ title: string }> = ({ title }) => (
  <h2 className={`${typography.heading.h6} text-gray-800`}>{title}</h2>
);

const Divider = () => <div className="border-t border-gray-100" />;

const AddSkillsScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [skillDescription, setSkillDescription] = useState("");
  const [chargeType, setChargeType] = useState<"hour" | "day">("hour");
  const [chargeAmount, setChargeAmount] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredSubcategories = selectedCategory
    ? subcategoryGroups.find((g) => String(g.categoryId) === selectedCategory)?.items || []
    : [];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const combined = [...images, ...files].slice(0, 5);
    setImages(combined);
    const previews: string[] = [];
    combined.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        previews.push(reader.result as string);
        if (previews.length === combined.length) setImagePreviews([...previews]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    const workerId = localStorage.getItem("workerId") || localStorage.getItem("@worker_id");
    if (!workerId) { alert("Worker profile not found. Please create your profile first."); navigate("/worker-profile"); return; }
    if (!selectedCategory || !chargeAmount) { alert("Please fill all required fields"); return; }
    const categoryName = categories.find((c) => c.id === selectedCategory)?.name || selectedCategory;
    const payload: AddWorkerSkillPayload = {
      workerId, category: categoryName,
      subCategory: selectedSubcategory || "General",
      skill: skillDescription || "General",
      serviceCharge: Number(chargeAmount), chargeType,
      images: images.length > 0 ? images : undefined,
    };
    setLoading(true);
    try {
      const res = await addWorkerSkill(payload);
      if (!res?.success) { setError(res?.message || "Failed to add skill."); return; }
      localStorage.setItem("workerSkillId", res.skill._id);
      navigate("/home");
    } catch (err: any) {
      let msg = "Failed to add skill. Please try again.";
      if (err.message?.includes("Failed to fetch") || err.message?.includes("ERR_CONNECTION_REFUSED")) msg = "Unable to connect to server.";
      else if (err.message?.includes("409")) msg = "This skill is already added.";
      else if (err.response) msg = err.response.data?.message || msg;
      setError(msg);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f5f7fa" }}>

      {/* Page header */}
      <div className="bg-white px-6 py-5" style={{ borderBottom: "1px solid #e9ecef" }}>
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} disabled={loading} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <h1 className={`${typography.heading.h4} text-gray-900 leading-tight`}>Add a Skill</h1>
            <p className={`${typography.misc.caption} text-gray-500`}>Fill in the details to publish your skill listing</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 pb-16 space-y-4">

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2">
            <X size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className={`${typography.form.error}`}>{error}</p>
          </div>
        )}

        {/* White card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-7 py-6 space-y-6">

          {/* ROW 1 — Category | Subcategory */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <Label text="Category" required />
              <StyledSelect
                value={selectedCategory}
                onChange={(v) => { setSelectedCategory(v); setSelectedSubcategory(""); }}
                disabled={loading}
                placeholder="Select Category"
              >
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </StyledSelect>
            </div>
            <div>
              <Label text="Subcategory" optional />
              <StyledSelect
                value={selectedSubcategory}
                onChange={setSelectedSubcategory}
                disabled={loading || filteredSubcategories.length === 0}
                placeholder={filteredSubcategories.length === 0 ? "Select category first" : "Select subcategory"}
              >
                {filteredSubcategories.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
              </StyledSelect>
            </div>
          </div>

          <Divider />

          {/* Pricing section */}
          <div className="space-y-4">
    

            {/* ROW 2 — Charge Type | Amount */}
            <div className="grid grid-cols-2 gap-5">
              <div>
                <Label text="Charge Type" required />
                <div className="grid grid-cols-2 border border-gray-200 rounded-xl overflow-hidden">
                  {(["hour", "day"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setChargeType(type)}
                      disabled={loading}
                      className={`py-3 ${typography.form.label} transition-colors ${chargeType === type ? "text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                      style={chargeType === type ? { backgroundColor: BRAND } : {}}
                    >
                      Per {type === "hour" ? "Hour" : "Day"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label text="Service Charges (₹)" required />
                <div className="relative">
                  <div
                    className="absolute left-0 top-0 bottom-0 w-11 flex items-center justify-center rounded-l-xl border-r border-gray-200"
                    style={{ backgroundColor: BRAND_LIGHT }}
                  >
                    <span className="font-semibold text-sm" style={{ color: BRAND }}>₹</span>
                  </div>
                  <input
                    type="number"
                    value={chargeAmount}
                    onChange={(e) => setChargeAmount(e.target.value)}
                    placeholder="Amount"
                    disabled={loading}
                    className={`w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none ${typography.form.input} text-gray-800 bg-white transition-all focus:border-[#00598a] focus:ring-1 focus:ring-[#00598a]/20 disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  />
                </div>
                {chargeAmount && Number(chargeAmount) > 0 && (
                  <p className={`${typography.misc.caption} mt-1.5`} style={{ color: BRAND }}>
                    ₹{chargeAmount}/{chargeType === "hour" ? "hr" : "day"}
                    {chargeType === "hour" ? ` · ₹${(Number(chargeAmount) * 8).toLocaleString()} for 8 hrs` : ""}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Divider />

          {/* Skill Description */}
          <div className="space-y-4">
            <SectionHeading title="Skill Description" />
            <div>
              <Label text="Describe your expertise" optional />
              <div className="relative">
                <textarea
                  className={`w-full px-3.5 py-3 border border-gray-200 rounded-xl resize-none min-h-[110px] pb-8 ${typography.form.input} text-gray-800 bg-white outline-none transition-all focus:border-[#00598a] focus:ring-1 focus:ring-[#00598a]/20 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed`}
                  placeholder="e.g. Experienced in residential and commercial electrical work, wiring, panel upgrades, and troubleshooting..."
                  value={skillDescription}
                  onChange={(e) => { if (e.target.value.length <= 500) setSkillDescription(e.target.value); }}
                  disabled={loading}
                />
                <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center gap-2">
                  <div className="h-1 flex-1 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${(skillDescription.length / 500) * 100}%`, backgroundColor: skillDescription.length > 400 ? "#f59e0b" : BRAND }}
                    />
                  </div>
                  <span className={`${typography.misc.caption} flex-shrink-0`}>{skillDescription.length}/500</span>
                </div>
              </div>
            </div>
          </div>

          <Divider />

          {/* Portfolio Photos */}
          <div className="space-y-4">
            <SectionHeading title="Upload Skill Images" />
            <div>
            
              {imagePreviews.length > 0 ? (
                <div className="flex items-center gap-3 flex-wrap">
                  {imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative group w-20 h-20">
                      <img src={preview} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover rounded-xl border border-gray-200" />
                      <button type="button" onClick={() => removeImage(idx)} disabled={loading}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <X size={9} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}
                      className="w-20 h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 hover:bg-blue-50 transition-colors"
                      style={{ borderColor: BRAND + "55" }}>
                      <Upload size={16} style={{ color: BRAND }} />
                      <span className="text-[10px] font-semibold" style={{ color: BRAND }}>Add</span>
                    </button>
                  )}
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={loading}
                  className="w-full border-2 border-dashed rounded-xl py-5 flex items-center justify-center gap-3 hover:bg-blue-50/40 transition-colors"
                  style={{ borderColor: BRAND + "44" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: BRAND_LIGHT }}>
                    <Upload size={17} style={{ color: BRAND }} />
                  </div>
                  <div className="text-left">
                    <p className={`${typography.body.small} font-semibold`} style={{ color: BRAND }}>Upload Photos</p>
                    <p className={`${typography.misc.caption}`}>PNG, JPG · max 5 photos</p>
                  </div>
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} disabled={loading} />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          type="button"
          className={`w-full py-3.5 rounded-xl text-white font-semibold transition-all active:scale-[0.99] disabled:opacity-70 ${typography.form.label}`}
          style={{ backgroundColor: BRAND, boxShadow: loading ? "none" : `0 2px 12px ${BRAND}44` }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block" />
              Publishing...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Briefcase size={16} />
              Add  Skill
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default AddSkillsScreen;