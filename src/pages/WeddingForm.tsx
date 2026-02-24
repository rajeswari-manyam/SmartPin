import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWeddingService, updateWeddingService, getWeddingServiceById } from "../services/Wedding.service";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from "../context/AccountContext";

const chargeTypeOptions = [
    { value: 'per event', label: 'per event' },
    { value: 'per day', label: 'per day' },
    { value: 'per hour', label: 'per hour' },
    { value: 'custom', label: 'custom' }
];

const getWeddingSubcategories = () => {
    const weddingCategory = subcategoriesData.subcategories.find(cat => cat.categoryId === 22);
    return weddingCategory ? weddingCategory.items.map(item => item.name) : [
        'Wedding Planners', 'Poojari', 'Music Team', 'Flower Decoration',
        'Sangeet Choreographers', 'Catering Services', 'Photography', 'Videography'
    ];
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

// ── Shared input: #00598a focus ring ─────────────────────────────────────────
const inputBase =
    `w-full px-4 py-3 border border-gray-200 rounded-xl ` +
    `focus:outline-none focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

// Dropdown chevron in #00598a
const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300598a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem'
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
        {children}{required && <span className="ml-1 text-red-500">*</span>}
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

// ============================================================================
// COMPONENT
// ============================================================================
const WeddingForm: React.FC = () => {
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
    const { setAccountType } = useAccount();
    const weddingCategories = getWeddingSubcategories();
    const defaultCategory = getSubcategoryFromUrl() || weddingCategories[0] || 'Wedding Planners';

    const [formData, setFormData] = useState({
        userId: resolveUserId(),
        phone: '',                          // ✅ NEW
        serviceName: '',
        subCategory: defaultCategory,
        description: '',
        serviceCharge: '',
        chargeType: chargeTypeOptions[0].value,
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
    const [locationLoading, setLocationLoading] = useState(false);
    const isGPSDetected = useRef(false);

    // ── fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getWeddingServiceById(editId);
                const data = response.data;
                const matchingChargeType = chargeTypeOptions.find(
                    opt => opt.value === data.chargeType || opt.label === data.chargeType
                );
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || prev.userId,
                    phone: data.phone || '',                // ✅ NEW
                    serviceName: data.serviceName || '',
                    subCategory: data.subCategory || defaultCategory,
                    description: data.description || '',
                    serviceCharge: data.serviceCharge?.toString() || '',
                    chargeType: matchingChargeType?.value || chargeTypeOptions[0].value,
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                }));
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
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

    // ── Phone handler: digits only, max 10 ───────────────────────────────────
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, phone: val }));
    };

    const isPhoneValid = (phone: string) => /^[6-9]\d{9}$/.test(phone);

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
    const handleRemoveExistingImage = (i: number) => setExistingImages(p => p.filter((_, idx) => idx !== i));

    // ── geolocation ───────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(''); setLocationWarning('');
        if (!navigator.geolocation) { setError('Geolocation not supported by your browser'); setLocationLoading(false); return; }
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

            // ── Validation ──────────────────────────────────────────────────
            if (!formData.phone.trim()) throw new Error('Please enter your phone number');
            if (!isPhoneValid(formData.phone)) throw new Error('Please enter a valid 10-digit mobile number starting with 6–9');
            if (!formData.serviceName.trim()) throw new Error('Please enter service name');
            if (!formData.description.trim()) throw new Error('Please enter a description');
            if (!formData.serviceCharge.trim()) throw new Error('Please enter service charge');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide location (use Auto Detect or enter address)');
            if (!formData.pincode.trim()) throw new Error('Please enter PIN code');

            const fd = new FormData();
            fd.append('userId', uid);
            fd.append('phone', formData.phone);             // ✅ NEW
            fd.append('serviceName', formData.serviceName);
            fd.append('description', formData.description);
            fd.append('subCategory', formData.subCategory);
            fd.append('serviceCharge', formData.serviceCharge);
            fd.append('chargeType', formData.chargeType);
            fd.append('latitude', formData.latitude);
            fd.append('longitude', formData.longitude);
            fd.append('area', formData.area);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('pincode', formData.pincode);

            selectedImages.forEach(f => fd.append('images', f, f.name));
            if (isEditMode && existingImages.length > 0) fd.append('existingImages', JSON.stringify(existingImages));

            if (isEditMode && editId) {
                const res = await updateWeddingService(editId, fd);
                if (!res.success) throw new Error((res as any).message || 'Failed to update service');
                setSuccessMessage('Service updated successfully!');
            } else {
                const res = await addWeddingService(fd);
                if (!res.success) throw new Error((res as any).message || 'Failed to create service');
                setSuccessMessage('Service created successfully!');
            }

            setTimeout(() => {
                setAccountType("worker");
                navigate("/my-business");
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally { setLoading(false); }
    };

    // ── loading screen ────────────────────────────────────────────────────────
    if (loadingData) return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#00598a' }} />
                <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
            </div>
        </div>
    );

    const totalImages = selectedImages.length + existingImages.length;

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-white">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Wedding Service' : 'Add Wedding Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00598a' }} />
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-2">
                            <span className="text-red-500 mt-0.5">⚠️</span>
                            <div>
                                <p className="font-semibold text-red-800 text-sm mb-0.5">Error</p>
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 rounded-xl text-white text-sm font-medium flex items-center gap-2" style={{ backgroundColor: '#00598a' }}>
                        <span>✓</span>
                        <p>{successMessage}</p>
                    </div>
                )}

                {/* ─── 1. BASIC INFO ─── */}
                <SectionCard title="Basic Information">
                    <div>
                        <FieldLabel required>Service Name</FieldLabel>
                        <input
                            type="text"
                            name="serviceName"
                            value={formData.serviceName}
                            onChange={handleInputChange}
                            placeholder="e.g. Dream Wedding Planners, Royal Catering Services"
                            className={inputBase}
                        />
                    </div>
                    <div>
                        <FieldLabel required>Service Category</FieldLabel>
                        <select
                            name="subCategory"
                            value={formData.subCategory}
                            onChange={handleInputChange}
                            className={inputBase + ' appearance-none'}
                            style={selectStyle}
                        >
                            {weddingCategories.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </SectionCard>

                {/* ─── 2. PHONE NUMBER ─── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Phone Number</FieldLabel>
                        <div className="relative">
                            {/* +91 prefix */}
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                <span className="text-gray-600 font-medium text-sm">+91</span>
                                <span className="ml-2 h-5 w-px bg-gray-300" />
                            </div>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handlePhoneChange}
                                placeholder="9876543210"
                                maxLength={10}
                                inputMode="numeric"
                                className={inputBase + ' pl-16'}
                            />
                            {/* Live validation icon */}
                            {formData.phone.length > 0 && (
                                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                    {isPhoneValid(formData.phone)
                                        ? <span className="text-green-500 text-lg font-bold">✓</span>
                                        : <span className="text-red-400 text-lg font-bold">✗</span>
                                    }
                                </div>
                            )}
                        </div>

                        {/* Hint text */}
                        {formData.phone.length === 0 && (
                            <p className="mt-1.5 text-xs text-gray-400">Enter your 10-digit mobile number</p>
                        )}
                        {formData.phone.length > 0 && !isPhoneValid(formData.phone) && (
                            <p className="mt-1.5 text-xs text-red-500">
                                Must be 10 digits starting with 6, 7, 8, or 9
                            </p>
                        )}
                        {formData.phone.length > 0 && isPhoneValid(formData.phone) && (
                            <p className="mt-1.5 text-xs text-green-600">✓ Valid mobile number</p>
                        )}
                    </div>
                </SectionCard>

                {/* ─── 3. SERVICE DETAILS ─── */}
                <SectionCard title="Service Details">
                    <FieldLabel required>Description</FieldLabel>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe your wedding service, specialties, and what makes you unique..."
                        className={inputBase + ' resize-none'}
                    />
                </SectionCard>

                {/* ─── 4. PRICING ─── */}
                <SectionCard title="Pricing Details">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input
                                type="number"
                                name="serviceCharge"
                                value={formData.serviceCharge}
                                onChange={handleInputChange}
                                placeholder="Amount"
                                min="0"
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
                                {chargeTypeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="rounded-xl p-3" style={{ backgroundColor: '#e8f2f8', border: '1px solid #b3d4e8' }}>
                        <p className="text-sm" style={{ color: '#00598a' }}>
                            💡 <span className="font-medium">Tip:</span> Choose the pricing model that best fits your service
                        </p>
                    </div>
                </SectionCard>

                {/* ─── 5. LOCATION ─── */}
                <SectionCard
                    title="Service Location"
                    action={
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-white text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed bg-[#00598a] hover:bg-[#004a75] active:bg-[#003d5c]"
                        >
                            {locationLoading
                                ? <><span className="animate-spin text-xs">⌛</span>Detecting...</>
                                : <><MapPin className="w-4 h-4" />Auto Detect</>
                            }
                        </button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className="text-sm text-yellow-800">{locationWarning}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g. Jayanagar" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g. Bangalore" className={inputBase} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g. Karnataka" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="e.g. 560041" className={inputBase} />
                        </div>
                    </div>
                    <div className="rounded-xl p-3" style={{ backgroundColor: '#e8f2f8', border: '1px solid #b3d4e8' }}>
                        <p className="text-sm" style={{ color: '#00598a' }}>
                            📍 <span className="font-medium">Tip:</span> Click "Auto Detect" or enter your service area manually.
                        </p>
                    </div>
                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className="text-sm text-green-800">
                                <span className="font-semibold">✓ Location detected: </span>
                                <span className="font-mono text-xs">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ─── 6. PORTFOLIO PHOTOS ─── */}
                <SectionCard title={`Portfolio Photos (${totalImages}/5)`}>
                    <label className={`block ${totalImages >= 5 ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={totalImages >= 5}
                        />
                        <div
                            className="border-2 border-dashed rounded-2xl p-8 text-center transition-colors"
                            style={
                                totalImages >= 5
                                    ? { borderColor: '#d1d5db', backgroundColor: '#f9fafb' }
                                    : { borderColor: '#7ab3cc', backgroundColor: '#f0f7fb' }
                            }
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#d0e8f2' }}>
                                    <Upload className="w-8 h-8" style={{ color: '#00598a' }} />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700 text-sm">
                                        {totalImages >= 5 ? 'Maximum limit reached (5 images)' : `Tap to upload photos (${5 - totalImages} slots left)`}
                                    </p>
                                    <p className="text-gray-500 text-xs mt-1">Max 5 images · 5 MB each · JPG, PNG, WEBP</p>
                                    {selectedImages.length > 0 && (
                                        <p className="text-sm font-medium mt-1" style={{ color: '#00598a' }}>
                                            {selectedImages.length} new image{selectedImages.length > 1 ? 's' : ''} selected ✓
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square group">
                                    <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-2 left-2 text-white text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#00598a' }}>
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2" style={{ borderColor: '#00598a' }} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
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
                        className={`
                            flex-1 px-6 py-3.5 rounded-xl font-semibold text-white
                            transition-all shadow-md hover:shadow-lg
                            bg-[#00598a] hover:bg-[#004a75] active:bg-[#003d5c]
                            ${typography.body.base}
                            ${loading ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                    >
                        {loading
                            ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="animate-spin">⏳</span>
                                    {isEditMode ? 'Updating...' : 'Creating...'}
                                </span>
                            )
                            : (isEditMode ? 'Update Service' : 'Create Service')
                        }
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        type="button"
                        disabled={loading}
                        className={`
                            px-8 py-3.5 rounded-xl font-medium
                            text-[#00598a] bg-white border-2 border-[#00598a]
                            hover:bg-[#00598a] hover:text-white
                            active:bg-[#004a75] active:text-white
                            transition-all
                            ${typography.body.base}
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default WeddingForm;