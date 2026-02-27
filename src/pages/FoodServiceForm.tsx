import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FoodServiceAPI from "../services/FoodService.service";
import typography from "../styles/typography";
import { useAccount } from "../context/AccountContext";

import { categories } from "../components/categories/Categories";
import SubCategoriesData from "../components/data/SubCategories.json";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

import { X, Upload, MapPin } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
const BRAND = "#00598a";
const BRAND_DARK = "#004a73";

interface SubCategoryGroup {
    categoryId: number;
    items: { name: string; icon?: string }[];
}

const subcategoryGroups: SubCategoryGroup[] =
    (SubCategoriesData as any).subcategories || [];

const inputCls =
    "w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 " +
    "placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] " +
    "focus:ring-1 focus:ring-[#00598a] transition-all";

// ── Shared layout components ──────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className={`${typography.heading.h6} text-gray-900`}>{title}</h3>
        {action}
    </div>
);

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({
    children,
    required,
}) => (
    <label className={`block ${typography.form.label} font-semibold text-gray-700 mb-2`}>
        {children}
        {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-2 gap-6">{children}</div>
);

const resolveUserId = (): string => {
    const candidates = [
        "userId", "user_id", "uid", "id", "user",
        "currentUser", "loggedInUser", "userData", "userInfo", "authUser",
    ];
    for (const key of candidates) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        if (raw.length > 10 && !raw.startsWith("{")) return raw;
        try {
            const parsed = JSON.parse(raw);
            const id = parsed._id || parsed.id || parsed.userId || parsed.user_id || parsed.uid;
            if (id) return String(id);
        } catch {}
    }
    return "";
};

