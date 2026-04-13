'use client';

import React from 'react';
import Link from 'next/link';
import { Home, LayoutGrid, ShoppingCart, User, Zap } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const BottomNav = () => {
  const { cart } = useCartStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] block bg-white/90 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] lg:hidden">
      <div className="flex h-20 items-center justify-around px-4 pb-2">
        <Link href="/" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-700 transition-all active:scale-90">
          <Home className="h-6 w-6" strokeWidth={2} />
          <span className="text-[9px] font-black uppercase tracking-widest text-inherit">Home</span>
        </Link>
        <Link href="/categories" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-700 transition-all active:scale-90">
          <LayoutGrid className="h-6 w-6" strokeWidth={2} />
          <span className="text-[9px] font-black uppercase tracking-widest text-inherit">Shop</span>
        </Link>
        <Link href="/cart" className="relative flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-700 transition-all active:scale-90">
          <div className="relative">
            <ShoppingCart className="h-6 w-6" strokeWidth={2} />
            {cart.length > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[8px] font-black text-white shadow-lg shadow-amber-500/50">
                {cart.length}
              </span>
            )}
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-inherit">Cart</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-emerald-700 transition-all active:scale-90">
          <User className="h-6 w-6" strokeWidth={2} />
          <span className="text-[9px] font-black uppercase tracking-widest text-inherit">Account</span>
        </Link>
        <Link href="/promotions" className="flex flex-col items-center gap-1.5 text-amber-500 transition-all active:scale-90">
          <Zap className="h-6 w-6 fill-amber-500" strokeWidth={2} />
          <span className="text-[9px] font-black uppercase tracking-widest text-inherit">Deals</span>
        </Link>
      </div>
    </div>

  );
};

export default BottomNav;
