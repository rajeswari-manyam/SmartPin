import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    addSportsActivity,
    updateSportsActivity,
    getSportsActivityById,
    SportsWorker,
} from '../services/Sports.service';
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, ChevronDown } from 'lucide-react';
import { useAccount } from '../context/AccountContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const chargeTypeOptions = ['Hour', 'Day', 'Session', 'Month', 'Package'];
const CATEGORY_NAME = 'Sports & Activities';

const getSportsSubcategories = (): string[] => {
    const cat = subcategoriesData.subcategories.find(c => c.categoryId === 17);
    return cat ? cat.items.map(i => i.name) : [];
};

const getCommonServices = (subCategory: string): string[] => {
    const n = subCategory.toLowerCase();
    if (n.includes('gym') || n.includes('fitness'))
        return ['Personal Training', 'Group Classes', 'Weight Training', 'Cardio', 'Strength Training', 'Diet Consultation'];
    if (n.includes('yoga'))
        return ['Hatha Yoga', 'Vinyasa', 'Ashtanga', 'Power Yoga', 'Meditation', 'Pranayama'];
    if (n.includes('swimming'))
        return ['Swimming Lessons', 'Adult Classes', 'Kids Classes', 'Competitive Training', 'Water Aerobics'];
    if (n.includes('cricket'))
        return ['Batting Coaching', 'Bowling Coaching', 'Fielding', 'Match Practice', 'Fitness Training'];
    if (n.includes('football') || n.includes('soccer'))
        return ['Dribbling', 'Shooting', 'Passing', 'Defense', 'Goalkeeping', 'Match Tactics'];
    if (n.includes('basketball'))
        return ['Shooting Skills', 'Dribbling', 'Defense', 'Team Play', 'Conditioning'];
    if (n.includes('tennis'))
        return ['Forehand', 'Backhand', 'Serve', 'Volleys', 'Match Play'];
    if (n.includes('badminton'))
        return ['Basic Strokes', 'Smash', 'Drop Shot', 'Serve', 'Footwork', 'Match Practice'];
    if (n.includes('stadium') || n.includes('ground'))
        return ['Field Booking', 'Event Hosting', 'Tournament Organization', 'Equipment Rental'];
    if (n.includes('play') || n.includes('indoor'))
        return ['Kids Play', 'Group Activities', 'Birthday Events', 'Training Sessions'];
    return ['Training', 'Coaching', 'Practice Sessions', 'Competition Prep'];
};

