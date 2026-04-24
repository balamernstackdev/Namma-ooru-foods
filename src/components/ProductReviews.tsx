'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, ThumbsUp, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { API_URL } from '@/lib/api';

interface Review {
  id: number;
  rating: number;
  title?: string;
  body: string;
  isVerified: boolean;
  createdAt: string;
  user: { name?: string; id: number };
}

interface Props {
  productId: number;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={`transition-transform ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            className={`h-5 w-5 ${(hovered || value) >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
          />
        </button>
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }: Props) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', body: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/reviews/product/${productId}`)
      .then(r => r.json())
      .then(data => {
        setReviews(data.reviews || []);
        setAvgRating(data.avgRating || 0);
        setTotalCount(data.totalCount || 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError('Please log in to submit a review');
    if (form.rating === 0) return setError('Please select a rating');
    if (form.body.trim().length < 10) return setError('Review must be at least 10 characters');

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, userId: user.id, ...form })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit');

      setReviews(prev => [data, ...prev]);
      setTotalCount(prev => prev + 1);
      setSuccess('Your review has been submitted!');
      setShowForm(false);
      setForm({ rating: 0, title: '', body: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const ratingBreakdown = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => r.rating === star).length,
    pct: totalCount > 0 ? (reviews.filter(r => r.rating === star).length / totalCount) * 100 : 0
  }));

  return (
    <section className="mt-16 border-t border-slate-100 pt-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#022c22] tracking-tight">Customer Reviews</h2>
          <p className="text-sm text-slate-400 font-medium mt-1">{totalCount} verified reviews</p>
        </div>
        {user && !showForm && (
          <button
            id="write-review-btn"
            onClick={() => setShowForm(true)}
            className="px-6 py-3 rounded-2xl bg-[#022c22] text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-800 transition-all"
          >
            Write a Review
          </button>
        )}
      </div>

      {/* Rating Summary */}
      {totalCount > 0 && (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 mb-8 flex flex-col md:flex-row gap-8 shadow-sm">
          <div className="flex flex-col items-center justify-center md:w-48 shrink-0">
            <span className="text-6xl font-black text-[#022c22] tracking-tighter">{avgRating}</span>
            <StarRating value={Math.round(avgRating)} />
            <span className="text-xs font-bold text-slate-400 mt-2">{totalCount} reviews</span>
          </div>
          <div className="flex-1 flex flex-col gap-2 justify-center">
            {ratingBreakdown.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-3">
                <span className="text-xs font-black text-slate-500 w-4">{star}</span>
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-400 w-6 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-8 mb-8 shadow-sm">
          <h3 className="text-base font-black text-[#022c22] mb-6 tracking-tight">Share Your Experience</h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Your Rating *</label>
              <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Review Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Summarize your experience..."
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 font-bold text-sm text-[#022c22] outline-none focus:border-amber-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2">Your Review *</label>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Tell other customers what you think about this product..."
                rows={4}
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 font-bold text-sm text-[#022c22] outline-none focus:border-amber-400 transition-all resize-none"
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
            {success && <p className="text-emerald-600 text-xs font-bold">{success}</p>}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                id="submit-review-btn"
                className="px-8 py-3 rounded-xl bg-amber-400 text-[#022c22] text-xs font-black uppercase tracking-widest hover:bg-amber-300 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-400 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-12"><Loader2 className="h-8 w-8 text-slate-200 animate-spin mx-auto" /></div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-12 text-center shadow-sm">
          <Star className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="font-black text-slate-300">No reviews yet. Be the first!</p>
          {user && !showForm && (
            <button onClick={() => setShowForm(true)} className="mt-4 px-6 py-2 rounded-xl bg-amber-400 text-[#022c22] text-xs font-black uppercase tracking-widest hover:bg-amber-300 transition-all">
              Write First Review
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-white rounded-[1.5rem] border border-slate-100 p-7 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StarRating value={review.rating} />
                    {review.isVerified && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">
                        <CheckCircle className="h-3 w-3" /> Verified Purchase
                      </span>
                    )}
                  </div>
                  {review.title && <p className="font-black text-[#022c22] text-sm">{review.title}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-500">{review.user?.name || 'Customer'}</p>
                  <p className="text-[10px] text-slate-300 font-medium">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 font-medium leading-relaxed">{review.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
