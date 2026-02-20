import React, { useState } from "react";
import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Buttons";
import typography from "../styles/typography";

/* ================= TYPES ================= */

interface AspectRating {
    name: string;
    rating: number;
}

/* ================= STAR RATING COMPONENT ================= */

interface StarRatingProps {
    rating: number;
    onRate: (rating: number) => void;
    size?: "large" | "small";
    hoverable?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onRate,
    size = "large",
    hoverable = true,
}) => {
    const [hover, setHover] = useState(0);
    const starSize = size === "large" ? 40 : 24;

    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRate(star)}
                    onMouseEnter={() => hoverable && setHover(star)}
                    onMouseLeave={() => hoverable && setHover(0)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                >
                    <Star
                        size={starSize}
                        className={`transition-colors ${star <= (hover || rating)
                                ? "fill-orange-400 text-orange-400"
                                : "fill-none text-gray-300"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};

/* ================= MAIN COMPONENT ================= */

const FeedbackForm: React.FC = () => {
    const navigate = useNavigate();

    const [overallRating, setOverallRating] = useState(0);
    const [review, setReview] = useState("");

    const [aspectRatings, setAspectRatings] = useState<AspectRating[]>([
        { name: "Professionalism", rating: 0 },
        { name: "Quality of Work", rating: 0 },
        { name: "Timeliness", rating: 0 },
        { name: "Value for Money", rating: 0 },
    ]);

    const handleAspectRating = (index: number, rating: number) => {
        const updated = [...aspectRatings];
        updated[index].rating = rating;
        setAspectRatings(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log({
            overallRating,
            review,
            aspectRatings,
        });

        navigate("/thank-you/123"); // replace 123 with real ID
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-6 font-['Outfit']">
            <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-10 border border-slate-200">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* ================= HEADER ================= */}
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-4xl shadow-xl mb-6">
                            RK
                        </div>

                        <h1 className={`${typography.heading.h3} text-slate-900`}>
                            How was your service?
                        </h1>

                        <p className={`${typography.body.base} text-slate-600 mt-2`}>
                            Rate Ramesh Kumar
                        </p>

                        <div className="mt-6">
                            <StarRating
                                rating={overallRating}
                                onRate={setOverallRating}
                                size="large"
                            />
                            <p className="text-sm text-slate-500 mt-3">Tap to rate</p>
                        </div>
                    </div>

                    {/* ================= REVIEW ================= */}
                    <div>
                        <label className={`${typography.form.label} text-slate-900`}>
                            Write a Review (Optional)
                        </label>

                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            rows={5}
                            placeholder="Share your experience with other customers..."
                            className="mt-3 w-full px-5 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                        />
                    </div>

                    {/* ================= ASPECT RATINGS ================= */}
                    <div>
                        <h3 className={`${typography.heading.h6} mb-4`}>
                            Rate Specific Aspects
                        </h3>

                        <div className="border border-slate-200 rounded-2xl p-6 space-y-5">
                            {aspectRatings.map((aspect, index) => (
                                <div
                                    key={aspect.name}
                                    className="flex items-center justify-between pb-4 border-b last:border-none"
                                >
                                    <span className={`${typography.body.base}`}>
                                        {aspect.name}
                                    </span>

                                    <StarRating
                                        rating={aspect.rating}
                                        onRate={(rating) =>
                                            handleAspectRating(index, rating)
                                        }
                                        size="small"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ================= SUBMIT ================= */}
                    <Button
                        type="submit"
                        variant="gradient-blue"
                        size="lg"
                        fullWidth
                    >
                        Submit Review
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
