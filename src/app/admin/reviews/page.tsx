'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, Trash2, Shield, ShieldOff } from 'lucide-react';
import { API_URL } from '@/lib/api';
import AdminPagination from '@/components/admin/AdminPagination';

interface Review {
  id: number; rating: number; title?: string; body: string;
  isVerified: boolean; isApproved: boolean; createdAt: string;
  user: { name?: string; email: string; }; product: { name: string; id: number; };
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-3.5 w-3.5 ${s <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchReviews(currentPage);
  }, [currentPage]);

  const fetchReviews = (page: number) => {
    setLoading(true);
    fetch(`${API_URL}/api/reviews/admin/all?page=${page}&limit=${itemsPerPage}`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setLoading(false));
  };

  const moderate = async (id: number, isApproved: boolean) => {
    await fetch(`${API_URL}/api/reviews/admin/${id}/moderate`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isApproved })
    });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved } : r));
  };

  const deleteReview = async (id: number) => {
    if (!confirm('Delete this review?')) return;
    await fetch(`${API_URL}/api/reviews/admin/${id}`, { method: 'DELETE' });
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const filtered = reviews.filter(r => filter === 'all' ? true : filter === 'approved' ? r.isApproved : !r.isApproved);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter italic">Review <span className="text-emerald-600">Management</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2">{reviews.length} reviews on this page</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {(['all', 'approved', 'pending'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all w-full sm:w-auto ${filter === f ? 'bg-[var(--admin-sidebar)] text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto min-h-[280px]">
          <table className="w-full text-left min-w-[1000px] admin-data-table">
            <thead>
              <tr className="bg-slate-50/50">
                {['Product', 'Customer', 'Rating', 'Review', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="px-8 py-20 text-center"><div className="h-12 w-12 border-4 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin mx-auto" /></td></tr>
              ) : filtered.map(review => (
                <tr key={review.id} className="hover:bg-slate-50/50 transition-all">
                  <td className="px-8 py-5 max-w-[200px]">
                    <p className="text-xs font-black text-[var(--admin-sidebar)] truncate">{review.product?.name}</p>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-[var(--admin-sidebar)]">{review.user?.name || 'Anonymous'}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{review.user?.email}</p>
                    {review.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-5"><StarDisplay rating={review.rating} /></td>
                  <td className="px-8 py-5 max-w-[300px]">
                    {review.title && <p className="text-xs font-black text-[var(--admin-sidebar)] mb-1">{review.title}</p>}
                    <p className="text-xs text-slate-500 font-medium line-clamp-2">{review.body}</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${review.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-xs font-bold text-slate-400 whitespace-nowrap">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => moderate(review.id, !review.isApproved)} title={review.isApproved ? 'Reject' : 'Approve'}
                        className={`h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 transition-all ${review.isApproved ? 'text-orange-400 hover:bg-orange-500 hover:text-white hover:border-orange-500' : 'text-emerald-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'}`}>
                        {review.isApproved ? <ShieldOff size={15} /> : <Shield size={15} />}
                      </button>
                      <button onClick={() => deleteReview(review.id)} className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-100 text-red-300 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-8 py-20 text-center text-slate-300 font-bold">No reviews found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Card Layout */}
        <div className="block md:hidden divide-y divide-slate-100">
          {loading ? (
            <div className="py-20 text-center"><div className="h-12 w-12 border-4 border-slate-100 border-t-[var(--admin-accent)] rounded-full animate-spin mx-auto" /></div>
          ) : filtered.map(review => (
            <div key={review.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-black text-[var(--admin-sidebar)]">{review.product?.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${review.isApproved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {review.isApproved ? 'Approved' : 'Pending'}
                </span>
              </div>

              <div className="space-y-2 bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-[var(--admin-sidebar)]">{review.user?.name || 'Anonymous'}</span>
                  <StarDisplay rating={review.rating} />
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{review.user?.email}</p>
                {review.isVerified && (
                  <span className="inline-flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest mt-1">
                    <CheckCircle className="h-3 w-3" /> Verified Purchase
                  </span>
                )}
                {review.title && <p className="text-xs font-black text-[var(--admin-sidebar)] mt-2">{review.title}</p>}
                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">{review.body}</p>
              </div>

              <div className="flex items-center gap-2 justify-end pt-1">
                <button
                  onClick={() => moderate(review.id, !review.isApproved)}
                  className={`h-11 flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-200 text-xs font-bold transition-all ${
                    review.isApproved 
                      ? 'text-orange-600 hover:bg-orange-500 hover:text-white' 
                      : 'text-emerald-600 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  {review.isApproved ? (
                    <>
                      <ShieldOff size={14} /> Reject Review
                    </>
                  ) : (
                    <>
                      <Shield size={14} /> Approve Review
                    </>
                  )}
                </button>
                <button
                  onClick={() => deleteReview(review.id)}
                  className="h-11 px-4 flex items-center justify-center rounded-xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
          {!loading && filtered.length === 0 && (
            <div className="py-20 text-center text-slate-300 font-bold">No reviews found.</div>
          )}
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
