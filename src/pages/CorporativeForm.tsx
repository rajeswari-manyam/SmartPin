import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    addCorporateService,
    updateCorporateService,
    getCorporateById,
    AddCorporateServicePayload,
    UpdateCorporateServicePayload
} from "../services/Corporate.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

// ── Charge type options ──────────────────────────────────────────────────────
const chargeTypeOptions = ['Per Day', 'Per Hour', 'Per Service', 'Fixed Rate', 'Per Month'];

// ── Pull corporate subcategories from JSON ───────────────────────────────────
const getCorporateSubcategories = () => {
    const corporateCategory = subcategoriesData.subcategories.find(cat => cat.categoryId === 20);
    return corporateCategory ? corporateCategory.items.map(item => item.name) : [
        'Background Verification',
        'Document Courier',
        'Office Cleaning',
        'Recruitment',
        'IT Services',
        'Security Services'
    ];
};

// ============================================================================
// SHARED INPUT CLASSES
// ============================================================================
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
        {children}{required && <span className="text-red-500 ml-1">*</span>}
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

// ============================================================================
// GEOCODING HELPER
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

    const corporateCategories = getCorporateSubcategories();
    const defaultCategory = getSubcategoryFromUrl() || corporateCategories[0] || 'Background Verification';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
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

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    const [locationLoading, setLocationLoading] = useState(false);
    const isGPSDetected = useRef(false);

    // ── Fetch for edit ───────────────────────────────────────────────────────
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

                if (data.images && Array.isArray(data.images))
                    setExistingImages(data.images);
            } catch (err) {
                console.error(err);
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode when address typed manually ─────────────────────────────
    useEffect(() => {
        const detectCoordinates = async () => {
            if (isGPSDetected.current) {
                isGPSDetected.current = false;
                return;
            }
            if (formData.area && !formData.latitude && !formData.longitude) {
                const fullAddress = `${formData.area}, ${formData.city}, ${formData.state}, ${formData.pincode}`
                    .replace(/, ,/g, ',').replace(/^,|,$/g, '');
                if (fullAddress.trim()) {
                    const coords = await geocodeAddress(fullAddress);
                    if (coords) {
                        setFormData(prev => ({
                            ...prev,
                            latitude: coords.lat.toString(),
                            longitude: coords.lng.toString(),
                        }));
                    }
                }
            }
        };
        const timer = setTimeout(detectCoordinates, 1000);
        return () => clearTimeout(timer);
    }, [formData.area, formData.city, formData.state, formData.pincode]);

    // ── Generic input handler ────────────────────────────────────────────────
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── Image helpers ────────────────────────────────────────────────────────
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

    // ── Geolocation ──────────────────────────────────────────────────────────
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
                isGPSDetected.current = true;

                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                const accuracy = pos.coords.accuracy;

                if (accuracy > 500) {
                    setLocationWarning(
                        `⚠️ Low accuracy detected (~${Math.round(accuracy)}m). ` +
                        `The address fields below may be approximate — please verify and correct if needed.`
                    );
                }

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
                } catch (e) { console.error(e); }

                setLocationLoading(false);
            },
            (err) => {
                setError(`Location error: ${err.message}`);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            if (!formData.serviceName.trim()) throw new Error('Please enter service name');
            if (!formData.description.trim()) throw new Error('Please enter a description');
            if (!formData.serviceCharge.trim()) throw new Error('Please enter service charge');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide location (use Auto Detect or enter address)');
            if (!formData.pincode.trim()) throw new Error('Please enter PIN code');

            const payload: AddCorporateServicePayload | UpdateCorporateServicePayload = {
                userId: formData.userId,
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

            setTimeout(() => navigate('/my-business'), 1500);

        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => window.history.back();

    // ── Loading screen ───────────────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div
                        className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                        style={{ borderColor: '#f09b13' }}
                    />
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
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={handleCancel} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Corporate Service' : 'Add Corporate Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">⚠️</span>
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 mb-1">Error</p>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className={`p-4 bg-green-50 border border-green-200 rounded-xl ${typography.body.small} text-green-700`}>
                        <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <p>{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* ─── 1. SERVICE NAME ─── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Service Name</FieldLabel>
                        <input
                            type="text"
                            name="serviceName"
                            value={formData.serviceName}
                            onChange={handleInputChange}
                            placeholder="e.g. Professional Office Cleaning, Security Services"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* ─── 2. CATEGORY ─── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Service Category</FieldLabel>
                        <select
                            name="subCategory"
                            value={formData.subCategory}
                            onChange={handleInputChange}
                            className={inputBase + ' appearance-none bg-white'}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem'
                            }}
                        >
                            {corporateCategories.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </SectionCard>

                {/* ─── 3. DESCRIPTION ─── */}
                <SectionCard title="Service Details">
                    <div>
                        <FieldLabel required>Description</FieldLabel>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Describe your corporate service in detail..."
                            className={inputBase + ' resize-none'}
                        />
                    </div>
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
                                className={inputBase + ' appearance-none bg-white'}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundSize: '1.5em 1.5em',
                                    paddingRight: '2.5rem',
                                }}
                            >
                                {chargeTypeOptions.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 5. LOCATION ─── */}
                <SectionCard
                    title="Service Location"
                    action={
                        <Button
                            variant="success"
                            size="sm"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="!py-1.5 !px-3"
                        >
                            {locationLoading
                                ? <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                                : <><MapPin className="w-4 h-4 inline mr-1.5" />Auto Detect</>}
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
                            <input type="text" name="area" value={formData.area}
                                onChange={handleInputChange} placeholder="e.g. Koramangala" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city}
                                onChange={handleInputChange} placeholder="e.g. Bangalore" className={inputBase} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state}
                                onChange={handleInputChange} placeholder="e.g. Karnataka" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode}
                                onChange={handleInputChange} placeholder="e.g. 560038" className={inputBase} />
                        </div>
                    </div>

                    <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ee', border: '1px solid #f0c070' }}>
                        <p className={`${typography.body.small}`} style={{ color: '#7a4f00' }}>
                            📍 <span className="font-medium">Tip:</span> Click "Auto Detect" to get your current location, or enter your service area manually.
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className={`${typography.body.small} text-green-800`}>
                                <span className="font-semibold">✓ Location set: </span>
                                <span className="font-mono text-xs">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ─── 6. PHOTOS ─── */}
                <SectionCard title={`Service Photos (${totalImages}/5)`}>
                    <label className="cursor-pointer block">
                        <input
                            type="file" accept="image/*" multiple
                            onChange={handleImageSelect} className="hidden"
                            disabled={maxImagesReached}
                        />
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
                                        JPG, PNG, WebP — max 5 MB each
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
                                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
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
                                    <img src={preview} alt={`Preview ${i + 1}`}
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
                        disabled={loading}
                        type="button"
                        className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg ${typography.body.base} ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
                        style={{ backgroundColor: loading ? '#f0b35c' : '#f09b13' }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : (
                            isEditMode ? 'Update Service' : 'Create Service'
                        )}
                    </button>
                    <button
                        onClick={handleCancel}
                        type="button"
                        disabled={loading}
                        className={`px-8 py-3.5 rounded-xl font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all ${typography.body.base} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CorporateForm;