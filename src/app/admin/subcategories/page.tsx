'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Tag, Search, Edit2, Trash2, Database, AlertCircle, Loader2, RefreshCw, LayoutList, ImageIcon
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import AdminPagination from '@/components/admin/AdminPagination';

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  imageUrl?: string;
  status: string;
  category?: { name: string };
  _count?: { products: number };
}

export default function AdminSubcategoriesPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSubcategories();
  }, [currentPage]);

  const fetchSubcategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/subcategories?page=${currentPage}&limit=10`);
      const data = await res.json();
      setSubcategories(data.subcategories || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error(err);
      addToast('Error', 'Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      const res = await fetch(`${API_URL}/api/subcategories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubcategories(subcategories.filter(s => s.id !== id));
        addToast('Success', 'Subcategory deleted successfully');
      } else {
        addToast('Error', 'Operation failed');
      }
    } catch (err) {
      addToast('Error', 'Failed to delete subcategory');
    }
  };

  const filteredSubcategories = subcategories.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20 bg-[#f8fafc] min-h-screen">

      {/* ─── HEADER SECTION ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 pt-8 border-b border-slate-200/50 pb-8 bg-white/50 backdrop-blur-md sticky top-0 z-30">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter  leading-none">Sub Categories Management</h2>
          {/* <p className="text-slate-400 font-medium text-sm mt-2">Architect and manage granular mapping tiers across your catalog.</p> */}
        </div>
        <button
          onClick={() => router.push('/admin/subcategories/new')}
          className="px-8 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs rounded-2xl flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-emerald-500/20 group hover:-translate-y-0.5"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          <span>Add Mapping</span>
        </button>
      </div>

      <div className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ─── SEARCH & LISTING MODULE (Now Full Span) ─────────────────── */}
        <div className="lg:col-span-12 space-y-6">

          {/* Responsive Global Filter */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200/60 shadow-xl shadow-slate-100/50 flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                placeholder="Search subcategories by label or parent category..."
                className="w-full h-16 pl-14 pr-6 rounded-2xl bg-slate-50/50 outline-none font-bold text-slate-900 focus:bg-white focus:ring-4 ring-slate-100 transition-all text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Central Records Matrix */}
          {loading ? (
            <div className="py-36 flex flex-col justify-center items-center gap-4 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                <RefreshCw size={24} className="text-emerald-600 animate-spin" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Synchronizing Records...</span>
            </div>
          ) : filteredSubcategories.length > 0 ? (
            <>
              <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subcategory & Identity</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Structural Parent</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Assigned SKU Count</th>
                        <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSubcategories.map(sub => (
                        <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors group">
                          <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                              {/* Dynamic visual icon fallback */}
                              <div className="h-12 w-12 rounded-2xl flex items-center justify-center overflow-hidden bg-slate-100 border border-slate-100 group-hover:border-emerald-200 transition-all relative shrink-0 shadow-sm">
                                {sub.imageUrl ? (
                                  <img src={sub.imageUrl} alt={sub.name} className="h-full w-full object-cover" />
                                ) : (
                                  <Tag size={18} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                                )}
                              </div>
                              <div>
                                <span className="text-sm font-black text-slate-900 block group-hover:text-emerald-700 transition-colors tracking-tight uppercase">{sub.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${sub.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-400 border border-slate-200'
                                    }`}>
                                    {sub.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 shadow-sm text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-wider">
                              <Database size={12} className="text-emerald-600" /> {sub.category?.name || 'Master Unmapped'}
                            </span>
                          </td>
                          <td className="px-10 py-6 text-center">
                            <div className="inline-flex items-center justify-center h-10 w-14 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all">
                              <span className="text-sm font-black text-slate-800 tabular-nums group-hover:text-emerald-700 transition-colors">{sub._count?.products || 0}</span>
                            </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => router.push(`/admin/subcategories/edit/${sub.id}`)}
                                className="h-11 px-4 flex items-center justify-center gap-2 bg-white hover:bg-slate-900 border border-slate-200 rounded-xl font-black uppercase text-[10px] tracking-wider text-slate-700 hover:text-white hover:border-slate-900 transition-all shadow-sm hover:shadow-md active:scale-95"
                              >
                                <Edit2 size={12} />
                                {/* <span>Edit</span> */}
                              </button>
                              <button
                                onClick={() => confirmDelete(sub.id)}
                                className="h-11 w-11 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-400 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all shadow-sm hover:shadow-lg active:scale-95"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-36 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200 shadow-inner flex flex-col items-center">
              <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-6">
                <LayoutList size={32} />
              </div>
              <h3 className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">No Granular Mappings Discovered</h3>
              <p className="text-xs text-slate-400 font-medium mt-2 mb-8">Expand your catalog architecture by deploying specialized subcategory buckets.</p>
              <button
                onClick={() => router.push('/admin/subcategories/new')}
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
              >
                Instantiate First Subcategory
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
