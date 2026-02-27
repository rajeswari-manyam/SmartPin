import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWeddingService, updateWeddingService, getWeddingServiceById } from "../services/Wedding.service";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, ChevronDown } from 'lucide-react';
import { useAccount } from "../context/AccountContext";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

const BRAND = '#00598a';

const chargeTypeOptions = [
    { value: 'per event', label: 'Per Event' },
    { value: 'per day',   label: 'Per Day'   },
    { value: 'per hour',  label: 'Per Hour'  },
    { value: 'custom',    label: 'Custom'    },
];

const CATEGORY_NAME = 'Wedding Services';

const getWeddingSubcategories = () => {
    const cat = subcategoriesData.subcategories.find((c: any) => c.categoryId === 22);
    return cat ? cat.items.map((i: any) => i.name) : [
        'Wedding Planners', 'Poojari', 'Music Team', 'Flower Decoration',
        'Sangeet Choreographers', 'Catering Services', 'Photography', 'Videography',
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

// ── Shared input style (matches AgricultureForm exactly) ─────────────────────
const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

// ── Reusable components (matches AgricultureForm) ─────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} font-semibold text-gray-700 mb-2`}>
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className={`${typography.heading.h6} text-gray-900`}>{title}</h3>
        {action}
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
    const [loading, setLoading]               = useState(false);
    const [loadingData, setLoadingData]       = useState(false);
    const [error, setError]                   = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [locationWarning, setLocationWarning] = useState('');
    const { setAccountType } = useAccount();

    const weddingCategories  = getWeddingSubcategories();
    const subcategoryOptions = weddingCategories.map((name: string) => ({
        name,
        icon: SUBCATEGORY_ICONS[name],
    }));
    const defaultCategory = getSubcategoryFromUrl() || weddingCategories[0] || 'Wedding Planners';

    const [formData, setFormData] = useState({
        userId:        resolveUserId(),
        phone:         '',
        serviceName:   '',
        subCategory:   defaultCategory,
        description:   '',
        serviceCharge: '',
        chargeType:    chargeTypeOptions[0].value,
        area:          '',
        city:          '',
        state:         '',
        pincode:       '',
        latitude:      '',
        longitude:     '',
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews]   = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
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
                    userId:        data.userId || prev.userId,
                    phone:         data.phone || '',
                    serviceName:   data.serviceName || '',
                    subCategory:   data.subCategory || defaultCategory,
                    description:   data.description || '',
                    serviceCharge: data.serviceCharge?.toString() || '',
                    chargeType:    matchingChargeType?.value || chargeTypeOptions[0].value,
                    area:          data.area || '',
                    city:          data.city || '',
                    state:         data.state || '',
                    pincode:       data.pincode || '',
                    latitude:      data.latitude?.toString() || '',
                    longitude:     data.longitude?.toString() || '',
                }));
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch { setError('Failed to load service data'); }
            finally { setLoadingData(false); }
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

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, phone: val }));
    };

    const isPhoneValid = (phone: string) => /^[6-9]\d{9}$/.test(phone);

    // ── image helpers ─────────────────────────────────────────────────────────
    const remainingExistingCount = existingImages.filter(url => !imagesToDelete.includes(url)).length;
    const totalImages    = remainingExistingCount + selectedImages.length;
    const maxImagesReached = totalImages >= 5;

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const slots = 5 - totalImages;
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

    const handleRemoveNewImage      = (i: number) => { setSelectedImages(p => p.filter((_, idx) => idx !== i)); setImagePreviews(p => p.filter((_, idx) => idx !== i)); };
    const handleRemoveExistingImage = (url: string) => setImagesToDelete(prev => [...prev, url]);
    const handleRestoreExistingImage = (url: string) => setImagesToDelete(prev => prev.filter(u => u !== url));

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
                    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data.address) {
                        setFormData(prev => ({
                            ...prev, latitude: lat, longitude: lng,
                            area:    data.address.suburb || data.address.neighbourhood || data.address.road || prev.area,
                            city:    data.address.city   || data.address.town || data.address.village || prev.city,
                            state:   data.address.state  || prev.state,
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
            if (!formData.phone.trim()) throw new Error('Please enter your phone number');
            if (!isPhoneValid(formData.phone)) throw new Error('Please enter a valid 10-digit mobile number starting with 6–9');
            if (!formData.serviceName.trim()) throw new Error('Please enter service name');
            if (!formData.description.trim()) throw new Error('Please enter a description');
            if (!formData.serviceCharge.trim()) throw new Error('Please enter service charge');
            if (!formData.area.trim()) throw new Error('Please enter area');
            if (!formData.city.trim()) throw new Error('Please enter city');
            if (!formData.state.trim()) throw new Error('Please enter state');
            if (!formData.pincode.trim()) throw new Error('Please enter PIN code');
            if (!formData.latitude || !formData.longitude) throw new Error('Please provide location');

            const fd = new FormData();
            fd.append('userId',        uid);
            fd.append('phone',         formData.phone);
            fd.append('serviceName',   formData.serviceName);
            fd.append('description',   formData.description);
            fd.append('subCategory',   formData.subCategory);
            fd.append('serviceCharge', formData.serviceCharge);
            fd.append('chargeType',    formData.chargeType);
            fd.append('latitude',      formData.latitude);
            fd.append('longitude',     formData.longitude);
            fd.append('area',          formData.area);
            fd.append('city',          formData.city);
            fd.append('state',         formData.state);
            fd.append('pincode',       formData.pincode);
            selectedImages.forEach(f => fd.append('images', f, f.name));

            if (isEditMode) {
                const remainingExisting = existingImages.filter(url => !imagesToDelete.includes(url));
                if (remainingExisting.length > 0) fd.append('existingImages', JSON.stringify(remainingExisting));
                if (imagesToDelete.length > 0) fd.append('imagesToDelete', JSON.stringify(imagesToDelete));
            }

            if (isEditMode && editId) {
                const res = await updateWeddingService(editId, fd);
                if (!res.success) throw new Error((res as any).message || 'Failed to update service');
                setSuccessMessage('Service updated successfully!');
            } else {
                const res = await addWeddingService(fd);
                if (!res.success) throw new Error((res as any).message || 'Failed to create service');
                setSuccessMessage('Service created successfully!');
            }

            setTimeout(() => { setAccountType('worker'); navigate('/my-business'); }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally { setLoading(false); }
    };

    // ── loading screen ────────────────────────────────────────────────────────
    if (loadingData) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: BRAND }} />
                <p className={`${typography.body.small} text-gray-500`}>Loading...</p>
            </div>
        </div>
    );

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className={`${typography.heading.h5} text-gray-900 leading-tight`}>
                            {isEditMode ? 'Update Wedding Service' : 'Add Wedding Service'}
                        </h1>
                        <p className={`${typography.body.xs} text-gray-400 mt-0.5`}>
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

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

                {/* 1. Service Name & Category */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Service Name</FieldLabel>
                            <input
                                type="text" name="serviceName" value={formData.serviceName}
                                onChange={handleInputChange}
                                placeholder="e.g. Dream Wedding Planners"
                                className={inputCls} disabled={loading}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Service Category</FieldLabel>
                            <IconSelect
                                label=""
                                value={formData.subCategory}
                                placeholder="Select service category"
                                options={subcategoryOptions}
                                onChange={(val) => setFormData(prev => ({ ...prev, subCategory: val }))}
                                disabled={loading}
                            />
                            <p className={`${typography.body.xs} text-gray-400 mt-1`}>
                                Parent: <span className="font-medium text-gray-500">{CATEGORY_NAME}</span>
                            </p>
                        </div>
                    </div>
                </Card>

                {/* 2. Contact Information */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Phone Number</FieldLabel>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <span className="text-gray-600 font-medium text-sm">+91</span>
                                    <span className="ml-2 h-5 w-px bg-gray-300" />
                                </div>
                                <input
                                    type="tel" name="phone" value={formData.phone}
                                    onChange={handlePhoneChange}
                                    placeholder="9876543210" maxLength={10} inputMode="numeric"
                                    className={inputCls + ' pl-16'} disabled={loading}
                                />
                                {formData.phone.length > 0 && (
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        {isPhoneValid(formData.phone)
                                            ? <span className="text-green-500 font-bold">✓</span>
                                            : <span className="text-red-400 font-bold">✗</span>}
                                    </div>
                                )}
                            </div>
                            {formData.phone.length > 0 && !isPhoneValid(formData.phone) && (
                                <p className="mt-1.5 text-xs text-red-500">Must be 10 digits starting with 6–9</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel>Alternate Phone (Optional)</FieldLabel>
                            <input type="tel" placeholder="Enter alternate phone" className={inputCls} disabled />
                        </div>
                    </div>
                </Card>

                {/* 3. Pricing */}
                <Card>
                    <CardTitle title="Pricing Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input
                                type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleInputChange} placeholder="Amount" min="0"
                                className={inputCls} disabled={loading}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <div className="relative">
                                <select
                                    name="chargeType" value={formData.chargeType}
                                    onChange={handleInputChange}
                                    className={inputCls + ' appearance-none pr-10'}
                                    disabled={loading}
                                >
                                    {chargeTypeOptions.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 4. Description */}
                <Card>
                    <FieldLabel required>Description</FieldLabel>
                    <textarea
                        name="description" value={formData.description}
                        onChange={handleInputChange} rows={4}
                        placeholder="Describe your wedding service, specialties, and what makes you unique..."
                        className={inputCls + ' resize-none'} disabled={loading}
                    />
                </Card>

                {/* 5. Location */}
                <Card>
                    <CardTitle
                        title="Location Details"
                        action={
                            <button type="button" onClick={getCurrentLocation} disabled={locationLoading || loading}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg ${typography.misc.badge} text-white transition-opacity hover:opacity-90 disabled:opacity-60`}
                                style={{ backgroundColor: BRAND }}>
                                {locationLoading
                                    ? <><span className="animate-spin text-sm">⌛</span> Detecting...</>
                                    : <><MapPin className="w-4 h-4" /> Auto Detect</>}
                            </button>
                        }
                    />
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3.5 flex items-start gap-2 mb-3">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange}
                                placeholder="Area name" className={inputCls} disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                                placeholder="City" className={inputCls} disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                                placeholder="State" className={inputCls} disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                                placeholder="PIN code" className={inputCls} disabled={loading} />
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

                {/* 6. Photos */}
                <Card>
                    <CardTitle title={`Portfolio Photos (${totalImages}/5)`} />
                    <label className={`block ${maxImagesReached ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                            className="hidden" disabled={maxImagesReached || loading} />
                        <div className="border-2 border-dashed rounded-xl p-8 text-center"
                            style={{ borderColor: maxImagesReached ? '#d1d5db' : '#c7d9e6' }}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f4fb' }}>
                                    <Upload className="w-7 h-7" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.label} text-gray-600`}>
                                        {maxImagesReached ? 'Maximum limit reached' : 'Tap to upload portfolio photos'}
                                    </p>
                                    <p className={`${typography.body.xs} text-gray-400 mt-1`}>Maximum 5 images · 5 MB each</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {existingImages.filter(url => !imagesToDelete.includes(url)).map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square group">
                                    <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                                    <button type="button" onClick={() => handleRemoveExistingImage(url)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-1.5 left-1.5 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full`}
                                        style={{ backgroundColor: BRAND }}>Saved</span>
                                </div>
                            ))}
                            {imagePreviews.map((src, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl border-2" style={{ borderColor: BRAND }} />
                                    <button type="button" onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-1.5 left-1.5 bg-green-600 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full`}>New</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {imagesToDelete.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className={`${typography.body.small} text-red-700 mb-2`}>
                                Images marked for deletion ({imagesToDelete.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {imagesToDelete.map((url, i) => (
                                    <button key={i} onClick={() => handleRestoreExistingImage(url)}
                                        className="inline-flex items-center gap-1 text-xs bg-white border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">
                                        ↩ Restore image {i + 1}
                                    </button>
                                ))}
                            </div>
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
                        {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Service' : 'Create Service')}
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

export default WeddingForm;