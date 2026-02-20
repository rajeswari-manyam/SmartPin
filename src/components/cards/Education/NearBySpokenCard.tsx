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
  MessageCircle,
  Flame,
  BadgeCheck,
  Zap,
} from "lucide-react";

/* ================= TYPES ================= */

export interface SpokenEnglishService {
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
  tags?: string[];
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  english_1: "07795681289",
  english_2: "06366424471",
  english_3: "07405901176",
  english_4: "07947103280",
};

export const DUMMY_SPOKEN_ENGLISH: SpokenEnglishService[] = [
  {
    place_id: "english_1",
    name: "Yuga Spoken English",
    vicinity: "Ameerpet Metro Station, Hyderabad",
    rating: 4.7,
    user_ratings_total: 232,
    geometry: { location: { lat: 17.437, lng: 78.448 } },
    opening_hours: { open_now: true },
    distance: 6,
    tags: ["Verified", "Responsive"],
  },
  {
    place_id: "english_2",
    name: "Veda Spoken English",
    vicinity: "Lingampally, Hyderabad",
    rating: 4.7,
    user_ratings_total: 351,
    geometry: { location: { lat: 17.465, lng: 78.348 } },
    opening_hours: { open_now: true },
    distance: 15,
    tags: ["Top Search"],
  },
  {
    place_id: "english_3",
    name: "IT Training Institute",
    vicinity: "Kukatpally, Hyderabad",
    rating: 3.9,
    user_ratings_total: 91,
    geometry: { location: { lat: 17.492, lng: 78.392 } },
    opening_hours: { open_now: true },
    distance: 5,
    tags: ["Responsive"],
  },
  {
    place_id: "english_4",
    name: "Eazee Spoken English",
    vicinity: "Chintal, Hyderabad",
    rating: 4.5,
    user_ratings_total: 988,
    geometry: { location: { lat: 17.518, lng: 78.412 } },
    opening_hours: { open_now: true },
    distance: 0.9,
    tags: ["Trending"],
  },
];

const CLASS_IMAGES_MAP: Record<string, string[]> = {
  english_1: [
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
  ],
  english_2: [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
    "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800",
  ],
  english_3: [
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  ],
  english_4: [
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
  ],
};

const COURSES = [
  "English Conversation",
  "Spoken English",
  "Grammar Training",
  "Interview Skills",
  "Personality Development",
];

/* ================= COMPONENT ================= */

interface Props {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleSpokenEnglishCard: React.FC<Props> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const photos = CLASS_IMAGES_MAP[job.id] || [];
  const currentPhoto = photos[currentImageIndex];

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

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative h-48 bg-gray-100">
        {currentPhoto ? (
          <img src={currentPhoto} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">
            💬
          </div>
        )}

        {photos.length > 1 && (
          <>
            {currentImageIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((i) => i - 1);
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
                  setCurrentImageIndex((i) => i + 1);
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
        <h3 className="text-lg font-bold text-gray-900 mb-1">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-sm font-semibold text-green-600 mb-2">
          {job.distance} km away
        </p>

        {/* TAGS */}
        <div className="flex flex-wrap gap-1 mb-2">
          {job.jobData.tags?.map((tag: string, i: number) => (
            <span
              key={i}
              className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* RATING */}
        <div className="flex items-center gap-2 mb-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold">{job.jobData.rating}</span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>

          <span className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">
            <Clock size={11} />
            Open
          </span>
        </div>

        {/* COURSES */}
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-500 mb-1">
            COURSES OFFERED
          </p>
          <div className="flex flex-wrap gap-1">
            {COURSES.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                <CheckCircle size={12} />
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 bg-indigo-50 border-2 border-indigo-600 text-indigo-700 text-xs font-bold py-2 rounded-lg"
          >
            <Navigation size={14} /> Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-1 bg-green-50 border-2 border-green-600 text-green-700 text-xs font-bold py-2 rounded-lg"
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= WRAPPER ================= */

const NearbySpokenEnglishCard: React.FC<Props> = ({ job, onViewDetails }) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_SPOKEN_ENGLISH.map((c) => (
          <SingleSpokenEnglishCard
            key={c.place_id}
            job={{
              id: c.place_id,
              title: c.name,
              location: c.vicinity,
              distance: c.distance,
              jobData: c,
            }}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleSpokenEnglishCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbySpokenEnglishCard;
