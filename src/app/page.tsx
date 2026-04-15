import Hero from "@/components/Hero";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Truck, ShieldCheck, Leaf, Zap } from 'lucide-react';
import MarketingPopup from "@/components/MarketingPopup";
import { CATEGORIES, PRODUCTS } from "@/lib/staticData";
import dynamic from 'next/dynamic';
import { Skeleton, CategoryCircleSkeleton } from '@/components/Skeleton';
import PageReveal, { StaggerContainer, StaggerItem } from '@/components/PageReveal';

const CategoriesCircles = dynamic(() => import('@/components/CategoriesCircles'), {
  ssr: true,
  loading: () => (
    <div className="w-full py-16 flex justify-center bg-white mt-10">
      <div className="standard-container">
        <div className="flex justify-center gap-10 md:gap-20 overflow-hidden">
          {[...Array(6)].map((_, i) => <CategoryCircleSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
});

const ShopByVideo = dynamic(() => import('@/components/ShopByVideo'), {
  ssr: true,
  loading: () => (
    <div className="w-full py-24 bg-[#fffefc] flex justify-center">
      <div className="standard-container">
        <div className="flex gap-8 overflow-hidden">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="flex-shrink-0 w-80 h-[540px] rounded-[2.5rem]" />)}
        </div>
      </div>
    </div>
  )
});

const ShopByConcern = dynamic(() => import('@/components/ShopByConcern'), {
  ssr: true,
  loading: () => (
    <div className="w-full py-24 flex justify-center">
      <div className="standard-container">
        <div className="grid grid-cols-6 gap-8">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="aspect-square rounded-full" />)}
        </div>
      </div>
    </div>
  )
});

const BannersRow = dynamic(() => import('@/components/BannersRow'), {
  ssr: true,
  loading: () => (
    <div className="w-full py-16 flex justify-center">
      <div className="standard-container">
        <div className="grid grid-cols-2 gap-12">
          <Skeleton className="aspect-[16/8] rounded-[30px]" />
          <Skeleton className="aspect-[16/8] rounded-[30px]" />
        </div>
      </div>
    </div>
  )
});

const TrustMarquee = dynamic(() => import('@/components/TrustMarquee'), { ssr: true });
const PromoBanner = dynamic(() => import('@/components/PromoBanner'), { ssr: true });

