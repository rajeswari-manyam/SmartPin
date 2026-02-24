import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    addIndustrialService,
    updateIndustrialService,
    getIndustrialServiceById,
} from '../services/IndustrialService.service';
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, ChevronDown } from 'lucide-react';
import { useAccount } from '../context/AccountContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const chargeTypeOptions = ['per hour', 'per day', 'per project', 'fixed rate', 'negotiable', 'per event'];

const getIndustrialSubcategories = (): string[] => {
    const cat = subcategoriesData.subcategories.find(c => c.categoryId === 15);
    return cat ? cat.items.map(i => i.name) : [
        'Borewell Services', 'Fabricators', 'Transporters', 'Water Tank Cleaning',
        'Scrap Dealers', 'Machine Repair', 'Movers & Packers',
    ];
};

const resolveUserId = (): string => {
    const keys = ['userId', 'user_id', 'uid', 'id', 'user', 'currentUser', 'loggedInUser', 'userData', 'userInfo', 'authUser'];
    for (const key of keys) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        if (raw.length > 10 && !raw.startsWith('{')) return raw;
        try {
            const p = JSON.parse(raw);
            const id = p._id || p.id || p.userId || p.user_id || p.uid;
            if (id) return String(id);
        } catch { }
    }
    return '';
};

// ── Shared Tailwind class strings ─────────────────────────────────────────────
const inputBase =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white outline-none transition-all duration-200 ' +
    'focus:border-[#00598a] focus:ring-2 focus:ring-[#00598a]/20';

const inputErr =
    'w-full px-4 py-3.5 border border-red-400 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white outline-none transition-all duration-200 ' +
    'focus:border-red-400 focus:ring-2 focus:ring-red-300/40';

// ── Field errors type ─────────────────────────────────────────────────────────
interface FieldErrors {
    serviceName?: string;
    phone?: string;
    description?: string;
    serviceCharge?: string;
    location?: string;
}

// ── Micro-components ──────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className="block text-base font-semibold text-gray-800 mb-2">
        {children}
        {required && <span className="text-[#00598a] ml-1">*</span>}
    </label>
);

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
    msg ? <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">⚠️ {msg}</p> : null;

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
    <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {action}
    </div>
);

const SelectWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative">
        {children}
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00598a] pointer-events-none" />
    </div>
);

