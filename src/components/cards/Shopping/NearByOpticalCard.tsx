/**
 * ============================================================================
 * NearbyOpticalCard.tsx - Detailed Optical Shop Card for Shopping
 * ============================================================================
 * 
 * Displays detailed optical shop information with:
 * - Large image carousel
 * - Full description
 * - Opening hours
 * - Services offered
 * - Action buttons (Call & Directions)
 * 
 * @component NearbyOpticalCard
 * @version 2.0.0 - OPTICAL SHOPS ONLY (React + Tailwind)
 */

import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  CheckCircle,
  Glasses,
  Flame,
  Tag,
  Zap,
  Clock,
} from "lucide-react";

/* ================= TYPES ================= */

export interface OpticalShop {
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
  distance: number;
  timings?: string;
  services?: string[];
  special_tags?: string[];
  distance_text?: string;
  has_offers?: boolean;
  offers_count?: number;
  years_in_business?: string;
  has_booking?: boolean;
}

/* ================= CONSTANTS - EXACT FROM REACT NATIVE ================= */

// Phone numbers map for optical shops (based on JustDial data)
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  optical_shop_1: "07095652428", // Titan Eye Plus
  optical_shop_2: "07022209756", // Srinivasa Opticals
  optical_shop_3: "08197488446", // Ray Ban Exclusive Optical Store
  optical_shop_4: "07947150431", // Vision Care Opticals
  optical_shop_5: "07947123615", // Additional optical shop
};

