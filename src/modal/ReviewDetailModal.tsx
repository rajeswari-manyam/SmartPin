import React, { useEffect, useRef } from 'react';
import { X, Star } from 'lucide-react';
import typography from '../styles/typography';

interface ReviewUser {
    _id: string;
    name: string;
    email: string;
    profilePic?: string;
}

interface ReviewData {
    _id: string;
    user: ReviewUser;
    rating: number;
    review: string;
    createdAt: string;
}

interface ReviewDetailModalProps {
    review: ReviewData | null;
    onClose: () => void;
}

const ReviewDetailModal: React.FC<ReviewDetailModalProps> = ({ review, onClose }) => {
    const backdropRef = useRef<HTMLDivElement>(null);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) onClose();
    };

    // Close on Escape key
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!review) return null;

    const { user, rating, review: reviewText, createdAt } = review;

    const formattedDate = new Date(createdAt).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
    });

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0"
        >
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-slide-up">

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-3">
                    <h2 className={`${typography.heading.h5} text-gray-900`}>Review Details</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition active:scale-95"
                    >
                        <X className="w-4 h-4 text-gray-600" />
                    </button>
                </div>

                <div className="px-5 pb-6 space-y-4">

                    {/* Reviewer profile */}
                    <div className="flex items-center gap-3 bg-gray-50 rounded-2xl p-4">
                        {user.profilePic ? (
                            <img
                                src={user.profilePic}
                                alt={user.name}
                                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-[#00598a] flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-xl font-bold">
                                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </span>
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className={`${typography.heading.h6} text-gray-900 truncate`}>{user.name}</p>
                            <p className={`${typography.body.xs} text-gray-500 truncate`}>{user.email}</p>
                            <p className={`${typography.misc.caption} text-gray-400 mt-0.5`}>{formattedDate}</p>
                        </div>
                    </div>

                    {/* Star rating */}
                    <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map(star => (
                            <Star
                                key={star}
                                className={`w-6 h-6 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
                            />
                        ))}
                        <span className={`ml-1 ${typography.body.xs} font-semibold text-gray-700`}>
                            {rating}/5
                        </span>
                    </div>

                    {/* Review text */}
                    {reviewText ? (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3">
                            <p className={`${typography.body.small} text-gray-700 leading-relaxed`}>
                                "{reviewText}"
                            </p>
                        </div>
                    ) : (
                        <p className={`${typography.body.xs} text-gray-400 italic`}>No written review provided.</p>
                    )}

                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className={`w-full py-3 rounded-2xl bg-[#00598a] text-white ${typography.body.xs} font-semibold hover:bg-[#004a73] transition active:scale-95`}
                    >
                        Close
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes slide-up {
                    from { transform: translateY(40px); opacity: 0; }
                    to   { transform: translateY(0);    opacity: 1; }
                }
                .animate-slide-up { animation: slide-up 0.25s ease-out both; }
            `}</style>
        </div>
    );
};

export default ReviewDetailModal;