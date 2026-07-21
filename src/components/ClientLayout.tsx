'use client';

import React, { Suspense } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyAssistant from "@/components/StickyAssistant";
import MobileBottomNav from "@/components/MobileBottomNav";
import AnnouncementBar from "@/components/AnnouncementBar";
import { usePathname } from 'next/navigation';
import GlobalApiLoader from "@/components/GlobalApiLoader";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardPath = pathname?.startsWith('/admin') || pathname === '/vendor' || pathname?.startsWith('/vendor/') || pathname === '/seller' || pathname?.startsWith('/seller/') || pathname === '/hub' || pathname?.startsWith('/hub/');

  React.useEffect(() => {
    window.scrollTo(0, 0);

    // Auto-recover from stale deployment chunk 404 errors
    const handleChunkError = (event: ErrorEvent) => {
      const isChunkError = event?.message?.includes('Loading chunk') || event?.message?.includes('404') || event?.target?.toString().includes('.js');
      if (isChunkError) {
        console.warn('⚠️ Stale deployment chunk detected. Auto-refreshing...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleChunkError, true);
    return () => window.removeEventListener('error', handleChunkError, true);
  }, [pathname]);

  return (
    <>
      <GlobalApiLoader />
      {!isDashboardPath && (
        <>
          <Suspense fallback={null}>
            <AnnouncementBar />
          </Suspense>
          <Navbar />
        </>
      )}
      <main className="min-h-fit flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      {!isDashboardPath && <Footer />}
      {!isDashboardPath && <StickyAssistant />}
      <MobileBottomNav />
    </>
  );
}
