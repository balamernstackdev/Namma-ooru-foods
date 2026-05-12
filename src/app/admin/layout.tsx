'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ShoppingBag, Users, BarChart3, Settings,
  LogOut, Bell, List, Layers, Tag, Ticket, Star, Truck,
  RotateCcw, BookOpen, Image as ImageIcon, Mail, ClipboardList,
  ChevronDown, ChevronRight, Shield, Play
} from 'lucide-react';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Dashboard',
    items: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    ]
  },
  {
    label: 'Products',
    items: [
      { label: 'Product Approvals', href: '/admin/products/approvals', icon: Shield, adminOnly: true },
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Categories', href: '/admin/categories', icon: List },
      { label: 'Subcategories', href: '/admin/subcategories', icon: Layers },
      { label: 'Variants', href: '/admin/variants', icon: Layers },
      { label: 'Brands', href: '/admin/brands', icon: Tag },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
      { label: 'Customers', href: '/admin/users', icon: Users },
    ]
  },
  {
    label: 'Marketing',
    items: [
      { label: 'Coupon Engine', href: '/admin/coupons', icon: Ticket },
      { label: 'Reviews', href: '/admin/reviews', icon: Star },
      { label: 'Promotions', href: '/admin/promotions', icon: ClipboardList },
      { label: 'Banners', href: '/admin/banners', icon: ImageIcon },
    ]
  },
  {
    label: 'Tracking',
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
      { label: 'Global Settings', href: '/admin/settings', icon: Settings, adminOnly: true },
    ]
  },
];


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

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <style dangerouslySetInnerHTML={{ __html: `
        .admin-sidebar-nav::-webkit-scrollbar {
          width: 6px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.25);
          border-radius: 20px;
        }
        .admin-sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
      `}} />

      {/* ─── SIDEBAR ─────────────────────────────────────────────────── */}
      <aside className="w-64 bg-gradient-to-b from-[#0f5132] via-[#146c43] to-[#198754] text-white flex flex-col fixed top-0 left-0 bottom-0 z-50 shadow-2xl border-r border-white/5 overflow-hidden" data-lenis-prevent>

        {/* Brand Header */}
        <div className="p-[24px_20px] border-bottom border-white/10 bg-white/[0.03] border-b shrink-0">
          <Link href="/" className="flex items-center gap-4 transition-transform hover:scale-[1.02] active:scale-95">
            <div className="h-12 w-12 flex items-center justify-center flex-shrink-0 bg-white/10 rounded-xl border border-white/10 backdrop-blur">
              <img src="/logo.webp" alt="Logo" className="h-8 w-8 object-contain brightness-0 invert" />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-black tracking-tight leading-none text-white">Namma Orru</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-200 mt-1">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Navigation - Enhanced Scroll Zone */}
        <div className="flex-1 relative min-h-0">
          <nav
            className="admin-sidebar-nav absolute inset-0 overflow-y-auto px-4 py-6 space-y-0.5"
          >
            {navGroups.map(group => {
              const isCollapsed = collapsedGroups.includes(group.label);
              return (
                <div key={group.label} className="mb-4">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-3 py-1.5 mb-1 rounded-lg hover:bg-white/5 transition-all group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e2e8f0] opacity-80 group-hover:opacity-100 transition-opacity">
                      {group.label}
                    </span>
                    <ChevronDown className={`h-3 w-3 text-white/30 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                  </button>

                  {/* Group Items */}
                  <div className="flex flex-col gap-1 mt-1">
                    {!isCollapsed && group.items.map(item => {
                      // Skip if item is adminOnly and user is not admin
                      if ((item as any).adminOnly && userRole !== 'admin') return null;

                      const isActive = item.href === '/admin'
                        ? pathname === '/admin' || pathname === '/admin/'
                        : (pathname === item.href || pathname.startsWith(item.href + '/')) &&
                        !(item.href === '/admin/products' && pathname.startsWith('/admin/products/approvals'));
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`
                            flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group
                            ${isActive
                              ? 'bg-white/[0.16] backdrop-blur-md border border-white/[0.12] text-white shadow-lg'
                              : 'text-[#f8fafc]/70 hover:bg-white/[0.06] hover:text-white border border-transparent'
                            }
                          `}
                        >
                          <item.icon
                            className={`
                              h-[18px] w-[18px] shrink-0 transition-all duration-200
                              ${isActive ? 'text-white opacity-100 scale-110 translate-x-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-[#cbd5e1] opacity-70 group-hover:opacity-100 group-hover:scale-105'}
                            `}
                            strokeWidth={isActive ? 2.5 : 2}
                          />
                          <span className={`text-[13.5px] font-semibold flex-1 tracking-wide ${isActive ? 'text-white font-bold' : 'text-[#f8fafc]'}`}>
                            {item.label}
                          </span>
                          {isActive && (
                             <div className="h-1.5 w-1.5 rounded-full bg-white shadow-[0_0_8px_#fff]" />
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

        {/* User Footer - Glass Container */}
        <div className="shrink-0 p-4 bg-white/[0.02] border-t border-white/10">
          <div className="bg-white/[0.08] backdrop-blur-xl border border-white/[0.08] rounded-[18px] p-3 flex items-center gap-3 shadow-lg">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 border border-white/20 flex items-center justify-center text-xs font-black shrink-0 overflow-hidden text-white shadow-inner">
              {(user.avatar && user.avatar.trim() !== '') ? <img src={user.avatar || undefined} className="w-full h-full object-cover" alt="avatar" /> : (user.name?.[0] || 'A')}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[12px] font-bold tracking-tight leading-none text-white truncate">{user.name || 'Administrator'}</span>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-100 opacity-80 mt-1.5">
                {userRole === 'admin' ? 'Super Admin' : 'Vendor'}
              </span>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="h-8 w-8 rounded-xl bg-white/[0.1] border border-white/10 flex items-center justify-center text-white hover:bg-red-500 hover:border-red-400 transition-all duration-300 shrink-0 group shadow-sm active:scale-90"
            >
              <LogOut size={14} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────────────── */}
      <main className="flex-1 ml-64 min-w-0 relative overflow-x-hidden">

        {/* Dynamic Content */}
        <div className="p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
