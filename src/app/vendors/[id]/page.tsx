// Cache-buster dummy update: trigger next dev route update
import React from 'react';
import VendorDetailLoader from './VendorDetailLoader';
import { API_URL } from '@/lib/api';
import { Metadata } from 'next';

// export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    let res = await fetch(`${API_URL}/api/head-vendors?limit=1000`, { cache: 'no-store' });
    if (!res.ok) {
      res = await fetch(`http://localhost:5000/api/head-vendors?limit=1000`, { cache: 'no-store' });
    }
    const data = await res.json();
    const vendors = data.headVendors || [];
    const params = [];
    for (const vendor of vendors) {
      params.push({ id: vendor.id.toString() });
      if (vendor.slug) params.push({ id: vendor.slug });
    }
    if (params.length === 0) throw new Error('No vendors fetched');
    return params;
  } catch (error) {
    console.warn('Falling back to default vendor ID in generateStaticParams:', error);
    return [{ id: '1' }];
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
