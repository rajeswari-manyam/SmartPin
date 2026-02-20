import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createBusinessService,
    updateBusinessService,
    getBusinessServiceById,
} from "../services/BusinessService.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

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
// SHARED INPUT CLASSES
// ============================================================================
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

const inputError =
    `w-full px-4 py-3 border border-red-400 rounded-xl ` +
    `focus:ring-2 focus:ring-red-400 focus:border-red-400 ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

// ============================================================================
// REUSABLE LABEL
// ============================================================================
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
        {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

// ============================================================================
// SECTION CARD WRAPPER
// ============================================================================
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

// ============================================================================
// GOOGLE MAPS GEOCODING HELPER
// ============================================================================
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

// ============================================================================
// VALIDATION HELPER
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

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: '',
        category: defaultCategory,
        email: '',
        phone: '',
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

    // ── images ────────────────────────────────────────────────────────────────
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // ── geo ───────────────────────────────────────────────────────────────────
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

    // ── Auto-geocode ONLY when: area typed, lat/lng empty, not from GPS ───────
    useEffect(() => {
        const { area, city, state, latitude, longitude } = formData;

        if (!area.trim()) return;
        if (latitude && longitude) return;
        if (
            gpsCoords.current &&
            gpsCoords.current.lat === latitude &&
            gpsCoords.current.lng === longitude
        ) return;

        const fullAddress = [area, city, state].filter(Boolean).join(', ');
        if (!fullAddress.trim()) return;

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

    // ── generic input ─────────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof FieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // ── image helpers ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const availableSlots = 5 - (selectedImages.length + existingImages.length);
        if (availableSlots <= 0) { setError('Maximum 5 images allowed'); return; }
        const validFiles = files.slice(0, availableSlots).filter(file => {
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
                const accuracy = pos.coords.accuracy;

                if (accuracy > 500) {
                    setLocationWarning(
                        `⚠️ Low accuracy detected (~${Math.round(accuracy)}m). The address fields below may be approximate — please verify and correct if needed.`
                    );
                }

                gpsCoords.current = { lat, lng };
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));

                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    );
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
                } catch (e) { console.error('Reverse geocode error:', e); }

                setLocationLoading(false);
            },
            (err) => {
                setError(`Location error: ${err.message}`);
                setLocationLoading(false);
            },
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
            const firstError = Object.values(errors)[0];
            setError(firstError || 'Please fix the errors below before submitting');
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
                    setTimeout(() => navigate('/my-business'), 1500);
                } else throw new Error(response.message || 'Failed to update service');
            } else {
                const response = await createBusinessService(formDataToSend);
                if (response.success) {
                    setSuccessMessage('Service created successfully!');
                    setTimeout(() => navigate('/my-business'), 1500);
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

    const handleCancel = () => window.history.back();

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                        style={{ borderColor: '#f09b13' }}
                    />
                    <p className={`${typography.body.base} text-gray-600`}>Loading service data...</p>
                </div>
            </div>
        );
    }

    const totalImages = selectedImages.length + existingImages.length;
    const maxImagesReached = totalImages >= 5;

    // ============================================================================
    // RENDER — Mobile First
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={handleCancel} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Business Service' : 'Add Business Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Global error banner */}
                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">⚠️</span>
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 mb-1">Please fix the following</p>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success banner */}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <div className="flex items-center gap-2">
                            <span className="text-green-600 text-lg">✓</span>
                            <p className={`${typography.body.small} text-green-700 font-medium`}>{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Not logged in warning */}
                {!formData.userId && !isEditMode && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <p className={`${typography.body.small} text-orange-700`}>
                            ⚠️ You must be logged in to add a service.
                        </p>
                    </div>
                )}

                {/* ─── 1. BUSINESS NAME ─────────────────────────────────────── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Business Name</FieldLabel>
                        <input
                            type="text" name="name" value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Krishna & Associates, Raju Law Firm"
                            className={fieldErrors.name ? inputError : inputBase}
                        />
                        {fieldErrors.name && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {fieldErrors.name}
                            </p>
                        )}
                    </div>
                </SectionCard>

                {/* ─── 2. CONTACT INFORMATION ───────────────────────────────── */}
                <SectionCard title="Contact Information">
                    <div>
                        <FieldLabel>Phone</FieldLabel>
                        <input
                            type="tel" name="phone" value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number (optional)"
                            className={inputBase}
                        />
                    </div>
                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <input
                            type="email" name="email" value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email address (optional)"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* ─── 3. CATEGORY ──────────────────────────────────────────── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Category</FieldLabel>
                        <select
                            name="category" value={formData.category} onChange={handleInputChange}
                            className={inputBase + ' appearance-none bg-white'}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'
                            }}
                        >
                            {BUSINESS_CATEGORIES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </SectionCard>

                {/* ─── 4. SERVICES ──────────────────────────────────────────── */}
                <SectionCard title="Services Offered">
                    <div>
                        <FieldLabel required>Services</FieldLabel>
                        <textarea
                            name="services" value={formData.services} onChange={handleInputChange}
                            rows={3}
                            placeholder="Tax Filing, GST Returns, Auditing, Financial Planning"
                            className={(fieldErrors.services ? inputError : inputBase) + ' resize-none'}
                        />
                        {fieldErrors.services && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {fieldErrors.services}
                            </p>
                        )}
                        <p className={`${typography.misc.caption} mt-2`}>💡 Enter services separated by commas</p>

                        {/* Service chips preview */}
                        {formData.services && formData.services.trim() && (
                            <div className="mt-3">
                                <p className={`${typography.body.small} font-medium text-gray-700 mb-2`}>Selected Services:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.services.split(',').map((s, i) => {
                                        const trimmed = s.trim();
                                        if (!trimmed) return null;
                                        return (
                                            <span
                                                key={i}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${typography.misc.badge} font-medium text-white`}
                                                style={{ backgroundColor: '#f09b13' }}
                                            >
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
                    </div>
                </SectionCard>

                {/* ─── 5. PROFESSIONAL DETAILS ──────────────────────────────── */}
                <SectionCard title="Professional Details">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Experience (years)</FieldLabel>
                            <input
                                type="number" name="experience" value={formData.experience}
                                onChange={handleInputChange} placeholder="Years" min="0"
                                className={fieldErrors.experience ? inputError : inputBase}
                            />
                            {fieldErrors.experience && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.experience}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input
                                type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleInputChange} placeholder="Amount" min="1" step="0.01"
                                className={fieldErrors.serviceCharge ? inputError : inputBase}
                            />
                            {fieldErrors.serviceCharge && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.serviceCharge}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <FieldLabel required>Charge Type</FieldLabel>
                        <select
                            name="chargeType" value={formData.chargeType} onChange={handleInputChange}
                            className={inputBase + ' appearance-none bg-white'}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'
                            }}
                        >
                            {chargeTypeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                </SectionCard>

                {/* ─── 6. BIO ───────────────────────────────────────────────── */}
                <SectionCard title="Bio">
                    <textarea
                        name="bio" value={formData.bio} onChange={handleInputChange}
                        rows={4}
                        placeholder="Tell us about yourself and your expertise..."
                        className={inputBase + ' resize-none'}
                    />
                </SectionCard>

                {/* ─── 7. LOCATION ──────────────────────────────────────────── */}
                <SectionCard
                    title="Location Details"
                    action={
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="!py-1.5 !px-3 !bg-[#f09b13] !border-[#f09b13] hover:!bg-[#d4870f]"
                        >
                            {locationLoading
                                ? <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                                : <><MapPin className="w-4 h-4 inline mr-1.5" />Auto Detect</>
                            }
                        </Button>
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
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange}
                                placeholder="e.g. Banjara Hills"
                                className={fieldErrors.area ? inputError : inputBase} />
                            {fieldErrors.area && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {fieldErrors.area}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                                placeholder="e.g. Hyderabad"
                                className={fieldErrors.city ? inputError : inputBase} />
                            {fieldErrors.city && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {fieldErrors.city}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                                placeholder="e.g. Telangana"
                                className={fieldErrors.state ? inputError : inputBase} />
                            {fieldErrors.state && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {fieldErrors.state}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                                placeholder="e.g. 500033"
                                className={fieldErrors.pincode ? inputError : inputBase} />
                            {fieldErrors.pincode && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1"><span>⚠️</span> {fieldErrors.pincode}</p>
                            )}
                        </div>
                    </div>

                    {/* Location error (coordinates missing) */}
                    {fieldErrors.location && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-sm text-red-700 flex items-center gap-1.5">
                                <span>⚠️</span> {fieldErrors.location}
                            </p>
                        </div>
                    )}

                    {/* Tip box */}
                    {!formData.latitude && !formData.longitude && (
                        <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ee', border: '1px solid #f0c070' }}>
                            <p className={`${typography.body.small}`} style={{ color: '#7a4f00' }}>
                                📍 <span className="font-medium">Tip:</span> Click "Auto Detect" to get your current location, or type your address and coordinates will be set automatically.
                            </p>
                        </div>
                    )}

                    {/* Coordinates confirmed */}
                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className={`${typography.body.small} text-green-800`}>
                                <span className="font-semibold">✓ Location set:</span>
                                <span className="ml-1 font-mono text-xs">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ─── 8. PORTFOLIO PHOTOS ──────────────────────────────────── */}
                <SectionCard title={`Portfolio Photos (${totalImages}/5)`}>
                    <label className="cursor-pointer block">
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden"
                            disabled={maxImagesReached} />
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{
                                borderColor: maxImagesReached ? '#d1d5db' : '#f09b13',
                                backgroundColor: maxImagesReached ? '#f9fafb' : '#fffbf5',
                            }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#fff0d6' }}
                                >
                                    <Upload className="w-8 h-8" style={{ color: '#f09b13' }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {maxImagesReached
                                            ? 'Maximum 5 images reached'
                                            : `Tap to upload photos (${5 - totalImages} slots left)`}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>
                                        JPG, PNG, WebP — max 5 MB each, up to 5 images
                                    </p>
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
                                    <span
                                        className={`absolute bottom-2 left-2 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}
                                        style={{ backgroundColor: '#f09b13' }}
                                    >
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img src={preview} alt={`New ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: '#f09b13' }} />
                                    <button type="button" onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-2 left-2 bg-green-600 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}>
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
                        disabled={loading || !!successMessage}
                        type="button"
                        className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg ${typography.body.base} ${loading || successMessage ? 'cursor-not-allowed opacity-70' : ''}`}
                        style={{ backgroundColor: loading || successMessage ? '#f0b35c' : '#f09b13' }}
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
                        onClick={handleCancel} type="button" disabled={loading}
                        className={`px-8 py-3.5 rounded-xl font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all ${typography.body.base} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BusinessForm;