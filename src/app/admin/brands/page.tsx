'use client';

import { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, Edit2, Search, ImageIcon, Globe, Loader2, User } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Brand {
  id: number;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  userId?: number;
  _count?: { products: number };
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', logo: '', website: '', userId: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchBrands();
    fetchVendors();
  }, []);

  const fetchBrands = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/brands`)
      .then(r => r.json())
      .then(setBrands)
      .finally(() => setLoading(false));
  };

  const fetchVendors = () => {
    fetch(`${API_URL}/api/admin-ops/users`)
      .then(r => r.json())
      .then(data => setUsers(data.filter((u: any) => u.role === 'VENDOR')))
      .catch(() => {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId 
        ? `${API_URL}/api/admin-ops/brands/${editId}` 
        : `${API_URL}/api/admin-ops/brands`;
      const method = editId ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      
      if (editId) {
        setBrands(prev => prev.map(b => b.id === editId ? data : b));
      } else {
        setBrands(prev => [data, ...prev]);
      }
      setShowForm(false);
      setFormData({ name: '', description: '', logo: '', website: '', userId: '' });
      setEditId(null);
    } catch (err) {
      alert('Error saving brand');
    } finally { setSubmitting(false); }
  };

  const deleteBrand = async (id: number) => {
    if (!confirm('Delete this brand? This may affect products linked to it.')) return;
    await fetch(`${API_URL}/api/admin-ops/brands/${id}`, { method: 'DELETE' });
    setBrands(prev => prev.filter(b => b.id !== id));
  };

  const startEdit = (brand: Brand) => {
    setEditId(brand.id);
    setFormData({ 
      name: brand.name, 
      description: brand.description || '', 
      logo: brand.logo || '', 
      website: brand.website || '',
      userId: brand.userId?.toString() || ''
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Brand Partners</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">{brands.length} heritage brands registered.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); setEditId(null); setFormData({ name: '', description: '', logo: '', website: '', userId: '' }); }}
          className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl"
        >
          <Plus size={20} className="text-[var(--admin-accent)]" /> Add Brand
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10 animate-in slide-in-from-top-4 duration-500">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Brand Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Assigned Reseller (Owner)</label>
                <select value={formData.userId} onChange={e => setFormData({...formData, userId: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)] appearance-none">
                   <option value="">No Owner (Generic Brand)</option>
                   {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                   ))}
                </select>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Website URL</label>
                <input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Logo Image URL</label>
                <input value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
             </div>
             <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Description</label>
                <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:border-[var(--admin-accent)]" />
             </div>
             <div className="flex gap-4">
                <button disabled={submitting} type="submit" className="h-14 px-8 bg-[var(--admin-sidebar)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {editId ? 'Update Brand' : 'Create Brand'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="h-14 px-8 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
             </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></div>
        ) : brands.map(brand => (
          <div key={brand.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 hover:shadow-xl hover:shadow-slate-200/40 transition-all group relative overflow-hidden">
            {brand.userId && (
               <div className="absolute top-0 right-0 p-4">
                  <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm" title="Verified Reseller Owned">
                     <User size={14} />
                  </div>
               </div>
            )}
            <div className="flex items-start justify-between mb-6">
              <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                {brand.logo ? <img src={brand.logo} className="w-full h-full object-contain p-2" /> : <ImageIcon className="text-slate-200" />}
              </div>
              <div className="flex gap-2 transition-opacity">
                <button onClick={() => startEdit(brand)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-[var(--admin-sidebar)] hover:text-white transition-all"><Edit2 size={14} /></button>
                <button onClick={() => deleteBrand(brand.id)} className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-50 text-red-300 hover:bg-red-500 hover:text-white transition-all"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="text-lg font-black text-[var(--admin-sidebar)] mb-2">{brand.name}</h3>
            <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-6">{brand.description || 'No description provided.'}</p>
            
            <div className="flex items-center justify-between border-t border-slate-50 pt-6 mt-6">
              <div className="flex items-center gap-2">
                <Globe size={14} className="text-slate-300" />
                <span className="text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{brand.website || 'No website'}</span>
              </div>
              <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {brand._count?.products || 0} Products
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