// Export dummy optical shop data - EXACT FROM REACT NATIVE
export const DUMMY_OPTICAL_SHOPS: OpticalShop[] = [
  {
    place_id: "optical_shop_1",
    name: "Titan Eye Plus",
    vicinity: "Idpl X Road IDPL, Hyderabad",
    rating: 4.9,
    user_ratings_total: 513,
    photos: [{ photo_reference: "optical_shop_photo_1" }],
    geometry: {
      location: { lat: 17.51, lng: 78.42 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    timings: "9:00 am - 9:00 pm",
    services: ["Opticians", "Spectacle Dealers"],
    special_tags: ["5 Offers", "Trending"],
    distance_text: "1.1 km",
    distance: 1.1,
    has_offers: true,
    offers_count: 5,
  },
  {
    place_id: "optical_shop_2",
    name: "Srinivasa Opticals",
    vicinity: "Raju Colony Road Bala Nagar, Hyderabad",
    rating: 5.0,
    user_ratings_total: 225,
    photos: [{ photo_reference: "optical_shop_photo_2" }],
    geometry: {
      location: { lat: 17.505, lng: 78.415 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    timings: "9:30 am - 9:30 pm",
    services: ["Opticians"],
    special_tags: ["Responsive", "JD Verified"],
    distance_text: "2.6 km",
    distance: 2.6,
    years_in_business: "37 Years in Healthcare",
    has_booking: true,
  },
  {
    place_id: "optical_shop_3",
    name: "Ray Ban Exclusive Optical Store",
    vicinity: "Vasavi Nagar Karkhana, Hyderabad",
    rating: 4.1,
    user_ratings_total: 163,
    photos: [{ photo_reference: "optical_shop_photo_3" }],
    geometry: {
      location: { lat: 17.508, lng: 78.418 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 3,
    services: ["Sunglass Dealers-Rayban", "Eye Clinics"],
    special_tags: ["Trending"],
    distance_text: "5.2 km",
    distance: 5.2,
  },
  {
    place_id: "optical_shop_4",
    name: "Vision Care Opticals",
    vicinity: "Suchitra Road Suchitra Cross Road, Hyderabad",
    rating: 4.8,
    user_ratings_total: 306,
    photos: [{ photo_reference: "optical_shop_photo_4" }],
    geometry: {
      location: { lat: 17.512, lng: 78.422 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    services: ["Opticians", "Optical Lens Dealers"],
    special_tags: ["Top Rated"],
    distance_text: "1.9 km",
    distance: 1.9,
  },
];

// Optical shop images - Eyewear, spectacles, and optical store themed
const OPTICAL_SHOP_IMAGES_MAP: { [key: string]: string[] } = {
  optical_shop_1: [
    "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=800", // Eyeglasses display
    "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800", // Optical store interior
    "https://images.unsplash.com/photo-1516534775068-ba3e7458af70?w=800", // Sunglasses collection
  ],
  optical_shop_2: [
    "https://images.unsplash.com/photo-1606663889134-b1dedb5ed8b7?w=800", // Eye examination
    "https://images.unsplash.com/photo-1622519407650-3df9883f76a5?w=800", // Glasses frames
    "https://images.unsplash.com/photo-1588497859490-85d1c17db96d?w=800", // Optical shop
  ],
  optical_shop_3: [
    "https://images.unsplash.com/photo-1509695507497-903c140c43b0?w=800", // Ray-Ban sunglasses
    "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800", // Sunglasses display
    "https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800", // Eyewear collection
  ],
  optical_shop_4: [
    "https://images.unsplash.com/photo-1582142306909-195724d06e3d?w=800", // Optical frames
    "https://images.unsplash.com/photo-1608234807882-a7e5cd6e9165?w=800", // Eye care
    "https://images.unsplash.com/photo-1577803645773-f96470509666?w=800", // Store interior
  ],
};

// Optical shop descriptions
const OPTICAL_SHOP_DESCRIPTIONS_MAP: { [key: string]: string } = {
  optical_shop_1:
    "Premium optical store with 4.9★ rating and 513 reviews. Wide range of eyewear, spectacles, and contact lenses. Top-rated and trending in the area. Features 5 special offers and professional optician services.",
  optical_shop_2:
    "Highly-rated optical shop with perfect 5.0★ rating and 225 reviews. 37 years of healthcare experience. Responsive service with book appointment facility. Specializes in eye care and quality spectacles with verified JD certification.",
  optical_shop_3:
    "Exclusive Ray-Ban optical store with 4.1★ rating and 163 reviews. Premium sunglasses and eyewear available. Trending destination for designer sunglasses, eye clinics, and optical solutions. Known for authentic Ray-Ban products.",
  optical_shop_4:
    "Top-rated optical shop with 4.8★ rating and 306 reviews. Specializes in quality optical lenses and frames. Trusted by local community for professional optician services and comprehensive eye care solutions.",
};

// Optical shop services based on JustDial data
const OPTICAL_SHOP_SERVICES_MAP: { [key: string]: string[] } = {
  optical_shop_1: ["Opticians", "Spectacle Dealers"],
  optical_shop_2: ["Opticians", "Book Appointment"],
  optical_shop_3: ["Sunglass Dealers-Rayban", "Eye Clinics"],
  optical_shop_4: ["Opticians", "Optical Lens Dealers"],
};

/* ================= COMPONENT ================= */

interface NearbyOpticalCardProps {
  job?: any; // Accept generic job prop for compatibility with ShoppingList
  onViewDetails: (job: any) => void;
}

const SingleOpticalCard: React.FC<NearbyOpticalCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos from job data - Using useCallback like React Native
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || "optical_shop_1";
    return (
      OPTICAL_SHOP_IMAGES_MAP[jobId] || OPTICAL_SHOP_IMAGES_MAP["optical_shop_1"]
    );
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

  // Get optical shop name from job data - Using useCallback like React Native
  const getName = useCallback((): string => {
    if (!job) return "Optical Shop";
    return job.title || "Optical Shop";
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
    if (!job)
      return "Complete optical shop destination with wide range of eyewear, spectacles, contact lenses, and professional eye care services";
    const jobId = job.id || "optical_shop_1";
    return (
      OPTICAL_SHOP_DESCRIPTIONS_MAP[jobId] ||
      job.description ||
      "Complete optical shop destination with wide range of eyewear, spectacles, contact lenses, and professional eye care services"
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

  // Get phone number for the optical shop - Using useCallback like React Native
  const getPhoneNumber = useCallback((): string | null => {
    if (!job) return null;
    const jobId = job.id || "";
    return PHONE_NUMBERS_MAP[jobId] || null;
  }, [job]);

  // Get services based on optical shop ID - Using useCallback like React Native
  const getServices = useCallback((): string[] => {
    if (!job) return ["Opticians", "Eye Care"];
    return OPTICAL_SHOP_SERVICES_MAP[job.id] || ["Opticians", "Eye Care"];
  }, [job]);

  // Get popularity badge based on ratings - Using useCallback like React Native
  const getPopularityBadge = useCallback((): string | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    const rating = jobData?.rating;

    // Top Rated badge for highest rated shops
    if (job.id === "optical_shop_4" || (rating && rating >= 4.8)) return "Top Rated";

    // Trending badge for popular shops
    if (job.id === "optical_shop_1" || job.id === "optical_shop_3") return "Trending";

    // Responsive badge
    if (job.id === "optical_shop_2") return "Responsive";

    return null;
  }, [job]);

  // Get special offers badge - Using useCallback like React Native
  const getOfferBadge = useCallback((): string | null => {
    if (!job) return null;
    // Special offer for Titan Eye Plus
    if (job.id === "optical_shop_1") return "5 Offers";

    return null;
  }, [job]);

  // Get years in business - Using useCallback like React Native
  const getYearsInBusiness = useCallback((): string | null => {
    if (!job) return null;
    if (job.id === "optical_shop_2") return "37 Years in Healthcare";
    return null;
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
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${
        job.id || ""
      }`;

      window.open(googleMapsUrl, "_blank");
    },
    [job]
  );

  // Handle image loading error - Using useCallback like React Native
  const handleImageError = useCallback(() => {
    console.warn(
      "⚠️ Failed to load image for optical shop:",
      job?.id || "unknown"
    );
    setImageError(true);
  }, [job]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const distance = getDistance();
  const description = getDescription();
  const services = getServices();
  const visibleServices = services.slice(0, 3);
  const moreServices = services.length > 3 ? services.length - 3 : 0;
  const hasPhoneNumber = getPhoneNumber() !== null;
  const popularityBadge = getPopularityBadge();
  const offerBadge = getOfferBadge();
  const yearsInBusiness = getYearsInBusiness();

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

            {/* Offer Badge */}
            {offerBadge && (
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-xl">
                <Tag size={12} />
                <span>{offerBadge}</span>
              </div>
            )}

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
            <Glasses size={48} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Shop Name */}
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
          <p className="text-xs font-semibold text-purple-600 mb-2">{distance}</p>
        )}

        {/* Years in Business */}
        {yearsInBusiness && (
          <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-1 rounded-md mb-2">
            <Clock size={12} />
            <span>{yearsInBusiness}</span>
          </div>
        )}

        {/* Description */}
        <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
          {description}
        </p>

        {/* Category Badge */}
        <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <Glasses size={12} />
          <span>Optical Shop</span>
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

          {popularityBadge && (
            <div
              className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                popularityBadge === "Responsive"
                  ? "bg-green-100 text-green-700"
                  : popularityBadge === "Top Rated"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {popularityBadge === "Trending" && <Flame size={11} />}
              {popularityBadge === "Top Rated" && <Star size={11} />}
              {popularityBadge === "Responsive" && <Zap size={11} />}
              <span>{popularityBadge}</span>
            </div>
          )}
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
              SERVICES:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {visibleServices.map((service, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[11px] font-medium px-2 py-1 rounded"
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
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-purple-600 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
          >
            <Navigation size={14} />
            <span>Directions</span>
          </button>

          <button
            onClick={handleCall}
            disabled={!hasPhoneNumber}
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${
              hasPhoneNumber
                ? "border-purple-600 bg-purple-50 text-purple-700 hover:bg-purple-100"
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
const NearbyOpticalCard: React.FC<NearbyOpticalCardProps> = (props) => {
  // If no job is provided, render the grid of dummy optical shops
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_OPTICAL_SHOPS.map((shop) => (
          <SingleOpticalCard
            key={shop.place_id}
            job={{
              id: shop.place_id,
              title: shop.name,
              location: shop.vicinity,
              distance: shop.distance,
              category: "Optical Shop",
              jobData: {
                rating: shop.rating,
                user_ratings_total: shop.user_ratings_total,
                opening_hours: shop.opening_hours,
                geometry: shop.geometry,
                business_status: shop.business_status,
                price_level: shop.price_level,
                timings: shop.timings,
                services: shop.services,
                special_tags: shop.special_tags,
                years_in_business: shop.years_in_business,
                has_booking: shop.has_booking,
              },
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  // If job is provided, render individual card
  return (
    <SingleOpticalCard job={props.job} onViewDetails={props.onViewDetails} />
  );
};

export default NearbyOpticalCard;
