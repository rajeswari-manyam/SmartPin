import { useState, useMemo } from "react";
import { MapPin, Phone, ChevronLeft, ChevronRight, Star, Clock } from "lucide-react";

// Types
export interface DogTrainingJob {
  id: string;
  title: string;
  location?: string;
  description?: string;
  distance?: number | string;
  category?: string;
  jobData?: {
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: { open_now?: boolean };
    geometry?: { location?: { lat: number; lng: number } };
    services?: string[];
    special_tags?: string[];
    experience?: string;
  };
}

interface Props {
  job?: DogTrainingJob;
  onViewDetails: (job: DogTrainingJob) => void;
}

/* -------------------------------- DATA --------------------------------- */

const PHONE_MAP: Record<string, string> = {
  training_1: "08401130047",
  training_2: "09845454801",
  training_3: "09972246385",
  training_4: "09980851653",
};

const IMAGES: Record<string, string[]> = {
  training_1: [
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
  ],
  training_2: [
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
  ],
  training_3: [
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
  ],
  training_4: [
    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800",
    "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
    "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800",
  ],
};

const SERVICES_DEFAULT = ["Dog Training", "Pet Care", "Pet Grooming"];

/* --------------------------- SINGLE CARD --------------------------- */

const SingleDogTrainingCard: React.FC<{ job: DogTrainingJob; onViewDetails: (job: DogTrainingJob) => void }> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);

  const photos = useMemo(() => IMAGES[job.id] || IMAGES["training_1"], [job.id]);

  const rating = job.jobData?.rating;
  const reviews = job.jobData?.user_ratings_total;
  const isOpen = job.jobData?.opening_hours?.open_now;
  const phone = PHONE_MAP[job.id];
  const services = job.jobData?.services || SERVICES_DEFAULT;

  const lat = job.jobData?.geometry?.location?.lat;
  const lng = job.jobData?.geometry?.location?.lng;

  const next = () => index < photos.length - 1 && setIndex(i => i + 1);
  const prev = () => index > 0 && setIndex(i => i - 1);

  const openMaps = () => {
    if (!lat || !lng) return;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
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
      <div className="relative h-48 shrink-0">
        <img src={photos[index]} className="w-full h-full object-cover" alt={job.title} />

        {index > 0 && (
          <button onClick={(e) => { e.stopPropagation(); prev(); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full">
            <ChevronLeft size={18} />
          </button>
        )}
        {index < photos.length - 1 && (
          <button onClick={(e) => { e.stopPropagation(); next(); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full">
            <ChevronRight size={18} />
          </button>
        )}
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{index + 1}/{photos.length}</span>
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 flex-grow flex flex-col">
        <h3 className="text-lg font-bold">{job.title}</h3>

        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={14} className="mr-1" />
          {job.location}
        </div>

        {job.distance && (
          <p className="text-green-600 text-sm font-semibold">{Number(job.distance).toFixed(1)} km away</p>
        )}

        <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{job.description}</p>

        {/* Rating + Status */}
        <div className="flex items-center gap-3 text-sm pt-2">
          {rating && (
            <div className="flex items-center gap-1">
              <Star size={14} className="text-yellow-400" />
              <span className="font-semibold">{rating}</span>
              {reviews && <span className="text-gray-500">({reviews})</span>}
            </div>
          )}

          {isOpen !== undefined && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              <Clock size={12} />
              {isOpen ? "Open" : "Closed"}
            </span>
          )}
        </div>

        {/* Services */}
        <div className="flex flex-wrap gap-2 pt-2">
          {services.slice(0, 3).map(service => (
            <span key={service} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">{service}</span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 mt-auto">
          <button onClick={(e) => { e.stopPropagation(); openMaps(); }} className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50">
            Directions
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); callNow(); }}
            disabled={!phone}
            className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2 ${phone ? "bg-green-100 text-green-700 border border-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
          >
            <Phone size={16} />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ------------------------- WRAPPER COMPONENT ------------------------- */

const DogTrainingCard: React.FC<Props> = (props) => {
  const DUMMY_DOG_TRAINING: DogTrainingJob[] = [
    {
      id: "training_1",
      title: "Pet Topia",
      location: "Suryanagar Vikhroli West, Mumbai",
      distance: 1.2,
      category: "Dog Training",
      description: "Pet care, grooming and food services for your dog.",
      jobData: {
        rating: 4.5,
        user_ratings_total: 199,
        opening_hours: { open_now: true },
        services: ["Pet Care", "Pet Grooming", "Pet Food Available"],
        geometry: { location: { lat: 19.1078, lng: 72.9342 } },
      },
    },
    {
      id: "training_2",
      title: "Adil Dog Trainer",
      location: "Chowpatty Terrace 1st Floor Charni Road, Mumbai",
      distance: 2.5,
      category: "Dog Training",
      description: "Excellent dog training guidance for pets of all breeds.",
      jobData: {
        rating: 4.9,
        user_ratings_total: 114,
        opening_hours: { open_now: true },
        services: ["Dog Training Centres"],
        geometry: { location: { lat: 18.9554, lng: 72.8136 } },
      },
    },
  ];

  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_DOG_TRAINING.map(job => (
          <SingleDogTrainingCard key={job.id} job={job} onViewDetails={props.onViewDetails} />
        ))}
      </div>
    );
  }

  return <SingleDogTrainingCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default DogTrainingCard;
