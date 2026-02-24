import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    createHospital,
    updateHospital,
    getHospitalById,
    CreateHospitalPayload,
} from '../services/HospitalService.service';
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, MapPin, Plus, ChevronDown } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { typography } from '../styles/typography';

const BRAND = '#00598a';

const COMMON_DEPARTMENTS = [
    'Cardiology','Orthopaedics','Neurology','Dermatology',
    'Pediatrics','Gynecology','Oncology','ENT','Ophthalmology',
    'Psychiatry','Urology','Nephrology','Gastroenterology',
    'Pulmonology','Endocrinology','General Surgery','ICU','Emergency',
];

const getHospitalSubcategories = (): string[] => {
    const cat = (subcategoriesData as any).subcategories.find((c: any) => c.categoryId === 2);
    return cat ? cat.items.map((i: any) => i.name) : ['Hospitals'];
};

const inputCls =
    'w-full px-4 py-3.5 border border-gray-200 rounded-xl text-base text-gray-800 ' +
    'placeholder-gray-400 bg-white focus:outline-none focus:border-[#00598a] ' +
    'focus:ring-1 focus:ring-[#00598a] transition-all';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>{children}</div>
);

const CardTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
    <div className="flex items-center justify-between mb-4">
        <h3 className={`${typography.heading.h6} text-gray-900`}>{title}</h3>
        {action}
    </div>
);

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className={`block ${typography.form.label} font-semibold text-gray-700 mb-2`}>
        {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
);

