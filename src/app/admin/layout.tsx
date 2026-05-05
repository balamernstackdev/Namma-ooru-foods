'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings,
  LogOut, Bell, Search, List, Layers, Tag, Ticket, Star, Truck,
  RotateCcw, BookOpen, Image as ImageIcon, Mail, ClipboardList,
  ChevronDown, ChevronRight, Shield, Play
} from 'lucide-react';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Core',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: List },
      { label: 'Variants', href: '/admin/variants', icon: Layers },
      { label: 'Brands', href: '/admin/brands', icon: Tag },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Customers', href: '/admin/users', icon: Users },
    ]
  },
  {
    label: 'Commerce',
    items: [
      { label: 'Coupon Engine', href: '/admin/coupons', icon: Ticket },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
      { label: 'Promotions', href: '/admin/promotions', icon: ClipboardList },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
    ]
  },
  {
    label: 'Fulfillment',
    items: [
      { label: 'Shipment Tracker', href: '/admin/tracking', icon: Truck },
      { label: 'Refund Requests', href: '/admin/refunds', icon: RotateCcw },
    ]
  },
  {
    label: 'Content',
    items: [
      { label: 'Video Stories', href: '/admin/videos', icon: Play },
      { label: 'Blog / Articles', href: '/admin/blog', icon: BookOpen },
      { label: 'Notifications', href: '/admin/notifications', icon: Bell },
      { label: 'Newsletter', href: '/admin/newsletter', icon: Mail },
    ]
  },
  {
    label: 'System',
    items: [
      { label: 'Audit Trail', href: '/admin/audit', icon: Shield },
      { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    ]
  },
];

