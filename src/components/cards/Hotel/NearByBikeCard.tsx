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

export interface BikeService {
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

const PHONE_NUMBERS_MAP: Record<string, string> = {
  bike_1: "08147131783",
  bike_2: "07947418185",
  bike_3: "07947126588",
  bike_4: "07947146982",
};

export const DUMMY_BIKES: BikeService[] = [
  {
    place_id: "bike_1",
    name: "BOONGG COM",
    vicinity: "APHB Colony, Gachibowli, Hyderabad",
    rating: 4.5,
    user_ratings_total: 474,
    photos: [{ photo_reference: "bike_1" }],
    geometry: { location: { lat: 17.442, lng: 78.35 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["bike_rental"],
    special_tags: ["Top Search"],
    distance: 11.6,
  },
  {
    place_id: "bike_2",
    name: "Onn Bikes",
    vicinity: "Gowlidoddi, Hyderabad",
    rating: 4.3,
    user_ratings_total: 903,
    photos: [{ photo_reference: "bike_2" }],
    geometry: { location: { lat: 17.438, lng: 78.355 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    types: ["bike_rental"],
    special_tags: ["Popular"],
    distance: 15.9,
  },
];

const BIKE_IMAGES_MAP: Record<string, string[]> = {
  bike_1: [
    "https://images.unsplash.com/photo-1558981852-426c6c22a060?w=800",
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800",
  ],
  bike_2: [
    "https://images.unsplash.com/photo-1591117207239-788bf8de6c3b?w=800",
    "https://images.unsplash.com/photo-1568772584743-e3a45fbb8177?w=800",
  ],
};

const BIKE_DESCRIPTIONS_MAP: Record<string, string> = {
  bike_1:
    "Top search bike rental with excellent rating. All types of bikes and scooters available.",
  bike_2:
    "Popular bike rental service offering electric bikes and daily rentals.",
};

const BIKE_SERVICES = [
  "Bike On Rent",
  "Scooters",
  "Daily Rental",
  "Monthly Rental",
  "Helmet Included",
  "Well Maintained",
];

/* ================= COMPONENT ================= */

interface NearbyBikeCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleBikeCard: React.FC<NearbyBikeCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    const jobId = job?.id || "bike_1";
    return BIKE_IMAGES_MAP[jobId] || BIKE_IMAGES_MAP["bike_1"];
  }, [job]);

  const photos = getPhotos();
  const hasPhotos = photos.length > 0;

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex > 0) {
        setCurrentImageIndex((p) => p - 1);
      }
    },
    [currentImageIndex]
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex < photos.length - 1) {
        setCurrentImageIndex((p) => p + 1);
      }
    },
    [currentImageIndex, photos.length]
  );

  const getPhoneNumber = useCallback(() => {
    return PHONE_NUMBERS_MAP[job?.id];
  }, [job]);

  if (!job) return null;

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {!imageError ? (
          <img
            src={photos[currentImageIndex]}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">
            🚲
          </div>
        )}

        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
            >
              <ChevronLeft size={18} className="text-white" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full"
            >
              <ChevronRight size={18} className="text-white" />
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{job.title}</h3>

        <div className="flex items-center text-sm text-gray-500 mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-red-600 text-xs font-semibold mb-2">
          {job.distance} km away
        </p>

        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {BIKE_DESCRIPTIONS_MAP[job.id]}
        </p>

        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">
            {job.jobData.rating}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>

          <span className="ml-auto text-xs px-2 py-1 rounded bg-green-100 text-green-700">
            <Clock size={11} className="inline mr-1" />
            Open Now
          </span>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {BIKE_SERVICES.slice(0, 4).map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 bg-red-100 text-red-600 text-xs px-2 py-1 rounded"
            >
              <CheckCircle size={11} />
              {s}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${job.jobData.geometry.location.lat},${job.jobData.geometry.location.lng}`
              );
            }}
            className="flex-1 border-2 border-indigo-600 text-indigo-600 text-xs font-bold py-2 rounded-lg"
          >
            <Navigation size={14} className="inline mr-1" />
            Directions
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${getPhoneNumber()}`;
            }}
            className="flex-1 border-2 border-red-600 text-red-600 text-xs font-bold py-2 rounded-lg"
          >
            <Phone size={14} className="inline mr-1" />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= WRAPPER ================= */

const NearbyBikeCard: React.FC<NearbyBikeCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_BIKES.map((bike) => (
          <SingleBikeCard
            key={bike.place_id}
            job={{
              id: bike.place_id,
              title: bike.name,
              location: bike.vicinity,
              distance: bike.distance,
              jobData: bike,
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleBikeCard {...props} />;
};

export default NearbyBikeCard;
