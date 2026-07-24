'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
//dd
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    if (!q || q.length < 2) return;
    setLoading(true);
    const params = new URLSearchParams({ q, sortBy });
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);

    fetch(`${API_URL}/api/search?${params.toString()}`)
      .then(r => r.json())
      .then(data => {
        setResults(data.products || []);
        setCategories(data.categories || []);
        setTotal(data.total || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [q, sortBy, minPrice, maxPrice]);

  return (
    <div className="standard-container py-12 pb-24 lg:pb-12 min-h-screen">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400">Discovery Engine</p>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-[#022c22] tracking-tighter uppercase">
            {q ? q : 'All Products'}
          </h1>
          {!loading && <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest mt-3">{total} artifacts found in network</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-slate-100 hidden md:block" />
          <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">Filtered Search Results</p>
        </div>
      </div>

      <div className="w-full">
        {/* Results Stream */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
              <div className="h-12 w-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing catalog data...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-[#f8fafc] rounded-[2.5rem] border border-slate-200/80 p-16 text-center flex flex-col items-center justify-center my-4">
              <span className="text-4xl mb-4 select-none">🔍</span>
              <h3 className="text-base font-black text-emerald-950 uppercase tracking-tight mb-2">No matching products found</h3>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">We couldn't find any products matching your search query. Try checking your spelling or use different keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 sm:gap-4 lg:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {results.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[50vh]"><div className="h-12 w-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" /></div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
