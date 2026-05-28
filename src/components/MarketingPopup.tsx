'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Gift, ArrowRight, Sparkles, Mail, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MarketingPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Show after 3 seconds if not seen
    const timer = setTimeout(() => {
      const hasSeen = localStorage.getItem('hasSeenPopup_v2'); // New version key
      if (!hasSeen) {
        setIsVisible(true);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenPopup_v2', 'true');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribed(true);
    setTimeout(closePopup, 3000);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePopup}
            className="fixed inset-0 bg-emerald-950/80 backdrop-blur-md z-0"
          />

          {/* Popup Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative z-10 w-full max-w-[850px] bg-white rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col md:flex-row min-h-[400px]"
          >
            {/* Left Column: Visual Impact */}
            <div className="relative w-full md:w-[45%] h-64 md:h-auto bg-emerald-900 overflow-hidden">
              <Image
                src="/ai_images/discount_offer_1776230743911.png"
                alt="Organic Product"
                fill
                className="object-cover transition-transform duration-1000 hover:scale-110"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-emerald-950/60 via-transparent to-transparent" />

              <div className="absolute inset-0 p-8 flex flex-col justify-end md:justify-center items-center md:items-start text-center md:text-left text-white z-10">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="mb-4 h-16 w-16 rounded-3xl bg-amber-400 flex items-center justify-center shadow-xl rotate-3"
                >
                  <Gift className="h-8 w-8 text-emerald-950" />
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none mb-1">20%<span className="text-amber-400">OFF</span></h2>
                <p className="text-[12px] font-black uppercase tracking-[0.3em] opacity-80">Your First Product</p>
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="flex-1 p-8 md:p-12 relative flex flex-col justify-center bg-white">
              {/* Close Button */}
              <button
                onClick={closePopup}
                className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all border border-slate-100 shadow-sm z-20 group"
              >
                <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <AnimatePresence mode="wait">
                {!isSubscribed ? (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-1px w-8 bg-amber-400" />
                      <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Limited Time Invitation</span>
                    </div>

                    <h3 className="text-3xl md:text-3xl font-black text-emerald-950 tracking-tighter leading-tight mb-4">
                      Taste the purity of <span className="relative inline-block text-emerald-700">
                        namma ooru
                        <Sparkles className="absolute -top-4 -right-4 h-4 w-4 text-amber-400" />
                      </span>
                    </h3>

                    <p className="text-slate-500 text-[14px] leading-relaxed mb-8">
                      Join 10,000+ families eating fresh, chemical-free produce direct from local farmers. Subscribe to unlock your exclusive discount.
                    </p>

                    <form onSubmit={handleSubscribe} className="space-y-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none transition-colors group-focus-within:text-emerald-500" />
                        <input
                          type="email"
                          required
                          placeholder="Your email address"
                          className="w-full h-14 pl-12 pr-4 rounded-[1.25rem] border-2 border-slate-100 bg-slate-50 text-emerald-950 font-bold focus:border-emerald-500 focus:bg-white transition-all outline-none text-[14px]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full h-14 bg-emerald-950 text-white rounded-[1.25rem] font-black text-[14px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-800 hover:shadow-2xl hover:shadow-emerald-900/20 active:scale-95 transition-all group"
                      >
                        Claim Offer <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </form>

                    <p className="mt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center opacity-60 italic">
                      * One-time use only. Terms apply.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center text-center p-8"
                  >
                    <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
                      <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-black text-emerald-950 mb-3 tracking-tighter">Offer Unlocked!</h3>
                    <p className="text-slate-500 text-sm mb-6">Your 20% discount code has been sent to your email. Check your inbox and start shopping!</p>
                    <div className="bg-emerald-50 px-6 py-2 rounded-full text-emerald-700 font-black text-sm uppercase tracking-widest">
                      Code: NAMMA20
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};



export default MarketingPopup;
