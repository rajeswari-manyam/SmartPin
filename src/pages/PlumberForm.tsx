import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob, updateJob, getJobById, CreateJobPayload } from "../services/api.service";
import subcategoriesData from '../data/subcategories.json';
import { X, Upload, AlertTriangle, Check, Loader2 } from "lucide-react";
import { useAccount } from "../context/AccountContext";
import typography from "../styles/typography";
import IconSelect from "../components/common/IconDropDown";
import { SUBCATEGORY_ICONS } from '../assets/subcategoryIcons';
import LocationPicker, { EMPTY_LOCATION } from '../components/LocationPicker';
import type { LocationPickerValue } from '../types/location.types';

const jobTypeOptions = ['FULL_TIME', 'PART_TIME'];
const BRAND = '#00598a';

const getPlumberSubcategories = () => {
 const plumberCategory = subcategoriesData.subcategories.find((cat: any) => cat.categoryId === 3);
 return plumberCategory ? plumberCategory.items.map((item: any) => item.name) : [];
};

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputBase =
    `w-full px-4 py-3 border border-gray-300 rounded-xl ` +
    `focus:ring-2 focus:ring-[#00598a] focus:border-[#00598a] ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `text-base text-gray-800 bg-white`;

const inputError =
    `w-full px-4 py-3 border border-red-400 rounded-xl ` +
    `focus:ring-2 focus:ring-red-400 focus:border-red-400 ` +
    `placeholder-gray-400 transition-all duration-200 ` +
    `text-base text-gray-800 bg-white`;

const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
 backgroundRepeat: 'no-repeat' as const,
 backgroundPosition: 'right 0.75rem center',
 backgroundSize: '1.5em 1.5em',
 paddingRight: '2.5rem',
};

// ── Sub-components ────────────────────────────────────────────────────────────
const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
    <label className="block text-base font-semibold text-gray-800 mb-2">
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
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                {action}
            </div>
        )}
        {children}
    </div>
);

const TwoCol: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
);

// ── Geocoding ─────────────────────────────────────────────────────────────────
// Location is owned by <LocationPicker />: it geocodes the typed address and
// reverse-geocodes GPS / map points, so the form never geocodes on its own and
// can never keep coordinates that belong to a previous address.

interface FieldErrors {
 title?: string;
 description?: string;
 phone?: string;
 location?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
const PlumberForm = () => {
 const navigate = useNavigate();
 const { setAccountType } = useAccount();

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

 const plumberSubcategories = getPlumberSubcategories();
    
    // ── Prepare subcategory options with icons ───────────────────────────────
 const subcategoryOptions = plumberSubcategories.map((name: string) => ({
 name,
        icon: SUBCATEGORY_ICONS[name],
    }));
    
    const defaultSubcategory = getSubcategoryFromUrl() || plumberSubcategories[0] || 'Plumbing Services';

 const [formData, setFormData] = useState({
        userId: localStorage.getItem('userId') || '',
        name: localStorage.getItem('userName') || '',
 phone: '',
 title: '',
 description: '',
 category: 'plumbing',
 subcategory: defaultSubcategory,
 jobType: 'FULL_TIME' as 'FULL_TIME' | 'PART_TIME',
 servicecharges: '',
 startDate: '',
 endDate: '',
 area: '',
 city: '',
 state: '',
 pincode: '',
 latitude: '',
 longitude: '',
 images: '',
    });

 const [selectedImages, setSelectedImages] = useState<File[]>([]);
 const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    // Single source of truth for the service location. Coordinates are 0 until a
    // point is actually resolved, so a stale pin can never be submitted.
 const [location, setLocation] = useState<LocationPickerValue>(EMPTY_LOCATION);

 const maxImagesReached = selectedImages.length >= 5;

    // ── fetch edit data ───────────────────────────────────────────────────────
 useEffect(() => {
 if (!editId) return;
 const fetchData = async () => {
 setLoadingData(true);
 try {
 const response = await getJobById(editId);
 if (!response || !response.job) { setError('Service not found'); setLoadingData(false); return; }
 const job = response.job;
 const storedLocation: LocationPickerValue = {
 address:
 job.address ||
                        [job.area, job.city, job.state, job.pincode].filter(Boolean).join(', ') ||
                        '',
                    area: job.area || '',
                    city: job.city || '',
                    state: job.state || '',
                    pincode: job.pincode || '',
 latitude: Number(job.latitude) || 0,
 longitude: Number(job.longitude) || 0,
                };
 setLocation(storedLocation);
 setFormData(prev => ({
                    ...prev,
                    userId: prev.userId || job.userId || '',
                    phone: job.phone || '',
                    title: job.title || '',
                    description: job.description || '',
                    category: job.category || 'plumbing',
 subcategory: job.subcategory || defaultSubcategory,
                    jobType: job.jobType || 'FULL_TIME',
                    servicecharges: job.servicecharges?.toString() || '',
                    startDate: job.startDate?.split('T')[0] || '',
                    endDate: job.endDate?.split('T')[0] || '',
                    area: job.area || '',
                    city: job.city || '',
                    state: job.state || '',
                    pincode: job.pincode || '',
                    latitude: job.latitude?.toString() || '',
                    longitude: job.longitude?.toString() || '',
                    images: job.images?.join(',') || '',
                }));
            } catch (err) {
 console.error(err);
 setError('Failed to load job data');
            } finally {
 setLoadingData(false);
            }
        };
 fetchData();
    }, [editId]);

    // ── handlers ──────────────────────────────────────────────────────────────
 const handleLocationChange = (next: LocationPickerValue) => {
 setLocation(next);
 setFormData(prev => ({
            ...prev,
 area: next.area,
 city: next.city,
 state: next.state,
 pincode: next.pincode,
 latitude: next.latitude ? String(next.latitude) : '',
 longitude: next.longitude ? String(next.longitude) : '',
        }));
 if (fieldErrors.location) {
 setFieldErrors(prev => ({ ...prev, location: undefined }));
        }
    };

 const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 if (fieldErrors[name as keyof FieldErrors]) {
 setFieldErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

 const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
 const files = Array.from(e.target.files || []);
 if (!files.length) return;
 const availableSlots = 5 - selectedImages.length;
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

 const handleSubmit = async () => {
 setLoading(true);
 setError('');
 setSuccessMessage('');
 const errs: FieldErrors = {};

 try {
 if (!formData.title.trim()) errs.title = 'Service title is required.';
 if (!formData.description.trim()) errs.description = 'Description is required.';
 if (!formData.phone.trim()) {
 errs.phone = 'Phone number is required.';
            } else if (!/^[0-9+\-\s]{7,15}$/.test(formData.phone.trim())) {
 errs.phone = 'Please enter a valid phone number.';
            }
 if (!formData.latitude || !formData.longitude) {
 errs.location = 'Please pick the service location on the map.';
            }
 if (!formData.area.trim()) errs.location = 'Please enter the service area.';

 if (Object.keys(errs).length > 0) {
 setFieldErrors(errs);
 setError('Please fix the errors below before submitting.');
 window.scrollTo({ top: 0, behavior: 'smooth' });
 setLoading(false);
 return;
            }

 const jobPayload: CreateJobPayload & { phone?: string } = {
 userId: formData.userId,
 name: formData.name,
 phone: formData.phone.trim(),
 title: formData.title,
 description: formData.description,
 category: formData.category,
 subcategory: formData.subcategory,
 jobType: formData.jobType,
 servicecharges: formData.servicecharges,
 startDate: formData.startDate,
 endDate: formData.endDate,
 area: formData.area,
 city: formData.city,
 state: formData.state,
 pincode: formData.pincode,
 latitude: formData.latitude,
 longitude: formData.longitude,
 images: selectedImages,
            };

 if (isEditMode && editId) {
 await updateJob(editId, jobPayload);
 setSuccessMessage('Service updated successfully!');
            } else {
 await createJob(jobPayload as CreateJobPayload);
 setSuccessMessage('Service created successfully!');
            }

 setTimeout(() => {
 setAccountType("user");
 navigate("/listed-jobs");
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to submit form');
        } finally {
 setLoading(false);
        }
    };

 const handleCancel = () => window.history.back();

    // ── loading screen ────────────────────────────────────────────────────────
 if (loadingData) {
 return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: BRAND }} />
                    <p className="text-base text-gray-600">Loading...</p>
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
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-gray-900">
                            {isEditMode ? 'Update Plumber Service' : 'Add Plumber Service'}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">
                            {isEditMode ? 'Update your service listing' : 'Create new service listing'}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Container ── */}
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-4">

                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 shrink-0" />
                            <div className="flex-1">
                                <p className="font-semibold text-red-800 mb-1 text-base">Please fix the following</p>
                                <p className="text-red-700 text-base">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
                {successMessage && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                        <Check className="w-4 h-4 shrink-0" />
                        <p className="text-base text-green-700 font-medium">{successMessage}</p>
                    </div>
                )}

                {/* ─── ROW 1: TITLE + SUBCATEGORY ─── */}
                <SectionCard>
                    <TwoCol>
                        <div>
                            <FieldLabel required>Service Title</FieldLabel>
                            <input
 type="text"
 name="title"
 value={formData.title}
 onChange={handleInputChange}
 placeholder="e.g. Professional Plumbing Services"
 className={fieldErrors.title ? inputError : inputBase}
                            />
                            {fieldErrors.title && (
                                <p className="mt-1.5 text-base text-red-500 flex items-center gap-1"> {fieldErrors.title}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Subcategory</FieldLabel>
                            <IconSelect
 label=""
 value={formData.subcategory}
 placeholder="Select subcategory"
 options={subcategoryOptions}
 onChange={(val) =>
 setFormData(prev => ({ ...prev, subcategory: val }))
                                }
 disabled={loading}
                            />
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 2: PHONE + DESCRIPTION ─── */}
                <SectionCard title="Contact & Description">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Phone Number</FieldLabel>
                            <input
 type="tel"
 name="phone"
 value={formData.phone}
 onChange={handleInputChange}
 placeholder="Enter phone number"
 className={fieldErrors.phone ? inputError : inputBase}
                            />
                            {fieldErrors.phone && (
                                <p className="mt-1.5 text-base text-red-500 flex items-center gap-1"> {fieldErrors.phone}</p>
                            )}
                        </div>
                        <div>
                            <FieldLabel required>Description</FieldLabel>
                            <textarea
 name="description"
 value={formData.description}
 onChange={handleInputChange}
 rows={3}
 placeholder="Describe your services, experience, and specializations..."
 className={(fieldErrors.description ? inputError : inputBase) + ' resize-none'}
                            />
                            {fieldErrors.description && (
                                <p className="mt-1.5 text-base text-red-500 flex items-center gap-1"> {fieldErrors.description}</p>
                            )}
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 3: JOB TYPE + SERVICE CHARGES ─── */}
                <SectionCard title="Job Details">
                    <TwoCol>
                        <div>
                            <FieldLabel required>Job Type</FieldLabel>
                            <select
 name="jobType"
 value={formData.jobType}
 onChange={handleInputChange}
 className={inputBase + ' appearance-none bg-white'}
 style={selectStyle}
                            >
                                {jobTypeOptions.map(type => (
                                    <option key={type} value={type}>{type.replace('_', ' ')}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <FieldLabel required>Service Charges (₹)</FieldLabel>
                            <input
 type="text"
 name="servicecharges"
 value={formData.servicecharges}
 onChange={handleInputChange}
 placeholder="e.g. 2000"
 className={inputBase}
                            />
                        </div>
                    </TwoCol>

                    <TwoCol>
                        <div>
                            <FieldLabel required>Start Date</FieldLabel>
                            <input
 type="date"
 name="startDate"
 value={formData.startDate}
 onChange={handleInputChange}
 className={inputBase}
                            />
                        </div>
                        <div>
                            <FieldLabel required>End Date</FieldLabel>
                            <input
 type="date"
 name="endDate"
 value={formData.endDate}
 onChange={handleInputChange}
 className={inputBase}
                            />
                        </div>
                    </TwoCol>
                </SectionCard>

                {/* ─── ROW 4: LOCATION ─── */}
                <SectionCard title="Service Location">
                    <LocationPicker
 value={location}
 onLocationChange={handleLocationChange}
 title=""
 error={fieldErrors.location}
                    />
                </SectionCard>

                {/* ─── ROW 5: PHOTOS ─── */}
                <SectionCard title={`Portfolio Photos (${selectedImages.length}/5)`}>
                    <TwoCol>
                        {/* Upload zone */}
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
 className={`border-2 border-dashed rounded-2xl p-10 text-center transition h-full flex items-center justify-center ${maxImagesReached ? 'cursor-not-allowed' : 'cursor-pointer'}`}
 style={{
 borderColor: maxImagesReached ? '#d1d5db' : BRAND,
 backgroundColor: maxImagesReached ? '#f9fafb' : '#f0f7fb',
 minHeight: '180px',
                                }}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: '#e0eff7' }}>
                                        <Upload className="w-8 h-8" style={{ color: BRAND }} />
                                    </div>
                                    <div>
                                        <p className="text-base font-medium text-gray-700">
                                            {maxImagesReached
                                                ? 'Maximum 5 images reached'
                                                : `Add Photos (${5 - selectedImages.length} slots left)`}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
 Upload photos of your work or tools
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5">Max 5 images · 5 MB each · JPG, PNG</p>
                                    </div>
                                </div>
                            </div>
                        </label>

                        {/* Previews */}
                        {selectedImages.length > 0 ? (
                            <div className="grid grid-cols-3 gap-3">
                                {selectedImages.map((file, i) => (
                                    <div key={`new-${i}`} className="relative aspect-square group">
                                        <img
 src={imagePreviews[i]}
 alt={`New ${i + 1}`}
 className="w-full h-full object-cover rounded-xl border-2"
 style={{ borderColor: BRAND }}
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
                                <p className="text-base text-gray-400">
 Uploaded images will appear here
                                </p>
                            </div>
                        )}
                    </TwoCol>
                </SectionCard>

                {/* ── Action Buttons ── */}
                <div className="flex gap-4 pt-2 pb-8">
                    <button
 onClick={handleSubmit}
 disabled={loading || !!successMessage}
 type="button"
 className={`flex-1 px-6 py-3.5 rounded-xl font-semibold text-white transition-all shadow-md hover:shadow-lg text-base ${loading || successMessage ? 'opacity-70 cursor-not-allowed' : 'hover:opacity-90'}`}
 style={{ backgroundColor: BRAND }}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {isEditMode ? 'Updating...' : 'Creating...'}
                            </span>
                        ) : successMessage ? (
                            <span className="flex items-center justify-center gap-2"><Check className="w-4 h-4 shrink-0" /> Done</span>
                        ) : (
 isEditMode ? 'Update Service' : 'Create Service'
                        )}
                    </button>
                    <button
 onClick={handleCancel}
 type="button"
 disabled={loading}
 className={`px-8 py-3.5 rounded-xl font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-all text-base ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
 Cancel
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PlumberForm;