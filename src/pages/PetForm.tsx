import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addPetService, updatePetServiceById, getPetServiceById } from "../services/PetWorker.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

// ── Pull pet service subcategories from JSON (categoryId 13) ────────────────
const getPetServiceSubcategories = () => {
    const petCategory = subcategoriesData.subcategories.find(cat => cat.categoryId === 13);
    return petCategory ? petCategory.items.map(item => item.name) : [];
};

const priceTypeOptions = ['Per Service', 'Per Hour', 'Per Day', 'Per Month'];

// ============================================================================
// SHARED INPUT CLASSES
// ============================================================================
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-orange-400 focus:border-orange-400 ` +
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

// ============================================================================
// GOOGLE MAPS GEOCODING HELPER
// ============================================================================
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const key = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
        const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`);
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            return { lat: loc.lat, lng: loc.lng };
        }
        return null;
    } catch { return null; }
};

// ============================================================================
// Scans all common localStorage keys to find userId
// ============================================================================
const resolveUserId = (): string => {
    const candidates = ['userId', 'user_id', 'uid', 'id', 'user', 'currentUser', 'loggedInUser', 'userData', 'userInfo', 'authUser'];
    for (const key of candidates) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        if (raw.length > 10 && !raw.startsWith('{')) {
            console.log(`✅ userId from localStorage["${key}"] =`, raw);
            return raw;
        }
        try {
            const parsed = JSON.parse(raw);
            const id = parsed._id || parsed.id || parsed.userId || parsed.user_id || parsed.uid;
            if (id) { console.log(`✅ userId from localStorage["${key}"] (JSON) =`, id); return String(id); }
        } catch { }
    }
    console.warn("⚠️ userId not found. localStorage keys:", Object.keys(localStorage));
    return '';
};

const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem'
};

