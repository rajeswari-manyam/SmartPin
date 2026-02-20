import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Navigation,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Award,
} from "lucide-react";

/* ================= TYPES ================= */

export interface InteriorService {
  id: string;
  title: string;
  description?: string;
  location?: string;
  distance?: number | string;
  category?: string;
  jobData?: {
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: { open_now: boolean };
    geometry?: { location: { lat: number; lng: number } };
    services_offered?: string[];
    years_in_business?: string;
  };
}

interface NearbyInteriorCardProps {
  job?: InteriorService;
  onViewDetails: (job: InteriorService) => void;
}

/* ================= STATIC DATA ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  interior_1: "09036655795",
  interior_2: "08460230407",
  interior_3: "09487863775",
  interior_4: "09035018046",
};

const INTERIOR_IMAGES_MAP: Record<string, string[]> = {
  interior_1: [
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800",
  ],
  interior_2: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800",
  ],
  interior_3: [
    "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800",
    "https://images.unsplash.com/photo-1615875221248-3d0fa1fb5715?w=800",
  ],
  interior_4: [
    "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800",
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800",
  ],
};

const INTERIOR_SERVICES = [
  "Residential Interior",
  "Commercial Interior",
  "False Ceiling",
  "Modular Kitchen",
];

const DUMMY_INTERIORS: InteriorService[] = [
  {
    id: "interior_1",
    title: "Aluminium & Interior Glass Works",
    location: "Uppal, Hyderabad",
    distance: "16.5",
    category: "Interior Designer",
    description:
      "Experts in aluminium, glass work, and modern interior solutions.",
    jobData: {
      rating: 4.4,
      user_ratings_total: 7,
      opening_hours: { open_now: true },
      years_in_business: "12 Years Experience",
      services_offered: INTERIOR_SERVICES,
      geometry: { location: { lat: 17.4065, lng: 78.5512 } },
    },
  },
  {
    id: "interior_2",
    title: "Crystal Waves Interior",
    location: "Manikonda, Hyderabad",
    distance: "12.8",
    category: "Interior Designer",
    description:
      "Verified interior designers offering full home & office interiors.",
    jobData: {
      rating: 4.3,
      user_ratings_total: 67,
      opening_hours: { open_now: true },
      years_in_business: "15 Years Experience",
      services_offered: INTERIOR_SERVICES,
      geometry: { location: { lat: 17.4013, lng: 78.3792 } },
    },
  },
];

/* ================= SINGLE CARD ================= */

const SingleInteriorCard: React.FC<{
  job: InteriorService;
  onViewDetails: (job: InteriorService) => void;
}> = ({ job, onViewDetails }) => {
  const [imageIndex, setImageIndex] = useState(0);

  const photos = INTERIOR_IMAGES_MAP[job.id] || [];
  const photo = photos[imageIndex];

  const rating = job.jobData?.rating;
  const isOpen = job.jobData?.opening_hours?.open_now;

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = PHONE_NUMBERS_MAP[job.id];
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const loc = job.jobData?.geometry?.location;
    if (loc)
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
        "_blank"
      );
  };

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col"
    >
      {/* IMAGE */}
      <div className="relative h-48 bg-gray-200">
        {photo ? (
          <>
            <img
              src={photo}
              alt={job.title}
              className="w-full h-full object-cover"
            />
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageIndex((i) => (i - 1 + photos.length) % photos.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setImageIndex((i) => (i + 1) % photos.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-4xl">
            🏠
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <h2 className="text-lg font-bold text-gray-800">{job.title}</h2>

        <div className="flex items-center text-sm text-gray-600 gap-1">
          <MapPin size={14} />
          {job.location}
        </div>

        <p className="text-xs font-semibold text-indigo-600">
          {job.distance} km away
        </p>

        <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
          {job.description}
        </p>

        {/* Rating + Status */}
        <div className="flex items-center gap-3 text-sm">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-400 text-yellow-400" size={14} />
              <span className="font-semibold">{rating}</span>
              <span className="text-gray-500">
                ({job.jobData?.user_ratings_total})
              </span>
            </div>
          )}
          {isOpen !== undefined && (
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <Clock size={12} className="inline mr-1" />
              {isOpen ? "Open" : "Closed"}
            </span>
          )}
        </div>

        {/* Services */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">
            Services
          </p>
          <div className="flex flex-wrap gap-2">
            {job.jobData?.services_offered?.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs"
              >
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 pt-3">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-indigo-600 text-indigo-700 bg-indigo-50 py-2 rounded-lg font-semibold"
          >
            <Navigation size={16} />
            Directions
          </button>
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-green-600 text-green-700 bg-green-50 py-2 rounded-lg font-semibold"
          >
            <Phone size={16} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT ================= */

const NearbyInteriorCard: React.FC<NearbyInteriorCardProps> = ({
  job,
  onViewDetails,
}) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_INTERIORS.map((item) => (
          <SingleInteriorCard
            key={item.id}
            job={item}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleInteriorCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyInteriorCard;
