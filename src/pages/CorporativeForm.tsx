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
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from "../context/AccountContext";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

const chargeTypeOptions = ['Per Day', 'Per Hour', 'Per Service', 'Fixed Rate', 'Per Month'];

const getCorporateSubcategories = () => {
    const corporateCategory = subcategoriesData.subcategories.find(cat => cat.categoryId === 20);
    return corporateCategory ? corporateCategory.items.map(item => item.name) : [
        'Background Verification', 'Document Courier', 'Office Cleaning',
        'Recruitment', 'IT Services', 'Security Services'
    ];
};

// ============================================================================
// SHARED STYLES
// ============================================================================
const BRAND = '#00598a';

const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:outline-none focus:border-[#00598a] focus:ring-1 focus:ring-[#00598a] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

const inputError =
    `w-full px-4 py-3 border border-red-400 rounded-xl ` +
    `focus:ring-2 focus:ring-red-400 focus:border-red-400 ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

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

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

// ============================================================================
// GEOCODING HELPER
// ============================================================================
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return { lat: location.lat, lng: location.lng };
        }
        return null;
    } catch {
        return null;
    }
};

// ============================================================================
// FIELD ERRORS
// ============================================================================
interface FieldErrors {
    phone?: string;
    serviceName?: string;
    description?: string;
    serviceCharge?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    location?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
const CorporateForm: React.FC = () => {
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
    const { setAccountType } = useAccount();

    const corporateCategories = getCorporateSubcategories();
    const subcategoryOptions = corporateCategories.map((name: string) => ({
        name,
        icon: SUBCATEGORY_ICONS[name],
    }));
    const defaultCategory = getSubcategoryFromUrl() || corporateCategories[0] || 'Background Verification';

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
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch {
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode when address typed manually ─────────────────────────────
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

    // ── Generic input handler ────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof FieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    // ── Phone input handler ──────────────────────────────────────────────────
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
        setFormData(prev => ({ ...prev, phone: val }));
        if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: undefined }));
    };

    const isPhoneValid = (phone: string) => /^[6-9]\d{9}$/.test(phone);

    // ── Image helpers ────────────────────────────────────────────────────────
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

    const handleRemoveNewImage = (i: number) => {
        setSelectedImages(p => p.filter((_, idx) => idx !== i));
        setImagePreviews(p => p.filter((_, idx) => idx !== i));
    };

    const handleRemoveExistingImage = (i: number) =>
        setExistingImages(p => p.filter((_, idx) => idx !== i));

    // ── Geolocation ──────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true);
        setError('');
        setLocationWarning('');
        setFieldErrors(prev => ({ ...prev, location: undefined }));
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
                if (pos.coords.accuracy > 500) {
                    setLocationWarning(`⚠️ Low accuracy detected (~${Math.round(pos.coords.accuracy)}m). Please verify the address fields.`);
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
                } catch { }
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
        setError('');
        setSuccessMessage('');

        const errors: FieldErrors = {};
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
        if (!formData.latitude || !formData.longitude) errors.location = 'Please provide a valid location';

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
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    // ── Loading screen ───────────────────────────────────────────────────────
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
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
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

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

                {/* Global error banner */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">⚠️</span>
                            <div>
                                <p className="font-semibold text-red-800 mb-1">Please fix the following</p>
                                <p className={`${typography.form.error} text-red-700`}>{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success banner */}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <span className="text-green-600 text-lg">✓</span>
                        <p className={`${typography.body.small} text-green-700 font-medium`}>{successMessage}</p>
                    </div>
                )}

                {/* ─── 1. SERVICE NAME + CATEGORY ─── */}
                <SectionCard>
                    <TwoCol>
                        <div>
                            <FieldLabel required>Service Name</FieldLabel>
                            <input
                                type="text"
                                name="serviceName"
                                value={formData.serviceName}
                                onChange={handleInputChange}
                                placeholder="e.g. Office Cleaning"
                                className={fieldErrors.serviceName ? inputError : inputBase}
                            />
                            {fieldErrors.serviceName && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.serviceName}
                                </p>
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
                    </TwoCol>
                </SectionCard>

                {/* ─── 2. CONTACT & PRICING ─── */}
                <SectionCard title="Contact & Pricing">
                    <TwoCol>
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
                                    className={(fieldErrors.phone ? inputError : inputBase) + ' pl-16'}
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
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.phone}
                                </p>
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
                                className={fieldErrors.serviceCharge ? inputError : inputBase}
                            />
                            {fieldErrors.serviceCharge && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.serviceCharge}
                                </p>
                            )}
                        </div>
                    </TwoCol>

                    <TwoCol>
                        {/* Empty left column — aligns Charge Type under Service Charge */}
                        <div className="hidden md:block" />
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <select
                                name="chargeType"
                                value={formData.chargeType}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'}
                                style={selectStyle}
                            >
                                {chargeTypeOptions.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                    </TwoCol>
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
                            placeholder="Describe your corporate service, specialties, and what makes you stand out..."
                            className={(fieldErrors.description ? inputError : inputBase) + ' resize-none'}
                        />
                        {fieldErrors.description && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {fieldErrors.description}
                            </p>
                        )}
                    </div>
                </SectionCard>

                {/* ─── 4. LOCATION ─── */}
                <SectionCard
                    title="Service Location"
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
                                : <><MapPin className="w-4 h-4" /> Auto Detect</>}
                        </button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
                        </div>
                    )}

                    {/* Area + City */}
                    <TwoCol>
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input
                                type="text" name="area" value={formData.area}
                                onChange={handleInputChange} placeholder="e.g. Koramangala"
                                className={fieldErrors.area ? inputError : inputBase}
                            />
                            {fieldErrors.area && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.area}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input
                                type="text" name="city" value={formData.city}
                                onChange={handleInputChange} placeholder="e.g. Bangalore"
                                className={fieldErrors.city ? inputError : inputBase}
                            />
                            {fieldErrors.city && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.city}
                                </p>
                            )}
                        </div>
                    </TwoCol>

                    {/* State + PIN Code */}
                    <TwoCol>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input
                                type="text" name="state" value={formData.state}
                                onChange={handleInputChange} placeholder="e.g. Karnataka"
                                className={fieldErrors.state ? inputError : inputBase}
                            />
                            {fieldErrors.state && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.state}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input
                                type="text" name="pincode" value={formData.pincode}
                                onChange={handleInputChange} placeholder="e.g. 560038" maxLength={6}
                                className={fieldErrors.pincode ? inputError : inputBase}
                            />
                            {fieldErrors.pincode && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.pincode}
                                </p>
                            )}
                        </div>
                    </TwoCol>

                    {/* Location error */}
                    {fieldErrors.location && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-sm text-red-700 flex items-center gap-1.5">
                                <span>⚠️</span> {fieldErrors.location}
                            </p>
                        </div>
                    )}

                    {/* Tip */}
                    {!formData.latitude && !formData.longitude && (
                        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
                            <p className={`${typography.body.small} text-amber-800`}>
                                💡 <span className="font-medium">Tip:</span> Use auto-detect to fill location automatically from your device GPS.
                            </p>
                        </div>
                    )}

                    {/* Confirmed */}
                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className={`${typography.body.small} text-green-800`}>
                                <span className="font-semibold">✓ Location set: </span>
                                <span className="font-mono text-xs ml-1">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ─── 5. SERVICE PHOTOS ─── */}
                <SectionCard title={`Service Photos (${totalImages}/5)`}>
                    <label className="cursor-pointer block">
                        <input
                            type="file" accept="image/*" multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={maxImagesReached}
                        />
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${maxImagesReached
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                : 'hover:opacity-90 cursor-pointer'}`}
                            style={!maxImagesReached ? { borderColor: BRAND, backgroundColor: '#f0f7fb' } : {}}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0eff7' }}>
                                    <Upload className="w-8 h-8" style={{ color: BRAND }} />
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
                                        style={{ backgroundColor: BRAND }}
                                    >
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img src={preview} alt={`Preview ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: BRAND }} />
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
                        className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg ${typography.body.base} ${loading || successMessage ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
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