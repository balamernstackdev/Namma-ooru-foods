'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus, Tag, Search, Edit2, Trash2, Database, AlertCircle, Save, X, Loader2, RefreshCw
} from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import AdminPagination from '@/components/admin/AdminPagination';

interface Subcategory {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  status: string;
  category?: { name: string };
  _count?: { products: number };
}

export default function AdminSubcategoriesPage() {
  const { addToast } = useToast();
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Subcategory>>({ name: '', categoryId: 0, status: 'ACTIVE' });
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json();
      const parentCats = (data.categories || []).filter((c: any) => !c.parentId);
      setCategories(parentCats);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId) return addToast('Error', 'Name and Category are required');
    
    setIsSubmitting(true);
    try {
      const url = editId ? `${API_URL}/api/subcategories/${editId}` : `${API_URL}/api/subcategories`;
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-')
        })
      });
      
      if (res.ok) {
        addToast('Success', `Subcategory ${editId ? 'updated' : 'created'} successfully`);
        fetchSubcategories();
        resetForm();
      } else {
        addToast('Error', 'Operation failed');
      }
    } catch (err) {
      addToast('Error', 'Server Error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;
    try {
      const res = await fetch(`${API_URL}/api/subcategories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubcategories(subcategories.filter(s => s.id !== id));
        addToast('Success', 'Subcategory deleted');
      }
    } catch (err) {
      addToast('Error', 'Failed to delete subcategory');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', categoryId: 0, status: 'ACTIVE' });
    setEditId(null);
  };

  const openEdit = (sub: Subcategory) => {
    setFormData({ name: sub.name, categoryId: sub.categoryId, status: sub.status });
    setEditId(sub.id);
    // Scroll window to top slightly on mobile if they select edit
    if(window.innerWidth < 1024) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredSubcategories = subcategories.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      {/* ─── HEADER ───────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-6 pt-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">SUBCATEGORIES</h2>
          <p className="text-slate-400 font-medium text-sm mt-2">Manage precise product groupings mapped to master categories.</p>
        </div>
      </div>

      <div className="px-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ─── INLINE FORM (Left Column) ───────────────────────────────────────────── */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-2">
                {editId ? <Edit2 size={18} className="text-blue-500" /> : <Plus size={18} className="text-emerald-500" />}
                {editId ? 'Update Entry' : 'Add Mapping'}
              </h3>
              {editId && (
                <button 
                  onClick={resetForm} 
                  className="h-8 px-3 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Parent Category</label>
                <select 
                  required
                  value={formData.categoryId || ''} 
                  onChange={e => setFormData({...formData, categoryId: Number(e.target.value)})}
                  className="w-full h-14 px-6 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white text-slate-900 font-bold text-sm transition-all appearance-none outline-none shadow-sm"
                >
                  <option value="" disabled>Select Master Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Subcategory Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name || ''} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full h-14 px-6 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white text-slate-900 font-bold text-sm shadow-sm transition-all outline-none"
                  placeholder="e.g. Dosa Flour"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Visibility Status</label>
                <select 
                  value={formData.status || 'ACTIVE'} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full h-14 px-6 rounded-2xl border border-slate-200 focus:border-blue-500 bg-white text-slate-900 font-bold text-sm appearance-none outline-none shadow-sm transition-all"
                >
                  <option value="ACTIVE">Active (Visible)</option>
                  <option value="INACTIVE">Inactive (Hidden)</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className={`w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 text-white ${editId ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}`}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editId ? 'Update Subcategory' : 'Save Subcategory'}
              </button>
            </form>
          </div>
        </div>

        {/* ─── LISTING DATA (Right Column) ───────────────────────────────────────────── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Search Bar */}
          <div className="bg-white rounded-[2rem] p-3 border border-slate-200/60 shadow-sm flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input
                type="text"
                placeholder="Search catalog mappings..."
                className="w-full h-14 pl-14 pr-6 rounded-xl bg-slate-50/50 outline-none font-bold text-slate-900 transition-all text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Listing Table */}
          {loading ? (
            <div className="py-32 flex justify-center items-center gap-3 bg-white rounded-[2.5rem] border border-slate-100">
              <RefreshCw size={24} className="text-emerald-500 animate-spin" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Inventory Map...</span>
            </div>
          ) : filteredSubcategories.length > 0 ? (
            <>
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Subcategory</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Live SKU</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredSubcategories.map(sub => (
                        <tr key={sub.id} className={`hover:bg-slate-50/80 transition-colors ${editId === sub.id ? 'bg-emerald-50/30' : ''}`}>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${editId === sub.id ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                <Tag size={14} />
                              </div>
                              <div>
                                <span className="text-[13px] font-black text-slate-900 block">{sub.name}</span>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${sub.status === 'ACTIVE' ? 'text-emerald-500' : 'text-slate-400'}`}>{sub.status}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                              <Database size={10} /> {sub.category?.name || 'Unmapped'}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="text-sm font-black text-slate-900 tabular-nums">{sub._count?.products || 0}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => openEdit(sub)} className={`h-9 w-9 flex items-center justify-center rounded-xl transition-all ${editId === sub.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white'}`}>
                                <Edit2 size={14} />
                              </button>
                              <button onClick={() => confirmDelete(sub.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-600 hover:text-white transition-all">
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
                <div className="flex justify-center mt-6">
                  <AdminPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
              <AlertCircle size={48} className="mx-auto text-slate-200 mb-6" />
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">No Results Found</h3>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
