import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  CheckCircle,
  School,
} from "lucide-react";

/* ================= TYPES ================= */

export interface CollegeService {
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
  opening_hours?: { open_now: boolean };
  degree_types: string[];
  facilities: string[];
  distance: number;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  college_1: "08197937635",
  college_2: "07041734472",
  college_3: "07041645949",
  college_4: "08401753148",
  college_5: "08123116335",
};

export const DUMMY_COLLEGES: CollegeService[] = [
  {
    place_id: "college_1",
    name: "UG & PG College with MSC Microbiology",
    vicinity: "Kompally, Hyderabad",
    rating: 4.2,
    user_ratings_total: 156,
    photos: [{ photo_reference: "college_photo_1" }],
    geometry: { location: { lat: 17.505, lng: 78.415 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    degree_types: ["MSC Microbiology", "UG Programs", "PG Programs"],
    facilities: ["Library", "Labs"],
    distance: 3.2,
  },
  {
    place_id: "college_2",
    name: "Top Rated Degree College",
    vicinity: "Alwal, Hyderabad",
    rating: 4.6,
    user_ratings_total: 289,
    photos: [{ photo_reference: "college_photo_2" }],
    geometry: { location: { lat: 17.502, lng: 78.518 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    degree_types: ["B.Com", "BBA", "B.Sc"],
    facilities: ["Computer Labs", "Cafeteria"],
    distance: 5.8,
  },
  {
    place_id: "college_3",
    name: "Junior & Degree College",
    vicinity: "Jeedimetla, Hyderabad",
    rating: 4.1,
    user_ratings_total: 87,
    photos: [{ photo_reference: "college_photo_3" }],
    geometry: { location: { lat: 17.51, lng: 78.468 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    degree_types: ["Intermediate", "Degree"],
    facilities: ["Computer Labs", "Sports"],
    distance: 2.1,
  },
];

const COLLEGE_IMAGES_MAP: Record<string, string[]> = {
  college_1: [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
    "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
  ],
  college_2: [
    "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
  ],
  college_3: [
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800",
  ],
};

const COLLEGE_DESCRIPTIONS_MAP: Record<string, string> = {
  college_1:
    "Well-established UG & PG college with MSC Microbiology. Known for regular evaluations and quality education.",
  college_2:
    "Top-rated verified degree college with clean facilities and responsive management.",
  college_3:
    "Junior and degree college offering student-focused education with computer labs.",
};

/* ================= COMPONENT ================= */

interface NearbyCollegeCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleCollegeCard: React.FC<NearbyCollegeCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const photos = COLLEGE_IMAGES_MAP[job?.id] || [];
  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex > 0) {
        setCurrentImageIndex((p) => p - 1);
      }
    },
    [currentImageIndex]
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex < photos.length - 1) {
        setCurrentImageIndex((p) => p + 1);
      }
    },
    [currentImageIndex, photos.length]
  );

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phone = PHONE_NUMBERS_MAP[job?.id];
    if (!phone) return alert("Phone number not available");
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { lat, lng } = job?.jobData?.geometry?.location || {};
    if (!lat || !lng) return alert("Location not available");
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
      {/* Image Carousel */}
      <div className="relative h-48 bg-gray-100">
        {currentPhoto && !imageError ? (
          <>
            <img
              src={currentPhoto}
              alt={job.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
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
                  {currentImageIndex + 1}/{photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <School size={48} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5">
        <h3 className="text-[17px] font-bold text-gray-900 leading-snug line-clamp-2 mb-1.5">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 mb-1">
          <MapPin size={14} className="mr-1 flex-shrink-0" />
          <span className="text-[13px] line-clamp-1">{job.location}</span>
        </div>

        <p className="text-xs font-semibold text-indigo-600 mb-2">
          {job.distance?.toFixed(1)} km away
        </p>

        <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
          {COLLEGE_DESCRIPTIONS_MAP[job.id]}
        </p>

        {/* Category */}
        <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <School size={12} />
          College
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2.5">
          <Star size={13} className="text-yellow-400 fill-yellow-400" />
          <span className="text-[13px] font-semibold text-gray-900">
            {job.jobData?.rating}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData?.user_ratings_total})
          </span>
        </div>

        {/* Programs */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
            PROGRAMS & FACILITIES:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.degree_types?.slice(0, 4).map((item: string, i: number) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-600 text-[11px] font-medium px-2 py-1 rounded"
              >
                <CheckCircle size={11} />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
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

const NearbyCollegeCard: React.FC<NearbyCollegeCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_COLLEGES.map((college) => (
          <SingleCollegeCard
            key={college.place_id}
            job={{
              id: college.place_id,
              title: college.name,
              location: college.vicinity,
              distance: college.distance,
              degree_types: college.degree_types,
              jobData: college,
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleCollegeCard {...props} />;
};

export default NearbyCollegeCard;
