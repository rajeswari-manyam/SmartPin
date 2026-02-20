import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createBeautyWorker,
    updateBeautyWorker,
    getBeautyWorkerById,
} from '../services/Beauty.Service.service';
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

const availabilityOptions = ['Full Time', 'Part Time', 'On Demand', 'Weekends Only'];

const getBeautyWellnessSubcategories = (): string[] => {
    const beautyCategory = subcategoriesData.subcategories.find(
        (cat: any) => cat.categoryId === 5
    );
    return beautyCategory ? beautyCategory.items.map((item: any) => item.name) : [];
};
const BEAUTY_CATEGORIES = getBeautyWellnessSubcategories();

const getCategoryFromSubcategory = (sub: string): string => {
    const l = sub.toLowerCase();
    if (l.includes('spa') || l.includes('massage')) return 'Spa Therapist';
    if (l.includes('fitness') || l.includes('gym')) return 'Fitness Trainer';
    if (l.includes('makeup')) return 'Makeup Artist';
    if (l.includes('salon') || l.includes('hair')) return 'Hair Stylist';
    if (l.includes('yoga')) return 'Yoga Instructor';
    if (l.includes('tattoo')) return 'Tattoo Artist';
    if (l.includes('mehendi') || l.includes('mehndi')) return 'Mehendi Artist';
    if (l.includes('nail')) return 'Nail Technician';
    if (l.includes('skin')) return 'Skincare Specialist';
    return 'Beautician';
};

// ============================================================================
// SHARED INPUT CLASSES
// ============================================================================
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `placeholder-gray-400 transition-all duration-200 focus:outline-none ` +
    `${typography.form.input} bg-white`;

const inputError =
    `w-full px-4 py-3 border border-red-400 rounded-xl ` +
    `placeholder-gray-400 transition-all duration-200 focus:outline-none ` +
    `${typography.form.input} bg-white`;

// Focus handlers reused across all inputs
const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#f09b13';
    e.target.style.boxShadow = '0 0 0 2px #f09b1340';
};
const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, hasError = false) => {
    e.target.style.borderColor = hasError ? '#f87171' : '#D1D5DB';
    e.target.style.boxShadow = 'none';
};

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
        {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
    message ? (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
            <span>⚠️</span> {message}
        </p>
    ) : null;

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

const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
};

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
    userId?: string;
    name?: string;
    phone?: string;
    email?: string;
    services?: string;
    serviceCharge?: string;
    area?: string;
    city?: string;
    state?: string;
    location?: string;
}

const validateForm = (
    formData: {
        userId: string; name: string; phone: string; email: string;
        services: string; serviceCharge: string;
        area: string; city: string; state: string;
        latitude: string; longitude: string;
    },
    isEditMode: boolean
): FieldErrors => {
    const errors: FieldErrors = {};
    if (!isEditMode && !formData.userId.trim()) errors.userId = 'You must be logged in to add a service';
    if (!formData.name.trim()) errors.name = 'Business / professional name is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{7,}$/.test(formData.phone.trim())) errors.phone = 'Enter a valid phone number';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) errors.email = 'Enter a valid email address';
    if (!formData.services.trim()) errors.services = 'Please enter at least one service';
    if (formData.serviceCharge.trim()) {
        const charge = parseFloat(formData.serviceCharge);
        if (isNaN(charge) || charge < 0) errors.serviceCharge = 'Enter a valid service charge';
    }
    if (!formData.area.trim()) errors.area = 'Area is required';
    if (!formData.city.trim()) errors.city = 'City is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.latitude || !formData.longitude)
        errors.location = 'Location is required — use Auto Detect or enter your address';
    return errors;
};

