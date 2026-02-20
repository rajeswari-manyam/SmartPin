import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  CheckCircle,
  Tv,
  Flame,
  TrendingUp,
  Tag,
} from "lucide-react";

/* ================= TYPES ================= */

export interface ElectronicShop {
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

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
  electronic_shop_1: "07947118692",
  electronic_shop_2: "07947139740",
  electronic_shop_3: "07947143858",
  electronic_shop_4: "07947106773",
};

// Dummy data
export const DUMMY_ELECTRONIC_SHOPS: ElectronicShop[] = [
  {
    place_id: "electronic_shop_1",
    name: "Pai International Electronics Ltd",
    vicinity: "HMT Road Chintal, Hyderabad",
    rating: 4.8,
    user_ratings_total: 5120,
    photos: [{ photo_reference: "1" }],
    geometry: { location: { lat: 17.485, lng: 78.515 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 3,
    distance: 1.2,
  },
  {
    place_id: "electronic_shop_2",
    name: "Electronics Mart India",
    vicinity: "Idpl Road Chintal, Hyderabad",
    rating: 3.9,
    user_ratings_total: 1645,
    photos: [{ photo_reference: "2" }],
    geometry: { location: { lat: 17.52, lng: 78.495 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    distance: 2.6,
  },
  {
    place_id: "electronic_shop_3",
    name: "Sai Veerabhadra Electronics",
    vicinity: "Jeedimetla Main Road, Hyderabad",
    rating: 4.2,
    user_ratings_total: 317,
    photos: [{ photo_reference: "3" }],
    geometry: { location: { lat: 17.44, lng: 78.42 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    distance: 3.8,
  },
  {
    place_id: "electronic_shop_4",
    name: "Sree Pirgal Electronics",
    vicinity: "Suchitra Cross Road, Hyderabad",
    rating: 4.4,
    user_ratings_total: 179,
    photos: [{ photo_reference: "4" }],
    geometry: { location: { lat: 17.49, lng: 78.41 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    distance: 1.9,
  },
];

// Images
const ELECTRONIC_IMAGES_MAP: Record<string, string[]> = {
  electronic_shop_1: [
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800",
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
  ],
  electronic_shop_2: [
    "https://images.unsplash.com/photo-1593642532400-2682810df593?w=800",
    "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800",
  ],
  electronic_shop_3: [
    "https://images.unsplash.com/photo-1591290619762-d71a75b4ab6d?w=800",
  ],
  electronic_shop_4: [
    "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800",
  ],
};

// Descriptions
const ELECTRONIC_DESCRIPTIONS_MAP: Record<string, string> = {
  electronic_shop_1:
    "Popular electronics showroom with AC dealers and premium appliances. Trusted by thousands of customers.",
  electronic_shop_2:
    "Large electronics mart offering same-day delivery and in-store shopping.",
  electronic_shop_3:
    "Top rated electronics shop specializing in ACs and home appliances.",
  electronic_shop_4:
    "Trending electronics store known for quality products and service.",
};

const ELECTRONIC_SERVICES = [
  "Electronic Goods",
  "AC Dealers",
  "Home Appliances",
  "Same Day Delivery",
  "Jd Verified",
  "Quick Response",
];

/* ================= COMPONENT ================= */

interface Props {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleElectronicCard: React.FC<Props> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(false);

  const getPhotos = useCallback(() => {
    const id = job?.id || "electronic_shop_1";
    return ELECTRONIC_IMAGES_MAP[id] || [];
  }, [job]);

  const photos = getPhotos();
  const currentPhoto = photos[index];

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { lat, lng } = job.jobData.geometry.location;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = PHONE_NUMBERS_MAP[job.id];
    if (phone) window.location.href = `tel:${phone}`;
  };

  const badge =
    job.id === "electronic_shop_1"
      ? "Popular"
      : job.id === "electronic_shop_3"
      ? "Top Rated"
      : job.id === "electronic_shop_4"
      ? "Trending"
      : null;

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {currentPhoto && !error ? (
          <>
            <img
              src={currentPhoto}
              className="w-full h-full object-cover"
              onError={() => setError(true)}
            />

            {photos.length > 1 && (
              <>
                {index > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndex((i) => i - 1);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}

                {index < photos.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIndex((i) => i + 1);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}/{photos.length}
                </div>
              </>
            )}

            {job.id === "electronic_shop_1" && (
              <span className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                <Tag size={12} /> 1 Offer
              </span>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Tv size={48} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-[17px] mb-1 line-clamp-2">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={14} className="mr-1" />
          <span className="line-clamp-1">{job.location}</span>
        </div>

        <p className="text-emerald-600 text-xs font-semibold mb-2">
          {job.distance.toFixed(1)} km away
        </p>

        <p className="text-gray-600 text-sm mb-2 line-clamp-3">
          {ELECTRONIC_DESCRIPTIONS_MAP[job.id]}
        </p>

        <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-xl mb-2">
          <Tv size={12} /> Electronic Shop
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">
            {job.jobData.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>

          {badge && (
            <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded">
              {badge === "Popular" && <Flame size={12} />}
              {badge === "Trending" && <TrendingUp size={12} />}
              {badge}
            </span>
          )}
        </div>

        {/* Services */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 mb-1">SERVICES:</p>
          <div className="flex flex-wrap gap-1">
            {ELECTRONIC_SERVICES.slice(0, 4).map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded"
              >
                <CheckCircle size={11} /> {s}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-emerald-600 bg-emerald-50 text-emerald-700 text-xs font-bold py-2.5 rounded-lg"
          >
            <Navigation size={14} /> Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-emerald-600 bg-emerald-50 text-emerald-700 text-xs font-bold py-2.5 rounded-lg"
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= WRAPPER ================= */

const NearbyElectronicCard: React.FC<Props> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_ELECTRONIC_SHOPS.map((shop) => (
          <SingleElectronicCard
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

  return <SingleElectronicCard {...props} />;
};

export default NearbyElectronicCard;
