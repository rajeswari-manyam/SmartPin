import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createHotelWithImages, updateHotel, getHotelById, Hotel } from '../services/HotelService.service';
import typography from "../styles/typography";
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from "../context/AccountContext";

// ── Same imports as AddSkillsScreen / FoodServiceForm ────────────────────────
import { categories } from "../components/categories/Categories";
import SubCategoriesData from "../components/data/SubCategories.json";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

// ─────────────────────────────────────────────────────────────────────────────

const availabilityOptions = ['Full Time', 'Part Time', 'On Demand', 'Weekends Only'];

interface SubCategoryGroup {
    categoryId: number;
    items: { name: string; icon?: string }[];
}

const subcategoryGroups: SubCategoryGroup[] = (SubCategoriesData as any).subcategories || [];

// ── Brand colors ──────────────────────────────────────────────────────────────
const BRAND          = '#00598a';
const BRAND_DARK     = '#004a73';
const BRAND_DARKER   = '#003d5c';
const BRAND_LIGHT_BG     = '#e8f2f8';
const BRAND_LIGHT_BORDER = '#b3d4e8';

const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:outline-none focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

// ── Shared layout components ──────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
        {children}{required && <span className="ml-1" style={{ color: BRAND }}>*</span>}
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

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-2 gap-6">{children}</div>
);

// ── Geocoding helper ──────────────────────────────────────────────────────────
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        const data = await response.json();
        if (data.status === 'OK' && data.results.length > 0) {
            const loc = data.results[0].geometry.location;
            return { lat: loc.lat, lng: loc.lng };
        }
        return null;
    } catch (error) {
        console.error('Geocoding error:', error);
        return null;
    }
};

const resolveUserId = (): string => {
    const candidates = ['userId', 'user_id', 'uid', 'id', 'user', 'currentUser', 'loggedInUser', 'userData', 'userInfo', 'authUser'];
    for (const key of candidates) {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        if (raw.length > 10 && !raw.startsWith('{')) return raw;
        try {
            const parsed = JSON.parse(raw);
            const id = parsed._id || parsed.id || parsed.userId || parsed.user_id || parsed.uid;
            if (id) return String(id);
        } catch { }
    }
    return '';
};

