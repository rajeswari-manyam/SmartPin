import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Star,
  ChevronLeft,
  ChevronRight,
  Shield,
  TrendingUp,
  Navigation,
} from "lucide-react";

/* ================= TYPES ================= */

interface CaricatureArtist {
  id: string;
  name: string;
  rating: number;
  ratingsCount: number;
  location: string;
  city?: string;
  specialties: string[];
  phone: string;
  images: string[];
  lat?: number;
  lng?: number;
  verified?: boolean;
  trending?: boolean;
}

/* ================= DUMMY DATA ================= */

const DUMMY_ARTISTS: CaricatureArtist[] = [
  {
    id: "1",
    name: "Art By Manjeet",
    rating: 5.0,
    ratingsCount: 4,
    location: "Delhi",
    city: "Also Serves Chatra",
    specialties: ["Sketch", "Painting"],
    phone: "9876543210",
    lat: 28.6139,
    lng: 77.2090,
    images: [
      "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800",
    ],
    verified: true,
  },
  {
    id: "2",
    name: "Vola Art Escape",
    rating: 4.8,
    ratingsCount: 384,
    location: "Goa",
    specialties: ["3D Painting"],
    phone: "08123456789",
    lat: 15.2993,
    lng: 74.1240,
    images: [
      "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800",
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800",
    ],
    trending: true,
  },
];

/* ================= SINGLE ARTIST CARD ================= */

const SingleArtistCard: React.FC<{ artist: CaricatureArtist }> = ({ artist }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((i) => (i + 1) % artist.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex(
      (i) => (i - 1 + artist.images.length) % artist.images.length
    );
  };

  const handleCall = () => {
    window.location.href = `tel:${artist.phone}`;
  };

  const handleGetLocation = () => {
    if (artist.lat && artist.lng) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${artist.lat},${artist.lng}`,
        "_blank"
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition overflow-hidden flex flex-col">
      {/* IMAGE */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={artist.images[currentImageIndex]}
          alt={artist.name}
          className="w-full h-full object-cover"
        />

        {artist.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        <div className="absolute top-2 left-2 flex gap-2">
          {artist.trending && (
            <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <TrendingUp size={12} />
              Trending
            </span>
          )}
          {artist.verified && (
            <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <Shield size={12} />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <h3 className="text-lg font-bold line-clamp-2">{artist.name}</h3>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={14} />
          <span>{artist.location}</span>
          {artist.city && <span>• {artist.city}</span>}
        </div>

        {/* RATING */}
        <div className="flex items-center gap-1 text-sm">
          <Star size={14} className="fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{artist.rating}</span>
          <span className="text-gray-500">({artist.ratingsCount})</span>
        </div>

        {/* SPECIALTIES */}
        <div className="flex flex-wrap gap-2 pt-1">
          {artist.specialties.map((item, index) => (
            <span
              key={index}
              className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded"
            >
              ✓ {item}
            </span>
          ))}
        </div>

        {/* BUTTONS */}
        <div className="mt-auto pt-4 flex gap-2">
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 border-2 
                       border-green-600 text-green-700 bg-green-50 py-2 
                       rounded-lg font-semibold hover:bg-green-100"
          >
            <Phone size={16} />
            Call
          </button>

          <button
            onClick={handleGetLocation}
            className="flex-1 flex items-center justify-center gap-2 border-2 
                       border-indigo-600 text-indigo-700 bg-indigo-50 py-2 
                       rounded-lg font-semibold hover:bg-indigo-100"
          >
            <Navigation size={16} />
            Get Location
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= LISTING PAGE ================= */

const CaricatureArtistListing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">
        Digital Caricature Artists Near You
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_ARTISTS.map((artist) => (
          <SingleArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
};

export default CaricatureArtistListing;
