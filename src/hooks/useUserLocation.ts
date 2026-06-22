'use client';

import { useState, useEffect, useCallback } from 'react';

export interface LocationData {
  city: string;
  area: string;
  pincode: string;
  lat?: number;
  lng?: number;
  formattedAddress?: string;
  district?: string;
  state?: string;
  country?: string;
  street?: string;
}

export const useUserLocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'unknown'>('unknown');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('user_location');
    if (saved) {
      try {
        setLocation(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved location');
      }
    }

    // Check permission status if API is available
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setPermissionStatus(result.state);
        result.onchange = () => setPermissionStatus(result.state);
      });
    }
  }, []);

  const saveLocation = (data: LocationData) => {
    setLocation(data);
    localStorage.setItem('user_location', JSON.stringify(data));
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Nominatim requires a User-Agent header
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { 
          headers: { 
            'Accept-Language': 'en',
            'User-Agent': 'NammaOoruFoods/1.0' 
          } 
        }
      );
      
      if (!res.ok) throw new Error('Geocoding service unavailable');
      
      const data = await res.json();
      
      const addr = data.address;
      // Robust address extraction
      const city = addr.city || addr.town || addr.village || addr.state_district || addr.state || 'Chennai';
      const area = addr.suburb || addr.neighbourhood || addr.residential || addr.road || addr.county || city;
      const pincode = addr.postcode || '';
      const district = addr.state_district || addr.county || city;
      const state = addr.state || 'Tamil Nadu';
      const country = addr.country || 'India';
      const street = addr.road || addr.street || addr.pedestrian || '';

      const locationData: LocationData = {
        city,
        area,
        pincode,
        lat,
        lng,
        formattedAddress: data.display_name,
        district,
        state,
        country,
        street
      };

      saveLocation(locationData);
      return locationData;
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      // Fallback to a default if geocoding fails but we have coordinates
      const fallback: LocationData = {
        city: 'Chennai',
        area: 'Anna Nagar',
        pincode: '600040',
        lat,
        lng,
        district: 'Chennai',
        state: 'Tamil Nadu',
        country: 'India',
        street: 'Anna Nagar Second Avenue'
      };
      saveLocation(fallback);
      return fallback;
    }
  };

  const detectLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    return new Promise<LocationData>((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = 'Geolocation not supported';
        setError(err);
        setLoading(false);
        reject(err);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const data = await reverseGeocode(position.coords.latitude, position.coords.longitude);
            setLoading(false);
            resolve(data);
          } catch (err: any) {
            setError(err.message);
            setLoading(false);
            reject(err);
          }
        },
        (err) => {
          let msg = 'Failed to detect location';
          if (err.code === 1) msg = 'Location permission denied';
          setError(msg);
          setLoading(false);
          reject(msg);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  }, []);

  return {
    location,
    loading,
    error,
    permissionStatus,
    detectLocation,
    saveLocation,
  };
};
