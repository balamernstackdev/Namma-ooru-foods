'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import SearchDropdown from './SearchDropdown';
import { AnimatePresence } from 'framer-motion';

const PLACEHOLDERS = [
  "Search organic cold pressed oils...",
  "Search authentic heritage spices...",
  "Search traditional ghee & milk...",
  "Search pure forest honey...",
  "Search premium hand-pounded rice...",
  "Search traditional homemade pickles...",
  "Search by Product, Brand, or Category..."
];

export default function SearchBar({ isMobile = false }: { isMobile?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ products: any[]; categories: any[]; brands?: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Rotating Placeholder State
  const [placeholder, setPlaceholder] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trendingSearches = [
    'Cold Pressed Coconut Oil',
    'Organic Turmeric Powder',
    'Traditional Cow Ghee',
    'Himalayan Pink Salt'
  ];

  // Typing Effect for Placeholder
  useEffect(() => {
    const currentPhrase = PLACEHOLDERS[placeholderIndex];
    let timer: NodeJS.Timeout;

    if (isDeleting) {
      timer = setTimeout(() => {
        setPlaceholder(currentPhrase.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);
      }, 35);
    } else {
      timer = setTimeout(() => {
        setPlaceholder(currentPhrase.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }, 75);
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
      timer = setTimeout(() => setIsDeleting(true), 2500);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPlaceholderIndex(prev => (prev + 1) % PLACEHOLDERS.length);
    }

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, placeholderIndex]);

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

  // Click outside listener for container
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
      
      const searchUrl = `/search?q=${encodeURIComponent(query.trim())}`;
      router.push(searchUrl);
    }
  };

  const onItemClick = (label: string, type: 'product' | 'query' | 'brand' | 'category' | 'vendor') => {
    setOpen(false);
    if (type === 'query') {
      setQuery(label);
      addToRecent(label);
      router.push(`/search?q=${encodeURIComponent(label)}`);
    } else {
      setQuery('');
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const products = suggestions?.products || [];
    const categories = suggestions?.categories || [];
    const brands = suggestions?.brands || [];
    const brandCount = Math.min(brands.length, 2);
    const vendorItems = brands.slice(1, 3);
    const vendorCount = vendorItems.length;

    const totalItems = products.length + brandCount + categories.length + vendorCount;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions) {
        e.preventDefault();

        if (selectedIndex < products.length) {
          const product = products[selectedIndex];
          router.push(`/products/detail?id=${product.id}`);
          onItemClick(product.name, 'product');
        } else if (selectedIndex < products.length + brandCount) {
          const brandIdx = selectedIndex - products.length;
          const brand = brands[brandIdx];
          router.push(`/brands/${brand.id}`);
          onItemClick(brand.name, 'brand');
        } else if (selectedIndex < products.length + brandCount + categories.length) {
          const catIdx = selectedIndex - products.length - brandCount;
          const cat = categories[catIdx];
          router.push(`/products?category=${cat.slug || cat.id}`);
          onItemClick(cat.name, 'category');
        } else {
          const vendorIdx = selectedIndex - products.length - brandCount - categories.length;
          const vendor = vendorItems[vendorIdx];
          router.push(`/brands/${vendor.id}`);
          onItemClick(vendor.name, 'vendor');
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
      <div className={`relative flex items-center bg-slate-50 border-2 border-slate-100 rounded-2xl transition-all duration-300 focus-within:bg-white focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-50/70 shadow-sm overflow-hidden h-12`}>
        
        {/* Search Icon */}
        <div className={`pl-4 shrink-0 transition-colors duration-300 ${open ? 'text-emerald-600' : 'text-slate-400'}`}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 stroke-[2.5]" />}
        </div>
        
        {/* Dynamic Form with Scrolling/Typing Placeholder */}
        <form onSubmit={handleSearch} className="flex-1 h-full">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="w-full h-full pl-3 pr-20 bg-transparent text-[14px] font-bold text-[#022c22] placeholder:text-slate-400 placeholder:font-bold outline-none"
          />
        </form>

        {/* Right utility buttons (Clear query, Global command badge) */}
        <div className="absolute right-3 flex items-center gap-2">
          {query && (
            <button 
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
          {!isMobile && !query && (
            <div className="hidden xl:flex items-center gap-1 px-2 py-0.5 bg-white rounded-lg border border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-tighter shadow-sm select-none">
              <Command size={9} /> K
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
