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
  Printer,
} from "lucide-react";

/* ================= TYPES ================= */

export interface PrintingService {
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

/* ================= CONSTANTS - PRINTING SERVICES DATA ================= */

// Phone numbers map for printing services
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  printing_1: "08733920988",
  printing_2: "07947116941",
  printing_3: "07942693078",
  printing_4: "07947432163",
};

// Export dummy printing data - Based on JustDial screenshots
export const DUMMY_PRINTING_SERVICES: PrintingService[] = [
  {
    place_id: "printing_1",
    name: "Mentor Print and Media",
    vicinity: "Savedi Pipeline Road, Ahmednagar",
    rating: 4.7,
    user_ratings_total: 57,
    photos: [{ photo_reference: "printing_photo_1" }],
    geometry: {
      location: { lat: 16.5062, lng: 80.648 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["printing_service", "publishing"],
    special_tags: ["Verified", "Trending", "Top Rated"],
    distance: 2.3,
  },
  {
    place_id: "printing_2",
    name: "Pragati Printers",
    vicinity: "Near AK Goud Function Hall Line Balkampet, Hyderabad",
    rating: 4.2,
    user_ratings_total: 42,
    photos: [{ photo_reference: "printing_photo_2" }],
    geometry: {
      location: { lat: 16.507, lng: 80.6485 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["printing_service", "publishing"],
    special_tags: ["Top Search", "Quality Printing"],
    distance: 5.1,
  },
  {
    place_id: "printing_3",
    name: "Iten Solutions",
    vicinity: "Masab Tank, Hyderabad",
    rating: 5.0,
    user_ratings_total: 1,
    photos: [{ photo_reference: "printing_photo_3" }],
    geometry: {
      location: { lat: 16.508, lng: 80.649 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["printing_service", "flex"],
    special_tags: ["Flex Printing", "Quick Service"],
    distance: 6.8,
  },
  {
    place_id: "printing_4",
    name: "Averi Pixel - Printing Services",
    vicinity: "New Hafizpeet Miyapur, Hyderabad",
    rating: 4.8,
    user_ratings_total: 30,
    photos: [{ photo_reference: "printing_photo_4" }],
    geometry: {
      location: { lat: 16.509, lng: 80.65 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["printing_service", "publishing"],
    special_tags: ["Trending", "Banner Printing", "On Site Services"],
    distance: 10.4,
  },
];

// Printing service images
const PRINTING_IMAGES_MAP: { [key: string]: string[] } = {
  printing_1: [
    "https://images.unsplash.com/photo-1612538498456-e861df91e4d6?w=800",
    "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800",
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800",
  ],
  printing_2: [
    "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800",
    "https://images.unsplash.com/photo-1612538498456-e861df91e4d6?w=800",
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800",
  ],
  printing_3: [
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800",
    "https://images.unsplash.com/photo-1612538498456-e861df91e4d6?w=800",
    "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800",
  ],
  printing_4: [
    "https://images.unsplash.com/photo-1612538498456-e861df91e4d6?w=800",
    "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800",
    "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800",
  ],
};

// Printing service descriptions
const PRINTING_DESCRIPTIONS_MAP: { [key: string]: string } = {
  printing_1:
    "Verified printing service with 4.7★ rating and 57 reviews. Trending. Top Rated. Professional printing and media services with quick turnaround.",
  printing_2:
    "Top Search printing service with 4.2★ rating and 42 reviews. Quality Printing. Color and Photo printing available. Reliable service provider.",
  printing_3:
    "Premium printing service with 5.0★ rating. Flex Printing specialist. Quick Service. Professional quality printing solutions.",
  printing_4:
    "Trending printing service with 4.8★ rating and 30 reviews. Banner Printing. On Site Services. Book and color printing available.",
};

// Printing services offered
const PRINTING_SERVICES = [
  "Digital Printing",
  "Offset Printing",
  "Banner Printing",
  "Business Cards",
  "Flex Printing",
  "Color Printing",
  "Book Binding",
  "Photo Printing",
  "Sticker Printing",
  "Invitation Cards",
];

/* ================= COMPONENT ================= */

interface NearbyPrintingCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SinglePrintingCard: React.FC<NearbyPrintingCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos from job data
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || "printing_1";
    return PRINTING_IMAGES_MAP[jobId] || PRINTING_IMAGES_MAP["printing_1"];
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

  // Get printing service name from job data
  const getName = useCallback((): string => {
    if (!job) return "Printing Service";
    return job.title || "Printing Service";
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
    if (!job) return "Professional printing and publishing services";
    const jobId = job.id || "printing_1";
    return (
      PRINTING_DESCRIPTIONS_MAP[jobId] ||
      job.description ||
      "Professional printing and publishing services"
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

  // Get phone number for the printing service
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

      // Format phone number for tel: URL
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
    console.warn("⚠️ Failed to load image for printing service:", job?.id || "unknown");
    setImageError(true);
  }, [job]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const specialTags = getSpecialTags();
  const visibleServices = PRINTING_SERVICES.slice(0, 4);
  const moreServices =
    PRINTING_SERVICES.length > 4 ? PRINTING_SERVICES.length - 4 : 0;
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
            <span className="text-6xl">🖨️</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Printing Service Name */}
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
                className="bg-orange-100 text-orange-800 text-[10px] font-semibold px-2 py-0.5 rounded"
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
          <Printer size={12} />
          <span>Printing Service</span>
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
const NearbyPrintingCard: React.FC<NearbyPrintingCardProps> = (props) => {
  // If no job is provided, render the grid of dummy printing services
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_PRINTING_SERVICES.map((printing) => (
          <SinglePrintingCard
            key={printing.place_id}
            job={{
              id: printing.place_id,
              title: printing.name,
              location: printing.vicinity,
              distance: printing.distance,
              category: "Printing Service",
              jobData: {
                rating: printing.rating,
                user_ratings_total: printing.user_ratings_total,
                opening_hours: printing.opening_hours,
                geometry: printing.geometry,
                business_status: printing.business_status,
                price_level: printing.price_level,
                types: printing.types,
                special_tags: printing.special_tags,
              },
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  // If job is provided, render individual card
  return <SinglePrintingCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyPrintingCard;
