import React from "react";
import { Star } from "lucide-react";
import { ReviewData } from "../../services/api.service";
import Stars from "./Stars";

const RatingSummary: React.FC<{ reviews: ReviewData[] }> = ({ reviews }) => {
    const avg = reviews.length
        ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const breakdown = [5, 4, 3, 2, 1].map(n => ({
        star:  n,
        count: reviews.filter(r => r.rating === n).length,
    }));
    const maxCount = Math.max(...breakdown.map(b => b.count), 1);

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-4">

                {/* Big number */}
                <div className="flex flex-col items-center flex-shrink-0 w-28">
                    <span className="text-6xl font-black leading-none" style={{ color: "#00598a" }}>
                        {avg.toFixed(1)}
                    </span>
                    <div className="mt-2">
                        <Stars value={Math.round(avg)} size="sm" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5 text-center">
                        {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Divider */}
                <div className="w-px self-stretch bg-gray-100 flex-shrink-0" />

                {/* Breakdown bars */}
                <div className="flex-1 space-y-2 min-w-0">
                    {breakdown.map(({ star, count }) => (
                        <div key={star} className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 w-3 text-right flex-shrink-0">{star}</span>
                            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                            <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: "#00598a" }}
                                />
                            </div>
                            <span className="text-sm text-gray-500 w-4 flex-shrink-0">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RatingSummary;