import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    addCorporateService,
    updateCorporateService,
    getCorporateById,
    AddCorporateServicePayload,
    UpdateCorporateServicePayload
} from "../services/Corporate.service";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, ChevronDown } from 'lucide-react';
import { useAccount } from "../context/AccountContext";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

const BRAND = '#00598a';

// ── Charge type options ──────────────────────────────────────────────────────
const chargeTypeOptions = ['Per Day', 'Per Hour', 'Per Service', 'Fixed Rate', 'Per Month'];

// ── Pull corporate subcategories from JSON ─────────────────────────────────
const getCorporateSubcategories = (): { name: string }[] => {
    const corporateCategory = subcategoriesData.subcategories.find(
        (cat: any) => cat.categoryId === 20
    );
    return corporateCategory
        ? corporateCategory.items.map((item: any) => ({ name: item.name }))
        : [
            { name: 'Background Verification' },
            { name: 'Document Courier' },
            { name: 'Office Cleaning' },
            { name: 'Recruitment' },
            { name: 'IT Services' },
            { name: 'Security Services' }
          ];
};

const CORPORATE_SUBCATEGORIES = getCorporateSubcategories();

// ============================================================================
// SHARED INPUT CLASSES (Matching AgricultureForm)
// ============================================================================
const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

// ============================================================================
// REUSABLE COMPONENTS (Matching AgricultureForm)
// ============================================================================
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

