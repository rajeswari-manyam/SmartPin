import { useState, useMemo } from "react";
import {
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Scale
} from "lucide-react";

/* ---------------- TYPES ---------------- */

export interface JobType {
  id: string;
  title: string;
  location?: string;
  description?: string;
  distance?: number | string;
  category?: string;
  jobData?: any;
}

interface Props {
  job?: JobType;
  onViewDetails: (job: JobType) => void;
}

/* ---------------- DATA ---------------- */

const LAWYER_IMAGES: Record<string, string[]> = {
  lawyer_1: [
    "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800",
    "https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=800"
  ],
  lawyer_2: [
    "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=800"
  ],
};

const LEGAL_SERVICES = [
  "Civil Law",
  "Criminal",
  "Property",
  "High Court",
  "Corporate"
];

/* ---------------- DUMMY LAWYERS ---------------- */

const DUMMY_LAWYERS: JobType[] = [
  {
    id: "lawyer_1",
    title: "Credence Associates",
    location: "Trimulgherry, Hyderabad",
    distance: 3.2,
    category: "Legal Services",
    description:
      "Experienced High Court lawyers offering civil and criminal legal solutions.",
    jobData: {
      rating: 4.8,
      user_ratings_total: 120,
      opening_hours: { open_now: true },
      phone: "08460412283",
      geometry: { location: { lat: 17.4435, lng: 78.4895 } }
    }
  },
  {
    id: "lawyer_2",
    title: "TSA Advocates",
    location: "Banjara Hills, Hyderabad",
    distance: 8.2,
    category: "Legal Services",
    description:
      "Trusted advocates specializing in litigation and advisory services.",
    jobData: {
      rating: 4.6,
      user_ratings_total: 98,
      opening_hours: { open_now: false },
      phone: "08460494569",
      geometry: { location: { lat: 17.4239, lng: 78.4738 } }
    }
  }
];

/* ---------------- SINGLE CARD ---------------- */

const SingleLawyerCard: React.FC<{
  job: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const photos = useMemo(
    () => LAWYER_IMAGES[job.id] || LAWYER_IMAGES["lawyer_1"],
    [job.id]
  );

  const rating = job.jobData?.rating;
  const reviews = job.jobData?.user_ratings_total;
  const isOpen = job.jobData?.opening_hours?.open_now;
  const phone = job.jobData?.phone;

  const lat = job.jobData?.geometry?.location?.lat;
  const lng = job.jobData?.geometry?.location?.lng;

  const next = () => index < photos.length - 1 && setIndex(i => i + 1);
  const prev = () => index > 0 && setIndex(i => i - 1);

  const openMaps = () => {
    if (!lat || !lng) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      "_blank"
    );
  };

  const callNow = () => {
    if (!phone) return;
    window.location.href = `tel:${phone}`;
  };

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden h-full flex flex-col"
    >
      {/* IMAGE */}
      <div className="relative h-48 shrink-0">
        <img
          src={photos[index]}
          className="w-full h-full object-cover"
          alt={job.title}
        />

        {index > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {index < photos.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {index + 1}/{photos.length}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2 flex-grow flex flex-col">
        <h3 className="text-lg font-bold">{job.title}</h3>

        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        {job.distance && (
          <p className="text-amber-600 text-sm font-semibold">
            {Number(job.distance).toFixed(1)} km away
          </p>
        )}

        <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
          {job.description}
        </p>

        {/* Rating + Open */}
        <div className="flex items-center gap-3 text-sm pt-2">
          {rating && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400" />
              <span className="font-semibold">{rating}</span>
              {reviews && (
                <span className="text-gray-500">({reviews})</span>
              )}
            </div>
          )}

          {isOpen !== undefined && (
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${isOpen
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              <Clock size={12} />
              {isOpen ? "Open" : "Closed"}
            </span>
          )}
        </div>

        {/* SERVICES */}
        <div className="flex flex-wrap gap-2 pt-2">
          {LEGAL_SERVICES.slice(0, 3).map(service => (
            <span
              key={service}
              className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded flex items-center gap-1"
            >
              <Scale size={12} />
              {service}
            </span>
          ))}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 pt-4 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openMaps();
            }}
            className="flex-1 border border-amber-600 text-amber-600 py-2 rounded-lg font-semibold hover:bg-amber-50"
          >
            Directions
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              callNow();
            }}
            disabled={!phone}
            className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2 ${phone
              ? "bg-green-100 text-green-700 border border-green-600 hover:bg-green-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Phone size={16} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------------- WRAPPER ---------------- */

const NearbyLawyersCard: React.FC<Props> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_LAWYERS.map((lawyer) => (
          <SingleLawyerCard
            key={lawyer.id}
            job={lawyer}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return (
    <SingleLawyerCard
      job={props.job}
      onViewDetails={props.onViewDetails}
    />
  );
};

export default NearbyLawyersCard;
