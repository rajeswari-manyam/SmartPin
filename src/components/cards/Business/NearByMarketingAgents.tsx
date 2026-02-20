import { useState, useMemo } from "react";
import {
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";

/* ================= TYPES ================= */

export interface MarketingAgencyJob {
  id: string;
  title: string;
  location?: string;
  description?: string;
  distance?: number | string;
  category?: string;
  jobData?: any;
}

interface Props {
  job?: MarketingAgencyJob;
  onViewDetails: (job: MarketingAgencyJob) => void;
}

/* ================= DATA ================= */

const PHONE_MAP: Record<string, string> = {
  agency_1: "08460413570",
  agency_2: "08401788461",
  agency_3: "09724162304",
  agency_4: "09035046969",
  agency_5: "08465792341",
};

const IMAGES: Record<string, string[]> = {
  agency_1: [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
  ],
  agency_2: [
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800",
  ],
  agency_3: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    "https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?w=800",
  ],
  agency_4: [
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
    "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800",
  ],
  agency_5: [
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
    "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=800",
  ],
};

const SERVICES = [
  "Digital Marketing",
  "SEO",
  "Social Media",
  "Branding",
];

/* ================= DUMMY DATA ================= */

const DUMMY_MARKETING_AGENCIES: MarketingAgencyJob[] = [
  {
    id: "agency_1",
    title: "Digital Media Ads",
    location: "Hyderabad",
    distance: 7.1,
    category: "Marketing Agency",
    description: "Expert digital marketing and website design services.",
    jobData: {
      rating: 4.5,
      user_ratings_total: 129,
      geometry: { location: { lat: 17.385, lng: 78.4867 } },
    },
  },
  {
    id: "agency_2",
    title: "Over The Box Advertising",
    location: "Hyderabad",
    distance: 8.3,
    category: "Marketing Agency",
    description: "Creative advertising and web development solutions.",
    jobData: {
      rating: 5.0,
      user_ratings_total: 1,
      geometry: { location: { lat: 17.39, lng: 78.49 } },
    },
  },
  {
    id: "agency_3",
    title: "RKS Social Media Pvt Ltd",
    location: "Warangal • Serves Hyderabad",
    distance: 145.2,
    category: "Marketing Agency",
    description: "Social media marketing specialists with proven results.",
    jobData: {
      rating: 5.0,
      user_ratings_total: 12,
      geometry: { location: { lat: 17.9784, lng: 79.6004 } },
    },
  },
];

/* ================= SINGLE CARD ================= */

const SingleMarketingAgencyCard: React.FC<{
  job: MarketingAgencyJob;
  onViewDetails: (job: MarketingAgencyJob) => void;
}> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const photos = useMemo(
    () => IMAGES[job.id] || IMAGES["agency_1"],
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
      <div className="p-4 space-y-2 flex-grow flex flex-col">
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
          {SERVICES.map(service => (
            <span
              key={service}
              className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded"
            >
              {service}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
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

/* ================= GRID ================= */

const NearbyMarketingAgenciesCard: React.FC<Props> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_MARKETING_AGENCIES.map((agency) => (
          <SingleMarketingAgencyCard
            key={agency.id}
            job={agency}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return (
    <SingleMarketingAgencyCard
      job={props.job}
      onViewDetails={props.onViewDetails}
    />
  );
};

export default NearbyMarketingAgenciesCard;
