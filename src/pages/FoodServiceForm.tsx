import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FoodServiceAPI from "../services/FoodService.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategories from "../data/subcategories.json";
import { useAccount } from "../context/AccountContext";

import { X, Upload, MapPin, Store, Phone, Mail, Tag, Plus, ChevronDown } from "lucide-react";

const BRAND = '#00598a';

const foodServiceTypes = subcategories.subcategories
    .find(cat => cat.categoryId === 1)!
    .items.map(item => ({ value: item.name, icon: item.icon }));

const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className={`${typography.heading.h6} text-gray-900`}>{title}</h3>
        {action}
    </div>
);

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} font-semibold text-gray-700 mb-2`}>
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
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
    const { setAccountType } = useAccount();

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationWarning, setLocationWarning] = useState("");
    const isGPSDetected = useRef(false);

    const [formData, setFormData] = useState({
        userId: resolveUserId(),
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
                    const uid = (d as any).createdBy || (d as any).userId || formData.userId;
                    setFormData(prev => ({
                        ...prev,
                        userId: uid,
                        createdBy: uid,
                        name: d.name || "",
                        type: d.type || "Restaurant",
                        icon: d.icon || "🍽️",
                        phone: (d as any).phone || "",
                        email: (d as any).email || "",
                        description: (d as any).description || "",
                        area: d.area || "",
                        city: d.city || "",
                        state: d.state || "",
                        pincode: d.pincode || "",
                        latitude: d.latitude || "",
                        longitude: d.longitude || "",
                        status: d.status ? "true" : "false",
                        openingTime: (d as any).openingTime || "",
                        closingTime: (d as any).closingTime || "",
                        cuisineType: (d as any).cuisineType || "",
                        priceRange: (d as any).priceRange || "",
                    }));
                    if ((d as any).specialties) {
                        const arr = Array.isArray((d as any).specialties)
                            ? (d as any).specialties as string[]
                            : ((d as any).specialties as string).split(',').map((s: string) => s.trim()).filter(Boolean);
                        setSpecialties(arr);
                    }
                    if (Array.isArray((d as any).images)) setExistingImages((d as any).images);
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
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q= ${encodeURIComponent(addr)}&limit=1`);
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
        const t = specialtyInput.trim();
        if (!t || specialties.includes(t)) return;
        setSpecialties(prev => [...prev, t]);
        setSpecialtyInput("");
    };
    const handleRemoveSpecialty = (idx: number) => setSpecialties(prev => prev.filter((_, i) => i !== idx));

    // ── Image helpers ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const slots = 5 - (selectedImages.length + existingImages.length);
        if (slots <= 0) { setError("Maximum 5 images allowed"); return; }
        const valid = files.slice(0, slots).filter(f => {
            if (!f.type.startsWith("image/")) { setError(`${f.name} is not a valid image`); return false; }
            if (f.size > 5 * 1024 * 1024) { setError(`${f.name} exceeds 5 MB`); return false; }
            return true;
        });
        if (!valid.length) return;
        const previews: string[] = [];
        valid.forEach(f => {
            const r = new FileReader();
            r.onloadend = () => {
                previews.push(r.result as string);
                if (previews.length === valid.length) setImagePreviews(prev => [...prev, ...previews]);
            };
            r.readAsDataURL(f);
        });
        setSelectedImages(prev => [...prev, ...valid]);
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
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat= ${lat}&lon=${lng}`);
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
    // SUBMIT
    // ============================================================================
    const handleSubmit = async () => {
        setLoading(true); setError(""); setSuccessMessage("");
        try {
            let uid = formData.userId || formData.createdBy;
            if (!uid) { uid = resolveUserId(); }
            if (!uid) throw new Error("User not logged in. Please log out and log back in.");

            if (!formData.name.trim()) throw new Error("Business name is required.");
            if (!formData.phone.trim()) throw new Error("Phone number is required.");
            if (!/^[0-9+\-\s]{7,15}$/.test(formData.phone.trim())) throw new Error("Please enter a valid phone number.");
            if (!specialties.length) throw new Error("Please add at least one specialty.");
            if (!formData.area.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim())
                throw new Error("Please fill in all location fields.");
            if (!/^\d{6}$/.test(formData.pincode.trim())) throw new Error("PIN code must be exactly 6 digits.");
            if (!formData.latitude || !formData.longitude) throw new Error("Please detect your location.");

            const fd = new FormData();
            fd.append("userId", uid);
            fd.append("createdBy", uid);
            fd.append("name", formData.name.trim());
            fd.append("type", formData.type);
            fd.append("icon", formData.icon);
            fd.append("area", formData.area.trim());
            fd.append("city", formData.city.trim());
            fd.append("state", formData.state.trim());
            fd.append("pincode", formData.pincode.trim());
            fd.append("latitude", formData.latitude);
            fd.append("longitude", formData.longitude);
            fd.append("status", formData.status);
            fd.append("specialties", JSON.stringify(specialties));

            if (formData.phone) fd.append("phone", formData.phone.trim());
            if (formData.email) fd.append("email", formData.email.trim());
            if (formData.description) fd.append("description", formData.description.trim());
            if (formData.openingTime) fd.append("openingTime", formData.openingTime);
            if (formData.closingTime) fd.append("closingTime", formData.closingTime);
            if (formData.cuisineType) fd.append("cuisineType", formData.cuisineType);
            if (formData.priceRange) fd.append("priceRange", formData.priceRange);

            selectedImages.forEach(f => fd.append("images", f, f.name));
            if (isEditMode && existingImages.length > 0) {
                fd.append("existingImages", JSON.stringify(existingImages));
            }

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

            setTimeout(() => {
                setAccountType("worker");
                navigate("/my-business");
            }, 1500);

        } catch (err: any) {
            console.error("❌ Submit error:", err);
            setError(err.message || "Failed to submit form");
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: BRAND }} />
                    <p className={`${typography.body.small} text-gray-500`}>Loading...</p>
                </div>
            </div>
        );
    }

    const totalImages = selectedImages.length + existingImages.length;

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className={`${typography.heading.h5} text-gray-900 leading-tight`}>
                            {isEditMode ? "Update Food Service" : "Add Food Service"}
                        </h1>
                        <p className={`${typography.body.xs} text-gray-400 mt-0.5`}>
                            {isEditMode ? "Update your food business listing" : "Create new food business listing"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                        <p className={`${typography.form.error}`}>{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className={`${typography.body.small} text-green-700`}>✓ {successMessage}</p>
                    </div>
                )}

                {/* 1. Business Name & Type - Two columns */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Business Name</FieldLabel>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                                placeholder="e.g., Royal Restaurant" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>Business Type</FieldLabel>
                            <div className="relative">
                                <select name="type" value={formData.type} onChange={handleInputChange}
                                    className={inputCls + ' appearance-none pr-10'}>
                                    {foodServiceTypes.map(t => (
                                        <option key={t.value} value={t.value}>{t.icon} {t.value}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Contact Information - Two columns */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Phone Number</FieldLabel>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                                placeholder="9876543210" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel>Email Address</FieldLabel>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                                placeholder="business@example.com" className={inputCls} />
                        </div>
                    </div>
                </Card>

                {/* 3. Specialties - Full width with two column input */}
                <Card>
                    <FieldLabel required>Specialties / Menu Items</FieldLabel>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={specialtyInput}
                            onChange={e => setSpecialtyInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSpecialty(); } }}
                            className={inputCls}
                            placeholder="e.g., Biryani, Masala Dosa, Coffee"
                        />
                        <button
                            onClick={handleAddSpecialty}
                            type="button"
                            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: BRAND }}>
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                    {specialties.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {specialties.map((s, i) => (
                                <span key={i}
                                    className={`inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-2 rounded-full ${typography.misc.badge} text-white`}
                                    style={{ backgroundColor: BRAND }}>
                                    {s}
                                    <button type="button" onClick={() => handleRemoveSpecialty(i)} className="hover:opacity-70">
                                        <X className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </Card>

                {/* 4. Additional Details - Two columns */}
                <Card>
                    <CardTitle title="Additional Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Opening Time</FieldLabel>
                            <input type="time" name="openingTime" value={formData.openingTime}
                                onChange={handleInputChange} className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel>Closing Time</FieldLabel>
                            <input type="time" name="closingTime" value={formData.closingTime}
                                onChange={handleInputChange} className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel>Price Range</FieldLabel>
                            <input type="text" name="priceRange" value={formData.priceRange}
                                onChange={handleInputChange} className={inputCls} placeholder="₹100 - ₹500" />
                        </div>
                        <div>
                            <FieldLabel>Cuisine Type</FieldLabel>
                            <input type="text" name="cuisineType" value={formData.cuisineType}
                                onChange={handleInputChange} className={inputCls} placeholder="South Indian, Chinese..." />
                        </div>
                    </div>
                </Card>

                {/* 5. Description - Full width */}
                <Card>
                    <FieldLabel>Description</FieldLabel>
                    <textarea name="description" value={formData.description} onChange={handleInputChange}
                        rows={4} placeholder="Tell us about your food business, specialties, ambiance..."
                        className={inputCls + ' resize-none'} />
                </Card>

                {/* 6. Location - Two columns */}
                <Card>
                    <CardTitle
                        title="Location Details"
                        action={
                            <button type="button" onClick={getCurrentLocation} disabled={locationLoading}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg ${typography.misc.badge} text-white transition-opacity hover:opacity-90 disabled:opacity-60`}
                                style={{ backgroundColor: BRAND }}>
                                {locationLoading
                                    ? <><span className="animate-spin text-sm">⌛</span> Detecting...</>
                                    : <><MapPin className="w-4 h-4" /> Auto Detect</>}
                            </button>
                        }
                    />
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2 mb-3">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className="text-yellow-800 text-sm">{locationWarning}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Area / Locality</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange}
                                placeholder="e.g., Jubilee Hills" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                                placeholder="e.g., Hyderabad" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                                placeholder="e.g., Telangana" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                                placeholder="500001" maxLength={6} className={inputCls} />
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl p-3.5" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                        <p className={`${typography.body.xs} font-medium`} style={{ color: '#92400e' }}>
                            💡 <span className="font-semibold">Tip:</span> Use auto-detect to fill location automatically from your device GPS
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className={`${typography.body.xs} font-medium text-green-800`}>
                                <span className="font-bold">✓ Location detected: </span>
                                {parseFloat(formData.latitude).toFixed(5)}, {parseFloat(formData.longitude).toFixed(5)}
                            </p>
                        </div>
                    )}
                </Card>

                {/* 7. Photos - Full width */}
                <Card>
                    <CardTitle title="Food Service Photos (Optional)" />
                    <label className={`block ${totalImages >= 5 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                            className="hidden" disabled={totalImages >= 5} />
                        <div className="border-2 border-dashed rounded-xl p-8 text-center"
                            style={{ borderColor: totalImages >= 5 ? '#d1d5db' : '#c7d9e6' }}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f4fb' }}>
                                    <Upload className="w-7 h-7" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.label} text-gray-600`}>
                                        {totalImages >= 5 ? 'Maximum limit reached (5 images)' : 'Tap to upload photos'}
                                    </p>
                                    <p className={`${typography.body.xs} text-gray-400 mt-1`}>Maximum 5 images · 5 MB each</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl" />
                                    <button type="button" onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-1.5 left-1.5 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full`}
                                        style={{ backgroundColor: BRAND }}>
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((src, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2" style={{ borderColor: BRAND }} />
                                    <button type="button" onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-1.5 left-1.5 bg-green-600 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full`}>
                                        New
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 pb-8">
                    <button type="button" onClick={handleSubmit} disabled={loading}
                        className={`flex-1 py-4 rounded-xl font-bold ${typography.nav.button} text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70`}
                        style={{ backgroundColor: BRAND }}>
                        {loading && (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {loading
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Service' : 'Create Service')}
                    </button>
                    <button type="button" onClick={() => window.history.back()} disabled={loading}
                        className={`px-8 py-4 rounded-xl font-semibold ${typography.nav.button} text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50`}>
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default FoodServiceForm;