export default function Home() {
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <div className="flex flex-col bg-white w-full overflow-x-hidden">
      <Hero />
      <MarketingPopup />

      {/* 01. Trust Bar / Features - Anchored Elevation */}
      <section className="relative z-30 -mt-6 md:-mt-12 flex justify-center">
        <div className="standard-container">
          <div className="bg-white rounded-[1.5rem] md:rounded-[4rem] shadow-premium border border-slate-100 p-8 sm:p-10 md:p-14 lg:p-20">
            <StaggerContainer>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-12 items-center">
                <StaggerItem><FeatureItem Icon={Truck} title="Fast Delivery" desc="Free over ₹499" /></StaggerItem>
                <StaggerItem><FeatureItem Icon={ShieldCheck} title="Pure & Safe" desc="Certified Organic" /></StaggerItem>
                <StaggerItem><FeatureItem Icon={Leaf} title="Farm Fresh" desc="Direct Sourcing" /></StaggerItem>
                <StaggerItem><FeatureItem Icon={Zap} title="Instant Support" desc="24/7 Help Line" /></StaggerItem>
              </div>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* 02. Our Organic Range (Categories) */}
      <CategoriesCircles />

      {/* 03. Weekly Favorites (Featured Products) */}
      <section className="pt-6 md:pt-10 pb-10 md:pb-16 bg-white border-y border-slate-50 flex justify-center">
        <div className="standard-container">
          <div className="flex flex-col gap-8 md:gap-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-2xl text-center md:text-left">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-800/60 mb-6 inline-block">Weekly Favorites</span>
                <h2 className="text-emerald-950 font-black tracking-tight text-2xl md:text-5xl lg:text-6xl">
                  Best Sellers <br />
                  <span className="text-amber-500 italic">This Season</span>
                </h2>
              </div>

            </div>

            <StaggerContainer>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {featuredProducts.map((product) => (
                  <StaggerItem key={product.id}>
                    <ProductCard product={product} />
                  </StaggerItem>
                ))}
              </div>
            </StaggerContainer>
            <Link href="/products" className="group h-11 md:h-13 px-8 md:px-10 rounded-full bg-emerald-950 !text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-4 hover:scale-105 transition-all shadow-xl mx-auto md:mx-0 shrink-0">
              View All Products <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* 04. Health Discovery (Shop by Concern) */}
      <ShopByConcern />

      {/* 06. Interactive Discovery (Video Shopping) */}
      <ShopByVideo />

      {/* 07. Seasonal Offerings (Promo Banner) */}
      <PromoBanner />

      {/* 08. Industry Trust (Marquee) */}
      <TrustMarquee />

      {/* 09. Brand Mission Section (Cinematic) */}
      <section className="relative overflow-hidden section-spacing section-no-bottom bg-emerald-950 flex justify-center min-h-[45vh] md:min-h-[50vh]">

        {/* Cinematic Backdrop */}
        <div className="absolute inset-0 z-0 opacity-10 bg-cover bg-center grayscale mix-blend-overlay scale-110 object-cover"
          style={{ backgroundImage: 'url("/ai_images/cinematic_farm_1776230966841.png")' }} />

        <div className="standard-container relative z-10 flex flex-col items-start justify-center text-left">
          <div className="max-w-4xl space-y-8 md:space-y-10">
            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 mb-4 md:mb-6 inline-block">The Namma Orru Mission</span>
            <h2 className="text-white font-black tracking-tight text-4xl md:text-6xl leading-[1.1]">Honest Food, <br /><span className="text-amber-400">Directly</span> <br />To Your Table.</h2>

            <p className="text-lg md:text-xl text-emerald-50/70 font-medium leading-relaxed max-w-3xl mx-auto">
              We've cut out the middlemen to bring you the purest harvest.
              By shopping here, you're directly supporting over 100+ local farm families.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-start gap-4 md:gap-6 pt-8 md:pt-14 w-full md:w-auto">

              <Link href="/brands" className="w-full md:w-auto h-14 md:h-16 px-10 md:px-12 rounded-full bg-amber-500 !text-emerald-950 text-[10px] md:text-sm font-black shadow-2xl transition-all hover:bg-amber-400 hover:scale-105 flex items-center justify-center gap-3 shrink-0 whitespace-nowrap">
                Meet the Farmers <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/about" className="w-full md:w-auto h-14 md:h-16 px-10 md:px-12 rounded-full bg-white/10 !text-white text-[10px] md:text-sm font-black border border-white/20 backdrop-blur-xl transition-all hover:bg-white/20 hover:scale-105 flex items-center justify-center shrink-0 whitespace-nowrap">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ Icon, title, desc }: { Icon: any, title: string, desc: string }) {
  return (
    <div className="flex flex-row items-center gap-3 md:gap-4 group cursor-default text-left w-full">
      <div className="h-10 w-10 md:h-16 md:w-16 shrink-0 rounded-xl md:rounded-2xl bg-[#f9f9f9] flex items-center justify-center text-[var(--primary)] transition-all duration-300 md:group-hover:bg-[var(--primary)] md:group-hover:text-white shadow-sm border border-[#eeeeee]">
        <Icon className="h-5 w-5 md:h-7 md:w-7" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col">
        <h4 className="font-bold text-[#1a1a1a] text-xs md:text-base tracking-tight">{title}</h4>
        <p className="text-[9px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-0.5 md:mt-1">{desc}</p>
      </div>
    </div>
  )
}
