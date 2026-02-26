import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    addIndustrialService,
    updateIndustrialService,
    getIndustrialServiceById,
} from '../services/IndustrialService.service';
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

// ── Constants ─────────────────────────────────────────────────────────────────
const BRAND = '#00598a';

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
    'w-full px-4 py-3 border border-gray-300 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white outline-none transition-all duration-200 ' +
    'focus:border-[#00598a] focus:ring-2 focus:ring-[#00598a]/20';

const inputErr =
    'w-full px-4 py-3 border border-red-400 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white outline-none transition-all duration-200 ' +
    'focus:border-red-400 focus:ring-2 focus:ring-red-300/40';

const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
};

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
        {required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
    msg ? <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">⚠️ {msg}</p> : null;

const SectionCard: React.FC<{
    title?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}> = ({ title, children, action }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        {title && (
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {action}
            </div>
        )}
        {children}
    </div>
);

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
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
    
    // ── Prepare subcategory options with icons ───────────────────────────────
    const subcategoryOptions = industrialTypes.map((name: string) => ({
        name,
        icon: SUBCATEGORY_ICONS[name],
    }));
    
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND }} />
                    <p className="text-base text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    const totalImages = selectedImages.length + existingImages.length;
    const maxImagesReached = totalImages >= 5;

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
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
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isEditMode ? 'Update your service details' : 'Create new industrial service listing'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Container ── */}
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

                {/* Global error banner */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2.5">
                        <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
                        <div>
                            <p className="text-base font-semibold text-red-800 mb-0.5">Please fix the following</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success banner */}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <span className="text-green-600 text-lg">✓</span>
                        <p className="text-sm text-green-700 font-medium">{successMessage}</p>
                    </div>
                )}

                {/* ── 1. Basic Information ── */}
                <SectionCard title="Basic Information">
                    <TwoCol>
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
                            <IconSelect
                                label=""
                                value={formData.subCategory}
                                placeholder="Select service type"
                                options={subcategoryOptions}
                                onChange={(val) =>
                                    setFormData(prev => ({ ...prev, subCategory: val }))
                                }
                                disabled={loading}
                            />
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ── 2. Contact Information ── */}
                <SectionCard title="Contact Information">
                    <TwoCol>
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
                        {/* Empty right column for balance */}
                        <div />
                    </TwoCol>
                </SectionCard>

                {/* ── 3. Pricing Details ── */}
                <SectionCard title="Pricing Details">
                    <TwoCol>
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
                            <select
                                name="chargeType"
                                value={formData.chargeType}
                                onChange={handleChange}
                                className={inputBase + ' appearance-none bg-white'}
                                style={selectStyle}
                            >
                                {chargeTypeOptions.map(t => (
                                    <option key={t} value={t}>
                                        {t.replace(/\b\w/g, c => c.toUpperCase())}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </TwoCol>

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
                </SectionCard>

                {/* ── 4. Service Description ── */}
                <SectionCard title="Service Description">
                    <TwoCol>
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
                        {/* Empty right column for balance */}
                        <div />
                    </TwoCol>
                </SectionCard>

                {/* ── 5. Service Photos ── */}
                <SectionCard title={`Service Photos (${totalImages}/5)`}>
                    <TwoCol>
                        {/* Upload zone */}
                        <label className={`block ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={maxImagesReached}
                            />
                            <div
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition h-full flex items-center justify-center ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                style={{
                                    borderColor: maxImagesReached ? '#d1d5db' : '#00598a',
                                    backgroundColor: maxImagesReached ? '#f9fafb' : '#f0f7fb',
                                    minHeight: '180px',
                                }}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0eff7' }}>
                                        <Upload className="w-8 h-8" style={{ color: BRAND }} />
                                    </div>
                                    <div>
                                        <p className="text-base font-semibold text-gray-700">
                                            {maxImagesReached
                                                ? 'Maximum 5 images reached'
                                                : `Add Photos (${5 - totalImages} slots left)`}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            Max 5 images · 5 MB each · JPG, PNG, WEBP
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </label>

                        {/* Thumbnail grid */}
                        {(existingImages.length > 0 || imagePreviews.length > 0) ? (
                            <div className="grid grid-cols-3 gap-3">
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
                                        <span 
                                            className="absolute bottom-1.5 left-1.5 text-white text-xs px-2 py-0.5 rounded-full font-medium"
                                            style={{ backgroundColor: BRAND }}
                                        >
                                            Saved
                                        </span>
                                    </div>
                                ))}
                                {imagePreviews.map((src, i) => (
                                    <div key={`new-${i}`} className="relative aspect-square group">
                                        <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2" style={{ borderColor: BRAND }} />
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
                        ) : (
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl text-center"
                                style={{ minHeight: '180px' }}>
                                <p className="text-sm text-gray-400">Uploaded images will appear here</p>
                            </div>
                        )}
                    </TwoCol>
                </SectionCard>

                {/* ── 6. Location Details ── */}
                <SectionCard
                    title="Location Details"
                    action={
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                            style={{ backgroundColor: BRAND }}
                        >
                            {locationLoading
                                ? <><span className="animate-spin text-sm">⌛</span> Detecting...</>
                                : <><MapPin className="w-4 h-4" /> Auto Detect</>
                            }
                        </button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3.5 flex items-start gap-2">
                            <span className="text-yellow-600 shrink-0">⚠️</span>
                            <p className="text-sm text-yellow-800">{locationWarning}</p>
                        </div>
                    )}

                    {/* Area + City */}
                    <TwoCol>
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input
                                type="text"
                                name="area"
                                value={formData.area}
                                onChange={handleChange}
                                placeholder="Area name"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                className={inputBase}
                            />
                        </div>
                    </TwoCol>

                    {/* State + PIN */}
                    <TwoCol>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="State"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                placeholder="PIN code"
                                className={inputBase}
                            />
                        </div>
                    </TwoCol>

                    {/* Location validation error */}
                    {fieldErrors.location && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                            <p className="text-sm text-red-600 flex items-center gap-1.5">⚠️ {fieldErrors.location}</p>
                        </div>
                    )}

                    {/* GPS tip */}
                    {!formData.latitude && !formData.longitude && (
                        <div className="rounded-xl p-3.5 bg-amber-50 border border-amber-200">
                            <p className="text-sm text-amber-800">
                                📍 <span className="font-medium">Tip:</span> Use auto-detect to fill location automatically from your device GPS.
                            </p>
                        </div>
                    )}

                    {/* Location confirmed */}
                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className="text-sm text-green-800">
                                <span className="font-semibold">✓ Location set: </span>
                                <span className="font-mono text-xs ml-1">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ── Action Buttons ── */}
                <div className="flex gap-4 pt-2 pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !!successMessage}
                        type="button"
                        className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg text-base ${loading || successMessage ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                        style={{ backgroundColor: BRAND }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : successMessage ? (
                            <span className="flex items-center justify-center gap-2"><span>✓</span> Done</span>
                        ) : (
                            isEditMode ? 'Update Service' : 'Create Service'
                        )}
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        type="button"
                        disabled={loading}
                        className={`px-8 py-3.5 rounded-xl font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default IndustrialForm;