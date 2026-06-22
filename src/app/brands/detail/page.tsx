import React, { Suspense } from 'react';
import BrandDetailLoader from './BrandDetailLoader';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Heritage Brand | namma ooru Foods',
  description: 'Explore authentic heritage brand products sourced with integrity.',
};

export default function BrandDetailPage() {
  return (
    <Suspense fallback={<PremiumLoader fullScreen={true} />}>
      <BrandDetailLoader />
    </Suspense>
  );
}
