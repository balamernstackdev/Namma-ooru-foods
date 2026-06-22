'use client';

import React, { createContext, useContext, useMemo } from 'react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

export interface PlatformSettings {
  logo: string;
  name: string;
  favicon: string;
  primaryColor: string;
  secondaryColor: string;
  [key: string]: any;
}

interface PlatformSettingsContextType {
  settings: PlatformSettings;
  isLoading: boolean;
  error: any;
  mutate: () => void;
}

const defaultSettings: PlatformSettings = {
  logo: '/logo.webp',
  name: 'Namma Ooru',
  favicon: '/logo.webp',
  primaryColor: '#064e3b',
  secondaryColor: '#f59e0b',
};

const PlatformSettingsContext = createContext<PlatformSettingsContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function PlatformSettingsProvider({ children }: { children: React.ReactNode }) {
  const { data, error, isLoading, mutate } = useSWR(`${API_URL}/api/settings`, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const settings = useMemo(() => {
    if (!data || !Array.isArray(data)) return defaultSettings;
    
    // Convert array of {key, value} to an object
    const map = data.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      logo: map['platform_logo'] || defaultSettings.logo,
      name: map['platform_name'] || defaultSettings.name,
      favicon: map['platform_favicon'] || defaultSettings.favicon,
      primaryColor: map['platform_primary_color'] || defaultSettings.primaryColor,
      secondaryColor: map['platform_secondary_color'] || defaultSettings.secondaryColor,
    };
  }, [data]);

  // Dynamically update document head
  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      // Update Title
      if (settings.name) {
        document.title = `${settings.name} | Premium Organic & Local Essentials`;
      }
      
      // Update Favicon
      if (settings.favicon) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = settings.favicon;
      }
    }
  }, [settings.name, settings.favicon]);

  return (
    <PlatformSettingsContext.Provider value={{ settings, isLoading, error, mutate }}>
      {children}
    </PlatformSettingsContext.Provider>
  );
}

export const usePlatformSettings = () => {
  const context = useContext(PlatformSettingsContext);
  if (!context) {
    return {
      settings: defaultSettings,
      isLoading: false,
      error: null,
      mutate: () => {},
    };
  }
  return context;
};
