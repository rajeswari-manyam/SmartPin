import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob, updateJob, getJobById, CreateJobPayload } from "../services/api.service";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, ChevronDown } from 'lucide-react';
import { useAccount } from "../context/AccountContext";

const jobTypeOptions = ['FULL_TIME', 'PART_TIME'];
const BRAND = '#00598a';

const getPlumberSubcategories = () => {
    const plumberCategory = subcategoriesData.subcategories.find(cat => cat.categoryId === 3);
    return plumberCategory ? plumberCategory.items.map(item => item.name) : [];
};

// ── Shared styles — text-base (16px) for inputs, text-lg for titles ───────────
const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

// ── Sub-components ────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>
        {children}
    </div>
);

const CardTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {action}
    </div>
);

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className="block text-base font-semibold text-gray-700 mb-2">
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) =>
    message ? <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">⚠️ {message}</p> : null;

// ── Geocoding ─────────────────────────────────────────────────────────────────
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

// ── Field errors interface ────────────────────────────────────────────────────
interface FieldErrors {
    title?: string;
    description?: string;
    phone?: string;
    location?: string;
}

// ── Main Component ────────────────────────────────────────────────────────────
const PlumberForm = () => {
    const navigate = useNavigate();
    const { setAccountType } = useAccount();

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

    const plumberSubcategories = getPlumberSubcategories();
    const defaultSubcategory = getSubcategoryFromUrl() || plumberSubcategories[0] || 'Plumbing Services';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: localStorage.getItem('userName') || '',
        phone: '',
        title: '',
        description: '',
        category: 'plumbing',
        subcategory: defaultSubcategory,
        jobType: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME',
        servicecharges: '',
        startDate: '',
        endDate: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        images: '',
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const isGPSDetected = useRef(false);

    // ── fetch edit data ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getJobById(editId);
                if (!response || !response.job) {
                    setError('Service not found');
                    setLoadingData(false);
                    return;
                }
                const job = response.job;
                setFormData(prev => ({
                    ...prev,
                    userId: prev.userId || job.userId || '',
                    phone: job.phone || '',
                    title: job.title || '',
                    description: job.description || '',
                    category: job.category || 'plumbing',
                    subcategory: job.subcategory || defaultSubcategory,
                    jobType: job.jobType || 'FULL_TIME',
                    servicecharges: job.servicecharges?.toString() || '',
                    startDate: job.startDate?.split('T')[0] || '',
                    endDate: job.endDate?.split('T')[0] || '',
                    area: job.area || '',
                    city: job.city || '',
                    state: job.state || '',
                    pincode: job.pincode || '',
                    latitude: job.latitude?.toString() || '',
                    longitude: job.longitude?.toString() || '',
                    images: job.images?.join(',') || '',
                }));
            } catch (err) {
                console.error(err);
                setError('Failed to load job data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    // ── auto-geocode from address ─────────────────────────────────────────────
    useEffect(() => {
        const detectCoordinates = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
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

    // ── handlers ──────────────────────────────────────────────────────────────
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (fieldErrors[name as keyof FieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const availableSlots = 5 - selectedImages.length;
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
                const accuracy = pos.coords.accuracy;
                if (accuracy > 500) {
                    setLocationWarning(
                        `⚠️ Low accuracy detected (~${Math.round(accuracy)}m). Please verify address fields below.`
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
            (err) => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        const errs: FieldErrors = {};

        try {
            if (!formData.title.trim()) errs.title = 'Service title is required.';
            if (!formData.description.trim()) errs.description = 'Description is required.';
            if (!formData.phone.trim()) {
                errs.phone = 'Phone number is required.';
            } else if (!/^[0-9+\-\s]{7,15}$/.test(formData.phone.trim())) {
                errs.phone = 'Please enter a valid phone number.';
            }
            if (!formData.latitude || !formData.longitude) errs.location = 'Please provide a valid location.';

            if (Object.keys(errs).length > 0) {
                setFieldErrors(errs);
                setError('Please fix the errors below before submitting.');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setLoading(false);
                return;
            }

            const jobPayload: CreateJobPayload & { phone?: string } = {
                userId: formData.userId,
                name: formData.name,
                phone: formData.phone.trim(),
                title: formData.title,
                description: formData.description,
                category: formData.category,
                subcategory: formData.subcategory,
                jobType: formData.jobType,
                servicecharges: formData.servicecharges,
                startDate: formData.startDate,
                endDate: formData.endDate,
                area: formData.area,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                latitude: formData.latitude,
                longitude: formData.longitude,
                images: selectedImages,
            };

            if (isEditMode && editId) {
                await updateJob(editId, jobPayload);
                setSuccessMessage('Service updated successfully!');
            } else {
                await createJob(jobPayload as CreateJobPayload);
                setSuccessMessage('Service created successfully!');
            }

            setTimeout(() => {
                setAccountType("user");
                navigate("/listed-jobs");
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    // ── loading screen ────────────────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND }} />
                    <p className="text-base text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-lg mx-auto flex items-center gap-3">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 leading-tight">
                            {isEditMode ? 'Update Plumber Service' : 'Add Plumber Service'}
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-lg mx-auto px-4 py-5 space-y-4 pb-10">

                {/* Alerts */}
                {error && (
                    <div className="flex items-start gap-2.5 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <span className="text-red-500 mt-0.5 flex-shrink-0 text-lg">⚠️</span>
                        <div>
                            <p className="text-base font-semibold text-red-800 mb-0.5">Please fix the following</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <span className="text-green-500 text-xl">✓</span>
                        <p className="text-base text-green-700 font-medium">{successMessage}</p>
                    </div>
                )}

                {/* ── 1. Service Title & Description ── */}
                <Card>
                    <div className="space-y-4">
                        <div>
                            <FieldLabel required>Service Title</FieldLabel>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Professional Plumbing Services"
                                className={inputCls}
                            />
                            <FieldError message={fieldErrors.title} />
                        </div>
                        <div>
                            <FieldLabel required>Description</FieldLabel>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Describe your services, experience, and specializations..."
                                className={inputCls + ' resize-none'}
                            />
                            <FieldError message={fieldErrors.description} />
                        </div>
                    </div>
                </Card>

                {/* ── 2. Contact Information ── */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <FieldLabel required>Phone</FieldLabel>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        className={inputCls}
                    />
                    <FieldError message={fieldErrors.phone} />
                </Card>

                {/* ── 3. Service Category ── */}
                <Card>
                    <CardTitle title="Service Category" />
                    <FieldLabel required>Subcategory</FieldLabel>
                    <div className="relative">
                        <select
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleInputChange}
                            className={inputCls + ' appearance-none pr-10'}
                        >
                            {plumberSubcategories.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </Card>

                {/* ── 4. Job Details ── */}
                <Card>
                    <CardTitle title="Job Details" />
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Job Type</FieldLabel>
                            <div className="relative">
                                <select
                                    name="jobType"
                                    value={formData.jobType}
                                    onChange={handleInputChange}
                                    className={inputCls + ' appearance-none pr-10'}
                                >
                                    {jobTypeOptions.map(type => (
                                        <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <FieldLabel required>Service Charges (₹)</FieldLabel>
                            <input
                                type="text"
                                name="servicecharges"
                                value={formData.servicecharges}
                                onChange={handleInputChange}
                                placeholder="e.g., 2000"
                                className={inputCls}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div>
                            <FieldLabel required>Start Date</FieldLabel>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className={inputCls}
                            />
                        </div>
                        <div>
                            <FieldLabel required>End Date</FieldLabel>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className={inputCls}
                            />
                        </div>
                    </div>
                </Card>

                {/* ── 5. Portfolio Photos ── */}
                <Card>
                    <CardTitle title="Portfolio Photos (Optional)" />

                    <label className={`block ${selectedImages.length >= 5 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={selectedImages.length >= 5}
                        />
                        <div
                            className="border-2 border-dashed rounded-xl p-8 text-center transition-all hover:opacity-90"
                            style={{ borderColor: selectedImages.length >= 5 ? '#d1d5db' : '#c7d9e6' }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f4fb' }}>
                                    <Upload className="w-8 h-8" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <p className="text-base font-semibold text-gray-700">
                                        {selectedImages.length >= 5 ? 'Maximum limit reached' : 'Tap to upload portfolio photos'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        JPG, PNG up to 5 MB · Max 5 images
                                    </p>
                                </div>
                                {selectedImages.length > 0 && (
                                    <span className="text-sm font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#e8f4fb', color: BRAND }}>
                                        {selectedImages.length}/5 uploaded
                                    </span>
                                )}
                            </div>
                        </div>
                    </label>

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img
                                        src={preview}
                                        alt={`Preview ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: BRAND }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-1.5 left-1.5 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
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
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                                style={{ backgroundColor: BRAND }}
                            >
                                {locationLoading ? (
                                    <><span className="animate-spin text-sm">⌛</span> Detecting...</>
                                ) : (
                                    <><MapPin className="w-4 h-4" /> Auto Detect</>
                                )}
                            </button>
                        }
                    />

                    {locationWarning && (
                        <div className="mb-3 bg-yellow-50 border border-yellow-300 rounded-xl p-3.5 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 flex-shrink-0">⚠️</span>
                            <p className="text-sm text-yellow-800">{locationWarning}</p>
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
                                    onChange={handleInputChange}
                                    placeholder={field.placeholder}
                                    className={inputCls}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Location error */}
                    {fieldErrors.location && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3.5">
                            <p className="text-sm text-red-600 flex items-center gap-1.5">⚠️ {fieldErrors.location}</p>
                        </div>
                    )}

                    {/* GPS tip */}
                    {!formData.latitude && !formData.longitude && (
                        <div className="mt-3 rounded-xl p-3.5" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                            <p className="text-sm" style={{ color: '#92400e' }}>
                                💡 <span className="font-semibold">Tip:</span> Use auto-detect to fill location automatically from your device GPS
                            </p>
                        </div>
                    )}

                    {/* Location confirmed */}
                    {formData.latitude && formData.longitude && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className="text-sm text-green-800">
                                <span className="font-semibold">✓ Location detected: </span>
                                <span className="font-mono text-xs ml-1">
                                    {parseFloat(formData.latitude).toFixed(5)}, {parseFloat(formData.longitude).toFixed(5)}
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
                        className="flex-1 py-4 rounded-xl font-bold text-base text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70"
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
                            : successMessage
                                ? '✓ Done'
                                : (isEditMode ? 'Update Service' : 'Create Service')}
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        disabled={loading}
                        type="button"
                        className="px-8 py-4 rounded-xl font-bold text-base text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PlumberForm;