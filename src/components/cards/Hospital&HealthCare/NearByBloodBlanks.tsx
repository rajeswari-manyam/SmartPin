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
  Shield,
  Tag,
} from "lucide-react";

/* ================= TYPES ================= */

export interface BloodBank {
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
  price_level?: number;
  types: string[];
  special_tags: string[];
  distance: number;
  blood_types?: string[];
}

/* ================= CONSTANTS ================= */

// Phone numbers map for blood banks
const PHONE_NUMBERS_MAP: { [key: string]: string } = {
  blood_bank_1: "08632245678",
  blood_bank_2: "08632234567",
  blood_bank_3: "08632223456",
  blood_bank_4: "08632212345",
};

// Blood bank images
const BLOOD_BANK_IMAGES_MAP: { [key: string]: string[] } = {
  blood_bank_1: [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    "https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800",
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800",
  ],
  blood_bank_2: [
    "https://images.unsplash.com/photo-1580281657521-6c6d1f37b6e2?w=800",
    "https://images.unsplash.com/photo-1615461066841-6712d0d8e55c?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
  ],
  blood_bank_3: [
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
    "https://images.unsplash.com/photo-1615461066159-fea0960485d5?w=800",
  ],
  blood_bank_4: [
    "https://images.unsplash.com/photo-1584467735871-bd7a5c85b6b1?w=800",
    "https://images.unsplash.com/photo-1615461066841-6712d0d8e55c?w=800",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
  ],
};

// Blood bank descriptions
const BLOOD_BANK_DESCRIPTIONS_MAP: { [key: string]: string } = {
  blood_bank_1:
    "Trusted blood bank with 4.5★ rating and 120 reviews. Available 24/7. Verified service. All blood types available. Professional blood banking services with trained staff.",
  blood_bank_2:
    "Premium blood bank with 4.3★ rating and 89 reviews. Verified and trusted. Quick service. Maintains high standards of blood storage and safety protocols.",
  blood_bank_3:
    "Rotary affiliated blood bank with 4.6★ rating and 145 reviews. Trusted organization. Available 24 hours. Emergency blood supply services.",
  blood_bank_4:
    "Modern blood bank facility with 4.4★ rating and 95 reviews. Quick response. All blood groups available. Professional emergency blood services.",
};

// Blood services offered
const BLOOD_SERVICES = [
  "All Blood Types",
  "24/7 Availability",
  "Emergency Supply",
  "Blood Donation",
  "Platelet Donation",
  "Component Separation",
  "Blood Testing",
  "Safe Storage",
];

/* ================= DUMMY DATA ================= */

