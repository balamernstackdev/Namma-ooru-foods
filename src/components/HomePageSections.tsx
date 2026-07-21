'use client';

import ShopByVideo from './ShopByVideo';
import VendorShowcase from './VendorShowcase';
import TrustMarquee from './TrustMarquee';

export default function LazyHomeSections() {
  return (
    <>
      <ShopByVideo />
      <VendorShowcase />
      <TrustMarquee />
    </>
  );
}
