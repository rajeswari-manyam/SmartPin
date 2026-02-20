import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  CheckCircle,
  ShoppingBag,
} from "lucide-react";

/* ================= TYPES ================= */

export interface ShoeStore {
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
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  shoe_store_1: "07942698464",
  shoe_store_2: "07947414488",
  shoe_store_3: "07947111584",
  shoe_store_4: "07947150215",
};

export const DUMMY_SHOE_STORES: ShoeStore[] = [
  {
    place_id: "shoe_store_1",
    name: "Mayuri Shoes",
    vicinity: "Chandra Nagar, Hyderabad",
    rating: 4.4,
    user_ratings_total: 331,
    photos: [{ photo_reference: "shoe_1" }],
    geometry: { location: { lat: 17.485, lng: 78.515 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    distance: 1.2,
  },
  {
    place_id: "shoe_store_2",
    name: "Bata Shoe Store",
    vicinity: "Suchitra Junction, Hyderabad",
    rating: 4.3,
    user_ratings_total: 37,
    photos: [{ photo_reference: "shoe_2" }],
    geometry: { location: { lat: 17.52, lng: 78.495 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    distance: 2.8,
  },
  {
    place_id: "shoe_store_3",
    name: "Bata Shoe Store",
    vicinity: "Erragadda, Hyderabad",
    rating: 3.9,
    user_ratings_total: 655,
    photos: [{ photo_reference: "shoe_3" }],
    geometry: { location: { lat: 17.44, lng: 78.42 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    distance: 4.1,
  },
];

const SHOE_IMAGES_MAP: Record<string, string[]> = {
  shoe_store_1: [
    "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800",
    "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800",
  ],
  shoe_store_2: [
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800",
    "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800",
  ],
  shoe_store_3: [
    "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800",
    "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=800",
  ],
};

const SHOE_SERVICES = [
  "Same Day Delivery",
  "In Store Pickup",
  "Party Wear",
  "Casual Shoes",
  "Handbags",
  "Slippers",
];

/* ================= COMPONENT ================= */

interface NearbyShoeCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleShoeCard: React.FC<NearbyShoeCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    const id = job?.id || "shoe_store_1";
    return SHOE_IMAGES_MAP[id] || SHOE_IMAGES_MAP["shoe_store_1"];
  }, [job]);

  const photos = getPhotos();
  const currentPhoto = photos[currentImageIndex];

  const handlePrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex > 0) {
        setCurrentImageIndex((p) => p - 1);
      }
    },
    [currentImageIndex]
  );

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex < photos.length - 1) {
        setCurrentImageIndex((p) => p + 1);
      }
    },
    [currentImageIndex, photos.length]
  );

  const handleCall = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const phone = PHONE_NUMBERS_MAP[job.id];
      if (!phone) return;
      window.location.href = `tel:${phone}`;
    },
    [job]
  );

  const handleDirections = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const loc = job.jobData.geometry.location;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
        "_blank"
      );
    },
    [job]
  );

  if (!job) return null;

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative h-48 bg-gray-100">
        {!imageError ? (
          <>
            <img
              src={currentPhoto}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {photos.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {currentImageIndex < photos.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">
            👟
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="text-[17px] font-bold text-gray-900 mb-1">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={14} className="mr-1" />
          <span className="line-clamp-1">{job.location}</span>
        </div>

        <p className="text-xs font-semibold text-green-600 mb-2">
          {job.distance} km away
        </p>

        <p className="text-sm text-gray-600 line-clamp-3 mb-2">
          Quality footwear store offering branded and casual shoes for all age
          groups.
        </p>

        <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-xl mb-2">
          <ShoppingBag size={12} />
          Shoe Store
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">
            {job.jobData.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>
        </div>

        {/* SERVICES */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 mb-1">SERVICES:</p>
          <div className="flex flex-wrap gap-1.5">
            {SHOE_SERVICES.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded"
              >
                <CheckCircle size={11} />
                {s}
              </span>
            ))}
            <span className="text-xs text-gray-500 px-2 py-1 rounded bg-gray-100">
              +{SHOE_SERVICES.length - 3} more
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 bg-green-50 text-green-700 font-bold text-xs py-2 rounded-lg"
          >
            <Navigation size={14} />
            Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 bg-green-50 text-green-700 font-bold text-xs py-2 rounded-lg"
          >
            <Phone size={14} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= WRAPPER ================= */

const NearbyShoeCard: React.FC<NearbyShoeCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_SHOE_STORES.map((store) => (
          <SingleShoeCard
            key={store.place_id}
            job={{
              id: store.place_id,
              title: store.name,
              location: store.vicinity,
              distance: store.distance,
              jobData: store,
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return (
    <SingleShoeCard job={props.job} onViewDetails={props.onViewDetails} />
  );
};

export default NearbyShoeCard;
