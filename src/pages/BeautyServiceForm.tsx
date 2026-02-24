import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createBeautyWorker,
    updateBeautyWorker,
    getBeautyWorkerById,
} from '../services/Beauty.Service.service';
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, ChevronDown } from 'lucide-react';
import { useAccount } from "../context/AccountContext";

const BRAND = '#00598a';

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
// SHARED INPUT CLASS
// ============================================================================
const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

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
    const { setAccountType } = useAccount();

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
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async pos => {
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
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
            err => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError(''); setSuccessMessage('');
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
            setTimeout(() => { setAccountType("worker"); navigate("/my-business"); }, 1500);
        } catch (err: unknown) {
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4"
                        style={{ borderColor: BRAND }} />
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

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className={`${typography.heading.h5} text-gray-900 leading-tight`}>
                            {isEditMode ? 'Update Beauty Service' : 'Add Beauty Service'}
                        </h1>
                        <p className={`${typography.body.xs} text-gray-400 mt-0.5`}>
                            {isEditMode ? 'Update your service listing' : 'Create new beauty service listing'}
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
                {!formData.userId && !isEditMode && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                        <p className={`${typography.body.small} text-orange-700`}>
                            ⚠️ You must be logged in to add a service.
                        </p>
                    </div>
                )}

                {/* ─── 1. BUSINESS NAME + CATEGORY (two columns) ───────────── */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Business / Professional Name</FieldLabel>
                            <input
                                type="text" name="name" value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g. Glam Beauty Salon"
                                className={inputCls}
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
                                    {['Beautician', 'Hair Stylist', 'Makeup Artist', 'Spa Therapist',
                                        'Massage Therapist', 'Nail Technician', 'Skincare Specialist',
                                        'Fitness Trainer', 'Yoga Instructor', 'Tattoo Artist',
                                        'Mehendi Artist', 'Beauty Parlour'].map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
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
                                placeholder="Enter phone number"
                                className={inputCls}
                            />
                            <FieldError message={fieldErrors.phone} />
                        </div>
                        <div>
                            <FieldLabel required>Email</FieldLabel>
                            <input
                                type="email" name="email" value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                className={inputCls}
                            />
                            <FieldError message={fieldErrors.email} />
                        </div>
                    </div>
                </Card>

                {/* ─── 3. PROFESSIONAL DETAILS (two columns) ───────────────── */}
                <Card>
                    <CardTitle title="Professional Details" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel>Experience (years)</FieldLabel>
                            <input
                                type="number" name="experience" value={formData.experience}
                                onChange={handleInputChange}
                                placeholder="Years of experience" min="0"
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel>Service Charge (₹)</FieldLabel>
                            <input
                                type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleInputChange}
                                placeholder="Amount" min="0"
                                className={inputCls}
                            />
                            <FieldError message={fieldErrors.serviceCharge} />
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
                                    {availabilityOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        {/* Currently Available toggle — right column */}
                        <div className="flex items-center justify-between px-1 py-2">
                            <div>
                                <span className={`${typography.body.small} font-semibold text-gray-800`}>Currently Available</span>
                                <p className={`${typography.body.xs} text-gray-500 mt-0.5`}>
                                    Toggle on to appear available to clients
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleAvailabilityToggle}
                                className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0"
                                style={{ backgroundColor: isCurrentlyAvailable ? BRAND : '#D1D5DB' }}
                            >
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isCurrentlyAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                </Card>

                {/* ─── 4. SERVICES OFFERED (full width) ────────────────────── */}
                <Card>
                    <CardTitle title="Services Offered" />
                    <div>
                        <FieldLabel required>Services</FieldLabel>
                        <textarea
                            name="services" value={formData.services}
                            onChange={handleInputChange} rows={3}
                            placeholder="Haircut, Hair Coloring, Facial, Makeup, Manicure, Pedicure"
                            className={inputCls + ' resize-none'}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>💡 Separate each service with a comma</p>
                        <FieldError message={fieldErrors.services} />
                    </div>
                    {formData.services.trim() && (
                        <div className="mt-3">
                            <p className={`${typography.body.small} font-medium text-gray-700 mb-2`}>
                                Selected ({formData.services.split(',').filter(s => s.trim()).length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {formData.services.split(',').map((s, i) => {
                                    const t = s.trim();
                                    if (!t) return null;
                                    return (
                                        <span key={i}
                                            className={`inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-2 rounded-full ${typography.misc.badge} text-white`}
                                            style={{ backgroundColor: BRAND }}>
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
                </Card>

                {/* ─── 5. BIO (full width) ─────────────────────────────────── */}
                <Card>
                    <FieldLabel>Bio</FieldLabel>
                    <textarea
                        name="bio" value={formData.bio}
                        onChange={handleInputChange} rows={4}
                        placeholder="Tell clients about yourself and your expertise..."
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
                                onChange={handleInputChange} placeholder="e.g. Banjara Hills" className={inputCls} />
                            <FieldError message={fieldErrors.area} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city}
                                onChange={handleInputChange} placeholder="e.g. Hyderabad" className={inputCls} />
                            <FieldError message={fieldErrors.city} />
                        </div>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state}
                                onChange={handleInputChange} placeholder="e.g. Telangana" className={inputCls} />
                            <FieldError message={fieldErrors.state} />
                        </div>
                        <div>
                            <FieldLabel>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode}
                                onChange={handleInputChange} placeholder="e.g. 500016" maxLength={6} className={inputCls} />
                        </div>
                    </div>

                    {fieldErrors.location && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-sm text-red-700 flex items-center gap-1.5"><span>⚠️</span> {fieldErrors.location}</p>
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
                                    <p className={`${typography.body.xs} text-gray-400 mt-1`}>JPG, PNG, WebP — max 5 MB each</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img src={url} alt={`Saved ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl"
                                        onError={e => { (e.target as HTMLImageElement).src = ''; }} />
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
                                    <img src={preview} alt={`New ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
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
                    <button type="button" onClick={handleSubmit} disabled={loading || !!successMessage}
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
                            : successMessage ? '✓ Done'
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

export default BeautyServiceForm;