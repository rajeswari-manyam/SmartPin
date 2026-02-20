import React, { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, Loader2, ImageOff } from "lucide-react";
import { API_BASE_URL, getJobById } from "../services/api.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import categoriesData from "../data/categories.json";
import subcategoriesData from "../data/subcategories.json";

interface JobData {
    _id: string;
    title?: string;
    description: string;
    category: string;
    subcategory?: string;
    jobType?: string;
    servicecharges?: string | number;
    startDate?: string;
    endDate?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    images?: string[];
}

// ── Resolve any image path to a full URL ─────────────────────────────────────
const resolveImageUrl = (path?: string): string => {
    if (!path || typeof path !== "string") return "";
    const cleaned = path.trim().replace(/\\/g, "/");
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    return `${base}${cleaned.startsWith("/") ? cleaned : "/" + cleaned}`;
};

// ── Map category value (could be id, name, or number) to display name ────────
const resolveCategoryName = (categoryValue: string | number): string => {
    if (!categoryValue) return String(categoryValue);
    const str = String(categoryValue);

    // If it's already a name that matches, return it
    const byName = categoriesData.categories.find(
        (c) => c.name.toLowerCase() === str.toLowerCase()
    );
    if (byName) return byName.name;

    // If it's a numeric id
    const byId = categoriesData.categories.find(
        (c) => String(c.id) === str
    );
    if (byId) return byId.name;

    return str; // fallback
};

