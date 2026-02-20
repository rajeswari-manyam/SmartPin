/**
 * ============================================================================
 * NearbyResortsCard.tsx - Resort Card (React Web Version)
 * ============================================================================
 *
 * Features:
 * - Image carousel
 * - Description
 * - Amenities
 * - Special tags (Verified, Trending, etc.)
 * - Directions & Call buttons
 * - Grid view with dummy data
 */

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
  Trees,
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
  id: string;
  title?: string;
  location?: string;
  description?: string;
  distance?: number;
  category?: string;
  jobData?: any;
}

/* ================= PHONE MAP ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  resort_1: "08460501307",
  resort_2: "08050952150",
  resort_3: "07947110296",
  resort_4: "07947138860",
};

/* ================= DUMMY RESORT DATA ================= */

export const DUMMY_RESORTS = [
  {
    place_id: "resort_1",
    name: "Vanam Resort",
    vicinity: "Jeedimetla Village, Hyderabad",
    rating: 5.0,
    user_ratings_total: 3,
    geometry: { location: { lat: 17.52, lng: 78.435 } },
    opening_hours: { open_now: true },
    distance_text: "3.5 km",
    special_tags: ["Responsive"],
    amenities: ["Farm House", "Swimming Pool", "Party Halls"],
  },
  {
    place_id: "resort_2",
    name: "Dream Valley Resorts",
    vicinity: "Banjara Hills, Hyderabad",
    rating: 4.0,
    user_ratings_total: 1446,
    geometry: { location: { lat: 17.53, lng: 78.44 } },
    opening_hours: { open_now: true },
    distance_text: "8 km",
    special_tags: ["Verified", "Top Search"],
    amenities: ["Swimming Pool", "Restaurant", "Sports"],
  },
  {
    place_id: "resort_3",
    name: "Wonder Family Resorts",
    vicinity: "Madhapur, Hyderabad",
    rating: 4.5,
    user_ratings_total: 20,
    geometry: { location: { lat: 17.525, lng: 78.438 } },
    opening_hours: { open_now: true },
    distance_text: "9.1 km",
    special_tags: ["Trending"],
    amenities: ["Kids Play Area", "Party Halls", "Farm House"],
  },
  {
    place_id: "resort_4",
    name: "Maheshwar Palace",
    vicinity: "HMT Road, Hyderabad",
    rating: 3.7,
    user_ratings_total: 13,
    geometry: { location: { lat: 17.515, lng: 78.432 } },
    opening_hours: { open_now: true },
    distance_text: "1.2 km",
    special_tags: ["Top Rated"],
    amenities: ["Heritage Resort", "Restaurant", "Events"],
  },
];

/* ================= IMAGES ================= */

const RESORT_IMAGES_MAP: Record<string, string[]> = {
  resort_1: [
    "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800",
  ],
  resort_2: [
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
    "https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800",
  ],
  resort_3: [
    "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?w=800",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800",
  ],
  resort_4: [
    "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
  ],
};

/* ================= SINGLE CARD ================= */

const SingleResortCard: React.FC<{
  job: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const photos = RESORT_IMAGES_MAP[job.id] || [];
  const jobData = job.jobData;

  const handleDirections = useCallback(() => {
    const { lat, lng } = jobData.geometry.location;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  }, [jobData]);

  const handleCall = useCallback(() => {
    const phone = PHONE_NUMBERS_MAP[job.id];
    if (phone) window.location.href = `tel:${phone}`;
  }, [job.id]);

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48">
        <img
          src={photos[index]}
          alt={job.title}
          className="w-full h-full object-cover"
        />

        {index > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex(index - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {index < photos.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex(index + 1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{job.title}</h3>

        <div className="flex items-center text-sm text-gray-500 mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-indigo-600 text-xs font-semibold mb-2">
          {jobData.distance_text}
        </p>

        {/* Tags */}
        <div className="flex gap-1 flex-wrap mb-2">
          {jobData.special_tags?.map((tag: string) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-1 rounded bg-indigo-100 text-indigo-700 font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">{jobData.rating}</span>
          <span className="text-xs text-gray-500">
            ({jobData.user_ratings_total})
          </span>
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
            <Clock size={11} /> Open
          </span>
        </div>

        {/* Amenities */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 mb-1">
            AMENITIES:
          </p>
          <div className="flex flex-wrap gap-1">
            {jobData.amenities.slice(0, 4).map((a: string) => (
              <span
                key={a}
                className="flex items-center gap-1 bg-indigo-100 text-indigo-600 text-[11px] px-2 py-1 rounded"
              >
                <CheckCircle size={11} /> {a}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDirections();
            }}
            className="flex-1 border border-indigo-600 text-indigo-600 bg-indigo-50 rounded-lg py-2 text-xs font-bold flex justify-center gap-1"
          >
            <Navigation size={14} /> Directions
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCall();
            }}
            className="flex-1 border border-emerald-600 text-emerald-600 bg-emerald-50 rounded-lg py-2 text-xs font-bold flex justify-center gap-1"
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

const NearbyResortsCard: React.FC<{
  job?: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_RESORTS.map((resort) => (
          <SingleResortCard
            key={resort.place_id}
            job={{
              id: resort.place_id,
              title: resort.name,
              location: resort.vicinity,
              category: "Resort",
              jobData: resort,
            }}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleResortCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyResortsCard;
