'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, Edit2, Eye, EyeOff, Loader2, Search, ExternalLink } from 'lucide-react';
import { API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import AdminPagination from '@/components/admin/AdminPagination';

interface BlogPost { id: number; slug: string; title: string; excerpt?: string; isPublished: boolean; publishedAt?: string; createdAt: string; tags: string[]; }

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPosts(currentPage);
  }, [currentPage]);

  const fetchPosts = (page: number) => {
    setLoading(true);
    fetch(`${API_URL}/api/blog/admin/all?page=${page}&limit=${itemsPerPage}`)
      .then(r => r.json())
      .then(data => {
        setPosts(data.posts || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  };

  const deletePost = async (id: number) => {
    if (!confirm('Delete this article?')) return;
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

  const filteredPosts = posts.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-[var(--admin-sidebar)] tracking-tighter">Blog Management</h2>
          <p className="text-slate-400 font-medium text-sm mt-1">Managing articles, recipes, and seasonal updates.</p>
        </div>
        <button id="new-article-btn" onClick={() => router.push('/admin/blog/new')}
          className="h-16 px-10 rounded-2xl bg-[var(--admin-sidebar)] text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-900 transition-all shadow-2xl shadow-slate-900/20 active:scale-95">
          <Plus size={24} className="text-[var(--admin-accent)]" /> New Article
        </button>
      </div>

      <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-5">
        <div className="flex-1 flex items-center gap-5 bg-slate-50 border border-slate-100 px-8 py-4 rounded-2xl">
          <Search size={22} className="text-slate-300" />
          <input type="text" placeholder="Filter articles by title or keywords..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent border-none outline-none text-base font-bold text-[var(--admin-sidebar)] placeholder:text-slate-300 w-full" />
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                {['Article', 'URL Path', 'Tags', 'Status', 'Date', 'Operations'].map(h => (
                  <th key={h} className="px-10 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="px-10 py-32 text-center"><div className="h-16 w-16 border-[6px] border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredPosts.map(post => (
                <tr key={post.id} className="group hover:bg-slate-50/50 transition-all">
                  <td className="px-10 py-7 max-w-[350px]">
                    <p className="text-base font-black text-[var(--admin-sidebar)] group-hover:text-[var(--admin-accent)] transition-colors line-clamp-1">{post.title}</p>
                    <p className="text-xs text-slate-400 font-medium mt-1 line-clamp-1">{post.excerpt || 'No description available.'}</p>
                  </td>
                  <td className="px-10 py-7">
                    <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">/blog/{post.slug}</span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg border border-amber-100/50">{tag}</span>
                      ))}
                      {post.tags.length > 2 && <span className="text-[9px] font-black text-slate-300">+{post.tags.length - 2} more</span>}
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${post.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                      {post.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <p className="text-xs font-bold text-slate-400 whitespace-nowrap">{new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </td>
                  <td className="px-10 py-7 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => router.push(`/admin/blog/edit/${post.id}`)} className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-slate-400 hover:bg-[var(--admin-sidebar)] hover:text-white hover:border-[var(--admin-sidebar)] transition-all shadow-sm" title="Edit Article">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => window.open(`/blog/${post.slug}`, '_blank')} className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-blue-400 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all shadow-sm" title="View Public Page">
                        <ExternalLink size={16} />
                      </button>
                      <button onClick={() => togglePublish(post)} title={post.isPublished ? 'Unpublish' : 'Publish'} className={`h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 transition-all ${post.isPublished ? 'text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500' : 'text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'} shadow-sm`}>
                        {post.isPublished ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button onClick={() => deletePost(post.id)} className="h-11 w-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all shadow-sm" title="Delete Article">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filteredPosts.length === 0 && (
                <tr><td colSpan={6} className="px-10 py-32 text-center text-slate-300 font-bold">No articles found matching your criteria.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
