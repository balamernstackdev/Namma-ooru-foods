'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings,
  LogOut, Bell, DollarSign, Store, Menu, Lock
} from 'lucide-react';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';

const navGroups = [
  {
    label: 'Overview',
    hideHeader: true,
    items: [
      { label: 'Dashboard', href: '/hub/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Management',
    items: [
      { label: 'Hub Vendors', href: '/hub/sub-vendors', icon: Users },
      { label: 'Hub Products', href: '/hub/products', icon: Package },
      { label: 'Hub Orders', href: '/hub/orders', icon: ShoppingBag },
      { label: 'Hub Customers', href: '/hub/customers', icon: Users },
    ]
  },
  {
    label: 'Finance',
    items: [
      { label: 'Hub Payouts', href: '/hub/payouts', icon: DollarSign },
      { label: 'Reports', href: '/hub/reports', icon: BarChart3 },
    ]
  },
  {
    label: 'System',
    hideHeader: true,
    items: [
      { label: 'Settings', href: '/hub/change-password', icon: Lock },
    ]
  }
];

export default function HubLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { settings } = usePlatformSettings();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && pathname !== '/hub/login') {
      const role = user?.role?.toLowerCase();
      if (!user || (role !== 'hub' && role !== 'admin')) {
        router.replace('/account');
      }
    }
  }, [user, isLoading, mounted, pathname, router]);

  if (!mounted) return null;

  if (pathname === '/hub/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAF7]">
        <div className="h-12 w-12 border-4 border-slate-900/10 border-t-emerald-600 rounded-full animate-spin" />
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900/40">Loading Hub...</span>
      </div>
    );
  }

  const role = user?.role?.toLowerCase();
  if (!user || (role !== 'hub' && role !== 'admin')) {
    return null;
  }

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const hubName = user?.name || 'Hub Manager';
  const hubId = user?.hubId || 'HUB-001';

  return (
    <div id="admin-root" className="min-h-screen bg-[#F8FAF7] flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <style dangerouslySetInnerHTML={{
        __html: `
        /* Font Application */
        #admin-root, #admin-root button, #admin-root input, #admin-root select, #admin-root textarea,
        #admin-root table, #admin-root label, #admin-root span, #admin-root p, #admin-root h1,
        #admin-root h2, #admin-root h3, #admin-root h4, #admin-root h5, #admin-root h6 {
          font-family: var(--font-mulish), 'Mulish', sans-serif !important;
        }

        #admin-root h1 { font-size: 32px !important; font-weight: 800 !important; }
        #admin-root h2 { font-size: 20px !important; font-weight: 700 !important; }
        #admin-root h3 { font-size: 18px !important; font-weight: 700 !important; }
        #admin-root label { font-size: 12px !important; font-weight: 700 !important; text-transform: uppercase !important; letter-spacing: 0.08em !important; }
        #admin-root p { font-size: 14px !important; font-weight: 500 !important; }
        #admin-root td, #admin-root th { font-size: 14px !important; font-weight: 600 !important; }
        #admin-root button { font-size: 14px !important; font-weight: 700 !important; }

        @media (min-width: 768px) {
          #admin-root h1 { font-size: 42px !important; }
          #admin-root h2 { font-size: 26px !important; }
          #admin-root h3 { font-size: 22px !important; }
        }

        @media (min-width: 1024px) {
          #admin-root h1 { font-size: 52px !important; }
          #admin-root h2 { font-size: 32px !important; }
          #admin-root h3 { font-size: 24px !important; }
        }

        .admin-sidebar-nav::-webkit-scrollbar { width: 5px; }
        .admin-sidebar-nav::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.05); border-radius: 20px; }
        .admin-sidebar-nav::-webkit-scrollbar-track { background: transparent; }
      `}} />

      {/* MOBILE OVERLAY */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[45] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR */}
      <aside className={`
        w-72 bg-white text-slate-900 flex flex-col fixed top-0 left-0 bottom-0 z-50 border-r border-slate-200 transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} data-lenis-prevent>
        {/* Brand Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/30 shrink-0 relative z-10">
          <Link href="/hub/dashboard" className="flex items-center gap-4 transition-all hover:opacity-80 active:scale-95">
            <div className="h-16 w-16 flex items-center justify-center flex-shrink-0 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
              <img src={settings?.logo || "/logo.webp"} alt="Logo" className="h-14 w-14 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[17px] font-black tracking-tighter leading-none text-slate-900 uppercase italic">Hub Portal</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-400 mt-1.5">{hubName}</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 relative min-h-0">
          <nav className="admin-sidebar-nav absolute inset-0 overflow-y-auto px-4 py-6 space-y-0.5">
            {navGroups.map(group => {
              const isCollapsed = collapsedGroups.includes(group.label);
              const hideHeader = (group as any).hideHeader === true;
              return (
                <div key={group.label} className={hideHeader ? "mb-1" : "mb-4"}>
                  {!hideHeader && (
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center justify-between px-4 py-2.5 mb-2 rounded-xl bg-slate-100/50 hover:bg-slate-100 border border-slate-200/60 transition-all group/header"
                    >
                      <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-700 group-hover/header:text-emerald-700 transition-colors">
                        {group.label}
                      </span>
                    </button>
                  )}
                  <div className="flex flex-col gap-1 mt-1">
                    {(!isCollapsed || hideHeader) && group.items.map(item => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsSidebarOpen(false)}
                          className={`
                            flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group
                            ${isActive
                              ? 'bg-emerald-600 text-white shadow-[0_10px_20px_-5px_rgba(5,150,105,0.3)] scale-[1.02]'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                            }
                          `}
                        >
                          <item.icon
                            className={`h-[20px] w-[20px] shrink-0 transition-all duration-300 ${isActive ? 'text-white scale-110 drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)]' : 'text-slate-400 group-hover:text-emerald-600 group-hover:scale-110'}`}
                            strokeWidth={isActive ? 2.5 : 1.5}
                          />
                          <span className={`text-[14px] font-semibold flex-1 tracking-tight ${isActive ? 'text-white' : 'text-inherit'}`}>
                            {item.label}
                          </span>
                          {isActive && (
                            <motion.div layoutId="active-pill" className="h-1.5 w-1.5 rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="shrink-0 p-6 bg-slate-50/50 border-t border-slate-100">
          <div className="bg-white border border-slate-200 rounded-[22px] p-4 flex items-center gap-4 group/user hover:shadow-lg transition-all cursor-pointer">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-sm font-black shrink-0 overflow-hidden text-white shadow-sm">
              {hubName[0] || 'H'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[13px] font-bold tracking-tight leading-none text-slate-900 truncate">{hubName}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-600 mt-2">{hubId}</span>
            </div>
            <button
              onClick={() => { logout(); router.push('/hub/login'); }}
              className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-500 transition-all"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 lg:ml-72 min-w-0 relative flex flex-col min-h-screen overflow-y-auto overflow-x-hidden">
        {/* Mobile Top Header */}
        <header className="flex lg:hidden h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 items-center justify-between px-4 sticky top-0 z-40">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="h-10 w-10 shrink-0 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 truncate">Hub Portal</h2>
              <span className="text-xs font-bold text-slate-900 tracking-tight truncate">Menu</span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-4 md:p-6 lg:p-8 max-w-full w-full overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
