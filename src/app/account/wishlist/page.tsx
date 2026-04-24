'use client';

import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, Star, ChevronLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/useCartStore';
import { API_URL } from '@/lib/api';

export default function WishlistPage() {
  const { user } = useAuth();
  const { addToCart } = useCartStore();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    fetch(`${API_URL}/api/wishlist/${user.id}`)
      .then(r => r.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const remove = async (productId: number) => {
    if (!user?.id) return;
    setItems(prev => prev.filter(i => i.productId !== productId));
    await fetch(`${API_URL}/api/wishlist/${user.id}/${productId}`, { method: 'DELETE' });
  };

  const handleAddToCart = (item: any) => {
    addToCart({
      productId: item.product.id,
      name: item.product.name,
      price: Number(item.product.price),
      image: item.product.image || '',
      variant: item.product.variants?.[0]?.name || 'Standard',
      quantity: 1
    });
  };

  if (!user) {
    return (
      <div className="py-2 px-0 md:px-4">
        <div className="bg-white rounded-[2rem] p-20 text-center shadow-sm border border-slate-100 max-w-md mx-auto">
          <Heart className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <h2 className="text-xl font-black text-slate-400 mb-2">Sign in to see your wishlist</h2>
          <Link href="/account" className="inline-block mt-4 px-8 py-3 bg-emerald-950 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 px-0 md:px-4">
      <div className="max-w-6xl">
        <Link href="/account" className="md:hidden flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-600 mb-6 bg-emerald-50 w-fit px-4 py-2 rounded-full">
          <ChevronLeft className="h-4 w-4" /> Back to Account
        </Link>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-emerald-950 tracking-tighter">My Wishlist</h1>
            <p className="text-[12px] text-slate-400 font-medium mt-1">{items.length} saved products</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center">
            <Heart className="h-6 w-6 text-rose-500 fill-rose-500" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 text-slate-200 animate-spin" /></div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center shadow-sm border border-slate-100">
            <Heart className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-300 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-300 text-sm mb-8">Save products you love and come back anytime.</p>
            <Link href="/products" className="inline-block px-8 py-3 bg-emerald-950 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-emerald-800 transition-all">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => {
              const p = item.product;
              const discount = p.originalPrice ? Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100) : 0;
              return (
                <div key={item.id} className="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                  <div className="relative aspect-square overflow-hidden">
                    <img src={p.image || '/ai_images/organic_grains_1776231059575.png'} alt={p.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {discount > 0 && (
                      <div className="absolute top-3 left-3 bg-amber-400 text-emerald-950 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">{discount}% OFF</div>
                    )}
                    <button id={`remove-wishlist-${p.id}`} onClick={() => remove(p.id)} className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{p.brand?.name || 'Namma Orru'}</p>
                    <h3 className="text-[15px] font-black text-emerald-950 mb-1 leading-tight">{p.name}</h3>
                    {p.avgRating && (
                      <div className="flex items-center gap-1 mb-3">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-black text-emerald-950">{p.avgRating}</span>
                        <span className="text-[10px] text-slate-400 font-medium">({p.reviewCount})</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xl font-black text-emerald-950">₹{Number(p.price).toLocaleString()}</span>
                        {p.originalPrice && <span className="text-[12px] text-slate-400 line-through ml-2">₹{Number(p.originalPrice).toLocaleString()}</span>}
                      </div>
                      <button id={`wishlist-add-cart-${p.id}`} onClick={() => handleAddToCart(item)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 text-white text-[11px] font-black uppercase tracking-wide hover:bg-emerald-800 transition-all">
                        <ShoppingCart className="h-3.5 w-3.5" /> Add
                      </button>
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
