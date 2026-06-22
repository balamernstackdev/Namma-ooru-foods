'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { User, Heart, Package, MapPin, CreditCard, Bell, Settings, LogOut, ChevronRight, LayoutDashboard, RefreshCcw } from 'lucide-react';

import { useRouter } from 'next/navigation';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Redirect to login if unauthenticated on protected sub-pages, or redirect vendors to their control center
  React.useEffect(() => {
    document.body.style.overflow = 'auto';
    window.scrollTo(0, 0);

    if (!isLoading) {
      if (!user && pathname !== '/account' && pathname !== '/account/') {
        router.replace('/account');
      } else if (user?.role?.toLowerCase() === 'vendor') {
        router.replace('/vendor');
      }
    }
  }, [user, isLoading, pathname, router]);

  const isBaseAccount = pathname === '/account' || pathname === '/account/';

  // 1. Loading State - Show a premium loader instead of naked children
  if (isLoading && !isBaseAccount) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-emerald-900/5 border-t-emerald-900 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <User className="h-6 w-6 text-emerald-900/20" />
          </div>
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.4em] text-emerald-900/40 animate-pulse">
          Verifying Identity
        </p>
      </div>
    );
  }

  // 2. Redirect Guard - Kick out if not logged in on protected sub-pages
  if (!user && !isBaseAccount) {
    return null; // The useEffect will handle redirect
  }

  // 3. Guest Entry - On /account base page for login/signup
  if (!user || isBaseAccount) {
    return <>{children}</>;
  }

  const menuItems = [
    { label: 'My Profile', href: '/account/profile', icon: User },
    // Inject Admin Link for privileged roles
    ...((user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase() === 'vendor') ? [
      {
        label: 'Admin Panel',
        href: user.role.toLowerCase() === 'vendor' ? '/vendor' : '/admin',
        icon: LayoutDashboard
      }
    ] : []),
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
    { label: 'My Orders', href: '/account/orders', icon: Package },
    { label: 'Payments', href: '/account/payments', icon: CreditCard },
    { label: 'Refund Requests', href: '/account/refund-requests', icon: RefreshCcw },
  ];


  // 3. Render
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* 
        If it's the base /account page, we render the children (Login/Signup) 
        directly as it has its own centering logic.
        If it's a sub-page (/account/profile, etc.), we apply the sidebar layout.
      */}
      {!isBaseAccount ? (
        <div className="standard-container mx-auto py-8 md:py-12 flex-1 flex flex-col md:flex-row gap-8">

          {/* SIDEBAR - Persistent on Desktop */}
          <aside className="w-full md:w-80 shrink-0 hidden md:block">
            <div className="sticky top-28 space-y-6">


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
      ) : (
        children
      )}
    </div>
  );
}
