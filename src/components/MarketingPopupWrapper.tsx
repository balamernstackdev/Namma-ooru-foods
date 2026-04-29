'use client';

import dynamic from 'next/dynamic';

const Popup = dynamic(() => import('./MarketingPopup'), { ssr: false });

export default function MarketingPopupWrapper() {
  return <Popup />;
}
