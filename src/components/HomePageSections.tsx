'use client';

import dynamic from 'next/dynamic';

const ShopByVideo = dynamic(() => import('./ShopByVideo'), { ssr: false });
const ShopByConcern = dynamic(() => import('./ShopByConcern'), { ssr: false });
const TrustMarquee = dynamic(() => import('./TrustMarquee'), { ssr: false });
const PromoBanner = dynamic(() => import('./PromoBanner'), { ssr: false });
const VendorShowcase = dynamic(() => import('./VendorShowcase'), { ssr: false });
const MarketingPopup = dynamic(() => import('./MarketingPopup'), { ssr: false });

export default function LazyHomeSections() {
  return (
    <>
      <VendorShowcase />
      <ShopByConcern />
      <ShopByVideo />
      <PromoBanner />
      <TrustMarquee />
    </>
  );
}
