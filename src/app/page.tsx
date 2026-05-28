import Hero from "@/components/Hero";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductCarousel from "@/components/ProductCarousel";
import HomeBanner from "@/components/HomeBanner";
import { Truck, ShieldCheck, Leaf, Zap } from 'lucide-react';
import MarketingPopup from "@/components/MarketingPopup";
import nextDynamic from 'next/dynamic';
import { Skeleton, CategoryCircleSkeleton } from '@/components/Skeleton';
import PageReveal, { StaggerContainer, StaggerItem } from '@/components/PageReveal';
import Image from 'next/image';

const CategoriesCircles = nextDynamic(() => import('@/components/CategoriesCircles'), {
  ssr: true,
  loading: () => (
    <div className="w-full pt-4 pb-8 flex justify-center bg-white">
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
import ArtisanMarketplace from '@/components/ArtisanMarketplace';
import VendorShowcase from '@/components/VendorShowcase';
import FarmersCollection from '@/components/FarmersCollection';

import { API_URL } from '@/lib/api';

async function getLiveProducts() {
  try {
    const res = await fetch(`${API_URL}/api/products?limit=100`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data && Array.isArray(data.products) ? data.products : []);
  } catch (e) {
    return [];
  }
}

async function getLiveBanners() {
  try {
    const res = await fetch(`${API_URL}/api/banners`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    return [];
  }
}

export default async function Home() {
  const products = await getLiveProducts();
  const apiBanners = await getLiveBanners();

  const taggedBestSellers = products.filter((p: any) => p.tags?.includes('best-selling')).slice(0, 8);
  const featuredProducts = taggedBestSellers.length > 0 ? taggedBestSellers : products.slice(0, 8);

  const bestSellerIds = new Set(featuredProducts.map((p: any) => p.id));
  const newProducts = products.filter((p: any) => !bestSellerIds.has(p.id)).slice(0, 8);

  return (
    <div className="flex flex-col bg-white w-full overflow-x-hidden">
      <main>
        <Hero />
        <MarketingPopupWrapper />

        {/* 1. Shop By Category */}
        <CategoriesCircles />

        {/* 2. Featured Vendors */}
        <VendorShowcase />

        {/* 3. BEST SELLERS — Most Popular Products */}
        <ProductCarousel
          products={featuredProducts}
          title='BEST <span class="text-accent italic lowercase font-serif font-normal">SELLERS</span>'
          subtitle="Most Popular Products"
          viewAllHref="/best-selling"
          bgClass="bg-slate-50"
          autoScrollInterval={3000}
        />

        {/* 4. Popular Brands — Grid Marketplace */}
        <ArtisanMarketplace />

        {/* 5. Festive Specials Banner */}
        {(() => {
          const festiveBanner = apiBanners?.find((b: any) => b.title === 'Product Festival') || {
            desktopImage: 'https://s3.ap-south-1.amazonaws.com/namma-orru-foods/ai_assets/Product_festival.png',
            title: 'Festive Specials',
            subtitle: 'Traditional Product',
            buttonText: 'Shop Now',
            link: '/products'
          };

          return (
            <section className="py-12 flex justify-center">
              <div className="standard-container">
                <div className="relative w-full h-[250px] md:h-[400px] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl">
                  <Image
                    src={festiveBanner.desktopImage}
                    alt={festiveBanner.title}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                    unoptimized={festiveBanner.desktopImage?.startsWith('http')}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent flex flex-col justify-center px-12 md:px-24">
                    <span className="text-amber-400 text-xs font-black uppercase tracking-[0.4em] mb-6">{festiveBanner.subtitle}</span>
                    <h3 className="text-white text-3xl md:text-6xl font-black mb-8 leading-tight tracking-tighter uppercase">{festiveBanner.title}</h3>
                    <div>
                      <Link href={festiveBanner.link || '/products'} className="inline-flex h-12 px-10 rounded-full bg-amber-500 text-slate-900 font-black uppercase tracking-widest text-xs hover:bg-white transition-all items-center shadow-xl">
                        {festiveBanner.buttonText}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}

        {/* 6. Farmers' Collections — Interactive Products Listing Page Section */}
        <FarmersCollection products={products} />

        {/* 7. Premium Collections — New Arrivals Carousel */}
        <ProductCarousel
          products={newProducts}
          title='Organic <span class="text-primary italic lowercase font-serif font-normal">Collections</span>'
          subtitle="Pure. Authentic. Heritage."
          viewAllHref="/products"
          bgClass="bg-white"
          autoScrollInterval={3500}
        />

        {/* 7. Dynamic Banner — admin-controlled */}
        <HomeBanner apiUrl={API_URL} />


        <LazyHomeSections />
      </main>
    </div>
  );
}
