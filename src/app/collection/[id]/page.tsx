'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import ProductCard from '@/components/ProductCard';

export default function CollectionPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [collection, setCollection] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    // 1. Fetch collection details
    fetch(`${API_URL}/api/quick-picks/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Collection not found');
        return res.json();
      })
      .then(data => {
        setCollection(data);
        const productIds = data.collectionProductIds;
        
        if (!productIds) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // 2. Fetch all products and filter locally (simplest given existing backend)
        // Ideally we would query by IDs: /api/products?ids=...
        // But since we can't be sure the backend supports ?ids= without further modifying productController,
        // we'll fetch them using a workaround. If we don't have an endpoint for multiple IDs, 
        // we can fetch the products one by one, or fetch all products.
        // Actually, we can just use the search endpoint for each product ID, or simply modify productController to support it.
        // Let's modify productController shortly to accept `ids=1,2,3` via query param!
        return fetch(`${API_URL}/api/products?ids=${productIds}&limit=50`)
          .then(res => res.json())
          .then(data => {
            setProducts(data.products || data || []);
          });
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-12 w-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <h1 className="text-2xl font-bold">Collection Not Found</h1>
        <button onClick={() => router.push('/')} className="text-emerald-600 font-semibold hover:underline">
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="standard-container py-12 pb-24 lg:pb-12 min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">Curated Collection</p>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#022c22] tracking-tighter uppercase">
            {collection.title || 'Special Collection'}
          </h1>
          <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest mt-3">
            {products.length} Items
          </p>
        </div>
      </div>

      <div className="w-full">
        {products.length === 0 ? (
          <div className="bg-[#f8fafc] rounded-[2.5rem] border border-slate-200/80 p-16 text-center flex flex-col items-center justify-center my-4">
            <span className="text-4xl mb-4 select-none">📦</span>
            <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight mb-2">Empty Collection</h3>
            <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">There are no products in this collection yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
