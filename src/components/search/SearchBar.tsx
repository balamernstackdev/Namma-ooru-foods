'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import SearchDropdown from './SearchDropdown';
import { AnimatePresence } from 'framer-motion';

export default function SearchBar({ isMobile = false }: { isMobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ products: any[]; categories: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mock trending searches for grocery app feel
  const trendingSearches = ['Cold Pressed Coconut Oil', 'Organic Turmeric', 'Traditional Ghee', 'Himalayan Pink Salt'];

  useEffect(() => {
    // Load recent searches from local storage
    const saved = localStorage.getItem('recent_searches');
    if (saved) setRecentSearches(JSON.parse(saved));

    // Global keyboard shortcut (Cmd/Ctrl + K)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addToRecent = (term: string) => {
    const updated = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setSuggestions(null); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/search/suggestions?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Search error:', err);
      setSuggestions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length >= 2) {
      debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    } else {
      setSuggestions(null);
    }
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim().length >= 2) {
      addToRecent(query.trim());
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const onItemClick = (label: string, type: 'product' | 'query') => {
    if (type === 'query') {
      setQuery(label);
      addToRecent(label);
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(label)}`);
    } else {
      setOpen(false);
      setQuery('');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = (suggestions?.categories?.length || 0) + (suggestions?.products?.length || 0);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions) {
        e.preventDefault();
        const cats = suggestions.categories || [];
        const prods = suggestions.products || [];
        if (selectedIndex < cats.length) {
          onItemClick(cats[selectedIndex].name, 'query');
        } else {
          const product = prods[selectedIndex - cats.length];
          router.push(`/products/${product.id}`);
          setOpen(false);
        }
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative group ${isMobile ? 'w-full' : 'flex-1 max-w-2xl'}`}>
      <div className="relative">
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${open ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-500'}`}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" strokeWidth={2.5} />}
        </div>
        
        <form onSubmit={handleSearch}>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={isMobile ? "Search for authentic heritage foods..." : "Search for organic oils, spices, rice..."}
            className={`w-full ${isMobile ? 'h-11 pl-12 pr-10' : 'h-12 pl-12 pr-32'} bg-slate-50 border-2 border-slate-100 rounded-2xl text-[14px] font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-50 outline-none transition-all duration-300 shadow-sm`}
          />
        </form>

        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
          {!isMobile && !query && (
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-1 bg-white rounded-lg border border-slate-100 text-[10px] font-black text-slate-300 uppercase tracking-tighter">
              <Command size={10} /> K
            </div>
          )}
        </div>
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {open && (
          <SearchDropdown
            isVisible={open}
            loading={loading}
            query={query}
            suggestions={suggestions}
            recentSearches={recentSearches}
            trendingSearches={trendingSearches}
            selectedIndex={selectedIndex}
            onItemClick={onItemClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
