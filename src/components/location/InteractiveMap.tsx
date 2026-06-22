'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Loader2 } from 'lucide-react';

// Fix for default Leaflet markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Premium Marker
const customIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface InteractiveMapProps {
  center: [number, number];
  onLocationSelect: (lat: number, lng: number) => void;
  isLocating?: boolean;
  onRequestLocation?: () => void;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 16, { animate: true, duration: 1 });
  }, [center, map]);
  return null;
}

export default function InteractiveMap({ center, onLocationSelect, isLocating, onRequestLocation }: InteractiveMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center text-slate-400">Loading Map...</div>;

  return (
    <div className="relative w-full h-full overflow-hidden group/map">
      <MapContainer
        center={center}
        zoom={16}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <Marker 
          position={center} 
          icon={customIcon}
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onLocationSelect(position.lat, position.lng);
            }
          }}
        />
        <MapEvents onLocationSelect={onLocationSelect} />
        <MapController center={center} />
      </MapContainer>

      {/* Custom Current Location Button overlaying the map */}
      {onRequestLocation && (
        <button 
          onClick={(e) => {
            e.preventDefault();
            onRequestLocation();
          }}
          disabled={isLocating}
          className="absolute bottom-4 right-4 z-[400] w-12 h-12 bg-white rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-slate-100 flex items-center justify-center text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-all hover:scale-105 active:scale-95"
        >
          {isLocating ? <Loader2 size={20} className="animate-spin text-emerald-600" /> : <Navigation size={20} className="fill-current" />}
        </button>
      )}
    </div>
  );
}
