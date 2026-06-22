'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Search, MapPin, Loader2, Navigation, AlertTriangle } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useUserLocation, LocationData } from '@/hooks/useUserLocation';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

// Dynamically import InteractiveMap to avoid SSR issues with Leaflet
const InteractiveMap = dynamic(() => import('./InteractiveMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-2xl" />
});

interface LocationMapModalProps {
  onClose: () => void;
}

export default function LocationMapModal({ onClose }: LocationMapModalProps) {
  const { location, loading: isLocating, detectLocation, saveLocation } = useUserLocation();
  const { user } = useAuth();
  const [center, setCenter] = useState<[number, number]>([13.0827, 80.2707]); // Default Chennai
  const [addressDetails, setAddressDetails] = useState<LocationData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 500);

  // Client-side mount indicator for React Portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize with current location if available
  useEffect(() => {
    if (location && location.lat && location.lng) {
      setCenter([location.lat, location.lng]);
      setAddressDetails(location);
    }
  }, [location]);

  // Auto-detect user location on open
  useEffect(() => {
    handleGPSLocation();
  }, []);

  // Search Nominatim
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const searchPlaces = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=5&addressdetails=1`, {
          headers: { 
            'Accept-Language': 'en',
            'User-Agent': 'NammaOoruFoods/1.0'
          }
        });
        const data = await res.json();
        setSearchResults(data);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    };
    searchPlaces();
  }, [debouncedQuery]);

  // Handle map marker drag or click
  const handleMapLocationSelect = async (lat: number, lng: number) => {
    setCenter([lat, lng]);
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 
          'Accept-Language': 'en',
          'User-Agent': 'NammaOoruFoods/1.0'
        }
      });
      const data = await res.json();
      
      const addr = data.address;
      const city = addr.city || addr.town || addr.village || addr.state_district || addr.state || 'Chennai';
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.county || city;
      const pincode = addr.postcode || '';
      const district = addr.state_district || addr.county || city;
      const state = addr.state || 'Tamil Nadu';
      const country = addr.country || 'India';
      const street = addr.road || addr.street || addr.pedestrian || '';
      
      setAddressDetails({
        city,
        area,
        pincode,
        lat,
        lng,
        formattedAddress: data.display_name,
        district: addr.state_district || addr.county || city,
        state: addr.state || 'Tamil Nadu',
        country: addr.country || 'India',
        street
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    const addr = result.address;
    const city = addr.city || addr.town || addr.village || addr.state_district || addr.state || 'Chennai';
    const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.county || city;
    const pincode = addr.postcode || '';
    const district = addr.state_district || addr.county || city;
    const state = addr.state || 'Tamil Nadu';
    const country = addr.country || 'India';
    const street = addr.road || addr.street || addr.pedestrian || '';

    setCenter([lat, lng]);
    setAddressDetails({
      city,
      area,
      pincode,
      lat,
      lng,
      formattedAddress: result.display_name,
      district,
      state,
      country,
      street
    });
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleGPSLocation = async () => {
    try {
      const data = await detectLocation();
      if (data.lat && data.lng) {
        setCenter([data.lat, data.lng]);
        setAddressDetails(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async () => {
    if (addressDetails) {
      saveLocation(addressDetails);

      // Save to user profile if logged in
      if (user && user.id) {
        try {
          const token = localStorage.getItem('namma_orru_token');
          await fetch(`${API_URL}/api/addresses`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: user.id,
              name: user.name || 'My Delivery Address',
              phone: user.phone || '',
              line1: addressDetails.formattedAddress || addressDetails.area,
              line2: addressDetails.area || '',
              city: addressDetails.city || 'Chennai',
              state: addressDetails.state || 'Tamil Nadu',
              pincode: addressDetails.pincode || '',
              isDefault: true
            })
          });
        } catch (err) {
          console.error('Failed to save address to user profile:', err);
        }
      }
    }
    
    // Close popup automatically after successful save
    onClose();

    // Hard refresh to reload data based on new location
    window.location.reload(); 
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end justify-center md:items-center p-0 md:p-4 lg:p-6 pointer-events-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm pointer-events-auto"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: '100%', scale: 1 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: '100%', scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full md:w-[95vw] h-[90vh] md:h-[85vh] max-w-full md:max-w-[1100px] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white z-10 shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-800">Select Delivery Location</h2>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">Please provide your exact location for faster delivery</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 bg-slate-50 hover:bg-slate-100 rounded-full flex items-center justify-center text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Mobile/Tablet Search Bar - Sticky below Header */}
        <div className="block lg:hidden px-6 pt-4 pb-2 bg-white shrink-0 z-20">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search your area, landmark, pincode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
            {/* Mobile Search Results */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden z-50">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                  >
                    <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-700 line-clamp-1">{result.name}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{result.display_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          
          {/* Map Section */}
          <div className="w-full lg:w-3/5 h-[250px] md:h-[350px] lg:h-full relative shrink-0 lg:shrink">
            <InteractiveMap 
              center={center} 
              onLocationSelect={handleMapLocationSelect} 
              onRequestLocation={handleGPSLocation}
              isLocating={isLocating}
            />
            
            {/* Loading Spinner with "Detecting your location..." */}
            {isLocating && (
              <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px] flex items-center justify-center z-[400] pointer-events-none">
                <div className="bg-white/95 px-5 py-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3">
                  <Loader2 className="animate-spin text-emerald-600 animate-duration-1000" size={20} />
                  <span className="text-xs font-black text-slate-700 uppercase tracking-wider">Detecting your location...</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="w-full lg:w-2/5 flex flex-col justify-between overflow-hidden p-6 h-full flex-1">
            
            {/* Fixed Search Box at top of panel on Desktop */}
            <div className="hidden lg:block relative mb-4 z-20 shrink-0 bg-white">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search your area, landmark, pincode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {/* Desktop Search Results */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] overflow-hidden z-50">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectSearchResult(result)}
                      className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                    >
                      <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-700 line-clamp-1">{result.name}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{result.display_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Scrollable details container */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {/* Address details */}
              {isLocating ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <Loader2 className="animate-spin text-emerald-600 mb-3" size={24} />
                  <p className="text-sm font-bold text-slate-600">Detecting your location...</p>
                  <p className="text-[11px] text-slate-400 mt-1">Please allow browser location permissions</p>
                </div>
              ) : addressDetails ? (
                <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-4 md:p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="mt-1 h-9 w-9 rounded-full bg-emerald-100/80 text-emerald-600 flex items-center justify-center shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-emerald-950 uppercase tracking-wide">
                        {addressDetails.area || 'Selected Area'}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 mt-1 leading-relaxed break-words">
                        {addressDetails.formattedAddress}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-emerald-100/50 text-left">
                    <div className="col-span-2">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Street</p>
                      <p className="text-xs font-bold text-slate-700 break-words">{addressDetails.street || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">City</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{addressDetails.city || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Pincode</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{addressDetails.pincode || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">District</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{addressDetails.district || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">State</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{addressDetails.state || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Country</p>
                      <p className="text-xs font-bold text-slate-700 truncate">{addressDetails.country || '--'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Coordinates</p>
                      <p className="text-[10px] font-mono font-bold text-slate-700 truncate">
                        {addressDetails.lat?.toFixed(6)}, {addressDetails.lng?.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-center px-4 bg-slate-50/50 border border-slate-100 rounded-2xl">
                  <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-500 mb-3">
                    <AlertTriangle size={20} />
                  </div>
                  <p className="text-sm font-bold text-slate-600">No Location Selected</p>
                  <p className="text-[11px] text-slate-400 mt-1">Please drag the pin or search for your address</p>
                </div>
              )}
            </div>

            {/* Buttons: fixed at bottom of panel */}
            <div className="pt-4 pb-2 z-10 shrink-0 border-t border-slate-100 mt-4 bg-white flex flex-col">
              <button
                onClick={handleConfirm}
                disabled={!addressDetails || isSearching || isLocating}
                className="w-full h-14 bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-sm uppercase tracking-widest rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isSearching ? <Loader2 size={18} className="animate-spin" /> : 'Confirm Delivery Location'}
              </button>
              <button
                onClick={handleGPSLocation}
                disabled={isLocating}
                className="w-full h-14 bg-white hover:bg-slate-50 text-[#16A34A] border border-slate-200 font-bold text-xs uppercase tracking-widest rounded-xl mt-3 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLocating ? <Loader2 size={16} className="animate-spin text-[#16A34A]" /> : <Navigation size={16} />}
                Use Current Location
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
