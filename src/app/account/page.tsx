'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Mail, Lock, User, ArrowRight, ShieldCheck, Leaf, Globe, ShoppingBag, ChevronLeft } from 'lucide-react';
import Link from 'next/image'; // Wait, I should use Next Link not Image for Link
import NextLink from 'next/link';
import Image from 'next/image';

export default function AccountPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, login, signup, logout, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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
      <div className="min-h-screen bg-slate-50 pt-[160px] pb-20 flex items-center justify-center p-6 text-center">
        <div className="w-full max-w-lg bg-white rounded-[3rem] p-12 md:p-16 border border-slate-100 shadow-premium relative overflow-hidden">
           <div className="h-28 w-28 rounded-full overflow-hidden mx-auto border-4 border-white shadow-2xl mb-10">
              <img src={user.avatar || '/ai_images/indian_spices_1776231045209.png'} alt={user.name} className="h-full w-full object-cover" />
           </div>
           <h2 className="text-4xl font-black text-[#022c22] tracking-tighter mb-4 leading-none">Welcome, {user.name.split(' ')[0]}!</h2>
           <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300 mb-14">{user.email}</p>
           <button onClick={logout} style={{ backgroundColor: '#022c22' }} className="w-full h-18 py-6 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.4em] shadow-2xl">Sign Out from Vault</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row pt-[120px] md:pt-[140px]">
      
      {/* LEFT: CINEMATIC STORYTELLING (50%) */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#022c22] h-[calc(100vh-140px)]">
        <img 
          src="/ai_images/honey_gold_1776231080758.png" 
          className="absolute inset-0 h-full w-full object-cover opacity-60 contrast-125"
          alt="Organic Farm"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#022c22] via-[#022c22]/10 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#022c22]/20" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-20 xl:p-28">
           <div className="max-w-md">
              <div className="flex items-center gap-4 mb-8">
                 <div className="h-1.5 w-16 bg-amber-400 rounded-full" />
                 <span className="text-[11px] font-black text-white uppercase tracking-[0.6em]">Heritage First</span>
              </div>
              <h2 className="text-6xl xl:text-7xl font-black text-white tracking-tighter leading-tight mb-8">
                Namma Orru <span className="text-amber-400">Vault</span> Access
              </h2>
              <p className="text-emerald-50/60 font-medium text-[13px] uppercase tracking-widest leading-relaxed mb-12">
                Join our collective for direct access to traceable harvests and cluster ethics.
              </p>
              <div className="flex gap-12">
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
      <div className="flex-1 lg:w-1/2 flex flex-col justify-center items-center bg-white min-h-[calc(100vh-140px)]">
        <div className="w-full max-w-[520px] px-8 md:px-16 py-12 flex flex-col items-center">
          
          <div className="mb-16 flex flex-col items-center text-center">
            <NextLink href="/" className="inline-block mb-12 hover:scale-110 transition-transform duration-500">
               <img src="/logo.webp" alt="Namma Orru" className="h-16 w-auto object-contain" />
            </NextLink>
            <h1 className="text-5xl md:text-6xl font-black text-[#022c22] tracking-tighter mb-4 leading-none">
              {isLogin ? 'Welcome Back' : 'Join Collective'}
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-300">
              Authentication Required to enter vault
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
            {!isLogin && (
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#022c22] ml-2">Member Name</label>
                <input 
                  type="text" 
                  placeholder="Arul Murugan"
                  className="w-full h-18 px-8 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-lg text-[#022c22] placeholder:text-slate-200 focus:border-amber-400 focus:bg-white transition-all shadow-sm"
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
                className="w-full h-18 px-8 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-lg text-[#022c22] placeholder:text-slate-200 focus:border-amber-400 focus:bg-white transition-all shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black uppercase tracking-[0.4em] text-[#022c22]">Vault Password</label>
                {isLogin && <button type="button" className="text-[10px] font-black text-amber-600 uppercase tracking-widest hover:underline">Forgot Access?</button>}
              </div>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full h-18 px-8 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-lg text-[#022c22] placeholder:text-slate-200 focus:border-amber-400 focus:bg-white transition-all shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              disabled={isLoading}
              style={{ backgroundColor: '#022c22' }}
              className="w-full h-20 mt-6 rounded-[1.5rem] text-white font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_20px_40px_rgba(2,44,34,0.3)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
            >
              {isLoading ? 'Confirming Identity...' : (isLogin ? 'Access Member Vault' : 'Secure Membership')}
              {!isLoading && <ArrowRight size={18} />}
            </button>
          </form>

          <div className="w-full mt-20 mb-12 flex items-center gap-6 px-4">
            <div className="h-px bg-slate-100 flex-1" />
            <span className="text-[9px] font-black uppercase tracking-[0.6em] text-slate-300">Social Trust</span>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <div className="w-full grid grid-cols-2 gap-4">
            <button className="h-16 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-[#022c22] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
              <Globe size={18} className="text-emerald-600" /> Google Account
            </button>
            <button className="h-16 border-2 border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-[#022c22] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
              <User size={18} className="text-emerald-600" /> Member Guest
            </button>
          </div>

          <div className="mt-20 text-center">
             <p className="text-[15px] font-bold text-slate-300">
               {isLogin ? "No Access yet?" : "Existing Member?"}
               <button onClick={() => setIsLogin(!isLogin)} className="ml-4 text-amber-500 font-black underline underline-offset-[12px] decoration-2">
                 {isLogin ? 'Join Harvesting' : 'Access Vault'}
               </button>
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}
