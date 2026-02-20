import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addEventService, updateEventService, getEventServiceById } from "../services/EventWorker.service";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

// ── #f09b13 ≈ Tailwind amber-500 ─────────────────────────────────────────────

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";

const buildImageUrl = (path: string): string => {
    if (!path) return "";
    if (/^(https?:\/\/|blob:|data:)/i.test(path)) return path;
    const clean = path.replace(/\\/g, "/");
    return `${API_BASE_URL}/${clean.replace(/^\//, "")}`;
};

const getEventSubcategories = () => {
    const cat = subcategoriesData.subcategories.find(c => c.categoryId === 14);
    return cat ? cat.items.map(i => i.name) : [];
};

const chargeTypeOptions = ['per event', 'per day', 'per hour', 'fixed rate'];

// ── Shared input: amber focus ring ───────────────────────────────────────────
const inputBase =
    `w-full px-4 py-3 border border-gray-200 rounded-xl ` +
    `focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

// Dropdown chevron in amber (#f09b13)
const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f09b13'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem'
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
        {children}{required && <span className="text-amber-500 ml-1">*</span>}
    </label>
);

const SectionCard: React.FC<{ title?: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
        {title && (
            <div className="flex items-center justify-between mb-1">
                <h3 className={`${typography.card.subtitle} text-gray-900`}>{title}</h3>
                {action}
            </div>
        )}
        {children}
    </div>
);

const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`);
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            return { lat: loc.lat, lng: loc.lng };
        }
        return null;
    } catch { return null; }
};

const resolveUserId = (): string => {
    const candidates = ['userId', 'user_id', 'uid', 'id', 'user', 'currentUser', 'loggedInUser', 'userData', 'userInfo', 'authUser'];
    for (const key of candidates) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        if (raw.length > 10 && !raw.startsWith('{')) return raw;
        try {
            const parsed = JSON.parse(raw);
            const id = parsed._id || parsed.id || parsed.userId || parsed.user_id || parsed.uid;
            if (id) return String(id);
        } catch { }
    }
    return '';
};

