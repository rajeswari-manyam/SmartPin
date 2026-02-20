import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Navigation,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Hammer,
} from "lucide-react";

/* ================= TYPES ================= */

interface Builder {
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
    amenities?: string[];
  };
}

interface NearbyBuildersCardProps {
  job?: Builder;
  onViewDetails: (job: Builder) => void;
}

/* ================= PHONE NUMBERS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  builder_1: "09980795583",
  builder_2: "04760622445",
  builder_3: "08460232445",
  builder_4: "09988003289",
};

/* ================= IMAGES ================= */

const BUILDER_IMAGES_MAP: Record<string, string[]> = {
  builder_1: [
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    "https://images.unsplash.com/photo-1590586767908-20d6d1b6db58?w=800",
  ],
  builder_2: [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
  ],
  builder_3: [
    "https://images.unsplash.com/photo-1625844775804-9975a9b4748d?w=800",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
    "https://images.unsplash.com/photo-1590586767908-20d6d1b6db58?w=800",
  ],
  builder_4: [
    "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800",
  ],
};

/* ================= SERVICES ================= */

const BUILDER_SERVICES = [
  "Residential Construction",
  "Commercial Projects",
  "Renovation",
  "Project Management",
];

/* ================= DUMMY DATA ================= */

const DUMMY_BUILDERS: Builder[] = [
  {
    id: "builder_1",
    title: "S V S Developers and Builders",
    description: "Trusted builders for residential and commercial projects.",
    location: "Laxmiguda, Hyderabad",
    distance: 20.8,
    category: "Builders",
    jobData: {
      rating: 5.0,
      user_ratings_total: 18,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.505, lng: 78.52 } },
      amenities: BUILDER_SERVICES,
    },
  },
  {
    id: "builder_2",
    title: "Aneel Builders & Developers",
    description: "Expert civil contractors and construction managers.",
    location: "Lakdi Ka Pool, Hyderabad",
    distance: 9.5,
    category: "Builders",
    jobData: {
      rating: 4.7,
      user_ratings_total: 6,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.51, lng: 78.515 } },
      amenities: BUILDER_SERVICES,
    },
  },
  {
    id: "builder_3",
    title: "Raju Construction & Builders",
    description: "Quick-response builder for homes and shops.",
    location: "Chandrayan Gutta, Hyderabad",
    distance: 2.1,
    category: "Builders",
    jobData: {
      rating: 5.0,
      user_ratings_total: 3,
      opening_hours: { open_now: false },
      geometry: { location: { lat: 17.52, lng: 78.51 } },
      amenities: BUILDER_SERVICES,
    },
  },
  {
    id: "builder_4",
    title: "Skanda Builders and Developers",
    description: "Premium apartment & villa construction specialists.",
    location: "Hayath Nagar, Hyderabad",
    distance: 24.1,
    category: "Builders",
    jobData: {
      rating: 5.0,
      user_ratings_total: 11,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.5, lng: 78.525 } },
      amenities: BUILDER_SERVICES,
    },
  },
];

/* ================= SINGLE CARD ================= */

const SingleBuilderCard: React.FC<{
  job: Builder;
  onViewDetails: (job: Builder) => void;
}> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const photos = BUILDER_IMAGES_MAP[job.id] || [];
  const currentPhoto = photos[currentImageIndex];

  const rating = job.jobData?.rating;
  const total = job.jobData?.user_ratings_total;
  const isOpen = job.jobData?.opening_hours?.open_now;

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const loc = job.jobData?.geometry?.location;
    if (loc) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lng}`,
        "_blank"
      );
    }
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = PHONE_NUMBERS_MAP[job.id];
    if (phone) window.location.href = `tel:${phone}`;
  };

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
    >
      {/* Image Carousel */}
      <div className="relative h-48 bg-gray-200">
        {currentPhoto ? (
          <>
            <img src={currentPhoto} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((i) => (i - 1 + photos.length) % photos.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((i) => (i + 1) % photos.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2"
                >
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1}/{photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <Hammer size={40} />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 flex flex-col flex-grow">
        <h2 className="text-xl font-bold text-gray-800 line-clamp-2">
          {job.title}
        </h2>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={16} />
          <span className="line-clamp-1">{job.location}</span>
        </div>

        {job.distance && (
          <p className="text-xs font-semibold text-orange-600">
            {job.distance} km away
          </p>
        )}

        <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
          {job.description}
        </p>

        {/* Rating & Status */}
        <div className="flex items-center gap-3 text-sm">
          {rating && (
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-400 text-yellow-400" size={14} />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span className="text-gray-500">({total})</span>
            </div>
          )}
          {isOpen !== undefined && (
            <div
              className={`flex items-center gap-1 px-2 py-0.5 rounded ${isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              <Clock size={12} />
              <span className="text-xs font-semibold">
                {isOpen ? "Open" : "Closed"}
              </span>
            </div>
          )}
        </div>

        {/* Services */}
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">
            Services:
          </p>
          <div className="flex flex-wrap gap-2">
            {BUILDER_SERVICES.slice(0, 3).map((s, i) => (
              <span
                key={i}
                className="bg-orange-50 text-orange-600 px-2 py-1 rounded text-xs"
              >
                ✓ {s}
              </span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 text-orange-700 border-2 border-orange-600 rounded-lg font-semibold"
          >
            <Navigation size={16} /> Directions
          </button>
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg font-semibold"
          >
            <Phone size={16} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= LIST WRAPPER ================= */

const NearbyBuildersCard: React.FC<NearbyBuildersCardProps> = ({
  job,
  onViewDetails,
}) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_BUILDERS.map((builder) => (
          <SingleBuilderCard
            key={builder.id}
            job={builder}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleBuilderCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyBuildersCard;
