import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createHospital,
    updateHospital,
    getHospitalById,
    CreateHospitalPayload,
} from '../services/HospitalService.service';
import Button from '../components/ui/Buttons';
import typography from '../styles/typography';
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

// ── Pull hospital subcategories from JSON (categoryId 2) ────────────────────
const getHospitalSubcategories = () => {
    const hospitalCategory = subcategoriesData.subcategories.find(
        (cat: any) => cat.categoryId === 2
    );
    return hospitalCategory
        ? hospitalCategory.items.map((item: any) => item.name)
        : [];
};

// ============================================================================
// SHARED INPUT CLASSES - Mobile First
// ============================================================================
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-[#f09b13] focus:border-[#f09b13] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

// ============================================================================
// REUSABLE LABEL
// ============================================================================
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
        {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

// ============================================================================
// SECTION CARD WRAPPER
// ============================================================================
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
const HospitalForm = () => {
    const navigate = useNavigate();

    // ── URL helpers ──────────────────────────────────────────────────────────
    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const getSubcategoryFromUrl = () => {
        const sub = new URLSearchParams(window.location.search).get('subcategory');
        return sub
            ? sub.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : null;
    };

    // ── state ────────────────────────────────────────────────────────────────
    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const hospitalTypes = getHospitalSubcategories();
    const defaultType = getSubcategoryFromUrl() || hospitalTypes[0] || 'Hospitals';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        hospitalName: '',
        hospitalType: defaultType,
        departments: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        services: '',
    });

    // ── images ───────────────────────────────────────────────────────────────
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // ── geo ──────────────────────────────────────────────────────────────────
    const [locationLoading, setLocationLoading] = useState(false);

    // ── fetch for edit ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getHospitalById(editId);
                if (!response.success || !response.data)
                    throw new Error('Hospital not found');

                const data = response.data;

                setFormData((prev) => ({
                    ...prev,
                    userId: prev.userId,
                    hospitalName: data.hospitalName || '',
                    hospitalType: data.hospitalType || defaultType,
                    departments: Array.isArray(data.departments) ? data.departments.join(', ') : (data.departments || ''),
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                    services: Array.isArray(data.services) ? data.services.join(', ') : (data.services || ''),
                }));

                if (data.images && Array.isArray(data.images))
                    setExistingImages(data.images);
            } catch (err) {
                console.error(err);
                setError('Failed to load hospital data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    // ── generic input ────────────────────────────────────────────────────────
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // ── image helpers ────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const availableSlots = 5 - (selectedImages.length + existingImages.length);
        if (availableSlots <= 0) {
            setError('Maximum 5 images allowed');
            return;
        }

        const validFiles = files.slice(0, availableSlots).filter((file) => {
            if (!file.type.startsWith('image/')) {
                setError(`${file.name} is not a valid image`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError(`${file.name} exceeds 5 MB`);
                return false;
            }
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

    // ── geolocation ──────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true);
        setError('');
        if (!navigator.geolocation) {
            setError('Geolocation not supported');
            setLocationLoading(false);
            return;
        }

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
                } catch (e) {
                    console.error(e);
                }
                setLocationLoading(false);
            },
            (err) => {
                setError(`Location error: ${err.message}`);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    };

    // ── submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');
        try {
            if (!formData.hospitalName || !formData.departments || !formData.services)
                throw new Error(
                    'Please fill in all required fields (Name, Departments, Services)'
                );
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide a valid location');

            if (isEditMode && editId) {
                // Update
                await updateHospital(editId, {
                    hospitalName: formData.hospitalName,
                    hospitalType: formData.hospitalType,
                    departments: Array.isArray(formData.departments) ? formData.departments.join(', ') : formData.departments,
                    area: formData.area,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    services: Array.isArray(formData.services) ? formData.services.join(', ') : formData.services,
                    images: selectedImages,
                });
                setSuccessMessage('Hospital updated successfully!');
                setTimeout(() => navigate('/my-business'), 1500);
            } else {
                // Create
                const payload: CreateHospitalPayload = {
                    userId: formData.userId,
                    hospitalName: formData.hospitalName,
                    hospitalType: formData.hospitalType,
                    departments: Array.isArray(formData.departments) ? formData.departments.join(', ') : formData.departments,
                    area: formData.area,
                    city: formData.city,
                    state: formData.state,
                    pincode: formData.pincode,
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    services: Array.isArray(formData.services) ? formData.services.join(', ') : formData.services,
                    images: selectedImages,
                };
                await createHospital(payload);
                setSuccessMessage('Hospital created successfully!');
                setTimeout(() => navigate('/my-business'), 1500);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => window.history.back();

    // ── loading screen ───────────────────────────────────────────────────────
    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f09b13] mx-auto mb-4" />
                    <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER - Mobile First Design
    // ============================================================================

    // Safety check: Ensure departments and services are strings to prevent .trim() crashes
    const safeDepartments = Array.isArray(formData.departments)
        ? (formData.departments as string[]).join(', ')
        : (typeof formData.departments === 'string' ? formData.departments : '');

    const safeServices = Array.isArray(formData.services)
        ? (formData.services as string[]).join(', ')
        : (typeof formData.services === 'string' ? formData.services : '');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Header - Fixed ── */}
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
                            {isEditMode ? 'Update Hospital' : 'Add New Hospital'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your hospital information' : 'Register your healthcare facility'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* ── Alerts ── */}
                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className={`p-4 bg-[#f09b13]/10 border border-[#f09b13]/20 rounded-xl ${typography.body.small} text-[#f09b13]`}>
                        {successMessage}
                    </div>
                )}

                {/* ─── 1. BASIC INFORMATION ──────────────────────────── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Hospital Name</FieldLabel>
                        <input
                            type="text"
                            name="hospitalName"
                            value={formData.hospitalName}
                            onChange={handleInputChange}
                            placeholder="e.g., Apollo Hospitals"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* ─── 2. HOSPITAL TYPE ───────────────────────────────── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Hospital Type</FieldLabel>
                        <select
                            name="hospitalType"
                            value={formData.hospitalType}
                            onChange={handleInputChange}
                            className={inputBase + ' appearance-none bg-white'}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem'
                            }}
                        >
                            {hospitalTypes.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                </SectionCard>

                {/* ─── 3. DEPARTMENTS ──────────────────────────────────── */}
                <SectionCard title="Departments">
                    <div>
                        <FieldLabel required>Available Departments</FieldLabel>
                        <textarea
                            name="departments"
                            value={safeDepartments}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Cardiology, Orthopaedics, Neurology, Dermatology, Pediatrics"
                            className={inputBase + ' resize-none'}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>
                            💡 Separate each department with a comma
                        </p>
                    </div>

                    {/* Department chips preview */}
                    {safeDepartments && safeDepartments.trim() && (
                        <div className="mt-3">
                            <p className={`${typography.body.small} font-medium text-gray-700 mb-2`}>
                                Selected Departments ({safeDepartments.split(',').filter(d => d.trim()).length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {safeDepartments.split(',').map((d, i) => {
                                    const trimmed = d.trim();
                                    if (!trimmed) return null;
                                    return (
                                        <span
                                            key={i}
                                            className={`inline-flex items-center gap-1.5 bg-[#f09b13]/10 text-[#f09b13] px-3 py-1.5 rounded-full ${typography.misc.badge} font-medium`}
                                        >
                                            <span className="text-[#f09b13]">🏥</span>
                                            {trimmed}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </SectionCard>

                {/* ─── 4. SERVICES ─────────────────────────────────────── */}
                <SectionCard title="Services & Facilities">
                    <div>
                        <FieldLabel required>Available Services</FieldLabel>
                        <textarea
                            name="services"
                            value={safeServices}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Emergency Care, ICU, Lab Tests, X-Ray, CT Scan, MRI, Surgery, Dialysis, Pharmacy"
                            className={inputBase + ' resize-none'}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>
                            💡 List all medical services and facilities, separated by commas
                        </p>
                    </div>

                    {/* Service chips preview */}
                    {safeServices && safeServices.trim() && (
                        <div className="mt-3">
                            <p className={`${typography.body.small} font-medium text-gray-700 mb-2`}>
                                Selected Services ({safeServices.split(',').filter(s => s.trim()).length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {safeServices.split(',').map((s, i) => {
                                    const trimmed = s.trim();
                                    if (!trimmed) return null;
                                    return (
                                        <span
                                            key={i}
                                            className={`inline-flex items-center gap-1.5 bg-[#f09b13]/5 text-[#f09b13]/80 px-3 py-1.5 rounded-full ${typography.misc.badge} font-medium`}
                                        >
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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

                {/* ─── 5. LOCATION DETAILS ─────────────────────────────── */}
                <SectionCard
                    title="Location Details"
                    action={
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="!py-1.5 !px-3 !bg-[#f09b13] hover:!bg-[#f5b340]"
                        >
                            {locationLoading ? (
                                <>
                                    <span className="animate-spin mr-1">⌛</span>
                                    Detecting...
                                </>
                            ) : (
                                <>
                                    <MapPin className="w-4 h-4 inline mr-1.5" />
                                    Auto Detect
                                </>
                            )}
                        </Button>
                    }
                >
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input
                                type="text"
                                name="area"
                                value={formData.area}
                                onChange={handleInputChange}
                                placeholder="e.g., Banjara Hills"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleInputChange}
                                placeholder="e.g., Hyderabad"
                                className={inputBase}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleInputChange}
                                placeholder="e.g., Telangana"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleInputChange}
                                placeholder="e.g., 500016"
                                className={inputBase}
                            />
                        </div>
                    </div>

                    {/* Location Tip */}
                    <div className="bg-[#f09b13]/10 border border-[#f09b13]/20 rounded-xl p-3">
                        <p className={`${typography.body.small} text-[#f09b13]`}>
                            📍 <span className="font-medium">Tip:</span> Click the button to automatically detect your location, or enter your address manually above.
                        </p>
                    </div>

                    {/* Coordinates Display */}
                    {formData.latitude && formData.longitude && (
                        <div className="bg-[#f09b13]/10 border border-[#f09b13]/20 rounded-xl p-3">
                            <p className={`${typography.body.small} text-[#f09b13]`}>
                                <span className="font-semibold">✓ Location detected:</span>
                                <span className="ml-1">{parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}</span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ─── 6. HOSPITAL IMAGES ──────────────────────────────── */}
                <SectionCard title="Hospital Images (Optional)">
                    <label className="cursor-pointer block">
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={selectedImages.length + existingImages.length >= 5}
                        />
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${selectedImages.length + existingImages.length >= 5
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : 'border-[#f09b13]/20 hover:border-[#f09b13] hover:bg-[#f09b13]/10'
                            }`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-[#f09b13]/10 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-[#f09b13]" />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {selectedImages.length + existingImages.length >= 5
                                            ? 'Maximum limit reached'
                                            : 'Tap to upload hospital images'}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>Maximum 5 images</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Image Previews */}
                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img
                                        src={url}
                                        alt={`Saved ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-2 left-2 bg-[#f09b13] text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}>
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img
                                        src={preview}
                                        alt={`Preview ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2 border-[#f09b13]/20"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-2 left-2 bg-[#f09b13] text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}>
                                        New
                                    </span>
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
                        className={`flex-1 px-6 py-3.5 rounded-lg font-semibold text-white transition-all ${loading
                            ? "bg-[#f09b13]/40 cursor-not-allowed"
                            : "bg-[#f09b13] hover:bg-[#f5b340] active:bg-[#d07a00]"
                            } shadow-sm ${typography.body.base}`}
                    >
                        {loading
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Hospital' : 'Create Hospital')}
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

export default HospitalForm;
