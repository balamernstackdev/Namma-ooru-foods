'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';
import { API_URL } from '@/lib/api';

function SearchResults() {
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
    <div className="standard-container py-12">
      <div className="mb-10">
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Search Results</p>
        <h1 className="text-4xl font-black text-[#022c22] tracking-tighter">
          {q ? `"${q}"` : 'All Products'}
        </h1>
        {!loading && <p className="text-sm text-slate-400 font-medium mt-2">{total} products found</p>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 shrink-0">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm sticky top-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-[#022c22] mb-6 flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-amber-500" /> Filters
            </h2>

            <div className="mb-6">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Sort By</p>
              <select
                id="search-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 font-bold text-xs text-[#022c22] outline-none focus:border-amber-400"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            <div className="mb-6">
              <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Price Range</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={e => setMinPrice(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 font-bold text-xs text-[#022c22] outline-none focus:border-amber-400"
                />
                <span className="text-slate-300 font-bold">–</span>
                <input
                  type="number"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={e => setMaxPrice(e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-3 py-2 font-bold text-xs text-[#022c22] outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {categories.length > 0 && (
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Categories</p>
                <div className="flex flex-col gap-2">
                  {categories.map(cat => (
                    <Link
                      key={cat.id}
                      href={`/categories/${cat.slug || cat.id}`}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 transition-colors"
                    >
                      → {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Results Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="h-12 w-12 border-4 border-slate-100 border-t-amber-400 rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center shadow-sm">
              <Search className="h-12 w-12 text-slate-200 mx-auto mb-4" />
              <h2 className="text-xl font-black text-slate-300 mb-2">No products found</h2>
              <p className="text-slate-300 text-sm">Try different keywords or browse our categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
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
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="h-12 w-12 border-4 border-slate-100 border-t-amber-400 rounded-full animate-spin" /></div>}>
      <SearchResults />
    </Suspense>
  );
}
