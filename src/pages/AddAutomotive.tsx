
// // src/pages/AddAutomotive.tsx

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { createAutomotive, CreateAutomotiveData } from "../services/CategoriesApi.service";

// interface FormData {
//     userId: string;
//     name: string;
//     businessType: string;
//     phone: string;
//     email: string;
//     services: string[];
//     experience: string;
//     availability: string;
//     area: string;
//     city: string;
//     state: string;
//     pincode: string;
//     latitude: string;
//     longitude: string;
//     priceRange: string;
//     description: string;
// }

// const AddAutomotive: React.FC = () => {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const [serviceInput, setServiceInput] = useState('');
//     const [images, setImages] = useState<File[]>([]);
//     const [imagePreviews, setImagePreviews] = useState<string[]>([]);
//     const [locationLoading, setLocationLoading] = useState(false);

//     const [formData, setFormData] = useState<FormData>({
//         userId: localStorage.getItem('userId') || '',
//         name: '',
//         businessType: 'Car Service Center',
//         phone: '',
//         email: '',
//         services: [],
//         experience: '',
//         availability: 'Full Time',
//         area: '',
//         city: 'Hyderabad',
//         state: 'Telangana',
//         pincode: '',
//         latitude: '',
//         longitude: '',
//         priceRange: '',
//         description: ''
//     });

//     const businessTypes = [
//         'Car Service Center',
//         'Bike Repair',
//         'Car Wash',
//         'Bike Wash',
//         'Tyre Shop',
//         'Battery Shop',
//         'Automobile Spare Parts',
//         'Towing Service',
//         'Car Rental'
//     ];

//     const availabilityOptions = ['Full Time', 'Part Time', 'On Demand', '24/7'];

//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: value
//         }));
//     };

//     const getCurrentLocation = () => {
//         setLocationLoading(true);
//         setError('');

//         if (!navigator.geolocation) {
//             setError('Geolocation is not supported by your browser');
//             setLocationLoading(false);
//             return;
//         }

//         navigator.geolocation.getCurrentPosition(
//             async (position) => {
//                 const latitude = position.coords.latitude.toString();
//                 const longitude = position.coords.longitude.toString();

//                 // Update form with coordinates
//                 setFormData(prev => ({
//                     ...prev,
//                     latitude,
//                     longitude
//                 }));

//                 // Reverse geocode to get address
//                 try {
//                     const response = await fetch(
//                         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
//                     );
//                     const data = await response.json();

//                     if (data.address) {
//                         setFormData(prev => ({
//                             ...prev,
//                             latitude,
//                             longitude,
//                             area: data.address.suburb || data.address.neighbourhood || prev.area,
//                             city: data.address.city || data.address.town || prev.city,
//                             state: data.address.state || prev.state,
//                             pincode: data.address.postcode || prev.pincode
//                         }));
//                     }
//                 } catch (err) {
//                     console.error('Error fetching address:', err);
//                 }

//                 setLocationLoading(false);
//             },
//             (error) => {
//                 setError(`Location error: ${error.message}`);
//                 setLocationLoading(false);
//             },
//             {
//                 enableHighAccuracy: true,
//                 timeout: 5000,
//                 maximumAge: 0
//             }
//         );
//     };

//     const handleAddressChange = async (field: string, value: string) => {
//         setFormData(prev => ({
//             ...prev,
//             [field]: value
//         }));

//         // If user is entering address manually, try to geocode it
//         if (field === 'area' || field === 'city' || field === 'state' || field === 'pincode') {
//             // Debounce the geocoding
//             const timeoutId = setTimeout(async () => {
//                 const address = `${formData.area}, ${formData.city}, ${formData.state}, ${formData.pincode}`;
//                 if (address.replace(/,/g, '').trim().length > 5) {
//                     try {
//                         const response = await fetch(
//                             `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
//                         );
//                         const data = await response.json();

//                         if (data && data.length > 0) {
//                             setFormData(prev => ({
//                                 ...prev,
//                                 latitude: data[0].lat,
//                                 longitude: data[0].lon
//                             }));
//                         }
//                     } catch (err) {
//                         console.error('Geocoding error:', err);
//                     }
//                 }
//             }, 1000);

//             return () => clearTimeout(timeoutId);
//         }
//     };

