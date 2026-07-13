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
