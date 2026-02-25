import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createBusinessService,
    updateBusinessService,
    getBusinessServiceById,
} from "../services/BusinessService.service";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, ChevronDown } from 'lucide-react';
import { useAccount } from "../context/AccountContext";

// ── Charge type options ───────────────────────────────────────────────────────
const chargeTypeOptions: { label: string; value: string }[] = [
    { label: 'Per Day', value: 'day' },
    { label: 'Per Hour', value: 'hour' },
    { label: 'Per Project', value: 'project' },
    { label: 'Fixed Rate', value: 'fixed' },
];

// ── Pull business subcategories from JSON (categoryId 11) ─────────────────────
const getBusinessSubcategories = (): string[] => {
    const businessCategory = subcategoriesData.subcategories.find(
        (cat: any) => cat.categoryId === 11
    );
    return businessCategory
        ? businessCategory.items.map((item: any) => item.name)
        : ['Chartered Accountant', 'Lawyer', 'Insurance Agent'];
};

const BUSINESS_CATEGORIES = getBusinessSubcategories();

// ============================================================================
// SHARED STYLES
// ============================================================================
const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

const inputErrCls =
    'w-full px-4 py-3.5 border border-red-400 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-red-400 ' +
    'focus:ring-1 focus:ring-red-400 transition-all';

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

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
    message ? (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {message}
        </p>
    ) : null;

// ============================================================================
// GEOCODING HELPER
// ============================================================================
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
        );
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            return { lat: loc.lat, lng: loc.lng };
        }
        return null;
    } catch {
        return null;
    }
};

// ============================================================================
// VALIDATION
// ============================================================================
interface FieldErrors {
    name?: string;
    services?: string;
    serviceCharge?: string;
    experience?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    location?: string;
    userId?: string;
}

const validateForm = (
    formData: {
        userId: string; name: string; services: string;
        serviceCharge: string; experience: string;
        area: string; city: string; state: string;
        pincode: string; latitude: string; longitude: string;
    },
    isEditMode: boolean
): FieldErrors => {
    const errors: FieldErrors = {};

    if (!isEditMode && !formData.userId.trim())
        errors.userId = 'User not logged in. Please log in to add a service.';

    if (!formData.name.trim())
        errors.name = 'Business name is required';
    else if (formData.name.trim().length < 3)
        errors.name = 'Business name must be at least 3 characters';

    if (!formData.services.trim())
        errors.services = 'At least one service is required';

    if (!formData.serviceCharge.trim()) {
        errors.serviceCharge = 'Service charge is required';
    } else {
        const charge = parseFloat(formData.serviceCharge);
        if (isNaN(charge)) errors.serviceCharge = 'Service charge must be a valid number';
        else if (charge < 0) errors.serviceCharge = 'Service charge cannot be negative';
        else if (charge === 0) errors.serviceCharge = 'Service charge must be greater than 0';
    }

    if (formData.experience.trim()) {
        const exp = parseFloat(formData.experience);
        if (isNaN(exp) || exp < 0) errors.experience = 'Experience must be a valid number ≥ 0';
    }

    if (!formData.area.trim()) errors.area = 'Area is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.pincode.trim()) errors.pincode = 'PIN code is required';
    else if (!/^\d{6}$/.test(formData.pincode.trim())) errors.pincode = 'PIN code must be 6 digits';

    if (!formData.latitude || !formData.longitude)
        errors.location = 'Location is required — use Auto Detect or enter your address';

    return errors;
};

