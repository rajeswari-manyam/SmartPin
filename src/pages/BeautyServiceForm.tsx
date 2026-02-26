import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createBeautyWorker,
    updateBeautyWorker,
    getBeautyWorkerById,
} from '../services/Beauty.Service.service';
import typography from "../styles/typography";
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from "../context/AccountContext";
import { categories } from "../components/categories/Categories";
import SubCategoriesData from "../components/data/SubCategories.json";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

// ─────────────────────────────────────────────────────────────────────────────
const BRAND = '#00598a';

const availabilityOptions = ['Full Time', 'Part Time', 'On Demand', 'Weekends Only'];

interface SubCategoryGroup {
    categoryId: number;
    items: { name: string; icon?: string }[];
}

const subcategoryGroups: SubCategoryGroup[] = (SubCategoriesData as any).subcategories || [];

// ============================================================================
// SHARED INPUT CLASSES  (same as ArtForm)
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
// REUSABLE COMPONENTS  (same as ArtForm)
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
    } catch { return null; }
};

// ============================================================================
// FIELD ERRORS
// ============================================================================
interface FieldErrors {
    userId?: string;
    name?: string;
    phone?: string;
    email?: string;
    services?: string;
    serviceCharge?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    location?: string;
    category?: string;
    subcategory?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
const BeautyServiceForm: React.FC = () => {
    const navigate = useNavigate();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [locationWarning, setLocationWarning] = useState('');
    const { setAccountType } = useAccount();

    // ── Category / Subcategory state ──────────────────────────────────────────
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');

    const filteredSubcategories = selectedCategory
        ? (subcategoryGroups.find(g => String(g.categoryId) === selectedCategory)?.items || [])
        : [];

    const subcategoryOptions = filteredSubcategories.map(s => ({
        name: s.name,
        icon: SUBCATEGORY_ICONS[s.name],
    }));

    // ── Form fields ───────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        userId:        localStorage.getItem('userId') || '',
        name:          '',
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
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const isGPSDetected = useRef(false);

    // ── Fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const data = await getBeautyWorkerById(editId);
                if (!data) throw new Error('Service not found');

                const savedCategory = (data as any).category || '';
                const savedType     = (data as any).type || (data as any).subCategory || '';
                const matchedCat    = categories.find(c => c.name === savedCategory);
                if (matchedCat) setSelectedCategory(matchedCat.id);
                setSelectedSubcategory(savedType);

                const servicesString = Array.isArray(data.services)
                    ? data.services.join(', ')
                    : (data.services || '');
                const availStr = typeof data.availability === 'boolean'
                    ? (data.availability ? 'Full Time' : availabilityOptions[0])
                    : (data.availability || availabilityOptions[0]);

                setFormData(prev => ({
                    ...prev,
                    userId:        data.userId || prev.userId,
                    name:          data.name || '',
                    email:         data.email || '',
                    phone:         data.phone || '',
                    bio:           data.bio || '',
                    services:      servicesString,
                    serviceCharge: data.serviceCharge?.toString() || '',
                    area:          data.area || '',
                    city:          data.city || '',
                    state:         data.state || '',
                    pincode:       data.pincode || '',
                    latitude:      data.latitude?.toString() || '',
                    longitude:     data.longitude?.toString() || '',
                    experience:    data.experience?.toString() || '',
                    availability:  availStr,
                }));
                setIsCurrentlyAvailable(
                    typeof data.availability === 'boolean'
                        ? data.availability
                        : (data.availability === 'Full Time' || data.availability === 'On Demand')
                );
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
        const detect = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                const addr = [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ');
                const coords = await geocodeAddress(addr);
                if (coords) setFormData(prev => ({
                    ...prev,
                    latitude:  coords.lat.toString(),
                    longitude: coords.lng.toString(),
                }));
            }
        };
        const t = setTimeout(detect, 1000);
        return () => clearTimeout(t);
    }, [formData.area, formData.city, formData.state, formData.pincode]);

    const handleAvailabilityToggle = () => {
        const next = !isCurrentlyAvailable;
        setIsCurrentlyAvailable(next);
        setFormData(prev => ({ ...prev, availability: next ? 'Full Time' : 'Part Time' }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof FieldErrors])
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    };

    // ── Image helpers ─────────────────────────────────────────────────────────
    const remainingExistingCount = existingImages.filter(url => !imagesToDelete.includes(url)).length;
    const totalImages = remainingExistingCount + selectedImages.length;
    const maxImagesReached = totalImages >= 5;

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const slots = 5 - totalImages;
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
                if (++loaded === valid.length) setImagePreviews(prev => [...prev, ...previews]);
            };
            r.readAsDataURL(f);
        });
        setSelectedImages(prev => [...prev, ...valid]);
        setError('');
    };

    const handleRemoveNewImage      = (i: number)   => { setSelectedImages(p => p.filter((_, idx) => idx !== i)); setImagePreviews(p => p.filter((_, idx) => idx !== i)); };
    const handleRemoveExistingImage = (url: string) => setImagesToDelete(prev => [...prev, url]);
    const handleRestoreExistingImage= (url: string) => setImagesToDelete(prev => prev.filter(u => u !== url));

    // ── GPS location ──────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(''); setLocationWarning('');
        setFieldErrors(prev => ({ ...prev, location: undefined }));
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async pos => {
                isGPSDetected.current = true;
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                if (pos.coords.accuracy > 500)
                    setLocationWarning(`⚠️ Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify.`);
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data.address) {
                        setFormData(prev => ({
                            ...prev, latitude: lat, longitude: lng,
                            area:    data.address.suburb || data.address.neighbourhood || data.address.road || prev.area,
                            city:    data.address.city   || data.address.town || data.address.village || prev.city,
                            state:   data.address.state  || prev.state,
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

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError(''); setSuccessMessage('');

        const errors: FieldErrors = {};
        if (!selectedCategory)   errors.category    = 'Please select a category';
        if (!selectedSubcategory) errors.subcategory = 'Please select a service type';
        if (!formData.name.trim())  errors.name    = 'Business / professional name is required';
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^\+?[\d\s\-()]{7,}$/.test(formData.phone.trim())) {
            errors.phone = 'Enter a valid phone number';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Enter a valid email address';
        }
        if (!formData.services.trim()) errors.services = 'Please enter at least one service';
        if (formData.serviceCharge.trim()) {
            const charge = parseFloat(formData.serviceCharge);
            if (isNaN(charge) || charge < 0) errors.serviceCharge = 'Enter a valid service charge';
        }
        if (!formData.area.trim())   errors.area   = 'Area is required';
        if (!formData.city.trim())   errors.city   = 'City is required';
        if (!formData.state.trim())  errors.state  = 'State is required';
        if (!formData.pincode.trim()) errors.pincode = 'PIN code is required';
        if (!formData.latitude || !formData.longitude)
            errors.location = 'Location is required — use Auto Detect or enter your address';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('Please fix the errors below before submitting');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setFieldErrors({});
        setLoading(true);

        try {
            const categoryName  = categories.find(c => c.id === selectedCategory)?.name || '';
            const servicesArray = formData.services.split(',').map(s => s.trim()).filter(Boolean);
            const charge        = formData.serviceCharge.trim() ? parseFloat(formData.serviceCharge) : 0;
            const exp           = formData.experience.trim() ? parseInt(formData.experience, 10) : 0;

            const payload = {
                userId:        formData.userId,
                name:          formData.name,
                email:         formData.email,
                phone:         formData.phone,
                category:      categoryName,
                type:          selectedSubcategory,
                bio:           formData.bio,
                services:      servicesArray,
                serviceCharge: charge,
                experience:    exp,
                area:          formData.area,
                city:          formData.city,
                state:         formData.state,
                pincode:       formData.pincode,
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
        } catch (err: unknown) {
            if (err instanceof Error) setError(err.message);
            else setError('Failed to submit form. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Loading screen ────────────────────────────────────────────────────────
    if (loadingData) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND }} />
                <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
            </div>
        </div>
    );

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
                            {isEditMode ? 'Update Beauty Service' : 'Add Beauty Service'}
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

                {/* Not logged in warning */}
                {!formData.userId && !isEditMode && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <p className={`${typography.body.small} text-orange-700`}>
                            ⚠️ You must be logged in to add a service.
                        </p>
                    </div>
                )}

                {/* ─── 1. NAME + CATEGORY + SUBCATEGORY ───────────────────── */}
                <SectionCard>
                    {/* Business name — full width */}
                    <div>
                        <FieldLabel required>Business / Professional Name</FieldLabel>
                        <input
                            type="text" name="name" value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Glam Beauty Salon"
                            className={fieldErrors.name ? inputError : inputBase}
                        />
                        {fieldErrors.name && (
                            <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                <span>⚠️</span> {fieldErrors.name}
                            </p>
                        )}
                    </div>

                    {/* Category + Subcategory — two columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Category</FieldLabel>
                            <IconSelect
                                label=""
                                value={selectedCategory}
                                placeholder="Select category"
                                options={categories.map(c => ({ id: c.id, name: c.name, icon: c.icon }))}
                                onChange={(val) => {
                                    setSelectedCategory(val);
                                    setSelectedSubcategory('');
                                    setFieldErrors(prev => ({ ...prev, category: undefined, subcategory: undefined }));
                                }}
                                disabled={loading}
                            />
                            {fieldErrors.category && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.category}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Service Type</FieldLabel>
                            <IconSelect
                                label=""
                                value={selectedSubcategory}
                                placeholder={selectedCategory ? 'Select type' : 'Select category first'}
                                disabled={!selectedCategory || loading}
                                options={subcategoryOptions}
                                onChange={(val) => {
                                    setSelectedSubcategory(val);
                                    setFieldErrors(prev => ({ ...prev, subcategory: undefined }));
                                }}
                            />
                            {fieldErrors.subcategory && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.subcategory}
                                </p>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 2. CONTACT ──────────────────────────────────────────── */}
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
                            <FieldLabel required>Email</FieldLabel>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                className={fieldErrors.email ? inputError : inputBase}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.email}
                                </p>
                            )}
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 3. PROFESSIONAL DETAILS ─────────────────────────────── */}
                <SectionCard title="Professional Details">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Experience (years)</FieldLabel>
                            <input
                                type="number" name="experience" value={formData.experience}
                                onChange={handleInputChange}
                                placeholder="Years of experience" min="0"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel>Service Charge (₹)</FieldLabel>
                            <input
                                type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleInputChange}
                                placeholder="Amount" min="0"
                                className={fieldErrors.serviceCharge ? inputError : inputBase}
                            />
                            {fieldErrors.serviceCharge && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.serviceCharge}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Availability</FieldLabel>
                            <select
                                name="availability" value={formData.availability}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'}
                                style={selectStyle}
                            >
                                {availabilityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                            </select>
                        </div>
                        {/* Currently Available toggle */}
                        <div className="flex items-center justify-between px-1 py-2">
                            <div>
                                <span className={`${typography.body.small} font-semibold text-gray-800`}>Currently Available</span>
                                <p className={`${typography.body.small} text-gray-500 mt-0.5 text-xs`}>
                                    Toggle on to appear available to clients
                                </p>
                            </div>
                            <button
                                type="button" onClick={handleAvailabilityToggle}
                                className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0"
                                style={{ backgroundColor: isCurrentlyAvailable ? BRAND : '#D1D5DB' }}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isCurrentlyAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 4. SERVICES + BIO ───────────────────────────────────── */}
                <SectionCard title="Service Description">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Services Offered</FieldLabel>
                            <textarea
                                name="services" value={formData.services}
                                onChange={handleInputChange} rows={4}
                                placeholder="Haircut, Hair Coloring, Facial, Makeup, Manicure, Pedicure"
                                className={(fieldErrors.services ? inputError : inputBase) + ' resize-none'}
                            />
                            {fieldErrors.services ? (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.services}
                                </p>
                            ) : (
                                <p className={`${typography.body.xs} text-gray-400 mt-1`}>
                                    💡 Separate each service with a comma
                                </p>
                            )}
                            {formData.services.trim() && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.services.split(',').map((s, i) => {
                                        const t = s.trim();
                                        if (!t) return null;
                                        return (
                                            <span key={i}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${typography.misc.badge} font-medium text-white`}
                                                style={{ backgroundColor: BRAND }}>
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                                {t}
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
                                onChange={handleInputChange} rows={4}
                                placeholder="Tell clients about yourself and your expertise..."
                                className={inputBase + ' resize-none'}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 5. LOCATION ─────────────────────────────────────────── */}
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
                                : <><MapPin className="w-4 h-4" /> Auto Detect</>
                            }
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
                    </div>

                    {/* State + PIN Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <FieldLabel>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode}
                                onChange={handleInputChange} placeholder="e.g. 500016" maxLength={6}
                                className={fieldErrors.pincode ? inputError : inputBase} />
                            {fieldErrors.pincode && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.pincode}
                                </p>
                            )}
                        </div>
                    </div>

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

                {/* ─── 6. PORTFOLIO PHOTOS ─────────────────────────────────── */}
                <SectionCard title="Portfolio Photos (Optional)">
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
                                        {maxImagesReached ? 'Maximum 5 images reached' : `Tap to upload photos (${5 - totalImages} slots left)`}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>Maximum 5 images · 5 MB each</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.filter(u => !imagesToDelete.includes(u)).length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImages.filter(url => !imagesToDelete.includes(url)).map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square group">
                                    <img src={url} alt={`Saved ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Error'; }} />
                                    <button type="button" onClick={() => handleRemoveExistingImage(url)}
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
                                        className="w-full h-full object-cover rounded-xl border-2" style={{ borderColor: BRAND }} />
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

                    {/* Restore deleted images */}
                    {imagesToDelete.length > 0 && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className={`${typography.body.small} text-red-700 mb-2`}>
                                Images marked for deletion ({imagesToDelete.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {imagesToDelete.map((url, i) => (
                                    <button key={`del-${i}`} onClick={() => handleRestoreExistingImage(url)}
                                        className="inline-flex items-center gap-1 text-xs bg-white border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">
                                        <span>↩</span> Restore image {i + 1}
                                    </button>
                                ))}
                            </div>
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

export default BeautyServiceForm;