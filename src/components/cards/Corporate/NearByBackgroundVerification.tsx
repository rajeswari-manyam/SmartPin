import React, { useState } from "react";
import { MapPin, Phone, Navigation, Star, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface BackgroundVerificationAgency {
    id: string;
    title: string;
    description?: string;
    location?: string;
    distance?: number | string;
    category?: string;
    jobData?: {
        rating?: number;
        user_ratings_total?: number;
        verified?: boolean;
        trending?: boolean;
        popular?: boolean;
        jd_trust?: boolean;
        quick_response?: boolean;
        years_in_business?: number;
        geometry?: { location: { lat: number; lng: number } };
        services?: string[];
        badges?: string[];
    };
}

interface NearbyBackgroundVerificationProps {
    job?: BackgroundVerificationAgency;
    onViewDetails: (job: BackgroundVerificationAgency) => void;
}

// Phone numbers
const PHONE_NUMBERS_MAP: Record<string, string> = {
    agency_1: "07942696225",
    agency_2: "09606241981",
    agency_3: "09880226832",
    agency_4: "09724641539",
    agency_5: "08447736600",
};

// Dummy images
const AGENCY_IMAGES_MAP: Record<string, string[]> = {
    agency_1: [
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800",
    ],
    agency_2: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800",
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800",
    ],
    agency_3: [
        "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=800",
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
        "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=800",
    ],
    agency_4: [
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800",
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800",
    ],
    agency_5: [
        "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=800",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800",
        "https://images.unsplash.com/photo-1573496782635-d4c8c41e0b2c?w=800",
    ],
};

// Dummy descriptions
const AGENCY_DESCRIPTIONS_MAP: Record<string, string> = {
    agency_1: "ISO 9001:2015 certified agency providing comprehensive background verification services.",
    agency_2: "Leading detective and background verification agency trusted by top employers.",
    agency_3: "Verified detective agency specializing in cyber crime investigation and background verification.",
    agency_4: "Popular private detective agency expert in background verification and corporate investigations.",
    agency_5: "Professional verification services with quick turnaround and verified credentials.",
};

// Dummy data
const DUMMY_AGENCIES: BackgroundVerificationAgency[] = [
    {
        id: "agency_1",
        title: "Snabyk Lineage Services",
        description: AGENCY_DESCRIPTIONS_MAP["agency_1"],
        location: "Hyderabad, 15.6 km",
        distance: 15.6,
        category: "Background Verification",
        jobData: {
            rating: 4.5,
            user_ratings_total: 99,
            verified: true,
            jd_trust: true,
            years_in_business: 3,
            geometry: { location: { lat: 17.4065, lng: 78.4772 } },
            services: ["Employment Verification", "Tenant Screening"],
            badges: ["Top Search"]
        }
    },
    {
        id: "agency_2",
        title: "UNIFIED MANAGEMENT PVT. LTD.",
        description: AGENCY_DESCRIPTIONS_MAP["agency_2"],
        location: "Kolkata",
        distance: 8.2,
        category: "Background Verification",
        jobData: {
            rating: 4.6,
            user_ratings_total: 227,
            verified: true,
            jd_trust: true,
            years_in_business: 5,
            geometry: { location: { lat: 22.5726, lng: 88.3639 } },
            services: ["Detective Services", "Corporate Screening"],
            badges: ["JD Trust", "Verified"]
        }
    }
];

const SingleAgencyCard: React.FC<{ job: BackgroundVerificationAgency; onViewDetails: (job: BackgroundVerificationAgency) => void }> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const photos = AGENCY_IMAGES_MAP[job.id] || [];
    const currentPhoto = photos[currentImageIndex];

    const handleNextImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const getRating = () => job.jobData?.rating?.toFixed(1) || null;
    const getUserRatingsTotal = () => job.jobData?.user_ratings_total || null;

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
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition cursor-pointer h-full flex flex-col"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-200 shrink-0">
                {currentPhoto ? (
                    <>
                        <img src={currentPhoto} alt={job.title} className="w-full h-full object-cover" />
                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={handlePrevImage}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={handleNextImage}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
                                >
                                    <ChevronRight size={20} />
                                </button>
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    {currentImageIndex + 1}/{photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                        🛡️
                    </div>
                )}

                {job.jobData?.verified && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold shadow">
                        <CheckCircle size={14} />
                        Verified
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2 flex-grow flex flex-col">
                <h2 className="text-xl font-bold text-gray-800 line-clamp-2">{job.title}</h2>

                <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span className="line-clamp-1">{job.location}</span>
                </div>

                {job.distance && <p className="text-xs font-semibold text-green-600">{job.distance} km away</p>}

                {getRating() && (
                    <div className="flex items-center gap-1 text-sm">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold">{getRating()}</span>
                        <span className="text-gray-500">({getUserRatingsTotal()})</span>
                    </div>
                )}

                {job.jobData?.services && (
                    <div className="pt-2 flex flex-wrap gap-2">
                        {job.jobData.services.slice(0, 3).map((service, idx) => (
                            <span key={idx} className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                                ✓ {service}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{AGENCY_DESCRIPTIONS_MAP[job.id] || job.description}</p>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 text-indigo-700 border-2 border-indigo-600 rounded-lg hover:bg-indigo-100 font-semibold"
                    >
                        <Navigation size={16} /> Directions
                    </button>
                    <button
                        onClick={handleCall}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border-2 border-green-600 rounded-lg hover:bg-green-100 font-semibold"
                    >
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

const NearbyBackgroundVerification: React.FC<NearbyBackgroundVerificationProps> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_AGENCIES.map((agency) => (
                    <SingleAgencyCard key={agency.id} job={agency} onViewDetails={props.onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleAgencyCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyBackgroundVerification;
