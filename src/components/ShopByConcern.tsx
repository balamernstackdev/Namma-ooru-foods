import React from 'react';
import Link from 'next/link';

import { Baby, Activity, Weight, ShieldPlus, Sparkles, Stethoscope } from 'lucide-react';

const concerns = [
  { name: 'Pregnancy Care', icon: Baby, href: '/concerns/pregnancy', color: 'bg-pink-50 text-pink-600' },
  { name: 'Kids Wellness', icon: Activity, href: '/concerns/kids', color: 'bg-blue-50 text-blue-600' },
  { name: 'Weight Loss', icon: Weight, href: '/concerns/weight-loss', color: 'bg-orange-50 text-orange-600' },
  { name: 'Immunity Boost', icon: ShieldPlus, href: '/concerns/immunity', color: 'bg-green-50 text-green-600' },
  { name: 'Skin & Hair', icon: Sparkles, href: '/concerns/beauty', color: 'bg-purple-50 text-purple-600' },
  { name: 'Diabetes Care', icon: Stethoscope, href: '/concerns/diabetes', color: 'bg-red-50 text-red-600' },
];

const ShopByConcern = () => {
  return (
    <div className="w-full bg-white relative z-10 section-spacing">
      <div className="standard-container">
        <div className="text-left mb-12 md:mb-20">
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-800/60 mb-4 inline-block tracking-widest">Targeted Wellness</span>
          <h2 className="text-emerald-950 font-black tracking-tight">Shop By <span className="italic text-amber-500">Health Concern</span></h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-8">
          {concerns.map((concern) => (
            <Link
              key={concern.name}
              href={concern.href}
              className="group flex flex-col items-center gap-4 md:gap-6 p-4 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-slate-50 border border-transparent transition-all hover:bg-white hover:border-slate-100 hover:shadow-premium hover:-translate-y-2 md:hover:-translate-y-4"
            >
              <div className={`h-20 w-20 md:h-36 md:w-36 rounded-full ${concern.color} flex items-center justify-center transition-transform duration-700 group-hover:scale-110 shadow-inner p-5 md:p-10`}>
                <concern.icon className="w-full h-full" strokeWidth={1} />
              </div>
              <span className="text-[9px] md:text-[13px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-emerald-950/80 group-hover:text-amber-600 transition-colors whitespace-nowrap text-center">
                {concern.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>

  );
};

export default ShopByConcern;
