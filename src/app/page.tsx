'use client';

import React from 'react';
import useSWR from 'swr';
import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";

import FarmersCollection from '@/components/FarmersCollection';
import LazyHomeSections from '@/components/HomePageSections';
import dynamic from 'next/dynamic';
import { CategoryCircleSkeleton } from '@/components/Skeleton';
import VendorPromotion from "@/components/VendorPromotion";
import PremiumLoader from '@/components/ui/PremiumLoader';
import MarketingPopupWrapper from '@/components/MarketingPopupWrapper';

import { API_URL } from '@/lib/api';

import QuickBrowseCategories from "@/components/QuickBrowseCategories";

const CategoriesCircles = dynamic(() => import('@/components/CategoriesCircles'), {
  ssr: false, // Turn off SSR to ensure it hydrates and mounts on the client
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

const fetcher = (url: string) => fetch(url).then(res => res.json());

const getProductsList = (data: any) => Array.isArray(data) ? data : (data?.products || []);

export default function Home() {
  // Client-side fetching using SWR to ensure DevTools visibility
  const { data: bestSellersData, error: bestSellersError } = useSWR(`${API_URL}/api/products?isBestSeller=true&limit=20`, fetcher);
  const { data: organicData, error: organicError } = useSWR(`${API_URL}/api/products?isOrganic=true&limit=20`, fetcher);
  const { data: farmerData, error: farmerError } = useSWR(`${API_URL}/api/products?isFarmerCollection=true&limit=20`, fetcher);
  const { data: allData, error: allError } = useSWR(`${API_URL}/api/products?limit=100`, fetcher);
  const { data: fastDeliveryData, error: fastDeliveryError } = useSWR(`${API_URL}/api/products?isFastDelivery=true&limit=20`, fetcher);
  const { data: newArrivalsData, error: newArrivalsError } = useSWR(`${API_URL}/api/products?isNewArrival=true&limit=20`, fetcher);
  const { data: featuredData, error: featuredError } = useSWR(`${API_URL}/api/products?isFeatured=true&limit=20`, fetcher);

  const isLoading = !bestSellersData && !bestSellersError ||
    !organicData && !organicError ||
    !farmerData && !farmerError ||
    !allData && !allError ||
    !fastDeliveryData && !fastDeliveryError ||
    !newArrivalsData && !newArrivalsError ||
    !featuredData && !featuredError;

  const bestSellers = React.useMemo(() => getProductsList(bestSellersData), [bestSellersData]);
  const organicProducts = React.useMemo(() => getProductsList(organicData), [organicData]);
  const farmerProducts = React.useMemo(() => getProductsList(farmerData), [farmerData]);
  const allProducts = React.useMemo(() => getProductsList(allData), [allData]);
  const fastDeliveryProducts = React.useMemo(() => getProductsList(fastDeliveryData), [fastDeliveryData]);
  const newArrivals = React.useMemo(() => getProductsList(newArrivalsData), [newArrivalsData]);
  const featuredProducts = React.useMemo(() => getProductsList(featuredData), [featuredData]);

  // Deduplicate: organic shouldn't repeat best sellers for carousel
  const organicDisplay = React.useMemo(() => {
    const bestSellerIds = new Set(bestSellers.map((p: any) => p.id));
    const organicFiltered = organicProducts.filter((p: any) => !bestSellerIds.has(p.id)).slice(0, 12);
    return organicFiltered.length > 0 ? organicFiltered : organicProducts.slice(0, 12);
  }, [bestSellers, organicProducts]);

  const recentProducts = React.useMemo(() => allProducts.slice(0, 12), [allProducts]);

  if (isLoading) {
    return <PremiumLoader fullScreen={true} />;
  }

  return (
    <div className="flex flex-col bg-white w-full overflow-x-hidden">
      <main>
        {/* Quick Browse Categories Strip */}
        <QuickBrowseCategories activeSlug="all" />

        {/* 1. Hero Banner Slider */}
        <Hero />
        <MarketingPopupWrapper />

        {/* 2. Shop By Category */}
        <CategoriesCircles />


        {/* 5.5 FASTEST DELIVERY PRODUCTS */}
        <ProductCarousel
          products={fastDeliveryProducts}
          title='<span class="text-[10px] md:text-xs uppercase font-black tracking-[0.2em] text-emerald-600 block mb-1">FAST DELIVERY</span>Fastest Delivery <span class="text-emerald-600 italic lowercase font-serif font-normal">Products</span>'
          viewAllHref="/products?delivery=fast"
          bgClass="bg-white"
          autoScrollInterval={3200}
          bannerType="fast_delivery" subtitle={''} />

        {/* 5. BEST SELLERS — Most Popular Products */}
        <ProductCarousel
          products={bestSellers}
          title='BEST <span class="text-accent italic lowercase font-serif font-normal">SELLERS</span>'
          subtitle="Most Popular Products"
          viewAllHref="/best-selling"
          bgClass="bg-slate-50"
          autoScrollInterval={3000}
          bannerType="best_sellers"
        />

        {/* Featured Products */}
        <ProductCarousel
          products={featuredProducts}
          title='Featured <span class="text-emerald-600 italic lowercase font-serif font-normal">Products</span>'
          subtitle="Handpicked Premium Choices"
          viewAllHref="/products?featured=true"
          bgClass="bg-white"
          autoScrollInterval={3300}
          bannerType="featured_products"
        />

        {/* 6. Farmers' Collections — Interactive Products Section */}
        <FarmersCollection products={farmerProducts} />

        {/* 7. Organic Collections — Pure & Authentic */}
        <ProductCarousel
          products={organicDisplay}
          title='Herbal Cosmetics <span class="text-primary italic lowercase font-serif font-normal">Collections</span>'
          subtitle="Pure. Authentic. Heritage."
          viewAllHref="/products"
          bgClass="bg-white"
          autoScrollInterval={3500}
          bannerType="organic_collection"
        />

        {/* 7.5 New Arrivals */}
        {newArrivals.length > 0 && (
          <ProductCarousel
            products={newArrivals}
            title='New <span class="text-primary italic lowercase font-serif font-normal">Arrivals</span>'
            subtitle="Explore our Freshly Stocked Arrivals"
            viewAllHref="/products"
            bgClass="bg-white"
            autoScrollInterval={3800}
          />
        )}

        {/* 8. Recently Added Products */}
        <ProductCarousel
          products={recentProducts}
          title='Recently <span class="text-accent italic lowercase font-serif font-normal">Added</span>'
          subtitle="Newest Additions to our Marketplace"
          viewAllHref="/products"
          bgClass="bg-slate-50"
          autoScrollInterval={4000}
        />

        <VendorPromotion />

        <LazyHomeSections />
      </main>
    </div>
  );
}
