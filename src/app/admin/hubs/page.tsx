'use client';

import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';
import { Search, Edit2, Trash2, Loader2, Plus, MapPin, Building2, CheckCircle2, Upload, Image as ImageIcon } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface HeadVendor {
  id: number;
  name: string;
  slug: string;
  banner?: string;
  logo?: string;
  sortOrder?: number;
  createdAt: string;
  _count?: { subVendors: number };
}

export default function AdminHubsPage() {
  const { addToast } = useToast();
  const [hubs, setHubs] = useState<HeadVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHub, setEditingHub] = useState<HeadVendor | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', logo: '', banner: '', sortOrder: 999 });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchHubs();
  }, []);

  const fetchHubs = () => {
    setLoading(true);
    fetch(`${API_URL}/api/admin-ops/hubs`)
      .then(r => r.json())
      .then(data => {
        setHubs(Array.isArray(data) ? data : data.headVendors || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to permanently delete this Regional Hub? It may break associated brands.')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin-ops/hubs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHubs(prev => prev.filter(h => h.id !== id));
        addToast('Success', 'Hub deleted successfully');
      } else {
        addToast('Error', 'Failed to delete Hub');
      }
    } catch (err) {
      addToast('Error', 'Failed to delete Hub');
    }
  };

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
        setFormData(prev => ({ ...prev, logo: data.url }));
        addToast('Success', 'Logo uploaded successfully');
      } else {
        addToast('Error', 'Image upload failed');
      }
    } catch (err) {
      addToast('Error', 'Server connecting issue during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingHub ? 'PUT' : 'POST';
      const url = editingHub ? `${API_URL}/api/admin-ops/hubs/${editingHub.id}` : `${API_URL}/api/admin-ops/hubs`;

      const generatedSlug = (editingHub && formData.slug === editingHub.slug && formData.name === editingHub.name)
        ? editingHub.slug
        : formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          slug: generatedSlug
        })
      });

      if (res.ok) {
        addToast('Success', `Hub ${editingHub ? 'updated' : 'created'} successfully`);
        setIsModalOpen(false);
        fetchHubs();
      } else {
        addToast('Error', 'Failed to save Hub');
      }
    } catch (err) {
      addToast('Error', 'Failed to save Hub');
    }
  };

  const openModal = (hub?: HeadVendor) => {
    if (hub) {
      setEditingHub(hub);
      setFormData({ name: hub.name, slug: hub.slug, logo: hub.logo || '', banner: hub.banner || '', sortOrder: hub.sortOrder !== undefined ? hub.sortOrder : 999 });
    } else {
      setEditingHub(null);
      setFormData({ name: '', slug: '', logo: '', banner: '', sortOrder: 999 });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Service Regions</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage Head Vendors that group independent brands together.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => openModal()}
            className="h-14 px-8 rounded-2xl bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <Plus size={18} className="text-white" /> Create New Hub
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-4 bg-slate-50/20">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input
              type="text"
              placeholder="Search hubs by name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-12 bg-white rounded-xl pl-14 pr-4 text-xs font-bold outline-none border border-slate-100 focus:border-emerald-500 transition-all shadow-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Hub Identity</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Slug</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Order</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Brands</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={4} className="px-8 py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-slate-200" /></td></tr>
              ) : hubs.filter(h => h.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(hub => (
                <tr key={hub.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center p-2">
                        {hub.logo ? (
                          <img src={hub.logo} alt={hub.name} className="object-contain h-full w-full" />
                        ) : (
                          <Building2 className="text-slate-300 h-6 w-6" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[14px] font-black text-slate-900 leading-tight uppercase">{hub.name}</span>
                        <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-widest mt-1 flex items-center gap-1"><MapPin size={10} /> Regional Collective</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      /{hub.slug}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">
                    {hub.sortOrder !== undefined && hub.sortOrder !== 999 ? hub.sortOrder : '-'}
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 inline-flex items-center gap-1">
                      <CheckCircle2 size={12} /> {hub._count?.subVendors || 0} Brands Attached
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openModal(hub)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(hub.id)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-red-300 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && hubs.length === 0 && (
                <tr><td colSpan={4} className="px-8 py-20 text-center font-bold text-slate-300 uppercase tracking-widest text-xs">No Service Regions Found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-6">{editingHub ? 'Edit Hub' : 'Create Regional Hub'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Hub Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold border border-slate-200 focus:border-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, sortOrder: val === '' ? '' as unknown as number : parseInt(val) });
                  }}
                  className="w-full h-12 bg-slate-50 rounded-xl px-4 text-sm font-bold border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Hub Logo</label>
                <div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`relative h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 group cursor-pointer hover:border-emerald-500/50 transition-all overflow-hidden ${isUploading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                  ) : formData.logo ? (
                    <div className="relative w-full h-full group">
                      <img src={formData.logo} className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" alt="Hub Logo" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-[2px]">
                        <Upload size={18} className="text-white" />
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-all">
                        <ImageIcon size={20} />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Click to Upload Logo</span>
                      <span className="text-[7.5px] font-bold uppercase tracking-widest text-slate-300">Recommended: Square format</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 mt-8 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-600 font-bold uppercase tracking-widest text-xs hover:bg-slate-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 h-14 rounded-2xl bg-emerald-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">{editingHub ? 'Save Changes' : 'Create Hub'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
