import Hero from "@/components/Hero";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { ArrowRight, Truck, ShieldCheck, Leaf, Zap } from 'lucide-react';
import MarketingPopup from "@/components/MarketingPopup";
import nextDynamic from 'next/dynamic';
import { Skeleton, CategoryCircleSkeleton } from '@/components/Skeleton';
import PageReveal, { StaggerContainer, StaggerItem } from '@/components/PageReveal';

const CategoriesCircles = nextDynamic(() => import('@/components/CategoriesCircles'), {
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

const ShopByVideo = nextDynamic(() => import('@/components/ShopByVideo'), { ssr: true });
const ShopByConcern = nextDynamic(() => import('@/components/ShopByConcern'), { ssr: true });
const TrustMarquee = nextDynamic(() => import('@/components/TrustMarquee'), { ssr: true });
const PromoBanner = nextDynamic(() => import('@/components/PromoBanner'), { ssr: true });
const VendorShowcase = nextDynamic(() => import('@/components/VendorShowcase'), { ssr: true });

import { API_URL } from '@/lib/api';

export const dynamic = 'force-static';

async function getLiveProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=8`, { next: { revalidate: 120 } });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Home Fetch Error:", e);
    return [];
  }
}

export default async function Home() {
  const products = await getLiveProducts();
  const featuredProducts = products.slice(0, 4);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Namma Orru Foods",
    "url": "https://nammaorrufoods.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://nammaorrufoods.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Namma Orru Foods",
    "url": "https://nammaorrufoods.com",
    "logo": "https://nammaorrufoods.com/logo.webp",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-98400-12345",
      "contactType": "customer service"
    }
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Organic Food Collection | Namma Orru Foods",
    "description": "Explore our curated collection of authentic, organic, and farm-fresh products sourced directly from local agrarian clusters.",
    "url": "https://nammaorrufoods.com/products",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": featuredProducts.map((p: any, idx: number) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://nammaorrufoods.com/products/${p.slug || p.id}`
      }))
    }
  };

  return (
    <div className="flex flex-col bg-white w-full overflow-x-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <Hero />
      <MarketingPopup />

      {/* 01. Trust Bar */}
      <section className="relative z-30 -mt-6 md:-mt-12 flex justify-center">
        <div className="standard-container">
          <div className="bg-white rounded-3xl md:rounded-[4rem] shadow-premium border border-slate-100 p-6 md:p-14 lg:p-20">
            <StaggerContainer>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 items-center">
                <FeatureItem Icon={Truck} title="Fast Delivery" desc="Free over ₹499" />
                <FeatureItem Icon={ShieldCheck} title="Pure & Safe" desc="Certified Organic" />
                <FeatureItem Icon={Leaf} title="Farm Fresh" desc="Direct Sourcing" />
                <FeatureItem Icon={Zap} title="Instant Support" desc="24/7 Help Line" />
              </div>
            </StaggerContainer>
          </div>
        </div>
      </section>

      {/* 02. Our Organic Range */}
      <CategoriesCircles />

      {/* 03. Weekly Favorites - LIVE DATA */}
      <section className="pt-6 md:pt-10 pb-10 md:pb-16 bg-white border-y border-slate-50 flex justify-center">
        <div className="standard-container">
          <div className="flex flex-col gap-8 md:gap-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="max-w-2xl text-center md:text-left">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-emerald-800/60 mb-6 inline-block">Direct From Live Sources</span>
                <h2 className="text-emerald-950 font-black tracking-tight text-3xl md:text-5xl lg:text-7xl leading-tight">
                  Fresh Harvests <br />
                  <span className="text-amber-500 italic underline decoration-amber-200 decoration-8 underline-offset-8">Direct</span>
                </h2>
              </div>
            </div>

            <StaggerContainer>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                {featuredProducts.length > 0 ? (
                  featuredProducts.map((product: any) => (
                    <StaggerItem key={product.id}>
                      <ProductCard product={product} />
                    </StaggerItem>
                  ))
                ) : (
                  <div className="col-span-4 py-20 text-center">
                    <p className="text-slate-400 font-bold uppercase tracking-widest">Awaiting Live Feed...</p>
                  </div>
                )}
              </div>
            </StaggerContainer>

            {featuredProducts.length > 0 && (
              <div className="flex justify-center pt-8 md:pt-12">
                <Link
                  href="/products"
                  className="h-14 md:h-16 px-10 md:px-14 rounded-full bg-emerald-950 !text-white text-[11px] font-black uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-emerald-900 transition-all group shadow-xl active:scale-95"
                >
                  View All Products
                  <ArrowRight size={18} className="text-amber-400 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <VendorShowcase />

      <ShopByConcern />
      <ShopByVideo />
      <PromoBanner />
      <TrustMarquee />

      {/* 09. Brand Mission Section */}
      <section className="relative overflow-hidden section-spacing section-no-bottom bg-emerald-950 flex justify-center min-h-[50vh] md:min-h-[60vh] py-20 md:py-32">
        <div className="absolute inset-0 z-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: 'url("/ai_images/cinematic_farm_1776230966841.png")' }} />
        <div className="standard-container relative z-10 flex flex-col items-start justify-center text-left">
          <div className="max-w-4xl space-y-6 md:space-y-10">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.4em] text-amber-400 mb-2 md:mb-6 inline-block">Multi-Vendor Ecosystem</span>
            <h2 className="text-white font-black tracking-tight text-3xl md:text-7xl leading-[1.1]">
              Supporting <br />
              <span className="text-amber-400">Independent</span> <br />
              Resellers.
            </h2>
            <p className="text-lg md:text-2xl text-emerald-50/70 font-medium leading-relaxed max-w-2xl">
              From pickles to millets, we've built a platform for local businesses to reach your home directly.
            </p>
            <div className="flex flex-wrap gap-6 pt-6 md:pt-10">
              <Link href="/brands" className="h-14 md:h-16 px-8 md:px-12 rounded-full bg-amber-500 text-emerald-950 text-sm font-black shadow-2xl transition-all hover:bg-amber-400 hover:scale-105 flex items-center justify-center gap-3">
                Explore All Brands <ArrowRight size={20} />
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
    <div className="flex flex-row items-center gap-4 group cursor-default text-left w-full">
      <div className="h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-2xl bg-[#f9f9f9] flex items-center justify-center text-[var(--primary)] transition-all duration-300 shadow-sm border border-[#eeeeee]">
        <Icon className="h-6 w-6 md:h-7 md:w-7" strokeWidth={1.5} />
      </div>
      <div className="flex flex-col">
        <h4 className="font-bold text-[#1a1a1a] text-[13px] md:text-lg tracking-tight leading-tight">{title}</h4>
        <p className="text-[9px] md:text-[10px] text-gray-400 font-black uppercase tracking-[0.1em] mt-1">{desc}</p>
      </div>
    </div>
  )
}
