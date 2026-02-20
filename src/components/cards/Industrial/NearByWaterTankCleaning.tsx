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
  Droplet,
} from "lucide-react";

/* ================= TYPES ================= */

export interface WaterTankCleaningService {
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
  opening_hours?: { open_now: boolean };
  special_tags: string[];
  distance: number;
  verified?: boolean;
  trending?: boolean;
  popular?: boolean;
  top_search?: boolean;
  suggestions?: string;
  response_time?: string;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  service_1: "08045794871",
  service_2: "09035274957",
  service_3: "09972347994",
  service_4: "09972379866",
  service_5: "09876543210",
};

export const DUMMY_WATER_TANK_SERVICES: WaterTankCleaningService[] = [
  {
    place_id: "service_1",
    name: "Clean Sense Water Tank Cleaning Services",
    vicinity: "AS Rao Nagar, Hyderabad",
    rating: 4.7,
    user_ratings_total: 306,
    photos: [{ photo_reference: "1" }],
    geometry: { location: { lat: 17.385, lng: 78.4867 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    special_tags: ["Mechanised Cleaning", "Chemical Free"],
    distance: 2.4,
    verified: true,
    top_search: true,
  },
  {
    place_id: "service_2",
    name: "Mr Mahendra Tank Cleaning",
    vicinity: "Mehdipatnam, Hyderabad",
    rating: 4.9,
    user_ratings_total: 233,
    photos: [{ photo_reference: "2" }],
    geometry: { location: { lat: 17.39, lng: 78.44 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    special_tags: ["Underground Tank", "Residential Service"],
    distance: 4.1,
    popular: true,
    response_time: "Responds in 2 Hours",
  },
  {
    place_id: "service_3",
    name: "Hygienic Tank Cleaning Services",
    vicinity: "Chaitanyapuri, Hyderabad",
    rating: 4.1,
    user_ratings_total: 17,
    photos: [{ photo_reference: "3" }],
    geometry: { location: { lat: 17.375, lng: 78.495 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    special_tags: ["Disinfection Service", "Commercial"],
    distance: 5.8,
    verified: true,
    trending: true,
    suggestions: "Excellent service - 5 Suggestions",
    response_time: "Responds in 30 Mins",
  },
];

/* ================= IMAGES ================= */

const SERVICE_IMAGES_MAP: Record<string, string[]> = {
  service_1: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800",
  ],
  service_2: [
    "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800",
  ],
  service_3: [
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800",
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?w=800",
  ],
};

const CLEANING_SERVICES = [
  "Overhead Tank Cleaning",
  "Underground Tank",
  "Residential Service",
  "Commercial Service",
  "Chemical-Free Cleaning",
  "Disinfection Service",
];

/* ================= COMPONENT ================= */

interface Props {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleWaterTankCard: React.FC<Props> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // ✅ Safe data accessors
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || job.place_id || "service_1";
    return SERVICE_IMAGES_MAP[jobId] || SERVICE_IMAGES_MAP["service_1"] || [];
  }, [job]);

  const photos = getPhotos();
  const currentPhoto = photos[currentImageIndex] || null;

  const getPhoneNumber = useCallback(() => {
    if (!job) return null;
    const jobId = job.id || job.place_id || "";
    return PHONE_NUMBERS_MAP[jobId] || null;
  }, [job]);

  // ✅ Safe data getters with fallbacks
  const getName = () => job?.title || job?.name || "Water Tank Cleaning Service";
  const getLocation = () => job?.location || job?.vicinity || "Location not specified";
  const getDistance = () => {
    const dist = job?.distance || job?.jobData?.distance;
    return typeof dist === 'number' ? dist : 0;
  };
  const getRating = () => job?.jobData?.rating || job?.rating || 0;
  const getReviews = () => job?.jobData?.user_ratings_total || job?.user_ratings_total || 0;
  const getTags = () => job?.jobData?.special_tags || job?.special_tags || [];
  const getVerified = () => job?.jobData?.verified || job?.verified || false;
  const getTrending = () => job?.jobData?.trending || job?.trending || false;
  const getPopular = () => job?.jobData?.popular || job?.popular || false;
  const getTopSearch = () => job?.jobData?.top_search || job?.top_search || false;
  const getSuggestions = () => job?.jobData?.suggestions || job?.suggestions || null;
  const getResponseTime = () => job?.jobData?.response_time || job?.response_time || null;
  const getOpeningStatus = () => {
    const isOpen = job?.jobData?.opening_hours?.open_now || job?.opening_hours?.open_now;
    return isOpen ? "Available Today" : "Currently Closed";
  };

  const handleCall = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const phone = getPhoneNumber();
      if (!phone) {
        alert("Phone number not available");
        return;
      }
      window.location.href = `tel:${phone}`;
    },
    [getPhoneNumber]
  );

  const handleDirections = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      const geometry = job?.jobData?.geometry || job?.geometry;
      const location = geometry?.location;

      if (!location?.lat || !location?.lng) {
        alert("Location not available");
        return;
      }

      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`,
        "_blank"
      );
    },
    [job]
  );

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < photos.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  if (!job) {
    console.warn("⚠️ WaterTankCard: No job data provided");
    return null;
  }

  console.log("💧 WaterTankCard rendering with job:", {
    id: job.id || job.place_id,
    title: getName(),
    hasPhotos: photos.length > 0,
    hasPhone: !!getPhoneNumber(),
  });

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {currentPhoto && !imageError ? (
          <>
            <img
              src={currentPhoto}
              onError={() => {
                console.warn("⚠️ Image load failed:", currentPhoto);
                setImageError(true);
              }}
              className="w-full h-full object-cover"
              alt={getName()}
            />
            {photos.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {currentImageIndex < photos.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}

                {/* Image counter */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <span className="text-6xl mb-2">💧</span>
            <span className="text-sm">Water Tank Cleaning</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Title with Status Badges */}
        <div className="flex items-start gap-2 mb-1.5">
          <h3 className="text-[17px] font-bold text-gray-900 leading-snug line-clamp-2 flex-1">
            {getName()}
          </h3>
          <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
            {getVerified() && (
              <span className="bg-blue-100 text-blue-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                ✓ Verified
              </span>
            )}
            {getTrending() && (
              <span className="bg-orange-100 text-orange-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                🔥 Trending
              </span>
            )}
            {getPopular() && (
              <span className="bg-amber-100 text-amber-700 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                ⭐ Popular
              </span>
            )}
            {getTopSearch() && (
              <span className="bg-red-100 text-red-600 text-[10px] font-semibold px-1.5 py-0.5 rounded">
                🔍 Top Search
              </span>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-500 mb-1">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="text-[13px] line-clamp-1">{getLocation()}</span>
        </div>

        {/* Distance */}
        {getDistance() > 0 && (
          <p className="text-xs font-semibold text-blue-600 mb-2">
            {getDistance().toFixed(1)} km away
          </p>
        )}

        {/* Rating + Status */}
        <div className="flex items-center gap-2 mb-2">
          {getRating() > 0 && (
            <div className="flex items-center gap-1">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold">{getRating().toFixed(1)}</span>
              {getReviews() > 0 && (
                <span className="text-xs text-gray-500">
                  ({getReviews()})
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 bg-green-100 text-green-700 text-[11px] font-semibold px-1.5 py-0.5 rounded">
            <Clock size={11} />
            <span>{getOpeningStatus()}</span>
          </div>
        </div>

        {/* Suggestions */}
        {getSuggestions() && (
          <div className="flex items-center gap-1 mb-2">
            <span className="text-red-600 text-sm">💬</span>
            <span className="text-[12px] text-gray-700 font-medium">
              "{getSuggestions()}"
            </span>
          </div>
        )}

        {/* Special Tags */}
        {getTags().length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {getTags().slice(0, 3).map((tag: string, index: number) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 text-[11px] font-medium px-2 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Category Badge */}
        <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2.5">
          <Droplet size={11} />
          <span>Water Tank Cleaning</span>
        </div>

        {/* Services */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
            SERVICES:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CLEANING_SERVICES.slice(0, 4).map((service, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-[11px] font-medium px-2 py-1 rounded"
              >
                <CheckCircle size={11} />
                <span>{service}</span>
              </span>
            ))}
            {CLEANING_SERVICES.length > 4 && (
              <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                +{CLEANING_SERVICES.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-xs py-2.5 rounded-lg hover:bg-indigo-100 transition active:scale-95"
          >
            <Navigation size={14} />
            Directions
          </button>

          <button
            onClick={handleCall}
            disabled={!getPhoneNumber()}
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition active:scale-95 ${getPhoneNumber()
              ? "border-green-600 bg-green-50 text-green-700 hover:bg-green-100"
              : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Phone size={14} />
            {getPhoneNumber() ? "Call" : "No Phone"}
          </button>
        </div>

        {/* Response Time */}
        {getResponseTime() && (
          <p className="text-center text-[10px] text-gray-500 mt-2">
            {getResponseTime()}
          </p>
        )}
      </div>
    </div>
  );
};

/* ================= WRAPPER ================= */

const WaterTankCleaningCard: React.FC<Props> = (props) => {
  console.log("💧 WaterTankCleaningCard wrapper:", {
    hasJob: !!props.job,
    jobData: props.job,
  });

  if (!props.job) {
    console.log("📋 Rendering dummy water tank services grid");
    return (
      <div className="space-y-6">
      
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DUMMY_WATER_TANK_SERVICES.map((service) => {
            const jobData = {
              id: service.place_id,
              place_id: service.place_id,
              title: service.name,
              name: service.name,
              location: service.vicinity,
              vicinity: service.vicinity,
              distance: service.distance,
              jobData: {
                rating: service.rating,
                user_ratings_total: service.user_ratings_total,
                special_tags: service.special_tags,
                opening_hours: service.opening_hours,
                geometry: service.geometry,
                verified: service.verified,
                trending: service.trending,
                popular: service.popular,
                top_search: service.top_search,
                suggestions: service.suggestions,
                response_time: service.response_time,
              },
              // Also at root level for backward compatibility
              rating: service.rating,
              user_ratings_total: service.user_ratings_total,
              special_tags: service.special_tags,
              opening_hours: service.opening_hours,
              geometry: service.geometry,
              verified: service.verified,
              trending: service.trending,
              popular: service.popular,
              top_search: service.top_search,
              suggestions: service.suggestions,
              response_time: service.response_time,
            };

            console.log("💧 Creating card for:", service.place_id, jobData);

            return (
              <SingleWaterTankCard
                key={service.place_id}
                job={jobData}
                onViewDetails={props.onViewDetails}
              />
            );
          })}
        </div>

     </div>
    );
  }

  console.log("💧 Rendering single water tank card");
  return <SingleWaterTankCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default WaterTankCleaningCard;
