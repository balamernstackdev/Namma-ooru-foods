import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Our Heritage & Mission | Namma Orru Foods',
  description: 'Born from a simple dream to restore the ancient wisdom of ancestral farming to the modern Indian home.',
};
import { Leaf, ShieldCheck, Truck, Heart, Users, Target, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-white w-full overflow-x-hidden pb-24 md:pb-40">
      
       {/* Hero Section */}
       <section className="relative w-full overflow-hidden bg-emerald-950" style={{ height: '70vh', minHeight: '600px' }}>
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?q=80&w=2000&auto=format&fit=crop" 
            alt="Organic Farming" 
            fill
            className="object-cover opacity-30 grayscale mix-blend-overlay"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/80 via-transparent to-white/10 z-10" />
        
        <div className="relative z-20 w-full h-full flex items-center justify-center text-center">
          <div className="standard-container py-24 md:py-32">
            <span className="text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-[0.5em] mb-8 md:mb-12 inline-block">Our Heritage • Our Roots</span>
            <h1 className="text-4xl md:text-7xl lg:text-9xl font-black text-white leading-[1] tracking-tighter mb-12 md:mb-20">
              Namma Orru <br />
              <span className="text-amber-400 italic">Foods</span>
            </h1>
            <p className="text-emerald-50/70 text-base md:text-2xl font-medium max-w-3xl mx-auto leading-relaxed">
              Born from a simple dream to restore the ancient wisdom of ancestral farming to the modern Indian home.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story / Philosophy Section */}
      <section className="w-full bg-white force-center-layout py-32 md:py-48 lg:py-64">
        <div className="standard-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 lg:gap-32 items-center">
            <div className="relative">
              <div className="absolute -top-10 -left-10 h-40 w-40 bg-amber-100 rounded-full blur-[100px] opacity-30 -z-10" />
              <div className="relative rounded-[3rem] md:rounded-[4rem] overflow-hidden shadow-2xl border-4 md:border-[16px] border-white bg-gray-50 aspect-square">
                  <Image 
                    src="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=1000&auto=format&fit=crop" 
                    alt="Traditional Sourcing" 
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
              </div>
              <div className="absolute bottom-6 right-6 bg-white p-4 md:p-8 rounded-3xl shadow-2xl border border-gray-100 flex items-center gap-4 hidden sm:flex z-10 transition-transform hover:scale-105">
                  <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-emerald-950">100%</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Certified Origin</p>
                  </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-6">Our Philosophy</span>
              <h2 className="text-4xl md:text-6xl font-black text-emerald-950 leading-tight tracking-tighter mb-12 md:mb-20">
                Why we started <br />Namma Orru Foods?
              </h2>
              <div className="space-y-10 md:space-y-12 text-lg md:text-xl text-gray-600 font-medium leading-relaxed">
                <p>
                  In a world of mass-produced, chemically-enhanced food, we found that the true essence of "purity" was being lost. The traditional foods our ancestors ate—rich in nutrients and free from toxins—became harder to find.
                </p>
                <p>
                  Namma Orru Foods was established to bridge this gap. We partner directly with small-scale farmers who still practice sustainable, ancestral farming methods.
                </p>
                <p>
                  Every product that leaves our facility is a promise—a promise of health, authenticity, and respect for Mother Earth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full bg-gray-50 flex justify-center py-32 md:py-48 lg:py-64">
        <div className="standard-container">
          <div className="text-center mb-24 md:mb-32">
             <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-8 inline-block">Our Core Values</span>
             <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-emerald-950 tracking-tighter leading-tight">Everything we do is built <br /> on trust and quality.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-24">
            <AboutCard Icon={Target} title="Our Mission" desc="To make zero-pesticide, traditional food accessible and affordable to every Indian household through a transparent supply chain." />
            <AboutCard Icon={ShieldCheck} title="Our Promise" desc="No hidden additives, no artificial preservatives, and zero shortcuts. Only the purest version of nature." />
            <AboutCard Icon={Users} title="Our Community" desc="Supporting over 100+ local farming families, empowering them with sustainable practices for a better future." />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="w-full bg-emerald-950 flex justify-center py-32 md:py-56 relative overflow-hidden">
         <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
         <div className="standard-container text-center relative z-10">
            <h2 className="text-3xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter mb-24 md:mb-48 leading-tight">
               Honesty in every grain, <br />Purity in <span className="text-amber-400 italic">every bottle.</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-32">
               <ValueItem Icon={Leaf} label="100% Organic" />
               <ValueItem Icon={ShieldCheck} label="Lab Tested" opacity />
               <ValueItem Icon={Truck} label="Farm Direct" />
               <ValueItem Icon={Heart} label="Crafted with care" opacity />
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-white flex justify-center py-32 md:py-56 lg:py-64">
         <div className="standard-container">
            <div className="bg-amber-100 rounded-[2rem] md:rounded-[3rem] p-8 sm:p-12 md:p-20 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 h-96 w-96 bg-amber-400 opacity-20 blur-[150px]" />
               <div className="absolute bottom-0 left-0 h-96 w-96 bg-emerald-400 opacity-20 blur-[150px]" />
               
               <h2 className="text-3xl md:text-7xl font-black text-emerald-950 mb-12 md:mb-20 relative z-10 leading-[1.1] tracking-tighter">
                  Join us on our journey <br /> to a healthier life.
               </h2>
               <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 relative z-10">
                  <Link href="/products" className="w-full md:w-auto px-12 py-5 rounded-full bg-emerald-950 text-white font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl">
                     Start Shopping
                  </Link>
                  <Link href="/about" className="w-full md:w-auto px-12 py-5 rounded-full bg-white text-emerald-950 font-black uppercase tracking-widest border border-emerald-100 transition-all hover:bg-emerald-50">
                     Our Farmers
                  </Link>
               </div>
            </div>
         </div>
      </section>
    </div>
  );
}

function AboutCard({ Icon, title, desc }: { Icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-10 md:p-16 rounded-[3rem] md:rounded-[4rem] shadow-sm hover:shadow-premium transition-all border border-gray-100 group">
       <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl md:rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-600 mb-10 md:mb-12 group-hover:bg-emerald-950 group-hover:text-white transition-all duration-500 shadow-sm">
          <Icon className="h-10 w-10 md:h-12 md:w-12" />
       </div>
       <h3 className="text-2xl md:text-4xl font-black text-emerald-950 mb-6 md:mb-8 tracking-tighter">{title}</h3>
       <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed">{desc}</p>
    </div>
  )
}

function ValueItem({ Icon, label, opacity }: { Icon: any, label: string, opacity?: boolean }) {
   return (
      <div className="flex flex-col items-center gap-8 md:gap-10">
         <div className={`h-20 w-20 md:h-32 md:w-32 rounded-full border flex items-center justify-center text-amber-400 transition-all duration-700 hover:bg-amber-400 hover:text-emerald-950 cursor-default ${opacity ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
            <Icon className="h-8 w-8 md:h-12 md:w-12" />
         </div>
         <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/50">{label}</span>
      </div>
   )
}
