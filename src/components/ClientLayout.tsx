'use client';

import React from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StickyAssistant from "@/components/StickyAssistant";
import MobileBottomNav from "@/components/MobileBottomNav";
import { usePathname } from 'next/navigation';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardPath = pathname?.startsWith('/admin') || pathname === '/vendor' || pathname?.startsWith('/vendor/');

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      {!isDashboardPath && <Navbar />}
      <main className="min-h-fit flex-1 pb-20 lg:pb-0">
        {children}
      </main>
      {!isDashboardPath && <Footer />}
      {!isDashboardPath && <StickyAssistant />}
      <MobileBottomNav />
    </>
  );
}