//     const handleAddService = () => {
//         if (serviceInput.trim() && !formData.services.includes(serviceInput.trim())) {
//             setFormData(prev => ({
//                 ...prev,
//                 services: [...prev.services, serviceInput.trim()]
//             }));
//             setServiceInput('');
//         }
//     };

//     const handleRemoveService = (index: number) => {
//         setFormData(prev => ({
//             ...prev,
//             services: prev.services.filter((_, i) => i !== index)
//         }));
//     };

//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const files = e.target.files;
//         if (files) {
//             const newImages = Array.from(files);
//             setImages(prev => [...prev, ...newImages]);

//             newImages.forEach(file => {
//                 const reader = new FileReader();
//                 reader.onloadend = () => {
//                     setImagePreviews(prev => [...prev, reader.result as string]);
//                 };
//                 reader.readAsDataURL(file);
//             });
//         }
//     };

//     const handleRemoveImage = (index: number) => {
//         setImages(prev => prev.filter((_, i) => i !== index));
//         setImagePreviews(prev => prev.filter((_, i) => i !== index));
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setLoading(true);
//         setError('');

//         try {
//             // Validation
//             if (!formData.name || !formData.phone || !formData.email) {
//                 throw new Error('Please fill in all required fields');
//             }

//             if (formData.services.length === 0) {
//                 throw new Error('Please add at least one service');
//             }

//             const createData: CreateAutomotiveData = {
//                 ...formData,
//                 images
//             };

//             const result = await createAutomotive(createData);
//             console.log('Success:', result);

//             // Navigate back to automotive list
//             navigate('/automotive');
//         } catch (err: any) {
//             setError(err.message || 'Failed to create service');
//             console.error('Error:', err);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-50 p-6">
//             <div className="max-w-4xl mx-auto">
//                 <div className="flex items-center justify-between mb-6">
//                     <h1 className="text-3xl font-bold">Add Automotive Service</h1>
//                     <button
//                         onClick={() => navigate('/automotive')}
//                         className="text-gray-600 hover:text-gray-800"
//                     >
//                         ← Back
//                     </button>
//                 </div>

//                 {error && (
//                     <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
//                         {error}
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-6">
//                     {/* Basic Information */}
//                     <div className="space-y-4">
//                         <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">
//                                     Business Name <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={formData.name}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="ABC Auto Garage"
//                                     required
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">
//                                     Business Type <span className="text-red-500">*</span>
//                                 </label>
//                                 <select
//                                     name="businessType"
//                                     value={formData.businessType}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     required
//                                 >
//                                     {businessTypes.map(type => (
//                                         <option key={type} value={type}>{type}</option>
//                                     ))}
//                                 </select>
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">
//                                     Phone <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="tel"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="9876543210"
//                                     required
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">
//                                     Email <span className="text-red-500">*</span>
//                                 </label>
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="abc@gmail.com"
//                                     required
//                                 />
//                             </div>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium mb-2">Description</label>
//                             <textarea
//                                 name="description"
//                                 value={formData.description}
//                                 onChange={handleInputChange}
//                                 rows={3}
//                                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Multi-brand car service"
//                             />
//                         </div>
//                     </div>

//                     {/* Services Offered */}
//                     <div className="space-y-4">
//                         <h2 className="text-xl font-semibold border-b pb-2">Services Offered</h2>

//                         <div className="flex gap-2">
//                             <input
//                                 type="text"
//                                 value={serviceInput}
//                                 onChange={(e) => setServiceInput(e.target.value)}
//                                 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
//                                 className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 placeholder="Enter a service (e.g., Oil Change)"
//                             />
//                             <button
//                                 type="button"
//                                 onClick={handleAddService}
//                                 className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                             >
//                                 Add
//                             </button>
//                         </div>

