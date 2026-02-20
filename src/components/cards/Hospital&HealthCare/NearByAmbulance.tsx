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

export interface AmbulanceService {
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
  special_tags: string[];
  distance: number;
}

/* ================= CONSTANTS - EXACT FROM REACT NATIVE ================= */

// Phone numbers map for ambulance services
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  ambulance_1: "09035504120",
  ambulance_2: "08511405104",
  ambulance_3: "09054083279",
  ambulance_4: "08971370172",
  ambulance_5: "108",
};

// Export dummy ambulance data - EXACT FROM REACT NATIVE
export const DUMMY_AMBULANCES: AmbulanceService[] = [
  {
    place_id: "ambulance_1",
    name: "Kaveri Ambulance Service",
    vicinity: "Kamayya Thopu Vijayawada Civil Court, Vijayawada",
    rating: 4.2,
    user_ratings_total: 63,
    photos: [{ photo_reference: "ambulance_photo_1" }],
    geometry: {
      location: { lat: 16.5062, lng: 80.648 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["ambulance_service", "health"],
    special_tags: [
      "Top Search",
      "24 Hours Ambulance Services",
      "Verified",
      "Trust",
    ],
    distance: 1.5,
  },
  {
    place_id: "ambulance_2",
    name: "Bejawada Ambulance Services",
    vicinity: "New Giripuram Labbipet, Vijayawada",
    rating: 4.3,
    user_ratings_total: 24,
    photos: [{ photo_reference: "ambulance_photo_2" }],
    geometry: {
      location: { lat: 16.507, lng: 80.6485 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["ambulance_service", "health"],
    special_tags: ["Verified", "Responsive", "24 Hours Ambulance Services"],
    distance: 3.0,
  },
  {
    place_id: "ambulance_3",
    name: "Ramesh Ambulance Services",
    vicinity: "Pushpa Hotel Road Suryarao Pet, Vijayawada",
    rating: 4.7,
    user_ratings_total: 66,
    photos: [{ photo_reference: "ambulance_photo_3" }],
    geometry: {
      location: { lat: 16.508, lng: 80.649 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["ambulance_service", "health"],
    special_tags: ["Responsive", "Domestic Ambulance Services"],
    distance: 4.5,
  },
  {
    place_id: "ambulance_4",
    name: "Lucky Ambulance Service",
    vicinity: "Pippula Road Singh Nagar, Vijayawada",
    rating: 4.9,
    user_ratings_total: 36,
    photos: [{ photo_reference: "ambulance_photo_4" }],
    geometry: {
      location: { lat: 16.509, lng: 80.65 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["ambulance_service", "health"],
    special_tags: ["Trending", "Great customer service", "On Site Services"],
    distance: 2.8,
  },
  {
    place_id: "ambulance_5",
    name: "Emergency Ambulance 108",
    vicinity: "Emergency Services, Vijayawada",
    rating: 4.5,
    user_ratings_total: 1250,
    photos: [{ photo_reference: "ambulance_photo_5" }],
    geometry: {
      location: { lat: 16.5075, lng: 80.6495 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 1,
    types: ["ambulance_service", "health", "emergency"],
    special_tags: ["Emergency", "24/7 Service", "Free Service", "Quick Response"],
    distance: 0.5,
  },
];

// Ambulance images
const AMBULANCE_IMAGES_MAP: { [key: string]: string[] } = {
  ambulance_1: [
    "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800",
    "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800",
    "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800",
  ],
  ambulance_2: [
    "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800",
    "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800",
    "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800",
  ],
  ambulance_3: [
    "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800",
    "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800",
    "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800",
  ],
  ambulance_4: [
    "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800",
    "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800",
    "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800",
  ],
  ambulance_5: [
    "https://images.unsplash.com/photo-1638202993928-7267aad84c31?w=800",
    "https://images.unsplash.com/photo-1587745416684-47953f16f02f?w=800",
    "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=800",
  ],
};

// Ambulance descriptions
const AMBULANCE_DESCRIPTIONS_MAP: { [key: string]: string } = {
  ambulance_1:
    "Top Search ambulance service with 4.2★ rating and 63 reviews. Available 24 Hours. Verified and Trusted. Quick Response. Reliable emergency medical services.",
  ambulance_2:
    "Verified ambulance service with 4.3★ rating and 24 reviews. 24 Hours Ambulance Services. Responsive. Quick medical assistance available.",
  ambulance_3:
    "Responsive ambulance service with 4.7★ rating and 66 reviews. Domestic Ambulance Services. Available Now. Quick Response service available.",
  ambulance_4:
    "Trending ambulance service with 4.9★ rating and 36 reviews. Great customer service. On Site Services. Professional emergency medical care.",
  ambulance_5:
    "Emergency ambulance service 108 with 4.5★ rating and 1250 reviews. Free 24/7 Service. Quick Response. Government emergency medical service.",
};

// Ambulance services offered
const AMBULANCE_SERVICES = [
  "Emergency Transport",
  "ICU Ambulance",
  "Oxygen Support",
  "Cardiac Care",
  "24/7 Availability",
  "Trained Paramedics",
  "Basic Life Support",
  "Advanced Life Support",
];

/* ================= COMPONENT ================= */

interface NearbyAmbulanceCardProps {
  job?: any; // Accept generic job prop for compatibility with HospitalServiceList
  onViewDetails: (job: any) => void;
}

const SingleAmbulanceCard: React.FC<NearbyAmbulanceCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos from job data - Using useCallback like React Native
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || "ambulance_1";
    return AMBULANCE_IMAGES_MAP[jobId] || AMBULANCE_IMAGES_MAP["ambulance_1"];
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

  // Get ambulance name from job data - Using useCallback like React Native
  const getName = useCallback((): string => {
    if (!job) return "Ambulance Service";
    return job.title || "Ambulance Service";
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
    if (!job) return "Professional ambulance services";
    const jobId = job.id || "ambulance_1";
    return (
      AMBULANCE_DESCRIPTIONS_MAP[jobId] ||
      job.description ||
      "Professional ambulance services"
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

    return isOpen ? "Available 24/7" : "Currently Unavailable";
  }, [job]);

  // Get special tags from job data - Using useCallback like React Native
  const getSpecialTags = useCallback((): string[] => {
    if (!job) return [];
    const jobData = job.jobData as any;
    return jobData?.special_tags || [];
  }, [job]);

  // Get phone number for the ambulance service - Using useCallback like React Native
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

      // Create Google Maps URL with exact coordinates
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${job.id || ""}`;

      window.open(googleMapsUrl, "_blank");
    },
    [job]
  );

  // Handle image loading error - Using useCallback like React Native
  const handleImageError = useCallback(() => {
    console.warn("⚠️ Failed to load image for ambulance:", job?.id || "unknown");
    setImageError(true);
  }, [job]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const specialTags = getSpecialTags();
  const visibleServices = AMBULANCE_SERVICES.slice(0, 4);
  const moreServices =
    AMBULANCE_SERVICES.length > 4 ? AMBULANCE_SERVICES.length - 4 : 0;
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
            <span className="text-6xl">🚑</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Ambulance Name */}
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
          <p className="text-xs font-semibold text-red-600 mb-2">{distance}</p>
        )}

        {/* Special Tags */}
        {specialTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {specialTags.map((tag, index) => (
              <span
                key={index}
                className="bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
          {description}
        </p>

        {/* Category Badge */}
        <div className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <span className="text-sm">🚑</span>
          <span>Ambulance Service</span>
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
              className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus.includes("Available") ||
                openingStatus.includes("24/7")
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
                className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[11px] font-medium px-2 py-1 rounded"
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
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
              ? "border-red-600 bg-red-50 text-red-600 hover:bg-red-100"
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

// Wrapper component - displays grid of dummy data or single card
const NearbyAmbulanceCard: React.FC<NearbyAmbulanceCardProps> = (props) => {
  // If no job is provided, render the grid of dummy ambulances
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_AMBULANCES.map((ambulance) => (
          <SingleAmbulanceCard
            key={ambulance.place_id}
            job={{
              id: ambulance.place_id,
              title: ambulance.name,
              location: ambulance.vicinity,
              distance: ambulance.distance,
              category: "Ambulance Service",
              jobData: {
                rating: ambulance.rating,
                user_ratings_total: ambulance.user_ratings_total,
                opening_hours: ambulance.opening_hours,
                geometry: ambulance.geometry,
                business_status: ambulance.business_status,
                price_level: ambulance.price_level,
                types: ambulance.types,
                special_tags: ambulance.special_tags,
              },
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  // If job is provided, render individual card
  return <SingleAmbulanceCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyAmbulanceCard;
