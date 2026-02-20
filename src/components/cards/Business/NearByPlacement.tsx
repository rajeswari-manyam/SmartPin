import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Navigation,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/* ================= TYPES ================= */

export interface PlacementService {
  id: string;
  title: string;
  description?: string;
  location?: string;
  distance?: number | string;
  category?: string;
  serviceData?: {
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: { open_now: boolean };
    geometry?: { location: { lat: number; lng: number } };
  };
}

/* ================= PHONE MAP ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  placement_1: "09972372884",
  placement_2: "08792491654",
  placement_3: "09725313707",
  placement_4: "08460272541",
  placement_5: "09876543210",
};

/* ================= IMAGES ================= */

const PLACEMENT_IMAGES_MAP: Record<string, string[]> = {
  placement_1: [
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
  ],
  placement_2: [
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
  ],
  placement_3: [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
  ],
  placement_4: [
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800",
  ],
  placement_5: [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
  ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_PLACEMENTS: PlacementService[] = [
  {
    id: "placement_1",
    title: "Work Placement Services",
    location: "Santosh Nagar, Hyderabad",
    distance: 1.3,
    category: "Placement Service",
    serviceData: {
      rating: 5.0,
      user_ratings_total: 16,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.3645, lng: 78.4738 } },
    },
  },
  {
    id: "placement_2",
    title: "Tech Force Project Solutions",
    location: "Chikkadpally, Hyderabad",
    distance: 2.1,
    category: "Placement Service",
    serviceData: {
      rating: 3.8,
      user_ratings_total: 84,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.4104, lng: 78.4936 } },
    },
  },
  {
    id: "placement_3",
    title: "Sri Renuka Enterprises",
    location: "Miyapur, Hyderabad",
    distance: 3.5,
    category: "Placement Service",
    serviceData: {
      rating: 4.0,
      user_ratings_total: 179,
      opening_hours: { open_now: false },
      geometry: { location: { lat: 17.4948, lng: 78.3538 } },
    },
  },
];

/* ================= SINGLE CARD ================= */

const SinglePlacementCard: React.FC<{
  service: PlacementService;
  onViewDetails: (service: PlacementService) => void;
}> = ({ service, onViewDetails }) => {
  const [index, setIndex] = useState(0);
  const photos = PLACEMENT_IMAGES_MAP[service.id] || [];
  const currentPhoto = photos[index];

  const rating = service.serviceData?.rating;
  const total = service.serviceData?.user_ratings_total;
  const isOpen = service.serviceData?.opening_hours?.open_now;

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = PHONE_NUMBERS_MAP[service.id];
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const loc = service.serviceData?.geometry?.location;
    if (loc) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
        "_blank"
      );
    }
  };

  return (
    <div
      onClick={() => onViewDetails(service)}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {currentPhoto ? (
          <>
            <img
              src={currentPhoto}
              alt={service.title}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((p) => (p - 1 + photos.length) % photos.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((p) => (p + 1) % photos.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-4xl">
            💼
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
        <h2 className="text-lg font-bold text-gray-800 line-clamp-2">
          {service.title}
        </h2>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={14} />
          <span className="line-clamp-1">{service.location}</span>
        </div>

        {service.distance && (
          <p className="text-xs font-semibold text-green-600">
            {service.distance} km away
          </p>
        )}

        <div className="flex items-center gap-3 pt-2 text-sm">
          {rating && (
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-gray-500">({total})</span>
            </div>
          )}

          {isOpen !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <Clock size={12} />
              {isOpen ? "Open" : "Closed"}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-auto pt-4">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 rounded-lg py-2.5 font-semibold hover:bg-indigo-100"
          >
            <Navigation size={16} />
            Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-green-600 bg-green-50 text-green-700 rounded-lg py-2.5 font-semibold hover:bg-green-100"
          >
            <Phone size={16} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= GRID VIEW ================= */

const NearbyPlacementCard: React.FC<{
  service?: PlacementService;
  onViewDetails: (service: PlacementService) => void;
}> = ({ service, onViewDetails }) => {
  if (!service) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_PLACEMENTS.map((item) => (
          <SinglePlacementCard
            key={item.id}
            service={item}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return (
    <SinglePlacementCard service={service} onViewDetails={onViewDetails} />
  );
};

export default NearbyPlacementCard;
