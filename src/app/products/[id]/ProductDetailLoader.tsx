'use client';

import React from 'react';
import ProductDetailClient from '@/components/ProductDetailClient';
import ProductReviews from '@/components/ProductReviews';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';

import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProductDetailLoader({ id }: { id: string }) {
  const { data: product, error: productError } = useSWR(`${API_URL}/api/products/${id}`, fetcher);
  const { data: allProducts } = useSWR(`${API_URL}/api/products`, fetcher);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!product && !productError) {
    return <PremiumLoader fullScreen={true} />;
  }

  const isValidProduct = product && !product.error && product.name;
  const finalProduct = isValidProduct ? product : null;
  
  if (!finalProduct || (finalProduct as any).error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
        <div className="h-24 w-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-10">
          <div className="h-8 w-8 text-slate-100" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-200 uppercase tracking-tighter">Product Not Found</h1>
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto tracking-tight">This flavor might have been sold out or the harvest is currently being updated.</p>
      </div>
    );
  }

  const productsList = Array.isArray(allProducts) ? allProducts : (allProducts && Array.isArray(allProducts.products) ? allProducts.products : []);
  
  return (
    <>
      {/* Product Detail (Now contains inside-tab reviews) */}
      <ProductDetailClient product={finalProduct} allProducts={productsList} />
    </>
  );
}
