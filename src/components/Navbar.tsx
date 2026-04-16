'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, ShoppingCart, User, Menu, X, Home, LayoutGrid, TrendingUp, Star, Tag, ChevronRight, Heart, Package, MapPin, CreditCard, LogOut, Settings, Bell } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cart, setIsOpen } = useCartStore();
  const { user, logout } = useAuth();

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

  const accountMenuItems = [
    { label: 'My Profile',       href: '/account/profile',      icon: User,        desc: 'Personal details & settings' },
    { label: 'Wishlist',         href: '/account/wishlist',     icon: Heart,       desc: 'Saved products' },
    { label: 'My Orders',        href: '/account/orders',       icon: Package,     desc: 'Order history & status' },
    { label: 'Track Order',      href: '/account/tracking',     icon: MapPin,      desc: 'Real-time shipment tracking' },
    { label: 'Payments',         href: '/account/payments',     icon: CreditCard,  desc: 'Transaction history' },
    { label: 'Notifications',    href: '/account/notifications',icon: Bell,        desc: 'Alerts & updates' },
    { label: 'Settings',         href: '/account/settings',     icon: Settings,    desc: 'Privacy & preferences' },
  ];

  return (
    <nav className="sticky top-0 left-0 right-0 z-[500] w-full flex flex-col bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm mb-0">

      {/* PRIMARY TIER */}
      <div className="w-full">
        <div className={`standard-container mx-auto flex items-center justify-between gap-4 md:gap-24 transition-all duration-500 ${scrolled ? 'h-16 md:h-20' : 'h-20 md:h-24'}`}>
          {/* LOGO: Anchored Left */}
          <Link href="/" className="shrink-0 flex items-center transition-transform hover:scale-105">
            <Image
              src="/logo.webp"
              alt="Namma Orru Foods"
              width={220}
              height={64}
              priority
              style={{ height: scrolled ? '44px' : '56px', width: 'auto', objectFit: 'contain' }}
              className={`transition-all duration-500 w-auto object-contain`}
            />
          </Link>


          {/* SEARCH BAR SYSTEM */}
          <div className="hidden lg:flex flex-1 relative group">
            <div className="flex h-12 w-full items-center rounded-2xl border-2 border-slate-100 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-50 transition-all overflow-hidden bg-slate-50/50">
              <div className="relative h-full flex items-center">
                <select className="appearance-none h-full pl-6 pr-10 bg-white border-r border-slate-100 text-[11px] font-bold text-emerald-950 uppercase tracking-widest cursor-pointer outline-none hover:bg-slate-50 transition-colors">
                  <option>All Categories</option>
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

            {/* ACCOUNT BUTTON — direct link to dashboard */}
            <div className="hidden sm:inline-flex items-center relative">

              {user ? (
                /* ── LOGGED-IN TRIGGER ── */
                <Link href="/account/profile" className="flex items-center gap-4 group">
                  <div className="h-11 w-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm transition-all group-hover:border-emerald-500">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      : <div className="h-full w-full bg-emerald-950 flex items-center justify-center text-white text-sm font-black">{user.name[0]}</div>
                    }
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account</span>
                    <span className="text-[11px] font-black text-emerald-950 whitespace-nowrap leading-none">{user.name.split(' ')[0]}</span>
                  </div>
                </Link>
              ) : (
                /* ── GUEST TRIGGER ── */
                <Link href="/account" className="flex items-center gap-4 group">
                  <div className="h-11 w-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                    <User className="h-5 w-5 text-emerald-950" />
                  </div>
                  <div className="hidden lg:flex flex-col">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Account</span>
                    <span className="text-[11px] font-black text-emerald-950 whitespace-nowrap leading-none">My Profile</span>
                  </div>
                </Link>
              )}
            </div>

            {/* NOTIFICATIONS — only for logged in users */}
            {user && (
              <Link href="/account/notifications" className="flex items-center group">
                <div className="relative h-11 w-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                  <Bell className="h-5 w-5 text-emerald-950" />
                  <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-black text-white border-2 border-white shadow-sm">
                    2
                  </div>
                </div>
              </Link>
            )}


            <button onClick={() => setIsOpen(true)} className="group flex items-center">
              <div className="relative h-11 w-11 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all">
                <ShoppingCart className="h-5 w-5 text-emerald-950" />
                <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-emerald-950 border-2 border-white shadow-sm">
                  {cart.length}
                </div>
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
                className="relative h-full flex items-center gap-2 text-emerald-950 text-[11px] font-bold uppercase tracking-widest hover:text-emerald-950 group"
              >
                {item.name}
                {item.badge && (
                  <div className={`px-1.5 py-0.5 text-[7px] rounded-sm text-white font-bold uppercase leading-none ${item.badge === 'Hot' ? 'bg-amber-400' : 'bg-emerald-600'}`}>
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
            <Image src="/logo.webp" alt="Namma Orru Foods" width={160} height={48} style={{ height: '40px', width: 'auto' }} />
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
                { name: 'Home', href: '/', icon: Home },
                { name: 'All Categories', href: '/products', icon: LayoutGrid },
                { name: 'Best Sellers', href: '/best-selling', icon: TrendingUp },
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

            {/* ACCOUNT SECTION */}
            {user ? (
              <div className="flex flex-col gap-3">
                {/* User Card */}
                <Link 
                  href="/account/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-4 px-6 py-4 rounded-[2rem] bg-emerald-950 shadow-premium active:scale-95 transition-all"
                >
                  <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-amber-400 shrink-0">
                    {user.avatar
                      ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      : <div className="h-full w-full bg-emerald-700 flex items-center justify-center text-white text-lg font-black">{user.name[0]}</div>
                    }
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-[14px] font-black truncate">{user.name}</span>
                    <span className="text-emerald-300/70 text-[10px] font-medium truncate">{user.email}</span>
                  </div>
                </Link>

                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mt-2 pl-4 border-l-2 border-amber-400">My Account</span>

                {accountMenuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="group flex items-center justify-between py-4 px-6 rounded-[2rem] bg-slate-50/50 hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-emerald-700 group-hover:scale-110 transition-transform shadow-sm">
                        <item.icon size={18} strokeWidth={2.5} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-emerald-950">{item.label}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                      <ChevronRight className="h-4 w-4 text-emerald-950" strokeWidth={3} />
                    </div>
                  </Link>
                ))}

                {/* Sign Out */}
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="group flex items-center gap-4 py-4 px-6 rounded-[2rem] bg-red-50 hover:bg-red-100 transition-all border border-red-100 mt-2"
                >
                  <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-red-400 shadow-sm">
                    <LogOut size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[13px] font-black text-red-500 uppercase tracking-widest">Sign Out</span>
                </button>
              </div>
            ) : (
              /* CTA for guests */
              <div className="pt-6">
                <Link
                  href="/account"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full h-18 rounded-[2rem] bg-emerald-950 flex items-center justify-center gap-5 shadow-premium active:scale-95 transition-all py-5"
                >
                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                    <User size={18} className="text-amber-400" />
                  </div>
                  <span className="text-white text-[11px] font-black uppercase tracking-[0.4em]">Login / Sign Up</span>
                </Link>
              </div>
            )}

          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
