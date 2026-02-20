/**
 * ============================================================================
 * NearbySpaServiceCard.tsx - Detailed Spa Service Card Component
 * ============================================================================
 * 
 * Displays detailed spa information with:
 * - Large image carousel
 * - Full description
 * - Services offered
 * - Action buttons (Directions, Call)
 * - Special badges (JD Trust, JD Verified, Trending)
 * 
 * @component NearbySpaServiceCard
 * @version 1.0.0 - React Web Version styled like NearbyHotelsCard
 */

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
  Waves,
  TrendingUp,
  Shield,
  BadgeCheck,
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  distance?: number | string;
  jobData?: any;
}



/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  spa_1: "07942693293",
  spa_2: "07947426883",
  spa_3: "08904995822",
  spa_4: "07947109989",
};

const SPA_IMAGES_MAP: Record<string, string[]> = {
  spa_1: [
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800",
  ],
  spa_2: [
    "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=800",
    "https://images.unsplash.com/photo-1596178060810-97d1e5e0e5e2?w=800",
  ],
  spa_3: [
    "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800",
  ],
  spa_4: [
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800",
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800",
  ],
};

const SPA_DESCRIPTIONS_MAP: Record<string, string> = {
  spa_1: "JD Verified spa with perfect 5.0★ rating and 150+ reviews. Specializes in ayurvedic oil massage and beauty spa services. Premium facilities with experienced therapists offering traditional and modern wellness treatments.",
  spa_2: "Trending spa massage center with 4.3★ rating and 200+ reviews. Open 24 hours with 3 years in healthcare. Professional staff providing therapeutic massages, aromatherapy, and relaxation services.",
  spa_3: "Top-rated spa with excellent 4.7★ rating and 180+ reviews. JD Trust & Verified with Thai body massage specialization. Expert therapists trained in various massage techniques for ultimate relaxation.",
  spa_4: "Natural healthy body massage center with 4.5★ rating. Specializing in beauty spas for women with focus on rejuvenation and stress relief. Serene environment with premium amenities.",
};

export const DUMMY_SPA_SERVICES = [
  {
    id: 'spa_1',
    title: 'Serenity Ayurvedic Spa',
    location: 'Banjara Hills, Hyderabad',
  },
  {
    id: 'spa_2',
    title: 'Urban Wellness Spa',
    location: 'Jubilee Hills, Hyderabad',
  },
  {
    id: 'spa_3',
    title: 'Thai Essence Spa',
    location: 'Gachibowli, Hyderabad',
  },
  {
    id: 'spa_4',
    title: 'Tranquil Beauty Spa',
    location: 'Madhapur, Hyderabad',
  },
];

/* ================= COMPONENT ================= */

/* ================= COMPONENT ================= */

interface SingleSpaCardProps {
  job: JobType;
  onViewDetails: (job: JobType) => void;
}