// ============================================================================
// COMPONENT
// ============================================================================
const HotelForm = () => {
    const navigate = useNavigate();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [locationWarning, setLocationWarning] = useState('');
    const { setAccountType } = useAccount();

    // ── Category / Subcategory state (mirrors AddSkillsScreen) ───────────────
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('');

    const filteredSubcategories = selectedCategory
        ? (subcategoryGroups.find(g => String(g.categoryId) === selectedCategory)?.items || [])
        : [];

    // ── Form fields ───────────────────────────────────────────────────────────
    const [formData, setFormData] = useState({
        userId: resolveUserId(),
        name: '',
        email: '',
        phone: '',
        description: '',
        service: '',
        priceRange: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        experience: '',
        availability: availabilityOptions[0],
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [isCurrentlyAvailable, setIsCurrentlyAvailable] = useState(true);
    const isGPSDetected = useRef(false);

    // ── Fetch for edit ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const data = await getHotelById(editId);
                if (!data) throw new Error('Service not found');

                // Restore category & subcategory from saved data
                const savedCategory = (data as any).category || '';
                const savedType     = data.type || '';
                const matchedCat    = categories.find(c => c.name === savedCategory);
                if (matchedCat) setSelectedCategory(matchedCat.id);
                setSelectedSubcategory(savedType);

                setFormData(prev => ({
                    ...prev,
                    userId:       data.userId || '',
                    name:         data.name || '',
                    email:        data.email || '',
                    phone:        data.phone || '',
                    description:  data.description || '',
                    service:      data.service || '',
                    priceRange:   data.priceRange || '',
                    area:         data.area || '',
                    city:         data.city || '',
                    state:        data.state || '',
                    pincode:      data.pincode || '',
                    latitude:     data.latitude?.toString() || '',
                    longitude:    data.longitude?.toString() || '',
                    experience:   data.experience?.toString() || '',
                    availability: data.availability || availabilityOptions[0],
                }));

                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch (err) {
                console.error(err);
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
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                const fullAddress = [formData.area, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ');
                if (fullAddress.trim()) {
                    const coords = await geocodeAddress(fullAddress);
                    if (coords) setFormData(prev => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lng.toString() }));
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

    // ── Image helpers ─────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const availableSlots = 5 - (selectedImages.length + existingImages.length);
        if (availableSlots <= 0) { setError('Maximum 5 images allowed'); return; }
        const validFiles = files.slice(0, availableSlots).filter(file => {
            if (!file.type.startsWith('image/')) { setError(`${file.name} is not a valid image`); return false; }
            if (file.size > 5 * 1024 * 1024) { setError(`${file.name} exceeds 5 MB`); return false; }
            return true;
        });
        if (!validFiles.length) return;
        const newPreviews: string[] = [];
        let loaded = 0;
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                loaded++;
                if (loaded === validFiles.length) setImagePreviews(prev => [...prev, ...newPreviews]);
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
    const handleRemoveExistingImage = (i: number) => setExistingImages(prev => prev.filter((_, idx) => idx !== i));

    // ── Geolocation ───────────────────────────────────────────────────────────
    const getCurrentLocation = () => {
        setLocationLoading(true); setError(''); setLocationWarning('');
        if (!navigator.geolocation) { setError('Geolocation not supported by your browser'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                isGPSDetected.current = true;
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                if (pos.coords.accuracy > 500)
                    setLocationWarning(`⚠️ Low accuracy detected (~${Math.round(pos.coords.accuracy)}m). Please verify the address.`);
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const data = await res.json();
                    if (data.address) {
                        setFormData(prev => ({
                            ...prev, latitude: lat, longitude: lng,
                            area:    data.address.suburb || data.address.neighbourhood || data.address.road || prev.area,
                            city:    data.address.city   || data.address.town || data.address.village || prev.city,
                            state:   data.address.state   || prev.state,
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

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true); setError(''); setSuccessMessage('');
        try {
            let uid = formData.userId || resolveUserId();
            if (!uid) throw new Error('User not logged in. Please log out and log back in.');

            if (!formData.name || !formData.phone || !formData.email)
                throw new Error('Please fill in all required fields (Name, Phone, Email)');
            if (!selectedCategory)    throw new Error('Please select a category.');
            if (!selectedSubcategory) throw new Error('Please select a subcategory / service type.');
            if (!formData.service || !formData.service.trim())
                throw new Error('Please enter at least one service');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide a valid location');

            const categoryName = categories.find(c => c.id === selectedCategory)?.name || '';

            if (isEditMode && editId) {
                const payload: Hotel = {
                    ...formData,
                    category:  categoryName,
                    type:      selectedSubcategory,
                    latitude:  parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                };
                await updateHotel(editId, payload);
                setSuccessMessage('Service updated successfully!');
                setTimeout(() => { setAccountType('worker'); navigate('/my-business'); }, 1500);
            } else {
                const fd = new FormData();
                fd.append('userId',      uid);
                fd.append('category',    categoryName);        // ← full category name
                fd.append('type',        selectedSubcategory); // ← subcategory as type
                fd.append('name',        formData.name);
                fd.append('email',       formData.email);
                fd.append('phone',       formData.phone);
                fd.append('description', formData.description);
                fd.append('service',     formData.service);
                fd.append('priceRange',  formData.priceRange);
                fd.append('area',        formData.area);
                fd.append('city',        formData.city);
                fd.append('state',       formData.state);
                fd.append('pincode',     formData.pincode);
                fd.append('latitude',    formData.latitude);
                fd.append('longitude',   formData.longitude);
                if (formData.experience)  fd.append('experience',   formData.experience);
                if (formData.availability) fd.append('availability', formData.availability);
                selectedImages.forEach(file => fd.append('images', file, file.name));

                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/createHotelTravel`, {
                    method: 'POST', body: fd, redirect: 'follow',
                });
                const text   = await response.text();
                const result = JSON.parse(text);
                if (!response.ok || !result.success) throw new Error(result.message || `HTTP ${response.status}`);
                setSuccessMessage('Service created successfully!');
                setTimeout(() => { setAccountType('worker'); navigate('/my-business'); }, 1500);
            }
        } catch (err: any) {
            console.error('❌ Submit error:', err);
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND }} />
                    <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
                </div>
            </div>
        );
    }

    const totalImages   = selectedImages.length + existingImages.length;
    const maxImagesReached = totalImages >= 5;

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <button onClick={handleCancel} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Hotel Service' : 'Add New Hotel Service'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your hotel/travel listing' : 'Create new hotel/travel listing'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-8 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className={`p-4 bg-red-50 border border-red-200 rounded-xl ${typography.form.error}`}>
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">⚠️</span>
                            <div>
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

                {/* ─── ROW 1: Name + Category + Subcategory ─── */}
                <SectionCard>
                    {/* Business name – full width */}
                    <div>
                        <FieldLabel required>Hotel / Service Name</FieldLabel>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter hotel or service name"
                            className={inputBase}
                        />
                    </div>

                    {/* Category + Subcategory – two columns with IconSelect */}
                    <TwoCol>
                        <div>
                            <FieldLabel required>Category</FieldLabel>
                            <IconSelect
                                label="Category"
                                value={selectedCategory}
                                placeholder="Select category"
                                options={categories.map(c => ({ id: c.id, name: c.name, icon: c.icon }))}
                                onChange={(val) => {
                                    setSelectedCategory(val);
                                    setSelectedSubcategory(''); // reset when category changes
                                }}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Service Type</FieldLabel>
                            <IconSelect
                                label="Service Type"
                                value={selectedSubcategory}
                                placeholder={selectedCategory ? 'Select type' : 'Select category first'}
                                disabled={!selectedCategory || loading}
                                options={filteredSubcategories.map(s => ({
                                    name: s.name,
                                    icon: SUBCATEGORY_ICONS[s.name],
                                }))}
                                onChange={setSelectedSubcategory}
                            />
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 2: Contact ─── */}
                <SectionCard title="Contact Information">
                    <TwoCol>
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
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 3: Services + Description ─── */}
                <SectionCard title="Service Details">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Services Offered</FieldLabel>
                            <textarea
                                name="service"
                                value={formData.service}
                                onChange={handleInputChange}
                                rows={4}
                                placeholder="Room Service, Pool, Spa, Restaurant, Parking"
                                className={inputBase + ' resize-none'}
                            />
                            <p className={`${typography.misc.caption} mt-2`}>
                                💡 Enter services separated by commas
                            </p>
                            {formData.service && formData.service.trim() && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.service.split(',').map((s, i) => {
                                        const trimmed = s.trim();
                                        if (!trimmed) return null;
                                        return (
                                            <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white"
                                                style={{ backgroundColor: BRAND }}>
                                                ✓ {trimmed}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div>
                            <FieldLabel>Description</FieldLabel>
                            <textarea name="description" value={formData.description} onChange={handleInputChange}
                                rows={4} placeholder="Describe your hotel or service..."
                                className={inputBase + ' resize-none'} />
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 4: Pricing + Availability ─── */}
                <SectionCard title="Pricing & Availability">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Price Range (₹)</FieldLabel>
                            <input type="text" name="priceRange" value={formData.priceRange} onChange={handleInputChange}
                                placeholder="e.g. 1000 - 5000" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel>Experience (years)</FieldLabel>
                            <input type="number" name="experience" value={formData.experience} onChange={handleInputChange}
                                placeholder="Years of experience" min="0" className={inputBase} />
                        </div>
                    </TwoCol>
                    <TwoCol>
                        <div>
                            <FieldLabel>Availability</FieldLabel>
                            <select name="availability" value={formData.availability} onChange={handleInputChange}
                                className={inputBase + ' appearance-none'}>
                                {availabilityOptions.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-4 pt-2">
                            <span className={`${typography.body.small} font-semibold text-gray-800`}>Currently Available</span>
                            <button type="button" onClick={() => setIsCurrentlyAvailable(!isCurrentlyAvailable)}
                                className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0"
                                style={{ backgroundColor: isCurrentlyAvailable ? BRAND : '#d1d5db' }}>
                                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${isCurrentlyAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 5: Location ─── */}
                <SectionCard
                    title="Location Details"
                    action={
                        <button type="button" onClick={getCurrentLocation} disabled={locationLoading}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white
                                bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                                transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                            {locationLoading
                                ? <><span className="animate-spin mr-1">⌛</span>Detecting...</>
                                : <><MapPin className="w-4 h-4 inline mr-1" />Auto Detect</>}
                        </button>
                    }
                >
                    {locationWarning && (
                        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-3 flex items-start gap-2">
                            <span className="text-yellow-600 mt-0.5 shrink-0">⚠️</span>
                            <p className={`${typography.body.small} text-yellow-800`}>{locationWarning}</p>
                        </div>
                    )}
                    <TwoCol>
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleInputChange}
                                placeholder="e.g. Banjara Hills" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                                placeholder="e.g. Hyderabad" className={inputBase} />
                        </div>
                    </TwoCol>
                    <TwoCol>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                                placeholder="e.g. Telangana" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange}
                                placeholder="e.g. 500034" className={inputBase} />
                        </div>
                    </TwoCol>
                    <div className="rounded-xl p-3" style={{ backgroundColor: BRAND_LIGHT_BG, border: `1px solid ${BRAND_LIGHT_BORDER}` }}>
                        <p className={`${typography.body.small}`} style={{ color: BRAND }}>
                            📍 <span className="font-medium">Tip:</span> Click "Auto Detect" to fill location automatically, or enter manually above.
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

                {/* ─── ROW 6: Photos ─── */}
                <SectionCard title={`Photos (${totalImages}/5)`}>
                    <TwoCol>
                        {/* Upload zone */}
                        <label className={`block ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                                className="hidden" disabled={maxImagesReached} />
                            <div className="border-2 border-dashed rounded-2xl p-10 text-center h-full flex items-center justify-center transition"
                                style={{
                                    borderColor: maxImagesReached ? '#d1d5db' : BRAND,
                                    backgroundColor: maxImagesReached ? '#f9fafb' : BRAND_LIGHT_BG,
                                    minHeight: '180px',
                                }}>
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: 'rgba(0,89,138,0.12)' }}>
                                        <Upload className="w-8 h-8" style={{ color: BRAND }} />
                                    </div>
                                    <div>
                                        <p className={`${typography.form.input} font-medium text-gray-700`}>
                                            {maxImagesReached
                                                ? 'Maximum 5 images reached'
                                                : `Add Photos (${5 - totalImages} slots left)`}
                                        </p>
                                        <p className={`${typography.body.small} text-gray-500 mt-1`}>
                                            Max 5 images · 5 MB each · JPG, PNG, WEBP
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </label>

                        {/* Previews */}
                        {(existingImages.length > 0 || imagePreviews.length > 0) ? (
                            <div className="grid grid-cols-3 gap-3">
                                {existingImages.map((url, i) => (
                                    <div key={`ex-${i}`} className="relative aspect-square group">
                                        <img src={url} alt={`Saved ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2 border-gray-200" />
                                        <button type="button" onClick={() => handleRemoveExistingImage(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-2 left-2 text-white text-xs px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: BRAND }}>Saved</span>
                                    </div>
                                ))}
                                {imagePreviews.map((preview, i) => (
                                    <div key={`new-${i}`} className="relative aspect-square group">
                                        <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover rounded-xl border-2"
                                            style={{ borderColor: BRAND }} />
                                        <button type="button" onClick={() => handleRemoveNewImage(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                                        <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                                            {(selectedImages[i]?.size / 1024 / 1024).toFixed(1)}MB
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl text-center"
                                style={{ minHeight: '180px' }}>
                                <p className={`${typography.body.small} text-gray-400`}>Uploaded images will appear here</p>
                            </div>
                        )}
                    </TwoCol>
                </SectionCard>

                {/* ── Action Buttons ── */}
                <div className="flex gap-4 pt-2 pb-8 justify-end">
                    <button onClick={handleCancel} type="button" disabled={loading}
                        className={`px-10 py-3.5 rounded-xl font-semibold
                            text-[#00598a] bg-white border-2 border-[#00598a]
                            hover:bg-[#00598a] hover:text-white
                            active:bg-[#004a73] active:text-white
                            transition-all ${typography.body.base}
                            ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading} type="button"
                        className={`px-10 py-3.5 rounded-xl font-semibold text-white
                            transition-all shadow-md hover:shadow-lg
                            bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                            ${typography.body.base}
                            ${loading ? 'cursor-not-allowed opacity-70' : ''}`}>
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : (
                            isEditMode ? 'Update Service' : 'Create Service'
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HotelForm;