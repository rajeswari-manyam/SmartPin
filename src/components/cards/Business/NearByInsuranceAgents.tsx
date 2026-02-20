import { useState, useMemo } from "react";
import {
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield
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
  agent_1: "09035885310",
  agent_2: "08128982227",
  agent_3: "09606291804",
  agent_4: "08147954240",
  agent_5: "08919972879",
};

const IMAGES: Record<string, string[]> = {
  agent_1: [
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800",
  ],
  agent_2: [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
  ],
  agent_3: [
    "https://images.unsplash.com/photo-1542744094-24638eff58bb?w=800",
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
  ],
  agent_4: [
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800",
  ],
  agent_5: [
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
  ],
};

const SERVICES = [
  "Life Insurance",
  "Health Insurance",
  "Motor Insurance",
  "Investment Plans",
];

/* ================= DUMMY DATA ================= */

const DUMMY_INSURANCE_AGENTS: JobType[] = [
  {
    id: "agent_1",
    title: "Health & Motor Insurance Services",
    location: "Malkajgiri, Hyderabad",
    distance: 10,
    category: "Insurance Agent",
    description: "Specialized in health and motor insurance with quick response.",
    jobData: {
      rating: 5.0,
      user_ratings_total: 1,
      geometry: { location: { lat: 17.4474, lng: 78.5271 } }
    }
  },
  {
    id: "agent_2",
    title: "Virat Health Insurance",
    location: "Shamshabad, Hyderabad",
    distance: 26.3,
    category: "Insurance Agent",
    description: "LIC verified advisor for health & life insurance plans.",
    jobData: {
      rating: 4.5,
      user_ratings_total: 2,
      geometry: { location: { lat: 17.2543, lng: 78.4263 } }
    }
  },
  {
    id: "agent_3",
    title: "Ramakrishna LIC Advisor",
    location: "Madhapur, Hyderabad",
    distance: 8.4,
    category: "Insurance Agent",
    description: "Trusted LIC advisor with personalized insurance solutions.",
    jobData: {
      rating: 5.0,
      user_ratings_total: 1,
      geometry: { location: { lat: 17.4484, lng: 78.3908 } }
    }
  },
];

/* ================= SINGLE CARD ================= */

const SingleInsuranceCard: React.FC<{
  job: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const photos = useMemo(
    () => IMAGES[job.id] || IMAGES["agent_1"],
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
      <div className="p-4 flex flex-col flex-grow space-y-2">
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
            {reviews && <span className="text-gray-500">({reviews})</span>}
          </div>
        )}

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

/* ================= GRID WRAPPER ================= */

const NearbyInsuranceAgentsCard: React.FC<Props> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_INSURANCE_AGENTS.map(agent => (
          <SingleInsuranceCard
            key={agent.id}
            job={agent}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return (
    <SingleInsuranceCard
      job={props.job}
      onViewDetails={props.onViewDetails}
    />
  );
};

export default NearbyInsuranceAgentsCard;