const UpdateJob: React.FC = () => {
    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();

    const [originalData, setOriginalData] = useState<JobData | null>(null);
    const [formData, setFormData] = useState({
        description: "",
        category: "",
        subcategory: "",
        jobType: "FULL_TIME",
        servicecharges: "",
        startDate: "",
        endDate: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        latitude: 0,
        longitude: 0,
    });

    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [filteredSubcategories, setFilteredSubcategories] = useState<any[]>([]);
    const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

    const categories = categoriesData.categories;
    const subcategories = subcategoriesData.subcategories;

    // ── Fetch job data ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!jobId) return;

        const fetchJob = async () => {
            try {
                setLoading(true);
                const res = await getJobById(jobId);

                // API may return { success, job: {...} } or { success, data: {...} }
                const job: JobData = res.job || res.data || res;

                if (!job || !job._id) {
                    alert("Failed to load job data");
                    return;
                }

                setOriginalData(job);

                // Resolve category: could be a numeric id — map to name
                const resolvedCategory = resolveCategoryName(job.category);

                setFormData({
                    description: job.description || "",
                    category: resolvedCategory,
                    subcategory: job.subcategory || "",
                    jobType: job.jobType || "FULL_TIME",
                    servicecharges: String(job.servicecharges || ""),
                    startDate: job.startDate ? job.startDate.split("T")[0] : "",
                    endDate: job.endDate ? job.endDate.split("T")[0] : "",
                    area: job.area || "",
                    city: job.city || "",
                    state: job.state || "",
                    pincode: job.pincode || "",
                    latitude: job.latitude || 0,
                    longitude: job.longitude || 0,
                });

                // ✅ Store raw image paths — resolveImageUrl handles display
                setExistingImages(job.images || []);

                // Set subcategories for the loaded category
                const selectedCat = categories.find(
                    (c) => c.name.toLowerCase() === resolvedCategory.toLowerCase()
                );
                if (selectedCat) {
                    const subList = subcategories.find(
                        (s) => s.categoryId === selectedCat.id
                    );
                    setFilteredSubcategories(subList?.items || []);
                }
            } catch (err) {
                console.error("Fetch job error:", err);
                alert("Error loading job data");
            } finally {
                setLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleInputChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const categoryName = e.target.value;
        setFormData((prev) => ({ ...prev, category: categoryName, subcategory: "" }));
        const selectedCat = categories.find((c) => c.name === categoryName);
        if (selectedCat) {
            const subList = subcategories.find((s) => s.categoryId === selectedCat.id);
            setFilteredSubcategories(subList?.items || []);
        } else {
            setFilteredSubcategories([]);
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setNewImages((prev) => [...prev, ...Array.from(files)]);
    };

    const handleRemoveNewImage = (index: number) => {
        setNewImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
        setSelectedImage((prev) => (prev >= index && prev > 0 ? prev - 1 : 0));
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!jobId) return;

        if (!formData.category || !formData.description) {
            alert("Category and description are required");
            return;
        }

        try {
            setIsSubmitting(true);

            const fd = new FormData();
            fd.append("jobType", formData.jobType.trim());
            fd.append("description", formData.description.trim());
            fd.append("category", formData.category.trim());
            fd.append("latitude", String(formData.latitude));
            fd.append("longitude", String(formData.longitude));

            if (formData.subcategory) fd.append("subcategory", formData.subcategory.trim());
            if (formData.area) fd.append("area", formData.area.trim());
            if (formData.city) fd.append("city", formData.city.trim());
            if (formData.state) fd.append("state", formData.state.trim());
            if (formData.pincode) fd.append("pincode", formData.pincode.trim());
            if (formData.servicecharges) fd.append("servicecharges", String(formData.servicecharges));
            if (formData.startDate) fd.append("startDate", formData.startDate);
            if (formData.endDate) fd.append("endDate", formData.endDate);

            // ✅ Append new image files
            newImages.forEach((file) => fd.append("images", file));

            const response = await fetch(`${API_BASE_URL}/updateJob/${jobId}`, {
                method: "PUT",
                body: fd,
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const result = await response.json();

            if (result.success) {
                alert("Job updated successfully!");
                navigate("/listed-jobs");
            } else {
                alert(result.message || "Failed to update job");
            }
        } catch (error) {
            console.error("Update Job Error:", error);
            if (error instanceof TypeError && error.message.includes("fetch")) {
                alert("Cannot connect to server. Please ensure the backend is running.");
            } else {
                alert("Something went wrong: " + (error instanceof Error ? error.message : "Unknown error"));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Loading / Not found ───────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 size={40} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (!originalData) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className={`${typography.body.large} text-red-600`}>Job not found</p>
            </div>
        );
    }

    // ── Resolved image URLs for display ──────────────────────────────────────
    const resolvedImages = existingImages.map(resolveImageUrl);

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 sm:p-3 rounded-full hover:bg-gray-200 transition"
                    >
                        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    <h1 className={typography.heading.h3}>Update Job</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

                    {/* ── LEFT: Current Job Details ── */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 h-fit lg:sticky lg:top-6">
                        <h2 className={`${typography.heading.h5} mb-4 text-gray-800`}>
                            Current Job Details
                        </h2>

                        {/* ✅ FIXED: Image display with proper URL resolution */}
                        {resolvedImages.length > 0 ? (
                            <>
                                {/* Main image */}
                                <div className="mb-3 rounded-xl overflow-hidden bg-gray-100 h-48 sm:h-64 flex items-center justify-center">
                                    {imgErrors[selectedImage] ? (
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <ImageOff size={36} />
                                            <span className="text-xs">Image unavailable</span>
                                        </div>
                                    ) : (
                                        <img
                                            key={resolvedImages[selectedImage]}
                                            src={resolvedImages[selectedImage]}
                                            alt={`Job image ${selectedImage + 1}`}
                                            className="w-full h-full object-cover"
                                            onError={() =>
                                                setImgErrors((prev) => ({ ...prev, [selectedImage]: true }))
                                            }
                                        />
                                    )}
                                </div>

                                {/* Thumbnails */}
                                {resolvedImages.length > 1 && (
                                    <div className="flex gap-2 mb-4 flex-wrap">
                                        {resolvedImages.map((url, i) => (
                                            <div key={i} className="relative group">
                                                <button
                                                    onClick={() => {
                                                        setSelectedImage(i);
                                                        setImgErrors((prev) => ({ ...prev, [i]: false }));
                                                    }}
                                                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === i
                                                        ? "border-blue-500 ring-2 ring-blue-300"
                                                        : "border-gray-200 hover:border-blue-300"
                                                        }`}
                                                >
                                                    {imgErrors[i] ? (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                            <ImageOff size={14} className="text-gray-400" />
                                                        </div>
                                                    ) : (
                                                        <img
                                                            src={url}
                                                            alt={`thumb-${i}`}
                                                            className="w-full h-full object-cover"
                                                            onError={() =>
                                                                setImgErrors((prev) => ({ ...prev, [i]: true }))
                                                            }
                                                        />
                                                    )}
                                                </button>
                                                {/* Remove existing image button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingImage(i)}
                                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Remove single image button */}
                                {resolvedImages.length === 1 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(0)}
                                        className="mb-3 text-xs text-red-500 hover:text-red-700 transition"
                                    >
                                        Remove image
                                    </button>
                                )}
                            </>
                        ) : (
                            <div className="mb-4 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <ImageOff size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-xs">No images</p>
                                </div>
                            </div>
                        )}

                        {/* Details */}
                        <div className="space-y-3 text-sm">
                            <div>
                                <span className="font-medium text-gray-600">Category: </span>
                                <span className="text-gray-800">
                                    {resolveCategoryName(originalData.category)}
                                </span>
                            </div>

                            {originalData.subcategory && (
                                <div>
                                    <span className="font-medium text-gray-600">Subcategory: </span>
                                    <span className="text-gray-800">{originalData.subcategory}</span>
                                </div>
                            )}

                            {originalData.jobType && (
                                <div>
                                    <span className="font-medium text-gray-600">Job Type: </span>
                                    <span className="text-gray-800">
                                        {originalData.jobType.replace("_", " ")}
                                    </span>
                                </div>
                            )}

                            {originalData.servicecharges && (
                                <div>
                                    <span className="font-medium text-gray-600">Service Charges: </span>
                                    <span className="font-bold text-green-600">
                                        ₹{originalData.servicecharges}
                                    </span>
                                </div>
                            )}

                            {originalData.title && (
                                <div>
                                    <span className="font-medium text-gray-600">Title: </span>
                                    <span className="text-gray-800">{originalData.title}</span>
                                </div>
                            )}

                            <div>
                                <h4 className="font-medium text-gray-600 mb-1">Description</h4>
                                <p className="text-gray-700 leading-relaxed">{originalData.description}</p>
                            </div>

                            {(originalData.area || originalData.city || originalData.state) && (
                                <div>
                                    <h4 className="font-medium text-gray-600 mb-1">Location</h4>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <MapPin size={14} className="text-blue-600 flex-shrink-0" />
                                        <span>
                                            {[originalData.area, originalData.city, originalData.state, originalData.pincode]
                                                .filter(Boolean)
                                                .join(", ")}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {originalData.latitude && originalData.longitude && (
                                <button
                                    onClick={() =>
                                        window.open(
                                            `https://www.google.com/maps?q=${originalData.latitude},${originalData.longitude}`,
                                            "_blank"
                                        )
                                    }
                                    className="w-full mt-2 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 py-2.5 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
                                >
                                    <MapPin size={14} /> View on Google Maps
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Edit Form ── */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
                        <h2 className={`${typography.heading.h5} mb-4 sm:mb-6 text-gray-800`}>
                            Edit Job Information
                        </h2>

                        <div className="space-y-4 sm:space-y-5">

                            {/* Category */}
                            <div>
                                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                                    Category *
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleCategoryChange}
                                    className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input}`}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>
                                            {cat.icon} {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Subcategory */}
                            <div>
                                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                                    Subcategory
                                </label>
                                <select
                                    name="subcategory"
                                    value={formData.subcategory}
                                    onChange={handleInputChange}
                                    disabled={!formData.category || filteredSubcategories.length === 0}
                                    className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                >
                                    <option value="">
                                        {!formData.category
                                            ? "Select category first"
                                            : filteredSubcategories.length === 0
                                                ? "No subcategories available"
                                                : "Select Subcategory"}
                                    </option>
                                    {filteredSubcategories.map((sub, index) => (
                                        <option key={index} value={sub.name}>
                                            {sub.icon} {sub.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Job Type */}
                            <div>
                                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                                    Job Type *
                                </label>
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleInputChange}
                                    className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input}`}
                                >
                                    <option value="FULL_TIME">Full Time</option>
                                    <option value="PART_TIME">Part Time</option>
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                                    Description *
                                </label>
                                <textarea
                                    name="description"
                                    rows={5}
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none ${typography.form.input}`}
                                    placeholder="Enter job description"
                                />
                            </div>

                            {/* Service Charges */}
                            <div>
                                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                                    Service Charges
                                </label>
                                <input
                                    name="servicecharges"
                                    type="number"
                                    value={formData.servicecharges}
                                    onChange={handleInputChange}
                                    className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input}`}
                                    placeholder="Enter amount"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                                        Start Date
                                    </label>
                                    <input
                                        name="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input}`}
                                    />
                                </div>
                                <div>
                                    <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                                        End Date
                                    </label>
                                    <input
                                        name="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input}`}
                                    />
                                </div>
                            </div>

                            {/* Location */}
                            <div>
                                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>Area</label>
                                <input
                                    name="area"
                                    value={formData.area}
                                    onChange={handleInputChange}
                                    className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input}`}
                                    placeholder="Enter area"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className={`block ${typography.form.label} mb-2 text-gray-700`}>City</label>
                                    <input
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input}`}
                                        placeholder="Enter city"
                                    />
                                </div>
                                <div>
                                    <label className={`block ${typography.form.label} mb-2 text-gray-700`}>State</label>
                                    <input
                                        name="state"
                                        value={formData.state}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input}`}
                                        placeholder="Enter state"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>Pincode</label>
                                <input
                                    name="pincode"
                                    value={formData.pincode}
                                    onChange={handleInputChange}
                                    className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.form.input}`}
                                    placeholder="Enter pincode"
                                />
                            </div>

                            {/* Images Upload */}
                            <div>
                                <label className={`block ${typography.form.label} mb-2 text-gray-700`}>
                                    Add New Images
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className={`w-full p-2.5 sm:p-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${typography.body.small} file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:text-sm file:font-medium`}
                                />

                                {/* New image previews */}
                                {newImages.length > 0 && (
                                    <div className="mt-3">
                                        <p className="text-xs text-gray-500 mb-2">New images to upload:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {newImages.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="relative w-20 h-20 border-2 border-green-300 rounded-lg overflow-hidden group"
                                                >
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`new-${index}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveNewImage(index)}
                                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition shadow"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`w-full py-3 sm:py-4 bg-gradient-to-r from-[#f09b13] to-[#f0c413] text-white rounded-lg sm:rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition mt-6 ${typography.body.base}`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 size={20} className="animate-spin" />
                                        Updating Job...
                                    </span>
                                ) : (
                                    "Update Job"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateJob;