// ============================================================================
// COMPONENT
// ============================================================================
const BeautyServiceForm: React.FC = () => {
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
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const defaultSubcategory = getSubcategoryFromUrl() || BEAUTY_CATEGORIES[0] || 'Beauty Parlour';
    const defaultCategory = getCategoryFromSubcategory(defaultSubcategory);

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: '',
        category: defaultCategory,
        email: '',
        phone: '',
        bio: '',
        services: '',
        serviceCharge: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        experience: '',
        availability: availabilityOptions[0],
    });

    const [isCurrentlyAvailable, setIsCurrentlyAvailable] = useState(true);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const gpsCoords = useRef<{ lat: string; lng: string } | null>(null);

    // ── Fetch for edit ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const data = await getBeautyWorkerById(editId);
                if (!data) throw new Error('Service not found');
                const servicesString = Array.isArray(data.services)
                    ? data.services.join(', ')
                    : (data.services || '');
                const availStr = typeof data.availability === 'boolean'
                    ? (data.availability ? 'Full Time' : availabilityOptions[0])
                    : (data.availability || availabilityOptions[0]);
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || prev.userId,
                    name: data.name || '',
                    category: data.category || defaultCategory,
                    email: data.email || '',
                    phone: data.phone || '',
                    bio: data.bio || '',
                    services: servicesString,
                    serviceCharge: data.serviceCharge?.toString() || '',
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                    experience: data.experience?.toString() || '',
                    availability: availStr,
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

    // ── Auto-geocode ─────────────────────────────────────────────────────────
    useEffect(() => {
        const { area, city, state, latitude, longitude } = formData;
        if (!area.trim()) return;
        if (latitude && longitude) return;
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
        valid.forEach(f => {
            const r = new FileReader();
            r.onloadend = () => {
                previews.push(r.result as string);
                if (previews.length === valid.length)
                    setImagePreviews(prev => [...prev, ...previews]);
            };
            r.readAsDataURL(f);
        });
        setSelectedImages(prev => [...prev, ...valid]);
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
        setFieldErrors(prev => ({ ...prev, location: undefined }));
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLocationLoading(false);
            return;
        }
        navigator.geolocation.getCurrentPosition(
            async pos => {
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
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
                } catch (e) { console.error(e); }
                setLocationLoading(false);
            },
            err => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError('');
        setSuccessMessage('');
        const errors = validateForm(formData, isEditMode);
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError(Object.values(errors)[0] || 'Please fix the errors below');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setFieldErrors({});
        setLoading(true);
        try {
            const servicesArray = formData.services.split(',').map(s => s.trim()).filter(Boolean);
            const charge = formData.serviceCharge.trim() ? parseFloat(formData.serviceCharge) : 0;
            const exp = formData.experience.trim() ? parseInt(formData.experience, 10) : 0;
            const payload = {
                userId: formData.userId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                category: formData.category,
                bio: formData.bio,
                services: servicesArray,
                serviceCharge: charge,
                experience: exp,
                area: formData.area,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                latitude: parseFloat(formData.latitude),
                longitude: parseFloat(formData.longitude),
                availability: formData.availability,
            };
            if (isEditMode && editId) {
                await updateBeautyWorker(editId, payload, selectedImages);
                setSuccessMessage('Service updated successfully!');
            } else {
                await createBeautyWorker(payload, selectedImages);
                setSuccessMessage('Service created successfully!');
            }
            setTimeout(() => navigate('/my-business'), 1500);
        } catch (err: unknown) {
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                        style={{ borderColor: '#f09b13' }} />
                    <p className={`${typography.body.base} text-gray-600`}>Loading service data...</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={handleCancel} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Beauty Service' : 'Add Beauty Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your service listing' : 'Create new beauty service listing'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Global error */}
                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">⚠️</span>
                            <div>
                                <p className="font-semibold text-red-800 mb-1">Please fix the following</p>
                                <p className="text-red-700">{error}</p>
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
                        <p className={`${typography.body.small} text-orange-700`}>
                            ⚠️ You must be logged in to add a service.
                        </p>
                    </div>
                )}

                {/* 1. NAME */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Business / Professional Name</FieldLabel>
                        <input
                            type="text" name="name" value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Glam Beauty Salon"
                            className={fieldErrors.name ? inputError : inputBase}
                            onFocus={focusStyle}
                            onBlur={e => blurStyle(e, !!fieldErrors.name)}
                        />
                        <FieldError message={fieldErrors.name} />
                    </div>
                </SectionCard>

                {/* 2. CONTACT */}
                <SectionCard title="Contact Information">
                    <div>
                        <FieldLabel required>Phone</FieldLabel>
                        <input
                            type="tel" name="phone" value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className={fieldErrors.phone ? inputError : inputBase}
                            onFocus={focusStyle}
                            onBlur={e => blurStyle(e, !!fieldErrors.phone)}
                        />
                        <FieldError message={fieldErrors.phone} />
                    </div>
                    <div>
                        <FieldLabel required>Email</FieldLabel>
                        <input
                            type="email" name="email" value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email address"
                            className={fieldErrors.email ? inputError : inputBase}
                            onFocus={focusStyle}
                            onBlur={e => blurStyle(e, !!fieldErrors.email)}
                        />
                        <FieldError message={fieldErrors.email} />
                    </div>
                </SectionCard>

                {/* 3. CATEGORY */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Service Category</FieldLabel>
                        <select
                            name="category" value={formData.category}
                            onChange={handleInputChange}
                            className={`${inputBase} appearance-none`}
                            style={selectStyle}
                            onFocus={focusStyle}
                            onBlur={e => blurStyle(e)}
                        >
                            {['Beautician', 'Hair Stylist', 'Makeup Artist', 'Spa Therapist',
                                'Massage Therapist', 'Nail Technician', 'Skincare Specialist',
                                'Fitness Trainer', 'Yoga Instructor', 'Tattoo Artist',
                                'Mehendi Artist', 'Beauty Parlour'].map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                        </select>
                    </div>
                </SectionCard>

                {/* 4. SERVICES */}
                <SectionCard title="Services Offered">
                    <div>
                        <FieldLabel required>Services</FieldLabel>
                        <textarea
                            name="services" value={formData.services}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Haircut, Hair Coloring, Facial, Makeup, Manicure, Pedicure"
                            className={`${fieldErrors.services ? inputError : inputBase} resize-none`}
                            onFocus={focusStyle}
                            onBlur={e => blurStyle(e, !!fieldErrors.services)}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>💡 Separate each service with a comma</p>
                        <FieldError message={fieldErrors.services} />
                    </div>
                    {formData.services.trim() && (
                        <div className="mt-1">
                            <p className={`${typography.body.small} font-medium text-gray-700 mb-2`}>
                                Selected ({formData.services.split(',').filter(s => s.trim()).length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {formData.services.split(',').map((s, i) => {
                                    const t = s.trim();
                                    if (!t) return null;
                                    return (
                                        <span key={i}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white ${typography.misc.badge} font-medium`}
                                            style={{ backgroundColor: '#f09b13' }}>
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {t}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* 5. PROFESSIONAL DETAILS */}
                <SectionCard title="Professional Details">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Experience (years)</FieldLabel>
                            <input
                                type="number" name="experience" value={formData.experience}
                                onChange={handleInputChange}
                                placeholder="Years" min="0"
                                className={inputBase}
                                onFocus={focusStyle}
                                onBlur={e => blurStyle(e)}
                            />
                        </div>
                        <div>
                            <FieldLabel>Service Charge (₹)</FieldLabel>
                            <input
                                type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleInputChange}
                                placeholder="Amount" min="0"
                                className={fieldErrors.serviceCharge ? inputError : inputBase}
                                onFocus={focusStyle}
                                onBlur={e => blurStyle(e, !!fieldErrors.serviceCharge)}
                            />
                            <FieldError message={fieldErrors.serviceCharge} />
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Availability</FieldLabel>
                        <select
                            name="availability" value={formData.availability}
                            onChange={handleInputChange}
                            className={`${inputBase} appearance-none`}
                            style={selectStyle}
                            onFocus={focusStyle}
                            onBlur={e => blurStyle(e)}
                        >
                            {availabilityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <span className={`${typography.body.small} font-semibold text-gray-800`}>Currently Available</span>
                            <p className={`${typography.body.xs} text-gray-500 mt-0.5`}>
                                Toggle on to appear as available to clients
                            </p>
                        </div>
                        {/* Toggle — uses #f09b13 when active */}
                        <button
                            type="button"
                            onClick={handleAvailabilityToggle}
                            className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors"
                            style={{ backgroundColor: isCurrentlyAvailable ? '#f09b13' : '#D1D5DB' }}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isCurrentlyAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </SectionCard>

                {/* 6. BIO */}
                <SectionCard title="Bio">
                    <textarea
                        name="bio" value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Tell clients about yourself and your expertise..."
                        className={`${inputBase} resize-none`}
                        onFocus={focusStyle}
                        onBlur={e => blurStyle(e)}
                    />
                </SectionCard>

                {/* 7. LOCATION */}
                <SectionCard
                    title="Location Details"
                    action={
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-sm font-medium text-white transition-all disabled:opacity-60"
                            style={{ backgroundColor: '#f09b13' }}
                            onMouseEnter={e => { if (!locationLoading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d4880f'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f09b13'; }}
                        >
                            {locationLoading
                                ? <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                                : <><MapPin className="w-4 h-4" />Auto Detect</>}
                        </button>
                    }
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange}
                                placeholder="e.g. Banjara Hills"
                                className={fieldErrors.area ? inputError : inputBase}
                                onFocus={focusStyle} onBlur={e => blurStyle(e, !!fieldErrors.area)} />
                            <FieldError message={fieldErrors.area} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                                placeholder="e.g. Hyderabad"
                                className={fieldErrors.city ? inputError : inputBase}
                                onFocus={focusStyle} onBlur={e => blurStyle(e, !!fieldErrors.city)} />
                            <FieldError message={fieldErrors.city} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                                placeholder="e.g. Telangana"
                                className={fieldErrors.state ? inputError : inputBase}
                                onFocus={focusStyle} onBlur={e => blurStyle(e, !!fieldErrors.state)} />
                            <FieldError message={fieldErrors.state} />
                        </div>
                        <div>
                            <FieldLabel>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                                placeholder="e.g. 500016"
                                className={inputBase}
                                onFocus={focusStyle} onBlur={e => blurStyle(e)} />
                        </div>
                    </div>

                    {fieldErrors.location && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-sm text-red-700 flex items-center gap-1.5"><span>⚠️</span> {fieldErrors.location}</p>
                        </div>
                    )}

                    {!formData.latitude && !formData.longitude && (
                        <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ed', border: '1px solid #f09b1340' }}>
                            <p className={`${typography.body.small}`} style={{ color: '#92600a' }}>
                                📍 <span className="font-medium">Tip:</span> Click "Auto Detect" or type your address — coordinates set automatically.
                            </p>
                        </div>
                    )}
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

                {/* 8. PORTFOLIO PHOTOS */}
                <SectionCard title="Portfolio Photos (Optional)">
                    <label className="cursor-pointer block">
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden"
                            disabled={selectedImages.length + existingImages.length >= 5} />
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
                                selectedImages.length + existingImages.length >= 5
                                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                    : 'hover:bg-orange-50'
                            }`}
                            style={selectedImages.length + existingImages.length < 5 ? { borderColor: '#f09b13' } : {}}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: '#fff0d6' }}>
                                    <Upload className="w-8 h-8" style={{ color: '#f09b13' }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {selectedImages.length + existingImages.length >= 5
                                            ? 'Maximum 5 images reached'
                                            : 'Tap to upload portfolio photos'}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>JPG, PNG, WebP — max 5 MB each</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img src={url} alt={`Saved ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                        onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                                    <button type="button" onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-2 left-2 bg-blue-600 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}>Saved</span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img src={preview} alt={`New ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: '#f09b13' }} />
                                    <button type="button" onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-2 left-2 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}
                                        style={{ backgroundColor: '#f09b13' }}>New</span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2 pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !!successMessage}
                        type="button"
                        className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md ${typography.body.base}`}
                        style={{ backgroundColor: loading || successMessage ? '#f5b340' : '#f09b13', cursor: loading || successMessage ? 'not-allowed' : 'pointer' }}
                        onMouseEnter={e => { if (!loading && !successMessage) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d4880f'; }}
                        onMouseLeave={e => { if (!loading && !successMessage) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f09b13'; }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : successMessage ? '✓ Done' : (isEditMode ? 'Update Service' : 'Create Service')}
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

export default BeautyServiceForm;