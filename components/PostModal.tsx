import React, { useState, useEffect } from 'react';
import { X, Send, AlertCircle, Users, Car, Calendar, MapPin, Navigation, Map as MapIcon } from 'lucide-react';
import { UpdateCategory, CATEGORY_COLORS, CATEGORY_LABELS, Coordinates } from '../types';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string, category: UpdateCategory, location: Coordinates) => void;
  loading: boolean;
  userLocation: Coordinates | null;
  mapCenter: Coordinates;
}

const PostModal: React.FC<PostModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  loading,
  userLocation,
  mapCenter 
}) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<UpdateCategory>(UpdateCategory.TRAFFIC);
  const [locationMode, setLocationMode] = useState<'GPS' | 'MAP'>('GPS');

  // Set initial mode based on availability
  useEffect(() => {
    if (isOpen) {
      setLocationMode(userLocation ? 'GPS' : 'MAP');
    }
  }, [isOpen, userLocation]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      const baseLocation = (locationMode === 'GPS' && userLocation) ? userLocation : mapCenter;
      
      // Add very slight fuzz to prevent perfect stacking
      const fuzz = () => (Math.random() - 0.5) * 0.0005;
      const finalLocation = {
        lat: baseLocation.lat + fuzz(),
        lng: baseLocation.lng + fuzz()
      };

      onSubmit(description, category, finalLocation);
      setDescription('');
    }
  };

  const categories = [
    { id: UpdateCategory.TRAFFIC, icon: Car },
    { id: UpdateCategory.CROWD, icon: Users },
    { id: UpdateCategory.ISSUE, icon: AlertCircle },
    { id: UpdateCategory.EVENT, icon: Calendar },
    { id: UpdateCategory.NEIGHBORHOOD, icon: MapPin },
  ];

  const targetLocation = (locationMode === 'GPS' && userLocation) ? userLocation : mapCenter;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">Post Update</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Location Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!userLocation}
                onClick={() => setLocationMode('GPS')}
                className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  locationMode === 'GPS'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                <Navigation className="w-4 h-4 mr-2" />
                My Location
              </button>
              <button
                type="button"
                onClick={() => setLocationMode('MAP')}
                className={`flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  locationMode === 'MAP'
                    ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm ring-1 ring-blue-500'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MapIcon className="w-4 h-4 mr-2" />
                Map Center
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center text-xs text-slate-400">
               <MapPin className="w-3 h-3 mr-1" />
               Posting near: {targetLocation.lat.toFixed(4)}, {targetLocation.lng.toFixed(4)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = category === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      isSelected 
                        ? 'border-transparent text-white shadow-md transform scale-105' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    style={{ backgroundColor: isSelected ? CATEGORY_COLORS[cat.id] : undefined }}
                  >
                    <Icon className="w-3 h-3 mr-1.5" />
                    {CATEGORY_LABELS[cat.id]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24 text-sm"
              placeholder="Traffic light broken, street performer, etc..."
              maxLength={140}
              required
            />
            <div className="text-right text-xs text-slate-400 mt-1">
              {description.length}/140
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex justify-center items-center"
          >
            {loading ? 'Posting...' : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Share Update
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;