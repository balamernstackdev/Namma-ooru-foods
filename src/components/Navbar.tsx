'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, Home, LayoutGrid, TrendingUp, Star, Tag, ChevronRight, Heart, Package, MapPin, CreditCard, LogOut, Settings, Bell, ArrowRight, Sun, Moon, Globe } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { useWishlistStore } from '@/store/useWishlistStore';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

import SearchBar from './search/SearchBar';


const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cart, setIsOpen } = useCartStore();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [selectedLang, setSelectedLang] = useState('EN');

  const [isMounted, setIsMounted] = useState(false);
  const [activeMegaCategory, setActiveMegaCategory] = useState<number | null>(0);

  React.useEffect(() => {
    setIsMounted(true);
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
    { label: 'Payments', href: '/account/payments', icon: CreditCard, desc: 'Transaction history' },
    { label: 'Settings', href: '/account/settings', icon: Settings, desc: 'Privacy & preferences' },
  ];

  const menuGroups = [
    {
      title: 'SHOP',
      items: [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Categories', href: '/products', icon: LayoutGrid },
        { label: 'Best Sellers', href: '/best-selling', icon: TrendingUp },
        { label: 'Combo Deals', href: '/promotions', icon: Tag },
        { label: 'Vendors', href: '/vendors', icon: User }
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'My Account', href: '/account/profile', icon: User },
        { label: 'Orders', href: '/account/orders', icon: Package },
        { label: 'Wishlist', href: '/account/wishlist', icon: Heart },
        { label: 'Refund Requests', href: '/refund-policy', icon: CreditCard },
        { label: 'Logout', href: '#logout', icon: LogOut, isLogout: true }
      ]
    },
    {
      title: 'BUSINESS',
      items: [
        { label: 'Become a Vendor', href: '/seller-hub', icon: Star },
        { label: 'Seller Hub', href: '/vendor', icon: Settings }
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { label: 'About Us', href: '/about', icon: Star },
        { label: 'Contact Us', href: '#contact-card', icon: Bell, isContact: true },
        { label: 'Terms & Privacy', href: '/terms', icon: ArrowRight }
      ]
    }
  ];

  const sidebarVariants = {
    hidden: { x: '-100%', opacity: 0.95 },
    visible: { 
      x: 0,
      opacity: 1,
      transition: { 
        type: 'spring', 
        damping: 24, 
        stiffness: 240,
        staggerChildren: 0.03,
        delayChildren: 0.04
      } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 350, damping: 25 } }
  };

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
                  alt="namma ooru Foods"
                  width={160}
                  height={48}
                  priority
                  className="w-24 md:w-36 h-auto object-contain"
                />
              </Link>


            </div>

            {/* DYNAMIC SEARCH (DESKTOP) */}
            <div className="hidden lg:flex flex-1 max-w-2xl">
              <SearchBar />
            </div>

            {/* UTILITIES */}
            <div className="flex items-center gap-2 md:gap-6 shrink-0">
              {(isMounted && user) ? (
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
                  {isMounted ? cart.length : 0}
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
            <Link href="/brands" prefetch={false} className="text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors">Brands</Link>
            <Link href="/vendors" prefetch={false} className="text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors">Vendors</Link>
            <Link href="/promotions" prefetch={false} className="text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors">Combo Deals</Link>
            <Link href="/about" prefetch={false} className="text-[11px] font-black uppercase tracking-widest text-emerald-950 hover:text-emerald-600 transition-colors">Our Vision</Link>
          </div>
        </div>

      </nav>

      {/* REDESIGNED PREMIUM MOBILE SIDEBAR DRAWER */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Dark Backdrop Overlay with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="lg:hidden fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm"
            />

            {/* Sidebar Navigation Panel */}
            <motion.div
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="lg:hidden fixed top-0 left-0 bottom-0 z-[99999] w-[85vw] max-w-[320px] bg-[#041a12] text-white flex flex-col shadow-2xl overflow-hidden border-r border-emerald-900/30"
            >
              {/* Sticky Centered Top Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-[#041a12]/95 backdrop-blur-md border-b border-emerald-900/20 shadow-sm relative min-h-[60px] shrink-0">
                {/* Spacer to align close button on the right */}
                <div className="w-8 h-8" />
                
                {/* Perfectly Centered Logo */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                  <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center">
                    <img
                      src="/logo.webp"
                      alt="Logo"
                      className="brightness-0 invert h-5 w-auto object-contain opacity-95"
                    />
                  </Link>
                </div>

                {/* Redesigned Close Button */}
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="h-8 w-8 rounded-full bg-emerald-950/40 border border-emerald-800/30 flex items-center justify-center text-emerald-300 hover:text-white hover:bg-emerald-900/60 backdrop-blur transition-all active:scale-95 z-20 shadow-sm"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Scrollable Navigation Groups */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
                {/* Premium User Profile Banner */}
                <motion.div variants={itemVariants} className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/25 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-800 text-white flex items-center justify-center text-sm font-bold border border-emerald-700/30 shrink-0">
                    {user?.name ? user.name[0].toUpperCase() : <User size={15} className="text-emerald-400" />}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] text-emerald-400/60 font-black uppercase tracking-wider leading-none">Welcome</span>
                    <span className="text-[13px] text-white font-bold mt-1 leading-none truncate max-w-[180px]">{user ? user.name : 'Guest User'}</span>
                    {!user && (
                      <Link href="/account" onClick={() => setIsMenuOpen(false)} className="text-[10px] text-emerald-400 underline font-semibold mt-1 leading-none hover:text-emerald-300 transition-colors">
                        Login / Sign Up
                      </Link>
                    )}
                  </div>
                </motion.div>

                {menuGroups.map((group) => {
                  const visibleItems = group.items.filter(item => {
                    if (item.isLogout) return !!user;
                    return true;
                  });
                  
                  if (visibleItems.length === 0) return null;

                  return (
                    <motion.div key={group.title} variants={itemVariants} className="space-y-1.5">
                      <h3 className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-400/50 px-3">
                        {group.title}
                      </h3>
                      <div className="space-y-0.5">
                        {visibleItems.map((item) => {
                          const isActive = item.isContact || item.isLogout ? false : (pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href)));
                          
                          const linkContent = (
                            <>
                              <div className="flex items-center gap-3">
                                <item.icon size={15} className={`transition-colors duration-350 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-300'}`} />
                                <span className="font-semibold text-[14px] leading-tight tracking-wide">{item.label}</span>
                              </div>
                              <ChevronRight size={13} className={`transition-transform duration-350 shrink-0 ${isActive ? 'text-emerald-400 translate-x-0.5' : 'text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5'}`} />
                            </>
                          );

                          if (item.isLogout) {
                            return (
                              <button
                                key={item.label}
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to log out?')) {
                                    logout();
                                    setIsMenuOpen(false);
                                  }
                                }}
                                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-left transition-all duration-300 group hover:bg-red-500/10 text-red-400 hover:text-red-300 border-l-[3px] border-transparent"
                              >
                                <div className="flex items-center gap-3">
                                  <item.icon size={15} className="text-red-400 group-hover:text-red-300 transition-colors shrink-0" />
                                  <span className="font-semibold text-[14px] leading-tight tracking-wide">{item.label}</span>
                                </div>
                                <ChevronRight size={13} className="text-red-400/50 group-hover:text-red-300 transition-transform group-hover:translate-x-0.5 shrink-0" />
                              </button>
                            );
                          }

                          if (item.isContact) {
                            return (
                              <button
                                key={item.label}
                                onClick={() => {
                                  const contactCard = document.getElementById('contact-card');
                                  if (contactCard) {
                                    contactCard.scrollIntoView({ behavior: 'smooth' });
                                    contactCard.classList.add('ring-2', 'ring-emerald-500');
                                    setTimeout(() => contactCard.classList.remove('ring-2', 'ring-emerald-500'), 2000);
                                  }
                                }}
                                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-left transition-all duration-300 group hover:bg-white/5 text-slate-300 hover:text-white border-l-[3px] border-transparent"
                              >
                                {linkContent}
                              </button>
                            );
                          }

                          return (
                            <Link
                              key={item.label}
                              href={item.href}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-350 group border-l-[3px] ${
                                isActive 
                                  ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 text-emerald-400 border-emerald-500/70 font-semibold shadow-[inset_1px_0_0_rgba(16,185,129,0.2)]' 
                                  : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent'
                              }`}
                            >
                              {linkContent}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}

                {/* Compact Help/Support Card */}
                <motion.div id="contact-card" variants={itemVariants} className="mt-6 p-4 rounded-xl bg-emerald-950/40 border border-emerald-900/30 relative overflow-hidden group transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all duration-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-2">Need Help?</h4>
                  <div className="space-y-2 text-xs font-semibold">
                    <a
                      href="tel:+919876543210"
                      className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors"
                    >
                      <span className="text-emerald-400 text-sm">📞</span>
                      <span>+91 98765 43210</span>
                    </a>
                    <a
                      href="mailto:support@nammaoorufoods.com"
                      className="flex items-center gap-2 text-slate-300 hover:text-emerald-400 transition-colors break-all"
                    >
                      <span className="text-emerald-400 text-sm">✉</span>
                      <span>support@nammaoorufoods.com</span>
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Minimal Redesigned Footer */}
              <div className="p-4 border-t border-emerald-900/20 bg-[#03150e]/95 flex items-center justify-between shrink-0">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  © 2026 Namma Ooru Foods
                </span>

                {/* Language Selector Dropdown */}
                <div className="relative">
                  <select
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    className="bg-[#041a12]/80 text-slate-300 font-bold uppercase py-1.5 pl-7 pr-8 rounded-lg border border-emerald-900/30 outline-none cursor-pointer appearance-none hover:border-emerald-800 transition-colors text-[10px]"
                  >
                    <option value="EN">English</option>
                    <option value="TA">தமிழ்</option>
                    <option value="HI">हिन्दी</option>
                  </select>
                  <Globe size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <ChevronRight size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
