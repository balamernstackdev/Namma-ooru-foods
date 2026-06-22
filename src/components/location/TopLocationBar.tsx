'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { AnimatePresence } from 'framer-motion';
import LocationMapModal from './LocationMapModal';

export default function TopLocationBar() {
  const { location, loading } = useUserLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatLocationDisplay = () => {
    if (loading) return 'Locating...';
    if (!location) return 'Select your delivery location';
    
    const parts = [];
    if (location.area) parts.push(location.area);
    if (location.city) parts.push(location.city);
    if (location.state) parts.push(location.state);
    
    let text = parts.join(', ');
    if (location.pincode) text += ` - ${location.pincode}`;
    
    return text;
  };

  return (
    <>
      <div className="w-full h-14 bg-white border-b border-[#E5E7EB] flex items-center justify-between px-4 md:px-8 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setIsModalOpen(true)}>
        <div className="standard-container flex items-center justify-between w-full">
          <div className="flex items-center gap-3 w-full">
            <div className="h-8 w-8 rounded-full bg-emerald-50 text-[#16A34A] flex items-center justify-center shrink-0">
              <MapPin size={16} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-400">Delivering to</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs md:text-sm font-bold text-slate-800 truncate">
                  {formatLocationDisplay()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-2 shrink-0 border border-slate-200 rounded-full px-4 py-1.5 bg-white hover:border-emerald-200 hover:bg-emerald-50 transition-all">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Change Location</span>
            <ChevronDown size={14} className="text-emerald-600" />
          </div>
          <div className="md:hidden flex items-center shrink-0">
            <ChevronDown size={18} className="text-emerald-600" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && <LocationMapModal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
