/**
 * ============================================================================
 * NearbySkinClinicCard.tsx - Detailed Skin Clinic Card Component
 * ============================================================================
 * 
 * Displays detailed skin clinic information with:
 * - Large image carousel
 * - Full description
 * - Treatments offered
 * - Action buttons (Directions, Call)
 * - Special badges (Verified, Top Rated, Specialists)
 * 
 * @component NearbySkinClinicCard
 * @version 1.0.0 - React Web Version styled like NearbyHotelsCard
 */

import React, { useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  Clock,
  CheckCircle,
  Activity,
  Award,
  Shield,
} from 'lucide-react';

/* ================= TYPES ================= */

export interface JobType {
  id: string;
  title?: string;
  location?: string;
  description?: string;
  jobData?: any;
}

interface NearbySkinClinicCardProps {
  job: JobType;
  onViewDetails: (job: JobType) => void;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  skin_1: '08197720377',
  skin_2: '07942697331',
  skin_3: '07947144686',
  skin_4: '08197581857',
};

const SKIN_IMAGES_MAP: { [key: string]: string[] } = {
  skin_1: [
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
  ],
  skin_2: [
    'https://images.unsplash.com/photo-1629909615957-be38e5533495?w=800',
    'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=800',
  ],
  skin_3: [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800',
    'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=800',
  ],
  skin_4: [
    'https://images.unsplash.com/photo-1571772996211-2f02c9727629?w=800',
    'https://images.unsplash.com/photo-1585459668313-f646acef0bf2?w=800',
  ],
};

const SKIN_DESCRIPTIONS_MAP: { [key: string]: string } = {
  skin_1: 'Top-rated skin clinic with 4.7★ rating. Verified dermatology specialists offering advanced skin treatments, acne care, anti-aging therapies, and cosmetic dermatology. Expert care with modern facilities.',
  skin_2: 'Premium skin clinic with 4.5★ rating. Specializes in laser treatments, chemical peels, and skin rejuvenation. Experienced dermatologists with state-of-the-art equipment.',
  skin_3: 'Award-winning skin clinic with 4.8★ rating. Comprehensive skin care services including treatment for pigmentation, scars, and skin allergies. Trusted by thousands of patients.',
  skin_4: 'Top Rated dermatology clinic with 4.6★ rating. Expert in cosmetic procedures, hair treatments, and advanced skin therapies. Modern facility with certified specialists.',
};

export const DUMMY_SKIN_CLINICS = [
  {
    id: 'skin_1',
    title: 'Elite Dermatology Clinic',
    location: 'Banjara Hills, Hyderabad',
  },
  {
    id: 'skin_2',
    title: 'Radiance Skin Care Center',
    location: 'Jubilee Hills, Hyderabad',
  },
  {
    id: 'skin_3',
    title: 'Skin Specialists Clinic',
    location: 'Gachibowli, Hyderabad',
  },
  {
    id: 'skin_4',
    title: 'Advanced Dermatology',
    location: 'Madhapur, Hyderabad',
  },
];

/* ================= COMPONENT ================= */

