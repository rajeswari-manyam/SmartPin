import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  CheckCircle,
  Gem,
} from "lucide-react";

/* ================= TYPES ================= */

export interface JewelleryShop {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  photos: { photo_reference: string }[];
  geometry: {
    location: { lat: number; lng: number };
  };
  opening_hours: { open_now: boolean };
  distance: number;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  jewellery_shop_1: "08197227726",
  jewellery_shop_2: "08128817424",
  jewellery_shop_3: "07947134939",
  jewellery_shop_4: "07947411809",
};

export const DUMMY_JEWELLERY_SHOPS: JewelleryShop[] = [
  {
    place_id: "jewellery_shop_1",
    name: "The Diamond Store By Chandubhai",
    vicinity: "Jubilee Hills, Hyderabad",
    rating: 4.6,
    user_ratings_total: 390,
    photos: [{ photo_reference: "1" }],
    geometry: { location: { lat: 17.43, lng: 78.41 } },
    opening_hours: { open_now: true },
    distance: 2.3,
  },
  {
    place_id: "jewellery_shop_2",
    name: "Mahalaxmi Jewellers",
    vicinity: "Kukatpally, Hyderabad",
    rating: 4.3,
    user_ratings_total: 7,
    photos: [{ photo_reference: "2" }],
    geometry: { location: { lat: 17.49, lng: 78.41 } },
    opening_hours: { open_now: true },
    distance: 4.1,
  },
  {
    place_id: "jewellery_shop_3",
    name: "Kavita Jewellers",
    vicinity: "Chintal, Hyderabad",
    rating: 4.9,
    user_ratings_total: 65,
    photos: [{ photo_reference: "3" }],
    geometry: { location: { lat: 17.51, lng: 78.43 } },
    opening_hours: { open_now: true },
    distance: 3.6,
  },
  {
    place_id: "jewellery_shop_4",
    name: "VS Collection Jewelry",
    vicinity: "IDPL, Hyderabad",
    rating: 4.2,
    user_ratings_total: 52,
    photos: [{ photo_reference: "4" }],
    geometry: { location: { lat: 17.5, lng: 78.42 } },
    opening_hours: { open_now: true },
    distance: 1.8,
  },
];

const JEWELLERY_IMAGES_MAP: Record<string, string[]> = {
  jewellery_shop_1: [
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800",
  ],
  jewellery_shop_2: [
    "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=800",
  ],
  jewellery_shop_3: [
    "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=800",
  ],
  jewellery_shop_4: [
    "https://images.unsplash.com/photo-1534139261331-4574c09fd346?w=800",
  ],
};

const JEWELLERY_SERVICES = [
  "Gold Jewellery",
  "Diamond Jewellery",
  "Silver Jewellery",
  "Custom Designs",
  "Bridal Collection",
  "Same Day Delivery",
];

/* ================= COMPONENT ================= */

interface Props {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleJewelleryCard: React.FC<Props> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    const id = job?.id || "jewellery_shop_1";
    return JEWELLERY_IMAGES_MAP[id] || [];
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
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative h-48 bg-gray-100">
        {currentPhoto && !imageError ? (
          <>
            <img
              src={currentPhoto}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
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
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">
            💎
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-2">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-sm font-semibold text-yellow-600 mb-2">
          {job.distance} km away
        </p>

        <p className="text-sm text-gray-600 line-clamp-3 mb-3">
          Premium jewellery showroom offering gold, silver & diamond collections.
        </p>

        {/* CATEGORY */}
        <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs font-semibold px-3 py-1 rounded-full mb-2">
          <Gem size={14} /> Jewellery Shop
        </span>

        {/* RATING */}
        <div className="flex items-center gap-2 mb-3">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold">
            {job.jobData.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>
        </div>

        {/* SERVICES */}
        <div className="mb-4">
          <p className="text-xs font-bold text-gray-500 mb-1">SERVICES:</p>
          <div className="flex flex-wrap gap-1.5">
            {JEWELLERY_SERVICES.slice(0, 4).map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded"
              >
                <CheckCircle size={12} /> {s}
              </span>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-emerald-600 bg-emerald-50 text-emerald-700 font-bold text-xs py-2.5 rounded-lg"
          >
            <Navigation size={14} /> Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-yellow-600 bg-yellow-50 text-yellow-700 font-bold text-xs py-2.5 rounded-lg"
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= WRAPPER ================= */

const NearbyJewelleryShopCard: React.FC<Props> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_JEWELLERY_SHOPS.map((shop) => (
          <SingleJewelleryCard
            key={shop.place_id}
            job={{
              id: shop.place_id,
              title: shop.name,
              location: shop.vicinity,
              distance: shop.distance,
              jobData: shop,
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleJewelleryCard {...props} />;
};

export default NearbyJewelleryShopCard;
