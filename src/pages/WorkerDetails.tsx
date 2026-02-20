import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Star, Phone, MessageCircle, Briefcase, ArrowLeft,
    MapPin, Calendar, Loader2, ChevronLeft, ChevronRight,
    Clock, Tag, Image as ImageIcon, X
} from 'lucide-react';
import Button from '../components/ui/Buttons';
import { getWorkerSkillById, API_BASE_URL } from '../services/api.service';

interface WorkerSkill {
    _id: string;
    userId: string;
    workerId: string;
    name: string;
    category: string[];
    subCategory: string;
    skill: string;
    serviceCharge: number;
    chargeType: 'hour' | 'day' | 'fixed';
    profilePic: string;
    images: string[];
    area: string;
    city: string;
    state: string;
    pincode: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
}

// ── resolve relative paths from backend ─────────────────────────────────────
const resolveImageUrl = (path: string): string | null => {
    if (!path || typeof path !== 'string') return null;
    const cleaned = path.trim();
    if (!cleaned) return null;
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) return cleaned;
    const base = (API_BASE_URL || '').replace(/\/$/, '');
    const rel = cleaned.replace(/\\/g, '/');
    return `${base}${rel.startsWith('/') ? rel : '/' + rel}`;
};

// ── Shared image carousel (arrows + dots + counter) ──────────────────────────
const ImageCarousel: React.FC<{ images: string[]; alt?: string; height?: string }> = ({
    images, alt = 'image', height = 'h-56 md:h-72'
}) => {
    const [idx, setIdx] = useState(0);
    const [imgError, setImgError] = useState(false);

    useEffect(() => { setIdx(0); setImgError(false); }, [images]);

    const resolved = images.map(resolveImageUrl).filter(Boolean) as string[];

    if (!resolved.length || imgError) {
        return (
            <div className={`w-full ${height} flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl`}>
                <ImageIcon size={40} className="text-blue-300" />
            </div>
        );
    }

    const prev = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIdx(i => (i - 1 + resolved.length) % resolved.length);
    };
    const next = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIdx(i => (i + 1) % resolved.length);
    };

    return (
        <div className={`relative w-full ${height} overflow-hidden rounded-xl bg-gray-100 group`}>
            <img
                src={resolved[idx]}
                alt={`${alt} ${idx + 1}`}
                className="w-full h-full object-cover transition-opacity duration-200"
                onError={() => {
                    if (idx < resolved.length - 1) setIdx(i => i + 1);
                    else setImgError(true);
                }}
            />

            {resolved.length > 1 && (
                <>
                    {/* Left arrow */}
                    <button
                        onClick={prev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65
                            text-white rounded-full w-8 h-8 flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {/* Right arrow */}
                    <button
                        onClick={next}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/65
                            text-white rounded-full w-8 h-8 flex items-center justify-center
                            opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                        <ChevronRight size={16} />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {resolved.map((_, i) => (
                            <button
                                key={i}
                                onClick={e => { e.stopPropagation(); setIdx(i); }}
                                className={`h-1.5 rounded-full transition-all duration-200
                                    ${i === idx ? 'bg-white w-4' : 'bg-white/55 w-1.5'}`}
                            />
                        ))}
                    </div>

                    {/* Counter badge */}
                    <div className="absolute bottom-3 right-3 bg-black/55 text-white text-xs
                        px-2 py-0.5 rounded-full font-medium">
                        {idx + 1}/{resolved.length}
                    </div>
                </>
            )}
        </div>
    );
};

