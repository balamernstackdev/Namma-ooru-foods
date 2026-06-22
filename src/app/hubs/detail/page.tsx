import React, { Suspense } from 'react';
import HubDetailLoader from './HubDetailLoader';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor Hub | namma ooru Foods',
  description: 'Explore products and vendors from our regional hubs.',
};

export default function HubDetailPage() {
  return (
    <Suspense fallback={<PremiumLoader fullScreen={true} />}>
      <HubDetailLoader />
    </Suspense>
  );
}
