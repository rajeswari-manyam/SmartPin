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
  Eye,
} from "lucide-react";

/* ================= TYPES ================= */

export interface EyeHospitalService {
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
  years_in_healthcare?: string;
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

// Phone numbers map for eye hospitals
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  eye_1: "09972409886",
  eye_2: "08792483381",
  eye_3: "07383517318",
  eye_4: "07947152974",
};

// Export dummy eye hospital data - EXACT FROM REACT NATIVE
export const DUMMY_EYE_HOSPITALS: EyeHospitalService[] = [
  {
    place_id: "eye_1",
    name: "Safe Vision Super Speciality Eye Hospital",
    vicinity: "Mahanadu Road Currency Nagar, Vijayawada",
    rating: 4.9,
    user_ratings_total: 213,
    photos: [{ photo_reference: "eye_photo_1" }],
    geometry: {
      location: { lat: 16.5062, lng: 80.648 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["eye_hospital", "health"],
    years_in_healthcare: "1 Year in Healthcare",
    distance: 1.5,
  },
  {
    place_id: "eye_2",
    name: "Vasan Eye Care Hospital",
    vicinity: "Prakasham Road Suryarao Pet, Vijayawada",
    rating: 4.5,
    user_ratings_total: 2533,
    photos: [{ photo_reference: "eye_photo_2" }],
    geometry: {
      location: { lat: 16.51, lng: 80.65 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["eye_hospital", "health"],
    years_in_healthcare: "16 Years in Healthcare",
    distance: 2.3,
  },
  {
    place_id: "eye_3",
    name: "Chaitanya Eye Hospital",
    vicinity: "Tikkil Road Moghalraja Puram, Vijayawada",
    rating: 4.5,
    user_ratings_total: 1286,
    photos: [{ photo_reference: "eye_photo_3" }],
    geometry: {
      location: { lat: 16.52, lng: 80.652 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["eye_hospital", "health"],
    distance: 3.1,
  },
];

// Eye hospital images
const EYE_IMAGES_MAP: { [key: string]: string[] } = {
  eye_1: [
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
    "https://images.unsplash.com/photo-1632053002-45dc0e58d4be?w=800",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
  ],
  eye_2: [
    "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800",
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
    "https://images.unsplash.com/photo-1632053002-45dc0e58d4be?w=800",
  ],
  eye_3: [
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800",
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
    "https://images.unsplash.com/photo-1632053002-45dc0e58d4be?w=800",
  ],
  eye_4: [
    "https://images.unsplash.com/photo-1632053002-45dc0e58d4be?w=800",
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
  ],
  eye_5: [
    "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=800",
    "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=800",
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
  ],
  eye_6: [
    "https://images.unsplash.com/photo-1632053002-45dc0e58d4be?w=800",
    "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800",
    "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=800",
  ],
};

// Eye hospital descriptions
const EYE_DESCRIPTIONS_MAP: { [key: string]: string } = {
  eye_1:
    "Safe Vision Super Speciality Eye Hospital - Trending. 4.9★ rating with 213 reviews. Open 24 Hours. 1 Year in Healthcare. Comprehensive eye care services.",
  eye_2:
    "Vasan Eye Care Hospital - Trust verified. 4.5★ rating with 2,533 reviews. Responsive. Open 24 Hours. 16 Years in Healthcare. Multi-specialty eye care center.",
  eye_3:
    "Chaitanya Eye Hospital - Trending. 4.5★ rating with 1,286 reviews. Open 24 Hours. Professional eye care services with experienced specialists.",
  eye_4:
    "Mamtha Eye Hospital - Responsive. 4.1★ rating with 27 reviews. Open 24 Hours. Quality eye care services and treatments.",
  eye_5:
    "Dr. K N Murty's Sankar Eye Hospital - Verified & Responsive. 4.5★ rating with 81 reviews. Open 24 Hours. 42 Years in Healthcare. Experienced eye specialist.",
  eye_6:
    "Dr. Agarwals Eye Hospital - Trending. 4.5★ rating with 1,154 reviews. Open 24 Hours. Leading eye care chain with advanced treatments.",
};

// Eye hospital services offered
const EYE_SERVICES = [
  "Vision Correction",
  "Cataract Surgery",
  "LASIK",
  "Glaucoma Treatment",
  "Retina Care",
  "Pediatric Eye Care",
  "Contact Lenses",
  "Eye Checkup",
];

/* ================= COMPONENT ================= */

interface NearbyEyeCardProps {
  job?: JobType;
  onViewDetails: (job: JobType) => void;
}

// Single Eye Hospital Card Component
const SingleEyeCard: React.FC<{
  job: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos from job data - Using useCallback like React Native
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || "eye_1";
    return EYE_IMAGES_MAP[jobId] || EYE_IMAGES_MAP["eye_1"];
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

  // Get hospital name from job data - Using useCallback like React Native
  const getName = useCallback((): string => {
    if (!job) return "Eye Hospital";
    return job.title || "Eye Hospital";
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
    if (!job) return "Professional eye care services";
    const jobId = job.id || "eye_1";
    return (
      EYE_DESCRIPTIONS_MAP[jobId] ||
      job.description ||
      "Professional eye care services"
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

  // Get phone number for the eye hospital - Using useCallback like React Native
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
    console.warn("⚠️ Failed to load image for eye hospital:", job?.id || "unknown");
    setImageError(true);
  }, [job]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const visibleServices = EYE_SERVICES.slice(0, 4);
  const moreServices = EYE_SERVICES.length > 4 ? EYE_SERVICES.length - 4 : 0;
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
            <Eye size={48} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Hospital Name */}
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
        <div className="inline-flex items-center gap-1 bg-sky-100 text-sky-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <Eye size={12} />
          <span>Eye Hospital</span>
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
                className="inline-flex items-center gap-1 bg-sky-100 text-sky-600 text-[11px] font-medium px-2 py-1 rounded"
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
const NearbyEyeCard: React.FC<NearbyEyeCardProps> = (props) => {
  // If no job is provided, render the grid of dummy eye hospitals
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_EYE_HOSPITALS.map((eye) => (
          <SingleEyeCard
            key={eye.place_id}
            job={{
              id: eye.place_id,
              title: eye.name,
              location: eye.vicinity,
              distance: eye.distance,
              category: "Eye Hospital",
              jobData: {
                rating: eye.rating,
                user_ratings_total: eye.user_ratings_total,
                opening_hours: eye.opening_hours,
                geometry: eye.geometry,
                business_status: eye.business_status,
                price_level: eye.price_level,
                types: eye.types,
                years_in_healthcare: eye.years_in_healthcare,
              },
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  // If job is provided, render individual card
  return <SingleEyeCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyEyeCard;
