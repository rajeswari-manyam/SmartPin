import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  CheckCircle,
  BadgeCheck,
  Sofa,
} from "lucide-react";

/* ================= TYPES ================= */

export interface FurnitureStore {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  geometry: {
    location: { lat: number; lng: number };
  };
  opening_hours: { open_now: boolean };
  distance: number;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  furniture_store_1: "08401776404",
  furniture_store_2: "08460481895",
  furniture_store_3: "09988929093",
  furniture_store_4: "07095652428",
};

export const DUMMY_FURNITURE_STORES: FurnitureStore[] = [
  {
    place_id: "furniture_store_1",
    name: "Abhi Furniture",
    vicinity: "Bhavani Nagar Road Moosapet, Hyderabad",
    rating: 4.8,
    user_ratings_total: 197,
    opening_hours: { open_now: true },
    geometry: { location: { lat: 17.485, lng: 78.515 } },
    distance: 1.8,
  },
  {
    place_id: "furniture_store_2",
    name: "Bhanu Home Decors",
    vicinity: "Metro Pillar No. 895 Moosapet, Hyderabad",
    rating: 4.9,
    user_ratings_total: 73,
    opening_hours: { open_now: true },
    geometry: { location: { lat: 17.52, lng: 78.495 } },
    distance: 2.6,
  },
  {
    place_id: "furniture_store_3",
    name: "MM Sofa Baazar",
    vicinity: "Main Road Bala Nagar, Hyderabad",
    rating: 3.7,
    user_ratings_total: 9,
    opening_hours: { open_now: true },
    geometry: { location: { lat: 17.44, lng: 78.42 } },
    distance: 3.9,
  },
  {
    place_id: "furniture_store_4",
    name: "Sri Anu Furniture",
    vicinity: "Kukatpally Main Road, Hyderabad",
    rating: 4.9,
    user_ratings_total: 956,
    opening_hours: { open_now: true },
    geometry: { location: { lat: 17.49, lng: 78.41 } },
    distance: 0.9,
  },
];

const FURNITURE_IMAGES: Record<string, string[]> = {
  furniture_store_1: [
    "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800",
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
  ],
  furniture_store_2: [
    "https://images.unsplash.com/photo-1567016432779-094069958ea5?w=800",
    "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800",
  ],
  furniture_store_3: [
    "https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=800",
    "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800",
  ],
  furniture_store_4: [
    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800",
    "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?w=800",
  ],
};

const FURNITURE_SERVICES = [
  "Furniture Dealers",
  "Mattress Dealers",
  "Custom Furniture",
  "Home Delivery",
  "Installation",
];

/* ================= COMPONENT ================= */

interface Props {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleFurnitureCard: React.FC<Props> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const images =
    FURNITURE_IMAGES[job?.id] || FURNITURE_IMAGES["furniture_store_1"];

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

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden mb-4"
    >
      {/* IMAGE */}
      <div className="relative h-48">
        <img
          src={images[index]}
          className="w-full h-full object-cover"
          alt={job.title}
        />

        {images.length > 1 && (
          <>
            {index > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((p) => p - 1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {index < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIndex((p) => p + 1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="text-[17px] font-bold text-gray-900 mb-1 flex items-center gap-1">
          {job.title}
          {job.id === "furniture_store_4" && (
            <BadgeCheck className="text-blue-500" size={16} />
          )}
        </h3>

        <div className="flex items-center text-gray-500 text-[13px] mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-xs font-semibold text-green-600 mb-2">
          {job.distance.toFixed(1)} km away
        </p>

        <p className="text-[13px] text-gray-600 mb-2 line-clamp-3">
          Quality furniture showroom offering sofas, beds, wardrobes, and
          mattresses with delivery and installation.
        </p>

        <div className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <Sofa size={12} />
          Furniture Store
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Star className="text-yellow-400 fill-yellow-400" size={14} />
          <span className="text-sm font-semibold">
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
            {FURNITURE_SERVICES.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-green-100 text-green-700 text-[11px] px-2 py-1 rounded"
              >
                <CheckCircle size={11} />
                {s}
              </span>
            ))}
            <span className="bg-gray-100 text-gray-600 text-[11px] px-2 py-1 rounded">
              +{FURNITURE_SERVICES.length - 3} more
            </span>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 bg-green-50 text-green-700 font-bold text-xs py-2.5 rounded-lg"
          >
            <Navigation size={14} />
            Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 bg-green-50 text-green-700 font-bold text-xs py-2.5 rounded-lg"
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

const NearbyFurnitureCard: React.FC<Props> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_FURNITURE_STORES.map((store) => (
          <SingleFurnitureCard
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

  return <SingleFurnitureCard {...props} />;
};

export default NearbyFurnitureCard;