// ============================================================================
// COMPONENT
// ============================================================================
const PetForm = () => {
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

    const petCategories = getPetServiceSubcategories();
    const defaultCategory = getSubcategoryFromUrl() || petCategories[0] || 'Pet Shops';

    const [formData, setFormData] = useState({
        userId: resolveUserId(),
        serviceName: '',
        category: defaultCategory,
        email: '',
        phone: '',
        description: '',
        experience: '',
        price: '',
        priceType: priceTypeOptions[0],
        availableFrom: '09:00 AM',
        availableTo: '06:00 PM',
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
    const isGPSDetected = useRef(false);

    // ── fetch for edit ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getPetServiceById(editId);
                if (!response.success || !response.data || response.data.length === 0)
                    throw new Error('Service not found');
                const data = response.data[0];
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || prev.userId,
                    serviceName: data.name || data.serviceName || '',
                    category: data.category || defaultCategory,
                    email: data.email || '',
                    phone: data.phone || '',
                    description: data.description || data.bio || '',
                    experience: data.experience?.toString() || '',
                    price: data.price?.toString() || data.serviceCharge?.toString() || '',
                    priceType: data.priceType || priceTypeOptions[0],
                    availableFrom: data.availableFrom || '09:00 AM',
                    availableTo: data.availableTo || '06:00 PM',
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                }));
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch (err) {
                console.error(err);
                setError('Failed to load service data');
            } finally { setLoadingData(false); }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode when address typed manually ─────────────────────────────
    useEffect(() => {
        const detect = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                const addr = [formData.area, formData.city, formData.state, formData.pincode]
                    .filter(Boolean).join(', ');
                const coords = await geocodeAddress(addr);
                if (coords) setFormData(prev => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lng.toString() }));
            }
        };
        const t = setTimeout(detect, 1000);
        return () => clearTimeout(t);
    }, [formData.area, formData.city, formData.state, formData.pincode]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
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

    const handleRemoveNewImage = (i: number) => {
        setSelectedImages(p => p.filter((_, idx) => idx !== i));
        setImagePreviews(p => p.filter((_, idx) => idx !== i));
    };
    const handleRemoveExistingImage = (i: number) => setExistingImages(p => p.filter((_, idx) => idx !== i));

    // ── GPS location ─────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(''); setLocationWarning('');
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
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
            (err) => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true); setError(''); setSuccessMessage('');
        try {
            let uid = formData.userId;
            if (!uid) { uid = resolveUserId(); if (uid) setFormData(prev => ({ ...prev, userId: uid })); }
            if (!uid) throw new Error('User not logged in. Please log out and log back in.');

            if (!formData.serviceName || !formData.phone || !formData.email)
                throw new Error('Please fill in all required fields (Service Name, Phone, Email)');
            if (!formData.price)
                throw new Error('Please enter a price');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide a valid location');

            const fd = new FormData();
            fd.append('userId', uid);
            fd.append('serviceName', formData.serviceName);
            fd.append('category', formData.category);
            fd.append('email', formData.email);
            fd.append('phone', formData.phone);
            fd.append('description', formData.description);
            fd.append('experience', formData.experience);
            fd.append('price', formData.price);
            fd.append('priceType', formData.priceType);
            fd.append('availableFrom', formData.availableFrom);
            fd.append('availableTo', formData.availableTo);
            fd.append('area', formData.area);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('pincode', formData.pincode);
            fd.append('latitude', formData.latitude);
            fd.append('longitude', formData.longitude);

            selectedImages.forEach(f => fd.append('images', f, f.name));

            if (isEditMode && existingImages.length > 0)
                fd.append('existingImages', JSON.stringify(existingImages));

            console.log('📤 Sending FormData:');
            Array.from(fd.entries()).forEach(([k, v]) => {
                if (v instanceof File) console.log(`  ${k}: [File] ${v.name} (${v.size}b)`);
                else console.log(`  ${k}: ${v}`);
            });

            if (isEditMode && editId) {
                const res = await updatePetServiceById(editId, fd);
                if (!res.success) throw new Error(res.message || 'Failed to update service');
                setSuccessMessage('Service updated successfully!');
            } else {
                const res = await addPetService(fd);
                if (!res.success) throw new Error(res.message || 'Failed to add service');
                setSuccessMessage('Service created successfully!');
            }
            setTimeout(() => navigate('/my-business'), 1500);
        } catch (err: any) {
            console.error('❌ Submit error:', err);
            setError(err.message || 'Failed to submit form');
        } finally { setLoading(false); }
    };

    const totalImages = selectedImages.length + existingImages.length;
    const maxImagesReached = totalImages >= 5;

    if (loadingData) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#f09b13' }} />
                <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
            </div>
        </div>
    );

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
                <div className="max-w-2xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>{isEditMode ? 'Update Pet Service' : 'Add Pet Service'}</h1>
                        <p className={`${typography.body.small} text-gray-500`}>{isEditMode ? 'Update your pet service listing' : 'Create new pet service listing'}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">⚠️</span>
                            <p className="text-red-700">{error}</p>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className={`p-4 bg-green-50 border border-green-200 rounded-xl ${typography.body.small} text-green-700`}>
                        <div className="flex items-center gap-2"><span>✓</span><p>{successMessage}</p></div>
                    </div>
                )}

                {/* 1. BASIC INFO */}
                <SectionCard title="Basic Information">
                    <div>
                        <FieldLabel required>Service / Business Name</FieldLabel>
                        <input type="text" name="serviceName" value={formData.serviceName} onChange={handleInputChange}
                            placeholder="e.g., Happy Paws Dog Walking" className={inputBase} />
                    </div>
                    <div>
                        <FieldLabel required>Category</FieldLabel>
                        <select name="category" value={formData.category} onChange={handleInputChange}
                            className={inputBase + ' appearance-none bg-white'} style={selectStyle}>
                            {petCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                </SectionCard>

                {/* 2. CONTACT */}
                <SectionCard title="Contact Information">
                    <div>
                        <FieldLabel required>Phone</FieldLabel>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange}
                            placeholder="Enter phone number" className={inputBase} />
                    </div>
                    <div>
                        <FieldLabel required>Email</FieldLabel>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                            placeholder="Enter email address" className={inputBase} />
                    </div>
                </SectionCard>

                {/* 3. SERVICE DETAILS */}
                <SectionCard title="Service Details">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Price (₹)</FieldLabel>
                            <input type="number" name="price" value={formData.price} onChange={handleInputChange}
                                placeholder="500" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>Price Type</FieldLabel>
                            <select name="priceType" value={formData.priceType} onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'} style={selectStyle}>
                                {priceTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <FieldLabel>Experience (years)</FieldLabel>
                        <input type="number" name="experience" value={formData.experience} onChange={handleInputChange}
                            placeholder="2" min="0" className={inputBase} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>Available From</FieldLabel>
                            <input type="text" name="availableFrom" value={formData.availableFrom} onChange={handleInputChange}
                                placeholder="09:00 AM" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel>Available To</FieldLabel>
                            <input type="text" name="availableTo" value={formData.availableTo} onChange={handleInputChange}
                                placeholder="06:00 PM" className={inputBase} />
                        </div>
                    </div>
                </SectionCard>

                {/* 4. LOCATION */}
                <SectionCard title="Location Details" action={
                    <Button
                        variant="success"
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="!py-1.5 !px-3 !bg-[#f09b13] !border-[#f09b13] hover:!bg-[#d4870f]"
                    >
                        {locationLoading
                            ? <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                            : <><MapPin className="w-4 h-4 inline mr-1.5" />Auto Detect</>}
                    </Button>
                }>
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div><FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange} placeholder="Area name" className={inputBase} /></div>
                        <div><FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange} placeholder="City" className={inputBase} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange} placeholder="State" className={inputBase} /></div>
                        <div><FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="PIN code" className={inputBase} /></div>
                    </div>
                    <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ee', border: '1px solid #f0c070' }}>
                        <p className={`${typography.body.small}`} style={{ color: '#7a4f00' }}>
                            📍 <span className="font-medium">Tip:</span> Click Auto Detect or enter manually above.
                        </p>
                    </div>
                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className={`${typography.body.small} text-green-800`}>
                                <span className="font-semibold">✓ Location detected: </span>
                                {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* 5. DESCRIPTION */}
                <SectionCard title="Description">
                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows={4}
                        placeholder="Describe your pet service, expertise, and what makes you special..."
                        className={inputBase + ' resize-none'} />
                </SectionCard>

                {/* 6. PHOTOS */}
                <SectionCard title={`Service Photos (${totalImages}/5)`}>
                    <label className="cursor-pointer block">
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden"
                            disabled={maxImagesReached} />
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
                                            ? 'Maximum limit reached (5 images)'
                                            : `Tap to upload service photos (${5 - totalImages} slots left)`}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>Max 5 images · 5 MB each · JPG, PNG, WEBP</p>
                                    {selectedImages.length > 0 && (
                                        <p className="text-sm font-medium mt-1" style={{ color: '#f09b13' }}>
                                            {selectedImages.length} new image{selectedImages.length > 1 ? 's' : ''} selected ✓
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square group">
                                    <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                    <button type="button" onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span
                                        className={`absolute bottom-2 left-2 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}
                                        style={{ backgroundColor: '#f09b13' }}
                                    >
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square group">
                                    <img src={preview} alt={`Preview ${i + 1}`}
                                        className="w-full h-full object-cover rounded-xl border-2"
                                        style={{ borderColor: '#f09b13' }} />
                                    <button type="button" onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-2 left-2 bg-green-600 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}>
                                        New
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2 pb-8">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        type="button"
                        className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg ${typography.body.base} ${loading ? 'cursor-not-allowed opacity-70' : ''}`}
                        style={{ backgroundColor: loading ? '#f0b35c' : '#f09b13' }}
                    >
                        {loading
                            ? <span className="flex items-center justify-center gap-2"><span className="animate-spin">⏳</span>{isEditMode ? 'Updating...' : 'Creating...'}</span>
                            : (isEditMode ? 'Update Service' : 'Add Service')}
                    </button>
                    <button
                        onClick={() => window.history.back()}
                        type="button"
                        className={`px-8 py-3.5 rounded-xl font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all ${typography.body.base}`}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PetForm;