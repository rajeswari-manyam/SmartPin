import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, X, Upload } from "lucide-react";
import Button from "../components/ui/Buttons";
import ServiceChargesSection from "../components/WorkerProfile/ServiceCharges";
import { addWorkerSkill, AddWorkerSkillPayload } from "../services/api.service";
import { categories } from "../components/categories/Categories";
import SubCategoriesData from "../components/data/SubCategories.json";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";
import typography from "../styles/typography";

interface SubCategoryGroup {
  categoryId: number;
  items: { name: string }[];
}

const subcategoryGroups: SubCategoryGroup[] = SubCategoriesData.subcategories || [];

const LANGUAGES = ["English", "Hindi", "Telugu", "Tamil", "Kannada", "Malayalam", "Marathi", "Bengali", "Gujarati", "Punjabi", "Urdu", "Odia"];

const AddSkillsScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [skills, setSkills] = useState("");
  const [chargeType, setChargeType] = useState<"hourly" | "daily" | "fixed">("hourly");
  const [chargeAmount, setChargeAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Extra fields (UI only)
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [location, setLocation] = useState("");
  const [language, setLanguage] = useState("");

  const filteredSubcategories = selectedCategory
    ? (subcategoryGroups.find(g => String(g.categoryId) === selectedCategory)?.items || [])
    : [];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const combined = [...images, ...files].slice(0, 5);
    setImages(combined);
    const newPreviews: string[] = [];
    combined.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === combined.length) setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");
    const workerId = localStorage.getItem("workerId") || localStorage.getItem("@worker_id");

    if (!workerId) {
      alert("Worker profile not found. Please create your profile first.");
      navigate("/worker-profile");
      return;
    }

    if (!selectedCategory || !selectedSubcategory || !chargeAmount) {
      alert("Please fill all required fields");
      return;
    }

    const categoryName = categories.find(c => c.id === selectedCategory)?.name || "";

    const payload: AddWorkerSkillPayload = {
      workerId,
      category: categoryName,
      subCategory: selectedSubcategory,
      skill: skills || "General",
      serviceCharge: Number(chargeAmount),
      chargeType: chargeType === "hourly" ? "hour" : chargeType === "daily" ? "day" : "fixed",
      images: images.length > 0 ? images : undefined,
    };

    setLoading(true);
    try {
      const res = await addWorkerSkill(payload);
      if (!res || !res.success) {
        const msg = res?.message || "Failed to add skill. Please try again.";
        setError(msg);
        alert(msg);
        return;
      }
      localStorage.setItem("workerSkillId", res.skill._id);
      alert("Skill added successfully!");
      navigate("/home");
    } catch (error: any) {
      let msg = "Failed to add skill. Please try again.";
      if (error.message?.includes("Failed to fetch") || error.message?.includes("ERR_CONNECTION_REFUSED")) {
        msg = "Unable to connect to server. Please check if the backend is running.";
      } else if (error.message?.includes("409")) {
        msg = "This skill is already added for your profile.";
      } else if (error.response) {
        msg = error.response.data?.message || msg;
      }
      setError(msg);
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 ${typography.form.input}`;
  const labelClass = `block ${typography.form.label} text-gray-700 mb-1.5`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 md:py-8 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center mb-4 md:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white transition-colors"
            disabled={loading}
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <h2 className={`${typography.heading.h5} text-gray-800 ml-3 md:ml-4`}>
            Add Skills & Charges
          </h2>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-6 md:p-8 space-y-5">

          {/* Error */}
          {error && (
            <div className={`p-3 bg-red-100 border border-red-400 rounded-lg ${typography.form.error}`}>
              {error}
            </div>
          )}

          {/* Row 1: Category + Subcategory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Category <span className="text-red-500">*</span>
              </label>
              <IconSelect
                label="Category"
                value={selectedCategory}
                placeholder="Select category"
                options={categories.map(c => ({ id: c.id, name: c.name, icon: c.icon }))}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setSelectedSubcategory("");
                }}
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClass}>
                Subcategory <span className="text-red-500">*</span>
              </label>
              <IconSelect
                label="Subcategory"
                value={selectedSubcategory}
                placeholder={selectedCategory ? "Select subcategory" : "Select category first"}
                disabled={!selectedCategory || loading}
                options={filteredSubcategories.map(s => ({
                  name: s.name,
                  icon: SUBCATEGORY_ICONS[s.name],
                }))}
                onChange={setSelectedSubcategory}
              />
            </div>
          </div>

          {/* Row 2: Skills Description + Location */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Skills Description</label>
              <input
                className={inputClass}
                placeholder="e.g., Residential Cleaning"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClass}>Location / Area</label>
              <input
                className={inputClass}
                placeholder="e.g., Hyderabad, Madhapur"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {/* Row 3: Experience + Language + Availability (3 columns) */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Years of Experience</label>
              <input
                type="number"
                min="0"
                max="50"
                className={inputClass}
                placeholder="e.g., 3"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClass}>Language Spoken</label>
              <select
                className={inputClass}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={loading}
              >
                <option value="">Select language</option>
                {LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Availability</label>
              <select
                className={inputClass}
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                disabled={loading}
              >
                <option value="">Select availability</option>
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Weekends Only">Weekends Only</option>
                <option value="Flexible">Flexible</option>
                <option value="On Call">On Call</option>
              </select>
            </div>
          </div>

          {/* Service Charges */}
          <ServiceChargesSection
            chargeType={chargeType}
            chargeAmount={chargeAmount}
            onChargeTypeChange={setChargeType}
            onChargeAmountChange={setChargeAmount}
            onVoiceClick={() => { }}
            isListening={false}
          />

          {/* Portfolio Images */}
          <div>
            <label className={labelClass}>
              Portfolio Images{" "}
              <span className={`${typography.misc.caption} font-normal`}>(optional, up to 5)</span>
            </label>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mb-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      disabled={loading}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-blue-400 hover:border-blue-500 transition-colors"
                    disabled={loading}
                  >
                    <ImagePlus size={20} />
                    <span className={typography.misc.caption}>Add</span>
                  </button>
                )}
              </div>
            )}

            {imagePreviews.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                <Upload size={32} className="mb-2" />
                <span className={`${typography.body.xs} font-medium`}>Upload Work Photos</span>
                <span className={`${typography.misc.caption} mt-1`}>JPG, PNG up to 5 images</span>
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
          <div className="flex gap-4 pt-2">
            <button
              onClick={() => navigate("/home")}
              className={`flex-1 px-4 py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors ${typography.body.xs}`}
              disabled={loading}
            >
              Cancel
            </button>
            <div className="flex-1">
              <Button fullWidth onClick={handleSubmit} disabled={loading}>
                <span className={typography.body.xs}>
                  {loading ? "Saving..." : "Save Skills & Go to Home"}
                </span>
              </Button>
            </div>
          </div>

          <p className={`${typography.misc.caption} text-center`}>
            Fill in all required fields to add your skill. You can add multiple skills from the home page.
          </p>
        </div>

        <div className="h-6"></div>
      </div>
    </div>
  );
};

export default AddSkillsScreen;