const SingleSpaServiceCard: React.FC<SingleSpaCardProps> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos
  const getPhotos = useCallback(() => {
    const jobId = job.id || 'spa_1';
    return SPA_IMAGES_MAP[jobId] || SPA_IMAGES_MAP['spa_1'];
  }, [job.id]);

  const photos = getPhotos();
  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

  // Navigate to previous image
  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasPhotos && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      }
    },
    [hasPhotos, currentImageIndex]
  );

  // Navigate to next image
  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasPhotos && currentImageIndex < photos.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      }
    },
    [hasPhotos, currentImageIndex, photos.length]
  );

  // Get name
  const getName = useCallback((): string => {
    return job.title || 'Spa & Massage Center';
  }, [job.title]);

  // Get location
  const getLocation = useCallback((): string => {
    return job.location || job.description || 'Location';
  }, [job.location, job.description]);

  // Get distance
  const getDistance = useCallback((): string => {
    const jobData = job.jobData as any;
    if (jobData?.distance_text) {
      return jobData.distance_text;
    }
    if (job.distance) {
      return typeof job.distance === "number" ? `${job.distance.toFixed(1)} km` : `${job.distance}`;
    }
    return '';
  }, [job.jobData, job.distance]);

  // Get description
  const getDescription = useCallback((): string => {
    const jobId = job.id || 'spa_1';
    return SPA_DESCRIPTIONS_MAP[jobId] || job.description || 'Professional spa and massage services';
  }, [job.id, job.description]);

  // Get rating
  const getRating = useCallback((): number | null => {
    const jobData = job.jobData as any;
    return jobData?.rating || null;
  }, [job.jobData]);

  // Get user ratings total
  const getUserRatingsTotal = useCallback((): number | null => {
    const jobData = job.jobData as any;
    return jobData?.user_ratings_total || null;
  }, [job.jobData]);

  // Get opening status
  const getOpeningStatus = useCallback((): string | null => {
    const jobData = job.jobData as any;
    const isOpen = jobData?.opening_hours?.open_now;
    if (isOpen === undefined || isOpen === null) {
      return null;
    }
    return isOpen ? 'Open Now' : 'Closed';
  }, [job.jobData]);

  // Get special tags
  const getSpecialTags = useCallback((): string[] => {
    const jobData = job.jobData as any;
    return jobData?.special_tags || [];
  }, [job.jobData]);

  // Get services/amenities
  const getServices = useCallback((): string[] => {
    const jobData = job.jobData as any;
    return jobData?.amenities || ['Body Massage', 'Spa Services', 'Aromatherapy', 'Stress Relief'];
  }, [job.jobData]);

  // Get categories
  const getCategories = useCallback((): string[] => {
    const jobData = job.jobData as any;
    return jobData?.categories || ['Spa', 'Massage Center'];
  }, [job.jobData]);

  // Get phone number
  const getPhoneNumber = useCallback((): string | null => {
    const jobId = job.id || '';
    return PHONE_NUMBERS_MAP[jobId] || null;
  }, [job.id]);

  // Handle call button press
  const handleCall = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const phoneNumber = getPhoneNumber();
      const name = getName();

      if (!phoneNumber) {
        alert(`No contact number available for ${name}.`);
        return;
      }

      const formattedNumber = phoneNumber.replace(/[^0-9+]/g, '');
      const telUrl = `tel:${formattedNumber}`;
      window.location.href = telUrl;
    },
    [getPhoneNumber, getName]
  );

  // Handle directions button press
  const handleDirections = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const jobData = job.jobData as any;
      const lat = jobData?.geometry?.location?.lat || jobData?.latitude;
      const lng = jobData?.geometry?.location?.lng || jobData?.longitude;

      if (!lat || !lng) {
        alert('Unable to get location coordinates for directions.');
        return;
      }

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(googleMapsUrl, '_blank');
    },
    [job.jobData]
  );

  // Handle image loading error
  const handleImageError = useCallback(() => {
    console.warn('⚠️ Failed to load image for spa:', job?.id || 'unknown');
    setImageError(true);
  }, [job?.id]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const specialTags = getSpecialTags();
  const services = getServices();
  const categories = getCategories();
  const visibleServices = services.slice(0, 3);
  const moreServices = services.length > 3 ? services.length - 3 : 0;
  const hasPhoneNumber = getPhoneNumber() !== null;

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
            <Waves size={48} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Spa Name */}
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
          <p className="text-xs font-semibold text-cyan-600 mb-2">{distance}</p>
        )}

        {/* Special Tags */}
        {specialTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {specialTags.map((tag, index) => {
              let bgClass = 'bg-cyan-100';
              let textClass = 'text-cyan-800';
              let Icon = Waves;

              if (tag === 'Trending') {
                bgClass = 'bg-red-100';
                textClass = 'text-red-800';
                Icon = TrendingUp;
              } else if (tag === 'JD Trust') {
                bgClass = 'bg-amber-100';
                textClass = 'text-amber-800';
                Icon = Shield;
              } else if (tag === 'JD Verified') {
                bgClass = 'bg-blue-100';
                textClass = 'text-blue-800';
                Icon = BadgeCheck;
              }

              return (
                <span
                  key={index}
                  className={`inline-flex items-center ${bgClass} ${textClass} text-[10px] font-semibold px-2 py-1 rounded gap-1`}
                >
                  <Icon size={10} />
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Description */}
        <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
          {description}
        </p>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="inline-flex items-center gap-1 bg-cyan-100 px-2 py-1 rounded-full text-cyan-800 text-[10px] font-semibold">
                <CheckCircle size={10} />
                {cat}
              </div>
            ))}
          </div>
        )}

        {/* Category Badge */}
        <div className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <Waves size={12} />
          <span>Spa & Massage</span>
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
                <span className="text-xs text-gray-500">({userRatingsTotal})</span>
              )}
            </div>
          )}

          {openingStatus && (
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus.includes('Open')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
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
                className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-600 text-[11px] font-medium px-2 py-1 rounded"
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
            className="flex-1 flex items-center justify-center gap-1 border-2 border-cyan-600 bg-cyan-50 text-cyan-700 hover:bg-cyan-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
          >
            <Navigation size={14} />
            <span>Directions</span>
          </button>

          <button
            onClick={handleCall}
            disabled={!hasPhoneNumber}
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
              ? 'border-emerald-600 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
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

interface NearbySpaServiceCardProps {
  job?: JobType;
  nearbyData?: any[];
  onViewDetails: (job: JobType) => void;
}

const NearbySpaServiceCard: React.FC<NearbySpaServiceCardProps> = ({ job, nearbyData, onViewDetails }) => {
  if (job) {
    return <SingleSpaServiceCard job={job} onViewDetails={onViewDetails} />;
  }

  // If no job is provided, render a list based on nearbyData or dummy data
  const dataToRender = nearbyData && nearbyData.length > 0
    ? nearbyData.map((item) => ({
      id: item._id || item.id,
      title: item.name || "Spa Service",
      location: item.area || item.vicinity || "Hyderabad",
      description: item.description,
      distance: item.distance,
      category: item.category,
      jobData: item,
    }))
    : DUMMY_SPA_SERVICES;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {dataToRender.map((spaItem) => (
        <SingleSpaServiceCard
          key={spaItem.id}
          job={spaItem as JobType}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default NearbySpaServiceCard;
