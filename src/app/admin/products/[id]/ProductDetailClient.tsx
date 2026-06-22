'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, ShieldAlert, Package, Layers } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';

interface ProductDetailClientProps {
  id: string;
}

export default function ProductDetailClient({ id }: ProductDetailClientProps) {
  const router = useRouter();
  const { addToast } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        const token = localStorage.getItem('namma_orru_token');
        const res = await fetch(`${API_URL}/api/products/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white gap-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="h-10 w-10 border-4 border-emerald-950 border-t-amber-400 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#022c22]">Retrieving Product info...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in duration-500">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-500 mb-6">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase">Product Not Found</h3>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2 max-w-sm leading-relaxed">
          The requested product may have been deleted or no longer exists.
        </p>
        <button
          onClick={() => router.push('/admin/notifications')}
          className="mt-8 h-12 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 cursor-pointer border-none"
        >
          <ArrowLeft size={14} />
          Back to Notifications
        </button>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-6">
          <ShieldAlert size={36} strokeWidth={1.5} />
        </div>
        <h3 className="text-2xl font-black text-slate-900 uppercase">Fetch Error</h3>
        <p className="text-slate-500 font-bold text-xs mt-2 max-w-sm">
          {error || 'Unable to load product details at this moment.'}
        </p>
        <button
          onClick={() => router.push('/admin/notifications')}
          className="mt-8 h-12 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 cursor-pointer border-none"
        >
          Back to Notifications
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-16">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <button
            onClick={() => router.push('/admin/notifications')}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors mb-3 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={12} /> Back to Notifications
          </button>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic flex items-center gap-3">
            Product <span className="text-emerald-600">{product.name}</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">
            Catalog ID: PRD-{product.id}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className={`inline-flex px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
            product.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
            product.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
            'bg-red-100 text-red-700'
          }`}>
            Status: {product.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Card details */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Package className="text-emerald-600" size={18} />
            Item Details
          </h3>

          <div className="space-y-4">
            <div className="aspect-square bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm relative flex items-center justify-center">
              {product.image ? (
                <img src={product.image} className="h-full w-full object-cover" alt="" />
              ) : (
                <Package size={48} className="text-slate-300" />
              )}
            </div>

            <div className="pt-2">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">List Price</span>
              <span className="text-2xl font-black text-emerald-600 mt-1 block">₹{Number(product.price).toLocaleString()}</span>
            </div>

            <p className="text-slate-600 text-xs font-medium leading-relaxed whitespace-pre-line border-t border-slate-100 pt-4">
              {product.description || 'No description listed for this catalog item.'}
            </p>
          </div>
        </div>

        {/* Brand & Hub details */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Building2 className="text-emerald-600" size={18} />
            Vendor Ownership
          </h3>

          <div className="space-y-4">
            {product.subVendor ? (
              <>
                <div className="flex items-center gap-3">
                  {product.subVendor.logo ? (
                    <div className="h-10 w-10 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shrink-0">
                      <img src={product.subVendor.logo} className="h-full w-full object-contain" alt="" />
                    </div>
                  ) : (
                    <div className="h-10 w-10 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                      {product.subVendor.name?.[0] || 'V'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-black text-slate-900 block truncate leading-snug">{product.subVendor.name}</span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase block mt-0.5">ID: SV-{product.subVendor.id}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => router.push(`/admin/vendors/${product.subVendor.id}`)}
                    className="w-full h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    View Vendor Details
                  </button>
                </div>
              </>
            ) : (
              <p className="text-xs font-bold text-slate-400">Sold by Namma Ooru Originals.</p>
            )}
          </div>
        </div>

        {/* Categories & Catalog Status */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-6">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Layers className="text-emerald-600" size={18} />
            Classification
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Category</span>
              <span className="font-extrabold text-slate-800 text-sm mt-1 block">
                {product.category?.name || 'Unassigned Category'}
              </span>
            </div>
            {product.subcategory && (
              <div>
                <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Subcategory</span>
                <span className="font-extrabold text-slate-800 text-sm mt-1 block">
                  {product.subcategory.name}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Product Status</span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full border mt-2 ${
                product.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                product.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                'bg-red-50 text-red-700 border-red-100'
              }`}>
                {product.status === 'APPROVED' ? 'APPROVED & LIVE' : product.status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
