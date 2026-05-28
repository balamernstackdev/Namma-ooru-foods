'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Layers, Tag, ShoppingCart, Users,
  BarChart3, Settings, Bell, Image as ImageIcon, Ticket, Star,
  Truck, RotateCcw, BookOpen, ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const navGroups = [
  {
    label: 'Core',
    items: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
      { name: 'Products', href: '/admin/products', icon: Package },
      { name: 'Categories', href: '/admin/categories', icon: Layers },
      { name: 'Brands', href: '/admin/brands', icon: Tag },
      { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Users', href: '/admin/users', icon: Users },
    ]
  },
  {
    label: 'Commerce',
    items: [
      { name: 'Coupons', href: '/admin/coupons', icon: Ticket },
      { name: 'Reviews', href: '/admin/reviews', icon: Star },
      { name: 'Promotions', href: '/admin/promotions', icon: ImageIcon },
      { name: 'Banners', href: '/admin/banners', icon: ImageIcon },
    ]
  },
  {
    label: 'Fulfillment',
    items: [
      { name: 'Shipment Tracker', href: '/admin/tracking', icon: Truck },
      { name: 'Refund Requests', href: '/admin/refunds', icon: RotateCcw },
    ]
  },
  {
    label: 'Content',
    items: [
      { name: 'Blog / Articles', href: '/admin/blog', icon: BookOpen },
      { name: 'Notifications', href: '/admin/notifications', icon: Bell },
    ]
  },
  {
    label: 'Analytics',
    items: [
      { name: 'Reports', href: '/admin/analytics', icon: BarChart3 },
    ]
  }
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState<string[]>([]);

  const toggleGroup = (label: string) => {
    setCollapsed(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-[var(--border)] bg-[var(--card)] flex flex-col overflow-y-auto">
      <div className="px-6 py-7 border-b border-[var(--border)] shrink-0">
        <Link href="/" className="block">
          <span className="text-lg font-black tracking-tight text-[var(--primary)]">namma ooru</span>
          <span className="block text-[10px] font-black uppercase tracking-[0.3em] text-[var(--secondary)] opacity-60 mt-0.5">Command Center</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navGroups.map(group => {
          const isCollapsed = collapsed.includes(group.label);
          return (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 py-1.5 mb-1"
              >
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[var(--muted-foreground)] opacity-50">{group.label}</span>
                <ChevronDown className={`h-3 w-3 text-[var(--muted-foreground)] opacity-40 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
              </button>
              {!isCollapsed && group.items.map(item => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all ${isActive
                      ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20'
                      : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
                      }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-[var(--border)] shrink-0">
        <Link href="/admin/settings" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[13px] font-bold text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
