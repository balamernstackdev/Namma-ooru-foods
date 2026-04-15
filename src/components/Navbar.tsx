'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, Home, LayoutGrid, TrendingUp, Star, Tag, ChevronRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cart, setIsOpen } = useCartStore();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categoriesMenu = [
    { name: 'Grains & Pulses', sub: ['Toor Dal', 'Urad Dal', 'Moong Dal', 'Traditional Rice', 'Millets'] },
    { name: 'Organic Oils', sub: ['Groundnut Oil', 'Sesame Oil', 'Coconut Oil', 'Castor Oil'] },
    { name: 'Authentic Spices', sub: ['Turmeric Powder', 'Chilli Powder', 'Whole Spices', 'Homemade Masalas'] },
    { name: 'Dairy Products', sub: ['A2 Milk', 'Paneer', 'Organic Butter', 'Desi Ghee'] },
    { name: 'Indian Snacks', sub: ['Murukku', 'Mixture', 'Seedattal', 'Chips'] },
    { name: 'Local Sweets', sub: ['Mysore Pak', 'Ladoo', 'Halwa', 'Jaggery Sweets'] },
    { name: 'Cold Pressed', sub: ['Almond Oil', 'Mustard Oil', 'Neem Oil'] },
    { name: 'Pickles & Pastes', sub: ['Mango Pickle', 'Garlic Pickle', 'Ginger Paste', 'Tomato Thokku'] }
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-[150] w-full flex flex-col bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm mb-0">

      {/* PRIMARY TIER */}
      <div className="w-full">
        <div className={`standard-container mx-auto flex items-center justify-between gap-4 md:gap-24 py-1 transition-all duration-500 ${scrolled ? 'h-12 md:h-16' : 'h-14 md:h-20'}`}>
          {/* LOGO: Anchored Left */}
          <Link href="/" className="shrink-0 flex items-center transition-transform hover:scale-105">
            <Image
              src="/logo.webp"
              alt="Namma Orru Foods"
              width={140}
              height={40}
              priority
              style={{ height: scrolled ? '24px' : '28px', width: 'auto', objectFit: 'contain' }}
              className={`transition-all duration-500 ${scrolled ? 'md:!h-8' : 'md:!h-10'} w-auto object-contain`}
            />
          </Link>


          {/* SEARCH BAR SYSTEM */}
          <div className="hidden lg:flex flex-1 relative group">
            <div className="flex h-12 w-full items-center rounded-2xl border-2 border-slate-100 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-50 transition-all overflow-hidden bg-slate-50/50">
              <div className="relative h-full flex items-center">
                <select className="appearance-none h-full pl-6 pr-10 bg-white border-r border-slate-100 text-[11px] font-black text-emerald-950 uppercase tracking-widest cursor-pointer outline-none hover:bg-slate-50 transition-colors">
                  <option>All Assets</option>
                  {categoriesMenu.map(cat => <option key={cat.name}>{cat.name}</option>)}
                </select>
                <ChevronRight className="absolute right-4 h-3 w-3 rotate-90 pointer-events-none text-slate-400" strokeWidth={3} />
              </div>
              <input
                type="text"
                placeholder="Search across 8,000+ organic harvests..."
                className="flex-1 h-full px-6 bg-transparent text-[14px] font-bold outline-none placeholder:text-slate-400 text-emerald-950"
              />
              <button className="h-full px-8 bg-emerald-950 text-white hover:bg-emerald-800 transition-colors flex items-center gap-2">
                <Search className="h-4 w-4" strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* UTILITIES: Anchored Right */}
          <div className="flex items-center gap-3 md:gap-10 shrink-0">
            <Link href="/account" className="hidden sm:flex items-center gap-4 group">
              <div className="h-11 w-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                <User className="h-5 w-5 text-emerald-950" />
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account</span>
                <span className="text-[11px] font-black text-emerald-950 whitespace-nowrap leading-none">My Profile</span>
              </div>
            </Link>

            <button onClick={() => setIsOpen(true)} className="group flex items-center gap-4">
              <div className="relative h-11 w-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                <ShoppingCart className="h-5 w-5 text-emerald-950" />
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-emerald-950 border-2 border-white shadow-sm">
                  {cart.length}
                </div>
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Basket</span>
                <span className="text-[11px] font-black text-emerald-950 leading-none">My Cart</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden h-11 w-11 rounded-full !bg-emerald-950 flex items-center justify-center text-white shadow-xl active:scale-90 transition-all z-[110] relative"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
            </button>
          </div>
        </div>
      </div>

      {/* SECONDARY TIER: Categories & Hotlinks */}
      <div className={`hidden md:flex w-full bg-slate-50/50 backdrop-blur-sm border-t border-slate-100 items-center relative transition-all duration-500 ${scrolled ? 'h-10' : 'h-12'}`}>


        <div className="standard-container mx-auto flex items-center gap-14 h-full">
          <div
            className="relative h-full"
            onMouseEnter={() => setIsCategoryOpen(true)}
            onMouseLeave={() => setIsCategoryOpen(false)}
          >
            <button
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="flex items-center gap-3 h-full px-4 -ml-4 text-emerald-950 text-[11px] font-black uppercase tracking-widest hover:text-emerald-600 transition-colors"
            >
              <LayoutGrid className="h-4 w-4" />
              Categories
              <ChevronRight className={`h-3 w-3 rotate-90 transition-transform ${isCategoryOpen ? 'rotate-[-90deg]' : ''}`} strokeWidth={3} />
            </button>

            {/* DROPDOWN MENU */}
            {isCategoryOpen && (
              <div
                className="absolute top-full left-0 w-64 bg-white border border-slate-100 shadow-2xl rounded-b-2xl py-6 animate-in fade-in slide-in-from-top-2 duration-300 z-50"
              >
                <div className="flex flex-col gap-1 px-2">
                  {categoriesMenu.map((cat) => (
                    <div key={cat.name} className="relative group/navitem">
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.name)}`}
                        className="px-6 py-3 rounded-xl hover:bg-emerald-50 text-[13px] font-bold text-emerald-950 flex items-center justify-between transition-all"
                      >
                        {cat.name}
                        <ChevronRight className="h-4 w-4 opacity-40 group-hover/navitem:opacity-100 group-hover/navitem:text-amber-500 transition-all text-emerald-900" strokeWidth={3} />
                      </Link>

                      {/* FLYOUT SUB-MENU */}
                      <div className="absolute top-0 left-[100%] ml-0 w-56 bg-white border border-slate-100 shadow-[20px_20px_60px_rgba(0,0,0,0.05)] rounded-2xl py-3 opacity-0 invisible group-hover/navitem:opacity-100 group-hover/navitem:visible transition-all duration-200 z-[60] -translate-x-2 group-hover/navitem:translate-x-0">
                        <div className="flex flex-col gap-1 px-3">
                          {cat.sub.map(subItem => (
                            <Link
                              key={subItem}
                              href={`/products?category=${encodeURIComponent(subItem)}`}
                              onClick={() => setIsCategoryOpen(false)}
                              className="px-4 py-2.5 rounded-xl hover:bg-slate-50 text-[12px] font-bold text-emerald-900/80 transition-all hover:text-emerald-950 hover:translate-x-1 flex items-center"
                            >
                              {subItem}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

          <div className="flex items-center gap-14 h-full">
            {[
              { name: 'Best Sellers', href: '/best-selling', badge: 'Hot' },
              { name: 'Combo Deals', href: '/promotions', badge: 'New' },
              { name: 'Our Vision', href: '/about' }
            ].map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative h-full flex items-center gap-2 text-emerald-950 text-[11px] font-black uppercase tracking-widest hover:text-emerald-950 group"
              >
                {item.name}
                {item.badge && (
                  <div className={`px-1.5 py-0.5 text-[7px] rounded-sm text-white font-black uppercase leading-none ${item.badge === 'Hot' ? 'bg-amber-400' : 'bg-emerald-600'}`}>
                    {item.badge}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-amber-400 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE MENU: FULL-SCREEN BRAND OVERLAY */}
      {isMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[100] bg-white flex flex-col w-screen h-screen overflow-y-auto pointer-events-auto"
          data-lenis-prevent
        >
          {/* Menu Header: Branded & Sticky */}
          <div className="sticky top-0 z-[110] bg-white/80 backdrop-blur-md px-6 h-20 flex items-center justify-between border-b border-slate-100">
            <Image src="/logo.webp" alt="Namma Orru Foods" width={110} height={32} style={{ height: '24px', width: 'auto' }} />
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-emerald-950 shadow-sm active:scale-95 transition-all"
              aria-label="Close Menu"
            >
              <X size={24} strokeWidth={3} />
            </button>
          </div>

          <div className="px-6 py-10 flex flex-col gap-10">
            {/* Primary Navigation System */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-4 pl-4 border-l-2 border-amber-400">Main Directory</span>
              {[
                { name: 'Home Garden', href: '/', icon: Home },
                { name: 'All Categories', href: '/products', icon: LayoutGrid },
                { name: 'Best Selling Vault', href: '/best-selling', icon: TrendingUp },
                { name: 'Exclusive Offers', href: '/promotions', icon: Tag },
                { name: 'Our Vision', href: '/about', icon: Star }
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="group flex items-center justify-between py-5 px-6 rounded-[2rem] bg-slate-50/50 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                >
                  <div className="flex items-center gap-5">
                    <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-sm">
                      <item.icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-[14px] font-black text-emerald-950 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <ChevronRight className="h-4 w-4 text-emerald-950" strokeWidth={3} />
                  </div>
                </Link>
              ))}
            </div>

            {/* CTA & Membership Section */}
            <div className="pt-6">
              <Link
                href="/account"
                onClick={() => setIsMenuOpen(false)}
                className="w-full h-18 rounded-[2rem] bg-emerald-950 flex items-center justify-center gap-5 shadow-premium active:scale-95 transition-all"
              >
                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                  <User size={18} className="text-amber-400" />
                </div>
                <span className="text-white text-[11px] font-black uppercase tracking-[0.4em]">Secure Member Access</span>
              </Link>
            </div>

            {/* Story Section: Sub-Card Style */}
            <div className="mt-6">
              <div className="p-8 rounded-[2.5rem] bg-amber-50 border border-amber-100 relative overflow-hidden group">
                <div className="absolute top-0 right-0 h-32 w-32 bg-amber-400/20 rounded-full blur-3xl group-hover:bg-amber-400/30 transition-colors" />
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-600 mb-3">Farm-to-Door Initiative</p>
                  <p className="text-[13px] font-bold text-emerald-900 leading-relaxed mb-6">
                    Connecting 500+ small-scale farmers directly to your kitchen.
                  </p>
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-amber-100 shadow-sm">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-950">100% Verified</span>
                  </div>
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
