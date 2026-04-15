'use client';

import React, { useState } from 'react';
import { ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Star } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useToast } from '@/context/ToastContext';
import ProductCard from '@/components/ProductCard';


interface ProductDetailClientProps {
  product: any;
  allProducts: any[];
}

const ProductDetailClient = ({ product, allProducts }: ProductDetailClientProps) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants ? product.variants[1] : { name: 'Standard', price: product.price });
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCartStore();
  const { addToast } = useToast();


  return (
    <div className="w-full min-h-screen bg-slate-50 pt-4 pb-32">
      {/* Main Content Container */}
      <div className="standard-container mt-4 md:mt-8">
        <div className="grid grid-cols-1 gap-8 lg:gap-20 lg:grid-cols-2 bg-white rounded-3xl md:rounded-[2.5rem] p-4 md:p-12 shadow-premium border border-slate-100 overflow-hidden relative">

          {/* Left: Image Media Section */}
          <div className="flex flex-col gap-6 relative z-10">
            <div className="aspect-square overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-100 relative group shadow-sm">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute top-6 left-6 z-30">
                <div
                  style={{ backgroundColor: '#fbbf24', color: '#022c22' }}
                  className="text-[10px] font-black px-5 py-2.5 rounded-full shadow-xl uppercase tracking-[0.2em]"
                >
                  100% Organic
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Narrative & Actions */}
          <div className="flex flex-col relative z-20">
            <div className="mb-10 flex flex-wrap items-center gap-4">
              <span
                style={{ backgroundColor: '#ecfdf5', color: '#065f46' }}
                className="text-[10px] font-black uppercase tracking-[0.4em] px-4 py-2 rounded-full border border-emerald-100"
              >
                {product.category || 'Organically Handpicked'}
              </span>
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-100">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-[#022c22] font-black text-xs">{product.rating}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">124 Reviews</span>
              </div>
            </div>

            <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-[#022c22] tracking-tighter leading-tight mb-4 md:mb-6">
              {product.name}
            </h1>

            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10">
              By <span className="text-emerald-800 underline decoration-amber-400 decoration-2 underline-offset-4 uppercase">{product.brand || 'Vibrant Farm Clusters'}</span>
            </p>

            <div className="mb-10 flex flex-col gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 font-bold uppercase">Our Price</span>
              <div className="flex items-baseline gap-4 md:gap-6">
                <span className="text-3xl md:text-4xl lg:text-5xl font-black text-[#022c22] tracking-tighter">
                  <span className="text-lg opacity-60 mr-1">₹</span>{selectedVariant.price}
                </span>
                {selectedVariant.price && (
                  <span className="text-lg text-slate-400 line-through font-bold italic opacity-60">
                    ₹{(selectedVariant.price || 0) + 40}
                  </span>
                )}
              </div>
            </div>

            {/* Batch Variant Selector */}
            {product.variants && (
              <div className="mb-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#022c22]/40 mb-6 font-bold uppercase">Choose Weight</h3>
                <div className="flex flex-wrap gap-2 md:gap-4">
                  {product.variants.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      style={selectedVariant.name === variant.name ? { backgroundColor: '#022c22', color: '#ffffff' } : { backgroundColor: '#ffffff', color: '#94a3b8' }}
                      className={`flex items-center justify-center rounded-xl md:rounded-2xl border-2 px-6 md:px-8 py-3 md:py-4 text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all duration-500 cursor-pointer ${selectedVariant.name === variant.name
                        ? 'border-[#022c22] shadow-2xl scale-105'
                        : 'border-slate-100 hover:border-[#022c22]/20'
                        }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Primary Action Suite */}
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-10">
              <div className="flex items-center rounded-2xl border border-slate-100 bg-slate-50 p-1.5 h-16 md:h-20 shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center text-lg md:text-xl font-bold bg-white rounded-xl shadow-sm hover:text-amber-500 transition-all">-</button>
                <span className="w-12 md:w-16 text-center font-black text-[#022c22] text-lg md:text-xl">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="flex h-12 w-12 md:h-16 md:w-16 items-center justify-center text-lg md:text-xl font-bold bg-white rounded-xl shadow-sm hover:text-amber-500 transition-all">+</button>
              </div>

              <button
                onClick={() => {
                  addToCart({
                    productId: product.id,
                    name: product.name,
                    price: selectedVariant.price || product.price,
                    quantity: quantity,
                    image: product.image,
                    variant: selectedVariant.name
                  });
                  addToast('Successfully added to basket', product.name);
                }}
                style={{ backgroundColor: '#022c22', color: '#ffffff' }}
                className="flex flex-1 items-center justify-center gap-3 md:gap-5 rounded-2xl px-6 md:px-12 h-16 md:h-20 text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all hover:bg-[#064e3b] shadow-xl shadow-[#022c22]/10 group"
              >
                <ShoppingCart className="h-5 w-5 md:h-6 md:w-6" />
                Add To Cart
              </button>



              <button className="hidden sm:flex h-16 md:h-20 w-16 md:w-20 items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm shrink-0">
                <Heart className="h-6 w-6 md:h-7 md:w-7" />
              </button>
            </div>

            {/* Trust Badges Area */}
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6 md:gap-10 py-8 md:py-12 border-t border-slate-100">
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-900 shadow-sm border border-emerald-100">
                  <Truck className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed text-slate-400">Complimentary<br />Farmside Delivery</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-900 shadow-sm border border-amber-100">
                  <ShieldCheck className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed text-slate-400">Chemical Free<br />Certified Purity</span>
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-900 shadow-sm border border-indigo-100">
                  <RefreshCw className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest leading-relaxed text-slate-400">Integrity Swap<br />Policy Enabled</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expanded Details Section */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-[2rem] p-10 md:p-14 border border-slate-100 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-[#022c22] mb-10 inline-block border-b-2 border-amber-400 pb-3 font-bold">The Harvest Story</h3>
              <p className="text-slate-500 text-base md:text-lg leading-[1.8] font-medium">{product.description || 'This treasure represents the highest standard of our sustainable farming initiative.'}</p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div
              style={{ backgroundColor: '#022c22' }}
              className="rounded-[2rem] p-10 text-white flex flex-col items-center text-center gap-8 shadow-premium relative overflow-hidden h-full"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-20" />
              <div className="h-16 w-16 rounded-full bg-amber-400 flex items-center justify-center text-[#022c22] shadow-2xl relative z-10">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h4 className="text-[11px] font-black uppercase tracking-[0.3em] relative z-10">Purity Guarantee</h4>
              <p className="text-[11px] font-bold text-emerald-100/70 leading-relaxed relative z-10 px-4">Every gram of this harvest is traced back to verified organic clusters.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Items Display - Horizontal Slider */}
      <div className="w-full mt-32 mb-20 overflow-hidden">
        <div className="standard-container">
          <div className="flex items-center justify-between mb-12 px-2">
            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500">More From Selection</span>
              <h2 className="text-3xl md:text-5xl font-black text-[#022c22] tracking-tighter">Healthy Alternatives</h2>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">Slide to explore</span>
              <div className="h-[2px] w-12 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#022c22] w-1/3 animate-[slide_3s_infinite_ease-in-out]" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-10 px-[calc((100vw-min(1400px,100vw-3rem))/2)] no-scrollbar snap-x snap-mandatory">
          {allProducts.filter(p => p.id !== product.id).slice(0, 10).map((p) => (
            <div key={p.id} className="min-w-[280px] md:min-w-[340px] snap-center first:ml-6 md:first:ml-0 last:mr-6 md:last:mr-0">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      {/* FIXED CHECKOUT BAR - PREMIUM CALIBRATION */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] bg-white/95 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-20px_50px_rgba(0,0,0,0.08)]">
        <div className="standard-container flex items-center justify-between py-4 md:py-5 gap-6">
          <div className="hidden md:flex items-center gap-5 flex-1">
            <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 shrink-0 overflow-hidden shadow-inner">
              <img src={product.image} className="w-full h-full object-cover" alt="" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Selected Product</span>
              <span className="font-black text-lg text-[#022c22] tracking-tighter leading-none">{product.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center rounded-xl bg-slate-50 border border-slate-100 p-1 h-12 md:h-14">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center font-bold bg-white rounded-lg shadow-sm hover:text-amber-500 transition-all text-sm font-black"
              >
                -
              </button>
              <span className="w-10 md:w-12 text-center font-black text-[#022c22] text-sm md:text-base">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="h-9 w-9 md:h-11 md:w-11 flex items-center justify-center font-bold bg-white rounded-lg shadow-sm hover:text-amber-500 transition-all text-sm font-black"
              >
                +
              </button>
            </div>

            <button
              onClick={() => {
                addToCart({
                  productId: product.id,
                  name: product.name,
                  price: selectedVariant.price || product.price,
                  quantity: quantity,
                  image: product.image,
                  variant: selectedVariant.name
                });
                addToast('Successfully added to basket', product.name);
              }}
              style={{ backgroundColor: '#022c22', color: '#ffffff' }}
              className="flex-1 md:flex-none flex items-center justify-center gap-3 md:gap-4 rounded-xl md:rounded-2xl px-6 md:px-10 h-12 md:h-14 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-xl shadow-[#022c22]/10 active:scale-95 whitespace-nowrap"
            >
              <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4" /> Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailClient;
