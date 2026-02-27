import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addRealEstateService, updateRealEstateService, getRealEstateServiceById } from "../services/RealEstate.service";
import typography from "../styles/typography";
import { X, Upload, MapPin } from 'lucide-react';
import { useAccount } from "../context/AccountContext";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

// ── Options ──────────────────────────────────────────────────────────────────
const categoryOptions = [
    { name: 'Residential',  icon: SUBCATEGORY_ICONS['Property Dealers']         },
    { name: 'Commercial',   icon: SUBCATEGORY_ICONS['Builders Developers']       },
    { name: 'Industrial',   icon: SUBCATEGORY_ICONS['Construction Contractors']  },
    { name: 'Agricultural', icon: SUBCATEGORY_ICONS['Interior Designers']        },
];

const subCategoryMap: Record<string, { name: string; icon: any }[]> = {
    Residential: [
        { name: 'Apartment',          icon: SUBCATEGORY_ICONS['Property Dealers']        },
        { name: 'Villa',              icon: SUBCATEGORY_ICONS['Rent Lease Listings']      },
        { name: 'Independent House',  icon: SUBCATEGORY_ICONS['Builders Developers']      },
        { name: 'Plot',               icon: SUBCATEGORY_ICONS['Construction Contractors'] },
        { name: 'Studio',             icon: SUBCATEGORY_ICONS['Interior Designers']       },
    ],
    Commercial: [
        { name: 'Office Space', icon: SUBCATEGORY_ICONS['Property Dealers']        },
        { name: 'Retail Shop',  icon: SUBCATEGORY_ICONS['Rent Lease Listings']      },
        { name: 'Warehouse',    icon: SUBCATEGORY_ICONS['Builders Developers']      },
        { name: 'Showroom',     icon: SUBCATEGORY_ICONS['Construction Contractors'] },
    ],
    Industrial: [
        { name: 'Factory',        icon: SUBCATEGORY_ICONS['Property Dealers']   },
        { name: 'Industrial Plot', icon: SUBCATEGORY_ICONS['Builders Developers'] },
    ],
    Agricultural: [
        { name: 'Farmland',   icon: SUBCATEGORY_ICONS['Property Dealers']      },
        { name: 'Farm House', icon: SUBCATEGORY_ICONS['Rent Lease Listings']   },
    ],
};

const propertyTypeOptions = [
    { name: 'Apartment',         icon: SUBCATEGORY_ICONS['Property Dealers']        },
    { name: 'Villa',             icon: SUBCATEGORY_ICONS['Rent Lease Listings']      },
    { name: 'Independent House', icon: SUBCATEGORY_ICONS['Builders Developers']      },
    { name: 'Plot',              icon: SUBCATEGORY_ICONS['Construction Contractors'] },
    { name: 'Commercial',        icon: SUBCATEGORY_ICONS['Interior Designers']       },
    { name: 'Office Space',      icon: SUBCATEGORY_ICONS['Interior Designers']       },
];

const listingTypeOptions = [
    { name: 'Rent',  icon: SUBCATEGORY_ICONS['Rent Lease Listings'] },
    { name: 'Sale',  icon: SUBCATEGORY_ICONS['Property Dealers']    },
    { name: 'Lease', icon: SUBCATEGORY_ICONS['Builders Developers'] },
];

const furnishingStatusOptions  = ['Fully-Furnished', 'Semi-Furnished', 'Unfurnished'];
const availabilityStatusOptions = ['Available', 'Sold', 'Rented', 'Under Construction'];

// ============================================================================
// SHARED INPUT CLASSES
// ============================================================================
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
};

// ── Reusable components ───────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
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