//                         <div className="flex flex-wrap gap-2">
//                             {formData.services.map((service, index) => (
//                                 <span
//                                     key={index}
//                                     className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm flex items-center gap-2"
//                                 >
//                                     {service}
//                                     <button
//                                         type="button"
//                                         onClick={() => handleRemoveService(index)}
//                                         className="text-blue-900 hover:text-red-600"
//                                     >
//                                         ×
//                                     </button>
//                                 </span>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Business Details */}
//                     <div className="space-y-4">
//                         <h2 className="text-xl font-semibold border-b pb-2">Business Details</h2>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Experience (years)</label>
//                                 <input
//                                     type="number"
//                                     name="experience"
//                                     value={formData.experience}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="5"
//                                     min="0"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Availability</label>
//                                 <select
//                                     name="availability"
//                                     value={formData.availability}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                 >
//                                     {availabilityOptions.map(option => (
//                                         <option key={option} value={option}>{option}</option>
//                                     ))}
//                                 </select>
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Price Range</label>
//                                 <input
//                                     type="text"
//                                     name="priceRange"
//                                     value={formData.priceRange}
//                                     onChange={handleInputChange}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="1000-5000"
//                                 />
//                             </div>
//                         </div>
//                     </div>

//                     {/* Location */}
//                     <div className="space-y-4">
//                         <div className="flex items-center justify-between border-b pb-2">
//                             <h2 className="text-xl font-semibold">Location</h2>
//                             <button
//                                 type="button"
//                                 onClick={getCurrentLocation}
//                                 disabled={locationLoading}
//                                 className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
//                             >
//                                 {locationLoading ? (
//                                     <>
//                                         <span className="animate-spin">⌛</span>
//                                         Detecting...
//                                     </>
//                                 ) : (
//                                     <>
//                                         📍 Use Current Location
//                                     </>
//                                 )}
//                             </button>
//                         </div>

//                         {formData.latitude && formData.longitude && (
//                             <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
//                                 <span className="font-semibold text-green-700">✓ Location detected:</span>
//                                 <span className="text-green-600 ml-2">
//                                     {formData.latitude}, {formData.longitude}
//                                 </span>
//                             </div>
//                         )}

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Area</label>
//                                 <input
//                                     type="text"
//                                     name="area"
//                                     value={formData.area}
//                                     onChange={(e) => {
//                                         handleInputChange(e);
//                                         handleAddressChange('area', e.target.value);
//                                     }}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Ameerpet"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">City</label>
//                                 <input
//                                     type="text"
//                                     name="city"
//                                     value={formData.city}
//                                     onChange={(e) => {
//                                         handleInputChange(e);
//                                         handleAddressChange('city', e.target.value);
//                                     }}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Hyderabad"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">State</label>
//                                 <input
//                                     type="text"
//                                     name="state"
//                                     value={formData.state}
//                                     onChange={(e) => {
//                                         handleInputChange(e);
//                                         handleAddressChange('state', e.target.value);
//                                     }}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="Telangana"
//                                 />
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium mb-2">Pincode</label>
//                                 <input
//                                     type="text"
//                                     name="pincode"
//                                     value={formData.pincode}
//                                     onChange={(e) => {
//                                         handleInputChange(e);
//                                         handleAddressChange('pincode', e.target.value);
//                                     }}
//                                     className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                                     placeholder="500016"
//                                 />
//                             </div>
//                         </div>

//                         <p className="text-xs text-gray-500 italic">
//                             💡 Tip: Click "Use Current Location" to auto-detect your location, or enter your address manually and coordinates will be detected automatically.
//                         </p>
//                     </div>

//                     {/* Images */}
//                     <div className="space-y-4">
//                         <h2 className="text-xl font-semibold border-b pb-2">Images</h2>

//                         <div>
//                             <label className="block text-sm font-medium mb-2">Upload Images</label>
//                             <input
//                                 type="file"
//                                 accept="image/*"
//                                 multiple
//                                 onChange={handleImageChange}
//                                 className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                             />
//                         </div>

//                         {imagePreviews.length > 0 && (
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                                 {imagePreviews.map((preview, index) => (
//                                     <div key={index} className="relative">
//                                         <img
//                                             src={preview}
//                                             alt={`Preview ${index + 1}`}
//                                             className="w-full h-32 object-cover rounded-lg"
//                                         />
//                                         <button
//                                             type="button"
//                                             onClick={() => handleRemoveImage(index)}
//                                             className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
//                                         >
//                                             ×
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     {/* Submit Button */}
//                     <div className="flex gap-4">
//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
//                         >
//                             {loading ? 'Creating...' : 'Create Service'}
//                         </button>
//                         <button
//                             type="button"
//                             onClick={() => navigate('/automotive')}
//                             className="px-8 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default AddAutomotive
export default {};
