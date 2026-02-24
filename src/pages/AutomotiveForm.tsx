import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAutomotive, updateAutomotive, getAutomotiveById, CreateAutomotiveData } from "../services/AutomotiveServcie.service";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, ChevronDown } from 'lucide-react';
import { useAccount } from "../context/AccountContext";

const BRAND = '#00598a';
const BRAND_DARK = '#00446a';

// ── Availability options ─────────────────────────────────────────────────────
const availabilityOptions = ['Full Time', 'Part Time', 'On Demand', '24/7', 'Weekends Only'];

// ── Pull automotive subcategories from JSON (categoryId 9) ──────────────────
const getAutomotiveSubcategories = () => {
    const automotiveCategory = subcategoriesData.subcategories.find(
        (cat: any) => cat.categoryId === 9
    );
    return automotiveCategory ? automotiveCategory.items.map((item: any) => item.name) : [];
};

// ============================================================================
// SHARED INPUT CLASS
// ============================================================================
const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
};

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================
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

// ============================================================================
// COMPONENT
// ============================================================================
const AutomotiveForm = () => {
    const navigate = useNavigate();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const getSubcategoryFromUrl = () => {
        const sub = new URLSearchParams(window.location.search).get('subcategory');
        return sub ? sub.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
    };

    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const businessTypes = getAutomotiveSubcategories();
    const defaultType = getSubcategoryFromUrl() || businessTypes[0] || 'Car Service Center';
    const { setAccountType } = useAccount();

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: '',
        businessType: defaultType,
        email: '',
        phone: '',
        description: '',
        services: '',
        priceRange: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        experience: '',
        availability: availabilityOptions[0],
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);

    // ── fetch for edit ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getAutomotiveById(editId);
                const data = response.data;
                if (!data) throw new Error('Service not found');
                setFormData((prev) => ({
                    ...prev,
                    userId: data.userId || '',
                    name: data.name || '',
                    businessType: data.businessType || defaultType,
                    email: data.email || '',
                    phone: data.phone || '',
                    description: data.description || '',
                    services: Array.isArray(data.services) ? data.services.join(', ') : (data.services || ''),
                    priceRange: data.priceRange || '',
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                    experience: data.experience?.toString() || '',
                    availability: data.availability || availabilityOptions[0],
                }));
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch (err) {
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ── image helpers ────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const availableSlots = 5 - (selectedImages.length + existingImages.length);
        if (availableSlots <= 0) { setError('Maximum 5 images allowed'); return; }
        const validFiles = files.slice(0, availableSlots).filter((file) => {
            if (!file.type.startsWith('image/')) { setError(`${file.name} is not a valid image`); return false; }
            if (file.size > 5 * 1024 * 1024) { setError(`${file.name} exceeds 5 MB`); return false; }
            return true;
        });
        if (!validFiles.length) return;
        const newPreviews: string[] = [];
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === validFiles.length) setImagePreviews((prev) => [...prev, ...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
        setSelectedImages((prev) => [...prev, ...validFiles]);
        setError('');
    };

    const handleRemoveNewImage = (i: number) => {
        setSelectedImages((prev) => prev.filter((_, idx) => idx !== i));
        setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
    };
    const handleRemoveExistingImage = (i: number) => setExistingImages((prev) => prev.filter((_, idx) => idx !== i));

    // ── geolocation ──────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError('');
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data.address) {
                        setFormData((prev) => ({
                            ...prev,
                            area: data.address.suburb || data.address.neighbourhood || data.address.road || prev.area,
                            city: data.address.city || data.address.town || data.address.village || prev.city,
                            state: data.address.state || prev.state,
                            pincode: data.address.postcode || prev.pincode,
                        }));
                    }
                } catch (e) { console.error(e); }
                setLocationLoading(false);
            },
            (err) => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const safeServices =
        typeof formData.services === 'string'
            ? formData.services
            : Array.isArray(formData.services)
                ? (formData.services as string[]).join(', ')
                : '';

    // ── submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError(''); setSuccessMessage('');

        const trimmedName = formData.name.trim();
        const trimmedPhone = formData.phone.trim();
        const trimmedEmail = formData.email.trim();
        const trimmedServices = safeServices.trim();
        const trimmedArea = formData.area.trim();
        const trimmedCity = formData.city.trim();
        const trimmedState = formData.state.trim();
        const trimmedPincode = formData.pincode.trim();
        const trimmedExperience = formData.experience.trim();
        const trimmedPriceRange = formData.priceRange.trim();

        if (!trimmedName) { setError('Business name is required.'); return; }
        if (!trimmedPhone) { setError('Phone number is required.'); return; }
        if (!/^[0-9+\-\s]{7,15}$/.test(trimmedPhone)) { setError('Please enter a valid phone number.'); return; }
        if (!trimmedEmail) { setError('Email address is required.'); return; }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) { setError('Please enter a valid email address.'); return; }
        if (!trimmedServices) { setError('Please add at least one service.'); return; }
        if (!trimmedArea) { setError('Area is required.'); return; }
        if (!trimmedCity) { setError('City is required.'); return; }
        if (!trimmedState) { setError('State is required.'); return; }
        if (!trimmedPincode) { setError('PIN code is required.'); return; }
        if (!/^\d{6}$/.test(trimmedPincode)) { setError('PIN code must be exactly 6 digits.'); return; }
        if (!formData.latitude || !formData.longitude) {
            setError('Location coordinates are required. Please use Auto Detect.');
            return;
        }

        const parsedLat = parseFloat(formData.latitude);
        const parsedLng = parseFloat(formData.longitude);
        if (isNaN(parsedLat) || isNaN(parsedLng)) { setError('Invalid location coordinates. Please re-detect.'); return; }

        const servicesArray = trimmedServices.split(',').map((s) => s.trim()).filter(Boolean);

        const payload: CreateAutomotiveData = {
            userId: formData.userId,
            name: trimmedName,
            businessType: formData.businessType,
            phone: trimmedPhone,
            email: trimmedEmail,
            services: servicesArray,
            experience: trimmedExperience,
            availability: formData.availability,
            area: trimmedArea,
            city: trimmedCity,
            state: trimmedState,
            pincode: trimmedPincode,
            latitude: parsedLat.toString(),
            longitude: parsedLng.toString(),
            priceRange: trimmedPriceRange,
            description: formData.description.trim(),
            images: selectedImages,
        };

        setLoading(true);
        try {
            if (isEditMode && editId) {
                await updateAutomotive(editId, payload);
                setSuccessMessage('Service updated successfully!');
            } else {
                await createAutomotive(payload);
                setSuccessMessage('Service created successfully!');
            }
            setTimeout(() => { setAccountType("worker"); navigate("/my-business"); }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── loading screen ───────────────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND }} />
                    <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
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
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className={`${typography.heading.h5} text-gray-900 leading-tight`}>
                            {isEditMode ? 'Update Service' : 'Add New Service'}
                        </h1>
                        <p className={`${typography.body.xs} text-gray-400 mt-0.5`}>
                            {isEditMode ? 'Update your automotive service' : 'Register your automotive business'}
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

                {/* ─── 1. BUSINESS NAME + BUSINESS TYPE (two columns) ──────── */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Business Name</FieldLabel>
                            <input
                                type="text" name="name" value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., SpeedPro Auto Services"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Business Type</FieldLabel>
                            <div className="relative">
                                <select
                                    name="businessType" value={formData.businessType}
                                    onChange={handleInputChange}
                                    className={inputCls + ' appearance-none pr-10'}
                                >
                                    {businessTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ─── 2. CONTACT INFORMATION (two columns) ────────────────── */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Phone</FieldLabel>
                            <input
                                type="tel" name="phone" value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="e.g., 9876543210"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Email</FieldLabel>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleInputChange}
                                placeholder="e.g., contact@autobusiness.com"
                                className={inputCls}
                            />
                        </div>
                    </div>
                </Card>

                {/* ─── 3. PROFESSIONAL DETAILS (two columns) ───────────────── */}
                <Card>
                    <CardTitle title="Professional Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Experience (years)</FieldLabel>
                            <input
                                type="number" name="experience" value={formData.experience}
                                onChange={handleInputChange}
                                placeholder="Years of experience" min="0"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Price Range (₹)</FieldLabel>
                            <input
                                type="text" name="priceRange" value={formData.priceRange}
                                onChange={handleInputChange}
                                placeholder="e.g., 500-5000"
                                className={inputCls}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <FieldLabel>Availability</FieldLabel>
                            <div className="relative">
                                <select
                                    name="availability" value={formData.availability}
                                    onChange={handleInputChange}
                                    className={inputCls + ' appearance-none pr-10'}
                                >
                                    {availabilityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        {/* Empty column to keep the grid balanced */}
                        <div className="hidden md:block" />
                    </div>
                </Card>

                {/* ─── 4. SERVICES OFFERED (full width — complex input) ─────── */}
                <Card>
                    <CardTitle title="Services Offered" />
                    <div>
                        <FieldLabel required>Available Services</FieldLabel>
                        <textarea
                            name="services" value={safeServices}
                            onChange={handleInputChange} rows={3}
                            placeholder="Oil Change, Tyre Rotation, Engine Tuning, Brake Repair, AC Service"
                            className={inputCls + ' resize-none'}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>
                            💡 Separate each service with a comma
                        </p>
                    </div>

                    {safeServices && safeServices.trim() && (
                        <div className="mt-3">
                            <p className={`${typography.body.small} font-medium text-gray-700 mb-2`}>
                                Selected Services ({safeServices.split(',').filter((s) => s.trim()).length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {safeServices.split(',').map((s, i) => {
                                    const trimmed = s.trim();
                                    if (!trimmed) return null;
                                    return (
                                        <span key={i}
                                            className={`inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-2 rounded-full ${typography.misc.badge} text-white`}
                                            style={{ backgroundColor: BRAND }}>
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {trimmed}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </Card>

                {/* ─── 5. DESCRIPTION (full width) ─────────────────────────── */}
                <Card>
                    <FieldLabel>Description</FieldLabel>
                    <textarea
                        name="description" value={formData.description}
                        onChange={handleInputChange} rows={4}
                        placeholder="Tell customers about your business, specializations, and what makes you stand out..."
                        className={inputCls + ' resize-none'}
                    />
                </Card>

                {/* ─── 6. LOCATION (two columns) ───────────────────────────── */}
                <Card>
                    <CardTitle
                        title="Location Details"
                        action={
                            <button
                                type="button" onClick={getCurrentLocation} disabled={locationLoading}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg ${typography.misc.badge} text-white transition-opacity hover:opacity-90 disabled:opacity-60`}
                                style={{ backgroundColor: BRAND }}>
                                {locationLoading
                                    ? <><span className="animate-spin text-sm">⌛</span> Detecting...</>
                                    : <><MapPin className="w-4 h-4" /> Auto Detect</>}
                            </button>
                        }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area}
                                onChange={handleInputChange} placeholder="e.g., Jubilee Hills" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city}
                                onChange={handleInputChange} placeholder="e.g., Hyderabad" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state}
                                onChange={handleInputChange} placeholder="e.g., Telangana" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode}
                                onChange={handleInputChange} placeholder="e.g., 500033" maxLength={6} className={inputCls} />
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

                {/* ─── 7. PORTFOLIO PHOTOS (full width) ────────────────────── */}
                <Card>
                    <CardTitle title={`Portfolio Photos (${totalImages}/5)`} />
                    <label className={`block ${maxImagesReached ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                            className="hidden" disabled={maxImagesReached} />
                        <div className="border-2 border-dashed rounded-xl p-8 text-center"
                            style={{ borderColor: maxImagesReached ? '#d1d5db' : '#c7d9e6' }}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f4fb' }}>
                                    <Upload className="w-7 h-7" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.label} text-gray-600`}>
                                        {maxImagesReached ? 'Maximum limit reached' : `Tap to upload photos (${5 - totalImages} slots left)`}
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
                                    <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
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
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img src={preview} alt="" className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: BRAND }} />
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

                {/* ── Action Buttons ── */}
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

export default AutomotiveForm;