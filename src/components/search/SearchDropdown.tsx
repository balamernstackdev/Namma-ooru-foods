'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, TrendingUp, Sparkles, ShoppingBag } from 'lucide-react';
import SearchSuggestionItem from './SearchSuggestionItem';
import SearchProductCard from './SearchProductCard';

interface SearchDropdownProps {
  isVisible: boolean;
  loading: boolean;
  query: string;
  suggestions: {
    products: any[];
    categories: any[];
  } | null;
  recentSearches: string[];
  trendingSearches: string[];
  selectedIndex: number;
  onItemClick: (label: string, type: 'product' | 'query') => void;
}

export default function SearchDropdown({
  isVisible,
  loading,
  query,
  suggestions,
  recentSearches,
  trendingSearches,
  selectedIndex,
  onItemClick
}: SearchDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedIndex !== -1 && containerRef.current) {
      const activeItem = containerRef.current.querySelector('[data-highlighted="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  if (!isVisible) return null;

  const showInitial = (query?.length || 0) < 2;
  const noResults = !loading && !showInitial && (suggestions?.products?.length || 0) === 0 && (suggestions?.categories?.length || 0) === 0;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      data-lenis-prevent
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 z-[1000] max-h-[480px] overflow-y-auto custom-scrollbar"
    >
      {showInitial ? (
        <div className="py-2">
          {(recentSearches?.length || 0) > 0 && (
            <div className="mb-2">
              <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <History size={12} /> Recent Discoveries
              </div>
              {recentSearches?.map((search, idx) => (
                <SearchSuggestionItem
                  key={`recent-${idx}`}
                  label={search}
                  type="history"
                  onClick={() => onItemClick(search, 'query')}
                />
              ))}
            </div>
          )}

          <div>
            <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <TrendingUp size={12} /> Trending Now
            </div>
            {trendingSearches?.map((search, idx) => (
              <SearchSuggestionItem
                key={`trending-${idx}`}
                label={search}
                type="trending"
                onClick={() => onItemClick(search, 'query')}
              />
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="p-4 space-y-4">
          <div className="h-4 bg-slate-50 rounded w-1/3 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 items-center">
                <div className="h-10 w-10 bg-slate-50 rounded-lg animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-50 rounded w-3/4 animate-pulse" />
                  <div className="h-2 bg-slate-50 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : noResults ? (
        <div className="p-10 text-center space-y-3">
          <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
            <Sparkles size={24} />
          </div>
          <p className="text-sm font-bold text-slate-700">No results for "{query}"</p>
          <p className="text-xs text-slate-400">Try different keywords or browse categories</p>
        </div>
      ) : (
        <div className="py-2">
          {(suggestions?.categories?.length || 0) > 0 ? (
            <div className="mb-2">
              <div className="px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                Quick search
              </div>
              {suggestions?.categories?.map((cat, idx) => (
                <SearchSuggestionItem
                  key={cat.id}
                  label={cat.name}
                  isHighlighted={selectedIndex === idx}
                  onClick={() => onItemClick(cat.name, 'query')}
                />
              ))}
            </div>
          ) : null}

          {(suggestions?.products?.length || 0) > 0 ? (
            <div>
              <div className="px-4 py-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">
                <ShoppingBag size={12} /> Product Artifacts
              </div>
              {suggestions?.products?.map((product, idx) => {
                const globalIdx = (suggestions?.categories?.length || 0) + idx;
                return (
                  <SearchProductCard
                    key={product.id}
                    product={product}
                    isHighlighted={selectedIndex === globalIdx}
                    onClick={() => onItemClick(product.name, 'product')}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}
