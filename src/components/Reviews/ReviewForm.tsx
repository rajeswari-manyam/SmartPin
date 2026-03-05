import React from "react";
import Stars from "./Stars"
import { ratingLabel } from "../../utils/ReviewHelper";

const ReviewForm: React.FC<{
    rating:     number;
    reviewText: string;
    isEditing:  boolean;
    onRating:   (v: number) => void;
    onText:     (v: string) => void;
    onSubmit:   () => void;
    onCancel:   () => void;
}> = ({ rating, reviewText, isEditing, onRating, onText, onSubmit, onCancel }) => (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-5">
            {isEditing ? "Edit Your Review" : "Write a Review"}
        </h3>

        {/* Star picker */}
        <div className="flex flex-col items-center gap-2 mb-5 py-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-400 font-medium">Tap to rate</p>
            <Stars value={rating} size="lg" onClick={onRating} />
            <p className="text-base font-bold" style={{ color: "#00598a" }}>
                {ratingLabel(rating)}
            </p>
        </div>

        <textarea
            value={reviewText}
            onChange={e => onText(e.target.value)}
            rows={5}
            placeholder="Share your experience with this worker..."
            className="w-full text-base border border-gray-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 bg-gray-50 transition leading-relaxed"
            style={{ "--tw-ring-color": "#00598a" } as React.CSSProperties}
            onFocus={e => e.target.style.borderColor = "#00598a"}
            onBlur={e  => e.target.style.borderColor = ""}
        />

        <div className="flex gap-3 mt-4">
            <button
                onClick={onSubmit}
                className="flex-1 text-white text-base font-bold py-4 rounded-xl transition active:scale-95 shadow-sm"
                style={{ backgroundColor: "#00598a" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#004a75")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#00598a")}
            >
                {isEditing ? "Update Review" : "Submit Review"}
            </button>
            <button
                onClick={onCancel}
                className="px-5 py-4 border border-gray-200 rounded-xl text-base text-gray-600 hover:bg-gray-50 transition active:scale-95 font-medium"
            >
                Cancel
            </button>
        </div>
    </div>
);

export default ReviewForm;