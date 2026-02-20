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
  Settings,
} from "lucide-react";

/* ================= TYPES ================= */

export interface MachineWorkService {
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

// Phone numbers map for machine work services
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  machine_1: "07947056169",
  machine_2: "07942698031",
  machine_3: "07947117550",
  machine_4: "07942687068",
  machine_5: "09035504120",
};

// Export dummy machine work data
export const DUMMY_MACHINE_WORK: MachineWorkService[] = [
  {
    place_id: "machine_1",
    name: "General Sewing Machine Works",
    vicinity: "Bakaram, Hyderabad",
    rating: 4.3,
    user_ratings_total: 160,
    photos: [{ photo_reference: "machine_photo_1" }],
    geometry: {
      location: { lat: 17.4065, lng: 78.4772 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["machine_work", "repair"],
    special_tags: [
      "GST",
      "Trust",
      "Verified",
      "Trending",
    ],
    distance: 10.0,
  },
  {
    place_id: "machine_2",
    name: "MK Refrigerator & Washing Machine Work",
    vicinity: "Kalapather-Ramnas Pura, Hyderabad",
    rating: 4.0,
    user_ratings_total: 3,
    photos: [{ photo_reference: "machine_photo_2" }],
    geometry: {
      location: { lat: 17.407, lng: 78.478 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["machine_work", "repair"],
    special_tags: ["Second Hand Washing Machine Dealers", "Washing Machine Repair & Services"],
    distance: 16.0,
  },
  {
    place_id: "machine_3",
    name: "Ahmed Sewing Machine Repairing Works",
    vicinity: "Raghavendra Nagar Uppal, Hyderabad",
    rating: 4.2,
    user_ratings_total: 26,
    photos: [{ photo_reference: "machine_photo_3" }],
    geometry: {
      location: { lat: 17.408, lng: 78.479 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["machine_work", "repair"],
    special_tags: ["Trending", "Sewing Machine Repair & Services", "Sewing Machine Dealers"],
    distance: 14.6,
  },
  {
    place_id: "machine_4",
    name: "Khaja Sewing Machine Works",
    vicinity: "Prem nagar Hafeezpet, Hyderabad",
    rating: 4.7,
    user_ratings_total: 3,
    photos: [{ photo_reference: "machine_photo_4" }],
    geometry: {
      location: { lat: 17.409, lng: 78.48 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["machine_work", "repair"],
    special_tags: ["Trending", "Sewing Machine Repair & Services-Usha", "Sewing Machine Repair & Services"],
    distance: 10.6,
  },
  {
    place_id: "machine_5",
    name: "Keerthi Computer Embroidery And Machine Works",
    vicinity: "Plot No 16 Kukatpally Kukatpally Kukatpally, Hyderabad",
    rating: 3.0,
    user_ratings_total: 1,
    photos: [{ photo_reference: "machine_photo_5" }],
    geometry: {
      location: { lat: 17.4075, lng: 78.4795 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["machine_work", "embroidery"],
    special_tags: ["Embroidery Job Works", "Computerised Embroidery Machine Dealers"],
    distance: 12.5,
  },
];

// Machine work images
const MACHINE_IMAGES_MAP: { [key: string]: string[] } = {
  machine_1: [
    "https://images.unsplash.com/photo-1520214572569-0d593dc3f1f2?w=800",
    "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  ],
  machine_2: [
    "https://images.unsplash.com/photo-1585659722983-3a675dabf23d?w=800",
    "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=800",
    "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800",
  ],
  machine_3: [
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    "https://images.unsplash.com/photo-1520214572569-0d593dc3f1f2?w=800",
    "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800",
  ],
  machine_4: [
    "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
    "https://images.unsplash.com/photo-1520214572569-0d593dc3f1f2?w=800",
  ],
  machine_5: [
    "https://images.unsplash.com/photo-1520214572569-0d593dc3f1f2?w=800",
    "https://images.unsplash.com/photo-1550985616-10810253b84d?w=800",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  ],
};

// Machine work descriptions
const MACHINE_DESCRIPTIONS_MAP: { [key: string]: string } = {
  machine_1:
    "Top-rated machine work service with 4.3★ rating and 160 reviews. GST registered. Trusted and Verified. Trending service provider. Professional sewing machine repairs and maintenance.",
  machine_2:
    "Reliable refrigerator and washing machine repair service with 4.0★ rating. Second Hand Washing Machine Dealers. Washing Machine Repair & Services. Quality service guaranteed.",
  machine_3:
    "Trending sewing machine repair service with 4.2★ rating and 26 reviews. Sewing Machine Repair & Services. Sewing Machine Dealers. Professional repair and maintenance.",
  machine_4:
    "Highly rated sewing machine works with 4.7★ rating. Trending service provider. Sewing Machine Repair & Services-Usha. Specialized in Usha machine repairs.",
  machine_5:
    "Computer embroidery and machine works with 3.0★ rating. Embroidery Job Works. Computerised Embroidery Machine Dealers. Modern embroidery solutions.",
};

// Machine work services offered
const MACHINE_SERVICES = [
  "Sewing Machine Repair",
  "Embroidery Work",
  "Machine Maintenance",
  "Parts Replacement",
  "On-Site Service",
  "All Brands Serviced",
  "Quick Turnaround",
  "Warranty Available",
];

/* ================= COMPONENT ================= */

interface MachineWorkCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleMachineWorkCard: React.FC<MachineWorkCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos from job data
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || "machine_1";
    return MACHINE_IMAGES_MAP[jobId] || MACHINE_IMAGES_MAP["machine_1"];
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

  // Get machine work name from job data
  const getName = useCallback((): string => {
    if (!job) return "Machine Work Service";
    return job.title || "Machine Work Service";
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
        return `${distanceNum.toFixed(1)} km`;
      }
    }
    return "";
  }, [job]);

  // Get description
  const getDescription = useCallback((): string => {
    if (!job) return "Professional machine work services";
    const jobId = job.id || "machine_1";
    return (
      MACHINE_DESCRIPTIONS_MAP[jobId] ||
      job.description ||
      "Professional machine work services"
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

  // Get phone number for the machine work service
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
    console.warn("⚠️ Failed to load image for machine work:", job?.id || "unknown");
    setImageError(true);
  }, [job]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const specialTags = getSpecialTags();
  const visibleServices = MACHINE_SERVICES.slice(0, 4);
  const moreServices =
    MACHINE_SERVICES.length > 4 ? MACHINE_SERVICES.length - 4 : 0;
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
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-6xl">⚙️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Machine Work Name */}
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
          <p className="text-xs font-semibold text-blue-600 mb-2">{distance}</p>
        )}

        {/* Special Tags */}
        {specialTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {specialTags.map((tag, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded"
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
        <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <Settings size={12} />
          <span>Machine Work</span>
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
                className="inline-flex items-center gap-1 bg-blue-100 text-blue-600 text-[11px] font-medium px-2 py-1 rounded"
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
                ? "border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-100"
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
const MachineWorkCard: React.FC<MachineWorkCardProps> = (props) => {
  // If no job is provided, render the grid of dummy machine work services
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_MACHINE_WORK.map((service) => (
          <SingleMachineWorkCard
            key={service.place_id}
            job={{
              id: service.place_id,
              title: service.name,
              location: service.vicinity,
              distance: service.distance,
              category: "Machine Work",
              jobData: {
                rating: service.rating,
                user_ratings_total: service.user_ratings_total,
                opening_hours: service.opening_hours,
                geometry: service.geometry,
                business_status: service.business_status,
                price_level: service.price_level,
                types: service.types,
                special_tags: service.special_tags,
              },
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  // If job is provided, render individual card
  return <SingleMachineWorkCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default MachineWorkCard;
