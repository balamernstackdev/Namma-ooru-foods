/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React from 'react';
import ProductCarousel from '@/components/ProductCarousel';

interface Product {
   id: number;
   name: string;
   price: number | string;
   originalPrice?: number | string | null;
   image?: string;
   images?: { url: string }[];
   avgRating?: number | null;
   averageRating?: number | null;
   reviewCount?: number;
   subVendor?: { name: string; id: number; slug?: string };
   category?: { name: string };
   slug?: string;
   status?: string;
   subVendorId?: number;
   categoryId?: number;
   gstRate?: number | null;
   [key: string]: any;
}

interface RecommendedProductsSectionProps {
   product: any;
   relatedProducts: Product[] | undefined | null;
   isLoading: boolean;
   sectionTitle: string;
   sectionSubtitle: string;
   fallbackImage: string;
}

function SkeletonCard() {
   return (
      <div className="shrink-0 w-[200px] md:w-[220px] rounded-2xl bg-white border border-slate-100 overflow-hidden animate-pulse">
         <div className="aspect-square bg-slate-100" />
         <div className="p-4 space-y-2.5">
            <div className="h-2 bg-slate-100 rounded-full w-2/3" />
            <div className="h-3 bg-slate-100 rounded-full" />
            <div className="h-3 bg-slate-100 rounded-full w-3/4" />
            <div className="flex items-center justify-between pt-1">
               <div className="h-5 bg-slate-100 rounded-full w-16" />
               <div className="h-8 w-8 rounded-full bg-slate-100" />
            </div>
         </div>
      </div>
   );
}

export default function RecommendedProductsSection({
   product: _product,
   relatedProducts,
   isLoading,
   sectionTitle,
   sectionSubtitle,
   fallbackImage: _fallbackImage,
}: RecommendedProductsSectionProps) {

   const products = Array.isArray(relatedProducts) ? relatedProducts : [];

   if (isLoading) {
      return (
         <section className="py-16 bg-gradient-to-b from-white to-slate-50 border-t border-slate-100 overflow-hidden flex justify-center">
            <div className="standard-container w-full px-4 md:px-6">
               <div className="mb-8 space-y-2">
                  <div className="h-4 bg-slate-100 rounded-full w-24 animate-pulse" />
                  <div className="h-8 bg-slate-100 rounded-full w-64 animate-pulse" />
               </div>
               <div className="flex gap-4 overflow-hidden">
                  {Array.from({ length: 5 }).map((_, i) => (
                     <SkeletonCard key={i} />
                  ))}
               </div>
            </div>
         </section>
      );
   }

   if (products.length === 0) return null;

   // Normalize rating properties so ProductCard can display them correctly
   const normalizedProducts = products.map((p) => ({
      ...p,
      rating: p.rating ?? p.avgRating ?? p.averageRating ?? 0,
   }));

   return (
      <ProductCarousel
         products={normalizedProducts}
         title={sectionTitle}
         subtitle={sectionSubtitle}
         viewAllHref="/products"
         bgClass="bg-gradient-to-b from-white to-slate-50 border-t border-slate-100"
      />
   );
}
