import { useState, useMemo } from "react";
import {
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Star,
  Printer
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
  centre_1: "07048219471",
  centre_2: "07947415592",
  centre_3: "07947119086",
  centre_4: "07942690717",
  centre_5: "08465123456",
};

const IMAGES: Record<string, string[]> = {
  centre_1: [
    "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800",
    "https://images.unsplash.com/photo-1585974738771-84483dd9f89f?w=800",
  ],
  centre_2: [
    "https://images.unsplash.com/photo-1590935217281-8f102120d683?w=800",
    "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=800",
  ],
  centre_3: [
    "https://images.unsplash.com/photo-1565106430482-8f6e74349ca1?w=800",
    "https://images.unsplash.com/photo-1585974738771-84483dd9f89f?w=800",
  ],
};

const SERVICES = [
  "Xerox",
  "Colour Print",
  "Scanning",
  "Lamination"
];

/* ================= DUMMY DATA ================= */

const DUMMY_CENTRES: JobType[] = [
  {
    id: "centre_1",
    title: "Sris Digital",
    location: "Suchitra Cross Road, Hyderabad",
    distance: 2.2,
    category: "Photocopying Centre",
    description: "Professional digital printing and photocopy services.",
    jobData: {
      rating: 4.2,
      user_ratings_total: 45,
      geometry: { location: { lat: 17.5447, lng: 78.5169 } },
    },
  },
  {
    id: "centre_2",
    title: "Bright Solutions",
    location: "Qutbullapur Road, Hyderabad",
    distance: 1.8,
    category: "Photocopying Centre",
    description: "Fast and reliable photocopy and print services.",
    jobData: {
      rating: 4.3,
      user_ratings_total: 52,
      geometry: { location: { lat: 17.545, lng: 78.5175 } },
    },
  },
  {
    id: "centre_3",
    title: "Universal Net Zone",
    location: "Kutbullapur, Hyderabad",
    distance: 2.0,
    category: "Photocopying Centre",
    description: "Affordable xerox and cyber cafe services.",
    jobData: {
      rating: 4.2,
      user_ratings_total: 29,
      geometry: { location: { lat: 17.543, lng: 78.515 } },
    },
  },
];

/* ================= CARD ================= */

const SinglePhotocopyCard: React.FC<{
  job: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const photos = useMemo(
    () => IMAGES[job.id] || IMAGES["centre_1"],
    [job.id]
  );

  const rating = job.jobData?.rating;
  const reviews = job.jobData?.user_ratings_total;
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
      {/* Image Carousel */}
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
      <div className="p-4 space-y-2 flex flex-col flex-grow">
        <h3 className="text-lg font-bold">{job.title}</h3>

        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        {job.distance && (
          <p className="text-green-600 text-sm font-semibold">
            {Number(job.distance).toFixed(1)} km away
          </p>
        )}

        <p className="text-sm text-gray-600 line-clamp-3 mb-auto">
          {job.description}
        </p>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-1 text-sm">
            <Star size={14} className="text-yellow-400" />
            <span className="font-semibold">{rating}</span>
            {reviews && (
              <span className="text-gray-500">({reviews})</span>
            )}
          </div>
        )}

        {/* Services */}
        <div className="flex flex-wrap gap-2 pt-2">
          {SERVICES.slice(0, 3).map(service => (
            <span
              key={service}
              className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded"
            >
              {service}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 mt-auto">
          <button
            onClick={(e) => { e.stopPropagation(); openMaps(); }}
            className="flex-1 border border-cyan-600 text-cyan-600 py-2 rounded-lg font-semibold hover:bg-cyan-50"
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

/* ================= GRID ================= */

const NearbyPhotocopyingCentresCard: React.FC<Props> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_CENTRES.map((centre) => (
          <SinglePhotocopyCard
            key={centre.id}
            job={centre}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return (
    <SinglePhotocopyCard
      job={props.job}
      onViewDetails={props.onViewDetails}
    />
  );
};

export default NearbyPhotocopyingCentresCard;
