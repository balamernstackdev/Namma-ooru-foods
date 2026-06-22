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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[20px] border border-[#E5E7EB] p-6 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
        <h2 className="text-xl font-black text-[#111827] tracking-tight">
          {brandId ? 'Store Specifications' : 'Global Variants'}
        </h2>
        <p className="text-[#6B7280] font-bold text-[10px] uppercase tracking-widest mt-1">Managing SKU-level inventory specifications</p>
      </div>


      {/* Desktop view */}
      <div className="hidden md:block bg-white rounded-[20px] border border-[#E5E7EB] shadow-[0_4px_12px_rgba(0,0,0,0.05)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAF7] border-b border-[#E5E7EB] text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
              <th className="px-6 py-4">Variant Identity</th>
              <th className="px-6 py-4">Parent Product</th>
              <th className="px-6 py-4">Stock Status</th>
              <th className="px-6 py-4">Pricing</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {variants.map((v: any) => (
              <tr key={v.id} className="hover:bg-[#F8FAF7] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#FEF3C7] text-[#B45309] border border-amber-250 flex items-center justify-center">
                      <Layers size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#111827] leading-none">{v.name}</div>
                      <div className="text-[10px] font-bold text-[#6B7280] mt-1.5 uppercase tracking-widest">{v.sku || 'No SKU'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-[#6B7280] font-semibold text-xs">
                    <Package size={14} className="text-[#6B7280]/40" />
                    {v.product?.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`h-1.5 w-1.5 rounded-full ${v.stock > 0 ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
                    <span className="text-xs font-bold text-[#111827]">{v.stock} in stock</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-black text-[#111827] flex items-center">
                    <IndianRupee size={12} strokeWidth={2.5} /> {v.price || 'P.P.'}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => router.push(`/vendor/variants/edit/${v.id}`)}
                      className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#0F7A4D] hover:border-[#0F7A4D] flex items-center justify-center transition-colors bg-white shadow-sm"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="h-8 w-8 rounded-lg border border-[#E5E7EB] text-red-450 hover:text-red-650 hover:border-red-200 flex items-center justify-center transition-colors bg-white shadow-sm"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-4">
        {variants.map((v: any) => (
          <div key={v.id} className="bg-white rounded-[20px] border border-[#E5E7EB] p-5 space-y-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#FEF3C7] text-[#B45309] border border-amber-250 flex items-center justify-center shrink-0">
                  <Layers size={18} />
                </div>
                <div>
                  <div className="text-[13px] font-black text-[#111827] leading-none">{v.name}</div>
                  <div className="text-[10px] font-bold text-[#6B7280] mt-1.5 uppercase tracking-widest">{v.sku || 'No SKU'}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/vendor/variants/edit/${v.id}`)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-[#6B7280] hover:text-[#0F7A4D] transition-colors shadow-sm"
                >
                  <Edit2 size={13} />
                </button>
                <button
                  onClick={() => handleDelete(v.id)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg bg-white border border-[#E5E7EB] text-red-450 hover:text-red-650 transition-colors shadow-sm"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="border-t border-[#E5E7EB] pt-3 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7280] font-bold uppercase tracking-widest text-[9px]">Parent Product</span>
                <span className="font-bold text-[#111827] flex items-center gap-1">
                  <Package size={12} className="text-[#6B7280]/40" />
                  {v.product?.name}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7280] font-bold uppercase tracking-widest text-[9px]">Stock Status</span>
                <div className="flex items-center gap-1.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${v.stock > 0 ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`} />
                  <span className="font-bold text-[#111827]">{v.stock} in stock</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-[#6B7280] font-bold uppercase tracking-widest text-[9px]">Pricing</span>
                <div className="font-black text-[#111827] flex items-center">
                  <IndianRupee size={11} strokeWidth={2.5} /> {v.price || 'P.P.'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
