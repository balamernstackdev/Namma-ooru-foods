// Cache-buster dummy update: trigger next dev route update
import React from 'react';
import VendorDetailLoader from './VendorDetailLoader';
import { API_URL } from '@/lib/api';
import { Metadata } from 'next';

export const dynamicParams = false;

export async function generateStaticParams() {
  try {
    console.log(`[Build] generateStaticParams starting for /vendors/[id]...`);
    console.log(`[Build] Fetching head vendors from: ${API_URL}/api/head-vendors?limit=1000`);
    const res = await fetch(`${API_URL}/api/head-vendors?limit=1000`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`API fetch failed with status ${res.status}`);
    const data = await res.json();
    const vendors = data.headVendors || [];
    console.log(`[Build] Successfully fetched ${vendors.length} head vendors.`);
    const params = [];
    for (const vendor of vendors) {
      params.push({ id: vendor.id.toString() });
      if (vendor.slug) {
        params.push({ id: vendor.slug });
        console.log(`[Build] Registering vendor path: /vendors/${vendor.slug} (ID: ${vendor.id})`);
      } else {
        console.log(`[Build] Registering vendor path: /vendors/${vendor.id}`);
      }
    }
    if (params.length === 0) throw new Error('No vendors fetched');
    console.log(`[Build] Total pre-rendered paths for vendors: ${params.length}`);
    return params;
  } catch (error) {
    console.error('[Build ERROR] Failed to fetch vendors in generateStaticParams:', error);
    throw error; // Fail the build as requested
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  try {
    const res = await fetch(`${API_URL}/api/head-vendors/${id}`);
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
