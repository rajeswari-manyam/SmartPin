import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    addAgricultureService,
    updateAgricultureById,
    getAgricultureById,
    AddAgriculturePayload,
    UpdateAgriculturePayload
} from "../services/Agriculture.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, Plus, ChevronDown } from 'lucide-react';
import { useAccount } from "../context/AccountContext";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

const BRAND = '#00598a';

// ── Charge type options ──────────────────────────────────────────────────────
const chargeTypeOptions = ['Per Day', 'Per Hour', 'Per Service', 'Fixed Rate'];

// ── Pull agriculture subcategories from JSON ─────────────────────────────────
const getAgricultureSubcategories = (): { name: string }[] => {
    const agricultureCategory = subcategoriesData.subcategories.find(
        (cat: any) => cat.categoryId === 19
    );
    return agricultureCategory
        ? agricultureCategory.items.map((item: any) => ({ name: item.name }))
        : [
            { name: 'Tractor Service' },
            { name: 'Water Pump Service' },
            { name: 'Fertilizer Dealer' },
            { name: 'Seed Dealer' },
            { name: 'Farming Tools' },
            { name: 'Veterinary Services' },
          ];
};

const AGRICULTURE_SUBCATEGORIES = getAgricultureSubcategories();

// ============================================================================
// SHARED INPUT CLASSES
// ============================================================================
const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

// ============================================================================
// REUSABLE COMPONENTS
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
const AgricultureForm: React.FC = () => {
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

    const defaultCategory = getSubcategoryFromUrl() || AGRICULTURE_SUBCATEGORIES[0]?.name || 'Tractor Service';
    const { setAccountType } = useAccount();

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        serviceName: '',
        phone: '',
        subCategory: defaultCategory,
        description: '',
        serviceCharge: '',
        chargeType: chargeTypeOptions[0],
        area: '',
        city: '',
        state: '',
        pinCode: '',
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
                const data = await getAgricultureById(editId);
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || prev.userId,
                    serviceName: data.serviceName || '',
                    phone: data.phone || '',
                    subCategory: data.subCategory || defaultCategory,
                    description: data.description || '',
                    serviceCharge: data.serviceCharge?.toString() || '',
                    chargeType: data.chargeType || chargeTypeOptions[0],
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pinCode: data.pinCode || '',
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
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                            pinCode: data.address.postcode || prev.pinCode,
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

        if (!formData.serviceName.trim()) { setError('Service name is required.'); return; }
        if (!formData.phone.trim()) { setError('Phone number is required.'); return; }
        if (!formData.description.trim()) { setError('Description is required.'); return; }
        if (!formData.area.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pinCode.trim()) {
            setError('Please fill in all location fields.'); return;
        }
        if (!formData.latitude || !formData.longitude) { setError('Please detect your location.'); return; }

        setLoading(true);

        try {
            const charge = parseFloat(formData.serviceCharge);
            const lat = parseFloat(formData.latitude);
            const lng = parseFloat(formData.longitude);

            if (isEditMode && editId) {
                const payload: UpdateAgriculturePayload & { existingImages?: string[] } = {
                    serviceName: formData.serviceName.trim(),
                    phone: formData.phone.trim(),
                    description: formData.description.trim(),
                    subCategory: formData.subCategory,
                    serviceCharge: charge,
                    chargeType: formData.chargeType,
                    latitude: lat,
                    longitude: lng,
                    area: formData.area.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pinCode: formData.pinCode.trim(),
                    images: selectedImages.length > 0 ? selectedImages : undefined,
                    existingImages: existingImages,
                };
                await updateAgricultureById(editId, payload);
                setSuccessMessage('Service updated successfully!');
            } else {
                const payload: AddAgriculturePayload = {
                    userId: formData.userId.trim(),
                    serviceName: formData.serviceName.trim(),
                    phone: formData.phone.trim(),
                    description: formData.description.trim(),
                    subCategory: formData.subCategory,
                    serviceCharge: charge,
                    chargeType: formData.chargeType,
                    latitude: lat,
                    longitude: lng,
                    area: formData.area.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pinCode: formData.pinCode.trim(),
                    images: selectedImages,
                };
                await addAgricultureService(payload);
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
    const subcategoryOptions = AGRICULTURE_SUBCATEGORIES.map(s => ({
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
                            {isEditMode ? 'Update Agriculture Service' : 'Add Agriculture Service'}
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
                                placeholder="e.g. Krishna Tractor Service"
                                className={inputCls}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            {/* ✅ FIXED: Only ONE label, label="" on IconSelect to prevent double heading */}
                            <FieldLabel required>Service Category</FieldLabel>
                            <IconSelect
                                label=""
                                value={formData.subCategory}
                                placeholder="Select subcategory"
                                options={subcategoryOptions}
                                onChange={(val) =>
                                    setFormData(prev => ({ ...prev, subCategory: val }))
                                }
                                disabled={loading}
                            />
                        </div>
                    </div>
                </Card>

                {/* 2. Contact Information */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Phone</FieldLabel>
                            <input type="tel" name="phone" value={formData.phone}
                                onChange={handleInputChange} placeholder="Enter phone number"
                                className={inputCls} disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel>Alternate Phone (Optional)</FieldLabel>
                            <input type="tel" name="altPhone"
                                placeholder="Enter alternate phone" className={inputCls} disabled />
                        </div>
                    </div>
                </Card>

                {/* 3. Pricing */}
                <Card>
                    <CardTitle title="Pricing Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleInputChange} placeholder="Amount" min="1" step="0.01"
                                className={inputCls} disabled={loading} />
                        </div>
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <div className="relative">
                                <select name="chargeType" value={formData.chargeType}
                                    onChange={handleInputChange}
                                    className={inputCls + ' appearance-none pr-10'}
                                    disabled={loading}>
                                    {chargeTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 4. Description */}
                <Card>
                    <FieldLabel required>Description</FieldLabel>
                    <textarea name="description" value={formData.description} onChange={handleInputChange}
                        rows={4} placeholder="Describe your agriculture service, equipment, or products..."
                        className={inputCls + ' resize-none'} disabled={loading} />
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
                            <input type="text" name="pinCode" value={formData.pinCode} onChange={handleInputChange}
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
                    <CardTitle title="Portfolio Photos (Optional)" />
                    <label className={`block ${totalImages >= 5 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                            className="hidden" disabled={totalImages >= 5 || loading} />
                        <div className="border-2 border-dashed rounded-xl p-8 text-center"
                            style={{ borderColor: totalImages >= 5 ? '#d1d5db' : '#c7d9e6' }}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f4fb' }}>
                                    <Upload className="w-7 h-7" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.label} text-gray-600`}>
                                        {totalImages >= 5 ? 'Maximum limit reached' : 'Tap to upload portfolio photos'}
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
                                    <button type="button"
                                        onClick={() => setExistingImages(p => p.filter((_, idx) => idx !== i))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-1.5 left-1.5 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full`}
                                        style={{ backgroundColor: BRAND }}>
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((src, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl border-2" style={{ borderColor: BRAND }} />
                                    <button type="button"
                                        onClick={() => {
                                            setSelectedImages(p => p.filter((_, idx) => idx !== i));
                                            setImagePreviews(p => p.filter((_, idx) => idx !== i));
                                        }}
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

export default AgricultureForm;