// ============================================================================
// COMPONENT
// ============================================================================
const FoodServiceForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();
    const isEditMode = !!id;
    const { setAccountType } = useAccount();

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationWarning, setLocationWarning] = useState("");
    const isGPSDetected = useRef(false);

    // ── Category / Subcategory ────────────────────────────────────────────────
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedSubcategory, setSelectedSubcategory] = useState(""); // maps to `type` in backend

    const filteredSubcategories = selectedCategory
        ? subcategoryGroups.find((g) => String(g.categoryId) === selectedCategory)?.items || []
        : [];

    // ── Form fields (only what backend accepts) ───────────────────────────────
    // Backend: userId, name, icon, type, phone, status, description,
    //          area, city, state, pincode, latitude, longitude, images
    const [formData, setFormData] = useState({
        userId: resolveUserId(),
        name: "",
        icon: "🍽️",
        phone: "",
        status: "true",
        description: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        latitude: "",
        longitude: "",
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // ── Fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const res = await FoodServiceAPI.getFoodServiceById(id);
                if (res.success && res.data) {
                    const d = res.data;

                    // Restore category selector from saved category name
                    const savedCategory = (d as any).category || "";
                    const savedType = (d as any).type || "";
                    const matchedCat = categories.find((c) => c.name === savedCategory);
                    if (matchedCat) setSelectedCategory(matchedCat.id);
                    setSelectedSubcategory(savedType);

                    setFormData({
                        userId: (d as any).userId || resolveUserId(),
                        name: d.name || "",
                        icon: d.icon || "🍽️",
                        phone: (d as any).phone || "",
                        status: d.status ? "true" : "false",
                        description: (d as any).description || "",
                        area: d.area || "",
                        city: d.city || "",
                        state: d.state || "",
                        pincode: d.pincode || "",
                        latitude: String(d.latitude || ""),
                        longitude: String(d.longitude || ""),
                    });

                    if (Array.isArray((d as any).images)) {
                        setExistingImages((d as any).images);
                    }
                }
            } catch {
                setError("Failed to load service data");
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [id]);

    // ── Auto-geocode when address typed ──────────────────────────────────────
    useEffect(() => {
        const geocode = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                try {
                    const addr = [formData.area, formData.city, formData.state, formData.pincode]
                        .filter(Boolean).join(", ");
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`
                    );
                    const data = await res.json();
                    if (data.length > 0) {
                        setFormData((prev) => ({ ...prev, latitude: data[0].lat, longitude: data[0].lon }));
                    }
                } catch {}
            }
        };
        const t = setTimeout(geocode, 1000);
        return () => clearTimeout(t);
    }, [formData.area, formData.city, formData.state, formData.pincode]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ── Image helpers ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const slots = 5 - (selectedImages.length + existingImages.length);
        if (slots <= 0) { setError("Maximum 5 images allowed"); return; }
        const valid = files.slice(0, slots).filter((f) => {
            if (!f.type.startsWith("image/")) { setError(`${f.name} is not a valid image`); return false; }
            if (f.size > 5 * 1024 * 1024) { setError(`${f.name} exceeds 5 MB`); return false; }
            return true;
        });
        if (!valid.length) return;
        const previews: string[] = [];
        valid.forEach((f) => {
            const r = new FileReader();
            r.onloadend = () => {
                previews.push(r.result as string);
                if (previews.length === valid.length)
                    setImagePreviews((prev) => [...prev, ...previews]);
            };
            r.readAsDataURL(f);
        });
        setSelectedImages((prev) => [...prev, ...valid]);
        setError("");
    };

    const handleRemoveNewImage = (i: number) => {
        setSelectedImages((p) => p.filter((_, idx) => idx !== i));
        setImagePreviews((p) => p.filter((_, idx) => idx !== i));
    };
    const handleRemoveExistingImage = (i: number) =>
        setExistingImages((p) => p.filter((_, idx) => idx !== i));

    // ── GPS location ──────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(""); setLocationWarning("");
        if (!navigator.geolocation) { setError("Geolocation not supported"); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                isGPSDetected.current = true;
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                if (pos.coords.accuracy > 500)
                    setLocationWarning(`⚠️ Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify.`);
                setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    );
                    const data = await res.json();
                    if (data.address) {
                        setFormData((prev) => ({
                            ...prev, latitude: lat, longitude: lng,
                            area: data.address.suburb || data.address.neighbourhood || prev.area,
                            city: data.address.city || data.address.town || data.address.village || prev.city,
                            state: data.address.state || prev.state,
                            pincode: data.address.postcode || prev.pincode,
                        }));
                    }
                } catch {}
                setLocationLoading(false);
            },
            (err) => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ============================================================================
    // SUBMIT — only send fields the backend accepts
    // ============================================================================
    const handleSubmit = async () => {
        setLoading(true); setError(""); setSuccessMessage("");
        try {
            let uid = formData.userId || resolveUserId();
            if (!uid) throw new Error("User not logged in. Please log out and log back in.");

            // Validation
            if (!formData.name.trim())        throw new Error("Business name is required.");
            if (!selectedCategory)             throw new Error("Please select a category.");
            if (!selectedSubcategory)          throw new Error("Please select a business type.");
            if (!formData.phone.trim())        throw new Error("Phone number is required.");
            if (!/^[0-9+\-\s]{7,15}$/.test(formData.phone.trim()))
                throw new Error("Please enter a valid phone number.");
            if (!formData.area.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim())
                throw new Error("Please fill in all location fields.");
            if (!/^\d{6}$/.test(formData.pincode.trim()))
                throw new Error("PIN code must be exactly 6 digits.");
            if (!formData.latitude || !formData.longitude)
                throw new Error("Please detect your location.");

            // Resolve category name from id
            const categoryName = categories.find((c) => c.id === selectedCategory)?.name || "";

            // Build FormData — only backend-accepted fields
            const fd = new FormData();
            fd.append("userId",      uid);
            fd.append("name",        formData.name.trim());
            fd.append("icon",        formData.icon);
            fd.append("category",    categoryName);               // category name resolved from id
            fd.append("type",        selectedSubcategory);        // backend field: type (subcategory)
            fd.append("phone",       formData.phone.trim());
            fd.append("status",      formData.status);
            fd.append("description", formData.description.trim());
            fd.append("area",        formData.area.trim());
            fd.append("city",        formData.city.trim());
            fd.append("state",       formData.state.trim());
            fd.append("pincode",     formData.pincode.trim());
            fd.append("latitude",    formData.latitude);
            fd.append("longitude",   formData.longitude);

            // New images → S3 upload handled by backend
            selectedImages.forEach((f) => fd.append("images", f, f.name));

            // Preserve existing images on edit
            if (isEditMode && existingImages.length > 0) {
                fd.append("existingImages", JSON.stringify(existingImages));
            }

            const API_BASE = process.env.REACT_APP_API_BASE_URL || "";
            const endpoint = isEditMode && id
                ? `${API_BASE}/updateFoodService/${id}`
                : `${API_BASE}/createFoodService`;
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(endpoint, { method, body: fd, redirect: "follow" });
            const parsed = await res.json();

            if (parsed.success === false) throw new Error(parsed.message || "Server error");

            setSuccessMessage(isEditMode ? "Service updated successfully!" : "Service created successfully!");
            setTimeout(() => { setAccountType("worker"); navigate("/my-business"); }, 1500);

        } catch (err: any) {
            setError(err.message || "Failed to submit form");
        } finally {
            setLoading(false);
        }
    };

    // ── Loading screen ────────────────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3"
                        style={{ borderColor: BRAND }} />
                    <p className={`${typography.body.small} text-gray-500`}>Loading...</p>
                </div>
            </div>
        );
    }

    const totalImages = selectedImages.length + existingImages.length;
    const maxImagesReached = totalImages >= 5;

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? "Update Food Service" : "Add Food Service"}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? "Update your food business listing" : "Create new food business listing"}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Wide container ── */}
            <div className="max-w-6xl mx-auto px-8 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
                        <div>
                            <p className="font-semibold text-red-800 mb-0.5">Error</p>
                            <p className={typography.form.error}>{error}</p>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <p className={`${typography.body.small} text-green-700`}>{successMessage}</p>
                    </div>
                )}

                {/* ─── ROW 1: Business Name + Category + Business Type ─── */}
                <Card>
                    <div className="mb-6">
                        <FieldLabel required>Business Name</FieldLabel>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., Royal Restaurant"
                            className={inputCls}
                        />
                    </div>
                    <TwoCol>
                        <div>
                            <FieldLabel>Category</FieldLabel>
                            <IconSelect
                                label=""
                                value={selectedCategory}
                                placeholder="Select category"
                                options={categories.map((c) => ({ id: c.id, name: c.name, icon: c.icon }))}
                                onChange={(val) => { setSelectedCategory(val); setSelectedSubcategory(""); }}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Business Type</FieldLabel>
                            <IconSelect
                                label=""
                                value={selectedSubcategory}
                                placeholder={selectedCategory ? "Select type" : "Select category first"}
                                disabled={!selectedCategory || loading}
                                options={filteredSubcategories.map((s) => ({
                                    name: s.name,
                                    icon: SUBCATEGORY_ICONS[s.name],
                                }))}
                                onChange={(val) => setSelectedSubcategory(val)}
                            />
                        </div>
                    </TwoCol>
                </Card>

                {/* ─── ROW 2: Contact + Description ─── */}
                <Card>
                    <TwoCol>
                        {/* Phone + Status */}
                        <div className="space-y-4">
                            <CardTitle title="Contact Information" />
                            <div>
                                <FieldLabel required>Phone Number</FieldLabel>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="9876543210"
                                    className={inputCls}
                                />
                            </div>
                            <div>
                                <FieldLabel>Status</FieldLabel>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className={inputCls}
                                >
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <FieldLabel>Description</FieldLabel>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Tell us about your food business, specialties, ambiance..."
                                className={inputCls + " resize-none"}
                            />
                        </div>
                    </TwoCol>
                </Card>

                {/* ─── ROW 3: Location ─── */}
                <Card>
                    <CardTitle
                        title="Location Details"
                        action={
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={locationLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white
                                    transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ backgroundColor: BRAND }}
                                onMouseEnter={(e) =>
                                    !locationLoading && ((e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK)
                                }
                                onMouseLeave={(e) =>
                                    !locationLoading && ((e.currentTarget as HTMLElement).style.backgroundColor = BRAND)
                                }
                            >
                                {locationLoading ? (
                                    <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                                ) : (
                                    <><MapPin className="w-4 h-4 inline mr-1" />Auto Detect</>
                                )}
                            </button>
                        }
                    />

                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2 mb-4">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className="text-yellow-800 text-sm">{locationWarning}</p>
                        </div>
                    )}

                    <TwoCol>
                        <div>
                            <FieldLabel required>Area / Locality</FieldLabel>
                            <input type="text" name="area" value={formData.area}
                                onChange={handleInputChange} placeholder="e.g., Jubilee Hills" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city}
                                onChange={handleInputChange} placeholder="e.g., Hyderabad" className={inputCls} />
                        </div>
                    </TwoCol>

                    <TwoCol>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state}
                                onChange={handleInputChange} placeholder="e.g., Telangana" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode}
                                onChange={handleInputChange} placeholder="500001" maxLength={6} className={inputCls} />
                        </div>
                    </TwoCol>

                    <div className="mt-4 rounded-xl p-3.5"
                        style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}>
                        <p className={`${typography.body.xs} font-medium`} style={{ color: "#92400e" }}>
                            💡 <span className="font-semibold">Tip:</span> Click "Auto Detect" to fill location automatically from your device GPS.
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className={`${typography.body.xs} font-medium text-green-800`}>
                                <span className="font-bold">✓ Location detected: </span>
                                <span className="font-mono">
                                    {parseFloat(formData.latitude).toFixed(5)},{" "}
                                    {parseFloat(formData.longitude).toFixed(5)}
                                </span>
                            </p>
                        </div>
                    )}
                </Card>

                {/* ─── ROW 4: Photos ─── */}
                <Card>
                    <CardTitle title={`Food Service Photos (${totalImages}/5)`} />
                    <TwoCol>
                        {/* Upload zone */}
                        <label className={`block ${maxImagesReached ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={maxImagesReached}
                            />
                            <div
                                className="border-2 border-dashed rounded-2xl p-10 text-center h-full flex items-center justify-center transition-colors"
                                style={{
                                    borderColor: maxImagesReached ? "#d1d5db" : "#7ab3cc",
                                    backgroundColor: maxImagesReached ? "#f9fafb" : "rgba(0,89,138,0.04)",
                                    minHeight: "180px",
                                }}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: "rgba(0,89,138,0.1)" }}>
                                        <Upload className="w-8 h-8" style={{ color: BRAND }} />
                                    </div>
                                    <div>
                                        <p className={`${typography.form.label} text-gray-700 font-medium`}>
                                            {maxImagesReached
                                                ? "Maximum limit reached"
                                                : `Add Photos (${5 - totalImages} slots left)`}
                                        </p>
                                        <p className={`${typography.body.xs} text-gray-400 mt-1`}>
                                            Maximum 5 images · 5 MB each · Uploaded to S3
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </label>

                        {/* Preview grid */}
                        {existingImages.length > 0 || imagePreviews.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {existingImages.map((url, i) => (
                                    <div key={`ex-${i}`} className="relative aspect-square group">
                                        <img src={url} alt={`Saved ${i + 1}`}
                                            className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                        <button type="button" onClick={() => handleRemoveExistingImage(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className={`absolute bottom-1.5 left-1.5 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full text-xs`}
                                            style={{ backgroundColor: BRAND }}>
                                            Saved
                                        </span>
                                    </div>
                                ))}
                                {imagePreviews.map((src, i) => (
                                    <div key={`new-${i}`} className="relative aspect-square group">
                                        <img src={src} alt={`Preview ${i + 1}`}
                                            className="w-full h-full object-cover rounded-xl border-2"
                                            style={{ borderColor: BRAND }} />
                                        <button type="button" onClick={() => handleRemoveNewImage(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-1.5 left-1.5 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                                            New
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl"
                                style={{ minHeight: "180px" }}>
                                <p className={`${typography.body.small} text-gray-400`}>
                                    Uploaded images will appear here
                                </p>
                            </div>
                        )}
                    </TwoCol>
                </Card>

                {/* ── Action Buttons ── */}
                <div className="flex gap-4 pt-2 pb-8 justify-end">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
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
                        disabled={loading || !!successMessage}
                        className={`px-10 py-3.5 rounded-xl font-semibold text-white
                            transition-all shadow-md hover:shadow-lg
                            bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                            ${typography.body.base}
                            ${loading || successMessage ? "cursor-not-allowed opacity-70" : ""}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10"
                                        stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {isEditMode ? "Updating..." : "Creating..."}
                            </span>
                        ) : successMessage ? (
                            <span className="flex items-center gap-2"><span>✓</span> Done</span>
                        ) : isEditMode ? (
                            "Update Service"
                        ) : (
                            "Create Service"
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FoodServiceForm;