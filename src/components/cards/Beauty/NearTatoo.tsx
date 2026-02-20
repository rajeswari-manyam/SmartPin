// NearbyTattooCard.tsx
import React, { useState, useCallback } from "react";
import { MapPin, Phone, Navigation, Star, Clock, CheckCircle, TrendingUp, ChevronLeft, ChevronRight, Brush } from "lucide-react";

export interface JobType {
    id: string;
    title?: string;
    location?: string;
    description?: string;
    distance?: number | string;
    jobData?: any;
}

interface NearbyTattooCardProps {
    job: JobType;
    onViewDetails: (job: JobType) => void;
}

const PHONE_NUMBERS_MAP: { [key: string]: string } = {
    tattoo_1: "08460562074",
    tattoo_2: "07947123083",
    tattoo_3: "07947411966",
    tattoo_4: "07947122347",
};

const TATTOO_IMAGES_MAP: { [key: string]: string[] } = {
    tattoo_1: [
        "https://picsum.photos/800/600?random=101",
        "https://picsum.photos/800/600?random=102",
        "https://picsum.photos/800/600?random=103",
    ],
    tattoo_2: [
        "https://picsum.photos/800/600?random=201",
        "https://picsum.photos/800/600?random=202",
        "https://picsum.photos/800/600?random=203",
    ],
    tattoo_3: [
        "https://picsum.photos/800/600?random=301",
        "https://picsum.photos/800/600?random=302",
        "https://picsum.photos/800/600?random=303",
    ],
    tattoo_4: [
        "https://picsum.photos/800/600?random=401",
        "https://picsum.photos/800/600?random=402",
        "https://picsum.photos/800/600?random=403",
    ],
};

const TATTOO_DESCRIPTIONS_MAP: { [key: string]: string } = {
    tattoo_1:
        "Responsive tattoo studio with excellent 5.0★ rating and 52 reviews. Top rated with home services offered. Open 24 hours, 8 years in business. Located 4.1 km away.",
    tattoo_2:
        "Top rated tattoo studio with outstanding 4.8★ rating and 239 reviews. Verified professional tattoo artists and parlour. 10 years in business, only 1 km away.",
    tattoo_3:
        "Top rated and trending studio with 4.9★ rating and 58 reviews. Specializes in custom designs and piercing services. 6 years in business, 1.9 km away.",
    tattoo_4:
        "Trending tattoo studio with excellent 4.9★ rating and 35 reviews. Expert in 3D tattoo art and custom designs. 5 years in business, 1.9 km away.",
};

