'use client';

import React, { useState } from 'react';
import { Heart, ShoppingCart, Trash2, Star, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

const wishlistItems = [
  { id: 1, name: 'Organic Toor Dal', brand: 'Grama Fresh', price: 299, originalPrice: 349, weight: '1 KG', rating: 4.7, reviews: 124, image: '/ai_images/indian_spices_1776231045209.png', badge: 'Best Seller' },
  { id: 2, name: 'Cold Pressed Sesame Oil', brand: 'NaturaPress', price: 599, originalPrice: 699, weight: '1 Litre', rating: 4.9, reviews: 88, image: '/ai_images/honey_gold_1776231080758.png', badge: 'Organic' },
  { id: 3, name: 'A2 Cow Ghee', brand: 'Pure Farms', price: 899, originalPrice: 999, weight: '500 ML', rating: 4.8, reviews: 211, image: '/ai_images/organic_grains_1776231059575.png', badge: 'Premium' },
  { id: 4, name: 'Sprouted Ragi Flour', brand: 'MillStone', price: 189, originalPrice: 229, weight: '1 KG', rating: 4.5, reviews: 56, image: '/ai_images/indian_spices_1776231045209.png', badge: null },
  { id: 5, name: 'Mango Forest Honey', brand: 'Wild Nectar', price: 449, originalPrice: 499, weight: '500 G', rating: 4.6, reviews: 97, image: '/ai_images/honey_gold_1776231080758.png', badge: 'New' },
  { id: 6, name: 'Kashmiri Red Chilli Powder', brand: 'SpiceRoute', price: 149, originalPrice: 179, weight: '200 G', rating: 4.4, reviews: 43, image: '/ai_images/indian_spices_1776231045209.png', badge: null },
];

export default function WishlistPage() {
  const [items, setItems] = useState(wishlistItems);
  const remove = (id: number) => setItems(i => i.filter(x => x.id !== id));

  return (
    <div className="py-2 px-0 md:px-4">
      <div className="max-w-6xl">

        {/* Mobile Back Button */}
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

        {items.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center shadow-sm border border-slate-100">
            <Heart className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <h2 className="text-xl font-black text-slate-300 mb-2">Your wishlist is empty</h2>
            <p className="text-slate-300 text-sm mb-8">Save products you love and come back anytime.</p>
            <Link href="/products" className="inline-block px-8 py-3 bg-emerald-950 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-emerald-800 transition-all">Browse Products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                <div className="relative aspect-square overflow-hidden">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {item.badge && (
                    <div className="absolute top-3 left-3 bg-amber-400 text-emerald-950 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg">{item.badge}</div>
                  )}
                  <button onClick={() => remove(item.id)} className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{item.brand}</p>
                  <h3 className="text-[15px] font-black text-emerald-950 mb-1 leading-tight">{item.name}</h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-[11px] font-black text-emerald-950">{item.rating}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({item.reviews})</span>
                    <span className="text-[10px] text-slate-300 font-bold ml-1">· {item.weight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-black text-emerald-950">₹{item.price}</span>
                      <span className="text-[12px] text-slate-400 line-through ml-2">₹{item.originalPrice}</span>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-950 text-white text-[11px] font-black uppercase tracking-wide hover:bg-emerald-800 transition-all">
                      <ShoppingCart className="h-3.5 w-3.5" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
