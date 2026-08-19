'use client';

import { useState } from 'react';
import { MapPin, ChevronDown } from 'lucide-react';
import { useUserLocation } from '@/hooks/useUserLocation';
import { AnimatePresence } from 'framer-motion';
import LocationMapModal from './LocationMapModal';

export default function TopLocationBar({ variant = 'full' }: { variant?: 'compact' | 'full' }) {
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
      {variant === 'full' ? (
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
      ) : (
        <div 
          className="flex flex-1 w-full items-center gap-1 sm:gap-2 cursor-pointer hover:bg-slate-50/50 p-1 sm:p-2 rounded-xl transition-colors border border-transparent hover:border-slate-100 group min-w-0" 
          onClick={() => setIsModalOpen(true)}
        >
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-50/50 items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
            <MapPin size={14} className="text-emerald-600 sm:w-4 sm:h-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none block">Delivering to</span>
            <span className="text-[11px] md:text-[12px] font-bold text-slate-800 truncate leading-none mt-1 w-full lg:max-w-[160px]">
              {formatLocationDisplay()}
            </span>
          </div>
          <ChevronDown size={14} className="text-slate-400 ml-1 shrink-0 group-hover:text-emerald-600 transition-colors" />
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && <LocationMapModal onClose={() => setIsModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
