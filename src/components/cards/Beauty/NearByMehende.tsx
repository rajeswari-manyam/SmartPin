/**
 * ============================================================================
 * NearbyMehendiCard.tsx - Detailed Mehendi Artist Card Component
 * ============================================================================
 * 
 * Displays detailed mehendi artist information with:
 * - Large image carousel
 * - Full description
 * - Services offered
 * - Action buttons (Directions, Call)
 * - Special badges (Trending, Top Rated, Quick Response)
 * 
 * @component NearbyMehendiCard
 * @version 1.0.0 - React Web Version styled like NearbyHotelsCard
 */

import React, { useState, useCallback } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    MapPin,
    Phone,
    Navigation,
    Star,
    Clock,
    CheckCircle,
    Sparkles,
    TrendingUp,
    Zap,
} from 'lucide-react';

/* ================= TYPES ================= */

export interface JobType {
    id: string;
    title?: string;
    location?: string;
    description?: string;
    jobData?: any;
}

interface NearbyMehendiCardProps {
    job: JobType;
    onViewDetails: (job: JobType) => void;
}

/* ================= CONSTANTS ================= */

const PHONE_NUMBERS_MAP: Record<string, string> = {
    mehendi_1: '09876543210',
    mehendi_2: '09876543211',
    mehendi_3: '09876543212',
    mehendi_4: '09876543213',
};

const MEHENDI_IMAGES_MAP: Record<string, string[]> = {
    mehendi_1: [
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
        'https://images.unsplash.com/photo-1599898612656-2e32c0c21c8b?w=800',
        'https://images.unsplash.com/photo-1608193444970-3bdfbe880e46?w=800',
    ],
    mehendi_2: [
        'https://images.unsplash.com/photo-1608193444970-3bdfbe880e46?w=800',
        'https://images.unsplash.com/photo-1609153662720-1c1e96b9de7a?w=800',
    ],
    mehendi_3: [
        'https://images.unsplash.com/photo-1623091097695-5bd5b4e0a9f3?w=800',
        'https://images.unsplash.com/photo-1599898612656-2e32c0c21c8b?w=800',
    ],
    mehendi_4: [
        'https://images.unsplash.com/photo-1599898612656-2e32c0c21c8b?w=800',
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800',
    ],
};

const MEHENDI_DESCRIPTIONS_MAP: Record<string, string> = {
    mehendi_1: 'Top-rated mehendi artist with 4.8★ rating. Professional mehendi artist with over 10 years of experience. Specializes in bridal mehendi, Arabic designs, and traditional patterns. Perfect for weddings and special occasions.',
    mehendi_2: 'Trending artist with 4.5★ rating and quick response time. Expert in intricate designs and quick response time. Offers both traditional and modern mehendi styles for all occasions.',
    mehendi_3: 'Top Rated mehendi artist with 4.9★ rating. Known for detailed work and creative designs. Perfect for weddings and special occasions with excellent customer service.',
    mehendi_4: 'Popular mehendi artist with 4.6★ rating. Expertise in Arabic and Indo-Arabic fusion designs. Specializes in bridal and party mehendi with beautiful intricate patterns.',
};

export const DUMMY_MEHENDI_ARTISTS = [
    {
        id: 'mehendi_1',
        title: 'Elegant Mehendi Art',
        location: 'Banjara Hills, Hyderabad',
    },
    {
        id: 'mehendi_2',
        title: 'Royal Mehendi Designs',
        location: 'Jubilee Hills, Hyderabad',
    },
    {
        id: 'mehendi_3',
        title: 'Bridal Mehendi Specialist',
        location: 'Gachibowli, Hyderabad',
    },
    {
        id: 'mehendi_4',
        title: 'Creative Henna Art',
        location: 'Madhapur, Hyderabad',
    },
];

/* ================= COMPONENT ================= */