const NearbySkinClinicCard: React.FC<NearbySkinClinicCardProps> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos - Using useCallback like NearbyHotelsCard
  const getPhotos = useCallback(() => {
    const jobId = job.id || 'skin_1';
    return SKIN_IMAGES_MAP[jobId] || SKIN_IMAGES_MAP['skin_1'];
  }, [job.id]);

  const photos = getPhotos();
  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

  // Navigate to previous image - Using useCallback like NearbyHotelsCard
  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasPhotos && currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      }
    },
    [hasPhotos, currentImageIndex]
  );

  // Navigate to next image - Using useCallback like NearbyHotelsCard
  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (hasPhotos && currentImageIndex < photos.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      }
    },
    [hasPhotos, currentImageIndex, photos.length]
  );

  // Get name - Using useCallback like NearbyHotelsCard
  const getName = useCallback((): string => {
    return job.title || 'Skin Clinic';
  }, [job.title]);

  // Get location - Using useCallback like NearbyHotelsCard
  const getLocation = useCallback((): string => {
    return job.location || job.description || 'Location';
  }, [job.location, job.description]);

  // Get distance - Using useCallback like NearbyHotelsCard
  const getDistance = useCallback((): string => {
    const jobData = job.jobData as any;
    if (jobData?.distance_text) {
      return jobData.distance_text;
    }
    return '';
  }, [job.jobData]);

  // Get description - Using useCallback like NearbyHotelsCard
  const getDescription = useCallback((): string => {
    const jobId = job.id || 'skin_1';
    return SKIN_DESCRIPTIONS_MAP[jobId] || job.description || 'Professional dermatology services';
  }, [job.id, job.description]);

  // Get rating - Using useCallback like NearbyHotelsCard
  const getRating = useCallback((): number | null => {
    const jobData = job.jobData as any;
    return jobData?.rating || null;
  }, [job.jobData]);

  // Get user ratings total - Using useCallback like NearbyHotelsCard
  const getUserRatingsTotal = useCallback((): number | null => {
    const jobData = job.jobData as any;
    return jobData?.user_ratings_total || null;
  }, [job.jobData]);

  // Get opening status - Using useCallback like NearbyHotelsCard
  const getOpeningStatus = useCallback((): string | null => {
    const jobData = job.jobData as any;
    const isOpen = jobData?.opening_hours?.open_now;
    if (isOpen === undefined || isOpen === null) {
      return null;
    }
    return isOpen ? 'Open Now' : 'Closed';
  }, [job.jobData]);

  // Get special tags - Using useCallback like NearbyHotelsCard
  const getSpecialTags = useCallback((): string[] => {
    const jobData = job.jobData as any;
    return jobData?.special_tags || [];
  }, [job.jobData]);

  // Get treatments/services - Using useCallback like NearbyHotelsCard
  const getTreatments = useCallback((): string[] => {
    const jobData = job.jobData as any;
    return jobData?.amenities || ['Acne Treatment', 'Anti-Aging', 'Laser Therapy', 'Skin Rejuvenation'];
  }, [job.jobData]);

  // Get phone number - Using useCallback like NearbyHotelsCard
  const getPhoneNumber = useCallback((): string | null => {
    const jobId = job.id || '';
    return PHONE_NUMBERS_MAP[jobId] || null;
  }, [job.id]);

  // Handle call button press - Using useCallback like NearbyHotelsCard
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

  // Handle directions button press - Using useCallback like NearbyHotelsCard
  const handleDirections = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const jobData = job.jobData as any;
      const lat = jobData?.geometry?.location?.lat;
      const lng = jobData?.geometry?.location?.lng;

      if (!lat || !lng) {
        alert('Unable to get location coordinates for directions.');
        return;
      }

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${job.id || ''}`;
      window.open(googleMapsUrl, '_blank');
    },
    [job.jobData, job.id]
  );

  // Handle image loading error - Using useCallback like NearbyHotelsCard
  const handleImageError = useCallback(() => {
    console.warn('⚠️ Failed to load image for skin clinic:', job?.id || 'unknown');
    setImageError(true);
  }, [job?.id]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const specialTags = getSpecialTags();
  const treatments = getTreatments();
  const visibleTreatments = treatments.slice(0, 4);
  const moreTreatments = treatments.length > 4 ? treatments.length - 4 : 0;
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
            <Activity size={48} className="text-gray-400" />
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
          <p className="text-xs font-semibold text-cyan-600 mb-2">{distance}</p>
        )}

        {/* Special Tags */}
        {specialTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {specialTags.map((tag, index) => {
              let bgClass = 'bg-cyan-100';
              let textClass = 'text-cyan-800';
              let Icon = Activity;

              if (tag === 'Verified') {
                bgClass = 'bg-green-100';
                textClass = 'text-green-800';
                Icon = Shield;
              } else if (tag === 'Top Rated') {
                bgClass = 'bg-amber-100';
                textClass = 'text-amber-800';
                Icon = Award;
              } else if (tag === 'Specialists') {
                bgClass = 'bg-blue-100';
                textClass = 'text-blue-800';
                Icon = Activity;
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

        {/* Category Badge */}
        <div className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <Activity size={12} />
          <span>Skin Clinic</span>
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
              className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                openingStatus.includes('Open')
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              <Clock size={11} />
              <span>{openingStatus}</span>
            </div>
          )}
        </div>

        {/* Treatments */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
            TREATMENTS:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {visibleTreatments.map((treatment, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-cyan-100 text-cyan-600 text-[11px] font-medium px-2 py-1 rounded"
              >
                <CheckCircle size={11} />
                <span>{treatment}</span>
              </span>
            ))}
            {moreTreatments > 0 && (
              <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                +{moreTreatments} more
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
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${
              hasPhoneNumber
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

export default NearbySkinClinicCard;
