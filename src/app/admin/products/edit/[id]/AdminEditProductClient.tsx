'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import ProductForm from '@/components/admin/ProductForm';
import { Loader2 } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminEditProductClient({ id }: { id?: string }) {
   const params = useParams();
   const productId = id || params.id;

   const { data: product, error, isLoading, mutate } = useSWR(
      productId ? `${API_URL}/api/products/${productId}` : null,
      fetcher
   );

   if (error) {
      return (
         <div className="flex flex-col h-[60vh] w-full items-center justify-center gap-4">
            <div className="bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 text-center">
               <p className="font-bold text-lg mb-1">Failed to Load Product</p>
               <p className="text-sm opacity-80">{error?.message || 'An unexpected error occurred.'}</p>
            </div>
            <button 
               onClick={() => mutate()} 
               className="px-6 py-2 bg-[var(--admin-sidebar)] text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors"
            >
               Retry
            </button>
         </div>
      );
   }

   if (isLoading || (!product && productId)) {
      return (
         <div className="flex flex-col h-[60vh] w-full items-center justify-center gap-4">
            <Loader2 className="animate-spin text-emerald-600 h-10 w-10" />
            <p className="text-slate-500 font-medium animate-pulse">Loading product details...</p>
         </div>
      );
   }

   if (!product) {
      return (
         <div className="flex h-[60vh] w-full items-center justify-center">
            <p className="text-slate-500 font-bold">Product not found.</p>
         </div>
      );
   }

   return <ProductForm mode="edit" initialData={product} />;
}
