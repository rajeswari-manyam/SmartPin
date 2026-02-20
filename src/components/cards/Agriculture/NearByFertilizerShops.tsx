import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight } from "lucide-react";

/* ================= TYPES ================= */
export interface FertilizerDealer {
  id: string;
  title: string;
  description?: string;
  location?: string;
  distance?: number;
  categories?: string[];
  jobData?: {
    rating?: number;
    user_ratings_total?: number;
    opening_hours?: { open_now: boolean };
    geometry?: { location: { lat: number; lng: number } };
    years_in_business?: number;
    special_tags?: string[];
    starting_price?: number;
  };
}

/* ================= DUMMY DATA ================= */
const PHONE_NUMBERS_MAP: Record<string, string> = {
  dealer_1: "09871356963",
  dealer_2: "08401935836",
  dealer_3: "07041216181",
  dealer_4: "09972207693",
  dealer_5: "08912345678",
};

const FERTILIZER_IMAGES_MAP: Record<string, string[]> = {
  dealer_1: [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800",
  ],
  dealer_2: [
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
  ],
  dealer_3: [
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=800",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
  ],
  dealer_4: [
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
  ],
  dealer_5: [
    "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800",
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800",
  ],
};

const FERTILIZER_DESCRIPTIONS_MAP: Record<string, string> = {
  dealer_1: "Responsive dealer with quality fertilizers. 6 Years in Business. Starts from ₹25/kg.",
  dealer_2: "GST registered and trending dealer. 14 Years in Business. Starting ₹47/kg.",
  dealer_3: "Verified Bio Fertilizer dealer. 10 Years in Business. Starts from ₹899/Pkt.",
  dealer_4: "Trending portable fertilizers. 9 Years in Business.",
  dealer_5: "Landscaping & Fertilizer services. 31 Years in Business.",
};

const FERTILIZER_SERVICES = ["Organic Fertilizers", "NPK Fertilizers", "Bio Fertilizers", "Fungicides", "Pesticides"];

/* ================= SINGLE CARD ================= */
const SingleFertilizerDealerCard: React.FC<{ job: FertilizerDealer; onViewDetails: (job: FertilizerDealer) => void }> = ({ job, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const photos = FERTILIZER_IMAGES_MAP[job.id] || [];
  const currentPhoto = photos[currentImageIndex];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % photos.length);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const rating = job.jobData?.rating?.toFixed(1);
  const totalRatings = job.jobData?.user_ratings_total;
  const isOpen = job.jobData?.opening_hours?.open_now;
  const phone = PHONE_NUMBERS_MAP[job.id];

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (phone) window.location.href = `tel:${phone}`;
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const lat = job.jobData?.geometry?.location.lat;
    const lng = job.jobData?.geometry?.location.lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    }
  };

  return (
    <div onClick={() => onViewDetails(job)} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col h-full">
      {/* Image Carousel */}
      <div className="relative h-48 bg-gray-200 shrink-0">
        {currentPhoto ? (
          <>
            <img src={currentPhoto} alt={job.title} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1}/{photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🌾</div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <h2 className="text-lg font-bold text-gray-800 line-clamp-2">{job.title}</h2>

        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={16} />
          <span className="line-clamp-1">{job.location}</span>
        </div>

        {job.distance && <p className="text-xs font-semibold text-green-600">{job.distance.toFixed(1)} km away</p>}

        <p className="text-sm text-gray-600 line-clamp-3">{FERTILIZER_DESCRIPTIONS_MAP[job.id] || job.description}</p>

        <div className="flex items-center gap-3 text-sm pt-2">
          {rating && (
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating}</span>
              <span className="text-gray-500">({totalRatings})</span>
            </div>
          )}
          {isOpen !== undefined && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded ${isOpen ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              <Clock size={12} />
              <span className="text-xs font-semibold">{isOpen ? "Open" : "Closed"}</span>
            </div>
          )}
        </div>

        {/* Services */}
        <div className="pt-2">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
          <div className="flex flex-wrap gap-2">
            {FERTILIZER_SERVICES.slice(0, 3).map((service, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs">✓ {service}</span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 mt-auto">
          <button onClick={handleDirections} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold">
            <Navigation size={16} /> Directions
          </button>
          <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold">
            <Phone size={16} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= LIST / WRAPPER ================= */
interface FertilizerDealerCardProps {
  job?: FertilizerDealer;
  onViewDetails: (job: FertilizerDealer) => void;
}

// Dummy list
const DUMMY_DEALERS: FertilizerDealer[] = [
  { id: "dealer_1", title: "Scot Agritech", location: "Rangareddy", distance: 24.6 },
  { id: "dealer_2", title: "Jas Agrotech", location: "Bijapur-Karnataka", distance: 18.5 },
  { id: "dealer_3", title: "Prions Biotech", location: "Belgaum", distance: 22.3 },
  { id: "dealer_4", title: "Sidhharth Enterprises", location: "Bhilai", distance: 15.2 },
  { id: "dealer_5", title: "Karshak Bio Plantech", location: "Bellary", distance: 28.7 },
];

const FertilizerDealerCard: React.FC<FertilizerDealerCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_DEALERS.map((dealer) => (
          <SingleFertilizerDealerCard
            key={dealer.id}
            job={dealer}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleFertilizerDealerCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default FertilizerDealerCard;
