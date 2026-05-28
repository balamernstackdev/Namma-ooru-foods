'use client';

import React, { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { API_URL } from '@/lib/api';
import useSWR from 'swr';
import PremiumLoader from '@/components/ui/PremiumLoader';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProductDetailLoader() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();

  const { data: product, error: productError, isLoading } = useSWR(id ? `${API_URL}/api/products/${id}` : null, fetcher);
  const { data: allProducts } = useSWR(`${API_URL}/api/products`, fetcher);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!id) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-black">Invalid Product</h1>
      </div>
    );
  }

  if (isLoading || (!product && !productError)) {
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
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto tracking-tight">This flavor might have been sold out or the Product is currently being updated.</p>
        <button onClick={() => router.push('/')} className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest">Return Home</button>
      </div>
    );
  }

  const productsList = Array.isArray(allProducts) ? allProducts : (allProducts && Array.isArray(allProducts.products) ? allProducts.products : []);

  return (
    <>
      <ProductDetailClient product={finalProduct} allProducts={productsList} />
    </>
  );
}
