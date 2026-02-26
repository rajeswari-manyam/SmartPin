import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createBusinessService,
    updateBusinessService,
    getBusinessServiceById,
} from "../services/BusinessService.service";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from "../context/AccountContext";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

// ── Charge type options ───────────────────────────────────────────────────────
const chargeTypeOptions = ['Per Day', 'Per Hour', 'Per Project', 'Fixed Rate'];

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
const CATEGORY_NAME = 'Business Services';

// ── Brand colour ──────────────────────────────────────────────────────────────
const BRAND = '#00598a';

// ============================================================================
// SHARED INPUT CLASSES
// ============================================================================
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

// ============================================================================
// GEOCODING HELPER
// ============================================================================
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
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
    phone?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    location?: string;
    userId?: string;
    description?: string;
}

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

    // ── subcategory options for IconSelect ────────────────────────────────────
    const subcategoryOptions = BUSINESS_CATEGORIES.map((name: string) => ({
        name,
        icon: SUBCATEGORY_ICONS[name],
    }));

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
        chargeType: chargeTypeOptions[0],
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
    const isGPSDetected = useRef(false);

    // ── fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getBusinessServiceById(editId);
                if (!response.success || !response.data) throw new Error('Service not found');
                const data = response.data;
                const storedChargeType = data.chargeType || chargeTypeOptions[0];
                const matchedChargeType = chargeTypeOptions.find(
                    o => o.toLowerCase() === storedChargeType.toLowerCase()
                ) ?? chargeTypeOptions[0];

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

    // ── Auto-geocode when address typed manually ──────────────────────────────
    useEffect(() => {
        const detect = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                const addr = [formData.area, formData.city, formData.state, formData.pincode]
                    .filter(Boolean).join(', ');
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
        const previews: string[] = [];
        let loaded = 0;
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result as string);
                if (++loaded === validFiles.length)
                    setImagePreviews(prev => [...prev, ...previews]);
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
                    setLocationWarning(`⚠️ Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify address fields.`);
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
            (err) => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError('');
        setSuccessMessage('');

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
            else if (charge <= 0) errors.serviceCharge = 'Service charge must be greater than 0';
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

            const fd = new FormData();
            fd.append('userId', formData.userId);
            fd.append('serviceType', formData.category);
            fd.append('title', formData.name.trim());
            fd.append('description', formData.bio.trim());
            if (formData.email.trim()) fd.append('email', formData.email.trim());
            if (formData.phone.trim()) fd.append('phone', formData.phone.trim());
            if (formData.alternatePhone.trim()) fd.append('alternatePhone', formData.alternatePhone.trim());
            fd.append('skills', servicesArray.join(','));
            fd.append('serviceCharge', charge.toString());
            fd.append('chargeType', formData.chargeType);
            fd.append('experience', formData.experience.trim());
            fd.append('area', formData.area.trim());
            fd.append('city', formData.city.trim());
            fd.append('state', formData.state.trim());
            fd.append('pincode', formData.pincode.trim());
            fd.append('latitude', lat.toString());
            fd.append('longitude', lng.toString());
            selectedImages.forEach(image => fd.append('images', image, image.name));
            if (isEditMode && existingImages.length > 0)
                fd.append('existingImages', JSON.stringify(existingImages));

            if (isEditMode && editId) {
                const response = await updateBusinessService(editId, fd);
                if (response.success) {
                    setSuccessMessage('Service updated successfully!');
                } else throw new Error(response.message || 'Failed to update service');
            } else {
                const response = await createBusinessService(fd);
                if (response.success) {
                    setSuccessMessage('Service created successfully!');
                } else throw new Error(response.message || 'Failed to create service');
            }

            setTimeout(() => { setAccountType("worker"); navigate("/my-business"); }, 1500);
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'Failed to submit form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── loading screen ────────────────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND }} />
                    <p className={`${typography.body.base} text-gray-600`}>Loading service data...</p>
                </div>
            </div>
        );
    }

    const totalImages = selectedImages.length + existingImages.length;

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
                            {isEditMode ? 'Update Business Service' : 'Add Business Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

                {/* ── Alerts ── */}
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
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <span className="text-green-600 text-lg">✓</span>
                        <p className={`${typography.body.small} text-green-700 font-medium`}>{successMessage}</p>
                    </div>
                )}
                {!formData.userId && !isEditMode && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <p className="text-sm text-orange-700">⚠️ You must be logged in to add a service.</p>
                    </div>
                )}

                {/* ─── 1. SERVICE NAME + CATEGORY ───────────────────────────── */}
                <SectionCard>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Service Name</FieldLabel>
                            <input
                                type="text" name="name" value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Krishna & Associates"
                                className={fieldErrors.name ? inputError : inputBase}
                            />
                            {fieldErrors.name && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Service Category</FieldLabel>
                            <IconSelect
                                label=""
                                value={formData.category}
                                placeholder="Select category"
                                options={subcategoryOptions}
                                onChange={(val) => setFormData(prev => ({ ...prev, category: val }))}
                                disabled={loading}
                            />
                            <p className={`${typography.body.xs} text-gray-400 mt-1`}>
                                Parent: <span className="font-medium text-gray-500">{CATEGORY_NAME}</span>
                            </p>
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 2. CONTACT INFORMATION ───────────────────────────────── */}
                <SectionCard title="Contact Information">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Phone</FieldLabel>
                            <input
                                type="tel" name="phone" value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                                className={fieldErrors.phone ? inputError : inputBase}
                            />
                            {fieldErrors.phone && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.phone}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel>Alternate Phone (Optional)</FieldLabel>
                            <input
                                type="tel" name="alternatePhone" value={formData.alternatePhone}
                                onChange={handleInputChange}
                                placeholder="Enter alternate phone"
                                className={inputBase}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 3. PRICING DETAILS ───────────────────────────────────── */}
                <SectionCard title="Pricing Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input
                                type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleInputChange}
                                placeholder="Amount" min="1" step="0.01"
                                className={fieldErrors.serviceCharge ? inputError : inputBase}
                            />
                            {fieldErrors.serviceCharge && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.serviceCharge}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <select
                                name="chargeType" value={formData.chargeType}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'}
                                style={selectStyle}
                            >
                                {chargeTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 4. DESCRIPTION ───────────────────────────────────────── */}
                <SectionCard title="Service Details">
                    <div>
                        <FieldLabel required>Description</FieldLabel>
                        <textarea
                            name="bio" value={formData.bio} onChange={handleInputChange}
                            rows={4}
                            placeholder="Describe your services, experience, and what makes you unique..."
                            className={(fieldErrors.description ? inputError : inputBase) + ' resize-none'}
                        />
                        {fieldErrors.description && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {fieldErrors.description}
                            </p>
                        )}
                    </div>
                </SectionCard>

                {/* ─── 5. SERVICES OFFERED ──────────────────────────────────── */}
                <SectionCard title="Services Offered">
                    <div>
                        <FieldLabel required>Services</FieldLabel>
                        <textarea
                            name="services" value={formData.services} onChange={handleInputChange}
                            rows={3}
                            placeholder="Tax Filing, GST Returns, Auditing, Financial Planning"
                            className={(fieldErrors.services ? inputError : inputBase) + ' resize-none'}
                        />
                        <p className="text-xs text-gray-400 mt-2">💡 Enter services separated by commas</p>
                        {fieldErrors.services && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {fieldErrors.services}
                            </p>
                        )}
                    </div>
                    {formData.services && formData.services.trim() && (
                        <div>
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
                                            style={{ backgroundColor: BRAND }}>
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
                </SectionCard>

                {/* ─── 6. PROFESSIONAL DETAILS ──────────────────────────────── */}
                <SectionCard title="Professional Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Experience (years)</FieldLabel>
                            <input
                                type="number" name="experience" value={formData.experience}
                                onChange={handleInputChange}
                                placeholder="Years of experience" min="0"
                                className={fieldErrors.experience ? inputError : inputBase}
                            />
                            {fieldErrors.experience && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.experience}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel>Email (Optional)</FieldLabel>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                className={inputBase}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 7. LOCATION ──────────────────────────────────────────── */}
                <SectionCard
                    title="Location Details"
                    action={
                        <button
                            type="button" onClick={getCurrentLocation} disabled={locationLoading}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area}
                                onChange={handleInputChange} placeholder="e.g. Banjara Hills"
                                className={fieldErrors.area ? inputError : inputBase} />
                            {fieldErrors.area && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.area}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city}
                                onChange={handleInputChange} placeholder="e.g. Hyderabad"
                                className={fieldErrors.city ? inputError : inputBase} />
                            {fieldErrors.city && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.city}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state}
                                onChange={handleInputChange} placeholder="e.g. Telangana"
                                className={fieldErrors.state ? inputError : inputBase} />
                            {fieldErrors.state && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.state}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode}
                                onChange={handleInputChange} placeholder="e.g. 500033" maxLength={6}
                                className={fieldErrors.pincode ? inputError : inputBase} />
                            {fieldErrors.pincode && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.pincode}
                                </p>
                            )}
                        </div>
                    </div>

                    {fieldErrors.location && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-sm text-red-700 flex items-center gap-1.5">
                                <span>⚠️</span> {fieldErrors.location}
                            </p>
                        </div>
                    )}

                    {!formData.latitude && !formData.longitude && (
                        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
                            <p className={`${typography.body.small} text-amber-800`}>
                                💡 <span className="font-medium">Tip:</span> Use auto-detect to fill location automatically from your device GPS.
                            </p>
                        </div>
                    )}

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

                {/* ─── 8. PORTFOLIO PHOTOS ──────────────────────────────────── */}
                <SectionCard title={`Portfolio Photos (${totalImages}/5)`}>
                    <label className={`cursor-pointer block ${totalImages >= 5 ? 'cursor-not-allowed' : ''}`}>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                            className="hidden" disabled={totalImages >= 5} />
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${totalImages >= 5
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                : 'hover:opacity-90 cursor-pointer'}`}
                            style={totalImages < 5 ? { borderColor: BRAND, backgroundColor: '#f0f7fb' } : {}}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0eff7' }}>
                                    <Upload className="w-8 h-8" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {totalImages >= 5 ? 'Maximum 5 images reached' : `Tap to upload portfolio photos (${5 - totalImages} slots left)`}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>Maximum 5 images · 5 MB each</p>
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
                                    <span className={`absolute bottom-2 left-2 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}
                                        style={{ backgroundColor: BRAND }}>Saved</span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img src={preview} alt={`New ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: BRAND }} />
                                    <button type="button" onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-2 left-2 bg-green-600 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}>New</span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* ── Action Buttons ── */}
                <div className="flex gap-4 pt-2 pb-8">
                    <button
                        type="button" onClick={handleSubmit}
                        disabled={loading || !!successMessage}
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
                        type="button" onClick={() => window.history.back()} disabled={loading}
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