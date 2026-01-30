import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Marker, Popup, useMap } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { CityUpdate, Coordinates, CATEGORY_COLORS, UpdateCategory } from '../types';

interface MapViewProps {
  center: Coordinates;
  zoom: number;
  updates: CityUpdate[];
  onMarkerClick: (update: CityUpdate) => void;
}

// SVG Strings for icons to avoid React rendering complexity in Leaflet DivIcon
const ICONS = {
  [UpdateCategory.TRAFFIC]: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>`,
  [UpdateCategory.CROWD]: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  [UpdateCategory.ISSUE]: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>`,
  [UpdateCategory.EVENT]: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  [UpdateCategory.NEIGHBORHOOD]: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
};

const createCategoryIcon = (category: UpdateCategory) => {
  const color = CATEGORY_COLORS[category];
  const iconSvg = ICONS[category];

  return divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        justify-content: center;
        align-items: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        position: relative;
        top: -18px;
        left: -5px;
      ">
        <div style="transform: rotate(45deg); color: white; display: flex;">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [30, 42], // Size of the icon
    iconAnchor: [15, 42], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -40] // Point from which the popup should open relative to the iconAnchor
  });
};

// Helper to update map view when center changes
const RecenterMap: React.FC<{ center: Coordinates }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng]);
  }, [center, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ center, zoom, updates, onMarkerClick }) => {
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={zoom} 
      scrollWheelZoom={true}
      className="h-full w-full z-0"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <RecenterMap center={center} />

      {/* User Location Pulse */}
      <CircleMarker 
        center={[center.lat, center.lng]}
        radius={8}
        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8 }}
      >
      </CircleMarker>
      <CircleMarker 
        center={[center.lat, center.lng]}
        radius={20}
        pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, stroke: false }}
      />

      {updates.map((update) => (
        <Marker
          key={update.id}
          position={[update.location.lat, update.location.lng]}
          icon={createCategoryIcon(update.category)}
          eventHandlers={{
            click: () => onMarkerClick(update),
          }}
        >
          <Popup>
            <div className="p-1 min-w-[150px]">
              <div className="flex items-center gap-2 mb-1 border-b border-slate-100 pb-1">
                <span 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[update.category] }}
                ></span>
                <strong className="text-slate-700 text-sm">
                  {update.category}
                </strong>
              </div>
              <p className="m-0 text-sm text-slate-600 leading-snug">{update.description}</p>
              <p className="text-xs text-slate-400 mt-2">
                {Math.floor((Date.now() - update.timestamp) / 60000)} mins ago
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;