const WorkerDetails: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [worker, setWorker] = useState<WorkerSkill | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchWorkerDetails = async () => {
            if (!id) { setError('Worker ID not found'); setLoading(false); return; }
            try {
                const response = await getWorkerSkillById(id);
                if (response.success && response.workerSkill) {
                    setWorker(response.workerSkill);
                } else {
                    setError('Failed to load worker details');
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load worker details');
            } finally {
                setLoading(false);
            }
        };
        fetchWorkerDetails();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="text-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
                <p className="text-sm text-gray-600">Loading worker details...</p>
            </div>
        </div>
    );

    if (error || !worker) return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center max-w-md">
                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">❌</span>
                </div>
                <h2 className="text-lg font-bold mb-2">Error Loading Worker</h2>
                <p className="text-sm text-gray-600 mb-4">{error || 'Worker not found'}</p>
                <Button onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        </div>
    );

    const initials = worker.name.split(' ').map(n => n[0]).join('').toUpperCase();
    const memberSince = new Date(worker.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    const chargeLabel = worker.chargeType === 'hour' ? 'Per Hour' : worker.chargeType === 'day' ? 'Per Day' : 'Fixed Price';
    const displayImage = worker.profilePic || worker.images?.[0] || null;
    const portfolioImages = worker.images?.filter(img => img && img.trim() !== '') || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-3 md:p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">

                {/* Header */}
                <div className="flex items-center mb-4 md:mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-lg md:text-2xl font-bold ml-3">Worker Profile</h1>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 text-center mb-4">
                    {displayImage ? (
                        <img src={resolveImageUrl(displayImage) || displayImage} alt={worker.name}
                            className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full object-cover mb-3 border-4 border-blue-100" />
                    ) : (
                        <div className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold mb-3">
                            {initials}
                        </div>
                    )}
                    <h1 className="text-xl md:text-2xl font-bold text-gray-800">{worker.name}</h1>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 mt-2">
                        ✓ Available
                    </span>
                    <div className="flex justify-center items-center gap-1.5 text-gray-600 mt-3 text-sm">
                        <MapPin size={13} className="flex-shrink-0" />
                        <span>{worker.area}, {worker.city}, {worker.state} - {worker.pincode}</span>
                    </div>
                    <div className="flex justify-center items-center gap-1.5 text-gray-500 mt-1.5 text-xs">
                        <Calendar size={11} />
                        <span>Member since {memberSince}</span>
                    </div>
                </div>

                {/* ✅ Portfolio with left/right arrow carousel */}
                {portfolioImages.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4">
                        <div className="flex items-center gap-2 mb-3">
                            <ImageIcon size={16} className="text-blue-600" />
                            <h2 className="text-base md:text-lg font-bold">Portfolio</h2>
                            <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {portfolioImages.length} photo{portfolioImages.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <ImageCarousel images={portfolioImages} alt={worker.name} height="h-56 md:h-72" />
                    </div>
                )}

                {/* Service Categories */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4">
                    <h2 className="text-base md:text-lg font-bold mb-3">Service Categories</h2>
                    <div className="flex flex-wrap gap-2">
                        {worker.category.map((cat, idx) => (
                            <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full font-medium text-sm">
                                <Tag size={11} />{cat}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4">
                    <h2 className="text-base md:text-lg font-bold mb-3">Skills & Specialization</h2>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                            <Star size={15} className="text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Subcategory</p>
                                <p className="text-gray-700 text-sm">{worker.subCategory}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                            <Briefcase size={15} className="text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-semibold text-gray-900 text-sm">Primary Skill</p>
                                <p className="text-gray-700 text-sm">{worker.skill}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rates */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4">
                    <h2 className="text-base md:text-lg font-bold mb-3">Service Rates</h2>
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl mb-2">
                        <div className="flex items-center gap-2 text-gray-700 text-sm">
                            <Clock size={14} className="text-blue-500" />
                            <span>Charge Type</span>
                        </div>
                        <strong className="text-blue-700 text-sm">{chargeLabel}</strong>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                        <span className="text-gray-700 text-sm">Service Charge</span>
                        <div>
                            <strong className="text-green-700 text-lg">₹{worker.serviceCharge}</strong>
                            <span className="text-gray-500 text-xs ml-1">
                                / {worker.chargeType === 'hour' ? 'hr' : worker.chargeType === 'day' ? 'day' : 'project'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-4">
                    <h2 className="text-base md:text-lg font-bold mb-3">Location Details</h2>
                    <div className="space-y-1.5 text-gray-700 text-sm">
                        <p><strong>Area:</strong> {worker.area}</p>
                        <p><strong>City:</strong> {worker.city}</p>
                        <p><strong>State:</strong> {worker.state}</p>
                        <p><strong>Pincode:</strong> {worker.pincode}</p>
                        <p className="text-xs text-gray-500">
                            <strong>Coordinates:</strong> {worker.latitude?.toFixed(4)}, {worker.longitude?.toFixed(4)}
                        </p>
                    </div>
                    {worker.latitude && worker.longitude && (
                        <button
                            onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${worker.latitude},${worker.longitude}`, '_blank')}
                            className="mt-3 w-full py-2 border border-blue-300 text-blue-600 rounded-xl text-xs hover:bg-blue-50 transition-colors"
                        >
                            📍 Open in Google Maps
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <Button onClick={() => window.location.href = `tel:${worker.userId}`}>
                            <Phone size={15} /><span className="text-sm">Call Worker</span>
                        </Button>
                        <Button onClick={() => navigate(`/chat/${worker._id}`)}>
                            <MessageCircle size={15} /><span className="text-sm">Message</span>
                        </Button>
                    </div>
                    <Button variant="success" className="w-full mb-2" onClick={() => navigate(`/send-enquiry/${worker._id}`)}>
                        <Briefcase size={15} /><span className="text-sm">Send Job Invitation</span>
                    </Button>
                    <button
                        onClick={() => navigate(`/edit-skill/${worker._id}`)}
                        className="w-full px-4 py-2.5 text-blue-600 border border-blue-600 rounded-xl hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                        Edit This Skill
                    </button>
                </div>

            </div>
        </div>
    );
};

export default WorkerDetails;
