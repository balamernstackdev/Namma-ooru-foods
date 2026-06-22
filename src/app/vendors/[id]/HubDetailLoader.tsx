'use client';

import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';
import Link from 'next/link';
import VendorDetailClient from '@/components/VendorDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function HubDetailLoader({ id }: { id: string }) {
   const { data: hub, error } = useSWR(`${API_URL}/api/head-vendors/${id}`, fetcher);

   const hasError = !!error || (hub && !!hub.error);

   React.useEffect(() => {
      if (hasError) {
         console.warn(`[HubDetailLoader] Hub resolution failed for "${id}". Triggering redirect to /vendors...`);
         window.location.replace('/sellers');
      }
   }, [hasError, id]);

   if (!hub && !error) {
      return <PremiumLoader fullScreen={true} />;
   }

   if (hasError) {
      return <PremiumLoader fullScreen={true} />;
   }

   return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
         <VendorDetailClient vendor={hub} />
      </div>
   );
}
