'use client';

import { useState, useEffect } from 'react';
import { Video, Plus, Trash2, Edit2, Play, Pause, Loader2, Link2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface VideoItem {
  id: number;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnail?: string;
  productId?: number;
  price?: number;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [productId, setProductId] = useState('');
  const [price, setPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/videos`)
      .then(r => r.json())
      .then(setVideos)
      .finally(() => setLoading(false));
  }, []);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setProductId('');
    setPrice('');
    setSortOrder('0');
    setIsActive(true);
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoUrl('');
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (v: VideoItem) => {
    setTitle(v.title);
    setDescription(v.description || '');
    setProductId(v.productId?.toString() || '');
    setPrice(v.price?.toString() || '');
    setSortOrder(v.sortOrder.toString());
    setIsActive(v.isActive);
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoUrl(v.videoUrl || '');
    setEditId(v.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId 
        ? `${API_URL}/api/videos/${editId}` 
        : `${API_URL}/api/videos`;
      const method = editId ? 'PUT' : 'POST';
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (productId) formData.append('productId', productId);
      if (price) formData.append('price', price);
      formData.append('sortOrder', sortOrder);
      formData.append('isActive', isActive.toString());
      if (videoUrl) formData.append('videoUrl', videoUrl);
      if (videoFile) formData.append('video', videoFile);
      if (thumbnailFile) formData.append('thumbnail', thumbnailFile);

      const res = await fetch(url, { method, body: formData });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error);

      if (editId) {
        setVideos(prev => prev.map(v => v.id === editId ? data : v));
      } else {
        setVideos(prev => [...prev, data].sort((a,b) => a.sortOrder - b.sortOrder));
      }
      resetForm();
    } catch (e: any) {
      alert(e.message);
    } finally { 
      setSubmitting(false); 
    }
  };

  const deleteVideo = async (id: number) => {
    if (!confirm('Delete this video story?')) return;
    await fetch(`${API_URL}/api/videos/${id}`, { method: 'DELETE' });
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  const toggleStatus = async (v: VideoItem) => {
    const formData = new FormData();
    formData.append('isActive', (!v.isActive).toString());
    
    const res = await fetch(`${API_URL}/api/videos/${v.id}`, {
      method: 'PUT',
      body: formData
    });
    const data = await res.json();
    setVideos(prev => prev.map(bv => bv.id === v.id ? data : bv));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Video Stories</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Manage the visual 'Shop by Video' homepage feed.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowForm(true); }}
          className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl"
        >
          <Plus size={20} className="text-[var(--admin-accent)]" /> New Video
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Video Title *</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Linked Product ID</label>
                <input type="number" value={productId} onChange={e => setProductId(e.target.value)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600" />
             </div>
             <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Short Description</label>
                <input value={description} onChange={e => setDescription(e.target.value)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Video File {editId && '(Keep existing)'}</label>
                <input type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-emerald-600" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">OR External Video URL</label>
                <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)} placeholder="https://example.com/video.mp4" className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Thumbnail Image * {editId && '(Leave blank to keep existing)'}</label>
                <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold outline-none focus:border-emerald-600" />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Displayed Price</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600" />
             </div>
             <div className="flex items-center gap-8">
                <div className="space-y-2">
                   <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Priority (Sort Order)</label>
                   <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-24 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-sm font-bold outline-none focus:border-emerald-600" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer pt-6">
                   <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-5 w-5 rounded-lg accent-emerald-600" />
                   <span className="text-xs font-black uppercase tracking-widest text-[var(--admin-sidebar)]">Active Feed</span>
                </label>
             </div>
             <div className="md:col-span-2 flex gap-4 pt-4">
                <button disabled={submitting} type="submit" className="h-14 px-10 bg-[var(--admin-sidebar)] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all flex items-center gap-3">
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />} {editId ? 'Update Video' : 'Upload & Publish'}
                </button>
                <button type="button" onClick={resetForm} className="h-14 px-8 border-2 border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
             </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center flex flex-col items-center gap-4">
             <Loader2 className="h-12 w-12 animate-spin text-slate-200" />
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Loading Video Library...</span>
          </div>
        ) : videos.map(video => (
          <div key={video.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all group flex flex-col">
            <div className="relative aspect-[9/16] bg-slate-900 overflow-hidden shrink-0">
               {video.thumbnail ? (
                 <img src={video.thumbnail} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt={video.title} />
               ) : (
                 <video src={video.videoUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
               )}
               <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-lg font-black text-white tracking-tight leading-tight">{video.title}</h3>
                  {video.price && <div className="text-amber-400 font-bold mt-1 text-sm">₹{video.price}</div>}
               </div>
               
               {/* Overlay Actions */}
               <div className="absolute top-4 right-4 flex flex-col gap-2 transition-all opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0">
                  <button onClick={() => handleEdit(video)} className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-blue-500 transition-all"><Edit2 size={16} /></button>
                  <button onClick={() => deleteVideo(video.id)} className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-all"><Trash2 size={16} /></button>
               </div>
               
               <div className="absolute top-4 left-4 h-8 w-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-xs font-black text-white">
                  #{video.sortOrder}
               </div>
            </div>
            
            <div className="p-4 flex flex-col flex-1 bg-white">
              <div className="flex items-center justify-between mb-4">
                 <button onClick={() => toggleStatus(video)} className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-all ${video.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                    {video.isActive ? <Play size={10} fill="currentColor" /> : <Pause size={10} fill="currentColor" />}
                    {video.isActive ? 'Live' : 'Hidden'}
                 </button>
                 
                 {video.productId && (
                   <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                     <Link2 size={10} /> ID: {video.productId}
                   </span>
                 )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
