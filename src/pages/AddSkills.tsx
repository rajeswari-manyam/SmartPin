import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, X, Upload } from "lucide-react";
import Button from "../components/ui/Buttons";
import CategorySelector from "../components/WorkerProfile/CategorySelector";
import ServiceChargesSection from "../components/WorkerProfile/ServiceCharges";
import { addWorkerSkill, AddWorkerSkillPayload } from "../services/api.service";
import CategoriesData from "../components/data/Categories.json";
import SubCategoriesData from "../components/data/SubCategories.json";

const AddSkillsScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedCategory, setSelectedCategory] = useState<number | "">("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [skills, setSkills] = useState("");

  const [chargeType, setChargeType] = useState<"hourly" | "daily" | "fixed">("hourly");
  const [chargeAmount, setChargeAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Image upload state
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const categories = CategoriesData.categories;
  const subcategories = SubCategoriesData.subcategories;

  const availableSubcategories = selectedCategory
    ? subcategories.find(s => s.categoryId === selectedCategory)?.items || []
    : [];

  // ✅ Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Limit to 5 images
    const combined = [...images, ...files].slice(0, 5);
    setImages(combined);

    // Generate previews
    const newPreviews: string[] = [];
    combined.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === combined.length) {
          setImagePreviews([...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ✅ Remove a specific image
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError("");

    const workerId = localStorage.getItem("workerId") || localStorage.getItem("@worker_id");

    if (!workerId) {
      setError("Worker profile not found. Please create your profile first.");
      alert("Worker profile not found. Please create your profile first.");
      navigate("/worker-profile");
      return;
    }

    if (!selectedCategory || !selectedSubcategory || !chargeAmount) {
      setError("Please fill all required fields");
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
      images: images.length > 0 ? images : undefined, // ✅ Attach uploaded images
    };

    setLoading(true);

    try {
      const res = await addWorkerSkill(payload);

      if (!res || !res.success) {
        const errorMsg = res?.message || "Failed to add skill. Please try again.";
        setError(errorMsg);
        alert(errorMsg);
        return;
      }

      localStorage.setItem("workerSkillId", res.skill._id);

      alert("Skill added successfully!");
      navigate("/home");
    } catch (error: any) {
      console.error("Error adding skill:", error);

      let errorMessage = "Failed to add skill. Please try again.";

      if (error.message?.includes("Failed to fetch") || error.message?.includes("ERR_CONNECTION_REFUSED")) {
        errorMessage = "Unable to connect to server. Please check if the backend is running.";
      } else if (error.message?.includes("409")) {
        errorMessage = "This skill is already added for your profile.";
      } else if (error.response) {
        errorMessage = error.response.data?.message || errorMessage;
      }

      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-4 md:py-8 px-4 md:px-6">
      <div className="max-w-xl mx-auto">

        {/* Header with Back Button */}
        <div className="flex items-center mb-4 md:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white transition-colors"
            disabled={loading}
          >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </button>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 ml-3 md:ml-4">
            Add Skills & Charges
          </h2>
        </div>

        {/* Main Form Container */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-lg p-4 md:p-6">

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm md:text-base">
              {error}
            </div>
          )}

          {/* Category Selector */}
          <CategorySelector
            categories={categories}
            subcategories={availableSubcategories}
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            onCategoryChange={e => setSelectedCategory(Number(e.target.value))}
            onSubcategoryChange={setSelectedSubcategory}
          />

          {/* Skills Input */}
          <div className="mt-4 md:mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              Skills Description
            </label>
            <input
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm md:text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
              placeholder="e.g., Residential Cleaning, Commercial Cleaning"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Service Charges Section */}
          <div className="mt-4 md:mt-5">
            <ServiceChargesSection
              chargeType={chargeType}
              chargeAmount={chargeAmount}
              onChargeTypeChange={setChargeType}
              onChargeAmountChange={setChargeAmount}
              onVoiceClick={() => { }}
              isListening={false}
            />
          </div>

          {/* ✅ Portfolio / Work Images Upload */}
          <div className="mt-4 md:mt-5">
            <label className="block text-sm font-medium text-gray-700 mb-1.5 md:mb-2">
              Portfolio Images <span className="text-gray-400 font-normal">(optional, up to 5)</span>
            </label>

            {/* Image Preview Grid */}
            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-3">
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

                {/* Add more button (if less than 5) */}
                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-blue-300 rounded-xl flex flex-col items-center justify-center text-blue-400 hover:border-blue-500 hover:text-blue-500 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    <ImagePlus size={20} />
                    <span className="text-xs mt-1">Add</span>
                  </button>
                )}
              </div>
            )}

            {/* Upload Button (shown when no images yet) */}
            {imagePreviews.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-300 rounded-xl py-6 md:py-8 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                <Upload size={28} className="mb-2" />
                <span className="text-sm font-medium">Upload Work Photos</span>
                <span className="text-xs text-gray-400 mt-1">JPG, PNG up to 5 images</span>
              </button>
            )}

            {/* Hidden file input */}
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
          <div className="space-y-3 mt-6 md:mt-8">
            <Button fullWidth onClick={handleSubmit} disabled={loading}>
              <span className="text-sm md:text-base">
                {loading ? "Saving..." : "Save Skills & Go to Home"}
              </span>
            </Button>

            <button
              onClick={() => navigate("/home")}
              className="w-full px-4 py-2.5 md:py-3 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
              disabled={loading}
            >
              Cancel
            </button>
          </div>

          <p className="text-xs md:text-sm text-gray-500 text-center mt-4">
            Fill in all required fields to add your skill. You can add multiple skills from the home page.
          </p>
        </div>

        <div className="h-4 md:h-0"></div>
      </div>
    </div>
  );
};

export default AddSkillsScreen;
