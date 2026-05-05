'use client';

import dynamic from 'next/dynamic';

const ShopByVideo = dynamic(() => import('./ShopByVideo'), { ssr: false });
const TrustMarquee = dynamic(() => import('./TrustMarquee'), { ssr: false });
const MarketingPopup = dynamic(() => import('./MarketingPopup'), { ssr: false });

export default function LazyHomeSections() {
  return (
    <>
      <ShopByVideo />
      <TrustMarquee />
    </>
  );
}
