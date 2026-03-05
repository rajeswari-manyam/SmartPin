import React from "react";
import { Star } from "lucide-react";

const RatingBadge: React.FC<{ value: number }> = ({ value }) => (
    <span className="inline-flex items-center gap-1 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-bold px-2.5 py-1 rounded-full">
        <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        {value.toFixed(1)}
    </span>
);

export default RatingBadge;