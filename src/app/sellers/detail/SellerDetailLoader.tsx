'use client';

import React from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';
import { Package, LayoutGrid, MapPin, ArrowLeft, Phone, Mail, Store, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import OptimizedImage from '@/components/ui/OptimizedImage';
import ProductCard from '@/components/ProductCard';
import PremiumLoader from '@/components/ui/PremiumLoader';
import { usePlatformSettings } from '@/context/PlatformSettingsContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const formatName = (name: string) => {
  if (!name) return '';
  return name.replace(/[-_]+/g, ' ').split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
};

export default function SellerDetailLoader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { settings } = usePlatformSettings();
  const slug = searchParams.get('slug') || searchParams.get('id');

  // Fetch seller (sub-vendor) — NO head-vendor data exposed
  const { data: seller, error, isLoading } = useSWR(
    slug ? `${API_URL}/api/sub-vendors/${slug}` : null,
    fetcher
  );

  // Fetch seller's products
  const { data: productsData } = useSWR(
    seller?.id ? `${API_URL}/api/products?subVendorId=${seller.id}&limit=24` : null,
    fetcher
  );

  const products = (productsData?.products || productsData || []) as any[];

  // ── States ────────────────────────────────────────
  if (!slug) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center">
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">No Seller Specified</h1>
        <button onClick={() => router.push('/sellers')} className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest">
          Browse All Sellers
        </button>
      </div>
    );
  }

  if (isLoading || (!seller && !error)) return <PremiumLoader fullScreen={true} />;

  if (error || !seller || seller.error) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-8 text-center bg-white">
        <div className="h-24 w-24 rounded-[2rem] bg-rose-50 flex items-center justify-center mb-8">
          <span className="text-4xl font-black text-rose-400">!</span>
        </div>
        <h1 className="text-4xl font-black text-slate-800 uppercase tracking-tighter">Seller Not Found</h1>
        <p className="text-slate-400 font-medium mt-4 max-w-sm mx-auto">This seller does not exist or may have been removed.</p>
        <button onClick={() => router.push('/sellers')} className="mt-8 h-12 px-8 rounded-xl bg-emerald-950 text-white font-black text-[11px] uppercase tracking-widest">
          Browse All Sellers
        </button>
      </div>
    );
  }

  const productCount = seller._count?.products ?? products.length ?? 0;
  const categoryCount = seller._count?.categories ?? 0;

  return (
    <div className="bg-white min-h-screen">

      {/* ─── HERO BANNER ─── */}
      <div className="relative w-full h-[260px] md:h-[360px] overflow-hidden bg-emerald-950">
        {seller.banner ? (
          <img src={seller.banner} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/80 to-transparent" />

        {/* Back nav */}
        <div className="absolute top-6 left-0 right-0 standard-container">
          <Link href="/sellers" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-[0.2em] text-white hover:bg-white/20 transition-all">
            <ArrowLeft size={12} strokeWidth={3} /> All Sellers
          </Link>
        </div>

        {/* Seller name overlay */}
        <div className="absolute bottom-8 left-0 right-0 standard-container">
          <div className="flex items-end gap-6">
            {/* Logo */}
            <div className="relative h-20 w-20 md:h-28 md:w-28 rounded-[1.5rem] md:rounded-[2rem] bg-white shadow-2xl overflow-hidden border-4 border-white shrink-0 flex items-center justify-center">
              {seller.logo ? (
                <OptimizedImage
                  src={seller.logo}
                  alt={seller.name}
                  fill
                  className="object-contain p-3"
                />
              ) : (
                <span className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-wider text-center p-2">No Logo</span>
              )}
            </div>
            <div className="pb-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                  <ShieldCheck size={11} className="text-emerald-400" />
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-400">Verified Seller</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-[900] text-white tracking-tight leading-none">
                {formatName(seller.name)}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CONTENT ─── */}
      <div className="standard-container py-10 md:py-14 space-y-12">

        {/* Stats + Description */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Description */}
          <div className="md:col-span-2 space-y-4">
            {seller.description && (
              <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
                {seller.description}
              </p>
            )}

            {/* Contact info — only if available */}
            <div className="flex flex-wrap gap-4 pt-2">
              {seller.email && (
                <a href={`mailto:${seller.email}`} className="flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:text-emerald-600 transition-colors">
                  <Mail size={14} className="text-emerald-500" /> {seller.email}
                </a>
              )}
              {seller.phone && (
                <a href={`tel:${seller.phone}`} className="flex items-center gap-2 text-[12px] font-bold text-slate-500 hover:text-emerald-600 transition-colors">
                  <Phone size={14} className="text-emerald-500" /> {seller.phone}
                </a>
              )}
              {(seller.city || seller.state) && (
                <span className="flex items-center gap-2 text-[12px] font-bold text-slate-400">
                  <MapPin size={14} className="text-slate-300" />
                  {[seller.city, seller.state].filter(Boolean).join(', ')}
                </span>
              )}
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-row md:flex-col gap-4">
            <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 p-5 flex flex-col gap-1">
              <div className="flex items-center gap-2 text-slate-400">
                <Package size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Products</span>
              </div>
              <span className="text-3xl font-[900] text-emerald-950">{productCount}</span>
            </div>
            {categoryCount > 0 && (
              <div className="flex-1 rounded-2xl bg-slate-50 border border-slate-100 p-5 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <LayoutGrid size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Categories</span>
                </div>
                <span className="text-3xl font-[900] text-emerald-950">{categoryCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* ─── PRODUCTS ─── */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-[900] text-emerald-950 tracking-tight uppercase">
              Products
            </h2>
            {products.length > 0 && (
              <Link href={`/products?subVendorId=${seller.id}`} className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors">
                View All <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {products.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {products.slice(0, 12).map((product: any) => (
                <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="py-16 flex flex-col items-center gap-3 text-center rounded-[2rem] bg-slate-50 border border-slate-100">
              <Store size={28} className="text-slate-200" />
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">No products yet</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
