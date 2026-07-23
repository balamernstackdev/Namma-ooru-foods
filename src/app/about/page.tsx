import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Our Story & Mission | namma ooru Foods',
  description: 'Born from a simple dream to restore the ancient wisdom of ancestral farming to the modern Indian home.',
};
import { Leaf, ShieldCheck, Truck, Heart, Users, Target, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-white w-full overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-emerald-950 h-[300px] md:h-[400px]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/ai_images/banner_farm_fresh.png"
            alt="Organic Farming Landscape"
            fill
            className="object-cover opacity-40 mix-blend-luminosity brightness-90 contrast-110"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/90 via-emerald-950/70 to-emerald-950 z-10" />

        <div className="relative z-20 w-full h-full flex items-center justify-center text-center">
          <div className="standard-container py-12 md:py-20 px-6">

            <span className="text-amber-400 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] mb-4 md:mb-6 inline-block">Our Story • Our Roots</span>
            <h1 className="text-3xl md:text-6xl font-black text-white leading-tight md:leading-[1] tracking-tighter mb-4 md:mb-8">
              namma ooru <br className="hidden md:block" />
              <span className="text-amber-400 italic">Foods</span>
            </h1>
            <p className="text-emerald-50/70 text-sm md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              Born from a simple dream to restore the ancient wisdom of ancestral farming to the modern Indian home.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story / Philosophy Section */}
      <section className="w-full bg-white pt-12 pb-14 lg:pt-16 lg:pb-20">

        <div className="standard-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left Column: 2-Image Stack fulfilling full vertical height */}
            <div className="flex flex-col gap-10 lg:gap-12 sticky top-24">
              {/* Image 1: 4K Heritage Spices */}
              <div className="relative group">
                <div className="absolute -top-6 -left-6 h-36 w-36 bg-amber-100/60 rounded-full blur-[80px] -z-10" />
                <div className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border-4 md:border-[12px] border-white bg-gray-50 aspect-[4/3]">
                  <Image
                    src="/ai_images/about_us_heritage_spices.png"
                    alt="South Indian Traditional Spices"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-4 right-6 bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-10">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <Leaf className="h-5 w-5 md:h-6 md:w-6 text-amber-700" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-black text-emerald-950">100% Pure & Unrefined</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Heritage Processing</p>
                  </div>
                </div>
              </div>

              {/* Image 2: 4K Organic Harvest Grains */}
              <div className="relative group mt-4">
                <div className="absolute -bottom-6 -right-6 h-36 w-36 bg-emerald-100/60 rounded-full blur-[80px] -z-10" />
                <div className="relative rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border-4 md:border-[12px] border-white bg-gray-50 aspect-[4/3]">
                  <Image
                    src="/ai_images/about_us_organic_harvest.png"
                    alt="Organic South Indian Grains & Rice Harvest"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="absolute -bottom-4 left-6 bg-white/95 backdrop-blur-md p-4 md:p-6 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-4 z-10">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5 md:h-6 md:w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-black text-emerald-950">Direct Farm Sourced</p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">100% Certified Origin</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-6">About Us</span>
              <h2 className="text-4xl md:text-6xl font-black text-emerald-950 leading-tight tracking-tighter mb-10 md:mb-16">
                We are here to serve you
              </h2>
              <div className="space-y-6 md:space-y-8 text-base md:text-lg text-gray-600 font-medium leading-relaxed">
                <p>
                  <strong className="text-emerald-950">namma ooru Foods</strong> is a dedicated food ecosystem rooted in South Indian traditions, created to bring authentic, farm-fresh, and zero-pesticide essentials directly from village farming clusters to modern households.
                </p>
                <p>
                  Our vision is to restore ancestral food wisdom and nourish families with wholesome, chemical-free staples. By bridging the gap between local agrarian communities and urban homes, we ensure that every product delivers natural nutrition, genuine flavor, and complete transparency.
                </p>
                <p>
                  At the heart of <strong className="text-emerald-950">namma ooru Foods</strong> is our commitment to traditional processing methods—such as cold wood-pressing for pure unrefined oils, stone-grinding for aromatic spices, and natural sun-drying for heritage grains. We believe that true wellness begins with food that is unadulterated and crafted with care.
                </p>
                <p>
                  Beyond product quality, we empower small-scale farmers, women-led self-help groups, and rural cottage industries by providing direct market access, fair trade compensation, and sustainable growth opportunities. Our network supports regional farming communities while preserving culinary heritage.
                </p>
                <p>
                  We ensure that every batch of our food undergoes strict hygiene checks, quality testing, and ethical packaging, guaranteeing safety and freshness without artificial preservatives or hidden additives.
                </p>
                <p>
                  Through initiatives such as our <strong className="text-emerald-950">Farmer Direct Sourcing</strong> initiative, we showcase authentic regional specialties—from Karuppu Kavuni and Mapillai Samba traditional rice varieties to hand-pounded millet mixes and authentic village pickles.
                </p>
                <p>
                  At namma ooru Foods, our mission is to make healthy, pure, and traditional South Indian food easily accessible to every Indian family while building a sustainable future for our farming communities.
                </p>
                <div className="bg-emerald-50 p-6 md:p-8 rounded-3xl border border-emerald-100 mt-8">
                  <p className="text-xl md:text-2xl font-black text-emerald-950 italic text-center mb-6 leading-tight">
                    "Pure Traditional Food, Directly From Our Village Farmers To Your Kitchen."
                  </p>
                  <div className="text-center space-y-1">
                    <p className="font-black text-emerald-900 uppercase tracking-widest text-sm">namma ooru Foods</p>
                    <p className="text-xs font-bold text-emerald-700/70 uppercase tracking-widest">Heritage • Purity • Sustainability</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="w-full bg-gray-50 py-12 lg:py-16">

        <div className="standard-container">
          <div className="text-center mb-6 md:mb-10">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-4 md:mb-6 inline-block">Our Core Values</span>
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tighter leading-tight px-4">Everything we do is built <br className="hidden md:block" /> on trust and quality.</h2>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16 lg:gap-24">
            <AboutCard Icon={Target} title="Our Mission" desc="To make zero-pesticide, traditional food accessible and affordable to every Indian household through a transparent supply chain." />
            <AboutCard Icon={ShieldCheck} title="Our Promise" desc="No hidden additives, no artificial preservatives, and zero shortcuts. Only the purest version of nature." />
            <AboutCard Icon={Users} title="Our Community" desc="Supporting over 100+ local farming families, empowering them with sustainable practices for a better future." />
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="w-full bg-emerald-950 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="standard-container text-center relative z-10">
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-12 md:mb-16 leading-tight">
            Honesty in every grain, <br />Purity in <span className="text-amber-400 italic">every bottle.</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
            <ValueItem Icon={Leaf} label="100% Organic" />
            <ValueItem Icon={ShieldCheck} label="Lab Tested" opacity />
            <ValueItem Icon={Truck} label="Farm Direct" />
            <ValueItem Icon={Heart} label="Crafted with care" opacity />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full bg-white pt-12 pb-6 md:pb-10 section-no-bottom">
        <div className="standard-container">
          <div className="bg-emerald-50 rounded-[3rem] md:rounded-[4rem] p-10 md:p-20 text-center relative overflow-hidden border border-emerald-100/50 shadow-sm">
            <div className="absolute top-0 right-0 h-96 w-96 bg-emerald-400 opacity-10 blur-[150px]" />
            <div className="absolute bottom-0 left-0 h-96 w-96 bg-amber-400 opacity-10 blur-[150px]" />

            <h2 className="text-3xl md:text-6xl font-black text-emerald-950 mb-8 md:mb-14 relative z-10 leading-tight tracking-tighter">
              Join us on our journey <br className="hidden sm:block" /> to a healthier life.
            </h2>

            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 relative z-10 w-full max-w-4xl mx-auto">
              <Link href="/products" className="w-full md:w-auto min-w-[200px] h-14 md:h-18 px-12 md:px-20 rounded-full bg-emerald-950 !text-white text-[10px] md:text-sm font-black uppercase tracking-[0.2em] hover:bg-black transition-all shadow-2xl flex items-center justify-center whitespace-nowrap shrink-0">
                Start Shopping
              </Link>
              <Link href="/artisans" className="w-full md:w-auto min-w-[200px] h-14 md:h-18 px-12 md:px-20 rounded-full bg-white !text-emerald-950 text-[10px] md:text-sm font-black uppercase tracking-[0.2em] border-2 border-emerald-950/10 transition-all hover:border-emerald-950 hover:bg-emerald-50 flex items-center justify-center whitespace-nowrap shrink-0">
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
    <div className="bg-white p-10 md:p-12 lg:p-16 rounded-[2.5rem] md:rounded-[3rem] shadow-sm hover:shadow-premium transition-all border border-gray-100 group flex flex-col items-start text-left h-full">
      <div className="h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] md:rounded-[2rem] bg-emerald-50 flex items-center justify-center text-emerald-600 mb-10 md:mb-12 group-hover:bg-emerald-950 group-hover:text-white transition-all duration-500 shadow-sm shrink-0">
        <Icon className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col gap-4 md:gap-6">
        <h3 className="text-xl md:text-3xl font-black text-emerald-950 tracking-tighter uppercase leading-tight">{title}</h3>
        <p className="text-gray-500 text-sm md:text-base font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  )
}


function ValueItem({ Icon, label, opacity }: { Icon: any, label: string, opacity?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-6 md:gap-8">
      <div className={`h-20 w-20 md:h-32 md:w-32 rounded-full border flex items-center justify-center text-amber-400 transition-all duration-700 hover:bg-amber-400 hover:text-emerald-950 cursor-default ${opacity ? 'bg-white/5 border-white/10' : 'bg-white/10 border-white/20'}`}>
        <Icon className="h-8 w-8 md:h-12 md:w-12" />
      </div>
      <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-white/50">{label}</span>
    </div>
  )
}
