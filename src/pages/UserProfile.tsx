import React, { useState, ChangeEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import VoiceIcon from "../assets/icons/Voice.png";
import locationIcon from "../assets/icons/Location.png";

import CategoriesData from "../data/categories.json";
import SubCategoriesData from "../data/subcategories.json";

import VoiceService from "../services/voiceService";
import { createJob, CreateJobPayload } from "../services/api.service";

/* ================= TYPES ================= */
interface Category {
  id: number;
  name: string;
  icon: string;
}

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

/* ================= DATA ================= */
const categories: Category[] = CategoriesData.categories;
const subcategoryGroups: SubCategoryGroup[] = SubCategoriesData.subcategories || [];

/* ================= COMPONENT ================= */
const UserProfile: React.FC = () => {
  const navigate = useNavigate();

  const reverseGeocode = async (lat: number, lng: number) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
    );
    return res.json();
  };

  // ✅ Forward Geocoding - Get lat/lng from address (like Google Maps)
  const forwardGeocode = async (area: string, city: string, state: string, pincode: string) => {
    try {
      // Build search query with all available location fields
      const query = `${area}, ${city}, ${state}, ${pincode}, India`;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
      );
      const data = await res.json();

      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  const storedUser = localStorage.getItem("user");
  const user = storedUser && storedUser !== "undefined" ? JSON.parse(storedUser) : null;

  const [formData, setFormData] = useState<FormData>({
    title: "",
    category: "",
    subcategory: "",
    jobType: "FULL_TIME",
    servicecharges: "",
    startDate: "",
    endDate: "",
    description: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    images: [],
    latitude: undefined,
    longitude: undefined,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeocodingLoading, setIsGeocodingLoading] = useState(false);

  // ✅ Get filtered subcategories based on selected category
  const getFilteredSubcategories = (): SubCategory[] => {
    if (!formData.category) return [];

    const categoryId = parseInt(formData.category);
    const group = subcategoryGroups.find(g => g.categoryId === categoryId);

    return group?.items || [];
  };

  const filteredSubcategories = getFilteredSubcategories();

  // ✅ Load pre-filled data on component mount
  useEffect(() => {
    const prefillDataStr = localStorage.getItem('jobPrefillData');

    if (prefillDataStr) {
      try {
        const prefillData = JSON.parse(prefillDataStr);
        console.log("Prefill data loaded:", prefillData);

        // Find the category by name
        const foundCategory = categories.find(
          cat => cat.name.toLowerCase().includes(prefillData.category?.toLowerCase()) ||
            prefillData.category?.toLowerCase().includes(cat.name.toLowerCase())
        );

        console.log("Found category:", foundCategory);

        // Set the form data
        setFormData(prev => ({
          ...prev,
          category: foundCategory ? String(foundCategory.id) : "",
          subcategory: prefillData.subcategory || "",
          area: prefillData.area || "",
          latitude: prefillData.latitude,
          longitude: prefillData.longitude,
        }));

        console.log("Form data updated");

        // Clear the prefill data after using it
        localStorage.removeItem('jobPrefillData');
      } catch (err) {
        console.error("Error parsing prefill data:", err);
      }
    }
  }, []);

  // ✅ Clear subcategory when category changes (if it doesn't belong to new category)
  useEffect(() => {
    if (formData.category && formData.subcategory) {
      const validSubcategories = getFilteredSubcategories();
      const isValid = validSubcategories.some(
        sub => sub.name === formData.subcategory
      );

      if (!isValid) {
        setFormData(prev => ({ ...prev, subcategory: "" }));
      }
    }
  }, [formData.category]);

  // ✅ Auto-detect lat/lng when location fields change (like Google Maps)
  useEffect(() => {
    const detectLocation = async () => {
      // Only geocode if all location fields are filled
      if (formData.area && formData.city && formData.state && formData.pincode) {
        setIsGeocodingLoading(true);

        const coords = await forwardGeocode(
          formData.area,
          formData.city,
          formData.state,
          formData.pincode
        );

        if (coords) {
          setFormData(prev => ({
            ...prev,
            latitude: coords.latitude,
            longitude: coords.longitude
          }));
          console.log("✅ Coordinates detected:", coords);
        }

        setIsGeocodingLoading(false);
      }
    };

    // Debounce the geocoding to avoid too many requests (wait 1.5 seconds after user stops typing)
    const timeoutId = setTimeout(detectLocation, 1500);

    return () => clearTimeout(timeoutId);
  }, [formData.area, formData.city, formData.state, formData.pincode]);

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const data = await reverseGeocode(latitude, longitude);

          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
            area: data.address.suburb || data.address.neighbourhood || "",
            city: data.address.city || data.address.town || data.address.village || "",
            state: data.address.state || "",
            pincode: data.address.postcode || "",
          }));
        } catch (err) {
          alert("Failed to fetch address");
        }
      },
      () => alert("Location permission denied")
    );
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setFormData((prev) => ({
      ...prev,
      images: Array.from(files),
    }));
  };

  const handleVoiceClickFor = (field: keyof FormData) => () => {
    const voiceService = VoiceService.getInstance();

    if (!voiceService.isSpeechRecognitionSupported()) {
      alert("Speech recognition not supported");
      return;
    }

    voiceService.startListening(
      (result) => {
        setFormData((prev) => ({
          ...prev,
          [field]: `${prev[field] || ""} ${result.transcript}`,
        }));
      },
      (error) => alert(error)
    );
  };

  const validateForm = (): boolean => {
    if (!formData.category) {
      alert("Please select a category");
      return false;
    }

    if (!formData.jobType) {
      alert("Please select a job type");
      return false;
    }

    if (!formData.servicecharges) {
      alert("Please enter service charges");
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Please select start and end dates");
      return false;
    }

    if (!formData.description.trim()) {
      alert("Please enter a description");
      return false;
    }

    if (!formData.area || !formData.city || !formData.state || !formData.pincode) {
      alert("Please fill in all location fields");
      return false;
    }

    if (!formData.latitude || !formData.longitude) {
      alert("Location coordinates not detected. Please check your address or use current location.");
      return false;
    }

    if (!user?._id) {
      alert("User not logged in. Please log in first.");
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const jobData: CreateJobPayload = {
        userId: user._id,
          name: localStorage.getItem('userName') || '',   // ← ADD THIS
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

      console.log("Submitting job data:", jobData);

      const response = await createJob(jobData);

      console.log("API Response:", response);

      if (response.success || response.data?._id) {
        alert("Job created successfully!");
        navigate("/listed-jobs");
      } else {
        alert(response.message || "Job created but couldn't redirect");
        navigate("/listed-jobs");
      }
    } catch (error: any) {
      console.error("Error creating job:", error);
      alert(
        error.response?.data?.message ||
        error.message ||
        "Failed to create job. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto relative">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 top-0 p-3 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-3xl font-bold text-center mb-8">
          Post a Job
        </h1>

        <div className="space-y-5">
          {/* JOB TYPE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Job Type *
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Category *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={String(cat.id)}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* SUBCATEGORY */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Subcategory
            </label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={!formData.category}
            >
              <option value="">
                {formData.category
                  ? "Select Subcategory (Optional)"
                  : "Select a category first"}
              </option>
              {filteredSubcategories.map((sub, i) => (
                <option key={i} value={sub.name}>
                  {sub.icon} {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* SERVICE CHARGES */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Service Charges (₹) *
            </label>
            <input
              name="servicecharges"
              type="number"
              placeholder="e.g., 2000"
              value={formData.servicecharges}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {/* DATE RANGE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl"
                required
              />
            </div>
          </div>

          {/* LOCATION DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Area *</label>
              <input
                name="area"
                placeholder="e.g., Madhapur"
                value={formData.area}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">City *</label>
              <input
                name="city"
                placeholder="e.g., Hyderabad"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">State *</label>
              <input
                name="state"
                placeholder="e.g., Telangana"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Pincode *</label>
              <input
                name="pincode"
                placeholder="e.g., 500081"
                value={formData.pincode}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-xl"
                required
              />
            </div>
          </div>

          {/* LOCATION STATUS & USE CURRENT LOCATION BUTTON */}
          <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border">
            <div className="text-xs">
              {isGeocodingLoading ? (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Detecting location...
                </span>
              ) : formData.latitude && formData.longitude ? (
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full">
                  📍 {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                </span>
              ) : (
                <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                  📍 Location not detected
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:underline"
            >
              <img src={locationIcon} className="w-4 h-4" alt="location" />
              Use Current Location
            </button>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              name="description"
              placeholder="Describe the job in detail..."
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              required
            />
          </div>

          {/* IMAGES */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Images (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
            />
            {formData.images.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {formData.images.length} image(s) selected
              </p>
            )}
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition"
          >
            {isSubmitting ? "Creating Job..." : "Submit Job"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
