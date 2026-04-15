import React from 'react';
import Link from 'next/link';

import { Baby, Activity, Weight, ShieldPlus, Sparkles, Stethoscope } from 'lucide-react';

const concerns = [
  { name: 'Pregnancy Care', icon: Baby, href: '/concerns/pregnancy', color: 'text-pink-600 border-pink-100' },
  { name: 'Kids Wellness', icon: Activity, href: '/concerns/kids', color: 'text-blue-600 border-blue-100' },
  { name: 'Weight Loss', icon: Weight, href: '/concerns/weight-loss', color: 'text-orange-600 border-orange-100' },
  { name: 'Immunity Boost', icon: ShieldPlus, href: '/concerns/immunity', color: 'text-green-600 border-green-100' },
  { name: 'Skin & Hair', icon: Sparkles, href: '/concerns/beauty', color: 'text-purple-600 border-purple-100' },
  { name: 'Diabetes Care', icon: Stethoscope, href: '/concerns/diabetes', color: 'text-red-600 border-red-100' },
];

const ShopByConcern = () => {
  return (
    <div className="w-full bg-white relative z-10 pt-10 md:pt-16 pb-12 md:pb-20">
      <div className="standard-container">
        <div className="text-center mb-6 md:mb-10">
          <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-800/60 mb-3 inline-block tracking-widest">Targeted Wellness</span>
          <h2 className="text-emerald-950 font-black tracking-tight text-2xl md:text-3xl lg:text-4xl">Shop By <span className="italic text-amber-500">Health Concern</span></h2>
        </div>


        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-8">
          {concerns.map((concern) => (
            <Link
              key={concern.name}
              href={concern.href}
              className="group flex flex-col items-center gap-4 md:gap-6 p-4 md:p-8 rounded-[2rem] md:rounded-[3rem] bg-transparent transition-all hover:bg-white hover:shadow-premium hover:-translate-y-2 md:hover:-translate-y-4"
            >
              <div className={`h-22 w-22 md:h-36 md:w-36 rounded-full border bg-white ${concern.color} flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-sm p-5 md:p-10 group-hover:shadow-premium`}>
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
