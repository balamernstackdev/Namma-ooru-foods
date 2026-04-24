'use client'

import Link from 'next/link';
import { Plus, Megaphone, Image as ImageIcon, Calendar, Power, RefreshCw, Edit2 } from 'lucide-react';
import useSWR from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PromotionsPage() {
  const { data: promotions, isLoading } = useSWR(`${API_URL}/api/promotions`, fetcher);
  const { data: banners, isLoading: bannersLoading } = useSWR(`${API_URL}/api/admin-ops/banners`, fetcher);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketing & Promotions</h1>
          <p className="text-[var(--muted-foreground)]">Manage discounts, seasonal campaigns, and homepage banners.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/admin/banners">
            <button className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-6 py-3 font-bold hover:bg-[var(--muted)] transition-all">
               <ImageIcon className="h-5 w-5" /> New Banner
            </button>
          </Link>
          <Link href="/admin/promotions/create">
            <button className="flex items-center gap-2 rounded-xl bg-[var(--primary)] px-6 py-3 font-bold text-white shadow-lg shadow-[var(--primary)]/20 transition-all hover:bg-[var(--primary-dark)] active:scale-95">
              <Plus className="h-5 w-5" /> Create Offer
            </button>
          </Link>
        </div>
      </div>

      {/* Active Promotions */}
      <section className="flex flex-col gap-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
           <Megaphone className="h-6 w-6 text-[var(--primary)]" /> Active Offers
        </h2>
        
        {isLoading && (
          <div className="flex items-center justify-center py-20 bg-slate-50 rounded-3xl animate-pulse">
            <RefreshCw className="h-8 w-8 text-emerald-900 animate-spin" />
          </div>
        )}

        {!isLoading && promotions && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo: any) => (
              <div key={promo.id} className={`relative flex flex-col p-6 rounded-2xl border transition-all ${
                promo.active ? 'border-emerald-200 bg-emerald-50/20 shadow-md' : 'border-slate-200 bg-white'
              }`}>
                <div className="flex items-start justify-between">
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      promo.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {promo.active ? 'Active' : 'Scheduled'}
                    </span>
                    <button className={`p-2 rounded-lg transition-colors ${promo.active ? 'text-green-600' : 'text-slate-400'}`}>
                      <Power className={`h-5 w-5 ${promo.active ? 'animate-pulse' : ''}`} />
                    </button>
                </div>
                <h3 className="mt-4 text-xl font-bold">{promo.title}</h3>
                <p className="mt-1 text-2xl font-black text-emerald-900">{promo.discount}</p>
                <p className="mt-2 text-sm text-slate-500">Valid on {promo.category || 'All Products'}</p>
                
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                      <Calendar className="h-4 w-4" /> {promo.end || 'Perpetual'}
                    </div>
                    <Link href={`/admin/promotions/edit?id=${promo.id}`}>
                      <button className="flex items-center gap-2 text-sm font-bold text-emerald-900 hover:underline">
                        <Edit2 className="h-3 w-3" /> Edit
                      </button>
                    </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (!promotions || promotions.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <Megaphone className="h-10 w-10 text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">No active promotions found.</p>
          </div>
        )}
      </section>

      {/* Banner Management */}
      <section className="flex flex-col gap-6">
         <h2 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="h-6 w-6 text-indigo-500" /> Homepage Banners
         </h2>
         {!bannersLoading && banners && banners.length > 0 ? (
           <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {banners.slice(0, 4).map((banner: any) => (
                <div key={banner.id} className="group relative aspect-[21/9] overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                   <img src={banner.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={banner.title} />
                   <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <p className="text-white text-sm font-bold truncate">{banner.title}</p>
                   </div>
                   <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-emerald-950/40 transition-opacity backdrop-blur-[2px] flex items-center justify-center gap-4">
                      <Link href="/admin/banners">
                        <button className="rounded-xl bg-white px-6 py-2 font-bold text-emerald-950 hover:bg-emerald-50 transition-all">Manage</button>
                      </Link>
                   </div>
                </div>
              ))}
           </div>
         ) : (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold">No banners created yet.</p>
            <Link href="/admin/banners" className="mt-4 text-emerald-600 font-bold hover:underline">Add First Banner</Link>
          </div>
         )}
      </section>
    </div>
  );
}
