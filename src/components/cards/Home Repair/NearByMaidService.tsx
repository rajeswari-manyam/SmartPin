import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  MessageCircle,
  Star,
  Clock,
  CheckCircle,
  Briefcase,
} from "lucide-react";

/* ================= TYPES ================= */

export interface MaidService {
  id: string;
  title: string;
  location?: string;
  description?: string;
  distance?: number;
  rating?: number;
  user_ratings_total?: number;
  verified?: boolean;
  trusted?: boolean;
  popular?: boolean;
  trending?: boolean;
  yearsInBusiness?: number;
  services?: string[];
  responseTime?: string;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  service_1: "09035020105",
  service_2: "07383744017",
  service_3: "09972359892",
  service_4: "07405233240",
};

const SERVICE_IMAGES_MAP: Record<string, string[]> = {
  service_1: [
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800",
  ],
  service_2: [
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
  ],
  service_3: [
    "https://images.unsplash.com/photo-1581578949510-fa7315c4c350?w=800",
  ],
  service_4: [
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
  ],
};

/* ================= DUMMY DATA ================= */

export const DUMMY_MAIDS: MaidService[] = [
  {
    id: "service_1",
    title: "Sri Manikanta Placement Services",
    location: "Hyderabad",
    distance: 4.3,
    rating: 4.1,
    user_ratings_total: 257,
    verified: true,
    trusted: true,
    popular: true,
    yearsInBusiness: 5,
    services: ["Maid Placement", "Cook"],
    responseTime: "Responds in 2 Hours",
    description:
      "Professional maid placement with verified candidates and trained staff.",
  },
  {
    id: "service_2",
    title: "Sri Radha Krishna Home Care",
    location: "Hyderabad",
    distance: 3.8,
    rating: 4.3,
    user_ratings_total: 24,
    yearsInBusiness: 7,
    services: ["Baby Sitting", "Elder Care"],
    responseTime: "Responds in 4 Hours",
    description: "Reliable home care and domestic services.",
  },
];

/* ================= SINGLE CARD ================= */

interface NearbyMaidCardProps {
  job?: MaidService;
  onViewDetails: (job: MaidService) => void;
}

const SingleMaidCard: React.FC<NearbyMaidCardProps> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const photos = SERVICE_IMAGES_MAP[job?.id || ""] || [];
  const currentPhoto = photos[currentImageIndex];

  const handlePrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((p) => Math.max(p - 1, 0));
  }, []);

  const handleNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setCurrentImageIndex((p) =>
        Math.min(p + 1, photos.length - 1)
      );
    },
    [photos.length]
  );

  const handleCall = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const phone = PHONE_NUMBERS_MAP[job?.id || ""];
      if (phone) window.location.href = `tel:${phone}`;
    },
    [job]
  );

  const handleDirections = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const destination = encodeURIComponent(job?.location || "");
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${destination}`, "_blank");
    },
    [job]
  );

  if (!job) return null;

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {currentPhoto ? (
          <>
            <img
              src={currentPhoto}
              alt={job.title}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                  >
                    <ChevronLeft size={18} />
                  </button>
                )}
                {currentImageIndex < photos.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
                  >
                    <ChevronRight size={18} />
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-5xl">
            🧹
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 line-clamp-2">
          {job.title}
        </h3>

        <div className="flex items-center text-sm text-gray-500 mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        {job.distance && (
          <p className="text-xs font-semibold text-red-600 mb-2">
            {job.distance.toFixed(1)} km away
          </p>
        )}

        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
          {job.description}
        </p>

        {/* Rating */}
        {job.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star size={14} className="fill-yellow-400 text-yellow-400" />
            <span className="font-semibold text-sm">
              {job.rating.toFixed(1)}
            </span>
            <span className="text-xs text-gray-500">
              ({job.user_ratings_total})
            </span>
          </div>
        )}

        {/* Years */}
        {job.yearsInBusiness && (
          <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
            <Briefcase size={12} />
            {job.yearsInBusiness} Years in Business
          </div>
        )}

        {/* Services */}
        {job.services && (
          <div className="flex flex-wrap gap-1 mb-3">
            {job.services.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded"
              >
                <CheckCircle size={11} className="inline mr-1" />
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 text-green-600 bg-green-50 rounded-lg py-2 text-sm font-bold"
          >
            <Phone size={14} />
            Call
          </button>

          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 text-indigo-600 bg-indigo-50 rounded-lg py-2 text-sm font-bold"
          >
            <MapPin size={14} />
            Get Location
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= WRAPPER (LIKE AMBULANCE) ================= */

const NearbyMaidCard: React.FC<NearbyMaidCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_MAIDS.map((maid) => (
          <SingleMaidCard
            key={maid.id}
            job={maid}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  // ✅ EXACT REQUIREMENT
  return (
    <SingleMaidCard
      job={props.job}
      onViewDetails={props.onViewDetails}
    />
  );
};

export default NearbyMaidCard;
