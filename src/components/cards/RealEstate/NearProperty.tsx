import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  Flame,
  BadgeCheck,
  Zap,
  Building2,
} from "lucide-react";

/* ================= TYPES ================= */

export interface PropertyDealer {
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
  types: string[];
  special_tags: string[];
  amenities: string[];
  distance: number;
}

/* ================= CONSTANTS ================= */

// Phone numbers map for property dealers
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  property_1: "08511204803",
  property_2: "09054749813",
  property_3: "08197570624",
  property_4: "07947415598",
};

// Export dummy property dealers data
export const DUMMY_PROPERTY_DEALERS: PropertyDealer[] = [
  {
    place_id: "property_1",
    name: "JD Real Estate Consultants",
    vicinity: "Jubilee Hills, Hyderabad",
    rating: 4.7,
    user_ratings_total: 234,
    photos: [{ photo_reference: "property_photo_1" }],
    geometry: {
      location: { lat: 17.4326, lng: 78.4071 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    types: ["real_estate_agency", "point_of_interest"],
    special_tags: ["Verified", "Top Search"],
    amenities: ["Residential", "Commercial", "Legal Support", "Documentation"],
    distance: 2.3,
  },
  {
    place_id: "property_2",
    name: "Skyline Property Solutions",
    vicinity: "Banjara Hills, Hyderabad",
    rating: 4.5,
    user_ratings_total: 189,
    photos: [{ photo_reference: "property_photo_2" }],
    geometry: {
      location: { lat: 17.4239, lng: 78.4538 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    types: ["real_estate_agency", "point_of_interest"],
    special_tags: ["Top Rated", "Quick Response"],
    amenities: ["Villas", "Apartments", "Consultation", "Home Loans"],
    distance: 3.7,
  },
  {
    place_id: "property_3",
    name: "Elite Realty Services",
    vicinity: "Gachibowli, Hyderabad",
    rating: 4.6,
    user_ratings_total: 156,
    photos: [{ photo_reference: "property_photo_3" }],
    geometry: {
      location: { lat: 17.4399, lng: 78.3489 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    types: ["real_estate_agency", "point_of_interest"],
    special_tags: ["Quick Response"],
    amenities: ["Rentals", "PG Accommodation", "Documentation", "Site Visits"],
    distance: 5.1,
  },
  {
    place_id: "property_4",
    name: "Prime Property Hub",
    vicinity: "HITEC City, Hyderabad",
    rating: 4.8,
    user_ratings_total: 298,
    photos: [{ photo_reference: "property_photo_4" }],
    geometry: {
      location: { lat: 17.4435, lng: 78.3772 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    types: ["real_estate_agency", "point_of_interest"],
    special_tags: ["Verified", "Trending"],
    amenities: ["Legal Services", "Registration", "Investment Guidance", "NRI Properties"],
    distance: 4.5,
  },
];

// Property dealer images
const PROPERTY_IMAGES_MAP: { [key: string]: string[] } = {
  property_1: [
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800",
    "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  ],
  property_2: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
    "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800",
  ],
  property_3: [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800",
  ],
  property_4: [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800",
  ],
};

// Property dealer descriptions
const PROPERTY_DESCRIPTIONS_MAP: { [key: string]: string } = {
  property_1:
    "JD Verified real estate agent with 12 years of experience in residential & commercial properties. Specializing in premium properties in Hyderabad.",
  property_2:
    "Top rated agent specializing in residential properties and consultation services. Expert in luxury villas and apartments with home loan assistance.",
  property_3:
    "Quick response agent handling rentals and documentation services. Professional approach to PG accommodations and rental properties.",
  property_4:
    "Verified agent with legal and registration services. Specializing in investment properties and NRI real estate solutions.",
};

/* ================= COMPONENT ================= */

interface NearbyPropertyDealersCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SinglePropertyDealerCard: React.FC<NearbyPropertyDealersCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos from job data
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || "property_1";
    return PROPERTY_IMAGES_MAP[jobId] || PROPERTY_IMAGES_MAP["property_1"];
  }, [job]);

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

  // Get property dealer name from job data
  const getName = useCallback((): string => {
    if (!job) return "Property Dealer";
    return job.title || "Property Dealer";
  }, [job]);

  // Get location string from job data
  const getLocation = useCallback((): string => {
    if (!job) return "Location";
    return job.location || job.description || "Location";
  }, [job]);

  // Get distance string from job data
  const getDistance = useCallback((): string => {
    if (!job) return "";
    if (job.distance !== undefined && job.distance !== null) {
      const distanceNum = Number(job.distance);
      if (!isNaN(distanceNum)) {
        return `${distanceNum.toFixed(1)} km away`;
      }
    }
    const jobData = job.jobData as any;
    return jobData?.distance_text || "";
  }, [job]);

  // Get description
  const getDescription = useCallback((): string => {
    if (!job) return "Professional real estate services";
    const jobId = job.id || "property_1";
    return (
      PROPERTY_DESCRIPTIONS_MAP[jobId] ||
      job.description ||
      "Professional real estate services"
    );
  }, [job]);

  // Get rating from job data
  const getRating = useCallback((): number | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    return jobData?.rating || null;
  }, [job]);

  // Get user ratings total from job data
  const getUserRatingsTotal = useCallback((): number | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    return jobData?.user_ratings_total || null;
  }, [job]);

  // Get opening hours status from job data
  const getOpeningStatus = useCallback((): string | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    const isOpen = jobData?.opening_hours?.open_now;

    if (isOpen === undefined || isOpen === null) {
      return null;
    }

    return isOpen ? "Open Now" : "Closed";
  }, [job]);

  // Get special tags from job data
  const getSpecialTags = useCallback((): string[] => {
    if (!job) return [];
    const jobData = job.jobData as any;
    return jobData?.special_tags || [];
  }, [job]);

  // Get amenities from job data
  const getAmenities = useCallback((): string[] => {
    if (!job) return [];
    const jobData = job.jobData as any;
    return jobData?.amenities || [];
  }, [job]);

  // Get phone number for the property dealer
  const getPhoneNumber = useCallback((): string | null => {
    if (!job) return null;
    const jobId = job.id || "";
    return PHONE_NUMBERS_MAP[jobId] || null;
  }, [job]);

  // Handle call button press
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

      const formattedNumber = phoneNumber.replace(/[^0-9+]/g, "");
      const telUrl = `tel:${formattedNumber}`;
      window.location.href = telUrl;
    },
    [job, getPhoneNumber, getName]
  );

  // Handle directions button press
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

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${job.id || ""}`;
      window.open(googleMapsUrl, "_blank");
    },
    [job]
  );

  // Handle image loading error
  const handleImageError = useCallback(() => {
    console.warn("⚠️ Failed to load image for property dealer:", job?.id || "unknown");
    setImageError(true);
  }, [job]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const specialTags = getSpecialTags();
  const amenities = getAmenities();
  const visibleAmenities = amenities.slice(0, 4);
  const moreAmenities = amenities.length > 4 ? amenities.length - 4 : 0;
  const hasPhoneNumber = getPhoneNumber() !== null;

  // Early return if job is not provided
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
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-amber-50 to-orange-50">
            <Building2 size={60} className="text-amber-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Property Dealer Name */}
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
          <p className="text-xs font-semibold text-amber-600 mb-2">{distance}</p>
        )}

        {/* Special Tags */}
        {specialTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {specialTags.map((tag, index) => {
              const isTopSearch = tag === "Top Search";
              const isVerified = tag === "Verified";
              const isQuickResponse = tag === "Quick Response";

              return (
                <span
                  key={index}
                  className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1"
                >
                  {isTopSearch && <Flame size={10} />}
                  {isVerified && <BadgeCheck size={10} />}
                  {isQuickResponse && <Zap size={10} />}
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
        <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <span className="text-sm">🏢</span>
          <span>Property Dealer</span>
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
              className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus.includes("Open")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}
            >
              <span>{openingStatus}</span>
            </div>
          )}
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
              SERVICES:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visibleAmenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-amber-100 text-amber-600 text-[11px] font-medium px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
              {moreAmenities > 0 && (
                <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                  +{moreAmenities} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-amber-600 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
          >
            <Navigation size={14} />
            <span>Directions</span>
          </button>

          <button
            onClick={handleCall}
            disabled={!hasPhoneNumber}
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
                ? "border-emerald-600 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
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
const NearbyPropertyDealersCard: React.FC<NearbyPropertyDealersCardProps> = (props) => {
  // If no job is provided, render the grid of dummy property dealers
  if (!props.job) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-bold text-gray-800">
            🏢 Nearby Property Dealers
          </h2>
          <span className="text-sm text-gray-500">
            {DUMMY_PROPERTY_DEALERS.length} dealers found
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {DUMMY_PROPERTY_DEALERS.map((dealer) => (
            <SinglePropertyDealerCard
              key={dealer.place_id}
              job={{
                id: dealer.place_id,
                title: dealer.name,
                location: dealer.vicinity,
                distance: dealer.distance,
                category: "Property Dealer",
                jobData: {
                  rating: dealer.rating,
                  user_ratings_total: dealer.user_ratings_total,
                  opening_hours: dealer.opening_hours,
                  geometry: dealer.geometry,
                  business_status: dealer.business_status,
                  types: dealer.types,
                  special_tags: dealer.special_tags,
                  amenities: dealer.amenities,
                  distance_text: `${dealer.distance.toFixed(1)} km away`,
                },
              }}
              onViewDetails={props.onViewDetails}
            />
          ))}
        </div>
      </div>
    );
  }

  // If job is provided, render individual card
  return <SinglePropertyDealerCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyPropertyDealersCard;
