'use client';

import React, { useState, useEffect } from 'react';
import { ChevronUp, MessageCircle, Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';

const StickyAssistant = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { cart, setIsOpen } = useCartStore();

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* Desktop Floating Actions */}
      <div className="fixed bottom-10 right-10 z-[140] hidden md:flex flex-col gap-4">
        {isVisible && (
          <button
            onClick={scrollToTop}
            className="h-14 w-14 rounded-full bg-white border border-slate-100 text-emerald-950 flex items-center justify-center shadow-premium hover:bg-emerald-950 hover:text-white transition-all hover:-translate-y-2 animate-in fade-in slide-in-from-bottom-4"
          >
            <ChevronUp size={24} strokeWidth={3} />
          </button>
        )}
        
        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="h-14 w-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-premium hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95"
        >
          <MessageCircle size={28} className="fill-white" />
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 border-2 border-white rounded-full animate-ping" />
        </a>
      </div>

      {/* Mobile Sticky Tab Bar (Easy Navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[140] bg-white/80 backdrop-blur-xl border-t border-slate-100 px-2 py-3 pb-8 flex items-center justify-between">
        <Link href="/" className="flex-1 flex flex-col items-center gap-1">
          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-emerald-950 transition-all">
            <Home size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Home</span>
        </Link>

        <Link href="/products" className="flex-1 flex flex-col items-center gap-1">
          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <LayoutGrid size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Shop</span>
        </Link>
        
        {/* Central Cart Bubble */}
        <div className="flex-shrink-0 -mt-10 px-4">
          <button 
            onClick={() => setIsOpen(true)}
            className="h-16 w-16 rounded-full bg-emerald-950 text-white flex items-center justify-center shadow-2xl border-4 border-white relative active:scale-90 transition-all"
          >
            <ShoppingCart size={24} strokeWidth={3} />
            {cart.length > 0 && (
              <div className="absolute top-2 right-2 h-5 w-5 bg-amber-500 text-emerald-950 text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">
                {cart.length}
              </div>
            )}
          </button>
        </div>

        <Link href="/promotions" className="flex-1 flex flex-col items-center gap-1">
          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <MessageCircle size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deals</span>
        </Link>

        <Link href="/account" className="flex-1 flex flex-col items-center gap-1">
          <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
            <User size={20} strokeWidth={2.5} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Vault</span>
        </Link>
      </div>
    </>
  );
};

export default StickyAssistant;
