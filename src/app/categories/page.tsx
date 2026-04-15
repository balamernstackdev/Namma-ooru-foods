import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, LayoutGrid, Sparkles, CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '@/lib/staticData';
import HeroCarousel from '@/components/HeroCarousel';

const CategoriesPage = () => {
  return (
    <div className="w-full bg-white min-h-screen">
      <HeroCarousel 
        images={['banners/categories_1.png', 'banners/categories_2.png']}
        title={<>Organic <br /><span className="text-amber-400 italic">Collections</span></>}
        subtitle="Explore our diverse range of traditional and healthy food products, sourced directly from local artisans across India."
        badges={
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-500/20 backdrop-blur-md flex items-center justify-center border border-amber-500/30">
              <LayoutGrid className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500">Explore Collections</span>
          </div>
        }
      />
 
      <div className="w-full section-spacing flex justify-center">
        <div className="standard-container">
          
          <div className="flex flex-col md:flex-row items-center md:justify-between mb-20 md:mb-32 border-b border-slate-50 pb-12 gap-10">
            <h2 className="text-emerald-950 tracking-tight">Browse By Genre</h2>
            <div className="h-2 w-24 bg-amber-400 rounded-full" />
          </div>
 
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {CATEGORIES.map((cat) => (
              <Link 
                href={`/products?category=${cat.name}`} 
                key={cat.id} 
                className="group flex flex-col bg-slate-50 rounded-xl md:rounded-[3rem] border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-premium hover:-translate-y-3 transition-all duration-700 overflow-hidden"
              >
                <div className="relative aspect-square w-full overflow-hidden">
                  <Image 
                    src={cat.image} 
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute top-6 right-6 bg-emerald-950/90 backdrop-blur-md text-white px-5 py-2 rounded-full shadow-2xl">
                    <span className="text-[10px] font-black uppercase tracking-widest">{cat.count} Items</span>
                  </div>
                </div>
 
                <div className="flex flex-col flex-1 p-5 md:p-12">
                  <h3 className="text-emerald-950 tracking-tight group-hover:text-amber-600 transition-colors mb-3 uppercase text-sm md:text-base">{cat.name}</h3>
                  <p className="text-slate-500 text-[10px] md:text-sm font-medium leading-relaxed mb-6 md:mb-10 line-clamp-2">{cat.description}</p>
                  
                  <div className="mt-auto pt-6 md:pt-8 flex items-center justify-between border-t border-slate-100">
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-950/60 group-hover:text-amber-600 transition-colors">
                      Enter Vault
                    </span>
                    <div className="h-9 w-9 md:h-12 md:w-12 rounded-full bg-white border border-slate-100 flex items-center justify-center text-emerald-950 group-hover:bg-emerald-950 group-hover:text-white transition-all shadow-premium">
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
