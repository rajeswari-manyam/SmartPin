import React from "react";
import { Star } from "lucide-react";
import { StarSize } from "../../types/Review.types";

const Stars: React.FC<{
    value:    number;
    size?:    StarSize;
    onClick?: (v: number) => void;
}> = ({ value, size = "md", onClick }) => {
    const sz = { sm: "w-5 h-5", md: "w-6 h-6", lg: "w-9 h-9" }[size];
    return (
        <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(s => (
                <Star
                    key={s}
                    onClick={() => onClick?.(s)}
                    className={`${sz} ${onClick ? "cursor-pointer active:scale-125" : ""} transition-all ${
                        s <= value ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-100"
                    }`}
                />
            ))}
        </div>
    );
};

export default Stars;