// ============================================================================
// COMPONENT
// ============================================================================
const EventForm = () => {
    const navigate = useNavigate();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const getSubcategoryFromUrl = () => {
        const sub = new URLSearchParams(window.location.search).get('subcategory');
        return sub ? sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
    };

    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [locationWarning, setLocationWarning] = useState('');

    const eventCategories = getEventSubcategories();
    const defaultCategory = getSubcategoryFromUrl() || eventCategories[0] || 'Party Decoration';

    const [formData, setFormData] = useState({
        userId: resolveUserId(),
        name: '',
        category: defaultCategory,
        email: '',
        phone: '',
        description: '',
        serviceCharge: '',
        chargeType: chargeTypeOptions[0],
        experience: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const isGPSDetected = useRef(false);

    // ── fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getEventServiceById(editId);
                if (!response.success || !response.data) throw new Error('Service not found');
                const data = response.data;
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || prev.userId,
                    name: data.name || '',
                    category: data.category || defaultCategory,
                    email: data.email || '',
                    phone: data.phone || '',
                    description: data.description || data.bio || '',
                    serviceCharge: data.serviceCharge?.toString() || '',
                    chargeType: data.chargeType || chargeTypeOptions[0],
                    experience: data.experience?.toString() || '',
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                }));
                if (data.images && Array.isArray(data.images)) {
                    setExistingImages(data.images);
                    setExistingImageUrls(data.images.map(buildImageUrl));
                }
            } catch (err) {
                setError('Failed to load service data');
            } finally { setLoadingData(false); }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode ──────────────────────────────────────────────────────────
    useEffect(() => {
        const detect = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                const addr = [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ');
                const coords = await geocodeAddress(addr);
                if (coords) setFormData(prev => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lng.toString() }));
            }
        };
        const t = setTimeout(detect, 1000);
        return () => clearTimeout(t);
    }, [formData.area, formData.city, formData.state, formData.pincode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── image helpers ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const slots = 5 - (selectedImages.length + existingImages.length);
        if (slots <= 0) { setError('Maximum 5 images allowed'); return; }
        const valid = files.slice(0, slots).filter(f => {
            if (!f.type.startsWith('image/')) { setError(`${f.name} is not a valid image`); return false; }
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
        setError('');
    };

    const handleRemoveNewImage = (i: number) => {
        setSelectedImages(p => p.filter((_, idx) => idx !== i));
        setImagePreviews(p => p.filter((_, idx) => idx !== i));
    };
    const handleRemoveExistingImage = (i: number) => {
        setExistingImages(p => p.filter((_, idx) => idx !== i));
        setExistingImageUrls(p => p.filter((_, idx) => idx !== i));
    };

    // ── geolocation ───────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(''); setLocationWarning('');
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                isGPSDetected.current = true;
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                if (pos.coords.accuracy > 500)
                    setLocationWarning(`⚠️ Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify.`);
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data.address) {
                        setFormData(prev => ({
                            ...prev, latitude: lat, longitude: lng,
                            area: data.address.suburb || data.address.neighbourhood || data.address.road || prev.area,
                            city: data.address.city || data.address.town || data.address.village || prev.city,
                            state: data.address.state || prev.state,
                            pincode: data.address.postcode || prev.pincode,
                        }));
                    }
                } catch { }
                setLocationLoading(false);
            },
            (err) => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true); setError(''); setSuccessMessage('');
        try {
            let uid = formData.userId;
            if (!uid) { uid = resolveUserId(); if (uid) setFormData(prev => ({ ...prev, userId: uid })); }
            if (!uid) throw new Error('User not logged in. Please log out and log back in.');
            if (!formData.name) throw new Error('Please enter a service / business name');
            if (!formData.serviceCharge) throw new Error('Please enter a service charge');
            if (!formData.latitude || !formData.longitude) throw new Error('Please provide a valid location');

            const fd = new FormData();
            fd.append('userId', uid);
            fd.append('name', formData.name);
            fd.append('category', formData.category);
            fd.append('email', formData.email);
            fd.append('phone', formData.phone);
            fd.append('description', formData.description);
            fd.append('serviceCharge', formData.serviceCharge);
            fd.append('chargeType', formData.chargeType);
            fd.append('experience', formData.experience);
            fd.append('area', formData.area);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('pincode', formData.pincode);
            fd.append('latitude', formData.latitude);
            fd.append('longitude', formData.longitude);

            selectedImages.forEach(f => fd.append('images', f, f.name));
            if (isEditMode && existingImages.length > 0)
                fd.append('existingImages', JSON.stringify(existingImages));

            if (isEditMode && editId) {
                const res = await updateEventService(editId, fd);
                if (!res.success) throw new Error(res.message || 'Failed to update service');
                setSuccessMessage('Service updated successfully!');
            } else {
                const res = await addEventService(fd);
                if (!res.success) throw new Error(res.message || 'Failed to create service');
                setSuccessMessage('Service created successfully!');
            }
            setTimeout(() => navigate('/my-business'), 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally { setLoading(false); }
    };

    // ── loading screen ────────────────────────────────────────────────────────
    if (loadingData) return (
        <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
                <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
            </div>
        </div>
    );

    const totalImages = selectedImages.length + existingImages.length;

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-amber-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b border-amber-100 px-4 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 -ml-2 hover:bg-amber-50 rounded-full transition"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Event Service' : 'Add Event Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your event service listing' : 'Create new event service listing'}
                        </p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-amber-50 border border-amber-400 rounded-xl text-amber-800 text-sm font-medium">
                        ✓ {successMessage}
                    </div>
                )}

                {/* 1. BASIC INFO */}
                <SectionCard title="Basic Information">
                    <div>
                        <FieldLabel required>Service / Business Name</FieldLabel>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g., DJ Services, Party Decoration"
                            className={inputBase}
                        />
                    </div>
                    <div>
                        <FieldLabel required>Category</FieldLabel>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={inputBase + ' appearance-none'}
                            style={selectStyle}
                        >
                            {eventCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </SectionCard>

                {/* 2. CONTACT */}
                <SectionCard title="Contact Information">
                    <div>
                        <FieldLabel>Phone</FieldLabel>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className={inputBase}
                        />
                    </div>
                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email address"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* 3. SERVICE DETAILS */}
                <SectionCard title="Service Details">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input
                                type="number"
                                name="serviceCharge"
                                value={formData.serviceCharge}
                                onChange={handleInputChange}
                                placeholder="5000"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <select
                                name="chargeType"
                                value={formData.chargeType}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none'}
                                style={selectStyle}
                            >
                                {chargeTypeOptions.map(t => (
                                    <option key={t} value={t}>{t.replace(/\b\w/g, c => c.toUpperCase())}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Experience (years)</FieldLabel>
                        <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            placeholder="e.g. 5"
                            min="0"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* 4. LOCATION */}
                <SectionCard
                    title="Location Details"
                    action={
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {locationLoading
                                ? <><span className="animate-spin mr-1 text-xs">⌛</span>Detecting...</>
                                : <><MapPin className="w-4 h-4" />Auto Detect</>
                            }
                        </button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="Area name" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className={inputBase} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN code" className={inputBase} />
                        </div>
                    </div>

                    {/* Tip box — amber */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className={`${typography.body.small} text-amber-800`}>
                            📍 <span className="font-medium">Tip:</span> Click Auto Detect or enter manually above.
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className={`${typography.body.small} text-green-800`}>
                                <span className="font-semibold">✓ Location detected: </span>
                                {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* 5. DESCRIPTION */}
                <SectionCard title="Description">
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe your event service, expertise, and what makes you special..."
                        className={inputBase + ' resize-none'}
                    />
                </SectionCard>

                {/* 6. PHOTOS */}
                <SectionCard title="Portfolio Photos (Optional)">
                    <label className={`block ${totalImages >= 5 ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={totalImages >= 5}
                        />
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                            totalImages >= 5
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-amber-300 bg-amber-50 hover:border-amber-400 hover:bg-amber-100'
                        }`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-amber-500" />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {totalImages >= 5
                                            ? 'Maximum limit reached (5 images)'
                                            : 'Tap to upload portfolio photos'}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>
                                        Max 5 images · 5 MB each · JPG, PNG, WEBP
                                    </p>
                                    {selectedImages.length > 0 && (
                                        <p className="text-amber-600 text-sm font-medium mt-1">
                                            {selectedImages.length} new image{selectedImages.length > 1 ? 's' : ''} selected ✓
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Image Previews */}
                    {(existingImageUrls.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImageUrls.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img
                                        src={url}
                                        alt={`Saved ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.onerror = null;
                                            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23fff3d9'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='32'%3E🎉%3C/text%3E%3C/svg%3E";
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img
                                        src={preview}
                                        alt={`Preview ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2 border-amber-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                                        New
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* ── Action Buttons ── */}
                <div className="flex gap-4 pt-2 pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        type="button"
                        className={`flex-1 px-6 py-3.5 rounded-lg font-semibold text-white transition-colors shadow-sm ${
                            loading
                                ? 'bg-amber-300 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700'
                        } ${typography.body.base}`}
                    >
                        {loading
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Service' : 'Add Service')}
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        type="button"
                        className={`px-8 py-3.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-amber-50 active:bg-amber-100 transition-colors ${typography.body.base}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventForm;