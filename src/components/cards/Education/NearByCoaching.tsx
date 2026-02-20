import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  CheckCircle,
} from "lucide-react";

/* ================= TYPES ================= */

export interface CoachingCenter {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  geometry: {
    location: { lat: number; lng: number };
  };
  subjects: string[];
  distance: number;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  coaching_1: "06366959905",
  coaching_2: "07947428384",
  coaching_3: "07942700342",
  coaching_4: "08401209022",
  coaching_5: "07411588571",
};

export const DUMMY_COACHING_CENTERS: CoachingCenter[] = [
  {
    place_id: "coaching_1",
    name: "Vidya Coaching Institute For Nurses",
    vicinity: "Ameerpet, Hyderabad",
    rating: 3.0,
    user_ratings_total: 2,
    subjects: ["Nursing", "Healthcare"],
    distance: 4.7,
    geometry: { location: { lat: 17.4375, lng: 78.4482 } },
  },
  {
    place_id: "coaching_2",
    name: "Shiva Sai Computer Education & Spoken English",
    vicinity: "HMT Main Road Chintal, Hyderabad",
    rating: 4.8,
    user_ratings_total: 133,
    subjects: ["Computer Training", "Spoken English"],
    distance: 1,
    geometry: { location: { lat: 17.51, lng: 78.42 } },
  },
  {
    place_id: "coaching_3",
    name: "Srinivasa IIT Foundation",
    vicinity: "Ganesh Nagar, Hyderabad",
    rating: 4.9,
    user_ratings_total: 92,
    subjects: ["IIT-JEE", "NEET", "Engineering"],
    distance: 2.4,
    geometry: { location: { lat: 17.495, lng: 78.415 } },
  },
];

const COACHING_IMAGES_MAP: Record<string, string[]> = {
  coaching_1: [
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=800",
  ],
  coaching_2: [
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
  ],
  coaching_3: [
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
  ],
};

const COACHING_DESCRIPTIONS_MAP: Record<string, string> = {
  coaching_1:
    "Specialized nursing coaching institute providing professional training and study materials.",
  coaching_2:
    "Trending institute with 133+ reviews offering computer training and spoken English.",
  coaching_3:
    "Top-rated IIT-JEE & NEET foundation coaching with expert faculty and mock tests.",
};

/* ================= COMPONENT ================= */

interface NearbyCoachingCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleCoachingCard: React.FC<NearbyCoachingCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    const id = job?.id || "coaching_1";
    return COACHING_IMAGES_MAP[id] || COACHING_IMAGES_MAP["coaching_1"];
  }, [job]);

  const photos = getPhotos();
  const currentPhoto = photos[currentImageIndex];

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex > 0) {
        setCurrentImageIndex((prev) => prev - 1);
      }
    },
    [currentImageIndex]
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex < photos.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      }
    },
    [currentImageIndex, photos.length]
  );

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

  if (!job) return null;

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[0.99] mb-4 overflow-hidden"
    >
      {/* IMAGE */}
      <div className="relative h-48 bg-gray-100">
        {!imageError && currentPhoto ? (
          <>
            <img
              src={currentPhoto}
              className="w-full h-full object-cover"
              alt={job.title}
              onError={() => setImageError(true)}
            />

            {photos.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}

                {currentImageIndex < photos.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                  {currentImageIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-6xl">📚</span>
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3.5">
        <h3 className="text-[17px] font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 mb-1">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="text-[13px] line-clamp-1">{job.location}</span>
        </div>

        <p className="text-xs font-semibold text-indigo-600 mb-2">
          {job.distance} km away
        </p>

        <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
          {COACHING_DESCRIPTIONS_MAP[job.id]}
        </p>

        <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          📘 Coaching Center
        </div>

        <div className="flex items-center gap-2 mb-2.5">
          <Star size={13} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[13px] font-semibold text-gray-900">
            {job.jobData.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>
        </div>

        {/* SUBJECTS */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
            SUBJECTS:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.jobData.subjects.slice(0, 3).map((s: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 text-[11px] font-medium px-2 py-1 rounded"
              >
                <CheckCircle size={11} />
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
          >
            <Navigation size={14} />
            Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-emerald-600 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
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

const NearbyCoachingCard: React.FC<NearbyCoachingCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_COACHING_CENTERS.map((c) => (
          <SingleCoachingCard
            key={c.place_id}
            job={{
              id: c.place_id,
              title: c.name,
              location: c.vicinity,
              distance: c.distance,
              jobData: c,
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleCoachingCard {...props} />;
};

export default NearbyCoachingCard;
