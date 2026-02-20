import React from 'react';
import { Star, MapPin, Flame } from 'lucide-react';
import Button from '../ui/Buttons';
import typography, { combineTypography } from '../../styles/typography';
import { MatchedWorkersProps } from "../../types/MatchedWorkers";

interface WorkerCardProps {
  worker: MatchedWorkersProps;
  onViewProfile: (id: number | string) => void; // ✅ Changed to accept both types
}

const WorkerCard: React.FC<WorkerCardProps> = ({ worker, onViewProfile }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {worker.initials}
        </div>

        <div className="flex-1">
          <h3 className={combineTypography(typography.heading.h3, "mb-1")}>
            {worker.name}
          </h3>

          <div className="flex items-center gap-3 mb-2 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium text-gray-900">{worker.rating}</span>
              <span className="text-gray-500">({worker.reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <MapPin className="w-4 h-4 text-red-500" />
              <span>{worker.distance} away</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{worker.price}</span>
            <span className="text-gray-500">• {worker.experience}</span>
          </div>
        </div>

        <Button onClick={() => onViewProfile(worker.id)} className="px-6 py-2.5 flex-shrink-0">
          View Profile
        </Button>
      </div>
    </div>
  );
};

export default WorkerCard;
