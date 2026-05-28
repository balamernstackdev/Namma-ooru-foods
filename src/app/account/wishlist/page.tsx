'use client';

import React, { useState, useEffect } from 'react';
import { Heart, ShoppingBag, Trash2, Star, ChevronLeft, Loader2, Plus, ArrowRight, Search, SlidersHorizontal, Sparkles, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/useCartStore';
import { API_URL } from '@/lib/api';

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCartStore();
  const router = useRouter();
  
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, price-low, price-high
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetch(`${API_URL}/api/wishlist/${user.id}`)
      .then(r => {
        if (!r.ok) throw new Error('Fetch failed');
        const contentType = r.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return r.json();
        }
        return [];
      })
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const remove = async (productId: number, productName: string) => {
    if (!user?.id) return;
    setItems(prev => prev.filter(i => i.productId !== productId));
    showToast(`Removed "${productName}" from wishlist`, 'info');
    await fetch(`${API_URL}/api/wishlist/${user.id}/${productId}`, { method: 'DELETE' });
  };

  const handleAddToCart = (item: any) => {
    setAddingId(item.product.id);
    addToCart({
      productId: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.image || '',
      variant: item.product.variants?.[0]?.name || 'Standard',
      quantity: 1
    });
    showToast(`Added "${item.product.name}" to cart successfully!`);
    setTimeout(() => setAddingId(null), 800);
  };

  const handleBuyNow = (item: any) => {
    addToCart({
      productId: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.image || '',
      variant: item.product.variants?.[0]?.name || 'Standard',
      quantity: 1
    });
    showToast(`Redirecting with "${item.product.name}"...`);
    router.push('/cart');
  };

  // Dynamic search and filter logic
  const filteredItems = items.filter(item => {
    const name = item.product?.name?.toLowerCase() || '';
    const brand = item.product?.brand?.name?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return name.includes(query) || brand.includes(query);
  });

  // Dynamic sorting logic
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === 'price-low') {
      return Number(a.product.price) - Number(b.product.price);
    }
    if (sortBy === 'price-high') {
      return Number(b.product.price) - Number(a.product.price);
    }
    return b.id - a.id; // Newest by default
  });

  // Compute live savings metrics
  const totalSavings = items.reduce((sum, item) => {
    const p = item.product;
    if (p.originalPrice && Number(p.originalPrice) > Number(p.price)) {
      return sum + (Number(p.originalPrice) - Number(p.price));
    }
    return sum;
  }, 0);

  const recentlySavedName = items.length > 0 ? items[items.length - 1].product.name : 'N/A';

  if (!user) {
    return (
      <div className="py-2 px-0 md:px-4">
        <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-slate-100 max-w-md mx-auto">
          <div className="h-16 w-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
          </div>
          <h2 className="text-[15px] font-black text-emerald-950 uppercase tracking-widest mb-2">My Wishlist</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wide mb-6">Sign in to view your saved items</p>
          <Link href="/account" className="inline-flex w-full justify-center py-4 bg-emerald-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md">
            Sign In Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-0 px-0 md:px-4 relative">
      
      {/* Floating Glassmorphic Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-emerald-950/95 backdrop-blur-md text-white border border-emerald-850 px-5 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] animate-slideIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <span className="text-[11px] font-bold uppercase tracking-widest leading-none">{toast.message}</span>
        </div>
      )}

      <div className="max-w-6xl">
        <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Link>

        {/* Premium Header Layout */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-[18px] font-black text-emerald-950 tracking-wider uppercase">My Wishlist</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
              Your saved organic favorites from Namma Ooru Foods
            </p>
          </div>
          
          {/* Controls: Search and Sort side-by-side on mobile */}
          <div className="grid grid-cols-2 lg:flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full">
              <input 
                type="text"
                placeholder="Search items..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 focus:border-emerald-600 outline-none text-[11px] font-bold text-emerald-950 bg-white transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="relative flex items-center w-full">
              <SlidersHorizontal className="absolute left-3 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
              <select 
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full h-11 pl-9 pr-6 rounded-xl border border-slate-200 focus:border-emerald-600 outline-none text-[10px] font-black uppercase tracking-widest text-emerald-950 bg-white transition-all shadow-sm cursor-pointer appearance-none"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
              </select>
            </div>
          </div>
        </div>

        {/* Premium Marketplace Dashboard Top Stats Bar - Side-by-side 3 column dense on mobile */}
        {items.length > 0 && (
          <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8">
            <div className="bg-white border border-slate-100 rounded-xl md:rounded-[1.5rem] p-3 md:p-5 shadow-sm flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 text-center md:text-left">
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-800 shrink-0">
                <Heart className="h-4 w-4 md:h-5 md:w-5 fill-emerald-800" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Items</p>
                <h4 className="text-[11px] md:text-lg font-black text-emerald-950 mt-1 leading-none">{items.length}</h4>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl md:rounded-[1.5rem] p-3 md:p-5 shadow-sm flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 text-center md:text-left">
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Savings</p>
                <h4 className="text-[11px] md:text-lg font-black text-amber-600 mt-1 leading-none">₹{totalSavings}</h4>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl md:rounded-[1.5rem] p-3 md:p-5 shadow-sm flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 text-center md:text-left">
              <div className="h-8 w-8 md:h-12 md:w-12 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="min-w-0 flex-1 w-full">
                <p className="text-[7px] md:text-[9px] font-black uppercase tracking-widest text-slate-400 leading-none">Recent</p>
                <h4 className="text-[9px] md:text-xs font-black text-emerald-950 mt-1 leading-none truncate max-w-[50px] md:max-w-[140px] mx-auto md:mx-0" title={recentlySavedName}>
                  {recentlySavedName}
                </h4>
              </div>
            </div>
          </div>
        )}

        {/* Content & Main Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Loader2 className="h-7 w-7 text-emerald-850 animate-spin" />
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Loading Wishlist...</p>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-slate-100 shadow-sm max-w-2xl mx-auto">
            <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-6 w-6 text-slate-300" />
            </div>
            <h2 className="text-[14px] font-black text-emerald-950 uppercase tracking-widest mb-2">Your wishlist is waiting</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide mb-8 max-w-sm mx-auto leading-relaxed">
              {searchQuery ? "No matching products found. Try adjusting your search query." : "Explore our fresh organic selection and save items for easy ordering."}
            </p>
            <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-950 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-emerald-800 transition-all shadow-md">
              Explore Organic Products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map(item => {
              const p = item.product;
              const discount = p.originalPrice ? Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100) : 0;
              return (
                <div 
                  key={item.id} 
                  className="bg-white rounded-[2rem] overflow-hidden border border-slate-100/80 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
                >
                  
                  {/* Aspect Square Image container with soft zoom & badging */}
                  <div className="relative aspect-[4/3] w-full bg-slate-50 overflow-hidden">
                    <img 
                      src={p.image || '/ai_images/organic_grains_1776231059575.png'} 
                      alt={p.name} 
                      className="h-full w-full object-cover transition-transform duration-750 group-hover:scale-105" 
                    />
                    
                    {/* Organic highlight badge */}
                    <div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5">
                      <span className="bg-emerald-950 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow-sm">
                        Organic
                      </span>
                      {discount > 0 && (
                        <span className="bg-amber-400 text-emerald-950 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm w-fit">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

                    {/* Absolute Delete Button - Always visible for accessible mobile interaction */}
                    <button 
                      id={`remove-wishlist-${p.id}`} 
                      onClick={() => remove(p.id, p.name)} 
                      className="absolute top-3.5 right-3.5 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center text-rose-500 hover:text-white hover:bg-rose-500 transition-all active:scale-95"
                      title="Remove Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Body Content Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        {p.brand?.name || 'Namma Ooru Foods'}
                      </p>
                      <h3 className="text-[14px] font-bold text-emerald-950 mb-2 leading-snug hover:text-emerald-800 transition-all cursor-pointer">
                        {p.name}
                      </h3>
                      
                      {/* Rating details */}
                      <div className="flex items-center gap-1 mb-4 bg-slate-50 w-fit px-2 py-0.5 rounded-md">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-[10px] font-black text-emerald-950">{p.avgRating || '4.8'}</span>
                        <span className="text-[9px] text-slate-400 font-bold">({p.reviewCount || '28'})</span>
                      </div>
                    </div>

                    {/* Bottom layout: pricing and quick action CTAs */}
                    <div className="pt-4 border-t border-slate-50">
                      
                      {/* Price Section */}
                      <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-[18px] font-black text-emerald-950">₹{Number(p.price).toLocaleString()}</span>
                        {p.originalPrice && (
                          <span className="text-[11px] text-slate-400 line-through font-bold">
                            ₹{Number(p.originalPrice).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Interactive Dual Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          id={`wishlist-add-cart-${p.id}`} 
                          onClick={() => handleAddToCart(item)} 
                          disabled={addingId === p.id}
                          className="h-10 px-3 rounded-xl bg-slate-100 text-emerald-950 hover:bg-slate-200 disabled:bg-slate-100 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5"
                        >
                          {addingId === p.id ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="h-3.5 w-3.5" /> Cart
                            </>
                          )}
                        </button>
                        
                        <button 
                          onClick={() => handleBuyNow(item)}
                          className="h-10 px-3 rounded-xl bg-emerald-950 text-white hover:bg-emerald-800 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center"
                        >
                          Buy Now
                        </button>
                      </div>

                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
