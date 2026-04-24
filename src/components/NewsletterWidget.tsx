'use client';

import { useState } from 'react';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return setError('Please enter a valid email address');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSubscribed(true);
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-3 text-emerald-400">
        <CheckCircle className="h-5 w-5 shrink-0" />
        <p className="text-sm font-black">Subscribed! Welcome to the harvest community 🌾</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs font-black text-white/60 uppercase tracking-widest mb-4">Join the Harvest Newsletter</p>
      <form onSubmit={handleSubmit} className="flex gap-2" id="newsletter-form">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            id="newsletter-email-input"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="Your email address"
            className="w-full h-11 rounded-xl bg-white/10 border border-white/20 pl-10 pr-4 text-xs font-bold text-white placeholder:text-white/30 outline-none focus:border-amber-400 transition-all"
          />
        </div>
        <button
          id="newsletter-submit-btn"
          type="submit"
          disabled={loading}
          className="h-11 px-5 rounded-xl bg-amber-400 text-[#022c22] text-xs font-black uppercase tracking-widest hover:bg-amber-300 transition-all disabled:opacity-50 flex items-center gap-2 shrink-0"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Subscribe'}
        </button>
      </form>
      {error && <p className="text-red-400 text-[10px] font-bold mt-2">{error}</p>}
    </div>
  );
}
