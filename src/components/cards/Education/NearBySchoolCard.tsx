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

interface NearbySchoolCardProps {
  job?: any;
  onViewDetails: (job: any) => void;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  school_1: "08792061154",
  school_2: "08460443253",
  school_3: "08485943896",
  school_4: "07405657588",
};

export const DUMMY_SCHOOLS = [
  {
    place_id: "school_1",
    name: "Iris Florets World School",
    vicinity: "Sri Ram Nagar Gajularamaram, Hyderabad",
    rating: 4.5,
    user_ratings_total: 54,
    distance: 6.4,
    geometry: { location: { lat: 17.51, lng: 78.42 } },
    special_tags: ["Responsive", "Clean Facilities"],
    services: ["CBSE Board", "Student Teacher Ratio 20:1"],
  },
  {
    place_id: "school_2",
    name: "Meridian School Kompally",
    vicinity: "Sathyam Enclave Kompally, Rangareddy",
    rating: 3.8,
    user_ratings_total: 4,
    distance: 4.2,
    geometry: { location: { lat: 17.505, lng: 78.415 } },
    special_tags: ["Verified"],
    services: ["CBSE", "IB Curriculum"],
  },
  {
    place_id: "school_3",
    name: "T.I.M.E School",
    vicinity: "Medchal, Rangareddy",
    rating: 3.7,
    user_ratings_total: 287,
    distance: 11.7,
    geometry: { location: { lat: 17.508, lng: 78.418 } },
    special_tags: ["Popular", "Verified"],
    services: ["CBSE", "14:1 Student Ratio", "Co-ed"],
  },
  {
    place_id: "school_4",
    name: "Rainbow High School",
    vicinity: "Bowenpally, Hyderabad",
    rating: 4.5,
    user_ratings_total: 92,
    distance: 2.3,
    geometry: { location: { lat: 17.512, lng: 78.422 } },
    special_tags: ["Responsive"],
    services: ["CBSE", "State Board"],
  },
];

const SCHOOL_IMAGES_MAP: Record<string, string[]> = {
  school_1: [
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
  ],
  school_2: [
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
    "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800",
  ],
  school_3: [
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
  ],
  school_4: [
    "https://images.unsplash.com/photo-1562774053-701939374585?w=800",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
  ],
};

/* ================= COMPONENT ================= */

const SingleSchoolCard: React.FC<NearbySchoolCardProps> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    return SCHOOL_IMAGES_MAP[job?.id] || [];
  }, [job]);

  const photos = getPhotos();
  const currentPhoto = photos[currentImageIndex];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < photos.length - 1)
      setCurrentImageIndex((p) => p + 1);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) setCurrentImageIndex((p) => p - 1);
  };

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

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer hover:scale-[0.99]"
    >
      {/* IMAGE */}
      <div className="relative h-48 bg-gray-100">
        {!imageError && currentPhoto ? (
          <>
            <img
              src={currentPhoto}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />

            {photos.length > 1 && (
              <>
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
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <School size={48} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="text-[17px] font-bold text-gray-900 mb-1 line-clamp-2">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 text-[13px] mb-1">
          <MapPin size={14} className="mr-1" />
          <span className="line-clamp-1">{job.location}</span>
        </div>

        <p className="text-xs font-semibold text-blue-600 mb-2">
          {job.distance.toFixed(1)} km away
        </p>

        {/* TAGS */}
        <div className="flex flex-wrap gap-1 mb-2">
          {job.jobData.special_tags.map((tag: string, i: number) => (
            <span
              key={i}
              className="bg-blue-100 text-blue-700 text-[10px] font-semibold px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* DESCRIPTION */}
        <p className="text-[13px] text-gray-600 mb-2 line-clamp-3">
          Quality educational institution with experienced faculty and modern
          infrastructure.
        </p>

        {/* CATEGORY */}
        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
          <School size={12} /> School
        </span>

        {/* RATING */}
        <div className="flex items-center gap-2 mb-3">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">
            {job.jobData.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>
        </div>

        {/* SERVICES */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 mb-1">
            CURRICULUM & FEATURES
          </p>
          <div className="flex flex-wrap gap-1.5">
            {job.jobData.services.slice(0, 3).map((s: string, i: number) => (
              <span
                key={i}
                className="flex items-center gap-1 bg-blue-100 text-blue-700 text-[11px] px-2 py-1 rounded"
              >
                <CheckCircle size={11} /> {s}
              </span>
            ))}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-blue-600 bg-blue-50 text-blue-700 font-bold text-xs py-2.5 rounded-lg"
          >
            <Navigation size={14} /> Directions
          </button>

          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-1 border-2 border-green-600 bg-green-50 text-green-700 font-bold text-xs py-2.5 rounded-lg"
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= WRAPPER ================= */

const NearbySchoolCard: React.FC<NearbySchoolCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_SCHOOLS.map((school) => (
          <SingleSchoolCard
            key={school.place_id}
            job={{
              id: school.place_id,
              title: school.name,
              location: school.vicinity,
              distance: school.distance,
              jobData: school,
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return (
    <SingleSchoolCard job={props.job} onViewDetails={props.onViewDetails} />
  );
};

export default NearbySchoolCard;
