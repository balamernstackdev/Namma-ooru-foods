'use client';

import ShopByVideo from './ShopByVideo';
import VendorShowcase from './VendorShowcase';
import TrustMarquee from './TrustMarquee';
import ArtisanMarketplace from './ArtisanMarketplace';

export default function LazyHomeSections() {
  return (
    <>
      <ShopByVideo />
      <ArtisanMarketplace />
      <VendorShowcase />
      <TrustMarquee />
    </>
  );
}
