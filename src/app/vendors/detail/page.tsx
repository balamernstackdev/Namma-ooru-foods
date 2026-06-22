import React, { Suspense } from 'react';
import VendorDetailLoader from './VendorDetailLoader';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vendor | namma ooru Foods',
  description: 'Explore products from our premium marketplace vendors.',
};

export default function VendorDetailPage() {
  return (
    <Suspense fallback={<PremiumLoader fullScreen={true} />}>
      <VendorDetailLoader />
    </Suspense>
  );
}
