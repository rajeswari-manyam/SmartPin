import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createShoppingStore,
    updateShoppingRetail,
    getShoppingRetailById,
    ShoppingStore
} from '../services/ShoppingService.service';
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from "../context/AccountContext";

const getShoppingRetailSubcategories = () => {
    const shoppingCategory = subcategoriesData.subcategories.find((cat: any) => cat.categoryId === 7);
    return shoppingCategory ? shoppingCategory.items.map((item: any) => item.name) : [];
};

// ── Shared input: #00598a focus ring ─────────────────────────────────────────
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:outline-none focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

// Dropdown chevron
const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2 font-medium`}>
        {children}{required && <span className="text-red-500 ml-1">*</span>}
    </label>
);

const SectionCard: React.FC<{ title?: string; children: React.ReactNode; action?: React.ReactNode }> = ({ title, children, action }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
        {title && (
            <div className="flex items-center justify-between mb-1">
                <h3 className={`${typography.card.subtitle} text-gray-900`}>{title}</h3>
                {action}
            </div>
        )}
        {children}
    </div>
);

// ── Always 2 columns with generous gap ───────────────────────────────────────
const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-2 gap-6">{children}</div>
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
const ShoppingForm: React.FC = () => {
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
    const [locationWarning, setLocationWarning] = useState('');
    const { setAccountType } = useAccount();

    const storeTypes = getShoppingRetailSubcategories();
    const defaultType = getSubcategoryFromUrl() || storeTypes[0] || 'Supermarkets';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        storeName: '',
        storeType: defaultType,
        email: '',
        phone: '',
        description: '',
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
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const isGPSDetected = useRef(false);

    // ── fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getShoppingRetailById(editId);
                if (!response.success || !response.data) throw new Error('Store not found');
                const data = response.data;
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || '',
                    storeName: data.storeName || '',
                    storeType: data.storeType || defaultType,
                    email: data.email || '',
                    phone: data.phone || '',
                    description: data.description || '',
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                }));
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch (err) {
                setError('Failed to load store data');
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode ──────────────────────────────────────────────────────────
    useEffect(() => {
        const detectCoordinates = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
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
        setLocationWarning('');
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                isGPSDetected.current = true;
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                const accuracy = pos.coords.accuracy;

                if (accuracy > 500) {
                    setLocationWarning(
                        `⚠️ Low accuracy detected (~${Math.round(accuracy)}m). ` +
                        `The address fields below may be approximate — please verify and correct if needed.`
                    );
                }

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
            if (!formData.storeName || !formData.phone || !formData.email)
                throw new Error('Please fill in all required fields (Store Name, Phone, Email)');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide a valid location');

            const fd = new FormData();
            fd.append('userId', formData.userId);
            fd.append('storeName', formData.storeName);
            fd.append('storeType', formData.storeType);
            fd.append('email', formData.email);
            fd.append('phone', formData.phone);
            fd.append('description', formData.description || '');
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
                await updateShoppingRetail(editId, fd);
                setSuccessMessage('Store updated successfully!');
            } else {
                await createShoppingStore(fd);
                setSuccessMessage('Store created successfully!');
            }

            setTimeout(() => {
                setAccountType("worker");
                navigate("/my-business");
            }, 1500);
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#00598a' }} />
                    <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER — Wide layout, 2 fields per row (matches CourierForm)
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
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Store' : 'Add New Store'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your store listing' : 'Create new store listing'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Wide container ── */}
            <div className="max-w-6xl mx-auto px-8 py-6 space-y-4">

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

                {/* ─── ROW 1: STORE NAME + STORE TYPE ─── */}
                <SectionCard>
                    <TwoCol>
                        <div>
                            <FieldLabel required>Store Name</FieldLabel>
                            <input
                                type="text"
                                name="storeName"
                                value={formData.storeName}
                                onChange={handleInputChange}
                                placeholder="Enter your store name"
                                className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Store Type</FieldLabel>
                            <select
                                name="storeType"
                                value={formData.storeType}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none'}
                                style={selectStyle}
                            >
                                {storeTypes.map((t: string) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 2: CONTACT ─── */}
                <SectionCard title="Contact Information">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Phone</FieldLabel>
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
                            <FieldLabel required>Email</FieldLabel>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                className={inputBase}
                            />
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 3: DESCRIPTION (full width since single field) ─── */}
                <SectionCard title="Store Description">
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        placeholder="Tell us about your store..."
                        className={inputBase + ' resize-none'}
                    />
                </SectionCard>

                {/* ─── ROW 4-5: LOCATION ─── */}
                <SectionCard
                    title="Location Details"
                    action={
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white
                                bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                                transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {locationLoading
                                ? <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                                : <><MapPin className="w-4 h-4 inline mr-1" />Auto Detect</>
                            }
                        </button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
                        </div>
                    )}

                    {/* Area + City */}
                    <TwoCol>
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area}
                                onChange={handleInputChange} placeholder="e.g. Koramangala" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city}
                                onChange={handleInputChange} placeholder="e.g. Bangalore" className={inputBase} />
                        </div>
                    </TwoCol>

                    {/* State + PIN */}
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

                    <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ee', border: '1px solid #f0c070' }}>
                        <p className={`${typography.body.small}`} style={{ color: '#7a4f00' }}>
                            📍 <span className="font-medium">Tip:</span> Click "Auto Detect" to get your current location, or enter your address manually above.
                        </p>
                    </div>

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

                {/* ─── ROW 6: PHOTOS ─── */}
                <SectionCard title={`Store Photos (${totalImagesCount}/5)`}>
                    <TwoCol>
                        {/* Upload zone */}
                        <label className={`block ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleImageSelect}
                                className="hidden"
                                disabled={maxImagesReached}
                            />
                            <div
                                className="border-2 border-dashed rounded-2xl p-10 text-center transition h-full flex items-center justify-center"
                                style={{
                                    borderColor: maxImagesReached ? '#d1d5db' : '#00598a',
                                    backgroundColor: maxImagesReached ? '#f9fafb' : '#fffbf5',
                                    minHeight: '180px',
                                }}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#fff0d6' }}>
                                        <Upload className="w-8 h-8" style={{ color: '#00598a' }} />
                                    </div>
                                    <div>
                                        <p className={`${typography.form.input} font-medium text-gray-700`}>
                                            {maxImagesReached
                                                ? 'Maximum 5 images reached'
                                                : `Add Photos (${5 - totalImagesCount} slots left)`}
                                        </p>
                                        <p className={`${typography.body.small} text-gray-500 mt-1`}>
                                            Upload photos of your store, products, or team
                                        </p>
                                        {selectedImages.length > 0 && (
                                            <p className="text-sm font-medium mt-1" style={{ color: '#00598a' }}>
                                                {selectedImages.length} new image{selectedImages.length > 1 ? 's' : ''} selected ✓
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </label>

                        {/* Previews */}
                        {(existingImages.length > 0 || selectedImages.length > 0) ? (
                            <div className="grid grid-cols-3 gap-3">
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
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <span className="absolute bottom-2 left-2 text-white text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#00598a' }}>
                                                Saved
                                            </span>
                                        </div>
                                    ))}

                                {selectedImages.map((file, i) => (
                                    <div key={`new-${i}`} className="relative aspect-square group">
                                        <img
                                            src={imagePreviews[i]}
                                            alt={`New ${i + 1}`}
                                            className="w-full h-full object-cover rounded-xl border-2"
                                            style={{ borderColor: '#00598a' }}
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
                                <p className={`${typography.body.small} text-gray-400`}>
                                    Uploaded images will appear here
                                </p>
                            </div>
                        )}
                    </TwoCol>

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
                <div className="flex gap-4 pt-2 pb-8 justify-end">
                    <button
                        onClick={handleCancel}
                        type="button"
                        disabled={loading}
                        className={`px-10 py-3.5 rounded-xl font-semibold text-[#00598a]
                            bg-white border-2 border-[#00598a]
                            hover:bg-[#00598a] hover:text-white
                            active:bg-[#004a73] active:text-white
                            transition-all ${typography.body.base}
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        type="button"
                        className={`px-10 py-3.5 rounded-xl font-semibold text-white
                            transition-all shadow-md hover:shadow-lg
                            bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                            ${typography.body.base}
                            ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : (
                            isEditMode ? 'Update Store' : 'Create Store'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default ShoppingForm;