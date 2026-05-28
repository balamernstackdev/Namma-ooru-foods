'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  ChevronRight,
  Store,
  List,
  Layers,
  Sun,
  Moon,
  Search,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  // Security Guard
  React.useEffect(() => {
    if (!isLoading) {
      const role = user?.role?.toLowerCase();
      if (!user || (role !== 'vendor' && role !== 'admin')) {
        router.replace('/account');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="h-12 w-12 border-4 border-slate-900/10 border-t-amber-500 rounded-full animate-spin" />
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading...</span>
      </div>
    );
  }

  const userRole = user?.role?.toLowerCase();
  if (!user || (userRole !== 'vendor' && userRole !== 'admin')) return null;

  const menuItems = [
    { label: 'Store Overview', href: '/vendor', icon: LayoutDashboard },
    { label: 'My Products', href: '/vendor/products', icon: Package },
    { label: 'Customer Orders', href: '/vendor/orders', icon: ShoppingBag },
    { label: 'Notifications', href: '/vendor/notifications', icon: Bell },
    { label: 'Store Settings', href: '/vendor/settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark' : ''} bg-[#fffefc] dark:bg-slate-950 transition-colors duration-500`}>
      {/* VENDOR SIDEBAR */}
      <aside className="w-72 bg-emerald-950 text-white flex flex-col fixed h-screen z-50 shadow-2xl" data-lenis-prevent>
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex flex-col items-center gap-4">
            <div className="h-20 w-full flex items-center justify-center mb-4">
              <img src="/logo.webp" alt="namma ooru" className="h-full w-auto object-contain" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-[14px] font-black uppercase tracking-widest text-white">Vendor Partner</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-amber-400 mt-2">Control Center</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const cleanPath = pathname.replace(/\/$/, '');
            const cleanHref = item.href.replace(/\/$/, '');
            const isActive = cleanHref === '/vendor' ? cleanPath === '/vendor' : cleanPath.startsWith(cleanHref);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${isActive ? 'bg-amber-400 text-emerald-950 shadow-xl shadow-amber-400/20' : 'text-emerald-100/50 hover:bg-white/5 hover:text-white'}`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-950' : 'text-emerald-100/30 group-hover:text-amber-400'}`} strokeWidth={2.5} />
                <span className="text-[12px] font-black uppercase tracking-widest flex-1">{item.label}</span>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-emerald-950 shadow-sm" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5 mt-auto">
          <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center text-emerald-950">
              <Store size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black text-white truncate">{user?.name || "Namma Partner"}</span>
              <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest mt-1">
                {user?.role?.toLowerCase() === 'admin' ? "Super Admin" : "Managed Store"}
              </span>
            </div>
            <button onClick={logout} className="ml-auto h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-72 relative bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-500">
        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
