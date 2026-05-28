'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

const FloatingCartBar = () => {
  const { cart, getTotal, setIsOpen } = useCartStore();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const prevCartCountRef = React.useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-hide logic: Show for 3 seconds ONLY when an item is added / quantity increases
  useEffect(() => {
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    
    // Initialize ref on first load or when count is null
    if (prevCartCountRef.current === null) {
      prevCartCountRef.current = totalItems;
      return;
    }

    // Only trigger visibility if the total items count increased
    if (totalItems > prevCartCountRef.current) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 3000);
      prevCartCountRef.current = totalItems;
      return () => clearTimeout(timer);
    }

    prevCartCountRef.current = totalItems;
  }, [cart]);

  if (!mounted) return null;

  // Don't show on cart, checkout, admin, or vendor pages
  const isExcluded = 
    pathname.startsWith('/admin') ||
    pathname.startsWith('/vendor') ||
    pathname.startsWith('/checkout') ||
    pathname.startsWith('/cart');

  if (isExcluded) return null;

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = getTotal();

  return (
    <AnimatePresence>
      {isVisible && totalItems > 0 && (
        <motion.div
          initial={{ y: 150, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 150, opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[110] w-[92%] sm:w-[420px] max-w-lg cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <div className="bg-gradient-to-r from-[#022c22] to-[#047857] backdrop-blur-xl bg-opacity-90 rounded-full p-2 shadow-[0_20px_50px_-10px_rgba(4,120,87,0.6)] border border-[#34d399]/20 flex items-center justify-between group overflow-hidden relative">
             
             {/* Shine Effect */}
             <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none" />

             {/* Left: Info */}
             <div className="flex items-center gap-3 pl-2">
               <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform relative">
                  <ShoppingCart size={18} className="text-white" />
                  <motion.span 
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-[#34d399] text-[#064e3b] text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#022c22]"
                  >
                    {totalItems}
                  </motion.span>
               </div>
               <div className="flex flex-col justify-center">
                  <span className="text-white font-black text-[15px] leading-tight tracking-tight">₹{totalAmount}</span>
                  <span className="text-emerald-100/70 text-[11px] font-bold tracking-wider uppercase leading-tight mt-0.5">{totalItems} Item{totalItems > 1 ? 's' : ''} added</span>
               </div>
             </div>

             {/* Right: Action */}
             <div className="flex items-center gap-2 pr-5 pl-4 py-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <span className="text-white font-bold text-[13px] tracking-wide">View Cart</span>
                <ArrowRight size={16} className="text-white group-hover:translate-x-1 transition-transform" />
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingCartBar;