// ============================================================================
// GOOGLE MAPS GEOCODING HELPER
// ============================================================================
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
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
// COMPONENT
// ============================================================================
const CorporateForm: React.FC = () => {
    const navigate = useNavigate();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const getSubcategoryFromUrl = () => {
        const sub = new URLSearchParams(window.location.search).get('subcategory');
        return sub
            ? sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : null;
    };

    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [locationWarning, setLocationWarning] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const defaultCategory = getSubcategoryFromUrl() || CORPORATE_SUBCATEGORIES[0]?.name || 'Background Verification';
    const { setAccountType } = useAccount();

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        phone: '',
        serviceName: '',
        subCategory: defaultCategory,
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

    // ── images ───────────────────────────────────────────────────────────────
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // ── geo ──────────────────────────────────────────────────────────────────
    const [locationLoading, setLocationLoading] = useState(false);
    const gpsCoords = useRef<{ lat: string; lng: string } | null>(null);

    // ── fetch for edit ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getCorporateById(editId);
                const data = response.data;
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || '',
                    phone: data.phone || '',
                    serviceName: data.serviceName || '',
                    subCategory: data.subCategory || defaultCategory,
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
                if (data.images && Array.isArray(data.images)) {
                    setExistingImages(data.images);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode when address typed and lat/lng empty ────────────────────
    useEffect(() => {
        const { area, city, state, pincode, latitude, longitude } = formData;
        if (!area.trim()) return;
        if (latitude && longitude) return;
        if (
            gpsCoords.current &&
            gpsCoords.current.lat === latitude &&
            gpsCoords.current.lng === longitude
        ) return;

        const fullAddress = [area, city, state, pincode].filter(Boolean).join(', ');
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
    }, [formData.area, formData.city, formData.state, formData.pincode]);

    // ── generic input ─────────────────────────────────────────────────────────
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear field error when user types
        if (fieldErrors[name]) {
            setFieldErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // ── phone input handler ──────────────────────────────────────────────────
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, phone: val }));
        if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
    };

    const isPhoneValid = (phone: string) => /^[6-9]\d{9}$/.test(phone);

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
        setSelectedImages(p => p.filter((_, idx) => idx !== i));
        setImagePreviews(p => p.filter((_, idx) => idx !== i));
    };

    const handleRemoveExistingImage = (i: number) =>
        setExistingImages(p => p.filter((_, idx) => idx !== i));

    // ── geolocation ───────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true);
        setError('');
        setLocationWarning('');

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
                    setLocationWarning(`⚠️ Low accuracy (~${Math.round(accuracy)}m). Please verify the address fields below.`);
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
                            latitude: lat,
                            longitude: lng,
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
        setFieldErrors({});

        // Validation
        const errors: Record<string, string> = {};
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!isPhoneValid(formData.phone)) {
            errors.phone = 'Enter a valid 10-digit Indian mobile number (starting with 6–9)';
        }
        if (!formData.serviceName.trim()) errors.serviceName = 'Service name is required';
        if (!formData.description.trim()) errors.description = 'Description is required';
        if (!formData.serviceCharge.trim()) errors.serviceCharge = 'Service charge is required';
        if (!formData.area.trim()) errors.area = 'Area is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.state.trim()) errors.state = 'State is required';
        if (!formData.pincode.trim()) errors.pincode = 'PIN code is required';
        if (!formData.latitude || !formData.longitude) errors.location = 'Please detect your location';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('Please fix the errors below before submitting');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);

        try {
            const payload: AddCorporateServicePayload | UpdateCorporateServicePayload = {
                userId: formData.userId,
                phone: formData.phone,
                serviceName: formData.serviceName,
                description: formData.description,
                subCategory: formData.subCategory,
                serviceCharge: parseFloat(formData.serviceCharge),
                chargeType: formData.chargeType,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                area: formData.area,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
            };

            if (isEditMode && editId) {
                await updateCorporateService(editId, payload, selectedImages);
                setSuccessMessage('Service updated successfully!');
            } else {
                await addCorporateService(payload, selectedImages);
                setSuccessMessage('Service created successfully!');
            }

            setTimeout(() => {
                setAccountType("worker");
                navigate("/my-business");
            }, 1500);

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

    // ── loading screen ────────────────────────────────────────────────────────
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

    // ── IconSelect options ────────────────────────────────────────────────────
    const subcategoryOptions = CORPORATE_SUBCATEGORIES.map(s => ({
        name: s.name,
        icon: SUBCATEGORY_ICONS[s.name],
    }));

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <button onClick={handleCancel} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className={`${typography.heading.h5} text-gray-900 leading-tight`}>
                            {isEditMode ? 'Update Corporate Service' : 'Add Corporate Service'}
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
                                type="text"
                                name="serviceName"
                                value={formData.serviceName}
                                onChange={handleInputChange}
                                placeholder="e.g. Office Cleaning"
                                className={inputCls}
                                disabled={loading}
                            />
                            {fieldErrors.serviceName && (
                                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.serviceName}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Service Category</FieldLabel>
                            <IconSelect
                                label=""
                                value={formData.subCategory}
                                placeholder="Select category"
                                options={subcategoryOptions}
                                onChange={(val) =>
                                    setFormData(prev => ({ ...prev, subCategory: val }))
                                }
                                disabled={loading}
                            />
                        </div>
                    </div>
                </Card>

                {/* 2. Contact & Pricing */}
                <Card>
                    <CardTitle title="Contact & Pricing" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Phone Number</FieldLabel>
                            <div className="relative">
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
                                    className={`${inputCls} pl-16`}
                                    disabled={loading}
                                />
                                {formData.phone.length > 0 && (
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        {isPhoneValid(formData.phone)
                                            ? <span className="text-green-500 text-lg">✓</span>
                                            : <span className="text-red-400 text-lg">✗</span>}
                                    </div>
                                )}
                            </div>
                            {fieldErrors.phone && (
                                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.phone}</p>
                            )}
                            {!fieldErrors.phone && formData.phone.length > 0 && isPhoneValid(formData.phone) && (
                                <p className={`mt-1.5 ${typography.body.small} text-green-600`}>✓ Valid number</p>
                            )}
                        </div>

                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input
                                type="number"
                                name="serviceCharge"
                                value={formData.serviceCharge}
                                onChange={handleInputChange}
                                placeholder="Amount"
                                min="0"
                                className={inputCls}
                                disabled={loading}
                            />
                            {fieldErrors.serviceCharge && (
                                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.serviceCharge}</p>
                            )}
                        </div>
                    </div>

                    {/* Charge Type - Full width on mobile, half on desktop but right aligned */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div className="hidden md:block" /> {/* Empty left column for alignment */}
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <div className="relative">
                                <select
                                    name="chargeType"
                                    value={formData.chargeType}
                                    onChange={handleInputChange}
                                    className={`${inputCls} appearance-none pr-10`}
                                    disabled={loading}
                                >
                                    {chargeTypeOptions.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 3. Description */}
                <Card>
                    <FieldLabel required>Description</FieldLabel>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe your corporate service, specialties, and what makes you stand out..."
                        className={`${inputCls} resize-none`}
                        disabled={loading}
                    />
                    {fieldErrors.description && (
                        <p className="mt-1.5 text-sm text-red-600">{fieldErrors.description}</p>
                    )}
                </Card>

                {/* 4. Location */}
                <Card>
                    <CardTitle
                        title="Service Location"
                        action={
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={locationLoading || loading}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg ${typography.misc.badge} text-white transition-opacity hover:opacity-90 disabled:opacity-60`}
                                style={{ backgroundColor: BRAND }}
                            >
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
                            <input
                                type="text"
                                name="area"
                                value={formData.area}
                                onChange={handleInputChange}
                                placeholder="e.g. Koramangala"
                                className={inputCls}
                                disabled={loading}
                            />
                            {fieldErrors.area && (
                                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.area}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="e.g. Bangalore"
                                className={inputCls}
                                disabled={loading}
                            />
                            {fieldErrors.city && (
                                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.city}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="e.g. Karnataka"
                                className={inputCls}
                                disabled={loading}
                            />
                            {fieldErrors.state && (
                                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.state}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                placeholder="e.g. 560038"
                                maxLength={6}
                                className={inputCls}
                                disabled={loading}
                            />
                            {fieldErrors.pincode && (
                                <p className="mt-1.5 text-sm text-red-600">{fieldErrors.pincode}</p>
                            )}
                        </div>
                    </div>

                    {fieldErrors.location && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3.5">
                            <p className="text-sm text-red-700 flex items-center gap-1.5">
                                <span>⚠️</span> {fieldErrors.location}
                            </p>
                        </div>
                    )}

                    <div className="mt-4 rounded-xl p-3.5" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                        <p className={`${typography.body.xs} font-medium`} style={{ color: '#92400e' }}>
                            💡 <span className="font-semibold">Tip:</span> Use auto-detect to fill location automatically from your device GPS
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className={`${typography.body.xs} font-medium text-green-800`}>
                                <span className="font-bold">✓ Location detected: </span>
                                <span className="font-mono text-xs ml-1">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </Card>

                {/* 5. Photos */}
                <Card>
                    <CardTitle title={`Service Photos (${totalImages}/5)`} />
                    <label className={`block ${totalImages >= 5 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={totalImages >= 5 || loading}
                        />
                        <div
                            className="border-2 border-dashed rounded-xl p-8 text-center"
                            style={{ borderColor: totalImages >= 5 ? '#d1d5db' : '#c7d9e6' }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f4fb' }}>
                                    <Upload className="w-7 h-7" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.label} text-gray-600`}>
                                        {totalImages >= 5 ? 'Maximum limit reached' : `Tap to upload photos (${5 - totalImages} slots left)`}
                                    </p>
                                    <p className={`${typography.body.xs} text-gray-400 mt-1`}>JPG, PNG, WebP — max 5 MB each</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span
                                        className={`absolute bottom-1.5 left-1.5 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full`}
                                        style={{ backgroundColor: BRAND }}
                                    >
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((src, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2" style={{ borderColor: BRAND }} />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow"
                                    >
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
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`flex-1 py-4 rounded-xl font-bold ${typography.nav.button} text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70`}
                        style={{ backgroundColor: BRAND }}
                    >
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
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className={`px-8 py-4 rounded-xl font-semibold ${typography.nav.button} text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CorporateForm;