'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, ArrowRight, Tag, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface Product { id: number; name: string; slug?: string; image?: string; price: number; }
interface Category { id: number; name: string; slug?: string; }
interface Suggestions { products: Product[]; categories: Category[]; }

export default function SearchBar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
    } catch { setSuggestions(null); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setOpen(false);
      setQuery('');
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <>
      {/* Search Trigger Button */}
      <button
        id="search-trigger-btn"
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-400 hover:text-slate-600 transition-all text-sm font-bold"
      >
        <Search className="h-4 w-4" />
        <span className="hidden md:inline text-xs">Search products...</span>
      </button>

      {/* Fullscreen Overlay */}
      {open && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col items-center pt-16 px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex items-center gap-4 px-6 py-5 border-b border-slate-100">
              <Search className="h-5 w-5 text-slate-400 shrink-0" />
              <input
                ref={inputRef}
                id="global-search-input"
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search organic products, oils, spices..."
                className="flex-1 text-base font-bold text-[#022c22] placeholder:text-slate-300 outline-none bg-transparent"
              />
              {loading && <Loader2 className="h-4 w-4 text-slate-300 animate-spin" />}
              <button type="button" onClick={() => { setOpen(false); setQuery(''); }} className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-all">
                <X className="h-4 w-4" />
              </button>
            </form>

            {/* Suggestions Dropdown */}
            <div className="max-h-[60vh] overflow-y-auto" data-lenis-prevent>
              {query.length >= 2 && suggestions && (
                <>
                  {suggestions.categories.length > 0 && (
                    <div className="px-6 pt-4 pb-2">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {suggestions.categories.map(cat => (
                          <Link
                            key={cat.id}
                            href={`/categories/${cat.slug || cat.id}`}
                            onClick={() => { setOpen(false); setQuery(''); }}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black hover:bg-emerald-100 transition-all"
                          >
                            <Tag className="h-3 w-3" /> {cat.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.products.length > 0 && (
                    <div className="px-6 py-4">
                      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3">Products</p>
                      <div className="flex flex-col gap-1">
                        {suggestions.products.map(product => (
                          <Link
                            key={product.id}
                            href={`/products/${product.slug || product.id}`}
                            onClick={() => { setOpen(false); setQuery(''); }}
                            className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-slate-50 transition-all group"
                          >
                            <div className="h-12 w-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                              {product.image && <img src={product.image} alt={product.name} className="h-full w-full object-cover" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black text-[#022c22] truncate">{product.name}</p>
                              <p className="text-xs text-emerald-600 font-bold">₹{Number(product.price).toLocaleString()}</p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-600 transition-colors shrink-0" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {suggestions.products.length === 0 && suggestions.categories.length === 0 && (
                    <div className="px-6 py-12 text-center text-slate-400">
                      <Search className="h-8 w-8 mx-auto mb-3 text-slate-200" />
                      <p className="font-bold text-sm">No results found for &ldquo;{query}&rdquo;</p>
                    </div>
                  )}
                  {/* See all results */}
                  {(suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                    <div className="px-6 pb-5">
                      <button
                        onClick={handleSearch}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#022c22] text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition-all"
                      >
                        See all results for &ldquo;{query}&rdquo; <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
              {query.length < 2 && (
                <div className="px-6 py-10 text-center text-slate-300">
                  <p className="text-sm font-bold">Type at least 2 characters to search</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
