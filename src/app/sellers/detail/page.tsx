import React, { Suspense } from 'react';
import SellerDetailLoader from './SellerDetailLoader';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Seller | namma ooru Foods',
  description: 'Explore authentic products from our verified sellers.',
};

export default function SellerDetailPage() {
  return (
    <Suspense fallback={<PremiumLoader fullScreen={true} />}>
      <SellerDetailLoader />
    </Suspense>
  );
}
