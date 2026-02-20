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

export interface BusService {
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
  special_tags: string[];
  distance: number;
}

/* ================= PHONE NUMBERS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  bus_1: "08050634074",
  bus_2: "08197334394",
  bus_3: "08511682850",
  bus_4: "08511730196",
};

/* ================= DUMMY BUS DATA ================= */

export const DUMMY_BUS_SERVICES: BusService[] = [
  {
    place_id: "bus_1",
    name: "BLUE JAY TRAVELS",
    vicinity: "Chandanagar Station Road, Hyderabad",
    rating: 4.8,
    user_ratings_total: 10,
    photos: [{ photo_reference: "bus_1" }],
    geometry: { location: { lat: 17.492, lng: 78.34 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    special_tags: ["Trending"],
    distance: 13.6,
  },
  {
    place_id: "bus_2",
    name: "IJ Travel Ratna",
    vicinity: "Gachibowli, Hyderabad",
    rating: 4.2,
    user_ratings_total: 85,
    photos: [{ photo_reference: "bus_2" }],
    geometry: { location: { lat: 17.445, lng: 78.355 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    special_tags: ["Deals"],
    distance: 8.2,
  },
  {
    place_id: "bus_3",
    name: "VRL Bus",
    vicinity: "Taj Enclave, Hyderabad",
    rating: 3.8,
    user_ratings_total: 25,
    photos: [{ photo_reference: "bus_3" }],
    geometry: { location: { lat: 17.45, lng: 78.36 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    special_tags: [],
    distance: 9.1,
  },
];

/* ================= IMAGES ================= */

const BUS_IMAGES_MAP: Record<string, string[]> = {
  bus_1: [
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800",
  ],
  bus_2: [
    "https://images.unsplash.com/photo-1558656347-89c31f657a40?w=800",
    "https://images.unsplash.com/photo-1592838074349-a77d20d05d77?w=800",
  ],
  bus_3: [
    "https://images.unsplash.com/photo-1562620669-a8c9c96c2f7f?w=800",
    "https://images.unsplash.com/photo-1547742075-5dc0634ae12a?w=800",
  ],
};

/* ================= SERVICES ================= */

const BUS_SERVICES = [
  "Bus Ticket Booking",
  "Online Booking",
  "Travel Agents",
  "Discount Offers",
  "Group Booking",
  "Customer Support",
];

/* ================= COMPONENT ================= */

interface NearbyBusCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleBusCard: React.FC<NearbyBusCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    const id = job?.id || "bus_1";
    return BUS_IMAGES_MAP[id] || BUS_IMAGES_MAP["bus_1"];
  }, [job]);

  const photos = getPhotos();
  const hasPhotos = photos.length > 0;
  const currentPhoto = photos[currentImageIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) setCurrentImageIndex((p) => p - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < photos.length - 1)
      setCurrentImageIndex((p) => p + 1);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = PHONE_NUMBERS_MAP[job.id];
    if (!phone) return alert("Phone number not available");
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { lat, lng } = job.jobData.geometry.location;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative h-48 bg-gray-100">
        {!imageError ? (
          <img
            src={currentPhoto}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-6xl">
            🚌
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

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-xs font-semibold text-indigo-600 mb-2">
          {job.distance} km away
        </p>

        <p className="text-sm text-gray-600 mb-2 line-clamp-3">
          Reliable bus ticket booking service with verified agents and offers.
        </p>

        <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 text-xs font-semibold px-2 py-1 rounded-full mb-2">
          🚌 Bus Ticket Booking
        </div>

        <div className="flex items-center gap-2 mb-3">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-semibold">
            {job.jobData.rating}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>

          <span className="flex items-center gap-1 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded">
            <Clock size={11} />
            Open Now
          </span>
        </div>

        {/* SERVICES */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 mb-1">
            SERVICES:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {BUS_SERVICES.slice(0, 4).map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-indigo-100 text-indigo-600 text-xs px-2 py-1 rounded"
              >
                <CheckCircle size={12} />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-xs py-2.5 rounded-lg"
          >
            <Navigation size={14} />
            Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 bg-green-50 text-green-600 font-bold text-xs py-2.5 rounded-lg"
          >
            <Phone size={14} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= GRID WRAPPER ================= */

const NearbyBusServiceCard: React.FC<NearbyBusCardProps> = ({
  job,
  onViewDetails,
}) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_BUS_SERVICES.map((bus) => (
          <SingleBusCard
            key={bus.place_id}
            job={{
              id: bus.place_id,
              title: bus.name,
              location: bus.vicinity,
              distance: bus.distance,
              jobData: bus,
            }}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleBusCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyBusServiceCard;
