import { useState, useMemo } from "react";
import {
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
} from "lucide-react";

/* ================= TYPES ================= */

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

/* ================= DATA ================= */

const PHONE_MAP: Record<string, string> = {
  ca_1: "08792486144",
  ca_2: "08460509541",
  ca_3: "07947067434",
  ca_4: "07383233980",
};

const IMAGES: Record<string, string[]> = {
  ca_1: [
    "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800",
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800",
  ],
  ca_2: [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800",
  ],
  ca_3: [
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800",
    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=800",
  ],
  ca_4: [
    "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800",
  ],
};

const SERVICES = [
  "Tax Filing",
  "GST",
  "Company Registration",
  "Audit",
];

/* ================= DUMMY DATA ================= */

const DUMMY_ACCOUNTANTS: JobType[] = [
  {
    id: "ca_1",
    title: "Sai Ram & Co.",
    location: "Shapur Nagar, Hyderabad",
    description: "Expert CA services for tax, audit & compliance.",
    category: "Chartered Accountant",
    jobData: {
      rating: 4.7,
      user_ratings_total: 143,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.385, lng: 78.4867 } },
    },
  },
  {
    id: "ca_2",
    title: "Vibha Consultants Pvt Ltd",
    location: "Medipalli, Rangareddy",
    description: "Professional accounting & consulting services.",
    category: "Chartered Accountant",
    jobData: {
      rating: 3.5,
      user_ratings_total: 12,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.386, lng: 78.487 } },
    },
  },
  {
    id: "ca_3",
    title: "SETBHARATBIZ LLP",
    location: "Gunfoundry-Abids, Hyderabad",
    description: "Highly rated CA firm for businesses.",
    category: "Chartered Accountant",
    jobData: {
      rating: 4.9,
      user_ratings_total: 236,
      opening_hours: { open_now: false },
      geometry: { location: { lat: 17.387, lng: 78.488 } },
    },
  },
  {
    id: "ca_4",
    title: "M S & Associates",
    location: "Kapra, Hyderabad",
    description: "Reliable financial & tax consulting.",
    category: "Chartered Accountant",
    jobData: {
      rating: 4.3,
      user_ratings_total: 6,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.388, lng: 78.489 } },
    },
  },
];

/* ================= CARD ================= */

const SingleAccountantCard: React.FC<{
  job: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const photos = useMemo(
    () => IMAGES[job.id] || IMAGES["ca_1"],
    [job.id]
  );

  const rating = job.jobData?.rating;
  const reviews = job.jobData?.user_ratings_total;
  const isOpen = job.jobData?.opening_hours?.open_now;
  const phone = PHONE_MAP[job.id];

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
      {/* Image */}
      <div className="relative h-48">
        <img
          src={photos[index]}
          className="w-full h-full object-cover"
          alt={job.title}
        />

        {index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {index < photos.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
          >
            <ChevronRight size={18} />
          </button>
        )}

        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {index + 1}/{photos.length}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <h3 className="text-lg font-bold">{job.title}</h3>

        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        <p className="text-sm text-gray-600 line-clamp-3">
          {job.description}
        </p>

        {/* Rating + Status */}
        <div className="flex items-center gap-3 text-sm pt-1">
          {rating && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400" />
              <span className="font-semibold">{rating}</span>
              {reviews && <span className="text-gray-500">({reviews})</span>}
            </div>
          )}

          {isOpen !== undefined && (
            <span
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
              ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
            >
              <Clock size={12} />
              {isOpen ? "Open" : "Closed"}
            </span>
          )}
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-2 pt-2">
          {SERVICES.slice(0, 3).map(service => (
            <span
              key={service}
              className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded"
            >
              {service}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 mt-auto">
          <button
            onClick={(e) => { e.stopPropagation(); openMaps(); }}
            className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50"
          >
            Directions
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); callNow(); }}
            disabled={!phone}
            className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2
            ${phone
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

/* ================= LIST ================= */

const NearbyCharteredAccountantsCard: React.FC<Props> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_ACCOUNTANTS.map((ca) => (
          <SingleAccountantCard
            key={ca.id}
            job={ca}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleAccountantCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyCharteredAccountantsCard;
