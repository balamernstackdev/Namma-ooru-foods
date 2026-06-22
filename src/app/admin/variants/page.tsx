'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, Loader2, Plus, Edit2, Trash2, ShoppingBag, Download } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminPagination from '@/components/admin/AdminPagination';

interface Variant {
  id: number;
  sku: string;
  name?: string;
  price: number;
  stock: number;
  productId: number;
  isActive: boolean;
  createdAt: string;
  product: { name: string; image?: string };
}

// Client-side media query hook to safely toggle mobile viewports without hydration mismatch
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return mounted ? matches : false;
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
  const itemsPerPage = 10;

  const isMobile = useMediaQuery('(max-width:767px)');

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const vRes = await fetch(`${API_URL}/api/variants?page=${currentPage}&limit=${itemsPerPage}`);
      const data = await vRes.json();
      setVariants(data.variants);
      setTotalPages(data.pages);
    } catch (err) {
      addToast('Error', 'Failed to fetch inventory data', 'error');
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
        addToast('Success', 'Stock level synchronized', 'success');
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
        addToast('Success', 'Variant removed', 'success');
      }
    } catch (err) {
      addToast('Error', 'Failed to delete variant', 'error');
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Product Name', 'SKU', 'Specification', 'Price', 'Stock', 'Status', 'Created'];
    const rows = filtered.map(v => [
      v.id,
      v.product?.name || '',
      v.sku || '',
      v.name || 'STANDARD',
      v.price,
      v.stock,
      v.isActive !== false ? 'Active' : 'Inactive',
      v.createdAt ? new Date(v.createdAt).toLocaleDateString('en-IN') : ''
    ]);
    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "variants_inventory.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Success', 'Inventory registry exported successfully', 'success');
  };

  const filtered = variants.filter(v =>
    (v.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (v.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative min-h-[70vh] w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 w-full">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Variants <span className="text-emerald-600 font-black">Management</span></h1>
        </div>
        <Link
          href="/admin/variants/new"
          className="h-14 px-8 rounded-2xl bg-emerald-600 !text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 no-underline w-full sm:w-auto text-center"
        >
          <Plus size={18} className="!text-white" /> New SKU Variant
        </Link>
      </div>

      <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden w-full">

        {/* RESPONSIVE FILTER SECTION */}
        <div className="p-5 sm:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center gap-4 bg-slate-50/20 w-full">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder="Search by SKU or Product name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white rounded-xl pl-11 pr-4 text-xs font-bold outline-none border border-slate-100 focus:border-blue-500 transition-all shadow-sm"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto md:ml-auto">
            <div className="flex items-center justify-center gap-2 px-4 h-12 bg-amber-50 rounded-xl border border-amber-100 w-full sm:w-auto shrink-0">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 whitespace-nowrap">
                {variants.filter(v => v.stock < 10).length} Low Stock Alerts
              </span>
            </div>

            <button
              onClick={handleExport}
              className="h-12 px-6 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-black uppercase tracking-widest text-slate-600 flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm w-full sm:w-auto shrink-0 cursor-pointer"
            >
              <Download size={14} />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* CONDITIONALLY RENDER MOBILE CARD GRID VS DESKTOP/TABLET TABLE */}
        {isMobile ? (
          /* Mobile View - Cards List */
          <div className="grid gap-4 p-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {loading ? (
              <div className="py-20 text-center col-span-full"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center col-span-full font-bold text-slate-300 uppercase tracking-[0.2em] text-[10px]">No inventory matches your search.</div>
            ) : (
              filtered.map(variant => (
                <div key={variant.id} className="bg-white border border-[#E5E7EB] rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col gap-3 text-left">
                  {/* Product Info Row */}
                  <div className="flex gap-4">
                    <div className="h-16 w-16 rounded-xl bg-slate-50 overflow-hidden border border-slate-100 shrink-0">
                      {variant.product.image ? (
                        <img src={variant.product.image} className="w-full h-full object-cover" alt={variant.product.name} />
                      ) : (
                        <ShoppingBag className="h-full w-full p-3 text-slate-200" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <h3 className="text-xs font-black text-[var(--admin-sidebar)] leading-tight">{variant.product.name}</h3>
                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-1">SKU: {variant.sku}</span>
                    </div>
                  </div>

                  {/* Specification & Details */}
                  <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-xs border-t border-slate-50 pt-3">
                    <div>
                      <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Variant</span>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg inline-block mt-1">
                        {variant.name || 'STANDARD'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Price</span>
                      <span className="text-sm font-black text-blue-600 block mt-1">₹{variant.price.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Stock Balance</span>
                      <div className="flex items-center gap-2 mt-1">
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
                    </div>
                    <div>
                      <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Status</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border mt-1 ${variant.isActive !== false
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                        }`}>
                        {variant.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-[#6B7280] uppercase tracking-wider block font-bold">Created</span>
                      <span className="text-[10px] font-bold text-slate-500 block mt-1">
                        {variant.createdAt ? new Date(variant.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '05-Jun-2026'}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100">
                    <Link
                      href={`/admin/variants/edit/${variant.id}`}
                      className="h-11 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all no-underline cursor-pointer"
                    >
                      <Edit2 size={12} /> Edit Variant
                    </Link>
                    <button
                      onClick={() => deleteVariant(variant.id)}
                      className="h-11 rounded-xl bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop/Tablet View - Traditional Table */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left table-auto min-w-[1000px] admin-data-table">
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
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-tighter mt-1">{variant.sku}</span>
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
                        <Link
                          href={`/admin/variants/edit/${variant.id}`}
                          className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white transition-all no-underline"
                        >
                          <Edit2 size={16} />
                        </Link>
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
        )}

        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
