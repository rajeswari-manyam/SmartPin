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
  Bike,
} from "lucide-react";

/* ================= TYPES ================= */

export interface BikeRepairService {
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

/* ================= CONSTANTS ================= */

// Phone numbers map for bike repair services
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  bike_repair_1: "0704821667",
  bike_repair_2: "07043189878",
  bike_repair_3: "08197420033",
  bike_repair_4: "07383349778",
};

// Export dummy bike repair data
export const DUMMY_BIKE_REPAIRS: BikeRepairService[] = [
  {
    place_id: "bike_repair_1",
    name: "Sri Sai Laxmi Maruthi Bike Zone",
    vicinity: "Pipeline Road Jeedimetla, Hyderabad",
    rating: 4.2,
    user_ratings_total: 17,
    photos: [{ photo_reference: "bike_repair_photo_1" }],
    geometry: {
      location: { lat: 17.5081, lng: 78.4382 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["bike_repair", "motorcycle_service"],
    special_tags: [
      "Trending",
      "Motorcycle Repair & Services",
    ],
    distance: 2.8,
  },
  {
    place_id: "bike_repair_2",
    name: "Star Motors Aurthorised Two Wheeler Showroom",
    vicinity: "Moosapet, Hyderabad",
    rating: 3.8,
    user_ratings_total: 348,
    photos: [{ photo_reference: "bike_repair_photo_2" }],
    geometry: {
      location: { lat: 17.4892, lng: 78.4365 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["bike_repair", "motorcycle_dealer"],
    special_tags: [
      "Verified",
      "Top Search",
      "Company Authorised Dealer",
      "Same Day Delivery",
      "Delivery Available",
    ],
    distance: 4.0,
  },
  {
    place_id: "bike_repair_3",
    name: "Marvel Bikes Pvt Ltd",
    vicinity: "Sanjeeviya Nagar Colony Tar Bund, Hyderabad",
    rating: 4.1,
    user_ratings_total: 251,
    photos: [{ photo_reference: "bike_repair_photo_3" }],
    geometry: {
      location: { lat: 17.4856, lng: 78.4421 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["bike_repair", "motorcycle_dealer"],
    special_tags: [
      "Trust",
      "Verified",
      "Responsive",
      "Company Authorised Dealer",
    ],
    distance: 4.5,
  },
  {
    place_id: "bike_repair_4",
    name: "Appple Motors",
    vicinity: "Bhagya Laxmi Colony-Jeedimetla, Hyderabad",
    rating: 3.7,
    user_ratings_total: 130,
    photos: [{ photo_reference: "bike_repair_photo_4" }],
    geometry: {
      location: { lat: 17.5095, lng: 78.4395 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["bike_repair", "motorcycle_service"],
    special_tags: [
      "Breakdown Support Over Phone",
    ],
    distance: 2.1,
  },
];

// Bike repair images
const BIKE_REPAIR_IMAGES_MAP: { [key: string]: string[] } = {
  bike_repair_1: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
  ],
  bike_repair_2: [
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
  ],
  bike_repair_3: [
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800",
  ],
  bike_repair_4: [
    "https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    "https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=800",
  ],
};

// Bike repair descriptions
const BIKE_REPAIR_DESCRIPTIONS_MAP: { [key: string]: string } = {
  bike_repair_1:
    "Trending bike repair service with 4.2★ rating and 17 reviews. Motorcycle Repair & Services specialist. Professional bike maintenance and repair services available.",
  bike_repair_2:
    "Top Search authorised two-wheeler showroom with 3.8★ rating and 348 reviews. Verified Company Authorised Dealer. Same Day Delivery and Delivery Available. Expert motorcycle service.",
  bike_repair_3:
    "Trusted bike dealership with 4.1★ rating and 251 reviews. Verified and Responsive service. Company Authorised Dealer. Professional motorcycle care and maintenance.",
  bike_repair_4:
    "Reliable bike service center with 3.7★ rating and 130 reviews. Breakdown Support Over Phone available. Quick response and professional motorcycle repair services.",
};

// Bike repair services offered
const BIKE_REPAIR_SERVICES = [
  "Oil Change",
  "Brake Service",
  "Engine Tune-up",
  "Tire Replacement",
  "Chain Lubrication",
  "Battery Service",
  "Periodic Maintenance",
  "Spare Parts",
];

/* ================= COMPONENT ================= */

interface NearbyBikeRepairCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleBikeRepairCard: React.FC<NearbyBikeRepairCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos from job data
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || "bike_repair_1";
    return BIKE_REPAIR_IMAGES_MAP[jobId] || BIKE_REPAIR_IMAGES_MAP["bike_repair_1"];
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

  // Get bike repair name from job data
  const getName = useCallback((): string => {
    if (!job) return "Bike Repair Service";
    return job.title || "Bike Repair Service";
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
    return "";
  }, [job]);

  // Get description
  const getDescription = useCallback((): string => {
    if (!job) return "Professional bike repair and maintenance services";
    const jobId = job.id || "bike_repair_1";
    return (
      BIKE_REPAIR_DESCRIPTIONS_MAP[jobId] ||
      job.description ||
      "Professional bike repair and maintenance services"
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

    return isOpen ? "Open Now" : "Currently Closed";
  }, [job]);

  // Get special tags from job data
  const getSpecialTags = useCallback((): string[] => {
    if (!job) return [];
    const jobData = job.jobData as any;
    return jobData?.special_tags || [];
  }, [job]);

  // Get phone number for the bike repair service
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

  // Handle image loading error
  const handleImageError = useCallback(() => {
    console.warn("⚠️ Failed to load image for bike repair:", job?.id || "unknown");
    setImageError(true);
  }, [job]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const specialTags = getSpecialTags();
  const visibleServices = BIKE_REPAIR_SERVICES.slice(0, 4);
  const moreServices =
    BIKE_REPAIR_SERVICES.length > 4 ? BIKE_REPAIR_SERVICES.length - 4 : 0;
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
            <span className="text-6xl">🏍️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Bike Repair Name */}
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
          <p className="text-xs font-semibold text-orange-600 mb-2">{distance}</p>
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
        <div className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <Bike size={13} />
          <span>Bike Repair Service</span>
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
                className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-[11px] font-medium px-2 py-1 rounded"
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
            className="flex-1 flex items-center justify-center gap-1 border-2 border-orange-600 bg-orange-50 text-orange-700 hover:bg-orange-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
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
const NearbyBikeRepairCard: React.FC<NearbyBikeRepairCardProps> = (props) => {
  // If no job is provided, render the grid of dummy bike repairs
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_BIKE_REPAIRS.map((bikeRepair) => (
          <SingleBikeRepairCard
            key={bikeRepair.place_id}
            job={{
              id: bikeRepair.place_id,
              title: bikeRepair.name,
              location: bikeRepair.vicinity,
              distance: bikeRepair.distance,
              category: "Bike Repair Service",
              jobData: {
                rating: bikeRepair.rating,
                user_ratings_total: bikeRepair.user_ratings_total,
                opening_hours: bikeRepair.opening_hours,
                geometry: bikeRepair.geometry,
                business_status: bikeRepair.business_status,
                price_level: bikeRepair.price_level,
                types: bikeRepair.types,
                special_tags: bikeRepair.special_tags,
              },
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  // If job is provided, render individual card
  return <SingleBikeRepairCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyBikeRepairCard;
