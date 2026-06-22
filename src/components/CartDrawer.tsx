'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

const CartDrawer = () => {
  const { cart, isOpen, setIsOpen, removeFromCart, updateQuantity, getTotal } = useCartStore();
  const total = getTotal();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />

      {/* Drawer */}
      <div className="relative z-10 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl animate-slide-left" data-lenis-prevent>
        <div className="flex flex-col border-b border-slate-100 p-6 gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-5 w-5 text-emerald-950" />
              <h2 className="text-xl font-black text-emerald-950 tracking-tighter">Your Cart ({cart.length})</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5 text-slate-400" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-emerald-950 mb-2">
              <span>{total >= 499 ? '🎉 Free  Shipping!' : `Add ₹${499 - total} more for FREE shipping`}</span>
              <span className="text-amber-500">{Math.min(100, (total / 499) * 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-950 transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, (total / 499) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-10">
              <div className="mb-6 h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                <ShoppingBag className="h-8 w-8 text-slate-200" />
              </div>
              <h3 className="text-lg font-black text-emerald-950 tracking-tighter uppercase">Products is Empty</h3>
              <p className="mt-2 text-[11px] font-medium text-slate-400 leading-relaxed uppercase tracking-wider">Your Offer collection starts here. Explore our organic Items.</p>
              <button
                onClick={() => setIsOpen(false)}
                className="mt-8 rounded-xl bg-emerald-950 px-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-white shadow-xl shadow-emerald-950/20"
              >
                Explore Catalog
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 group border-b border-slate-50 pb-4 last:border-0">
                  <div className="flex gap-4">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-black text-emerald-950 tracking-tighter leading-tight line-clamp-1">{item.name}</h4>
                          <span className="font-black text-emerald-950 text-sm">₹{item.price * item.quantity}</span>
                        </div>
                        {item.isBundle ? (
                          <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                            Bundle ({item.bundleItems?.length} items)
                          </div>
                        ) : (
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.variant}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 p-1">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="h-7 w-7 flex items-center justify-center font-bold bg-white rounded-lg shadow-sm hover:text-amber-500"
                          >-</button>
                          <span className="w-8 text-center text-[11px] font-black text-emerald-950">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-7 w-7 flex items-center justify-center font-bold bg-white rounded-lg shadow-sm hover:text-amber-500"
                          >+</button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {item.isBundle && item.bundleItems && (
                    <div className="ml-24 flex flex-col gap-1.5 border-l-2 border-emerald-100 pl-3">
                      {item.bundleItems.map((bi: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[10px] text-slate-500 font-medium">
                          <span className="line-clamp-1 flex-1 pr-2">{bi.name}</span>
                          <span className="font-bold text-slate-400">₹{bi.price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t border-slate-100 p-8 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Subtotal</span>
              <span className="text-2xl font-black text-emerald-950 tracking-tighter">₹{total}</span>
            </div>
            <div className="flex items-center justify-between mb-8">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Delivery</span>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1 rounded-full">Free</span>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/cart"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center justify-center gap-4 rounded-xl border-2 border-slate-100 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:border-[#022c22] hover:text-[#022c22] transition-all"
              >
                Go to Cart Page
              </Link>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-left {
          animation: slide-left 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default CartDrawer;
