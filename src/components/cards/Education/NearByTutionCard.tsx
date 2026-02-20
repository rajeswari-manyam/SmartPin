import React, { useState, useMemo } from "react";
import { MapPin, Phone, Navigation, ChevronLeft, ChevronRight, Star, Clock, Shield, CheckCircle, TrendingUp, Search, Tag, MessageCircle } from "lucide-react";

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

const PHONE_MAP: Record<string, string> = {
    tuition_1: "08792485539",
    tuition_2: "08401209022",
    tuition_3: "09845267923",
    tuition_4: "08792483602",
};

const IMAGES_MAP: Record<string, string[]> = {
    tuition_1: [
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
        "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800",
    ],
    tuition_2: [
        "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800",
        "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800",
        "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800",
    ],
    tuition_3: [
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800",
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800",
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800",
    ],
    tuition_4: [
        "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800",
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    ],
};

const DESCRIPTIONS_MAP: Record<string, string> = {
    tuition_1: "Highly trusted home tuition service with exceptional 4.9 rating from 4,291 reviews. Verified and top search result offering quality courses with 339 suggestions. Features hostel facility, counselling sessions, and mental health workshop for comprehensive student support.",
    tuition_2: "Trending home tuition service specializing in biology and science subjects. Rated 4.3 with 47 reviews. Offers flexible home tutoring with experienced teachers for personalized one-on-one learning.",
    tuition_3: "Trusted and verified home tuition for IIT-JEE and NEET preparation with 4.6 rating from 57 reviews. Trending and reasonably priced with unique features including CCTV security, counselling sessions, and complaint box. Quick response time of 2 hours.",
    tuition_4: "Pan-India home tuition service with 4.4 rating from 236 reviews. Trending and reasonably priced offering GATE tutorials and home tutors for engineering students. Provides comprehensive coverage across all subjects with 15 positive suggestions.",
};

const SERVICES_MAP: Record<string, string[]> = {
    tuition_1: ["Quality Courses", "Hostel Facility", "Counselling Sessions", "Mental Health Workshop"],
    tuition_2: ["Biology Tutoring", "Home Tutors", "Flexible Timing"],
    tuition_3: ["IIT-JEE & NEET", "CCTV Camera", "Counselling Sessions", "Complaint Box"],
    tuition_4: ["GATE Tutorials", "Home Tutors", "All India Coverage"],
};

/* ================= DUMMY DATA ================= */

const DUMMY_TUITIONS: JobType[] = [
    {
        id: "tuition_1",
        title: "Vivekaananda Home Tuitions",
        location: "Lingampally Street Chanda Nagar, Hyderabad",
        distance: 15.6,
        category: "Home Tuition",
        description: DESCRIPTIONS_MAP.tuition_1,
        jobData: {
            rating: 4.9,
            user_ratings_total: 4291,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4600, lng: 78.3500 } },
            phone: PHONE_MAP.tuition_1,
            badges: ["Trust", "Verified", "Top Search"],
            suggestions: 339,
            offers: 1,
            quality_courses: true,
        }
    },
    {
        id: "tuition_2",
        title: "Kumar Tutions",
        location: "Kukatpally, Hyderabad",
        distance: 3.6,
        category: "Home Tuition",
        description: DESCRIPTIONS_MAP.tuition_2,
        jobData: {
            rating: 4.3,
            user_ratings_total: 47,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4900, lng: 78.4000 } },
            phone: PHONE_MAP.tuition_2,
            badges: ["Trending"],
        }
    },
    {
        id: "tuition_3",
        title: "Aakash Home Tuitions",
        location: "Alwyn Colony Kukatpally, Hyderabad",
        distance: 5.7,
        category: "Home Tuition",
        description: DESCRIPTIONS_MAP.tuition_3,
        jobData: {
            rating: 4.6,
            user_ratings_total: 57,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4950, lng: 78.4050 } },
            phone: PHONE_MAP.tuition_3,
            badges: ["Trust", "Verified", "Trending", "Reasonably priced"],
            suggestions: 5,
            response_time: "Responds in 2 Hours",
        }
    },
    {
        id: "tuition_4",
        title: "All INDIA Home Tuition Services",
        location: "Uppal Main Road Uppal, Hyderabad",
        distance: 12.4,
        category: "Home Tuition",
        description: DESCRIPTIONS_MAP.tuition_4,
        jobData: {
            rating: 4.4,
            user_ratings_total: 236,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4050, lng: 78.5600 } },
            phone: PHONE_MAP.tuition_4,
            badges: ["Trending", "Reasonably priced"],
            suggestions: 15,
        }
    },
];

/* ================= BADGE COMPONENTS ================= */

const BadgeIcon: React.FC<{ badge: string }> = ({ badge }) => {
    switch (badge) {
        case "Trust":
            return <Shield size={10} />;
        case "Verified":
            return <CheckCircle size={10} />;
        case "Top Search":
            return <Search size={10} />;
        case "Trending":
            return <TrendingUp size={10} />;
        case "Reasonably priced":
            return <MessageCircle size={10} />;
        default:
            return null;
    }
};

