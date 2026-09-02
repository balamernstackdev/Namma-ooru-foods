'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, Loader2, ImageIcon, X } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface SearchableMultiSelectProps {
  type: 'product';
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  initialNames?: Record<string, string>;
}

export default function SearchableMultiSelect({ type, value, onChange, placeholder, initialNames }: SearchableMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // We keep a local record of names for selected IDs to render tags
  const [namesCache, setNamesCache] = useState<Record<string, string>>(initialNames || {});
  
  const wrapperRef = useRef<HTMLDivElement>(null);

  // On mount: fetch names for any pre-selected values that are not in the cache
  useEffect(() => {
    const missingVals = value.filter(v => !namesCache[v]);
    if (missingVals.length === 0) return;

    missingVals.forEach(async (slug) => {
      try {
        const res = await fetch(`${API_URL}/api/products/${encodeURIComponent(slug)}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data?.name) {
          setNamesCache(prev => ({ ...prev, [slug]: data.name }));
        }
      } catch {
        // silently ignore — chip will fall back to slug
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount only
  
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  const fetchData = async (query: string) => {
    setLoading(true);
    try {
      let endpoint = '';
      if (type === 'product') endpoint = `/api/products?search=${encodeURIComponent(query)}&limit=20`;

      const res = await fetch(`${API_URL}${endpoint}`);
      if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
      
      const data = await res.json();
      let items = [];
      if (type === 'product') items = Array.isArray(data.products) ? data.products : [];
      
      setResults(items);
    } catch (err) {
      console.error('[SearchableMultiSelect] Error fetching data:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: any) => {
    const val = (item.slug || item.id).toString();
    const newValues = value.includes(val) 
      ? value.filter(v => v !== val)
      : [...value, val];
      
    setNamesCache(prev => ({ ...prev, [val]: item.name }));
    onChange(newValues);
  };

  const removeValue = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== val));
  };

  const renderItemContent = (item: any) => {
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
             {item.category?.name && <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 truncate">{item.category.name}</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      {/* Selected Value Display / Trigger */}
      <div 
         onClick={() => setIsOpen(!isOpen)}
         className={`w-full min-h-14 bg-slate-50 border-2 ${isOpen ? 'border-amber-400' : 'border-slate-100'} rounded-2xl p-2 flex flex-wrap gap-2 items-center cursor-pointer transition-colors relative pr-10`}
      >
         {value.length === 0 ? (
            <span className="text-sm font-bold text-slate-400 pl-3 py-2 block">
               {placeholder || `Select ${type}s`}
            </span>
         ) : (
            value.map(val => (
               <div key={val} className="flex items-center gap-1.5 bg-white border border-slate-200 shadow-sm rounded-lg px-2.5 py-1.5">
                  <span className="text-xs font-bold text-slate-700 truncate max-w-[120px]">
                     {namesCache[val] || val}
                  </span>
                  <button type="button" onClick={(e) => removeValue(e, val)} className="text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-50 p-0.5">
                     <X size={12} strokeWidth={3} />
                  </button>
               </div>
            ))
         )}
         <ChevronDown size={18} className={`text-slate-400 transition-transform absolute right-5 top-1/2 -translate-y-1/2 ${isOpen ? 'rotate-180' : ''}`} />
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
                  placeholder={`Search ${type}s...`}
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
                        const isSelected = value.includes(val);
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