// ── Geocoding helper ──────────────────────────────────────────────────────────
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
        const res = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`
        );
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry.location;
            return { lat, lng };
        }
        return null;
    } catch { return null; }
};

// ── Shared Tailwind input classes ─────────────────────────────────────────────
const inputBase =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-lg text-gray-800 ' +
    'placeholder-gray-400 bg-white outline-none transition-all duration-200 ' +
    'focus:border-[#00598a] focus:ring-2 focus:ring-[#00598a]/20';

const inputErr =
    'w-full px-4 py-3.5 border border-red-400 rounded-xl text-lg text-gray-800 ' +
    'placeholder-gray-400 bg-white outline-none transition-all duration-200 ' +
    'focus:border-red-400 focus:ring-2 focus:ring-red-300/30';

// ── Field errors type ─────────────────────────────────────────────────────────
interface FieldErrors {
    serviceName?: string;
    phone?: string;
    services?: string;
    location?: string;
}

// ── Micro-components ──────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className="block text-lg font-semibold text-gray-800 mb-2">
        {children}{required && <span className="text-[#00598a] ml-1">*</span>}
    </label>
);

const FieldError: React.FC<{ msg?: string }> = ({ msg }) =>
    msg ? <p className="mt-1.5 text-base text-red-500 flex items-center gap-1">⚠️ {msg}</p> : null;

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
    <div className="flex items-center justify-between mb-1">
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        {action}
    </div>
);

const SelectWrap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="relative">
        {children}
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#00598a] pointer-events-none" />
    </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================
const SportsForm: React.FC = () => {
    const navigate = useNavigate();
    const { setAccountType } = useAccount();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const getSubFromUrl = () => {
        const s = new URLSearchParams(window.location.search).get('subcategory');
        return s ? s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
    };

    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const sportsTypes = getSportsSubcategories();
    const defaultType = getSubFromUrl() || sportsTypes[0] || 'Gym & Fitness';

    // ── UI state ──────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [locationWarning, setLocationWarning] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
    const [customService, setCustomService] = useState('');
    const [commonServices, setCommonServices] = useState<string[]>(getCommonServices(defaultType));
    const isGPSDetected = useRef(false);

    // ── Form state ────────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        serviceName: '',
        phone: '',                          // ← NEW
        subCategory: defaultType,
        description: '',
        services: [] as string[],
        serviceCharge: '',
        chargeType: chargeTypeOptions[0],
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        availability: true,
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // ── Fetch edit data ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getSportsActivityById(editId);
                if (!response.success || !response.data) throw new Error('Service not found');
                const data = response.data;
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || '',
                    serviceName: data.serviceName || '',
                    phone: data.phone || '',          // ← NEW
                    subCategory: data.subCategory || defaultType,
                    description: data.description || '',
                    services: data.services || [],
                    serviceCharge: data.serviceCharge?.toString() || '',
                    chargeType: data.chargeType || chargeTypeOptions[0],
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                    availability: data.availability !== false,
                }));
                if (data.subCategory) setCommonServices(getCommonServices(data.subCategory));
                if (Array.isArray(data.images)) setExistingImages(data.images);
            } catch {
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Update common services when subcategory changes
    useEffect(() => {
        setCommonServices(getCommonServices(formData.subCategory));
    }, [formData.subCategory]);

    // Auto-geocode from typed address
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

    // ── Handlers ─────────────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof FieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleAddService = (service: string) => {
        if (!service.trim()) return;
        if (formData.services.includes(service)) { setError(`"${service}" is already added`); return; }
        setFormData(prev => ({ ...prev, services: [...prev.services, service] }));
        setCustomService('');
        setError('');
        if (fieldErrors.services) setFieldErrors(prev => ({ ...prev, services: undefined }));
    };

    const handleRemoveService = (index: number) => {
        setFormData(prev => ({ ...prev, services: prev.services.filter((_, i) => i !== index) }));
    };

    // ── Image helpers ─────────────────────────────────────────────────────────
    const totalImages = selectedImages.length + existingImages.length;

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
                if (++loaded === valid.length) setImagePreviews(p => [...p, ...previews]);
            };
            r.readAsDataURL(f);
        });
        setSelectedImages(p => [...p, ...valid]);
        setError('');
    };

    const removeNewImg = (i: number) => {
        setSelectedImages(p => p.filter((_, idx) => idx !== i));
        setImagePreviews(p => p.filter((_, idx) => idx !== i));
    };
    const removeExistingImg = (i: number) => setExistingImages(p => p.filter((_, idx) => idx !== i));

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
            err => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = (): FieldErrors => {
        const errs: FieldErrors = {};
        if (!formData.serviceName.trim()) errs.serviceName = 'Service name is required';
        if (!formData.phone.trim()) {
            errs.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
            errs.phone = 'Enter a valid 10-digit Indian mobile number';
        }
        if (formData.services.length === 0) errs.services = 'Please add at least one service';
        if (!formData.latitude || !formData.longitude) errs.location = 'Please provide a valid location';
        return errs;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setError(''); setSuccessMessage('');

        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setFieldErrors(errs);
            setError('Please fix the errors below before submitting');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('userId', formData.userId);
            fd.append('serviceName', formData.serviceName);
            fd.append('phone', formData.phone.trim());   // ← NEW
            fd.append('description', formData.description);
            fd.append('category', CATEGORY_NAME);
            fd.append('subCategory', formData.subCategory);
            fd.append('serviceCharge', formData.serviceCharge);
            fd.append('chargeType', formData.chargeType);
            fd.append('latitude', formData.latitude);
            fd.append('longitude', formData.longitude);
            fd.append('area', formData.area);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('pincode', formData.pincode);
            fd.append('availability', formData.availability.toString());
            formData.services.forEach(s => fd.append('services', s));
            selectedImages.forEach(f => fd.append('images', f, f.name));
            if (isEditMode && existingImages.length > 0) {
                fd.append('existingImages', JSON.stringify(existingImages));
            }

            if (isEditMode && editId) {
                const res = await updateSportsActivity(editId, fd);
                if (!res.success) throw new Error('Failed to update service');
                setSuccessMessage('Service updated successfully!');
            } else {
                const res = await addSportsActivity(fd);
                if (!res.success) throw new Error('Failed to create service');
                setSuccessMessage('Service created successfully!');
            }

            setTimeout(() => {
                setAccountType('worker');
                navigate('/my-business');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    // ── Loading screen ────────────────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00598a] mx-auto mb-4" />
                    <p className="text-lg text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Go back"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                            {isEditMode ? 'Update Sports Service' : 'Add Sports Service'}
                        </h1>
                        <p className="text-base text-gray-400 mt-0.5">
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-10">

                {/* Global error banner */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-2.5">
                        <span className="text-red-500 shrink-0 mt-0.5 text-lg">⚠️</span>
                        <div>
                            <p className="text-lg font-semibold text-red-800 mb-0.5">Please fix the following</p>
                            <p className="text-base text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success banner */}
                {successMessage && (
                    <div className="p-4 rounded-xl bg-[#00598a] border border-[#004a75] text-white flex items-center gap-2">
                        <span className="text-xl">✓</span>
                        <p className="text-lg font-medium">{successMessage}</p>
                    </div>
                )}

                {/* ── 1. Basic Information ── */}
                <Card>
                    <CardTitle title="Basic Information" />
                    <div>
                        <FieldLabel required>Service Name</FieldLabel>
                        <input
                            type="text" name="serviceName" value={formData.serviceName}
                            onChange={handleChange}
                            placeholder="e.g., Elite Fitness Training, Pro Cricket Academy"
                            className={fieldErrors.serviceName ? inputErr : inputBase}
                        />
                        <FieldError msg={fieldErrors.serviceName} />
                    </div>
                    <div>
                        <FieldLabel required>Category</FieldLabel>
                        <SelectWrap>
                            <select
                                name="subCategory" value={formData.subCategory}
                                onChange={handleChange}
                                className={inputBase + ' appearance-none pr-10'}
                            >
                                {sportsTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </SelectWrap>
                        <p className="text-sm text-gray-400 mt-1">
                            Parent category: <span className="font-medium text-gray-500">{CATEGORY_NAME}</span>
                        </p>
                    </div>
                    <div>
                        <FieldLabel>Description</FieldLabel>
                        <textarea
                            name="description" value={formData.description}
                            onChange={handleChange} rows={3}
                            placeholder="Brief description of your service..."
                            className={inputBase + ' resize-none'}
                        />
                    </div>
                </Card>

                {/* ── 2. Contact Information ── */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <div>
                        <FieldLabel required>Phone</FieldLabel>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter 10-digit mobile number"
                            maxLength={10}
                            className={fieldErrors.phone ? inputErr : inputBase}
                        />
                        <FieldError msg={fieldErrors.phone} />
                    </div>
                </Card>

                {/* ── 3. Services Offered ── */}
                <Card>
                    <CardTitle title="Services Offered" />

                    {/* Quick select chips */}
                    <div>
                        <p className="text-base font-medium text-gray-600 mb-2">Quick Select:</p>
                        <div className="flex flex-wrap gap-2">
                            {commonServices.map(service => {
                                const selected = formData.services.includes(service);
                                return (
                                    <button
                                        key={service}
                                        type="button"
                                        onClick={() => handleAddService(service)}
                                        disabled={selected}
                                        className={`px-3 py-1.5 rounded-full text-base font-medium transition-all ${
                                            selected
                                                ? 'bg-[#00598a] text-white cursor-not-allowed'
                                                : 'bg-gray-100 text-gray-700 hover:bg-[#00598a] hover:text-white'
                                        }`}
                                    >
                                        {selected ? '✓ ' : '+ '}{service}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Custom service input */}
                    <div>
                        <p className="text-base font-medium text-gray-600 mb-2">Add Custom Service:</p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customService}
                                onChange={e => setCustomService(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddService(customService); } }}
                                placeholder="Type custom service..."
                                className={inputBase}
                            />
                            <button
                                type="button"
                                onClick={() => handleAddService(customService)}
                                className="px-4 py-2.5 rounded-xl text-base font-bold text-white bg-[#00598a] hover:bg-[#004a75] transition-colors whitespace-nowrap"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Services error */}
                    <FieldError msg={fieldErrors.services} />

                    {/* Selected services tags */}
                    {formData.services.length > 0 && (
                        <div>
                            <p className="text-base font-semibold text-gray-700 mb-2">
                                Selected ({formData.services.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {formData.services.map((service, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center gap-1.5 bg-[#00598a] text-white px-3 py-1.5 rounded-full text-base font-medium"
                                    >
                                        {service}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveService(idx)}
                                            className="hover:opacity-70 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* ── 4. Pricing & Availability ── */}
                <Card>
                    <CardTitle title="Pricing & Availability" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Service Charge (₹)</FieldLabel>
                            <input
                                type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleChange} placeholder="Amount" min="0"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel>Charge Type</FieldLabel>
                            <SelectWrap>
                                <select
                                    name="chargeType" value={formData.chargeType}
                                    onChange={handleChange}
                                    className={inputBase + ' appearance-none pr-10'}
                                >
                                    {chargeTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </SelectWrap>
                        </div>
                    </div>

                    {/* Availability toggle */}
                    <div className="flex items-center justify-between py-1">
                        <span className="text-lg font-semibold text-gray-800">Currently Available</span>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, availability: !prev.availability }))}
                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                                formData.availability ? 'bg-[#00598a]' : 'bg-gray-300'
                            }`}
                        >
                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                                formData.availability ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                        </button>
                    </div>
                </Card>

                {/* ── 5. Portfolio Photos ── */}
                <Card>
                    <CardTitle title="Portfolio Photos (Optional)" />

                    {/* Upload zone */}
                    <label className={`block ${totalImages >= 5 ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                            type="file" accept="image/*" multiple
                            onChange={handleImageSelect} className="hidden"
                            disabled={totalImages >= 5}
                        />
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                            totalImages >= 5
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-[#00598a]/40 bg-[#e8f2f8]/30 hover:border-[#00598a] hover:bg-[#e8f2f8]/60'
                        }`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-[#e8f2f8] flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-[#00598a]" />
                                </div>
                                <div>
                                    <p className="text-lg font-semibold text-gray-700">
                                        {totalImages >= 5 ? 'Maximum limit reached (5 images)' : 'Tap to upload portfolio photos'}
                                    </p>
                                    <p className="text-base text-gray-400 mt-1">
                                        Max 5 images · 5 MB each · JPG, PNG, WEBP
                                    </p>
                                    {totalImages > 0 && (
                                        <p className="text-base font-semibold text-[#00598a] mt-1">
                                            {totalImages}/5 uploaded ✓
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Thumbnail grid */}
                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square group">
                                    <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                    <button
                                        type="button" onClick={() => removeExistingImg(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-1.5 left-1.5 bg-[#00598a] text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((src, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-[#00598a]" />
                                    <button
                                        type="button" onClick={() => removeNewImg(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-1.5 left-1.5 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                                        New
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* ── 6. Location Details ── */}
                <Card>
                    <CardTitle
                        title="Location Details"
                        action={
                            <button
                                type="button"
                                onClick={getCurrentLocation}
                                disabled={locationLoading}
                                className="inline-flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#00598a] hover:bg-[#004a75] text-white text-base font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {locationLoading
                                    ? <><span className="animate-spin text-base">⌛</span> Detecting…</>
                                    : <><MapPin className="w-4 h-4" /> Auto Detect</>}
                            </button>
                        }
                    />

                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3.5 flex items-start gap-2">
                            <span className="text-yellow-600 shrink-0">⚠️</span>
                            <p className="text-base text-yellow-800">{locationWarning}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { name: 'area', label: 'Area', placeholder: 'Area name' },
                            { name: 'city', label: 'City', placeholder: 'City' },
                            { name: 'state', label: 'State', placeholder: 'State' },
                            { name: 'pincode', label: 'PIN Code', placeholder: 'PIN code' },
                        ].map(field => (
                            <div key={field.name}>
                                <FieldLabel required>{field.label}</FieldLabel>
                                <input
                                    type="text"
                                    name={field.name}
                                    value={(formData as any)[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className={inputBase}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Location error */}
                    {fieldErrors.location && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5">
                            <p className="text-base text-red-600 flex items-center gap-1.5">⚠️ {fieldErrors.location}</p>
                        </div>
                    )}

                    {/* GPS tip */}
                    {!formData.latitude && !formData.longitude && (
                        <div className="rounded-xl p-3.5 bg-[#e8f2f8] border border-[#b3d4e8]">
                            <p className="text-base text-[#00598a]">
                                📍 <span className="font-semibold">Tip:</span> Click Auto Detect or enter your address manually above.
                            </p>
                        </div>
                    )}

                    {/* Location confirmed */}
                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className="text-base text-green-800">
                                <span className="font-semibold">✓ Location detected: </span>
                                <span className="font-mono text-sm ml-1">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </Card>

                {/* ── Action Buttons ── */}
                <div className="flex gap-3 pt-2 pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !!successMessage}
                        type="button"
                        className="flex-1 py-4 rounded-xl font-bold text-lg text-white bg-[#00598a] hover:bg-[#004a75] flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading && (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {loading
                            ? (isEditMode ? 'Updating…' : 'Creating…')
                            : successMessage
                                ? '✓ Done'
                                : (isEditMode ? 'Update Service' : 'Create Service')}
                    </button>

                    <button
                        onClick={() => window.history.back()}
                        type="button"
                        disabled={loading}
                        className="px-8 py-4 rounded-xl font-bold text-lg text-white bg-[#00598a] hover:bg-[#004a75] transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SportsForm;