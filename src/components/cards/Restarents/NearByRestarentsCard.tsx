import React, { useState, useMemo } from "react";
import { MapPin, Phone, Navigation, ChevronLeft, ChevronRight, Star, Clock, X, CheckCircle } from "lucide-react";

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

const RESTAURANT_SERVICES = ["Dine-in", "Takeaway", "Home Delivery", "Catering"];

const PHONE_MAP: Record<string, string> = {
    restaurant_1: "08792480139",
    restaurant_2: "07947125463",
    restaurant_3: "07942700989",
    restaurant_4: "07947423568",
};

const IMAGES_MAP: Record<string, string[]> = {
    restaurant_1: [
        "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=800",
        "https://images.unsplash.com/photo-1630383249896-424e482df921?w=800",
        "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800",
    ],
    restaurant_2: [
        "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800",
        "https://images.unsplash.com/photo-1606491048663-65723db9f8c4?w=800",
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800",
    ],
    restaurant_3: [
        "https://images.unsplash.com/photo-1630409346373-49f3c6b4c72e?w=800",
        "https://images.unsplash.com/photo-1583225214464-9296029427aa?w=800",
        "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=800",
    ],
    restaurant_4: [
        "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800",
        "https://images.unsplash.com/photo-1642821373181-696a54913e93?w=800",
        "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=800",
    ],
};

/* ================= DUMMY DATA ================= */

const DUMMY_RESTAURANTS: JobType[] = [
    {
        id: "restaurant_1",
        title: "Taaza Kitchen",
        location: "100 Feet Road, Madhapur, Hyderabad",
        distance: 1.2, // Derived or placeholder
        category: "Restaurant",
        description: "Authentic South Indian vegetarian restaurant famous for breakfast & meals.",
        jobData: {
            rating: 4.4,
            user_ratings_total: 25108,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.4500, lng: 78.3900 } },
            closing_time: "23:00",
            phone: PHONE_MAP.restaurant_1,
        }
    },
    {
        id: "restaurant_2",
        title: "Telugu Aromas",
        location: "HMT Main Road, IDPL Colony",
        distance: 2.5,
        category: "Restaurant",
        description: "Traditional Telugu meals with rich Andhra flavors.",
        jobData: {
            rating: 3.6,
            user_ratings_total: 179,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5100, lng: 78.4300 } },
            closing_time: "23:45",
            phone: PHONE_MAP.restaurant_2,
        }
    },
    {
        id: "restaurant_3",
        title: "KRITUNGA Restaurant",
        location: "Jeedimetla, Hyderabad",
        distance: 3.0,
        category: "Restaurant",
        description: "Popular Andhra cuisine restaurant with spicy non-veg dishes.",
        jobData: {
            rating: 3.8,
            user_ratings_total: 8909,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5200, lng: 78.4450 } },
            closing_time: "23:00",
            phone: PHONE_MAP.restaurant_3,
        }
    },
    {
        id: "restaurant_4",
        title: "The Biryani House",
        location: "Suchitra Cross Road",
        distance: 4.1,
        category: "Restaurant",
        description: "Hyderabadi biryani & kebabs, perfect for family dining.",
        jobData: {
            rating: 3.7,
            user_ratings_total: 3984,
            opening_hours: { open_now: true },
            geometry: { location: { lat: 17.5480, lng: 78.5100 } },
            closing_time: "23:30",
            phone: PHONE_MAP.restaurant_4,
        }
    },
];

/* ================= COMPONENT ================= */

const SingleRestaurantCard: React.FC<{ job: JobType; onViewDetails: (job: JobType) => void }> = ({ job, onViewDetails }) => {
    const [index, setIndex] = useState(0);

    const photos = useMemo(
        () => job.jobData?.photos || IMAGES_MAP[job.id] || IMAGES_MAP.restaurant_1,
        [job.id, job.jobData?.photos]
    );

    const rating = job.jobData?.rating;
    const userRatingsTotal = job.jobData?.user_ratings_total;
    const isOpen = job.jobData?.opening_hours?.open_now;
    const closingTime = job.jobData?.closing_time;
    const phone = job.jobData?.phone || PHONE_MAP[job.id];

    // Fallback distance calculation if not provided
    const distanceString = typeof job.distance === "number"
        ? `${job.distance.toFixed(1)} km away`
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
                <h2 className="text-xl font-bold line-clamp-1">{job.title}</h2>

                <div className="flex gap-2 text-sm text-gray-600 items-center">
                    <MapPin size={14} className="shrink-0" /> <span className="truncate">{job.location}</span>
                </div>

                {distanceString && (
                    <p className="text-green-600 text-sm font-semibold">{distanceString}</p>
                )}

                <p className="text-sm text-gray-600 line-clamp-3 mb-auto">{job.description}</p>

                <div className="flex items-center gap-3 pt-2">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star className="fill-yellow-400 text-yellow-400" size={14} />
                            <span className="font-semibold">{rating}</span>
                            {userRatingsTotal && <span className="text-gray-500">({userRatingsTotal})</span>}
                        </div>
                    )}

                    {isOpen !== undefined && (
                        <div className={`flex items-center gap-2 text-xs font-semibold px-2 py-1 rounded ${isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <Clock size={12} /> {isOpen ? `Open ${closingTime ? `· Closes ${closingTime}` : ''}` : "Closed"}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                    {RESTAURANT_SERVICES.slice(0, 3).map((s) => (
                        <span key={s} className="flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                            <CheckCircle size={10} /> {s}
                        </span>
                    ))}
                </div>

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
            </div>
        </div>
    );
};

const NearbyRestaurants: React.FC<Props> = (props) => {
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_RESTAURANTS.map((r) => (
                    <SingleRestaurantCard
                        key={r.id}
                        job={r}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    return <SingleRestaurantCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyRestaurants;
