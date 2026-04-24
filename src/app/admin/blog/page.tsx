'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface BlogPost { id: number; slug: string; title: string; excerpt?: string; isPublished: boolean; publishedAt?: string; createdAt: string; tags: string[]; }

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ slug: '', title: '', excerpt: '', body: '', image: '', tags: '', isPublished: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/blog/admin/all`)
      .then(r => r.json()).then(setPosts).finally(() => setLoading(false));
  }, []);

  const autoSlug = (title: string) => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError('');
    const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
    try {
      const res = editId
        ? await fetch(`${API_URL}/api/blog/admin/${editId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
        : await fetch(`${API_URL}/api/blog/admin`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (editId) {
        setPosts(prev => prev.map(p => p.id === editId ? data : p));
      } else {
        setPosts(prev => [data, ...prev]);
      }
      setShowForm(false); setEditId(null);
      setForm({ slug: '', title: '', excerpt: '', body: '', image: '', tags: '', isPublished: false });
    } catch (err: any) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  const startEdit = (post: BlogPost) => {
    setEditId(post.id);
    setForm({ slug: post.slug, title: post.title, excerpt: post.excerpt || '', body: '', image: '', tags: post.tags.join(', '), isPublished: post.isPublished });
    setShowForm(true);
  };

  const deletePost = async (id: number) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`${API_URL}/api/blog/admin/${id}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const togglePublish = async (post: BlogPost) => {
    const res = await fetch(`${API_URL}/api/blog/admin/${post.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...post, isPublished: !post.isPublished })
    });
    const data = await res.json();
    setPosts(prev => prev.map(p => p.id === post.id ? data : p));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Blog Manager</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">{posts.filter(p => p.isPublished).length} published · {posts.filter(p => !p.isPublished).length} drafts</p>
        </div>
        <button id="create-post-btn" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ slug: '', title: '', excerpt: '', body: '', image: '', tags: '', isPublished: false }); }}
          className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl">
          <Plus size={20} className="text-[var(--admin-accent)]" /> New Article
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-10">
          <h3 className="text-sm font-black text-[var(--admin-sidebar)] uppercase tracking-widest mb-8">{editId ? 'Edit Article' : 'New Article'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Title *</label>
              <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value, slug: p.slug || autoSlug(e.target.value) }))}
                placeholder="The Story of Cold-Pressed Oils..." required
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Slug *</label>
              <input type="text" value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} required
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm font-mono text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Cover Image URL</label>
              <input type="text" value={form.image} onChange={e => setForm(p => ({ ...p, image: e.target.value }))} placeholder="/blog/article-hero.jpg"
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Excerpt</label>
              <textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={2} placeholder="Brief summary of the article..."
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Body Content * (HTML/Markdown supported)</label>
              <textarea value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} rows={10} required placeholder="Write your article here..."
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all resize-none font-mono" />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Tags (comma-separated)</label>
              <input type="text" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} placeholder="organic, oils, nutrition"
                className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold text-sm text-[var(--admin-sidebar)] outline-none focus:border-[var(--admin-accent)] transition-all" />
            </div>
            <div className="flex items-center gap-4 pt-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isPublished} onChange={e => setForm(p => ({ ...p, isPublished: e.target.checked }))} className="accent-[var(--admin-accent)] scale-125" />
                <span className="text-sm font-black text-[var(--admin-sidebar)]">Publish immediately</span>
              </label>
            </div>
            {error && <p className="sm:col-span-2 text-red-500 text-xs font-bold">{error}</p>}
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" disabled={submitting} id="save-post-btn"
                className="px-8 py-3 rounded-xl bg-[var(--admin-sidebar)] text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2">
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : editId ? 'Update Article' : 'Create Article'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-20"><div className="h-12 w-12 border-4 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin mx-auto" /></div>
        ) : posts.map(post => (
          <div key={post.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7">
            <div className="flex items-start justify-between mb-4">
              <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${post.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {post.isPublished ? 'Published' : 'Draft'}
              </span>
              <p className="text-[10px] text-slate-400 font-bold">{new Date(post.createdAt).toLocaleDateString('en-IN')}</p>
            </div>
            <h3 className="font-black text-[var(--admin-sidebar)] text-sm mb-2 leading-tight">{post.title}</h3>
            <p className="font-mono text-[10px] text-slate-400 mb-4 bg-slate-50 px-2 py-1 rounded-lg inline-block">/blog/{post.slug}</p>
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-5">
                {post.tags.map(tag => <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-amber-50 text-amber-700 rounded-lg">{tag}</span>)}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button onClick={() => startEdit(post)} className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:bg-[var(--admin-sidebar)] hover:text-white transition-all">
                <Edit2 size={14} />
              </button>
              <button onClick={() => togglePublish(post)} title={post.isPublished ? 'Unpublish' : 'Publish'} className={`h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 transition-all ${post.isPublished ? 'text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500' : 'text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'}`}>
                {post.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={() => deletePost(post.id)} className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {!loading && posts.length === 0 && (
          <div className="col-span-full bg-white rounded-[2rem] border border-slate-100 p-16 text-center">
            <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="font-black text-slate-300">No articles yet. Create your first post!</p>
          </div>
        )}
      </div>
    </div>
  );
}