// ── Helpers ───────────────────────────────────────────────────────────────────
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
const RealEstateForm = () => {
    const navigate = useNavigate();
    const { setAccountType } = useAccount();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [locationWarning, setLocationWarning] = useState('');
    const [locationLoading, setLocationLoading] = useState(false);

    const [formData, setFormData] = useState({
        userId: resolveUserId(),
        category: categoryOptions[0].name,
        subCategory: subCategoryMap[categoryOptions[0].name][0].name,
        name: '',
        propertyType: propertyTypeOptions[0].name,
        listingType: listingTypeOptions[0].name,
        email: '',
        phone: '',
        price: '',
        areaSize: '',
        bedrooms: '',
        bathrooms: '',
        furnishingStatus: furnishingStatusOptions[0],
        availabilityStatus: availabilityStatusOptions[0],
        address: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        amenities: '',
        description: '',
    });

    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const isGPSDetected = useRef(false);

    // Derived sub-category options based on selected category
    const currentSubCategoryOptions = subCategoryMap[formData.category] || [];

    // ── Fetch for edit ───────────────────────────────────────────────────────
    useEffect(() => {
        if (!editId) return;
        const fetchData = async () => {
            setLoadingData(true);
            try {
                const response = await getRealEstateServiceById(editId);
                if (!response.success || !response.data) throw new Error('Service not found');
                const data = Array.isArray(response.data) ? response.data[0] : response.data;
                if (!data) throw new Error('Service not found');
                const cat = data.category || categoryOptions[0].name;
                setFormData(prev => ({
                    ...prev,
                    userId: data.userId || prev.userId,
                    category: cat,
                    subCategory: data.subCategory || (subCategoryMap[cat]?.[0]?.name ?? ''),
                    name: data.name || '',
                    propertyType: data.propertyType || propertyTypeOptions[0].name,
                    listingType: data.listingType || listingTypeOptions[0].name,
                    email: data.email || '',
                    phone: data.phone || '',
                    price: data.price?.toString() || '',
                    areaSize: data.areaSize?.toString() || '',
                    bedrooms: data.bedrooms?.toString() || '',
                    bathrooms: data.bathrooms?.toString() || '',
                    furnishingStatus: data.furnishingStatus || furnishingStatusOptions[0],
                    availabilityStatus: data.availabilityStatus || availabilityStatusOptions[0],
                    address: data.address || '',
                    area: data.area || '',
                    city: data.city || '',
                    state: data.state || '',
                    pincode: data.pincode || '',
                    latitude: data.latitude?.toString() || '',
                    longitude: data.longitude?.toString() || '',
                    amenities: data.amenities || '',
                    description: data.description || '',
                }));
                if (data.images && Array.isArray(data.images)) setExistingImages(data.images);
            } catch (err) {
                console.error(err);
                setError('Failed to load service data');
            } finally { setLoadingData(false); }
        };
        fetchData();
    }, [editId]);

    // ── Auto-geocode ─────────────────────────────────────────────────────────
    useEffect(() => {
        const detect = async () => {
            if (isGPSDetected.current) { isGPSDetected.current = false; return; }
            if (formData.area && !formData.latitude && !formData.longitude) {
                const addr = [formData.address, formData.area, formData.city, formData.state, formData.pincode]
                    .filter(Boolean).join(', ');
                const coords = await geocodeAddress(addr);
                if (coords) setFormData(prev => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lng.toString() }));
            }
        };
        const t = setTimeout(detect, 1000);
        return () => clearTimeout(t);
    }, [formData.address, formData.area, formData.city, formData.state, formData.pincode]);

    // ── When category changes, reset subCategory to first option ────────────
    const handleCategoryChange = (val: string) => {
        const firstSub = subCategoryMap[val]?.[0]?.name ?? '';
        setFormData(prev => ({ ...prev, category: val, subCategory: firstSub }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ── Image helpers ────────────────────────────────────────────────────────
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;
        const remainingExisting = existingImages.filter(img => !imagesToDelete.includes(img)).length;
        const slots = 5 - (remainingExisting + selectedImages.length);
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
    const handleRemoveExistingImage = (url: string) => setImagesToDelete(p => [...p, url]);
    const handleRestoreExistingImage = (url: string) => setImagesToDelete(p => p.filter(u => u !== url));

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
                            address: data.address.house_number
                                ? `${data.address.house_number} ${data.address.road || ''}`.trim()
                                : data.address.road || prev.address,
                            area: data.address.suburb || data.address.neighbourhood || prev.area,
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
            if (!formData.name || !formData.phone || !formData.email)
                throw new Error('Please fill in all required fields (Name, Phone, Email)');
            if (!formData.price || !formData.areaSize)
                throw new Error('Please enter price and area size');
            if (!formData.latitude || !formData.longitude)
                throw new Error('Please provide a valid location');

            const fd = new FormData();
            fd.append('userId', uid);
            fd.append('category', formData.category);
            fd.append('subCategory', formData.subCategory);
            fd.append('name', formData.name);
            fd.append('propertyType', formData.propertyType);
            fd.append('listingType', formData.listingType);
            fd.append('email', formData.email);
            fd.append('phone', formData.phone);
            fd.append('price', formData.price);
            fd.append('areaSize', formData.areaSize);
            fd.append('bedrooms', formData.bedrooms);
            fd.append('bathrooms', formData.bathrooms);
            fd.append('furnishingStatus', formData.furnishingStatus);
            fd.append('availabilityStatus', formData.availabilityStatus);
            fd.append('address', formData.address);
            fd.append('area', formData.area);
            fd.append('city', formData.city);
            fd.append('state', formData.state);
            fd.append('pincode', formData.pincode);
            fd.append('latitude', formData.latitude);
            fd.append('longitude', formData.longitude);
            fd.append('amenities', formData.amenities);
            fd.append('description', formData.description);
            selectedImages.forEach(f => fd.append('images', f, f.name));

            if (isEditMode) {
                const remainingExisting = existingImages.filter(url => !imagesToDelete.includes(url));
                if (remainingExisting.length > 0) fd.append('existingImages', JSON.stringify(remainingExisting));
                if (imagesToDelete.length > 0) fd.append('imagesToDelete', JSON.stringify(imagesToDelete));
            }

            if (isEditMode && editId) {
                const res = await updateRealEstateService(editId, fd);
                if (!res.success) throw new Error(res.message || 'Failed to update property');
                setSuccessMessage('Property updated successfully!');
            } else {
                const res = await addRealEstateService(fd);
                if (!res.success) throw new Error(res.message || 'Failed to list property');
                setSuccessMessage('Property listed successfully!');
            }

            setTimeout(() => {
                setAccountType("worker");
                navigate("/my-business");
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally { setLoading(false); }
    };

    const handleCancel = () => window.history.back();

    const remainingExistingCount = existingImages.filter(url => !imagesToDelete.includes(url)).length;
    const totalImagesCount = remainingExistingCount + selectedImages.length;
    const maxImagesReached = totalImagesCount >= 5;

    if (loadingData) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#00598a' }} />
                <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
            </div>
        </div>
    );

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
                        <h1 className={`${typography.heading.h5} text-gray-900`}>
                            {isEditMode ? 'Update Property' : 'List New Property'}
                        </h1>
                        <p className={`${typography.body.small} text-gray-500`}>
                            {isEditMode ? 'Update your property listing' : 'Create new property listing'}
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

                {/* ─── 1. BASIC INFO ─── */}
                <SectionCard title="Basic Information">
                    {/* Row 1: Owner Name */}
                    <div>
                        <FieldLabel required>Owner / Agent Name</FieldLabel>
                        <input
                            type="text" name="name" value={formData.name}
                            onChange={handleInputChange} placeholder="Enter name"
                            className={inputBase}
                        />
                    </div>

                    {/* Row 2: Category + Sub-Category */}
                    <TwoCol>
                        <div>
                            <FieldLabel required>Category</FieldLabel>
                            <IconSelect
                                label="Category"
                                value={formData.category}
                                placeholder="Select category"
                                options={categoryOptions}
                                onChange={handleCategoryChange}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Sub-Category</FieldLabel>
                            <IconSelect
                                label="Sub-Category"
                                value={formData.subCategory}
                                placeholder="Select sub-category"
                                options={currentSubCategoryOptions}
                                onChange={(val) => setFormData(prev => ({ ...prev, subCategory: val }))}
                            />
                        </div>
                    </TwoCol>

                    {/* Row 3: Property Type + Listing Type */}
                    <TwoCol>
                        <div>
                            <FieldLabel required>Property Type</FieldLabel>
                            <IconSelect
                                label="Property Type"
                                value={formData.propertyType}
                                placeholder="Select property type"
                                options={propertyTypeOptions}
                                onChange={(val) => setFormData(prev => ({ ...prev, propertyType: val }))}
                            />
                        </div>
                        <div>
                            <FieldLabel required>Listing Type</FieldLabel>
                            <IconSelect
                                label="Listing Type"
                                value={formData.listingType}
                                placeholder="Select listing type"
                                options={listingTypeOptions}
                                onChange={(val) => setFormData(prev => ({ ...prev, listingType: val }))}
                            />
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── 2. CONTACT ─── */}
                <SectionCard title="Contact Information">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Phone</FieldLabel>
                            <input type="tel" name="phone" value={formData.phone}
                                onChange={handleInputChange} placeholder="Enter phone number" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>Email</FieldLabel>
                            <input type="email" name="email" value={formData.email}
                                onChange={handleInputChange} placeholder="Enter email address" className={inputBase} />
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── 3. PROPERTY DETAILS ─── */}
                <SectionCard title="Property Details">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Price (₹)</FieldLabel>
                            <input type="number" name="price" value={formData.price}
                                onChange={handleInputChange} placeholder="15000" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel required>Area Size (sq ft)</FieldLabel>
                            <input type="number" name="areaSize" value={formData.areaSize}
                                onChange={handleInputChange} placeholder="1200" className={inputBase} />
                        </div>
                    </TwoCol>
                    <TwoCol>
                        <div>
                            <FieldLabel>Bedrooms</FieldLabel>
                            <input type="number" name="bedrooms" value={formData.bedrooms}
                                onChange={handleInputChange} placeholder="2" className={inputBase} />
                        </div>
                        <div>
                            <FieldLabel>Bathrooms</FieldLabel>
                            <input type="number" name="bathrooms" value={formData.bathrooms}
                                onChange={handleInputChange} placeholder="2" className={inputBase} />
                        </div>
                    </TwoCol>
                    <TwoCol>
                        <div>
                            <FieldLabel>Furnishing Status</FieldLabel>
                            <select name="furnishingStatus" value={formData.furnishingStatus}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'} style={selectStyle}>
                                {furnishingStatusOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <FieldLabel>Availability Status</FieldLabel>
                            <select name="availabilityStatus" value={formData.availabilityStatus}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'} style={selectStyle}>
                                {availabilityStatusOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                    </TwoCol>
                    <TwoCol>
                        <div>
                            <FieldLabel>Amenities</FieldLabel>
                            <input type="text" name="amenities" value={formData.amenities}
                                onChange={handleInputChange} placeholder="Parking, Lift, Power Backup" className={inputBase} />
                            <p className={`${typography.misc.caption} mt-2`}>💡 Separate with commas</p>
                        </div>
                        <div />
                    </TwoCol>
                </SectionCard>

                {/* ─── 4. DESCRIPTION ─── */}
                <SectionCard title="Property Description">
                    <div>
                        <FieldLabel>Description</FieldLabel>
                        <textarea name="description" value={formData.description}
                            onChange={handleInputChange} rows={4}
                            placeholder="2BHK flat near metro station, prime location..."
                            className={inputBase + ' resize-none'} />
                    </div>
                </SectionCard>

                {/* ─── 5. LOCATION ─── */}
                <SectionCard
                    title="Service Location"
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

                    <div>
                        <FieldLabel required>Address</FieldLabel>
                        <input type="text" name="address" value={formData.address}
                            onChange={handleInputChange} placeholder="Flat No, Building Name" className={inputBase} />
                    </div>

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

                    <div className="rounded-xl p-3" style={{ backgroundColor: '#fff8ee', border: '1px solid #f0c070' }}>
                        <p className={`${typography.body.small}`} style={{ color: '#7a4f00' }}>
                            📍 <span className="font-medium">Tip:</span> Click "Auto Detect" to get your current location, or enter your address manually.
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

                {/* ─── 6. PHOTOS ─── */}
                <SectionCard title={`Property Photos (${totalImagesCount}/5)`}>
                    <TwoCol>
                        {/* Upload zone */}
                        <label className={`block ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                                className="hidden" disabled={maxImagesReached} />
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
                                            Upload photos of the property
                                        </p>
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
                                            <img src={url} alt={`Saved ${i + 1}`}
                                                className="w-full h-full object-cover rounded-xl border-2 border-gray-200"
                                                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Image+Error'; }} />
                                            <button type="button" onClick={() => handleRemoveExistingImage(url)}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                                <X className="w-4 h-4" />
                                            </button>
                                            <span className="absolute bottom-2 left-2 text-white text-xs px-2 py-0.5 rounded-full"
                                                style={{ backgroundColor: '#00598a' }}>Saved</span>
                                        </div>
                                    ))}
                                {selectedImages.map((file, i) => (
                                    <div key={`new-${i}`} className="relative aspect-square group">
                                        <img src={imagePreviews[i]} alt={`Preview ${i + 1}`}
                                            className="w-full h-full object-cover rounded-xl border-2"
                                            style={{ borderColor: '#00598a' }} />
                                        <button type="button" onClick={() => handleRemoveNewImage(i)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span className="absolute bottom-2 left-2 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                                        <span className="absolute top-2 right-2 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                                            {(file.size / 1024 / 1024).toFixed(1)}MB
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

                    {/* Deleted images — undo section */}
                    {imagesToDelete.length > 0 && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                            <p className={`${typography.body.small} text-red-700 mb-2`}>
                                Images marked for deletion ({imagesToDelete.length}):
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {imagesToDelete.map((url, i) => (
                                    <button key={`del-${i}`} onClick={() => handleRestoreExistingImage(url)}
                                        className="inline-flex items-center gap-1 text-xs bg-white border border-red-300 text-red-600 px-2 py-1 rounded hover:bg-red-50">
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
                        disabled={loading || !!successMessage}
                        type="button"
                        className={`px-10 py-3.5 rounded-xl font-semibold text-white
                            transition-all shadow-md hover:shadow-lg
                            bg-[#00598a] hover:bg-[#004a73] active:bg-[#003d5c]
                            ${typography.body.base}
                            ${loading || !!successMessage ? 'cursor-not-allowed opacity-70' : ''}`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isEditMode ? 'Updating...' : 'Listing...'}
                            </span>
                        ) : successMessage
                            ? '✓ Done'
                            : isEditMode ? 'Update Property' : 'List Property'
                        }
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RealEstateForm;