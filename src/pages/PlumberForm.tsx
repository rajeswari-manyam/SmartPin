import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob, updateJob, getJobById, CreateJobPayload } from "../services/api.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

const jobTypeOptions = ['FULL_TIME', 'PART_TIME'];

const getPlumberSubcategories = () => {
    const plumberCategory = subcategoriesData.subcategories.find(cat => cat.categoryId === 3);
    return plumberCategory ? plumberCategory.items.map(item => item.name) : [];
};

const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:border-[#f09b13] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

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

const PlumberForm = () => {
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

    const plumberSubcategories = getPlumberSubcategories();
    const defaultSubcategory = getSubcategoryFromUrl() || plumberSubcategories[0] || 'Plumbing Services';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: localStorage.getItem('userName') || '',
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

    useEffect(() => {
        const detectCoordinates = async () => {
            if (isGPSDetected.current) {
                isGPSDetected.current = false;
                return;
            }
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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
                        `⚠️ Low accuracy detected (~${Math.round(accuracy)}m). Your device may not have GPS. ` +
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
        try {
            if (!formData.title || !formData.description)
                throw new Error('Please fill in all required fields (Title, Description)');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide a valid location');
            const jobPayload: CreateJobPayload = {
                userId: formData.userId,
                name: formData.name,
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
                await createJob(jobPayload);
                setSuccessMessage('Service created successfully!');
            }
            setTimeout(() => navigate('/listed-jobs'), 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => window.history.back();

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#f09b13' }} />
                    <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button
                        onClick={handleCancel}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Plumber Service' : 'Add New Plumber Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className={`p-4 bg-green-50 border border-green-200 rounded-xl ${typography.body.small} text-green-700`}>
                        {successMessage}
                    </div>
                )}

                {/* ─── 1. TITLE & DESCRIPTION ── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Service Title</FieldLabel>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="e.g., Professional Plumbing Services"
                            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:outline-none placeholder-gray-400 transition-all duration-200 ${typography.form.input} bg-white`}
                            style={{ '--tw-ring-color': '#f09b13' } as React.CSSProperties}
                            onFocus={e => { e.target.style.borderColor = '#f09b13'; e.target.style.boxShadow = '0 0 0 2px #f09b1340'; }}
                            onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                    <div>
                        <FieldLabel required>Description</FieldLabel>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Describe your services, experience, and specializations..."
                            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:outline-none placeholder-gray-400 transition-all duration-200 resize-none ${typography.form.input} bg-white`}
                            onFocus={e => { e.target.style.borderColor = '#f09b13'; e.target.style.boxShadow = '0 0 0 2px #f09b1340'; }}
                            onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                        />
                    </div>
                </SectionCard>

                {/* ─── 2. CATEGORY & SUBCATEGORY ── */}
                <SectionCard title="Service Category">
                    <div>
                        <FieldLabel required>Subcategory</FieldLabel>
                        <select
                            name="subcategory"
                            value={formData.subcategory}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none placeholder-gray-400 transition-all duration-200 appearance-none ${typography.form.input} bg-white`}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem'
                            }}
                            onFocus={e => { e.target.style.borderColor = '#f09b13'; e.target.style.boxShadow = '0 0 0 2px #f09b1340'; }}
                            onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                        >
                            {plumberSubcategories.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </SectionCard>

                {/* ─── 3. JOB DETAILS ── */}
                <SectionCard title="Job Details">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Job Type</FieldLabel>
                            <select
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none transition-all duration-200 appearance-none ${typography.form.input} bg-white`}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundSize: '1.5em 1.5em',
                                    paddingRight: '2.5rem'
                                }}
                                onFocus={e => { e.target.style.borderColor = '#f09b13'; e.target.style.boxShadow = '0 0 0 2px #f09b1340'; }}
                                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
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
                                placeholder="2000"
                                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none placeholder-gray-400 transition-all duration-200 ${typography.form.input} bg-white`}
                                onFocus={e => { e.target.style.borderColor = '#f09b13'; e.target.style.boxShadow = '0 0 0 2px #f09b1340'; }}
                                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Start Date</FieldLabel>
                            <input
                                type="date"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none transition-all duration-200 ${typography.form.input} bg-white`}
                                onFocus={e => { e.target.style.borderColor = '#f09b13'; e.target.style.boxShadow = '0 0 0 2px #f09b1340'; }}
                                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                        <div>
                            <FieldLabel required>End Date</FieldLabel>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none transition-all duration-200 ${typography.form.input} bg-white`}
                                onFocus={e => { e.target.style.borderColor = '#f09b13'; e.target.style.boxShadow = '0 0 0 2px #f09b1340'; }}
                                onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                            />
                        </div>
                    </div>
                </SectionCard>

                {/* ─── 4. LOCATION DETAILS ── */}
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
                            {locationLoading ? (
                                <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                            ) : (
                                <><MapPin className="w-4 h-4" />Auto Detect</>
                            )}
                        </button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
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
                                    className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none placeholder-gray-400 transition-all duration-200 ${typography.form.input} bg-white`}
                                    onFocus={e => { e.target.style.borderColor = '#f09b13'; e.target.style.boxShadow = '0 0 0 2px #f09b1340'; }}
                                    onBlur={e => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ed', border: '1px solid #f09b1340' }}>
                        <p className={`${typography.body.small}`} style={{ color: '#92600a' }}>
                            📍 <span className="font-medium">Tip:</span> Click Auto Detect or enter address manually.
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className={`${typography.body.small} text-green-800`}>
                                <span className="font-semibold">✓ Location detected:</span>
                                <span className="ml-1">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ─── 5. PORTFOLIO PHOTOS ── */}
                <SectionCard title="Portfolio Photos (Optional)">
                    <label className="cursor-pointer block">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={selectedImages.length >= 5}
                        />
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${
                                selectedImages.length >= 5 ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'hover:bg-orange-50'
                            }`}
                            style={selectedImages.length < 5 ? { borderColor: '#f09b13' } : {}}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fff0d6' }}>
                                    <Upload className="w-8 h-8" style={{ color: '#f09b13' }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {selectedImages.length >= 5 ? 'Maximum limit reached' : 'Tap to upload portfolio photos'}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>Maximum 5 images</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img
                                        src={preview}
                                        alt={`Preview ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: '#f09b13' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* ── Action Buttons ── */}
                <div className="flex gap-4 pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        type="button"
                        className={`flex-1 px-6 py-3.5 rounded-lg font-semibold text-white transition-all shadow-sm ${typography.body.base}`}
                        style={{ backgroundColor: loading ? '#f5b340' : '#f09b13', cursor: loading ? 'not-allowed' : 'pointer' }}
                        onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#d4880f'; }}
                        onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#f09b13'; }}
                    >
                        {loading
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Service' : 'Create Service')}
                    </button>
                    <button
                        onClick={handleCancel}
                        type="button"
                        className={`px-8 py-3.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all ${typography.body.base}`}
                    >
                        Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PlumberForm;