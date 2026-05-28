'use client';

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Tag, Landmark, ChevronRight, CheckCircle2, Search, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface SearchDropdownProps {
  isVisible: boolean;
  loading: boolean;
  query: string;
  suggestions: {
    products: any[];
    categories: any[];
    brands?: any[];
  } | null;
  recentSearches?: string[];
  trendingSearches?: string[];
  selectedIndex: number;
  onItemClick: (label: string, type: 'product' | 'query' | 'brand' | 'category' | 'vendor') => void;
}

// Highlight matching query keywords in a title
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <span key={i} className="text-emerald-700 font-extrabold bg-emerald-50 px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

// 1. PRODUCT SEARCH ITEM CARD
const SearchProductCard = ({
  product,
  isHighlighted,
  query,
  onClick,
}: {
  product: any;
  isHighlighted: boolean;
  query: string;
  onClick: () => void;
}) => {
  return (
    <Link
      href={`/products/detail?id=${product.id}`}
      onClick={onClick}
      data-highlighted={isHighlighted}
      className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-200 rounded-xl ${
        isHighlighted ? 'bg-emerald-50/70 translate-x-1' : 'hover:bg-slate-50/50'
      }`}
    >
      <div className="h-10 w-10 rounded-lg bg-white border border-slate-100 overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
        <img
          src={product.image || '/logo.webp'}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs leading-tight truncate ${isHighlighted ? 'font-extrabold text-emerald-950' : 'text-slate-800 font-semibold'}`}>
          <HighlightMatch text={product.name} query={query} />
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] text-slate-400 font-medium leading-none">by</span>
          <span className="text-[10px] text-slate-500 font-bold truncate max-w-[120px] leading-none">
            {product.subVendor?.name || 'Namma Ooru Foods'}
          </span>
          <span className="h-1 w-1 rounded-full bg-slate-200" />
          <span className="text-xs font-black text-emerald-600 leading-none">₹{product.price}</span>
        </div>
      </div>
      <div className="flex items-center text-[10px] font-black uppercase text-slate-300 tracking-wider shrink-0 transition-colors">
        View <ChevronRight size={10} className="ml-0.5" />
      </div>
    </Link>
  );
};

// 2. BRAND SEARCH ITEM CARD
const SearchBrandCard = ({
  brand,
  isHighlighted,
  query,
  onClick,
}: {
  brand: any;
  isHighlighted: boolean;
  query: string;
  onClick: () => void;
}) => {
  return (
    <Link
      href={`/brands/${brand.id}`}
      onClick={onClick}
      data-highlighted={isHighlighted}
      className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 rounded-xl ${
        isHighlighted ? 'bg-emerald-50/70 translate-x-1' : 'hover:bg-slate-50/50'
      }`}
    >
      <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
        {brand.logo ? (
          <img src={brand.logo} alt={brand.name} className="h-full w-full object-cover" />
        ) : (
          <Landmark className="h-4 w-4 text-emerald-800" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs truncate ${isHighlighted ? 'font-extrabold text-emerald-950' : 'text-slate-800 font-semibold'}`}>
          <HighlightMatch text={brand.name} query={query} />
        </p>
        <span className="text-[8px] text-amber-600 uppercase font-black tracking-wider block">
          Heritage Brand
        </span>
      </div>
      <ChevronRight size={10} className="text-slate-300" />
    </Link>
  );
};

// 3. CATEGORY SEARCH ITEM CARD
const SearchCategoryCard = ({
  category,
  isHighlighted,
  query,
  onClick,
}: {
  category: any;
  isHighlighted: boolean;
  query: string;
  onClick: () => void;
}) => {
  return (
    <Link
      href={`/products?category=${category.slug || category.id}`}
      onClick={onClick}
      data-highlighted={isHighlighted}
      className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 rounded-xl ${
        isHighlighted ? 'bg-emerald-50/70 translate-x-1' : 'hover:bg-slate-50/50'
      }`}
    >
      <div className="h-7 w-7 rounded-lg bg-emerald-50/60 flex items-center justify-center text-emerald-800 shrink-0 shadow-sm">
        <Tag size={12} className="stroke-[2.5]" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs truncate ${isHighlighted ? 'font-extrabold text-emerald-950' : 'text-slate-800 font-semibold'}`}>
          <HighlightMatch text={category.name} query={query} />
        </p>
        <span className="text-[8px] text-slate-400 uppercase font-black tracking-wider block">
          Market Category
        </span>
      </div>
      <ChevronRight size={10} className="text-slate-300" />
    </Link>
  );
};

