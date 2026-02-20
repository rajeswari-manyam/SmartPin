import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FoodServiceAPI from "../services/FoodService.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategories from "../data/subcategories.json";

import { X, Upload, MapPin, Store, Phone, Mail, Tag } from "lucide-react";

const foodServiceTypes = subcategories.subcategories
    .find(cat => cat.categoryId === 1)!
    .items.map(item => ({ value: item.name, icon: item.icon }));

    
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-[#f09b13] focus:border-[#f09b13] ` +
    `placeholder-gray-400 transition-all duration-200 bg-white`;

// ============================================================================
// HELPERS
// ============================================================================
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className="block text-sm font-semibold text-gray-800 mb-2">
        {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

const SectionCard: React.FC<{ title?: string; children: React.ReactNode; action?: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, action, icon }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        {title && (
            <div className="flex items-center justify-between mb-1 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    {icon}
                    <h3 className="text-base font-bold text-gray-900">{title}</h3>
                </div>
                {action}
            </div>
        )}
        {children}
    </div>
);

const resolveUserId = (): string => {
    const candidates = ["userId", "user_id", "uid", "id", "user", "currentUser", "loggedInUser", "userData", "userInfo", "authUser"];
    for (const key of candidates) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        if (raw.length > 10 && !raw.startsWith("{")) return raw;
        try {
            const parsed = JSON.parse(raw);
            const id = parsed._id || parsed.id || parsed.userId || parsed.user_id || parsed.uid;
            if (id) return String(id);
        } catch { }
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

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationWarning, setLocationWarning] = useState("");
    const isGPSDetected = useRef(false);

    const [formData, setFormData] = useState({
        createdBy: resolveUserId(),
        name: "",
        type: "Restaurant",
        icon: "🍽️",
        phone: "",
        email: "",
        description: "",
        area: "",
        city: "",
        state: "",
        pincode: "",
        latitude: "",
        longitude: "",
        status: "true",
        openingTime: "",
        closingTime: "",
        cuisineType: "",
        priceRange: "",
    });

    const [specialties, setSpecialties] = useState<string[]>([]);
    const [specialtyInput, setSpecialtyInput] = useState("");
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
                    setFormData(prev => ({
                        ...prev,
                        createdBy: (d as any).createdBy || (d as any).userId || prev.createdBy,
                        name: d.name || "",
                        type: d.type || "Restaurant",
                        icon: d.icon || "🍽️",
                        area: d.area || "",
                        city: d.city || "",
                        state: d.state || "",
                        pincode: d.pincode || "",
                        latitude: d.latitude || "",
                        longitude: d.longitude || "",
                        status: d.status ? "true" : "false",
                    }));
                    if ((d as any).images) setExistingImages((d as any).images);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to load service data");
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [id]);

    // ── Auto-geocode on manual address entry ──────────────────────────────────
    useEffect(() => {
        const geocode = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                try {
                    const addr = [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(", ");
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&limit=1`);
                    const data = await res.json();
                    if (data.length > 0) {
                        setFormData(prev => ({ ...prev, latitude: data[0].lat, longitude: data[0].lon }));
                    }
                } catch { }
            }
        };
        const t = setTimeout(geocode, 1000);
        return () => clearTimeout(t);
    }, [formData.area, formData.city, formData.state, formData.pincode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === "type") {
            const selected = foodServiceTypes.find(t => t.value === value);
            setFormData(prev => ({ ...prev, type: value, icon: selected?.icon || "🍽️" }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    // ── Specialty tags ────────────────────────────────────────────────────────
    const handleAddSpecialty = () => {
        if (specialtyInput.trim() && !specialties.includes(specialtyInput.trim())) {
            setSpecialties(prev => [...prev, specialtyInput.trim()]);
            setSpecialtyInput("");
        }
    };
    const handleRemoveSpecialty = (idx: number) => setSpecialties(prev => prev.filter((_, i) => i !== idx));

    // ── Image helpers ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const slots = 5 - (selectedImages.length + existingImages.length);
        if (slots <= 0) { setError("Maximum 5 images allowed"); return; }
        const valid = files.slice(0, slots).filter(f => {
            if (!f.type.startsWith("image/")) { setError(`${f.name} is not a valid image`); return false; }
            if (f.size > 5 * 1024 * 1024) { setError(`${f.name} exceeds 5 MB`); return false; }
            return true;
        });
        if (!valid.length) return;
        const previews: string[] = [];
        let loaded = 0;
        valid.forEach(f => {
            const r = new FileReader();
            r.onloadend = () => {
                previews.push(r.result as string);
                if (++loaded === valid.length) setImagePreviews(p => [...p, ...previews]);
            };
            r.readAsDataURL(f);
        });
        setSelectedImages(p => [...p, ...valid]);
        setError("");
    };

    const handleRemoveNewImage = (i: number) => {
        setSelectedImages(p => p.filter((_, idx) => idx !== i));
        setImagePreviews(p => p.filter((_, idx) => idx !== i));
    };
    const handleRemoveExistingImage = (i: number) => setExistingImages(p => p.filter((_, idx) => idx !== i));

    // ── GPS location ──────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(""); setLocationWarning("");
        if (!navigator.geolocation) { setError("Geolocation not supported"); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async pos => {
                isGPSDetected.current = true;
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                if (pos.coords.accuracy > 500) setLocationWarning(`⚠️ Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify.`);
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data.address) {
                        setFormData(prev => ({
                            ...prev, latitude: lat, longitude: lng,
                            area: data.address.suburb || data.address.neighbourhood || prev.area,
                            city: data.address.city || data.address.town || data.address.village || prev.city,
                            state: data.address.state || prev.state,
                            pincode: data.address.postcode || prev.pincode,
                        }));
                    }
                } catch { }
                setLocationLoading(false);
            },
            err => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ============================================================================
    // SUBMIT — FormData exactly matching the API:
    // formdata.append("createdBy", "699304a6ef2843d58fa30564");
    // formdata.append("images", fileInput.files[0], filename);
    // fetch("/createFoodService", { method: "POST", body: formdata })
    // ============================================================================
    const handleSubmit = async () => {
        setLoading(true); setError(""); setSuccessMessage("");
        try {
            let uid = formData.createdBy;
            if (!uid) { uid = resolveUserId(); if (uid) setFormData(prev => ({ ...prev, createdBy: uid })); }
            if (!uid) throw new Error("User not logged in. Please log out and log back in.");

            if (!formData.name || !formData.type || !formData.area || !formData.city)
                throw new Error("Please fill in all required fields (Name, Type, Area, City)");
            if (!formData.latitude || !formData.longitude)
                throw new Error("Please provide a valid location using Auto Detect or manual entry.");

            // ✅ Build FormData exactly like the API curl
            const fd = new FormData();
            fd.append("createdBy", uid);
            fd.append("name", formData.name);
            fd.append("type", formData.type);
            fd.append("icon", formData.icon);
            fd.append("area", formData.area);
            fd.append("city", formData.city);
            fd.append("state", formData.state);
            fd.append("pincode", formData.pincode);
            fd.append("latitude", formData.latitude);
            fd.append("longitude", formData.longitude);
            fd.append("status", formData.status);

            // Optional fields
            if (formData.phone) fd.append("phone", formData.phone);
            if (formData.email) fd.append("email", formData.email);
            if (formData.description) fd.append("description", formData.description);
            if (formData.openingTime) fd.append("openingTime", formData.openingTime);
            if (formData.closingTime) fd.append("closingTime", formData.closingTime);
            if (formData.cuisineType) fd.append("cuisineType", formData.cuisineType);
            if (formData.priceRange) fd.append("priceRange", formData.priceRange);
            if (specialties.length > 0) fd.append("specialties", JSON.stringify(specialties));

            // ✅ Append images exactly like the API: append("images", file, file.name)
            selectedImages.forEach(f => fd.append("images", f, f.name));

            // Preserve existing images on edit
            if (isEditMode && existingImages.length > 0) {
                fd.append("existingImages", JSON.stringify(existingImages));
            }

            // Debug log
            console.log("📤 Sending FormData:");
            Array.from(fd.entries()).forEach(([k, v]) => {
                if (v instanceof File) console.log(`  ${k}: [File] ${v.name} (${v.size}b)`);
                else console.log(`  ${k}: ${v}`);
            });

            const API_BASE = process.env.REACT_APP_API_BASE_URL || "";
            const endpoint = isEditMode && id
                ? `${API_BASE}/updateFoodService/${id}`
                : `${API_BASE}/createFoodService`;
            const method = isEditMode ? "PUT" : "POST";

            const res = await fetch(endpoint, { method, body: fd, redirect: "follow" });
            const text = await res.text();
            const parsed = JSON.parse(text);

            if (parsed.success === false) throw new Error(parsed.message || "Server error");

            setSuccessMessage(isEditMode ? "Service updated successfully!" : "Service created successfully!");
            setTimeout(() => navigate("/my-Business"), 1500);
        } catch (err: any) {
            console.error("❌ Submit error:", err);
            setError(err.message || "Failed to submit form");
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f09b13] mx-auto mb-4" />
                <p className="text-gray-600 text-sm">Loading service data...</p>
            </div>
        </div>
    );

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold text-gray-900">{isEditMode ? "Update Food Service" : "Add Food Service"}</h1>
                        <p className="text-sm text-gray-500">{isEditMode ? "Update your service details" : "List your food business"}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {/* Alerts */}
                {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">{error}</div>}
                {successMessage && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">✓ {successMessage}</div>}

                {/* 1. BASIC INFO */}
                <SectionCard title="Basic Information" icon={<Store size={18} className="text-[#f09b13]" />}>
                    <div>
                        <FieldLabel required>Business Name</FieldLabel>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                            placeholder="e.g., Royal Restaurant" className={inputBase} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Business Type</FieldLabel>
                            <select name="type" value={formData.type} onChange={handleInputChange} className={inputBase + " appearance-none"}>
                                {foodServiceTypes.map(t => (
                                    <option key={t.value} value={t.value}>{t.icon} {t.value}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <FieldLabel required>Status</FieldLabel>
                            <select name="status" value={formData.status} onChange={handleInputChange} className={inputBase + " appearance-none"}>
                                <option value="true">✓ Open</option>
                                <option value="false">✗ Closed</option>
                            </select>
                        </div>
                    </div>
                </SectionCard>

                {/* 2. CONTACT */}
                <SectionCard title="Contact Information" icon={<Phone size={18} className="text-[#f09b13]" />}>
                    <div>
                        <FieldLabel>Phone Number</FieldLabel>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                className={inputBase + " pl-10"} placeholder="9876543210" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Email Address</FieldLabel>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                                className={inputBase + " pl-10"} placeholder="business@example.com" />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Description</FieldLabel>
                        <textarea name="description" value={formData.description} onChange={handleInputChange}
                            rows={3} placeholder="Brief description of your business..."
                            className={inputBase + " resize-none"} />
                    </div>
                </SectionCard>

                {/* 3. SPECIALTIES */}
                <SectionCard title="Specialties / Menu Items" icon={<Tag size={18} className="text-[#f09b13]" />}>
                    <div className="flex gap-2">
                        <input type="text" value={specialtyInput} onChange={e => setSpecialtyInput(e.target.value)}
                            onKeyPress={e => { if (e.key === "Enter") { e.preventDefault(); handleAddSpecialty(); } }}
                            className={inputBase} placeholder="e.g., Biryani, Masala Dosa, Coffee" />
                        <Button variant="primary" size="md" onClick={handleAddSpecialty}
                            className="bg-[#f09b13] hover:bg-[#f5b340] shrink-0">Add</Button>
                    </div>
                    {specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {specialties.map((s, i) => (
                                <span key={i} className="inline-flex items-center gap-2 bg-[#f09b13]/10 text-[#f09b13] px-4 py-2 rounded-full text-sm font-medium border border-[#f09b13]/20">
                                    {s}
                                    <button onClick={() => handleRemoveSpecialty(i)} className="text-[#f09b13] hover:text-red-600 font-bold text-lg">×</button>
                                </span>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* 4. ADDITIONAL DETAILS */}
                <SectionCard title="Additional Details" icon={<span className="text-lg">⏰</span>}>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Opening Time</FieldLabel>
                            <input type="time" name="openingTime" value={formData.openingTime} onChange={handleInputChange} className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel>Closing Time</FieldLabel>
                            <input type="time" name="closingTime" value={formData.closingTime} onChange={handleInputChange} className={inputBase} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Price Range</FieldLabel>
                            <input type="text" name="priceRange" value={formData.priceRange} onChange={handleInputChange}
                                className={inputBase} placeholder="₹100 - ₹500" />
                        </div>
                        <div>
                            <FieldLabel>Cuisine Type</FieldLabel>
                            <input type="text" name="cuisineType" value={formData.cuisineType} onChange={handleInputChange}
                                className={inputBase} placeholder="South Indian, Chinese..." />
                        </div>
                    </div>
                </SectionCard>

                {/* 5. LOCATION */}
                <SectionCard
                    title="Location Details"
                    icon={<MapPin size={18} className="text-[#f09b13]" />}
                    action={
                        <Button variant="success" size="sm" onClick={getCurrentLocation} disabled={locationLoading} className="!py-1.5 !px-3">
                            {locationLoading
                                ? <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                                : <><MapPin className="w-4 h-4 inline mr-1.5" />Auto Detect</>}
                        </Button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className="text-yellow-800 text-sm">{locationWarning}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div><FieldLabel required>Area / Locality</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g., Jubilee Hills" className={inputBase} /></div>
                        <div><FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., Hyderabad" className={inputBase} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><FieldLabel>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g., Telangana" className={inputBase} /></div>
                        <div><FieldLabel>Pincode</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="500001" maxLength={6} className={inputBase} /></div>
                    </div>

                    <div className="bg-[#f09b13]/10 border border-[#f09b13]/20 rounded-xl p-3">
                        <p className="text-sm text-[#f09b13]">📍 <strong>Tip:</strong> Click Auto Detect or enter your address manually above.</p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className="text-sm text-green-800">
                                <span className="font-semibold">✓ Location detected: </span>
                                {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* 6. PHOTOS */}
                <SectionCard title="Food Service Photos (Optional)" icon={<Upload size={18} className="text-[#f09b13]" />}>
                    <label className="cursor-pointer block">
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden"
                            disabled={selectedImages.length + existingImages.length >= 5} />
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${selectedImages.length + existingImages.length >= 5
                            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                            : "border-[#f09b13] hover:border-[#f09b13] hover:bg-[#f09b13]/10"
                            }`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-[#f09b13]/10 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-[#f09b13]" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 text-sm">
                                        {selectedImages.length + existingImages.length >= 5
                                            ? "Maximum limit reached (5 images)"
                                            : "Tap to upload photos"}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">Max 5 images · 5 MB each · JPG, PNG, WEBP</p>
                                    {selectedImages.length > 0 && (
                                        <p className="text-[#f09b13] text-sm font-medium mt-1">
                                            {selectedImages.length} new image{selectedImages.length > 1 ? "s" : ""} selected ✓
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                    <button type="button" onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X className="w-4 h-4" /></button>
                                    <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">Saved</span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-[#f09b13]/20" />
                                    <button type="button" onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X className="w-4 h-4" /></button>
                                    <span className="absolute bottom-2 left-2 bg-[#f09b13] text-white text-xs px-2 py-0.5 rounded-full">New</span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2 pb-8">
                    <button onClick={handleSubmit} disabled={loading} type="button"
                        className={`flex-1 px-6 py-3.5 rounded-lg font-semibold text-white transition-all shadow-sm ${loading ? "bg-[#f09b13]/40 cursor-not-allowed" : "bg-[#f09b13] hover:bg-[#f5b340] active:bg-[#d07a00]"}`}>
                        {loading
                            ? (isEditMode ? "Updating..." : "Creating...")
                            : (isEditMode ? "✓ Update Service" : "✓ Create Service")}
                    </button>
                    <button onClick={() => window.history.back()} type="button"
                        className="px-8 py-3.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FoodServiceForm;
