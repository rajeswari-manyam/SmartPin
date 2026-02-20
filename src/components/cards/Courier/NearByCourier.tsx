import React, { useState, useMemo } from "react";
import { MapPin, Phone, Navigation, ChevronLeft, ChevronRight, Star, Clock, CheckCircle, Package } from "lucide-react";

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

const COURIER_SERVICES = ["Domestic Courier", "International Courier", "Express Delivery", "Cargo Services"];

const PHONE_MAP: Record<string, string> = {
    courier_1: "07942694974",
    courier_2: "07947139264",
    courier_3: "07947127830",
    courier_4: "07947422929",
};

const IMAGES_MAP: Record<string, string[]> = {
    courier_1: [
        "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800",
        "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800",
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
    ],
    courier_2: [
        "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800",
        "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800",
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
    ],
    courier_3: [
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
        "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800",
        "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800",
    ],
    courier_4: [
        "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?w=800",
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800",
        "https://images.unsplash.com/photo-1607400201889-565b1ee75f8e?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_COURIERS: JobType[] = [
    {
        id: "courier_1",
        title: "Courier Office - Trackon Hub Delhi",
        location: "RAGHUBARPURA NO.1 Gandhi Nagar Bazar, Delhi",
        distance: 2.3,
        category: "Courier Office",
        description: "Reliable domestic courier services with fast delivery and tracking.",
        jobData: {
            rating: 4.8,
            user_ratings_total: 2,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 28.6692, lng: 77.2314 } },
            closing_time: "20:00",
            phone: PHONE_MAP.courier_1,
            special_tags: ["Trending"],
            services: ["Domestic Courier"],
        }
    },
    {
        id: "courier_2",
        title: "Icl Couriers Booking Office",
        location: "18495 1/A 4th St Patigadda Hyderabad Begumpet, Hyderabad",
        distance: 5.4,
        category: "Courier Office",
        description: "Professional courier booking services for domestic and international shipments.",
        jobData: {
            rating: 4.3,
            user_ratings_total: 8,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4316, lng: 78.4609 } },
            closing_time: "19:30",
            phone: PHONE_MAP.courier_2,
            special_tags: [],
            services: ["Courier Services"],
        }
    },
    {
        id: "courier_3",
        title: "Icl Courier Kukatpally Branch Office",
        location: "Kphb KPHB Colony, Hyderabad",
        distance: 7.2,
        category: "Courier Office",
        description: "Trusted courier services with domestic and corporate courier solutions.",
        jobData: {
            rating: 4.4,
            user_ratings_total: 5,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4944, lng: 78.3906 } },
            closing_time: "20:00",
            phone: PHONE_MAP.courier_3,
            special_tags: ["Trending"],
            services: ["Domestic Courier", "Corporate Courier"],
        }
    },
    {
        id: "courier_4",
        title: "Urbandot Couriers & Cargo (Head Office)",
        location: "Manbhum Jade Tower Somajiguda, Hyderabad",
        distance: 7.2,
        category: "Courier Office",
        description: "Premium courier and cargo services for all your shipping needs.",
        jobData: {
            rating: 4.5,
            user_ratings_total: 28,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4239, lng: 78.4738 } },
            closing_time: "21:00",
            phone: PHONE_MAP.courier_4,
            special_tags: [],
            services: ["Domestic Courier"],
        }
    },
];

/* ================= COMPONENT ================= */

const SingleCourierCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => job.jobData?.photos || IMAGES_MAP[job.id] || IMAGES_MAP.courier_1,
        [job.id, job.jobData?.photos]
    );

    const rating = job.jobData?.rating;
    const userRatingsTotal = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const closingTime = job.jobData?.closing_time;
    const phone = job.jobData?.phone || PHONE_MAP[job.id];
    const specialTags = job.jobData?.special_tags || [];
    const services = job.jobData?.services || [];

    // Fallback distance calculation if not provided
    const distanceString = typeof job.distance === "number"
        ? `${job.distance.toFixed(1)} km`
        : job.distance;

    return (
        <div
            className="bg-white rounded-2xl shadow border overflow-hidden cursor-pointer hover:shadow-lg transition-all h-full flex flex-col"
            onClick={() => onViewDetails(job)}
        >
            {/* Image */}
            <div className="relative h-48 shrink-0">
                <img src={photos[index]} className="w-full h-full object-cover" alt={job.title} />

                {index > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIndex(index - 1);
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
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
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white p-2 rounded-full"
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
                <h2 className="text-xl font-bold line-clamp-2">{job.title}</h2>

                <div className="flex items-center gap-3 flex-wrap">
                    {rating && (
                        <div className="flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded">
                            <span className="font-semibold text-sm">{rating.toFixed(1)}</span>
                            <Star className="fill-white text-white" size={12} />
                        </div>
                    )}

                    {userRatingsTotal && (
                        <span className="text-sm text-gray-600">{userRatingsTotal} Ratings</span>
                    )}

                    {specialTags.includes("Trending") && (
                        <div className="flex items-center gap-1 text-orange-600 text-sm">
                            <span>🔥</span>
                            <span className="font-semibold">Trending</span>
                        </div>
                    )}
                </div>

                <div className="flex gap-2 text-sm text-gray-600 items-start">
                    <MapPin size={14} className="shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{job.location}</span>
                </div>

                {distanceString && (
                    <p className="text-gray-600 text-sm">• {distanceString}</p>
                )}

                {services.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {services.map((service: string, idx: number) => (
                            <span key={idx} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded">
                                {service}
                            </span>
                        ))}
                    </div>
                )}

                <p className="text-sm text-gray-600 line-clamp-2 mb-auto">{job.description}</p>

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
                        className="flex-1 border-2 border-indigo-600 text-indigo-700 py-2 rounded-lg flex justify-center gap-2 font-semibold hover:bg-indigo-50"
                    >
                        <Navigation size={16} /> Directions
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (phone) window.open(`tel:${phone}`, "_self");
                        }}
                        className={`flex-1 border-2 flex justify-center gap-2 py-2 rounded-lg font-semibold ${phone ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <Phone size={16} /> Call
                    </button>
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (phone) {
                            const whatsappUrl = `https://wa.me/91${phone.replace(/[^0-9]/g, '')}`;
                            window.open(whatsappUrl, "_blank");
                        }
                    }}
                    className={`w-full border-2 flex justify-center gap-2 py-2 rounded-lg font-semibold ${phone ? 'border-green-600 text-green-700 hover:bg-green-50' : 'border-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                    >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                </button>
            </div>
        </div>
    );
};

const NearbyCourierCard: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
                {DUMMY_COURIERS.map((courier) => (
                    <SingleCourierCard
                        key={courier.id}
                        job={courier}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleCourierCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyCourierCard;
