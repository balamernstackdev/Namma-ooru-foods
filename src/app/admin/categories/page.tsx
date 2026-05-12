'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Tag,
  AlignLeft,
  Search,
  Edit2,
  ArrowRight,
  MoreVertical,
  ChevronRight,
  Database,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_URL } from '@/lib/api';
import PremiumLoader from '@/components/ui/PremiumLoader';
import AdminPagination from '@/components/admin/AdminPagination';

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories(currentPage);
  }, [currentPage]);

  const fetchCategories = (page: number) => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/categories?page=${page}&limit=${itemsPerPage}&all=true`)
      .then(r => r.json())
      .then(data => {
        setCategories(data.categories || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    try {
      const res = await fetch(`${API_URL}/api/admin-ops/categories/${categoryToDelete}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setCategories(categories.filter(c => c.id !== categoryToDelete));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (err) {
      alert('Error deleting category');
    } finally {
      setCategoryToDelete(null);
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* ─── HEADER ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 pt-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">CATEGORY MANAGEMENT</h2>
          <div className="flex items-center gap-3 mt-3">
          </div>
        </div>
        <Link
          href="/admin/categories/new"
          className="h-14 px-8 rounded-2xl bg-emerald-600 !text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 no-underline"
        >
          <Plus size={18} className="!text-white" /> New Category
        </Link>
      </div>

      {/* ─── SEARCH & STATS ───────────────────────────────────────────── */}
      <div className="px-6">
        <div className="bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search catalog sections..."
              className="w-full h-16 pl-16 pr-6 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 outline-none font-bold text-slate-900 transition-all text-sm"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); }}
            />
          </div>
          <div className="hidden lg:flex items-center gap-8 px-8 border-l border-slate-100">
            <div className="text-center">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Items</p>
              <p className="text-lg font-black text-slate-900 leading-none">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CATEGORY LIST (LIST WISE VIEW) ───────────────────────────── */}
      <div className="px-6 space-y-4">
        {loading ? (
          <div className="py-32">
            <PremiumLoader fullScreen={false} />
          </div>
        ) : filteredCategories.length > 0 ? (
          <div className="space-y-4">
            {filteredCategories.map(cat => (
              <div
                key={cat.id}
                className="group bg-white rounded-3xl border border-slate-100 p-5 flex items-center gap-6 hover:border-blue-100 hover:shadow-xl hover:shadow-slate-200/40 transition-all"
              >
                {/* Visual Identity */}
                <div className="h-20 w-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-500">
                  {cat.image ? (
                    <img src={cat.image} className="w-full h-full object-cover" />
                  ) : (
                    <Tag className="text-slate-200" size={24} />
                  )}
                </div>

                {/* Info Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-base font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                      {cat.name}
                    </h3>
                    {cat.parent && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 rounded-full">
                        <Database size={10} className="text-blue-500" />
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">
                          {cat.parent.name} Sub-category
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-bold line-clamp-1 max-w-2xl">
                    {cat.description || 'No operational metadata provided for this catalog section.'}
                  </p>
                </div>

                {/* Stats & Actions */}
                <div className="flex items-center gap-10 shrink-0 pr-4">
                  <div className="hidden sm:flex flex-col items-end">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 text-right">Products</p>
                    <div className="flex items-center gap-2">
                      <AlignLeft size={12} className="text-slate-300" />
                      <span className="text-sm font-black text-slate-900">{cat._count?.products || 0}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/categories/edit/${cat.id}`}
                      className="h-12 px-6 rounded-xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 group/btn no-underline"
                    >
                      <Edit2 size={14} className="group-hover/btn:rotate-12 transition-transform" />
                      {/* Edit */}
                    </Link>

                    <button
                      onClick={() => setCategoryToDelete(cat.id)}
                      title="Delete Category"
                      className="h-12 w-12 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => window.open(`/categories/${cat.id}`, '_blank')}
                      title="View on Site"
                      className="h-12 w-12 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
            <Search size={48} className="mx-auto text-slate-100 mb-6" />
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching results</h3>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2">Adjust your search filters to find what you're looking for</p>
          </div>
        )}
      </div>

      {/* ─── PAGINATION ───────────────────────────────────────────────── */}
      <div className="px-6">
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      {/* ─── CUSTOM DELETE MODAL ────────────────────────────────────────── */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">Delete Category?</h3>
            <p className="text-xs font-bold text-slate-400 mb-8 max-w-[250px]">
              This action cannot be undone. All associated products might lose their primary categorization.
            </p>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 h-14 rounded-2xl bg-slate-50 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 h-14 rounded-2xl bg-red-500 text-white font-black text-[11px] uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
