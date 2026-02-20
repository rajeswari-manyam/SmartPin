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
  Shirt,
} from "lucide-react";

/* ================= TYPES ================= */

export interface ClothingStore {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  photos: { photo_reference: string }[];
  geometry: { location: { lat: number; lng: number } };
  opening_hours: { open_now: boolean };
  distance: number;
  special_tags: string[];
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  clothing_1: "07947134990",
  clothing_2: "07947415338",
  clothing_3: "07942685821",
  clothing_4: "07947129642",
};

export const DUMMY_CLOTHING_STORES: ClothingStore[] = [
  {
    place_id: "clothing_1",
    name: "Ramraj Cotton",
    vicinity: "Idpl Cross Roads Chintal, Hyderabad",
    rating: 4.1,
    user_ratings_total: 526,
    photos: [{ photo_reference: "1" }],
    geometry: { location: { lat: 17.52, lng: 78.51 } },
    opening_hours: { open_now: true },
    distance: 1.2,
    special_tags: ["Popular", "Trusted"],
  },
  {
    place_id: "clothing_2",
    name: "Westside",
    vicinity: "Kompally Suchitra Junction, Hyderabad",
    rating: 4.1,
    user_ratings_total: 1100,
    photos: [{ photo_reference: "2" }],
    geometry: { location: { lat: 17.535, lng: 78.495 } },
    opening_hours: { open_now: true },
    distance: 2.8,
    special_tags: ["Verified", "Top Search"],
  },
];

const CLOTHING_IMAGES_MAP: Record<string, string[]> = {
  clothing_1: [
    "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800",
    "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800",
  ],
  clothing_2: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800",
    "https://images.unsplash.com/photo-1558769132-cb1aea3c1c1d?w=800",
  ],
};

const CLOTHING_SERVICES = [
  "Delivery",
  "Same Day Delivery",
  "Shop In Store",
  "Readymade Garments",
  "Sarees",
];

/* ================= COMPONENT ================= */

interface Props {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleClothingCard: React.FC<Props> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    const id = job?.id || "clothing_1";
    return CLOTHING_IMAGES_MAP[id] || CLOTHING_IMAGES_MAP["clothing_1"];
  }, [job]);

  const photos = getPhotos();
  const currentPhoto = photos[currentImageIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((p) => Math.max(p - 1, 0));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((p) => Math.min(p + 1, photos.length - 1));
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = PHONE_NUMBERS_MAP[job.id];
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { lat, lng } = job.jobData.geometry.location;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  if (!job) return null;

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden mb-4"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {!imageError ? (
          <img
            src={currentPhoto}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Shirt size={48} />
          </div>
        )}

        {photos.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            {currentImageIndex < photos.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronRight size={20} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{job.title}</h3>

        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-purple-600 text-xs font-semibold mb-2">
          {job.distance} km away
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {job.jobData.special_tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="bg-yellow-100 text-yellow-800 text-[10px] font-semibold px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">
            {job.jobData.rating}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>

          <span className="ml-auto flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">
            <Clock size={11} />
            Open
          </span>
        </div>

        {/* Services */}
        <p className="text-[10px] font-bold text-gray-500 mb-1">SERVICES:</p>
        <div className="flex flex-wrap gap-1 mb-3">
          {CLOTHING_SERVICES.slice(0, 3).map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-1 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded"
            >
              <CheckCircle size={11} />
              {s}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 border-2 border-purple-600 bg-purple-50 text-purple-700 font-bold text-xs py-2 rounded-lg"
          >
            <Navigation size={14} className="inline mr-1" />
            Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 border-2 border-purple-600 bg-purple-50 text-purple-700 font-bold text-xs py-2 rounded-lg"
          >
            <Phone size={14} className="inline mr-1" />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= GRID WRAPPER ================= */

const NearbyClothingCard: React.FC<Props> = ({ job, onViewDetails }) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_CLOTHING_STORES.map((store) => (
          <SingleClothingCard
            key={store.place_id}
            job={{
              id: store.place_id,
              title: store.name,
              location: store.vicinity,
              distance: store.distance,
              jobData: {
                rating: store.rating,
                user_ratings_total: store.user_ratings_total,
                geometry: store.geometry,
                special_tags: store.special_tags,
              },
            }}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleClothingCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyClothingCard;
