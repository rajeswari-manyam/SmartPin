import React from "react";
import { ReviewData } from "../../services/api.service";
import Stars from "./Stars";
import { avatarColor, fmtDate } from "../../utils/ReviewHelper";

const ReviewsCard: React.FC<{ review: ReviewData & { resolvedName?: string } }> = ({ review }) => {
    const name = review.resolvedName
        || (typeof review.user === "object" ? (review.user as any)?.name || "Anonymous" : "Anonymous");
    const initial = name[0]?.toUpperCase();
    const color = avatarColor(name);

    return (
        <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5 flex items-start gap-4">
            {/* Avatar */}
            <div
                className="rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-sm"
                style={{ backgroundColor: color, width: 52, height: 52 }}
            >
                {initial}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                    <p className="text-lg font-semibold text-gray-800 truncate">
                        {name}
                    </p>
                    <Stars value={review.rating} size="md" />
                </div>
                <p className="text-base text-gray-600 line-clamp-3 leading-relaxed">
                    {review.review}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                    {fmtDate(review.createdAt)}
                </p>
            </div>
        </div>
    );
};

export default ReviewsCard;