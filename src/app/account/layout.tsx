'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Heart, Package, MapPin, CreditCard, Bell, Settings, LogOut, ChevronRight, LayoutDashboard } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to login if unauthenticated on protected sub-pages
  React.useEffect(() => {
    if (!isLoading && !user && pathname !== '/account') {
      router.replace('/account');
    }
  }, [user, isLoading, pathname, router]);

  // While loading or on main /account page for guest, we don't show the layout wrapper
  if (isLoading || !user || pathname === '/account') {
    return <>{children}</>;
  }

  const menuItems = [
    { label: 'My Profile', href: '/account/profile', icon: User },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'My Orders', href: '/account/orders', icon: Package },
    { label: 'Track Order', href: '/account/tracking', icon: MapPin },
    { label: 'Payments', href: '/account/payments', icon: CreditCard },
    { label: 'Notifications', href: '/account/notifications', icon: Bell },
    { label: 'Settings', href: '/account/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <div className="standard-container mx-auto py-8 md:py-12 flex-1 flex flex-col md:flex-row gap-8">

        {/* SIDEBAR - Persistent on Desktop, relative on Mobile if we want it above content */}
        <aside className="w-full md:w-80 shrink-0 hidden md:block">
          <div className="sticky top-28 space-y-6">

            {/* User Profile Card - Compact Horizontal */}
            <div className="bg-emerald-950 rounded-[2rem] p-4 text-white shadow-premium relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-amber-400 shrink-0 shadow-lg">
                  {user.avatar
                    ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    : <div className="h-full w-full bg-emerald-800 flex items-center justify-center text-sm font-black">{user.name[0]}</div>
                  }
                </div>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-[12px] font-black tracking-tight leading-tight truncate">{user.name}</h2>
                  <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest opacity-80 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden p-2">
              <div className="flex flex-col gap-1">
                {menuItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all group ${isActive ? 'bg-emerald-950 text-white shadow-lg shadow-emerald-900/10' : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-950'}`}
                    >
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-emerald-800 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600'}`}>
                        <item.icon className="h-5 w-5" strokeWidth={2.5} />
                      </div>
                      <span className="text-[13px] font-black uppercase tracking-widest flex-1">{item.label}</span>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40 group-hover:translate-x-1'}`} strokeWidth={3} />
                    </Link>
                  );
                })}

                <div className="h-px bg-slate-50 my-2 mx-4" />

                <button
                  onClick={logout}
                  className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-red-500 hover:bg-red-50 transition-all group"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-100 group-hover:text-red-500 transition-all">
                    <LogOut className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <span className="text-[13px] font-black uppercase tracking-widest">Sign Out</span>
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {children}
        </main>

      </div>
    </div>
  );
}