// Flat list for header title lookup
const allMenuItems = navGroups.flatMap(g => g.items);

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);

  React.useEffect(() => {
    if (!isLoading) {
      const role = user?.role?.toLowerCase();
      if (!user || (role !== 'admin' && role !== 'vendor')) {
        router.replace('/account');
      }
    }
  }, [user, isLoading, router]);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    
    // Auto-expand the group that contains the active route
    const activeGroup = navGroups.find(group => 
      group.items.some(item => 
        item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
      )
    );
    if (activeGroup) {
      setCollapsedGroups(prev => prev.filter(g => g !== activeGroup.label));
    }
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--admin-muted)]">
        <div className="h-12 w-12 border-4 border-slate-900/10 border-t-[var(--primary)] rounded-full animate-spin" />
        <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-900/40">Loading Dashboard...</span>
      </div>
    );
  }

  const userRole = user?.role?.toLowerCase();
  if (!user || (userRole !== 'admin' && userRole !== 'vendor')) return null;

  const toggleGroup = (label: string) => {
    setCollapsedGroups(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  // Current page label for the header
  const currentLabel = allMenuItems.find(i =>
    i.href === pathname || (i.href !== '/admin' && pathname.startsWith(i.href))
  )?.label || 'Dashboard';

  return (
    <div className="min-h-screen bg-[var(--admin-muted)] flex">

      {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="w-72 bg-[var(--admin-sidebar)] text-white flex flex-col fixed top-0 left-0 bottom-0 z-50 shadow-2xl overflow-hidden" data-lenis-prevent>

        {/* Brand Header */}
        <div className="p-6 border-b border-white/5 shrink-0">
          <Link href="/" className="flex flex-col items-center gap-3">
            <div className="h-16 w-full flex items-center justify-center">
              <img src="/logo.webp" alt="Logo" className="h-full w-auto object-contain" />
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-[16px] font-black uppercase tracking-tighter leading-none text-white">Namma Orru Foods</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[var(--admin-accent)] mt-1.5">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation - Enhanced Scroll Zone */}
        <div className="flex-1 relative min-h-0">
          <nav 
            className="admin-sidebar-nav absolute inset-0 overflow-y-auto px-3 py-4 space-y-1" 
          >
            {navGroups.map(group => {
              const isCollapsed = collapsedGroups.includes(group.label);
              return (
                <div key={group.label} className="mb-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-2 mb-0.5 rounded-xl hover:bg-white/5 transition-all group"
                  >
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-white/50 transition-colors">
                      {group.label}
                    </span>
                    {isCollapsed
                      ? <ChevronRight className="h-3 w-3 text-white/20" />
                      : <ChevronDown className="h-3 w-3 text-white/20" />
                    }
                  </button>

                  {/* Group Items */}
                  {!isCollapsed && group.items.map(item => {
                    const isActive = item.href === '/admin'
                      ? pathname === '/admin' || pathname === '/admin/'
                      : pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all group mb-0.5 ${
                          isActive
                            ? 'bg-[var(--admin-accent)] text-[var(--admin-sidebar)] shadow-xl shadow-[var(--admin-accent)]/20'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 shrink-0 ${isActive ? 'text-[var(--admin-sidebar)]' : 'text-slate-500 group-hover:text-[var(--admin-accent)]'}`}
                          strokeWidth={2.5}
                        />
                        <span className="text-[12px] font-black uppercase tracking-widest flex-1">{item.label}</span>
                        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-[var(--admin-sidebar)]" />}
                      </Link>
                    );
                  })}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Settings + User Footer (Ultra-Compact) */}
        <div className="shrink-0 bg-[var(--admin-sidebar)] border-t border-white/5">
          <div className="px-3 pt-1">
            <Link
              href="/admin/settings"
              className={`flex items-center gap-3.5 px-4 py-2 rounded-xl transition-all group ${pathname.startsWith('/admin/settings') ? 'bg-[var(--admin-accent)] text-[var(--admin-sidebar)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            >
              <Settings className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-[var(--admin-accent)]" strokeWidth={2.5} />
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Settings</span>
            </Link>
          </div>
          <div className="px-3 pb-3 pt-1">
            <div className="bg-white/5 rounded-2xl p-2.5 flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-slate-800 border-2 border-[var(--admin-accent)] flex items-center justify-center text-[9px] font-black shrink-0 overflow-hidden">
                {(user.avatar && user.avatar.trim() !== '') ? <img src={user.avatar || undefined} className="w-full h-full object-cover" alt="avatar" /> : (user.name?.[0] || 'A')}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-[9px] font-black tracking-tight leading-none text-white truncate">{user.name}</span>
                <span className="text-[6px] font-bold text-[var(--admin-accent)] uppercase tracking-widest leading-none mt-1">
                  {userRole === 'admin' ? 'Super Admin' : 'Partner'}
                </span>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all shrink-0"
              >
                <LogOut size={12} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 ml-72 min-w-0 relative overflow-x-hidden">

        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-10 h-24 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-black text-[var(--admin-sidebar)] tracking-tighter">
              {currentLabel}
            </h1>
            <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-full w-80">
              <Search className="h-4 w-4 text-slate-300" />
              <input
                type="text"
                placeholder="Global Search..."
                className="bg-transparent border-none outline-none text-xs font-bold text-[var(--admin-sidebar)] placeholder:text-slate-300 w-full"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/admin/notifications">
              <button className="h-12 w-12 rounded-full border border-slate-100 bg-white flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all relative">
                <Bell size={20} />
                <div className="absolute top-3 right-3.5 h-2 w-2 bg-[var(--admin-accent)] rounded-full border-2 border-white" />
              </button>
            </Link>
            <div className="h-12 px-5 rounded-full border border-slate-100 bg-white flex items-center gap-3">
              <div className="h-6 w-6 rounded-full bg-[var(--admin-sidebar)] flex items-center justify-center text-[10px] text-white font-black">
                {userRole === 'admin' ? 'A' : 'V'}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--admin-sidebar)]">
                {userRole === 'admin' ? 'Admin Mode' : 'Vendor Mode'}
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