const HospitalForm: React.FC = () => {
    const navigate = useNavigate();
    const { setAccountType } = useAccount();

    const getIdFromUrl = () => new URLSearchParams(window.location.search).get('id');
    const getSubFromUrl = () => {
        const s = new URLSearchParams(window.location.search).get('subcategory');
        return s ? s.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : null;
    };

    const [editId] = useState<string | null>(getIdFromUrl());
    const isEditMode = !!editId;
    const hospitalTypes = getHospitalSubcategories();
    const defaultType = getSubFromUrl() || hospitalTypes[0] || 'Hospitals';

    const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        hospitalName: '',
        hospitalType: defaultType,
        phone: '',
        area: '',
        city: '',
        state: '',
        pincode: '',
        latitude: '',
        longitude: '',
        description: '',
    });

    const [deptDropdown, setDeptDropdown] = useState('');
    const [deptCustom, setDeptCustom] = useState('');
    const [departmentsList, setDepartmentsList] = useState<string[]>([]);
    const [serviceInput, setServiceInput] = useState('');
    const [servicesList, setServicesList] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [existingImages, setExistingImages] = useState<string[]>([]);
    const [locationLoading, setLocationLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (!editId) return;
        const load = async () => {
            setLoadingData(true);
            try {
                const res = await getHospitalById(editId);
                if (!res.success || !res.data) throw new Error('Not found');
                const d = res.data;
                setFormData(prev => ({
                    ...prev,
                    hospitalName: d.hospitalName || '',
                    hospitalType: d.hospitalType || defaultType,
                    phone: (d as any).phone || '',
                    area: d.area || '',
                    city: d.city || '',
                    state: d.state || '',
                    pincode: d.pincode || '',
                    latitude: d.latitude?.toString() || '',
                    longitude: d.longitude?.toString() || '',
                    description: (d as any).description || '',
                }));
                if (d.departments) {
                    const arr = Array.isArray(d.departments)
                        ? d.departments as string[]
                        : (d.departments as string).split(',').map((s: string) => s.trim()).filter(Boolean);
                    setDepartmentsList(arr);
                }
                if (d.services) {
                    const arr = Array.isArray(d.services)
                        ? d.services as string[]
                        : (d.services as string).split(',').map((s: string) => s.trim()).filter(Boolean);
                    setServicesList(arr);
                }
                if (Array.isArray(d.images)) setExistingImages(d.images);
            } catch { setError('Failed to load hospital data'); }
            finally { setLoadingData(false); }
        };
        load();
    }, [editId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addDeptFromDropdown = (val: string) => {
        if (!val || departmentsList.includes(val)) { setDeptDropdown(''); return; }
        setDepartmentsList(prev => [...prev, val]);
        setDeptDropdown('');
    };
    const addCustomDept = () => {
        const t = deptCustom.trim();
        if (!t || departmentsList.includes(t)) return;
        setDepartmentsList(prev => [...prev, t]);
        setDeptCustom('');
    };
    const removeDept = (i: number) => setDepartmentsList(prev => prev.filter((_, idx) => idx !== i));

    const addService = () => {
        const t = serviceInput.trim();
        if (!t || servicesList.includes(t)) return;
        setServicesList(prev => [...prev, t]);
        setServiceInput('');
    };
    const removeService = (i: number) => setServicesList(prev => prev.filter((_, idx) => idx !== i));

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const slots = 5 - (selectedImages.length + existingImages.length);
        if (slots <= 0) { setError('Maximum 5 images allowed'); return; }
        const valid = files.slice(0, slots).filter(f => {
            if (!f.type.startsWith('image/')) { setError(`${f.name} is not a valid image`); return false; }
            if (f.size > 5 * 1024 * 1024) { setError(`${f.name} exceeds 5 MB`); return false; }
            return true;
        });
        if (!valid.length) return;
        const previews: string[] = [];
        valid.forEach(f => {
            const r = new FileReader();
            r.onloadend = () => {
                previews.push(r.result as string);
                if (previews.length === valid.length) setImagePreviews(prev => [...prev, ...previews]);
            };
            r.readAsDataURL(f);
        });
        setSelectedImages(prev => [...prev, ...valid]);
        setError('');
    };

    const getCurrentLocation = () => {
        setLocationLoading(true); setError('');
        if (!navigator.geolocation) { setError('Geolocation not supported'); setLocationLoading(false); return; }
        navigator.geolocation.getCurrentPosition(
            async pos => {
                const lat = pos.coords.latitude.toString();
                const lng = pos.coords.longitude.toString();
                setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
                    const d = await res.json();
                    if (d.address) {
                        setFormData(prev => ({
                            ...prev,
                            area: d.address.suburb || d.address.neighbourhood || d.address.road || prev.area,
                            city: d.address.city || d.address.town || d.address.village || prev.city,
                            state: d.address.state || prev.state,
                            pincode: d.address.postcode || prev.pincode,
                        }));
                    }
                } catch { }
                setLocationLoading(false);
            },
            err => { setError(`Location error: ${err.message}`); setLocationLoading(false); },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleSubmit = async () => {
        setError(''); setSuccessMessage('');
        if (!formData.hospitalName.trim()) { setError('Hospital/Clinic name is required.'); return; }
        if (!formData.phone.trim()) { setError('Phone number is required.'); return; }
        if (!/^[0-9+\-\s]{7,15}$/.test(formData.phone.trim())) { setError('Please enter a valid phone number.'); return; }
        if (!departmentsList.length) { setError('Please add at least one department.'); return; }
        if (!servicesList.length) { setError('Please add at least one service.'); return; }
        if (!formData.area.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
            setError('Please fill in all location fields.'); return;
        }
        if (!/^\d{6}$/.test(formData.pincode.trim())) { setError('PIN code must be exactly 6 digits.'); return; }
        if (!formData.latitude || !formData.longitude) { setError('Please detect your location.'); return; }

        const deptString = departmentsList.join(',');
        const servicesString = servicesList.join(',');
        setLoading(true);
        try {
            if (isEditMode && editId) {
                await updateHospital(editId, {
                    hospitalName: formData.hospitalName.trim(),
                    hospitalType: formData.hospitalType,
                    departments: deptString,
                    area: formData.area.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim(),
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    services: servicesString,
                    images: selectedImages,
                    ...(formData.phone && { phone: formData.phone.trim() } as any),
                });
                setSuccessMessage('Hospital updated successfully!');
            } else {
                const payload: CreateHospitalPayload & { phone?: string; description?: string } = {
                    userId: formData.userId,
                    hospitalName: formData.hospitalName.trim(),
                    hospitalType: formData.hospitalType,
                    departments: deptString,
                    area: formData.area.trim(),
                    city: formData.city.trim(),
                    state: formData.state.trim(),
                    pincode: formData.pincode.trim(),
                    latitude: parseFloat(formData.latitude),
                    longitude: parseFloat(formData.longitude),
                    services: servicesString,
                    images: selectedImages,
                    phone: formData.phone.trim(),
                    description: formData.description.trim(),
                };
                await createHospital(payload as any);
                setSuccessMessage('Hospital created successfully!');
            }
            setTimeout(() => { setAccountType('worker'); navigate('/my-business'); }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 mx-auto mb-3" style={{ borderColor: BRAND }} />
                    <p className={`${typography.body.small} text-gray-500`}>Loading...</p>
                </div>
            </div>
        );
    }

    const totalImages = selectedImages.length + existingImages.length;

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-4 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-3">
                    <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-gray-100 transition">
                        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className={`${typography.heading.h5} text-gray-900 leading-tight`}>
                            {isEditMode ? 'Update Hospital' : 'Add Hospital'}
                        </h1>
                        <p className={`${typography.body.xs} text-gray-400 mt-0.5`}>
                            {isEditMode ? 'Update your healthcare listing' : 'Create new healthcare listing'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-5 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                        <span className="text-red-500 mt-0.5 flex-shrink-0">✕</span>
                        <p className={`${typography.form.error}`}>{error}</p>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                        <p className={`${typography.body.small} text-green-700`}>✓ {successMessage}</p>
                    </div>
                )}

                {/* 1. Hospital Name & Type - Two columns */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Hospital/Clinic Name</FieldLabel>
                            <input type="text" name="hospitalName" value={formData.hospitalName}
                                onChange={handleChange} placeholder="Enter hospital/clinic name" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>Type</FieldLabel>
                            <div className="relative">
                                <select name="hospitalType" value={formData.hospitalType}
                                    onChange={handleChange} className={inputCls + ' appearance-none pr-10'}>
                                    {hospitalTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* 2. Contact Information - Phone only (full width for single field, or add more fields for two columns) */}
                <Card>
                    <CardTitle title="Contact Information" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Phone</FieldLabel>
                            <input type="tel" name="phone" value={formData.phone}
                                onChange={handleChange} placeholder="Enter phone number" className={inputCls} />
                        </div>
                        {/* Placeholder for second contact field - can be email or alternate phone */}
                        <div>
                            <FieldLabel>Alternate Phone (Optional)</FieldLabel>
                            <input type="tel" name="altPhone" 
                                placeholder="Enter alternate phone" className={inputCls} disabled />
                        </div>
                    </div>
                </Card>

                {/* 3. Departments - Full width for complex input */}
                <Card>
                    <FieldLabel required>Departments / Specializations</FieldLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="relative">
                            <select value={deptDropdown} onChange={e => addDeptFromDropdown(e.target.value)}
                                className={inputCls + ' appearance-none pr-10 text-gray-500'}>
                                <option value="">Select from common departments</option>
                                {COMMON_DEPARTMENTS.filter(d => !departmentsList.includes(d)).map(d => (
                                    <option key={d} value={d}>{d}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="flex gap-2">
                            <input type="text" value={deptCustom} onChange={e => setDeptCustom(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCustomDept())}
                                placeholder="Or add custom department" className={inputCls} />
                            <button type="button" onClick={addCustomDept}
                                className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-opacity hover:opacity-90"
                                style={{ backgroundColor: BRAND }}>
                                <Plus className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    {departmentsList.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {departmentsList.map((d, i) => (
                                <span key={i}
                                    className={`inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-2 rounded-full ${typography.misc.badge} text-white`}
                                    style={{ backgroundColor: BRAND }}>
                                    {d}
                                    <button type="button" onClick={() => removeDept(i)} className="hover:opacity-70">
                                        <X className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </Card>

                {/* 4. Services - Full width for complex input */}
                <Card>
                    <FieldLabel required>Services Offered</FieldLabel>
                    <div className="flex gap-2">
                        <input type="text" value={serviceInput} onChange={e => setServiceInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
                            placeholder="Add a service" className={inputCls} />
                        <button type="button" onClick={addService}
                            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: BRAND }}>
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                    {servicesList.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                            {servicesList.map((s, i) => (
                                <span key={i}
                                    className={`inline-flex items-center gap-1.5 pl-3.5 pr-2.5 py-2 rounded-full ${typography.misc.badge} text-white`}
                                    style={{ backgroundColor: BRAND }}>
                                    {s}
                                    <button type="button" onClick={() => removeService(i)} className="hover:opacity-70">
                                        <X className="w-4 h-4" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </Card>

                {/* 5. Description - Full width */}
                <Card>
                    <FieldLabel>Description</FieldLabel>
                    <textarea name="description" value={formData.description} onChange={handleChange}
                        rows={4} placeholder="Tell us about yourself and your expertise..."
                        className={inputCls + ' resize-none'} />
                </Card>

                {/* 6. Location - Two columns for fields */}
                <Card>
                    <CardTitle
                        title="Location Details"
                        action={
                            <button type="button" onClick={getCurrentLocation} disabled={locationLoading}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg ${typography.misc.badge} text-white transition-opacity hover:opacity-90 disabled:opacity-60`}
                                style={{ backgroundColor: BRAND }}>
                                {locationLoading
                                    ? <><span className="animate-spin text-sm">⌛</span> Detecting...</>
                                    : <><MapPin className="w-4 h-4" /> Auto Detect</>}
                            </button>
                        }
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <FieldLabel required>Area</FieldLabel>
                            <input type="text" name="area" value={formData.area} onChange={handleChange} placeholder="Area name" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>City</FieldLabel>
                            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>State</FieldLabel>
                            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" className={inputCls} />
                        </div>
                        <div>
                            <FieldLabel required>PIN Code</FieldLabel>
                            <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} placeholder="PIN code" className={inputCls} />
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl p-3.5" style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a' }}>
                        <p className={`${typography.body.xs} font-medium`} style={{ color: '#92400e' }}>
                            💡 <span className="font-semibold">Tip:</span> Use auto-detect to fill location automatically from your device GPS
                        </p>
                    </div>

                    {formData.latitude && formData.longitude && (
                        <div className="mt-3 bg-green-50 border border-green-200 rounded-xl p-3.5">
                            <p className={`${typography.body.xs} font-medium text-green-800`}>
                                <span className="font-bold">✓ Location detected: </span>
                                {parseFloat(formData.latitude).toFixed(5)}, {parseFloat(formData.longitude).toFixed(5)}
                            </p>
                        </div>
                    )}
                </Card>

                {/* 7. Photos - Full width */}
                <Card>
                    <CardTitle title="Portfolio Photos (Optional)" />
                    <label className={`block ${totalImages >= 5 ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                        <input type="file" accept="image/*" multiple onChange={handleImageSelect}
                            className="hidden" disabled={totalImages >= 5} />
                        <div className="border-2 border-dashed rounded-xl p-8 text-center"
                            style={{ borderColor: totalImages >= 5 ? '#d1d5db' : '#c7d9e6' }}>
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e8f4fb' }}>
                                    <Upload className="w-7 h-7" style={{ color: BRAND }} />
                                </div>
                                <div>
                                    <p className={`${typography.form.label} text-gray-600`}>
                                        {totalImages >= 5 ? 'Maximum limit reached' : 'Tap to upload portfolio photos'}
                                    </p>
                                    <p className={`${typography.body.xs} text-gray-400 mt-1`}>Maximum 5 images · 5 MB each</p>
                                </div>
                            </div>
                        </div>
                    </label>

                    {(existingImages.length > 0 || imagePreviews.length > 0) && (
                        <div className="grid grid-cols-3 gap-2 mt-3">
                            {existingImages.map((url, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square">
                                    <img src={url} alt="" className="w-full h-full object-cover rounded-xl" />
                                    <button type="button"
                                        onClick={() => setExistingImages(p => p.filter((_, idx) => idx !== i))}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-1.5 left-1.5 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full`}
                                        style={{ backgroundColor: BRAND }}>
                                        Saved
                                    </span>
                                </div>
                            ))}
                            {imagePreviews.map((src, i) => (
                                <div key={`new-${i}`} className="relative aspect-square">
                                    <img src={src} alt="" className="w-full h-full object-cover rounded-xl border-2" style={{ borderColor: BRAND }} />
                                    <button type="button"
                                        onClick={() => {
                                            setSelectedImages(p => p.filter((_, idx) => idx !== i));
                                            setImagePreviews(p => p.filter((_, idx) => idx !== i));
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow">
                                        <X className="w-4 h-4" />
                                    </button>
                                    <span className={`absolute bottom-1.5 left-1.5 bg-green-600 text-white ${typography.misc.badge} px-2 py-0.5 rounded-full`}>
                                        New
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2 pb-8">
                    <button type="button" onClick={handleSubmit} disabled={loading}
                        className={`flex-1 py-4 rounded-xl font-bold ${typography.nav.button} text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-70`}
                        style={{ backgroundColor: BRAND }}>
                        {loading && (
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        )}
                        {loading
                            ? (isEditMode ? 'Updating...' : 'Creating...')
                            : (isEditMode ? 'Update Hospital' : 'Create Service')}
                    </button>
                    <button type="button" onClick={() => window.history.back()} disabled={loading}
                        className={`px-8 py-4 rounded-xl font-semibold ${typography.nav.button} text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50`}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HospitalForm;