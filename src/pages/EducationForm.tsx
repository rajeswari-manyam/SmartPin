import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createEducationService,
    updateEducationService,
    getEducationById,
    EducationService
} from '../services/EducationService.service';
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

// ── #f09b13 ≈ Tailwind amber-500 ─────────────────────────────────────────────

const chargeTypeOptions = ['Per Hour', 'Per Day', 'Per Month', 'Per Session', 'Per Course'];

const getEducationSubcategories = () => {
    const educationCategory = subcategoriesData.subcategories.find((cat: any) => cat.categoryId === 8);
    return educationCategory ? educationCategory.items.map((item: any) => item.name) : [];
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
    } catch { return null; }
};

// ============================================================================
// COMPONENT
// ============================================================================
const EducationForm: React.FC = () => {
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

    const educationTypes = getEducationSubcategories();
    const defaultType = getSubcategoryFromUrl() || educationTypes[0] || 'Schools';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: '',
        type: defaultType,
        email: '',
        phone: '',
        description: '',
        subjects: [] as string[],
        qualifications: [] as string[],
        experience: '',
        charges: '',
        chargeType: chargeTypeOptions[0],
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
    });

    const [subjectsInput, setSubjectsInput] = useState('');
    const [qualificationsInput, setQualificationsInput] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);

    // ── fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const data = await getEducationById(editId);
                if (!data) throw new Error('Service not found');
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || '',
                    name: data.name || '',
                    type: data.type || defaultType,
                    email: data.email || '',
                    phone: data.phone || '',
                    description: data.description || '',
                    subjects: data.subjects || [],
                    qualifications: data.qualifications || [],
                    experience: data.experience?.toString() || '',
                    charges: data.charges?.toString() || '',
                    chargeType: data.chargeType || chargeTypeOptions[0],
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                }));
                setSubjectsInput(data.subjects?.join(', ') || '');
                setQualificationsInput(data.qualifications?.join(', ') || '');
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch (err) {
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode ──────────────────────────────────────────────────────────
    useEffect(() => {
        const detectCoordinates = async () => {
            if (formData.area && !formData.latitude && !formData.longitude) {
                const fullAddress = [formData.area, formData.city, formData.state, formData.pincode]
                    .filter(Boolean).join(', ');
                if (fullAddress.trim()) {
                    const coords = await geocodeAddress(fullAddress);
                    if (coords) {
                        setFormData(prev => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lng.toString() }));
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

    const handleSubjectsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setSubjectsInput(value);
        setFormData(prev => ({ ...prev, subjects: value.split(',').map(s => s.trim()).filter(Boolean) }));
    };

    const handleQualificationsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setQualificationsInput(value);
        setFormData(prev => ({ ...prev, qualifications: value.split(',').map(q => q.trim()).filter(Boolean) }));
    };

    // ── image helpers ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const remainingExisting = existingImages.filter(img => !imagesToDelete.includes(img)).length;
        const availableSlots = 5 - (remainingExisting + selectedImages.length);
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
    const handleRemoveExistingImage = (imageUrl: string) => setImagesToDelete(prev => [...prev, imageUrl]);
    const handleRestoreExistingImage = (imageUrl: string) => setImagesToDelete(prev => prev.filter(url => url !== imageUrl));

    // ── geolocation ───────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true);
        setError('');
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data.address) {
                        setFormData(prev => ({
                            ...prev,
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
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            if (!formData.name || !formData.phone || !formData.email)
                throw new Error('Please fill in all required fields (Name, Phone, Email)');
            if (formData.subjects.length === 0)
                throw new Error('Please enter at least one subject');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide a valid location');

            const fd = new FormData();
            fd.append('userId', formData.userId);
            fd.append('name', formData.name);
            fd.append('type', formData.type);
            fd.append('email', formData.email);
            fd.append('phone', formData.phone);
            fd.append('description', formData.description || '');
            fd.append('subjects', formData.subjects.join(', '));
            fd.append('qualifications', formData.qualifications.join(', '));
            fd.append('experience', formData.experience);
            fd.append('charges', formData.charges);
            fd.append('chargeType', formData.chargeType);
            fd.append('area', formData.area);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('pincode', formData.pincode);
            fd.append('latitude', formData.latitude);
            fd.append('longitude', formData.longitude);

            selectedImages.forEach(img => fd.append('images', img, img.name));

            if (isEditMode) {
                const remainingExisting = existingImages.filter(url => !imagesToDelete.includes(url));
                if (remainingExisting.length > 0) fd.append('existingImages', JSON.stringify(remainingExisting));
                if (imagesToDelete.length > 0) fd.append('imagesToDelete', JSON.stringify(imagesToDelete));
            }

            if (isEditMode && editId) {
                await updateEducationService(editId, fd);
                setSuccessMessage('Service updated successfully!');
            } else {
                await createEducationService(fd);
                setSuccessMessage('Service created successfully!');
            }
            setTimeout(() => navigate('/my-business'), 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => window.history.back();

    const remainingExistingCount = existingImages.filter(url => !imagesToDelete.includes(url)).length;
    const totalImagesCount = remainingExistingCount + selectedImages.length;
    const maxImagesReached = totalImagesCount >= 5;

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
                            {isEditMode ? 'Update Education Service' : 'Add Education Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your education listing' : 'Create new education listing'}
                        </p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                </div>
            </div>

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

                {/* 1. NAME */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Institution/Teacher Name</FieldLabel>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter name"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* 2. CONTACT */}
                <SectionCard title="Contact Information">
                    <div>
                        <FieldLabel required>Phone</FieldLabel>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Enter phone number" className={inputBase} />
                    </div>
                    <div>
                        <FieldLabel required>Email</FieldLabel>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" className={inputBase} />
                    </div>
                </SectionCard>

                {/* 3. CATEGORY */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Category</FieldLabel>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className={inputBase + ' appearance-none'}
                            style={selectStyle}
                        >
                            {educationTypes.map((t: string) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </SectionCard>

                {/* 4. TEACHING DETAILS */}
                <SectionCard title="Teaching Details">
                    <div>
                        <FieldLabel required>Subjects Taught</FieldLabel>
                        <textarea
                            value={subjectsInput}
                            onChange={handleSubjectsChange}
                            rows={3}
                            placeholder="Mathematics, Physics, Chemistry, English"
                            className={inputBase + ' resize-none'}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>
                            💡 Enter subjects separated by commas
                        </p>
                        {formData.subjects.length > 0 && (
                            <div className="mt-3">
                                <p className={`${typography.body.small} font-medium text-gray-700 mb-2`}>Selected Subjects:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.subjects.map((subject, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-xs font-medium"
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <FieldLabel>Qualifications</FieldLabel>
                        <textarea
                            value={qualificationsInput}
                            onChange={handleQualificationsChange}
                            rows={2}
                            placeholder="B.Ed, M.Sc, Ph.D"
                            className={inputBase + ' resize-none'}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>
                            💡 Enter qualifications separated by commas
                        </p>
                        {formData.qualifications.length > 0 && (
                            <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                    {formData.qualifications.map((qual, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs"
                                        >
                                            🎓 {qual}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </SectionCard>

                {/* 5. PROFESSIONAL DETAILS */}
                <SectionCard title="Professional Details">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Experience (years)</FieldLabel>
                            <input type="number" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="Years" min="0" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>Charges (₹)</FieldLabel>
                            <input type="text" name="charges" value={formData.charges} onChange={handleInputChange} placeholder="Amount" className={inputBase} />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Charge Type</FieldLabel>
                        <select
                            name="chargeType"
                            value={formData.chargeType}
                            onChange={handleInputChange}
                            className={inputBase + ' appearance-none'}
                            style={selectStyle}
                        >
                            {chargeTypeOptions.map((t: string) => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                </SectionCard>

                {/* 6. DESCRIPTION */}
                <SectionCard title="Description">
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Describe your teaching methodology, specialization, and what makes you unique..."
                        className={inputBase + ' resize-none'}
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
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="Area name" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className={inputBase} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN code" className={inputBase} />
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

                {/* 8. PORTFOLIO PHOTOS */}
                <SectionCard title={`Portfolio Photos (${totalImagesCount}/5)`}>
                    <label className={`block ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={maxImagesReached}
                        />
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
                            maxImagesReached
                                ? 'border-gray-200 bg-gray-50'
                                : 'border-amber-300 bg-amber-50 hover:border-amber-400 hover:bg-amber-100'
                        }`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-amber-500" />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {maxImagesReached
                                            ? 'Maximum 5 images reached'
                                            : `Add Photos (${5 - totalImagesCount} slots left)`}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>
                                        Upload photos of your institution, certificates, or teaching
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

                    {/* Image Grid */}
                    {(existingImages.length > 0 || selectedImages.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {/* Existing images (not marked for deletion) */}
                            {existingImages
                                .filter(url => !imagesToDelete.includes(url))
                                .map((url, i) => (
                                    <div key={`ex-${i}`} className="relative aspect-square group">
                                        <img
                                            src={url}
                                            alt={`Saved ${i + 1}`}
                                            className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error'; }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(url)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                                            Saved
                                        </span>
                                    </div>
                                ))}

                            {/* New images */}
                            {selectedImages.map((file, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img
                                        src={imagePreviews[i]}
                                        alt={`New ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2 border-amber-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition"
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
                    )}

                    {/* Deleted images — undo section */}
                    {imagesToDelete.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className={`${typography.body.small} text-red-700 mb-2`}>
                                Images marked for deletion ({imagesToDelete.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {imagesToDelete.map((url, i) => (
                                    <button
                                        key={`del-${i}`}
                                        onClick={() => handleRestoreExistingImage(url)}
                                        className="inline-flex items-center gap-1 text-xs bg-white border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50 transition"
                                    >
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

export default EducationForm;