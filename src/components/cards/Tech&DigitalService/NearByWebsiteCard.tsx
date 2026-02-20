import { useState, useMemo } from "react";
import {
  MapPin,
  Phone,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  Globe,
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
  website_dev_1: "09035165984",
  website_dev_2: "08460520902",
  website_dev_3: "08197748624",
  website_dev_4: "09035185309",
};

const IMAGES: Record<string, string[]> = {
  website_dev_1: [
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  ],
  website_dev_2: [
    "https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
  ],
  website_dev_3: [
    "https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
  ],
  website_dev_4: [
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  ],
};

const SERVICES = [
  "Website Design",
  "Website Development",
  "SEO Services",
  "Mobile App Dev",
];

/* ================= DUMMY DATA ================= */

const DUMMY_WEBSITES: JobType[] = [
  {
    id: "website_dev_1",
    title: "Royal IT Park Services",
    location: "Hyderabad",
    distance: 8.2,
    category: "Website Development",
    description:
      "Trusted website development company with 15 years experience. Starts from ₹15K per page.",
    jobData: {
      rating: 4.3,
      user_ratings_total: 140,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.4326, lng: 78.4071 } },
    },
  },
  {
    id: "website_dev_2",
    title: "Virtuous Global Solution",
    location: "Hyderabad",
    distance: 9,
    category: "Website Development",
    description:
      "Trending digital marketing & website development service with 5★ rating.",
    jobData: {
      rating: 5.0,
      user_ratings_total: 8,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.4456, lng: 78.3816 } },
    },
  },
  {
    id: "website_dev_3",
    title: "Sunseaz Technologies Pvt Ltd",
    location: "Hyderabad",
    distance: 10.2,
    category: "Website Development",
    description:
      "Verified website development company. Starts from ₹10K per package.",
    jobData: {
      rating: 4.6,
      user_ratings_total: 412,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.4246, lng: 78.4486 } },
    },
  },
  {
    id: "website_dev_4",
    title: "Vaishnavi Designs",
    location: "Rangareddy",
    distance: 15.8,
    category: "Website Development",
    description:
      "Creative website & graphic design agency with 12 years experience.",
    jobData: {
      rating: 4.3,
      user_ratings_total: 10,
      opening_hours: { open_now: true },
      geometry: { location: { lat: 17.3716, lng: 78.5586 } },
    },
  },
];

/* ================= SINGLE CARD ================= */

const SingleWebsiteCard: React.FC<{
  job: JobType;
  onViewDetails: (job: JobType) => void;
}> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const photos = useMemo(
    () => IMAGES[job.id] || IMAGES.website_dev_1,
    [job.id]
  );

  const rating = job.jobData?.rating;
  const reviews = job.jobData?.user_ratings_total;
  const isOpen = job.jobData?.opening_hours?.open_now;
  const phone = PHONE_MAP[job.id];

  const lat = job.jobData?.geometry?.location?.lat;
  const lng = job.jobData?.geometry?.location?.lng;

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
            onClick={(e) => {
              e.stopPropagation();
              setIndex(index - 1);
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
              setIndex(index + 1);
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

      {/* Content */}
      <div className="p-4 flex flex-col gap-2 flex-grow">
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

        <p className="text-sm text-gray-600 line-clamp-3">
          {job.description}
        </p>

        {/* Rating & Status */}
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
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
                isOpen
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              <Clock size={12} />
              {isOpen ? "Open" : "Closed"}
            </span>
          )}
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-2 pt-2">
          {SERVICES.slice(0, 3).map((s) => (
            <span
              key={s}
              className="bg-cyan-100 text-cyan-700 text-xs px-2 py-1 rounded flex items-center gap-1"
            >
              <Globe size={12} />
              {s}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 mt-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openMaps();
            }}
            className="flex-1 border border-cyan-600 text-cyan-600 py-2 rounded-lg font-semibold hover:bg-cyan-50"
          >
            Directions
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              callNow();
            }}
            className="flex-1 bg-green-100 text-green-700 border border-green-600 py-2 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-green-200"
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

const NearbyWebsiteCard: React.FC<Props> = ({ job, onViewDetails }) => {
  if (!job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_WEBSITES.map((item) => (
          <SingleWebsiteCard
            key={item.id}
            job={item}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleWebsiteCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyWebsiteCard;
