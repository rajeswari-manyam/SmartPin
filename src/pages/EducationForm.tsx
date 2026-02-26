import React, { useEffect, useRef, useState } from 'react';
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
import { useAccount } from "../context/AccountContext";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from "../assets/subcategoryIcons";

const chargeTypeOptions = ['Per Hour', 'Per Day', 'Per Month', 'Per Session', 'Per Course'];

// ── Get education subcategories with icons ────────────────────────────────────
const getEducationSubcategories = () => {
    const educationCategory = subcategoriesData.subcategories.find((cat: any) => cat.categoryId === 8);
    return educationCategory ? educationCategory.items.map((item: any) => item.name) : [];
};

// ── Shared input styles ───────────────────────────────────────────────────────
const BRAND = '#00598a';

const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:outline-none focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

const inputError =
    `w-full px-4 py-3 border border-red-400 rounded-xl ` +
    `focus:ring-2 focus:ring-red-400 focus:border-red-400 ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `${typography.form.input} bg-white`;

const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat' as const,
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '2.5rem',
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} text-gray-800 mb-2`}>
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

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
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
// FIELD ERRORS
// ============================================================================
interface FieldErrors {
    name?: string;
    phone?: string;
    email?: string;
    subjects?: string;
    experience?: string;
    charges?: string;
    area?: string;
    city?: string;
    state?: string;
    pincode?: string;
    location?: string;
}

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
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

    const educationTypes = getEducationSubcategories();
    
    // ── Prepare subcategory options with icons ───────────────────────────────
    const subcategoryOptions = educationTypes.map((name: string) => ({
        name,
        icon: SUBCATEGORY_ICONS[name],
    }));
    
    const defaultType = getSubcategoryFromUrl() || educationTypes[0] || 'Schools';
    const { setAccountType } = useAccount();

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
    const [locationWarning, setLocationWarning] = useState('');
    const isGPSDetected = useRef(false);

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
        if (fieldErrors[name as keyof FieldErrors]) {
            setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubjectsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setSubjectsInput(value);
        setFormData(prev => ({ ...prev, subjects: value.split(',').map(s => s.trim()).filter(Boolean) }));
        if (fieldErrors.subjects) {
            setFieldErrors(prev => ({ ...prev, subjects: undefined }));
        }
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
        setLocationWarning('');
        setFieldErrors(prev => ({ ...prev, location: undefined }));
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
        setError('');
        setSuccessMessage('');
        
        const errors: FieldErrors = {};
        if (!formData.name.trim()) errors.name = 'Institution/Teacher name is required';
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
            errors.phone = 'Enter a valid 10-digit Indian mobile number';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Enter a valid email address';
        }
        if (formData.subjects.length === 0) errors.subjects = 'Please enter at least one subject';
        if (!formData.experience.trim()) errors.experience = 'Experience is required';
        if (!formData.charges.trim()) errors.charges = 'Charges are required';
        if (!formData.area.trim()) errors.area = 'Area is required';
        if (!formData.city.trim()) errors.city = 'City is required';
        if (!formData.state.trim()) errors.state = 'State is required';
        if (!formData.pincode.trim()) errors.pincode = 'PIN code is required';
        if (!formData.latitude || !formData.longitude) errors.location = 'Please provide a valid location';

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setError('Please fix the errors below before submitting');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setLoading(true);
        try {
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND }} />
                    <p className={`${typography.body.base} text-gray-600`}>Loading...</p>
                </div>
            </div>
        );
    }

    // ============================================================================
    // RENDER
    // ============================================================================
    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Sticky Header ── */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <button
                        onClick={handleCancel}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition"
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
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-2">
                            <span className="text-red-600 mt-0.5">⚠️</span>
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 mb-1">Please fix the following</p>
                                <p className={`${typography.form.error} text-red-700`}>{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <span className="text-green-600 text-lg">✓</span>
                        <p className={`${typography.body.small} text-green-700 font-medium`}>{successMessage}</p>
                    </div>
                )}

                {/* ─── ROW 1: NAME + CATEGORY ─── */}
                <SectionCard>
                    <TwoCol>
                        <div>
                            <FieldLabel required>Institution / Teacher Name</FieldLabel>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Enter name"
                                className={fieldErrors.name ? inputError : inputBase}
                            />
                            {fieldErrors.name && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.name}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Category</FieldLabel>
                            <IconSelect
                                label=""
                                value={formData.type}
                                placeholder="Select category"
                                options={subcategoryOptions}
                                onChange={(val) =>
                                    setFormData(prev => ({ ...prev, type: val }))
                                }
                                disabled={loading}
                            />
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
                                maxLength={10}
                                className={fieldErrors.phone ? inputError : inputBase}
                            />
                            {fieldErrors.phone && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.phone}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Email</FieldLabel>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email address"
                                className={fieldErrors.email ? inputError : inputBase}
                            />
                            {fieldErrors.email && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.email}
                                </p>
                            )}
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 3: TEACHING DETAILS ─── */}
                <SectionCard title="Teaching Details">
                    <TwoCol>
                        {/* Subjects */}
                        <div>
                            <FieldLabel required>Subjects Taught</FieldLabel>
                            <textarea
                                value={subjectsInput}
                                onChange={handleSubjectsChange}
                                rows={3}
                                placeholder="Mathematics, Physics, Chemistry, English"
                                className={(fieldErrors.subjects ? inputError : inputBase) + ' resize-none'}
                            />
                            {fieldErrors.subjects && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.subjects}
                                </p>
                            )}
                            <p className={`${typography.misc.caption} mt-2 text-gray-500`}>
                                💡 Enter subjects separated by commas
                            </p>
                            {formData.subjects.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.subjects.map((subject, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                                            style={{ backgroundColor: '#e8f2f8', color: '#00598a' }}
                                        >
                                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Qualifications */}
                        <div>
                            <FieldLabel>Qualifications</FieldLabel>
                            <textarea
                                value={qualificationsInput}
                                onChange={handleQualificationsChange}
                                rows={3}
                                placeholder="B.Ed, M.Sc, Ph.D"
                                className={inputBase + ' resize-none'}
                            />
                            <p className={`${typography.misc.caption} mt-2 text-gray-500`}>
                                💡 Enter qualifications separated by commas
                            </p>
                            {formData.qualifications.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {formData.qualifications.map((qual, i) => (
                                        <span
                                            key={i}
                                            className="inline-flex items-center bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-xs"
                                        >
                                            🎓 {qual}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 4: PROFESSIONAL DETAILS ─── */}
                <SectionCard title="Professional Details">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Experience (years)</FieldLabel>
                            <input
                                type="number"
                                name="experience"
                                value={formData.experience}
                                onChange={handleInputChange}
                                placeholder="Years of experience"
                                min="0"
                                className={fieldErrors.experience ? inputError : inputBase}
                            />
                            {fieldErrors.experience && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.experience}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Charges (₹)</FieldLabel>
                            <input
                                type="number"
                                name="charges"
                                value={formData.charges}
                                onChange={handleInputChange}
                                placeholder="Amount"
                                min="0"
                                className={fieldErrors.charges ? inputError : inputBase}
                            />
                            {fieldErrors.charges && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.charges}
                                </p>
                            )}
                        </div>
                    </TwoCol>
                    <TwoCol>
                        <div>
                            <FieldLabel required>Charge Type</FieldLabel>
                            <select
                                name="chargeType"
                                value={formData.chargeType}
                                onChange={handleInputChange}
                                className={inputBase + ' appearance-none bg-white'}
                                style={selectStyle}
                            >
                                {chargeTypeOptions.map((t: string) => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        {/* Empty right column for balance */}
                        <div />
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 5: DESCRIPTION ─── */}
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

                {/* ─── ROW 6: LOCATION ─── */}
                <SectionCard
                    title="Location Details"
                    action={
                        <button
                            type="button"
                            onClick={getCurrentLocation}
                            disabled={locationLoading}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                            style={{ backgroundColor: BRAND }}
                        >
                            {locationLoading
                                ? <><span className="animate-spin text-sm">⌛</span> Detecting...</>
                                : <><MapPin className="w-4 h-4" /> Auto Detect</>
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

                    <TwoCol>
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input 
                                type="text" 
                                name="area" 
                                value={formData.area} 
                                onChange={handleInputChange} 
                                placeholder="Area name" 
                                className={fieldErrors.area ? inputError : inputBase} 
                            />
                            {fieldErrors.area && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.area}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input 
                                type="text" 
                                name="city" 
                                value={formData.city} 
                                onChange={handleInputChange} 
                                placeholder="City" 
                                className={fieldErrors.city ? inputError : inputBase} 
                            />
                            {fieldErrors.city && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.city}
                                </p>
                            )}
                        </div>
                    </TwoCol>
                    <TwoCol>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input 
                                type="text" 
                                name="state" 
                                value={formData.state} 
                                onChange={handleInputChange} 
                                placeholder="State" 
                                className={fieldErrors.state ? inputError : inputBase} 
                            />
                            {fieldErrors.state && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.state}
                                </p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input 
                                type="text" 
                                name="pincode" 
                                value={formData.pincode} 
                                onChange={handleInputChange} 
                                placeholder="PIN code" 
                                maxLength={6}
                                className={fieldErrors.pincode ? inputError : inputBase} 
                            />
                            {fieldErrors.pincode && (
                                <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                                    <span>⚠️</span> {fieldErrors.pincode}
                                </p>
                            )}
                        </div>
                    </TwoCol>

                    {/* Location error */}
                    {fieldErrors.location && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                            <p className="text-sm text-red-700 flex items-center gap-1.5">
                                <span>⚠️</span> {fieldErrors.location}
                            </p>
                        </div>
                    )}

                    {!formData.latitude && !formData.longitude && (
                        <div className="rounded-xl p-3 bg-amber-50 border border-amber-200">
                            <p className={`${typography.body.small} text-amber-800`}>
                                💡 <span className="font-medium">Tip:</span> Use auto-detect to fill location automatically from your device GPS.
                            </p>
                        </div>
                    )}

                    {formData.latitude && formData.longitude && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                            <p className={`${typography.body.small} text-green-800`}>
                                <span className="font-semibold">✓ Location set: </span>
                                <span className="font-mono text-xs ml-1">
                                    {parseFloat(formData.latitude).toFixed(6)}, {parseFloat(formData.longitude).toFixed(6)}
                                </span>
                            </p>
                        </div>
                    )}
                </SectionCard>

                {/* ─── ROW 7: PORTFOLIO PHOTOS ─── */}
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
                        <div
                            className={`border-2 border-dashed rounded-2xl p-8 text-center transition ${maxImagesReached
                                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                : 'hover:opacity-90 cursor-pointer'}`}
                            style={maxImagesReached ? {} : { borderColor: '#00598a', backgroundColor: '#f0f7fb' }}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0eff7' }}>
                                    <Upload className="w-8 h-8" style={{ color: BRAND }} />
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
                                        <p className="text-sm font-medium mt-1" style={{ color: '#00598a' }}>
                                            {selectedImages.length} new image{selectedImages.length > 1 ? 's' : ''} selected ✓
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || selectedImages.length > 0) && (
                        <div className="grid grid-cols-3 gap-3 mt-4">
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
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <span 
                                            className={`absolute bottom-2 left-2 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}
                                            style={{ backgroundColor: BRAND }}
                                        >
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
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-2 left-2 bg-green-600 text-white ${typography.fontSize.xs} px-2 py-0.5 rounded-full`}>
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
                        disabled={loading || !!successMessage}
                        type="button"
                        className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg ${typography.body.base} ${loading || successMessage ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
                        style={{ backgroundColor: BRAND }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="animate-spin">⏳</span>
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : successMessage ? (
                            <span className="flex items-center justify-center gap-2"><span>✓</span> Done</span>
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

export default EducationForm;