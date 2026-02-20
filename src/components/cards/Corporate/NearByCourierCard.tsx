import React, { useState } from "react";
import { MapPin, Phone, MessageCircle, Star, Clock, ChevronLeft, ChevronRight, Briefcase, Navigation } from "lucide-react";

interface CourierService {
  id: string;
  title: string;
  description?: string;
  location?: string;
  distance?: number | string;
  category?: string;
  serviceData?: {
    rating?: number;
    user_ratings_total?: number;
    years_in_business?: number;
    responsive?: boolean;
    geometry?: { location: { lat: number; lng: number } };
  };
}

interface CourierServiceCardProps {
  service?: CourierService;
  onViewDetails: (service: CourierService) => void;
}

// Phone numbers mapping
const PHONE_NUMBERS_MAP: Record<string, string> = {
  courier_1: "08733880985",
  courier_2: "09724823249",
  courier_3: "08867703375",
  courier_4: "09008805781",
};

// Images
const COURIER_IMAGES_MAP: Record<string, string[]> = {
  courier_1: [
    "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
  ],
  courier_2: [
    "https://images.unsplash.com/photo-1607827448452-6fda561309ce?w=800",
    "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800",
    "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
  ],
  courier_3: [
    "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800",
    "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800",
    "https://images.unsplash.com/photo-1624012961545-c8bd4f6c3954?w=800",
  ],
  courier_4: [
    "https://images.unsplash.com/photo-1591768575962-2a222dbb4c05?w=800",
    "https://images.unsplash.com/photo-1611003229186-80e40cd54966?w=800",
    "https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800",
  ],
};

// Descriptions
const COURIER_DESCRIPTIONS_MAP: Record<string, string> = {
  courier_1: "Professional courier and cargo services offering domestic and international delivery solutions with tracked shipments.",
  courier_2: "Fast and reliable document delivery service specializing in same-day and priority deliveries across major cities.",
  courier_3: "International courier service providing door-to-door delivery with customs clearance and express shipping options.",
  courier_4: "Comprehensive logistics and courier solutions for businesses with dedicated support and flexible delivery schedules.",
};

const COURIER_SERVICES = ["Corporate Courier", "Bulk Courier", "Speed Post", "Door to Door"];

// Dummy Data
const DUMMY_COURIERS: CourierService[] = [
  {
    id: "courier_1",
    title: "Fastmove Courier & Cargo Services",
    description: COURIER_DESCRIPTIONS_MAP["courier_1"],
    location: "Hyderabad",
    distance: "5.8 km",
    category: "Courier Service",
    serviceData: { rating: 5.0, user_ratings_total: 3, years_in_business: 5, responsive: true, geometry: { location: { lat: 17.385044, lng: 78.486671 } } }
  },
  {
    id: "courier_2",
    title: "Shree Maruthi International Courier",
    description: COURIER_DESCRIPTIONS_MAP["courier_2"],
    location: "Hyderabad",
    distance: "5.8 km",
    category: "Courier Service",
    serviceData: { rating: 4.3, user_ratings_total: 13, years_in_business: 6, responsive: false, geometry: { location: { lat: 17.385044, lng: 78.486671 } } }
  },
  {
    id: "courier_3",
    title: "Fastmove Courier",
    description: COURIER_DESCRIPTIONS_MAP["courier_3"],
    location: "Bangalore, Also Serves Hyderabad",
    distance: "560 km",
    category: "Courier Service",
    serviceData: { rating: 3.9, user_ratings_total: 14, years_in_business: 6, responsive: true, geometry: { location: { lat: 12.9716, lng: 77.5946 } } }
  },
  {
    id: "courier_4",
    title: "Fastmove Logistics",
    description: COURIER_DESCRIPTIONS_MAP["courier_4"],
    location: "Ranchi, Also Serves Hyderabad",
    distance: "1450 km",
    category: "Courier Service",
    serviceData: { rating: 4.2, user_ratings_total: 43, years_in_business: 11, responsive: true, geometry: { location: { lat: 23.3441, lng: 85.3096 } } }
  }
];

const SingleCourierCard: React.FC<{ service: CourierService; onViewDetails: (service: CourierService) => void }> = ({ service, onViewDetails }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const photos = COURIER_IMAGES_MAP[service.id] || [];
  const currentPhoto = photos[currentImageIndex];

  const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % photos.length); };
  const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length); };

  const getRating = () => service.serviceData?.rating?.toFixed(1) || null;
  const getUserRatingsTotal = () => service.serviceData?.user_ratings_total || null;
  const getYearsInBusiness = () => service.serviceData?.years_in_business || null;
  const isResponsive = service.serviceData?.responsive;

  const handleCall = (e: React.MouseEvent) => { e.stopPropagation(); const phone = PHONE_NUMBERS_MAP[service.id]; if(phone) window.location.href = `tel:${phone}`; };
  const handleWhatsApp = (e: React.MouseEvent) => { e.stopPropagation(); const phone = PHONE_NUMBERS_MAP[service.id]; if(phone) window.open(`https://wa.me/${phone}`, "_blank"); };
  const handleDirections = (e: React.MouseEvent) => {
    e.stopPropagation();
    const lat = service.serviceData?.geometry?.location.lat;
    const lng = service.serviceData?.geometry?.location.lng;
    if(lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div onClick={() => onViewDetails(service)} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-gray-200 shrink-0">
        {currentPhoto ? (
          <>
            <img src={currentPhoto} alt={service.title} className="w-full h-full object-cover" />
            {photos.length > 1 && (
              <>
                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2">
                  <ChevronRight size={20} />
                </button>
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{currentImageIndex+1}/{photos.length}</div>
              </>
            )}
          </>
        ) : <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📦</div>}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2 flex-grow flex flex-col">
        <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{service.title}</h2>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin size={16} />
          <span className="line-clamp-1">{service.location}</span>
        </div>
        {service.distance && <p className="text-xs font-semibold text-green-600">{service.distance}</p>}
        <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{COURIER_DESCRIPTIONS_MAP[service.id] || service.description}</p>

        <div className="flex items-center gap-3 text-sm pt-2">
          {getRating() && <div className="flex items-center gap-1"><Star size={14} className="fill-yellow-400 text-yellow-400"/><span className="font-semibold">{getRating()}</span><span className="text-gray-500">({getUserRatingsTotal()})</span></div>}
          {getYearsInBusiness() && <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs"><Briefcase size={12}/>{getYearsInBusiness()} yrs</div>}
          {isResponsive && <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs"><Clock size={12}/>Responsive</div>}
        </div>

        <div className="pt-2">
          <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
          <div className="flex flex-wrap gap-2">
            {COURIER_SERVICES.slice(0,3).map((svc, idx) => (
              <span key={idx} className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">{svc}</span>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-4 mt-auto">
          <button onClick={handleDirections} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold">
            <Navigation size={16}/>Directions
          </button>
          <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold">
            <Phone size={16}/>Call
          </button>
       
        </div>
      </div>
    </div>
  );
};

const CourierServiceCard: React.FC<CourierServiceCardProps> = (props) => {
  if(!props.service){
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {DUMMY_COURIERS.map(c => <SingleCourierCard key={c.id} service={c} onViewDetails={props.onViewDetails} />)}
      </div>
    );
  }
  return <SingleCourierCard service={props.service} onViewDetails={props.onViewDetails} />;
};

export default CourierServiceCard;
