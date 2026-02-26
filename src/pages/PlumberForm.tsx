import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob, updateJob, getJobById, CreateJobPayload } from "../services/api.service";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from "../context/AccountContext";
import typography from "../styles/typography";

const jobTypeOptions = ['FULL_TIME', 'PART_TIME'];
const BRAND = '#00598a';

const getPlumberSubcategories = () => {
    const plumberCategory = subcategoriesData.subcategories.find((cat: any) => cat.categoryId === 3);
    return plumberCategory ? plumberCategory.items.map((item: any) => item.name) : [];
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `text-lg text-gray-800 bg-white`;          // ← text-base → text-lg

const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className="block text-base font-semibold text-gray-800 mb-2">   {/* text-sm → text-base */}
        {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

const SectionCard: React.FC<{
    title?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}> = ({ title, children, action }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        {title && (
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>   {/* text-base → text-lg */}
                {action}
            </div>
        )}
        {children}
    </div>
);

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-2 gap-6">{children}</div>
);

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

interface FieldErrors {
    title?: string;
    description?: string;
    phone?: string;
    location?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
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

    const maxImagesReached = selectedImages.length >= 5;

    // ── fetch edit data ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getJobById(editId);
                if (!response || !response.job) { setError('Service not found'); setLoadingData(false); return; }
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

    // ── auto-geocode ──────────────────────────────────────────────────────────
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
                if (pos.coords.accuracy > 500) {
                    setLocationWarning(
                        `⚠️ Low accuracy detected (~${Math.round(pos.coords.accuracy)}m). Your device may not have GPS. ` +
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

    const handleCancel = () => window.history.back();

    // ── loading screen ────────────────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND }} />
                    <p className="text-lg text-gray-600">Loading...</p>   {/* text-base → text-lg */}
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <button
                        onClick={handleCancel}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">   {/* text-xl → text-2xl */}
                            {isEditMode ? 'Update Plumber Service' : 'Add Plumber Service'}
                        </h1>
                        <p className="text-base text-gray-500 mt-0.5">   {/* text-sm → text-base */}
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Wide container ── */}
            <div className="max-w-6xl mx-auto px-8 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">⚠️</span>
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 mb-1 text-base">Error</p>   {/* added text-base */}
                                <p className="text-red-700 text-base">{error}</p>   {/* text-sm → text-base */}
                            </div>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <p className="text-base text-green-700">{successMessage}</p>   {/* text-sm → text-base */}
                    </div>
                )}

                {/* ─── ROW 1: TITLE + SUBCATEGORY ─── */}
                <SectionCard>
                    <TwoCol>
                        <div>
                            <FieldLabel required>Service Title</FieldLabel>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g. Professional Plumbing Services"
                                className={inputBase}
                            />
                            {fieldErrors.title && (
                                <p className="mt-1.5 text-base text-red-500 flex items-center gap-1">⚠️ {fieldErrors.title}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Subcategory</FieldLabel>
                            <select
                                name="subcategory"
                                value={formData.subcategory}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'}
                                style={selectStyle}
                            >
                                {plumberSubcategories.map((sub: string) => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 2: PHONE + DESCRIPTION ─── */}
                <SectionCard title="Contact & Description">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Phone Number</FieldLabel>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Enter phone number"
                                className={inputBase}
                            />
                            {fieldErrors.phone && (
                                <p className="mt-1.5 text-base text-red-500 flex items-center gap-1">⚠️ {fieldErrors.phone}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Description</FieldLabel>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="Describe your services, experience, and specializations..."
                                className={inputBase + ' resize-none'}
                            />
                            {fieldErrors.description && (
                                <p className="mt-1.5 text-base text-red-500 flex items-center gap-1">⚠️ {fieldErrors.description}</p>
                            )}
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 3: JOB TYPE + SERVICE CHARGES ─── */}
                <SectionCard title="Job Details">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Job Type</FieldLabel>
                            <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'}
                                style={selectStyle}
                            >
                                {jobTypeOptions.map(type => (
                                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <FieldLabel required>Service Charges (₹)</FieldLabel>
                            <input
                                type="text"
                                name="servicecharges"
                                value={formData.servicecharges}
                                onChange={handleInputChange}
                                placeholder="e.g. 2000"
                                className={inputBase}
                            />
                        </div>
                    </TwoCol>

                    <TwoCol>
                        <div>
                            <FieldLabel required>Start Date</FieldLabel>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel required>End Date</FieldLabel>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className={inputBase}
                            />
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 4: LOCATION ─── */}
                <SectionCard
                    title="Service Location"
                    action={
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-base font-medium text-white
                                bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                                transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {locationLoading ? (
                                <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                            ) : (
                                <><MapPin className="w-4 h-4 inline mr-1" />Auto Detect</>
                            )}
                        </button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className="text-base text-yellow-800">{locationWarning}</p>   {/* text-sm → text-base */}
                        </div>
                    )}

                    <TwoCol>
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area}
                                onChange={handleInputChange} placeholder="e.g. Indiranagar" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city}
                                onChange={handleInputChange} placeholder="e.g. Bangalore" className={inputBase} />
                        </div>
                    </TwoCol>

                    <TwoCol>
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
                    </TwoCol>

                    {fieldErrors.location && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-base text-red-600 flex items-center gap-1.5">⚠️ {fieldErrors.location}</p>
                        </div>
                    )}

                    <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ee', border: '1px solid #f0c070' }}>
                        <p className="text-base" style={{ color: '#7a4f00' }}>   {/* text-sm → text-base */}
                            📍 <span className="font-medium">Tip:</span> Click "Auto Detect" to get your current location, or enter your service area manually.
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className="text-base text-green-800">   {/* text-sm → text-base */}
                                <span className="font-semibold">✓ Location set: </span>
                                <span className="font-mono text-sm">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ─── ROW 5: PHOTOS ─── */}
                <SectionCard title={`Portfolio Photos (${selectedImages.length}/5)`}>
                    <TwoCol>
                        {/* Upload zone */}
                        <label className="cursor-pointer block">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={maxImagesReached}
                            />
                            <div
                                className={`border-2 border-dashed rounded-2xl p-10 text-center transition h-full flex items-center justify-center ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                style={{
                                    borderColor: maxImagesReached ? '#d1d5db' : BRAND,
                                    backgroundColor: maxImagesReached ? '#f9fafb' : '#fffbf5',
                                    minHeight: '180px',
                                }}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f4fb' }}>
                                        <Upload className="w-8 h-8" style={{ color: BRAND }} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-gray-700">   {/* text-base → text-lg */}
                                            {maxImagesReached
                                                ? 'Maximum 5 images reached'
                                                : `Add Photos (${5 - selectedImages.length} slots left)`}
                                        </p>
                                        <p className="text-base text-gray-500 mt-1">   {/* text-sm → text-base */}
                                            Upload photos of your work or tools
                                        </p>
                                        <p className="text-sm text-gray-400 mt-0.5">Max 5 images · 5 MB each · JPG, PNG</p>
                                    </div>
                                </div>
                            </div>
                        </label>

                        {/* Previews */}
                        {selectedImages.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {selectedImages.map((file, i) => (
                                    <div key={`new-${i}`} className="relative aspect-square group">
                                        <img
                                            src={imagePreviews[i]}
                                            alt={`New ${i + 1}`}
                                            className="w-full h-full object-cover rounded-xl border-2"
                                            style={{ borderColor: BRAND }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveNewImage(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                                            New
                                        </span>
                                        <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                                            {(file.size / 1024 / 1024).toFixed(1)}MB
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl text-center"
                                style={{ minHeight: '180px' }}>
                                <p className="text-base text-gray-400">   {/* text-sm → text-base */}
                                    Uploaded images will appear here
                                </p>
                            </div>
                        )}
                    </TwoCol>
                </SectionCard>

                {/* ── Action Buttons ── */}
                <div className="flex gap-4 pt-2 pb-8 justify-end">
                    <button
                        onClick={handleCancel}
                        type="button"
                        disabled={loading}
                        className={`px-10 py-3.5 rounded-xl font-semibold text-[#00598a]
                            bg-white border-2 border-[#00598a]
                            hover:bg-[#00598a] hover:text-white
                            active:bg-[#004a73] active:text-white
                            transition-all text-lg                        
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !!successMessage}
                        type="button"
                        className={`px-10 py-3.5 rounded-xl font-semibold text-white
                            transition-all shadow-md hover:shadow-lg
                            bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                            text-lg                                        
                            ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : successMessage ? '✓ Done' : (
                            isEditMode ? 'Update Service' : 'Create Service'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PlumberForm;