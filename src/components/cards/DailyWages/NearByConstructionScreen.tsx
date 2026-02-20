import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Navigation,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  ShieldCheck,
} from "lucide-react";

/* ================= TYPES ================= */

interface ConstructionService {
  id: string;
  name: string;
  location: string;
  distance: number;
  rating: number;
  user_ratings_total: number;
  open_now: boolean;
  lat: number;
  lng: number;
}

/* ================= DATA ================= */

const CONSTRUCTION_LIST: ConstructionService[] = [
  {
    id: "construction_1",
    name: "SVP Constructions",
    location: "Hyderabad",
    distance: 4.9,
    rating: 4.2,
    user_ratings_total: 31,
    open_now: true,
    lat: 17.4485,
    lng: 78.3908,
  },
  {
    id: "construction_2",
    name: "Shivani Enterprises",
    location: "Secunderabad",
    distance: 8.2,
    rating: 5.0,
    user_ratings_total: 1,
    open_now: true,
    lat: 17.495,
    lng: 78.358,
  },
  {
    id: "construction_3",
    name: "Raji Reddy Constructions",
    location: "Hyderabad",
    distance: 13.3,
    rating: 4.3,
    user_ratings_total: 7,
    open_now: false,
    lat: 17.485,
    lng: 78.487,
  },
];

/* ================= IMAGES ================= */

const IMAGES: Record<string, string[]> = {
  construction_1: [
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
  ],
  construction_2: [
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800",
  ],
  construction_3: [
    "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
  ],
};

const SERVICES = [
  "Civil Contractors",
  "Building Construction",
  "Renovation",
  "Interior Work",
];

/* ================= SCREEN ================= */

const NearbyConstructionScreen: React.FC = () => {
  const [imageIndex, setImageIndex] = useState<Record<string, number>>({});

  const handleNext = (id: string, total: number) => {
    setImageIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) + 1) % total,
    }));
  };

  const handlePrev = (id: string, total: number) => {
    setImageIndex((prev) => ({
      ...prev,
      [id]: ((prev[id] || 0) - 1 + total) % total,
    }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Nearby Construction Services
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CONSTRUCTION_LIST.map((item) => {
          const photos = IMAGES[item.id];
          const currentIndex = imageIndex[item.id] || 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col"
            >
              {/* IMAGE */}
              <div className="relative h-48">
                <img
                  src={photos[currentIndex]}
                  className="w-full h-full object-cover"
                  alt={item.name}
                />

                {photos.length > 1 && (
                  <>
                    <button
                      onClick={() => handlePrev(item.id, photos.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => handleNext(item.id, photos.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>

              {/* CONTENT */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h2 className="text-lg font-bold">{item.name}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <MapPin size={14} />
                  {item.location}
                </div>

                <p className="text-xs font-semibold text-green-600">
                  {item.distance} km away
                </p>

                {/* RATING & STATUS */}
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{item.rating}</span>
                    <span className="text-gray-500">
                      ({item.user_ratings_total})
                    </span>
                  </div>

                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                      item.open_now
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <Clock size={12} />
                    {item.open_now ? "Open" : "Closed"}
                  </div>
                </div>

                {/* BADGES */}
                <div className="flex gap-2 pt-2">
                  <span className="flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                    <CheckCircle size={12} /> Verified
                  </span>
                  <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs">
                    <ShieldCheck size={12} /> Experienced
                  </span>
                </div>

                {/* SERVICES */}
                <div className="pt-2">
                  <p className="text-xs font-bold text-gray-500 mb-1">
                    SERVICES
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.slice(0, 3).map((service) => (
                      <span
                        key={service}
                        className="bg-orange-50 text-orange-700 px-2 py-1 rounded text-xs"
                      >
                        ✓ {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2 mt-auto pt-4">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-600 rounded-lg font-semibold hover:bg-indigo-100"
                  >
                    <Navigation size={16} />
                    Directions
                  </a>
                  <a
                    href="tel:07942696696"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-600 rounded-lg font-semibold hover:bg-green-100"
                  >
                    <Phone size={16} />
                    Call
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NearbyConstructionScreen;