export const DUMMY_BLOOD_BANKS: BloodBank[] = [
  {
    place_id: "blood_bank_1",
    name: "New City Blood Bank",
    vicinity: "Dornakal Road, Suryarao Pet, Vijayawada",
    rating: 4.5,
    user_ratings_total: 120,
    photos: [{ photo_reference: "blood_bank_photo_1" }],
    geometry: {
      location: { lat: 16.5089, lng: 80.6493 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["blood_bank", "health"],
    special_tags: ["Verified", "24/7 Service", "Trust"],
    distance: 2.3,
    blood_types: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  },
  {
    place_id: "blood_bank_2",
    name: "Vijaya Sri Blood Bank",
    vicinity: "Dornakal Road, Suryarao Pet, Vijayawada",
    rating: 4.3,
    user_ratings_total: 89,
    photos: [{ photo_reference: "blood_bank_photo_2" }],
    geometry: {
      location: { lat: 16.5095, lng: 80.6488 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["blood_bank", "health"],
    special_tags: ["Verified", "Trust", "Quick Service"],
    distance: 1.9,
    blood_types: ["A+", "B+", "O+", "AB+"],
  },
  {
    place_id: "blood_bank_3",
    name: "Rotary Red Cross Blood Bank Hall",
    vicinity: "G S Raju Street, Gandhi Nagar, Vijayawada",
    rating: 4.6,
    user_ratings_total: 145,
    photos: [{ photo_reference: "blood_bank_photo_3" }],
    geometry: {
      location: { lat: 16.5102, lng: 80.6497 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["blood_bank", "health", "charity"],
    special_tags: ["Trust", "24/7 Service", "Verified"],
    distance: 2.1,
    blood_types: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  },
  {
    place_id: "blood_bank_4",
    name: "Life Care Blood Bank",
    vicinity: "Benz Circle, Vijayawada",
    rating: 4.4,
    user_ratings_total: 95,
    photos: [{ photo_reference: "blood_bank_photo_4" }],
    geometry: {
      location: { lat: 16.5065, lng: 80.6502 },
    },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["blood_bank", "health"],
    special_tags: ["Quick Service", "Trust"],
    distance: 3.4,
    blood_types: ["A+", "B+", "O+", "O-", "AB+"],
  },
];

/* ================= SINGLE CARD COMPONENT ================= */

interface SingleBloodBankCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleBloodBankCard: React.FC<SingleBloodBankCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Get all available photos
  const getPhotos = useCallback(() => {
    if (!job) return [];
    const jobId = job.id || "blood_bank_1";
    return BLOOD_BANK_IMAGES_MAP[jobId] || BLOOD_BANK_IMAGES_MAP["blood_bank_1"];
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

  // Get blood bank name
  const getName = useCallback((): string => {
    if (!job) return "Blood Bank";
    return job.title || "Blood Bank";
  }, [job]);

  // Get location
  const getLocation = useCallback((): string => {
    if (!job) return "Location";
    return job.location || job.description || "Location";
  }, [job]);

  // Get distance
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
    if (!job) return "Professional blood banking services";
    const jobId = job.id || "blood_bank_1";
    return (
      BLOOD_BANK_DESCRIPTIONS_MAP[jobId] ||
      job.description ||
      "Professional blood banking services"
    );
  }, [job]);

  // Get rating
  const getRating = useCallback((): number | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    return jobData?.rating || null;
  }, [job]);

  // Get user ratings total
  const getUserRatingsTotal = useCallback((): number | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    return jobData?.user_ratings_total || null;
  }, [job]);

  // Get opening status
  const getOpeningStatus = useCallback((): string | null => {
    if (!job) return null;
    const jobData = job.jobData as any;
    const isOpen = jobData?.opening_hours?.open_now;

    if (isOpen === undefined || isOpen === null) {
      return null;
    }

    return isOpen ? "Available 24/7" : "Currently Closed";
  }, [job]);

  // Get special tags
  const getSpecialTags = useCallback((): string[] => {
    if (!job) return [];
    const jobData = job.jobData as any;
    return jobData?.special_tags || [];
  }, [job]);

  // Get blood types
  const getBloodTypes = useCallback((): string[] => {
    if (!job) return [];
    const jobData = job.jobData as any;
    return jobData?.blood_types || [];
  }, [job]);

  // Get phone number
  const getPhoneNumber = useCallback((): string | null => {
    if (!job) return null;
    const jobId = job.id || "";
    return PHONE_NUMBERS_MAP[jobId] || null;
  }, [job]);

  // Handle call button
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

  // Handle directions button
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

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${
        job.id || ""
      }`;

      window.open(googleMapsUrl, "_blank");
    },
    [job]
  );

  // Handle image error
  const handleImageError = useCallback(() => {
    console.warn(
      "⚠️ Failed to load image for blood bank:",
      job?.id || "unknown"
    );
    setImageError(true);
  }, [job]);

  // Compute derived values
  const rating = getRating();
  const userRatingsTotal = getUserRatingsTotal();
  const openingStatus = getOpeningStatus();
  const distance = getDistance();
  const description = getDescription();
  const specialTags = getSpecialTags();
  const bloodTypes = getBloodTypes();
  const visibleServices = BLOOD_SERVICES.slice(0, 4);
  const moreServices =
    BLOOD_SERVICES.length > 4 ? BLOOD_SERVICES.length - 4 : 0;
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
            <span className="text-6xl">🩸</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        {/* Blood Bank Name */}
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
                className="bg-red-100 text-red-700 text-[10px] font-semibold px-2 py-0.5 rounded"
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
          <span className="text-sm">🩸</span>
          <span>Blood Bank</span>
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
                openingStatus.includes("Available") ||
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

        {/* Blood Types Available */}
        {bloodTypes.length > 0 && (
          <div className="mb-3">
            <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
              BLOOD TYPES AVAILABLE:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {bloodTypes.slice(0, 4).map((type, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-red-50 text-red-700 text-[11px] font-semibold px-2 py-1 rounded border border-red-200"
                >
                  {type}
                </span>
              ))}
              {bloodTypes.length > 4 && (
                <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                  +{bloodTypes.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

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
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${
              hasPhoneNumber
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

/* ================= MAIN COMPONENT ================= */

interface NearbyBloodBanksProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const NearbyBloodBanks: React.FC<NearbyBloodBanksProps> = (props) => {
  // If no job is provided, render the grid of dummy blood banks
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_BLOOD_BANKS.map((bank) => (
          <SingleBloodBankCard
            key={bank.place_id}
            job={{
              id: bank.place_id,
              title: bank.name,
              location: bank.vicinity,
              distance: bank.distance,
              category: "Blood Bank",
              jobData: {
                rating: bank.rating,
                user_ratings_total: bank.user_ratings_total,
                opening_hours: bank.opening_hours,
                geometry: bank.geometry,
                business_status: bank.business_status,
                price_level: bank.price_level,
                types: bank.types,
                special_tags: bank.special_tags,
                blood_types: bank.blood_types,
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
    <SingleBloodBankCard job={props.job} onViewDetails={props.onViewDetails} />
  );
};

export default NearbyBloodBanks;
