'use client';

import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const BANNER_TYPE_MAP: Record<string, string> = {
  // Short-form (canonical)
  'hero': 'hero',
  'best_sellers': 'best_sellers',
  'organic_collection': 'organic_collection',
  'farmer_collection': 'farmer_collection',
  'category': 'category',

  // Spaced / Capitalized / Legacy
  'best sellers': 'best_sellers',
  'organic collection': 'organic_collection',
  'farmer collection': 'farmer_collection',
  'hero banner': 'hero',
  'best sellers banner': 'best_sellers',
  'organic collection banner': 'organic_collection',
  'farmer collection banner': 'farmer_collection',
  'category banner': 'category',
};

export function normalizeType(type?: string | null): string {
  if (!type) return 'hero';
  const lower = type.toLowerCase().trim();
  return BANNER_TYPE_MAP[lower] || lower;
}

export interface NormalizedBanner {
  id: number;
  title: string | null;
  subtitle: string | null;
  tagline: string | null;
  banner_image: string;
  link: string | null;
  linkData: any;
  buttonText: string | null;
  isActive: boolean;
  display_order: number;
  type: string;          // normalized short-form type
  rawType: string;       // original stored type
  startDate: string | null;
  endDate: string | null;
}

import React from 'react';

export function useBanners() {
  const { data: raw, error, isLoading } = useSWR<any[]>(
    `${API_URL}/api/banners`,
    fetcher
  );

  const allBanners = React.useMemo(() => {
    const now = new Date();
    return (Array.isArray(raw) ? raw : [])
      .filter((b: any) => {
        // 1. Must be active and have an image
        if (b.isActive === false) return false;
        if (!b.banner_image?.trim()) return false;

        // 2. Date window check: start_date <= current date <= end_date
        if (b.startDate) {
          const start = new Date(b.startDate).getTime();
          if (start > now.getTime()) return false;
        }
        if (b.endDate) {
          const end = new Date(b.endDate).getTime();
          if (end < now.getTime()) return false;
        }

        return true;
      })
      .map((b: any) => ({
        id: b.id,
        title: b.title || null,
        subtitle: b.subtitle || null,
        tagline: b.tagline || null,
        banner_image: b.banner_image,
        link: b.link || null,
        linkData: b.linkData || null,
        buttonText: b.buttonText || null,
        isActive: b.isActive,
        display_order: b.display_order ?? 999999,
        type: normalizeType(b.type),
        rawType: b.type || '',
        startDate: b.startDate || null,
        endDate: b.endDate || null,
      }))
      .sort((a, b) => {
        if (a.display_order !== b.display_order) return a.display_order - b.display_order;
        return b.id - a.id; // Newest first fallback
      });
  }, [raw]);

  const byType = React.useCallback((type: string): NormalizedBanner[] =>
    allBanners.filter(b => b.type === normalizeType(type)),
  [allBanners]);

  const heroBanners = React.useMemo(() => byType('hero'), [byType]);
  const bestSellersBanners = React.useMemo(() => byType('best_sellers'), [byType]);
  const organicBanners = React.useMemo(() => byType('organic_collection'), [byType]);
  const farmerBanners = React.useMemo(() => byType('farmer_collection'), [byType]);
  const vendorBanners = React.useMemo(() => byType('vendor'), [byType]);
  const brandBanners = React.useMemo(() => byType('brand'), [byType]);
  const categoryBanners = React.useMemo(() => byType('category'), [byType]);

  return {
    allBanners,
    heroBanners,
    bestSellersBanners,
    organicBanners,
    farmerBanners,
    vendorBanners,
    brandBanners,
    categoryBanners,
    isLoading,
    error,
  };
}

