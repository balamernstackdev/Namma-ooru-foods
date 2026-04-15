'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Gift, ArrowRight } from 'lucide-react';

const MarketingPopup = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const hasSeen = localStorage.getItem('hasSeenPopup');
      if (!hasSeen) {
        setIsVisible(true);
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const closePopup = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenPopup', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closePopup} />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[calc(100vw-2rem)] md:max-w-lg overflow-hidden rounded-[2rem] bg-[var(--background)] shadow-2xl animate-scale-up">
        <div className="absolute right-4 top-4 z-20">
          <button onClick={closePopup} className="rounded-full bg-[var(--muted)] p-2 hover:bg-[var(--border)] transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="relative aspect-square md:aspect-auto h-64 md:h-full overflow-hidden bg-[var(--primary)]">
            <Image
              src="/ai_images/discount_offer_1776230743911.png"
              className="object-cover opacity-80"
              alt="Offer"
              fill
              sizes="(max-width: 768px) 100vw, 500px"
            />
            <div className="absolute inset-0 flex items-center justify-center p-8 bg-[var(--primary)]/20 text-center text-white">
              <div>
                <Gift className="h-16 w-16 mx-auto mb-4 animate-bounce" />
                <h2 className="text-4xl font-black">20% OFF</h2>
                <p className="font-bold opacity-90">YOUR FIRST ORDER</p>
              </div>
            </div>
          </div>

          <div className="p-8 flex flex-col justify-center">
            <h3 className="text-2xl font-bold leading-tight">Welcome to <span className="text-[var(--primary)]">Namma Orru</span> Foods!</h3>
            <p className="mt-4 text-[var(--muted-foreground)]">
              Join our community and get fresh, authentic local food delivered to your home. Sign up for our newsletter to unlock your discount!
            </p>

            <input
              type="email"
              placeholder="Enter your email"
              className="mt-8 h-12 w-full rounded-xl bg-[var(--muted)] px-4 text-sm outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all"
            />

            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--foreground)] py-4 font-bold text-white transition-all hover:bg-[var(--primary)] hover:scale-105">
              Claim My Discount <ArrowRight className="h-4 w-4" />
            </button>

            <p className="mt-4 text-center text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">
              * valid on orders above ₹499
            </p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default MarketingPopup;
