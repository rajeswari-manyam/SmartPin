import React from 'react';
import { Star } from 'lucide-react';

// ============================================================================
// STAR RATING DISPLAY
// ============================================================================
const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
            <Star
                key={i}
                className={`w-3.5 h-3.5 ${
                    i <= Math.round(rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200 fill-gray-200'
                }`}
            />
        ))}
    </div>
);

export default StarRating;