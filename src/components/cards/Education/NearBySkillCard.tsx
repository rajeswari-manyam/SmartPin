import React, { useState, useMemo } from "react";
import {
    MapPin,
    Phone,
    Navigation,
    ChevronLeft,
    ChevronRight,
    Star,
    Clock,
    CheckCircle,
    GraduationCap,
} from "lucide-react";

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title?: string;
    location?: string;
    description?: string;
    distance?: number | string;
    category?: string;
    jobData?: any;
}

interface Props {
    job?: JobType;
    onViewDetails: (job: JobType) => void;
}

/* ================= CONSTANTS ================= */

const SKILL_SERVICES = [
    "Computer Training",
    "Home Tutors",
    "Abacus Classes",
    "Placement Services",
    "Career Counseling",
];

const PHONE_MAP: Record<string, string> = {
    skill_1: "08197587296",
    skill_2: "07383688287",
    skill_3: "07942696167",
    skill_4: "07947419688",
};

const IMAGES_MAP: Record<string, string[]> = {
    skill_1: [
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800",
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800",
    ],
    skill_2: [
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
        "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=800",
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
    ],
    skill_3: [
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
        "https://images.unsplash.com/photo-1596496181848-3091d4878b24?w=800",
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
    ],
    skill_4: [
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800",
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_SKILL_CENTERS: JobType[] = [
    {
        id: "skill_1",
        title: "PROTOS",
        location: "Methodist Complex, Abids, Hyderabad",
        distance: 10.7,
        category: "Skill Development",
        description:
            "Trending skill development center with expert trainers and job placement support.",
        jobData: {
            rating: 4.7,
            user_ratings_total: 1032,
            opening_hours: { open_now: true },
            closing_time: "20:00",
            geometry: { location: { lat: 17.385, lng: 78.473 } },
            phone: PHONE_MAP.skill_1,
        },
    },
    {
        id: "skill_2",
        title: "Edufast Academy",
        location: "Rajendra Nagar, Hyderabad",
        distance: 19.7,
        category: "Training Institute",
        description:
            "Home tutoring and computer training institute with personalized programs.",
        jobData: {
            rating: 4.5,
            user_ratings_total: 167,
            opening_hours: { open_now: true },
            closing_time: "21:00",
            geometry: { location: { lat: 17.41, lng: 78.44 } },
            phone: PHONE_MAP.skill_2,
        },
    },
    {
        id: "skill_3",
        title: "SIP Abacus",
        location: "Sikh Village, Hyderabad",
        distance: 4.2,
        category: "Abacus Training",
        description:
            "Mental math and abacus learning institute for children and beginners.",
        jobData: {
            rating: 4.7,
            user_ratings_total: 51,
            opening_hours: { open_now: true },
            closing_time: "19:00",
            geometry: { location: { lat: 17.455, lng: 78.52 } },
            phone: PHONE_MAP.skill_3,
        },
    },
];

/* ================= CARD ================= */

const SingleSkillCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({
    job,
    onViewDetails,
}) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES_MAP[job.id] || IMAGES_MAP.skill_1,
        [job.id]
    );

    const rating = job.jobData?.rating;
    const userRatingsTotal = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const closingTime = job.jobData?.closing_time;
    const phone = job.jobData?.phone;

    const distanceString =
        typeof job.distance === "number"
            ? `${job.distance.toFixed(1)} km away`
            : job.distance;

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-2xl shadow border overflow-hidden hover:shadow-lg transition cursor-pointer flex flex-col"
        >
            {/* Image */}
            <div className="relative h-48">
                <img src={photos[index]} className="w-full h-full object-cover" />

                {index > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index - 1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}

                {index < photos.length - 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index + 1);
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 p-2 rounded-full text-white"
                    >
                        <ChevronRight size={16} />
                    </button>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1} / {photos.length}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col gap-3 flex-grow">
                <h2 className="text-lg font-bold">{job.title}</h2>

                <div className="flex gap-2 text-sm text-gray-600">
                    <MapPin size={14} /> <span className="truncate">{job.location}</span>
                </div>

                {distanceString && (
                    <p className="text-indigo-600 text-sm font-semibold">{distanceString}</p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>

                <div className="flex items-center gap-3">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="fill-yellow-400 text-yellow-400" size={14} />
                            <span className="font-semibold">{rating}</span>
                            {userRatingsTotal && (
                                <span className="text-gray-500">({userRatingsTotal})</span>
                            )}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <span
                            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${isOpen
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                                }`}
                        >
                            <Clock size={12} />
                            {isOpen ? `Open · Closes ${closingTime}` : "Closed"}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2">
                    {SKILL_SERVICES.slice(0, 3).map((s) => (
                        <span
                            key={s}
                            className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded"
                        >
                            <CheckCircle size={10} /> {s}
                        </span>
                    ))}
                </div>

                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const { lat, lng } = job.jobData?.geometry?.location || {};
                            if (lat && lng) {
                                window.open(
                                    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
                                    "_blank"
                                );
                            }
                        }}
                        className="flex-1 border-2 border-indigo-600 text-indigo-700 py-2 rounded-lg flex justify-center gap-2 font-semibold hover:bg-indigo-50"
                    >
                        <Navigation size={16} /> Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (phone) window.open(`tel:${phone}`);
                        }}
                        className={`flex-1 border-2 py-2 rounded-lg flex justify-center gap-2 font-semibold ${phone
                            ? "border-green-600 text-green-700 hover:bg-green-50"
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                            }`}
                    >
                        <Phone size={16} /> Call
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ================= LIST ================= */

const NearbySkillCenters: React.FC<Props> = ({ job, onViewDetails }) => {
    if (!job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_SKILL_CENTERS.map((c) => (
                    <SingleSkillCard key={c.id} job={c} onViewDetails={onViewDetails} />
                ))}
            </div>
        );
    }

    return <SingleSkillCard job={job} onViewDetails={onViewDetails} />;
};

export default NearbySkillCenters;
