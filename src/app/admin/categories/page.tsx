'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Trash2, Edit2, Search, ImageIcon, Loader2, Upload } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  description?: string;
  image?: string;
  _count?: { products: number };
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', image: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/admin-ops/categories`)
      .then(r => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_URL}/api/upload/image`, {
        method: 'POST',
        body: uploadData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prev => ({ ...prev, image: data.url }));
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId 
        ? `${API_URL}/api/admin-ops/categories/${editId}` 
        : `${API_URL}/api/admin-ops/categories`;
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (editId) {
        setCategories(prev => prev.map(c => c.id === editId ? data : c));
      } else {
        setCategories(prev => [data, ...prev]);
      }
      setShowForm(false);
      setFormData({ name: '', description: '', image: '' });
      setEditId(null);
    } finally { setSubmitting(false); }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm('Delete this category? This will not delete products but may affect site navigation.')) return;
    await fetch(`${API_URL}/api/admin-ops/categories/${id}`, { method: 'DELETE' });
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setFormData({ name: cat.name, description: cat.description || '', image: cat.image || '' });
    setShowForm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Store Categories</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">{categories.length} categories defining the store structure.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditId(null); setFormData({ name: '', description: '', image: '' }); }}
          className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl"
        >
          <Plus size={20} className="text-[var(--admin-accent)]" /> New Category
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Category Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
             </div>
             
             <div className="space-y-4">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Visual Identity</label>
                <div 
                   onClick={() => !isUploading && fileInputRef.current?.click()}
                   className={`h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-4 group cursor-pointer hover:border-[var(--admin-accent)]/50 transition-all overflow-hidden relative shadow-inner ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                >
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload} 
                   />
                   {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                         <Loader2 className="h-8 w-8 text-[var(--admin-accent)] animate-spin" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-[var(--admin-accent)]">Uploading...</span>
                      </div>
                   ) : (formData.image && formData.image.trim() !== '') ? (
                      <img src={formData.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt="Category" />
                   ) : (
                      <>
                         <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center shadow-md text-slate-300">
                            <Upload size={20} />
                         </div>
                         <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Click to Upload Asset</span>
                      </>
                   )}
                </div>
             </div>

             <div className="md:col-span-2 space-y-4">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
             </div>
             <div className="flex gap-4">
                <button disabled={submitting} type="submit" className="h-14 px-8 bg-[var(--admin-sidebar)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-slate-900/20">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {editId ? 'Update Category' : 'Create Category'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="h-14 px-8 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-colors">Cancel</button>
             </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
           <thead>
              <tr className="bg-slate-50/50">
                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Category</th>
                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Inventory</th>
                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Description</th>
                 <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></td></tr>
              ) : categories.map(cat => (
                <tr key={cat.id} className="hover:bg-slate-50/30 transition-all group">
                   <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                         <div className="h-10 w-10 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 shrink-0">
                            {cat.image ? <img src={cat.image} className="w-full h-full object-cover" /> : <Layers className="h-5 w-5 text-slate-200" />}
                         </div>
                         <span className="text-sm font-black text-[var(--admin-sidebar)]">{cat.name}</span>
                      </div>
                   </td>
                   <td className="px-8 py-5">
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                         {cat._count?.products || 0} SKU Count
                      </span>
                   </td>
                   <td className="px-8 py-5 max-w-sm truncate text-xs text-slate-400 font-medium">
                      {cat.description || '—'}
                   </td>
                   <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => startEdit(cat)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-[var(--admin-sidebar)] hover:text-white transition-all"><Edit2 size={14} /></button>
                        <button onClick={() => deleteCategory(cat.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
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
