import React, { useState, useMemo } from "react";
import { MapPin, Phone, Star, Clock, ChevronLeft, ChevronRight, Navigation } from "lucide-react";

// ─── Types ─────────────────────────────────────────────

interface CleaningService {
    id: string;
    title: string;
    description: string;
    location: string;
    distance: number;
    yearsInBusiness: number;
    rating: number;
    ratingsCount: number;
    phone: string;
    images: string[];
    responseTime?: string;
}

interface NearbyCleaningCardProps {
    service?: CleaningService;
    onViewDetails: (service: CleaningService) => void;
}

// ─── Dummy Data ────────────────────────────────────────

const DUMMY_SERVICES: CleaningService[] = [
    {
        id: "svc_1",
        title: "Nayak Excellent Deep Cleaning",
        description: "Top-rated deep cleaning specialists offering eco-friendly solutions.",
        location: "Hyderabad",
        distance: 6,
        yearsInBusiness: 7,
        rating: 4.8,
        ratingsCount: 37,
        phone: "07487968278",
        images: [
            "https://images.unsplash.com/photo-1584268337933-756a9c3cdb35?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1556911341-01634f799db1?w=400&h=300&fit=crop",
        ],
        responseTime: "10 Mins",
    },
    {
        id: "svc_2",
        title: "Professional Cleaning Services",
        description: "Reliable residential and commercial cleaning with trained professionals.",
        location: "Hyderabad",
        distance: 3.7,
        yearsInBusiness: 3,
        rating: 4.2,
        ratingsCount: 61,
        phone: "08460541408",
        images: [
            "https://images.unsplash.com/photo-1527091934668-10405048083a?w=400&h=300&fit=crop",
        ],
        responseTime: "10 Mins",
    },
   {
        id: "svc_3",
        title: "Rk House DEEP Cleaning Services",
        rating: 5.0,
        ratingsCount: 1,
        location: "Hyderabad",
        distance: 5.2,
        yearsInBusiness: 4,
        phone: "09876543210",
   
      
        description:
            "Specialized deep cleaning for pre-move and post-construction scenarios. Meticulous attention to detail guaranteed.",
        images: [
            "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1556911341-01634f799db1?w=400&h=300&fit=crop",
        ],
    },
    {
        id: "svc_4",
        title: "Pandu All Cleaning Services",
        rating: 4.4,
        ratingsCount: 145,
        location: "Hyderabad",
        distance: 4.1,
        yearsInBusiness: 6,
        phone: "08460422667",
  
        description:
            "Popular choice for eco-friendly cleaning solutions. Serving both residential and commercial clients across Hyderabad for over 6 years.",
        images: [
            "https://images.unsplash.com/photo-1584268337933-756a9c3cdb35?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1585213691424-36a176c9be6b?w=400&h=300&fit=crop",
        ],
        responseTime: "Responds in 5 Mins",
    },
];

// ─── Single Card ───────────────────────────────────────

const SingleCleaningCard: React.FC<{ service: CleaningService; onViewDetails: (s: CleaningService) => void }> = ({ service, onViewDetails }) => {
    const [imgIdx, setImgIdx] = useState(0);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImgIdx((i) => (i + 1) % service.images.length);
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setImgIdx((i) => (i - 1 + service.images.length) % service.images.length);
    };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = `tel:${service.phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Assuming we don't have lat/lng, open Google Maps search by location
        window.open(`https://www.google.com/maps/search/${encodeURIComponent(service.location)}`, "_blank");
    };

    return (
        <div
            onClick={() => onViewDetails(service)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-200">
                <img src={service.images[imgIdx]} alt={service.title} className="w-full h-full object-cover" />
                {service.images.length > 1 && (
                    <>
                        <button onClick={handlePrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={handleNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2">
                            <ChevronRight size={20} />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {imgIdx + 1}/{service.images.length}
                        </div>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h2 className="text-lg font-bold text-gray-800 line-clamp-2">{service.title}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{service.location}</span>
                </div>
                <p className="text-xs font-semibold text-green-600">{service.distance} km away</p>
                <p className="text-sm text-gray-600 line-clamp-3">{service.description}</p>

                <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{service.rating.toFixed(1)}</span>
                        <span className="text-gray-500">({service.ratingsCount})</span>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-green-100 text-green-700">
                        <Clock size={12} /> <span className="text-xs font-semibold">{service.yearsInBusiness} Yrs</span>
                    </div>
                </div>

                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold"
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Grid Component ───────────────────────────────

const NearbyCleaningServices: React.FC<NearbyCleaningCardProps> = (props) => {
    const services = useMemo(() => DUMMY_SERVICES, []);

    if (props.service) {
        return <SingleCleaningCard service={props.service} onViewDetails={props.onViewDetails} />;
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {services.map((s) => (
                <SingleCleaningCard key={s.id} service={s} onViewDetails={props.onViewDetails} />
            ))}
        </div>
    );
};

export default NearbyCleaningServices;
