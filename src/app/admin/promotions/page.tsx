'use client'

import Link from 'next/link';
import { Plus, Megaphone, Image as ImageIcon, Calendar, Power, RefreshCw, Edit2, Trash2 } from 'lucide-react';
import useSWR, { mutate } from 'swr';
import { API_URL } from '@/lib/api';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function PromotionsPage() {
  const { data: promotions, isLoading } = useSWR(`${API_URL}/api/promotions`, fetcher);
  const { data: banners, isLoading: bannersLoading } = useSWR(`${API_URL}/api/admin-ops/banners`, fetcher);

  const handleDelete = async (id: number) => {
    if (!confirm('Permanently decommission this offer?')) return;
    try {
      const res = await fetch(`${API_URL}/api/promotions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        mutate(`${API_URL}/api/promotions`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic leading-none">Marketing <span className="text-emerald-600">Management</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">Refining seasonal campaigns and high-impact homepage visuals.</p>
        </div>
        <div className="flex flex-wrap gap-4 pt-2">
          <Link href="/admin/promotions/layout">
            <button className="h-14 px-8 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-amber-100 transition-all shadow-sm">
              <Power className="h-5 w-5" /> Home Flow Builder
            </button>
          </Link>
          <Link href="/admin/banners">
            <button className="h-14 px-8 rounded-2xl bg-white border border-slate-200 text-slate-900 text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-50 transition-all shadow-sm">
              <ImageIcon className="h-5 w-5" /> Manage Banners
            </button>
          </Link>
          <Link href="/admin/promotions/create">
            <button className="h-14 px-8 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95">
              <Plus className="h-5 w-5" /> Create Offer
            </button>
          </Link>
        </div>
      </div>

      {/* Active Promotions */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Megaphone size={20} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Offers</h2>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 bg-slate-50 rounded-3xl">
            <RefreshCw className="h-8 w-8 text-emerald-900 animate-spin" />
          </div>
        )}

        {!isLoading && promotions && (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promo: any) => {
              const stats = promo.analytics?.[0] || { views: 0, clicks: 0, claims: 0 };
              return (
                <div key={promo.id} className={`group relative flex flex-col p-10 rounded-[2.5rem] border transition-all hover:shadow-2xl hover:shadow-slate-200/50 ${promo.isActive ? 'border-emerald-100 bg-white' : 'border-slate-100 bg-white'
                  }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${promo.isActive ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'
                        }`}>
                        {promo.isActive ? 'Live Now' : 'Scheduled'}
                      </span>
                      {promo.type && (
                        <span className="rounded-lg px-3 py-1.5 bg-blue-50 text-blue-600 border border-blue-100 text-[9px] font-black uppercase tracking-widest">
                          {promo.type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <button className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all ${promo.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-300'}`}>
                      <Power className={`h-5 w-5 ${promo.isActive ? 'animate-pulse' : ''}`} />
                    </button>
                  </div>

                  <div className="mt-8 flex-1">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{promo.title}</h3>
                    <p className="mt-2 text-3xl font-black text-emerald-600 tracking-tighter">{promo.discount || 'Campaign'}</p>

                    {/* Analytic Intelligence Badges */}
                    <div className="flex items-center gap-3 mt-4 bg-slate-50/50 rounded-xl p-2.5 border border-slate-100/50 w-fit">
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Views</span>
                        <span className="text-xs font-bold text-slate-700">{stats.views}</span>
                      </div>
                      <div className="h-5 w-[1px] bg-slate-200" />
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Clicks</span>
                        <span className="text-xs font-bold text-slate-700">{stats.clicks}</span>
                      </div>
                      <div className="h-5 w-[1px] bg-slate-200" />
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Claims</span>
                        <span className="text-xs font-bold text-emerald-600">{stats.claims}</span>
                      </div>
                    </div>

                    <p className="mt-3 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Valid on {promo.category || 'All Products'}</p>
                    {promo.code && (
                      <span className="inline-block mt-3 font-mono text-[11px] font-black tracking-widest text-slate-600 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg uppercase">
                        CODE: {promo.code}
                      </span>
                    )}
                  </div>

                  <div className="mt-10 flex items-center justify-between border-t border-slate-50 pt-8">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Calendar className="h-4 w-4" /> {promo.endDate ? new Date(promo.endDate).toLocaleDateString() : 'Perpetual'}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/promotions/edit?id=${promo.id}`}>
                        <button className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                          <Edit2 className="h-4 w-4" />
                        </button>
                      </Link>
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="h-10 w-10 rounded-xl bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && (!promotions || promotions.length === 0) && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <Megaphone className="h-10 w-10 text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active promotions found.</p>
          </div>
        )}
      </section>

      {/* Banner Management */}
      <section className="flex flex-col gap-8">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-500">
            <ImageIcon size={20} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Homepage Banners</h2>
        </div>
        {!bannersLoading && banners && banners.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {banners.slice(0, 4).map((banner: any) => (
              <div key={banner.id} className="group relative aspect-[21/9] overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all">
                <img src={banner.banner_image || banner.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt={banner.title || 'Banner'} />
                <div className="absolute inset-x-0 bottom-0 p-8 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-lg font-black tracking-tight truncate">{banner.title}</p>
                  <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">/{banner.link || 'Internal'}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 absolute inset-0 bg-slate-900/40 transition-opacity backdrop-blur-[2px] flex items-center justify-center">
                  <Link href="/admin/banners">
                    <button className="h-14 px-10 rounded-2xl bg-white text-slate-900 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-2xl">Manage Asset</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No banners created yet.</p>
            <Link href="/admin/banners" className="mt-4 text-blue-600 font-black uppercase tracking-widest text-[10px] hover:underline">Add First Banner</Link>
          </div>
        )}
      </section>
    </div>
  );
}