const NearbyTattooCard: React.FC<NearbyTattooCardProps> = ({
    job,
    onViewDetails,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = TATTOO_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (currentImageIndex < photos.length - 1) setCurrentImageIndex((p) => p + 1);
        },
        [currentImageIndex, photos.length]
    );

    const handlePrevImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (currentImageIndex > 0) setCurrentImageIndex((p) => p - 1);
        },
        [currentImageIndex]
    );

    const getName = () => job.title || "Tattoo Studio";
    const getLocation = () => job.location || job.description || "Location";
    const getDistance = () => {
        const jobData = job.jobData as any;
        if (jobData?.distance_text) return jobData.distance_text;
        if (job.distance !== undefined && job.distance !== null) {
            const distanceNum = Number(job.distance);
            if (!isNaN(distanceNum)) return `${distanceNum.toFixed(1)} km`;
        }
        return "";
    };
    const getDescription = () =>
        TATTOO_DESCRIPTIONS_MAP[job.id] ||
        job.description ||
        "Professional tattoo artists and custom designs";

    const rating = (job.jobData as any)?.rating;
    const userRatingsTotal = (job.jobData as any)?.user_ratings_total;
    const openingStatus = (job.jobData as any)?.opening_hours?.open_now
        ? "Open Now"
        : "Closed";
    const amenities = (job.jobData as any)?.amenities || [
        "Tattoo Art",
        "Custom Designs",
        "Professional Artists",
    ];
    const visibleAmenities = amenities.slice(0, 4);
    const moreAmenities = amenities.length > 4 ? amenities.length - 4 : 0;
    const hasPhoneNumber = !!PHONE_NUMBERS_MAP[job.id];

    const handleCall = () => {
        const phoneNumber = PHONE_NUMBERS_MAP[job.id];
        if (!phoneNumber) return alert("Phone Number Not Available");
        window.open(`tel:${phoneNumber}`, "_self");
    };

    const handleDirections = () => {
        const jobData = job.jobData as any;
        const lat = jobData?.geometry?.location?.lat;
        const lng = jobData?.geometry?.location?.lng;
        if (!lat || !lng) return alert("Location Not Available");
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`);
    };

    return (
        <div
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:scale-[0.98] transition-transform"
            onClick={() => onViewDetails(job)}
        >
            {/* Image Carousel */}
            <div className="relative w-full h-48 bg-gray-200">
                {currentPhoto ? (
                    <img
                        src={currentPhoto}
                        alt={getName()}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center w-full h-full text-gray-400">
                        <Brush size={48} />
                    </div>
                )}
                {photos.length > 1 && (
                    <>
                        {currentImageIndex > 0 && (
                            <button
                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full w-9 h-9 flex items-center justify-center text-white"
                                onClick={handlePrevImage}
                            >
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        {currentImageIndex < photos.length - 1 && (
                            <button
                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 rounded-full w-9 h-9 flex items-center justify-center text-white"
                                onClick={handleNextImage}
                            >
                                <ChevronRight size={20} />
                            </button>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                            {currentImageIndex + 1} / {photos.length}
                        </div>
                    </>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h2 className="text-lg font-bold text-gray-900 line-clamp-2">{getName()}</h2>

                <div className="flex items-center text-gray-500 text-sm my-1">
                    <MapPin size={14} />
                    <span className="ml-1 line-clamp-1">{getLocation()}</span>
                </div>

                {getDistance() && (
                    <div className="text-purple-600 font-semibold text-sm mb-2">{getDistance()}</div>
                )}

                <p className="text-gray-600 text-sm mb-2 line-clamp-3">{getDescription()}</p>

                <div className="flex flex-wrap gap-2 mb-2">
                    {["Trending", "Top Rated", "Verified", "Responsive"].map((tag) =>
                        (job.jobData?.special_tags || []).includes(tag) ? (
                            <span
                                key={tag}
                                className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${tag === "Trending"
                                    ? "bg-red-100 text-red-700"
                                    : tag === "Top Rated"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : tag === "Verified"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-purple-100 text-purple-700"
                                    }`}
                            >
                                {tag === "Trending" && <TrendingUp size={12} />}
                                {tag === "Top Rated" && <Star size={12} className="fill-yellow-400" />}
                                {tag === "Verified" && <CheckCircle size={12} />}
                                {tag === "Responsive" && <Clock size={12} />}
                                {tag}
                            </span>
                        ) : null
                    )}
                </div>

                <div className="flex items-center gap-2 mb-3">
                    {rating && (
                        <div className="flex items-center gap-1 text-sm">
                            <Star size={14} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            {userRatingsTotal && <span className="text-gray-500">({userRatingsTotal})</span>}
                        </div>
                    )}
                    {openingStatus && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            <Clock size={12} />
                            <span>{openingStatus}</span>
                        </div>
                    )}
                </div>

                {/* Amenities */}
                <div className="mb-3">
                    <span className="text-gray-500 text-xs font-bold tracking-wide mb-1 block">
                        SERVICES:
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {visibleAmenities.map((amenity: string) => (
                            <span
                                key={amenity}
                                className="flex items-center gap-1 text-purple-700 text-xs bg-purple-100 px-2 py-1 rounded"
                            >
                                <CheckCircle size={12} />
                                {amenity}
                            </span>
                        ))}
                        {moreAmenities > 0 && (
                            <span className="text-gray-500 text-xs bg-gray-200 px-2 py-1 rounded">
                                +{moreAmenities} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDirections();
                        }}
                        className="flex-1 flex items-center justify-center gap-1 text-purple-700 border border-purple-500 bg-purple-100 py-2 rounded font-semibold text-xs hover:bg-purple-200"
                    >
                        <Navigation size={14} />
                        Directions
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCall();
                        }}
                        disabled={!hasPhoneNumber}
                        className={`flex-1 flex items-center justify-center gap-1 py-2 rounded font-semibold text-xs ${hasPhoneNumber
                            ? "text-green-700 border border-green-500 bg-green-100 hover:bg-green-200"
                            : "text-gray-400 border border-gray-300 bg-gray-200 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={14} />
                        Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NearbyTattooCard;
