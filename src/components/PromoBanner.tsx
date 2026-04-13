import React from 'react';
import Image from 'next/image';
import { ArrowRight, Tag, Clock } from 'lucide-react';

const PromoBanner = () => {
  return (
    <div className="w-full relative z-10 bg-white section-spacing">
      <div className="standard-container">
        <div className="relative overflow-hidden rounded-3xl bg-amber-500 shadow-2xl shadow-amber-500/20">
          {/* Animated background patterns */}
          <div className="absolute inset-0 z-0 opacity-20" 
            style={{ 
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(255,255,255,0.5) 40px, rgba(255,255,255,0.5) 80px)',
              animation: 'patternMove 20s linear infinite'
            }} 
          />
          
          <div className="relative z-10 grid gap-6 lg:gap-8 lg:grid-cols-2 items-center p-6 md:p-8 lg:p-16">
            <div className="flex flex-col items-start">
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 border border-white/30 mb-4 md:mb-6 font-bold">
                <Tag className="h-3.5 w-3.5 text-white" />
                <span className="text-[9px] tracking-[0.2em] text-white uppercase">Limited Time Offer</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-black text-white leading-[1.1]">
                Weekend <br />
                <span className="text-emerald-950">Grand Harvest</span> <br />
                Flash Sale
              </h2>
              <p className="mt-4 md:mt-5 text-xs md:text-base text-emerald-950/80 font-medium max-w-sm italic">
                "Get up to 40% OFF on all organic vegetables and farm-fresh dairy. Direct from our roots to your home."
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 animate-slide-up delay-200 mt-8 md:mt-10 w-full sm:w-auto">
                <button className="w-full sm:w-auto min-w-[160px] md:min-w-[180px] h-11 md:h-12 flex items-center justify-center gap-3 rounded-full bg-black text-white text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] transition-all hover:bg-white hover:text-black shadow-xl shrink-0 whitespace-nowrap">
                  Claim Discount <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <div className="flex items-center gap-3 text-white/80">
                  <Clock className="h-4 w-4 text-amber-400" />
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest">Ends in 08:45:22</span>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute -inset-10 bg-white/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative z-10 w-full h-[450px] p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop" 
                  alt="Flash Sale" 
                  fill
                  className="object-cover rounded-2xl p-4"
                />
              </div>
            </div>
          </div>
        </div>
        
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes patternMove {
            from { background-position: 0 0; }
            to { background-position: 400px 400px; }
          }
        `}} />
      </div>
    </div>
  );
};

export default PromoBanner;
