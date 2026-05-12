'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Search, Clock, Home, Briefcase, Plus, X, ChevronRight, Loader2 } from 'lucide-react';
import { useUserLocation, LocationData } from '@/hooks/useUserLocation';

interface LocationDropdownProps {
  onClose: () => void;
}

export default function LocationDropdown({ onClose }: LocationDropdownProps) {
  const { detectLocation, saveLocation, loading, error } = useUserLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Mock saved addresses
  const savedAddresses = [
    { id: 1, type: 'Home', address: 'Anna Nagar, Chennai 600040', icon: Home },
    { id: 2, type: 'Work', address: 'Tidel Park, Tharamani, Chennai 600113', icon: Briefcase },
  ];

  // Mock recent searches
  const recentSearches = [
    'Besant Nagar, Chennai',
    'Adyar, Chennai 600020',
  ];

  const handleDetectLocation = async () => {
    try {
      await detectLocation();
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleManualSelect = (addr: string) => {
    // In a real app, we would geocode this or fetch details
    const parts = addr.split(',');
    const area = parts[0].trim();
    const city = parts[1]?.trim() || 'Chennai';
    const pincode = addr.match(/\d{6}/)?.[0] || '';
    
    saveLocation({
      area,
      city,
      pincode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[2000] lg:absolute lg:inset-auto lg:top-full lg:left-0 lg:mt-4 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm lg:hidden pointer-events-auto"
      />
      
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="absolute bottom-0 inset-x-0 lg:relative lg:bottom-auto lg:inset-auto w-full lg:w-[400px] bg-white rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] lg:shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden pointer-events-auto"
      >
        <div className="p-8 lg:p-6">
          <div className="flex items-center justify-between mb-8 lg:mb-6">
            <h3 className="text-xl lg:text-lg font-black text-slate-800">Delivery Location</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Detect Location Button */}
            <button
              onClick={handleDetectLocation}
              disabled={loading}
              className="w-full group flex items-center gap-4 p-6 lg:p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 transition-all border border-emerald-100"
            >
              <div className="h-14 w-14 lg:h-12 lg:w-12 rounded-xl bg-white flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-110 transition-transform">
                {loading ? <Loader2 size={28} className="animate-spin" /> : <Navigation size={28} />}
              </div>
              <div className="flex flex-col items-start">
                <span className="text-lg lg:text-base font-black text-emerald-900">Detect Current Location</span>
                <span className="text-sm lg:text-xs font-bold text-emerald-600/70">Using GPS for better accuracy</span>
              </div>
              <ChevronRight size={20} className="ml-auto text-emerald-300" />
            </button>

            {error && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100 text-sm font-bold text-red-600">
                {error}. Please check your browser location permissions.
              </div>
            )}
            
            <p className="text-[11px] font-medium text-slate-400 text-center px-4">
              We need your location to show you available products and estimated delivery times in your area.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
