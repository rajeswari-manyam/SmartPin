// src/components/NearbyInternetWebsiteCard.tsx
import { useState, useMemo } from "react";
import { MapPin, Phone, ChevronLeft, ChevronRight, Star, ShieldCheck, CheckCircle, Flame } from "lucide-react";

export interface JobType {
  id: string;
  title: string;
  location?: string;
  description?: string;
  distance?: number | string;
  jobData?: any;
}

interface Props {
  job?: JobType;
  onViewDetails: (job: JobType) => void;
}

/* ---------------------------- DATA ---------------------------- */

const PHONE_NUMBERS: Record<string, string> = {
  internet_web_1: "08511447191",
  internet_web_2: "09035683340",
  internet_web_3: "08197374085",
  internet_web_4: "09606198471",
  internet_web_5: "08460436409",
};

const IMAGES: Record<string, string[]> = {
  internet_web_1: [
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
  ],
  internet_web_2: [
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  ],
  internet_web_3: [
    "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800",
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
  ],
  internet_web_4: [
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
  ],
  internet_web_5: [
    "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=800",
    "https://images.unsplash.com/photo-1547658719-da2b51169166?w=800",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800",
  ],
};

const SERVICES: Record<string, string[]> = {
  internet_web_1: ["Website Design", "IT Solutions", "Professional Service", "Custom Design"],
  internet_web_2: ["Website Design", "Website Development", "44 Years Experience", "Expert Service"],
  internet_web_3: ["Website Design", "Advertising", "Creative Design", "Budget Friendly"],
  internet_web_4: ["Digital Marketing", "Website Design", "Software Development", "Marketing Services"],
  internet_web_5: ["Website Design", "Website Development", "Tech Solutions", "Modern Design"],
};

const DESCRIPTIONS: Record<string, string> = {
  internet_web_1: "Verified internet website designer with 4.5★ rating from 38 customers. Web IT Solution Providers offers professional website design and IT solutions with experienced team in Hyderabad.",
  internet_web_2: "Trending internet website design company with 4.2★ rating from 7 reviews. Cogzen IT brings 44 years of business experience in website design and development, serving clients across Hyderabad.",
  internet_web_3: "Verified and trending website designer with 4.3★ rating from 43 satisfied customers. Dot Weavers specializes in internet website design and advertising with 26 years of experience starting from ₹10K/Pkg in Secunderabad.",
  internet_web_4: "Trusted, verified, and trending digital marketing company with excellent 4.7★ rating from 227 customers. Scioon offers internet website design and software development with 10 years of business experience in Rangareddy.",
  internet_web_5: "Trending technology company with impressive 4.8★ rating from 5 reviews. Bitlynus Technologies provides internet website design and development services with 8 years of expertise in Hyderabad.",
};

const SPECIAL_BADGES: Record<string, string[]> = {
  internet_web_1: ["Verified"],
  internet_web_2: ["Trending"],
  internet_web_3: ["Verified", "Trending"],
  internet_web_4: ["Trust", "Verified", "Trending"],
  internet_web_5: ["Trending"],
};

const YEARS_IN_BUSINESS: Record<string, string> = {
  internet_web_2: "44 Years",
  internet_web_3: "26 Years",
  internet_web_4: "10 Years",
  internet_web_5: "8 Years",
};

const PRICING: Record<string, string> = {
  internet_web_3: "Starts From ₹10K/Pkg",
};

/* ------------------------- COMPONENT -------------------------- */

const SingleCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
  const [index, setIndex] = useState(0);
  const photos = useMemo(() => IMAGES[job.id] || [], [job.id]);
  const services = SERVICES[job.id] || [];
  const badges = SPECIAL_BADGES[job.id] || [];
  const years = YEARS_IN_BUSINESS[job.id];
  const pricing = PRICING[job.id];
  const phone = PHONE_NUMBERS[job.id];

  const rating = job.jobData?.rating;
  const reviews = job.jobData?.user_ratings_total;
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
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden flex flex-col">
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
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <h3 className="text-lg font-bold">{job.title}</h3>

        <div className="flex items-center text-sm text-gray-500">
          <MapPin size={14} className="mr-1" /> {job.location}
        </div>

        {job.distance && <p className="text-green-600 text-sm font-semibold">{Number(job.distance).toFixed(1)} km away</p>}

        <p className="text-sm text-gray-600 line-clamp-3">{DESCRIPTIONS[job.id]}</p>

        {/* Badges and years */}
        <div className="flex items-center gap-2 flex-wrap">
          {badges.map(b => (
            <span key={b} className={`flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded
              ${b === "Trust" ? "bg-yellow-100 text-yellow-600" : ""}
              ${b === "Verified" ? "bg-blue-100 text-blue-600" : ""}
              ${b === "Trending" ? "bg-red-100 text-red-600" : ""}`}
            >
              {b === "Trust" && <ShieldCheck size={12} />}
              {b === "Verified" && <CheckCircle size={12} />}
              {b === "Trending" && <Flame size={12} />}
              {b}
            </span>
          ))}

          {years && <span className="flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded">{years} in Business</span>}
        </div>

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-2 text-sm pt-1">
            <Star size={14} className="text-yellow-400" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            {reviews && <span className="text-gray-500">({reviews})</span>}
          </div>
        )}

        {/* Services */}
        <div className="flex flex-wrap gap-2 pt-2">
          {services.slice(0, 3).map(s => (
            <span key={s} className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded">{s}</span>
          ))}
          {services.length > 3 && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">+{services.length - 3} more</span>}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 mt-auto">
          <button onClick={(e) => { e.stopPropagation(); openMaps(); }} className="flex-1 border border-indigo-600 text-indigo-600 py-2 rounded-lg font-semibold hover:bg-indigo-50">Directions</button>
          <button onClick={(e) => { e.stopPropagation(); callNow(); }} disabled={!phone} className={`flex-1 py-2 rounded-lg font-semibold flex justify-center items-center gap-2
            ${phone ? "bg-green-100 text-green-700 border border-green-600 hover:bg-green-200" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}>
            <Phone size={16} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

const NearbyInternetWebsiteCard: React.FC<Props> = ({ job, onViewDetails }) => {
  // Dummy jobs if no specific job is passed
  const DUMMY_JOBS: JobType[] = Object.keys(PHONE_NUMBERS).map((id) => ({
    id,
    title: `Internet Website Designer ${id.slice(-1)}`,
    location: "Hyderabad",
    distance: 5 + Number(id.slice(-1)),
    jobData: {
      rating: 4 + Math.random(),
      user_ratings_total: Math.floor(Math.random() * 200),
      geometry: { location: { lat: 17.43 + Math.random() * 0.02, lng: 78.4 + Math.random() * 0.02 } },
    },
  }));

  if (job) return <SingleCard job={job} onViewDetails={onViewDetails} />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {DUMMY_JOBS.map(j => <SingleCard key={j.id} job={j} onViewDetails={onViewDetails} />)}
    </div>
  );
};

export default NearbyInternetWebsiteCard;
