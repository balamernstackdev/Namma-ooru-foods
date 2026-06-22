'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, ShoppingCart, User, Heart } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { motion } from 'framer-motion';

const MobileBottomNav = () => {
  const pathname = usePathname();
  const { cart } = useCartStore();
  const cartCount = cart.length;

  const navItems = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'Search', icon: Search, href: '/search' },
    { name: 'Cart', icon: ShoppingCart, href: '/cart', badge: cartCount },
    { name: 'Wishlist', icon: Heart, href: '/account/wishlist' },
    { name: 'Profile', icon: User, href: '/account' },
  ];

  // Hide on dashboard paths
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/vendor') || pathname?.startsWith('/hub');
  const isCheckout = pathname === '/checkout';
  
  if (isDashboard || isCheckout) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-xl border-t border-slate-100 px-6 h-20 flex items-center justify-between pb-2">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            className="relative flex flex-col items-center justify-center gap-1 group w-12"
          >
            {isActive && (
              <motion.div 
                layoutId="activeNav"
                className="absolute -top-3 w-10 h-1 bg-emerald-600 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <div className={`relative transition-all duration-300 ${isActive ? 'text-emerald-600 scale-110 -translate-y-1' : 'text-slate-400'}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-2 -right-2 h-4 w-4 bg-amber-500 text-emerald-950 text-[9px] font-black rounded-full flex items-center justify-center border border-white">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={`text-[8px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-emerald-950 font-black' : 'text-slate-400 font-bold'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default MobileBottomNav;
