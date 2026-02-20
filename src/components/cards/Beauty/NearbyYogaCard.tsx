// NearbyYogaCard.tsx
import React, { useState, useCallback } from "react";
import { JobType } from "../../../types/navigation";
import { Star, Phone, MapPin, Zap, TrendingUp, CheckCircle, Dumbbell } from "lucide-react";

interface NearbyYogaCardProps {
    job: JobType;
    onViewDetails: (job: JobType) => void;
}

const PHONE_NUMBERS_MAP: Record<string, string> = {
    yoga_1: "08123746160",
    yoga_2: "09972422303",
    yoga_3: "07947436225",
    yoga_4: "08197579204",
};

const YOGA_IMAGES_MAP: Record<string, string[]> = {
    yoga_1: [
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800",
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    ],
    yoga_2: [
        "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=800",
        "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=800",
    ],
    yoga_3: [
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800",
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
    ],
    yoga_4: [
        "https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=800",
        "https://images.unsplash.com/photo-1593810450967-f9c42742e326?w=800",
    ],
};

const YOGA_DESCRIPTIONS_MAP: Record<string, string> = {
    yoga_1: "Responsive yoga center with exceptional 4.8★ rating and 382 reviews. Specializes in Pilates and meditation.",
    yoga_2: "Trending yoga academy with perfect 5.0★ rating and 139 reviews. Offers free trial and teacher training centre.",
    yoga_3: "Trending fitness studio with outstanding 4.9★ rating and 333 reviews. Features outdoor services and gym membership.",
    yoga_4: "Responsive yogashala with excellent 4.8★ rating and 249 reviews. Specializes in weight management and aerial ring.",
};

const NearbyYogaCard: React.FC<NearbyYogaCardProps> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const photos = YOGA_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImageIndex < photos.length - 1) setCurrentImageIndex(prev => prev + 1);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
    };

    const getPhoneNumber = useCallback(() => PHONE_NUMBERS_MAP[job.id] || null, [job.id]);

    const handleCall = useCallback(() => {
        const number = getPhoneNumber();
        if (number) {
            window.open(`tel:${number}`);
        } else {
            alert("Phone number not available.");
        }
    }, [getPhoneNumber]);

    const handleDirections = useCallback(() => {
        const jobData: any = job.jobData;
        const lat = jobData?.geometry?.location?.lat;
        const lng = jobData?.geometry?.location?.lng;
        if (lat && lng) {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
        } else {
            alert("Location not available.");
        }
    }, [job]);

    const amenities = (job.jobData?.amenities || ["Yoga Classes", "Meditation", "Fitness Training"]).slice(0, 4);
    const moreAmenities = (job.jobData?.amenities?.length || 0) - amenities.length;

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:scale-[0.98] transition-transform"
        >
            {/* Image Carousel */}
            <div className="relative w-full h-48">
                {currentPhoto ? (
                    <img src={currentPhoto} alt={job.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Dumbbell size={48} className="text-gray-400" />
                    </div>
                )}
                {currentImageIndex > 0 && (
                    <button onClick={handlePrevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">
                        &lt;
                    </button>
                )}
                {currentImageIndex < photos.length - 1 && (
                    <button onClick={handleNextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">
                        &gt;
                    </button>
                )}
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    {currentImageIndex + 1}/{photos.length}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h2 className="text-lg font-bold text-gray-900 mb-1">{job.title || "Yoga Center"}</h2>
                <div className="flex items-center text-gray-500 text-sm mb-1">
                    <MapPin size={14} className="mr-1" /> {job.location || job.description}
                </div>
                {job.distance && <div className="text-purple-600 font-semibold text-sm mb-2">{job.distance} km</div>}

                <p className="text-gray-600 text-sm mb-2">{YOGA_DESCRIPTIONS_MAP[job.id] || job.description}</p>

                <div className="flex flex-wrap gap-2 mb-2">
                    {job.jobData?.special_tags?.map((tag: string, index: number) => (
                        <span
                            key={index}
                            className={`text-xs font-semibold px-2 py-1 rounded ${tag === "Trending" ? "bg-red-100 text-red-600 flex items-center gap-1" : "bg-purple-100 text-purple-600 flex items-center gap-1"
                                }`}
                        >
                            {tag === "Trending" ? <TrendingUp size={12} /> : <Zap size={12} />}
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    {amenities.map((a: string, i: number) => (
                        <span key={i} className="flex items-center gap-1 text-purple-600 text-xs font-medium bg-purple-100 px-2 py-1 rounded">
                            <CheckCircle size={12} className="text-purple-600" /> {a}
                        </span>
                    ))}
                    {moreAmenities > 0 && <span className="text-gray-500 text-xs font-medium px-2 py-1 bg-gray-100 rounded">+{moreAmenities} more</span>}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-purple-600 rounded text-purple-600 font-semibold hover:bg-purple-50 transition"
                    >
                        <MapPin size={14} /> Directions
                    </button>
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-green-500 rounded text-green-500 font-semibold hover:bg-green-50 transition"
                    >
                        <Phone size={14} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NearbyYogaCard;
