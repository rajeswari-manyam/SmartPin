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
  Music,
} from "lucide-react";

/* ================= TYPES ================= */

export interface MusicClassService {
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
  distance: number;
  trending?: boolean;
}

/* ================= CONSTANTS ================= */

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
  class_1: "07947123657",
  class_2: "07942696957",
  class_3: "07947431719",
  class_4: "07947418161",
};

// Dummy music classes
export const DUMMY_MUSIC_CLASSES: MusicClassService[] = [
  {
    place_id: "class_1",
    name: "Kalaa Nidhi Classical Dance And Music Classes",
    vicinity: "New Bowenpally, Hyderabad",
    rating: 4.9,
    user_ratings_total: 7,
    photos: [{ photo_reference: "class_photo_1" }],
    geometry: { location: { lat: 17.485, lng: 78.502 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    distance: 3.4,
  },
  {
    place_id: "class_2",
    name: "Sri Sai Krupa Music & Dance Classes",
    vicinity: "Alwal, Hyderabad",
    rating: 4.6,
    user_ratings_total: 9,
    photos: [{ photo_reference: "class_photo_2" }],
    geometry: { location: { lat: 17.502, lng: 78.518 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    distance: 6.1,
    trending: true,
  },
  {
    place_id: "class_3",
    name: "Meethosri Kaladhamam Bharatanatyam",
    vicinity: "Jeedimetla, Hyderabad",
    rating: 4.7,
    user_ratings_total: 12,
    photos: [{ photo_reference: "class_photo_3" }],
    geometry: { location: { lat: 17.51, lng: 78.468 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    distance: 1.5,
  },
];

// Images
const CLASS_IMAGES_MAP: Record<string, string[]> = {
  class_1: [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800",
    "https://images.unsplash.com/photo-1598387993240-e3c7e1e42ce6?w=800",
  ],
  class_2: [
    "https://images.unsplash.com/photo-1524594152303-9fd13543fe6e?w=800",
    "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=800",
  ],
  class_3: [
    "https://images.unsplash.com/photo-1614963872394-1df4e4e4c6b8?w=800",
  ],
};

// Descriptions
const CLASS_DESCRIPTIONS_MAP: Record<string, string> = {
  class_1:
    "Premier institute for Bharatanatyam, Kuchipudi, and Carnatic music with personalized training.",
  class_2:
    "Trending hobby school offering classical dance and music programs for all age groups.",
  class_3:
    "Professional Bharatanatyam academy focused on traditional techniques and performances.",
};

// Classes offered
const CLASS_SERVICES = [
  "Bharatanatyam",
  "Kuchipudi",
  "Carnatic Music",
  "Dance Basics",
  "Performance Training",
  "Beginner Friendly",
];

/* ================= COMPONENT ================= */

interface NearbyMusicClassesCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleMusicClassCard: React.FC<NearbyMusicClassesCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    if (!job) return [];
    return CLASS_IMAGES_MAP[job.id] || CLASS_IMAGES_MAP["class_1"];
  }, [job]);

  const photos = getPhotos();
  const currentPhoto = photos[currentImageIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((p) => Math.max(p - 1, 0));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((p) => Math.min(p + 1, photos.length - 1));
  };

  const phone = PHONE_NUMBERS_MAP[job.id];
  const description =
    CLASS_DESCRIPTIONS_MAP[job.id] || "Professional music & dance classes";

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer hover:scale-[0.99] overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {currentPhoto && !imageError ? (
          <>
            <img
              src={currentPhoto}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
            {currentImageIndex > 0 && (
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronLeft size={18} />
              </button>
            )}
            {currentImageIndex < photos.length - 1 && (
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
              >
                <ChevronRight size={18} />
              </button>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">
            🎵
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="font-bold text-[17px] text-gray-900 line-clamp-2 mb-1">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-xs font-semibold text-purple-600 mb-2">
          {job.distance.toFixed(1)} km away
        </p>

        <p className="text-[13px] text-gray-600 line-clamp-3 mb-2">
          {description}
        </p>

        <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <Music size={14} /> Music & Dance Classes
        </div>

        <div className="flex items-center gap-2 mb-2">
          <Star className="text-yellow-400 fill-yellow-400" size={14} />
          <span className="font-semibold text-sm">
            {job.jobData.rating}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>

          <span className="flex items-center gap-1 text-[11px] bg-green-100 text-green-700 px-2 py-0.5 rounded">
            <Clock size={11} /> Open
          </span>
        </div>

        {/* Classes */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 mb-1">
            CLASSES OFFERED:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CLASS_SERVICES.slice(0, 4).map((s, i) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-purple-100 text-purple-700 text-[11px] px-2 py-1 rounded"
              >
                <CheckCircle size={11} /> {s}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${job.jobData.geometry.location.lat},${job.jobData.geometry.location.lng}`,
                "_blank"
              );
            }}
            className="flex-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 font-bold text-xs py-2.5 rounded-lg flex justify-center gap-1"
          >
            <Navigation size={14} /> Directions
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = `tel:${phone}`;
            }}
            className="flex-1 border-2 border-purple-600 bg-purple-50 text-purple-700 font-bold text-xs py-2.5 rounded-lg flex justify-center gap-1"
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= WRAPPER ================= */

const NearbyMusicClassesCard: React.FC<NearbyMusicClassesCardProps> = ({
  job,
  onViewDetails,
}) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_MUSIC_CLASSES.map((c) => (
          <SingleMusicClassCard
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

  return <SingleMusicClassCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyMusicClassesCard;
