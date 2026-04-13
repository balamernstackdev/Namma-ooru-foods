'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  Tag, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  Bell,
  Image as ImageIcon
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: Layers },
  { name: 'Brands', href: '/admin/brands', icon: Tag },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Promotions', href: '/admin/promotions', icon: ImageIcon },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3 },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-[var(--border)] bg-[var(--card)] px-4 py-8">
      <div className="mb-10 px-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-[var(--primary)]">
          Namma Orru <span className="text-[var(--secondary)] font-medium">Admin</span>
        </Link>
      </div>

      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${
                isActive 
                ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20' 
                : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-8 left-0 w-full px-4">
        <button className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-all">
          <Settings className="h-5 w-5" />
          Settings
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
