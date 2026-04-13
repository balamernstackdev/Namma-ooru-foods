
import React from 'react';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
 
const BANNERS = [
  {
    id: 1,
    title: "The Gold Standard Oils",
    subtitle: "Experience the legendary flavor of wood-pressed seeds. No heat, no chemicals, just liquid gold.",
    badge: "Limited Batch",
    image: "/banners/banner_1.png",
    color: "bg-amber-50"
  },
  {
    id: 2,
    title: "Ancient Grains Revived",
    subtitle: "Our millets are sourced from tribal farmers using heritage seeds. Taste the history of nutrition.",
    badge: "Direct Farm",
    image: "/banners/banner_2.png",
    color: "bg-emerald-50"
  }
];
 
const BannersRow = () => {
  return (
    <section className="w-full section-spacing flex justify-center bg-white">
      <div className="standard-container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          {BANNERS.map((banner) => (
            <div 
              key={banner.id}
              className="group relative aspect-[16/9] md:aspect-[16/8] rounded-[30px] overflow-hidden bg-slate-50 shadow-premium hover:shadow-hover transition-all duration-700 hover:-translate-y-3"
            >
              <Image 
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover transition-transform duration-[2500ms] group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/30 to-transparent z-10" />
              
              <div className="relative z-20 h-full flex flex-col justify-center p-10 md:p-14 max-w-[90%]">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 mb-6 block animate-pulse">
                  {banner.badge}
                </span>
                <h2 className="text-white text-[clamp(20px,3.5vw,42px)] font-black tracking-tight mb-8 leading-[1.2] uppercase">
                  {banner.title}
                </h2>
                <p className="text-emerald-50/70 text-sm md:text-lg font-medium leading-relaxed mb-10 max-w-sm">
                  {banner.subtitle}
                </p>
                <div className="flex">
                  <button className="h-16 px-16 rounded-full bg-white text-emerald-950 font-black uppercase tracking-widest text-[11px] hover:bg-amber-400 transition-all shadow-premium group/btn">
                    Explore Harvest <ArrowRight className="inline-block ml-4 h-5 w-5 group-hover:translate-x-3 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
 
export default BannersRow;
