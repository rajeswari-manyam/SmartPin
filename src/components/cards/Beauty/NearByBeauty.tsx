import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, MapPin, Phone, Navigation, Star, Clock, CheckCircle } from "lucide-react";

/* ================= TYPES ================= */

export interface BeautyService {
  place_id: string;
  name: string;
  vicinity: string;
  rating: number;
  user_ratings_total: number;
  photos: { photo_reference: string }[];
  geometry: { location: { lat: number; lng: number } };
  business_status: string;
  opening_hours: { open_now: boolean };
  price_level: number;
  amenities: string[];
  special_tags?: string[];
  special_offers?: string;
  distance_text?: string;
}

export interface JobType {
  id: string;
  title: string;
  location?: string;
  description?: string;
  distance?: number;
  category?: string;
  jobData?: any;
}

/* ================= DUMMY DATA ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
  beauty_1: "07947123783",
  beauty_2: "07947152230",
  beauty_3: "07947429868",
  beauty_4: "07942701131",
};

export const DUMMY_BEAUTY_PARLOURS: BeautyService[] = [
  {
    place_id: "beauty_1",
    name: "Priyadarshini Herbal Beauty Parlour",
    vicinity: "Bank Colony Quthbullapur Jeedimetla, Hyderabad",
    rating: 4.9,
    user_ratings_total: 174,
    photos: [{ photo_reference: "beauty_photo_1" }],
    geometry: { location: { lat: 17.51, lng: 78.435 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    amenities: ["Beauty Parlours", "Salons", "Facial", "Bridal Makeup"],
    special_tags: ["Trending"],
    special_offers: "Great offers • 7 Suggestions",
    distance_text: "1.3 km",
  },
  {
    place_id: "beauty_2",
    name: "Apsara Beauty Parlour",
    vicinity: "Vishnu Sai Nilayam No. 2 Ganesh Nagar Chintal, Hyderabad",
    rating: 4.9,
    user_ratings_total: 123,
    photos: [{ photo_reference: "beauty_photo_2" }],
    geometry: { location: { lat: 17.495, lng: 78.42 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    amenities: ["Facial", "Bridal Services", "Hair Care"],
    special_tags: ["Top Rated"],
    distance_text: "920 mts",
  },
  {
    place_id: "beauty_3",
    name: "Gayathris Sneha Herbal Beauty Parlour",
    vicinity: "Shop No.5204 Chintal Balanagar Chandra Nagar, Hyderabad",
    rating: 4.7,
    user_ratings_total: 110,
    photos: [{ photo_reference: "beauty_photo_3" }],
    geometry: { location: { lat: 17.49, lng: 78.415 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    amenities: ["Facial", "Hair Spa", "Herbal Treatments"],
    special_tags: ["Top Rated"],
    distance_text: "1 km",
  },
  {
    place_id: "beauty_4",
    name: "Ayur Beauty Parlour",
    vicinity: "Laxmi Narsimha Colony, Hyderabad",
    rating: 4.9,
    user_ratings_total: 77,
    photos: [{ photo_reference: "beauty_photo_4" }],
    geometry: { location: { lat: 17.485, lng: 78.41 } },
    business_status: "OPERATIONAL",
    opening_hours: { open_now: true },
    price_level: 2,
    amenities: ["Facial", "Bridal Makeup", "Hair Styling"],
    special_tags: ["Top Rated"],
    distance_text: "1.5 km",
  },
];

const BEAUTY_IMAGES_MAP: Record<string, string[]> = {
  beauty_1: [
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
    "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800",
  ],
  beauty_2: [
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800",
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800",
  ],
  beauty_3: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800",
  ],
  beauty_4: [
    "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=800",
    "https://images.unsplash.com/photo-1457972729786-0411a3b2b626?w=800",
  ],
};

/* ================= COMPONENT ================= */

interface NearbyBeautyCardProps {
  job?: JobType;
  onViewDetails: (job: JobType) => void;
}

const SingleBeautyCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const getPhotos = useCallback(() => {
    if (!job) return [];
    return BEAUTY_IMAGES_MAP[job.id] || BEAUTY_IMAGES_MAP["beauty_1"];
  }, [job]);

  const photos = getPhotos();
  const hasPhotos = photos.length > 0;
  const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex > 0) setCurrentImageIndex((prev) => prev - 1);
    },
    [currentImageIndex]
  );

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (currentImageIndex < photos.length - 1) setCurrentImageIndex((prev) => prev + 1);
    },
    [currentImageIndex, photos.length]
  );

  const getName = useCallback(() => job?.title || "Beauty Parlour", [job]);
  const getLocation = useCallback(() => job?.location || job?.description || "Location", [job]);
  const getDistance = useCallback(() => job?.distance ? `${job.distance.toFixed(1)} km away` : "", [job]);
  const getPhoneNumber = useCallback(() => job ? PHONE_NUMBERS_MAP[job.id] : null, [job]);

  const handleCall = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const phone = getPhoneNumber();
      if (!phone) return alert(`No contact number for ${getName()}`);
      window.location.href = `tel:${phone}`;
    },
    [getPhoneNumber, getName]
  );

  const handleDirections = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const lat = job?.jobData?.geometry?.location?.lat;
      const lng = job?.jobData?.geometry?.location?.lng;
      if (!lat || !lng) return alert("Location not available");
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    },
    [job]
  );

  const hasPhoneNumber = !!getPhoneNumber();
  const amenities = job?.jobData?.amenities?.slice(0, 4) || [];

  if (!job) return null;

  return (
    <div
      onClick={() => onViewDetails(job)}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[0.99] mb-4"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {currentPhoto && !imageError ? (
          <>
            <img
              src={currentPhoto}
              className="w-full h-full object-cover"
              alt={getName()}
              onError={() => setImageError(true)}
            />
            {photos.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white">
                    <ChevronLeft size={20} />
                  </button>
                )}
                {currentImageIndex < photos.length - 1 && (
                  <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full text-white">
                    <ChevronRight size={20} />
                  </button>
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1}/{photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-200">
            <span className="text-6xl">💆</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-[17px] font-bold text-gray-900 mb-1.5 line-clamp-2">{getName()}</h3>
        <div className="flex items-center text-gray-500 mb-1 text-[13px]">
          <MapPin size={14} className="mr-1" />
          {getLocation()}
        </div>
        {getDistance() && <p className="text-xs font-semibold text-green-600 mb-2">{getDistance()}</p>}

        {/* Amenities */}
        <div className="flex flex-wrap gap-1 mb-2">
          {amenities.map((a: string, idx: number) => (
            <span key={idx} className="inline-flex items-center gap-1 bg-sky-100 text-sky-600 text-[11px] font-medium px-2 py-1 rounded">
              <CheckCircle size={11} />
              {a}
            </span>
          ))}
        </div>

        {/* Rating */}
        {job.jobData?.rating && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              <Star size={13} className="text-yellow-400 fill-yellow-400" />
              <span className="text-[13px] font-semibold">{job.jobData.rating.toFixed(1)}</span>
              {job.jobData.user_ratings_total && (
                <span className="text-xs text-gray-500">({job.jobData.user_ratings_total})</span>
              )}
            </div>
            {job.jobData?.opening_hours?.open_now !== undefined && (
              <div className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${job.jobData.opening_hours.open_now ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                <Clock size={11} />
                <span>{job.jobData.opening_hours.open_now ? "Open" : "Closed"}</span>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button onClick={handleDirections} className="flex-1 flex items-center justify-center gap-1 border-2 border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold text-xs py-2.5 rounded-lg">
            <Navigation size={14} /> Directions
          </button>
          <button
            onClick={handleCall}
            disabled={!hasPhoneNumber}
            className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg ${hasPhoneNumber ? "border-green-600 bg-green-50 text-green-600 hover:bg-green-100" : "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

const NearbyBeautyCard: React.FC<NearbyBeautyCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_BEAUTY_PARLOURS.map((beauty) => (
          <SingleBeautyCard
            key={beauty.place_id}
            job={{
              id: beauty.place_id,
              title: beauty.name,
              location: beauty.vicinity,
              distance: parseFloat(beauty.distance_text || "0"),
              category: "Beauty Parlour",
              jobData: beauty,
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleBeautyCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyBeautyCard;