// 4. VENDOR SEARCH ITEM CARD
const SearchVendorCard = ({
  vendor,
  isHighlighted,
  query,
  onClick,
}: {
  vendor: any;
  isHighlighted: boolean;
  query: string;
  onClick: () => void;
}) => {
  return (
    <Link
      href={`/brands/${vendor.id}`}
      onClick={onClick}
      data-highlighted={isHighlighted}
      className={`flex items-center gap-3 px-3 py-2 transition-all duration-200 rounded-xl ${
        isHighlighted ? 'bg-emerald-50/70 translate-x-1' : 'hover:bg-slate-50/50'
      }`}
    >
      <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 overflow-hidden shrink-0 flex items-center justify-center">
        {vendor.logo ? (
          <img src={vendor.logo} alt={vendor.name} className="h-full w-full object-cover" />
        ) : (
          <Landmark className="h-4 w-4 text-emerald-700" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className={`text-xs truncate ${isHighlighted ? 'font-extrabold text-emerald-950' : 'text-slate-800 font-semibold'}`}>
            <HighlightMatch text={vendor.name} query={query} />
          </p>
          <CheckCircle2 size={10} className="text-emerald-600 fill-emerald-50 shrink-0" />
        </div>
        <span className="text-[8px] text-emerald-600 uppercase font-black tracking-wider block">
          Verified Farmer / Store
        </span>
      </div>
      <ChevronRight size={10} className="text-slate-300" />
    </Link>
  );
};

export default function SearchDropdown({
  isVisible,
  loading,
  query,
  suggestions,
  selectedIndex,
  onItemClick,
}: SearchDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll highlighted item into view
  useEffect(() => {
    if (selectedIndex !== -1 && containerRef.current) {
      const active = containerRef.current.querySelector('[data-highlighted="true"]');
      if (active) {
        (active as HTMLElement).scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  const showPlaceholder = !query || query.trim().length < 2;

  if (!isVisible || showPlaceholder) return null;

  // Autocomplete Suggestions - define exact slice bounds to avoid empty sections
  const products = suggestions?.products || [];
  const categories = suggestions?.categories || [];
  const brands = (suggestions?.brands || []).slice(0, 2);
  const vendors = (suggestions?.brands || []).slice(1, 3);

  const hasResults = products.length > 0 || brands.length > 0 || categories.length > 0 || vendors.length > 0;

  // Suggested popular entities for empty state
  const popularSearches = [
    'Moringa Idly Rice Powder',
    'Cold Pressed Coconut Oil',
    'Heritage Cow Ghee',
    'Wild Forest Honey',
    'Organic Turmeric Powder',
  ];

  const suggestedCategories = [
    { name: 'Cold Pressed Oils', slug: 'cold-pressed-oils' },
    { name: 'Heritage Ghee', slug: 'ghee-butter' },
    { name: 'Wild Honey & Sweeteners', slug: 'honey-sweeteners' },
    { name: 'Homemade Pickles', slug: 'pickles-mixes' },
  ];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(2,44,34,0.15)] border border-slate-100 z-[1000] max-h-[380px] overflow-y-auto custom-scrollbar flex flex-col"
    >
      {showPlaceholder ? (
        <div className="p-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Start typing to discover heritage foods...
          </p>
          <div className="flex flex-wrap gap-1.5 justify-center mt-3">
            {popularSearches.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                onClick={() => onItemClick(item, 'query')}
                className="text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors px-2.5 py-1 rounded-full border border-emerald-100/50"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="p-6 flex items-center justify-center gap-2.5 text-xs font-bold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          <span>Searching organic indexes...</span>
        </div>
      ) : hasResults ? (
        <div className="p-2 space-y-3">
          {/* PRODUCTS SECTION */}
          {products.length > 0 && (
            <div>
              <h3 className="px-2.5 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                Products
              </h3>
              <div className="space-y-0.5">
                {products.map((item, idx) => (
                  <SearchProductCard
                    key={item.id}
                    product={item}
                    isHighlighted={selectedIndex === idx}
                    query={query}
                    onClick={() => onItemClick(item.name, 'product')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* BRANDS SECTION */}
          {brands.length > 0 && (
            <div>
              <h3 className="px-2.5 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                Brands
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                {brands.map((item, idx) => (
                  <SearchBrandCard
                    key={item.id}
                    brand={item}
                    isHighlighted={selectedIndex === products.length + idx}
                    query={query}
                    onClick={() => onItemClick(item.name, 'brand')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* CATEGORIES SECTION */}
          {categories.length > 0 && (
            <div>
              <h3 className="px-2.5 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                Categories
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                {categories.map((item, idx) => (
                  <SearchCategoryCard
                    key={item.id}
                    category={item}
                    isHighlighted={selectedIndex === products.length + brands.length + idx}
                    query={query}
                    onClick={() => onItemClick(item.name, 'category')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* VENDORS SECTION */}
          {vendors.length > 0 && (
            <div>
              <h3 className="px-2.5 py-1 text-[9px] font-black uppercase text-slate-400 tracking-wider">
                Vendors / Farmers
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0.5">
                {vendors.map((item, idx) => (
                  <SearchVendorCard
                    key={item.id}
                    vendor={item}
                    isHighlighted={
                      selectedIndex ===
                      products.length +
                        brands.length +
                        categories.length +
                        idx
                    }
                    query={query}
                    onClick={() => onItemClick(item.name, 'vendor')}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PREMIUM EMPTY STATE */
        <div className="p-5 text-center">
          <div className="h-10 w-10 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center mx-auto text-rose-500 mb-2.5">
            <Search size={18} />
          </div>
          <h4 className="text-xs font-black text-slate-800">No matching products found</h4>
          <p className="text-[10px] text-slate-400 font-bold mt-1">
            We couldn't find matches for "{query}". Explore these instead:
          </p>

          <div className="mt-3.5 pt-3 border-t border-slate-100/60">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2">
              Suggested Categories
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {suggestedCategories.map((cat, idx) => (
                <Link
                  key={idx}
                  href={`/products?category=${cat.slug}`}
                  className="text-[9px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 hover:border-slate-300 transition-colors px-2.5 py-1 rounded-full"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-3.5">
            <p className="text-[9px] font-black uppercase text-slate-400 tracking-wider mb-2">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {popularSearches.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onItemClick(item, 'query')}
                  className="text-[9px] font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/50 transition-colors px-2.5 py-1 rounded-full"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100/60">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-[#022c22] hover:bg-[#033a2d] transition-colors py-2 px-4 rounded-xl shadow-md shadow-emerald-950/10"
            >
              Continue Shopping <ArrowRight size={10} />
            </Link>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 99px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.15);
        }
      `}</style>
    </motion.div>
  );
}
