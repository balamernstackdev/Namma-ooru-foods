'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Trash2, ArrowRight, ShieldCheck, Truck, RefreshCw, ChevronLeft } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import ProductCard from '@/components/ProductCard';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();
  const freeShippingThreshold = 499;
  const progress = Math.min(100, (total / freeShippingThreshold) * 100);

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-8 md:pt-16 pb-20">
      <div className="standard-container">
        {/* Breadcrumb / Back */}
        <Link href="/products" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-[#022c22] transition-colors mb-10 group">
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Shopping
        </Link>

        <h1 className="text-4xl md:text-6xl font-black text-[#022c22] tracking-tighter mb-12">
          Shopping Cart <span className="text-slate-300 ml-4 font-bold text-2xl md:text-3xl">({cart.length} Items)</span>
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 md:p-24 text-center border border-slate-100 shadow-premium flex flex-col items-center">
            <div className="h-32 w-32 rounded-full bg-slate-50 flex items-center justify-center mb-10">
              <ShoppingBag className="h-12 w-12 text-slate-200" />
            </div>
            <h2 className="text-2xl font-bold text-[#022c22] uppercase tracking-tighter mb-4">Your Products is Empty</h2>
            <p className="text-slate-400 font-medium max-w-md mx-auto mb-12 leading-relaxed uppercase text-[11px] tracking-widest">
              It looks like you haven't selected any organic Items yet. Start exploring our traditional harvests.
            </p>
            <Link
              href="/products"
              style={{ backgroundColor: '#022c22' }}
              className="px-12 py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.4em] text-white shadow-2xl shadow-emerald-950/20 hover:scale-105 transition-all"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 xl:gap-16 items-start">

            {/* LEFT: Item List */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Shipping Progress */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#022c22]">
                    {total >= freeShippingThreshold ? '🎉 Free Shipping Applied!' : `Add ₹${freeShippingThreshold - total} for FREE delivery`}
                  </span>
                  <span className="text-amber-500 font-bold text-xs">{progress.toFixed(0)}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.variant}`}
                    className="bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center border border-slate-100 hover:shadow-xl transition-all group"
                  >
                    {/* Image Wrapper */}
                    <div className="h-32 w-32 md:h-40 md:w-40 relative rounded-[1.5rem] overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col md:flex-row justify-between w-full h-full gap-6">
                      <div className="flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2">Organic Product</p>
                          <h3 className="text-2xl font-black text-[#022c22] tracking-tighter leading-none mb-2">{item.name}</h3>
                          <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">{item.variant}</p>
                        </div>

                        <div className="mt-6 flex items-center rounded-xl bg-slate-50 border border-slate-100 p-1.5 w-max">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="h-10 w-10 flex items-center justify-center font-bold bg-white rounded-lg shadow-sm hover:text-amber-500 transition-colors"
                          >-</button>
                          <span className="w-10 text-center font-black text-[#022c22]">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-10 w-10 flex items-center justify-center font-bold bg-white rounded-lg shadow-sm hover:text-amber-500 transition-colors"
                          >+</button>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between min-w-[120px]">
                        <span className="text-2xl font-black text-[#022c22] tracking-tighter">₹{item.price * item.quantity}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-red-500 transition-all p-2 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT: Order Summary */}
            <div className="sticky top-28 lg:col-span-1">
              <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium flex flex-col gap-8">
                <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#022c22]">Order Summary</h3>

                <div className="space-y-6 py-8 border-y border-slate-50">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Amount</span>
                    <span className="font-bold text-[#022c22]">₹{total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Farmside Delivery</span>
                    <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">Free</span>
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-slate-100">
                    <span className="text-sm font-black text-[#022c22] uppercase tracking-[0.2em]">Total Premium</span>
                    <span className="text-3xl font-black text-[#022c22] tracking-tighter">₹{total}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    style={{ backgroundColor: '#022c22' }}
                    className="w-full flex items-center justify-center gap-4 py-6 rounded-2xl text-[11px] font-bold uppercase tracking-[0.4em] text-white shadow-2xl shadow-emerald-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    Proceed to Checkout <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link href="/products" className="text-center py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#022c22] transition-colors">
                    Continue Shopping
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 mt-4">
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">SSL Encrypted<br />Safe Payments</span>
                  </div>
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <Truck className="h-5 w-5 text-amber-500" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Fresh Guarantee<br />Direct From Farm</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
