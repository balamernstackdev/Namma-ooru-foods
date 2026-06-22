'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Loader2, ImageIcon } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface SearchableSelectProps {
  type: 'product' | 'category' | 'brand' | 'vendor' | 'collection';
  value: string;
  onChange: (value: string, name: string) => void;
  placeholder?: string;
}

export default function SearchableSelect({ type, value, onChange, placeholder }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedName, setSelectedName] = useState<string>('');
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch initial selected name if value exists but we don't have the name
  useEffect(() => {
    if (value && !selectedName) {
      // Small delay to let initial hydration settle
      setTimeout(() => fetchData(value, true), 100);
    }
  }, [value, type]);

  // Fetch results based on debounced search
  useEffect(() => {
    if (isOpen) {
      fetchData(debouncedSearch);
    }
  }, [debouncedSearch, isOpen, type]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async (query: string, isInitialFetch = false) => {
    if (!isInitialFetch) setLoading(true);
    try {
      let endpoint = '';
      if (isInitialFetch) {
         if (type === 'product') endpoint = `/api/products/${encodeURIComponent(query)}`;
         if (type === 'category') endpoint = `/api/categories/${encodeURIComponent(query)}`;
         if (type === 'brand') endpoint = `/api/brands/${encodeURIComponent(query)}`;
         if (type === 'vendor') endpoint = `/api/head-vendors/${encodeURIComponent(query)}`;
         if (type === 'collection') endpoint = `/api/collections?search=${encodeURIComponent(query)}`;
      } else {
         if (type === 'product') endpoint = `/api/products?search=${encodeURIComponent(query)}&limit=20`;
         if (type === 'category') endpoint = `/api/categories?search=${encodeURIComponent(query)}&limit=20`;
         if (type === 'brand') endpoint = `/api/brands?search=${encodeURIComponent(query)}&limit=20&activeOnly=true&includeEmpty=false`;
         if (type === 'vendor') endpoint = `/api/head-vendors?search=${encodeURIComponent(query)}&limit=20`;
         if (type === 'collection') endpoint = `/api/collections?search=${encodeURIComponent(query)}&limit=20`;
      }

      const res = await fetch(`${API_URL}${endpoint}`);
      if (!res.ok) {
         console.error(`[SearchableSelect] Fetch failed for ${endpoint} with status ${res.status}`);
         throw new Error(`Fetch failed with status ${res.status}`);
      }
      
      const data = await res.json();
      
      if (isInitialFetch) {
         if (type === 'collection' && data && Array.isArray(data.collections)) {
            const found = data.collections.find((c: any) => c.slug === query || String(c.id) === query);
            setSelectedName(found ? found.name : query);
         } else if (data && data.name) {
            setSelectedName(data.name);
         } else {
            setSelectedName(query); // Fallback
         }
      } else {
         let items = [];
         if (type === 'product') items = Array.isArray(data.products) ? data.products : [];
         if (type === 'category') items = Array.isArray(data.categories) ? data.categories : [];
         if (type === 'brand') items = Array.isArray(data.subVendors) ? data.subVendors : [];
         if (type === 'vendor') items = Array.isArray(data.headVendors) ? data.headVendors : [];
         if (type === 'collection') items = Array.isArray(data.collections) ? data.collections : [];
         
         setResults(items);
      }
    } catch (err) {
      console.error('[SearchableSelect] Error fetching data:', err);
      if (isInitialFetch && !selectedName) {
         setSelectedName(query);
      }
      if (!isInitialFetch) {
         setResults([]);
      }
    } finally {
      if (!isInitialFetch) setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    const val = (item.slug || item.id).toString();
    onChange(val, item.name);
    setSelectedName(item.name);
    setSearch('');
    setIsOpen(false);
  };

  const renderItemContent = (item: any) => {
    if (type === 'product') {
      return (
        <div className="flex items-center gap-3 w-full">
          <div className="h-10 w-10 shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
            {item.image || item.images?.[0]?.url ? (
               <img src={item.image || item.images?.[0]?.url} alt="" className="h-full w-full object-cover" />
            ) : (
               <ImageIcon size={16} className="text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
               {item.subVendor?.name && <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 truncate">{item.subVendor.name}</span>}
               {item.subVendor?.name && item.category?.name && <span className="text-[9px] text-slate-300">•</span>}
               {item.category?.name && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{item.category.name}</span>}
            </div>
          </div>
        </div>
      );
    }

    if (type === 'brand' || type === 'vendor') {
      return (
        <div className="flex items-center gap-3 w-full">
          <div className="h-10 w-10 shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center border border-slate-200">
            {item.logo ? (
               <img src={item.logo} alt="" className="h-full w-full object-cover" />
            ) : (
               <ImageIcon size={16} className="text-slate-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
          </div>
        </div>
      );
    }

    // Category or fallback
    return (
      <div className="flex items-center gap-3 w-full">
         <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
         </div>
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Selected Value Display / Trigger */}
      <div 
         onClick={() => setIsOpen(!isOpen)}
         className={`w-full h-14 bg-slate-50 border-2 ${isOpen ? 'border-amber-400' : 'border-slate-100'} rounded-2xl px-5 flex items-center justify-between cursor-pointer transition-colors`}
      >
         <span className={`text-sm font-bold truncate pr-4 ${selectedName ? 'text-slate-900' : 'text-slate-400'}`}>
            {selectedName || placeholder || `Select ${type}`}
         </span>
         <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
         <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-xl rounded-2xl z-50 overflow-hidden flex flex-col max-h-[360px] animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Search Input */}
            <div className="p-3 border-b border-slate-50 relative shrink-0">
               <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
               <input
                  type="text"
                  autoFocus
                  placeholder={`Search ${type}...`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-10 bg-slate-50 rounded-xl pl-10 pr-4 text-sm font-bold outline-none focus:bg-slate-100 transition-colors placeholder:text-slate-400"
               />
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
               {loading && results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                     <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Searching...</span>
                  </div>
               ) : results.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                     <Search className="h-8 w-8 text-slate-200" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">No results found</span>
                  </div>
               ) : (
                  <div className="space-y-1">
                     {results.map((item) => {
                        const val = (item.slug || item.id).toString();
                        const isSelected = value === val;
                        return (
                           <button
                              key={val}
                              type="button"
                              onClick={(e) => {
                                 e.preventDefault();
                                 handleSelect(item);
                              }}
                              className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors group ${isSelected ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                           >
                              {renderItemContent(item)}
                              
                              {isSelected && (
                                 <Check size={16} className="text-amber-500 shrink-0 ml-3" />
                              )}
                           </button>
                        );
                     })}
                  </div>
               )}
            </div>
         </div>
      )}
    </div>
  );
}
