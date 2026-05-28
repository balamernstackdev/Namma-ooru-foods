import React, { Suspense } from 'react';
import ProductDetailLoader from './ProductDetailLoader';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Product Details | namma ooru Foods',
  description: 'View premium organic products and Products.',
};

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<PremiumLoader fullScreen={true} />}>
      <ProductDetailLoader />
    </Suspense>
  );
}