// ============================================================================
// COMPONENT
// ============================================================================
const BusinessForm = () => {
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
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const defaultCategory = getSubcategoryFromUrl() || BUSINESS_CATEGORIES[0] || 'Chartered Accountant';
    const { setAccountType } = useAccount();

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: '',
        category: defaultCategory,
        email: '',
        phone: '',
        alternatePhone: '',
        bio: '',
        services: '' as string,
        serviceCharge: '',
        chargeType: chargeTypeOptions[0].value,
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        experience: '',
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const gpsCoords = useRef<{ lat: string; lng: string } | null>(null);

    // ── fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getBusinessServiceById(editId);
                if (!response.success || !response.data) throw new Error('Service not found');
                const data = response.data;
                const storedChargeType = data.chargeType?.toLowerCase() || chargeTypeOptions[0].value;
                const matchedChargeType = chargeTypeOptions.find(o => o.value === storedChargeType)?.value ?? chargeTypeOptions[0].value;

                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || '',
                    name: data.title || data.name || '',
                    category: data.serviceType || data.category || defaultCategory,
                    email: data.email || '',
                    phone: data.phone || '',
                    alternatePhone: data.alternatePhone || '',
                    bio: data.description || data.bio || '',
                    services: data.skills || (data.services ? data.services.join(', ') : ''),
                    serviceCharge: data.serviceCharge?.toString() || '',
                    chargeType: matchedChargeType,
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                    experience: data.experience?.toString() || '',
                }));
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch (err) {
                console.error(err);
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode ──────────────────────────────────────────────────────────
    useEffect(() => {
        const { area, city, state, latitude, longitude } = formData;
        if (!area.trim() || (latitude && longitude)) return;
        if (gpsCoords.current?.lat === latitude && gpsCoords.current?.lng === longitude) return;

        const fullAddress = [area, city, state].filter(Boolean).join(', ');
        const timer = setTimeout(async () => {
            const coords = await geocodeAddress(fullAddress);
            if (coords) {
                setFormData(prev => ({
                    ...prev,
                    latitude: coords.lat.toString(),
                    longitude: coords.lng.toString(),
                }));
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [formData.area, formData.city, formData.state]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof FieldErrors])
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    };

    // ── image helpers ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const slots = 5 - (selectedImages.length + existingImages.length);
        if (slots <= 0) { setError('Maximum 5 images allowed'); return; }
        const validFiles = files.slice(0, slots).filter(file => {
            if (!file.type.startsWith('image/')) { setError(`${file.name} is not a valid image`); return false; }
            if (file.size > 5 * 1024 * 1024) { setError(`${file.name} exceeds 5 MB`); return false; }
            return true;
        });
        if (!validFiles.length) return;
        const newPreviews: string[] = [];
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === validFiles.length)
                    setImagePreviews(prev => [...prev, ...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
        setSelectedImages(prev => [...prev, ...validFiles]);
        setError('');
    };

    const handleRemoveNewImage = (i: number) => {
        setSelectedImages(prev => prev.filter((_, idx) => idx !== i));
        setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
    };
    const handleRemoveExistingImage = (i: number) =>
        setExistingImages(prev => prev.filter((_, idx) => idx !== i));

    // ── geolocation ───────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true);
        setError('');
        setLocationWarning('');
        setFieldErrors(prev => ({ ...prev, location: undefined, area: undefined, city: undefined, state: undefined }));

        if (!navigator.geolocation) {
            setError('Geolocation not supported by your browser');
            setLocationLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                if (pos.coords.accuracy > 500) {
                    setLocationWarning(`⚠️ Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify address fields.`);
                }
                gpsCoords.current = { lat, lng };
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data.address) {
                        setFormData(prev => ({
                            ...prev,
                            latitude: lat, longitude: lng,
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

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError('');
        setSuccessMessage('');

        const errors = validateForm(formData, isEditMode);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError(Object.values(errors)[0] || 'Please fix the errors below before submitting');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setFieldErrors({});
        setLoading(true);

        try {
            const charge = parseFloat(formData.serviceCharge);
            const lat = parseFloat(formData.latitude);
            const lng = parseFloat(formData.longitude);
            const servicesArray = formData.services.split(',').map(s => s.trim()).filter(Boolean);

            const formDataToSend = new FormData();
            formDataToSend.append('userId', formData.userId);
            formDataToSend.append('serviceType', formData.category);
            formDataToSend.append('title', formData.name.trim());
            formDataToSend.append('description', formData.bio.trim());
            if (formData.email.trim()) formDataToSend.append('email', formData.email.trim());
            if (formData.phone.trim()) formDataToSend.append('phone', formData.phone.trim());
            if (formData.alternatePhone.trim()) formDataToSend.append('alternatePhone', formData.alternatePhone.trim());
            formDataToSend.append('skills', servicesArray.join(','));
            formDataToSend.append('serviceCharge', charge.toString());
            formDataToSend.append('chargeType', formData.chargeType);
            formDataToSend.append('experience', formData.experience.trim());
            formDataToSend.append('area', formData.area.trim());
            formDataToSend.append('city', formData.city.trim());
            formDataToSend.append('state', formData.state.trim());
            formDataToSend.append('pincode', formData.pincode.trim());
            formDataToSend.append('latitude', lat.toString());
            formDataToSend.append('longitude', lng.toString());
            selectedImages.forEach(image => formDataToSend.append('images', image));
            if (isEditMode && existingImages.length > 0)
                formDataToSend.append('existingImages', JSON.stringify(existingImages));

            if (isEditMode && editId) {
                const response = await updateBusinessService(editId, formDataToSend);
                if (response.success) {
                    setSuccessMessage('Service updated successfully!');
                    setTimeout(() => { setAccountType("worker"); navigate("/my-business"); }, 1500);
                } else throw new Error(response.message || 'Failed to update service');
            } else {
                const response = await createBusinessService(formDataToSend);
                if (response.success) {
                    setSuccessMessage('Service created successfully!');
                    setTimeout(() => { setAccountType("worker"); navigate("/my-business"); }, 1500);
                } else throw new Error(response.message || 'Failed to create service');
            }
        } catch (err: unknown) {
            console.error('Submit error:', err);
            if (err instanceof Error) setError(err.message);
            else if (typeof err === 'string') setError(err);
            else setError('Failed to submit form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#00598a' }} />
                    <p className={`${typography.body.base} text-gray-600`}>Loading service data...</p>
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
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className={`${typography.heading.h5} text-gray-900 leading-tight`}>
                            {isEditMode ? 'Update Business Service' : 'Add Business Service'}
                        </h1>
                        <p className={`${typography.body.xs} text-gray-400 mt-0.5`}>
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">

                {/* ── Alerts ── */}
                {error && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">⚠️</span>
                        <div>
                            <p className="font-semibold text-red-800 text-sm mb-0.5">Please fix the following</p>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className="text-sm text-green-700">✓ {successMessage}</p>
                    </div>
                )}
                {!formData.userId && !isEditMode && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <p className="text-sm text-orange-700">⚠️ You must be logged in to add a service.</p>
                    </div>
                )}

                {/* ─── 1. SERVICE NAME + SERVICE CATEGORY ───────────────────── */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Service Name</FieldLabel>
                            <input
                                type="text" name="name" value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Krishna & Associates"
                                className={fieldErrors.name ? inputErrCls : inputCls}
                            />
                            <FieldError message={fieldErrors.name} />
                        </div>
                        <div>
                            <FieldLabel required>Service Category</FieldLabel>
                            <div className="relative">
                                <select
                                    name="category" value={formData.category}
                                    onChange={handleInputChange}
                                    className={inputCls + ' appearance-none pr-10'}
                                >
                                    {BUSINESS_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ─── 2. CONTACT INFORMATION — Phone + Alternate Phone ─────── */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Phone</FieldLabel>
                            <input
                                type="tel" name="phone" value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel>Alternate Phone (Optional)</FieldLabel>
                            <input
                                type="tel" name="alternatePhone" value={formData.alternatePhone}
                                onChange={handleInputChange}
                                placeholder="Enter alternate phone"
                                className={inputCls}
                            />
                        </div>
                    </div>
                </Card>

                {/* ─── 3. PRICING DETAILS — Service Charge + Charge Type ────── */}
                <Card>
                    <CardTitle title="Pricing Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input
                                type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleInputChange}
                                placeholder="Amount" min="1" step="0.01"
                                className={fieldErrors.serviceCharge ? inputErrCls : inputCls}
                            />
                            <FieldError message={fieldErrors.serviceCharge} />
                        </div>
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <div className="relative">
                                <select
                                    name="chargeType" value={formData.chargeType}
                                    onChange={handleInputChange}
                                    className={inputCls + ' appearance-none pr-10'}
                                >
                                    {chargeTypeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* ─── 4. DESCRIPTION (full width) ──────────────────────────── */}
                <Card>
                    <div>
                        <FieldLabel required>Description</FieldLabel>
                        <textarea
                            name="bio" value={formData.bio} onChange={handleInputChange}
                            rows={4}
                            placeholder="Describe your services, experience, and what makes you unique..."
                            className={inputCls + ' resize-none'}
                        />
                    </div>
                </Card>

                {/* ─── 5. SERVICES OFFERED (full width) ─────────────────────── */}
                <Card>
                    <CardTitle title="Services Offered" />
                    <div>
                        <FieldLabel required>Services</FieldLabel>
                        <textarea
                            name="services" value={formData.services} onChange={handleInputChange}
                            rows={3}
                            placeholder="Tax Filing, GST Returns, Auditing, Financial Planning"
                            className={(fieldErrors.services ? inputErrCls : inputCls) + ' resize-none'}
                        />
                        <p className="text-xs text-gray-400 mt-2">💡 Enter services separated by commas</p>
                        <FieldError message={fieldErrors.services} />
                    </div>
                    {formData.services && formData.services.trim() && (
                        <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                                Selected ({formData.services.split(',').filter(s => s.trim()).length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {formData.services.split(',').map((s, i) => {
                                    const trimmed = s.trim();
                                    if (!trimmed) return null;
                                    return (
                                        <span key={i}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                                            style={{ backgroundColor: '#00598a' }}>
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
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

                {/* ─── 6. PROFESSIONAL DETAILS — Experience + Email ─────────── */}
                <Card>
                    <CardTitle title="Professional Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Experience (years)</FieldLabel>
                            <input
                                type="number" name="experience" value={formData.experience}
                                onChange={handleInputChange}
                                placeholder="Years of experience" min="0"
                                className={fieldErrors.experience ? inputErrCls : inputCls}
                            />
                            <FieldError message={fieldErrors.experience} />
                        </div>
                        <div>
                            <FieldLabel>Email (Optional)</FieldLabel>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                className={inputCls}
                            />
                        </div>
                    </div>
                </Card>

                {/* ─── 7. LOCATION — 2×2 grid ───────────────────────────────── */}
                <Card>
                    <CardTitle
                        title="Location Details"
                        action={
                            <button
                                type="button" onClick={getCurrentLocation} disabled={locationLoading}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{ backgroundColor: '#00598a' }}
                            >
                                {locationLoading
                                    ? <><span className="animate-spin">⌛</span> Detecting...</>
                                    : <><MapPin className="w-4 h-4" /> Auto Detect</>}
                            </button>
                        }
                    />

                    {locationWarning && (
                        <div className="mb-4 bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className="text-sm text-yellow-800">{locationWarning}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area}
                                onChange={handleInputChange}
                                placeholder="e.g. Banjara Hills"
                                className={fieldErrors.area ? inputErrCls : inputCls} />
                            <FieldError message={fieldErrors.area} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city}
                                onChange={handleInputChange}
                                placeholder="e.g. Hyderabad"
                                className={fieldErrors.city ? inputErrCls : inputCls} />
                            <FieldError message={fieldErrors.city} />
                        </div>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state}
                                onChange={handleInputChange}
                                placeholder="e.g. Telangana"
                                className={fieldErrors.state ? inputErrCls : inputCls} />
                            <FieldError message={fieldErrors.state} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode}
                                onChange={handleInputChange}
                                placeholder="e.g. 500033" maxLength={6}
                                className={fieldErrors.pincode ? inputErrCls : inputCls} />
                            <FieldError message={fieldErrors.pincode} />
                        </div>
                    </div>

                    {fieldErrors.location && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-sm text-red-700 flex items-center gap-1.5"><span>⚠️</span> {fieldErrors.location}</p>
                        </div>
                    )}

                    <div className="mt-4 rounded-xl p-3.5" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                        <p className="text-xs font-medium" style={{ color: '#92400e' }}>
                            📍 <span className="font-semibold">Tip:</span> Click "Auto Detect" to fill location automatically from your device GPS
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className="text-xs font-medium text-green-800">
                                <span className="font-bold">✓ Location set: </span>
                                {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                            </p>
                        </div>
                    )}
                </Card>

                {/* ─── 8. PORTFOLIO PHOTOS ──────────────────────────────────── */}
                <Card>
                    <CardTitle title={`Portfolio Photos (${totalImages}/5)`} />
                    <label className={`block ${maxImagesReached ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                            className="hidden" disabled={maxImagesReached} />
                        <div className="border-2 border-dashed rounded-xl p-8 text-center"
                            style={{
                                borderColor: maxImagesReached ? '#d1d5db' : '#c7d9e6',
                                backgroundColor: maxImagesReached ? '#f9fafb' : '#f8fbfd',
                            }}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f4fb' }}>
                                    <Upload className="w-7 h-7" style={{ color: '#00598a' }} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {maxImagesReached ? 'Maximum limit reached' : `Tap to upload photos (${5 - totalImages} slots left)`}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 5 MB each</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square group">
                                    <img src={url} alt={`Saved ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                        onError={(e) => { (e.target as HTMLImageElement).src = ''; }} />
                                    <button type="button" onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-2 left-2 text-white text-xs px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: '#00598a' }}>Saved</span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img src={preview} alt={`New ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: '#00598a' }} />
                                    <button type="button" onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* ── Action Buttons ── */}
                <div className="flex gap-3 pt-2 pb-8">
                    <button
                        type="button" onClick={handleSubmit}
                        disabled={loading || !!successMessage}
                        className="flex-1 py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70"
                        style={{ backgroundColor: '#00598a' }}
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {loading
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : successMessage ? '✓ Done'
                            : (isEditMode ? 'Update Service' : 'Create Service')}
                    </button>
                    <button
                        type="button" onClick={() => window.history.back()} disabled={loading}
                        className="px-8 py-4 rounded-xl font-semibold text-base text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusinessForm;