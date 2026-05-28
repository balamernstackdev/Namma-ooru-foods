'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Layers, IndianRupee, Hash, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';

interface Product {
  id: number;
  name: string;
}

interface Variant {
  id: number;
  name: string;
  price: number;
  stock: number;
  sku: string;
  productId: number;
  product?: {
    name: string;
  };
}

export default function VariantManager({ brandId }: { brandId?: number }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    fetchVariants();
  }, [brandId]);

  const fetchVariants = async () => {
    const url = brandId 
      ? `${API_URL}/api/variants?subVendorId=${brandId}&limit=1000` 
      : `${API_URL}/api/variants?limit=1000`;
    const res = await fetch(url);
    const data = await res.json();
    const variantsArray = Array.isArray(data) ? data : (data?.variants || []);
    setVariants(variantsArray);
  };


  const handleDelete = async (id: number) => {
    if (confirm('Delete this variant?')) {
      await fetch(`${API_URL}/api/variants/${id}`, { method: 'DELETE' });
      fetchVariants();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-emerald-950 tracking-tighter uppercase">
            {brandId ? 'Store Specifications' : 'Global Variants'}
          </h2>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Managing SKU-level inventory specifications</p>
        </div>
      </div>


      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Variant Identity</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Parent Product</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Stock Status</th>
              <th className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pricing</th>
              <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {variants.map((v: any) => (
              <tr key={v.id} className="group hover:bg-slate-50/50 transition-colors">
                <td className="px-10 py-8">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                      <Layers size={20} />
                    </div>
                    <div>
                      <div className="text-[13px] font-black text-emerald-950 leading-none">{v.name}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">{v.sku || 'No SKU'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-tight">
                    <Package size={14} className="text-slate-300" />
                    {v.product?.name}
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${v.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs font-black text-emerald-950">{v.stock} in stock</span>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <div className="text-xs font-black text-emerald-950 flex items-center">
                    <IndianRupee size={12} strokeWidth={3} /> {v.price || 'P.P.'}
                  </div>
                </td>
                <td className="px-10 py-8 text-right">
                  <div className="flex items-center justify-end gap-2 transition-all">
                    <button
                      onClick={() => router.push(`/vendor/variants/edit/${v.id}`)}
                      className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-100 text-slate-400 hover:bg-emerald-950 hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
