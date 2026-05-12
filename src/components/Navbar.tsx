'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, Home, LayoutGrid, TrendingUp, Star, Tag, ChevronRight, Heart, Package, MapPin, CreditCard, LogOut, Settings, Bell, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useWishlistStore } from '@/store/useWishlistStore';
import { motion, AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

import SearchBar from './search/SearchBar';
import HeaderLocation from './location/HeaderLocation';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cart, setIsOpen } = useCartStore();
  const { user, logout } = useAuth();

  const [activeMegaCategory, setActiveMegaCategory] = useState<number | null>(0);

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { fetchWishlist } = useWishlistStore();
  React.useEffect(() => {
    if (user?.id) {
      fetchWishlist(user.id);
    }
  }, [user?.id]);

  const { data: apiCategories } = useSWR(`${API_URL}/api/categories`, fetcher);

  const categoriesList = Array.isArray(apiCategories) 
    ? apiCategories 
    : (apiCategories && Array.isArray((apiCategories as any).categories) ? (apiCategories as any).categories : []);

  const dynamicCategoriesMenu = categoriesList
    .filter((cat: any) => cat.parentId === null)
    .slice(0, 8)
    .map((cat: any) => ({
      name: cat.name,
      sub: cat.children ? cat.children.map((c: any) => c.name) : []
    }));

  const accountMenuItems = [
    { label: 'My Profile', href: '/account/profile', icon: User, desc: 'Personal details & settings' },
    { label: 'Wishlist', href: '/account/wishlist', icon: Heart, desc: 'Saved products' },
    { label: 'My Orders', href: '/account/orders', icon: Package, desc: 'Order history & status' },
    { label: 'Track Order', href: '/account/tracking', icon: MapPin, desc: 'Real-time shipment tracking' },
    { label: 'Payments', href: '/account/payments', icon: CreditCard, desc: 'Transaction history' },
    { label: 'Notifications', href: '/account/notifications', icon: Bell, desc: 'Alerts & updates' },
    { label: 'Settings', href: '/account/settings', icon: Settings, desc: 'Privacy & preferences' },
  ];

  return (
    <>
      <nav className="sticky top-0 left-0 right-0 z-[500] w-full flex flex-col bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        {/* PRIMARY TIER */}
        <div className="standard-container w-full">
          <div className={`transition-all duration-500 ${scrolled ? 'h-16 md:h-20' : 'h-20 md:h-24'} flex items-center justify-between gap-4 md:gap-10`}>
            {/* LOGO & LOCATION */}
            <div className="flex items-center gap-4 md:gap-10">
              <Link href="/" prefetch={false} className="shrink-0 flex items-center transition-transform hover:scale-105">
                <Image
                  src="/logo.webp"
                  alt="Namma Orru Foods"
                  width={160}
                  height={48}
                  priority
                  className="w-24 md:w-36 h-auto object-contain"
                />
              </Link>

              <div className="hidden xl:block">
                <HeaderLocation />
              </div>
            </div>

            {/* DYNAMIC SEARCH (DESKTOP) */}
            <div className="hidden lg:flex flex-1 max-w-2xl">
               <SearchBar />
            </div>

            {/* UTILITIES */}
            <div className="flex items-center gap-2 md:gap-6 shrink-0">
               {user ? (
                <Link href="/account/profile" prefetch={false} className="hidden sm:flex items-center gap-3 group">
                  <div className="h-9 w-9 rounded-full border-2 border-slate-100 overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-emerald-950 text-white flex items-center justify-center text-xs font-black">{user.name[0]}</div>}
                  </div>
                  <div className="hidden xl:flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 tracking-widest">Account</span>
                    <span className="text-[11px] font-black text-emerald-950 leading-none">{user.name.split(' ')[0]}</span>
                  </div>
                </Link>
              ) : (
                <Link href="/account" prefetch={false} className="hidden sm:flex items-center gap-3 group">
                  <div className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 transition-all">
                    <User size={18} className="text-emerald-950" />
                  </div>
                  <div className="hidden xl:flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 tracking-widest">Welcome</span>
                    <span className="text-[11px] font-black text-emerald-950 leading-none">Login</span>
                  </div>
                </Link>
              )}

              <button onClick={() => setIsOpen(true)} className="h-9 w-9 rounded-full bg-slate-50 flex items-center justify-center relative hover:bg-primary/5 transition-all">
                <ShoppingCart size={18} className="text-primary" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-accent text-[8px] font-black text-white rounded-full flex items-center justify-center border border-white">
                  {cart.length}
                </span>
              </button>

              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden h-10 w-10 rounded-full bg-emerald-950 text-white flex items-center justify-center">
                {isMenuOpen ? <X size={18} strokeWidth={3} /> : <Menu size={18} strokeWidth={3} />}
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE LOCATION & SEARCH */}
        <div className="lg:hidden w-full px-4 pb-4 bg-white space-y-3">
           <div className="flex justify-start">
             <HeaderLocation />
           </div>
           <SearchBar isMobile={true} />
        </div>


        {/* SECONDARY TIER (DESKTOP) */}
        <div className="hidden md:flex h-12 bg-slate-50/50 border-t border-slate-100 items-center">
          <div className="standard-container flex items-center gap-10">
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setIsCategoryOpen(true)}
              onMouseLeave={() => setIsCategoryOpen(false)}
            >
              <Link href="/products" prefetch={false} className="text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors flex items-center gap-2 h-full">
                <LayoutGrid size={14} /> Categories
              </Link>

              {/* MEGA MENU DROPDOWN */}
              <AnimatePresence>
                {isCategoryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 w-[800px] bg-white shadow-2xl rounded-b-[2rem] border-x border-b border-slate-100 overflow-hidden z-[600] flex h-[450px]"
                  >
                    {/* LEFT SIDEBAR: MAIN CATEGORIES */}
                    <div className="w-[280px] bg-slate-50/50 border-r border-slate-100 py-6 overflow-y-auto custom-scrollbar">
                      {dynamicCategoriesMenu.map((cat: any, idx: number) => (
                        <div
                          key={cat.name}
                          onMouseEnter={() => setActiveMegaCategory(idx)}
                          className={`group relative flex items-center justify-between px-8 py-4 cursor-pointer transition-all ${activeMegaCategory === idx ? 'bg-white' : 'hover:bg-slate-100/30'}`}
                        >
                          {/* Active Indicator Bar */}
                          {activeMegaCategory === idx && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-r-full"
                            />
                          )}

                          <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${activeMegaCategory === idx ? 'text-emerald-950' : 'text-slate-400 group-hover:text-slate-600'}`}>{cat.name}</span>
                          <ChevronRight size={14} className={`${activeMegaCategory === idx ? 'text-amber-500 translate-x-0' : 'text-slate-200 -translate-x-2 opacity-0'} transition-all duration-300`} />
                        </div>
                      ))}
                    </div>

                    {/* RIGHT CONTENT: SUB CATEGORIES */}
                    <div className="flex-1 p-10 overflow-y-auto bg-white relative">
                      {activeMegaCategory !== null && dynamicCategoriesMenu[activeMegaCategory] && (
                        <div className="flex flex-col h-full">
                          <div className="grid grid-cols-1 gap-y-1">
                            {dynamicCategoriesMenu[activeMegaCategory].sub.length > 0 ? (
                              dynamicCategoriesMenu[activeMegaCategory].sub.map((sub: string) => (
                                <Link
                                  key={sub}
                                  href={`/products?category=${sub}`}
                                  onClick={() => setIsCategoryOpen(false)}
                                  className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all"
                                >
                                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-950/20 group-hover:bg-amber-500 transition-colors" />
                                  <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-950 transition-colors">{sub}</span>
                                </Link>
                              ))
                              ) : (
                                <div className="col-span-2 flex flex-col items-center justify-center py-20 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                                  <Package size={24} className="text-slate-300 mb-3" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expanding our Selection</span>
                                  <p className="text-[10px] font-medium text-slate-400 mt-1">Check back soon for new sub-categories</p>
                                </div>
                              )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/best-selling" prefetch={false} className="text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors">Best Sellers</Link>
            <Link href="/promotions" prefetch={false} className="text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors">Combo Deals</Link>
            <Link href="/about" prefetch={false} className="text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors">Our Vision</Link>
          </div>
        </div>

      </nav>

      {/* MOBILE MENU OVERLAY - MOVED OUTSIDE NAV FOR PORTAL-LIKE BEHAVIOR */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="lg:hidden fixed inset-0 z-[9999] bg-emerald-950 flex flex-col p-8 overflow-y-auto"
            style={{ height: '100vh', width: '100vw' }}
          >
            <div className="flex justify-between items-center mb-12">
              <Image
                src="/logo.webp"
                alt="Logo"
                width={120}
                height={40}
                className="brightness-0 invert h-auto w-auto opacity-90"
              />
              <button
                onClick={() => setIsMenuOpen(false)}
                className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {[
                { label: 'Home', href: '/', icon: Home },
                { label: 'All Products', href: '/products', icon: LayoutGrid },
                { label: 'Best Sellers', href: '/best-selling', icon: TrendingUp },
                { label: 'My Account', href: '/account', icon: User },
                { label: 'About Us', href: '/about', icon: Star }
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl sm:text-2xl font-black uppercase tracking-widest hover:text-amber-400 transition-colors flex items-center justify-between group py-3 border-b border-white/5"
                  style={{ color: '#ffffff' }}
                >
                  <div className="flex items-center gap-4">
                    <item.icon size={20} className="text-emerald-400" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="text-white/20 group-hover:text-amber-400 transition-all" size={20} />
                </Link>
              ))}
            </div>

            <div className="mt-auto pt-8 pb-8 border-t border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-300 mb-8">Direct Contact</p>
              <div className="flex flex-col gap-6">
                <a href="tel:+919876543210" className="text-2xl font-black transition-colors" style={{ color: '#ffffff' }}>+91 98765 43210</a>
                <a href="mailto:support@nammaorrufoods.com" className="text-white/40 font-medium hover:text-white transition-colors">support@nammaorrufoods.com</a>
              </div>

              <div className="flex gap-6 mt-12">
                {/* Social icons could go here */}
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40"><Star size={18} /></div>
                <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40"><Heart size={18} /></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
