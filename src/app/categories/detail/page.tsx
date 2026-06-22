import React, { Suspense } from 'react';
import CategoryDetailLoader from './CategoryDetailLoader';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Category | namma ooru Foods',
  description: 'Browse our organic category collection sourced directly from local farmers.',
};

export default function CategoryDetailPage() {
  return (
    <Suspense fallback={<PremiumLoader fullScreen={true} />}>
      <CategoryDetailLoader />
    </Suspense>
  );
}
