import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, Dumbbell } from "lucide-react";

export interface JobType {
  id: string;
  title: string;
  location?: string;
  description?: string;
  distance?: number;
  category?: string;
  jobData?: any;
}

interface NearbyFitnessCardProps {
  job?: JobType;
  onViewDetails: (job: JobType) => void;
}

const PHONE_NUMBERS_MAP: Record<string, string> = {
  fitness_1: "08792486151",
  fitness_2: "08485938090",
  fitness_3: "07942685350",
  fitness_4: "07942692654",
};

export const DUMMY_FITNESS_CENTRES = [
  {
    place_id: "fitness_1",
    name: "PowerFit Gym",
    vicinity: "Jeedimetla, Hyderabad",
    rating: 4.7,
    user_ratings_total: 234,
    geometry: { location: { lat: 17.51, lng: 78.435 } },
    opening_hours: { open_now: true },
    distance: 1.2,
  },
  {
    place_id: "fitness_2",
    name: "Fitness First Club",
    vicinity: "Kukatpally, Hyderabad",
    rating: 4.5,
    user_ratings_total: 189,
    geometry: { location: { lat: 17.495, lng: 78.42 } },
    opening_hours: { open_now: true },
    distance: 2.1,
  },
  {
    place_id: "fitness_3",
    name: "Iron Paradise Gym",
    vicinity: "Chintal, Hyderabad",
    rating: 4.8,
    user_ratings_total: 312,
    geometry: { location: { lat: 17.49, lng: 78.415 } },
    opening_hours: { open_now: true },
    distance: 0.8,
  },
  {
    place_id: "fitness_4",
    name: "Elite Fitness Center",
    vicinity: "Balanagar, Hyderabad",
    rating: 4.6,
    user_ratings_total: 167,
    geometry: { location: { lat: 17.485, lng: 78.41 } },
    opening_hours: { open_now: false },
    distance: 3.5,
  },
];

const FITNESS_IMAGES_MAP: Record<string, string[]> = {
  fitness_1: [
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
  ],
  fitness_2: [
    "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800",
  ],
  fitness_3: [
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
    "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
  ],
  fitness_4: [
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
  ],
};

const SingleFitnessCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({
  job,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const photos = FITNESS_IMAGES_MAP[job.id] || [];
  const currentPhoto = photos[currentImageIndex];

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex < photos.length - 1) setCurrentImageIndex(prev => prev + 1);
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
  };

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    const phoneNumber = PHONE_NUMBERS_MAP[job.id];
    if (phoneNumber) window.open(`tel:${phoneNumber}`, "_self");
    else alert("Phone number not available");
  };

  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { lat, lng } = (job.jobData as any)?.geometry?.location || {};
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    } else alert("Location not available");
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:scale-[0.98] transition-transform"
      onClick={() => onViewDetails(job)}
    >
      {/* Image Carousel */}
      <div className="relative w-full h-48">
        {currentPhoto ? (
          <>
            <img src={currentPhoto} alt={job.title} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                {currentImageIndex > 0 && (
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                {currentImageIndex < photos.length - 1 && (
                  <button
                    onClick={handleNextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full"
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1}/{photos.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <Dumbbell size={48} className="text-gray-400" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title || "Fitness Centre"}</h3>
        <div className="flex items-center text-gray-500 text-sm mb-2">
          <MapPin className="mr-1" size={14} /> {(job.location || job.description) ?? "Location"}
        </div>

        {job.distance && (
          <p className="text-purple-600 font-semibold text-sm mb-2">{job.distance} km away</p>
        )}

        <p className="text-gray-600 text-sm mb-2">
          {(job.jobData as any)?.description ||
            "Professional fitness centre with modern equipment and expert trainers"}
        </p>

        <div className="flex items-center gap-3 mb-3">
          {(job.jobData as any)?.rating && (
            <div className="flex items-center gap-1 text-yellow-400">
              <Star size={14} className="fill-yellow-400" /> 
              <span className="text-gray-900 font-semibold">{(job.jobData as any).rating.toFixed(1)}</span>
            </div>
          )}
          {(job.jobData as any)?.opening_hours?.open_now !== undefined && (
            <div className="flex items-center gap-1 text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
              <Clock size={12} /> {(job.jobData as any).opening_hours.open_now ? "Open Now" : "Closed"}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleDirections}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-purple-50 transition"
          >
            <Navigation size={14} /> Directions
          </button>
          <button
            onClick={handleCall}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-green-600 text-green-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition"
          >
            <Phone size={14} /> Call
          </button>
        </div>
      </div>
    </div>
  );
};

const NearbyFitnessCard: React.FC<NearbyFitnessCardProps> = (props) => {
  if (!props.job) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {DUMMY_FITNESS_CENTRES.map((fitness: any) => (
          <SingleFitnessCard
            key={fitness.place_id}
            job={{
              id: fitness.place_id,
              title: fitness.name,
              location: fitness.vicinity,
              distance: fitness.distance,
              jobData: fitness,
            }}
            onViewDetails={props.onViewDetails}
          />
        ))}
      </div>
    );
  }

  return <SingleFitnessCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyFitnessCard;
