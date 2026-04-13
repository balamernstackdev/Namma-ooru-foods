'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, Home, LayoutGrid, TrendingUp, Star, Tag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cart, setIsOpen } = useCartStore();

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 w-full flex flex-col bg-white border-b border-slate-100 shadow-sm">
      {/* PRIMARY TIER */}
      <div className="w-full bg-white">
        <div className="standard-container mx-auto px-4 md:px-0 h-24 flex items-center justify-between gap-16 md:gap-24">
          {/* LOGO: Anchored Left */}
          <Link href="/" className="shrink-0">
            <Image src="/logo.webp" alt="Namma Orru Foods" width={180} height={54} priority className="h-12 md:h-14 w-auto object-contain" />
          </Link>

          {/* SEARCH BAR: Balanced Center */}
          <div className="hidden md:flex flex-1 relative group">
            <div className="flex h-14 w-full items-center rounded-xl border-2 border-slate-100 focus-within:border-emerald-600 transition-all overflow-hidden bg-slate-50/50">
              <button className="h-full px-6 bg-white border-r border-slate-100 flex items-center gap-2 text-[10px] font-black text-emerald-950 uppercase tracking-widest hover:bg-slate-50">
                All <ChevronRight className="h-4 w-4 rotate-90" />
              </button>
              <input
                type="text"
                placeholder="Search across 8,000+ organic harvests..."
                className="flex-1 h-full px-6 bg-transparent text-[15px] font-bold outline-none placeholder:text-slate-400 text-emerald-950"
              />
              <button className="h-full px-8 bg-emerald-950 text-white hover:bg-emerald-800 transition-colors">
                <Search className="h-5 w-5" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* UTILITIES: Anchored Right */}
          <div className="flex items-center gap-8 lg:gap-12 shrink-0">
            <Link href="/account" className="hidden sm:flex items-center gap-4 group">
               <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-all">
                  <User className="h-6 w-6 text-emerald-950" />
               </div>
               <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account</span>
                  <span className="text-[12px] font-black text-emerald-950 whitespace-nowrap">My Profile</span>
               </div>
            </Link>

            <button onClick={() => setIsOpen(true)} className="group flex items-center gap-4">
              <div className="relative h-12 w-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-all">
                <ShoppingCart className="h-6 w-6 text-emerald-950" />
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-emerald-950 border-2 border-white shadow-sm">
                  {cart.length}
                </div>
              </div>
              <div className="hidden lg:flex flex-col">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basket</span>
                  <span className="text-[12px] font-black text-emerald-950">My Cart</span>
              </div>
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="lg:hidden h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-950 flex items-center justify-center text-white shadow-xl active:scale-90 transition-all z-[60]"
            >
              {isMenuOpen ? <X className="h-5 w-5 md:h-6 md:w-6" strokeWidth={3} /> : <Menu className="h-5 w-5 md:h-6 md:w-6" strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>

      {/* SECONDARY TIER: Perfected Alignment */}
      <div className="w-full bg-slate-50 border-t border-slate-100 h-14 flex items-center">
        <div className="standard-container mx-auto px-4 md:px-0 flex items-center gap-16 md:gap-20 overflow-x-auto no-scrollbar">
            <button className="flex items-center gap-3 text-emerald-950 text-[11px] font-black uppercase tracking-widest hover:text-emerald-600 transition-colors shrink-0 whitespace-nowrap">
              <Menu className="h-5 w-5" /> Shop Categories
            </button>
            
            <div className="h-5 w-[1px] bg-slate-200 shrink-0" />

            <div className="flex items-center gap-16 md:gap-20">
              {[
                { name: 'Best Sellers', href: '/best-selling', badge: 'Hot' },
                { name: 'Combo Deals', href: '/promotions', badge: 'New' },
                { name: 'Daily Fresh', href: '/special', badge: 'Off' },
                { name: 'Our Vision', href: '/about' }
              ].map((item) => (
                <Link 
                  key={item.name} 
                  href={item.href} 
                  className="relative group flex items-center gap-2 text-emerald-950/70 text-[11px] font-black uppercase tracking-widest hover:text-emerald-950 transition-all whitespace-nowrap"
                >
                  {item.name}
                  {item.badge && (
                    <div className={`px-2 py-0.5 text-[7px] rounded-sm text-white font-black uppercase ${item.badge === 'Hot' ? 'bg-amber-500' : 'bg-emerald-600'}`}>
                      {item.badge}
                    </div>
                  )}
                  <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 transition-all group-hover:w-full" />
                </Link>
              ))}
            </div>
        </div>
      </div>

      {/* MOBILE MENU: HIGH-FIDELITY OVERLAY */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] bg-white animate-in slide-in-from-right duration-500 overflow-y-auto">
          {/* Menu Header */}
          <div className="px-6 h-24 flex items-center justify-between border-b border-slate-50">
             <Image src="/logo.webp" alt="Namma Orru Foods" width={140} height={42} className="h-10 w-auto object-contain" />
             <button 
               onClick={() => setIsMenuOpen(false)}
               className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-[#022c22]"
             >
               <X size={24} />
             </button>
          </div>

          <div className="px-8 py-10 flex flex-col min-h-[calc(100vh-6rem)]">
            {/* Navigation Links */}
            <div className="flex flex-col gap-2 mb-12">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 mb-6 pl-2">Navigation</span>
               {[
                 { name: 'Home', href: '/', icon: Home },
                 { name: 'Harvest Categories', href: '/categories', icon: LayoutGrid },
                 { name: 'Best Selling Vault', href: '/best-selling', icon: TrendingUp },
                 { name: 'Exclusive Offers', href: '/promotions', icon: Tag },
                 { name: 'Our Heritage', href: '/about', icon: Star }
               ].map((item) => (
                 <Link 
                   key={item.name} 
                   href={item.href} 
                   onClick={() => setIsMenuOpen(false)} 
                   className="group flex items-center justify-between py-5 px-4 rounded-2xl hover:bg-slate-50 transition-all border-b border-slate-50"
                 >
                   <div className="flex items-center gap-5">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all">
                         <item.icon size={20} />
                      </div>
                      <span className="text-[14px] font-black text-[#022c22] uppercase tracking-widest">{item.name}</span>
                   </div>
                   <ChevronRight className="h-5 w-5 text-slate-200" />
                 </Link>
               ))}
            </div>
            
            {/* Primary Action */}
            <Link 
              href="/account" 
              onClick={() => setIsMenuOpen(false)} 
              className="w-full h-18 rounded-[2rem] bg-emerald-950 flex items-center justify-center gap-4 shadow-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              <User size={18} className="text-amber-400" />
              <span className="text-white text-[11px] font-black uppercase tracking-[0.3em]">SECURE MEMBER VAULT</span>
            </Link>

            {/* Brand Storytelling in Menu */}
            <div className="mt-auto pt-16 pb-8">
               <div className="p-8 rounded-[2.5rem] bg-amber-50 border border-amber-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 h-32 w-32 bg-amber-200/20 rounded-full blur-3xl" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-3">Community Hub</p>
                  <p className="text-[13px] font-bold text-[#022c22] leading-relaxed mb-6">
                    Direct access to South Indian sustainable farm clusters.
                  </p>
                  <div className="flex gap-4">
                     <div className="h-8 w-8 rounded-full bg-white border border-amber-100 flex items-center justify-center">
                        <Star size={14} className="text-amber-500" />
                     </div>
                     <span className="text-[10px] font-black uppercase tracking-widest text-[#022c22]/60 flex items-center">Verified Members</span>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
