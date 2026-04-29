'use client';

import { useState, useEffect, useRef } from 'react';
import { ImageIcon, Plus, Trash2, Edit2, Search, Calendar, Play, Pause, Loader2, Upload } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface Banner {
   id: number;
   title: string;
   subtitle?: string;
   tagline?: string;
   image: string;
   link?: string;
   isActive: boolean;
   startDate?: string;
   endDate?: string;
   sortOrder: number;
}


export default function AdminBannersPage() {
   const [banners, setBanners] = useState<Banner[]>([]);
   const [loading, setLoading] = useState(true);
   const [showForm, setShowForm] = useState(false);
   const [editId, setEditId] = useState<number | null>(null);
   const [formData, setFormData] = useState({ title: '', subtitle: '', tagline: '', image: '', link: '', isActive: true, sortOrder: 0, startDate: '', endDate: '' });
   const [submitting, setSubmitting] = useState(false);
   const [uploading, setUploading] = useState(false);
   const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      fetch(`${API_URL}/api/admin-ops/banners`)
         .then(r => r.json())
         .then(data => setBanners(Array.isArray(data) ? data : []))
         .catch(err => console.error('Fetch error:', err))
         .finally(() => setLoading(false));
   }, []);

   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
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
         } else {
            alert('Upload failed. Please check server configuration.');
         }
      } catch (error) {
         alert('Network error while uploading image.');
      } finally {
         setUploading(false);
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
         const url = editId
            ? `${API_URL}/api/admin-ops/banners/${editId}`
            : `${API_URL}/api/admin-ops/banners`;
         const method = editId ? 'PUT' : 'POST';

         const payload = {
            ...formData,
            sortOrder: parseInt(formData.sortOrder.toString()) || 0,
            startDate: formData.startDate || null,
            endDate: formData.endDate || null
         };

         const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
         });
         const data = await res.json();

         if (editId) {
            setBanners(prev => prev.map(b => b.id === editId ? data : b));
         } else {
            setBanners(prev => [data, ...prev]);
         }
         setShowForm(false);
         setEditId(null);
         setFormData({ title: '', subtitle: '', tagline: '', image: '', link: '', isActive: true, sortOrder: 0, startDate: '', endDate: '' });
      } finally { setSubmitting(false); }
   };

   const deleteBanner = async (id: number) => {
      if (!confirm('Delete this banner campaign?')) return;
      await fetch(`${API_URL}/api/admin-ops/banners/${id}`, { method: 'DELETE' });
      setBanners(prev => prev.filter(b => b.id !== id));
   };

   const toggleStatus = async (banner: Banner) => {
      const res = await fetch(`${API_URL}/api/admin-ops/banners/${banner.id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ ...banner, isActive: !banner.isActive })
      });
      const data = await res.json();
      setBanners(prev => prev.map(b => b.id === banner.id ? data : b));
   };

   return (
      <div className="space-y-8 animate-in fade-in duration-700">
         <div className="flex items-center justify-between">
            <div>
               <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Campaign Banners</h2>
               <p className="text-slate-400 font-medium text-sm mt-1">Manage seasonal promotions and hero section visuals.</p>
            </div>
            <button
               onClick={() => { setShowForm(!showForm); setEditId(null); setFormData({ title: '', subtitle: '', tagline: '', image: '', link: '', isActive: true, sortOrder: 0, startDate: '', endDate: '' }); }}
               className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl"
            >
               <Plus size={20} className="text-[var(--admin-accent)]" /> New Campaign
            </button>
         </div>

         {showForm && (
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
               <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Campaign Title (Heading)</label>
                     <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Tagline (Small Badge)</label>
                     <input value={formData.tagline} onChange={e => setFormData({ ...formData, tagline: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" placeholder="e.g. Fresh from Local Farms" />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Campaign Subtitle (Description)</label>
                     <textarea value={formData.subtitle} onChange={e => setFormData({ ...formData, subtitle: e.target.value })} className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-2xl p-5 text-sm font-bold outline-none focus:border-amber-400 resize-none" placeholder="Enter a compelling description for this campaign..." />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Destination Link (URL)</label>
                     <input value={formData.link} onChange={e => setFormData({ ...formData, link: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" />
                  </div>

                  <div className="md:col-span-2 space-y-4">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Campaign Imagery</label>
                     <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`aspect-[21/9] w-full rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-amber-400 transition-all overflow-hidden relative ${uploading ? 'opacity-50' : ''}`}
                     >
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        {uploading ? (
                           <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                        ) : (formData.image && formData.image.trim() !== '') ? (
                           <img src={formData.image || undefined} className="w-full h-full object-cover" alt="Preview" />
                        ) : (
                           <>
                              <Upload className="text-slate-300" size={32} />
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Banner Asset</span>
                           </>
                        )}
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Manual Image URL (Optional)</label>
                        <input value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" placeholder="https://..." />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Start Date</label>
                     <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">End Date</label>
                     <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" />
                  </div>
                  <div className="flex items-center gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Priority (Sort Order)</label>
                        <input type="number" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })} className="w-24 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-amber-400" />
                     </div>
                     <label className="flex items-center gap-3 cursor-pointer pt-6">
                        <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="h-5 w-5 rounded-lg accent-amber-500" />
                        <span className="text-xs font-black uppercase tracking-widest text-[var(--admin-sidebar)]">Active Campaign</span>
                     </label>
                  </div>
                  <div className="md:col-span-2 flex gap-4 pt-4">
                     <button disabled={submitting} type="submit" className="h-14 px-10 bg-[var(--admin-sidebar)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-3">
                        {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {editId ? 'Update Campaign' : 'Launch Campaign'}
                     </button>
                     <button type="button" onClick={() => setShowForm(false)} className="h-14 px-8 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
                  </div>
               </form>
            </div>
         )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {loading ? (
               <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
                  <Loader2 className="h-12 w-12 animate-spin text-slate-200" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Synchronizing Campaigns...</span>
               </div>
            ) : Array.isArray(banners) && banners.map(banner => (
               <div key={banner.id} className="bg-white rounded-[3.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-slate-200/40 transition-all group">
                  <div className="aspect-[21/9] bg-slate-100 relative group overflow-hidden">
                     {(banner.image && banner.image.trim() !== '') ? <img src={banner.image || undefined} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" /> : <ImageIcon className="absolute inset-0 m-auto h-12 w-12 text-slate-200" />}
                     <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
                        <h3 className="text-xl font-black text-white tracking-tight">{banner.title}</h3>
                        <p className="text-[10px] font-mono text-white/60 truncate">{banner.link || 'Internal Link'}</p>
                     </div>
                     <div className="absolute top-6 right-6 flex gap-2 transition-all translate-y-0 group-hover:translate-y-0">
                        <button onClick={() => {
                           setEditId(banner.id);
                           setFormData({
                              title: banner.title || '',
                              subtitle: banner.subtitle || '',
                              tagline: banner.tagline || '',
                              image: banner.image || '',
                              link: banner.link || '',
                              isActive: banner.isActive,
                              sortOrder: banner.sortOrder,
                              startDate: banner.startDate?.split('T')[0] || '',
                              endDate: banner.endDate?.split('T')[0] || ''
                           });
                           setShowForm(true);
                        }} className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-500 transition-all shadow-xl"><Edit2 size={16} /></button>
                        <button onClick={() => deleteBanner(banner.id)} className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-all shadow-xl"><Trash2 size={16} /></button>
                     </div>
                  </div>
                  <div className="p-8 flex items-center justify-between">
                     <div className="flex gap-4 items-center">
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Scheduling</span>
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                              <Calendar size={14} className="text-slate-300" />
                              {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'Immediate'} → {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'Forever'}
                           </div>
                        </div>
                        <div className="h-8 w-px bg-slate-100 mx-2" />
                        <div className="flex flex-col">
                           <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Status</span>
                           <button onClick={() => toggleStatus(banner)} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border transition-all ${banner.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                              {banner.isActive ? <Play size={10} fill="currentColor" /> : <Pause size={10} fill="currentColor" />}
                              {banner.isActive ? 'Live' : 'Paused'}
                           </button>
                        </div>
                     </div>
                     <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-300">
                        #{banner.sortOrder}
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>
   );
}
