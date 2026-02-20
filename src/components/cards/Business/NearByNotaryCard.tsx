import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Navigation,
  Star,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

/* ================= TYPES ================= */

export interface NotaryService {
  id: string;
  title: string;
  location?: string;
  distance?: number;
  jobData?: {
    rating?: number;
    user_ratings_total?: number;
    geometry?: { location: { lat: number; lng: number } };
    phone?: string;
    specializations?: string[];
    verified?: boolean;
    is_trending?: boolean;
  };
}

interface NearbyNotaryCardProps {
  job?: NotaryService;
  onViewDetails: (job: NotaryService) => void;
}

/* ================= DUMMY DATA ================= */

const DUMMY_NOTARIES: NotaryService[] = [
  {
    id: "notary_1",
    title: "Sree Sai Laxmi Consultancy",
    location: "Brig Syed Road, Hyderabad",
    distance: 3.7,
    jobData: {
      rating: 4.6,
      user_ratings_total: 82,
      phone: "09980132182",
      verified: true,
      specializations: ["Document Writer", "Birth Certificate"],
      geometry: { location: { lat: 17.4435, lng: 78.4895 } },
    },
  },
  {
    id: "notary_2",
    title: "MS Legal Associates",
    location: "Kukatpally, Hyderabad",
    distance: 3.8,
    jobData: {
      rating: 4.4,
      user_ratings_total: 61,
      phone: "09972352171",
      specializations: ["Notary Services", "Documentation"],
      geometry: { location: { lat: 17.4849, lng: 78.3866 } },
    },
  },
  {
    id: "notary_3",
    title: "Raja Rajeshwari Associates",
    location: "Bowenpally, Hyderabad",
    distance: 3.5,
    jobData: {
      rating: 5.0,
      user_ratings_total: 3,
      phone: "09725305527",
      verified: true,
      is_trending: true,
      specializations: ["Public Notary"],
      geometry: { location: { lat: 17.4742, lng: 78.4621 } },
    },
  },
];

/* ================= IMAGES ================= */

const NOTARY_IMAGES_MAP: Record<string, string[]> = {
  notary_1: [
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
  ],
  notary_2: [
    "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800",
  ],
  notary_3: [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  ],
};

/* ================= SINGLE CARD ================= */

const SingleNotaryCard: React.FC<{
  job: NotaryService;
  onViewDetails: (job: NotaryService) => void;
}> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const photos = NOTARY_IMAGES_MAP[job.id] || [];
  const currentPhoto = photos[currentImageIndex];

  const { rating, user_ratings_total, phone, verified, is_trending, geometry } =
    job.jobData || {};

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (geometry) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${geometry.location.lat},${geometry.location.lng}`,
        "_blank"
      );
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) window.location.href = `tel:${phone}`;
  };

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        {currentPhoto ? (
          <>
            <img
              src={currentPhoto}
              alt={job.title}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((p) => Math.max(p - 1, 0));
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((p) =>
                      Math.min(p + 1, photos.length - 1)
                    );
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-4xl">
            📝
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-bold line-clamp-2">{job.title}</h3>
          {verified && (
            <span className="bg-black text-white text-xs px-2 py-1 rounded flex items-center gap-1">
              <CheckCircle size={12} /> Verified
            </span>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPin size={15} className="mr-1" />
          <span className="line-clamp-1">{job.location}</span>
        </div>

        {job.distance && (
          <p className="text-xs font-semibold text-indigo-600">
            {job.distance} km away
          </p>
        )}

        <div className="flex items-center gap-3 pt-1">
          {rating && (
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="text-yellow-400 fill-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              {user_ratings_total && (
                <span className="text-gray-500 text-xs">
                  ({user_ratings_total})
                </span>
              )}
            </div>
          )}

          {is_trending && (
            <span className="flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded">
              <TrendingUp size={12} /> Trending
            </span>
          )}
        </div>

        {/* Specializations */}
        {job.jobData?.specializations && (
          <div className="flex flex-wrap gap-2 pt-2">
            {job.jobData.specializations.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-4 mt-auto">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-indigo-100"
          >
            <Navigation size={16} />
            Directions
          </button>

          <button
            onClick={handleCall}
            disabled={!phone}
            className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 border-2 border-green-600 px-4 py-2.5 rounded-lg font-semibold hover:bg-green-100 disabled:opacity-50"
          >
            <Phone size={16} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= WRAPPER ================= */

const NearbyNotaryCard: React.FC<NearbyNotaryCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_NOTARIES.map((notary) => (
          <SingleNotaryCard
            key={notary.id}
            job={notary}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return (
    <SingleNotaryCard
      job={props.job}
      onViewDetails={props.onViewDetails}
    />
  );
};

export default NearbyNotaryCard;
