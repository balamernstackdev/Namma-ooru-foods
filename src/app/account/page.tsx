'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Leaf, Globe, ShoppingBag, ChevronLeft, Heart, Package, MapPin, CreditCard, Bell, Settings, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function AccountPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, signup, logout, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to profile on desktop if logged in
  React.useEffect(() => {
    if (user && window.innerWidth >= 768) {
      router.push('/account/profile');
    }
  }, [user, router]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const menuItems = [
    { label: 'My Profile',       href: '/account/profile',      icon: User,        desc: 'Personal details & settings' },
    { label: 'Wishlist',         href: '/account/wishlist',     icon: Heart,       desc: 'Saved products' },
    { label: 'My Orders',        href: '/account/orders',       icon: Package,     desc: 'Order history & status' },
    { label: 'Track Order',      href: '/account/tracking',     icon: MapPin,      desc: 'Real-time shipment tracking' },
    { label: 'Payments',         href: '/account/payments',     icon: CreditCard,  desc: 'Transaction history' },
    { label: 'Notifications',    href: '/account/notifications',icon: Bell,        desc: 'Alerts & updates' },
    { label: 'Settings',         href: '/account/settings',     icon: Settings,    desc: 'Privacy & preferences' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await signup(name, email, password);
    }
  };

  if (user) {
    return (
      <div className="md:hidden flex flex-col gap-4 p-4">
        {/* User Card - Mobile Only */}
        <div className="bg-emerald-950 rounded-[2rem] p-6 text-white shadow-premium relative overflow-hidden mb-4">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] pointer-events-none" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="h-16 w-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-xl shrink-0">
              {user.avatar 
                ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                : <div className="h-full w-full bg-emerald-800 flex items-center justify-center text-xl font-black">{user.name[0]}</div>
              }
            </div>
            <div className="flex flex-col min-w-0">
              <h2 className="text-[18px] font-black tracking-tight leading-tight truncate">{user.name}</h2>
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest opacity-80 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 pl-4 border-l-2 border-amber-400 mb-2">My Account</span>

        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center justify-between py-4 px-6 rounded-[2rem] bg-white border border-slate-100 shadow-sm active:scale-95 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-100 transition-all">
                  <item.icon size={22} strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[14px] font-black text-emerald-950">{item.label}</span>
                  <span className="text-[10px] text-slate-400 font-medium">{item.desc}</span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center">
                <ChevronRight className="h-4 w-4 text-emerald-950" strokeWidth={3} />
              </div>
            </Link>
          ))}

          <button
            onClick={logout}
            className="flex items-center gap-4 py-4 px-6 rounded-[2rem] bg-red-50 active:bg-red-100 transition-all border border-red-100 mt-4 group"
          >
            <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center text-red-400 shadow-sm transition-all group-active:scale-90">
              <LogOut size={22} strokeWidth={2.5} />
            </div>
            <span className="text-[14px] font-black text-red-500 uppercase tracking-widest">Sign Out</span>
          </button>
        </nav>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-96px)] w-full bg-slate-50 flex items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 h-96 w-96 bg-emerald-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 h-96 w-96 bg-amber-100/50 rounded-full blur-3xl -z-10" />

      {/* Main Authenticaton Card */}
      <div className="w-full max-w-6xl bg-white mx-auto rounded-[2rem] md:rounded-[2.5rem] shadow-[0_30px_60px_rgba(2,44,34,0.05)] border border-slate-100 overflow-hidden flex flex-col lg:flex-row relative z-10 min-h-[600px]">


        {/* LEFT: CINEMATIC STORYTELLING (50%) */}
        <div className="hidden lg:block lg:w-1/2 relative bg-[#022c22] min-h-[500px]">
          <img
            src="/ai_images/honey_gold_1776231080758.png"
            className="absolute inset-0 h-full w-full object-cover opacity-60 contrast-125"
            alt="Organic Farm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#022c22]/10 to-transparent opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#022c22]/20" />

          <div className="absolute inset-0 flex flex-col justify-end p-10 md:p-14">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-10 bg-amber-400 rounded-full" />
                <span className="text-[9px] font-black text-white uppercase tracking-[0.4em]">Story</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-tight mb-4">
                Join Namma Orru
              </h2>
              <p className="text-emerald-50/70 font-medium text-[11px] uppercase tracking-widest leading-relaxed mb-8">
                Shop authentic, farm-fresh products directly from the source.
              </p>
              <div className="flex gap-8">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-amber-400 h-6 w-6" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Secure</span>
                </div>
                <div className="flex items-center gap-3 border-l border-white/10 pl-12">
                  <Leaf className="text-emerald-400 h-6 w-6" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">Organic</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: AUTHENTICATION FLOW (50%) */}
        <div className="flex-1 lg:w-1/2 flex flex-col justify-center items-center bg-white py-16 relative">
          <div className="w-full max-w-[460px] px-6 lg:px-10 flex flex-col items-center">


            <div className="mb-10 flex flex-col items-center text-center">
              <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform duration-500">
                <img src="/logo.webp" alt="Namma Orru" className="h-16 w-auto object-contain" />
              </Link>
              <h1 className="text-3xl md:text-4xl font-black text-[#022c22] tracking-tighter mb-3 leading-none">
                {isLogin ? 'Welcome Back' : 'Sign Up'}
              </h1>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-300">
                Authentication Required
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
              {!isLogin && (
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#022c22] ml-2">Member Name</label>
                  <input
                    type="text"
                    placeholder="Member Name"
                    className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none font-bold text-sm text-[#022c22] placeholder:text-slate-300 focus:border-amber-400 focus:bg-white transition-all shadow-sm"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#022c22] ml-2">Email Identity</label>
                <input
                  type="email"
                  placeholder="identity@nammaoru.com"
                  className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none font-bold text-sm text-[#022c22] placeholder:text-slate-300 focus:border-amber-400 focus:bg-white transition-all shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center ml-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#022c22]">Password</label>
                  {isLogin && <button type="button" className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">Forgot Access?</button>}
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full h-14 px-6 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none font-bold text-sm text-[#022c22] placeholder:text-slate-300 focus:border-amber-400 focus:bg-white transition-all overflow-hidden tracking-[0.5em] shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                disabled={isLoading}
                style={{ backgroundColor: '#022c22' }}
                className="w-full h-14 mt-4 rounded-xl text-white font-black uppercase tracking-[0.4em] text-[10px] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 shadow-premium"
              >
                {isLoading ? 'Confirming Identity...' : (isLogin ? 'Log In' : 'Create Account')}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>



            <div className="mt-10 text-center">
              <p className="text-sm font-bold text-slate-300">
                {isLogin ? "No Access yet?" : "Already have an account?"}
                <button onClick={() => setIsLogin(!isLogin)} className="ml-4 text-amber-500 font-black underline underline-offset-[12px] decoration-2">
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
