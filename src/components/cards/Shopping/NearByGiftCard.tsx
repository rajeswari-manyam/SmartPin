import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  CheckCircle,
  Gift,
} from "lucide-react";

/* ================= TYPES ================= */

export interface GiftShop {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  geometry: {
    location: { lat: number; lng: number };
  };
  distance: number;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  gift_shop_1: "09980857369",
  gift_shop_2: "07947115825",
  gift_shop_3: "07942685111",
  gift_shop_4: "07947120565",
};

export const DUMMY_GIFT_SHOPS: GiftShop[] = [
  {
    place_id: "gift_shop_1",
    name: "Ark Gifts",
    vicinity: "Bhagya Nagar Colony Kukatpally, Hyderabad",
    rating: 4.8,
    user_ratings_total: 562,
    geometry: { location: { lat: 17.485, lng: 78.405 } },
    distance: 1.2,
  },
  {
    place_id: "gift_shop_2",
    name: "Party N Paper",
    vicinity: "Jeedimetla, Hyderabad",
    rating: 4.1,
    user_ratings_total: 234,
    geometry: { location: { lat: 17.505, lng: 78.418 } },
    distance: 2.4,
  },
];

const GIFT_IMAGES: Record<string, string[]> = {
  gift_shop_1: [
    "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800",
  ],
  gift_shop_2: [
    "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800",
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
  ],
};

const GIFT_DESCRIPTIONS: Record<string, string> = {
  gift_shop_1:
    "Top-rated gift shop for personalized gifts, photo frames, mugs and special occasion items.",
  gift_shop_2:
    "Popular party and gift store offering decorations, gift articles and celebration supplies.",
};

const GIFT_SERVICES = [
  "Personalized Gifts",
  "Photo Frames",
  "Greeting Cards",
  "Party Supplies",
  "Gift Wrapping",
];

/* ================= COMPONENT ================= */

interface NearbyGiftCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleGiftCard: React.FC<NearbyGiftCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    const id = job?.id || "gift_shop_1";
    return GIFT_IMAGES[id] || GIFT_IMAGES["gift_shop_1"];
  }, [job]);

  const photos = getPhotos();
  const currentPhoto = photos[currentImageIndex];

  const getPhone = () => PHONE_NUMBERS_MAP[job?.id] || null;

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const loc = job?.jobData?.geometry?.location;
    if (!loc) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
      "_blank"
    );
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = getPhone();
    if (phone) window.location.href = `tel:${phone}`;
  };

  if (!job) return null;

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition mb-4 cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {!imageError ? (
          <img
            src={currentPhoto}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-pink-400">
            <Gift size={48} />
          </div>
        )}

        {photos.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((p) => p - 1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {currentImageIndex < photos.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((p) => p + 1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mt-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-xs font-semibold text-pink-600 mt-1">
          {job.distance?.toFixed(1)} km away
        </p>

        <p className="text-sm text-gray-600 mt-2 line-clamp-3">
          {GIFT_DESCRIPTIONS[job.id]}
        </p>

        {/* Category */}
        <div className="inline-flex items-center gap-1 bg-pink-100 text-pink-600 text-xs font-semibold px-2 py-1 rounded-full mt-2">
          🎁 Gift Shop
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mt-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">
            {job.jobData.rating}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>
        </div>

        {/* Services */}
        <div className="mt-3">
          <p className="text-xs font-bold text-gray-500 mb-1">SERVICES</p>
          <div className="flex flex-wrap gap-1">
            {GIFT_SERVICES.slice(0, 4).map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded"
              >
                <CheckCircle size={12} />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-pink-500 bg-pink-50 text-pink-600 font-bold text-xs py-2 rounded-lg"
          >
            <Navigation size={14} /> Directions
          </button>

          <button
            onClick={handleCall}
            disabled={!getPhone()}
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2 rounded-lg ${
              getPhone()
                ? "border-pink-500 bg-pink-50 text-pink-600"
                : "border-gray-300 bg-gray-100 text-gray-400"
            }`}
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= GRID WRAPPER ================= */

const NearbyGiftCard: React.FC<NearbyGiftCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_GIFT_SHOPS.map((shop) => (
          <SingleGiftCard
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

  return (
    <SingleGiftCard
      job={props.job}
      onViewDetails={props.onViewDetails}
    />
  );
};

export default NearbyGiftCard;