// ── Geocoding ─────────────────────────────────────────────────────────────────
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
        );
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            return { lat, lng };
        }
        return null;
    } catch { return null; }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const IndustrialForm: React.FC = () => {
    const navigate = useNavigate();
    const { setAccountType } = useAccount();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const getSubFromUrl = () => {
        const s = new URLSearchParams(window.location.search).get('subcategory');
        return s ? s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
    };

    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const industrialTypes = getIndustrialSubcategories();
    const defaultType = getSubFromUrl() || industrialTypes[0] || 'Borewell Services';

    // ── UI state ──────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [locationWarning, setLocationWarning] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [isAvailable, setIsAvailable] = useState(true);
    const isGPSDetected = useRef(false);

    // ── Form state ────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        userId: resolveUserId(),
        serviceName: '',
        phone: '',
        category: 'Industrial',
        subCategory: defaultType,
        description: '',
        serviceCharge: '',
        chargeType: chargeTypeOptions[0],
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

    // ── Fetch edit data ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getIndustrialServiceById(editId);
                if (!response.success || !response.data) throw new Error('Service not found');
                const data = Array.isArray(response.data) ? response.data[0] : response.data;
                if (!data) throw new Error('Service not found');
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || prev.userId,
                    serviceName: data.serviceName || '',
                    phone: data.phone || '',
                    category: 'Industrial',
                    subCategory: data.subCategory || data.category || defaultType,
                    description: data.description || '',
                    serviceCharge: data.serviceCharge?.toString() || '',
                    chargeType: data.chargeType || chargeTypeOptions[0],
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                }));
                if (Array.isArray(data.images)) setExistingImages(data.images);
                if (data.availability !== undefined) setIsAvailable(data.availability);
            } catch (err) {
                console.error(err);
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Auto-geocode from typed address ───────────────────────────────────────
    useEffect(() => {
        const detect = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                const addr = [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ');
                const coords = await geocodeAddress(addr);
                if (coords) {
                    setFormData(prev => ({
                        ...prev,
                        latitude: coords.lat.toString(),
                        longitude: coords.lng.toString(),
                    }));
                }
            }
        };
        const t = setTimeout(detect, 1000);
        return () => clearTimeout(t);
    }, [formData.area, formData.city, formData.state, formData.pincode]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof FieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

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

    const removeNewImg = (i: number) => {
        setSelectedImages(p => p.filter((_, idx) => idx !== i));
        setImagePreviews(p => p.filter((_, idx) => idx !== i));
    };
    const removeExistingImg = (i: number) => setExistingImages(p => p.filter((_, idx) => idx !== i));

    // ── GPS location ──────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(''); setLocationWarning('');
        setFieldErrors(prev => ({ ...prev, location: undefined }));
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            setLocationLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async pos => {
                isGPSDetected.current = true;
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                if (pos.coords.accuracy > 500) {
                    setLocationWarning(`⚠️ Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify address.`);
                }
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
                } catch (e) { console.error(e); }
                setLocationLoading(false);
            },
            err => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = (): FieldErrors => {
        const errs: FieldErrors = {};
        if (!formData.serviceName.trim()) errs.serviceName = 'Service name is required';
        if (!formData.phone.trim()) {
            errs.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
            errs.phone = 'Enter a valid 10-digit Indian mobile number';
        }
        if (!formData.description.trim()) errs.description = 'Description is required';
        if (!formData.serviceCharge) errs.serviceCharge = 'Service charge is required';
        if (!formData.latitude || !formData.longitude) errs.location = 'Please provide a valid location';
        return errs;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError(''); setSuccessMessage('');

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            setError('Please fix the errors below before submitting');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            let uid = formData.userId;
            if (!uid) {
                uid = resolveUserId();
                if (uid) setFormData(prev => ({ ...prev, userId: uid }));
            }
            if (!uid) throw new Error('User not logged in. Please log out and log back in.');

            if (isEditMode && editId) {
                // phone is now a valid optional field in updateIndustrialService payload
                const res = await updateIndustrialService(editId, {
                    serviceName: formData.serviceName,
                    phone: formData.phone.trim(),
                    description: formData.description,
                    category: formData.category,
                    subCategory: formData.subCategory,
                    serviceCharge: parseFloat(formData.serviceCharge),
                    chargeType: formData.chargeType,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    area: formData.area,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    images: selectedImages,
                });
                if (!res.success) throw new Error(res.message || 'Failed to update service');
                setSuccessMessage('Service updated successfully!');
            } else {
                // phone is now a valid optional field in addIndustrialService payload
                const res = await addIndustrialService({
                    userId: uid,
                    serviceName: formData.serviceName,
                    phone: formData.phone.trim(),
                    description: formData.description,
                    category: formData.category,
                    subCategory: formData.subCategory,
                    serviceCharge: parseFloat(formData.serviceCharge),
                    chargeType: formData.chargeType,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    area: formData.area,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    images: selectedImages,
                });
                if (!res.success) throw new Error(res.message || 'Failed to create service');
                setSuccessMessage('Service created successfully!');
            }

            setTimeout(() => {
                setAccountType('worker');
                navigate('/my-business');
            }, 1500);
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    // ── Loading screen ────────────────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00598a] mx-auto mb-4" />
                    <p className="text-base text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    const totalImages = selectedImages.length + existingImages.length;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Go back"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">
                            {isEditMode ? 'Update Industrial Service' : 'Add Industrial Service'}
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {isEditMode ? 'Update your service details' : 'Create new industrial service listing'}
                        </p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-[#00598a]" />
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-10">

                {/* Global error banner */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2.5">
                        <span className="text-red-500 shrink-0 mt-0.5 text-lg">⚠️</span>
                        <div>
                            <p className="text-base font-semibold text-red-800 mb-0.5">Please fix the following</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success banner */}
                {successMessage && (
                    <div className="p-4 rounded-xl bg-[#00598a] border border-[#004a75] text-white flex items-center gap-2">
                        <span className="text-xl">✓</span>
                        <p className="text-base font-medium">{successMessage}</p>
                    </div>
                )}

                {/* ── 1. Basic Information ── */}
                <Card>
                    <CardTitle title="Basic Information" />
                    <div>
                        <FieldLabel required>Service Name</FieldLabel>
                        <input
                            type="text"
                            name="serviceName"
                            value={formData.serviceName}
                            onChange={handleChange}
                            placeholder="e.g., Packers & Movers"
                            className={fieldErrors.serviceName ? inputErr : inputBase}
                        />
                        <FieldError msg={fieldErrors.serviceName} />
                    </div>
                    <div>
                        <FieldLabel required>Service Type</FieldLabel>
                        <SelectWrap>
                            <select
                                name="subCategory"
                                value={formData.subCategory}
                                onChange={handleChange}
                                className={inputBase + ' appearance-none pr-10'}
                            >
                                {industrialTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </SelectWrap>
                    </div>
                </Card>

                {/* ── 2. Contact Information ── */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <div>
                        <FieldLabel required>Phone</FieldLabel>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter 10-digit mobile number"
                            maxLength={10}
                            className={fieldErrors.phone ? inputErr : inputBase}
                        />
                        <FieldError msg={fieldErrors.phone} />
                    </div>
                </Card>

                {/* ── 3. Pricing Details ── */}
                <Card>
                    <CardTitle title="Pricing Details" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input
                                type="number"
                                name="serviceCharge"
                                value={formData.serviceCharge}
                                onChange={handleChange}
                                placeholder="5000"
                                min="0"
                                className={fieldErrors.serviceCharge ? inputErr : inputBase}
                            />
                            <FieldError msg={fieldErrors.serviceCharge} />
                        </div>
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <SelectWrap>
                                <select
                                    name="chargeType"
                                    value={formData.chargeType}
                                    onChange={handleChange}
                                    className={inputBase + ' appearance-none pr-10'}
                                >
                                    {chargeTypeOptions.map(t => (
                                        <option key={t} value={t}>
                                            {t.replace(/\b\w/g, c => c.toUpperCase())}
                                        </option>
                                    ))}
                                </select>
                            </SelectWrap>
                        </div>
                    </div>

                    {/* Availability toggle */}
                    <div className="flex items-center justify-between py-1">
                        <span className="text-base font-semibold text-gray-800">Currently Available</span>
                        <button
                            type="button"
                            onClick={() => setIsAvailable(!isAvailable)}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                                isAvailable ? 'bg-[#00598a]' : 'bg-gray-300'
                            }`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                isAvailable ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>
                </Card>

                {/* ── 4. Service Description ── */}
                <Card>
                    <CardTitle title="Service Description" />
                    <div>
                        <FieldLabel required>Description</FieldLabel>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Describe your service in detail..."
                            className={(fieldErrors.description ? inputErr : inputBase) + ' resize-none'}
                        />
                        <FieldError msg={fieldErrors.description} />
                    </div>
                </Card>

                {/* ── 5. Service Photos ── */}
                <Card>
                    <CardTitle title="Service Photos (Optional)" />

                    {/* Upload zone */}
                    <label className={`block ${totalImages >= 5 ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={totalImages >= 5}
                        />
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                            totalImages >= 5
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-[#7ab3cc] bg-[#f0f7fb] hover:border-[#00598a] hover:bg-[#e8f2f8]'
                        }`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-[#e8f2f8] flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-[#00598a]" />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-gray-700">
                                        {totalImages >= 5 ? 'Maximum limit reached (5 images)' : 'Tap to upload service photos'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Max 5 images · 5 MB each · JPG, PNG, WEBP
                                    </p>
                                    {totalImages > 0 && (
                                        <p className="text-sm font-semibold text-[#00598a] mt-1">
                                            {totalImages}/5 uploaded ✓
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Thumbnail grid */}
                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square group">
                                    <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImg(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-1.5 left-1.5 bg-[#00598a] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((src, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-[#00598a]" />
                                    <button
                                        type="button"
                                        onClick={() => removeNewImg(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-1.5 left-1.5 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                        New
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* ── 6. Location Details ── */}
                <Card>
                    <CardTitle
                        title="Location Details"
                        action={
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={locationLoading}
                                className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#00598a] hover:bg-[#004a75] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {locationLoading
                                    ? <><span className="animate-spin text-sm">⌛</span> Detecting…</>
                                    : <><MapPin className="w-4 h-4" /> Auto Detect</>
                                }
                            </button>
                        }
                    />

                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3.5 flex items-start gap-2">
                            <span className="text-yellow-600 shrink-0">⚠️</span>
                            <p className="text-sm text-yellow-800">{locationWarning}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { name: 'area', label: 'Area', placeholder: 'Area name' },
                            { name: 'city', label: 'City', placeholder: 'City' },
                            { name: 'state', label: 'State', placeholder: 'State' },
                            { name: 'pincode', label: 'PIN Code', placeholder: 'PIN code' },
                        ].map(field => (
                            <div key={field.name}>
                                <FieldLabel required>{field.label}</FieldLabel>
                                <input
                                    type="text"
                                    name={field.name}
                                    value={(formData as any)[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className={inputBase}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Location validation error */}
                    {fieldErrors.location && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                            <p className="text-sm text-red-600 flex items-center gap-1.5">⚠️ {fieldErrors.location}</p>
                        </div>
                    )}

                    {/* GPS tip */}
                    {!formData.latitude && !formData.longitude && (
                        <div className="rounded-xl p-3.5 bg-[#e8f2f8] border border-[#b3d4e8]">
                            <p className="text-sm text-[#00598a]">
                                📍 <span className="font-semibold">Tip:</span> Click Auto Detect or enter your address manually above.
                            </p>
                        </div>
                    )}

                    {/* Location confirmed */}
                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className="text-sm text-green-800">
                                <span className="font-semibold">✓ Location detected: </span>
                                <span className="font-mono text-xs ml-1">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </Card>

                {/* ── Action Buttons ── */}
                <div className="flex gap-3 pt-2 pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !!successMessage}
                        type="button"
                        className="flex-1 py-4 rounded-xl font-bold text-base text-white bg-[#00598a] hover:bg-[#004a75] flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {loading
                            ? (isEditMode ? 'Updating…' : 'Creating…')
                            : successMessage
                                ? '✓ Done'
                                : (isEditMode ? 'Update Service' : 'Create Service')}
                    </button>

                    <button
                        onClick={() => window.history.back()}
                        type="button"
                        disabled={loading}
                        className="px-8 py-4 rounded-xl font-bold text-base text-white bg-[#00598a] hover:bg-[#004a75] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default IndustrialForm;