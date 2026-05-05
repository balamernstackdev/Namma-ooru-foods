'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Loader2, Plus, Edit2, Trash2, ShoppingBag } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import AdminPagination from '@/components/admin/AdminPagination';

interface Variant {
  id: number;
  sku: string;
  name?: string;
  price: number;
  stock: number;
  productId: number;
  product: { name: string; image?: string };
}

export default function AdminVariantsPage() {
  const { addToast } = useToast();
  const router = useRouter();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const vRes = await fetch(`${API_URL}/api/variants?page=${currentPage}&limit=19`);
      const data = await vRes.json();
      setVariants(data.variants);
      setTotalPages(data.pages);
    } catch (err) {
      addToast('Error', 'Failed to fetch inventory data');
    } finally {
      setLoading(false);
    }
  };

  const updateVariantStock = async (id: number, newStock: number) => {
    setUpdating(id);
    try {
      const res = await fetch(`${API_URL}/api/variants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setVariants(prev => prev.map(v => v.id === id ? { ...v, stock: newStock } : v));
        addToast('Success', 'Stock level synchronized');
      }
    } finally {
      setUpdating(null);
    }
  };

  const deleteVariant = async (id: number) => {
    if (!confirm('Permanently remove this variant from inventory?')) return;
    try {
      const res = await fetch(`${API_URL}/api/variants/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setVariants(prev => prev.filter(v => v.id !== id));
        addToast('Success', 'Variant removed');
      }
    } catch (err) {
      addToast('Error', 'Failed to delete variant');
    }
  };

  const filtered = variants.filter(v =>
    v.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative min-h-[70vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Inventory Console</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Directly manage stock and SKUs for all product variations.</p>
        </div>
        <button
          onClick={() => router.push('/admin/variants/new')}
          className="h-16 px-10 rounded-2xl bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
        >
          <Plus size={20} /> New SKU Variant
        </button>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row items-center gap-4 bg-slate-50/20">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder="Search by SKU or Product name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white rounded-xl pl-11 pr-4 text-xs font-bold outline-none border border-slate-100 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100 self-start md:self-auto">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-700">
              {variants.filter(v => v.stock < 10).length} Low Stock Alerts
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Product / SKU</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Specification</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Price</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Stock Balance</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="px-8 py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></td></tr>
              ) : filtered.map(variant => (
                <tr key={variant.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                        {variant.product.image ? <img src={variant.product.image} className="w-full h-full object-cover" /> : <ShoppingBag className="h-full w-full p-2 text-slate-200" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-[var(--admin-sidebar)] leading-tight">{variant.product.name}</span>
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter">{variant.sku}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                      {variant.name || 'STANDARD'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-blue-600">
                    ₹{variant.price.toLocaleString()}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val)) {
                            setVariants(prev => prev.map(v => v.id === variant.id ? { ...v, stock: val } : v));
                          }
                        }}
                        onBlur={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val !== variant.stock) {
                            updateVariantStock(variant.id, val);
                          }
                        }}
                        className={`w-20 h-9 rounded-lg border-2 text-center text-xs font-black outline-none transition-all ${variant.stock <= 5 ? 'border-red-100 bg-red-50 text-red-600' :
                          variant.stock <= 20 ? 'border-amber-100 bg-amber-50 text-amber-600' :
                            'border-slate-100 bg-slate-50 text-[var(--admin-sidebar)]'
                          }`}
                      />
                      {updating === variant.id && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push(`/admin/variants/edit/${variant.id}`)} 
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => deleteVariant(variant.id)} 
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-8 py-20 text-center font-bold text-slate-300 uppercase tracking-[0.2em] text-[10px]">No inventory matches your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </div>
  );
}
