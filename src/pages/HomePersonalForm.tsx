import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createJob,
    updateJob,
    getJobById,
    CreateJobPayload,
} from '../services/api.service';
import typography from '../styles/typography';
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

// ── #f09b13 ≈ Tailwind amber-500 ─────────────────────────────────────────────

const getHomeSubcategories = () => {
    const homeCategory = subcategoriesData.subcategories.find(
        (cat: any) => cat.categoryId === 10
    );
    return homeCategory
        ? homeCategory.items.map((item: any) => item.name)
        : ['Maid Services', 'Cook', 'Electrician', 'Carpenter', 'Plumber'];
};

// ── Shared input: amber focus ring ───────────────────────────────────────────
const inputBase =
    `w-full px-4 py-3 border border-gray-200 rounded-xl ` +
    `focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

// Dropdown chevron in amber (#f09b13)
const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23f09b13'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
        {children}{required && <span className="text-amber-500 ml-1">*</span>}
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
// COMPONENT
// ============================================================================
const HomePersonalForm = () => {
    const navigate = useNavigate();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const getSubcategoryFromUrl = () => {
        const sub = new URLSearchParams(window.location.search).get('subcategory');
        return sub
            ? sub.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : null;
    };

    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const homeSubcategories = getHomeSubcategories();
    const defaultType = getSubcategoryFromUrl() || homeSubcategories[0] || 'Maid Services';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: localStorage.getItem('userName') || '',
        serviceName: '',
        serviceType: defaultType,
        specializations: '',
        servicecharges: '',
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

    // ── fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getJobById(editId);
                if (!response.job) throw new Error('Service not found');
                const data = response.job;
                setFormData((prev) => ({
                    ...prev,
                    userId: prev.userId,
                    serviceName: data.title || '',
                    serviceType: data.subcategory || defaultType,
                    specializations: Array.isArray(data.description)
                        ? data.description.join(', ')
                        : (data.description || ''),
                    servicecharges: data.servicecharges?.toString() || '',
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                }));
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch (err) {
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ── image helpers ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const availableSlots = 5 - (selectedImages.length + existingImages.length);
        if (availableSlots <= 0) { setError('Maximum 5 images allowed'); return; }
        const validFiles = files.slice(0, availableSlots).filter((file) => {
            if (!file.type.startsWith('image/')) { setError(`${file.name} is not a valid image`); return false; }
            if (file.size > 5 * 1024 * 1024) { setError(`${file.name} exceeds 5 MB`); return false; }
            return true;
        });
        if (!validFiles.length) return;
        const newPreviews: string[] = [];
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                if (newPreviews.length === validFiles.length)
                    setImagePreviews((prev) => [...prev, ...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
        setSelectedImages((prev) => [...prev, ...validFiles]);
        setError('');
    };

    const handleRemoveNewImage = (i: number) => {
        setSelectedImages((prev) => prev.filter((_, idx) => idx !== i));
        setImagePreviews((prev) => prev.filter((_, idx) => idx !== i));
    };
    const handleRemoveExistingImage = (i: number) =>
        setExistingImages((prev) => prev.filter((_, idx) => idx !== i));

    // ── geolocation ───────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true);
        setError('');
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
                    );
                    const data = await res.json();
                    if (data.address) {
                        setFormData((prev) => ({
                            ...prev,
                            area: data.address.suburb || data.address.neighbourhood || prev.area,
                            city: data.address.city || data.address.town || prev.city,
                            state: data.address.state || prev.state,
                            pincode: data.address.postcode || prev.pincode,
                        }));
                    }
                } catch (e) { console.error(e); }
                setLocationLoading(false);
            },
            (err) => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            if (!formData.serviceName || !formData.specializations || !formData.servicecharges)
                throw new Error('Please fill in all required fields (Name, Specializations, Charges)');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide a valid location');

            const payload: CreateJobPayload = {
                userId: formData.userId,
                name: formData.name,
                title: formData.serviceName,
                description: formData.specializations,
                category: 'home-personal',
                subcategory: formData.serviceType,
                jobType: 'FULL_TIME',
                servicecharges: formData.servicecharges,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                area: formData.area,
                city: formData.city,
                state: formData.state,
                pincode: formData.pincode,
                latitude: formData.latitude,
                longitude: formData.longitude,
                images: selectedImages,
            };

            if (isEditMode && editId) {
                await updateJob(editId, payload);
                setSuccessMessage('Service updated successfully!');
                setTimeout(() => navigate('/my-business'), 1500);
            } else {
                await createJob(payload);
                setSuccessMessage('Service created successfully!');
                setTimeout(() => navigate('/listed-jobs'), 1500);
            }
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
            <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
                    <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
                </div>
            </div>
        );
    }

    const safeSpecializations = Array.isArray(formData.specializations)
        ? (formData.specializations as string[]).join(', ')
        : (typeof formData.specializations === 'string' ? formData.specializations : '');

    const totalImages = selectedImages.length + existingImages.length;

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-amber-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b border-amber-100 px-4 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button
                        onClick={handleCancel}
                        className="p-2 -ml-2 hover:bg-amber-50 rounded-full transition"
                    >
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Home Service' : 'Add Home Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your service information' : 'Register your home service'}
                        </p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-amber-50 border border-amber-400 rounded-xl text-amber-800 text-sm font-medium">
                        ✓ {successMessage}
                    </div>
                )}

                {/* 1. SERVICE PROVIDER NAME */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Service Provider Name</FieldLabel>
                        <input
                            type="text"
                            name="serviceName"
                            value={formData.serviceName}
                            onChange={handleInputChange}
                            placeholder="e.g., Professional Maid Services"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* 2. SERVICE TYPE */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Service Type</FieldLabel>
                        <select
                            name="serviceType"
                            value={formData.serviceType}
                            onChange={handleInputChange}
                            className={inputBase + ' appearance-none'}
                            style={selectStyle}
                        >
                            {homeSubcategories.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </SectionCard>

                {/* 3. SPECIALIZATIONS */}
                <SectionCard title="Specializations & Skills">
                    <div>
                        <FieldLabel required>Your Specializations</FieldLabel>
                        <textarea
                            name="specializations"
                            value={safeSpecializations}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="e.g., Experienced in residential cleaning, deep cleaning, laundry, dishwashing, floor care"
                            className={inputBase + ' resize-none'}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>
                            💡 List all your skills and specializations, separated by commas
                        </p>
                    </div>

                    {/* Skill chips */}
                    {safeSpecializations && safeSpecializations.trim() && (
                        <div className="mt-3">
                            <p className={`${typography.body.small} font-medium text-gray-700 mb-2`}>
                                Listed Skills ({safeSpecializations.split(',').filter(s => s.trim()).length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {safeSpecializations.split(',').map((s, i) => {
                                    const trimmed = s.trim();
                                    if (!trimmed) return null;
                                    return (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-medium"
                                        >
                                            <span className="text-amber-600">✓</span>
                                            {trimmed}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* 4. SERVICE CHARGES */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Service Charges (₹)</FieldLabel>
                        <input
                            type="number"
                            name="servicecharges"
                            value={formData.servicecharges}
                            onChange={handleInputChange}
                            placeholder="e.g., 500"
                            min="1"
                            step="0.01"
                            className={inputBase}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>
                            💡 Your hourly or daily rate in rupees
                        </p>
                    </div>
                </SectionCard>

                {/* 5. LOCATION */}
                <SectionCard
                    title="Location Details"
                    action={
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {locationLoading
                                ? <><span className="animate-spin mr-1 text-xs">⌛</span>Detecting...</>
                                : <><MapPin className="w-4 h-4" />Auto Detect</>
                            }
                        </button>
                    }
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="e.g., Madhapur" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="e.g., Hyderabad" className={inputBase} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="e.g., Telangana" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="e.g., 500016" className={inputBase} />
                        </div>
                    </div>

                    {/* Tip box — amber */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className={`${typography.body.small} text-amber-800`}>
                            📍 <span className="font-medium">Tip:</span> Click the button to automatically detect your location, or enter your address manually above.
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className={`${typography.body.small} text-green-800`}>
                                <span className="font-semibold">✓ Location detected: </span>
                                <span className="ml-1">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* 6. PHOTOS */}
                <SectionCard title="Service Photos (Optional)">
                    <label className={`block ${totalImages >= 5 ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={totalImages >= 5}
                        />
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                            totalImages >= 5
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-amber-300 bg-amber-50 hover:border-amber-400 hover:bg-amber-100'
                        }`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-amber-500" />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {totalImages >= 5 ? 'Maximum limit reached' : 'Tap to upload service photos'}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>
                                        Maximum 5 images · 5 MB each
                                    </p>
                                    {selectedImages.length > 0 && (
                                        <p className="text-amber-600 text-sm font-medium mt-1">
                                            {selectedImages.length} new image{selectedImages.length > 1 ? 's' : ''} selected ✓
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Image Previews */}
                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-amber-400" />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
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
                        className={`flex-1 px-6 py-3.5 rounded-lg font-semibold text-white transition-colors shadow-sm ${
                            loading
                                ? 'bg-amber-300 cursor-not-allowed'
                                : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700'
                        } ${typography.body.base}`}
                    >
                        {loading
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Service' : 'Create Service')}
                    </button>
                    <button
                        onClick={handleCancel}
                        type="button"
                        className={`px-8 py-3.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-amber-50 active:bg-amber-100 transition-colors ${typography.body.base}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomePersonalForm;