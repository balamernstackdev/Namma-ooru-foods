'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

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
    <div className="standard-container py-12 min-h-screen">
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

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Advanced Filters Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm sticky top-28 space-y-8">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#022c22] mb-6 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-amber-500" /> Control Panel
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-3">Priority Order</label>
                  <select
                    id="search-sort-select"
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 font-bold text-[12px] text-[#022c22] outline-none focus:border-emerald-600 transition-all appearance-none cursor-pointer"
                  >
                    <option value="relevance">Relevance Index</option>
                    <option value="price_asc">Price: Ascending</option>
                    <option value="price_desc">Price: Descending</option>
                    <option value="newest">Recent Releases</option>
                    <option value="rating">Top Rated Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-[9px] uppercase font-black tracking-widest text-slate-400 block mb-3">Capital Range (₹)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 font-bold text-xs text-[#022c22] outline-none focus:border-emerald-600 transition-all"
                    />
                    <div className="h-0.5 w-4 bg-slate-100 shrink-0" />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 font-bold text-xs text-[#022c22] outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {categories.length > 0 && (
              <div className="pt-6 border-t border-slate-50">
                <p className="text-[9px] uppercase font-black tracking-widest text-slate-400 mb-4">Market Sectors</p>
                <div className="flex flex-col gap-2">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.slug || cat.id}`}
                      className="group flex items-center justify-between py-2 px-3 rounded-xl hover:bg-emerald-50 transition-all"
                    >
                      <span className="text-[12px] font-bold text-slate-600 group-hover:text-emerald-950">{cat.name}</span>
                      <ArrowRight className="h-3 w-3 text-slate-200 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Results Stream */}
        <div className="flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
              <div className="h-12 w-12 border-4 border-slate-100 border-t-emerald-600 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronizing catalog data...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center flex flex-col items-center justify-center">
              <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-slate-200" />
              </div>
              <h2 className="text-2xl font-black text-[#022c22] mb-3 tracking-tight">Zero Matches Found</h2>
              <p className="text-slate-400 text-sm font-medium max-w-sm mb-8">We couldn't find any artifacts matching your criteria. Try adjusting your filters or search keywords.</p>
              <Link href="/products" className="px-8 py-4 bg-[#022c22] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-950/10">
                Browse Entire Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
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
