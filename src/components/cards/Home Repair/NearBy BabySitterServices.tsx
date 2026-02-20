import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Navigation,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Baby,
} from "lucide-react";

/* ================= TYPES ================= */

interface BabySitter {
  id: string;
  title: string;
  description?: string;
  location?: string;
  distance?: number;
  services: string[];
  rating?: number;
  totalRatings?: number;
  isAvailable?: boolean;
  geometry?: { lat: number; lng: number };
}

/* ================= DATA ================= */

const PHONE_MAP: Record<string, string> = {
  service_1: "08792490977",
  service_2: "09035211694",
  service_3: "09980824063",
};

const IMAGE_MAP: Record<string, string[]> = {
  service_1: [
    "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800",
    "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800",
  ],
  service_2: [
    "https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800",
  ],
  service_3: [
    "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800",
  ],
};

const BABY_SITTERS: BabySitter[] = [
  {
    id: "service_1",
    title: "Prahasya Baby Care",
    description: "Professional baby sitting and home childcare services.",
    location: "Hitech City, Hyderabad",
    distance: 2.4,
    rating: 4.4,
    totalRatings: 100,
    isAvailable: true,
    geometry: { lat: 17.4483, lng: 78.3915 },
    services: ["Baby Sitting", "Childcare", "Nanny"],
  },
  {
    id: "service_2",
    title: "Star Baby Care",
    description: "Verified and experienced baby sitters for working parents.",
    location: "Kukatpally, Hyderabad",
    distance: 1.8,
    rating: 4.7,
    totalRatings: 105,
    isAvailable: true,
    geometry: { lat: 17.4948, lng: 78.3996 },
    services: ["Baby Sitting", "Full-time Care"],
  },
  {
    id: "service_3",
    title: "Alankrita Services",
    description: "Trusted childcare services with trained staff.",
    location: "Balanagar, Hyderabad",
    distance: 3.1,
    rating: 3.8,
    totalRatings: 706,
    isAvailable: false,
    geometry: { lat: 17.4706, lng: 78.4331 },
    services: ["Baby Sitting", "Nanny", "Home Care"],
  },
];

/* ================= CARD ================= */

const BabySitterCard: React.FC<{
  sitter: BabySitter;
  onViewDetails: (s: BabySitter) => void;
}> = ({ sitter, onViewDetails }) => {
  const [index, setIndex] = useState(0);
  const photos = IMAGE_MAP[sitter.id] || [];
  const current = photos[index];

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = PHONE_MAP[sitter.id];
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (sitter.geometry) {
      const { lat, lng } = sitter.geometry;
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
        "_blank"
      );
    }
  };

  return (
    <div
      onClick={() => onViewDetails(sitter)}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden cursor-pointer flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {current ? (
          <>
            <img src={current} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i - 1 + photos.length) % photos.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i + 1) % photos.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Baby size={48} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 flex flex-col flex-grow">
        <h2 className="text-lg font-bold text-gray-800 line-clamp-2">
          {sitter.title}
        </h2>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={14} />
          <span className="line-clamp-1">{sitter.location}</span>
        </div>

        <p className="text-xs font-semibold text-green-600">
          {sitter.distance} km away
        </p>

        <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
          {sitter.description}
        </p>

        {/* Rating & Status */}
        <div className="flex items-center gap-3 pt-2 text-sm">
          {sitter.rating && (
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-400 text-yellow-400" size={14} />
              <span className="font-semibold">{sitter.rating}</span>
              <span className="text-gray-500">
                ({sitter.totalRatings})
              </span>
            </div>
          )}
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded ${
              sitter.isAvailable
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            <Clock size={12} />
            <span className="text-xs font-semibold">
              {sitter.isAvailable ? "Available" : "Unavailable"}
            </span>
          </div>
        </div>

        {/* Services */}
        <div className="pt-2 flex flex-wrap gap-2">
          {sitter.services.slice(0, 3).map((s, i) => (
            <span
              key={i}
              className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs"
            >
              ✓ {s}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 mt-auto">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg font-semibold"
          >
            <Navigation size={16} />
            Directions
          </button>
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg font-semibold"
          >
            <Phone size={16} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= LIST ================= */

const BabySitterCafeStyle: React.FC = () => {
  const handleViewDetails = (s: BabySitter) => {
    console.log("View details:", s.title);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {BABY_SITTERS.map((sitter) => (
        <BabySitterCard
          key={sitter.id}
          sitter={sitter}
          onViewDetails={handleViewDetails}
        />
      ))}
    </div>
  );
};

export default BabySitterCafeStyle;
