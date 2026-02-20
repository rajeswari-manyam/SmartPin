import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  Clock,
  CheckCircle,
} from "lucide-react";

/* ================= TYPES ================= */

export interface DentalService {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  photos: { photo_reference: string }[];
  geometry: {
    location: { lat: number; lng: number };
  };
  business_status: string;
  opening_hours: { open_now: boolean };
  price_level: number;
  types: string[];
  distance: number;
}

export interface JobType {
  id: string;
  title: string;
  location?: string;
  description?: string;
  distance?: number;
  category?: string;
  jobData?: any;
}

/* ================= CONSTANTS - EXACT FROM REACT NATIVE ================= */

// Phone numbers map for dental clinics
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  dental_1: "07041831601",
  dental_2: "08460255807",
  dental_3: "08401307410",
  dental_4: "07997896777",
};

// Export dummy dental clinic data - EXACT FROM REACT NATIVE
export const DUMMY_DENTAL_CLINICS: DentalService[] = [
  {
    place_id: "dental_1",
    name: "Dental Image",
    vicinity: "ITI STREET Christurajupuram, Vijayawada",
    rating: 5.0,
    user_ratings_total: 279,
    photos: [{ photo_reference: "dental_photo_1" }],
    geometry: {
      location: { lat: 16.5062, lng: 80.648 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["dentist", "health"],
    distance: 1.3,
  },
  {
    place_id: "dental_2",
    name: "Sky Dental",
    vicinity: "Kollipara Sri Ramulu Street Eluru Road, Vijayawada",
    rating: 5.0,
    user_ratings_total: 513,
    photos: [{ photo_reference: "dental_photo_2" }],
    geometry: {
      location: { lat: 16.51, lng: 80.65 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["dentist", "health"],
    distance: 2.1,
  },
  {
    place_id: "dental_3",
    name: "Sri Krishna Dental Care",
    vicinity: "Pundaripuram 3rd Lane Ashok Nagar, Vijayawada",
    rating: 4.7,
    user_ratings_total: 368,
    photos: [{ photo_reference: "dental_photo_3" }],
    geometry: {
      location: { lat: 16.52, lng: 80.652 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["dentist", "health"],
    distance: 1.8,
  },
  {
    place_id: "dental_4",
    name: "RR Dental Care",
    vicinity: "Pantakaluva Road Kanuru, Vijayawada",
    rating: 4.9,
    user_ratings_total: 98,
    photos: [{ photo_reference: "dental_photo_4" }],
    geometry: {
      location: { lat: 16.515, lng: 80.645 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["dentist", "health"],
    distance: 2.5,
  },
  {
    place_id: "dental_5",
    name: "Anil Neuro & Trauma Centre",
    vicinity: "Gandhi Nagar, Vijayawada",
    rating: 4.6,
    user_ratings_total: 1552,
    photos: [{ photo_reference: "dental_photo_5" }],
    geometry: {
      location: { lat: 16.508, lng: 80.649 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["dentist", "health"],
    distance: 3.2,
  },
];

// Dental clinic images
const DENTAL_IMAGES_MAP: { [key: string]: string[] } = {
  dental_1: [
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800",
  ],
  dental_2: [
    "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800",
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800",
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
  ],
  dental_3: [
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800",
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800",
  ],
  dental_4: [
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
    "https://images.unsplash.com/photo-1629909615184-74f495363b67?w=800",
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?w=800",
  ],
  dental_5: [
    "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800",
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800",
    "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800",
  ],
};

// Dental clinic descriptions
const DENTAL_DESCRIPTIONS_MAP: { [key: string]: string } = {
  dental_1:
    "Verified dental clinic with 5.0★ rating and 279 reviews. 18 Years in Healthcare. Responsive service. Available Now. Specializing in comprehensive dental care and treatments.",
  dental_2:
    "Sky Dental - Trending clinic with perfect 5.0★ rating and 513 reviews. Consultation Fee: ₹500. 8 Years in Healthcare. Multiple specialist doctors available. Book appointment online.",
  dental_3:
    "Sri Krishna Dental Care - Verified clinic with 4.7★ rating and 368 reviews. 25 Years in Healthcare. Responsive. Specializing in Root Canal, Zirconia fixed teeth, and Invisible braces.",
  dental_4:
    "RR Dental Care - Trending clinic with 4.9★ rating and 98 reviews. 8 Years in Healthcare. Available Now. Comprehensive dental services with modern equipment.",
  dental_5:
    "Anil Neuro & Trauma Centre - Popular verified clinic with 4.6★ rating and 1,552 reviews. Multi-specialty healthcare center with dental services.",
};

// Dental services offered
const DENTAL_SERVICES = [
  "General Checkup",
  "Teeth Cleaning",
  "Root Canal",
  "Dental Implants",
  "Teeth Whitening",
  "Braces",
  "Dental Crown",
  "Tooth Extraction",
];

/* ================= COMPONENT ================= */

interface NearbyDentalCardProps {
  job?: JobType;
  onViewDetails: (job: JobType) => void;
}

// Single Dental Card Component
const SingleDentalCard: React.FC<{
  job: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos from job data - Using useCallback like React Native
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || "dental_1";
    return DENTAL_IMAGES_MAP[jobId] || DENTAL_IMAGES_MAP["dental_1"];
  }, [job]);

  const photos = getPhotos();
  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

  // Navigate to previous image - Using useCallback like React Native
  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasPhotos && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      }
    },
    [hasPhotos, currentImageIndex]
  );

  // Navigate to next image - Using useCallback like React Native
  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasPhotos && currentImageIndex < photos.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      }
    },
    [hasPhotos, currentImageIndex, photos.length]
  );

  // Get clinic name from job data - Using useCallback like React Native
  const getName = useCallback((): string => {
    if (!job) return "Dental Clinic";
    return job.title || "Dental Clinic";
  }, [job]);

  // Get location string from job data - Using useCallback like React Native
  const getLocation = useCallback((): string => {
    if (!job) return "Location";
    return job.location || job.description || "Location";
  }, [job]);

  // Get distance string from job data - Using useCallback like React Native
  const getDistance = useCallback((): string => {
    if (!job) return "";
    if (job.distance !== undefined && job.distance !== null) {
      const distanceNum = Number(job.distance);
      if (!isNaN(distanceNum)) {
        return `${distanceNum.toFixed(1)} km away`;
      }
    }
    return "";
  }, [job]);

  // Get description - Using useCallback like React Native
  const getDescription = useCallback((): string => {
    if (!job) return "Professional dental care services";
    const jobId = job.id || "dental_1";
    return (
      DENTAL_DESCRIPTIONS_MAP[jobId] ||
      job.description ||
      "Professional dental care services"
    );
  }, [job]);

  // Get rating from job data - Using useCallback like React Native
  const getRating = useCallback((): number | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    return jobData?.rating || null;
  }, [job]);

  // Get user ratings total from job data - Using useCallback like React Native
  const getUserRatingsTotal = useCallback((): number | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    return jobData?.user_ratings_total || null;
  }, [job]);

  // Get opening hours status from job data - Using useCallback like React Native
  const getOpeningStatus = useCallback((): string | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    const isOpen = jobData?.opening_hours?.open_now;

    if (isOpen === undefined || isOpen === null) {
      return null;
    }

    return isOpen ? "Open Now" : "Closed";
  }, [job]);

  // Get phone number for the dental clinic - Using useCallback like React Native
  const getPhoneNumber = useCallback((): string | null => {
    if (!job) return null;
    const jobId = job.id || "";
    return PHONE_NUMBERS_MAP[jobId] || null;
  }, [job]);

  // Handle call button press - Opens phone dialer
  const handleCall = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!job) return;

      const phoneNumber = getPhoneNumber();
      const name = getName();

      if (!phoneNumber) {
        alert(`No contact number available for ${name}.`);
        return;
      }

      // Format phone number for tel: URL (remove all non-numeric characters)
      const formattedNumber = phoneNumber.replace(/[^0-9+]/g, "");
      const telUrl = `tel:${formattedNumber}`;

      window.location.href = telUrl;
    },
    [job, getPhoneNumber, getName]
  );

  // Handle directions button press - Opens Maps app with exact location
  const handleDirections = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!job) return;

      const jobData = job.jobData as any;
      const lat = jobData?.geometry?.location?.lat;
      const lng = jobData?.geometry?.location?.lng;

      if (!lat || !lng) {
        alert("Unable to get location coordinates for directions.");
        return;
      }

      // Create Google Maps URL with exact coordinates and name
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${job.id || ""}`;

      window.open(googleMapsUrl, "_blank");
    },
    [job]
  );

  // Handle image loading error - Using useCallback like React Native
  const handleImageError = useCallback(() => {
    console.warn("⚠️ Failed to load image for dental clinic:", job?.id || "unknown");
    setImageError(true);
  }, [job]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const visibleServices = DENTAL_SERVICES.slice(0, 4);
  const moreServices =
    DENTAL_SERVICES.length > 4 ? DENTAL_SERVICES.length - 4 : 0;
  const hasPhoneNumber = getPhoneNumber() !== null;

  // Early return if job is not provided (after all hooks)
  if (!job) {
    return null;
  }

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[0.99] mb-4"
    >
      {/* Image Carousel */}
      <div className="relative h-48 bg-gray-100">
        {currentPhoto && !imageError ? (
          <>
            <img
              src={currentPhoto}
              className="w-full h-full object-cover"
              alt={getName()}
              onError={handleImageError}
            />

            {/* Image Navigation Arrows */}
            {hasPhotos && photos.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {currentImageIndex < photos.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                  {currentImageIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-6xl">🦷</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Clinic Name */}
        <h3 className="text-[17px] font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2">
          {getName()}
        </h3>

        {/* Location */}
        <div className="flex items-center text-gray-500 mb-1">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="text-[13px] line-clamp-1">{getLocation()}</span>
        </div>

        {/* Distance */}
        {distance && (
          <p className="text-xs font-semibold text-green-600 mb-2">{distance}</p>
        )}

        {/* Description */}
        <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
          {description}
        </p>

        {/* Category Badge */}
        <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <span className="text-sm">🦷</span>
          <span>Dental Clinic</span>
        </div>

        {/* Rating and Status Row */}
        <div className="flex items-center gap-2 mb-2.5">
          {rating && (
            <div className="flex items-center gap-1">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[13px] font-semibold text-gray-900">
                {rating.toFixed(1)}
              </span>
              {userRatingsTotal && (
                <span className="text-xs text-gray-500">
                  ({userRatingsTotal})
                </span>
              )}
            </div>
          )}

          {openingStatus && (
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                openingStatus.includes("Open")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <Clock size={11} />
              <span>{openingStatus}</span>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
            SERVICES:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {visibleServices.map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 text-[11px] font-medium px-2 py-1 rounded"
              >
                <CheckCircle size={11} />
                <span>{service}</span>
              </span>
            ))}
            {moreServices > 0 && (
              <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                +{moreServices} more
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
          >
            <Navigation size={14} />
            <span>Directions</span>
          </button>

          <button
            onClick={handleCall}
            disabled={!hasPhoneNumber}
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${
              hasPhoneNumber
                ? "border-green-600 bg-green-50 text-green-600 hover:bg-green-100"
                : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Phone size={14} />
            <span>Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component - displays grid of dummy data or single card
const NearbyDentalCard: React.FC<NearbyDentalCardProps> = (props) => {
  // If no job is provided, render the grid of dummy dental clinics
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_DENTAL_CLINICS.map((dental) => (
          <SingleDentalCard
            key={dental.place_id}
            job={{
              id: dental.place_id,
              title: dental.name,
              location: dental.vicinity,
              distance: dental.distance,
              category: "Dental Clinic",
              jobData: {
                rating: dental.rating,
                user_ratings_total: dental.user_ratings_total,
                opening_hours: dental.opening_hours,
                geometry: dental.geometry,
                business_status: dental.business_status,
                price_level: dental.price_level,
                types: dental.types,
              },
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  // If job is provided, render individual card
  return <SingleDentalCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyDentalCard;