const getBadgeStyles = (badge: string): string => {
    switch (badge) {
        case "Trust":
            return "bg-amber-100 text-amber-600";
        case "Verified":
            return "bg-blue-100 text-blue-600";
        case "Top Search":
            return "bg-purple-100 text-purple-600";
        case "Trending":
            return "bg-red-100 text-red-600";
        case "Reasonably priced":
            return "bg-emerald-100 text-emerald-600";
        default:
            return "bg-gray-100 text-gray-600";
    }
};

/* ================= COMPONENT ================= */

const SingleTuitionCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => IMAGES_MAP[job.id] || IMAGES_MAP.tuition_1,
        [job.id]
    );

    const rating = job.jobData?.rating;
    const userRatingsTotal = job.jobData?.user_ratings_total;
    const phone = job.jobData?.phone || PHONE_MAP[job.id];
    const badges = job.jobData?.badges || [];
    const suggestions = job.jobData?.suggestions;
    const offers = job.jobData?.offers;
    const qualityCourses = job.jobData?.quality_courses;
    const responseTime = job.jobData?.response_time;
    const services = SERVICES_MAP[job.id] || ["Home Tuition", "Quality Education"];

    const distanceString = typeof job.distance === "number"
        ? `${job.distance.toFixed(1)} km away`
        : job.distance;

    return (
        <div
            className="bg-white rounded-2xl shadow border overflow-hidden cursor-pointer hover:shadow-lg transition-all h-full flex flex-col relative"
            onClick={() => onViewDetails(job)}
        >
            {/* Offer Badge */}
            {offers && (
                <div className="absolute top-2 left-2 z-10 bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Tag size={12} />
                    {offers} Offer
                </div>
            )}

            {/* Image Carousel */}
            <div className="relative h-48 shrink-0">
                <img src={photos[index]} className="w-full h-full object-cover" alt={job.title} />

                {index > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index - 1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition"
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full hover:bg-black/80 transition"
                    >
                        <ChevronRight size={16} />
                    </button>
                )}

                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1} / {photos.length}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3 flex-grow flex flex-col">
                <h2 className="text-xl font-bold line-clamp-1">{job.title}</h2>

                <div className="flex gap-2 text-sm text-gray-600 items-center">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{job.location}</span>
                </div>

                {distanceString && (
                    <p className="text-indigo-600 text-sm font-semibold">{distanceString}</p>
                )}

                {/* Quality & Suggestions */}
                {(qualityCourses || suggestions) && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {qualityCourses && (
                            <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                                <MessageCircle size={12} />
                                Quality courses
                            </div>
                        )}
                        {suggestions && (
                            <span className="text-xs text-gray-500">{suggestions} Suggestions</span>
                        )}
                    </div>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{job.description}</p>

                {/* Category Badge */}
                <div className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full self-start font-semibold">
                    <CheckCircle size={10} />
                    Home Tuition
                </div>

                {/* Rating and Badges */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="fill-yellow-400 text-yellow-400" size={14} />
                            <span className="font-semibold">{rating.toFixed(1)}</span>
                            {userRatingsTotal && (
                                <span className="text-gray-500 text-sm">({userRatingsTotal})</span>
                            )}
                        </div>
                    )}

                    {badges.map((badge: string, idx: number) => (
                        <div
                            key={idx}
                            className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded ${getBadgeStyles(badge)}`}
                        >
                            <BadgeIcon badge={badge} />
                            {badge}
                        </div>
                    ))}
                </div>

                {/* Services */}
                {services.length > 0 && (
                    <div className="pt-2">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                            Services & Features:
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {services.slice(0, 3).map((service, idx) => (
                                <span
                                    key={idx}
                                    className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded font-medium"
                                >
                                    <CheckCircle size={10} />
                                    {service}
                                </span>
                            ))}
                            {services.length > 3 && (
                                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-medium">
                                    +{services.length - 3} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 mt-auto">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const lat = job.jobData?.geometry?.location?.lat;
                            const lng = job.jobData?.geometry?.location?.lng;
                            if (lat && lng) {
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
                            }
                        }}
                        className="flex-1 border-2 border-sky-500 text-sky-600 py-2 rounded-lg flex justify-center items-center gap-2 font-semibold hover:bg-sky-50 transition"
                    >
                        <Navigation size={16} />
                        Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (phone) window.open(`tel:${phone}`, "_self");
                        }}
                        className={`flex-1 border-2 flex justify-center items-center gap-2 py-2 rounded-lg font-semibold transition ${phone
                            ? "border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                            : "border-gray-300 text-gray-400 cursor-not-allowed"
                            }`}
                        disabled={!phone}
                    >
                        <Phone size={16} />
                        Call
                    </button>
                </div>

                {/* Response Time */}
                {responseTime && (
                    <div className="flex items-center justify-center gap-2 bg-sky-50 text-sky-600 text-xs font-semibold px-3 py-2 rounded-lg">
                        <Clock size={12} />
                        {responseTime}
                    </div>
                )}
            </div>
        </div>
    );
};

const NearbyTuitions: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_TUITIONS.map((tuition) => (
                    <SingleTuitionCard
                        key={tuition.id}
                        job={tuition}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleTuitionCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyTuitions;
