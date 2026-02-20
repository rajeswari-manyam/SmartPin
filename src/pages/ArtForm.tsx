import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addCreativeArtService, updateCreativeArtService, getCreativeArtServiceById } from "../services/Creative.service";
import Button from "../components/ui/Buttons";
import typography from "../styles/typography";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin } from 'lucide-react';

// ── Charge type options ──────────────────────────────────────────────────────
const chargeTypeOptions = ['Per Hour', 'Per Day', 'Per Project', 'Fixed Rate', 'Custom'];

// ✅ FIXED: Exact category string matching Postman curl
const CATEGORY_NAME = 'Creative & Art Services';

// ── Pull creative art subcategories from JSON (categoryId 21) ───────────────
const getCreativeArtSubcategories = () => {
    const artCategory = subcategoriesData.subcategories.find(cat => cat.categoryId === 21);
    return artCategory ? artCategory.items.map(item => item.name) : [
        'Craft Training', 'Caricature Artists', 'Painting Artists', 'Wall Murals', 'Handmade Gifts'
    ];
};

// ============================================================================
// SHARED INPUT CLASSES
// ============================================================================
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem'
};

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
// COMPONENT
// ============================================================================
const ArtForm: React.FC = () => {
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

    const artCategories = getCreativeArtSubcategories();
    const defaultCategory = getSubcategoryFromUrl() || artCategories[0] || 'Craft Training';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: '',
        subCategory: defaultCategory,
        description: '',
        serviceCharge: '',
        chargeType: chargeTypeOptions[0],
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
                const data = await getCreativeArtServiceById(editId);
                if (!data) throw new Error('Service not found');
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || '',
                    name: data.name || '',
                    subCategory: data.subCategory || defaultCategory,
                    description: data.description || '',
                    serviceCharge: data.serviceCharge?.toString() || '',
                    chargeType: data.chargeType || chargeTypeOptions[0],
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

    // ── Auto-geocode when address typed manually ─────────────────────────────
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── Image helpers — matches RealEstate pattern exactly ───────────────────
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

    // ── GPS location — matches RealEstate pattern ────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(''); setLocationWarning('');
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                isGPSDetected.current = true;
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                if (pos.coords.accuracy > 500) setLocationWarning(`⚠️ Low accuracy (~${Math.round(pos.coords.accuracy)}m). Please verify.`);
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

    // ============================================================================
    // SUBMIT — FormData exactly matching Postman curl
    // ============================================================================
    const handleSubmit = async () => {
        setLoading(true); setError(''); setSuccessMessage('');
        try {
            if (!formData.name.trim()) throw new Error('Please enter a name');
            if (!formData.description.trim()) throw new Error('Please enter a description');
            if (!formData.serviceCharge.trim()) throw new Error('Please enter service charge');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide a valid location (use Auto Detect or enter address)');

            // ✅ Build FormData exactly matching Postman curl field order
            const fd = new FormData();
            fd.append('userId', formData.userId);
            fd.append('description', formData.description);
            fd.append('category', CATEGORY_NAME);           // ✅ required by API
            fd.append('subCategory', formData.subCategory);
            fd.append('serviceCharge', formData.serviceCharge);
            fd.append('chargeType', formData.chargeType);
            fd.append('latitude', formData.latitude);
            fd.append('longitude', formData.longitude);
            fd.append('area', formData.area);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('pincode', formData.pincode);
            fd.append('name', formData.name);               // ✅ matches Postman field order

            // ✅ Append images with filename — matches Postman: append("images", file, filename)
            selectedImages.forEach(f => fd.append('images', f, f.name));

            // ✅ Preserve existing images on edit
            if (isEditMode && existingImages.length > 0) {
                fd.append('existingImages', JSON.stringify(existingImages));
            }

            // Debug log
            console.log('📤 Art FormData:');
            Array.from(fd.entries()).forEach(([k, v]) => {
                if (v instanceof File) console.log(`  ${k}: [File] ${v.name} (${v.size}b)`);
                else console.log(`  ${k}: ${v}`);
            });

            if (isEditMode && editId) {
                // ✅ Update also uses FormData (not JSON) — matches RealEstate pattern
                const res = await updateCreativeArtService(editId, fd as any);
                if (!res.success) throw new Error(res.message || 'Failed to update service');
                setSuccessMessage('Service updated successfully!');
            } else {
                const res = await addCreativeArtService(fd);
                if (!res.success) throw new Error(res.message || 'Failed to create service');
                setSuccessMessage('Service created successfully!');
            }
            setTimeout(() => navigate('/my-business'), 1500);
        } catch (err: any) {
            console.error('❌ Submit error:', err);
            setError(err.message || 'Failed to submit form');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
                <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
            </div>
        </div>
    );

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
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Art Service' : 'Add Art Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
                {error && <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>{error}</div>}
                {successMessage && <div className={`p-4 bg-green-50 border border-green-200 rounded-xl ${typography.body.small} text-green-700`}>{successMessage}</div>}

                {/* 1. BASIC INFO */}
                <SectionCard title="Basic Information">
                    <div>
                        <FieldLabel required>Artist / Service Name</FieldLabel>
                        <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                            placeholder="e.g. Studio Artworks, Creative Designs" className={inputBase} />
                    </div>
                    <div>
                        <FieldLabel required>Category</FieldLabel>
                        <select name="subCategory" value={formData.subCategory} onChange={handleInputChange}
                            className={inputBase + ' appearance-none bg-white'} style={selectStyle}>
                            {artCategories.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <p className={`${typography.body.xs} text-gray-400 mt-1`}>
                            Parent category: <span className="font-medium text-gray-500">{CATEGORY_NAME}</span>
                        </p>
                    </div>
                    <div>
                        <FieldLabel required>Description</FieldLabel>
                        <textarea name="description" value={formData.description} onChange={handleInputChange}
                            rows={4} placeholder="Describe your art services, specialties, and what makes your work unique..."
                            className={inputBase + ' resize-none'} />
                    </div>
                </SectionCard>

                {/* 2. PRICING */}
                <SectionCard title="Pricing Details">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <FieldLabel required>Service Charge (₹)</FieldLabel>
                            <input type="number" name="serviceCharge" value={formData.serviceCharge}
                                onChange={handleInputChange} placeholder="Amount" min="0" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <select name="chargeType" value={formData.chargeType} onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'} style={selectStyle}>
                                {chargeTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </div>
                </SectionCard>

                {/* 3. LOCATION */}
                <SectionCard title="Location Details" action={
                    <Button variant="success" size="sm" onClick={getCurrentLocation} disabled={locationLoading} className="!py-1.5 !px-3">
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
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <p className={`${typography.body.small} text-amber-800`}>
                            📍 <span className="font-medium">Tip:</span> Click Auto Detect or enter your address manually above.
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

                {/* 4. PHOTOS — matches RealEstate photo section exactly */}
                <SectionCard title="Portfolio Photos (Optional)">
                    <label className="cursor-pointer block">
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden"
                            disabled={selectedImages.length + existingImages.length >= 5} />
                        <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${selectedImages.length + existingImages.length >= 5
                            ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                            : 'border-amber-300 hover:border-amber-400 hover:bg-amber-50'
                            }`}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                                    <Upload className="w-8 h-8 text-amber-600" />
                                </div>
                                <div>
                                    <p className={`${typography.form.input} font-medium text-gray-700`}>
                                        {selectedImages.length + existingImages.length >= 5
                                            ? 'Maximum limit reached (5 images)'
                                            : 'Tap to upload portfolio photos'}
                                    </p>
                                    <p className={`${typography.body.small} text-gray-500 mt-1`}>Max 5 images · 5 MB each · JPG, PNG, WEBP</p>
                                    {selectedImages.length > 0 && (
                                        <p className="text-amber-600 text-sm font-medium mt-1">
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
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                    <button type="button" onClick={() => handleRemoveExistingImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X className="w-4 h-4" /></button>
                                    <span className={`absolute bottom-2 left-2 bg-amber-600 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}>Saved</span>
                                </div>
                            ))}
                            {imagePreviews.map((preview, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-amber-400" />
                                    <button type="button" onClick={() => handleRemoveNewImage(i)}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg"><X className="w-4 h-4" /></button>
                                    <span className={`absolute bottom-2 left-2 bg-green-600 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}>New</span>
                                </div>
                            ))}
                        </div>
                    )}
                </SectionCard>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2 pb-8">
                    <button onClick={handleSubmit} disabled={loading} type="button"
                        className={`flex-1 px-6 py-3.5 rounded-lg font-semibold text-white transition-all shadow-sm ${loading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'} ${typography.body.base}`}>
                        {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Service' : 'Create Service')}
                    </button>
                    <button onClick={() => window.history.back()} type="button"
                        className={`px-8 py-3.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all ${typography.body.base}`}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ArtForm;
