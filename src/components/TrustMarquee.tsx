'use client';

import React from 'react';
import { Leaf, ShieldCheck, Zap, Heart } from 'lucide-react';

const TrustMarquee = () => {
  const items = [
    { icon: Leaf, text: '100% Pesticides Free' },
    { icon: ShieldCheck, text: 'Premium High Quality' },
    { icon: Zap, text: 'Direct from Farms' },
    { icon: Heart, text: 'Eco-Friendly Packing' },
  ];

  return (
    <div className="bg-[var(--primary)] py-4 overflow-hidden whitespace-nowrap relative">
      <div className="flex animate-marquee items-center">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center gap-12 mx-6">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-3 text-white">
                <item.icon className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-[0.2em]">{item.text}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 80s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TrustMarquee;
