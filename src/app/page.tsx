import Hero from "@/components/Hero";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductCarousel from "@/components/ProductCarousel";
import HomeBanner from "@/components/HomeBanner";
import { ArrowRight, Truck, ShieldCheck, Leaf, Zap } from 'lucide-react';
import MarketingPopup from "@/components/MarketingPopup";
import nextDynamic from 'next/dynamic';
import { Skeleton, CategoryCircleSkeleton } from '@/components/Skeleton';
import PageReveal, { StaggerContainer, StaggerItem } from '@/components/PageReveal';
import Image from 'next/image';
const CategoriesCircles = nextDynamic(() => import('@/components/CategoriesCircles'), {
  ssr: true, // Keep true for SEO discovery of categories
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

import LazyHomeSections from '@/components/HomePageSections';
import MarketingPopupWrapper from '@/components/MarketingPopupWrapper';
import VendorShowcase from '@/components/VendorShowcase';

import { API_URL } from '@/lib/api';
import { PRODUCTS } from '@/lib/staticData';

// Static export mode — data is fetched at build time
export const dynamic = 'force-static';

async function getLiveProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=30`, {
      cache: 'no-store',
    });
    if (!res.ok) return PRODUCTS;
    const data = await res.json();
    return data.length > 0 ? data : PRODUCTS;
  } catch (e) {
    console.error('Home Fetch Error:', e);
    return PRODUCTS;
  }
}

export default async function Home() {
  const products = await getLiveProducts();
  
  // Best sellers: tagged, else first 8
  const featuredProducts = products.filter((p: any) => p.tags?.includes('best-selling')).slice(0, 8);
  // New arrivals: tagged, else next slice (non-overlapping)
  const bestSellerIds = new Set(featuredProducts.map((p: any) => p.id));
  const newProducts = products.filter((p: any) => !bestSellerIds.has(p.id) && p.tags?.includes('new')).slice(0, 8);
  // All products for the main grid
  const allProducts = products;

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
    "url": "https://namma-urru-foods.web.app",
    "logo": "https://namma-urru-foods.web.app/logo.webp",
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
    "url": "https://namma-urru-foods.web.app/products",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": featuredProducts.map((p: any, idx: number) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "url": `https://namma-urru-foods.web.app/products/${p.slug || p.id}`
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
      <main>
        <Hero />
        <MarketingPopupWrapper />

        {/* 01. Brands You Love - Moved to Top */}
        <VendorShowcase />

        {/* 02. Our Organic Range */}
        <CategoriesCircles />

        {/* 03. Best Sellers — Carousel */}
        <ProductCarousel
          products={featuredProducts}
          title='Best <span class="text-accent italic">Sellers</span>'
          subtitle="Customer Favorites"
          viewAllHref="/best-selling"
          bgClass="bg-white"
          autoScrollInterval={3000}
        />
        {/* 04. Featured Promo Banner */}
        <section className="py-2 flex justify-center">
          <div className="standard-container">
            <div className="relative w-full h-[200px] md:h-[350px] rounded-[2rem] overflow-hidden group cursor-pointer">
              <Image 
                src="/ai_images/sweets_snacks_banner.png" 
                alt="Festive Sweets" 
                fill 
                className="object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent flex flex-col justify-center px-10 md:px-20">
                <span className="text-amber-400 text-xs font-black uppercase tracking-[0.3em] mb-4">Festive Specials</span>
                <h3 className="text-white text-2xl md:text-5xl font-black mb-6 leading-tight drop-shadow-lg">Handmade Sweets & <br /> Traditional Savouries</h3>
                <div>
                  <Link href="/products?category=Local Sweets" className="inline-flex h-10 md:h-12 px-8 rounded-full bg-amber-500 text-slate-900 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-primary transition-all items-center shadow-lg">
                    Shop Sweets
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* 05. New Arrivals — Carousel */}
        <ProductCarousel
          products={newProducts}
          title='New <span class="text-accent italic">Arrivals</span>'
          subtitle="Just Harvested"
          viewAllHref="/products"
          bgClass="bg-slate-50"
          autoScrollInterval={3500}
        />

        {/* 06. Dynamic Banner — admin-controlled */}
        <HomeBanner apiUrl={API_URL} />

        {/* 07. Full Collection — Carousel */}
        <ProductCarousel
          products={allProducts}
          title='Authentic <span class="text-primary italic">Foods</span>'
          subtitle="Our Full Collection"
          viewAllHref="/products"
          bgClass="bg-white"
          autoScrollInterval={4000}
        />

        <div className="flex justify-center pb-2">
          <Link href="/products" className="h-14 px-12 rounded-full border-2 border-primary text-primary font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-all flex items-center gap-3 group">
            View Complete Catalog <ArrowRight className="group-hover:translate-x-2 transition-transform" />
          </Link>
        </div>

        <LazyHomeSections />
      </main>
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
