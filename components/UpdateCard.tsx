import React from 'react';
import { CityUpdate, CATEGORY_COLORS, CATEGORY_LABELS } from '../types';
import { Clock, MapPin, ThumbsUp } from 'lucide-react';

interface UpdateCardProps {
  update: CityUpdate;
  distance?: number;
  onClick?: () => void;
}

const UpdateCard: React.FC<UpdateCardProps> = ({ update, distance, onClick }) => {
  const timeAgo = Math.max(0, Math.floor((Date.now() - update.timestamp) / 60000));
  const color = CATEGORY_COLORS[update.category];

  const formattedDistance = distance !== undefined
    ? distance < 1
      ? `${Math.round(distance * 1000)}m away`
      : `${distance.toFixed(1)}km away`
    : 'Nearby';

  return (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer mb-3"
    >
      <div className="flex justify-between items-start mb-2">
        <span 
          className="text-xs font-bold px-2 py-1 rounded-full text-white"
          style={{ backgroundColor: color }}
        >
          {CATEGORY_LABELS[update.category]}
        </span>
        <span className="text-slate-400 text-xs flex items-center">
          <Clock className="w-3 h-3 mr-1" />
          {timeAgo}m ago
        </span>
      </div>
      
      <p className="text-slate-800 text-sm font-medium mb-3 leading-snug">
        {update.description}
      </p>

      <div className="flex justify-between items-center text-slate-500 text-xs">
        <div className="flex items-center text-blue-600 font-medium bg-blue-50 px-2 py-0.5 rounded-md">
          <MapPin className="w-3 h-3 mr-1" />
          <span>{formattedDistance}</span>
        </div>
        <div className="flex items-center space-x-1">
          <ThumbsUp className="w-3 h-3" />
          <span>{update.likes}</span>
        </div>
      </div>
    </div>
  );
};

export default UpdateCard;