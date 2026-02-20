import { useState, useMemo } from "react";
import {
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  ShieldCheck,
  BadgeCheck,
  Search,
} from "lucide-react";

/* ======================= TYPES ======================= */

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

/* ======================= DATA ======================= */

const PHONE_MAP: Record<string, string> = {
  digital_marketing_1: "09980692092",
  digital_marketing_2: "08511566855",
  digital_marketing_3: "09035092086",
  digital_marketing_4: "09980857891",
};

const IMAGES: Record<string, string[]> = {
  digital_marketing_1: [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
  ],
  digital_marketing_2: [
    "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=800",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800",
  ],
  digital_marketing_3: [
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?w=800",
  ],
  digital_marketing_4: [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800",
  ],
};

const SERVICES_MAP: Record<string, string[]> = {
  digital_marketing_1: ["SEO", "Website Design", "Social Media Marketing"],
  digital_marketing_2: ["Content Marketing", "Brand Strategy", "SMM"],
  digital_marketing_3: ["SEO Experts", "PPC Campaigns", "Lead Generation"],
  digital_marketing_4: ["Advertising", "Brand Strategy", "Creative Marketing"],
};

const BADGES_MAP: Record<string, string[]> = {
  digital_marketing_1: ["Verified", "Trending"],
  digital_marketing_2: ["Top Rated"],
  digital_marketing_3: ["GST", "Top Search"],
  digital_marketing_4: ["Popular"],
};

/* ======================= DUMMY DATA ======================= */

const DUMMY_DIGITAL_MARKETING: JobType[] = [
  {
    id: "digital_marketing_1",
    title: "Ananya Hi Solutions",
    location: "Padma Nagar, Hyderabad",
    distance: 6.4,
    description: "Professional digital marketing and SEO services.",
    jobData: { rating: 4.4, user_ratings_total: 20 },
  },
  {
    id: "digital_marketing_2",
    title: "Markup Skills",
    location: "Hyderabad",
    distance: 11.1,
    description: "Top-rated digital marketing & content solutions.",
    jobData: { rating: 5.0, user_ratings_total: 1 },
  },
  {
    id: "digital_marketing_3",
    title: "Astradigm Marketing Pvt Ltd",
    location: "Hyderabad",
    distance: 8.2,
    description: "GST registered SEO & social media experts.",
    jobData: { rating: 4.5, user_ratings_total: 307 },
  },
  {
    id: "digital_marketing_4",
    title: "Lantrn Marketing",
    location: "Hyderabad",
    distance: 9.3,
    description: "Creative digital advertising & branding agency.",
    jobData: { rating: 4.5, user_ratings_total: 139 },
  },
];

/* ======================= SINGLE CARD ======================= */

const SingleDigitalCard: React.FC<{
  job: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const photos = useMemo(
    () => IMAGES[job.id] || IMAGES["digital_marketing_1"],
    [job.id]
  );

  const services = SERVICES_MAP[job.id] || [];
  const badges = BADGES_MAP[job.id] || [];
  const phone = PHONE_MAP[job.id];

  const rating = job.jobData?.rating;
  const reviews = job.jobData?.user_ratings_total;

  const next = () => index < photos.length - 1 && setIndex(i => i + 1);
  const prev = () => index > 0 && setIndex(i => i - 1);

  const callNow = () => phone && (window.location.href = `tel:${phone}`);

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col"
    >
      {/* Image Carousel */}
      <div className="relative h-48">
        <img
          src={photos[index]}
          alt={job.title}
          className="w-full h-full object-cover"
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
          <p className="text-blue-600 text-sm font-semibold">
            {Number(job.distance).toFixed(1)} km away
          </p>
        )}

        <p className="text-sm text-gray-600 line-clamp-3">
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

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {badges.map(badge => (
            <span
              key={badge}
              className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded
              bg-indigo-100 text-indigo-700"
            >
              {badge === "GST" && <ShieldCheck size={12} />}
              {badge === "Verified" && <BadgeCheck size={12} />}
              {badge === "Trending" && <TrendingUp size={12} />}
              {badge === "Top Search" && <Search size={12} />}
              {badge}
            </span>
          ))}
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-2 pt-2">
          {services.slice(0, 3).map(service => (
            <span
              key={service}
              className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded"
            >
              {service}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 mt-auto">
          <button
            onClick={(e) => e.stopPropagation()}
            className="flex-1 border border-blue-600 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50"
          >
            Directions
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); callNow(); }}
            disabled={!phone}
            className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2
              ${phone
                ? "bg-green-600 text-white hover:bg-green-700"
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

/* ======================= GRID WRAPPER ======================= */

const NearbyDigitalMarketingCard: React.FC<Props> = ({ job, onViewDetails }) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_DIGITAL_MARKETING.map(item => (
          <SingleDigitalCard
            key={item.id}
            job={item}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleDigitalCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyDigitalMarketingCard;
