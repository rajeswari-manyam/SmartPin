import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, Clock, ChevronLeft, ChevronRight, CheckCircle, Flame, Zap } from "lucide-react";

interface CCTVService {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        opening_hours?: { open_now: boolean };
        geometry?: { location: { lat: number; lng: number } };
    };
    services?: string[];
    special_tags?: string[];
}

interface NearbyCCTVCardProps {
    job?: CCTVService;
    onViewDetails: (job: CCTVService) => void;
}

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
    cctv_install_1: "07043557142",
    cctv_install_2: "09972339181",
    cctv_install_3: "08792479912",
    cctv_install_4: "08460382860",
};

// Dummy images
const CCTV_IMAGES_MAP: Record<string, string[]> = {
    cctv_install_1: [
        "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800",
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800",
    ],
    cctv_install_2: [
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
        "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800",
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800",
    ],
    cctv_install_3: [
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800",
        "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800",
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
    ],
    cctv_install_4: [
        "https://images.unsplash.com/photo-1558002038-1055907df827?w=800",
        "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800",
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800",
    ],
};

const CCTV_DESCRIPTIONS_MAP: Record<string, string> = {
    cctv_install_1: "Trending CCTV installation service with 4.2★ rating from 26 customers. Active Eye offers professional CCTV installation and repair services in Mehdipatnam.",
    cctv_install_2: "Top rated CCTV service with 4.9★ rating. Sri Able Technologies provides same day delivery, shop in store options, and quick service.",
    cctv_install_3: "Verified and popular security solutions provider with 4.1★ rating. Sree Infocom specializes in biometric attendance systems and CCTV installation.",
    cctv_install_4: "Verified home automation specialist with 4.5★ rating. Home Automation By Iyacam offers comprehensive CCTV installation and smart home solutions.",
};

// Services
const CCTV_SERVICES_MAP: Record<string, string[]> = {
    cctv_install_1: ["CCTV Installation", "CCTV Repair & Services", "Security Cameras"],
    cctv_install_2: ["Same Day Delivery", "Shop In Store", "Quick Service", "CCTV Systems"],
    cctv_install_3: ["Biometric Systems", "CCTV Installation", "Attendance Recording"],
    cctv_install_4: ["Home Automation", "CCTV Installation", "CCTV Dealers"],
};

// Dummy Data
const DUMMY_CCTV_SERVICES: CCTVService[] = [
    {
        id: "cctv_install_1",
        title: "Active Eye",
        description: CCTV_DESCRIPTIONS_MAP["cctv_install_1"],
        location: "Mehdipatnam, Hyderabad",
        distance: 10.7,
        jobData: { rating: 4.2, user_ratings_total: 26 },
        services: CCTV_SERVICES_MAP["cctv_install_1"],
        special_tags: ["Trending"],
    },
    {
        id: "cctv_install_2",
        title: "Sri Able Technologies",
        description: CCTV_DESCRIPTIONS_MAP["cctv_install_2"],
        location: "Kutbullapur, Hyderabad",
        distance: 1.9,
        jobData: { rating: 4.9, user_ratings_total: 8 },
        services: CCTV_SERVICES_MAP["cctv_install_2"],
        special_tags: ["Quick Response", "Top Rated"],
    },
    {
        id: "cctv_install_3",
        title: "Sree Infocom",
        description: CCTV_DESCRIPTIONS_MAP["cctv_install_3"],
        location: "SaiBaba Nagar, Hyderabad",
        distance: 3.9,
        jobData: { rating: 4.1, user_ratings_total: 167 },
        services: CCTV_SERVICES_MAP["cctv_install_3"],
        special_tags: ["Verified", "Popular"],
    },
    {
        id: "cctv_install_4",
        title: "Home Automation By Iyacam",
        description: CCTV_DESCRIPTIONS_MAP["cctv_install_4"],
        location: "Sultan Bazar, Hyderabad",
        distance: 8.5,
        jobData: { rating: 4.5, user_ratings_total: 28 },
        services: CCTV_SERVICES_MAP["cctv_install_4"],
        special_tags: ["Verified"],
    },
];

// Single CCTV Card
const SingleCCTVCard: React.FC<{ job: CCTVService; onViewDetails: (job: CCTVService) => void }> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = CCTV_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev + 1) % photos.length); };
    const handlePrevImage = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length); };

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        const phone = PHONE_NUMBERS_MAP[job.id];
        if (phone) window.location.href = `tel:${phone}`;
    };

    const handleDirections = (e: React.MouseEvent) => {
        e.stopPropagation();
        const lat = job.jobData?.geometry?.location.lat;
        const lng = job.jobData?.geometry?.location.lng;
        if (lat && lng) window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
    };

    return (
        <div onClick={() => onViewDetails(job)} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition cursor-pointer flex flex-col h-full">
            {/* Image */}
            <div className="relative h-48 bg-gray-200">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={job.title} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full">
                                    <ChevronLeft size={20} />
                                </button>
                                <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full">
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">📹</div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow space-y-2">
                <h2 className="text-lg font-bold text-gray-800 line-clamp-2">{job.title}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} /> <span className="line-clamp-1">{job.location}</span>
                </div>
                {job.distance && <p className="text-xs font-semibold text-red-600">{job.distance} km away</p>}
                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>

                {/* Rating & Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                    {job.jobData?.rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold">{job.jobData.rating.toFixed(1)}</span>
                            {job.jobData.user_ratings_total && <span className="text-gray-500">({job.jobData.user_ratings_total})</span>}
                        </div>
                    )}
                    {job.special_tags?.map((tag, idx) => (
                        <div key={idx} className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${tag === "Verified" ? "bg-blue-100 text-blue-600" : ""} ${tag === "Trending" ? "bg-red-100 text-red-600" : ""} ${tag === "Popular" ? "bg-yellow-100 text-yellow-700" : ""} ${tag === "Quick Response" ? "bg-yellow-100 text-yellow-700" : ""} ${tag === "Top Rated" ? "bg-yellow-100 text-yellow-700" : ""}`}>
                            {tag === "Verified" && <CheckCircle size={12} />}
                            {tag === "Trending" && <Flame size={12} />}
                            {tag === "Popular" && <Flame size={12} />}
                            {tag === "Quick Response" && <Zap size={12} />}
                            {tag === "Top Rated" && <Star size={12} />}
                            {tag}
                        </div>
                    ))}
                </div>

                {/* Services */}
                {job.services && (
                    <div className="pt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Services:</p>
                        <div className="flex flex-wrap gap-2">
                            {job.services.slice(0, 3).map((s, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 bg-red-50 text-red-600 px-2 py-1 rounded text-xs">✓ {s}</span>
                            ))}
                            {job.services.length > 3 && <span className="inline-flex items-center gap-1 bg-gray-200 text-gray-600 px-2 py-1 rounded text-xs">+{job.services.length - 3} more</span>}
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button onClick={handleDirections} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 border-2 border-red-600 rounded-lg font-semibold hover:bg-red-100">
                        <Navigation size={16} /> Directions
                    </button>
                    <button onClick={handleCall} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg font-semibold hover:bg-green-100">
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main NearbyCCTVCard
const NearbyCCTVCard: React.FC<NearbyCCTVCardProps> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_CCTV_SERVICES.map((cctv) => (
                    <SingleCCTVCard key={cctv.id} job={cctv} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleCCTVCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbyCCTVCard;
