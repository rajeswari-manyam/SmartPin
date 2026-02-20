import React, { useState } from "react";
import {
  MapPin,
  Star,
  Phone,
  Navigation,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  BadgeCheck,
  TrendingUp,
} from "lucide-react";

export interface JobType {
  id: string;
  title: string;
  location?: string;
  description?: string;
  jobData?: any;
}

interface Props {
  job?: JobType; // optional, like NearbyCafeCard
  onViewDetails: (job: JobType) => void;
}

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
  construction_1: "08511629052",
  construction_2: "09740160275",
  construction_3: "07041850251",
  construction_4: "08460544875",
  construction_5: "09876543210",
};

// Dummy images
const IMAGES_MAP: Record<string, string[]> = {
  construction_1: [
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5",
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e",
  ],
  construction_2: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00",
  ],
};

// Dummy contractors list
const DUMMY_CONTRACTORS: JobType[] = [
  { id: "construction_1", title: "ABC Constructions", description: "Reliable construction services.", location: "Sector 12" },
  { id: "construction_2", title: "XYZ Builders", description: "Expert builders and contractors.", location: "Sector 45" },
  { id: "construction_3", title: "PQR Infrastructure", description: "High quality construction work.", location: "Sector 23" },
  { id: "construction_4", title: "LMN Contractors", description: "Affordable building solutions.", location: "Sector 9" },
  { id: "construction_5", title: "OPQ Builders", description: "Trusted construction services.", location: "Sector 7" },
];

// ---------------- Single Contractor Card ----------------
const SingleConstructionCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const photos = IMAGES_MAP[job.id] || IMAGES_MAP.construction_1;
  const phone = PHONE_NUMBERS_MAP[job.id];
  const data = job.jobData || {};
  
  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const lat = data?.geometry?.location?.lat;
    const lng = data?.geometry?.location?.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    }
  };

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col h-full"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <img src={photos[currentImageIndex]} alt={job.title} className="w-full h-full object-cover" />
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {currentImageIndex + 1}/{photos.length}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">{job.title}</h2>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={14} />
          <span>{job.location}</span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-700">
            <BadgeCheck size={12} /> Verified
          </span>
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">
            <ShieldCheck size={12} /> Trusted
          </span>
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-rose-100 text-rose-700">
            <TrendingUp size={12} /> Popular
          </span>
        </div>

        {/* Rating */}
        {data?.rating && (
          <div className="flex items-center text-sm gap-1">
            <Star size={14} className="text-yellow-400" />
            <span className="font-semibold">{data.rating}</span>
            <span className="text-gray-500">({data.user_ratings_total || 0})</span>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2 pt-2 mt-auto">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-1 text-sm font-semibold border border-indigo-500 text-indigo-600 rounded-lg py-2 hover:bg-indigo-50"
          >
            <Navigation size={14} /> Directions
          </button>
          <button
            disabled={!phone}
            onClick={handleCall}
            className={`flex-1 flex items-center justify-center gap-1 text-sm font-semibold rounded-lg py-2 ${
              phone ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------- Nearby Contractors Card ----------------
const NearbyConstructionContractorsCard: React.FC<Props> = ({ job, onViewDetails }) => {
  // If no job is provided, render grid of dummy contractors
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_CONTRACTORS.map((contractor) => (
          <SingleConstructionCard key={contractor.id} job={contractor} onViewDetails={onViewDetails} />
        ))}
      </div>
    );
  }

  // If job is provided, render single card
  return <SingleConstructionCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyConstructionContractorsCard;
