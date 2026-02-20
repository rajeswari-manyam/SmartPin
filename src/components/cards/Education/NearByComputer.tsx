import React, { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Navigation,
  Star,
  CheckCircle,
  Laptop,
} from "lucide-react";

/* ================= TYPES ================= */

export interface ComputerTrainingInstitute {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  geometry: {
    location: { lat: number; lng: number };
  };
  special_tags?: string[];
  courses?: string[];
  distance?: number;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  computer_1: "07405901176",
  computer_2: "07947432202",
  computer_3: "08971927675",
  computer_4: "07947129636",
};

export const DUMMY_COMPUTER_TRAINING: ComputerTrainingInstitute[] = [
  {
    place_id: "computer_1",
    name: "VMS Institute Of Computer Technologies",
    vicinity: "Kukatpally, Hyderabad",
    rating: 3.9,
    user_ratings_total: 91,
    geometry: { location: { lat: 17.492, lng: 78.405 } },
    special_tags: ["Responsive"],
    courses: ["Programming", "IT Training", "Placement"],
    distance: 5,
  },
  {
    place_id: "computer_2",
    name: "MG Tech Institute",
    vicinity: "Suchitra Junction, Hyderabad",
    rating: 4.6,
    user_ratings_total: 91,
    geometry: { location: { lat: 17.52, lng: 78.44 } },
    special_tags: ["Verified", "Trending"],
    courses: ["Computer Training", "Tally", "Accounting"],
    distance: 22,
  },
  {
    place_id: "computer_3",
    name: "Cloud Soft Solution",
    vicinity: "Ameerpet, Hyderabad",
    rating: 4.2,
    user_ratings_total: 221,
    geometry: { location: { lat: 17.4375, lng: 78.4482 } },
    special_tags: ["Popular", "Highly Specialised"],
    courses: ["Cloud", "Cybersecurity", "Networking"],
    distance: 6.1,
  },
  {
    place_id: "computer_4",
    name: "Free Computer Centre",
    vicinity: "Suchitra Road, Hyderabad",
    rating: 3.6,
    user_ratings_total: 17,
    geometry: { location: { lat: 17.515, lng: 78.438 } },
    courses: ["C Programming", "Computer Basics"],
    distance: 1.9,
  },
];

const COMPUTER_IMAGES: Record<string, string[]> = {
  computer_1: [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800",
  ],
  computer_2: [
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
    "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
  ],
  computer_3: [
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800",
  ],
  computer_4: [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  ],
};

/* ================= COMPONENT ================= */

interface Props {
  job?: any;
  onViewDetails: (job: any) => void;
}

const SingleComputerTrainingCard: React.FC<Props> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const images = COMPUTER_IMAGES[job.id] || COMPUTER_IMAGES["computer_1"];
  const currentImage = images[index];

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
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={currentImage}
          alt={job.title}
          className="w-full h-full object-cover"
        />

        {index > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex(index - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {index < images.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex(index + 1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-[17px] mb-1">
          {job.title}
        </h3>

        <div className="flex items-center text-gray-500 text-sm mb-1">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        {job.distance && (
          <p className="text-xs font-semibold text-pink-600 mb-2">
            {job.distance} km away
          </p>
        )}

        {/* Tags */}
        {job.jobData.special_tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {job.jobData.special_tags.map((tag: string, i: number) => (
              <span
                key={i}
                className="bg-pink-100 text-pink-700 text-[10px] px-2 py-0.5 rounded font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <Star size={14} className="text-yellow-400 fill-yellow-400" />
          <span className="font-semibold text-sm">
            {job.jobData.rating.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">
            ({job.jobData.user_ratings_total})
          </span>
        </div>

        {/* Courses */}
        <div className="mb-3">
          <p className="text-[10px] font-bold text-gray-500 mb-1">
            COURSES:
          </p>
          <div className="flex flex-wrap gap-1">
            {job.jobData.courses.slice(0, 3).map((course: string, i: number) => (
              <span
                key={i}
                className="bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded flex items-center gap-1"
              >
                <CheckCircle size={11} />
                {course}
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 border-2 border-indigo-600 text-indigo-700 bg-indigo-50 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
          >
            <Navigation size={14} />
            Direction
          </button>

          <button
            onClick={handleCall}
            className="flex-1 border-2 border-pink-600 text-pink-600 bg-pink-50 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
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

const NearbyComputerTrainingCard: React.FC<Props> = ({ job, onViewDetails }) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_COMPUTER_TRAINING.map((item) => (
          <SingleComputerTrainingCard
            key={item.place_id}
            job={{
              id: item.place_id,
              title: item.name,
              location: item.vicinity,
              distance: item.distance,
              jobData: item,
            }}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleComputerTrainingCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyComputerTrainingCard;