const SingleMehendiCard: React.FC<NearbyMehendiCardProps> = ({ job, onViewDetails }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageError, setImageError] = useState(false);

    // Get all available photos - Using useCallback like NearbyHotelsCard
    const getPhotos = useCallback(() => {
        const jobId = job.id || 'mehendi_1';
        return MEHENDI_IMAGES_MAP[jobId] || MEHENDI_IMAGES_MAP['mehendi_1'];
    }, [job.id]);

    const photos = getPhotos();
    const hasPhotos = photos.length > 0;
    const currentPhoto = hasPhotos ? photos[currentImageIndex] : null;

    // Navigate to previous image - Using useCallback like NearbyHotelsCard
    const handlePrevImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex > 0) {
                setCurrentImageIndex((prev) => prev - 1);
            }
        },
        [hasPhotos, currentImageIndex]
    );

    // Navigate to next image - Using useCallback like NearbyHotelsCard
    const handleNextImage = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasPhotos && currentImageIndex < photos.length - 1) {
                setCurrentImageIndex((prev) => prev + 1);
            }
        },
        [hasPhotos, currentImageIndex, photos.length]
    );

    // Get name - Using useCallback like NearbyHotelsCard
    const getName = useCallback((): string => {
        return job.title || 'Mehendi Artist';
    }, [job.title]);

    // Get location - Using useCallback like NearbyHotelsCard
    const getLocation = useCallback((): string => {
        return job.location || job.description || 'Location';
    }, [job.location, job.description]);

    // Get distance - Using useCallback like NearbyHotelsCard
    const getDistance = useCallback((): string => {
        const jobData = job.jobData as any;
        if (jobData?.distance_text) {
            return jobData.distance_text;
        }
        return '';
    }, [job.jobData]);

    // Get description - Using useCallback like NearbyHotelsCard
    const getDescription = useCallback((): string => {
        const jobId = job.id || 'mehendi_1';
        return MEHENDI_DESCRIPTIONS_MAP[jobId] || job.description || 'Professional mehendi artist';
    }, [job.id, job.description]);

    // Get rating - Using useCallback like NearbyHotelsCard
    const getRating = useCallback((): number | null => {
        const jobData = job.jobData as any;
        return jobData?.rating || null;
    }, [job.jobData]);

    // Get user ratings total - Using useCallback like NearbyHotelsCard
    const getUserRatingsTotal = useCallback((): number | null => {
        const jobData = job.jobData as any;
        return jobData?.user_ratings_total || null;
    }, [job.jobData]);

    // Get opening status - Using useCallback like NearbyHotelsCard
    const getOpeningStatus = useCallback((): string | null => {
        const jobData = job.jobData as any;
        const isOpen = jobData?.opening_hours?.open_now;
        if (isOpen === undefined || isOpen === null) {
            return null;
        }
        return isOpen ? 'Available Now' : 'Closed';
    }, [job.jobData]);

    // Get special tags - Using useCallback like NearbyHotelsCard
    const getSpecialTags = useCallback((): string[] => {
        const jobData = job.jobData as any;
        return jobData?.special_tags || [];
    }, [job.jobData]);

    // Get services/amenities - Using useCallback like NearbyHotelsCard
    const getServices = useCallback((): string[] => {
        const jobData = job.jobData as any;
        return jobData?.amenities || ['Bridal Mehendi', 'Arabic Designs', 'Traditional Patterns', 'Party Mehendi'];
    }, [job.jobData]);

    // Get special offers - Using useCallback like NearbyHotelsCard
    const getSpecialOffers = useCallback((): string | null => {
        const jobData = job.jobData as any;
        return jobData?.special_offers || null;
    }, [job.jobData]);

    // Get phone number - Using useCallback like NearbyHotelsCard
    const getPhoneNumber = useCallback((): string | null => {
        const jobId = job.id || '';
        return PHONE_NUMBERS_MAP[jobId] || null;
    }, [job.id]);

    // Handle call button press - Using useCallback like NearbyHotelsCard
    const handleCall = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const phoneNumber = getPhoneNumber();
            const name = getName();

            if (!phoneNumber) {
                alert(`No contact number available for ${name}.`);
                return;
            }

            const formattedNumber = phoneNumber.replace(/[^0-9+]/g, '');
            const telUrl = `tel:${formattedNumber}`;
            window.location.href = telUrl;
        },
        [getPhoneNumber, getName]
    );

    // Handle directions button press - Using useCallback like NearbyHotelsCard
    const handleDirections = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            const jobData = job.jobData as any;
            const lat = jobData?.geometry?.location?.lat;
            const lng = jobData?.geometry?.location?.lng;

            if (!lat || !lng) {
                alert('Unable to get location coordinates for directions.');
                return;
            }

            const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&destination_place_id=${job.id || ''}`;
            window.open(googleMapsUrl, '_blank');
        },
        [job.jobData, job.id]
    );

    // Handle image loading error - Using useCallback like NearbyHotelsCard
    const handleImageError = useCallback(() => {
        console.warn('⚠️ Failed to load image for mehendi artist:', job?.id || 'unknown');
        setImageError(true);
    }, [job?.id]);

    // Compute derived values
    const rating = getRating();
    const userRatingsTotal = getUserRatingsTotal();
    const openingStatus = getOpeningStatus();
    const distance = getDistance();
    const description = getDescription();
    const specialTags = getSpecialTags();
    const services = getServices();
    const specialOffers = getSpecialOffers();
    const visibleServices = services.slice(0, 4);
    const moreServices = services.length > 4 ? services.length - 4 : 0;
    const hasPhoneNumber = getPhoneNumber() !== null;

    return (
        <div
            onClick={() => onViewDetails(job)}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 cursor-pointer hover:scale-[0.99] mb-4"
        >
            {/* Image Carousel */}
            <div className="relative h-48 bg-gray-100">
                {currentPhoto && !imageError ? (
                    <>
                        <img
                            src={currentPhoto}
                            className="w-full h-full object-cover"
                            alt={getName()}
                            onError={handleImageError}
                        />

                        {/* Image Navigation Arrows */}
                        {hasPhotos && photos.length > 1 && (
                            <>
                                {currentImageIndex > 0 && (
                                    <button
                                        onClick={handlePrevImage}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                )}

                                {currentImageIndex < photos.length - 1 && (
                                    <button
                                        onClick={handleNextImage}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                )}

                                {/* Image Counter */}
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                                    {currentImageIndex + 1} / {photos.length}
                                </div>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                        <Sparkles size={48} className="text-gray-400" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3.5">
                {/* Artist Name */}
                <h3 className="text-[17px] font-bold text-gray-900 mb-1.5 leading-snug line-clamp-2">
                    {getName()}
                </h3>

                {/* Location */}
                <div className="flex items-center text-gray-500 mb-1">
                    <MapPin size={14} className="mr-1 flex-shrink-0" />
                    <span className="text-[13px] line-clamp-1">{getLocation()}</span>
                </div>

                {/* Distance */}
                {distance && (
                    <p className="text-xs font-semibold text-purple-600 mb-2">{distance}</p>
                )}

                {/* Special Tags */}
                {specialTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {specialTags.map((tag, index) => {
                            let bgClass = 'bg-purple-100';
                            let textClass = 'text-purple-800';
                            let Icon = Sparkles;

                            if (tag === 'Trending') {
                                bgClass = 'bg-red-100';
                                textClass = 'text-red-800';
                                Icon = TrendingUp;
                            } else if (tag === 'Top Rated') {
                                bgClass = 'bg-amber-100';
                                textClass = 'text-amber-800';
                                Icon = Star;
                            } else if (tag === 'Quick Response') {
                                bgClass = 'bg-purple-100';
                                textClass = 'text-purple-800';
                                Icon = Zap;
                            }

                            return (
                                <span
                                    key={index}
                                    className={`inline-flex items-center ${bgClass} ${textClass} text-[10px] font-semibold px-2 py-1 rounded gap-1`}
                                >
                                    <Icon size={10} />
                                    {tag}
                                </span>
                            );
                        })}
                    </div>
                )}

                {/* Description */}
                <p className="text-[13px] text-gray-600 leading-relaxed mb-2.5 line-clamp-3">
                    {description}
                </p>

                {/* Special Offers */}
                {specialOffers && (
                    <div className="flex items-center gap-1.5 mb-2 px-2 py-1.5 bg-red-50 rounded-md">
                        <Clock size={12} className="text-red-600 flex-shrink-0" />
                        <span className="text-[11px] text-red-700 font-medium">{specialOffers}</span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 text-[11px] font-semibold px-2 py-1 rounded-xl mb-2">
                    <Sparkles size={12} />
                    <span>Mehendi Artist</span>
                </div>

                {/* Rating and Status Row */}
                <div className="flex items-center gap-2 mb-2.5">
                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={13} className="text-yellow-400 fill-yellow-400" />
                            <span className="text-[13px] font-semibold text-gray-900">
                                {rating.toFixed(1)}
                            </span>
                            {userRatingsTotal && (
                                <span className="text-xs text-gray-500">({userRatingsTotal})</span>
                            )}
                        </div>
                    )}

                    {openingStatus && (
                        <div
                            className={`flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded ${openingStatus.includes('Available')
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}
                        >
                            <Clock size={11} />
                            <span>{openingStatus}</span>
                        </div>
                    )}
                </div>

                {/* Services */}
                <div className="mb-3">
                    <p className="text-[10px] font-bold text-gray-500 tracking-wide mb-1.5">
                        SERVICES:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {visibleServices.map((service, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 bg-purple-100 text-purple-600 text-[11px] font-medium px-2 py-1 rounded"
                            >
                                <CheckCircle size={11} />
                                <span>{service}</span>
                            </span>
                        ))}
                        {moreServices > 0 && (
                            <span className="inline-flex items-center bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded">
                                +{moreServices} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={handleDirections}
                        className="flex-1 flex items-center justify-center gap-1 border-2 border-purple-600 bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95"
                    >
                        <Navigation size={14} />
                        <span>Directions</span>
                    </button>

                    <button
                        onClick={handleCall}
                        disabled={!hasPhoneNumber}
                        className={`flex-1 flex items-center justify-center gap-1 border-2 font-bold text-xs py-2.5 rounded-lg transition-all active:scale-95 ${hasPhoneNumber
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                            : 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Phone size={14} />
                        <span>Call</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

interface NearbyMehendiContainerProps {
    job?: JobType;
    nearbyData?: any[]; // Allow processing passed data if needed in future
    onViewDetails: (job: JobType) => void;
}

const NearbyMehendiCard: React.FC<NearbyMehendiContainerProps> = (props) => {
    // If no job is passed, render a list of dummy mehendi artists
    if (!props.job) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DUMMY_MEHENDI_ARTISTS.map((artist) => (
                    <SingleMehendiCard
                        key={artist.id}
                        job={artist}
                        onViewDetails={props.onViewDetails}
                    />
                ))}
            </div>
        );
    }

    // Otherwise render the single card
    return <SingleMehendiCard job={props.job} onViewDetails={props.onViewDetails} />;
};

export default NearbyMehendiCard;
