'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api';

export default function NewsletterWidget() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');

  const fetchCaptcha = async () => {
    try {
      const res = await fetch(`${API_URL}/api/newsletter/captcha`);
      const data = await res.json();
      if (res.ok) {
        setCaptchaQuestion(data.question);
        setCaptchaToken(data.token);
      }
    } catch (err) {
      console.error('Failed to load captcha', err);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return setError('Please enter a valid email address');
    if (!captchaAnswer) return setError('Please solve the security captcha');
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, captchaAnswer, captchaToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe');
      setSubscribed(true);
    } catch (err: any) {
      setError(err.message);
      setCaptchaAnswer('');
      fetchCaptcha();
    }
    finally { setLoading(false); }
  };

  if (subscribed) {
    return (
      <div className="flex items-center gap-3 text-emerald-800 bg-emerald-50 border border-emerald-200/50 p-4 rounded-2xl">
        <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
        <p className="text-xs font-bold">Subscribed! Welcome to the Product community 🌾</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-3 w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full" id="newsletter-form">
        <div className="relative group w-full">
          <input
            id="newsletter-email-input"
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(''); }}
            placeholder="Your email address"
            aria-label="Email for newsletter subscription"
            className="w-full h-14 rounded-2xl bg-white border-2 border-emerald-900/10 text-emerald-950 placeholder:text-emerald-900/40 text-[13px] font-bold outline-none px-5 pr-24 focus:border-amber-500 shadow-sm transition-all"
            required
          />
          <button
            id="newsletter-submit-btn"
            type="submit"
            disabled={loading}
            aria-label="Join newsletter"
            className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-emerald-950 text-white text-[11px] font-bold uppercase tracking-widest shadow-md hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
          </button>
        </div>

        {email.includes('@') && captchaQuestion && (
          <div className="flex items-center gap-2 bg-emerald-950/5 border border-emerald-900/10 rounded-xl p-2 pl-3 animate-fadeIn">
            <span className="text-[11px] font-bold text-emerald-900 shrink-0">
              Security: {captchaQuestion}
            </span>
            <input
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={captchaAnswer}
              onChange={e => { setCaptchaAnswer(e.target.value); setError(''); }}
              placeholder="Answer"
              className="w-20 h-8 rounded-lg bg-white border border-emerald-900/10 px-2 text-center text-xs font-bold text-emerald-950 outline-none focus:border-amber-500 transition-all"
              required
            />
            <button
              type="button"
              onClick={fetchCaptcha}
              className="text-[10px] text-emerald-800/60 hover:text-emerald-950 underline font-bold ml-auto pr-1"
            >
              Refresh
            </button>
          </div>
        )}
      </form>
      {error && <p className="text-red-600 text-[11px] font-bold px-1">{error}</p>}
    </div>
  );
}
