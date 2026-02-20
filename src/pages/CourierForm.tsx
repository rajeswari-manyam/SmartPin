import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    addCourierService,
    updateCourierService,
    getCourierServiceById,
} from "../services/CourierService.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

// ── Charge type options — matching API exactly ───────────────────────────────
const chargeTypeOptions: { label: string; value: string }[] = [
    { label: 'Per KM', value: 'per km' },
    { label: 'Per Day', value: 'per day' },
    { label: 'Per Hour', value: 'per hour' },
    { label: 'Per Delivery', value: 'per delivery' },
    { label: 'Fixed Rate', value: 'fixed' },
];

// ── Pull courier subcategories from JSON ─────────────────────────────────────
const getCourierSubcategories = () => {
    const courierCategory = subcategoriesData.subcategories.find(
        (cat: any) => cat.categoryId === 16
    );
    return courierCategory ? courierCategory.items.map((item: any) => item.name) : [];
};

// ============================================================================
// SHARED INPUT CLASSES - Mobile First
// ============================================================================
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ` +
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
const SectionCard: React.FC<{
    title?: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}> = ({ title, children, action }) => (
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
// GOOGLE MAPS GEOCODING HELPER
// ============================================================================
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

// ============================================================================
// COMPONENT
// ============================================================================
const CourierForm: React.FC = () => {
    const navigate = useNavigate();

    // ── URL helpers ──────────────────────────────────────────────────────────
    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const getSubcategoryFromUrl = () => {
        const sub = new URLSearchParams(window.location.search).get('subcategory');
        return sub
            ? sub.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
            : null;
    };

    // ── state ────────────────────────────────────────────────────────────────
    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [locationWarning, setLocationWarning] = useState('');

    const courierCategories = getCourierSubcategories();
    const defaultCategory = getSubcategoryFromUrl() || courierCategories[0] || 'Local Delivery';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: '',
        category: defaultCategory,
        email: '',
        phone: '',
        bio: '',
        services: '' as string,
        serviceCharge: '',
        chargeType: chargeTypeOptions[0].value,   // 'per km'
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        experience: '0',
    });

    // ── images ───────────────────────────────────────────────────────────────
    // NEW IMAGES: Files to be uploaded
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // EXISTING IMAGES: URLs from backend (for edit mode)
    const [existingImages, setExistingImages] = useState<string[]>([]);

    // IMAGES TO DELETE: Track which existing images user wants to remove
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    // ── geo ──────────────────────────────────────────────────────────────────
    const [locationLoading, setLocationLoading] = useState(false);
    const isGPSDetected = useRef(false);

    // ── fetch for edit ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const data = await getCourierServiceById(editId);
                if (!data) throw new Error('Service not found');

                const storedChargeType = data.chargeType?.toLowerCase() || chargeTypeOptions[0].value;
                const matchedChargeType =
                    chargeTypeOptions.find(o => o.value === storedChargeType)?.value ??
                    chargeTypeOptions[0].value;

                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || '',
                    name: data.name || '',
                    category: data.category || defaultCategory,
                    email: data.email || '',
                    phone: data.phone || '',
                    bio: data.bio || '',
                    services: Array.isArray(data.services) ? data.services.join(', ') : '',
                    serviceCharge: data.serviceCharge?.toString() || '',
                    chargeType: matchedChargeType,
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                    experience: data.experience?.toString() || '0',
                }));

                // Load existing images from backend
                if (Array.isArray(data.images)) {
                    setExistingImages(data.images);
                    console.log('📸 Loaded existing images:', data.images.length);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load service data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode when address typed manually ─────────────────────────────
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

    // ── generic input ────────────────────────────────────────────────────────
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── image helpers ────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        // Calculate available slots: 5 - (existing that will be kept + new images)
        const remainingExisting = existingImages.filter(img => !imagesToDelete.includes(img)).length;
        const availableSlots = 5 - (remainingExisting + selectedImages.length);

        if (availableSlots <= 0) {
            setError('Maximum 5 images allowed');
            return;
        }

        const validFiles = files.slice(0, availableSlots).filter(file => {
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

    const handleRemoveExistingImage = (imageUrl: string) => {
        // Mark for deletion instead of immediate removal
        setImagesToDelete(prev => [...prev, imageUrl]);
    };

    const handleRestoreExistingImage = (imageUrl: string) => {
        // Un-mark from deletion
        setImagesToDelete(prev => prev.filter(url => url !== imageUrl));
    };

    // ── geolocation ──────────────────────────────────────────────────────────
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
            (err) => {
                setError(`Location error: ${err.message}`);
                setLocationLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Validation
            if (!formData.name.trim())
                throw new Error('Please enter business name');
            if (!formData.serviceCharge.trim())
                throw new Error('Please enter service charge');
            if (!formData.area.trim())
                throw new Error('Please enter area');
            if (!formData.city.trim())
                throw new Error('Please enter city');
            if (!formData.state.trim())
                throw new Error('Please enter state');
            if (!formData.pincode.trim())
                throw new Error('Please enter pincode');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide location (use Auto Detect or enter address)');

            const fd = new FormData();

            // ✅ Required fields matching backend API exactly
            fd.append('userId', formData.userId);
            fd.append('serviceName', formData.name);
            fd.append('subCategory', formData.category);
            fd.append('serviceCharge', formData.serviceCharge);
            fd.append('chargeType', formData.chargeType);
            fd.append('area', formData.area);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('pincode', formData.pincode);
            fd.append('latitude', formData.latitude);
            fd.append('longitude', formData.longitude);

            // Description field (combining bio and services)
            let descriptionText = formData.bio?.trim() || 'Courier service';
            if (formData.services.trim()) {
                const servicesArray = formData.services.split(',').map(s => s.trim()).filter(Boolean);
                if (servicesArray.length > 0) {
                    const servicesText = '\n\nServices:\n• ' + servicesArray.join('\n• ');
                    descriptionText += servicesText;
                }
            }
            fd.append('description', descriptionText);

            // Optional fields - only add if they have values
            if (formData.email.trim()) {
                fd.append('email', formData.email);
            }
            if (formData.phone.trim()) {
                fd.append('phone', formData.phone);
            }
            if (formData.experience && formData.experience !== '0') {
                fd.append('experience', formData.experience);
            }

            // ✅ IMAGES HANDLING - Match backend expectations
            // 1. Append NEW image files (File objects)
            if (selectedImages.length > 0) {
                selectedImages.forEach((img, index) => {
                    fd.append('images', img, img.name);
                    console.log(`📎 Appending new image ${index + 1}:`, img.name);
                });
            }

            // 2. For EDIT mode: Send remaining existing images that weren't deleted
            if (isEditMode) {
                const remainingExisting = existingImages.filter(url => !imagesToDelete.includes(url));
                if (remainingExisting.length > 0) {
                    fd.append('existingImages', JSON.stringify(remainingExisting));
                    console.log('📎 Keeping existing images:', remainingExisting.length);
                }

                // Optionally tell backend which images to delete
                if (imagesToDelete.length > 0) {
                    fd.append('imagesToDelete', JSON.stringify(imagesToDelete));
                    console.log('🗑️ Marked for deletion:', imagesToDelete.length);
                }
            }

            // Debug log
            console.log('📤 Submitting courier service with data:', {
                userId: formData.userId,
                serviceName: formData.name,
                subCategory: formData.category,
                serviceCharge: formData.serviceCharge,
                chargeType: formData.chargeType,
                location: `${formData.area}, ${formData.city}`,
                coordinates: `${formData.latitude}, ${formData.longitude}`,
                newImagesCount: selectedImages.length,
                existingImagesCount: isEditMode ? existingImages.filter(url => !imagesToDelete.includes(url)).length : 0,
                imagesToDeleteCount: imagesToDelete.length
            });

            let response;
            if (isEditMode && editId) {
                response = await updateCourierService(editId, fd);
            } else {
                response = await addCourierService(fd);
            }

            if (response.success) {
                setSuccessMessage(isEditMode ? 'Service updated successfully!' : 'Service created successfully!');
                setTimeout(() => navigate('/my-business'), 1500);
            } else {
                throw new Error(response.message || 'Failed to submit');
            }
        } catch (err: any) {
            console.error('Submit error:', err);
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => window.history.back();

    // Calculate displayed images count
    const remainingExistingCount = existingImages.filter(url => !imagesToDelete.includes(url)).length;
    const totalImagesCount = remainingExistingCount + selectedImages.length;
    const maxImagesReached = totalImagesCount >= 5;

    // ── loading screen ───────────────────────────────────────────────────────
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

    // ============================================================================
    // RENDER — Mobile First
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
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
                            {isEditMode ? 'Update Courier Service' : 'Add New Courier Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your courier service listing' : 'Create new courier service listing'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">⚠️</span>
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 mb-1">Error</p>
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className={`p-4 bg-green-50 border border-green-200 rounded-xl ${typography.body.small} text-green-700`}>
                        <div className="flex items-start gap-2">
                            <span className="text-green-600 mt-0.5">✓</span>
                            <p>{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* ─── 1. NAME ──────────────────────────────────────── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Business Name</FieldLabel>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Fast Courier, Quick Delivery"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* ─── 2. CONTACT (optional) ────────────────────────── */}
                <SectionCard title="Contact Information (Optional)">
                    <div>
                        <FieldLabel>Phone</FieldLabel>
                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className={inputBase}
                        />
                    </div>
                    <div>
                        <FieldLabel>Email</FieldLabel>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email address"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* ─── 3. CATEGORY ──────────────────────────────────── */}
                <SectionCard>
                    <div>
                        <FieldLabel required>Service Category</FieldLabel>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={inputBase + ' appearance-none bg-white'}
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 0.75rem center',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '2.5rem',
                            }}
                        >
                            {courierCategories.map((t: string) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                </SectionCard>

                {/* ─── 4. SERVICES & BIO ────────────────────────────── */}
                <SectionCard title="Service Description">
                    <div>
                        <FieldLabel>Brief Description</FieldLabel>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            rows={3}
                            placeholder="Brief description of your courier service..."
                            className={inputBase + ' resize-none'}
                        />
                    </div>

                    <div>
                        <FieldLabel>Services Offered (Optional)</FieldLabel>
                        <textarea
                            name="services"
                            value={formData.services}
                            onChange={handleInputChange}
                            rows={2}
                            placeholder="e.g. Same Day Delivery, Parcel Pickup, Express Shipping"
                            className={inputBase + ' resize-none'}
                        />
                        <p className={`${typography.misc.caption} mt-2`}>
                            💡 Separate multiple services with commas
                        </p>

                        {/* Service Chips Preview */}
                        {formData.services.trim() && (
                            <div className="mt-3">
                                <div className="flex flex-wrap gap-2">
                                    {formData.services.split(',').map((s, i) => {
                                        const trimmed = s.trim();
                                        if (!trimmed) return null;
                                        return (
                                            <span
                                                key={i}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${typography.misc.badge} font-medium text-white`}
                                                style={{ backgroundColor: '#f09b13' }}
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
                    </div>
                </SectionCard>

                {/* ─── 5. PRICING ───────────────────────────────────── */}
                <SectionCard title="Pricing Details">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input
                                type="number"
                                name="serviceCharge"
                                value={formData.serviceCharge}
                                onChange={handleInputChange}
                                placeholder="Amount"
                                min="0"
                                step="1"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <select
                                name="chargeType"
                                value={formData.chargeType}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.75rem center',
                                    backgroundSize: '1.5em 1.5em',
                                    paddingRight: '2.5rem',
                                }}
                            >
                                {chargeTypeOptions.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <FieldLabel>Experience (years)</FieldLabel>
                        <input
                            type="number"
                            name="experience"
                            value={formData.experience}
                            onChange={handleInputChange}
                            placeholder="Years of experience"
                            min="0"
                            className={inputBase}
                        />
                    </div>
                </SectionCard>

                {/* ─── 6. LOCATION ─────────────────────────────────── */}
                <SectionCard
                    title="Service Location"
                    action={
                        <Button
                            variant="success"
                            size="sm"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="!py-1.5 !px-3"
                        >
                            {locationLoading ? (
                                <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                            ) : (
                                <><MapPin className="w-4 h-4 inline mr-1.5" />Auto Detect</>
                            )}
                        </Button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                    </div>

                    <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ee', border: '1px solid #f0c070' }}>
                        <p className={`${typography.body.small}`} style={{ color: '#7a4f00' }}>
                            📍 <span className="font-medium">Tip:</span> Click "Auto Detect" to get your current location, or enter your service area manually.
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className={`${typography.body.small} text-green-800`}>
                                <span className="font-semibold">✓ Location set:</span>
                                <span className="ml-1">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ─── 7. PORTFOLIO PHOTOS ─────────────────────────── */}
                <SectionCard title={`Service Photos (${totalImagesCount}/5)`}>
                    {/* Upload Area */}
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
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            style={{
                                borderColor: maxImagesReached ? '#d1d5db' : '#f09b13',
                                backgroundColor: maxImagesReached ? '#f9fafb' : '#fffbf5',
                            }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fff0d6' }}>
                                    <Upload className="w-8 h-8" style={{ color: '#f09b13' }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {maxImagesReached
                                            ? 'Maximum 5 images reached'
                                            : `Add Photos (${5 - totalImagesCount} slots left)`}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>
                                        Upload photos of your vehicles, packaging, or team
                                    </p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {/* Images Grid - Shows both existing and new images */}
                    {(existingImages.length > 0 || selectedImages.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {/* EXISTING IMAGES (not marked for deletion) */}
                            {existingImages
                                .filter(url => !imagesToDelete.includes(url))
                                .map((url, i) => (
                                    <div key={`ex-${i}`} className="relative aspect-square group">
                                        <img
                                            src={url}
                                            alt={`Saved ${i + 1}`}
                                            className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error';
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingImage(url)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-2 left-2 text-white text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f09b13' }}>
                                            Saved
                                        </span>
                                    </div>
                                ))}

                            {/* NEW IMAGES (to be uploaded) */}
                            {selectedImages.map((file, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img
                                        src={imagePreviews[i]}
                                        alt={`New ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: '#f09b13' }}
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
                    )}

                    {/* Deleted Images (Undo section) */}
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
                                        className="inline-flex items-center gap-1 text-xs bg-white border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50"
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
                        className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg ${typography.body.base} ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
                        style={{ backgroundColor: loading ? '#f0b35c' : '#f09b13' }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : (
                            isEditMode ? 'Update Service' : 'Create Service'
                        )}
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

export default CourierForm;