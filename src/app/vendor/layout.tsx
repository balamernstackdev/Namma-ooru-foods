'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Store,
  List,
  Layers,
  Search,
  Bell,
  Landmark,
  Menu,
  X,
  Megaphone,
  Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMarketingOpen, setIsMarketingOpen] = useState(false);
  const { settings } = usePlatformSettings();

  // Fetch notifications to get unread count
  const { data: rawNotifs } = useSWR<any>(
    user?.id ? `${API_URL}/api/notifications?recipientType=VENDOR&recipientId=${user.id}&vendorId=${user.brandId || ''}&limit=100` : null,
    fetcher,
    { refreshInterval: 60000 }
  );
  const notifications = Array.isArray(rawNotifs) ? rawNotifs : (rawNotifs?.notifications || []);
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  React.useEffect(() => {
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);
    
    if (!isLoading) {
      const role = user?.role?.toLowerCase();
      if (!user || (role !== 'vendor' && role !== 'admin')) {
        router.replace('/account');
      }
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAF7]">
        <div className="h-12 w-12 border-4 border-[#E5E7EB] border-t-[#0F7A4D] rounded-full animate-spin" />
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-[#6B7280]">Loading...</span>
      </div>
    );
  }

  const userRole = user?.role?.toLowerCase();
  if (!user || (userRole !== 'vendor' && userRole !== 'admin')) return null;

  const hasViewPerm = (moduleKey: string) => {
    if (userRole === 'admin') return true;
    if (!user.hubPermissions) return false;
    return user.hubPermissions[moduleKey]?.view === true;
  };

  const rawMenuItems = [
    { id: 'dashboard', label: 'Store Overview', href: '/vendor', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', href: '/vendor/products', icon: Package },
    { id: 'orders', label: 'Customer Orders', href: '/vendor/orders', icon: ShoppingBag },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      isSubmenu: true,
      subItems: [
        { id: 'coupons', label: 'Coupons', href: '/vendor/marketing/coupons', icon: Ticket },
        { id: 'notifications', label: 'Announcements', href: '/vendor/marketing/announcements', icon: Megaphone },
      ]
    },
    { id: 'payments', label: 'Payout History', href: '/vendor/payouts', icon: Landmark },
    { id: 'notifications', label: 'Notifications', href: '/vendor/notifications', icon: Bell },
    { id: 'settings', label: 'Store Settings', href: '/vendor/settings', icon: Settings },
    { id: 'website', label: 'Go to Website', href: '/', icon: Store, bypass: true },
  ];

  const menuItems = rawMenuItems.map(item => {
    if (item.bypass) return item;
    if (item.isSubmenu) {
      const filteredSub = item.subItems?.filter(sub => hasViewPerm(sub.id));
      if (!filteredSub || filteredSub.length === 0) return null;
      return { ...item, subItems: filteredSub };
    }
    if (!hasViewPerm(item.id)) return null;
    return item;
  }).filter(Boolean) as any[];

  return (
    <div id="vendor-root" className="min-h-screen flex bg-[#F8FAF7] transition-colors duration-500">
      <style dangerouslySetInnerHTML={{
        __html: `
        #vendor-root,
        #vendor-root button,
        #vendor-root input,
        #vendor-root select,
        #vendor-root textarea,
        #vendor-root table,
        #vendor-root label,
        #vendor-root span,
        #vendor-root p,
        #vendor-root h1,
        #vendor-root h2,
        #vendor-root h3,
        #vendor-root h4,
        #vendor-root h5,
        #vendor-root h6 {
          font-family: var(--font-mulish), 'Mulish', sans-serif !important;
        }

        #vendor-root h1 {
          font-size: clamp(24px, 5vw, 48px) !important;
          font-weight: 800 !important;
        }
        #vendor-root h2 {
          font-size: 20px !important;
          font-weight: 700 !important;
        }
        #vendor-root h3 {
          font-size: 18px !important;
          font-weight: 700 !important;
        }

        @media (min-width: 768px) {
          #vendor-root h2 {
            font-size: 26px !important;
          }
          #vendor-root h3 {
            font-size: 22px !important;
          }
        }

        @media (min-width: 1024px) {
          #vendor-root h2 {
            font-size: 32px !important;
          }
          #vendor-root h3 {
            font-size: 24px !important;
          }
        }
      `}} />

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* VENDOR SIDEBAR — Clean White */}
      <aside
        className={`w-72 bg-white text-[#111827] flex flex-col fixed h-screen z-50 border-r border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-lenis-prevent
      >
        <div className="p-8 border-b border-[#E5E7EB] flex items-center justify-between">
          <Link href="/" className="flex flex-col items-center gap-4 flex-1">
            <div className="h-20 w-full flex items-center justify-center mb-4">
              <img src={settings.logo || "/logo.webp"} alt={settings.name || "Platform Logo"} className="h-full w-auto object-contain" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-[14px] font-black uppercase tracking-widest text-[#111827]">Vendor Partner</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-[#0F7A4D] mt-2">Control Center</span>
            </div>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden text-[#6B7280] hover:text-[#111827] p-2 rounded-xl bg-[#F8FAF7]"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.isSubmenu) {
              const hasActiveSubitem = item.subItems?.some(sub => {
                const cleanPath = pathname.replace(/\/$/, '');
                const cleanHref = sub.href.replace(/\/$/, '');
                return cleanPath.startsWith(cleanHref);
              });
              
              const isOpen = isMarketingOpen || hasActiveSubitem;

              return (
                <div key={item.label} className="space-y-1">
                  <button
                    onClick={() => setIsMarketingOpen(!isMarketingOpen)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-[14px] transition-all group ${hasActiveSubitem ? 'text-[#0F7A4D] bg-[#F0FDF4]' : 'text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827]'}`}
                  >
                    <item.icon className={`h-5 w-5 ${hasActiveSubitem ? 'text-[#0F7A4D]' : 'text-[#9CA3AF] group-hover:text-[#0F7A4D]'}`} strokeWidth={2} />
                    <span className="text-[12px] font-bold uppercase tracking-widest flex-1 text-left">{item.label}</span>
                    {isOpen ? <ChevronDown size={14} className="text-[#9CA3AF]" /> : <ChevronRight size={14} className="text-[#9CA3AF]" />}
                  </button>
                  
                  {isOpen && (
                    <div className="pl-6 space-y-1">
                      {item.subItems?.map(sub => {
                        const cleanPath = pathname.replace(/\/$/, '');
                        const cleanHref = sub.href.replace(/\/$/, '');
                        const isSubActive = cleanPath.startsWith(cleanHref);
                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => { setIsSidebarOpen(false); }}
                            className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all group ${isSubActive ? 'bg-[#0F7A4D] text-white shadow-lg shadow-[#0F7A4D]/20' : 'text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827]'}`}
                          >
                            <sub.icon className={`h-4 w-4 ${isSubActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-[#0F7A4D]'}`} strokeWidth={2} />
                            <span className="text-[11px] font-bold uppercase tracking-widest flex-1">{sub.label}</span>
                            {isSubActive && <div className="h-1 w-1 rounded-full bg-white" />}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const cleanPath = pathname.replace(/\/$/, '');
            const cleanHref = (item.href || '').replace(/\/$/, '');
            const isActive = cleanHref === '/vendor'
              ? cleanPath === '/vendor'
              : cleanHref === ''
                ? cleanPath === ''
                : cleanPath.startsWith(cleanHref);
            return (
              <Link
                key={item.href || ''}
                href={item.href || ''}
                onClick={() => { setIsSidebarOpen(false); }}
                className={`flex items-center gap-4 px-5 py-4 rounded-[14px] transition-all group ${isActive ? 'bg-[#0F7A4D] text-white shadow-lg shadow-[#0F7A4D]/20' : 'text-[#6B7280] hover:bg-[#F8FAF7] hover:text-[#111827]'}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-[#0F7A4D]'}`} strokeWidth={2} />
                <span className="text-[12px] font-bold uppercase tracking-widest flex-1">{item.label}</span>
                {item.label === 'Notifications' && unreadCount > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-white text-[#0F7A4D]' : 'bg-red-500 text-white'}`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                {isActive && item.label !== 'Notifications' && <div className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#E5E7EB] mt-auto">
          <div className="bg-[#F8FAF7] rounded-[16px] p-4 flex items-center gap-3 border border-[#E5E7EB]">
            <div className="h-10 w-10 rounded-full bg-[#0F7A4D] flex items-center justify-center text-white">
              <Store size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-[#111827] truncate">{user?.name || "Namma Partner"}</span>
              <span className="text-[8px] font-bold text-[#0F7A4D] uppercase tracking-widest mt-1">
                {user?.role?.toLowerCase() === 'admin' ? "Super Admin" : user?.role?.toLowerCase() === 'hub' ? "Hub Manager" : "Managed Store"}
              </span>
            </div>
            <button onClick={logout} className="ml-auto h-8 w-8 rounded-lg bg-white border border-[#E5E7EB] flex items-center justify-center text-[#DC2626] hover:bg-[#DC2626] hover:text-white hover:border-[#DC2626] transition-all">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 relative bg-[#F8FAF7] min-h-screen transition-colors duration-500 overflow-x-hidden w-full max-w-full">
        {/* MOBILE TOP BAR — Clean White */}
        <header className="lg:hidden h-20 bg-white text-[#111827] flex items-center justify-between px-6 sticky top-0 z-40 border-b border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#F8FAF7] border border-[#E5E7EB] hover:bg-[#0F7A4D] hover:text-white hover:border-[#0F7A4D] text-[#6B7280] transition-all active:scale-95"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <span className="text-[14px] font-black uppercase tracking-widest text-[#111827] leading-none">Namma Ooru</span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#0F7A4D] mt-1">Vendor Console</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/vendor/notifications"
              className="h-10 w-10 flex items-center justify-center rounded-xl bg-[#F8FAF7] border border-[#E5E7EB] text-[#6B7280] relative hover:bg-[#F0FDF4] hover:text-[#0F7A4D] hover:border-[#0F7A4D]/20"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
              )}
            </Link>
            <div className="h-8 w-[1px] bg-[#E5E7EB]" />
            <div className="h-10 w-10 rounded-full bg-[#0F7A4D] text-white font-black text-xs flex items-center justify-center shadow-md">
              {user?.name?.[0] || 'V'}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 lg:p-8 max-w-full w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
