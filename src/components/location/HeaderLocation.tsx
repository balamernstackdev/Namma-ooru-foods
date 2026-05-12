'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserLocation } from '@/hooks/useUserLocation';
import LocationDropdown from './LocationDropdown';

export default function HeaderLocation() {
  const [isOpen, setIsOpen] = useState(false);
  const { location, loading, detectLocation } = useUserLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Only load from localStorage on mount, don't auto-trigger GPS
  useEffect(() => {
    // We don't auto-trigger detectLocation() to avoid immediate permission popups.
    // The user will trigger it manually via the dropdown.
  }, []);

  const displayLocation = location 
    ? `${location.area}, ${location.city}`.slice(0, 25) + (location.area.length + location.city.length > 25 ? '...' : '')
    : 'Select Location';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full transition-all duration-300 group"
      >
        <div className={`h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-50 transition-transform group-hover:scale-110 ${loading ? 'animate-pulse' : ''}`}>
          {loading ? (
            <Loader2 size={16} className="text-emerald-600 animate-spin" />
          ) : (
            <MapPin size={16} className="text-emerald-600" />
          )}
        </div>
        
        <div className="flex flex-col items-start text-left">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">
            Deliver To
          </span>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-700 leading-tight">
              {loading ? 'Locating...' : displayLocation}
            </span>
            <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <LocationDropdown onClose={() => setIsOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
