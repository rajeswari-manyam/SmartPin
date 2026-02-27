import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createBeautyWorker,
    updateBeautyWorker,
    getBeautyWorkerById,
} from '../services/Beauty.Service.service';
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { typography } from '../styles/typography';
import IconSelect from '../components/common/IconDropDown';
import { SUBCATEGORY_ICONS } from '../assets/subcategoryIcons';

// ─────────────────────────────────────────────────────────────────────────────
const BRAND      = '#00598a';
const BRAND_DARK = '#004a73';

const availabilityOptions = ['Full Time', 'Part Time', 'On Demand', 'Weekends Only'];

// ── Pull beauty subcategories — adjust categoryId to match your data ──────────
const getBeautySubcategories = (): string[] => {
    const cat = (subcategoriesData as any).subcategories.find((c: any) => c.categoryId === 5);
    return cat ? cat.items.map((i: any) => i.name) : ['Beauty Salon', 'Spa', 'Makeup Artist'];
};

const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

// ── Shared layout components (identical to HospitalForm) ─────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>{children}</div>
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

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-2 gap-6">{children}</div>
);

// ============================================================================
// COMPONENT
// ============================================================================
const BeautyServiceForm: React.FC = () => {
    const navigate = useNavigate();
    const { setAccountType } = useAccount();

    const getIdFromUrl  = () => new URLSearchParams(window.location.search).get('id');
    const getSubFromUrl = () => {
        const s = new URLSearchParams(window.location.search).get('subcategory');
        return s ? s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
    };

    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const beautyTypes  = getBeautySubcategories();
    const defaultType  = getSubFromUrl() || beautyTypes[0] || 'Beauty Salon';

    const [loading,        setLoading]        = useState(false);
    const [loadingData,    setLoadingData]    = useState(false);
    const [error,          setError]          = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationWarning, setLocationWarning] = useState('');
    const isGPSDetected = useRef(false);

    // ── Form fields ───────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        userId:        localStorage.getItem('userId') || '',
        name:          '',
        beautyType:    defaultType,
        email:         '',
        phone:         '',
        bio:           '',
        services:      '',
        serviceCharge: '',
        area:          '',
        city:          '',
        state:         '',
        pincode:       '',
        latitude:      '',
        longitude:     '',
        experience:    '',
        availability:  availabilityOptions[0],
    });

    const [isCurrentlyAvailable, setIsCurrentlyAvailable] = useState(true);
    const [selectedImages,  setSelectedImages]  = useState<File[]>([]);
    const [imagePreviews,   setImagePreviews]   = useState<string[]>([]);
    const [existingImages,  setExistingImages]  = useState<string[]>([]);

    // ── Fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        (async () => {
            setLoadingData(true);
            try {
                const data = await getBeautyWorkerById(editId);
                if (!data) throw new Error('Service not found');

                const servicesStr = Array.isArray(data.services)
                    ? data.services.join(', ')
                    : (data.services || '');

                const availStr = typeof data.availability === 'boolean'
                    ? (data.availability ? 'Full Time' : 'Part Time')
                    : (data.availability || availabilityOptions[0]);

                setFormData(prev => ({
                    ...prev,
                    userId:        data.userId || prev.userId,
                    name:          data.name          || '',
                    beautyType:    (data as any).type || (data as any).subCategory || defaultType,
                    email:         data.email         || '',
                    phone:         data.phone         || '',
                    bio:           data.bio           || '',
                    services:      servicesStr,
                    serviceCharge: data.serviceCharge?.toString() || '',
                    area:          data.area          || '',
                    city:          data.city          || '',
                    state:         data.state         || '',
                    pincode:       data.pincode       || '',
                    latitude:      data.latitude?.toString()  || '',
                    longitude:     data.longitude?.toString() || '',
                    experience:    data.experience?.toString()|| '',
                    availability:  availStr,
                }));
                setIsCurrentlyAvailable(
                    typeof data.availability === 'boolean'
                        ? data.availability
                        : (data.availability === 'Full Time' || data.availability === 'On Demand')
                );
                if (Array.isArray(data.images)) setExistingImages(data.images);
            } catch {
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        })();
    }, [editId]);

    // ── Auto-geocode ──────────────────────────────────────────────────────────
    useEffect(() => {
        const run = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                try {
                    const q   = [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ');
                    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`);
                    const [hit] = await res.json();
                    if (hit) setFormData(p => ({ ...p, latitude: hit.lat, longitude: hit.lon }));
                } catch { }
            }
        };
        const t = setTimeout(run, 1000);
        return () => clearTimeout(t);
    }, [formData.area, formData.city, formData.state, formData.pincode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(p => ({ ...p, [name]: value }));
    };

    // ── Image helpers ─────────────────────────────────────────────────────────
    const totalImages      = selectedImages.length + existingImages.length;
    const maxImagesReached = totalImages >= 5;

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const slots = 5 - totalImages;
        if (slots <= 0) { setError('Maximum 5 images allowed'); return; }
        const valid = files.slice(0, slots).filter(f => {
            if (!f.type.startsWith('image/')) { setError(`${f.name} is not a valid image`); return false; }
            if (f.size > 5 * 1024 * 1024) { setError(`${f.name} exceeds 5 MB`); return false; }
            return true;
        });
        if (!valid.length) return;
        const previews: string[] = [];
        valid.forEach(f => {
            const r = new FileReader();
            r.onloadend = () => {
                previews.push(r.result as string);
                if (previews.length === valid.length) setImagePreviews(p => [...p, ...previews]);
            };
            r.readAsDataURL(f);
        });
        setSelectedImages(p => [...p, ...valid]);
        setError('');
    };

    const handleRemoveNewImage      = (i: number) => { setSelectedImages(p => p.filter((_, x) => x !== i)); setImagePreviews(p => p.filter((_, x) => x !== i)); };
    const handleRemoveExistingImage = (i: number) => setExistingImages(p => p.filter((_, x) => x !== i));

    // ── GPS ───────────────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(''); setLocationWarning('');
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async pos => {
                isGPSDetected.current = true;
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                if (pos.coords.accuracy > 500)
                    setLocationWarning(`⚠️ Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify.`);
                setFormData(p => ({ ...p, latitude: lat, longitude: lng }));
                try {
                    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data.address) {
                        setFormData(p => ({
                            ...p, latitude: lat, longitude: lng,
                            area:    data.address.suburb || data.address.neighbourhood || data.address.road || p.area,
                            city:    data.address.city   || data.address.town || data.address.village || p.city,
                            state:   data.address.state  || p.state,
                            pincode: data.address.postcode || p.pincode,
                        }));
                    }
                } catch { }
                setLocationLoading(false);
            },
            err => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError(''); setSuccessMessage('');

        if (!formData.name.trim())    { setError('Business / professional name is required.'); return; }
        if (!formData.beautyType)     { setError('Please select a beauty service type.'); return; }
        if (!formData.phone.trim())   { setError('Phone number is required.'); return; }
        if (!/^\+?[\d\s\-()]{7,}$/.test(formData.phone.trim())) { setError('Please enter a valid phone number.'); return; }
        if (!formData.email.trim())   { setError('Email address is required.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) { setError('Please enter a valid email.'); return; }
        if (!formData.services.trim()) { setError('Please enter at least one service.'); return; }
        if (!formData.area.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim())
            { setError('Please fill in all location fields.'); return; }
        if (!/^\d{6}$/.test(formData.pincode.trim())) { setError('PIN code must be exactly 6 digits.'); return; }
        if (!formData.latitude || !formData.longitude) { setError('Please detect your location.'); return; }

        setLoading(true);
        try {
            const servicesArray = formData.services.split(',').map(s => s.trim()).filter(Boolean);
            const charge        = formData.serviceCharge.trim() ? parseFloat(formData.serviceCharge) : 0;
            const exp           = formData.experience.trim() ? parseInt(formData.experience, 10) : 0;

            const payload = {
                userId:        formData.userId,
                name:          formData.name.trim(),
                email:         formData.email.trim(),
                phone:         formData.phone.trim(),
                type:          formData.beautyType,
                bio:           formData.bio.trim(),
                services:      servicesArray,
                serviceCharge: charge,
                experience:    exp,
                area:          formData.area.trim(),
                city:          formData.city.trim(),
                state:         formData.state.trim(),
                pincode:       formData.pincode.trim(),
                latitude:      parseFloat(formData.latitude),
                longitude:     parseFloat(formData.longitude),
                availability:  formData.availability,
            };

            if (isEditMode && editId) {
                await updateBeautyWorker(editId, payload, selectedImages);
                setSuccessMessage('Service updated successfully!');
            } else {
                await createBeautyWorker(payload, selectedImages);
                setSuccessMessage('Service created successfully!');
            }
            setTimeout(() => { setAccountType('worker'); navigate('/my-business'); }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Loading screen ────────────────────────────────────────────────────────
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
                            {isEditMode ? 'Update Beauty Service' : 'Add Beauty Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your beauty listing' : 'Create new beauty listing'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-8 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
                        <div>
                            <p className="font-semibold text-red-800 mb-0.5">Error</p>
                            <p className={`${typography.form.error}`}>{error}</p>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <span className="text-green-600">✓</span>
                        <p className={`${typography.body.small} text-green-700`}>{successMessage}</p>
                    </div>
                )}

                {/* ─── ROW 1: Name + Beauty Type ─── */}
                <Card>
                    <TwoCol>
                        <div>
                            <FieldLabel required>Business / Professional Name</FieldLabel>
                            <input
                                type="text" name="name" value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Glam Beauty Salon"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Beauty Type</FieldLabel>
                            <IconSelect
                                label=""
                                value={formData.beautyType}
                                placeholder="Select beauty type"
                                options={beautyTypes.map(t => ({
                                    name: t,
                                    icon: SUBCATEGORY_ICONS[t],
                                }))}
                                onChange={(val) => setFormData(p => ({ ...p, beautyType: val }))}
                                disabled={loading}
                            />
                        </div>
                    </TwoCol>
                </Card>

                {/* ─── ROW 2: Contact ─── */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <TwoCol>
                        <div>
                            <FieldLabel required>Phone Number</FieldLabel>
                            <input
                                type="tel" name="phone" value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter phone number"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Email Address</FieldLabel>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                                className={inputCls}
                            />
                        </div>
                    </TwoCol>
                </Card>

                {/* ─── ROW 3: Services + Bio ─── */}
                <Card>
                    <CardTitle title="Service Details" />
                    <TwoCol>
                        <div>
                            <FieldLabel required>Services Offered</FieldLabel>
                            <textarea
                                name="services" value={formData.services}
                                onChange={handleChange} rows={4}
                                placeholder="Haircut, Hair Coloring, Facial, Makeup, Manicure"
                                className={inputCls + ' resize-none'}
                            />
                            <p className={`${typography.body.xs} text-gray-400 mt-1`}>
                                💡 Separate each service with a comma
                            </p>
                            {formData.services.trim() && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.services.split(',').map((s, i) => {
                                        const t = s.trim();
                                        if (!t) return null;
                                        return (
                                            <span key={i}
                                                className={`inline-flex items-center gap-1.5 pl-3 pr-3 py-1.5 rounded-full ${typography.misc.badge} text-white`}
                                                style={{ backgroundColor: BRAND }}>
                                                ✓ {t}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div>
                            <FieldLabel>Bio</FieldLabel>
                            <textarea
                                name="bio" value={formData.bio}
                                onChange={handleChange} rows={4}
                                placeholder="Tell clients about yourself and your expertise..."
                                className={inputCls + ' resize-none'}
                            />
                        </div>
                    </TwoCol>
                </Card>

                {/* ─── ROW 4: Pricing + Availability ─── */}
                <Card>
                    <CardTitle title="Pricing & Availability" />
                    <TwoCol>
                        <div>
                            <FieldLabel>Service Charge (₹)</FieldLabel>
                            <input
                                type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleChange} placeholder="Amount" min="0"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel>Experience (years)</FieldLabel>
                            <input
                                type="number" name="experience" value={formData.experience}
                                onChange={handleChange} placeholder="Years of experience" min="0"
                                className={inputCls}
                            />
                        </div>
                    </TwoCol>
                    <TwoCol>
                        <div>
                            <FieldLabel>Availability</FieldLabel>
                            <select name="availability" value={formData.availability}
                                onChange={handleChange} className={inputCls + ' appearance-none'}>
                                {availabilityOptions.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-4 pt-7">
                            <span className={`${typography.body.small} font-semibold text-gray-700`}>Currently Available</span>
                            <button
                                type="button"
                                onClick={() => {
                                    const next = !isCurrentlyAvailable;
                                    setIsCurrentlyAvailable(next);
                                    setFormData(p => ({ ...p, availability: next ? 'Full Time' : 'Part Time' }));
                                }}
                                className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0"
                                style={{ backgroundColor: isCurrentlyAvailable ? BRAND : '#d1d5db' }}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isCurrentlyAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </TwoCol>
                </Card>

                {/* ─── ROW 5: Location ─── */}
                <Card>
                    <CardTitle
                        title="Location Details"
                        action={
                            <button
                                type="button" onClick={getCurrentLocation} disabled={locationLoading}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white
                                    transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                style={{ backgroundColor: BRAND }}
                                onMouseEnter={e => !locationLoading && ((e.currentTarget as HTMLElement).style.backgroundColor = BRAND_DARK)}
                                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.backgroundColor = BRAND)}
                            >
                                {locationLoading
                                    ? <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                                    : <><MapPin className="w-4 h-4 inline mr-1" />Auto Detect</>}
                            </button>
                        }
                    />

                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 shrink-0">⚠️</span>
                            <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
                        </div>
                    )}

                    <TwoCol>
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area}
                                onChange={handleChange} placeholder="e.g. Banjara Hills" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city}
                                onChange={handleChange} placeholder="e.g. Hyderabad" className={inputCls} />
                        </div>
                    </TwoCol>
                    <TwoCol>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state}
                                onChange={handleChange} placeholder="e.g. Telangana" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode}
                                onChange={handleChange} placeholder="6-digit PIN code" className={inputCls} />
                        </div>
                    </TwoCol>

                    <div className="rounded-xl p-3.5" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                        <p className={`${typography.body.xs} font-medium`} style={{ color: '#92400e' }}>
                            💡 <span className="font-semibold">Tip:</span> Click "Auto Detect" to fill location automatically from your device GPS.
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className={`${typography.body.xs} font-medium text-green-800`}>
                                <span className="font-bold">✓ Location detected: </span>
                                <span className="font-mono">
                                    {parseFloat(formData.latitude).toFixed(5)}, {parseFloat(formData.longitude).toFixed(5)}
                                </span>
                            </p>
                        </div>
                    )}
                </Card>

                {/* ─── ROW 6: Photos ─── */}
                <Card>
                    <CardTitle title={`Portfolio Photos (${totalImages}/5)`} />
                    <TwoCol>
                        <label className={`block ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                                className="hidden" disabled={maxImagesReached} />
                            <div
                                className="border-2 border-dashed rounded-2xl p-10 text-center h-full flex items-center justify-center transition-colors"
                                style={{
                                    borderColor:     maxImagesReached ? '#d1d5db' : '#7ab3cc',
                                    backgroundColor: maxImagesReached ? '#f9fafb' : 'rgba(0,89,138,0.04)',
                                    minHeight: '180px',
                                }}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: 'rgba(0,89,138,0.1)' }}>
                                        <Upload className="w-8 h-8" style={{ color: BRAND }} />
                                    </div>
                                    <div>
                                        <p className={`${typography.form.label} text-gray-700 font-medium`}>
                                            {maxImagesReached ? 'Maximum limit reached' : `Add Photos (${5 - totalImages} slots left)`}
                                        </p>
                                        <p className={`${typography.body.xs} text-gray-400 mt-1`}>
                                            Maximum 5 images · 5 MB each
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </label>

                        {(existingImages.length > 0 || imagePreviews.length > 0) ? (
                            <div className="grid grid-cols-3 gap-3">
                                {existingImages.map((url, i) => (
                                    <div key={`ex-${i}`} className="relative aspect-square group">
                                        <img src={url} alt="" className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                        <button type="button" onClick={() => handleRemoveExistingImage(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className={`absolute bottom-1.5 left-1.5 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full text-xs`}
                                            style={{ backgroundColor: BRAND }}>Saved</span>
                                    </div>
                                ))}
                                {imagePreviews.map((src, i) => (
                                    <div key={`new-${i}`} className="relative aspect-square group">
                                        <img src={src} alt="" className="w-full h-full object-cover rounded-xl border-2" style={{ borderColor: BRAND }} />
                                        <button type="button" onClick={() => handleRemoveNewImage(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-1.5 left-1.5 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl"
                                style={{ minHeight: '180px' }}>
                                <p className={`${typography.body.small} text-gray-400`}>Uploaded images will appear here</p>
                            </div>
                        )}
                    </TwoCol>
                </Card>

                {/* ── Action Buttons ── */}
                <div className="flex gap-4 pt-2 pb-8 justify-end">
                    <button
                        type="button" onClick={() => window.history.back()} disabled={loading}
                        className={`px-10 py-3.5 rounded-xl font-semibold
                            text-[#00598a] bg-white border-2 border-[#00598a]
                            hover:bg-[#00598a] hover:text-white
                            active:bg-[#004a73] active:text-white
                            transition-all ${typography.body.base}
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Cancel
                    </button>
                    <button
                        type="button" onClick={handleSubmit} disabled={loading}
                        className={`px-10 py-3.5 rounded-xl font-semibold text-white
                            transition-all shadow-md hover:shadow-lg
                            bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                            ${typography.body.base}
                            ${loading ? 'cursor-not-allowed opacity-70' : ''}`}>
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : (
                            isEditMode ? 'Update Service' : 'Create Service'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BeautyServiceForm;