// Cache-buster dummy update: trigger next dev route update
import React from 'react';
import VendorDetailLoader from './VendorDetailLoader';
import { API_URL, fetchWithTimeout } from '@/lib/api';
import { Metadata } from 'next';

export const dynamicParams = true;


export async function generateStaticParams() {
  // Return empty array to generate pages on-demand and avoid hitting Hostinger WAF/CDN rate limits during build
  return [];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  try {
    const res = await fetchWithTimeout(`${API_URL}/api/head-vendors/${id}`);
    if (!res.ok) return { title: 'Marketplace Vendor | namma ooru Foods' };
    const vendor = await res.json();

    if (!vendor || vendor.error) return { title: 'Marketplace Vendor | namma ooru Foods' };

    return {
      title: `${vendor.name} | Marketplace Vendor`,
      description: vendor.description || `Explore products from ${vendor.name}, a premium marketplace vendor featuring authentic heritage brands.`,
      openGraph: {
        title: `${vendor.name} | namma ooru Foods`,
        description: `Directly sourced organic products from the ${vendor.name} vendor collection.`,
        images: vendor.banner ? [vendor.banner] : (vendor.logo ? [vendor.logo] : [])
      }
    };
  } catch (e) {
    return { title: 'Marketplace Vendor | namma ooru Foods' };
  }
}

export default async function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { id } = resolvedParams;

  return (
    <VendorDetailLoader id={id} />
  );
}
