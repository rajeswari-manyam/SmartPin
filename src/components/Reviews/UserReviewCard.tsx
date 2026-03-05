import React from "react";
import { Pencil, Trash2 } from "lucide-react";
import { ReviewData } from "../../services/api.service";
import Stars from "./Stars";
import RatingBadge from "./RatingBadge";
import { fmtDate } from "../../utils/ReviewHelper";

const UserReviewCard: React.FC<{
    review:   ReviewData;
    userName: string;
    onEdit:   (r: ReviewData) => void;
    onDelete: (id: string) => void;
}> = ({ review, userName, onEdit, onDelete }) => (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#00598a" }}
                >
                    <span className="text-white text-sm font-bold">
                        {userName?.[0]?.toUpperCase() || "Y"}
                    </span>
                </div>
                <span className="text-base font-bold" style={{ color: "#00598a" }}>
                    Your Review
                </span>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(review)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition text-sm font-semibold text-gray-700 active:scale-95"
                >
                    <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                    onClick={() => onDelete(review._id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 transition text-sm font-semibold text-red-600 active:scale-95"
                >
                    <Trash2 className="w-4 h-4" /> Delete
                </button>
            </div>
        </div>

        {/* Body */}
        <div className="px-4 py-4 bg-blue-50">
            <div className="flex items-center justify-between mb-2.5 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <Stars value={review.rating} size="sm" />
                    <RatingBadge value={review.rating} />
                </div>
                <span className="text-sm text-gray-400">{fmtDate(review.createdAt)}</span>
            </div>
            <p className="text-base text-gray-700 leading-relaxed">{review.review}</p>
        </div>
    </div>
);

export default UserReviewCard;