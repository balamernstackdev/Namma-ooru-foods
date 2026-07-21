'use client';

import React, { useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import PremiumLoader from '@/components/ui/PremiumLoader';
import VendorDetailClient from '@/components/VendorDetailClient';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function SellerDetailLoader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = searchParams.get('slug') || searchParams.get('id');

  // Step 1: Try sub-vendor first
  const { data: subVendorData, error: subVendorError, isLoading: subVendorLoading } = useSWR(
    slug ? `${API_URL}/api/sub-vendors/slug/${slug}` : null,
    fetcher
  );

  const subVendorNotFound = !!(subVendorData?.error || (subVendorError && !subVendorLoading));

  // Step 2: If sub-vendor not found, try head-vendor
  const { data: headVendorData, error: headVendorError, isLoading: headVendorLoading } = useSWR(
    slug && subVendorNotFound ? `${API_URL}/api/head-vendors/slug/${slug}` : null,
    fetcher
  );

  const isHeadVendor = subVendorNotFound && !!(headVendorData && !headVendorData?.error);

  // Step 3: For SubVendors, fetch their products separately
  const subVendorId = (!subVendorNotFound && subVendorData?.id) ? subVendorData.id : null;
  const { data: subVendorProductsData } = useSWR(
    subVendorId ? `${API_URL}/api/products?subVendorId=${subVendorId}&limit=200&status=APPROVED` : null,
    fetcher
  );

  const isLoading = subVendorLoading || (subVendorNotFound && headVendorLoading);

  // For SubVendors, build a vendor object in the shape VendorDetailClient expects
  const vendorForClient = useMemo(() => {
    if (isHeadVendor) {
      // HeadVendor already has subVendors with products included from the API
      return headVendorData;
    }
    if (subVendorData && !subVendorData.error) {
      // Wrap SubVendor as a single-brand "hub" for VendorDetailClient
      const products = (subVendorProductsData?.products || subVendorProductsData || []);
      return {
        ...subVendorData,
        subVendors: [{
          ...subVendorData,
          products: Array.isArray(products) ? products : []
        }]
      };
    }
    return null;
  }, [isHeadVendor, headVendorData, subVendorData, subVendorProductsData]);

  const error = subVendorNotFound
    ? headVendorError || headVendorData?.error
    : subVendorError;

  // ── States ────────────────────────────────────────
  if (!slug) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center">
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">No Seller Specified</h1>
        <button onClick={() => router.push('/sellers')} className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest">
          Browse All Sellers
        </button>
      </div>
    );
  }

  if (isLoading || (!vendorForClient && !error && !subVendorNotFound)) return <PremiumLoader fullScreen={true} />;
  // Still waiting for head-vendor after sub-vendor 404
  if (subVendorNotFound && headVendorLoading) return <PremiumLoader fullScreen={true} />;

  if (error || !vendorForClient) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
        <div className="h-24 w-24 rounded-[2rem] bg-rose-50 flex items-center justify-center mb-8">
          <span className="text-4xl font-black text-rose-400">!</span>
        </div>
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Seller Not Found</h1>
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto">This seller does not exist or may have been removed.</p>
        <button onClick={() => router.push('/sellers')} className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest">
          Browse All Sellers
        </button>
      </div>
    );
  }

  // Also wait for SubVendor products to load before rendering
  if (!isHeadVendor && subVendorId && !subVendorProductsData) return <PremiumLoader fullScreen={true} />;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <VendorDetailClient vendor={vendorForClient} forcePublicView={true} />
    </div>
  );
}
