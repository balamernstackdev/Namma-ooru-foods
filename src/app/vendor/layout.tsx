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
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationCenter from '@/components/vendor/NotificationCenter';

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
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Opening Portal...</span>
      </div>
    );
  }

  const userRole = user?.role?.toLowerCase();
  if (!user || (userRole !== 'vendor' && userRole !== 'admin')) return null;

  const menuItems = [
    { label: 'Store Overview', href: '/vendor', icon: LayoutDashboard },
    { label: 'My Products', href: '/vendor/products', icon: Package },
    { label: 'Categories', href: '/vendor/categories', icon: List },
    { label: 'Variants', href: '/vendor/variants', icon: Layers },
    { label: 'Customer Orders', href: '/vendor/orders', icon: ShoppingBag },
    { label: 'Store Settings', href: '/vendor/settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen flex ${theme === 'dark' ? 'dark' : ''} bg-[#fffefc] dark:bg-slate-950 transition-colors duration-500`}>
      {/* VENDOR SIDEBAR */}
      <aside className="w-72 bg-emerald-950 text-white flex flex-col fixed h-screen z-50 shadow-2xl" data-lenis-prevent>
        <div className="p-8 border-b border-white/5">
          <Link href="/" className="flex flex-col items-center gap-4">
            <div className="h-20 w-full flex items-center justify-center mb-4">
              <img src="/logo.webp" alt="Namma Orru" className="h-full w-auto object-contain" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-[14px] font-black uppercase tracking-widest text-white">Vendor Partner</span>
              <span className="text-[8px] font-bold uppercase tracking-[0.4em] text-amber-400 mt-2">Control Center</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
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
                <span className="text-[11px] font-black text-white truncate">Namma Reseller Store</span>
                <span className="text-[8px] font-bold text-amber-400 uppercase tracking-widest mt-1">Managed Store</span>
             </div>
             <button onClick={logout} className="ml-auto h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all">
                <LogOut size={14} />
             </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 ml-72 relative bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-500">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800 px-10 h-24 flex items-center justify-between transition-colors duration-500">
          <div className="flex items-center gap-6">
             <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-900 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                {React.createElement(menuItems.find(i => i.href === pathname)?.icon || LayoutDashboard, { size: 20 })}
             </div>
             <h1 className="text-xl font-black text-emerald-950 dark:text-white tracking-tighter">
               {menuItems.find(i => i.href === pathname)?.label || 'Overview'}
             </h1>
          </div>

          <div className="flex items-center gap-6">
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="h-12 w-12 rounded-full border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-amber-500 transition-all shadow-sm"
            >
              <AnimatePresence mode="wait">
                {theme === 'light' ? (
                  <motion.div key="sun" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}><Sun size={20} /></motion.div>
                ) : (
                  <motion.div key="moon" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0, rotate: 90 }}><Moon size={20} /></motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            <NotificationCenter />

            <div className="flex items-center gap-3 pl-4 border-l border-slate-100 dark:border-slate-800">
               <div className="flex flex-col items-end">
                  <span className="text-[11px] font-black text-emerald-950 dark:text-white uppercase tracking-tight">{user.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">Verified Partner</span>
               </div>
               <div className="h-12 w-12 rounded-full border-2 border-amber-400 overflow-hidden shadow-sm">
                  <img src={user.avatar || '/placeholder-avatar.jpg'} alt="" className="w-full h-full object-cover" />
               </div>
            </div>
          </div>
        </header>

        <div className="p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
